import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ModuleRepository } from '../repositories/module.repository';
import { UserModuleProgressRepository } from '../repositories/user-module-progress.repository';
import { ListModulesWithProgressUseCase } from '../../application/use-cases/list-modules-with-progress.use-case';
import { GetModuleDetailsUseCase } from '../../application/use-cases/get-module-details.use-case';
import { UpdateModuleProgressUseCase } from '../../application/use-cases/update-module-progress.use-case';
import { ListModuleChallengesUseCase } from '../../application/use-cases/list-module-challenges.use-case';
import { ModuleController } from '../../presentation/controllers/module.controller';
import { moduleRoutes } from '../../presentation/routes/module.routes';

export interface ModulePluginOptions {
  prisma: PrismaClient;
}

const modulePlugin: FastifyPluginAsync<ModulePluginOptions> = async function(
  fastify: FastifyInstance,
  options: ModulePluginOptions
): Promise<void> {
  const moduleRepository = new ModuleRepository(options.prisma);
  const progressRepository = new UserModuleProgressRepository(options.prisma);

  const listModulesUseCase = new ListModulesWithProgressUseCase(
    moduleRepository,
    progressRepository
  );
  const getModuleDetailsUseCase = new GetModuleDetailsUseCase(
    moduleRepository,
    progressRepository
  );
  const updateProgressUseCase = new UpdateModuleProgressUseCase(
    progressRepository,
    moduleRepository
  );
  const listModuleChallengesUseCase = new ListModuleChallengesUseCase(
    options.prisma
  );

  const controller = new ModuleController(
    listModulesUseCase,
    getModuleDetailsUseCase,
    updateProgressUseCase,
    listModuleChallengesUseCase
  );

  await fastify.register(async function moduleRoutesPlugin(childInstance) {
    await moduleRoutes(childInstance, controller);
  }, {
    prefix: '/modules'
  });

  fastify.log.info('Module plugin registered successfully');
};

export default fp(modulePlugin, {
  name: 'module-plugin',
  dependencies: ['auth-plugin'],
});
