# Journey | Progression System

> Complete documentation of the module, XP, level, badge, and certification system

## Table of Contents

- [Overview](#overview)
- [Module System](#module-system)
- [XP and Level System](#xp-and-level-system)
- [Badge System](#badge-system)
- [Certification System](#certification-system)
- [Progression Flow](#progression-flow)

---

## Overview

The **Progression System** structures the user's learning journey through multiple layers of engagement and rewards:

```
┌─────────────────────────────────────────────────┐
│           PROGRESSION LAYERS                    │
├─────────────────────────────────────────────────┤
│  📚 Modules         │ Group challenges         │
│  ⭐ XP & Levels     │ Continuous progression   │
│  🏆 Badges          │ Specific achievements    │
│  🎓 Certifications  │ Competence validation    │
└─────────────────────────────────────────────────┘
```

**Philosophy:**

Gamification is used as an **engagement mechanism**, but rewards are always tied to **objective governance metrics** (DI, PR, CS).

---

## Module System

### Module Structure

Modules group related challenges in a pedagogical sequence:

```typescript
interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;

  // Visual
  iconImage: string;
  theme: {
    primaryColor: string;
    gradient: string;
  };

  // Ordering
  orderIndex: number;  // Unique: determines display order

  // Prerequisites
  requiredXp: number;       // Default: 0
  requiredLevel: number;    // Default: 1
  previousModuleId?: string; // Previous module (optional)

  // State
  isLocked: boolean;        // Default: true
  isNew: boolean;          // "New" badge in UI

  // Relations
  challenges: Challenge[];
  userProgress: UserModuleProgress[];
}
```

### Module States

```typescript
enum ModuleStatus {
  LOCKED = 'LOCKED',           // 🔒 Not unlocked
  AVAILABLE = 'AVAILABLE',     // 🔓 Unlocked, not started
  IN_PROGRESS = 'IN_PROGRESS', // 🔄 In progress
  COMPLETED = 'COMPLETED'      // ✅ Complete
}
```

### State Machine

```
┌────────┐
│ LOCKED │ (Initial state)
└────┬───┘
     │ when: userXp >= requiredXp && userLevel >= requiredLevel
     ↓
┌────────────┐
│ AVAILABLE  │ (Unlocked, not started)
└────┬───────┘
     │ when: user starts first challenge
     ↓
┌──────────────┐
│ IN_PROGRESS  │ (User completing challenges)
└────┬─────────┘
     │ when: challengesCompleted === totalChallenges
     ↓
┌───────────┐
│ COMPLETED │ (100% of challenges complete)
└───────────┘
```

### UserModuleProgress

Tracks individual user progress in each module:

```typescript
interface UserModuleProgress {
  userId: string;
  moduleId: string;
  status: ModuleStatus;

  // Progress
  challengesCompleted: number;
  totalChallenges: number;        // Cached
  completionPercentage: number;   // Calculated

  // Performance
  totalXpEarned: number;
  averageScore: number;

  // Timestamps
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
}
```

### Module Unlocking

```typescript
class Module {
  /**
   * Checks if the module can be unlocked by the user
   */
  canBeUnlockedBy(userXp: number, userLevel: number): boolean {
    return userXp >= this.requiredXp && userLevel >= this.requiredLevel;
  }
}

// Usage
const module = await repository.findById('mod-123');
const user = await userRepository.findById('user-456');

if (module.canBeUnlockedBy(user.totalXp, user.level)) {
  await progressRepository.create({
    userId: user.id,
    moduleId: module.id,
    status: 'AVAILABLE',
    challengesCompleted: 0,
    totalChallenges: module.challenges.length
  });
}
```

### Module Progression

```typescript
class UpdateModuleProgressUseCase {
  async execute(userId: string, moduleId: string, challengeCompleted: boolean) {
    const progress = await this.repository.findProgress(userId, moduleId);

    if (challengeCompleted) {
      progress.challengesCompleted++;
      progress.completionPercentage =
        (progress.challengesCompleted / progress.totalChallenges) * 100;

      // Auto-complete if 100%
      if (progress.completionPercentage === 100) {
        progress.status = 'COMPLETED';
        progress.completedAt = new Date();

        // Unlock next module (if exists)
        await this.unlockNextModule(userId, moduleId);
      } else if (progress.status !== 'IN_PROGRESS') {
        progress.status = 'IN_PROGRESS';
        progress.startedAt = new Date();
      }

      progress.lastAccessedAt = new Date();
      await this.repository.update(progress);
    }
  }
}
```

---

## XP and Level System

### Level Table

| Level | Required XP | Title | Unlocked Perks |
|-------|---------------|--------|---------------------|
| **1** | 0 | Beginner | Basic challenges |
| **2** | 100 | Apprentice | Free hints |
| **3** | 300 | Practitioner | Medium challenges |
| **4** | 600 | Competent | Code analysis |
| **5** | 1,000 | Proficient | Hard challenges, Exclusive badge |
| **6** | 1,500 | Advanced | Streak freeze |
| **7** | 2,500 | Specialist | Expert challenges |
| **8** | 4,000 | Master | Bronze certification |
| **9** | 6,000 | Grand Master | Silver certification |
| **10** | 10,000 | Legend | Gold certification, Special title |

### XP Calculation

The XP system uses **multiple multipliers** based on performance:

```typescript
finalXP = baseXP
  × difficultyMultiplier
  × performanceBonus
  × firstTryBonus
  × independenceBonus
  × streakBonus
```

#### 1. Difficulty Multiplier

```typescript
const difficultyMultipliers = {
  EASY: 1.0,
  MEDIUM: 1.5,
  HARD: 2.0,
  EXPERT: 3.0
};
```

#### 2. Performance Bonus

Based on the three metrics (DI, PR, CS):

```typescript
function calculatePerformanceBonus(di: number, pr: number, cs: number): number {
  // Weighted score
  const weightedScore =
    (100 - di) * 0.4 +  // Independence (40%)
    pr * 0.4 +           // Pass rate (40%)
    cs * 10 * 0.2;       // Checklist (20%)

  if (weightedScore >= 90) return 1.5;
  if (weightedScore >= 80) return 1.3;
  if (weightedScore >= 70) return 1.15;
  if (weightedScore >= 60) return 1.0;
  return 0.85;
}
```

#### 3. First Try Bonus

```typescript
function calculateFirstTryBonus(attemptNumber: number): number {
  return attemptNumber === 1 ? 1.25 : 1.0;
}
```

#### 4. Independence Bonus

Based on DI (Dependency Index):

```typescript
function calculateIndependenceBonus(di: number): number {
  if (di < 30) return 1.5;   // High independence
  if (di < 50) return 1.25;  // Good independence
  if (di < 70) return 1.0;   // Moderate
  return 0.75;               // High dependency (penalty)
}
```

#### 5. Streak Bonus

Based on consecutive days of activity:

```typescript
function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 14) return 1.3;
  if (streakDays >= 7) return 1.15;
  if (streakDays >= 3) return 1.05;
  return 1.0;
}
```

### Complete Calculation Example

**Scenario: Advanced Developer**

```typescript
const challenge = {
  difficulty: 'HARD',
  baseXp: 150
};

const metrics = {
  di: 25,  // Low AI dependency
  pr: 85,  // High pass rate
  cs: 8.5  // Excellent governance
};

const context = {
  attemptNumber: 1,  // First attempt
  streakDays: 15     // 15 consecutive days
};

// Step-by-step calculation
difficultyMultiplier = 2.0 (HARD)

weightedScore = (100-25)*0.4 + 85*0.4 + 8.5*10*0.2 = 81
performanceBonus = 1.3 (score >= 80)

firstTryBonus = 1.25 (first attempt)

independenceBonus = 1.5 (DI < 30%)

streakBonus = 1.3 (streak >= 14 days)

// Final
finalXP = 150 × 2.0 × 1.3 × 1.25 × 1.5 × 1.3
finalXP = 950 XP ✨
```

### XP Transaction Log

All XP transactions are logged for auditing:

```typescript
interface XPTransaction {
  id: string;
  userId: string;
  amount: number;      // Can be negative (penalties)
  reason: string;
  source: XPSource;
  sourceId?: string;   // Challenge/badge/etc ID

  // Audit
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

enum XPSource {
  CHALLENGE = 'CHALLENGE',
  BADGE = 'BADGE',
  STREAK = 'STREAK',
  BONUS = 'BONUS',
  ACHIEVEMENT = 'ACHIEVEMENT'
}
```

---

## Badge System

### Badge Structure

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

  // Reward
  xpReward?: number;

  // Requirements
  requirement: BadgeRequirement;

  // UI
  visible: boolean;  // If false, badge is "secret"
}
```

### Requirement Types

#### 1. XP Threshold

```typescript
{
  type: 'xp',
  threshold: 1000  // Reach 1000 XP
}
```

#### 2. Level Threshold

```typescript
{
  type: 'level',
  threshold: 5  // Reach level 5
}
```

#### 3. Challenge Count

```typescript
{
  type: 'challenges',
  challengeCount: 10,
  category: 'BACKEND'  // Optional: filter by category
}
```

#### 4. Streak Days

```typescript
{
  type: 'streak',
  streakDays: 7  // 7 consecutive days
}
```

#### 5. Metrics Achievement

```typescript
{
  type: 'metrics',
  metricType: 'DI',
  threshold: 30,
  comparison: 'lte'  // less than or equal
}

// Example: Badge for average DI < 30%
{
  type: 'metrics',
  metricType: 'DI',
  threshold: 30,
  comparison: 'lte'
}

// Example: Badge for average PR > 90%
{
  type: 'metrics',
  metricType: 'PR',
  threshold: 90,
  comparison: 'gte'
}
```

#### 6. Special Conditions

```typescript
{
  type: 'special',
  customCondition: 'first-xp'  // Custom logic
}
```

### Badge Examples

```typescript
const badges: Badge[] = [
  {
    id: 'badge-first-challenge',
    name: 'First Steps',
    description: 'Complete your first challenge',
    icon: '🎯',
    rarity: 'COMMON',
    xpReward: 50,
    requirement: {
      type: 'challenges',
      challengeCount: 1
    },
    visible: true
  },
  {
    id: 'badge-independent-dev',
    name: 'Independent Developer',
    description: 'Maintain average DI below 30%',
    icon: '🦸',
    rarity: 'EPIC',
    xpReward: 500,
    requirement: {
      type: 'metrics',
      metricType: 'DI',
      threshold: 30,
      comparison: 'lte'
    },
    visible: true
  },
  {
    id: 'badge-perfectionist',
    name: 'Perfectionist',
    description: 'Achieve 100% on 5 challenges',
    icon: '💎',
    rarity: 'LEGENDARY',
    xpReward: 1000,
    requirement: {
      type: 'special',
      customCondition: 'perfect-score-5x'
    },
    visible: false  // Secret badge
  },
  {
    id: 'badge-week-streak',
    name: 'Consistent',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'RARE',
    xpReward: 200,
    requirement: {
      type: 'streak',
      streakDays: 7
    },
    visible: true
  }
];
```

### Badge Evaluation

```typescript
class BadgeEvaluationService {
  async evaluateBadges(userId: string): Promise<BadgeUnlockResult> {
    // 1. Fetch user context
    const context = await this.buildEvaluationContext(userId);

    // 2. Fetch all badges
    const allBadges = await this.badgeRepository.findAll();

    // 3. Fetch already unlocked badges
    const userBadges = await this.userBadgeRepository.findByUser(userId);
    const unlockedIds = userBadges.map(ub => ub.badgeId);

    // 4. Evaluate each unlocked badge
    const newlyUnlocked: Badge[] = [];
    const progressMap = new Map<string, number>();

    for (const badge of allBadges) {
      if (unlockedIds.includes(badge.id)) continue;

      const result = await this.strategy.evaluate(
        badge.requirement,
        context
      );

      if (result.unlocked) {
        newlyUnlocked.push(badge);

        // Create unlocked badge record
        await this.userBadgeRepository.create({
          userId,
          badgeId: badge.id,
          unlockedAt: new Date()
        });

        // Award XP reward (if any)
        if (badge.xpReward) {
          await this.xpService.addXp(userId, badge.xpReward, {
            reason: `Badge unlocked: ${badge.name}`,
            source: 'BADGE',
            sourceId: badge.id
          });
        }
      } else {
        progressMap.set(badge.id, result.progress);
      }
    }

    return {
      unlocked: newlyUnlocked,
      progress: progressMap
    };
  }

  private async buildEvaluationContext(userId: string): Promise<BadgeEvaluationContext> {
    const user = await this.userRepository.findById(userId);
    const attempts = await this.attemptRepository.findByUser(userId);
    const metrics = await this.metricsRepository.getUserAverages(userId);
    const streak = await this.streakRepository.getCurrentStreak(userId);

    return {
      userId,
      totalXP: user.totalXp,
      currentLevel: user.level,
      currentStreak: streak.days,
      challengesCompleted: attempts.filter(a => a.status === 'COMPLETED').length,
      metrics: {
        averageDI: metrics.averageDI,
        averagePR: metrics.averagePR,
        averageCS: metrics.averageCS
      }
    };
  }
}
```

---

## Certification System

### Certification Structure

```typescript
interface Certificate {
  id: string;
  userId: string;
  code: string;  // Format: CRAID-XXXX-XXXX
  level: 'FOUNDATION' | 'PROFESSIONAL' | 'EXPERT';

  // Scores
  theoryScore: number;      // 0-100 (weight: 30%)
  practicalScore: number;   // 0-100 (weight: 50%)
  portfolioScore: number;   // 0-100 (weight: 20%)
  finalScore: number;       // Weighted average
  grade: string;            // A+, A, B+, B, C+, C, D, F

  // Aggregated metrics
  challengesCompleted: number;
  totalHours: number;
  averageDI: number;
  averagePR: number;
  averageCS: number;

  // Demonstrated skills
  skills: string[];

  // Verification
  verificationHash: string;  // SHA256(code + JWT_SECRET)
  qrCode: string;           // URL for public verification

  // Validity
  issuedAt: Date;
  expiresAt: Date;  // 2 years after issuance
}
```

### Certification Levels

| Level | Minimum Requirements | Title |
|-------|-------------------|--------|
| **FOUNDATION** | Level 8, 20 challenges | Foundation Developer |
| **PROFESSIONAL** | Level 9, 50 challenges | Professional Developer |
| **EXPERT** | Level 10, 100 challenges | Expert Architect |

### Final Score Calculation

```typescript
function calculateFinalScore(cert: Certificate): number {
  const score =
    cert.theoryScore * 0.3 +      // Theory: 30%
    cert.practicalScore * 0.5 +   // Practice: 50%
    cert.portfolioScore * 0.2;    // Portfolio: 20%

  return Math.round(score * 100) / 100;
}
```

### Grading System

```typescript
function calculateGrade(finalScore: number): string {
  if (finalScore >= 90) return 'A+';
  if (finalScore >= 85) return 'A';
  if (finalScore >= 80) return 'B+';
  if (finalScore >= 75) return 'B';
  if (finalScore >= 70) return 'C+';
  if (finalScore >= 65) return 'C';
  if (finalScore >= 60) return 'D';
  return 'F';  // Failed
}
```

### Code Generation

```typescript
function generateCertificateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = randomString(4, chars);
  const part2 = randomString(4, chars);

  return `CRAID-${part1}-${part2}`;
}

// Example: CRAID-A8F2-9K3L
```

### Verification

```typescript
class Certificate {
  /**
   * Generates verification hash
   */
  generateVerificationHash(secret: string): string {
    return createHash('sha256')
      .update(this.code + secret)
      .digest('hex');
  }

  /**
   * Verifies authenticity
   */
  static verify(code: string, hash: string, secret: string): boolean {
    const expectedHash = createHash('sha256')
      .update(code + secret)
      .digest('hex');

    return hash === expectedHash;
  }

  /**
   * Checks if valid (not expired)
   */
  isValid(): boolean {
    return new Date() < this.expiresAt;
  }

  /**
   * Checks if passing (score >= 60)
   */
  isPassing(): boolean {
    return this.finalScore >= 60;
  }
}
```

### QR Code for Verification

```typescript
const qrCodeUrl = `https://journey-platform.com/verify/${certificate.code}`;

// Public verification page shows:
// - Status (valid/expired)
// - Certification level
// - Final grade
// - Issuance/expiration date
// - Demonstrated skills
// (WITHOUT exposing user's personal data)
```

---

## Progression Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────┐
│  1. USER CREATES ACCOUNT                             │
│     → Level 1, 0 XP                                 │
│     → Module 1 unlocked (requiredXp: 0)             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  2. COMPLETES FIRST CHALLENGE                        │
│     → Earns XP (with multipliers)                   │
│     → "First Steps" badge unlocked                  │
│     → UserModuleProgress updated                    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  3. REACHES 100 XP                                   │
│     → Level up! Now Level 2 (Apprentice)            │
│     → Perk unlocked: Free hints                     │
│     → Level up notification                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  4. COMPLETES MODULE 1 (100%)                        │
│     → Module status → COMPLETED                     │
│     → Module 2 automatically unlocked               │
│     → "Completionist" badge unlocked                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  5. MAINTAINS 7-DAY STREAK                           │
│     → "Consistent" badge unlocked                   │
│     → Streak bonus active (XP +15%)                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  6. REACHES LEVEL 8 + 20 CHALLENGES                  │
│     → Eligible for FOUNDATION certification         │
│     → Notification: "You can get certified!"        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  7. REQUESTS CERTIFICATION                           │
│     → System validates requirements                 │
│     → Calculates scores (theory, practice, portfolio)│
│     → Generates certificate with unique code        │
│     → QR Code for verification                      │
└─────────────────────────────────────────────────────┘
```

### File References

```
src/modules/
├── modules/              # Module progression
│   └── domain/
│       └── entities/
│           └── module.entity.ts
├── gamification/         # XP, badges, levels
│   └── domain/
│       └── services/
│           ├── xp-calculator.service.ts
│           ├── badge.service.ts
│           └── level-progression.service.ts
└── certificates/         # Certification system
    └── domain/
        └── entities/
            └── certificate.entity.ts
```

---

<div align="center">

**[← Metrics System](./metrics-system.md)** | **[Next: Creation Guide →](../guides/creating-challenges.md)**

</div>
