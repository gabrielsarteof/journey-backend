import { logger } from '@/shared/infrastructure/monitoring/logger';
import { ILevelRepository, IUserLevelProgressRepository } from '../../domain/repositories/level.repository.interface';
import { z } from 'zod';

export const GetLevelDetailsSchema = z.object({
  levelId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type GetLevelDetailsDTO = z.infer<typeof GetLevelDetailsSchema>;

export interface LevelDetailsResult {
  id: string;
  unitId: string;
  orderInUnit: number;
  type: string;
  icon: string;
  title: string | null;
  description: string | null;
  config: any;
  adaptive: boolean;
  blocking: boolean;
  optional: boolean;
  timeLimit: number | null;
  bonusXp: number;
  challenges: Array<{
    challengeId: string;
    orderInLevel: number;
    required: boolean;
  }>;
  progress: {
    status: string;
    attemptsCount: number;
    bestScore: number;
    xpEarned: number;
    startedAt: Date | null;
    completedAt: Date | null;
  } | null;
}

/**
 *
 * Responsabilidades:
 * - Buscar nível por ID
 * - Buscar progresso do usuário
 * - Buscar challenges do nível
 * - Retornar configuração completa
 */
export class GetLevelDetailsUseCase {
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly progressRepository: IUserLevelProgressRepository
  ) {}

  async execute(data: GetLevelDetailsDTO): Promise<LevelDetailsResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'get_level_details_started',
      levelId: data.levelId,
      userId: data.userId,
    }, 'Getting level details');

    try {
      const level = await this.levelRepository.findById(data.levelId);
      if (!level) {
        throw new Error(`Level with ID ${data.levelId} not found`);
      }

      const [progress, challenges] = await Promise.all([
        this.progressRepository.findByUserIdAndLevelId(data.userId, data.levelId),
        this.levelRepository.findLevelChallenges(data.levelId),
      ]);

      const levelData = level.toJSON();

      const result: LevelDetailsResult = {
        id: levelData.id,
        unitId: levelData.unitId,
        orderInUnit: levelData.orderInUnit,
        type: levelData.type,
        icon: levelData.icon,
        title: levelData.title,
        description: levelData.description,
        config: levelData.config,
        adaptive: levelData.adaptive,
        blocking: levelData.blocking,
        optional: levelData.optional,
        timeLimit: levelData.timeLimit,
        bonusXp: levelData.bonusXp,
        challenges,
        progress: progress ? progress.toJSON() : null,
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'get_level_details_completed',
        levelId: data.levelId,
        userId: data.userId,
        challengeCount: challenges.length,
        hasProgress: !!progress,
        processingTime,
      }, 'Level details retrieved successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'get_level_details_failed',
        levelId: data.levelId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to get level details');
      throw error;
    }
  }
}
