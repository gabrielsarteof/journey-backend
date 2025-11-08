import { LearningUnit as PrismaLearningUnit } from '@prisma/client';
import { CreateUnitDTO } from '../schemas/learning-path.schema';
import { UnitMetadata } from '../types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class UnitEntity {
  private constructor(private readonly props: PrismaLearningUnit) {}

  static create(data: CreateUnitDTO): UnitEntity {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'unit_entity_creation',
        slug: data.slug,
        title: data.title,
        pathId: data.pathId,
        estimatedHours: data.estimatedHours,
        totalXp: data.totalXp,
        isPublished: data.isPublished,
        order: data.order,
        prerequisitesCount: data.prerequisites?.length || 0,
        learningGoalsCount: data.learningGoals?.length || 0,
      },
      'Creating unit entity'
    );

    try {
      const metadata = typeof data.metadata === 'string'
        ? data.metadata
        : JSON.stringify(data.metadata || {});

      const props = {
        id: '', // Will be set by Prisma
        pathId: data.pathId,
        slug: data.slug,
        title: data.title,
        description: data.description,
        icon: data.icon || null,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? false,
        estimatedHours: data.estimatedHours ?? 0,
        totalXp: data.totalXp ?? 0,
        prerequisites: data.prerequisites || [],
        learningGoals: data.learningGoals || [],
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PrismaLearningUnit;

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'unit_entity_creation_success',
          slug: data.slug,
          title: data.title,
          pathId: data.pathId,
          processingTime,
        },
        'Unit entity created successfully'
      );

      return new UnitEntity(props);
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'unit_entity_creation_failed',
          slug: data.slug,
          title: data.title,
          pathId: data.pathId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime,
        },
        'Failed to create unit entity'
      );

      throw error;
    }
  }

  static fromPrisma(unit: PrismaLearningUnit): UnitEntity {
    logger.debug(
      {
        operation: 'unit_entity_from_prisma',
        unitId: unit.id,
        slug: unit.slug,
        title: unit.title,
        pathId: unit.pathId,
        isPublished: unit.isPublished,
      },
      'Creating unit entity from Prisma model'
    );

    try {
      return new UnitEntity(unit);
    } catch (error) {
      logger.error(
        {
          operation: 'unit_entity_from_prisma_failed',
          unitId: unit.id,
          slug: unit.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to create unit entity from Prisma model'
      );
      throw error;
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get pathId(): string {
    return this.props.pathId;
  }

  get slug(): string {
    return this.props.slug;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get icon(): string | null {
    return this.props.icon;
  }

  get order(): number {
    return this.props.order;
  }

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  get estimatedHours(): number {
    return this.props.estimatedHours;
  }

  get totalXp(): number {
    return this.props.totalXp;
  }

  get prerequisites(): string[] {
    return this.props.prerequisites;
  }

  get learningGoals(): string[] {
    return this.props.learningGoals;
  }

  get metadata(): UnitMetadata {
    try {
      return typeof this.props.metadata === 'string'
        ? JSON.parse(this.props.metadata)
        : this.props.metadata;
    } catch {
      return {};
    }
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods
  hasPrerequisites(): boolean {
    return this.prerequisites.length > 0;
  }

  isPrerequisiteSatisfied(completedUnitIds: string[]): boolean {
    if (!this.hasPrerequisites()) {
      return true;
    }

    return this.prerequisites.every((prereqId) =>
      completedUnitIds.includes(prereqId)
    );
  }

  isVisible(): boolean {
    return this.isPublished;
  }

  getProgress(completedLessonCount: number, totalLessonCount: number): number {
    if (totalLessonCount === 0) return 0;
    return Math.round((completedLessonCount / totalLessonCount) * 100);
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      pathId: this.pathId,
      slug: this.slug,
      title: this.title,
      description: this.description,
      icon: this.icon,
      order: this.order,
      isPublished: this.isPublished,
      estimatedHours: this.estimatedHours,
      totalXp: this.totalXp,
      prerequisites: this.prerequisites,
      learningGoals: this.learningGoals,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): PrismaLearningUnit {
    return this.props;
  }
}
