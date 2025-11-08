# Learning Paths Module

## Overview
This module implements a hierarchical learning structure inspired by Duolingo, parallel to the existing Module/Unit/Level structure.

## Hierarchy

```
LearningPath (e.g., "Backend Developer Path")
  └── LearningUnit (e.g., "RESTful APIs")
      └── Lesson (e.g., "HTTP Methods")
          └── Challenge (via LessonChallenge junction table)
```

## Models

### LearningPath
- Represents a complete learning journey (e.g., "Backend Developer", "Frontend Mastery")
- Contains multiple LearningUnits
- Has category, targetRole, estimatedHours, totalXp
- Can be published/unpublished

### LearningUnit
- A thematic unit within a LearningPath
- Contains multiple Lessons
- Supports prerequisites (other units that must be completed first)
- Has learningGoals and metadata

### Lesson
- Individual learning content unit
- Types: THEORY, PRACTICE, QUIZ, PROJECT, CHALLENGE
- Can contain multiple Challenges via LessonChallenge junction table
- Has estimatedMinutes and xpReward

### LessonChallenge
- Junction table linking Lessons to existing Challenges
- Allows ordering challenges within a lesson
- Supports required vs optional challenges

## Coexistence with Existing Structure

This structure coexists with the existing Module/Unit/Level hierarchy:

**Existing**: Module → Unit → Level → Challenge (via LevelChallenge)
**New**: LearningPath → LearningUnit → Lesson → Challenge (via LessonChallenge)

Both can reference the same Challenge, allowing flexible content organization.

## Implementation Status

### ✅ Completed
- Database schema (Prisma models)
- Migration SQL

### 🚧 TODO
- Domain entities (LearningPathEntity, LearningUnitEntity, LessonEntity)
- Repository interfaces and implementations
- Use cases (CRUD operations)
- Controllers and routes
- Fastify plugin registration
- Progress tracking (UserLearningPathProgress, etc.)

## Notes

- Names were chosen to avoid conflicts with existing `Unit` model
- All tables support soft delete via `isPublished` flag
- Metadata JSON fields allow for future extensibility
- Cascade deletes maintain referential integrity
