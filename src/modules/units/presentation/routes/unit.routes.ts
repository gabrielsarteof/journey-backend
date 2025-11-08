import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { UnitController } from '../controllers/unit.controller';
import { LevelController } from '../../../levels/presentation/controllers/level.controller';

/**
 *
 */
export async function unitRoutes(
  fastify: FastifyInstance,
  controller: UnitController,
  levelController: LevelController
): Promise<void> {
  /**
   * GET /units/:unitId
   * Retorna detalhes completos de uma unidade
   */
  fastify.get('/:unitId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
        },
        required: ['unitId'],
      },
    },
    handler: controller.getUnitDetails as RouteHandlerMethod,
  });

  /**
   * POST /units/:unitId/start
   * Inicia uma unidade (cria ou atualiza progresso)
   */
  fastify.post('/:unitId/start', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
        },
        required: ['unitId'],
      },
    },
    handler: controller.startUnit as RouteHandlerMethod,
  });

  /**
   * PATCH /units/:unitId/progress
   * Atualiza progresso do usuário na unidade
   */
  fastify.patch('/:unitId/progress', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
        },
        required: ['unitId'],
      },
      body: {
        type: 'object',
        properties: {
          levelsCompleted: { type: 'number', minimum: 0 },
          currentLevelId: { type: ['string', 'null'] },
          xpEarned: { type: 'number', minimum: 0 },
          score: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['levelsCompleted'],
      },
    },
    handler: controller.updateUnitProgress as RouteHandlerMethod,
  });

  /**
   * GET /units/:unitId/levels
   * Lista todos os níveis de uma unidade
   */
  fastify.get('/:unitId/levels', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
        },
        required: ['unitId'],
      },
    },
    handler: levelController.listLevelsByUnit as RouteHandlerMethod,
  });
}
