import { UnitStatus } from '../enums/unit-status.enum';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface UserUnitProgressProps {
  id: string;
  userId: string;
  unitId: string;
  status: UnitStatus;
  levelsCompleted: number;
  totalLevels: number;
  completionPercentage: number;
  currentLevelId: string | null;
  highestScore: number;
  attemptsCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessedAt: Date;
  totalXpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Padrão DDD: Entity com lógica de negócio encapsulada
 * State machine: LOCKED → AVAILABLE → IN_PROGRESS → COMPLETED
 */
export class UserUnitProgressEntity {
  private constructor(private props: UserUnitProgressProps) {}

  static create(data: {
    userId: string;
    unitId: string;
    totalLevels: number;
    status?: UnitStatus;
  }): UserUnitProgressEntity {
    const props: UserUnitProgressProps = {
      id: randomUUID(),
      userId: data.userId,
      unitId: data.unitId,
      status: data.status ?? UnitStatus.AVAILABLE,
      levelsCompleted: 0,
      totalLevels: data.totalLevels,
      completionPercentage: 0,
      currentLevelId: null,
      highestScore: 0,
      attemptsCount: 0,
      startedAt: null,
      completedAt: null,
      lastAccessedAt: new Date(),
      totalXpEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'user_unit_progress_created',
      userId: data.userId,
      unitId: data.unitId,
      status: props.status,
    }, 'User unit progress entity created');

    return new UserUnitProgressEntity(props);
  }

  static fromPrisma(data: any): UserUnitProgressEntity {
    return new UserUnitProgressEntity({
      id: data.id,
      userId: data.userId,
      unitId: data.unitId,
      status: data.status as UnitStatus,
      levelsCompleted: data.levelsCompleted,
      totalLevels: data.totalLevels,
      completionPercentage: data.completionPercentage,
      currentLevelId: data.currentLevelId,
      highestScore: data.highestScore,
      attemptsCount: data.attemptsCount,
      startedAt: data.startedAt ? new Date(data.startedAt) : null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      lastAccessedAt: new Date(data.lastAccessedAt),
      totalXpEarned: data.totalXpEarned,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  getId(): string {
    return this.props.id;
  }

  getUserId(): string {
    return this.props.userId;
  }

  getUnitId(): string {
    return this.props.unitId;
  }

  getStatus(): UnitStatus {
    return this.props.status;
  }

  getLevelsCompleted(): number {
    return this.props.levelsCompleted;
  }

  getTotalLevels(): number {
    return this.props.totalLevels;
  }

  getCompletionPercentage(): number {
    return this.props.completionPercentage;
  }

  getCurrentLevelId(): string | null {
    return this.props.currentLevelId;
  }

  getHighestScore(): number {
    return this.props.highestScore;
  }

  getAttemptsCount(): number {
    return this.props.attemptsCount;
  }

  getTotalXpEarned(): number {
    return this.props.totalXpEarned;
  }

  unlock(): void {
    if (this.props.status !== UnitStatus.LOCKED) {
      logger.warn({
        userId: this.props.userId,
        unitId: this.props.unitId,
        currentStatus: this.props.status,
      }, 'Attempted to unlock unit that is not locked');
      return;
    }

    this.props.status = UnitStatus.AVAILABLE;
    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      unitId: this.props.unitId,
    }, 'Unit unlocked for user');
  }

  start(): void {
    if (this.props.status === UnitStatus.IN_PROGRESS) {
      logger.debug({
        userId: this.props.userId,
        unitId: this.props.unitId,
      }, 'Unit already in progress');
      return;
    }

    this.props.status = UnitStatus.IN_PROGRESS;
    this.props.startedAt = new Date();
    this.props.lastAccessedAt = new Date();
    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      unitId: this.props.unitId,
    }, 'Unit started by user');
  }

  updateProgress(data: {
    levelsCompleted: number;
    currentLevelId: string | null;
    xpEarned?: number;
    score?: number;
  }): void {
    this.props.levelsCompleted = data.levelsCompleted;
    this.props.currentLevelId = data.currentLevelId;
    this.props.lastAccessedAt = new Date();
    this.props.updatedAt = new Date();
    this.props.attemptsCount += 1;

    if (data.xpEarned) {
      this.props.totalXpEarned += data.xpEarned;
    }

    if (data.score && data.score > this.props.highestScore) {
      this.props.highestScore = data.score;
    }

    this.props.completionPercentage = this.props.totalLevels > 0
      ? Math.round((this.props.levelsCompleted / this.props.totalLevels) * 100)
      : 0;

    logger.info({
      userId: this.props.userId,
      unitId: this.props.unitId,
      levelsCompleted: this.props.levelsCompleted,
      totalLevels: this.props.totalLevels,
      completionPercentage: this.props.completionPercentage,
    }, 'Unit progress updated');

    if (this.props.levelsCompleted >= this.props.totalLevels) {
      this.complete();
    }
  }

  /**
   * Apenas níveis blocking e required contam para conclusão
   */
  complete(): void {
    if (this.props.status === UnitStatus.COMPLETED) {
      logger.debug({
        userId: this.props.userId,
        unitId: this.props.unitId,
      }, 'Unit already completed');
      return;
    }

    this.props.status = UnitStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.completionPercentage = 100;
    this.props.updatedAt = new Date();

    logger.info({
      userId: this.props.userId,
      unitId: this.props.unitId,
      totalXpEarned: this.props.totalXpEarned,
      highestScore: this.props.highestScore,
      attemptsCount: this.props.attemptsCount,
    }, 'Unit completed by user');
  }

  isAvailable(): boolean {
    return this.props.status === UnitStatus.AVAILABLE || this.props.status === UnitStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.props.status === UnitStatus.COMPLETED;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      unitId: this.props.unitId,
      status: this.props.status,
      levelsCompleted: this.props.levelsCompleted,
      totalLevels: this.props.totalLevels,
      completionPercentage: this.props.completionPercentage,
      currentLevelId: this.props.currentLevelId,
      highestScore: this.props.highestScore,
      attemptsCount: this.props.attemptsCount,
      startedAt: this.props.startedAt,
      completedAt: this.props.completedAt,
      lastAccessedAt: this.props.lastAccessedAt,
      totalXpEarned: this.props.totalXpEarned,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
