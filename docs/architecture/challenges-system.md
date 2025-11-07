# Journey | Challenge System

> Complete technical documentation for practical challenges system and anti-pattern detection

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Challenge Structure](#challenge-structure)
- [Traps System](#traps-system)
- [Code Analysis](#code-analysis)
- [Execution and Validation](#execution-and-validation)
- [Complete Flow](#complete-flow)
- [API](#api)

---

## Overview

The **Challenge System** is the educational core of the Journey platform. Each challenge presents a practical development problem where the user must:

1. ✍️ Write code to solve the problem
2. 🎯 Avoid or detect **traps** (intentional anti-patterns)
3. ✅ Pass automated test cases
4. 📋 Follow governance checklists

### Pedagogical Objectives

- 🔒 Teach **vulnerability detection** in security
- 📐 Promote **best practices** in development
- 🧠 Develop **critical thinking** about AI-generated code
- 🔍 Encourage **rigorous validation** before accepting suggestions

---

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────┐
│            Presentation Layer                    │
│  • ChallengeController                          │
│  • ChallengeRoutes                              │
│  • DTOs (Request/Response)                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           Application Layer                      │
│  • StartChallengeUseCase                        │
│  • AnalyzeCodeUseCase                           │
│  • SubmitSolutionUseCase                        │
│  • ListChallengesUseCase                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Domain Layer                        │
│  • Challenge (Entity)                           │
│  • ChallengeAttempt (Entity)                    │
│  • TrapDetectorService                          │
│  • TestCaseValidator                            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Infrastructure Layer                    │
│  • ChallengeRepository (Prisma)                 │
│  • Judge0Service                                │
│  • CodeExecutionService                         │
└─────────────────────────────────────────────────┘
```

### Main Entities

#### Challenge

```typescript
class Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;

  // Classification
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DEVOPS' | 'MOBILE' | 'DATA';

  // Content
  instructions: string;        // Markdown
  starterCode?: string;        // Initial template
  solution: string;            // Reference solution
  languages: string[];         // ['javascript', 'typescript', 'python']

  // Validation
  testCases: TestCase[];       // Test cases
  traps: Trap[];              // Anti-patterns to detect
  hints: Hint[];              // Contextual hints

  // Metric targets
  targetMetrics: {
    maxDI: number;    // Ex: 40 (maximum 40% AI dependency)
    minPR: number;    // Ex: 70 (minimum 70% pass rate)
    minCS: number;    // Ex: 8 (minimum 8/10 on checklist)
  };

  // Rewards
  baseXp: number;
  bonusXp: number;
}
```

#### ChallengeAttempt

```typescript
class ChallengeAttempt {
  id: string;
  userId: string;
  challengeId: string;
  sessionId: string;

  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

  // Submitted code
  language: string;
  code: string;
  codeSnapshots: CodeSnapshot[];  // Checkpoint history

  // Final metrics
  finalScore?: number;
  finalDI?: number;
  finalPR?: number;
  finalCS?: number;

  // Traps
  trapsDetected: TrapDetection[];

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;  // milliseconds
}
```

---

## Challenge Structure

### Essential Components

Each challenge is composed of:

| Component | Description | Required |
|-----------|-------------|----------|
| **Instructions** | Problem statement (Markdown) | ✅ Yes |
| **Starter Code** | Initial template | ⚠️ Optional |
| **Test Cases** | Weighted test cases | ✅ Yes |
| **Traps** | Anti-patterns to detect | ⚠️ Optional |
| **Target Metrics** | DI, PR, CS targets | ✅ Yes |
| **Solution** | Reference solution | ✅ Yes |

### Example: JWT Authentication Challenge

#### 1. Instructions (Markdown)

```markdown
# Implement JWT Authentication

## Context
You need to implement a login endpoint that authenticates users
and returns a valid JWT token.

## Requirements
- [ ] Validate credentials against the database
- [ ] Generate JWT token with appropriate payload
- [ ] Return token and user data
- [ ] Implement appropriate error handling

## Tips
- Use bcrypt to compare passwords
- Configure token expiration
- Don't expose sensitive information in the payload
```

#### 2. Starter Code

```typescript
// starter-code.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  // TODO: Implement authentication
  // 1. Extract credentials from body
  // 2. Validate format
  // 3. Fetch user from database
  // 4. Verify password
  // 5. Generate JWT token
  // 6. Return response
});

export default router;
```

#### 3. Weighted Test Cases

```typescript
const testCases: TestCase[] = [
  {
    id: 'test-1',
    description: 'Should authenticate valid user',
    input: {
      method: 'POST',
      path: '/login',
      body: {
        email: 'user@example.com',
        password: 'ValidPass123'
      }
    },
    expectedOutput: {
      status: 200,
      body: {
        token: '<JWT_TOKEN>',
        user: {
          id: '<USER_ID>',
          email: 'user@example.com',
          name: 'Test User'
        }
      }
    },
    weight: 3,  // High weight = critical test
    timeout: 5000
  },
  {
    id: 'test-2',
    description: 'Should reject invalid credentials',
    input: {
      method: 'POST',
      path: '/login',
      body: {
        email: 'user@example.com',
        password: 'WrongPassword'
      }
    },
    expectedOutput: {
      status: 401,
      body: {
        error: 'Invalid credentials'
      }
    },
    weight: 2,
    timeout: 5000
  }
];
```

#### 4. Target Metrics

```typescript
// For a HARD challenge
const targetMetrics = {
  maxDI: 40,   // User can use AI, but not depend 100%
  minPR: 70,   // Code should work well (70% of tests passing)
  minCS: 8     // High adherence to governance (8/10 on checklist)
};
```

---

## Traps System

### What are Traps?

**Traps** are anti-patterns intentionally placed in challenges to:
- 🎓 Test the ability to **detect vulnerabilities**
- 📚 Teach **best practices** through educational feedback
- 🧠 Assess developer **critical thinking**

### Anatomy of a Trap

```typescript
interface Trap {
  id: string;                   // Unique identifier
  type: 'security' | 'performance' | 'logic' | 'architecture';
  severity: 'low' | 'medium' | 'high' | 'critical';

  buggedCode: string;           // ❌ Problematic code
  correctCode: string;          // ✅ Correct code
  explanation: string;          // 📖 Educational explanation
  detectionPattern: string;     // 🔍 Regex for detection
}
```

### Types of Traps

#### 🔒 1. Security Traps (Vulnerabilities)

**Example: Using eval()**

```typescript
{
  id: 'trap-eval',
  type: 'security',
  severity: 'critical',
  buggedCode: 'eval(userInput)',
  correctCode: 'JSON.parse(userInput)',
  explanation: `
    ⚠️ CRITICAL: Use of eval()

    Using eval() with user input is a critical vulnerability
    that allows arbitrary code execution.

    Impact:
    - Remote Code Execution (RCE)
    - File system access
    - Theft of sensitive data

    Solution:
    - Use JSON.parse() for JSON data
    - Use specialized libraries for parsing
    - NEVER execute untrusted code
  `,
  detectionPattern: 'eval\\s*\\('
}
```

**Example: Hardcoded Secrets**

```typescript
{
  id: 'trap-hardcoded-secret',
  type: 'security',
  severity: 'critical',
  buggedCode: `jwt.sign(payload, 'my-secret-key-123')`,
  correctCode: `jwt.sign(payload, process.env.JWT_SECRET)`,
  explanation: `
    ⚠️ CRITICAL: Hardcoded secret in code

    Never include secrets directly in source code.

    Risks:
    - Exposure in Git repositories
    - Leakage in logs
    - Difficult key rotation

    Solution:
    - Use environment variables
    - Use secret managers (AWS Secrets Manager, Vault)
    - Add secrets to .gitignore
  `,
  detectionPattern: `jwt\\.sign\\s*\\([^,]+,\\s*['"][^'"]+['"]`
}
```

#### ⚡ 2. Performance Traps

```typescript
{
  id: 'trap-map-filter',
  type: 'performance',
  severity: 'low',
  buggedCode: 'array.map(x => x * 2).filter(x => x > 10)',
  correctCode: 'array.filter(x => x > 5).map(x => x * 2)',
  explanation: `
    ⚠️ Performance: Inefficient operation order

    Applying .map() before .filter() processes all elements
    unnecessarily.

    Impact:
    - O(n) extra operations
    - Higher memory usage
    - Slowness on large arrays

    Solution:
    - Always filter BEFORE mapping
    - Reduce the dataset as early as possible
  `,
  detectionPattern: '\\.map\\([^)]+\\)\\.filter\\('
}
```

#### 🐛 3. Logic Traps

```typescript
{
  id: 'trap-incorrect-operator',
  type: 'logic',
  severity: 'high',
  buggedCode: 'if (user.role = "admin")',  // Assignment!
  correctCode: 'if (user.role === "admin")',
  explanation: `
    ⚠️ Logic Error: Assignment instead of comparison

    Using = instead of === causes assignment instead of comparison.

    Consequences:
    - Condition always true
    - Original value overwritten
    - Hard-to-detect bug

    Solution:
    - Use === for strict comparison
    - Configure ESLint to detect this error
  `,
  detectionPattern: 'if\\s*\\([^=]*=\\s*[^=]'
}
```

#### 🏗️ 4. Architecture Traps

```typescript
{
  id: 'trap-god-class',
  type: 'architecture',
  severity: 'medium',
  buggedCode: `
    class UserService {
      authenticate() { }
      sendEmail() { }
      processPayment() { }
      generateReport() { }
      // ... 20+ methods
    }
  `,
  correctCode: `
    class AuthService { authenticate() { } }
    class EmailService { sendEmail() { } }
    class PaymentService { processPayment() { } }
    class ReportService { generateReport() { } }
  `,
  explanation: `
    ⚠️ Architecture: God Class (SRP violation)

    A class with many responsibilities is difficult to maintain,
    test and reuse.

    Problems:
    - Single Responsibility Principle violation
    - High coupling
    - Testing difficulty
    - Low cohesion

    Solution:
    - Separate responsibilities into specific classes
    - Each class should have a single reason to change
    - Use dependency injection
  `,
  detectionPattern: 'class\\s+\\w+\\s*{[^}]{2000,}}'
}
```

### Trap Detection

#### TrapDetectorService

```typescript
class TrapDetectorService {
  /**
   * Detects traps in code using pattern matching
   *
   * @param code - Code to be analyzed
   * @param traps - List of challenge traps
   * @returns Array of detected traps
   */
  detectTraps(code: string, traps: Trap[]): TrapDetectionResult[] {
    const results: TrapDetectionResult[] = [];
    const lines = code.split('\n');

    for (const trap of traps) {
      const regex = new RegExp(trap.detectionPattern, 'gm');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(code)) !== null) {
        const position = this.getLineAndColumn(code, match.index);
        const snippet = this.extractSnippet(lines, position.line);

        results.push({
          trapId: trap.id,
          detected: true,
          type: trap.type,
          severity: trap.severity,
          lineNumber: position.line,
          column: position.column,
          snippet,
          suggestion: this.generateSuggestion(trap),
          explanation: trap.explanation
        });

        // Log for audit
        logger.warn('Trap detected', {
          trapId: trap.id,
          type: trap.type,
          severity: trap.severity,
          line: position.line
        });
      }
    }

    return results;
  }

  /**
   * Generates formatted suggestion based on trap type
   */
  private generateSuggestion(trap: Trap): string {
    const templates = {
      security: `🔒 Security Issue\n\n${trap.explanation}\n\n✅ Use:\n${trap.correctCode}`,
      performance: `⚡ Performance Issue\n\n${trap.explanation}\n\n✅ Optimize with:\n${trap.correctCode}`,
      logic: `🐛 Logic Error\n\n${trap.explanation}\n\n✅ Correct approach:\n${trap.correctCode}`,
      architecture: `🏗️ Design Issue\n\n${trap.explanation}\n\n✅ Better pattern:\n${trap.correctCode}`
    };

    return templates[trap.type];
  }
}
```

### Missing Security Detection

In addition to detecting bad code, the system also detects the **absence of security measures**:

```typescript
/**
 * Detects lack of essential security practices
 */
detectMissingSecurity(code: string): SecurityGap[] {
  const gaps: SecurityGap[] = [];

  // Check if there is input validation
  if (!code.includes('validate') && !code.includes('schema')) {
    gaps.push({
      type: 'missing-validation',
      severity: 'high',
      message: 'No input validation detected',
      recommendation: 'Use libraries like Zod, Yup, or Joi'
    });
  }

  // Check if there is authentication
  if (code.includes('router.') && !code.includes('auth')) {
    gaps.push({
      type: 'missing-auth',
      severity: 'critical',
      message: 'No authentication middleware detected',
      recommendation: 'Add authentication middleware to protect endpoints'
    });
  }

  // Check if there is sanitization
  if (code.includes('innerHTML') && !code.includes('sanitize')) {
    gaps.push({
      type: 'missing-sanitization',
      severity: 'high',
      message: 'Using innerHTML without sanitization',
      recommendation: 'Use DOMPurify to sanitize HTML'
    });
  }

  return gaps;
}
```

---

## Code Analysis

### Code Quality Metrics

The system calculates quality metrics in real-time:

```typescript
interface CodeQualityMetrics {
  totalLines: number;
  codeLines: number;           // Excluding blank lines
  complexityScore: number;     // Cyclomatic complexity
  securityScore: number;       // 0-100 (penalized for vulnerabilities)
  hasErrorHandling: boolean;   // try/catch present
  hasInputValidation: boolean; // Input validation
  hasComments: boolean;        // Documentation present
}
```

#### Cyclomatic Complexity Calculation

```typescript
calculateComplexity(code: string): number {
  let complexity = 1;  // Base complexity

  const patterns = [
    /\bif\b/g,           // if statements
    /\belse if\b/g,      // else if
    /\?\s*[^:]+:/g,      // ternary operators
    /\bswitch\b/g,       // switch statements
    /\bcase\b/g,         // case statements
    /\bfor\b/g,          // for loops
    /\bwhile\b/g,        // while loops
    /\bdo\b/g,           // do-while loops
    /\bcatch\b/g,        // catch blocks
    /&&/g,               // logical AND
    /\|\|/g              // logical OR
  ];

  for (const pattern of patterns) {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}
```

**Interpretation:**
- **1-10**: Simple and maintainable
- **11-20**: Moderately complex
- **21-50**: High, consider refactoring
- **50+**: Very high, refactoring necessary

#### Security Score Calculation

```typescript
calculateSecurityScore(code: string): number {
  let score = 100;  // Perfect score

  const vulnerabilities = [
    { pattern: /eval\s*\(/g, penalty: 30 },
    { pattern: /innerHTML\s*=/g, penalty: 20 },
    { pattern: /document\.write/g, penalty: 20 },
    { pattern: /\.exec\(/g, penalty: 15 },
    { pattern: /SELECT.*FROM.*WHERE/gi, penalty: 25 },
    { pattern: /password\s*=\s*['"][^'"]+['"]/g, penalty: 30 },
    { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, penalty: 25 }
  ];

  for (const vuln of vulnerabilities) {
    const matches = code.match(vuln.pattern);
    if (matches) {
      score -= vuln.penalty * matches.length;
    }
  }

  return Math.max(0, score);
}
```

---

## Execution and Validation

### Judge0 Integration

Code is executed in a secure sandbox environment:

```typescript
class Judge0Service {
  async execute(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<ExecutionResult> {

    const results: TestResult[] = [];

    for (const testCase of testCases) {
      // 1. Prepare code with test case
      const fullCode = this.wrapCodeWithTest(code, testCase);

      // 2. Submit to Judge0
      const submission = await this.submitCode({
        source_code: Buffer.from(fullCode).toString('base64'),
        language_id: this.getLanguageId(language),
        stdin: JSON.stringify(testCase.input),
        expected_output: JSON.stringify(testCase.expectedOutput)
      });

      // 3. Wait for result
      const result = await this.waitForResult(submission.token);

      // 4. Validate output
      const passed = this.validateOutput(
        result.stdout,
        testCase.expectedOutput
      );

      results.push({
        testCaseId: testCase.id,
        passed,
        executionTime: result.time,
        memory: result.memory,
        output: result.stdout,
        error: result.stderr
      });
    }

    return {
      totalTests: testCases.length,
      passedTests: results.filter(r => r.passed).length,
      results
    };
  }
}
```

### Scoring System

```typescript
class ChallengeScorer {
  /**
   * Calculates score based on weighted test cases
   */
  calculateScore(results: TestResult[], testCases: TestCase[]): number {
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const testCase of testCases) {
      totalWeight += testCase.weight;

      const result = results.find(r => r.testCaseId === testCase.id);
      if (result?.passed) {
        earnedWeight += testCase.weight;
      }
    }

    const score = (earnedWeight / totalWeight) * 100;
    return Math.round(score);
  }

  /**
   * Determines if the challenge was completed
   * Default threshold: 60%
   */
  isPassing(score: number, threshold: number = 60): boolean {
    return score >= threshold;
  }
}
```

---

## Complete Flow

### 1️⃣ User Starts Challenge

```http
POST /api/challenges/:challengeId/start
Authorization: Bearer <token>

Response 200:
{
  "attempt": {
    "id": "attempt-123",
    "sessionId": "session-456",
    "challengeId": "challenge-789",
    "status": "IN_PROGRESS",
    "starterCode": "// Your code here",
    "startedAt": "2025-11-06T12:00:00Z"
  }
}
```

### 2️⃣ User Writes Code (Checkpoints)

```http
POST /api/challenges/analyze
Authorization: Bearer <token>

{
  "attemptId": "attempt-123",
  "challengeId": "challenge-789",
  "code": "const login = (req, res) => { eval(req.body.code); }",
  "checkpointTime": 120000
}

Response 200:
{
  "trapsDetected": [
    {
      "trapId": "trap-eval",
      "type": "security",
      "severity": "critical",
      "lineNumber": 1,
      "snippet": "> 1: const login = (req, res) => { eval(req.body.code); }",
      "suggestion": "🔒 Security Issue: Never use eval()...",
      "explanation": "..."
    }
  ],
  "codeQuality": {
    "complexityScore": 1,
    "securityScore": 70,
    "hasErrorHandling": false,
    "hasInputValidation": false
  },
  "feedback": [
    "🔴 Found 1 critical security issue.",
    "💡 Consider adding error handling."
  ],
  "warnings": [
    "⚠️ CRITICAL: Security vulnerabilities detected!"
  ]
}
```

### 3️⃣ User Submits Solution

```http
POST /api/challenges/submit
Authorization: Bearer <token>

{
  "attemptId": "attempt-123",
  "code": "// Final code",
  "language": "javascript"
}

Response 200:
{
  "success": true,
  "score": 85,
  "metrics": {
    "di": 35.5,
    "pr": 90.0,
    "cs": 8.5
  },
  "testResults": {
    "totalTests": 10,
    "passedTests": 9
  },
  "xpEarned": 285,
  "stars": 2
}
```

---

## API

### Main Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/challenges` | List challenges | Optional |
| GET | `/challenges/:id` | Details | Optional |
| POST | `/challenges/:id/start` | Start attempt | ✅ Required |
| POST | `/challenges/analyze` | Analyze code | ✅ Required |
| POST | `/challenges/submit` | Submit solution | ✅ Required |

### File References

**Project location:**

```
src/modules/challenges/
├── domain/
│   ├── entities/
│   │   └── challenge.entity.ts
│   ├── services/
│   │   └── trap-detector.service.ts
│   └── types/
│       └── challenge.types.ts
├── application/use-cases/
│   ├── start-challenge.use-case.ts
│   ├── analyze-code.use-case.ts
│   └── submit-solution.use-case.ts
├── infrastructure/
│   ├── repositories/
│   │   └── challenge.repository.ts
│   └── services/
│       └── judge0.service.ts
└── presentation/
    └── routes/
        └── challenge.routes.ts
```

---

<div align="center">

**[← Back](../README.md)** | **[Next: Metrics System →](./metrics-system.md)**

</div>
