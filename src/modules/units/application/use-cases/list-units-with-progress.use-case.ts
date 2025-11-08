import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IUnitRepository, IUserUnitProgressRepository } from '../../domain/repositories/unit.repository.interface';
import { z } from 'zod';

export const ListUnitsWithProgressSchema = z.object({
  moduleId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type ListUnitsWithProgressDTO = z.infer<typeof ListUnitsWithProgressSchema>;

export interface UnitWithProgressResult {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderInModule: number;
  iconImage: string | null;
  theme: {
    color: string;
    gradient?: string[];
    icon?: string;
  } | null;
  learningObjectives: string[];
  estimatedMinutes: number;
  requiredScore: number;
  totalLevels: number;
  progress: {
    status: string;
    levelsCompleted: number;
    completionPercentage: number;
    currentLevelId: string | null;
    highestScore: number;
    totalXpEarned: number;
    lastAccessedAt: Date;
  } | null;
}

/**
 * Padrão DDD: Application Service (Use Case)
 * Structured logging para observabilidade em produção
 */
export class ListUnitsWithProgressUseCase {
  constructor(
    private readonly unitRepository: IUnitRepository,
    private readonly progressRepository: IUserUnitProgressRepository
  ) {}

  async execute(data: ListUnitsWithProgressDTO): Promise<UnitWithProgressResult[]> {
    const startTime = Date.now();

    logger.info({
      operation: 'list_units_with_progress_started',
      moduleId: data.moduleId,
      userId: data.userId,
    }, 'Listing units with user progress');

    try {
      const unitsWithProgress = await this.unitRepository.findWithUserProgress(
        data.moduleId,
        data.userId
      );

      const result: UnitWithProgressResult[] = unitsWithProgress.map(({ unit, progress, totalLevels }) => {
        const unitData = unit.toJSON();

        return {
          id: unitData.id,
          slug: unitData.slug,
          title: unitData.title,
          description: unitData.description,
          orderInModule: unitData.orderInModule,
          iconImage: unitData.iconImage,
          theme: unitData.theme,
          learningObjectives: unitData.learningObjectives,
          estimatedMinutes: unitData.estimatedMinutes,
          requiredScore: unitData.requiredScore,
          totalLevels,
          progress: progress ? {
            status: progress.getStatus(),
            levelsCompleted: progress.getLevelsCompleted(),
            completionPercentage: progress.getCompletionPercentage(),
            currentLevelId: progress.getCurrentLevelId(),
            highestScore: progress.getHighestScore(),
            totalXpEarned: progress.getTotalXpEarned(),
            lastAccessedAt: progress.toJSON().lastAccessedAt,
          } : null,
        };
      });

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'list_units_with_progress_completed',
        moduleId: data.moduleId,
        userId: data.userId,
        unitsCount: result.length,
        processingTime,
      }, 'Units with progress listed successfully');

      return result.sort((a, b) => a.orderInModule - b.orderInModule);
    } catch (error) {
      logger.error({
        operation: 'list_units_with_progress_failed',
        moduleId: data.moduleId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to list units with progress');
      throw error;
    }
  }
}
