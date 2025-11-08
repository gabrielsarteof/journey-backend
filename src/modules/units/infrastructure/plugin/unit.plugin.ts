import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { UnitRepository } from '../repositories/unit.repository';
import { UserUnitProgressRepository } from '../repositories/user-unit-progress.repository';
import { LevelRepository } from '../../../levels/infrastructure/repositories/level.repository';
import { UserLevelProgressRepository } from '../../../levels/infrastructure/repositories/user-level-progress.repository';
import { ListUnitsWithProgressUseCase } from '../../application/use-cases/list-units-with-progress.use-case';
import { GetUnitDetailsUseCase } from '../../application/use-cases/get-unit-details.use-case';
import { StartUnitUseCase } from '../../application/use-cases/start-unit.use-case';
import { UpdateUnitProgressUseCase } from '../../application/use-cases/update-unit-progress.use-case';
import { ListLevelsWithProgressUseCase } from '../../../levels/application/use-cases/list-levels-with-progress.use-case';
import { UnitController } from '../../presentation/controllers/unit.controller';
import { LevelController } from '../../../levels/presentation/controllers/level.controller';
import { unitRoutes } from '../../presentation/routes/unit.routes';

export interface UnitPluginOptions {
  prisma: PrismaClient;
}

/**
 *
 * Responsabilidades:
 * - Instanciar repositórios com Prisma Client
 * - Criar use cases com dependências injetadas
 * - Instanciar controller
 * - Registrar rotas com prefixo /units
 *
 * Padrão: Dependency Injection via Fastify Plugin
 * Vantagens:
 * - Centraliza criação de dependências
 * - Facilita testes (pode injetar mocks)
 * - Separa configuração de lógica de negócio
 */
const unitPlugin: FastifyPluginAsync<UnitPluginOptions> = async function(
  fastify: FastifyInstance,
  options: UnitPluginOptions
): Promise<void> {
  // Instancia repositórios de Unit
  const unitRepository = new UnitRepository(options.prisma);
  const progressRepository = new UserUnitProgressRepository(options.prisma);

  // Instancia repositórios de Level (para rota /units/:unitId/levels)
  const levelRepository = new LevelRepository(options.prisma);
  const levelProgressRepository = new UserLevelProgressRepository(options.prisma);

  // Instancia use cases de Unit
  const listUnitsUseCase = new ListUnitsWithProgressUseCase(
    unitRepository,
    progressRepository
  );
  const getUnitDetailsUseCase = new GetUnitDetailsUseCase(
    unitRepository,
    progressRepository
  );
  const startUnitUseCase = new StartUnitUseCase(
    unitRepository,
    progressRepository
  );
  const updateProgressUseCase = new UpdateUnitProgressUseCase(
    progressRepository
  );

  // Instancia use case de Level (para rota /units/:unitId/levels)
  const listLevelsUseCase = new ListLevelsWithProgressUseCase(
    levelRepository,
    levelProgressRepository
  );

  // Instancia controllers
  const unitController = new UnitController(
    listUnitsUseCase,
    getUnitDetailsUseCase,
    startUnitUseCase,
    updateProgressUseCase
  );

  const levelController = new LevelController(
    listLevelsUseCase,
    null as any, // Não precisa dos outros use cases aqui
    null as any,
    null as any
  );

  // Registra rotas em um sub-plugin
  await fastify.register(async function unitRoutesPlugin(childInstance) {
    await unitRoutes(childInstance, unitController, levelController);
  }, {
    prefix: '/units'
  });

  fastify.log.info('Unit plugin registered successfully');
};

export default fp(unitPlugin, {
  name: 'unit-plugin',
  dependencies: ['auth-plugin'],  // Requer plugin de autenticação
});
