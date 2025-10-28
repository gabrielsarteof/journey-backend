import { ModuleStatus } from '../enums/module-status.enum';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface UserModuleProgressProps {
  id: string;
  userId: string;
  moduleId: string;
  status: ModuleStatus;
  challengesCompleted: number;
  totalChallenges: number;
  completionPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  totalXpEarned: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModuleProgressEntity {
  private constructor(private props: UserModuleProgressProps) {}

  static create(data: {
    userId: string;
    moduleId: string;
    totalChallenges: number;
  }): UserModuleProgressEntity {
    const props: UserModuleProgressProps = {
      id: randomUUID(),
      userId: data.userId,
      moduleId: data.moduleId,
      status: ModuleStatus.AVAILABLE,
      challengesCompleted: 0,
      totalChallenges: data.totalChallenges,
      completionPercentage: 0,
      totalXpEarned: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'user_module_progress_created',
      userId: data.userId,
      moduleId: data.moduleId,
    }, 'User module progress created');

    return new UserModuleProgressEntity(props);
  }

  static fromPrisma(data: any): UserModuleProgressEntity {
    return new UserModuleProgressEntity({
      id: data.id,
      userId: data.userId,
      moduleId: data.moduleId,
      status: data.status as ModuleStatus,
      challengesCompleted: data.challengesCompleted,
      totalChallenges: data.totalChallenges,
      completionPercentage: data.completionPercentage,
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      lastAccessedAt: data.lastAccessedAt ? new Date(data.lastAccessedAt) : undefined,
      totalXpEarned: data.totalXpEarned,
      averageScore: data.averageScore,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  unlock(): void {
    if (this.props.status !== ModuleStatus.LOCKED) {
      throw new Error('Module is not locked');
    }

    this.props.status = ModuleStatus.AVAILABLE;
    this.props.updatedAt = new Date();
  }

  start(): void {
    if (this.props.status !== ModuleStatus.AVAILABLE && this.props.status !== ModuleStatus.IN_PROGRESS) {
      throw new Error('Module cannot be started');
    }

    if (!this.props.startedAt) {
      this.props.startedAt = new Date();
    }

    this.props.status = ModuleStatus.IN_PROGRESS;
    this.props.lastAccessedAt = new Date();
    this.props.updatedAt = new Date();
  }

  updateProgress(challengesCompleted: number, xpEarned: number, score: number): void {
    this.props.challengesCompleted = challengesCompleted;
    this.props.completionPercentage = (challengesCompleted / this.props.totalChallenges) * 100;
    this.props.totalXpEarned += xpEarned;

    const totalScore = this.props.averageScore * (challengesCompleted - 1) + score;
    this.props.averageScore = totalScore / challengesCompleted;

    if (this.props.completionPercentage === 100) {
      this.complete();
    } else if (this.props.status !== ModuleStatus.IN_PROGRESS) {
      this.start();
    }

    this.props.lastAccessedAt = new Date();
    this.props.updatedAt = new Date();
  }

  complete(): void {
    this.props.status = ModuleStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.completionPercentage = 100;
    this.props.updatedAt = new Date();
  }

  getStatus(): ModuleStatus {
    return this.props.status;
  }

  getCompletionPercentage(): number {
    return this.props.completionPercentage;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      moduleId: this.props.moduleId,
      status: this.props.status,
      challengesCompleted: this.props.challengesCompleted,
      totalChallenges: this.props.totalChallenges,
      completionPercentage: this.props.completionPercentage,
      startedAt: this.props.startedAt,
      completedAt: this.props.completedAt,
      lastAccessedAt: this.props.lastAccessedAt,
      totalXpEarned: this.props.totalXpEarned,
      averageScore: this.props.averageScore,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
