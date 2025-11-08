import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ModuleRepository } from '../repositories/module.repository';
import { UserModuleProgressRepository } from '../repositories/user-module-progress.repository';
import { UnitRepository } from '../../../units/infrastructure/repositories/unit.repository';
import { UserUnitProgressRepository } from '../../../units/infrastructure/repositories/user-unit-progress.repository';
import { ListModulesWithProgressUseCase } from '../../application/use-cases/list-modules-with-progress.use-case';
import { GetModuleDetailsUseCase } from '../../application/use-cases/get-module-details.use-case';
import { UpdateModuleProgressUseCase } from '../../application/use-cases/update-module-progress.use-case';
import { ListModuleChallengesUseCase } from '../../application/use-cases/list-module-challenges.use-case';
import { ListUnitsWithProgressUseCase } from '../../../units/application/use-cases/list-units-with-progress.use-case';
import { ModuleController } from '../../presentation/controllers/module.controller';
import { UnitController } from '../../../units/presentation/controllers/unit.controller';
import { moduleRoutes } from '../../presentation/routes/module.routes';

export interface ModulePluginOptions {
  prisma: PrismaClient;
}

const modulePlugin: FastifyPluginAsync<ModulePluginOptions> = async function(
  fastify: FastifyInstance,
  options: ModulePluginOptions
): Promise<void> {
  // Module repositories e use cases
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

  // Unit repositories e use cases (para rota /modules/:moduleId/units)
  const unitRepository = new UnitRepository(options.prisma);
  const unitProgressRepository = new UserUnitProgressRepository(options.prisma);
  const listUnitsUseCase = new ListUnitsWithProgressUseCase(
    unitRepository,
    unitProgressRepository
  );

  const moduleController = new ModuleController(
    listModulesUseCase,
    getModuleDetailsUseCase,
    updateProgressUseCase,
    listModuleChallengesUseCase
  );

  const unitController = new UnitController(
    listUnitsUseCase,
    null as any, // Não precisa dos outros use cases aqui
    null as any,
    null as any
  );

  await fastify.register(async function moduleRoutesPlugin(childInstance) {
    await moduleRoutes(childInstance, moduleController, unitController);
  }, {
    prefix: '/modules'
  });

  fastify.log.info('Module plugin registered successfully');
};

export default fp(modulePlugin, {
  name: 'module-plugin',
  dependencies: ['auth-plugin'],
});
