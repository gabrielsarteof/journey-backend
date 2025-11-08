import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { UnitWithRelations } from '../../domain/types/learning-path.types';
import { UnitNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class GetUnitUseCase {
  constructor(private readonly unitRepository: IUnitRepository) {}

  async execute(identifier: string, includeLessons = false): Promise<UnitWithRelations> {
    logger.info(
      {
        useCase: 'GetUnit',
        identifier,
        includeLessons,
      },
      'Executing GetUnit use case'
    );

    try {
      // Try to find by ID first, then by slug
      let unit = await this.unitRepository.findById(identifier, includeLessons);

      if (!unit) {
        unit = await this.unitRepository.findBySlug(identifier, includeLessons);
      }

      if (!unit) {
        throw new UnitNotFoundError(identifier);
      }

      logger.info(
        {
          useCase: 'GetUnit',
          unitId: unit.id,
          slug: unit.slug,
          lessonsCount: unit._count?.lessons || 0,
        },
        'Unit retrieved successfully'
      );

      return unit;
    } catch (error) {
      logger.error(
        {
          useCase: 'GetUnit',
          identifier,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to get unit'
      );

      throw error;
    }
  }
}
