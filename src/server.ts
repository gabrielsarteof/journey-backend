// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { config } from './config/env';
import { logger } from './shared/infrastructure/monitoring/logger';

// Plugins principais do sistema
import authPlugin from './modules/auth/infrastructure/plugin/auth.plugin';
import challengePlugin from './modules/challenges/infrastructure/plugin/challenge.plugin';
import websocketPlugin from './shared/infrastructure/websocket/websocket.plugin';
import metricPlugin from './modules/metrics/infrastructure/plugin/metric.plugin';
import gamificationPlugin from './modules/gamification/infrastructure/plugin/gamification.plugin';
import aiPlugin from './modules/ai/infrastructure/plugin/ai.plugin';
import modulePlugin from './modules/modules/infrastructure/plugin/module.plugin';
import unitPlugin from './modules/units/infrastructure/plugin/unit.plugin';
import levelPlugin from './modules/levels/infrastructure/plugin/level.plugin';

// Conexão com o banco e logs mais detalhados em dev
const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Redis com política de retry leve, pra evitar loop infinito
const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const buildApp = async () => {
  const isDevelopment = config.NODE_ENV === 'development';

  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Helmet e CORS básicos pra segurança e acesso entre domínios
  await app.register(helmet);
  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  // Cookies assinados — usados principalmente pra autenticação JWT
  await app.register(cookie, {
    secret: config.JWT_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });

  // Rate limit por userId se autenticado, fallback para IP
  // 300 req/min: balanceado entre UX (permite navegação normal) e proteção contra abuse
  if (config.NODE_ENV !== 'test') {
    await app.register(rateLimit, {
      global: false,
      max: 300,
      timeWindow: '1 minute',
      redis: redis,
      nameSpace: 'rate-limit:',
      keyGenerator: (request: FastifyRequest) => {
        const user = request.user as { id?: string } | undefined;
        return user?.id || request.ip;
      },
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
      errorResponseBuilder: (request, context) => {
        return {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Muitas requisições. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
          retryAfter: Math.ceil(context.ttl / 1000),
          statusCode: 429,
        };
      },
    });
  }

  // WebSocket centralizado (usado por métricas e gamificação)
  await app.register(websocketPlugin, { prisma, redis });

  // Aqui é onde o servidor "monta" as rotas da API
  await app.register(async (api) => {
    await api.register(authPlugin, { prisma, redis });
    await api.register(aiPlugin, { prisma, redis });
    await api.register(challengePlugin, { prisma, redis });
    await api.register(metricPlugin, { prisma, redis, wsServer: app.ws });
    await api.register(gamificationPlugin, { prisma, redis, wsServer: app.ws });
    // Hierarquia de aprendizado: Modules → Units → Levels
    await api.register(modulePlugin, { prisma });
    await api.register(unitPlugin, { prisma });
    await api.register(levelPlugin, { prisma });
  }, { prefix: '/api' });

  // Endpoint simples pra saber se o servidor tá de pé
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  }));

  // Fechamento limpo quando o servidor for encerrado
  const closeGracefully = async (signal: string) => {
    logger.info(`Encerrando servidor (${signal})...`);
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => closeGracefully('SIGINT'));
  process.on('SIGTERM', () => closeGracefully('SIGTERM'));

  return app;
};

// Inicializa o servidor e exibe a porta ativa
const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Servidor rodando em http://0.0.0.0:${config.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
