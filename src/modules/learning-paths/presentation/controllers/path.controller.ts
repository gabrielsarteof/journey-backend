import type { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePathUseCase, GetPathUseCase, ListPathsUseCase } from '../../application/use-cases';
import { CreatePathDTO, CreatePathSchema, PathQueryDTO, PathQuerySchema } from '../../domain/schemas/learning-path.schema';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { LearningPathError } from '../../domain/errors';
import { ZodError } from 'zod';

export class PathController {
  constructor(
    private readonly createPathUseCase: CreatePathUseCase,
    private readonly getPathUseCase: GetPathUseCase,
    private readonly listPathsUseCase: ListPathsUseCase
  ) {}

  createPath = async (
    request: FastifyRequest<{ Body: CreatePathDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const user = request.user as { id: string; email: string; role: string } | undefined;

    try {
      const validatedData = CreatePathSchema.parse(request.body);

      logger.info({
        requestId,
        operation: 'path_creation_request',
        userId: user?.id,
        slug: validatedData.slug,
        title: validatedData.title,
        category: validatedData.category,
      }, 'Path creation request received');

      const path = await this.createPathUseCase.execute(validatedData);

      const executionTime = Date.now() - startTime;

      logger.info({
        requestId,
        pathId: path.id,
        slug: path.slug,
        executionTime,
      }, 'Path created successfully');

      return reply.status(201).send({
        success: true,
        data: path,
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;

      logger.error({
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      }, 'Failed to create path');

      return this.handleError(error, reply);
    }
  };

  getPath = async (
    request: FastifyRequest<{ Params: { identifier: string }; Querystring: { includeUnits?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { identifier } = request.params;
    const includeUnits = request.query.includeUnits === 'true';

    try {
      const path = await this.getPathUseCase.execute(identifier, includeUnits);

      return reply.status(200).send({
        success: true,
        data: path,
      });
    } catch (error) {
      logger.error({
        operation: 'get_path',
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to get path');

      return this.handleError(error, reply);
    }
  };

  listPaths = async (
    request: FastifyRequest<{ Querystring: PathQueryDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const filters = PathQuerySchema.parse(request.query);
      const result = await this.listPathsUseCase.execute(filters);

      return reply.status(200).send({
        success: true,
        data: result.paths,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error({
        operation: 'list_paths',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to list paths');

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
