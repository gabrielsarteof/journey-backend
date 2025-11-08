import type { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '../services/jwt.service';
import { UnauthorizedError, TokenInvalidError } from '../../domain/errors';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: string;
      type: 'access' | 'refresh';
      jti?: string;
    };
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export class AuthMiddleware {
  constructor(
    private readonly jwtService: JWTService,
    private readonly authRepository: IAuthRepository
  ) {}

  authenticate = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new UnauthorizedError();
        return reply.status(error.statusCode).send(error.toJSON());
      }

      const token = authHeader.substring(7);
      const payload = await this.jwtService.verifyToken(token);

      if (payload.type !== 'access') {
        const error = new TokenInvalidError();
        return reply.status(error.statusCode).send(error.toJSON());
      }

      if (payload.jti) {
        const isBlacklisted = await this.authRepository.isTokenBlacklisted(payload.jti);

        if (isBlacklisted) {
          const error = new TokenInvalidError('Token foi revogado');
          return reply.status(error.statusCode).send(error.toJSON());
        }
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      const tokenError = new TokenInvalidError();
      return reply.status(tokenError.statusCode).send(tokenError.toJSON());
    }
  };

  authorize = (roles: string[]) => {
    return async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      const user = request.user as { id: string; email: string; role: string } | undefined;

      if (!user) {
        const error = new UnauthorizedError();
        return reply.status(error.statusCode).send(error.toJSON());
      }

      if (!roles.includes(user.role)) {
        return reply.status(403).send({
          error: 'Forbidden',
          code: 'AUTH_FORBIDDEN',
          message: `Insufficient permissions. Required roles: ${roles.join(', ')}`,
          statusCode: 403
        });
      }
    };
  };

  optionalAuth = async (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> => {
    try {
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const payload = await this.jwtService.verifyToken(token);

          if (payload.type === 'access') {
            request.user = {
              id: payload.sub,
              email: payload.email,
              role: payload.role,
            };
          }
        } catch {
        }
      }
    } catch {
      // Ignora erros na autenticação opcional
    }
  };
}