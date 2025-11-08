import { UnitEntity } from '../entities/unit.entity';
import { UserUnitProgressEntity } from '../entities/user-unit-progress.entity';

/**
 * Padrão DDD: Repository Interface no Domain Layer
 *
 * Decisão arquitetural: Interface no domínio, implementação na infraestrutura
 * Benefício: Inversão de dependência (SOLID-D), permitindo trocar implementação
 * sem impactar domínio ou casos de uso
 */
export interface IUnitRepository {
  findAll(): Promise<UnitEntity[]>;
  findById(id: string): Promise<UnitEntity | null>;
  findBySlug(slug: string): Promise<UnitEntity | null>;
  findByModuleId(moduleId: string): Promise<UnitEntity[]>;
  findByModuleAndOrder(moduleId: string, orderInModule: number): Promise<UnitEntity | null>;
  create(unit: UnitEntity): Promise<UnitEntity>;
  update(unit: UnitEntity): Promise<UnitEntity>;
  delete(id: string): Promise<void>;
  countLevelsInUnit(unitId: string): Promise<number>;

  /**
   * Query otimizada: retorna unidades com progresso em single query
   * Evita N+1 problem ao buscar unidades + progresso separadamente
   */
  findWithUserProgress(moduleId: string, userId: string): Promise<Array<{
    unit: UnitEntity;
    progress: UserUnitProgressEntity | null;
    totalLevels: number;
  }>>;
}

export interface IUserUnitProgressRepository {
  findByUserIdAndUnitId(userId: string, unitId: string): Promise<UserUnitProgressEntity | null>;
  findByUserId(userId: string): Promise<UserUnitProgressEntity[]>;
  findByUnitId(unitId: string): Promise<UserUnitProgressEntity[]>;
  create(progress: UserUnitProgressEntity): Promise<UserUnitProgressEntity>;
  update(progress: UserUnitProgressEntity): Promise<UserUnitProgressEntity>;
  delete(id: string): Promise<void>;

  /**
   * Padrão upsert: busca ou cria se não existir
   * Evita race conditions ao iniciar progresso
   */
  findOrCreate(userId: string, unitId: string, totalLevels: number): Promise<UserUnitProgressEntity>;
}
