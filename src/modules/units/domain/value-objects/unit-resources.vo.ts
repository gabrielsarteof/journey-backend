import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

const ArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  author: z.string().optional(),
});

const VideoSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  duration: z.string().optional(),
  platform: z.string().optional(),
});

export const UnitResourcesSchema = z.object({
  articles: z.array(ArticleSchema).optional().default([]),
  videos: z.array(VideoSchema).optional().default([]),
});

export type UnitResources = z.infer<typeof UnitResourcesSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Video = z.infer<typeof VideoSchema>;

/**
 * Padrão DDD: Value Object com validação via Zod
 */
export class UnitResourcesVO {
  private constructor(private readonly value: UnitResources) {}

  static create(data: unknown): UnitResourcesVO {
    const validated = UnitResourcesSchema.parse(data);
    return new UnitResourcesVO(validated);
  }

  static fromPrismaJson(json: unknown): UnitResourcesVO {
    if (!json || (typeof json === 'object' && Object.keys(json).length === 0)) {
      return UnitResourcesVO.create({ articles: [], videos: [] });
    }
    return UnitResourcesVO.create(json);
  }

  getValue(): UnitResources {
    return this.value;
  }

  getArticles(): Article[] {
    return this.value.articles || [];
  }

  getVideos(): Video[] {
    return this.value.videos || [];
  }

  hasResources(): boolean {
    return this.getArticles().length > 0 || this.getVideos().length > 0;
  }

  toPrismaJson(): JsonValue {
    return this.value as JsonValue;
  }
}
