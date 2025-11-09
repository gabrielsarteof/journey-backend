import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { ModuleController } from '../controllers/module.controller';
import { UnitController } from '../../../units/presentation/controllers/unit.controller';

export async function moduleRoutes(
  fastify: FastifyInstance,
  controller: ModuleController,
  unitController: UnitController
): Promise<void> {
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: controller.listModulesWithProgress as RouteHandlerMethod,
  });

  fastify.get('/:slug', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: controller.getModuleDetails as RouteHandlerMethod,
  });

  fastify.get('/:slug/challenges', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: controller.listModuleChallenges as RouteHandlerMethod,
  });

  // Nova rota: Listar units de um módulo
  fastify.get('/:moduleId/units', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          moduleId: { type: 'string' },
        },
        required: ['moduleId'],
      },
    },
    handler: unitController.listUnitsByModule as RouteHandlerMethod,
  });

  fastify.patch('/:moduleId/progress', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          moduleId: { type: 'string' },
        },
        required: ['moduleId'],
      },
      body: {
        type: 'object',
        properties: {
          challengesCompleted: { type: 'number', minimum: 0 },
          xpEarned: { type: 'number', minimum: 0 },
          score: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['challengesCompleted', 'xpEarned', 'score'],
      },
    },
    handler: controller.updateModuleProgress as RouteHandlerMethod,
  });
}
