# Journey | Learning Hierarchy Migration Plan

> Technical documentation for migrating the legacy challenge structure to a Duolingo-inspired hierarchical learning path

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [Proposed Hierarchy](#proposed-hierarchy)
- [Migration Phases](#migration-phases)
- [Implementation Details](#implementation-details)
- [API Specification](#api-specification)
- [Frontend Changes](#frontend-changes)

---

## Overview

This document outlines the complete migration plan from the legacy challenge structure to a new hierarchical learning system inspired by Duolingo's proven educational model.

### Goals

1. **Preserve existing data**: Migrate 28 challenges without data loss
2. **Implement hierarchy**: Module → Unit → Level → Challenge
3. **Add variety**: 7 different level types (LESSON, PRACTICE, STORY, etc.)
4. **Enable progression**: Structured unlock system with user progress tracking

### Timeline

**Estimated effort**: 52-67 hours across 7 phases

**Status**: Planning phase completed

---

## Current State

### Existing Data

| Entity | Count | Status |
|--------|-------|--------|
| **Modules** | 5 | ✅ Configured |
| **Challenges** | 28 | ⚠️ Legacy structure |
| **Units** | 1 | ✅ Sample created |
| **Levels** | 1 | ✅ Sample created |
| **LevelChallenges** | 1 | ✅ Sample created |

### Module Distribution

```
1. Backend Module (8 challenges)
   └─ Núcleo da Nebulosa

2. Frontend Module (5 challenges)
   └─ Cosmos da Interface

3. DevOps Module (5 challenges)
   └─ Sistema DevOps

4. Mobile Module (5 challenges)
   └─ Aglomerado Móvel

5. Data Module (5 challenges)
   └─ Galáxia dos Dados
```

### Legacy Structure

```typescript
// Current (Legacy)
Challenge {
  moduleId: string        // Direct link to module
  orderInModule: number   // Sequential order
}
```

### Problem

- ❌ Flat structure limits pedagogical organization
- ❌ No thematic grouping within modules
- ❌ Single challenge type (no lessons, stories, reviews)
- ❌ Limited progression mechanics

---

## Proposed Hierarchy

### Comparison: Journey vs Duolingo

| Journey | Duolingo | Description |
|---------|----------|-------------|
| **Module** | Section/Path | Top-level grouping (e.g., "Backend Fundamentals") |
| **Unit** | Unit | Thematic learning unit (e.g., "REST APIs", "Authentication") |
| **Level** | Lesson/Level | Individual practice session with specific type |
| **LevelChallenge** | Exercise | N:N junction table |
| **Challenge** | Question | Actual coding challenge with tests |

### New Structure

```typescript
// New (Hierarchical)
Module → Unit → Level → LevelChallenge → Challenge
```

### Visual Representation

```
Module: Backend (Núcleo da Nebulosa)
├── Unit 1: REST API Fundamentals
│   ├── Level 1 (LESSON): 📚 REST Basics [Challenge 1]
│   ├── Level 2 (PRACTICE): ⚡ Create GET Endpoint [Challenge 2]
│   └── Level 3 (PRACTICE): 🐛 Debug: Broken Route [Challenge 3]
│
├── Unit 2: Architecture & Refactoring
│   ├── Level 1 (LESSON): 🔧 Refactor Controller [Challenge 4]
│   ├── Level 2 (STORY): 📖 Story: JWT Authentication [Challenge 5]
│   └── Level 3 (PRACTICE): 🔐 Implement Auth [Challenge 6]
│
└── Unit 3: Security & Best Practices
    ├── Level 1 (PRACTICE): 🛡️ Code Review: Security [Challenge 7]
    ├── Level 2 (UNIT_REVIEW): 🎯 Backend Review [Challenge 8]
    └── Level 3 (XP_RAMP_UP): ⭐ XP Bonus (no challenge)
```

---

## Migration Phases

### Phase 1: Data Migration Script ⚠️ CRITICAL

**Priority**: HIGH
**Estimated time**: 4-6 hours

#### Objectives

1. Preserve all 28 existing challenges
2. Create 11 new Units with educational content
3. Create 37 new Levels with varied types
4. Create 39 new LevelChallenges connecting everything

#### Deliverables

- Script: `prisma/scripts/migrate-to-hierarchy.ts`
- Updated: `prisma/seed.ts`
- Documentation: Migration validation checklist

#### Validation Criteria

- ✅ All 28 challenge IDs preserved
- ✅ Legacy `moduleId` field maintained
- ✅ No user data lost
- ✅ Existing progress preserved

---

### Phase 2: Expand Seeds with Complete Units

**Priority**: HIGH
**Estimated time**: 6-8 hours

#### Unit Content Requirements

Each of the 12 units must include:

```typescript
interface UnitSeed {
  slug: string;
  title: string;
  description: string;
  learningObjectives: string[];      // 4-6 objectives
  estimatedMinutes: number;          // Realistic estimate
  theoryContent: string;             // 200-500 word markdown
  resources: {
    articles: Article[];
    videos: Video[];
  };
  requiredScore: number;             // Pass threshold (60-80)
  theme: {
    color: string;
    gradient: string[];
    icon: string;
  };
}
```

#### Example Unit Template

```typescript
{
  slug: 'rest-api-fundamentals',
  title: 'REST API Fundamentals',
  description: 'Master the core concepts of REST architecture',
  moduleId: backendModule.id,
  orderInModule: 1,
  iconImage: 'rest-api.png',
  theme: {
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
    icon: '🌐',
  },
  learningObjectives: [
    'Understand REST architectural principles',
    'Design resource-oriented APIs',
    'Implement proper HTTP methods (GET, POST, PUT, DELETE)',
    'Handle status codes correctly',
    'Apply REST constraints and best practices',
  ],
  estimatedMinutes: 120,
  theoryContent: `
# REST API Fundamentals

## What is REST?

REST (Representational State Transfer) is an architectural style for
designing networked applications. It relies on a stateless, client-server
protocol, almost always HTTP.

## Core Principles

1. **Client-Server Architecture**: Separation of concerns
2. **Stateless**: Each request contains all information needed
3. **Cacheable**: Responses must define cacheability
4. **Uniform Interface**: Consistent interaction patterns
5. **Layered System**: Architecture composed of layers

## HTTP Methods

- **GET**: Retrieve resource(s)
- **POST**: Create new resource
- **PUT**: Update/replace resource
- **PATCH**: Partial update
- **DELETE**: Remove resource

## Status Codes

- **2xx**: Success (200 OK, 201 Created)
- **3xx**: Redirection
- **4xx**: Client errors (400 Bad Request, 404 Not Found)
- **5xx**: Server errors (500 Internal Server Error)

## Best Practices

✅ Use nouns for resource names (not verbs)
✅ Implement proper error handling
✅ Version your API (v1, v2)
✅ Document with OpenAPI/Swagger
✅ Secure with authentication/authorization
  `.trim(),
  resources: {
    articles: [
      { title: 'REST API Design Best Practices', url: 'https://restfulapi.net' },
      { title: 'HTTP Methods Explained', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' },
    ],
    videos: [
      { title: 'REST APIs in 100 Seconds', duration: '2:00', url: '#' },
    ],
  },
  requiredScore: 70,
}
```

---

### Phase 3: Create Varied Levels

**Priority**: HIGH
**Estimated time**: 8-10 hours

#### Level Type Distribution

| Type | Count | Percentage | Description |
|------|-------|------------|-------------|
| **LESSON** | 11 | 30% | Guided tutorials with theory |
| **PRACTICE** | 15 | 40% | Free practice challenges |
| **STORY** | 2 | 5% | Interactive narratives |
| **UNIT_REVIEW** | 5 | 13% | Unit completion tests |
| **MATCH_MADNESS** | 1 | 3% | Fast-paced matching game |
| **RAPID_REVIEW** | 1 | 3% | Quick concept review |
| **XP_RAMP_UP** | 3 | 6% | Bonus XP challenges |
| **Total** | **38** | **100%** | |

#### Level Configuration Examples

##### LESSON (Tutorial)

```typescript
{
  type: 'LESSON',
  icon: '📚',
  title: 'Tutorial: Creating REST Endpoints',
  description: 'Step-by-step guide to building your first API',
  config: {
    showTheoryFirst: true,
    allowAI: true,
    trackDI: true,
    maxAIUsagePercent: 50,
    tutorialSteps: [
      { step: 1, instruction: 'Read the API requirements' },
      { step: 2, instruction: 'Define the route structure' },
      { step: 3, instruction: 'Implement the controller' },
      { step: 4, instruction: 'Add validation' },
      { step: 5, instruction: 'Test your endpoint' },
    ],
  },
  adaptive: false,
  blocking: true,
  optional: false,
  timeLimit: null,
  bonusXp: 25,
}
```

##### PRACTICE (Free Challenge)

```typescript
{
  type: 'PRACTICE',
  icon: '⚡',
  title: 'Practice: Build Authentication',
  description: 'Implement JWT authentication from scratch',
  config: {
    allowAI: true,
    trackDI: true,
    hints: true,
    autoCheckSolution: true,
  },
  adaptive: true,  // Adjusts difficulty based on performance
  blocking: true,
  optional: false,
  timeLimit: null,
  bonusXp: 50,
}
```

##### STORY (Narrative)

```typescript
{
  type: 'STORY',
  icon: '📖',
  title: 'Story: The Auth Crisis',
  description: 'An interactive security narrative',
  config: {
    allowAI: false,
    narrative: true,
    choices: true,
    characterDialogue: true,
    branches: [
      { id: 'secure', outcome: 'perfect' },
      { id: 'vulnerable', outcome: 'warning' },
    ],
  },
  adaptive: false,
  blocking: false,
  optional: true,
  timeLimit: null,
  bonusXp: 100,
}
```

##### UNIT_REVIEW (Assessment)

```typescript
{
  type: 'UNIT_REVIEW',
  icon: '🎯',
  title: 'Backend Unit Review',
  description: 'Comprehensive test of all backend concepts',
  config: {
    allowAI: false,
    reviewMode: true,
    mixedChallenges: true,
    requiredScore: 80,
    randomizeOrder: true,
  },
  adaptive: false,
  blocking: true,
  optional: false,
  timeLimit: 3600,  // 1 hour
  bonusXp: 200,
}
```

##### MATCH_MADNESS (Mini-Game)

```typescript
{
  type: 'MATCH_MADNESS',
  icon: '🎮',
  title: 'Match Madness: HTTP Status Codes',
  description: 'Fast-paced matching game',
  config: {
    allowAI: false,
    gameMode: true,
    matchingPairs: 10,
    speedBonus: true,
    pairs: [
      { left: '200', right: 'OK' },
      { left: '404', right: 'Not Found' },
      // ...
    ],
  },
  adaptive: false,
  blocking: false,
  optional: true,
  timeLimit: 120,  // 2 minutes
  bonusXp: 150,
}
```

##### RAPID_REVIEW (Quick Quiz)

```typescript
{
  type: 'RAPID_REVIEW',
  icon: '⚡',
  title: 'Rapid Review: REST Concepts',
  description: 'Quick review of key concepts',
  config: {
    allowAI: false,
    rapidMode: true,
    questionCount: 15,
    timePerQuestion: 30,
    multipleChoice: true,
  },
  adaptive: false,
  blocking: false,
  optional: true,
  timeLimit: 450,  // 7.5 minutes
  bonusXp: 100,
}
```

##### XP_RAMP_UP (Bonus)

```typescript
{
  type: 'XP_RAMP_UP',
  icon: '⭐',
  title: 'XP Bonus: Backend Master',
  description: 'Complete for massive XP boost',
  config: {
    allowAI: true,
    xpMultiplier: 3,
    perfectBonus: true,
    noTimeLimit: true,
  },
  adaptive: false,
  blocking: false,
  optional: true,
  timeLimit: null,
  bonusXp: 500,
}
```

---

### Phase 4: Connect Challenges to Levels

**Priority**: HIGH
**Estimated time**: 2-3 hours

#### LevelChallenge Junction Table

```typescript
model LevelChallenge {
  levelId      String
  level        Level     @relation(fields: [levelId])

  challengeId  String
  challenge    Challenge @relation(fields: [challengeId])

  orderInLevel Int       // Order within the level
  required     Boolean   @default(true)  // Optional or required

  @@id([levelId, challengeId])
}
```

#### Connection Strategy

1. **One-to-One**: Most levels have 1 challenge
2. **One-to-Many**: Review levels have multiple challenges
3. **Many-to-One**: Same challenge can appear in multiple levels (practice)
4. **Optional challenges**: Extra practice marked as `required: false`

#### Example Connections

```typescript
// Simple 1:1 connection
await prisma.levelChallenge.create({
  data: {
    levelId: lessonLevel.id,
    challengeId: challenge1.id,
    orderInLevel: 1,
    required: true,
  },
});

// Level with multiple challenges (review)
await prisma.levelChallenge.createMany({
  data: [
    {
      levelId: reviewLevel.id,
      challengeId: challenge6.id,
      orderInLevel: 1,
      required: true,
    },
    {
      levelId: reviewLevel.id,
      challengeId: challenge7.id,
      orderInLevel: 2,
      required: true,
    },
    {
      levelId: reviewLevel.id,
      challengeId: challenge8.id,
      orderInLevel: 3,
      required: false,  // Bonus challenge
    },
  ],
});
```

---

### Phase 5: Backend Use Cases

**Priority**: MEDIUM
**Estimated time**: 10-12 hours

#### Directory Structure

```
src/modules/
├── units/
│   ├── domain/
│   │   ├── entities/unit.entity.ts ✅
│   │   ├── repositories/unit.repository.interface.ts
│   │   └── value-objects/unit-theme.vo.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── list-units-by-module.use-case.ts
│   │       ├── get-unit-details.use-case.ts
│   │       ├── start-unit.use-case.ts
│   │       ├── complete-unit.use-case.ts
│   │       └── update-unit-progress.use-case.ts ✅
│   ├── infrastructure/
│   │   └── repositories/unit.repository.ts
│   └── presentation/
│       ├── controllers/unit.controller.ts
│       └── routes/unit.routes.ts
│
└── levels/
    ├── domain/
    │   ├── entities/level.entity.ts
    │   ├── repositories/level.repository.interface.ts
    │   └── enums/level-type.enum.ts
    ├── application/
    │   └── use-cases/
    │       ├── list-levels-by-unit.use-case.ts
    │       ├── get-level-details.use-case.ts
    │       ├── start-level.use-case.ts
    │       ├── complete-level.use-case.ts
    │       ├── unlock-next-level.use-case.ts
    │       └── update-level-progress.use-case.ts
    ├── infrastructure/
    │   └── repositories/level.repository.ts
    └── presentation/
        ├── controllers/level.controller.ts
        └── routes/level.routes.ts
```

#### Key Use Cases

##### Units

```typescript
// 1. List units with user progress
interface ListUnitsByModuleInput {
  moduleId: string;
  userId: string;
}

interface ListUnitsByModuleOutput {
  units: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    orderInModule: number;
    estimatedMinutes: number;
    totalLevels: number;
    progress?: {
      status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
      levelsCompleted: number;
      completionPercentage: number;
    };
  }>;
}

// 2. Get unit details with theory
interface GetUnitDetailsInput {
  unitId: string;
  userId: string;
}

interface GetUnitDetailsOutput {
  unit: {
    id: string;
    slug: string;
    title: string;
    description: string;
    learningObjectives: string[];
    estimatedMinutes: number;
    theoryContent: string;  // Markdown
    resources: {
      articles: Article[];
      videos: Video[];
    };
    levels: Level[];
    progress?: UserUnitProgress;
  };
}

// 3. Start unit
interface StartUnitInput {
  unitId: string;
  userId: string;
}

interface StartUnitOutput {
  progress: UserUnitProgress;
  firstLevel: Level;
}

// 4. Complete unit
interface CompleteUnitInput {
  unitId: string;
  userId: string;
}

interface CompleteUnitOutput {
  success: boolean;
  xpEarned: number;
  nextUnit?: Unit;
  achievements?: Achievement[];
}
```

##### Levels

```typescript
// 1. List levels with lock status
interface ListLevelsByUnitInput {
  unitId: string;
  userId: string;
}

interface ListLevelsByUnitOutput {
  levels: Array<{
    id: string;
    type: LevelType;
    icon: string;
    title?: string;
    description?: string;
    orderInUnit: number;
    isLocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
    progress?: UserLevelProgress;
  }>;
}

// 2. Get level details with challenges
interface GetLevelDetailsInput {
  levelId: string;
  userId: string;
}

interface GetLevelDetailsOutput {
  level: {
    id: string;
    type: LevelType;
    icon: string;
    title?: string;
    description?: string;
    config: LevelConfig;
    challenges: Challenge[];
    progress?: UserLevelProgress;
  };
}

// 3. Start level
interface StartLevelInput {
  levelId: string;
  userId: string;
}

interface StartLevelOutput {
  progress: UserLevelProgress;
  firstChallenge: Challenge;
}

// 4. Complete level
interface CompleteLevelInput {
  levelId: string;
  userId: string;
  score: number;
  metrics: {
    di: number;
    pr: number;
    cs: number;
  };
}

interface CompleteLevelOutput {
  success: boolean;
  xpEarned: number;
  isPerfect: boolean;  // Score >= 90
  nextLevel?: Level;
  achievements?: Achievement[];
}

// 5. Unlock next level
interface UnlockNextLevelInput {
  currentLevelId: string;
  userId: string;
}

interface UnlockNextLevelOutput {
  nextLevel?: Level;
  message: string;
}
```

---

### Phase 6: API Controllers & Routes

**Priority**: MEDIUM
**Estimated time**: 6-8 hours

#### Units API Specification

```typescript
// GET /api/modules/:moduleId/units
// List all units in a module with user progress
router.get('/modules/:moduleId/units',
  authenticate,
  unitController.listByModule
);

// GET /api/units/:unitId
// Get complete unit details (theory, objectives, levels)
router.get('/units/:unitId',
  authenticate,
  unitController.getDetails
);

// POST /api/units/:unitId/start
// Start a unit (create progress record)
router.post('/units/:unitId/start',
  authenticate,
  unitController.start
);

// POST /api/units/:unitId/complete
// Complete a unit (validate all levels done)
router.post('/units/:unitId/complete',
  authenticate,
  unitController.complete
);

// GET /api/units/:unitId/progress
// Get user progress for specific unit
router.get('/units/:unitId/progress',
  authenticate,
  unitController.getProgress
);
```

#### Levels API Specification

```typescript
// GET /api/units/:unitId/levels
// List all levels in a unit with lock status
router.get('/units/:unitId/levels',
  authenticate,
  levelController.listByUnit
);

// GET /api/levels/:levelId
// Get level details with challenges and config
router.get('/levels/:levelId',
  authenticate,
  levelController.getDetails
);

// POST /api/levels/:levelId/start
// Start a level (validate unlock, create progress)
router.post('/levels/:levelId/start',
  authenticate,
  levelController.start
);

// POST /api/levels/:levelId/complete
// Complete a level (calculate XP, unlock next)
router.post('/levels/:levelId/complete',
  authenticate,
  validateBody(CompleteLevelSchema),
  levelController.complete
);

// GET /api/levels/:levelId/progress
// Get user progress for specific level
router.get('/levels/:levelId/progress',
  authenticate,
  levelController.getProgress
);
```

#### Module API Updates

```typescript
// GET /api/modules/:moduleId/structure
// Get complete hierarchy: Module → Units → Levels → Challenges
router.get('/modules/:moduleId/structure',
  authenticate,
  moduleController.getStructure
);

// Response format
interface ModuleStructureResponse {
  module: {
    id: string;
    slug: string;
    title: string;
    description: string;
    units: Array<{
      id: string;
      slug: string;
      title: string;
      levels: Array<{
        id: string;
        type: LevelType;
        challenges: Array<{
          id: string;
          slug: string;
          title: string;
        }>;
      }>;
    }>;
  };
  userProgress: {
    moduleProgress: UserModuleProgress;
    unitProgress: UserUnitProgress[];
    levelProgress: UserLevelProgress[];
  };
}
```

---

### Phase 7: Frontend Updates

**Priority**: LOW
**Estimated time**: 16-20 hours

#### New Types/Interfaces

```typescript
// domain/entities/Unit.ts
export class Unit {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly description: string,
    public readonly learningObjectives: string[],
    public readonly estimatedMinutes: number,
    public readonly theoryContent: string,
    public readonly resources: UnitResources,
    public readonly levels: Level[],
    public readonly progress?: UserUnitProgress,
  ) {}
}

// domain/entities/Level.ts
export class Level {
  constructor(
    public readonly id: string,
    public readonly type: LevelType,
    public readonly icon: string,
    public readonly title: string | null,
    public readonly description: string | null,
    public readonly config: LevelConfig,
    public readonly challenges: Challenge[],
    public readonly progress: UserLevelProgress | null,
    public readonly isLocked: boolean,
    public readonly isCompleted: boolean,
  ) {}
}

// domain/enums/LevelType.ts
export enum LevelType {
  LESSON = 'LESSON',
  PRACTICE = 'PRACTICE',
  STORY = 'STORY',
  UNIT_REVIEW = 'UNIT_REVIEW',
  MATCH_MADNESS = 'MATCH_MADNESS',
  RAPID_REVIEW = 'RAPID_REVIEW',
  XP_RAMP_UP = 'XP_RAMP_UP',
}

// domain/value-objects/LevelStatus.ts
export enum LevelStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PERFECT = 'PERFECT',
}
```

#### New Components

```typescript
// presentation/components/UnitCard.tsx
interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
}

// presentation/components/UnitDetailPage.tsx
interface UnitDetailPageProps {
  unitId: string;
}

// presentation/components/LevelNode.tsx
// Visual node in the learning path (Duolingo-style)
interface LevelNodeProps {
  level: Level;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isPerfect: boolean;
  onClick: () => void;
}

// presentation/components/LevelPath.tsx
// Serpentine path connecting level nodes
interface LevelPathProps {
  levels: Level[];
  currentLevelId?: string;
}

// presentation/components/TheoryModal.tsx
// Modal displaying markdown theory content
interface TheoryModalProps {
  content: string;
  onClose: () => void;
}

// presentation/components/LevelTypeIcon.tsx
// Icon component with type-specific styling
interface LevelTypeIconProps {
  type: LevelType;
  size?: 'sm' | 'md' | 'lg';
}

// presentation/components/ProgressSidebar.tsx
// Sidebar showing current progress
interface ProgressSidebarProps {
  unitProgress: UserUnitProgress;
  levelProgress: UserLevelProgress;
}
```

#### Updated Routes

```typescript
// app/routes/
const routes = [
  // Module overview with units
  {
    path: '/modules/:moduleSlug',
    component: ModuleUnitsPage,
  },

  // Unit details with theory and levels
  {
    path: '/modules/:moduleSlug/units/:unitSlug',
    component: UnitDetailPage,
  },

  // Level preparation screen
  {
    path: '/units/:unitId/levels/:levelId',
    component: LevelPreparationPage,
  },

  // Challenge execution
  {
    path: '/levels/:levelId/challenges/:challengeId',
    component: ChallengeExecution,
  },
];
```

#### Services

```typescript
// infrastructure/services/UnitService.ts
export class UnitService {
  async listByModule(moduleId: string): Promise<Unit[]> {
    const response = await api.get(`/modules/${moduleId}/units`);
    return response.data.units.map(UnitMapper.toDomain);
  }

  async getDetails(unitId: string): Promise<Unit> {
    const response = await api.get(`/units/${unitId}`);
    return UnitMapper.toDomain(response.data.unit);
  }

  async start(unitId: string): Promise<UserUnitProgress> {
    const response = await api.post(`/units/${unitId}/start`);
    return ProgressMapper.toUnitProgress(response.data);
  }

  async complete(unitId: string): Promise<CompletionResult> {
    const response = await api.post(`/units/${unitId}/complete`);
    return response.data;
  }
}

// infrastructure/services/LevelService.ts
export class LevelService {
  async listByUnit(unitId: string): Promise<Level[]> {
    const response = await api.get(`/units/${unitId}/levels`);
    return response.data.levels.map(LevelMapper.toDomain);
  }

  async getDetails(levelId: string): Promise<Level> {
    const response = await api.get(`/levels/${levelId}`);
    return LevelMapper.toDomain(response.data.level);
  }

  async start(levelId: string): Promise<UserLevelProgress> {
    const response = await api.post(`/levels/${levelId}/start`);
    return ProgressMapper.toLevelProgress(response.data);
  }

  async complete(
    levelId: string,
    score: number
  ): Promise<CompletionResult> {
    const response = await api.post(`/levels/${levelId}/complete`, { score });
    return response.data;
  }
}
```

#### UI/UX Features (Duolingo-Inspired)

1. **Visual Learning Path**
   - Serpentine path connecting level nodes
   - Scroll vertically through the path
   - Visual feedback for completion

2. **Level Node States**
   ```
   🔒 Locked    → Gray, no interaction
   🟡 Available → Golden glow, clickable
   🔵 Current   → Blue, pulsing animation
   🟢 Completed → Green checkmark
   ⭐ Perfect   → Gold crown, particles
   ```

3. **Progress Indicators**
   - Unit completion bar
   - Level completion rings
   - XP gained animations
   - Streak tracker

4. **Celebrations**
   - Confetti on unit completion
   - Level-up animations
   - Achievement unlocks
   - Sound effects (optional)

5. **Theory Integration**
   - "Learn" button before levels
   - Inline hints during challenges
   - Review button after completion

---

## Implementation Details

### Unit Distribution Table

| Module | Units | Levels | Challenges |
|--------|-------|--------|------------|
| **Backend** | 3 | 9 | 8 |
| **Frontend** | 2 | 6 | 5 |
| **DevOps** | 2 | 6 | 5 |
| **Mobile** | 2 | 6 | 5 |
| **Data** | 2 | 6 | 5 |
| **TOTAL** | **12** | **38** | **28** |

### Detailed Unit Breakdown

#### Backend Module

**Unit 1: REST API Fundamentals**
- Level 1 (LESSON): REST Basics → Challenge 1 ✅
- Level 2 (PRACTICE): Create GET Endpoint → Challenge 2
- Level 3 (PRACTICE): Debug Broken Route → Challenge 3

**Unit 2: Architecture & Refactoring**
- Level 1 (LESSON): Refactor Controller → Challenge 4
- Level 2 (STORY): JWT Authentication Story → Challenge 5
- Level 3 (PRACTICE): Implement Auth → Challenge 6

**Unit 3: Security & Best Practices**
- Level 1 (PRACTICE): Code Review Security → Challenge 7
- Level 2 (UNIT_REVIEW): Backend Review → Challenge 8
- Level 3 (XP_RAMP_UP): Bonus XP (no challenge)

#### Frontend Module

**Unit 1: React Fundamentals**
- Level 1 (LESSON): React Basics → Challenge 9
- Level 2 (PRACTICE): Components → Challenge 10
- Level 3 (PRACTICE): Debug UI → Challenge 11

**Unit 2: UI/UX Advanced**
- Level 1 (PRACTICE): Responsiveness → Challenge 12
- Level 2 (UNIT_REVIEW): Frontend Review → Challenge 13
- Level 3 (MATCH_MADNESS): CSS Matching Game (new)

#### DevOps Module

**Unit 1: Containerization & CI/CD**
- Level 1 (LESSON): Docker Basics → Challenge 14
- Level 2 (PRACTICE): CI/CD Pipeline → Challenge 15
- Level 3 (PRACTICE): Debug Deploy → Challenge 16

**Unit 2: Advanced Orchestration**
- Level 1 (PRACTICE): Kubernetes → Challenge 17
- Level 2 (UNIT_REVIEW): DevOps Review → Challenge 18
- Level 3 (RAPID_REVIEW): Commands Quiz (new)

#### Mobile Module

**Unit 1: React Native Essentials**
- Level 1 (LESSON): React Native Intro → Challenge 19
- Level 2 (PRACTICE): Navigation → Challenge 20
- Level 3 (PRACTICE): Debug Performance → Challenge 21

**Unit 2: Performance & Architecture**
- Level 1 (PRACTICE): Refactor Components → Challenge 22
- Level 2 (UNIT_REVIEW): Mobile Review → Challenge 23
- Level 3 (XP_RAMP_UP): Bonus XP (new)

#### Data Module

**Unit 1: Advanced Database**
- Level 1 (LESSON): Advanced SQL → Challenge 24
- Level 2 (PRACTICE): ETL Pipeline → Challenge 25
- Level 3 (PRACTICE): Debug Slow Query → Challenge 26

**Unit 2: Data Engineering**
- Level 1 (PRACTICE): Data Warehouse → Challenge 27
- Level 2 (UNIT_REVIEW): Data Review → Challenge 28
- Level 3 (XP_RAMP_UP): Bonus XP (new)

---

## Migration Execution Checklist

### Phase 1: Data Migration
- [ ] Create migration script
- [ ] Test on local database
- [ ] Create database backup
- [ ] Execute migration
- [ ] Validate all data preserved
- [ ] Update seed.ts

### Phase 2: Unit Seeds
- [ ] Write learning objectives for 12 units
- [ ] Create theory content (markdown)
- [ ] Add resources (articles, videos)
- [ ] Configure themes and icons
- [ ] Test seed execution

### Phase 3: Level Seeds
- [ ] Create 11 LESSON levels
- [ ] Create 15 PRACTICE levels
- [ ] Create 2 STORY levels
- [ ] Create 5 UNIT_REVIEW levels
- [ ] Create mini-game levels (3)
- [ ] Configure level properties

### Phase 4: LevelChallenges
- [ ] Connect all 28 existing challenges
- [ ] Create optional challenge connections
- [ ] Define order within levels
- [ ] Test junction table queries

### Phase 5: Backend
- [ ] Implement Unit repository
- [ ] Implement Level repository
- [ ] Create 5 Unit use cases
- [ ] Create 6 Level use cases
- [ ] Write unit tests (80%+ coverage)

### Phase 6: API
- [ ] Implement Units controller
- [ ] Implement Levels controller
- [ ] Update Modules controller
- [ ] Create route handlers
- [ ] Write integration tests
- [ ] Update API documentation

### Phase 7: Frontend
- [ ] Create domain entities
- [ ] Implement services
- [ ] Build UI components (8)
- [ ] Update routing
- [ ] Implement Duolingo-style path
- [ ] Add animations and celebrations
- [ ] Write E2E tests

---

## Performance Considerations

### Database Optimization

```typescript
// Eager loading for unit structure
const units = await prisma.unit.findMany({
  where: { moduleId },
  include: {
    levels: {
      include: {
        challenges: {
          include: {
            challenge: true,
          },
        },
      },
      orderBy: { orderInUnit: 'asc' },
    },
    userProgress: {
      where: { userId },
    },
  },
  orderBy: { orderInModule: 'asc' },
});
```

### Caching Strategy

```typescript
// Redis cache for unit theory content
const CACHE_TTL = 3600; // 1 hour

async getUnitTheory(unitId: string): Promise<string> {
  const cached = await redis.get(`unit:${unitId}:theory`);
  if (cached) return cached;

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { theoryContent: true },
  });

  await redis.setex(
    `unit:${unitId}:theory`,
    CACHE_TTL,
    unit.theoryContent
  );

  return unit.theoryContent;
}
```

### Pagination

```typescript
// Paginate levels if needed (unlikely with ~6 per unit)
interface PaginationParams {
  page: number;
  limit: number;
}

async listLevels(
  unitId: string,
  pagination: PaginationParams
): Promise<PaginatedResponse<Level>> {
  const skip = (pagination.page - 1) * pagination.limit;

  const [levels, total] = await Promise.all([
    prisma.level.findMany({
      where: { unitId },
      skip,
      take: pagination.limit,
      orderBy: { orderInUnit: 'asc' },
    }),
    prisma.level.count({ where: { unitId } }),
  ]);

  return {
    data: levels,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
```

---

## Security Considerations

### Level Unlock Validation

```typescript
async validateLevelUnlock(levelId: string, userId: string): Promise<boolean> {
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: {
      unit: true,
    },
  });

  // Check if previous level is completed
  const previousLevel = await prisma.level.findFirst({
    where: {
      unitId: level.unitId,
      orderInUnit: level.orderInUnit - 1,
    },
  });

  if (previousLevel) {
    const progress = await prisma.userLevelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: previousLevel.id,
        },
      },
    });

    return progress?.status === 'COMPLETED';
  }

  return true; // First level is always unlocked
}
```

### Rate Limiting

```typescript
// Prevent rapid completion attempts
@RateLimit({ max: 10, windowMs: 60000 }) // 10 per minute
async completeLevel(
  @Param('levelId') levelId: string,
  @Body() dto: CompleteLevelDTO,
  @CurrentUser() user: User,
): Promise<CompletionResult> {
  // Implementation
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('CompleteLevelUseCase', () => {
  it('should complete level and unlock next', async () => {
    const result = await useCase.execute({
      levelId: 'level-1',
      userId: 'user-1',
      score: 85,
      metrics: { di: 30, pr: 85, cs: 8 },
    });

    expect(result.success).toBe(true);
    expect(result.xpEarned).toBeGreaterThan(0);
    expect(result.nextLevel).toBeDefined();
  });

  it('should mark as perfect if score >= 90', async () => {
    const result = await useCase.execute({
      levelId: 'level-1',
      userId: 'user-1',
      score: 95,
      metrics: { di: 20, pr: 95, cs: 9 },
    });

    expect(result.isPerfect).toBe(true);
  });

  it('should not unlock next if score below threshold', async () => {
    const result = await useCase.execute({
      levelId: 'level-1',
      userId: 'user-1',
      score: 45,
      metrics: { di: 80, pr: 45, cs: 5 },
    });

    expect(result.success).toBe(false);
    expect(result.nextLevel).toBeUndefined();
  });
});
```

### Integration Tests

```typescript
describe('Units API', () => {
  it('GET /api/modules/:moduleId/units should return units with progress', async () => {
    const response = await request(app)
      .get('/api/modules/backend-module-id/units')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.units).toHaveLength(3);
    expect(response.body.units[0]).toHaveProperty('progress');
  });

  it('POST /api/units/:unitId/start should create progress', async () => {
    const response = await request(app)
      .post('/api/units/unit-1/start')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.progress.status).toBe('IN_PROGRESS');
  });
});
```

### E2E Tests

```typescript
describe('Learning Flow', () => {
  it('should complete full unit progression', async () => {
    // 1. Start unit
    await page.goto('/modules/backend/units/rest-api');
    await page.click('[data-testid="start-unit-button"]');

    // 2. Complete first level
    await page.click('[data-testid="level-1-node"]');
    await page.click('[data-testid="start-level-button"]');
    // ... complete challenge ...
    await page.click('[data-testid="submit-button"]');

    // 3. Verify level unlocked
    await expect(page.locator('[data-testid="level-2-node"]'))
      .not.toHaveClass(/locked/);

    // 4. Complete all levels
    // ...

    // 5. Verify unit completed
    await expect(page.locator('[data-testid="unit-completion-modal"]'))
      .toBeVisible();
  });
});
```

---

## Rollback Plan

### If Migration Fails

1. **Restore database backup**
   ```bash
   psql -U postgres -d journey < backup_before_migration.sql
   ```

2. **Revert Prisma schema**
   ```bash
   git checkout HEAD~1 prisma/schema.prisma
   npx prisma migrate resolve --rolled-back MIGRATION_ID
   ```

3. **Clear generated Prisma client**
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

4. **Restart application**
   ```bash
   npm run dev
   ```

### Data Integrity Verification

```sql
-- Verify no challenges lost
SELECT COUNT(*) FROM "Challenge"; -- Should be 28

-- Verify all challenges have connections
SELECT c.id, c.title, COUNT(lc.levelId) as level_count
FROM "Challenge" c
LEFT JOIN "LevelChallenge" lc ON c.id = lc.challengeId
GROUP BY c.id, c.title
HAVING COUNT(lc.levelId) = 0; -- Should return 0 rows

-- Verify unit-level relationships
SELECT u.title, COUNT(l.id) as level_count
FROM "Unit" u
LEFT JOIN "Level" l ON u.id = l.unitId
GROUP BY u.id, u.title;
```

---

## Timeline & Resources

### Estimated Timeline

| Phase | Duration | Developer Days |
|-------|----------|----------------|
| Phase 1 | 4-6 hours | 0.5-1 day |
| Phase 2 | 6-8 hours | 1 day |
| Phase 3 | 8-10 hours | 1.5 days |
| Phase 4 | 2-3 hours | 0.5 day |
| Phase 5 | 10-12 hours | 1.5-2 days |
| Phase 6 | 6-8 hours | 1 day |
| Phase 7 | 16-20 hours | 2-3 days |
| **Total** | **52-67 hours** | **8-10 days** |

### Resources Required

- **1 Backend Developer**: Phases 1-6
- **1 Frontend Developer**: Phase 7
- **1 QA Engineer**: Testing across all phases
- **Database access**: Development & staging environments
- **Design assets**: Icons for 7 level types

---

## References

- [Duolingo Learning Path Redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- [Prisma Many-to-Many Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/many-to-many-relations)
- [Journey Database Schema](../../prisma/schema.prisma)
- [Journey Challenge System](./challenges-system.md)
- [Journey Progression System](./progression-system.md)

---

**Document Status**: Planning Phase Completed
**Last Updated**: 2025-11-07
**Version**: 1.0
**Maintained By**: Journey Development Team
