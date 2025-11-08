import { Path } from '@prisma/client';
import { IPathRepository } from '../../domain/repositories/path.repository.interface';
import { CreatePathDTO } from '../../domain/schemas/learning-path.schema';
import { PathSlugExistsError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class CreatePathUseCase {
  constructor(private readonly pathRepository: IPathRepository) {}

  async execute(data: CreatePathDTO): Promise<Path> {
    const startTime = Date.now();

    logger.info(
      {
        useCase: 'CreatePath',
        slug: data.slug,
        title: data.title,
        category: data.category,
      },
      'Executing CreatePath use case'
    );

    try {
      // Check if slug already exists
      const slugExists = await this.pathRepository.existsBySlug(data.slug);
      if (slugExists) {
        throw new PathSlugExistsError(data.slug);
      }

      const path = await this.pathRepository.create(data);

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          useCase: 'CreatePath',
          pathId: path.id,
          slug: path.slug,
          title: path.title,
          processingTime,
        },
        'Path created successfully'
      );

      return path;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          useCase: 'CreatePath',
          slug: data.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
        'Failed to create path'
      );

      throw error;
    }
  }
}
