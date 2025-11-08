import { LevelEntity } from '../entities/level.entity';
import { UserLevelProgressEntity } from '../entities/user-level-progress.entity';

/**
 * Interface de repositório para Nível
 * Define o contrato para persistência de dados de níveis
 *
 * Padrão DDD: Repository Interface no Domain Layer
 */
export interface ILevelRepository {
  findAll(): Promise<LevelEntity[]>;
  findById(id: string): Promise<LevelEntity | null>;
  findByUnitId(unitId: string): Promise<LevelEntity[]>;
  findByUnitAndOrder(unitId: string, orderInUnit: number): Promise<LevelEntity | null>;
  create(level: LevelEntity): Promise<LevelEntity>;
  update(level: LevelEntity): Promise<LevelEntity>;
  delete(id: string): Promise<void>;

  /**
   * Busca níveis com progresso do usuário
   * Query otimizada para evitar N+1
   */
  findWithUserProgress(unitId: string, userId: string): Promise<Array<{
    level: LevelEntity;
    progress: UserLevelProgressEntity | null;
    challengeCount: number;
  }>>;

  /**
   * Busca próximo nível na sequência
   * Útil para determinar qual nível desbloquear após conclusão
   */
  findNextLevel(unitId: string, currentOrder: number): Promise<LevelEntity | null>;

  /**
   * Busca desafios de um nível específico
   * Retorna challenges ordenados por orderInLevel
   */
  findLevelChallenges(levelId: string): Promise<Array<{
    challengeId: string;
    orderInLevel: number;
    required: boolean;
  }>>;
}

/**
 * Interface de repositório para Progresso de Nível do Usuário
 */
export interface IUserLevelProgressRepository {
  findByUserIdAndLevelId(userId: string, levelId: string): Promise<UserLevelProgressEntity | null>;
  findByUserId(userId: string): Promise<UserLevelProgressEntity[]>;
  findByLevelId(levelId: string): Promise<UserLevelProgressEntity[]>;
  create(progress: UserLevelProgressEntity): Promise<UserLevelProgressEntity>;
  update(progress: UserLevelProgressEntity): Promise<UserLevelProgressEntity>;
  delete(id: string): Promise<void>;

  /**
   * Busca ou cria progresso (upsert)
   */
  findOrCreate(userId: string, levelId: string): Promise<UserLevelProgressEntity>;

  /**
   * Conta níveis completados pelo usuário em uma unidade
   * Útil para calcular progresso da unidade
   */
  countCompletedLevelsInUnit(userId: string, unitId: string): Promise<number>;
}
