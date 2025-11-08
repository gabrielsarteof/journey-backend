import { IPathRepository } from '../../domain/repositories/path.repository.interface';
import { PathQueryDTO } from '../../domain/schemas/learning-path.schema';
import { PathWithRelations } from '../../domain/types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export interface ListPathsResult {
  paths: PathWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListPathsUseCase {
  constructor(private readonly pathRepository: IPathRepository) {}

  async execute(filters?: PathQueryDTO): Promise<ListPathsResult> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'ListPaths',
        filters,
      },
      'Executing ListPaths use case'
    );

    try {
      const paths = await this.pathRepository.findAll(filters);
      const total = await this.pathRepository.count(filters);

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const totalPages = Math.ceil(total / limit);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'ListPaths',
          count: paths.length,
          total,
          page,
          totalPages,
          processingTime,
        },
        'Paths listed successfully'
      );

      return {
        paths,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'ListPaths',
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to list paths'
      );

      throw error;
    }
  }
}
