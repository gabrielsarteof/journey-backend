import { LearningPathError } from './learning-path.error';

export class PathSlugExistsError extends LearningPathError {
  constructor(slug: string) {
    super(`Path with slug '${slug}' already exists`, { slug });
    this.name = 'PathSlugExistsError';
  }
}
