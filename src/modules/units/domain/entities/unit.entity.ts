import { UnitThemeVO } from '../value-objects/unit-theme.vo';
import { UnitResourcesVO } from '../value-objects/unit-resources.vo';
import { logger } from '@/shared/infrastructure/monitoring/logger';
import { randomUUID } from 'crypto';

export interface UnitProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleId: string;
  orderInModule: number;
  iconImage: string | null;
  theme: UnitThemeVO | null;
  learningObjectives: string[];
  estimatedMinutes: number;
  theoryContent: string | null;
  resources: UnitResourcesVO;
  requiredScore: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Padrão DDD: Entity com identidade única (slug + id)
 * Constructor privado força uso dos factory methods (create/fromPrisma)
 */
export class UnitEntity {
  private constructor(private readonly props: UnitProps) {}

  static create(data: {
    slug: string;
    title: string;
    description: string;
    moduleId: string;
    orderInModule: number;
    iconImage?: string | null;
    theme?: UnitThemeVO | null;
    learningObjectives?: string[];
    estimatedMinutes?: number;
    theoryContent?: string | null;
    resources?: UnitResourcesVO;
    requiredScore?: number;
  }): UnitEntity {
    const props: UnitProps = {
      id: randomUUID(),
      slug: data.slug,
      title: data.title,
      description: data.description,
      moduleId: data.moduleId,
      orderInModule: data.orderInModule,
      iconImage: data.iconImage ?? null,
      theme: data.theme ?? null,
      learningObjectives: data.learningObjectives ?? [],
      estimatedMinutes: data.estimatedMinutes ?? 60,
      theoryContent: data.theoryContent ?? null,
      resources: data.resources ?? UnitResourcesVO.create({ articles: [], videos: [] }),
      requiredScore: data.requiredScore ?? 70,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info({
      operation: 'unit_created',
      slug: data.slug,
      moduleId: data.moduleId,
      orderInModule: data.orderInModule,
    }, 'Unit entity created');

    return new UnitEntity(props);
  }

  static fromPrisma(data: any): UnitEntity {
    return new UnitEntity({
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      moduleId: data.moduleId,
      orderInModule: data.orderInModule,
      iconImage: data.iconImage,
      theme: data.theme ? UnitThemeVO.fromPrismaJson(data.theme) : null,
      learningObjectives: Array.isArray(data.learningObjectives) ? data.learningObjectives : [],
      estimatedMinutes: data.estimatedMinutes,
      theoryContent: data.theoryContent,
      resources: data.resources ? UnitResourcesVO.fromPrismaJson(data.resources) : UnitResourcesVO.create({ articles: [], videos: [] }),
      requiredScore: data.requiredScore,
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

  getDescription(): string {
    return this.props.description;
  }

  getModuleId(): string {
    return this.props.moduleId;
  }

  getOrderInModule(): number {
    return this.props.orderInModule;
  }

  getIconImage(): string | null {
    return this.props.iconImage;
  }

  getTheme(): UnitThemeVO | null {
    return this.props.theme;
  }

  getLearningObjectives(): string[] {
    return this.props.learningObjectives;
  }

  getEstimatedMinutes(): number {
    return this.props.estimatedMinutes;
  }

  getTheoryContent(): string | null {
    return this.props.theoryContent;
  }

  getResources(): UnitResourcesVO {
    return this.props.resources;
  }

  getRequiredScore(): number {
    return this.props.requiredScore;
  }

  hasTheoryContent(): boolean {
    return this.props.theoryContent !== null && this.props.theoryContent.length > 0;
  }

  hasEducationalResources(): boolean {
    return this.props.resources.hasResources();
  }

  toJSON() {
    return {
      id: this.props.id,
      slug: this.props.slug,
      title: this.props.title,
      description: this.props.description,
      moduleId: this.props.moduleId,
      orderInModule: this.props.orderInModule,
      iconImage: this.props.iconImage,
      theme: this.props.theme?.getValue() ?? null,
      learningObjectives: this.props.learningObjectives,
      estimatedMinutes: this.props.estimatedMinutes,
      theoryContent: this.props.theoryContent,
      resources: this.props.resources.getValue(),
      requiredScore: this.props.requiredScore,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
