import { Lesson } from '@prisma/client';
import { CreateLessonDTO, UpdateLessonDTO, LessonQueryDTO } from '../schemas/learning-path.schema';
import { LessonWithRelations } from '../types/learning-path.types';

export interface ILessonRepository {
  create(data: CreateLessonDTO): Promise<Lesson>;
  findById(id: string, includeChallenges?: boolean): Promise<LessonWithRelations | null>;
  findBySlug(slug: string, includeChallenges?: boolean): Promise<LessonWithRelations | null>;
  findAll(filters?: LessonQueryDTO): Promise<LessonWithRelations[]>;
  findByUnitId(unitId: string, includeUnpublished?: boolean): Promise<LessonWithRelations[]>;
  update(id: string, data: UpdateLessonDTO): Promise<Lesson>;
  delete(id: string): Promise<void>;
  count(filters?: Omit<LessonQueryDTO, 'page' | 'limit'>): Promise<number>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  reorder(unitId: string, lessonOrders: Array<{ id: string; order: number }>): Promise<void>;
}
