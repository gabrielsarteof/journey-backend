import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

export const ModuleThemeSchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  gradient: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
});

export type ModuleTheme = z.infer<typeof ModuleThemeSchema>;

export class ModuleThemeVO {
  private constructor(private readonly value: ModuleTheme) {}

  static create(data: unknown): ModuleThemeVO {
    const validated = ModuleThemeSchema.parse(data);
    return new ModuleThemeVO(validated);
  }

  static fromPrismaJson(json: unknown): ModuleThemeVO {
    return ModuleThemeVO.create(json);
  }

  getValue(): ModuleTheme {
    return this.value;
  }

  getColor(): string {
    return this.value.color;
  }

  getGradient(): string[] | undefined {
    return this.value.gradient;
  }

  toPrismaJson(): JsonValue {
    return this.value as JsonValue;
  }
}
