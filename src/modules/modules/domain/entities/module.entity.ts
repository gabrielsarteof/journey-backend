import { ModuleThemeVO } from '../value-objects/module-theme.vo';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface ModuleProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  iconImage: string;
  theme: ModuleThemeVO;
  requiredXp: number;
  requiredLevel: number;
  previousModuleId?: string;
  isLocked: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ModuleEntity {
  private constructor(private readonly props: ModuleProps) {}

  static create(data: {
    slug: string;
    title: string;
    description: string;
    orderIndex: number;
    iconImage: string;
    theme: ModuleThemeVO;
    requiredXp?: number;
    requiredLevel?: number;
    previousModuleId?: string;
    isLocked?: boolean;
    isNew?: boolean;
  }): ModuleEntity {
    const props: ModuleProps = {
      id: randomUUID(),
      slug: data.slug,
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
      iconImage: data.iconImage,
      theme: data.theme,
      requiredXp: data.requiredXp ?? 0,
      requiredLevel: data.requiredLevel ?? 1,
      previousModuleId: data.previousModuleId,
      isLocked: data.isLocked ?? true,
      isNew: data.isNew ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'module_created',
      slug: data.slug,
      orderIndex: data.orderIndex,
    }, 'Module entity created');

    return new ModuleEntity(props);
  }

  static fromPrisma(data: any): ModuleEntity {
    return new ModuleEntity({
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
      iconImage: data.iconImage,
      theme: ModuleThemeVO.fromPrismaJson(data.theme),
      requiredXp: data.requiredXp,
      requiredLevel: data.requiredLevel,
      previousModuleId: data.previousModuleId,
      isLocked: data.isLocked,
      isNew: data.isNew,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  getId(): string {
    return this.props.id;
  }

  getSlug(): string {
    return this.props.slug;
  }

  getTitle(): string {
    return this.props.title;
  }

  getIconImage(): string {
    return this.props.iconImage;
  }

  getOrderIndex(): number {
    return this.props.orderIndex;
  }

  isLocked(): boolean {
    return this.props.isLocked;
  }

  canBeUnlockedBy(userXp: number, userLevel: number): boolean {
    return userXp >= this.props.requiredXp && userLevel >= this.props.requiredLevel;
  }

  toJSON() {
    return {
      id: this.props.id,
      slug: this.props.slug,
      title: this.props.title,
      description: this.props.description,
      orderIndex: this.props.orderIndex,
      iconImage: this.props.iconImage,
      theme: this.props.theme.getValue(),
      requiredXp: this.props.requiredXp,
      requiredLevel: this.props.requiredLevel,
      previousModuleId: this.props.previousModuleId,
      isLocked: this.props.isLocked,
      isNew: this.props.isNew,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
