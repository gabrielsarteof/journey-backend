import { LevelStatus } from '../enums/level-status.enum';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface UserLevelProgressProps {
  id: string;
  userId: string;
  levelId: string;
  status: LevelStatus;
  attemptsCount: number;
  bestScore: number;
  startedAt: Date | null;
  completedAt: Date | null;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade de domínio para Progresso do Usuário em um Nível
 * Rastreia tentativas, scores e conquistas do usuário
 *
 * Responsabilidades:
 * - Gerenciar transições de estado (LOCKED → AVAILABLE → IN_PROGRESS → COMPLETED/PERFECT)
 * - Calcular e armazenar melhor score
 * - Rastrear XP ganho
 * - Determinar quando nível atinge status PERFECT
 *
 * Padrão DDD: Entity com lógica de estado encapsulada
 */
export class UserLevelProgressEntity {
  private constructor(private props: UserLevelProgressProps) {}

  static create(data: {
    userId: string;
    levelId: string;
    status?: LevelStatus;
  }): UserLevelProgressEntity {
    const props: UserLevelProgressProps = {
      id: randomUUID(),
      userId: data.userId,
      levelId: data.levelId,
      status: data.status ?? LevelStatus.AVAILABLE,
      attemptsCount: 0,
      bestScore: 0,
      startedAt: null,
      completedAt: null,
      xpEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'user_level_progress_created',
      userId: data.userId,
      levelId: data.levelId,
      status: props.status,
    }, 'User level progress entity created');

    return new UserLevelProgressEntity(props);
  }

  static fromPrisma(data: any): UserLevelProgressEntity {
    return new UserLevelProgressEntity({
      id: data.id,
      userId: data.userId,
      levelId: data.levelId,
      status: data.status as LevelStatus,
      attemptsCount: data.attemptsCount,
      bestScore: data.bestScore,
      startedAt: data.startedAt ? new Date(data.startedAt) : null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      xpEarned: data.xpEarned,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getUserId(): string {
    return this.props.userId;
  }

  getLevelId(): string {
    return this.props.levelId;
  }

  getStatus(): LevelStatus {
    return this.props.status;
  }

  getAttemptsCount(): number {
    return this.props.attemptsCount;
  }

  getBestScore(): number {
    return this.props.bestScore;
  }

  getXpEarned(): number {
    return this.props.xpEarned;
  }

  /**
   * Regra de negócio: Inicia o nível
   * Transição: AVAILABLE → IN_PROGRESS
   */
  start(): void {
    if (this.props.status === LevelStatus.IN_PROGRESS) {
      logger.debug({
        userId: this.props.userId,
        levelId: this.props.levelId,
      }, 'Level already in progress');
      return;
    }

    this.props.status = LevelStatus.IN_PROGRESS;
    this.props.startedAt = new Date();
    this.props.attemptsCount += 1;
    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      levelId: this.props.levelId,
      attemptNumber: this.props.attemptsCount,
    }, 'Level started by user');
  }

  /**
   * Regra de negócio: Completa o nível com score
   * Determina status final (COMPLETED ou PERFECT) baseado no score
   * Atualiza melhor score se aplicável
   */
  complete(score: number, xpEarned: number): void {
    // Atualiza melhor score se atual é maior
    if (score > this.props.bestScore) {
      this.props.bestScore = score;
    }

    // Acumula XP ganho
    this.props.xpEarned += xpEarned;

    // Determina status final baseado no score
    if (score === 100) {
      this.props.status = LevelStatus.PERFECT;
    } else if (score >= 70) {  // Score mínimo para passar
      this.props.status = LevelStatus.COMPLETED;
    } else {
      // Score insuficiente, mantém IN_PROGRESS
      this.props.status = LevelStatus.IN_PROGRESS;
    }

    // Define completedAt apenas se passou
    if (this.props.status === LevelStatus.COMPLETED || this.props.status === LevelStatus.PERFECT) {
      this.props.completedAt = new Date();
    }

    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      levelId: this.props.levelId,
      score,
      xpEarned,
      newStatus: this.props.status,
      bestScore: this.props.bestScore,
    }, 'Level completion attempt processed');
  }

  /**
   * Regra de negócio: Desbloqueia o nível
   * Transição: LOCKED → AVAILABLE
   */
  unlock(): void {
    if (this.props.status !== LevelStatus.LOCKED) {
      logger.warn({
        userId: this.props.userId,
        levelId: this.props.levelId,
        currentStatus: this.props.status,
      }, 'Attempted to unlock level that is not locked');
      return;
    }

    this.props.status = LevelStatus.AVAILABLE;
    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      levelId: this.props.levelId,
    }, 'Level unlocked for user');
  }

  /**
   * Regra de negócio: Verifica se o nível foi completado
   */
  isCompleted(): boolean {
    return this.props.status === LevelStatus.COMPLETED || this.props.status === LevelStatus.PERFECT;
  }

  /**
   * Regra de negócio: Verifica se o nível foi completado perfeitamente
   */
  isPerfect(): boolean {
    return this.props.status === LevelStatus.PERFECT;
  }

  /**
   * Regra de negócio: Verifica se o nível está disponível para jogar
   */
  isAvailable(): boolean {
    return this.props.status === LevelStatus.AVAILABLE || this.props.status === LevelStatus.IN_PROGRESS;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      levelId: this.props.levelId,
      status: this.props.status,
      attemptsCount: this.props.attemptsCount,
      bestScore: this.props.bestScore,
      startedAt: this.props.startedAt,
      completedAt: this.props.completedAt,
      xpEarned: this.props.xpEarned,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
