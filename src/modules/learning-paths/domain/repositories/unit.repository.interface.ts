import { Unit } from '@prisma/client';
import { CreateUnitDTO, UpdateUnitDTO, UnitQueryDTO } from '../schemas/learning-path.schema';
import { UnitWithRelations } from '../types/learning-path.types';

export interface IUnitRepository {
  create(data: CreateUnitDTO): Promise<Unit>;
  findById(id: string, includeLessons?: boolean): Promise<UnitWithRelations | null>;
  findBySlug(slug: string, includeLessons?: boolean): Promise<UnitWithRelations | null>;
  findAll(filters?: UnitQueryDTO): Promise<UnitWithRelations[]>;
  findByPathId(pathId: string, includeUnpublished?: boolean): Promise<UnitWithRelations[]>;
  update(id: string, data: UpdateUnitDTO): Promise<Unit>;
  delete(id: string): Promise<void>;
  count(filters?: Omit<UnitQueryDTO, 'page' | 'limit'>): Promise<number>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  reorder(pathId: string, unitOrders: Array<{ id: string; order: number }>): Promise<void>;
}
