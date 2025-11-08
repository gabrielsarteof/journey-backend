import { PrismaClient, Lesson } from '@prisma/client';
import { ILessonRepository } from '../../domain/repositories/lesson.repository.interface';
import { CreateLessonDTO, UpdateLessonDTO, LessonQueryDTO } from '../../domain/schemas/learning-path.schema';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { LessonWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class LessonRepository implements ILessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateLessonDTO): Promise<Lesson> {
    const startTime = Date.now();

    logger.info({ operation: 'create_lesson', slug: data.slug, title: data.title, unitId: data.unitId, lessonType: data.lessonType }, 'Creating new lesson');

    try {
      const entity = LessonEntity.create(data);
      const prismaData = entity.toPrisma();

      const lesson = await this.prisma.lesson.create({
        data: {
          unitId: prismaData.unitId,
          slug: prismaData.slug,
          title: prismaData.title,
          description: prismaData.description,
          icon: prismaData.icon,
          order: prismaData.order,
          isPublished: prismaData.isPublished,
          lessonType: prismaData.lessonType,
          estimatedMinutes: prismaData.estimatedMinutes,
          xpReward: prismaData.xpReward,
          content: prismaData.content,
          metadata: prismaData.metadata || {},
        },
      });

      const processingTime = Date.now() - startTime;
      logger.info({ operation: 'create_lesson_success', lessonId: lesson.id, slug: lesson.slug, processingTime }, 'Lesson created successfully');

      return lesson;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error({
        operation: 'create_lesson_failed',
        slug: data.slug,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      }, 'Failed to create lesson');
      throw error;
    }
  }

  async findById(id: string, includeChallenges = false): Promise<LessonWithRelations | null> {
    logger.debug({ operation: 'find_lesson_by_id', lessonId: id, includeChallenges }, 'Finding lesson by ID');

    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id },
        include: includeChallenges
          ? {
              challenges: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
              },
              unit: {
                include: { path: true },
              },
              _count: { select: { challenges: true } },
            }
          : {
              unit: {
                include: { path: true },
              },
              _count: { select: { challenges: true } },
            },
      });

      return lesson as LessonWithRelations | null;
    } catch (error) {
      logger.error({ operation: 'find_lesson_by_id_failed', lessonId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find lesson');
      throw error;
    }
  }

  async findBySlug(slug: string, includeChallenges = false): Promise<LessonWithRelations | null> {
    logger.debug({ operation: 'find_lesson_by_slug', slug, includeChallenges }, 'Finding lesson by slug');

    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { slug },
        include: includeChallenges
          ? {
              challenges: {
                where: { isPublished: true },
                orderBy: { order: 'asc' },
              },
              unit: {
                include: { path: true },
              },
              _count: { select: { challenges: true } },
            }
          : {
              unit: {
                include: { path: true },
              },
              _count: { select: { challenges: true } },
            },
      });

      return lesson as LessonWithRelations | null;
    } catch (error) {
      logger.error({ operation: 'find_lesson_by_slug_failed', slug, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find lesson');
      throw error;
    }
  }

  async findAll(filters?: LessonQueryDTO): Promise<LessonWithRelations[]> {
    logger.debug({ operation: 'find_all_lessons', filters }, 'Finding all lessons');

    try {
      const where: any = {};

      if (filters?.unitId) where.unitId = filters.unitId;
      if (filters?.lessonType) where.lessonType = filters.lessonType;
      if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const lessons = await this.prisma.lesson.findMany({
        where,
        include: {
          unit: {
            include: { path: true },
          },
          _count: { select: { challenges: true } },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      });

      logger.info({ operation: 'find_all_lessons_success', count: lessons.length }, 'Lessons found');
      return lessons as LessonWithRelations[];
    } catch (error) {
      logger.error({ operation: 'find_all_lessons_failed', error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find lessons');
      throw error;
    }
  }

  async findByUnitId(unitId: string, includeUnpublished = false): Promise<LessonWithRelations[]> {
    logger.debug({ operation: 'find_lessons_by_unit', unitId, includeUnpublished }, 'Finding lessons by unit ID');

    try {
      const where: any = { unitId };
      if (!includeUnpublished) where.isPublished = true;

      const lessons = await this.prisma.lesson.findMany({
        where,
        include: {
          _count: { select: { challenges: true } },
        },
        orderBy: { order: 'asc' },
      });

      return lessons as LessonWithRelations[];
    } catch (error) {
      logger.error({ operation: 'find_lessons_by_unit_failed', unitId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to find lessons by unit');
      throw error;
    }
  }

  async update(id: string, data: UpdateLessonDTO): Promise<Lesson> {
    logger.info({ operation: 'update_lesson', lessonId: id, updates: Object.keys(data) }, 'Updating lesson');

    try {
      const lesson = await this.prisma.lesson.update({
        where: { id },
        data: data as any,
      });

      logger.info({ operation: 'update_lesson_success', lessonId: id }, 'Lesson updated successfully');
      return lesson;
    } catch (error) {
      logger.error({ operation: 'update_lesson_failed', lessonId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to update lesson');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    logger.info({ operation: 'delete_lesson', lessonId: id }, 'Deleting lesson');

    try {
      await this.prisma.lesson.delete({ where: { id } });
      logger.info({ operation: 'delete_lesson_success', lessonId: id }, 'Lesson deleted successfully');
    } catch (error) {
      logger.error({ operation: 'delete_lesson_failed', lessonId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to delete lesson');
      throw error;
    }
  }

  async count(filters?: Omit<LessonQueryDTO, 'page' | 'limit'>): Promise<number> {
    try {
      const where: any = {};
      if (filters?.unitId) where.unitId = filters.unitId;
      if (filters?.lessonType) where.lessonType = filters.lessonType;
      if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

      return await this.prisma.lesson.count({ where });
    } catch (error) {
      logger.error({ operation: 'count_lessons_failed', error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to count lessons');
      throw error;
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const where: any = { slug };
      if (excludeId) where.id = { not: excludeId };

      const count = await this.prisma.lesson.count({ where });
      return count > 0;
    } catch (error) {
      logger.error({ operation: 'exists_by_slug_failed', slug, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to check lesson existence');
      throw error;
    }
  }

  async reorder(unitId: string, lessonOrders: Array<{ id: string; order: number }>): Promise<void> {
    logger.info({ operation: 'reorder_lessons', unitId, count: lessonOrders.length }, 'Reordering lessons');

    try {
      await this.prisma.$transaction(
        lessonOrders.map(({ id, order }) =>
          this.prisma.lesson.update({
            where: { id },
            data: { order },
          })
        )
      );

      logger.info({ operation: 'reorder_lessons_success', unitId }, 'Lessons reordered successfully');
    } catch (error) {
      logger.error({ operation: 'reorder_lessons_failed', unitId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to reorder lessons');
      throw error;
    }
  }
}
