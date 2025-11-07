import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { SessionNotFoundError } from '../../domain/errors';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { JWTService } from '../../infrastructure/services/jwt.service';

export class LogoutUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JWTService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const startTime = Date.now();

    logger.info({
      operation: 'user_logout_attempt'
    }, 'Logout attempt started');

    try {
      const session = await this.authRepository.findSessionByToken(refreshToken);

      if (!session) {
        logger.warn({
          reason: 'session_not_found',
          executionTime: Date.now() - startTime
        }, 'Logout failed - session not found');
        throw new SessionNotFoundError();
      }

      logger.info({
        userId: session.userId,
        sessionId: session.id,
        operation: 'session_found'
      }, 'Session found for logout');

      try {
        const decoded = await this.jwtService.verifyToken(refreshToken);

        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0 && decoded.jti) {
          await this.authRepository.blacklistToken(decoded.jti, ttl);
        }
      } catch (error) {
        logger.warn({
          userId: session.userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'Failed to blacklist token during logout, continuing...');
      }

      await this.authRepository.deleteSession(session.id);

      logger.info({
        userId: session.userId,
        sessionId: session.id,
        executionTime: Date.now() - startTime
      }, 'Logout successful - session deleted');
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      }, 'Logout use case failed');
      throw error;
    }
  }
}