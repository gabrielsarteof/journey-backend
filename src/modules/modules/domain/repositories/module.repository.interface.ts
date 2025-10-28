import { ModuleEntity } from '../entities/module.entity';
import { UserModuleProgressEntity } from '../entities/user-module-progress.entity';

export interface IModuleRepository {
  findAll(): Promise<ModuleEntity[]>;
  findById(id: string): Promise<ModuleEntity | null>;
  findBySlug(slug: string): Promise<ModuleEntity | null>;
  findByOrderIndex(orderIndex: number): Promise<ModuleEntity | null>;
  create(module: ModuleEntity): Promise<void>;
  update(module: ModuleEntity): Promise<void>;
  delete(id: string): Promise<void>;
  countChallengesInModule(moduleId: string): Promise<number>;
}

export interface IUserModuleProgressRepository {
  findByUserIdAndModuleId(userId: string, moduleId: string): Promise<UserModuleProgressEntity | null>;
  findByUserId(userId: string): Promise<UserModuleProgressEntity[]>;
  create(progress: UserModuleProgressEntity): Promise<void>;
  update(progress: UserModuleProgressEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
