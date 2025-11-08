import { DomainError } from '@/shared/domain/errors/domain.error';

export class LearningPathError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    this.name = 'LearningPathError';
  }
}
