import { PrismaClient } from '@prisma/client';
import { LevelEntity } from '../../domain/entities/level.entity';
import { UserLevelProgressEntity } from '../../domain/entities/user-level-progress.entity';
import { ILevelRepository } from '../../domain/repositories/level.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

let instanceCounter = 0;

/**
 * Responsável pela persistência de dados de níveis
 */
export class LevelRepository implements ILevelRepository {
  private instanceId: number;

  constructor(private readonly prisma: PrismaClient) {
    this.instanceId = ++instanceCounter;
    logger.info({
      instanceId: this.instanceId,
      repository: 'LevelRepository',
    }, 'LevelRepository constructed');
  }

  async findAll(): Promise<LevelEntity[]> {
    const levels = await this.prisma.level.findMany({
      orderBy: { orderInUnit: 'asc' },
    });
    return levels.map(level => LevelEntity.fromPrisma(level));
  }

  async findById(id: string): Promise<LevelEntity | null> {
    const level = await this.prisma.level.findUnique({ where: { id } });
    return level ? LevelEntity.fromPrisma(level) : null;
  }

  async findByUnitId(unitId: string): Promise<LevelEntity[]> {
    const levels = await this.prisma.level.findMany({
      where: { unitId },
      orderBy: { orderInUnit: 'asc' },
    });
    return levels.map(level => LevelEntity.fromPrisma(level));
  }

  async findByUnitAndOrder(unitId: string, orderInUnit: number): Promise<LevelEntity | null> {
    const level = await this.prisma.level.findUnique({
      where: { unitId_orderInUnit: { unitId, orderInUnit } },
    });
    return level ? LevelEntity.fromPrisma(level) : null;
  }

  async create(level: LevelEntity): Promise<LevelEntity> {
    const data = level.toJSON();
    const created = await this.prisma.level.create({ data });
    return LevelEntity.fromPrisma(created);
  }

  async update(level: LevelEntity): Promise<LevelEntity> {
    const data = level.toJSON();
    const updated = await this.prisma.level.update({
      where: { id: data.id },
      data,
    });
    return LevelEntity.fromPrisma(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.level.delete({ where: { id } });
  }

  async findWithUserProgress(
    unitId: string,
    userId: string
  ): Promise<Array<{
    level: LevelEntity;
    progress: UserLevelProgressEntity | null;
    challengeCount: number;
  }>> {
    const levelsWithProgress = await this.prisma.level.findMany({
      where: { unitId },
      include: {
        userProgress: { where: { userId } },
        challenges: { select: { challengeId: true } },
      },
      orderBy: { orderInUnit: 'asc' },
    });

    return levelsWithProgress.map(data => ({
      level: LevelEntity.fromPrisma(data),
      progress: data.userProgress.length > 0
        ? UserLevelProgressEntity.fromPrisma(data.userProgress[0])
        : null,
      challengeCount: data.challenges.length,
    }));
  }

  async findNextLevel(unitId: string, currentOrder: number): Promise<LevelEntity | null> {
    const nextLevel = await this.prisma.level.findFirst({
      where: {
        unitId,
        orderInUnit: { gt: currentOrder },
      },
      orderBy: { orderInUnit: 'asc' },
    });
    return nextLevel ? LevelEntity.fromPrisma(nextLevel) : null;
  }

  async findLevelChallenges(levelId: string): Promise<Array<{
    challengeId: string;
    orderInLevel: number;
    required: boolean;
  }>> {
    const challenges = await this.prisma.levelChallenge.findMany({
      where: { levelId },
      orderBy: { orderInLevel: 'asc' },
      select: {
        challengeId: true,
        orderInLevel: true,
        required: true,
      },
    });
    return challenges;
  }
}
