import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IUserModuleProgressRepository, IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { UserModuleProgressEntity } from '../../domain/entities/user-module-progress.entity';
import { z } from 'zod';

export const UpdateModuleProgressSchema = z.object({
  userId: z.string().cuid(),
  moduleId: z.string().cuid(),
  challengesCompleted: z.number().int().min(0),
  xpEarned: z.number().int().min(0),
  score: z.number().min(0).max(100),
});

export type UpdateModuleProgressDTO = z.infer<typeof UpdateModuleProgressSchema>;

export interface UpdateModuleProgressResult {
  id: string;
  status: string;
  challengesCompleted: number;
  totalChallenges: number;
  completionPercentage: number;
  totalXpEarned: number;
  averageScore: number;
}

export class UpdateModuleProgressUseCase {
  constructor(
    private readonly progressRepository: IUserModuleProgressRepository,
    private readonly moduleRepository: IModuleRepository
  ) {}

  async execute(data: UpdateModuleProgressDTO): Promise<UpdateModuleProgressResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'update_module_progress_started',
      userId: data.userId,
      moduleId: data.moduleId,
    }, 'Updating module progress');

    try {
      let progress = await this.progressRepository.findByUserIdAndModuleId(data.userId, data.moduleId);

      if (!progress) {
        // Create new progress record if it doesn't exist
        const totalChallenges = await this.moduleRepository.countChallengesInModule(data.moduleId);

        progress = UserModuleProgressEntity.create({
          userId: data.userId,
          moduleId: data.moduleId,
          totalChallenges,
        });

        await this.progressRepository.create(progress);
      }

      progress.updateProgress(data.challengesCompleted, data.xpEarned, data.score);

      await this.progressRepository.update(progress);

      const progressData = progress.toJSON();

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'update_module_progress_completed',
        userId: data.userId,
        moduleId: data.moduleId,
        status: progressData.status,
        completionPercentage: progressData.completionPercentage,
        processingTime,
      }, 'Module progress updated successfully');

      return {
        id: progressData.id,
        status: progressData.status,
        challengesCompleted: progressData.challengesCompleted,
        totalChallenges: progressData.totalChallenges,
        completionPercentage: progressData.completionPercentage,
        totalXpEarned: progressData.totalXpEarned,
        averageScore: progressData.averageScore,
      };
    } catch (error) {
      logger.error({
        operation: 'update_module_progress_failed',
        userId: data.userId,
        moduleId: data.moduleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to update module progress');
      throw error;
    }
  }
}
