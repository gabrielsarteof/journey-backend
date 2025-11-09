/**
 * Tipos de níveis focados em governança e segurança de IA
 *
 * Decisão arquitetural: Preferimos types específicos ao contexto de segurança
 * sobre tipos genéricos de gamificação (STORY, MATCH_MADNESS).
 * Isso mantém o foco educacional em governança de IA ao invés de entretenimento.
 */
export enum LevelType {
  LESSON = 'LESSON',
  PRACTICE = 'PRACTICE',
  UNIT_REVIEW = 'UNIT_REVIEW',
  CODE_REVIEW = 'CODE_REVIEW',
  SECURITY_AUDIT = 'SECURITY_AUDIT',
  POLICY_CHECK = 'POLICY_CHECK',
  DEBUG_SECURITY = 'DEBUG_SECURITY',
  ADVANCED_CHALLENGE = 'ADVANCED_CHALLENGE',
}
