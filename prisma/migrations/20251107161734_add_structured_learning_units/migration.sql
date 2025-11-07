-- CreateEnum
CREATE TYPE "public"."LevelType" AS ENUM ('LESSON', 'PRACTICE', 'STORY', 'UNIT_REVIEW', 'MATCH_MADNESS', 'RAPID_REVIEW', 'XP_RAMP_UP');

-- CreateEnum
CREATE TYPE "public"."UnitStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."LevelStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'PERFECT');

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "orderInModule" INTEGER NOT NULL,
    "iconImage" TEXT NOT NULL,
    "theme" JSONB NOT NULL DEFAULT '{}',
    "learningObjectives" TEXT[],
    "estimatedMinutes" INTEGER NOT NULL,
    "theoryContent" TEXT NOT NULL,
    "resources" JSONB NOT NULL DEFAULT '{}',
    "requiredScore" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserUnitProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "public"."UnitStatus" NOT NULL DEFAULT 'LOCKED',
    "levelsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalLevels" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentLevelId" TEXT,
    "highestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUnitProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Level" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "orderInUnit" INTEGER NOT NULL,
    "type" "public"."LevelType" NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "adaptive" BOOLEAN NOT NULL DEFAULT false,
    "blocking" BOOLEAN NOT NULL DEFAULT true,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER,
    "bonusXp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LevelChallenge" (
    "levelId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "orderInLevel" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelChallenge_pkey" PRIMARY KEY ("levelId","challengeId")
);

-- CreateTable
CREATE TABLE "public"."UserLevelProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "status" "public"."LevelStatus" NOT NULL DEFAULT 'LOCKED',
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLevelProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_key" ON "public"."Unit"("slug");

-- CreateIndex
CREATE INDEX "Unit_moduleId_idx" ON "public"."Unit"("moduleId");

-- CreateIndex
CREATE INDEX "Unit_slug_idx" ON "public"."Unit"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_moduleId_orderInModule_key" ON "public"."Unit"("moduleId", "orderInModule");

-- CreateIndex
CREATE INDEX "UserUnitProgress_userId_idx" ON "public"."UserUnitProgress"("userId");

-- CreateIndex
CREATE INDEX "UserUnitProgress_unitId_idx" ON "public"."UserUnitProgress"("unitId");

-- CreateIndex
CREATE INDEX "UserUnitProgress_status_idx" ON "public"."UserUnitProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnitProgress_userId_unitId_key" ON "public"."UserUnitProgress"("userId", "unitId");

-- CreateIndex
CREATE INDEX "Level_unitId_idx" ON "public"."Level"("unitId");

-- CreateIndex
CREATE INDEX "Level_type_idx" ON "public"."Level"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Level_unitId_orderInUnit_key" ON "public"."Level"("unitId", "orderInUnit");

-- CreateIndex
CREATE INDEX "LevelChallenge_levelId_idx" ON "public"."LevelChallenge"("levelId");

-- CreateIndex
CREATE INDEX "LevelChallenge_challengeId_idx" ON "public"."LevelChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "UserLevelProgress_userId_idx" ON "public"."UserLevelProgress"("userId");

-- CreateIndex
CREATE INDEX "UserLevelProgress_levelId_idx" ON "public"."UserLevelProgress"("levelId");

-- CreateIndex
CREATE INDEX "UserLevelProgress_status_idx" ON "public"."UserLevelProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserLevelProgress_userId_levelId_key" ON "public"."UserLevelProgress"("userId", "levelId");

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserUnitProgress" ADD CONSTRAINT "UserUnitProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserUnitProgress" ADD CONSTRAINT "UserUnitProgress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Level" ADD CONSTRAINT "Level_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelChallenge" ADD CONSTRAINT "LevelChallenge_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelChallenge" ADD CONSTRAINT "LevelChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLevelProgress" ADD CONSTRAINT "UserLevelProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLevelProgress" ADD CONSTRAINT "UserLevelProgress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
