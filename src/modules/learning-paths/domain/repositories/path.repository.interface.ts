import { Path } from '@prisma/client';
import { CreatePathDTO, UpdatePathDTO, PathQueryDTO } from '../schemas/learning-path.schema';
import { PathWithRelations } from '../types/learning-path.types';

export interface IPathRepository {
  create(data: CreatePathDTO): Promise<Path>;
  findById(id: string, includeUnits?: boolean): Promise<PathWithRelations | null>;
  findBySlug(slug: string, includeUnits?: boolean): Promise<PathWithRelations | null>;
  findAll(filters?: PathQueryDTO): Promise<PathWithRelations[]>;
  update(id: string, data: UpdatePathDTO): Promise<Path>;
  delete(id: string): Promise<void>;
  count(filters?: Omit<PathQueryDTO, 'page' | 'limit'>): Promise<number>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
}
