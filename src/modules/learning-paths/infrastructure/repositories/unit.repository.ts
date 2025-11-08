import { PrismaClient, Unit } from '@prisma/client';
import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { CreateUnitDTO, UpdateUnitDTO, UnitQueryDTO } from '../../domain/schemas/learning-path.schema';
import { UnitEntity } from '../../domain/entities/unit.entity';
import { UnitWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class UnitRepository implements IUnitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateUnitDTO): Promise<Unit> {
    const startTime = Date.now();

    logger.info({ operation: 'create_unit', slug: data.slug, title: data.title, pathId: data.pathId }, 'Creating new unit');

    try {
      const entity = UnitEntity.create(data);
      const prismaData = entity.toPrisma();

      const unit = await this.prisma.unit.create({
        data: {
          pathId: prismaData.pathId,
          slug: prismaData.slug,
          title: prismaData.title,
          description: prismaData.description,
          icon: prismaData.icon,
          order: prismaData.order,
          isPublished: prismaData.isPublished,
          estimatedHours: prismaData.estimatedHours,
          totalXp: prismaData.totalXp,
          prerequisites: prismaData.prerequisites,
          learningGoals: prismaData.learningGoals,
          metadata: prismaData.metadata || {},
        },
      });

      const processingTime = Date.now() - startTime;
      logger.info({ operation: 'create_unit_success', unitId: unit.id, slug: unit.slug, processingTime }, 'Unit created successfully');

      return unit;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error({
        operation: 'create_unit_failed',
        slug: data.slug,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      }, 'Failed to create unit');
      throw error;
    }
  }

  async findById(id: string, includeLessons = false): Promise<UnitWithRelations | null> {
    logger.debug({ operation: 'find_unit_by_id', unitId: id, includeLessons }, 'Finding unit by ID');

    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id },
        include: includeLessons
          ? {
              lessons: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
                include: {
                  _count: { select: { challenges: true } },
                },
              },
              path: true,
              _count: { select: { lessons: true } },
            }
          : {
              path: true,
              _count: { select: { lessons: true } },
            },
      });

      return unit as UnitWithRelations | null;
    } catch (error) {
      logger.error({ operation: 'find_unit_by_id_failed', unitId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find unit');
      throw error;
    }
  }

  async findBySlug(slug: string, includeLessons = false): Promise<UnitWithRelations | null> {
    logger.debug({ operation: 'find_unit_by_slug', slug, includeLessons }, 'Finding unit by slug');

    try {
      const unit = await this.prisma.unit.findUnique({
        where: { slug },
        include: includeLessons
          ? {
              lessons: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
                include: {
                  _count: { select: { challenges: true } },
                },
              },
              path: true,
              _count: { select: { lessons: true } },
            }
          : {
              path: true,
              _count: { select: { lessons: true } },
            },
      });

      return unit as UnitWithRelations | null;
    } catch (error) {
      logger.error({ operation: 'find_unit_by_slug_failed', slug, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find unit');
      throw error;
    }
  }

  async findAll(filters?: UnitQueryDTO): Promise<UnitWithRelations[]> {
    logger.debug({ operation: 'find_all_units', filters }, 'Finding all units');

    try {
      const where: any = {};

      if (filters?.pathId) where.pathId = filters.pathId;
      if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const units = await this.prisma.unit.findMany({
        where,
        include: {
          path: true,
          _count: { select: { lessons: true } },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      });

      logger.info({ operation: 'find_all_units_success', count: units.length }, 'Units found');
      return units as UnitWithRelations[];
    } catch (error) {
      logger.error({ operation: 'find_all_units_failed', error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find units');
      throw error;
    }
  }

  async findByPathId(pathId: string, includeUnpublished = false): Promise<UnitWithRelations[]> {
    logger.debug({ operation: 'find_units_by_path', pathId, includeUnpublished }, 'Finding units by path ID');

    try {
      const where: any = { pathId };
      if (!includeUnpublished) where.isPublished = true;

      const units = await this.prisma.unit.findMany({
        where,
        include: {
          _count: { select: { lessons: true } },
        },
        orderBy: { order: 'asc' },
      });

      return units as UnitWithRelations[];
    } catch (error) {
      logger.error({ operation: 'find_units_by_path_failed', pathId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find units by path');
      throw error;
    }
  }

  async update(id: string, data: UpdateUnitDTO): Promise<Unit> {
    logger.info({ operation: 'update_unit', unitId: id, updates: Object.keys(data) }, 'Updating unit');

    try {
      const unit = await this.prisma.unit.update({
        where: { id },
        data: data as any,
      });

      logger.info({ operation: 'update_unit_success', unitId: id }, 'Unit updated successfully');
      return unit;
    } catch (error) {
      logger.error({ operation: 'update_unit_failed', unitId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to update unit');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    logger.info({ operation: 'delete_unit', unitId: id }, 'Deleting unit');

    try {
      await this.prisma.unit.delete({ where: { id } });
      logger.info({ operation: 'delete_unit_success', unitId: id }, 'Unit deleted successfully');
    } catch (error) {
      logger.error({ operation: 'delete_unit_failed', unitId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to delete unit');
      throw error;
    }
  }

  async count(filters?: Omit<UnitQueryDTO, 'page' | 'limit'>): Promise<number> {
    try {
      const where: any = {};
      if (filters?.pathId) where.pathId = filters.pathId;
      if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

      return await this.prisma.unit.count({ where });
    } catch (error) {
      logger.error({ operation: 'count_units_failed', error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to count units');
      throw error;
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const where: any = { slug };
      if (excludeId) where.id = { not: excludeId };

      const count = await this.prisma.unit.count({ where });
      return count > 0;
    } catch (error) {
      logger.error({ operation: 'exists_by_slug_failed', slug, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to check unit existence');
      throw error;
    }
  }

  async reorder(pathId: string, unitOrders: Array<{ id: string; order: number }>): Promise<void> {
    logger.info({ operation: 'reorder_units', pathId, count: unitOrders.length }, 'Reordering units');

    try {
      await this.prisma.$transaction(
        unitOrders.map(({ id, order }) =>
          this.prisma.unit.update({
            where: { id },
            data: { order },
          })
        )
      );

      logger.info({ operation: 'reorder_units_success', pathId }, 'Units reordered successfully');
    } catch (error) {
      logger.error({ operation: 'reorder_units_failed', pathId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to reorder units');
      throw error;
    }
  }
}
