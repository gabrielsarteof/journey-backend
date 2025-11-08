import { LearningPathError } from './learning-path.error';

export class LessonSlugExistsError extends LearningPathError {
  constructor(slug: string) {
    super(`Lesson with slug '${slug}' already exists`, { slug });
    this.name = 'LessonSlugExistsError';
  }
}
