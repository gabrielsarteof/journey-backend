import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IModuleRepository, IUserModuleProgressRepository } from '../../domain/repositories/module.repository.interface';
import { z } from 'zod';

export const GetModuleDetailsSchema = z.object({
  userId: z.string().cuid(),
  slug: z.string(),
});

export type GetModuleDetailsDTO = z.infer<typeof GetModuleDetailsSchema>;

export interface ModuleDetailsResult {
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
  totalChallenges: number;
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

export class GetModuleDetailsUseCase {
  constructor(
    private readonly moduleRepository: IModuleRepository,
    private readonly progressRepository: IUserModuleProgressRepository
  ) {}

  async execute(data: GetModuleDetailsDTO): Promise<ModuleDetailsResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'get_module_details_started',
      userId: data.userId,
      slug: data.slug,
    }, 'Getting module details');

    try {
      const module = await this.moduleRepository.findBySlug(data.slug);

      if (!module) {
        throw new Error(`Module not found: ${data.slug}`);
      }

      const moduleData = module.toJSON();
      const totalChallenges = await this.moduleRepository.countChallengesInModule(moduleData.id);

      const progress = await this.progressRepository.findByUserIdAndModuleId(data.userId, moduleData.id);

      const result: ModuleDetailsResult = {
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
        totalChallenges,
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

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'get_module_details_completed',
        userId: data.userId,
        slug: data.slug,
        processingTime,
      }, 'Module details retrieved successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'get_module_details_failed',
        userId: data.userId,
        slug: data.slug,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to get module details');
      throw error;
    }
  }
}
