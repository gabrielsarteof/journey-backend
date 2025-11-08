import type { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUnitUseCase, GetUnitUseCase, ListUnitsUseCase } from '../../application/use-cases';
import { CreateUnitDTO, CreateUnitSchema, UnitQueryDTO, UnitQuerySchema } from '../../domain/schemas/learning-path.schema';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { LearningPathError } from '../../domain/errors';
import { ZodError } from 'zod';

export class UnitController {
  constructor(
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly getUnitUseCase: GetUnitUseCase,
    private readonly listUnitsUseCase: ListUnitsUseCase
  ) {}

  createUnit = async (
    request: FastifyRequest<{ Body: CreateUnitDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const validatedData = CreateUnitSchema.parse(request.body);
      const unit = await this.createUnitUseCase.execute(validatedData);

      return reply.status(201).send({
        success: true,
        data: unit,
      });
    } catch (error) {
      logger.error({
        operation: 'create_unit',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to create unit');

      return this.handleError(error, reply);
    }
  };

  getUnit = async (
    request: FastifyRequest<{ Params: { identifier: string }; Querystring: { includeLessons?: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { identifier } = request.params;
    const includeLessons = request.query.includeLessons === 'true';

    try {
      const unit = await this.getUnitUseCase.execute(identifier, includeLessons);

      return reply.status(200).send({
        success: true,
        data: unit,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  };

  listUnits = async (
    request: FastifyRequest<{ Querystring: UnitQueryDTO }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const filters = UnitQuerySchema.parse(request.query);
      const result = await this.listUnitsUseCase.execute(filters);

      return reply.status(200).send({
        success: true,
        data: result.units,
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
