import { IPathRepository } from '../../domain/repositories/path.repository.interface';
import { PathWithRelations } from '../../domain/types/learning-path.types';
import { PathNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class GetPathUseCase {
  constructor(private readonly pathRepository: IPathRepository) {}

  async execute(identifier: string, includeUnits = false): Promise<PathWithRelations> {
    logger.info(
      {
        useCase: 'GetPath',
        identifier,
        includeUnits,
      },
      'Executing GetPath use case'
    );

    try {
      // Try to find by ID first, then by slug
      let path = await this.pathRepository.findById(identifier, includeUnits);

      if (!path) {
        path = await this.pathRepository.findBySlug(identifier, includeUnits);
      }

      if (!path) {
        throw new PathNotFoundError(identifier);
      }

      logger.info(
        {
          useCase: 'GetPath',
          pathId: path.id,
          slug: path.slug,
          unitsCount: path._count?.units || 0,
        },
        'Path retrieved successfully'
      );

      return path;
    } catch (error) {
      logger.error(
        {
          useCase: 'GetPath',
          identifier,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to get path'
      );

      throw error;
    }
  }
}
