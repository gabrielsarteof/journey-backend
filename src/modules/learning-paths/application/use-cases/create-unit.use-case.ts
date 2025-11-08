import { Unit } from '@prisma/client';
import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { IPathRepository } from '../../domain/repositories/path.repository.interface';
import { CreateUnitDTO } from '../../domain/schemas/learning-path.schema';
import { UnitSlugExistsError, PathNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class CreateUnitUseCase {
  constructor(
    private readonly unitRepository: IUnitRepository,
    private readonly pathRepository: IPathRepository
  ) {}

  async execute(data: CreateUnitDTO): Promise<Unit> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'CreateUnit',
        slug: data.slug,
        title: data.title,
        pathId: data.pathId,
      },
      'Executing CreateUnit use case'
    );

    try {
      // Check if path exists
      const pathExists = await this.pathRepository.findById(data.pathId);
      if (!pathExists) {
        throw new PathNotFoundError(data.pathId);
      }

      // Check if slug already exists
      const slugExists = await this.unitRepository.existsBySlug(data.slug);
      if (slugExists) {
        throw new UnitSlugExistsError(data.slug);
      }

      const unit = await this.unitRepository.create(data);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'CreateUnit',
          unitId: unit.id,
          slug: unit.slug,
          title: unit.title,
          pathId: unit.pathId,
          processingTime,
        },
        'Unit created successfully'
      );

      return unit;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'CreateUnit',
          slug: data.slug,
          pathId: data.pathId,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to create unit'
      );

      throw error;
    }
  }
}
