# Journey | Business Rules

> Consolidated reference for all business rules, validations and system constraints

## Index

- [Metrics](#metrics)
- [Challenges](#challenges)
- [Modules](#modules)
- [XP and Levels](#xp-and-levels)
- [Badges](#badges)
- [Certifications](#certifications)
- [Validations and Constraints](#validations-and-constraints)

---

## Metrics

### Dependency Index (DI)

**Formula:**
```
DI = (linesFromAI / totalLines) × 100
```

**Rules:**
- ✅ Range: 0-100%
- ✅ Lower value = better (more independence)
- ✅ Rounded to 2 decimal places
- ✅ Default: 0 if `totalLines === 0`
- ❌ `linesFromAI` cannot exceed `totalLines`

**Thresholds:**
| DI | Classification | Action |
|----|---------------|------|
| 0-30% | 🟢 Independent | Excellent |
| 30-50% | 🟡 Moderate | Attention |
| 50-70% | 🟠 High | Reduce dependency |
| 70-100% | 🔴 Critical | Intervention |

**Warnings:**
- `DI > 80%`: Log critical warning
- `DI > 60%`: Log high dependency warning

---

### Pass Rate (PR)

**Formula:**
```
PR = (testsPassed / testsTotal) × 100
```

**Rules:**
- ✅ Range: 0-100%
- ✅ Higher value = better (more quality)
- ✅ Rounded to 2 decimal places
- ✅ Default: 100 if `testsTotal === 0`
- ❌ `testsPassed` cannot exceed `testsTotal`

**Thresholds:**
| PR | Classification | Quality |
|----|---------------|-----------|
| 90-100% | 🟢 Excellent | First-try success |
| 70-89% | 🟡 Good | Minimal debugging |
| 50-69% | 🟠 Moderate | Significant rework |
| 0-49% | 🔴 Low | Critical review |

**Warnings:**
- `PR < 30%`: Log very low pass rate
- `PR < 50%`: Log low pass rate

---

### Checklist Score (CS)

**Formula:**
```
CS = (checkedWeight / totalWeight) × 10
```

**Rules:**
- ✅ Range: 0-10
- ✅ Higher value = better (more governance)
- ✅ Rounded to 2 decimal places
- ✅ Default: 10 if `checklistItems.length === 0`
- ✅ Default: 10 if `totalWeight === 0`
- ❌ `weight` for each item: 0-10
- ❌ Each item must have valid `id` and `label`

**Thresholds:**
| CS | Classification | Status |
|----|---------------|--------|
| 8-10 | 🟢 Excellent | Complete governance |
| 7-8 | 🟡 Good | Minor adjustments |
| 5-7 | 🟠 Moderate | Significant gaps |
| 0-5 | 🔴 Critical | Complete review |

**Warnings:**
- `CS < 3`: Log critical validation gaps
- `CS < 5`: Log significant validation gaps

---

### Risk Assessment

**Risk Score Formula:**
```
riskScore = 0

// Dependency Index
if (DI > 80) riskScore += 40
else if (DI > 60) riskScore += 25
else if (DI > 40) riskScore += 10

// Pass Rate
if (PR < 30) riskScore += 30
else if (PR < 50) riskScore += 20
else if (PR < 70) riskScore += 10

// Checklist Score
if (CS < 3) riskScore += 30
else if (CS < 5) riskScore += 20
else if (CS < 7) riskScore += 10
```

**Risk Levels:**
| Score | Level | Action |
|-------|-------|------|
| 70+ | 🔴 CRITICAL | Immediate intervention |
| 50-69 | 🟠 HIGH | Action required |
| 30-49 | 🟡 MEDIUM | Attention needed |
| 0-29 | 🟢 LOW | Good practices |

---

### Target Metrics by Difficulty

| Difficulty | maxDI | minPR | minCS |
|-------------|-------|-------|-------|
| EASY | 50% | 60% | 7.0 |
| MEDIUM | 45% | 65% | 7.5 |
| HARD | 40% | 70% | 8.0 |
| EXPERT | 35% | 75% | 8.5 |

---

## Challenges

### Challenge Attempt States

```
IN_PROGRESS → COMPLETED
            ↓
         ABANDONED
```

**Transition Rules:**
- `IN_PROGRESS`: Initial state when starting challenge
- `COMPLETED`: When `score >= 60` and successful submission
- `ABANDONED`: When user explicitly abandons

### Scoring

**Formula:**
```typescript
score = scoreDI + scorePR + scoreCS

// Each component worth ~33.33%
scoreDI = di <= target.maxDI ? 33.33 : scaled
scorePR = pr >= target.minPR ? 33.33 : scaled
scoreCS = cs >= target.minCS ? 33.34 : scaled

// Final score: 0-100
```

**Rules:**
- ✅ Score >= 60: Challenge completed
- ✅ Score < 60: Must try again
- ✅ Score rounded to integer

### Stars System

| Score | Stars | Description |
|-------|----------|-----------|
| 90-100 | ⭐⭐⭐ | Gold |
| 70-89 | ⭐⭐ | Silver |
| 50-69 | ⭐ | Bronze |
| 0-49 | - | Failed |

### Challenge Unlocking

**Within a Module:**

1. **If module is LOCKED**: All challenges locked
2. **First challenge (orderInModule = 0)**: Always available when module unlocked
3. **Other challenges**: Require previous challenge COMPLETED
4. **Difficulty gate**: User must have minimum level:
   - EASY: Level 1+
   - MEDIUM: Level 3+
   - HARD: Level 5+
   - EXPERT: Level 7+

**Constraint:** Cannot skip challenges in sequence

---

## Modules

### Module States

```
LOCKED → AVAILABLE → IN_PROGRESS → COMPLETED
```

**Transition Rules:**

1. **LOCKED → AVAILABLE:**
   - `userXp >= module.requiredXp` AND
   - `userLevel >= module.requiredLevel`

2. **AVAILABLE → IN_PROGRESS:**
   - User starts first challenge in module

3. **IN_PROGRESS → COMPLETED:**
   - `challengesCompleted === totalChallenges`

**Constraints:**
- Module cannot go back to LOCKED after unlocked
- `completionPercentage` automatically calculated: `(challengesCompleted / totalChallenges) × 100`

### UserModuleProgress

**Rules:**
- ✅ Unique per `[userId, moduleId]`
- ✅ `totalChallenges` cached at creation time
- ✅ `averageScore` calculated incrementally
- ✅ `totalXpEarned` accumulated (sum)
- ✅ `startedAt` set on first attempt
- ✅ `completedAt` set when 100%
- ✅ `lastAccessedAt` updated on each access

---

## XP and Levels

### Level Table

| Level | XP Req. | Title | Perks |
|-------|---------|--------|-------|
| 1 | 0 | Beginner | - |
| 2 | 100 | Apprentice | Free hints |
| 3 | 300 | Practitioner | Medium challenges |
| 4 | 600 | Competent | - |
| 5 | 1,000 | Proficient | Hard challenges |
| 6 | 1,500 | Advanced | Streak freeze |
| 7 | 2,500 | Expert | Expert challenges |
| 8 | 4,000 | Master | Bronze cert. |
| 9 | 6,000 | Grandmaster | Silver cert. |
| 10 | 10,000 | Legend | Gold cert. |

**Rules:**
- ✅ Level calculated automatically based on totalXp
- ✅ Level never decreases (even if XP is removed)
- ✅ XP can be negative (penalties)

### XP Calculation

**Formula:**
```
finalXP = baseXP
  × difficultyMultiplier
  × performanceBonus
  × firstTryBonus
  × independenceBonus
  × streakBonus
```

**Multipliers:**

1. **Difficulty:**
   - EASY: 1.0×
   - MEDIUM: 1.5×
   - HARD: 2.0×
   - EXPERT: 3.0×

2. **Performance** (based on weighted score):
   ```
   weightedScore = (100-DI)*0.4 + PR*0.4 + CS*10*0.2

   ≥90: 1.5×
   ≥80: 1.3×
   ≥70: 1.15×
   ≥60: 1.0×
   <60: 0.85×
   ```

3. **First Try:**
   - 1st attempt: 1.25×
   - 2+ attempts: 1.0×

4. **Independence** (based on DI):
   - <30%: 1.5×
   - 30-50%: 1.25×
   - 50-70%: 1.0×
   - >70%: 0.75× (penalty)

5. **Streak:**
   - ≥30 days: 1.5×
   - ≥14 days: 1.3×
   - ≥7 days: 1.15×
   - ≥3 days: 1.05×
   - <3 days: 1.0×

**Constraint:** XP only awarded after challenge COMPLETED

### XP Transaction

**Rules:**
- ✅ All transactions are recorded (audit trail)
- ✅ Transactions are immutable (append-only)
- ✅ `amount` can be negative
- ✅ `balanceBefore` and `balanceAfter` always recorded
- ✅ `source` required (CHALLENGE, BADGE, STREAK, etc.)

---

## Badges

### Rarities

| Rarity | Description | Typical XP Reward |
|--------|-----------|------------------|
| COMMON | Easy to get | 50-100 |
| RARE | Requires effort | 100-300 |
| EPIC | Challenging | 300-700 |
| LEGENDARY | Very rare | 700-1500 |

### Requirements

**Supported types:**

1. **XP Threshold:** `{ type: 'xp', threshold: 1000 }`
2. **Level Threshold:** `{ type: 'level', threshold: 5 }`
3. **Challenge Count:** `{ type: 'challenges', challengeCount: 10, category?: 'BACKEND' }`
4. **Streak Days:** `{ type: 'streak', streakDays: 7 }`
5. **Metrics Achievement:** `{ type: 'metrics', metricType: 'DI', threshold: 30, comparison: 'lte' }`
6. **Special:** `{ type: 'special', customCondition: 'first-xp' }`

### Evaluation

**Rules:**
- ✅ Badges evaluated after:
  - Completing challenge
  - XP/level change
  - Streak update
- ✅ Badge can only be unlocked once per user
- ✅ Progress calculated for locked badges (0-100%)
- ✅ XP reward awarded at unlock time

**Constraint:** Badges with `visible: false` are secret (not shown before unlock)

---

## Certifications

### Certification Levels

| Level | Min Level | Min Challenges | Title |
|-------|------------|----------------|--------|
| FOUNDATION | 8 | 20 | Foundation Developer |
| PROFESSIONAL | 9 | 50 | Professional Developer |
| EXPERT | 10 | 100 | Expert Architect |

### Final Score

**Formula:**
```
finalScore = theoryScore × 0.3
           + practicalScore × 0.5
           + portfolioScore × 0.2
```

**Components:**
- **Theory (30%)**: Theoretical knowledge
- **Practical (50%)**: Challenge performance
- **Portfolio (20%)**: Submitted projects

### Grades

| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A+ | Exceptional |
| 85-89 | A | Excellent |
| 80-84 | B+ | Very good |
| 75-79 | B | Good |
| 70-74 | C+ | Adequate |
| 65-69 | C | Sufficient |
| 60-64 | D | Minimum |
| 0-59 | F | Failed |

**Rules:**
- ✅ Score >= 60: Certification granted
- ✅ Validity: 2 years
- ✅ Unique code: Format `CRAID-XXXX-XXXX`
- ✅ Verification: SHA256(code + JWT_SECRET)

### Verification

**Rules:**
- ✅ Public QR Code for verification
- ✅ Public page shows: status, level, grade, validity
- ❌ User personal data NOT exposed
- ✅ Verification hash prevents forgery

**Constraint:** Certifications cannot be revoked, only expire

---

## Validations and Constraints

### Metrics Data Validations

**In TrackMetricsUseCase:**

1. **Ownership:**
   - Attempt must belong to authenticated userId
   - Attempt status must be 'IN_PROGRESS'

2. **Lines Consistency:**
   - `linesFromAI <= totalLines`

3. **Tests Consistency:**
   - `testsPassed <= testsTotal`

4. **Time Consistency:**
   - `aiUsageTime + manualCodingTime + debugTime <= sessionTime`

5. **Checklist Items:**
   - Each item must have `id` and `label`
   - `weight` must be between 0-10

**Exceptions:**
- `MetricsDataInconsistentError`: When validation fails
- `InvalidAttemptError`: When attempt doesn't belong to user

### Database Constraints

**Unique Constraints:**
- `Module`: `slug`, `orderIndex`
- `Challenge`: `slug`, `[moduleId, orderInModule]`
- `UserModuleProgress`: `[userId, moduleId]`
- `Certificate`: `code`
- `ValidationRule`: `[challengeId, ruleId]`

**Indexes:**
- `MetricSnapshot`: `[attemptId]`, `[userId]`
- `ValidationLog`: `[userId]`, `[challengeId]`, `[attemptId]`
- `TrapDetection`: `[attemptId]`

### Cascade Rules

**When User is deleted:**
- ✅ Cascade: Attempts, Progress, Badges, Metrics

**When Challenge is deleted:**
- ✅ Cascade: Attempts, ValidationLogs
- ⚠️ Keep: MetricSnapshots (orphaned only)

**When Module is deleted:**
- ✅ Cascade: Challenges, Progress

---

## Consolidated Business Rules

### Progression

1. **Challenge:** Locked → Available → In Progress → Completed
2. **Module:** Locked → Available → In Progress → Completed
3. **Certification:** Eligible → Requested → Issued

### Unlock Gates

| Item | Requirement |
|------|-----------|
| **Module** | userXp >= requiredXp AND userLevel >= requiredLevel |
| **Challenge (1st)** | Module unlocked |
| **Challenge (N+1)** | Challenge N completed |
| **Badge** | Requirement.evaluate() === true |
| **Certification** | Level + Challenges + Minimum metrics |

### Scoring and Rewards

| Event | Score Req. | Rewards |
|--------|-----------|-------------|
| **Challenge Completed** | >= 60 | XP (with multipliers) |
| **Perfect Score** | 100 | baseXP + bonusXP |
| **Module Completed** | 100% | Unlock next module |
| **Badge Unlocked** | - | XP reward (if defined) |
| **Level Up** | Auto | Unlocked perks |

### Metrics and Governance

| Metric | Calculation | Range | Target |
|---------|---------|-------|------|
| **DI** | linesFromAI / totalLines × 100 | 0-100% | < 40% |
| **PR** | testsPassed / testsTotal × 100 | 0-100% | > 70% |
| **CS** | checkedWeight / totalWeight × 10 | 0-10 | > 8 |
| **Risk** | f(DI, PR, CS) | 0-100 | < 30 |

---

## Quick Reference

### Essential Formulas

```typescript
// Metrics
DI = (linesFromAI / totalLines) × 100
PR = (testsPassed / testsTotal) × 100
CS = (checkedWeight / totalWeight) × 10

// XP
finalXP = baseXP × difficulty × performance × firstTry × independence × streak

// Score
score = scoreDI + scorePR + scoreCS  // Max: 100

// Certificate
finalScore = theory×0.3 + practical×0.5 + portfolio×0.2
```

### Important Thresholds

```typescript
// Pass/Fail
CHALLENGE_PASS_THRESHOLD = 60
CERTIFICATE_PASS_THRESHOLD = 60

// Metrics (HARD)
TARGET_MAX_DI = 40
TARGET_MIN_PR = 70
TARGET_MIN_CS = 8.0

// Risk
RISK_CRITICAL = 70
RISK_HIGH = 50
RISK_MEDIUM = 30
```

### Critical Constraints

```
✅ linesFromAI <= totalLines
✅ testsPassed <= testsTotal
✅ aiUsageTime + manualCodingTime + debugTime <= sessionTime
✅ checklistItem.weight: 0-10
✅ Unique: [userId, moduleId]
✅ Unique: [moduleId, orderInModule]
```

---

<div align="center">

**[← Creating Guide](./guides/creating-challenges.md)** | **[Back to Index](./README.md)**

</div>
