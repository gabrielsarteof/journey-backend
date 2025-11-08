import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PathRepository } from '../repositories/path.repository';
import { UnitRepository } from '../repositories/unit.repository';
import { LessonRepository } from '../repositories/lesson.repository';

// Use Cases
import {
  CreatePathUseCase,
  GetPathUseCase,
  ListPathsUseCase,
  CreateUnitUseCase,
  GetUnitUseCase,
  ListUnitsUseCase,
  CreateLessonUseCase,
  GetLessonUseCase,
  ListLessonsUseCase,
} from '../../application/use-cases';

// Controllers
import { PathController, UnitController, LessonController } from '../../presentation/controllers';

// Routes
import { learningPathRoutes } from '../../presentation/routes/learning-path.routes';

export interface LearningPathPluginOptions {
  prisma: PrismaClient;
}

const learningPathPlugin: FastifyPluginAsync<LearningPathPluginOptions> = async function (
  fastify: FastifyInstance,
  options: LearningPathPluginOptions
): Promise<void> {
  // Initialize repositories
  const pathRepository = new PathRepository(options.prisma);
  const unitRepository = new UnitRepository(options.prisma);
  const lessonRepository = new LessonRepository(options.prisma);

  // Initialize Path use cases
  const createPathUseCase = new CreatePathUseCase(pathRepository);
  const getPathUseCase = new GetPathUseCase(pathRepository);
  const listPathsUseCase = new ListPathsUseCase(pathRepository);

  // Initialize Unit use cases
  const createUnitUseCase = new CreateUnitUseCase(unitRepository, pathRepository);
  const getUnitUseCase = new GetUnitUseCase(unitRepository);
  const listUnitsUseCase = new ListUnitsUseCase(unitRepository);

  // Initialize Lesson use cases
  const createLessonUseCase = new CreateLessonUseCase(lessonRepository, unitRepository);
  const getLessonUseCase = new GetLessonUseCase(lessonRepository);
  const listLessonsUseCase = new ListLessonsUseCase(lessonRepository);

  // Initialize controllers
  const pathController = new PathController(
    createPathUseCase,
    getPathUseCase,
    listPathsUseCase
  );

  const unitController = new UnitController(
    createUnitUseCase,
    getUnitUseCase,
    listUnitsUseCase
  );

  const lessonController = new LessonController(
    createLessonUseCase,
    getLessonUseCase,
    listLessonsUseCase
  );

  // Register routes
  await fastify.register(
    async function learningPathRoutesPlugin(childInstance) {
      await learningPathRoutes(childInstance, pathController, unitController, lessonController);
    },
    {
      prefix: '/learning-paths',
    }
  );

  fastify.log.info('Learning Path plugin registered successfully');
};

export default fp(learningPathPlugin, {
  name: 'learning-path-plugin',
  dependencies: ['auth-plugin'],
});
