import { Lesson } from '@prisma/client';
import { ILessonRepository } from '../../domain/repositories/lesson.repository.interface';
import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { CreateLessonDTO } from '../../domain/schemas/learning-path.schema';
import { LessonSlugExistsError, UnitNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class CreateLessonUseCase {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly unitRepository: IUnitRepository
  ) {}

  async execute(data: CreateLessonDTO): Promise<Lesson> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'CreateLesson',
        slug: data.slug,
        title: data.title,
        unitId: data.unitId,
        lessonType: data.lessonType,
      },
      'Executing CreateLesson use case'
    );

    try {
      // Check if unit exists
      const unitExists = await this.unitRepository.findById(data.unitId);
      if (!unitExists) {
        throw new UnitNotFoundError(data.unitId);
      }

      // Check if slug already exists
      const slugExists = await this.lessonRepository.existsBySlug(data.slug);
      if (slugExists) {
        throw new LessonSlugExistsError(data.slug);
      }

      const lesson = await this.lessonRepository.create(data);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'CreateLesson',
          lessonId: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          unitId: lesson.unitId,
          lessonType: lesson.lessonType,
          processingTime,
        },
        'Lesson created successfully'
      );

      return lesson;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'CreateLesson',
          slug: data.slug,
          unitId: data.unitId,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to create lesson'
      );

      throw error;
    }
  }
}
