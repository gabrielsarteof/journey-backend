<div align="center">

# Journey | AI Governance Learning Platform

**Educational platform for teaching developers to use Generative AI responsibly through objective metrics**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Code Quality](https://img.shields.io/badge/code%20quality-A-success?style=flat-square)](CODE_QUALITY.md)

[Complete Documentation](#-documentation) • [API Reference](./api/endpoints.md) • [Contributing Guide](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [About the Project](#-about-the-project)
- [Problem and Solution](#-problem-and-solution)
- [Architecture](#-architecture)
- [Governance Metrics](#-governance-metrics)
- [Documentation](#-documentation)
- [Technologies](#️-technologies)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)

---

## About the Project

**Journey** is an educational platform that teaches developers how to use **Generative AI responsibly and under governance**. Through practical challenges and objective metrics, the platform evaluates three critical dimensions:

- **Independence vs. AI Dependency**
- **Code Quality and Reliability**
- **Adherence to Best Practices and Governance**

### Academic Context

Developed as a **Bachelor's Thesis** in Information Systems, this project explores the intersection between technology education, AI governance, and objective metrics for assessing software development competencies.

---

## Problem and Solution

### The Challenge

With the popularization of tools like ChatGPT and GitHub Copilot, developers face a new challenge:

- Excessive dependency on AI without deep understanding
- Lack of metrics to assess responsible AI usage
- Absence of governance and validation practices for generated code
- Difficulty balancing productivity with quality

### Our Solution

Journey offers a controlled environment where developers can:

- Objectively measure their AI dependency through the **Dependency Index (DI)**
- Assess code quality with **Pass Rate (PR)** based on automated tests
- Validate governance with **Checklist Score (CS)** for best practices
- Progress in a structured way through practical challenges with real-time feedback

Gamification is used as an **engagement tool** to make learning more attractive, but the main focus remains on **governance metrics**.

---

## Architecture

Journey was built following **Clean Architecture** principles, ensuring separation of concerns, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (REST API, WebSocket, Routes)              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│           (Use Cases, Business Workflows)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│    (Entities, Value Objects, Domain Services)           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│     (Database, Cache, External Services, Judge0)        │
└─────────────────────────────────────────────────────────┘
```

### Core Modules

<table>
<tr>
<td width="50%">

**Challenges**
- Practical challenge system
- Anti-pattern detection (Traps)
- Real-time code analysis
- Execution via Judge0

</td>
<td width="50%">

**Metrics**
- DI, PR, CS calculation
- Risk assessment system
- Temporal metrics tracking
- Trend analysis

</td>
</tr>
<tr>
<td width="50%">

**Modules**
- Structured progression
- Unlock gates
- Progress tracking

</td>
<td width="50%">

**Gamification**
- XP and levels system
- Badges and achievements
- Streaks and engagement

</td>
</tr>
<tr>
<td width="50%">

**Certificates**
- Validated certifications
- QR Code verification
- Aggregated metrics

</td>
<td width="50%">

**Governance**
- Prompt validation
- Interaction auditing
- Contextual rules

</td>
</tr>
</table>

---

## Governance Metrics

The heart of Journey consists of **three metrics** that evaluate responsible AI usage:

### 1️⃣ Dependency Index (DI)

**What it measures**: Percentage of AI-generated code vs. manually written code

```typescript
DI = (linesFromAI / totalLines) × 100
```

| Range | Interpretation | Recommended Action |
|-------|---------------|------------------|
| 0-30% | Independent | Excellent balance |
| 30-50% | Moderate | Pay attention to AI usage |
| 50-70% | High | Reduce dependency |
| 70-100% | Critical | Intervention required |

### 2️⃣ Pass Rate (PR)

**What it measures**: Success rate in automated tests (first attempt)

```typescript
PR = (testsPassed / testsTotal) × 100
```

| Range | Interpretation | Quality |
|-------|---------------|-----------|
| 90-100% | Excellent | First-try success |
| 70-89% | Good | Minimal debugging |
| 50-69% | Moderate | Significant rework |
| 0-49% | Low | Critical review needed |

### 3️⃣ Checklist Score (CS)

**What it measures**: Adherence to governance best practices (0-10 scale)

```typescript
CS = (checkedWeight / totalWeight) × 10
```

**Categories evaluated:**
- **Validation**: Input validation, error handling
- **Security**: Authentication, authorization, sanitization
- **Testing**: Unit tests, coverage, edge cases
- **Documentation**: Comments, README, API docs

| Range | Interpretation | Status |
|-------|---------------|--------|
| 8-10 | Excellent | Complete governance |
| 7-8 | Good | Minor adjustments |
| 5-7 | Moderate | Significant gaps |
| 0-5 | Critical | Complete review |

### Risk Assessment

The system combines the three metrics to generate a **risk score** (0-100):

```
Risk Score = f(DI, PR, CS)

Where:
- High DI contributes up to +40 points
- Low PR contributes up to +30 points
- Low CS contributes up to +30 points

Classification:
├─ 0-29:  🟢 LOW (good practices)
├─ 30-49: 🟡 MEDIUM (attention needed)
├─ 50-69: 🟠 HIGH (action required)
└─ 70+:   🔴 CRITICAL (immediate intervention)
```

---

## Documentation

The documentation is organized in three layers:

### Architecture

Detailed documentation of core systems:

- **[Challenge System](./architecture/challenges-system.md)**
  - Challenge structure and lifecycle
  - Trap system (anti-pattern detection)
  - Real-time code analysis
  - Judge0 integration

- **[Metrics System](./architecture/metrics-system.md)**
  - Calculation algorithms (DI, PR, CS)
  - Risk assessment and insights
  - Temporal tracking and trends
  - Metrics aggregation

- **[Progression System](./architecture/progression-system.md)**
  - Modules and unlocking
  - XP system and multipliers
  - Badges and achievements
  - Certifications

### Practical Guides

Step-by-step tutorials for different profiles:

- **[Creating Challenges](./guides/creating-challenges.md)**
  - How to structure a challenge
  - Defining metric goals by difficulty
  - Creating effective traps
  - Setting up weighted test cases
  - Governance checklists

- **[Business Rules](./business-rules.md)**
  - Unlock gates
  - State flows
  - Validations and constraints
  - Calculations and formulas

### API Reference

Technical integration documentation:

- **[Endpoints](./api/endpoints.md)**
  - Complete REST API
  - WebSocket events
  - Authentication and authorization
  - Rate limiting

---

## Technologies

### Core Stack

| Technology | Version | Usage |
|------------|--------|-----|
| **Node.js** | 18+ | JavaScript runtime |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Fastify** | 4.x | High-performance web framework |
| **Prisma** | 5.x | Type-safe ORM |
| **PostgreSQL** | 14+ | Relational database |
| **Redis** | 7+ | Cache and sessions |

### Infrastructure

- **Judge0**: Secure code execution in sandbox
- **WebSocket**: Real-time metrics streaming
- **Zod**: Schema validation
- **JWT**: Stateless authentication
- **Docker**: Containerization

### Code Quality

- **ESLint**: Linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

---

## Getting Started

### Prerequisites

```bash
node -v    # 18+
npm -v     # 9+
docker -v  # 20+
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-user/journey-backend.git
cd journey-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# 4. Start database and Redis
docker-compose up -d postgres redis

# 5. Run migrations
npx prisma migrate dev

# 6. (Optional) Seed database with sample data
npx prisma db seed

# 7. Start development server
npm run dev
```

The server will be available at `http://localhost:3000`

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/journey"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Judge0 (optional)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"

# Server
PORT=3000
NODE_ENV="development"
```

### Available Scripts

```bash
npm run dev          # Development with hot-reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Tests in watch mode
npm run test:cov     # Tests with coverage
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run prisma:studio # Open Prisma Studio (DB GUI)
```

---

## Project Structure

```
journey_backend/
│
├── prisma/
│   ├── schema.prisma              # Database models
│   ├── migrations/                # SQL migrations
│   └── seed.ts                    # Initial data
│
├── src/
│   ├── modules/                   # Functional modules (Clean Architecture)
│   │   ├── challenges/
│   │   │   ├── domain/           # Entities, VOs, Services
│   │   │   ├── application/      # Use Cases
│   │   │   ├── infrastructure/   # Repositories, Judge0
│   │   │   └── presentation/     # Routes, Controllers
│   │   ├── metrics/
│   │   ├── modules/
│   │   ├── gamification/
│   │   ├── certificates/
│   │   └── auth/
│   │
│   ├── shared/                    # Shared code
│   │   ├── domain/               # Base entities, errors
│   │   ├── infrastructure/       # Database, cache, logger
│   │   └── utils/                # Helpers, validators
│   │
│   ├── config/                    # Configurations
│   ├── plugins/                   # Fastify plugins
│   └── server.ts                  # Entry point
│
├── tests/                         # Automated tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                          # Technical documentation
│   ├── architecture/             # Architecture docs
│   ├── guides/                   # Practical guides
│   ├── api/                      # API reference
│   └── README.md                 # This file
│
├── .github/                       # GitHub Actions, templates
├── docker-compose.yml             # Local containers
├── Dockerfile                     # Production build
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

### Code Conventions

#### Module Organization (Clean Architecture)

Each module follows the structure:

```
module/
├── domain/              # Domain layer (business rules)
│   ├── entities/       # Domain entities
│   ├── value-objects/  # Value Objects
│   ├── services/       # Domain Services
│   ├── repositories/   # Repository interfaces
│   └── types/          # Types and enums
├── application/         # Application layer (use cases)
│   └── use-cases/      # Use Cases
├── infrastructure/      # Infrastructure layer
│   ├── repositories/   # Repository implementations
│   └── services/       # External services
└── presentation/        # Presentation layer
    ├── routes/         # Route definitions
    ├── controllers/    # Controllers
    └── dtos/           # Request/response DTOs
```

#### Naming Conventions

```typescript
// Entities: PascalCase
class Challenge extends Entity { }

// Value Objects: PascalCase
class Email extends ValueObject { }

// Use Cases: kebab-case.use-case.ts
class StartChallengeUseCase { }

// Services: kebab-case.service.ts
class MetricCalculatorService { }

// Controllers: kebab-case.controller.ts
class ChallengeController { }

// DTOs: PascalCase + DTO suffix
interface CreateChallengeDTO { }
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

### Process

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semi colons, etc
refactor: code refactoring
test: adding or fixing tests
chore: maintenance, configs, etc
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Author

**[Your Name]** - Bachelor in Information Systems

- LinkedIn: [your-profile](https://linkedin.com/in/your-profile)
- GitHub: [@your-user](https://github.com/your-user)
- Email: your.email@example.com

---

## Acknowledgments

- Advisor: [Name]
- Institution: [University Name]
- Open-source community

---

## Support

For questions, suggestions, or to report issues:

- Email: support@journey-platform.com
- Issues: [GitHub Issues](https://github.com/your-user/journey-backend/issues)
- Discussions: [GitHub Discussions](https://github.com/your-user/journey-backend/discussions)

---

<div align="center">

**[Back to top](#journey--ai-governance-learning-platform)**

Made with TypeScript

</div>
