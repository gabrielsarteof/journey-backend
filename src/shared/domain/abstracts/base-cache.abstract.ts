import { logger } from '@/shared/infrastructure/monitoring/logger';

export interface ICacheOperations {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
}

export abstract class BaseCacheService implements ICacheOperations {
  protected readonly logger = logger;
  protected abstract readonly prefix: string;
  protected readonly defaultTTL: number = 3600;

  abstract get<T>(key: string): Promise<T | null>;
  abstract set(key: string, value: unknown, ttl?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract keys(pattern: string): Promise<string[]>;
  abstract exists(key: string): Promise<boolean>;
  abstract expire(key: string, ttl: number): Promise<void>;

  protected buildKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  protected async executeWithFallback<T>(
    operation: string,
    cacheOperation: () => Promise<T>,
    fallbackValue: T,
    context: Record<string, any> = {}
  ): Promise<T> {
    try {
      return await cacheOperation();
    } catch (error) {
      this.logger.error({
        operation,
        service: this.constructor.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...context
      }, `Cache operation failed, using fallback`);

      return fallbackValue;
    }
  }

  // Implementação do padrão Cache-aside
  protected async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL,
    serializer: (value: T) => unknown = (v) => v,
    deserializer: (value: unknown) => T = (v) => v as T
  ): Promise<T> {
    const cached = await this.get<unknown>(key);

    if (cached !== null) {
      this.logger.debug({ key, prefix: this.prefix }, 'Cache hit');
      return deserializer(cached);
    }

    this.logger.debug({ key, prefix: this.prefix }, 'Cache miss, fetching data');
    const fresh = await fetcher();

    await this.set(key, serializer(fresh), ttl);
    return fresh;
  }

  // Padrão Write-through
  protected async setAndReturn<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    await this.set(key, value, ttl);
    return value;
  }

  // Invalidação por padrão de chave
  protected async invalidatePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    let deleted = 0;

    for (const key of keys) {
      try {
        await this.del(key.replace(`${this.prefix}:`, ''));
        deleted++;
      } catch (error) {
        this.logger.warn({ key, error }, 'Failed to delete cache key');
      }
    }

    this.logger.info({ pattern, deleted, total: keys.length }, 'Cache pattern invalidated');
    return deleted;
  }
}