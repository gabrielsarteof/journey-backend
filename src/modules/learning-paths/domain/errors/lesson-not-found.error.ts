import { LearningPathError } from './learning-path.error';

export class LessonNotFoundError extends LearningPathError {
  constructor(identifier: string) {
    super(`Lesson not found: ${identifier}`, { identifier });
    this.name = 'LessonNotFoundError';
  }
}
