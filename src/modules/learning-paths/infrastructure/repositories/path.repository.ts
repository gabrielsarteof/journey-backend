import { PrismaClient, Path } from '@prisma/client';
import { IPathRepository } from '../../domain/repositories/path.repository.interface';
import { CreatePathDTO, UpdatePathDTO, PathQueryDTO } from '../../domain/schemas/learning-path.schema';
import { PathEntity } from '../../domain/entities/path.entity';
import { PathWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class PathRepository implements IPathRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePathDTO): Promise<Path> {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'create_path',
        slug: data.slug,
        title: data.title,
        category: data.category,
        targetRole: data.targetRole,
        estimatedHours: data.estimatedHours,
      },
      'Creating new path'
    );

    try {
      const entity = PathEntity.create(data);
      const prismaData = entity.toPrisma();

      const path = await this.prisma.path.create({
        data: {
          slug: prismaData.slug,
          title: prismaData.title,
          description: prismaData.description,
          icon: prismaData.icon,
          color: prismaData.color,
          order: prismaData.order,
          isPublished: prismaData.isPublished,
          category: prismaData.category,
          targetRole: prismaData.targetRole,
          estimatedHours: prismaData.estimatedHours,
          totalXp: prismaData.totalXp,
          metadata: prismaData.metadata || {},
        },
      });

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'create_path_success',
          pathId: path.id,
          slug: path.slug,
          title: path.title,
          category: path.category,
          processingTime,
        },
        'Path created successfully'
      );

      return path;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'create_path_failed',
          slug: data.slug,
          title: data.title,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime,
        },
        'Failed to create path'
      );

      throw error;
    }
  }

  async findById(id: string, includeUnits = false): Promise<PathWithRelations | null> {
    const startTime = Date.now();

    logger.debug(
      {
        operation: 'find_path_by_id',
        pathId: id,
        includeUnits,
      },
      'Finding path by ID'
    );

    try {
      const path = await this.prisma.path.findUnique({
        where: { id },
        include: includeUnits
          ? {
              units: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
                include: {
                  _count: {
                    select: { lessons: true },
                  },
                },
              },
              _count: {
                select: { units: true },
              },
            }
          : {
              _count: {
                select: { units: true },
              },
            },
      });

      const processingTime = Date.now() - startTime;

      if (path) {
        logger.debug(
          {
            operation: 'find_path_by_id_success',
            pathId: id,
            found: true,
            processingTime,
          },
          'Path found'
        );
      } else {
        logger.debug(
          {
            operation: 'find_path_by_id_not_found',
            pathId: id,
            found: false,
            processingTime,
          },
          'Path not found'
        );
      }

      return path as PathWithRelations | null;
    } catch (error) {
      logger.error(
        {
          operation: 'find_path_by_id_failed',
          pathId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to find path by ID'
      );
      throw error;
    }
  }

  async findBySlug(slug: string, includeUnits = false): Promise<PathWithRelations | null> {
    const startTime = Date.now();

    logger.debug(
      {
        operation: 'find_path_by_slug',
        slug,
        includeUnits,
      },
      'Finding path by slug'
    );

    try {
      const path = await this.prisma.path.findUnique({
        where: { slug },
        include: includeUnits
          ? {
              units: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
                include: {
                  _count: {
                    select: { lessons: true },
                  },
                },
              },
              _count: {
                select: { units: true },
              },
            }
          : {
              _count: {
                select: { units: true },
              },
            },
      });

      const processingTime = Date.now() - startTime;

      logger.debug(
        {
          operation: 'find_path_by_slug_result',
          slug,
          found: !!path,
          processingTime,
        },
        path ? 'Path found' : 'Path not found'
      );

      return path as PathWithRelations | null;
    } catch (error) {
      logger.error(
        {
          operation: 'find_path_by_slug_failed',
          slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to find path by slug'
      );
      throw error;
    }
  }

  async findAll(filters?: PathQueryDTO): Promise<PathWithRelations[]> {
    const startTime = Date.now();

    logger.debug(
      {
        operation: 'find_all_paths',
        filters,
      },
      'Finding all paths'
    );

    try {
      const where: any = {};

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.isPublished !== undefined) {
        where.isPublished = filters.isPublished;
      }

      if (filters?.targetRole) {
        where.targetRole = filters.targetRole;
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const paths = await this.prisma.path.findMany({
        where,
        include: {
          units: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            include: {
              _count: {
                select: { lessons: true },
              },
            },
          },
          _count: {
            select: { units: true },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      });

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'find_all_paths_success',
          count: paths.length,
          filters,
          processingTime,
        },
        'Paths found'
      );

      return paths as PathWithRelations[];
    } catch (error) {
      logger.error(
        {
          operation: 'find_all_paths_failed',
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to find paths'
      );
      throw error;
    }
  }

  async update(id: string, data: UpdatePathDTO): Promise<Path> {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'update_path',
        pathId: id,
        updates: Object.keys(data),
      },
      'Updating path'
    );

    try {
      const updateData: any = { ...data };

      if (data.metadata) {
        updateData.metadata = data.metadata;
      }

      const path = await this.prisma.path.update({
        where: { id },
        data: updateData,
      });

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'update_path_success',
          pathId: id,
          processingTime,
        },
        'Path updated successfully'
      );

      return path;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'update_path_failed',
          pathId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to update path'
      );

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'delete_path',
        pathId: id,
      },
      'Deleting path'
    );

    try {
      await this.prisma.path.delete({
        where: { id },
      });

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'delete_path_success',
          pathId: id,
          processingTime,
        },
        'Path deleted successfully'
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'delete_path_failed',
          pathId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to delete path'
      );

      throw error;
    }
  }

  async count(filters?: Omit<PathQueryDTO, 'page' | 'limit'>): Promise<number> {
    try {
      const where: any = {};

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.isPublished !== undefined) {
        where.isPublished = filters.isPublished;
      }

      if (filters?.targetRole) {
        where.targetRole = filters.targetRole;
      }

      return await this.prisma.path.count({ where });
    } catch (error) {
      logger.error(
        {
          operation: 'count_paths_failed',
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to count paths'
      );
      throw error;
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const where: any = { slug };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await this.prisma.path.count({ where });
      return count > 0;
    } catch (error) {
      logger.error(
        {
          operation: 'exists_by_slug_failed',
          slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to check path existence by slug'
      );
      throw error;
    }
  }
}
