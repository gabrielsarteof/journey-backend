import { PrismaClient } from '@prisma/client';
import { ModuleEntity } from '../../domain/entities/module.entity';
import { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { logger } from '@/shared/infrastructure/monitoring/logger';

let instanceCounter = 0;

export class ModuleRepository implements IModuleRepository {
  private instanceId: number;

  constructor(private readonly prisma: PrismaClient) {
    this.instanceId = ++instanceCounter;
    logger.info({
      instanceId: this.instanceId,
      hasPrisma: !!prisma,
      prismaType: typeof prisma,
      prismaClientId: (prisma as any)._clientVersion
    }, 'ModuleRepository constructed');
  }

  async findAll(): Promise<ModuleEntity[]> {
    logger.info({ instanceId: this.instanceId }, '=== findAll called ===');
    logger.info('About to check this');
    const hasPrisma = !!this.prisma;
    logger.info(`hasPrisma value: ${hasPrisma}, instanceId: ${this.instanceId}`);
    logger.info({ hasPrisma: String(hasPrisma), instanceId: this.instanceId }, 'findAll: prisma check result');

    const modules = await this.prisma.module.findMany({
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return modules.map(module => ModuleEntity.fromPrisma(module));
  }

  async findById(id: string): Promise<ModuleEntity | null> {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });

    if (!module) return null;

    return ModuleEntity.fromPrisma(module);
  }

  async findBySlug(slug: string): Promise<ModuleEntity | null> {
    const module = await this.prisma.module.findUnique({
      where: { slug },
    });

    if (!module) return null;

    return ModuleEntity.fromPrisma(module);
  }

  async findByOrderIndex(orderIndex: number): Promise<ModuleEntity | null> {
    const module = await this.prisma.module.findUnique({
      where: { orderIndex },
    });

    if (!module) return null;

    return ModuleEntity.fromPrisma(module);
  }

  async create(module: ModuleEntity): Promise<void> {
    const data = module.toJSON();

    await this.prisma.module.create({
      data: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        iconImage: data.iconImage,
        theme: data.theme,
        requiredXp: data.requiredXp,
        requiredLevel: data.requiredLevel,
        previousModuleId: data.previousModuleId,
        isLocked: data.isLocked,
        isNew: data.isNew,
      },
    });

    logger.info({
      operation: 'module_created',
      moduleId: data.id,
      slug: data.slug,
    }, 'Module created in database');
  }

  async update(module: ModuleEntity): Promise<void> {
    const data = module.toJSON();

    await this.prisma.module.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        iconImage: data.iconImage,
        theme: data.theme,
        requiredXp: data.requiredXp,
        requiredLevel: data.requiredLevel,
        previousModuleId: data.previousModuleId,
        isLocked: data.isLocked,
        isNew: data.isNew,
      },
    });

    logger.info({
      operation: 'module_updated',
      moduleId: data.id,
    }, 'Module updated in database');
  }

  async delete(id: string): Promise<void> {
    await this.prisma.module.delete({
      where: { id },
    });

    logger.info({
      operation: 'module_deleted',
      moduleId: id,
    }, 'Module deleted from database');
  }

  async countChallengesInModule(moduleId: string): Promise<number> {
    return await this.prisma.challenge.count({
      where: { moduleId },
    });
  }
}
