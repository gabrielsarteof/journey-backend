import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

/**
 * Schema de configuração de nível
 *
 * Decisão técnica: Schema flexível (passthrough) permite extensibilidade
 * para novos tipos de validação de segurança sem breaking changes no schema Prisma.
 */
export const LevelConfigSchema = z.object({
  allowAI: z.boolean().optional(),
  trackDI: z.boolean().optional(),
  showTheoryFirst: z.boolean().optional(),
  hints: z.boolean().optional(),
  autoCheckSolution: z.boolean().optional(),
  maxAIUsagePercent: z.number().min(0).max(100).optional(),

  reviewMode: z.boolean().optional(),
  requiredScore: z.number().min(0).max(100).optional(),
  randomizeOrder: z.boolean().optional(),

  vulnerabilityCount: z.number().optional(),
  policyRules: z.array(z.string()).optional(),
  xpMultiplier: z.number().min(1).optional(),
}).passthrough();

export type LevelConfig = z.infer<typeof LevelConfigSchema>;

export class LevelConfigVO {
  private constructor(private readonly value: LevelConfig) {}

  static create(data: unknown): LevelConfigVO {
    const validated = LevelConfigSchema.parse(data);
    return new LevelConfigVO(validated);
  }

  static fromPrismaJson(json: unknown): LevelConfigVO {
    if (!json || (typeof json === 'object' && Object.keys(json).length === 0)) {
      return LevelConfigVO.create({});
    }
    return LevelConfigVO.create(json);
  }

  getValue(): LevelConfig {
    return this.value;
  }

  isAIAllowed(): boolean {
    return this.value.allowAI ?? false;
  }

  shouldShowTheoryFirst(): boolean {
    return this.value.showTheoryFirst ?? false;
  }

  hasHints(): boolean {
    return this.value.hints ?? false;
  }

  isReviewMode(): boolean {
    return this.value.reviewMode ?? false;
  }

  getRequiredScore(): number {
    return this.value.requiredScore ?? 70;
  }

  getXpMultiplier(): number {
    return this.value.xpMultiplier ?? 1;
  }

  toPrismaJson(): JsonValue {
    return this.value as JsonValue;
  }
}
