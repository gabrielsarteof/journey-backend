import { LearningPathError } from './learning-path.error';

export class PathNotFoundError extends LearningPathError {
  constructor(identifier: string) {
    super(`Path not found: ${identifier}`, { identifier });
    this.name = 'PathNotFoundError';
  }
}
