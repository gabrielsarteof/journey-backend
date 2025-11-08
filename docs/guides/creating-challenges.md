# Journey | Challenge Creation Guide

> Step-by-step tutorial for creating effective challenges that teach AI governance

## Table of Contents

- [Before You Start](#before-you-start)
- [Step 1: Define the Concept](#step-1-define-the-concept)
- [Step 2: Choose Difficulty and Goals](#step-2-choose-difficulty-and-goals)
- [Step 3: Write Instructions](#step-3-write-instructions)
- [Step 4: Create Starter Code](#step-4-create-starter-code)
- [Step 5: Build Test Cases](#step-5-build-test-cases)
- [Step 6: Create Educational Traps](#step-6-create-educational-traps)
- [Step 7: Define Governance Checklist](#step-7-define-governance-checklist)
- [Step 8: Test the Challenge](#step-8-test-the-challenge)
- [Best Practices](#best-practices)
- [Templates](#templates)

---

## Before You Start

### Challenge Philosophy

Journey is not just about solving technical problems. **The goal is to teach developers to:**

1. ✅ **Use AI as a tool**, not as a crutch
2. 🔍 **Detect vulnerabilities** in generated code
3. 📋 **Validate AI outputs** critically
4. 🎯 **Apply governance** systematically

### Pre-Creation Checklist

Before creating a challenge, ask yourself:

- [ ] Does this challenge teach a **governance** or **security** concept?
- [ ] Will the user have to **think critically** about the code?
- [ ] Are the **traps educational**, not just gotchas?
- [ ] Do the **metrics (DI, PR, CS)** reflect best practices?
- [ ] Is the challenge **testable in an automated way**?

---

## Step 1: Define the Concept

### 1.1 Choose a Theme

Select a theme that teaches AI governance:

**Recommended Themes:**

| Category | Theme Examples |
|-----------|------------------|
| **Security** | Input validation, SQL injection, XSS, JWT authentication, secrets management |
| **Quality** | Error handling, logging, unit tests, edge cases |
| **Performance** | Query optimization, caching, efficient algorithms |
| **Architecture** | SOLID principles, design patterns, clean code |

### 1.2 Define the Learning Objective

**Example:**

```markdown
## Learning Objective

By completing this challenge, the developer will be able to:
1. Implement secure JWT authentication
2. Identify hardcoded secrets in code
3. Validate tokens correctly
4. Implement appropriate error handling
```

---

## Step 2: Choose Difficulty and Goals

### 2.1 Difficulty Levels

| Difficulty | User Profile | Concepts | Estimated Time |
|-------------|-------------------|-----------|----------------|
| **EASY** | Beginner | 1-2 simple concepts | 15-20 min |
| **MEDIUM** | Intermediate | 2-3 concepts with variations | 30-40 min |
| **HARD** | Advanced | 3-4 concepts + edge cases | 45-60 min |
| **EXPERT** | Expert | 5+ concepts + optimizations | 60-90 min |

### 2.2 Define Target Metrics

Use the reference table:

```typescript
const targetMetrics = {
  EASY: { maxDI: 50, minPR: 60, minCS: 7.0 },
  MEDIUM: { maxDI: 45, minPR: 65, minCS: 7.5 },
  HARD: { maxDI: 40, minPR: 70, minCS: 8.0 },
  EXPERT: { maxDI: 35, minPR: 75, minCS: 8.5 }
};
```

**Interpretation:**

- **maxDI**: How much the user can depend on AI (lower = more independence required)
- **minPR**: What % of tests must pass (higher = more quality required)
- **minCS**: How many governance practices must be applied (higher = more rigor)

---

## Step 3: Write Instructions

### 3.1 Recommended Structure

```markdown
# [Challenge Title]

## 🎯 Objective
[Brief and clear description of what must be done]

## 📖 Context
[Realistic scenario that justifies the challenge]

## ✅ Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## 💡 Tips
- Technical tip 1
- Security tip 2

## 🚨 Attention
[Warnings about common pitfalls or important concepts]

## 📚 Resources
[Links to relevant documentation]
```

### 3.2 Example: JWT Authentication Challenge

```markdown
# Implement Secure JWT Authentication

## 🎯 Objective
Create a `/login` endpoint that authenticates users and returns a valid JWT token.

## 📖 Context
You are developing a REST API for an e-commerce application. The security team
identified that the current system doesn't have adequate authentication, and you have
been assigned to implement JWT authentication.

## ✅ Requirements
- [ ] Validate email and password format
- [ ] Fetch user from database
- [ ] Verify password using bcrypt
- [ ] Generate JWT token with appropriate payload
- [ ] Configure token expiration (1h)
- [ ] Implement error handling for failure cases
- [ ] Don't expose sensitive information in payload or error messages

## 💡 Tips
- Use the `jsonwebtoken` library to generate tokens
- The JWT secret should come from environment variable
- Passwords should never be returned in response
- Handle "user not found" and "incorrect password" cases separately

## 🚨 Attention
This challenge contains common **security traps**. Review your code carefully
before submitting, especially:
- Hardcoded secrets
- Exposure of sensitive data
- Lack of input validation

## 📚 Resources
- [JWT.io - Introduction](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
```

---

## Step 4: Create Starter Code

### 4.1 Principles

- ✅ **Provide structure**, not the complete solution
- ✅ **Leave the core logic** for the user to implement
- ✅ **Guide the user** with clear TODOs
- ❌ **Don't give everything ready** (otherwise DI will be 100%)

### 4.2 Example

```typescript
// starter-code.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const router = Router();

// TODO: Define validation schema using Zod
const loginSchema = z.object({
  // Add email and password validation
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    // TODO 1: Validate request body using schema

    // TODO 2: Fetch user from database
    // const user = await ...

    // TODO 3: Check if user exists

    // TODO 4: Compare password using bcrypt

    // TODO 5: Generate JWT token
    // Remember: use process.env.JWT_SECRET!

    // TODO 6: Return token and user data (WITHOUT password)

  } catch (error) {
    // TODO 7: Implement appropriate error handling
  }
});

export default router;
```

**Why this starter code is good:**

- ✅ Provides necessary imports
- ✅ Basic route structure
- ✅ Numbered TODOs guide the flow
- ✅ Comments highlight attention points
- ✅ Leaves main logic for the user

---

## Step 5: Build Test Cases

### 5.1 Test Case Structure

```typescript
interface TestCase {
  id: string;
  description: string;  // What does this test validate?
  input: any;          // Input data
  expectedOutput: any;  // Expected output
  weight: number;      // Importance (1-5)
  timeout?: number;    // Timeout in ms (default: 5000)
}
```

### 5.2 Types of Tests

**1. Happy Path (weight: 1-2)**
```typescript
{
  id: 'test-happy-path',
  description: 'Should authenticate valid user',
  input: {
    email: 'user@example.com',
    password: 'ValidPass123'
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
  weight: 2
}
```

**2. Edge Cases (weight: 2-3)**
```typescript
{
  id: 'test-edge-empty-email',
  description: 'Should reject empty email',
  input: {
    email: '',
    password: 'ValidPass123'
  },
  expectedOutput: {
    status: 400,
    body: {
      error: 'Validation error'
    }
  },
  weight: 2
}
```

**3. Security Tests (weight: 3-5)**
```typescript
{
  id: 'test-security-no-password-leak',
  description: 'Should not return password in response',
  input: {
    email: 'user@example.com',
    password: 'ValidPass123'
  },
  expectedOutput: {
    status: 200,
    body: {
      user: {
        password: undefined  // Password should NOT be present
      }
    }
  },
  weight: 4
}
```

### 5.3 Weight Guidelines

```typescript
const weightGuidelines = {
  happyPath: 1-2,       // Basic flow working
  edgeCases: 2-3,       // Edge cases handled
  securityTests: 3-5,   // Vulnerabilities prevented
  performanceTests: 2-3 // Optimizations applied
};
```

**Distribution Example:**

```
Total of 10 test cases:
- 2 happy path (weight: 1 each) = 2 points
- 3 edge cases (weight: 2 each) = 6 points
- 3 security tests (weight: 3 each) = 9 points
- 2 performance tests (weight: 2 each) = 4 points
─────────────────────────────────────────────
Total weight: 21 points

To pass (60%): user needs to accumulate 12.6 points
```

---

## Step 6: Create Educational Traps

### 6.1 What is a Good Trap?

An educational trap should:

- ✅ **Teach a concept** of security/quality
- ✅ **Be realistic** (common error in practice)
- ✅ **Have clear explanation** of why it's wrong
- ✅ **Provide correct solution**
- ❌ **Not be just an obscure gotcha**

### 6.2 Trap Template

```typescript
{
  id: 'trap-[descriptive-name]',
  type: 'security' | 'performance' | 'logic' | 'architecture',
  severity: 'low' | 'medium' | 'high' | 'critical',
  buggedCode: '// Problematic code',
  correctCode: '// Correct code',
  explanation: `
    ⚠️ [SEVERITY]: [Problem title]

    [Problem explanation]

    Impact/Risks:
    - [Risk 1]
    - [Risk 2]

    Solution:
    - [Step 1]
    - [Step 2]
  `,
  detectionPattern: 'regex-pattern'
}
```

### 6.3 Examples by Type

#### Security Trap

```typescript
{
  id: 'trap-sql-injection',
  type: 'security',
  severity: 'critical',
  buggedCode: `
    const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
    const result = await db.query(query);
  `,
  correctCode: `
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
  `,
  explanation: `
    ⚠️ CRITICAL: SQL Injection Vulnerability

    Concatenating user inputs directly into SQL queries allows
    SQL injection attacks.

    Impact:
    - Unauthorized database access
    - Sensitive data leakage
    - Data modification/deletion
    - Privilege escalation

    Solution:
    - Use prepared statements (parameterized queries)
    - Never concatenate strings in SQL
    - Use ORMs that sanitize automatically
  `,
  detectionPattern: 'SELECT.*FROM.*\\$\\{\\w+\\}'
}
```

#### Performance Trap

```typescript
{
  id: 'trap-n-plus-one',
  type: 'performance',
  severity: 'high',
  buggedCode: `
    const users = await User.findAll();
    for (const user of users) {
      user.posts = await Post.findByUser(user.id); // N+1!
    }
  `,
  correctCode: `
    const users = await User.findAll({
      include: [Post]  // Eager loading
    });
  `,
  explanation: `
    ⚠️ HIGH: N+1 Query Problem

    Executing an additional query inside a loop causes the N+1
    problem, resulting in degraded performance.

    Impact:
    - N+1 queries to database (if 100 users = 101 queries!)
    - Exponentially increased latency
    - Higher database load

    Solution:
    - Use eager loading (joins)
    - Load related data in a single query
    - Use DataLoader for batching
  `,
  detectionPattern: 'for.*await.*find'
}
```

#### Logic Trap

```typescript
{
  id: 'trap-equality-bug',
  type: 'logic',
  severity: 'high',
  buggedCode: 'if (status = "active")',  // Assignment!
  correctCode: 'if (status === "active")',
  explanation: `
    ⚠️ HIGH: Assignment instead of comparison

    Using = (assignment) instead of === (comparison) in conditions
    is a silent error that always returns true.

    Consequences:
    - Condition always true
    - Original value overwritten
    - Very hard to detect bug

    Solution:
    - Use === for strict comparison
    - Configure ESLint to detect (no-cond-assign)
    - Use TypeScript strict mode
  `,
  detectionPattern: 'if\\s*\\([^=]*=\\s*[^=]'
}
```

### 6.4 Detecting Absence of Security

Besides detecting bad code, detect the **lack of good code**:

```typescript
// Example: Detect lack of validation
{
  id: 'trap-missing-validation',
  type: 'security',
  severity: 'high',
  buggedCode: `
    router.post('/api/users', (req, res) => {
      const user = req.body;  // No validation!
      await User.create(user);
    });
  `,
  correctCode: `
    const userSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8)
    });

    router.post('/api/users', (req, res) => {
      const user = userSchema.parse(req.body);
      await User.create(user);
    });
  `,
  explanation: `
    ⚠️ HIGH: Missing Input Validation

    Accepting user data without validation is a critical vulnerability.

    Risks:
    - Mass assignment attacks
    - Type coercion bugs
    - Database errors
    - Business logic bypass

    Solution:
    - Use validation libraries (Zod, Yup, Joi)
    - Validate ALL user inputs
    - Use whitelisting, not blacklisting
  `,
  // Detects: router.post + req.body without validation
  detectionPattern: 'req\\.body(?!.*validate|.*parse|.*schema)'
}
```

---

## Step 7: Define Governance Checklist

### 7.1 Categories

| Category | What to evaluate | Typical Weight |
|-----------|---------------|-------------|
| **🔍 Validation** | Input validation, error handling, type safety | 3-4 |
| **🔒 Security** | Authentication, authorization, sanitization | 4-5 |
| **🧪 Testing** | Unit tests, edge cases, coverage | 2-3 |
| **📝 Documentation** | Comments, README, API docs | 1-2 |

### 7.2 Checklist Example

```typescript
const checklistItems = [
  // Validation (total weight: 10)
  {
    id: 'val-1',
    label: 'Input validation implemented (Zod/Yup/Joi)',
    category: 'validation',
    weight: 4,
    checked: false
  },
  {
    id: 'val-2',
    label: 'Error handling with try/catch',
    category: 'validation',
    weight: 3,
    checked: false
  },
  {
    id: 'val-3',
    label: 'Type safety with TypeScript',
    category: 'validation',
    weight: 3,
    checked: false
  },

  // Security (total weight: 13)
  {
    id: 'sec-1',
    label: 'Secrets in environment variables',
    category: 'security',
    weight: 5,
    checked: false
  },
  {
    id: 'sec-2',
    label: 'Passwords hashed (bcrypt)',
    category: 'security',
    weight: 4,
    checked: false
  },
  {
    id: 'sec-3',
    label: 'Rate limiting implemented',
    category: 'security',
    weight: 2,
    checked: false
  },
  {
    id: 'sec-4',
    label: 'Sensitive data not exposed',
    category: 'security',
    weight: 2,
    checked: false
  },

  // Testing (total weight: 5)
  {
    id: 'test-1',
    label: 'Basic test cases written',
    category: 'testing',
    weight: 3,
    checked: false
  },
  {
    id: 'test-2',
    label: 'Edge cases considered',
    category: 'testing',
    weight: 2,
    checked: false
  },

  // Documentation (total weight: 2)
  {
    id: 'doc-1',
    label: 'Code adequately commented',
    category: 'documentation',
    weight: 2,
    checked: false
  }
];

// Total weight: 30
// For CS = 8: user needs to complete 24 points (80%)
```

### 7.3 Alignment with Target Metrics

```typescript
// For HARD challenge with minCS = 8.0
const totalWeight = 30;
const requiredWeight = (8.0 / 10) * totalWeight = 24;

// User can skip up to 6 points
// Example: can skip documentation (2) and 1 testing item (2)
// and still achieve 26 points = CS 8.67 ✅
```

---

## Step 8: Test the Challenge

### 8.1 Testing Checklist

Before publishing, test:

- [ ] **Reference solution** passes all test cases
- [ ] **Starter code** compiles without errors
- [ ] **Traps are detected** correctly
- [ ] **Estimated time** is realistic
- [ ] **Instructions are clear** (ask someone to review)
- [ ] **Metric goals** are balanced

### 8.2 Test with Personas

Test the challenge simulating different profiles:

**Persona 1: Independent Developer**
- Writes most of the code manually
- Validates AI outputs carefully
- Should achieve: DI < 30%, PR > 85%, CS > 8.5

**Persona 2: AI-Dependent Developer**
- Copies almost everything from AI
- Doesn't validate outputs
- Should achieve: DI > 70%, PR ~50%, CS < 6
- System should warn about critical risk

**Persona 3: Balanced Developer**
- Uses AI as a tool
- Validates and adjusts code
- Should achieve: DI ~40%, PR ~75%, CS ~8

---

## Best Practices

### ✅ DO

- ✅ **Focus on teaching**, not on catching the user
- ✅ **Use realistic scenarios** from day-to-day work
- ✅ **Provide educational feedback**, not just "right/wrong"
- ✅ **Test with real users** before publishing
- ✅ **Review and update** challenges periodically

### ❌ DON'T

- ❌ **Don't create obscure gotchas** without educational value
- ❌ **Don't give complete starter code** (otherwise DI = 100%)
- ❌ **Don't use generic test cases** without weighting
- ❌ **Don't forget to align** checklist with target metrics
- ❌ **Don't publish without testing** the reference solution

---

## Templates

### Complete JSON Template

```json
{
  "slug": "jwt-authentication",
  "title": "Implement Secure JWT Authentication",
  "difficulty": "HARD",
  "category": "BACKEND",
  "estimatedMinutes": 60,

  "instructions": "# Implement JWT Authentication\n\n...",

  "starterCode": "import { Router } from 'express';\n...",

  "solution": "// Complete reference solution",

  "languages": ["javascript", "typescript"],

  "testCases": [
    {
      "id": "test-1",
      "description": "Happy path",
      "input": {},
      "expectedOutput": {},
      "weight": 2
    }
  ],

  "traps": [
    {
      "id": "trap-1",
      "type": "security",
      "severity": "critical",
      "buggedCode": "",
      "correctCode": "",
      "explanation": "",
      "detectionPattern": ""
    }
  ],

  "targetMetrics": {
    "maxDI": 40,
    "minPR": 70,
    "minCS": 8.0
  },

  "baseXp": 150,
  "bonusXp": 75
}
```

---

<div align="center">

**[← Progression System](../architecture/progression-system.md)** | **[Next: Business Rules →](../business-rules.md)**

</div>
