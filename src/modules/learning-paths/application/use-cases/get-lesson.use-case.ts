import { ILessonRepository } from '../../domain/repositories/lesson.repository.interface';
import { LessonWithRelations } from '../../domain/types/learning-path.types';
import { LessonNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class GetLessonUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(identifier: string, includeChallenges = false): Promise<LessonWithRelations> {
    logger.info(
      {
        useCase: 'GetLesson',
        identifier,
        includeChallenges,
      },
      'Executing GetLesson use case'
    );

    try {
      // Try to find by ID first, then by slug
      let lesson = await this.lessonRepository.findById(identifier, includeChallenges);

      if (!lesson) {
        lesson = await this.lessonRepository.findBySlug(identifier, includeChallenges);
      }

      if (!lesson) {
        throw new LessonNotFoundError(identifier);
      }

      logger.info(
        {
          useCase: 'GetLesson',
          lessonId: lesson.id,
          slug: lesson.slug,
          lessonType: lesson.lessonType,
          challengesCount: lesson._count?.challenges || 0,
        },
        'Lesson retrieved successfully'
      );

      return lesson;
    } catch (error) {
      logger.error(
        {
          useCase: 'GetLesson',
          identifier,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to get lesson'
      );

      throw error;
    }
  }
}
