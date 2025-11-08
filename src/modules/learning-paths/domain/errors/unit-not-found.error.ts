import { LearningPathError } from './learning-path.error';

export class UnitNotFoundError extends LearningPathError {
  constructor(identifier: string) {
    super(`Unit not found: ${identifier}`, { identifier });
    this.name = 'UnitNotFoundError';
  }
}
