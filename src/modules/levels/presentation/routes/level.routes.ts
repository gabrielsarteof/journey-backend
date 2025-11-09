import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { LevelController } from '../controllers/level.controller';

/**
 * Define rotas HTTP para operações de Levels
 * Padrão REST com autenticação obrigatória
 */
export async function levelRoutes(
  fastify: FastifyInstance,
  controller: LevelController
): Promise<void> {
  /**
   * GET /levels/:levelId
   * Retorna detalhes completos de um nível
   */
  fastify.get('/:levelId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          levelId: { type: 'string' },
        },
        required: ['levelId'],
      },
    },
    handler: controller.getLevelDetails as RouteHandlerMethod,
  });

  /**
   * POST /levels/:levelId/start
   * Inicia um nível (cria progresso inicial)
   */
  fastify.post('/:levelId/start', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          levelId: { type: 'string' },
        },
        required: ['levelId'],
      },
    },
    handler: controller.startLevel as RouteHandlerMethod,
  });

  /**
   * POST /levels/:levelId/complete
   * Marca um nível como completo
   */
  fastify.post('/:levelId/complete', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          levelId: { type: 'string' },
        },
        required: ['levelId'],
      },
      body: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          xpEarned: { type: 'number', minimum: 0 },
          challengesCompleted: { type: 'number', minimum: 0 },
        },
        required: ['score'],
      },
    },
    handler: controller.completeLevel as RouteHandlerMethod,
  });
}
