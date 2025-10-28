-- CreateEnum
CREATE TYPE "public"."ModuleStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "iconImage" TEXT NOT NULL,
    "theme" JSONB NOT NULL,
    "requiredXp" INTEGER NOT NULL DEFAULT 0,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "previousModuleId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserModuleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "public"."ModuleStatus" NOT NULL DEFAULT 'LOCKED',
    "challengesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalChallenges" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Module_slug_key" ON "public"."Module"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Module_orderIndex_key" ON "public"."Module"("orderIndex");

-- CreateIndex
CREATE INDEX "Module_slug_idx" ON "public"."Module"("slug");

-- CreateIndex
CREATE INDEX "Module_orderIndex_idx" ON "public"."Module"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "UserModuleProgress_userId_moduleId_key" ON "public"."UserModuleProgress"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "UserModuleProgress_userId_idx" ON "public"."UserModuleProgress"("userId");

-- CreateIndex
CREATE INDEX "UserModuleProgress_moduleId_idx" ON "public"."UserModuleProgress"("moduleId");

-- CreateIndex
CREATE INDEX "UserModuleProgress_status_idx" ON "public"."UserModuleProgress"("status");

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_previousModuleId_fkey" FOREIGN KEY ("previousModuleId") REFERENCES "public"."Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserModuleProgress" ADD CONSTRAINT "UserModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserModuleProgress" ADD CONSTRAINT "UserModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Challenge table to add moduleId reference and other fields
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "moduleId" TEXT;
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "orderInModule" INTEGER;
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "planetImage" TEXT;
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "visualTheme" JSONB;
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "requiredScore" DOUBLE PRECISION;
ALTER TABLE "public"."Challenge" ADD COLUMN IF NOT EXISTS "previousChallengeId" TEXT;

-- AddForeignKey for Challenge
ALTER TABLE "public"."Challenge" ADD CONSTRAINT "Challenge_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Challenge_moduleId_idx" ON "public"."Challenge"("moduleId");
CREATE UNIQUE INDEX IF NOT EXISTS "Challenge_moduleId_orderInModule_key" ON "public"."Challenge"("moduleId", "orderInModule");
