import { PrismaClient } from '@prisma/client';
import { UserLevelProgressEntity } from '../../domain/entities/user-level-progress.entity';
import { LevelStatus } from '../../domain/enums/level-status.enum';
import { IUserLevelProgressRepository } from '../../domain/repositories/level.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

let instanceCounter = 0;

/**
 */
export class UserLevelProgressRepository implements IUserLevelProgressRepository {
  private instanceId: number;

  constructor(private readonly prisma: PrismaClient) {
    this.instanceId = ++instanceCounter;
    logger.info({
      instanceId: this.instanceId,
      repository: 'UserLevelProgressRepository',
    }, 'UserLevelProgressRepository constructed');
  }

  async findByUserIdAndLevelId(userId: string, levelId: string): Promise<UserLevelProgressEntity | null> {
    const progress = await this.prisma.userLevelProgress.findUnique({
      where: { userId_levelId: { userId, levelId } },
    });
    return progress ? UserLevelProgressEntity.fromPrisma(progress) : null;
  }

  async findByUserId(userId: string): Promise<UserLevelProgressEntity[]> {
    const progressList = await this.prisma.userLevelProgress.findMany({
      where: { userId },
    });
    return progressList.map(p => UserLevelProgressEntity.fromPrisma(p));
  }

  async findByLevelId(levelId: string): Promise<UserLevelProgressEntity[]> {
    const progressList = await this.prisma.userLevelProgress.findMany({
      where: { levelId },
      orderBy: { bestScore: 'desc' },
    });
    return progressList.map(p => UserLevelProgressEntity.fromPrisma(p));
  }

  async create(progress: UserLevelProgressEntity): Promise<UserLevelProgressEntity> {
    const data = progress.toJSON();
    const created = await this.prisma.userLevelProgress.create({ data });
    return UserLevelProgressEntity.fromPrisma(created);
  }

  async update(progress: UserLevelProgressEntity): Promise<UserLevelProgressEntity> {
    const data = progress.toJSON();
    const updated = await this.prisma.userLevelProgress.update({
      where: { userId_levelId: { userId: data.userId, levelId: data.levelId } },
      data,
    });
    return UserLevelProgressEntity.fromPrisma(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userLevelProgress.delete({ where: { id } });
  }

  async findOrCreate(userId: string, levelId: string): Promise<UserLevelProgressEntity> {
    let progress = await this.findByUserIdAndLevelId(userId, levelId);
    if (progress) return progress;

    progress = UserLevelProgressEntity.create({
      userId,
      levelId,
      status: LevelStatus.AVAILABLE,
    });
    return await this.create(progress);
  }

  async countCompletedLevelsInUnit(userId: string, unitId: string): Promise<number> {
    return await this.prisma.userLevelProgress.count({
      where: {
        userId,
        level: { unitId, blocking: true },
        status: { in: ['COMPLETED', 'PERFECT'] },
      },
    });
  }
}
