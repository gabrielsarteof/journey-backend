import { IUnitRepository } from '../../domain/repositories/unit.repository.interface';
import { UnitQueryDTO } from '../../domain/schemas/learning-path.schema';
import { UnitWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export interface ListUnitsResult {
  units: UnitWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListUnitsUseCase {
  constructor(private readonly unitRepository: IUnitRepository) {}

  async execute(filters?: UnitQueryDTO): Promise<ListUnitsResult> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'ListUnits',
        filters,
      },
      'Executing ListUnits use case'
    );

    try {
      const units = await this.unitRepository.findAll(filters);
      const total = await this.unitRepository.count(filters);

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const totalPages = Math.ceil(total / limit);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'ListUnits',
          count: units.length,
          total,
          page,
          totalPages,
          processingTime,
        },
        'Units listed successfully'
      );

      return {
        units,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'ListUnits',
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to list units'
      );

      throw error;
    }
  }
}
