import { LevelType } from '../enums/level-type.enum';
import { LevelConfigVO } from '../value-objects/level-config.vo';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface LevelProps {
  id: string;
  unitId: string;
  orderInUnit: number;
  type: LevelType;
  icon: string;
  title: string | null;
  description: string | null;
  config: LevelConfigVO;
  adaptive: boolean;
  blocking: boolean;
  optional: boolean;
  timeLimit: number | null;
  bonusXp: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Padrão DDD: Entity com regras de negócio encapsuladas
 *
 * Level types focados em AI governance e segurança:
 * - LESSON: guided theoretical lesson
 * - PRACTICE: free practice challenges
 * - UNIT_REVIEW: unit final test
 * - CODE_REVIEW: analyze code for AI governance violations
 * - SECURITY_AUDIT: identify AI security vulnerabilities
 * - POLICY_CHECK: validate AI usage compliance
 * - DEBUG_SECURITY: fix AI security issues
 * - ADVANCED_CHALLENGE: complex multi-concept scenarios
 */
export class LevelEntity {
  private constructor(private readonly props: LevelProps) {}

  static create(data: {
    unitId: string;
    orderInUnit: number;
    type: LevelType;
    icon: string;
    title?: string | null;
    description?: string | null;
    config?: LevelConfigVO;
    adaptive?: boolean;
    blocking?: boolean;
    optional?: boolean;
    timeLimit?: number | null;
    bonusXp?: number;
  }): LevelEntity {
    const props: LevelProps = {
      id: randomUUID(),
      unitId: data.unitId,
      orderInUnit: data.orderInUnit,
      type: data.type,
      icon: data.icon,
      title: data.title ?? null,
      description: data.description ?? null,
      config: data.config ?? LevelConfigVO.create({}),
      adaptive: data.adaptive ?? false,
      blocking: data.blocking ?? true,
      optional: data.optional ?? false,
      timeLimit: data.timeLimit ?? null,
      bonusXp: data.bonusXp ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'level_created',
      unitId: data.unitId,
      orderInUnit: data.orderInUnit,
      type: data.type,
    }, 'Level entity created');

    return new LevelEntity(props);
  }

  static fromPrisma(data: any): LevelEntity {
    return new LevelEntity({
      id: data.id,
      unitId: data.unitId,
      orderInUnit: data.orderInUnit,
      type: data.type as LevelType,
      icon: data.icon,
      title: data.title,
      description: data.description,
      config: data.config ? LevelConfigVO.fromPrismaJson(data.config) : LevelConfigVO.create({}),
      adaptive: data.adaptive,
      blocking: data.blocking,
      optional: data.optional,
      timeLimit: data.timeLimit,
      bonusXp: data.bonusXp,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  getId(): string {
    return this.props.id;
  }

  getUnitId(): string {
    return this.props.unitId;
  }

  getOrderInUnit(): number {
    return this.props.orderInUnit;
  }

  getType(): LevelType {
    return this.props.type;
  }

  getIcon(): string {
    return this.props.icon;
  }

  getTitle(): string | null {
    return this.props.title;
  }

  getDescription(): string | null {
    return this.props.description;
  }

  getConfig(): LevelConfigVO {
    return this.props.config;
  }

  isAdaptive(): boolean {
    return this.props.adaptive;
  }

  isBlocking(): boolean {
    return this.props.blocking;
  }

  isOptional(): boolean {
    return this.props.optional;
  }

  getTimeLimit(): number | null {
    return this.props.timeLimit;
  }

  getBonusXp(): number {
    return this.props.bonusXp;
  }

  hasTimeLimit(): boolean {
    return this.props.timeLimit !== null && this.props.timeLimit > 0;
  }

  /**
   * Níveis blocking e não-optional bloqueiam progressão
   */
  isRequiredForProgression(): boolean {
    return this.props.blocking && !this.props.optional;
  }

  hasBonusXp(): boolean {
    return this.props.bonusXp > 0;
  }

  toJSON() {
    return {
      id: this.props.id,
      unitId: this.props.unitId,
      orderInUnit: this.props.orderInUnit,
      type: this.props.type,
      icon: this.props.icon,
      title: this.props.title,
      description: this.props.description,
      config: this.props.config.getValue(),
      adaptive: this.props.adaptive,
      blocking: this.props.blocking,
      optional: this.props.optional,
      timeLimit: this.props.timeLimit,
      bonusXp: this.props.bonusXp,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
