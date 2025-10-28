import { PrismaClient } from '@prisma/client';
import { UserModuleProgressEntity } from '../../domain/entities/user-module-progress.entity';
import { IUserModuleProgressRepository } from '../../domain/repositories/module.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class UserModuleProgressRepository implements IUserModuleProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserIdAndModuleId(userId: string, moduleId: string): Promise<UserModuleProgressEntity | null> {
    const progress = await this.prisma.userModuleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: userId,
          moduleId: moduleId,
        },
      },
    });

    if (!progress) return null;

    return UserModuleProgressEntity.fromPrisma(progress);
  }

  async findByUserId(userId: string): Promise<UserModuleProgressEntity[]> {
    const progressList = await this.prisma.userModuleProgress.findMany({
      where: { userId },
      orderBy: {
        module: {
          orderIndex: 'asc',
        },
      },
      include: {
        module: true,
      },
    });

    return progressList.map(progress => UserModuleProgressEntity.fromPrisma(progress));
  }

  async create(progress: UserModuleProgressEntity): Promise<void> {
    const data = progress.toJSON();

    await this.prisma.userModuleProgress.create({
      data: {
        id: data.id,
        userId: data.userId,
        moduleId: data.moduleId,
        status: data.status,
        challengesCompleted: data.challengesCompleted,
        totalChallenges: data.totalChallenges,
        completionPercentage: data.completionPercentage,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        lastAccessedAt: data.lastAccessedAt,
        totalXpEarned: data.totalXpEarned,
        averageScore: data.averageScore,
      },
    });

    logger.info({
      operation: 'user_module_progress_created',
      progressId: data.id,
      userId: data.userId,
      moduleId: data.moduleId,
    }, 'User module progress created in database');
  }

  async update(progress: UserModuleProgressEntity): Promise<void> {
    const data = progress.toJSON();

    await this.prisma.userModuleProgress.update({
      where: { id: data.id },
      data: {
        status: data.status,
        challengesCompleted: data.challengesCompleted,
        totalChallenges: data.totalChallenges,
        completionPercentage: data.completionPercentage,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        lastAccessedAt: data.lastAccessedAt,
        totalXpEarned: data.totalXpEarned,
        averageScore: data.averageScore,
      },
    });

    logger.info({
      operation: 'user_module_progress_updated',
      progressId: data.id,
      status: data.status,
      completionPercentage: data.completionPercentage,
    }, 'User module progress updated in database');
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userModuleProgress.delete({
      where: { id },
    });

    logger.info({
      operation: 'user_module_progress_deleted',
      progressId: id,
    }, 'User module progress deleted from database');
  }
}
