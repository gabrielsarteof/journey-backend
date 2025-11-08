import { Lesson as PrismaLesson } from '@prisma/client';
import { CreateLessonDTO } from '../schemas/learning-path.schema';
import { LessonContent, LessonMetadata, LessonType } from '../types/learning-path.types';
import { logger } from '@/shared/infrastructure/monitoring/logger';

export class LessonEntity {
  private constructor(private readonly props: PrismaLesson) {}

  static create(data: CreateLessonDTO): LessonEntity {
    const startTime = Date.now();

    logger.info(
      {
        operation: 'lesson_entity_creation',
        slug: data.slug,
        title: data.title,
        unitId: data.unitId,
        lessonType: data.lessonType,
        estimatedMinutes: data.estimatedMinutes,
        xpReward: data.xpReward,
        isPublished: data.isPublished,
        order: data.order,
      },
      'Creating lesson entity'
    );

    try {
      const metadata = typeof data.metadata === 'string'
        ? data.metadata
        : JSON.stringify(data.metadata || {});

      const content = data.content
        ? typeof data.content === 'string'
          ? data.content
          : JSON.stringify(data.content)
        : null;

      const props = {
        id: '', // Will be set by Prisma
        unitId: data.unitId,
        slug: data.slug,
        title: data.title,
        description: data.description,
        icon: data.icon || null,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? false,
        lessonType: (data.lessonType || 'PRACTICE') as any,
        estimatedMinutes: data.estimatedMinutes ?? 15,
        xpReward: data.xpReward ?? 50,
        content,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PrismaLesson;

      const processingTime = Date.now() - startTime;

      logger.info(
        {
          operation: 'lesson_entity_creation_success',
          slug: data.slug,
          title: data.title,
          unitId: data.unitId,
          lessonType: data.lessonType,
          processingTime,
        },
        'Lesson entity created successfully'
      );

      return new LessonEntity(props);
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error(
        {
          operation: 'lesson_entity_creation_failed',
          slug: data.slug,
          title: data.title,
          unitId: data.unitId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime,
        },
        'Failed to create lesson entity'
      );

      throw error;
    }
  }

  static fromPrisma(lesson: PrismaLesson): LessonEntity {
    logger.debug(
      {
        operation: 'lesson_entity_from_prisma',
        lessonId: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        unitId: lesson.unitId,
        lessonType: lesson.lessonType,
        isPublished: lesson.isPublished,
      },
      'Creating lesson entity from Prisma model'
    );

    try {
      return new LessonEntity(lesson);
    } catch (error) {
      logger.error(
        {
          operation: 'lesson_entity_from_prisma_failed',
          lessonId: lesson.id,
          slug: lesson.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to create lesson entity from Prisma model'
      );
      throw error;
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get unitId(): string {
    return this.props.unitId;
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

  get lessonType(): LessonType {
    return this.props.lessonType as LessonType;
  }

  get estimatedMinutes(): number {
    return this.props.estimatedMinutes;
  }

  get xpReward(): number {
    return this.props.xpReward;
  }

  get content(): LessonContent | null {
    if (!this.props.content) return null;

    try {
      return typeof this.props.content === 'string'
        ? JSON.parse(this.props.content)
        : this.props.content;
    } catch {
      return null;
    }
  }

  get metadata(): LessonMetadata {
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
  isTheory(): boolean {
    return this.lessonType === LessonType.THEORY;
  }

  isPractical(): boolean {
    return [
      LessonType.PRACTICE,
      LessonType.CHALLENGE,
      LessonType.PROJECT,
    ].includes(this.lessonType);
  }

  isQuiz(): boolean {
    return this.lessonType === LessonType.QUIZ;
  }

  isVisible(): boolean {
    return this.isPublished;
  }

  requiresCompletion(): boolean {
    // Theory lessons can be marked as read/completed
    // Practical lessons require challenge completion
    return this.isPractical();
  }

  getEstimatedTimeRange(): { min: number; max: number } {
    // Return time range based on lesson type
    const baseTime = this.estimatedMinutes;

    if (this.isTheory()) {
      return { min: baseTime, max: baseTime };
    }

    if (this.isQuiz()) {
      return { min: baseTime * 0.8, max: baseTime * 1.2 };
    }

    // Practical lessons have more variability
    return { min: baseTime * 0.7, max: baseTime * 1.5 };
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      unitId: this.unitId,
      slug: this.slug,
      title: this.title,
      description: this.description,
      icon: this.icon,
      order: this.order,
      isPublished: this.isPublished,
      lessonType: this.lessonType,
      estimatedMinutes: this.estimatedMinutes,
      xpReward: this.xpReward,
      content: this.content,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPrisma(): PrismaLesson {
    return this.props;
  }
}
