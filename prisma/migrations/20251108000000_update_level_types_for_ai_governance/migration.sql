-- Atualiza o enum LevelType para focar em governança e segurança de IA
-- Remove tipos de gamificação genéricos (STORY, MATCH_MADNESS, RAPID_REVIEW, XP_RAMP_UP)
-- Adiciona tipos focados em segurança (CODE_REVIEW, SECURITY_AUDIT, POLICY_CHECK, DEBUG_SECURITY, ADVANCED_CHALLENGE)

-- Cria um novo enum com os valores atualizados
CREATE TYPE "public"."LevelType_new" AS ENUM (
  'LESSON',
  'PRACTICE',
  'UNIT_REVIEW',
  'CODE_REVIEW',
  'SECURITY_AUDIT',
  'POLICY_CHECK',
  'DEBUG_SECURITY',
  'ADVANCED_CHALLENGE'
);

-- Atualiza a coluna type da tabela Level para usar o novo enum
-- Como não há dados ainda, podemos fazer diretamente
ALTER TABLE "public"."Level"
  ALTER COLUMN "type" DROP DEFAULT,
  ALTER COLUMN "type" TYPE "public"."LevelType_new" USING ("type"::text::"public"."LevelType_new"),
  ALTER COLUMN "type" SET NOT NULL;

-- Remove o enum antigo
DROP TYPE "public"."LevelType";

-- Renomeia o novo enum para o nome correto
ALTER TYPE "public"."LevelType_new" RENAME TO "LevelType";
