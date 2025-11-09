import { logger } from '@/shared/infrastructure/monitoring/logger';
import { ILevelRepository, IUserLevelProgressRepository } from '../../domain/repositories/level.repository.interface';
import { UserLevelProgressEntity } from '../../domain/entities/user-level-progress.entity';
import { LevelStatus } from '../../domain/enums/level-status.enum';
import { z } from 'zod';

export const StartLevelSchema = z.object({
  levelId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type StartLevelDTO = z.infer<typeof StartLevelSchema>;

export interface StartLevelResult {
  success: boolean;
  message: string;
  progress: {
    id: string;
    levelId: string;
    userId: string;
    status: string;
    attemptsCount: number;
    bestScore: number;
    startedAt: Date | null;
  };
  levelInfo: {
    type: string;
    timeLimit: number | null;
    challengeCount: number;
    config: any;
  };
}

/**
 *
 * Responsabilidades:
 * - Verificar se nível existe
 * - Criar ou recuperar progresso
 * - Iniciar progresso (incrementar attemptCount)
 * - Retornar info necessária para executar o nível
 */
export class StartLevelUseCase {
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly progressRepository: IUserLevelProgressRepository
  ) {}

  async execute(data: StartLevelDTO): Promise<StartLevelResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'start_level_initiated',
      levelId: data.levelId,
      userId: data.userId,
    }, 'Starting level');

    try {
      const level = await this.levelRepository.findById(data.levelId);
      if (!level) {
        throw new Error(`Level with ID ${data.levelId} not found`);
      }

      const challenges = await this.levelRepository.findLevelChallenges(data.levelId);

      let progress = await this.progressRepository.findByUserIdAndLevelId(
        data.userId,
        data.levelId
      );

      let isNewProgress = false;

      if (!progress) {
        progress = UserLevelProgressEntity.create({
          userId: data.userId,
          levelId: data.levelId,
          status: LevelStatus.AVAILABLE,
        });
        isNewProgress = true;
      }

      progress.start();

      if (isNewProgress) {
        progress = await this.progressRepository.create(progress);
      } else {
        progress = await this.progressRepository.update(progress);
      }

      const progressData = progress.toJSON();
      const levelData = level.toJSON();

      const result: StartLevelResult = {
        success: true,
        message: isNewProgress ? 'Nível iniciado' : 'Continuando nível',
        progress: {
          id: progressData.id,
          levelId: progressData.levelId,
          userId: progressData.userId,
          status: progressData.status,
          attemptsCount: progressData.attemptsCount,
          bestScore: progressData.bestScore,
          startedAt: progressData.startedAt,
        },
        levelInfo: {
          type: levelData.type,
          timeLimit: levelData.timeLimit,
          challengeCount: challenges.length,
          config: levelData.config,
        },
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'start_level_completed',
        levelId: data.levelId,
        userId: data.userId,
        isNewProgress,
        attemptNumber: progressData.attemptsCount,
        processingTime,
      }, 'Level started successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'start_level_failed',
        levelId: data.levelId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to start level');
      throw error;
    }
  }
}
