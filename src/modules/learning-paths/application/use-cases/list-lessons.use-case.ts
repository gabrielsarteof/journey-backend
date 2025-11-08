import { ILessonRepository } from '../../domain/repositories/lesson.repository.interface';
import { LessonQueryDTO } from '../../domain/schemas/learning-path.schema';
import { LessonWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export interface ListLessonsResult {
  lessons: LessonWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListLessonsUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(filters?: LessonQueryDTO): Promise<ListLessonsResult> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'ListLessons',
        filters,
      },
      'Executing ListLessons use case'
    );

    try {
      const lessons = await this.lessonRepository.findAll(filters);
      const total = await this.lessonRepository.count(filters);

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const totalPages = Math.ceil(total / limit);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'ListLessons',
          count: lessons.length,
          total,
          page,
          totalPages,
          processingTime,
        },
        'Lessons listed successfully'
      );

      return {
        lessons,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'ListLessons',
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to list lessons'
      );

      throw error;
    }
  }
}
