-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('THEORY', 'PRACTICE', 'QUIZ', 'PROJECT', 'CHALLENGE');

-- CreateTable: LearningPath
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "category" "Category" NOT NULL,
    "targetRole" "UserRole",
    "estimatedHours" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LearningUnit
CREATE TABLE "LearningUnit" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "estimatedHours" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "prerequisites" TEXT[],
    "learningGoals" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Lesson
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "learningUnitId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "lessonType" "LessonType" NOT NULL DEFAULT 'PRACTICE',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 15,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "content" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LessonChallenge (junction table)
CREATE TABLE "LessonChallenge" (
    "lessonId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "orderInLesson" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonChallenge_pkey" PRIMARY KEY ("lessonId","challengeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_slug_key" ON "LearningPath"("slug");
CREATE INDEX "LearningPath_slug_idx" ON "LearningPath"("slug");
CREATE INDEX "LearningPath_category_idx" ON "LearningPath"("category");
CREATE INDEX "LearningPath_isPublished_idx" ON "LearningPath"("isPublished");
CREATE INDEX "LearningPath_order_idx" ON "LearningPath"("order");

CREATE UNIQUE INDEX "LearningUnit_slug_key" ON "LearningUnit"("slug");
CREATE INDEX "LearningUnit_learningPathId_idx" ON "LearningUnit"("learningPathId");
CREATE INDEX "LearningUnit_slug_idx" ON "LearningUnit"("slug");
CREATE INDEX "LearningUnit_isPublished_idx" ON "LearningUnit"("isPublished");
CREATE INDEX "LearningUnit_order_idx" ON "LearningUnit"("order");

CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");
CREATE INDEX "Lesson_learningUnitId_idx" ON "Lesson"("learningUnitId");
CREATE INDEX "Lesson_slug_idx" ON "Lesson"("slug");
CREATE INDEX "Lesson_lessonType_idx" ON "Lesson"("lessonType");
CREATE INDEX "Lesson_isPublished_idx" ON "Lesson"("isPublished");
CREATE INDEX "Lesson_order_idx" ON "Lesson"("order");

CREATE INDEX "LessonChallenge_lessonId_idx" ON "LessonChallenge"("lessonId");
CREATE INDEX "LessonChallenge_challengeId_idx" ON "LessonChallenge"("challengeId");

-- AddForeignKey
ALTER TABLE "LearningUnit" ADD CONSTRAINT "LearningUnit_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_learningUnitId_fkey" FOREIGN KEY ("learningUnitId") REFERENCES "LearningUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonChallenge" ADD CONSTRAINT "LessonChallenge_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonChallenge" ADD CONSTRAINT "LessonChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
