import { PrismaClient } from '@prisma/client';
import { UserUnitProgressEntity } from '../../domain/entities/user-unit-progress.entity';
import { UnitStatus } from '../../domain/enums/unit-status.enum';
import { IUserUnitProgressRepository } from '../../domain/repositories/unit.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

let instanceCounter = 0;

/**
 * Camada de infraestrutura - gerencia persistência de progresso do usuário
 *
 * Padrão: Repository Pattern (DDD)
 * Importante para TCC: Demonstra tracking de métricas educacionais
 */
export class UserUnitProgressRepository implements IUserUnitProgressRepository {
  private instanceId: number;

  constructor(private readonly prisma: PrismaClient) {
    this.instanceId = ++instanceCounter;
    logger.info({
      instanceId: this.instanceId,
      repository: 'UserUnitProgressRepository',
      hasPrisma: !!prisma,
    }, 'UserUnitProgressRepository constructed');
  }

  async findByUserIdAndUnitId(userId: string, unitId: string): Promise<UserUnitProgressEntity | null> {
    const progress = await this.prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
    });

    if (!progress) return null;

    return UserUnitProgressEntity.fromPrisma(progress);
  }

  async findByUserId(userId: string): Promise<UserUnitProgressEntity[]> {
    const progressList = await this.prisma.userUnitProgress.findMany({
      where: { userId },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    return progressList.map(progress => UserUnitProgressEntity.fromPrisma(progress));
  }

  async findByUnitId(unitId: string): Promise<UserUnitProgressEntity[]> {
    const progressList = await this.prisma.userUnitProgress.findMany({
      where: { unitId },
      orderBy: {
        totalXpEarned: 'desc',  // Ordenado por XP para ranking
      },
    });

    return progressList.map(progress => UserUnitProgressEntity.fromPrisma(progress));
  }

  async create(progress: UserUnitProgressEntity): Promise<UserUnitProgressEntity> {
    const data = progress.toJSON();

    const created = await this.prisma.userUnitProgress.create({
      data: {
        id: data.id,
        userId: data.userId,
        unitId: data.unitId,
        status: data.status,
        levelsCompleted: data.levelsCompleted,
        totalLevels: data.totalLevels,
        completionPercentage: data.completionPercentage,
        currentLevelId: data.currentLevelId,
        highestScore: data.highestScore,
        attemptsCount: data.attemptsCount,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        lastAccessedAt: data.lastAccessedAt,
        totalXpEarned: data.totalXpEarned,
      },
    });

    return UserUnitProgressEntity.fromPrisma(created);
  }

  async update(progress: UserUnitProgressEntity): Promise<UserUnitProgressEntity> {
    const data = progress.toJSON();

    const updated = await this.prisma.userUnitProgress.update({
      where: {
        userId_unitId: {
          userId: data.userId,
          unitId: data.unitId,
        },
      },
      data: {
        status: data.status,
        levelsCompleted: data.levelsCompleted,
        totalLevels: data.totalLevels,
        completionPercentage: data.completionPercentage,
        currentLevelId: data.currentLevelId,
        highestScore: data.highestScore,
        attemptsCount: data.attemptsCount,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        lastAccessedAt: data.lastAccessedAt,
        totalXpEarned: data.totalXpEarned,
      },
    });

    return UserUnitProgressEntity.fromPrisma(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userUnitProgress.delete({
      where: { id },
    });
  }

  /**
   * Busca ou cria progresso (upsert pattern)
   * Garante que sempre existe um registro de progresso para o usuário
   *
   * Útil para iniciar unidades sem verificação manual prévia
   */
  async findOrCreate(userId: string, unitId: string, totalLevels: number): Promise<UserUnitProgressEntity> {
    // Tenta buscar existente
    let progress = await this.findByUserIdAndUnitId(userId, unitId);

    if (progress) {
      return progress;
    }

    // Se não existe, cria novo
    progress = UserUnitProgressEntity.create({
      userId,
      unitId,
      totalLevels,
      status: UnitStatus.AVAILABLE,
    });

    return await this.create(progress);
  }
}
