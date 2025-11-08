import type { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLessonUseCase, GetLessonUseCase, ListLessonsUseCase } from '../../application/use-cases';
import { CreateLessonDTO, CreateLessonSchema, LessonQueryDTO, LessonQuerySchema } from '../../domain/schemas/learning-path.schema';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { LearningPathError } from '../../domain/errors';
import { ZodError } from 'zod';

export class LessonController {
  constructor(
    private readonly createLessonUseCase: CreateLessonUseCase,
    private readonly getLessonUseCase: GetLessonUseCase,
    private readonly listLessonsUseCase: ListLessonsUseCase
  ) {}

  createLesson = async (
    request: FastifyRequest<{ Body: CreateLessonDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const validatedData = CreateLessonSchema.parse(request.body);
      const lesson = await this.createLessonUseCase.execute(validatedData);

      return reply.status(201).send({
        success: true,
        data: lesson,
      });
    } catch (error) {
      logger.error({
        operation: 'create_lesson',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to create lesson');

      return this.handleError(error, reply);
    }
  };

  getLesson = async (
    request: FastifyRequest<{ Params: { identifier: string }; Querystring: { includeChallenges?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { identifier } = request.params;
    const includeChallenges = request.query.includeChallenges === 'true';

    try {
      const lesson = await this.getLessonUseCase.execute(identifier, includeChallenges);

      return reply.status(200).send({
        success: true,
        data: lesson,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  };

  listLessons = async (
    request: FastifyRequest<{ Querystring: LessonQueryDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const filters = LessonQuerySchema.parse(request.query);
      const result = await this.listLessonsUseCase.execute(filters);

      return reply.status(200).send({
        success: true,
        data: result.lessons,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  };

  private handleError(error: unknown, reply: FastifyReply): FastifyReply {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    if (error instanceof LearningPathError) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
}
