import { z } from 'zod';
import { Category, UserRole } from '@prisma/client';

export const LessonTypeEnum = z.enum(['THEORY', 'PRACTICE', 'QUIZ', 'PROJECT', 'CHALLENGE']);

// Path Schemas
export const CreatePathSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
  category: z.nativeEnum(Category),
  targetRole: z.nativeEnum(UserRole).optional(),
  estimatedHours: z.number().int().min(0).default(0),
  totalXp: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).default({}),
});

export const UpdatePathSchema = CreatePathSchema.partial().omit({ slug: true });

export const PathQuerySchema = z.object({
  category: z.nativeEnum(Category).optional(),
  isPublished: z.boolean().optional(),
  targetRole: z.nativeEnum(UserRole).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Unit Schemas
export const CreateUnitSchema = z.object({
  pathId: z.string().cuid(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
  estimatedHours: z.number().int().min(0).default(0),
  totalXp: z.number().int().min(0).default(0),
  prerequisites: z.array(z.string()).default([]),
  learningGoals: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const UpdateUnitSchema = CreateUnitSchema.partial().omit({ slug: true, pathId: true });

export const UnitQuerySchema = z.object({
  pathId: z.string().cuid().optional(),
  isPublished: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Lesson Schemas
export const CreateLessonSchema = z.object({
  unitId: z.string().cuid(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
  lessonType: LessonTypeEnum.default('PRACTICE'),
  estimatedMinutes: z.number().int().min(1).max(240).default(15),
  xpReward: z.number().int().min(0).default(50),
  content: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const UpdateLessonSchema = CreateLessonSchema.partial().omit({ slug: true, unitId: true });

export const LessonQuerySchema = z.object({
  unitId: z.string().cuid().optional(),
  lessonType: LessonTypeEnum.optional(),
  isPublished: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Export types
export type CreatePathDTO = z.infer<typeof CreatePathSchema>;
export type UpdatePathDTO = z.infer<typeof UpdatePathSchema>;
export type PathQueryDTO = z.infer<typeof PathQuerySchema>;

export type CreateUnitDTO = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitDTO = z.infer<typeof UpdateUnitSchema>;
export type UnitQueryDTO = z.infer<typeof UnitQuerySchema>;

export type CreateLessonDTO = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonDTO = z.infer<typeof UpdateLessonSchema>;
export type LessonQueryDTO = z.infer<typeof LessonQuerySchema>;
