import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { LevelRepository } from '../repositories/level.repository';
import { UserLevelProgressRepository } from '../repositories/user-level-progress.repository';
import { ListLevelsWithProgressUseCase } from '../../application/use-cases/list-levels-with-progress.use-case';
import { GetLevelDetailsUseCase } from '../../application/use-cases/get-level-details.use-case';
import { StartLevelUseCase } from '../../application/use-cases/start-level.use-case';
import { CompleteLevelUseCase } from '../../application/use-cases/complete-level.use-case';
import { LevelController } from '../../presentation/controllers/level.controller';
import { levelRoutes } from '../../presentation/routes/level.routes';

export interface LevelPluginOptions {
  prisma: PrismaClient;
}

/**
 * Registra todas as dependências e rotas
 */
const levelPlugin: FastifyPluginAsync<LevelPluginOptions> = async function(
  fastify: FastifyInstance,
  options: LevelPluginOptions
): Promise<void> {
  // Instancia repositórios
  const levelRepository = new LevelRepository(options.prisma);
  const progressRepository = new UserLevelProgressRepository(options.prisma);

  // Instancia use cases
  const listLevelsUseCase = new ListLevelsWithProgressUseCase(
    levelRepository,
    progressRepository
  );
  const getLevelDetailsUseCase = new GetLevelDetailsUseCase(
    levelRepository,
    progressRepository
  );
  const startLevelUseCase = new StartLevelUseCase(
    levelRepository,
    progressRepository
  );
  const completeLevelUseCase = new CompleteLevelUseCase(
    levelRepository,
    progressRepository
  );

  // Instancia controller
  const controller = new LevelController(
    listLevelsUseCase,
    getLevelDetailsUseCase,
    startLevelUseCase,
    completeLevelUseCase
  );

  // Registra rotas
  await fastify.register(async function levelRoutesPlugin(childInstance) {
    await levelRoutes(childInstance, controller);
  }, {
    prefix: '/levels'
  });

  fastify.log.info('Level plugin registered successfully');
};

export default fp(levelPlugin, {
  name: 'level-plugin',
  dependencies: ['auth-plugin'],
});
