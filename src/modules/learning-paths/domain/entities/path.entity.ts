import { LearningPath as PrismaLearningPath, Category, UserRole } from '@prisma/client';
import { CreatePathDTO } from '../schemas/learning-path.schema';
import { PathMetadata } from '../types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class PathEntity {
  private constructor(private readonly props: PrismaLearningPath) {}

  static create(data: CreatePathDTO): PathEntity {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'path_entity_creation',
        slug: data.slug,
        title: data.title,
        category: data.category,
        targetRole: data.targetRole,
        estimatedHours: data.estimatedHours,
        totalXp: data.totalXp,
        isPublished: data.isPublished,
        order: data.order,
      },
      'Creating path entity'
    );

    try {
      const metadata = typeof data.metadata === 'string'
        ? data.metadata
        : JSON.stringify(data.metadata || {});

      const props = {
        id: '', // Will be set by Prisma
        slug: data.slug,
        title: data.title,
        description: data.description,
        icon: data.icon || null,
        color: data.color || null,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? false,
        category: data.category,
        targetRole: data.targetRole || null,
        estimatedHours: data.estimatedHours ?? 0,
        totalXp: data.totalXp ?? 0,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PrismaLearningPath;

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'path_entity_creation_success',
          slug: data.slug,
          title: data.title,
          category: data.category,
          processingTime,
        },
        'Path entity created successfully'
      );

      return new PathEntity(props);
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'path_entity_creation_failed',
          slug: data.slug,
          title: data.title,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime,
        },
        'Failed to create path entity'
      );

      throw error;
    }
  }

  static fromPrisma(path: PrismaLearningPath): PathEntity {
    logger.debug(
      {
        operation: 'path_entity_from_prisma',
        pathId: path.id,
        slug: path.slug,
        title: path.title,
        category: path.category,
        isPublished: path.isPublished,
      },
      'Creating path entity from Prisma model'
    );

    try {
      return new PathEntity(path);
    } catch (error) {
      logger.error(
        {
          operation: 'path_entity_from_prisma_failed',
          pathId: path.id,
          slug: path.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to create path entity from Prisma model'
      );
      throw error;
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
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

  get color(): string | null {
    return this.props.color;
  }

  get order(): number {
    return this.props.order;
  }

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  get category(): Category {
    return this.props.category;
  }

  get targetRole(): UserRole | null {
    return this.props.targetRole;
  }

  get estimatedHours(): number {
    return this.props.estimatedHours;
  }

  get totalXp(): number {
    return this.props.totalXp;
  }

  get metadata(): PathMetadata {
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
  canBeAccessedByRole(userRole: UserRole): boolean {
    if (!this.targetRole) {
      return true; // No role restriction
    }

    const roleHierarchy: Record<UserRole, number> = {
      JUNIOR: 1,
      PLENO: 2,
      SENIOR: 3,
      TECH_LEAD: 4,
      ARCHITECT: 5,
    };

    return roleHierarchy[userRole] >= roleHierarchy[this.targetRole];
  }

  isVisible(): boolean {
    return this.isPublished;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      description: this.description,
      icon: this.icon,
      color: this.color,
      order: this.order,
      isPublished: this.isPublished,
      category: this.category,
      targetRole: this.targetRole,
      estimatedHours: this.estimatedHours,
      totalXp: this.totalXp,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): PrismaLearningPath {
    return this.props;
  }
}
