import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

export const UnitThemeSchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  gradient: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
  icon: z.string().optional(),
});

export type UnitTheme = z.infer<typeof UnitThemeSchema>;

/**
 * Padrão DDD: Value Object com validação via Zod
 * Constructor privado força validação na criação
 */
export class UnitThemeVO {
  private constructor(private readonly value: UnitTheme) {}

  static create(data: unknown): UnitThemeVO {
    const validated = UnitThemeSchema.parse(data);
    return new UnitThemeVO(validated);
  }

  static fromPrismaJson(json: unknown): UnitThemeVO {
    return UnitThemeVO.create(json);
  }

  getValue(): UnitTheme {
    return this.value;
  }

  getColor(): string {
    return this.value.color;
  }

  getGradient(): string[] | undefined {
    return this.value.gradient;
  }

  getIcon(): string | undefined {
    return this.value.icon;
  }

  toPrismaJson(): JsonValue {
    return this.value as JsonValue;
  }
}
