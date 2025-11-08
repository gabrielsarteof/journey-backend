import { logger } from '@/shared/infrastructure/monitoring/logger';
import { ILevelRepository, IUserLevelProgressRepository } from '../../domain/repositories/level.repository.interface';
import { z } from 'zod';

export const ListLevelsWithProgressSchema = z.object({
  unitId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type ListLevelsWithProgressDTO = z.infer<typeof ListLevelsWithProgressSchema>;

export interface LevelWithProgressResult {
  id: string;
  unitId: string;
  orderInUnit: number;
  type: string;
  icon: string;
  title: string | null;
  description: string | null;
  adaptive: boolean;
  blocking: boolean;
  optional: boolean;
  timeLimit: number | null;
  bonusXp: number;
  challengeCount: number;
  progress: {
    status: string;
    attemptsCount: number;
    bestScore: number;
    xpEarned: number;
    completedAt: Date | null;
  } | null;
}

/**
 *
 * Responsabilidades:
 * - Buscar níveis ordenados por orderInUnit
 * - Buscar progresso do usuário em cada nível
 * - Determinar status de bloqueio (locked/available)
 * - Contar challenges em cada nível
 */
export class ListLevelsWithProgressUseCase {
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly progressRepository: IUserLevelProgressRepository
  ) {}

  async execute(data: ListLevelsWithProgressDTO): Promise<LevelWithProgressResult[]> {
    const startTime = Date.now();

    logger.info({
      operation: 'list_levels_with_progress_started',
      unitId: data.unitId,
      userId: data.userId,
    }, 'Listing levels with user progress');

    try {
      const levelsWithProgress = await this.levelRepository.findWithUserProgress(
        data.unitId,
        data.userId
      );

      const result: LevelWithProgressResult[] = levelsWithProgress.map(({ level, progress, challengeCount }) => {
        const levelData = level.toJSON();

        return {
          id: levelData.id,
          unitId: levelData.unitId,
          orderInUnit: levelData.orderInUnit,
          type: levelData.type,
          icon: levelData.icon,
          title: levelData.title,
          description: levelData.description,
          adaptive: levelData.adaptive,
          blocking: levelData.blocking,
          optional: levelData.optional,
          timeLimit: levelData.timeLimit,
          bonusXp: levelData.bonusXp,
          challengeCount,
          progress: progress ? {
            status: progress.getStatus(),
            attemptsCount: progress.getAttemptsCount(),
            bestScore: progress.getBestScore(),
            xpEarned: progress.getXpEarned(),
            completedAt: progress.toJSON().completedAt,
          } : null,
        };
      });

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'list_levels_with_progress_completed',
        unitId: data.unitId,
        userId: data.userId,
        levelsCount: result.length,
        processingTime,
      }, 'Levels with progress listed successfully');

      return result.sort((a, b) => a.orderInUnit - b.orderInUnit);
    } catch (error) {
      logger.error({
        operation: 'list_levels_with_progress_failed',
        unitId: data.unitId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to list levels with progress');
      throw error;
    }
  }
}
