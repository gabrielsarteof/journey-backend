# Journey | Metrics System

> Complete documentation of calculation algorithms for the three governance metrics (DI, PR, CS)

## Table of Contents

- [Overview](#overview)
- [The Three Metrics](#the-three-metrics)
- [Dependency Index (DI)](#dependency-index-di)
- [Pass Rate (PR)](#pass-rate-pr)
- [Checklist Score (CS)](#checklist-score-cs)
- [Risk Assessment](#risk-assessment)
- [Tracking and Persistence](#tracking-and-persistence)
- [Insights and Trends](#insights-and-trends)
- [API](#api)

---

## Overview

The **Metrics System** is the heart of governance assessment in the Journey platform. Three complementary metrics objectively evaluate the responsible use of Generative AI:

```
┌─────────────────────────────────────────────────┐
│         GOVERNANCE METRICS                      │
├─────────────────────────────────────────────────┤
│  DI (Dependency Index)     │ 0-100%            │
│  AI Dependency             │ Lower = Better    │
├─────────────────────────────────────────────────┤
│  PR (Pass Rate)            │ 0-100%            │
│  Success Rate              │ Higher = Better   │
├─────────────────────────────────────────────────┤
│  CS (Checklist Score)      │ 0-10              │
│  Governance                │ Higher = Better   │
└─────────────────────────────────────────────────┘
```

### Why three metrics?

- **DI** measures **independence** vs AI dependency
- **PR** measures **quality** of code through tests
- **CS** measures **adherence** to governance best practices

Together, they provide a **holistic assessment** of responsible AI development.

---

## The Three Metrics

### Quick Comparison

| Metric | Formula | Range | Target | Objective |
|---------|---------|-------|--------|-----------|
| **DI** | `(linesFromAI / totalLines) × 100` | 0-100% | < 40% | Measure AI dependency |
| **PR** | `(testsPassed / testsTotal) × 100` | 0-100% | > 70% | Measure quality via tests |
| **CS** | `(checkedWeight / totalWeight) × 10` | 0-10 | > 8 | Measure governance and practices |

### Targets by Difficulty

| Difficulty | maxDI | minPR | minCS | Interpretation |
|-------------|-------|-------|-------|----------------|
| **EASY** | 50% | 60% | 7.0 | Beginner, more tolerant |
| **MEDIUM** | 45% | 65% | 7.5 | Intermediate |
| **HARD** | 40% | 70% | 8.0 | Advanced, rigorous |
| **EXPERT** | 35% | 75% | 8.5 | Expert, very rigorous |

---

## Dependency Index (DI)

### Definition

The **Dependency Index** measures the percentage of code generated or assisted by AI relative to the total lines written.

### Formula

```typescript
DI = (linesFromAI / totalLines) × 100

Where:
- linesFromAI: Number of lines generated/suggested by AI
- totalLines: Total lines of code (including manual + AI)
```

### Implementation

**Location:** `src/modules/metrics/domain/services/metric-calculator.service.ts`

```typescript
class MetricCalculatorService {
  calculateDependencyIndex(metrics: CodeMetrics): number {
    // Edge case: No code written yet
    if (metrics.totalLines === 0) {
      return 0;
    }

    // Validation: linesFromAI cannot exceed totalLines
    if (metrics.linesFromAI > metrics.totalLines) {
      throw new MetricsDataInconsistentError(
        'AI lines cannot exceed total lines'
      );
    }

    // Calculate percentage
    const di = (metrics.linesFromAI / metrics.totalLines) * 100;

    // Round to 2 decimal places
    const finalDI = Math.round(di * 100) / 100;

    // Warning logging
    if (finalDI > 80) {
      logger.warn('Critical AI dependency detected', {
        di: finalDI,
        criticalDependency: true
      });
    } else if (finalDI > 60) {
      logger.warn('High AI dependency detected', {
        di: finalDI,
        highDependency: true
      });
    }

    return finalDI;
  }
}
```

### Interpretation

| DI | Classification | Meaning | Action |
|----|---------------|-------------|------|
| **0-30%** | 🟢 Independent | Uses AI as a tool, not a crutch | ✅ Excellent balance |
| **30-50%** | 🟡 Moderate | Balanced dependency | ⚠️ Attention to usage |
| **50-70%** | 🟠 High | Significant dependency | 🔶 Reduce dependency |
| **70-100%** | 🔴 Critical | Excessive dependency | 🚨 Intervention needed |

### Examples

**Example 1: Balanced Usage**
```typescript
const metrics = {
  totalLines: 100,
  linesFromAI: 25,  // AI helped with 25 lines
  linesTyped: 75    // User typed 75 lines
};

DI = (25 / 100) × 100 = 25.00%
Result: 🟢 Independent - Excellent!
```

**Example 2: High Dependency**
```typescript
const metrics = {
  totalLines: 100,
  linesFromAI: 85,  // AI generated 85% of code
  linesTyped: 15
};

DI = (85 / 100) × 100 = 85.00%
Result: 🔴 Critical - Review practices!
```

### How is it Tracked?

```typescript
// CodeEvent model tracks each code change
interface CodeEvent {
  attemptId: string;
  eventType: 'TYPED' | 'AI_SUGGESTION' | 'PASTE' | 'DELETE';
  linesAdded: number;
  linesRemoved: number;
  wasFromAI: boolean;      // 🔑 Critical flag
  aiInteractionId?: string;
  timestamp: Date;
}

// Aggregation
const totalLines = sum(events.linesAdded) - sum(events.linesRemoved);
const linesFromAI = sum(events.where(wasFromAI === true).linesAdded);
```

---

## Pass Rate (PR)

### Definition

The **Pass Rate** measures the success rate in automated tests, indicating code quality and reliability.

### Formula

```typescript
PR = (testsPassed / testsTotal) × 100

Where:
- testsPassed: Number of tests that passed
- testsTotal: Total number of tests executed
```

### Implementation

```typescript
class MetricCalculatorService {
  calculatePassRate(metrics: CodeMetrics): number {
    // Edge case: No tests executed
    if (metrics.testsTotal === 0) {
      // Default to 100% when there are no tests
      // (avoids unfair penalization)
      return 100;
    }

    // Validation: passed tests cannot exceed total
    if (metrics.testsPassed > metrics.testsTotal) {
      throw new MetricsDataInconsistentError(
        'Passed tests cannot exceed total tests'
      );
    }

    // Calculate percentage
    const pr = (metrics.testsPassed / metrics.testsTotal) * 100;

    // Round to 2 decimal places
    const finalPR = Math.round(pr * 100) / 100;

    // Logging
    if (finalPR < 30) {
      logger.warn('Very low pass rate', {
        pr: finalPR,
        veryLowPassRate: true
      });
    } else if (finalPR < 50) {
      logger.warn('Low pass rate', {
        pr: finalPR,
        lowPassRate: true
      });
    } else if (finalPR > 90) {
      logger.info('Excellent pass rate', {
        pr: finalPR,
        excellentPassRate: true
      });
    }

    return finalPR;
  }
}
```

### Interpretation

| PR | Classification | Meaning | Quality |
|----|---------------|-------------|-----------|
| **90-100%** | 🟢 Excellent | First-try success | ✅ Reliable code |
| **70-89%** | 🟡 Good | Minimal debugging | ⚠️ Some adjustments |
| **50-69%** | 🟠 Moderate | Significant rework | 🔶 Review approach |
| **0-49%** | 🔴 Low | Multiple attempts | 🚨 Critical review |

### Examples

**Example 1: High Quality**
```typescript
const execution = {
  testsTotal: 10,
  testsPassed: 9  // 9 out of 10 passed
};

PR = (9 / 10) × 100 = 90.00%
Result: 🟢 Excellent - First-try success!
```

**Example 2: Low Quality**
```typescript
const execution = {
  testsTotal: 20,
  testsPassed: 8  // Only 8 out of 20
};

PR = (8 / 20) × 100 = 40.00%
Result: 🔴 Low - Review code!
```

### Weighted Test Cases

Test cases have **different weights** based on importance:

```typescript
const testCases = [
  {
    id: 'test-1',
    description: 'Happy path',
    weight: 1  // Basic
  },
  {
    id: 'test-2',
    description: 'Edge case: empty input',
    weight: 2  // Important
  },
  {
    id: 'test-3',
    description: 'Security: SQL injection',
    weight: 3  // Critical
  }
];

// Weighted score
totalWeight = 1 + 2 + 3 = 6
passedWeight = 1 + 2 = 3 (test-3 failed)
weightedScore = (3 / 6) × 100 = 50%
```

---

## Checklist Score (CS)

### Definition

The **Checklist Score** measures adherence to governance best practices through a weighted checklist (0-10 scale).

### Formula

```typescript
CS = (checkedWeight / totalWeight) × 10

Where:
- checkedWeight: Sum of weights of checked items
- totalWeight: Sum of weights of all items
- Result normalized to 0-10 scale
```

### Implementation

```typescript
class MetricCalculatorService {
  calculateChecklistScore(checklistItems: ChecklistItem[]): number {
    // Edge case: No items in checklist
    if (checklistItems.length === 0) {
      // Default to perfect score (10)
      return 10;
    }

    // Calculate total weight
    const totalWeight = checklistItems.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    // Edge case: All items have zero weight
    if (totalWeight === 0) {
      return 10;
    }

    // Calculate weight of checked items
    const checkedWeight = checklistItems
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.weight, 0);

    // Calculate score on 0-10 scale
    const score = (checkedWeight / totalWeight) * 10;

    // Round to 2 decimal places
    const finalCS = Math.round(score * 100) / 100;

    // Logging
    if (finalCS < 3) {
      logger.warn('Critical validation gaps', {
        cs: finalCS,
        criticalValidationGaps: true
      });
    } else if (finalCS < 5) {
      logger.warn('Significant validation gaps', {
        cs: finalCS,
        significantValidationGaps: true
      });
    } else if (finalCS > 8) {
      logger.info('Excellent validation', {
        cs: finalCS,
        excellentValidation: true
      });
    }

    return finalCS;
  }
}
```

### Checklist Categories

| Category | Description | Example Items |
|-----------|-----------|---------------|
| **🔍 Validation** | Input and data validation | Schema validation, sanitization, type checking |
| **🔒 Security** | Security and authentication | Auth middleware, rate limiting, HTTPS |
| **🧪 Testing** | Tests and coverage | Unit tests, integration tests, edge cases |
| **📝 Documentation** | Code documentation | Comments, README, API docs |

### Interpretation

| CS | Classification | Meaning | Status |
|----|---------------|-------------|--------|
| **8-10** | 🟢 Excellent | Complete governance | ✅ All practices applied |
| **7-8** | 🟡 Good | Minor gaps | ⚠️ Minor adjustments |
| **5-7** | 🟠 Moderate | Significant gaps | 🔶 Review practices |
| **0-5** | 🔴 Critical | Inadequate governance | 🚨 Complete review |

### Complete Example

```typescript
const checklistItems: ChecklistItem[] = [
  {
    id: '1',
    label: 'Input validation implemented',
    category: 'validation',
    weight: 3,      // Weight 3 (important)
    checked: true   // ✅ Done
  },
  {
    id: '2',
    label: 'JWT authentication configured',
    category: 'security',
    weight: 4,      // Weight 4 (very important)
    checked: true   // ✅ Done
  },
  {
    id: '3',
    label: 'Unit tests written',
    category: 'testing',
    weight: 2,      // Weight 2 (moderate)
    checked: false  // ❌ Not done
  },
  {
    id: '4',
    label: 'Code documented',
    category: 'documentation',
    weight: 1,      // Weight 1 (desirable)
    checked: true   // ✅ Done
  }
];

// Calculation
totalWeight = 3 + 4 + 2 + 1 = 10
checkedWeight = 3 + 4 + 1 = 8 (item 3 was not checked)
CS = (8 / 10) × 10 = 8.00

Result: 🟢 Excellent - 80% of practices applied!
```

### Recommended Weights

```typescript
// Weight guidelines by category
const weightGuidelines = {
  validation: {
    critical: 4,    // Input validation, sanitization
    important: 3,   // Type checking, error handling
    nice: 2         // Edge case handling
  },
  security: {
    critical: 5,    // Authentication, authorization
    important: 4,   // HTTPS, rate limiting
    nice: 2         // Security headers
  },
  testing: {
    critical: 3,    // Basic unit tests
    important: 2,   // Integration tests
    nice: 1         // E2E tests
  },
  documentation: {
    critical: 2,    // README, API docs
    important: 1,   // Code comments
    nice: 1         // Examples
  }
};
```

---

## Risk Assessment

### Risk Score

The system combines the three metrics to generate a **risk score** (0-100):

```typescript
function calculateRiskScore(di: number, pr: number, cs: number): number {
  let score = 0;

  // Dependency Index Assessment
  if (di > 80) {
    score += 40;  // Extreme dependency
  } else if (di > 60) {
    score += 25;  // High dependency
  } else if (di > 40) {
    score += 10;  // Moderate dependency
  }

  // Pass Rate Assessment
  if (pr < 30) {
    score += 30;  // Very low pass rate
  } else if (pr < 50) {
    score += 20;  // Low pass rate
  } else if (pr < 70) {
    score += 10;  // Moderate pass rate
  }

  // Checklist Score Assessment
  if (cs < 3) {
    score += 30;  // Critical gaps
  } else if (cs < 5) {
    score += 20;  // Significant gaps
  } else if (cs < 7) {
    score += 10;  // Some gaps
  }

  return score;
}
```

### Risk Levels

```typescript
function assessRiskLevel(score: number): RiskLevel {
  if (score >= 70) {
    return {
      level: 'CRITICAL',
      color: '🔴',
      description: 'Immediate intervention required'
    };
  } else if (score >= 50) {
    return {
      level: 'HIGH',
      color: '🟠',
      description: 'Urgent action required'
    };
  } else if (score >= 30) {
    return {
      level: 'MEDIUM',
      color: '🟡',
      description: 'Attention needed'
    };
  } else {
    return {
      level: 'LOW',
      color: '🟢',
      description: 'Best practices maintained'
    };
  }
}
```

### Scoring Table

| Condition | Points | Factor | Recommendation |
|----------|--------|-------|--------------|
| DI > 80% | +40 | Extreme dependency | Solve problems independently |
| DI 60-80% | +25 | High dependency | Challenge yourself to write more code |
| DI 40-60% | +10 | Moderate dependency | Good balance, can improve |
| PR < 30% | +30 | Very low pass rate | Review code carefully |
| PR 30-50% | +20 | Low pass rate | Debug more before submitting |
| PR 50-70% | +10 | Moderate pass rate | Seek first-try success |
| CS < 3 | +30 | Critical gaps | Always validate AI outputs |
| CS 3-5 | +20 | Significant gaps | Improve code review |
| CS 5-7 | +10 | Some gaps | Focus on tests and documentation |

### Scenario Examples

**Scenario 1: Excellent Developer** 🟢
```typescript
DI = 25%  → 0 points (independent)
PR = 95%  → 0 points (excellent)
CS = 9.5  → 0 points (complete governance)
─────────────────────────────────
Total Score = 0 → RISK: LOW ✅
```

**Scenario 2: AI Dependent** 🟠
```typescript
DI = 85%  → 40 points (extreme dependency)
PR = 55%  → 10 points (moderate)
CS = 6    → 10 points (some gaps)
─────────────────────────────────
Total Score = 60 → RISK: HIGH ⚠️
```

**Scenario 3: Critical Risk** 🔴
```typescript
DI = 90%  → 40 points
PR = 25%  → 30 points
CS = 2    → 30 points
─────────────────────────────────
Total Score = 100 → RISK: CRITICAL 🚨
```

---

## Tracking and Persistence

### MetricSnapshot

Each snapshot represents metrics at a specific point in time:

```typescript
interface MetricSnapshot {
  id: string;
  attemptId: string;
  userId: string;
  timestamp: Date;
  sessionTime: number;  // milliseconds since start

  // Calculated metrics
  dependencyIndex: number;
  passRate: number;
  checklistScore: number;

  // Optional metrics
  aiUsageTime?: number;
  manualCodingTime?: number;
  debugTime?: number;
  codeQuality?: number;
}
```

### Tracking Flow

```typescript
class TrackMetricsUseCase {
  async execute(userId: string, data: TrackMetricsDTO) {
    // 1. Validate attempt
    const isValid = await this.repository.validateAttemptOwnership(
      data.attemptId,
      userId
    );

    // 2. Validate data consistency
    this.validateMetricsData(data);

    // 3. Build metrics object
    const codeMetrics: CodeMetrics = {
      totalLines: data.totalLines,
      linesFromAI: data.linesFromAI,
      testsPassed: data.testsPassed,
      testsTotal: data.testsTotal,
      checklistItems: data.checklistItems
    };

    // 4. Calculate metrics
    const calculation = this.calculator.calculateAll(
      codeMetrics,
      data.sessionTime
    );

    // 5. Assess risk
    const riskAssessment = this.calculator.assessRisk(calculation);

    // 6. Fetch previous metric for comparison
    const previousMetric = await this.repository.findLatest(
      data.attemptId
    );

    // 7. Generate comparative insights
    const insights = this.calculator.generateInsights(
      calculation,
      previousMetric
    );

    // 8. Create snapshot
    const snapshot = await this.repository.create({
      attemptId: data.attemptId,
      userId,
      sessionTime: data.sessionTime,
      dependencyIndex: calculation.dependencyIndex,
      passRate: calculation.passRate,
      checklistScore: calculation.checklistScore,
      aiUsageTime: data.aiUsageTime,
      manualCodingTime: data.manualCodingTime,
      debugTime: data.debugTime
    });

    // 9. Emit WebSocket event
    this.wsServer.emitToAttempt(data.attemptId, 'metrics:update', {
      attemptId: data.attemptId,
      metrics: calculation,
      riskAssessment,
      insights,
      timestamp: calculation.timestamp
    });

    // 10. Log if critical risk
    if (riskAssessment.level === 'CRITICAL') {
      logger.error('Critical risk detected', {
        userId,
        attemptId: data.attemptId,
        riskScore: riskAssessment.score
      });
    }

    return { snapshot, calculation, riskAssessment, insights };
  }
}
```

---

## Insights and Trends

### Insight Generation

```typescript
class MetricCalculatorService {
  generateInsights(
    current: MetricCalculation,
    previous?: MetricCalculation
  ): string[] {
    const insights: string[] = [];

    // First measurement (no comparison)
    if (!previous) {
      if (current.dependencyIndex < 30) {
        insights.push("🎉 Great start! You're coding independently");
      }
      if (current.passRate > 80) {
        insights.push("🎯 Excellent test performance from the beginning");
      }
      if (current.checklistScore > 8) {
        insights.push("⭐ Outstanding attention to best practices");
      }
      return insights;
    }

    // Comparison with previous measurement
    const diChange = current.dependencyIndex - previous.dependencyIndex;
    const prChange = current.passRate - previous.passRate;
    const csChange = current.checklistScore - previous.checklistScore;

    // Dependency Index
    if (Math.abs(diChange) > 10) {
      if (diChange < 0) {
        insights.push(
          `📉 Dependency reduced by ${Math.abs(diChange).toFixed(1)}% - becoming more independent!`
        );
      } else {
        insights.push(
          `📈 Dependency increased by ${diChange.toFixed(1)}% - try coding more manually`
        );
      }
    }

    // Pass Rate
    if (Math.abs(prChange) > 15) {
      if (prChange > 0) {
        insights.push(
          `✅ Pass rate improved by ${prChange.toFixed(1)}% - better testing!`
        );
      } else {
        insights.push(
          `⚠️ Pass rate dropped by ${Math.abs(prChange).toFixed(1)}% - review more carefully`
        );
      }
    }

    // Checklist Score
    if (Math.abs(csChange) > 1) {
      if (csChange > 0) {
        insights.push(
          `📋 Checklist score up by ${csChange.toFixed(1)} - great validation!`
        );
      } else {
        insights.push(
          `📋 Checklist score down by ${Math.abs(csChange).toFixed(1)} - don't skip validations`
        );
      }
    }

    return insights;
  }
}
```

### Trend Analysis

```typescript
interface MetricTrend {
  metric: 'DI' | 'PR' | 'CS';
  values: Array<{ timestamp: Date; value: number }>;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
}

class MetricAggregatorService {
  calculateTrends(
    attemptId: string,
    windowSize: number = 5
  ): Record<string, MetricTrend> {
    const metrics = await this.getSessionMetrics(attemptId);

    return {
      DI: this.calculateTrend(metrics, 'dependencyIndex', 'DI', windowSize),
      PR: this.calculateTrend(metrics, 'passRate', 'PR', windowSize),
      CS: this.calculateTrend(metrics, 'checklistScore', 'CS', windowSize)
    };
  }

  private calculateTrend(
    metrics: MetricSnapshot[],
    field: keyof MetricSnapshot,
    metricName: 'DI' | 'PR' | 'CS',
    windowSize: number
  ): MetricTrend {
    const values = metrics.map(m => ({
      timestamp: m.timestamp,
      value: Number(m[field]) || 0
    }));

    // Comparison windows
    const recent = values.slice(-windowSize);
    const older = values.slice(
      Math.max(0, values.length - windowSize * 2),
      -windowSize
    );

    if (older.length === 0) {
      return {
        metric: metricName,
        values,
        trend: 'stable',
        changePercent: 0
      };
    }

    // Calculate averages
    const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v.value, 0) / older.length;

    // Calculate percentage change
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining';
    if (metricName === 'DI') {
      // For DI, lower is better
      trend = changePercent < -5 ? 'improving' :
              changePercent > 5 ? 'declining' : 'stable';
    } else {
      // For PR and CS, higher is better
      trend = changePercent > 5 ? 'improving' :
              changePercent < -5 ? 'declining' : 'stable';
    }

    return {
      metric: metricName,
      values,
      trend,
      changePercent: Math.round(changePercent * 100) / 100
    };
  }
}
```

---

## API

### Main Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-----------|------|
| POST | `/metrics` | Track metrics snapshot | ✅ |
| GET | `/metrics/session/:attemptId` | Get session metrics | ✅ |
| POST | `/metrics/stream` | Start real-time streaming | ✅ |
| DELETE | `/metrics/stream/:attemptId` | Stop streaming | ✅ |

### WebSocket Events

```typescript
// Client connects to WebSocket
socket.on('connect', () => {
  // Subscribe to attempt updates
  socket.emit('subscribe:attempt', { attemptId: 'attempt-123' });
});

// Server emits metrics update
socket.on('metrics:update', (data) => {
  console.log('New metrics:', data);
  // {
  //   attemptId: 'attempt-123',
  //   metrics: { di: 35, pr: 85, cs: 8.5 },
  //   riskAssessment: { level: 'LOW', score: 15 },
  //   insights: ['...'],
  //   timestamp: '2025-11-06T...'
  // }
});
```

### File References

```
src/modules/metrics/
├── domain/
│   └── services/
│       ├── metric-calculator.service.ts
│       └── metric-aggregator.service.ts
├── application/use-cases/
│   ├── track-metrics.use-case.ts
│   ├── get-session-metrics.use-case.ts
│   └── stream-metrics.use-case.ts
├── infrastructure/
│   └── repositories/
│       └── metric.repository.ts
└── presentation/
    └── routes/
        └── metric.routes.ts
```

---

<div align="center">

**[← Challenges System](./challenges-system.md)** | **[Next: Progression System →](./progression-system.md)**

</div>
