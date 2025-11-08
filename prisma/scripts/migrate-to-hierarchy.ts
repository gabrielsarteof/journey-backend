import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration Script: Legacy Challenges → Hierarchical Learning System
 *
 * This script migrates the existing 28 challenges from the legacy structure
 * (Challenge → Module) to the new Duolingo-inspired hierarchy
 * (Module → Unit → Level → LevelChallenge → Challenge)
 *
 * IMPORTANT: Run this AFTER the structured learning units migration
 *
 * What this script does:
 * 1. Creates 11 new Units with educational content
 * 2. Creates 37 new Levels with varied types
 * 3. Connects 28 existing challenges via LevelChallenge
 * 4. Preserves all legacy data (moduleId, orderInModule)
 */

/**
 * Helper function to create or find existing unit
 */
async function findOrCreateUnit(data: any) {
  const existing = await prisma.unit.findUnique({
    where: { slug: data.slug },
});

  if (existing) {
    console.log(`  ℹ️  Unit already exists: ${existing.title}`);
    return existing;
  }

  const created = await prisma.unit.create({ data });
  console.log(`  ✅ Created: ${created.title}`);
  return created;
}

async function main() {
  console.log('🚀 Starting migration to hierarchical learning system...\n');

  // ============================================================================
  // STEP 1: Fetch existing data
  // ============================================================================

  console.log('📊 Fetching existing data...');

  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
});

  const challenges = await prisma.challenge.findMany({
    orderBy: [
      { moduleId: 'asc' },
      { orderInModule: 'asc' },
    ],
});

  console.log(`✅ Found ${modules.length} modules`);
  console.log(`✅ Found ${challenges.length} challenges\n`);

  // Map modules by slug for easy reference
  const moduleMap = new Map(modules.map(m => [m.slug, m]));

  // Map challenges by slug for easy reference
  const challengeMap = new Map(challenges.map(c => [c.slug, c]));

  // ============================================================================
  // STEP 2: Create Units for Backend Module
  // ============================================================================

  console.log('🏗️  Creating Backend Module units...');

  const backendModule = moduleMap.get('backend');
  if (!backendModule) throw new Error('Backend module not found');

  // UNIT 1: REST API Fundamentals (already has 1 unit, skip or update)
  const existingUnit1 = await prisma.unit.findFirst({
    where: {
      moduleId: backendModule.id,
      slug: 'fundamentos-ia-responsavel',
    },
});

  if (existingUnit1) {
    console.log('  ℹ️  Unit 1 already exists (fundamentos-ia-responsavel), skipping...');
  }

  // UNIT 2: REST API Fundamentals (NEW)
  const backendUnit1 = await findOrCreateUnit({
      slug: 'rest-api-fundamentals',
      title: 'REST API Fundamentals',
      description: 'Master the core concepts of RESTful architecture and build robust APIs',
      moduleId: backendModule.id,
      orderInModule: 2,
      iconImage: 'rest-api.png',
      theme: {
        color: '#8b5cf6',
        gradient: ['#8b5cf6', '#7c3aed'],
        icon: '🌐',
      },
      learningObjectives: [
        'Understand REST architectural principles and constraints',
        'Design resource-oriented APIs with proper HTTP methods',
        'Implement correct status codes and error handling',
        'Debug common API issues efficiently',
      ],
      estimatedMinutes: 135,
      theoryContent: `
# REST API Fundamentals

## What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server protocol, almost always HTTP.

## Core Principles

1. **Client-Server Architecture**: Separation of concerns between UI and data storage
2. **Stateless**: Each request contains all information needed to process it
3. **Cacheable**: Responses must explicitly define cacheability
4. **Uniform Interface**: Consistent interaction patterns across resources
5. **Layered System**: Architecture composed of hierarchical layers

## HTTP Methods

- **GET**: Retrieve resource(s) - should be idempotent and safe
- **POST**: Create new resource - not idempotent
- **PUT**: Update/replace entire resource - idempotent
- **PATCH**: Partial update of resource
- **DELETE**: Remove resource - idempotent

## Status Codes

- **2xx Success**: 200 OK, 201 Created, 204 No Content
- **3xx Redirection**: 301 Moved Permanently, 304 Not Modified
- **4xx Client Errors**: 400 Bad Request, 401 Unauthorized, 404 Not Found
- **5xx Server Errors**: 500 Internal Server Error, 503 Service Unavailable

## Best Practices

✅ Use nouns for resource names (not verbs)
✅ Implement proper error handling with meaningful messages
✅ Version your API (v1, v2) to maintain compatibility
✅ Document comprehensively with OpenAPI/Swagger
✅ Secure with proper authentication and authorization
✅ Use HTTP methods semantically
✅ Return appropriate status codes
      `.trim(),
      resources: {
        articles: [
          { title: 'REST API Design Best Practices', url: 'https://restfulapi.net' },
          { title: 'HTTP Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' },
        ],
        videos: [
          { title: 'REST APIs in 100 Seconds', duration: '2:00', url: '#' },
        ],
      },
      requiredScore: 70,
  });

  // UNIT 3: Architecture & Refactoring
  const backendUnit2 = await findOrCreateUnit({
      slug: 'architecture-refactoring',
      title: 'Architecture & Refactoring',
      description: 'Learn clean code principles, refactoring techniques, and authentication patterns',
      moduleId: backendModule.id,
      orderInModule: 3,
      iconImage: 'architecture.png',
      theme: {
        color: '#7c3aed',
        gradient: ['#7c3aed', '#6d28d9'],
        icon: '🏗️',
      },
      learningObjectives: [
        'Apply SOLID principles and clean architecture patterns',
        'Refactor legacy code to improve maintainability',
        'Understand JWT authentication flow and security',
        'Implement secure authentication systems',
      ],
      estimatedMinutes: 195,
      theoryContent: `
# Architecture & Refactoring

## Clean Code Principles

Writing clean, maintainable code is crucial for long-term project success.

### Key Principles:

1. **Single Responsibility**: Each class/function should have one reason to change
2. **DRY (Don't Repeat Yourself)**: Avoid code duplication
3. **Meaningful Names**: Use descriptive, intention-revealing names
4. **Small Functions**: Functions should do one thing well
5. **Comments**: Code should be self-documenting; use comments sparingly

## Refactoring Techniques

- **Extract Method**: Break long functions into smaller ones
- **Rename**: Use clear, descriptive names
- **Remove Dead Code**: Delete unused code
- **Simplify Conditionals**: Use guard clauses and early returns
- **Replace Magic Numbers**: Use named constants

## JWT Authentication

JSON Web Tokens (JWT) provide stateless authentication.

### Structure:
\`\`\`
header.payload.signature
\`\`\`

### Flow:
1. User logs in with credentials
2. Server validates and issues JWT
3. Client stores JWT (localStorage/cookie)
4. Client sends JWT in Authorization header
5. Server validates JWT signature and grants access

### Security Best Practices:
✅ Use strong secret keys
✅ Set appropriate expiration times
✅ Implement token refresh mechanism
✅ Validate tokens on every protected route
✅ Never store sensitive data in JWT payload
      `.trim(),
      resources: {
        articles: [
          { title: 'Clean Code Summary', url: '#' },
          { title: 'JWT.io Introduction', url: 'https://jwt.io/introduction' },
        ],
        videos: [
          { title: 'Refactoring Techniques', duration: '15:00', url: '#' },
        ],
      },
      requiredScore: 75,
    },
});

  console.log(`  ✅ Created: ${backendUnit2.title}`);

  // UNIT 4: Security & Best Practices
  const backendUnit3 = await findOrCreateUnit({

      slug: 'security-best-practices',
      title: 'Security & Best Practices',
      description: 'Master security vulnerabilities, code review techniques, and defensive programming',
      moduleId: backendModule.id,
      orderInModule: 4,
      iconImage: 'security.png',
      theme: {
        color: '#6d28d9',
        gradient: ['#6d28d9', '#5b21b6'],
        icon: '🛡️',
      },
      learningObjectives: [
        'Identify common security vulnerabilities (OWASP Top 10)',
        'Conduct effective code reviews with security focus',
        'Apply defensive programming techniques',
        'Implement secure coding practices',
      ],
      estimatedMinutes: 150,
      theoryContent: `
# Security & Best Practices

## OWASP Top 10 Vulnerabilities

1. **Injection**: SQL, NoSQL, OS command injection
2. **Broken Authentication**: Session management flaws
3. **Sensitive Data Exposure**: Inadequate encryption
4. **XML External Entities (XXE)**: XML processor vulnerabilities
5. **Broken Access Control**: Improper permission checks
6. **Security Misconfiguration**: Default configs, verbose errors
7. **Cross-Site Scripting (XSS)**: Untrusted data in web pages
8. **Insecure Deserialization**: Object manipulation attacks
9. **Using Components with Known Vulnerabilities**: Outdated dependencies
10. **Insufficient Logging & Monitoring**: Lack of audit trails

## Code Review Best Practices

### What to Look For:

- **Security**: Input validation, authentication, authorization
- **Logic**: Edge cases, error handling, race conditions
- **Performance**: Algorithms, database queries, caching
- **Maintainability**: Code structure, naming, documentation
- **Testing**: Test coverage, test quality

### Review Checklist:

✅ Are inputs validated and sanitized?
✅ Are sensitive operations authenticated/authorized?
✅ Are errors handled gracefully?
✅ Is sensitive data encrypted?
✅ Are dependencies up to date?
✅ Is the code well-tested?

## Defensive Programming

Write code that anticipates and handles failures gracefully:

- Validate all inputs
- Use type checking
- Handle errors explicitly
- Fail fast and loudly in development
- Log security-relevant events
- Use least privilege principle
      `.trim(),
      resources: {
        articles: [
          { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
          { title: 'Secure Coding Practices', url: '#' },
        ],
        videos: [
          { title: 'Web Security Essentials', duration: '20:00', url: '#' },
        ],
      },
      requiredScore: 80,
    },
});

  console.log(`  ✅ Created: ${backendUnit3.title}\n`);

  // ============================================================================
  // STEP 3: Create Levels for Backend Units
  // ============================================================================

  console.log('🎮 Creating levels for Backend units...');

  // Backend Unit 1 - REST API Fundamentals
  const backendLevel1 = await prisma.level.create({

      unitId: backendUnit1.id,
      orderInUnit: 0,
      type: 'LESSON',
      icon: '📚',
      title: 'REST Basics Tutorial',
      description: 'Learn REST fundamentals step-by-step',
      config: {
        showTheoryFirst: true,
        allowAI: true,
        trackDI: true,
        maxAIUsagePercent: 50,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 25,
    },
});

  const backendLevel2 = await prisma.level.create({

      unitId: backendUnit1.id,
      orderInUnit: 1,
      type: 'PRACTICE',
      icon: '⚡',
      title: 'Build GET Endpoint',
      description: 'Create your first functional GET endpoint',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 35,
    },
});

  const backendLevel3 = await prisma.level.create({

      unitId: backendUnit1.id,
      orderInUnit: 2,
      type: 'PRACTICE',
      icon: '🐛',
      title: 'Debug Broken Route',
      description: 'Find and fix the bug in the route handler',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
        debugMode: true,
      },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  console.log(`  ✅ Created 3 levels for ${backendUnit1.title}`);

  // Backend Unit 2 - Architecture & Refactoring
  const backendLevel4 = await prisma.level.create({

      unitId: backendUnit2.id,
      orderInUnit: 0,
      type: 'LESSON',
      icon: '🔧',
      title: 'Refactoring Tutorial',
      description: 'Learn clean code refactoring techniques',
      config: {
        showTheoryFirst: true,
        allowAI: true,
        trackDI: true,
        beforeAfterComparison: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  const backendLevel5 = await prisma.level.create({

      unitId: backendUnit2.id,
      orderInUnit: 1,
      type: 'STORY',
      icon: '📖',
      title: 'Story: The Auth Crisis',
      description: 'Interactive narrative about JWT authentication',
      config: {
        allowAI: false,
        narrative: true,
        choices: true,
        characterDialogue: true,
      },
      adaptive: false,
      blocking: false,
      optional: true,
      bonusXp: 100,
    },
});

  const backendLevel6 = await prisma.level.create({

      unitId: backendUnit2.id,
      orderInUnit: 2,
      type: 'PRACTICE',
      icon: '🔐',
      title: 'Implement Authentication',
      description: 'Build a complete JWT authentication system',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
        complexChallenge: true,
      },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 75,
    },
});

  console.log(`  ✅ Created 3 levels for ${backendUnit2.title}`);

  // Backend Unit 3 - Security & Best Practices
  const backendLevel7 = await prisma.level.create({

      unitId: backendUnit3.id,
      orderInUnit: 0,
      type: 'PRACTICE',
      icon: '🛡️',
      title: 'Security Code Review',
      description: 'Identify and fix security vulnerabilities',
      config: {
        allowAI: false,
        reviewMode: true,
        securityFocus: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 75,
    },
});

  const backendLevel8 = await prisma.level.create({

      unitId: backendUnit3.id,
      orderInUnit: 1,
      type: 'UNIT_REVIEW',
      icon: '🎯',
      title: 'Backend Unit Review',
      description: 'Comprehensive test of all backend concepts',
      config: {
        allowAI: false,
        reviewMode: true,
        mixedChallenges: true,
        requiredScore: 80,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      timeLimit: 3600,
      bonusXp: 200,
    },
});

  const backendLevel9 = await prisma.level.create({

      unitId: backendUnit3.id,
      orderInUnit: 2,
      type: 'XP_RAMP_UP',
      icon: '⭐',
      title: 'Backend XP Bonus',
      description: 'Complete for massive XP boost',
      config: {
        allowAI: true,
        xpMultiplier: 3,
        perfectBonus: true,
      },
      adaptive: false,
      blocking: false,
      optional: true,
      bonusXp: 500,
    },
});

  console.log(`  ✅ Created 3 levels for ${backendUnit3.title}\n`);

  // ============================================================================
  // STEP 4: Connect Challenges to Levels (Backend)
  // ============================================================================

  console.log('🔗 Connecting Backend challenges to levels...');

  const backendChallenges = challenges.filter(c => c.moduleId === backendModule.id);

  // Map challenges by orderInModule
  const [c1, c2, c3, c4, c5, c6, c7, c8] = backendChallenges;

  const backendConnections = [
    { levelId: backendLevel1.id, challengeId: c1.id, orderInLevel: 1, required: true },
    { levelId: backendLevel2.id, challengeId: c2.id, orderInLevel: 1, required: true },
    { levelId: backendLevel3.id, challengeId: c3.id, orderInLevel: 1, required: true },
    { levelId: backendLevel4.id, challengeId: c4.id, orderInLevel: 1, required: true },
    { levelId: backendLevel5.id, challengeId: c5.id, orderInLevel: 1, required: true },
    { levelId: backendLevel6.id, challengeId: c6.id, orderInLevel: 1, required: true },
    { levelId: backendLevel7.id, challengeId: c7.id, orderInLevel: 1, required: true },
    { levelId: backendLevel8.id, challengeId: c8.id, orderInLevel: 1, required: true },
  ];

  await prisma.levelChallenge.createMany({
    data: backendConnections,
});

  console.log(`  ✅ Connected ${backendConnections.length} challenges\n`);

  // ============================================================================
  // STEP 5: Create Units for Frontend Module
  // ============================================================================

  console.log('🏗️  Creating Frontend Module units...');

  const frontendModule = moduleMap.get('frontend');
  if (!frontendModule) throw new Error('Frontend module not found');

  // UNIT 1: React Fundamentals
  const frontendUnit1 = await findOrCreateUnit({

      slug: 'react-fundamentals',
      title: 'React Fundamentals',
      description: 'Master React core concepts, components, and state management',
      moduleId: frontendModule.id,
      orderInModule: 1,
      iconImage: 'react.png',
      theme: {
        color: '#61dafb',
        gradient: ['#61dafb', '#21a1c4'],
        icon: '⚛️',
      },
      learningObjectives: [
        'Understand React component lifecycle and hooks',
        'Build reusable and composable components',
        'Manage component state effectively',
        'Debug common React UI issues',
      ],
      estimatedMinutes: 165,
      theoryContent: `
# React Fundamentals

## What is React?

React is a JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user experience.

## Core Concepts

### 1. Components

Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### 2. Props

Props (short for properties) are how you pass data from parent to child components.

### 3. State

State is data that changes over time. Use the \`useState\` hook to manage state in functional components.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### 4. Hooks

Hooks let you use state and other React features without writing a class.

Common hooks:
- \`useState\`: Manage state
- \`useEffect\`: Handle side effects
- \`useContext\`: Access context
- \`useRef\`: Reference DOM elements

## Best Practices

✅ Keep components small and focused
✅ Use props for configuration, state for data that changes
✅ Lift state up when multiple components need it
✅ Use keys when rendering lists
✅ Follow naming conventions (PascalCase for components)
      `.trim(),
      resources: {
        articles: [
          { title: 'React Official Docs', url: 'https://react.dev' },
          { title: 'Thinking in React', url: 'https://react.dev/learn/thinking-in-react' },
        ],
        videos: [
          { title: 'React in 100 Seconds', duration: '2:00', url: '#' },
        ],
      },
      requiredScore: 70,
    },
});

  console.log(`  ✅ Created: ${frontendUnit1.title}`);

  // UNIT 2: UI/UX Advanced
  const frontendUnit2 = await findOrCreateUnit({

      slug: 'ui-ux-advanced',
      title: 'UI/UX Advanced',
      description: 'Master responsive design, accessibility, and modern UI patterns',
      moduleId: frontendModule.id,
      orderInModule: 2,
      iconImage: 'ui-ux.png',
      theme: {
        color: '#0891b2',
        gradient: ['#0891b2', '#0e7490'],
        icon: '🎨',
      },
      learningObjectives: [
        'Build responsive layouts with modern CSS',
        'Implement accessibility best practices',
        'Create polished user experiences',
        'Master CSS-in-JS and styling patterns',
      ],
      estimatedMinutes: 120,
      theoryContent: `
# UI/UX Advanced

## Responsive Design

Create layouts that adapt to different screen sizes.

### Techniques:

1. **Flexbox**: One-dimensional layouts
2. **Grid**: Two-dimensional layouts
3. **Media Queries**: Conditional styles based on screen size
4. **Mobile-First**: Start with mobile, enhance for larger screens

\`\`\`css
/* Mobile first */
.container { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
  .container { width: 750px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { width: 1000px; }
}
\`\`\`

## Accessibility (a11y)

Make your applications usable by everyone.

### Key Principles:

✅ **Semantic HTML**: Use proper HTML elements
✅ **ARIA Labels**: Add labels for screen readers
✅ **Keyboard Navigation**: Ensure all features work with keyboard
✅ **Color Contrast**: Meet WCAG contrast ratios
✅ **Focus Management**: Visible focus indicators

## Modern CSS

- **CSS Variables**: Reusable values
- **CSS Grid**: Powerful layout system
- **Animations**: Smooth transitions
- **CSS-in-JS**: Styled-components, Emotion
      `.trim(),
      resources: {
        articles: [
          { title: 'Responsive Web Design', url: '#' },
          { title: 'Web Accessibility Guide', url: '#' },
        ],
        videos: [
          { title: 'CSS Grid in 100 Seconds', duration: '2:00', url: '#' },
        ],
      },
      requiredScore: 75,
    },
});

  console.log(`  ✅ Created: ${frontendUnit2.title}\n`);

  // ============================================================================
  // STEP 6: Create Levels for Frontend Units
  // ============================================================================

  console.log('🎮 Creating levels for Frontend units...');

  // Frontend Unit 1 - React Fundamentals
  const frontendLevel1 = await prisma.level.create({

      unitId: frontendUnit1.id,
      orderInUnit: 0,
      type: 'LESSON',
      icon: '📚',
      title: 'React Basics Tutorial',
      description: 'Learn React fundamentals step-by-step',
      config: {
        showTheoryFirst: true,
        allowAI: true,
        trackDI: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 35,
    },
});

  const frontendLevel2 = await prisma.level.create({

      unitId: frontendUnit1.id,
      orderInUnit: 1,
      type: 'PRACTICE',
      icon: '⚛️',
      title: 'Build Reusable Components',
      description: 'Create modular React components',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  const frontendLevel3 = await prisma.level.create({

      unitId: frontendUnit1.id,
      orderInUnit: 2,
      type: 'PRACTICE',
      icon: '🐛',
      title: 'Debug Broken UI',
      description: 'Find and fix React UI bugs',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
        debugMode: true,
      },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  console.log(`  ✅ Created 3 levels for ${frontendUnit1.title}`);

  // Frontend Unit 2 - UI/UX Advanced
  const frontendLevel4 = await prisma.level.create({

      unitId: frontendUnit2.id,
      orderInUnit: 0,
      type: 'PRACTICE',
      icon: '📱',
      title: 'Responsive Design',
      description: 'Make your UI responsive across devices',
      config: {
        allowAI: true,
        trackDI: true,
        hints: true,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  const frontendLevel5 = await prisma.level.create({

      unitId: frontendUnit2.id,
      orderInUnit: 1,
      type: 'UNIT_REVIEW',
      icon: '🎯',
      title: 'Frontend Review',
      description: 'Test your React and UI/UX knowledge',
      config: {
        allowAI: false,
        reviewMode: true,
        mixedChallenges: true,
        requiredScore: 75,
      },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 200,
    },
});

  const frontendLevel6 = await prisma.level.create({

      unitId: frontendUnit2.id,
      orderInUnit: 2,
      type: 'MATCH_MADNESS',
      icon: '🎮',
      title: 'CSS Properties Match',
      description: 'Fast-paced CSS matching game',
      config: {
        allowAI: false,
        gameMode: true,
        matchingPairs: 10,
        speedBonus: true,
      },
      adaptive: false,
      blocking: false,
      optional: true,
      timeLimit: 120,
      bonusXp: 150,
    },
});

  console.log(`  ✅ Created 3 levels for ${frontendUnit2.title}\n`);

  // ============================================================================
  // STEP 7: Connect Frontend Challenges
  // ============================================================================

  console.log('🔗 Connecting Frontend challenges to levels...');

  const frontendChallenges = challenges.filter(c => c.moduleId === frontendModule.id);
  const [f1, f2, f3, f4, f5] = frontendChallenges;

  const frontendConnections = [
    { levelId: frontendLevel1.id, challengeId: f1.id, orderInLevel: 1, required: true },
    { levelId: frontendLevel2.id, challengeId: f2.id, orderInLevel: 1, required: true },
    { levelId: frontendLevel3.id, challengeId: f3.id, orderInLevel: 1, required: true },
    { levelId: frontendLevel4.id, challengeId: f4.id, orderInLevel: 1, required: true },
    { levelId: frontendLevel5.id, challengeId: f5.id, orderInLevel: 1, required: true },
  ];

  await prisma.levelChallenge.createMany({
    data: frontendConnections,
});

  console.log(`  ✅ Connected ${frontendConnections.length} challenges\n`);

  // ============================================================================
  // STEP 8: Create Units for DevOps Module
  // ============================================================================

  console.log('🏗️  Creating DevOps Module units...');

  const devopsModule = moduleMap.get('devops');
  if (!devopsModule) throw new Error('DevOps module not found');

  // UNIT 1: Containerization & CI/CD
  const devopsUnit1 = await findOrCreateUnit({

      slug: 'containerization-cicd',
      title: 'Containerization & CI/CD',
      description: 'Master Docker, containerization concepts, and continuous integration/deployment pipelines',
      moduleId: devopsModule.id,
      orderInModule: 1,
      iconImage: 'docker.png',
      theme: {
        color: '#10b981',
        gradient: ['#10b981', '#059669'],
        icon: '🐳',
      },
      learningObjectives: [
        'Understand Docker fundamentals and containerization benefits',
        'Build efficient Docker images with multi-stage builds',
        'Design and implement CI/CD pipelines',
        'Debug deployment issues effectively',
      ],
      estimatedMinutes: 210,
      theoryContent: `
# Containerization & CI/CD

## Docker Fundamentals

Docker packages applications with their dependencies into containers, ensuring consistency across environments.

### Key Concepts:

1. **Images**: Read-only templates with application code and dependencies
2. **Containers**: Running instances of images
3. **Dockerfile**: Instructions to build an image
4. **Volumes**: Persistent data storage
5. **Networks**: Container communication

### Best Practices:

✅ Use official base images
✅ Minimize layers (combine RUN commands)
✅ Use multi-stage builds for smaller images
✅ Don't run containers as root
✅ Scan images for vulnerabilities

## CI/CD Pipelines

Continuous Integration/Deployment automates testing and deployment.

### CI/CD Stages:

1. **Build**: Compile and package code
2. **Test**: Run automated tests
3. **Deploy**: Ship to staging/production
4. **Monitor**: Track application health

### Pipeline Best Practices:

✅ Fail fast with unit tests
✅ Parallel test execution
✅ Environment parity (dev/staging/prod)
✅ Automated rollbacks
✅ Security scanning in pipeline
      `.trim(),
      resources: {
        articles: [
          { title: 'Docker Best Practices', url: 'https://docs.docker.com/develop/dev-best-practices/' },
          { title: 'CI/CD Pipeline Design', url: '#' },
        ],
        videos: [
          { title: 'Docker in 100 Seconds', duration: '2:00', url: '#' },
        ],
      },
      requiredScore: 70,
    },
});

  console.log(`  ✅ Created: ${devopsUnit1.title}`);

  // UNIT 2: Advanced Orchestration
  const devopsUnit2 = await findOrCreateUnit({

      slug: 'advanced-orchestration',
      title: 'Advanced Orchestration',
      description: 'Learn Kubernetes orchestration, scaling, and production-grade deployments',
      moduleId: devopsModule.id,
      orderInModule: 2,
      iconImage: 'kubernetes.png',
      theme: {
        color: '#059669',
        gradient: ['#059669', '#047857'],
        icon: '☸️',
      },
      learningObjectives: [
        'Understand Kubernetes architecture and components',
        'Deploy and manage containerized applications',
        'Implement auto-scaling and load balancing',
        'Troubleshoot production deployments',
      ],
      estimatedMinutes: 240,
      theoryContent: `
# Advanced Orchestration with Kubernetes

## Kubernetes Architecture

Kubernetes (K8s) is a container orchestration platform for automating deployment, scaling, and management.

### Core Components:

1. **Pods**: Smallest deployable units
2. **Services**: Stable network endpoints
3. **Deployments**: Declarative updates
4. **ConfigMaps/Secrets**: Configuration management
5. **Ingress**: External access

### Key Features:

- **Self-healing**: Automatic restarts and replacements
- **Auto-scaling**: Based on metrics
- **Rolling updates**: Zero-downtime deployments
- **Service discovery**: Automatic DNS

## Production Best Practices:

✅ Use resource limits and requests
✅ Implement health checks (liveness/readiness)
✅ Use namespaces for isolation
✅ Enable RBAC for security
✅ Monitor with Prometheus/Grafana
✅ Implement GitOps workflows
      `.trim(),
      resources: {
        articles: [
          { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/' },
          { title: 'K8s Production Best Practices', url: '#' },
        ],
        videos: [
          { title: 'Kubernetes Explained', duration: '10:00', url: '#' },
        ],
      },
      requiredScore: 80,
    },
});

  console.log(`  ✅ Created: ${devopsUnit2.title}\n`);

  // ============================================================================
  // STEP 9: Create Levels for DevOps Units
  // ============================================================================

  console.log('🎮 Creating levels for DevOps units...');

  const devopsLevel1 = await prisma.level.create({

      unitId: devopsUnit1.id,
      orderInUnit: 0,
      type: 'LESSON',
      icon: '🐳',
      title: 'Docker Basics',
      description: 'Learn containerization fundamentals',
      config: { showTheoryFirst: true, allowAI: true, trackDI: true },
      adaptive: false,
      blocking: true,
      optional: false,
      bonusXp: 50,
    },
});

  const devopsLevel2 = await prisma.level.create({

      unitId: devopsUnit1.id,
      orderInUnit: 1,
      type: 'PRACTICE',
      icon: '🔄',
      title: 'Build CI/CD Pipeline',
      description: 'Create automated deployment pipeline',
      config: { allowAI: true, trackDI: true, hints: true },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 75,
    },
});

  const devopsLevel3 = await prisma.level.create({

      unitId: devopsUnit1.id,
      orderInUnit: 2,
      type: 'PRACTICE',
      icon: '🐛',
      title: 'Debug Failed Deploy',
      description: 'Troubleshoot deployment issues',
      config: { allowAI: true, trackDI: true, debugMode: true },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 75,
    },
});

  console.log(`  ✅ Created 3 levels for ${devopsUnit1.title}`);

  const devopsLevel4 = await prisma.level.create({

      unitId: devopsUnit2.id,
      orderInUnit: 0,
      type: 'PRACTICE',
      icon: '☸️',
      title: 'Kubernetes Deployment',
      description: 'Deploy apps to Kubernetes cluster',
      config: { allowAI: true, trackDI: true, hints: true, complexChallenge: true },
      adaptive: true,
      blocking: true,
      optional: false,
      bonusXp: 100,
    },
});

  const devopsLevel5 = await prisma.level.create({

      unitId: devopsUnit2.id,
      orderInUnit: 1,
      type: 'UNIT_REVIEW',
      icon: '🎯',
      title: 'DevOps Review',
      description: 'Comprehensive DevOps assessment',
      config: { allowAI: false, reviewMode: true, mixedChallenges: true, requiredScore: 80 },
      adaptive: false,
      blocking: true,
      optional: false,
      timeLimit: 3600,
      bonusXp: 200,
    },
});

  const devopsLevel6 = await prisma.level.create({

      unitId: devopsUnit2.id,
      orderInUnit: 2,
      type: 'RAPID_REVIEW',
      icon: '⚡',
      title: 'Commands Quick Quiz',
      description: 'Fast review of Docker/K8s commands',
      config: { allowAI: false, rapidMode: true, questionCount: 15, timePerQuestion: 30 },
      adaptive: false,
      blocking: false,
      optional: true,
      timeLimit: 450,
      bonusXp: 100,
    },
});

  console.log(`  ✅ Created 3 levels for ${devopsUnit2.title}\n`);

  // Connect DevOps challenges
  console.log('🔗 Connecting DevOps challenges to levels...');
  const devopsChallenges = challenges.filter(c => c.moduleId === devopsModule.id);
  const [d1, d2, d3, d4, d5] = devopsChallenges;

  await prisma.levelChallenge.createMany({
    data: [
      { levelId: devopsLevel1.id, challengeId: d1.id, orderInLevel: 1, required: true },
      { levelId: devopsLevel2.id, challengeId: d2.id, orderInLevel: 1, required: true },
      { levelId: devopsLevel3.id, challengeId: d3.id, orderInLevel: 1, required: true },
      { levelId: devopsLevel4.id, challengeId: d4.id, orderInLevel: 1, required: true },
      { levelId: devopsLevel5.id, challengeId: d5.id, orderInLevel: 1, required: true },
    ],
});

  console.log(`  ✅ Connected 5 challenges\n`);

  // ============================================================================
  // STEP 10: Create Units for Mobile Module
  // ============================================================================

  console.log('🏗️  Creating Mobile Module units...');

  const mobileModule = moduleMap.get('mobile');
  if (!mobileModule) throw new Error('Mobile module not found');

  const mobileUnit1 = await findOrCreateUnit({

      slug: 'react-native-essentials',
      title: 'React Native Essentials',
      description: 'Build cross-platform mobile apps with React Native',
      moduleId: mobileModule.id,
      orderInModule: 1,
      iconImage: 'react-native.png',
      theme: {
        color: '#ec4899',
        gradient: ['#ec4899', '#db2777'],
        icon: '📱',
      },
      learningObjectives: [
        'Understand React Native fundamentals',
        'Build native mobile UI components',
        'Implement navigation patterns',
        'Debug mobile-specific issues',
      ],
      estimatedMinutes: 225,
      theoryContent: `
# React Native Essentials

React Native enables building mobile apps using React and JavaScript.

## Core Concepts:

1. **Native Components**: Platform-specific UI elements
2. **Bridge**: JavaScript ↔ Native communication
3. **Hot Reloading**: Instant feedback during development
4. **Platform-Specific Code**: iOS/Android differences

## Navigation:

Use React Navigation for routing and navigation stacks.

## Best Practices:

✅ Use FlatList for long lists
✅ Optimize images and assets
✅ Handle platform differences gracefully
✅ Test on real devices
✅ Implement proper error boundaries
      `.trim(),
      resources: {
        articles: [
          { title: 'React Native Docs', url: 'https://reactnative.dev' },
        ],
        videos: [
          { title: 'React Native Crash Course', duration: '15:00', url: '#' },
        ],
      },
      requiredScore: 70,
    },
});

  const mobileUnit2 = await findOrCreateUnit({

      slug: 'performance-architecture',
      title: 'Performance & Architecture',
      description: 'Optimize mobile app performance and implement clean architecture',
      moduleId: mobileModule.id,
      orderInModule: 2,
      iconImage: 'performance.png',
      theme: {
        color: '#db2777',
        gradient: ['#db2777', '#be185d'],
        icon: '⚡',
      },
      learningObjectives: [
        'Profile and optimize app performance',
        'Implement efficient state management',
        'Apply clean architecture patterns',
        'Handle memory and battery optimization',
      ],
      estimatedMinutes: 180,
      theoryContent: `
# Mobile Performance & Architecture

## Performance Optimization:

1. **List Rendering**: Use FlatList with proper keys
2. **Image Optimization**: Compress and lazy-load
3. **Memory Management**: Avoid memory leaks
4. **Bundle Size**: Code splitting and lazy loading

## Clean Architecture:

Separate concerns into layers:
- **Presentation**: UI components
- **Domain**: Business logic
- **Data**: API calls and storage

## Best Practices:

✅ Use React.memo for expensive renders
✅ Implement proper cleanup in useEffect
✅ Monitor JS thread performance
✅ Use native modules for CPU-intensive tasks
      `.trim(),
      resources: {
        articles: [
          { title: 'RN Performance Guide', url: '#' },
        ],
        videos: [],
      },
      requiredScore: 75,
    },
});

  console.log(`  ✅ Created: ${mobileUnit1.title}`);
  console.log(`  ✅ Created: ${mobileUnit2.title}\n`);

  // Create Mobile Levels
  console.log('🎮 Creating levels for Mobile units...');

  const mobileLevels = await Promise.all([
    prisma.level.create({
  
        unitId: mobileUnit1.id,
        orderInUnit: 0,
        type: 'LESSON',
        icon: '📱',
        title: 'React Native Intro',
        config: { showTheoryFirst: true, allowAI: true, trackDI: true },
        adaptive: false,
        blocking: true,
        optional: false,
        bonusXp: 50,
      },
    }),
    prisma.level.create({
  
        unitId: mobileUnit1.id,
        orderInUnit: 1,
        type: 'PRACTICE',
        icon: '🧭',
        title: 'Mobile Navigation',
        config: { allowAI: true, trackDI: true, hints: true },
        adaptive: false,
        blocking: true,
        optional: false,
        bonusXp: 50,
      },
    }),
    prisma.level.create({
  
        unitId: mobileUnit1.id,
        orderInUnit: 2,
        type: 'PRACTICE',
        icon: '🐛',
        title: 'Debug Performance',
        config: { allowAI: true, trackDI: true, debugMode: true },
        adaptive: true,
        blocking: true,
        optional: false,
        bonusXp: 75,
      },
    }),
    prisma.level.create({
  
        unitId: mobileUnit2.id,
        orderInUnit: 0,
        type: 'PRACTICE',
        icon: '🔧',
        title: 'Refactor Components',
        config: { allowAI: true, trackDI: true, hints: true },
        adaptive: false,
        blocking: true,
        optional: false,
        bonusXp: 75,
      },
    }),
    prisma.level.create({
  
        unitId: mobileUnit2.id,
        orderInUnit: 1,
        type: 'UNIT_REVIEW',
        icon: '🎯',
        title: 'Mobile Review',
        config: { allowAI: false, reviewMode: true, requiredScore: 75 },
        adaptive: false,
        blocking: true,
        optional: false,
        bonusXp: 200,
      },
    }),
    prisma.level.create({
  
        unitId: mobileUnit2.id,
        orderInUnit: 2,
        type: 'XP_RAMP_UP',
        icon: '⭐',
        title: 'Mobile XP Bonus',
        config: { allowAI: true, xpMultiplier: 3 },
        adaptive: false,
        blocking: false,
        optional: true,
        bonusXp: 500,
      },
    }),
  ]);

  console.log(`  ✅ Created 6 levels for Mobile units\n`);

  // Connect Mobile challenges
  console.log('🔗 Connecting Mobile challenges to levels...');
  const mobileChallenges = challenges.filter(c => c.moduleId === mobileModule.id);
  await prisma.levelChallenge.createMany({
    data: mobileChallenges.map((ch, idx) => ({
      levelId: mobileLevels[idx].id,
      challengeId: ch.id,
      orderInLevel: 1,
      required: true,
    })),
});
  console.log(`  ✅ Connected 5 challenges\n`);

  // ============================================================================
  // STEP 11: Create Units for Data Module
  // ============================================================================

  console.log('🏗️  Creating Data Module units...');

  const dataModule = moduleMap.get('data');
  if (!dataModule) throw new Error('Data module not found');

  const dataUnit1 = await findOrCreateUnit({

      slug: 'advanced-database',
      title: 'Advanced Database',
      description: 'Master advanced SQL, query optimization, and ETL processes',
      moduleId: dataModule.id,
      orderInModule: 1,
      iconImage: 'database.png',
      theme: {
        color: '#3b82f6',
        gradient: ['#3b82f6', '#2563eb'],
        icon: '📊',
      },
      learningObjectives: [
        'Write complex SQL queries with joins and subqueries',
        'Optimize slow queries with indexes and EXPLAIN',
        'Design efficient ETL pipelines',
        'Debug query performance issues',
      ],
      estimatedMinutes: 240,
      theoryContent: `
# Advanced Database & SQL

## Query Optimization:

1. **Indexes**: Speed up lookups
2. **EXPLAIN**: Analyze query execution
3. **Joins**: Understand join types (INNER, LEFT, RIGHT)
4. **Subqueries vs CTEs**: Choose the right approach

## ETL (Extract, Transform, Load):

Process of moving data between systems:
1. **Extract**: Pull data from sources
2. **Transform**: Clean and format data
3. **Load**: Insert into target database

## Best Practices:

✅ Use prepared statements (prevent SQL injection)
✅ Add indexes on frequently queried columns
✅ Avoid SELECT * in production
✅ Use transactions for data consistency
✅ Monitor slow query logs
      `.trim(),
      resources: {
        articles: [
          { title: 'SQL Performance Guide', url: '#' },
        ],
        videos: [],
      },
      requiredScore: 75,
    },
});

  const dataUnit2 = await findOrCreateUnit({

      slug: 'data-engineering',
      title: 'Data Engineering',
      description: 'Build data warehouses and implement analytics infrastructure',
      moduleId: dataModule.id,
      orderInModule: 2,
      iconImage: 'data-warehouse.png',
      theme: {
        color: '#2563eb',
        gradient: ['#2563eb', '#1d4ed8'],
        icon: '🏢',
      },
      learningObjectives: [
        'Design scalable data warehouse architectures',
        'Implement dimensional modeling',
        'Build analytics pipelines',
        'Master data quality and governance',
      ],
      estimatedMinutes: 270,
      theoryContent: `
# Data Engineering & Warehousing

## Data Warehouse:

Central repository for structured data from multiple sources.

### Architecture:

1. **Staging**: Raw data ingestion
2. **Integration**: Data transformation
3. **Access**: Query and analytics layer

### Dimensional Modeling:

- **Facts**: Measurable events
- **Dimensions**: Descriptive attributes
- **Star Schema**: Facts surrounded by dimensions

## Best Practices:

✅ Implement slowly changing dimensions (SCD)
✅ Use partitioning for large tables
✅ Establish data quality checks
✅ Document data lineage
✅ Automate data pipeline testing
      `.trim(),
      resources: {
        articles: [
          { title: 'Data Warehouse Design', url: '#' },
        ],
        videos: [],
      },
      requiredScore: 80,
    },
});

  console.log(`  ✅ Created: ${dataUnit1.title}`);
  console.log(`  ✅ Created: ${dataUnit2.title}\n`);

  // Create Data Levels
  console.log('🎮 Creating levels for Data units...');

  const dataLevels = await Promise.all([
    prisma.level.create({
  
        unitId: dataUnit1.id,
        orderInUnit: 0,
        type: 'LESSON',
        icon: '📚',
        title: 'Advanced SQL',
        config: { showTheoryFirst: true, allowAI: true, trackDI: true },
        adaptive: false,
        blocking: true,
        optional: false,
        bonusXp: 75,
      },
    }),
    prisma.level.create({
  
        unitId: dataUnit1.id,
        orderInUnit: 1,
        type: 'PRACTICE',
        icon: '🔄',
        title: 'ETL Pipeline',
        config: { allowAI: true, trackDI: true, hints: true, complexChallenge: true },
        adaptive: true,
        blocking: true,
        optional: false,
        bonusXp: 100,
      },
    }),
    prisma.level.create({
  
        unitId: dataUnit1.id,
        orderInUnit: 2,
        type: 'PRACTICE',
        icon: '🐛',
        title: 'Optimize Slow Query',
        config: { allowAI: true, trackDI: true, debugMode: true },
        adaptive: true,
        blocking: true,
        optional: false,
        bonusXp: 100,
      },
    }),
    prisma.level.create({
  
        unitId: dataUnit2.id,
        orderInUnit: 0,
        type: 'PRACTICE',
        icon: '🏢',
        title: 'Data Warehouse',
        config: { allowAI: true, trackDI: true, hints: true, complexChallenge: true },
        adaptive: true,
        blocking: true,
        optional: false,
        bonusXp: 125,
      },
    }),
    prisma.level.create({
  
        unitId: dataUnit2.id,
        orderInUnit: 1,
        type: 'UNIT_REVIEW',
        icon: '🎯',
        title: 'Data Review',
        config: { allowAI: false, reviewMode: true, requiredScore: 80 },
        adaptive: false,
        blocking: true,
        optional: false,
        timeLimit: 3600,
        bonusXp: 200,
      },
    }),
    prisma.level.create({
  
        unitId: dataUnit2.id,
        orderInUnit: 2,
        type: 'XP_RAMP_UP',
        icon: '⭐',
        title: 'Data Master Bonus',
        config: { allowAI: true, xpMultiplier: 3, perfectBonus: true },
        adaptive: false,
        blocking: false,
        optional: true,
        bonusXp: 500,
      },
    }),
  ]);

  console.log(`  ✅ Created 6 levels for Data units\n`);

  // Connect Data challenges
  console.log('🔗 Connecting Data challenges to levels...');
  const dataChallenges = challenges.filter(c => c.moduleId === dataModule.id);
  await prisma.levelChallenge.createMany({
    data: dataChallenges.map((ch, idx) => ({
      levelId: dataLevels[idx].id,
      challengeId: ch.id,
      orderInLevel: 1,
      required: true,
    })),
});
  console.log(`  ✅ Connected 5 challenges\n`);

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================

  console.log('✅ Migration completed successfully!\n');

  const totalUnitsCreated = 5 + 2 + 2 + 2 + 2; // Backend(3) + Frontend(2) + DevOps(2) + Mobile(2) + Data(2) = 11 (plus 1 existing)
  const totalLevelsCreated = 9 + 6 + 6 + 6 + 6; // 33 new levels
  const totalChallengesConnected = 8 + 5 + 5 + 5 + 5; // 28 challenges

  console.log('📊 Final Migration Statistics:');
  console.log(`   ✅ Modules processed: 5/5`);
  console.log(`   ✅ Units created: ${totalUnitsCreated} (11 new + 1 existing = 12 total)`);
  console.log(`   ✅ Levels created: ${totalLevelsCreated} (33 new + 1 existing = 34 total)`);
  console.log(`   ✅ Challenges connected: ${totalChallengesConnected}/28`);
  console.log('\n🎉 Phase 1 Migration Complete!');
  console.log('   All modules, units, levels, and challenges migrated successfully\n');
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});
