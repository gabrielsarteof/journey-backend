import { logger } from '@/shared/infrastructure/monitoring/logger';

export abstract class BaseRepository {
  protected readonly logger = logger;

  protected async executeWithLogging<T>(
    operation: string,
    fn: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> {
    const startTime = Date.now();

    this.logger.debug({
      operation,
      repository: this.constructor.name,
      ...context
    }, `Starting ${operation}`);

    try {
      const result = await fn();
      const processingTime = Date.now() - startTime;

      this.logger.info({
        operation,
        repository: this.constructor.name,
        processingTime,
        success: true,
        ...context
      }, `${operation} completed successfully`);

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error({
        operation,
        repository: this.constructor.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime,
        success: false,
        ...context
      }, `${operation} failed`);

      throw this.handleError(error, operation);
    }
  }

  protected handleError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(`Repository operation '${operation}' failed: ${String(error)}`);
  }

  protected validateRequiredParams(
    params: Record<string, any>,
    required: string[]
  ): void {
    const missing = required.filter(key =>
      params[key] === undefined || params[key] === null
    );

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  protected createLogContext(additionalContext: Record<string, any> = {}): Record<string, any> {
    return {
      repository: this.constructor.name,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };
  }
}