import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { PathController, UnitController, LessonController } from '../controllers';

export async function learningPathRoutes(
  fastify: FastifyInstance,
  pathController: PathController,
  unitController: UnitController,
  lessonController: LessonController
): Promise<void> {
  // Path routes
  fastify.get('/paths', {
    preHandler: [fastify.optionalAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['BACKEND', 'FRONTEND', 'FULLSTACK', 'DEVOPS', 'MOBILE', 'DATA'] },
          isPublished: { type: 'boolean' },
          targetRole: { type: 'string', enum: ['JUNIOR', 'PLENO', 'SENIOR', 'TECH_LEAD', 'ARCHITECT'] },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    handler: pathController.listPaths as RouteHandlerMethod,
  });

  fastify.get('/paths/:identifier', {
    preHandler: [fastify.optionalAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          identifier: { type: 'string' },
        },
        required: ['identifier'],
      },
      querystring: {
        type: 'object',
        properties: {
          includeUnits: { type: 'string', enum: ['true', 'false'] },
        },
      },
    },
    handler: pathController.getPath as RouteHandlerMethod,
  });

  fastify.post('/paths', {
    preHandler: [fastify.authenticate, fastify.authorize(['SENIOR', 'TECH_LEAD', 'ARCHITECT'])],
    schema: {
      body: {
        type: 'object',
        properties: {
          slug: { type: 'string', minLength: 3, maxLength: 100 },
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10, maxLength: 2000 },
          icon: { type: 'string' },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          order: { type: 'number', minimum: 0, default: 0 },
          isPublished: { type: 'boolean', default: false },
          category: { type: 'string', enum: ['BACKEND', 'FRONTEND', 'FULLSTACK', 'DEVOPS', 'MOBILE', 'DATA'] },
          targetRole: { type: 'string', enum: ['JUNIOR', 'PLENO', 'SENIOR', 'TECH_LEAD', 'ARCHITECT'] },
          estimatedHours: { type: 'number', minimum: 0, default: 0 },
          totalXp: { type: 'number', minimum: 0, default: 0 },
          metadata: { type: 'object' },
        },
        required: ['slug', 'title', 'description', 'category'],
      },
    },
    handler: pathController.createPath as RouteHandlerMethod,
  });

  // Unit routes
  fastify.get('/units', {
    preHandler: [fastify.optionalAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          pathId: { type: 'string' },
          isPublished: { type: 'boolean' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    handler: unitController.listUnits as RouteHandlerMethod,
  });

  fastify.get('/units/:identifier', {
    preHandler: [fastify.optionalAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          identifier: { type: 'string' },
        },
        required: ['identifier'],
      },
      querystring: {
        type: 'object',
        properties: {
          includeLessons: { type: 'string', enum: ['true', 'false'] },
        },
      },
    },
    handler: unitController.getUnit as RouteHandlerMethod,
  });

  fastify.post('/units', {
    preHandler: [fastify.authenticate, fastify.authorize(['SENIOR', 'TECH_LEAD', 'ARCHITECT'])],
    schema: {
      body: {
        type: 'object',
        properties: {
          pathId: { type: 'string' },
          slug: { type: 'string', minLength: 3, maxLength: 100 },
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10, maxLength: 2000 },
          icon: { type: 'string' },
          order: { type: 'number', minimum: 0, default: 0 },
          isPublished: { type: 'boolean', default: false },
          estimatedHours: { type: 'number', minimum: 0, default: 0 },
          totalXp: { type: 'number', minimum: 0, default: 0 },
          prerequisites: { type: 'array', items: { type: 'string' } },
          learningGoals: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
        },
        required: ['pathId', 'slug', 'title', 'description'],
      },
    },
    handler: unitController.createUnit as RouteHandlerMethod,
  });

  // Lesson routes
  fastify.get('/lessons', {
    preHandler: [fastify.optionalAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
          lessonType: { type: 'string', enum: ['THEORY', 'PRACTICE', 'QUIZ', 'PROJECT', 'CHALLENGE'] },
          isPublished: { type: 'boolean' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    handler: lessonController.listLessons as RouteHandlerMethod,
  });

  fastify.get('/lessons/:identifier', {
    preHandler: [fastify.optionalAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          identifier: { type: 'string' },
        },
        required: ['identifier'],
      },
      querystring: {
        type: 'object',
        properties: {
          includeChallenges: { type: 'string', enum: ['true', 'false'] },
        },
      },
    },
    handler: lessonController.getLesson as RouteHandlerMethod,
  });

  fastify.post('/lessons', {
    preHandler: [fastify.authenticate, fastify.authorize(['SENIOR', 'TECH_LEAD', 'ARCHITECT'])],
    schema: {
      body: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
          slug: { type: 'string', minLength: 3, maxLength: 100 },
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string', minLength: 10, maxLength: 2000 },
          icon: { type: 'string' },
          order: { type: 'number', minimum: 0, default: 0 },
          isPublished: { type: 'boolean', default: false },
          lessonType: { type: 'string', enum: ['THEORY', 'PRACTICE', 'QUIZ', 'PROJECT', 'CHALLENGE'], default: 'PRACTICE' },
          estimatedMinutes: { type: 'number', minimum: 1, maximum: 240, default: 15 },
          xpReward: { type: 'number', minimum: 0, default: 50 },
          content: { type: 'object' },
          metadata: { type: 'object' },
        },
        required: ['unitId', 'slug', 'title', 'description'],
      },
    },
    handler: lessonController.createLesson as RouteHandlerMethod,
  });
}
