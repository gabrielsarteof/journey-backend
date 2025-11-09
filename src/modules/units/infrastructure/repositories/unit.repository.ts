import { PrismaClient } from '@prisma/client';
import { UnitEntity } from '../../domain/entities/unit.entity';
import { UserUnitProgressEntity } from '../../domain/entities/user-unit-progress.entity';
import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

let instanceCounter = 0;

/**
 * Camada de infraestrutura - responsável pela persistência de dados
 *
 * Padrão: Repository Pattern (DDD)
 * Responsabilidades:
 * - Traduzir operações de domínio para queries do Prisma
 * - Converter dados do banco para entidades de domínio
 * - Implementar otimizações de performance (eager loading)
 */
export class UnitRepository implements IUnitRepository {
  private instanceId: number;

  constructor(private readonly prisma: PrismaClient) {
    this.instanceId = ++instanceCounter;
    logger.info({
      instanceId: this.instanceId,
      repository: 'UnitRepository',
      hasPrisma: !!prisma,
    }, 'UnitRepository constructed');
  }

  async findAll(): Promise<UnitEntity[]> {
    const units = await this.prisma.unit.findMany({
      orderBy: {
        orderInModule: 'asc',
      },
    });

    return units.map(unit => UnitEntity.fromPrisma(unit));
  }

  async findById(id: string): Promise<UnitEntity | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) return null;

    return UnitEntity.fromPrisma(unit);
  }

  async findBySlug(slug: string): Promise<UnitEntity | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { slug },
    });

    if (!unit) return null;

    return UnitEntity.fromPrisma(unit);
  }

  async findByModuleId(moduleId: string): Promise<UnitEntity[]> {
    const units = await this.prisma.unit.findMany({
      where: { moduleId },
      orderBy: {
        orderInModule: 'asc',
      },
    });

    return units.map(unit => UnitEntity.fromPrisma(unit));
  }

  async findByModuleAndOrder(moduleId: string, orderInModule: number): Promise<UnitEntity | null> {
    const unit = await this.prisma.unit.findUnique({
      where: {
        moduleId_orderInModule: {
          moduleId,
          orderInModule,
        },
      },
    });

    if (!unit) return null;

    return UnitEntity.fromPrisma(unit);
  }

  async create(unit: UnitEntity): Promise<UnitEntity> {
    const data = unit.toJSON();

    const created = await this.prisma.unit.create({
      data: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        moduleId: data.moduleId,
        orderInModule: data.orderInModule,
        iconImage: data.iconImage,
        theme: data.theme,
        learningObjectives: data.learningObjectives,
        estimatedMinutes: data.estimatedMinutes,
        theoryContent: data.theoryContent,
        resources: data.resources,
        requiredScore: data.requiredScore,
      },
    });

    return UnitEntity.fromPrisma(created);
  }

  async update(unit: UnitEntity): Promise<UnitEntity> {
    const data = unit.toJSON();

    const updated = await this.prisma.unit.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        orderInModule: data.orderInModule,
        iconImage: data.iconImage,
        theme: data.theme,
        learningObjectives: data.learningObjectives,
        estimatedMinutes: data.estimatedMinutes,
        theoryContent: data.theoryContent,
        resources: data.resources,
        requiredScore: data.requiredScore,
      },
    });

    return UnitEntity.fromPrisma(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({
      where: { id },
    });
  }

  /**
   * Conta níveis na unidade
   * Útil para calcular progresso e porcentagem de conclusão
   */
  async countLevelsInUnit(unitId: string): Promise<number> {
    return await this.prisma.level.count({
      where: {
        unitId,
        blocking: true,  // Apenas níveis blocking contam para conclusão
      },
    });
  }

  /**
   * Query otimizada: Busca unidades com progresso do usuário em uma única query
   * Evita N+1 queries e melhora performance
   *
   * IMPORTANTE: Demonstra otimização de queries para apresentação do TCC
   */
  async findWithUserProgress(
    moduleId: string,
    userId: string
  ): Promise<Array<{
    unit: UnitEntity;
    progress: UserUnitProgressEntity | null;
    totalLevels: number;
  }>> {
    // Query complexa com joins otimizados
    const unitsWithProgress = await this.prisma.unit.findMany({
      where: { moduleId },
      include: {
        userProgress: {
          where: { userId },
        },
        levels: {
          where: { blocking: true },
          select: { id: true },
        },
      },
      orderBy: {
        orderInModule: 'asc',
      },
    });

    return unitsWithProgress.map(data => ({
      unit: UnitEntity.fromPrisma(data),
      progress: data.userProgress.length > 0
        ? UserUnitProgressEntity.fromPrisma(data.userProgress[0])
        : null,
      totalLevels: data.levels.length,
    }));
  }
}
