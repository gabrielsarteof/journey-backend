import { LearningPathError } from './learning-path.error';

export class UnitSlugExistsError extends LearningPathError {
  constructor(slug: string) {
    super(`Unit with slug '${slug}' already exists`, { slug });
    this.name = 'UnitSlugExistsError';
  }
}
