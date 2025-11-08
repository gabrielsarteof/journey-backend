import type { FastifyInstance } from 'fastify';
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller';
import { RegisterDTO, LoginDTO, RefreshTokenDTO } from '../../domain/schemas/auth.schema';

export async function authRoutes(
  fastify: FastifyInstance,
  controller: AuthController
): Promise<void> {
  fastify.post<{ Body: RegisterDTO }>('/register', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '15 minutes',
      }
    }
  }, controller.register);

  fastify.post<{ Body: LoginDTO }>('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '5 minutes',
      }
    }
  }, controller.login);

  fastify.post<{ Body: RefreshTokenDTO }>('/refresh', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      }
    }
  }, controller.refreshToken);

  fastify.post<{ Body: RefreshTokenDTO }>('/logout', {
    preHandler: [fastify.authenticate]
  }, controller.logout);

  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, controller.getCurrentUser);
}