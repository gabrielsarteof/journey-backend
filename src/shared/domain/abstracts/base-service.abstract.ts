import { logger } from '@/shared/infrastructure/monitoring/logger';

export abstract class BaseService {
  protected readonly logger = logger;

  protected async executeWithMetrics<T>(
    operation: string,
    fn: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();

    this.logger.debug({
      operation,
      operationId,
      service: this.constructor.name,
      ...context
    }, `Service operation started`);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.logger.info({
        operation,
        operationId,
        service: this.constructor.name,
        duration,
        status: 'success',
        ...context
      }, `Service operation completed`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        operation,
        operationId,
        service: this.constructor.name,
        duration,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ...context
      }, `Service operation failed`);

      throw this.transformError(error, operation);
    }
  }

  protected transformError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(`Service operation '${operation}' failed: ${String(error)}`);
  }

  protected validateInput<T>(
    input: T,
    validator: (input: T) => boolean,
    errorMessage: string
  ): void {
    if (!validator(input)) {
      throw new Error(errorMessage);
    }
  }

  private generateOperationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Template method pattern for common service operations
  protected async processWithValidation<TInput, TOutput>(
    input: TInput,
    validator: (input: TInput) => Promise<boolean> | boolean,
    processor: (input: TInput) => Promise<TOutput>,
    operation: string
  ): Promise<TOutput> {
    return this.executeWithMetrics(
      operation,
      async () => {
        const isValid = await validator(input);
        if (!isValid) {
          throw new Error(`Invalid input for operation: ${operation}`);
        }
        return processor(input);
      },
      { hasInput: !!input }
    );
  }
}