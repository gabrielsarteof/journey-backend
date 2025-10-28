import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IModuleRepository, IUserModuleProgressRepository } from '../../domain/repositories/module.repository.interface';
import { z } from 'zod';

export const ListModulesWithProgressSchema = z.object({
  userId: z.string().cuid(),
});

export type ListModulesWithProgressDTO = z.infer<typeof ListModulesWithProgressSchema>;

export interface ModuleWithProgressResult {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  iconImage: string;
  theme: {
    color: string;
    gradient?: string[];
  };
  requiredXp: number;
  requiredLevel: number;
  isLocked: boolean;
  isNew: boolean;
  progress: {
    status: string;
    challengesCompleted: number;
    totalChallenges: number;
    completionPercentage: number;
    totalXpEarned: number;
    averageScore: number;
    lastAccessedAt?: Date;
  } | null;
}

export class ListModulesWithProgressUseCase {
  constructor(
    private readonly moduleRepository: IModuleRepository,
    private readonly progressRepository: IUserModuleProgressRepository
  ) {}

  async execute(data: ListModulesWithProgressDTO): Promise<ModuleWithProgressResult[]> {
    const startTime = Date.now();

    logger.info({
      operation: 'list_modules_with_progress_started',
      userId: data.userId,
    }, 'Listing modules with user progress');

    try {
      const modules = await this.moduleRepository.findAll();
      const userProgress = await this.progressRepository.findByUserId(data.userId);

      const progressMap = new Map(
        userProgress.map(p => [p.toJSON().moduleId, p])
      );

      const result: ModuleWithProgressResult[] = modules.map(module => {
        const moduleData = module.toJSON();
        const progress = progressMap.get(moduleData.id);

        return {
          id: moduleData.id,
          slug: moduleData.slug,
          title: moduleData.title,
          description: moduleData.description,
          orderIndex: moduleData.orderIndex,
          iconImage: moduleData.iconImage,
          theme: moduleData.theme,
          requiredXp: moduleData.requiredXp,
          requiredLevel: moduleData.requiredLevel,
          isLocked: moduleData.isLocked,
          isNew: moduleData.isNew,
          progress: progress ? {
            status: progress.toJSON().status,
            challengesCompleted: progress.toJSON().challengesCompleted,
            totalChallenges: progress.toJSON().totalChallenges,
            completionPercentage: progress.toJSON().completionPercentage,
            totalXpEarned: progress.toJSON().totalXpEarned,
            averageScore: progress.toJSON().averageScore,
            lastAccessedAt: progress.toJSON().lastAccessedAt,
          } : null,
        };
      });

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'list_modules_with_progress_completed',
        userId: data.userId,
        modulesCount: result.length,
        processingTime,
      }, 'Modules with progress listed successfully');

      return result.sort((a, b) => a.orderIndex - b.orderIndex);
    } catch (error) {
      logger.error({
        operation: 'list_modules_with_progress_failed',
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to list modules with progress');
      throw error;
    }
  }
}
