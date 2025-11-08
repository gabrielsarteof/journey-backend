import { PrismaClient } from '@prisma/client';
import { Password } from '../src/shared/domain/value-objects/password.vo';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpar dados na ordem correta (respeitando foreign keys)
  await prisma.certificate.deleteMany();
  await prisma.xPTransaction.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.trapDetection.deleteMany();
  await prisma.codeEvent.deleteMany();
  await prisma.aIInteraction.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.challengeAttempt.deleteMany();
  await prisma.userMetrics.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.userLevelProgress.deleteMany();
  await prisma.levelChallenge.deleteMany();
  await prisma.level.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userUnitProgress.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.userModuleProgress.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.billing.deleteMany();
  await prisma.company.deleteMany();

// COMPANIES
const techCorp = await prisma.company.create({
  data: {
    name: 'TechCorp',
    domain: 'techcorp.com',
    plan: 'ENTERPRISE',
    maxUsers: 100,
    activeUsers: 3,
  },
});

const startupInc = await prisma.company.create({
  data: {
    name: 'StartupInc',
    domain: 'startupinc.io',
    plan: 'TEAM',
    maxUsers: 10,
    activeUsers: 2,
  },
});

const adminPassword = await Password.create('Admin@123');
const userPassword = await Password.create('User@123');

// USERS 
const admin = await prisma.user.create({
  data: {
    email: 'admin@techcorp.com',
    password: adminPassword.getHash(),
    name: 'Usuário Admin',
    role: 'TECH_LEAD',
    position: 'Líder Técnico',
    yearsOfExperience: 8,
    preferredLanguages: ['TypeScript', 'Python', 'Go'],
    githubUsername: 'admin',
    companyId: techCorp.id,
    emailVerified: true,
    onboardingCompleted: true,
    currentLevel: 10,
    totalXp: 15000,
    currentStreak: 45,
  },
});

const gabriel = await prisma.user.create({
  data: {
    email: 'gabriel@techcorp.com',
    password: userPassword.getHash(),
    name: 'Gabriel Sarte',
    role: 'JUNIOR',
    position: 'Desenvolvedor Full Stack',
    yearsOfExperience: 1,
    preferredLanguages: ['TypeScript', 'React', 'Node.js'],
    githubUsername: 'gabrielsarte',
    companyId: techCorp.id,
    emailVerified: true,
    onboardingCompleted: true,
    currentLevel: 2,
    totalXp: 350,
    currentStreak: 7,
  },
});

const lucas = await prisma.user.create({
  data: {
    email: 'lucas@techcorp.com',
    password: userPassword.getHash(),
    name: 'Lucas Sarte',
    role: 'PLENO',
    position: 'Desenvolvedor Backend',
    yearsOfExperience: 3,
    preferredLanguages: ['JavaScript', 'Python'],
    githubUsername: 'lucassarte',
    companyId: techCorp.id,
    emailVerified: true,
    onboardingCompleted: true,
    currentLevel: 5,
    totalXp: 2500,
    currentStreak: 15,
  },
});

const daniel = await prisma.user.create({
  data: {
    email: 'daniel@startupinc.io',
    password: userPassword.getHash(),
    name: 'Daniel Sarte',
    role: 'SENIOR',
    position: 'Líder Frontend',
    yearsOfExperience: 6,
    preferredLanguages: ['TypeScript', 'React', 'Vue'],
    githubUsername: 'danielsarte',
    companyId: startupInc.id,
    emailVerified: true,
    onboardingCompleted: true,
    currentLevel: 8,
    totalXp: 8500,
    currentStreak: 30,
  },
});

// BADGES
const bugHunter = await prisma.badge.create({
  data: {
    key: 'bug-hunter',
    name: 'Caçador de Bugs',
    description: 'Encontrou e corrigiu 10 vulnerabilidades de segurança',
    icon: '🛡️',
    rarity: 'RARE',
    requirements: {
      type: 'special',
      customCondition: 'security_vulnerabilities_found_10',
    },
    xpReward: 500,
  },
});

const speedCoder = await prisma.badge.create({
  data: {
    key: 'speed-coder',
    name: 'Programador Veloz',
    description: 'Complete 5 desafios em menos tempo que o estimado',
    icon: '⚡',
    rarity: 'COMMON',
    requirements: {
      type: 'challenges',
      challengeCount: 5,
    },
    xpReward: 200,
  },
});

const aiMaster = await prisma.badge.create({
  data: {
    key: 'ai-master',
    name: 'Mestre da IA',
    description: 'Mantenha o Índice de Dependência abaixo de 30% por 10 desafios',
    icon: '🤖',
    rarity: 'EPIC',
    requirements: {
      type: 'metrics',
      metricType: 'DI',
      threshold: 30,
      comparison: 'lte',
    },
    xpReward: 1000,
  },
});

// MODULES
const backendModule = await prisma.module.create({
  data: {
    slug: 'backend',
    title: 'Núcleo da Nebulosa',
    description: 'Fundamentos Backend',
    orderIndex: 1,
    iconImage: 'backend.png',
    theme: {
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'],
    },
    requiredXp: 0,
    requiredLevel: 1,
    isLocked: false,
    isNew: false,
  },
});

const frontendModule = await prisma.module.create({
  data: {
    slug: 'frontend',
    title: 'Cosmos da Interface',
    description: 'Interfaces e Experiência',
    orderIndex: 2,
    iconImage: 'frontend.png',
    theme: {
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0891b2'],
    },
    requiredXp: 500,
    requiredLevel: 2,
    previousModuleId: backendModule.id,
    isLocked: true,
    isNew: false,
  },
});

const devopsModule = await prisma.module.create({
  data: {
    slug: 'devops',
    title: 'Sistema DevOps',
    description: 'Infraestrutura e CI/CD',
    orderIndex: 3,
    iconImage: 'devops.png',
    theme: {
      color: '#10b981',
      gradient: ['#10b981', '#059669'],
    },
    requiredXp: 1500,
    requiredLevel: 4,
    previousModuleId: frontendModule.id,
    isLocked: true,
    isNew: false,
  },
});

const mobileModule = await prisma.module.create({
  data: {
    slug: 'mobile',
    title: 'Aglomerado Móvel',
    description: 'Aplicações Móveis',
    orderIndex: 4,
    iconImage: 'mobile.png',
    theme: {
      color: '#ec4899',
      gradient: ['#ec4899', '#db2777'],
    },
    requiredXp: 3000,
    requiredLevel: 6,
    previousModuleId: devopsModule.id,
    isLocked: true,
    isNew: false,
  },
});

const dataModule = await prisma.module.create({
  data: {
    slug: 'data',
    title: 'Galáxia dos Dados',
    description: 'Análise e Processamento',
    orderIndex: 5,
    iconImage: 'data.png',
    theme: {
      color: '#3b82f6',
      gradient: ['#3b82f6', '#2563eb'],
    },
    requiredXp: 5000,
    requiredLevel: 8,
    previousModuleId: mobileModule.id,
    isLocked: true,
    isNew: true,
  },
});

console.log('✅ Modules created');

// CHALLENGES - Backend Module (Núcleo da Nebulosa)
const challenge1 = await prisma.challenge.create({
  data: {
    slug: 'fundamentos-rest',
    title: 'Fundamentos REST',
    description: 'Aprenda os fundamentos da arquitetura REST',
    moduleId: backendModule.id,
    orderInModule: 1,
    difficulty: 'EASY',
    category: 'BACKEND',
    estimatedMinutes: 30,
    languages: ['javascript', 'typescript'],
    planetImage: 'mercury.png',
    visualTheme: { color: '#E8927C' },
    instructions: 'Aprenda os conceitos básicos de REST API',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 50,
    bonusXp: 25,
    targetMetrics: { maxDI: 50, minPR: 60, minCS: 7 },
  },
});

const challenge2 = await prisma.challenge.create({
  data: {
    slug: 'criar-endpoint-get',
    title: 'Criar Endpoint GET',
    description: 'Crie seu primeiro endpoint GET',
    moduleId: backendModule.id,
    orderInModule: 2,
    difficulty: 'EASY',
    category: 'BACKEND',
    estimatedMinutes: 45,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Implemente um endpoint GET funcional',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 75,
    bonusXp: 35,
    targetMetrics: { maxDI: 50, minPR: 60, minCS: 7 },
  },
});

const challenge3 = await prisma.challenge.create({
  data: {
    slug: 'debug-rota-quebrada',
    title: 'Debug: Rota Quebrada',
    description: 'Encontre e corrija o bug na rota',
    moduleId: backendModule.id,
    orderInModule: 3,
    difficulty: 'MEDIUM',
    category: 'BACKEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'mars.png',
    visualTheme: { color: '#E27B58' },
    instructions: 'Debug e corrija a rota quebrada',
    starterCode: '// Código com bug',
    solution: '// Solução corrigida',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge4 = await prisma.challenge.create({
  data: {
    slug: 'refactor-controller',
    title: 'Refactor: Controller',
    description: 'Refatore o controller para melhor organização',
    moduleId: backendModule.id,
    orderInModule: 4,
    difficulty: 'MEDIUM',
    category: 'BACKEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'mars.png',
    visualTheme: { color: '#E27B58' },
    instructions: 'Refatore o controller',
    starterCode: '// Código inicial',
    solution: '// Solução refatorada',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge5 = await prisma.challenge.create({
  data: {
    slug: 'historia-auth-jwt',
    title: 'História: Auth JWT',
    description: 'Aprenda sobre autenticação JWT',
    moduleId: backendModule.id,
    orderInModule: 5,
    difficulty: 'MEDIUM',
    category: 'BACKEND',
    estimatedMinutes: 45,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Entenda JWT e sua implementação',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge6 = await prisma.challenge.create({
  data: {
    slug: 'implementar-auth',
    title: 'Implementar Auth',
    description: 'Implemente autenticação completa',
    moduleId: backendModule.id,
    orderInModule: 6,
    difficulty: 'HARD',
    category: 'BACKEND',
    estimatedMinutes: 90,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Implemente sistema de autenticação',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge7 = await prisma.challenge.create({
  data: {
    slug: 'code-review-security',
    title: 'Code Review: Security',
    description: 'Revise código identificando falhas de segurança',
    moduleId: backendModule.id,
    orderInModule: 7,
    difficulty: 'HARD',
    category: 'BACKEND',
    estimatedMinutes: 90,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Identifique e corrija problemas de segurança',
    starterCode: '// Código para revisar',
    solution: '// Solução segura',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge8 = await prisma.challenge.create({
  data: {
    slug: 'revisao-final-backend',
    title: 'Revisão Final',
    description: 'Revisão final do módulo backend',
    moduleId: backendModule.id,
    orderInModule: 8,
    difficulty: 'MEDIUM',
    category: 'BACKEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'moon.png',
    visualTheme: { color: '#C0C0C0' },
    instructions: 'Complete a revisão final',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

// CHALLENGES - Frontend Module (Cosmos da Interface)
const challenge9 = await prisma.challenge.create({
  data: {
    slug: 'fundamentos-react',
    title: 'Fundamentos React',
    description: 'Aprenda os fundamentos do React',
    moduleId: frontendModule.id,
    orderInModule: 1,
    difficulty: 'EASY',
    category: 'FRONTEND',
    estimatedMinutes: 45,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Aprenda conceitos básicos do React',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 75,
    bonusXp: 35,
    targetMetrics: { maxDI: 50, minPR: 60, minCS: 7 },
  },
});

const challenge10 = await prisma.challenge.create({
  data: {
    slug: 'componentes-react',
    title: 'Componentes',
    description: 'Crie componentes React reutilizáveis',
    moduleId: frontendModule.id,
    orderInModule: 2,
    difficulty: 'MEDIUM',
    category: 'FRONTEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Crie componentes reutilizáveis',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge11 = await prisma.challenge.create({
  data: {
    slug: 'debug-ui-quebrada',
    title: 'Debug: UI Quebrada',
    description: 'Corrija problemas na interface',
    moduleId: frontendModule.id,
    orderInModule: 3,
    difficulty: 'MEDIUM',
    category: 'FRONTEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Debug e corrija a UI',
    starterCode: '// Código com bug',
    solution: '// Solução corrigida',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge12 = await prisma.challenge.create({
  data: {
    slug: 'responsividade',
    title: 'Responsividade',
    description: 'Torne a interface responsiva',
    moduleId: frontendModule.id,
    orderInModule: 4,
    difficulty: 'MEDIUM',
    category: 'FRONTEND',
    estimatedMinutes: 75,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Implemente responsividade',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge13 = await prisma.challenge.create({
  data: {
    slug: 'revisao-frontend',
    title: 'Revisão Frontend',
    description: 'Revisão final do módulo frontend',
    moduleId: frontendModule.id,
    orderInModule: 5,
    difficulty: 'MEDIUM',
    category: 'FRONTEND',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'moon.png',
    visualTheme: { color: '#C0C0C0' },
    instructions: 'Complete a revisão final',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

// CHALLENGES - DevOps Module (Sistema DevOps)
const challenge14 = await prisma.challenge.create({
  data: {
    slug: 'docker-basics',
    title: 'Docker Basics',
    description: 'Aprenda os fundamentos do Docker',
    moduleId: devopsModule.id,
    orderInModule: 1,
    difficulty: 'MEDIUM',
    category: 'DEVOPS',
    estimatedMinutes: 60,
    languages: ['dockerfile', 'bash'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Aprenda Docker',
    starterCode: '# Dockerfile inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge15 = await prisma.challenge.create({
  data: {
    slug: 'cicd-pipeline',
    title: 'CI/CD Pipeline',
    description: 'Configure uma pipeline CI/CD',
    moduleId: devopsModule.id,
    orderInModule: 2,
    difficulty: 'HARD',
    category: 'DEVOPS',
    estimatedMinutes: 90,
    languages: ['yaml', 'bash'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Configure CI/CD',
    starterCode: '# Pipeline inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge16 = await prisma.challenge.create({
  data: {
    slug: 'debug-deploy-failed',
    title: 'Debug: Deploy Failed',
    description: 'Corrija problemas no deploy',
    moduleId: devopsModule.id,
    orderInModule: 3,
    difficulty: 'HARD',
    category: 'DEVOPS',
    estimatedMinutes: 90,
    languages: ['yaml', 'bash'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Debug o deploy',
    starterCode: '# Pipeline com bug',
    solution: '# Solução corrigida',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge17 = await prisma.challenge.create({
  data: {
    slug: 'kubernetes',
    title: 'Kubernetes',
    description: 'Aprenda orquestração com Kubernetes',
    moduleId: devopsModule.id,
    orderInModule: 4,
    difficulty: 'EXPERT',
    category: 'DEVOPS',
    estimatedMinutes: 120,
    languages: ['yaml'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Configure Kubernetes',
    starterCode: '# Manifests iniciais',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 200,
    bonusXp: 100,
    targetMetrics: { maxDI: 35, minPR: 75, minCS: 8.5 },
  },
});

const challenge18 = await prisma.challenge.create({
  data: {
    slug: 'revisao-devops',
    title: 'Revisão DevOps',
    description: 'Revisão final do módulo DevOps',
    moduleId: devopsModule.id,
    orderInModule: 5,
    difficulty: 'HARD',
    category: 'DEVOPS',
    estimatedMinutes: 90,
    languages: ['yaml', 'bash'],
    planetImage: 'moon.png',
    visualTheme: { color: '#C0C0C0' },
    instructions: 'Complete a revisão final',
    starterCode: '# Código inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

// CHALLENGES - Mobile Module (Aglomerado Móvel)
const challenge19 = await prisma.challenge.create({
  data: {
    slug: 'react-native-intro',
    title: 'React Native Intro',
    description: 'Introdução ao React Native',
    moduleId: mobileModule.id,
    orderInModule: 1,
    difficulty: 'MEDIUM',
    category: 'MOBILE',
    estimatedMinutes: 60,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Aprenda React Native',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge20 = await prisma.challenge.create({
  data: {
    slug: 'navegacao-mobile',
    title: 'Navegação Mobile',
    description: 'Implemente navegação mobile',
    moduleId: mobileModule.id,
    orderInModule: 2,
    difficulty: 'MEDIUM',
    category: 'MOBILE',
    estimatedMinutes: 75,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Configure navegação',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 100,
    bonusXp: 50,
    targetMetrics: { maxDI: 45, minPR: 65, minCS: 7.5 },
  },
});

const challenge21 = await prisma.challenge.create({
  data: {
    slug: 'debug-performance',
    title: 'Debug: Performance',
    description: 'Otimize performance do app',
    moduleId: mobileModule.id,
    orderInModule: 3,
    difficulty: 'HARD',
    category: 'MOBILE',
    estimatedMinutes: 90,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Melhore a performance',
    starterCode: '// Código com problemas',
    solution: '// Solução otimizada',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge22 = await prisma.challenge.create({
  data: {
    slug: 'refactor-components-mobile',
    title: 'Refactor: Components',
    description: 'Refatore componentes mobile',
    moduleId: mobileModule.id,
    orderInModule: 4,
    difficulty: 'HARD',
    category: 'MOBILE',
    estimatedMinutes: 90,
    languages: ['javascript', 'typescript'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Refatore os componentes',
    starterCode: '// Código inicial',
    solution: '// Solução refatorada',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge23 = await prisma.challenge.create({
  data: {
    slug: 'revisao-mobile',
    title: 'Revisão Mobile',
    description: 'Revisão final do módulo mobile',
    moduleId: mobileModule.id,
    orderInModule: 5,
    difficulty: 'HARD',
    category: 'MOBILE',
    estimatedMinutes: 90,
    languages: ['javascript', 'typescript'],
    planetImage: 'moon.png',
    visualTheme: { color: '#C0C0C0' },
    instructions: 'Complete a revisão final',
    starterCode: '// Código inicial',
    solution: '// Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

// CHALLENGES - Data Module (Galáxia dos Dados)
const challenge24 = await prisma.challenge.create({
  data: {
    slug: 'sql-avancado',
    title: 'SQL Avançado',
    description: 'Aprenda SQL avançado',
    moduleId: dataModule.id,
    orderInModule: 1,
    difficulty: 'HARD',
    category: 'DATA',
    estimatedMinutes: 90,
    languages: ['sql'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Domine SQL avançado',
    starterCode: '-- Query inicial',
    solution: '-- Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 150,
    bonusXp: 75,
    targetMetrics: { maxDI: 40, minPR: 70, minCS: 8 },
  },
});

const challenge25 = await prisma.challenge.create({
  data: {
    slug: 'etl-pipeline',
    title: 'ETL Pipeline',
    description: 'Construa uma pipeline ETL',
    moduleId: dataModule.id,
    orderInModule: 2,
    difficulty: 'EXPERT',
    category: 'DATA',
    estimatedMinutes: 120,
    languages: ['python', 'sql'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Implemente ETL',
    starterCode: '# Pipeline inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 200,
    bonusXp: 100,
    targetMetrics: { maxDI: 35, minPR: 75, minCS: 8.5 },
  },
});

const challenge26 = await prisma.challenge.create({
  data: {
    slug: 'debug-query-slow',
    title: 'Debug: Query Slow',
    description: 'Otimize queries lentas',
    moduleId: dataModule.id,
    orderInModule: 3,
    difficulty: 'EXPERT',
    category: 'DATA',
    estimatedMinutes: 120,
    languages: ['sql'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Otimize as queries',
    starterCode: '-- Query lenta',
    solution: '-- Query otimizada',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 200,
    bonusXp: 100,
    targetMetrics: { maxDI: 35, minPR: 75, minCS: 8.5 },
  },
});

const challenge27 = await prisma.challenge.create({
  data: {
    slug: 'data-warehouse',
    title: 'Data Warehouse',
    description: 'Implemente um Data Warehouse',
    moduleId: dataModule.id,
    orderInModule: 4,
    difficulty: 'EXPERT',
    category: 'DATA',
    estimatedMinutes: 150,
    languages: ['sql', 'python'],
    planetImage: 'unknown.png',
    visualTheme: { color: '#A0A0A0' },
    instructions: 'Configure Data Warehouse',
    starterCode: '# Código inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 250,
    bonusXp: 125,
    targetMetrics: { maxDI: 30, minPR: 80, minCS: 9 },
  },
});

const challenge28 = await prisma.challenge.create({
  data: {
    slug: 'revisao-data',
    title: 'Revisão Data',
    description: 'Revisão final do módulo de dados',
    moduleId: dataModule.id,
    orderInModule: 5,
    difficulty: 'EXPERT',
    category: 'DATA',
    estimatedMinutes: 120,
    languages: ['sql', 'python'],
    planetImage: 'moon.png',
    visualTheme: { color: '#C0C0C0' },
    instructions: 'Complete a revisão final',
    starterCode: '# Código inicial',
    solution: '# Solução',
    testCases: [],
    hints: [],
    traps: [],
    baseXp: 200,
    bonusXp: 100,
    targetMetrics: { maxDI: 35, minPR: 75, minCS: 8.5 },
  },
});

console.log('✅ Challenges created (28 total)');

// UNITS E LEVELS - Estrutura de aprendizagem
const unit1 = await prisma.unit.create({
  data: {
    slug: 'fundamentos-ia-responsavel',
    title: 'Primeiros Passos com IA Responsável',
    description: 'Aprenda os fundamentos de governança de IA e boas práticas no desenvolvimento com assistentes de código',
    moduleId: backendModule.id,
    orderInModule: 1,
    iconImage: 'unit-basics.png',
    theme: {
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'],
      icon: '🎯',
    },
    learningObjectives: [
      'Entender os riscos do uso inadequado de IA',
      'Aprender a validar código gerado por IA',
      'Conhecer as métricas DI, PR e CS',
      'Desenvolver consciência sobre dependência de IA',
    ],
    estimatedMinutes: 120,
    theoryContent: `
# Governança de IA no Desenvolvimento

## Introdução
A inteligência artificial revolucionou o desenvolvimento de software, mas traz desafios importantes relacionados à qualidade, segurança e dependência excessiva.

## Por que se importar?
- **Segurança**: Código gerado pode conter vulnerabilidades
- **Qualidade**: Nem sempre a solução mais rápida é a melhor
- **Aprendizado**: Dependência excessiva prejudica o desenvolvimento de habilidades
- **Responsabilidade**: O desenvolvedor é responsável pelo código, não a IA

## Métricas de Governança
- **DI (Dependency Index)**: Mede o quanto você depende da IA
- **PR (Pass Rate)**: Taxa de aprovação nos testes
- **CS (Checklist Score)**: Conformidade com boas práticas

## Objetivo
Usar a IA como ferramenta de produtividade, não como substituto do pensamento crítico.
    `.trim(),
    resources: {
      articles: [
        { title: 'AI Code Generation Best Practices', url: '#' },
        { title: 'Security Risks in AI-Generated Code', url: '#' },
      ],
      videos: [
        { title: 'Introdução à Governança de IA', duration: '15:00', url: '#' },
      ],
    },
    requiredScore: 70,
  },
});

// Level 0: LESSON (Tutorial interativo)
const level0 = await prisma.level.create({
  data: {
    unitId: unit1.id,
    orderInUnit: 0,
    type: 'LESSON',
    icon: '📚',
    title: 'Tutorial: Validador Simples',
    description: 'Aprenda criando um validador de email com IA responsável',
    config: {
      showTheoryFirst: true,
      allowAI: true,
      trackDI: true,
      maxAIUsagePercent: 50,
      tutorialSteps: [
        { step: 1, instruction: 'Leia os requisitos do validador' },
        { step: 2, instruction: 'Identifique os casos de teste necessários' },
        { step: 3, instruction: 'Implemente a validação básica' },
        { step: 4, instruction: 'Adicione tratamento de erros' },
        { step: 5, instruction: 'Execute os testes e corrija problemas' },
      ],
    },
    adaptive: false,
    blocking: true,
    optional: false,
    timeLimit: null,
    bonusXp: 25,
  },
});

// Conectar o desafio ao level
await prisma.levelChallenge.create({
  data: {
    levelId: level0.id,
    challengeId: challenge1.id,
    orderInLevel: 1,
    required: true,
  },
});

console.log('✅ First sample unit and level created');

// ============================================================================
// COMPLETE MIGRATION: All Units and Levels for all modules
// ============================================================================

console.log('\n📦 Creating complete learning hierarchy...\n');

// Helper function to get challenges by module
const getChallengesByModule = (moduleId: string) => {
  return [
    challenge1, challenge2, challenge3, challenge4, challenge5, challenge6, challenge7, challenge8,
    challenge9, challenge10, challenge11, challenge12, challenge13,
    challenge14, challenge15, challenge16, challenge17, challenge18,
    challenge19, challenge20, challenge21, challenge22, challenge23,
    challenge24, challenge25, challenge26, challenge27, challenge28
  ].filter((c: any) => c.moduleId === moduleId).sort((a: any, b: any) => a.orderInModule - b.orderInModule);
};

const backendChallenges = getChallengesByModule(backendModule.id);
const frontendChallenges = getChallengesByModule(frontendModule.id);
const devopsChallenges = getChallengesByModule(devopsModule.id);
const mobileChallenges = getChallengesByModule(mobileModule.id);
const dataChallenges = getChallengesByModule(dataModule.id);

// BACKEND UNITS (2 more needed, already have 1)
console.log('🏗️  Backend Module: Creating additional units...');

const backendUnit2 = await prisma.unit.create({
  data: {
    slug: 'rest-api-fundamentals',
    title: 'REST API Fundamentals',
    description: 'Master RESTful architecture and build robust APIs',
    moduleId: backendModule.id,
    orderInModule: 2,
    iconImage: 'rest-api.png',
    theme: { color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'], icon: '🌐' },
    learningObjectives: [
      'Understand REST principles and constraints',
      'Design resource-oriented APIs',
      'Implement proper HTTP methods and status codes',
      'Debug common API issues',
    ],
    estimatedMinutes: 135,
    theoryContent: '# REST API Fundamentals\n\nLearn the core concepts of RESTful architecture...',
    resources: { articles: [], videos: [] },
    requiredScore: 70,
  },
});

const backendUnit3 = await prisma.unit.create({
  data: {
    slug: 'architecture-refactoring',
    title: 'Architecture & Refactoring',
    description: 'Learn clean code and authentication patterns',
    moduleId: backendModule.id,
    orderInModule: 3,
    iconImage: 'architecture.png',
    theme: { color: '#7c3aed', gradient: ['#7c3aed', '#6d28d9'], icon: '🏗️' },
    learningObjectives: [
      'Apply SOLID principles',
      'Refactor legacy code',
      'Implement JWT authentication',
    ],
    estimatedMinutes: 195,
    theoryContent: '# Architecture & Refactoring\n\nClean code principles...',
    resources: { articles: [], videos: [] },
    requiredScore: 75,
  },
});

const backendUnit4 = await prisma.unit.create({
  data: {
    slug: 'security-best-practices',
    title: 'Security & Best Practices',
    description: 'Master security and defensive programming',
    moduleId: backendModule.id,
    orderInModule: 4,
    iconImage: 'security.png',
    theme: { color: '#6d28d9', gradient: ['#6d28d9', '#5b21b6'], icon: '🛡️' },
    learningObjectives: [
      'Identify OWASP Top 10 vulnerabilities',
      'Conduct security code reviews',
      'Apply defensive programming',
    ],
    estimatedMinutes: 150,
    theoryContent: '# Security & Best Practices\n\nOWASP Top 10...',
    resources: { articles: [], videos: [] },
    requiredScore: 80,
  },
});

console.log(`  ✅ Created 3 additional Backend units`);

// BACKEND LEVELS
console.log('🎮 Creating Backend levels...');

const backendLevels = await Promise.all([
  // Unit 2 levels
  prisma.level.create({ data: { unitId: backendUnit2.id, orderInUnit: 0, type: 'LESSON', icon: '📚', title: 'REST Basics', config: {}, bonusXp: 25 }}),
  prisma.level.create({ data: { unitId: backendUnit2.id, orderInUnit: 1, type: 'PRACTICE', icon: '⚡', title: 'Build GET Endpoint', config: {}, bonusXp: 35 }}),
  prisma.level.create({ data: { unitId: backendUnit2.id, orderInUnit: 2, type: 'PRACTICE', icon: '🐛', title: 'Debug Route', config: {}, bonusXp: 50, adaptive: true }}),
  // Unit 3 levels
  prisma.level.create({ data: { unitId: backendUnit3.id, orderInUnit: 0, type: 'LESSON', icon: '🔧', title: 'Refactoring Tutorial', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: backendUnit3.id, orderInUnit: 1, type: 'STORY', icon: '📖', title: 'Auth Story', config: {}, bonusXp: 100, optional: true, blocking: false }}),
  prisma.level.create({ data: { unitId: backendUnit3.id, orderInUnit: 2, type: 'PRACTICE', icon: '🔐', title: 'Implement Auth', config: {}, bonusXp: 75, adaptive: true }}),
  // Unit 4 levels
  prisma.level.create({ data: { unitId: backendUnit4.id, orderInUnit: 0, type: 'PRACTICE', icon: '🛡️', title: 'Security Review', config: {}, bonusXp: 75 }}),
  prisma.level.create({ data: { unitId: backendUnit4.id, orderInUnit: 1, type: 'UNIT_REVIEW', icon: '🎯', title: 'Backend Review', config: {}, bonusXp: 200, timeLimit: 3600 }}),
  prisma.level.create({ data: { unitId: backendUnit4.id, orderInUnit: 2, type: 'XP_RAMP_UP', icon: '⭐', title: 'XP Bonus', config: {}, bonusXp: 500, optional: true, blocking: false }}),
]);

// Connect Backend challenges (skip first one already connected)
await prisma.levelChallenge.createMany({
  data: [
    { levelId: backendLevels[0].id, challengeId: backendChallenges[1].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[1].id, challengeId: backendChallenges[2].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[2].id, challengeId: backendChallenges[3].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[3].id, challengeId: backendChallenges[4].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[4].id, challengeId: backendChallenges[5].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[5].id, challengeId: backendChallenges[6].id, orderInLevel: 1, required: true },
    { levelId: backendLevels[6].id, challengeId: backendChallenges[7].id, orderInLevel: 1, required: true },
  ],
});

console.log(`  ✅ Created 9 Backend levels and connected 7 more challenges`);

// FRONTEND UNITS & LEVELS
console.log('🏗️  Frontend Module: Creating units and levels...');

const frontendUnit1 = await prisma.unit.create({
  data: {
    slug: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Master React core concepts',
    moduleId: frontendModule.id,
    orderInModule: 1,
    iconImage: 'react.png',
    theme: { color: '#61dafb', gradient: ['#61dafb', '#21a1c4'], icon: '⚛️' },
    learningObjectives: ['Understand React lifecycle', 'Build reusable components', 'Manage state effectively'],
    estimatedMinutes: 165,
    theoryContent: '# React Fundamentals\n\nCore concepts...',
    resources: { articles: [], videos: [] },
    requiredScore: 70,
  },
});

const frontendUnit2 = await prisma.unit.create({
  data: {
    slug: 'ui-ux-advanced',
    title: 'UI/UX Advanced',
    description: 'Responsive design and accessibility',
    moduleId: frontendModule.id,
    orderInModule: 2,
    iconImage: 'ui-ux.png',
    theme: { color: '#0891b2', gradient: ['#0891b2', '#0e7490'], icon: '🎨' },
    learningObjectives: ['Build responsive layouts', 'Implement accessibility', 'Master CSS-in-JS'],
    estimatedMinutes: 120,
    theoryContent: '# UI/UX Advanced\n\nResponsive design...',
    resources: { articles: [], videos: [] },
    requiredScore: 75,
  },
});

const frontendLevels = await Promise.all([
  prisma.level.create({ data: { unitId: frontendUnit1.id, orderInUnit: 0, type: 'LESSON', icon: '📚', title: 'React Basics', config: {}, bonusXp: 35 }}),
  prisma.level.create({ data: { unitId: frontendUnit1.id, orderInUnit: 1, type: 'PRACTICE', icon: '⚛️', title: 'Components', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: frontendUnit1.id, orderInUnit: 2, type: 'PRACTICE', icon: '🐛', title: 'Debug UI', config: {}, bonusXp: 50, adaptive: true }}),
  prisma.level.create({ data: { unitId: frontendUnit2.id, orderInUnit: 0, type: 'PRACTICE', icon: '📱', title: 'Responsive', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: frontendUnit2.id, orderInUnit: 1, type: 'UNIT_REVIEW', icon: '🎯', title: 'Frontend Review', config: {}, bonusXp: 200 }}),
  prisma.level.create({ data: { unitId: frontendUnit2.id, orderInUnit: 2, type: 'MATCH_MADNESS', icon: '🎮', title: 'CSS Match', config: {}, bonusXp: 150, optional: true, blocking: false, timeLimit: 120 }}),
]);

await prisma.levelChallenge.createMany({
  data: frontendChallenges.map((ch, idx) => ({
    levelId: frontendLevels[idx]?.id,
    challengeId: ch.id,
    orderInLevel: 1,
    required: true,
  })).filter(c => c.levelId),
});

console.log(`  ✅ Created 2 Frontend units, 6 levels, connected 5 challenges`);

// DEVOPS UNITS & LEVELS
console.log('🏗️  DevOps Module: Creating units and levels...');

const devopsUnit1 = await prisma.unit.create({
  data: {
    slug: 'containerization-cicd',
    title: 'Containerization & CI/CD',
    description: 'Docker and deployment pipelines',
    moduleId: devopsModule.id,
    orderInModule: 1,
    iconImage: 'docker.png',
    theme: { color: '#10b981', gradient: ['#10b981', '#059669'], icon: '🐳' },
    learningObjectives: ['Master Docker', 'Build CI/CD pipelines', 'Debug deployments'],
    estimatedMinutes: 210,
    theoryContent: '# Containerization\n\nDocker fundamentals...',
    resources: { articles: [], videos: [] },
    requiredScore: 70,
  },
});

const devopsUnit2 = await prisma.unit.create({
  data: {
    slug: 'advanced-orchestration',
    title: 'Advanced Orchestration',
    description: 'Kubernetes and scaling',
    moduleId: devopsModule.id,
    orderInModule: 2,
    iconImage: 'kubernetes.png',
    theme: { color: '#059669', gradient: ['#059669', '#047857'], icon: '☸️' },
    learningObjectives: ['Understand K8s', 'Deploy apps', 'Troubleshoot production'],
    estimatedMinutes: 240,
    theoryContent: '# Kubernetes\n\nOrchestration...',
    resources: { articles: [], videos: [] },
    requiredScore: 80,
  },
});

const devopsLevels = await Promise.all([
  prisma.level.create({ data: { unitId: devopsUnit1.id, orderInUnit: 0, type: 'LESSON', icon: '🐳', title: 'Docker Basics', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: devopsUnit1.id, orderInUnit: 1, type: 'PRACTICE', icon: '🔄', title: 'CI/CD Pipeline', config: {}, bonusXp: 75, adaptive: true }}),
  prisma.level.create({ data: { unitId: devopsUnit1.id, orderInUnit: 2, type: 'PRACTICE', icon: '🐛', title: 'Debug Deploy', config: {}, bonusXp: 75, adaptive: true }}),
  prisma.level.create({ data: { unitId: devopsUnit2.id, orderInUnit: 0, type: 'PRACTICE', icon: '☸️', title: 'Kubernetes', config: {}, bonusXp: 100, adaptive: true }}),
  prisma.level.create({ data: { unitId: devopsUnit2.id, orderInUnit: 1, type: 'UNIT_REVIEW', icon: '🎯', title: 'DevOps Review', config: {}, bonusXp: 200, timeLimit: 3600 }}),
  prisma.level.create({ data: { unitId: devopsUnit2.id, orderInUnit: 2, type: 'RAPID_REVIEW', icon: '⚡', title: 'Commands Quiz', config: {}, bonusXp: 100, optional: true, blocking: false, timeLimit: 450 }}),
]);

await prisma.levelChallenge.createMany({
  data: devopsChallenges.map((ch, idx) => ({
    levelId: devopsLevels[idx]?.id,
    challengeId: ch.id,
    orderInLevel: 1,
    required: true,
  })).filter(c => c.levelId),
});

console.log(`  ✅ Created 2 DevOps units, 6 levels, connected 5 challenges`);

// MOBILE UNITS & LEVELS
console.log('🏗️  Mobile Module: Creating units and levels...');

const mobileUnit1 = await prisma.unit.create({
  data: {
    slug: 'react-native-essentials',
    title: 'React Native Essentials',
    description: 'Build cross-platform mobile apps',
    moduleId: mobileModule.id,
    orderInModule: 1,
    iconImage: 'react-native.png',
    theme: { color: '#ec4899', gradient: ['#ec4899', '#db2777'], icon: '📱' },
    learningObjectives: ['React Native fundamentals', 'Build native UI', 'Implement navigation'],
    estimatedMinutes: 225,
    theoryContent: '# React Native\n\nMobile development...',
    resources: { articles: [], videos: [] },
    requiredScore: 70,
  },
});

const mobileUnit2 = await prisma.unit.create({
  data: {
    slug: 'performance-architecture',
    title: 'Performance & Architecture',
    description: 'Optimize mobile apps',
    moduleId: mobileModule.id,
    orderInModule: 2,
    iconImage: 'performance.png',
    theme: { color: '#db2777', gradient: ['#db2777', '#be185d'], icon: '⚡' },
    learningObjectives: ['Profile performance', 'Efficient state management', 'Clean architecture'],
    estimatedMinutes: 180,
    theoryContent: '# Mobile Performance\n\nOptimization...',
    resources: { articles: [], videos: [] },
    requiredScore: 75,
  },
});

const mobileLevels = await Promise.all([
  prisma.level.create({ data: { unitId: mobileUnit1.id, orderInUnit: 0, type: 'LESSON', icon: '📱', title: 'RN Intro', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: mobileUnit1.id, orderInUnit: 1, type: 'PRACTICE', icon: '🧭', title: 'Navigation', config: {}, bonusXp: 50 }}),
  prisma.level.create({ data: { unitId: mobileUnit1.id, orderInUnit: 2, type: 'PRACTICE', icon: '🐛', title: 'Debug Performance', config: {}, bonusXp: 75, adaptive: true }}),
  prisma.level.create({ data: { unitId: mobileUnit2.id, orderInUnit: 0, type: 'PRACTICE', icon: '🔧', title: 'Refactor', config: {}, bonusXp: 75 }}),
  prisma.level.create({ data: { unitId: mobileUnit2.id, orderInUnit: 1, type: 'UNIT_REVIEW', icon: '🎯', title: 'Mobile Review', config: {}, bonusXp: 200 }}),
  prisma.level.create({ data: { unitId: mobileUnit2.id, orderInUnit: 2, type: 'XP_RAMP_UP', icon: '⭐', title: 'XP Bonus', config: {}, bonusXp: 500, optional: true, blocking: false }}),
]);

await prisma.levelChallenge.createMany({
  data: mobileChallenges.map((ch, idx) => ({
    levelId: mobileLevels[idx]?.id,
    challengeId: ch.id,
    orderInLevel: 1,
    required: true,
  })).filter(c => c.levelId),
});

console.log(`  ✅ Created 2 Mobile units, 6 levels, connected 5 challenges`);

// DATA UNITS & LEVELS
console.log('🏗️  Data Module: Creating units and levels...');

const dataUnit1 = await prisma.unit.create({
  data: {
    slug: 'advanced-database',
    title: 'Advanced Database',
    description: 'SQL optimization and ETL',
    moduleId: dataModule.id,
    orderInModule: 1,
    iconImage: 'database.png',
    theme: { color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'], icon: '📊' },
    learningObjectives: ['Complex SQL queries', 'Query optimization', 'Design ETL pipelines'],
    estimatedMinutes: 240,
    theoryContent: '# Advanced Database\n\nSQL mastery...',
    resources: { articles: [], videos: [] },
    requiredScore: 75,
  },
});

const dataUnit2 = await prisma.unit.create({
  data: {
    slug: 'data-engineering',
    title: 'Data Engineering',
    description: 'Data warehouses and analytics',
    moduleId: dataModule.id,
    orderInModule: 2,
    iconImage: 'data-warehouse.png',
    theme: { color: '#2563eb', gradient: ['#2563eb', '#1d4ed8'], icon: '🏢' },
    learningObjectives: ['Design data warehouses', 'Dimensional modeling', 'Analytics pipelines'],
    estimatedMinutes: 270,
    theoryContent: '# Data Engineering\n\nWarehousing...',
    resources: { articles: [], videos: [] },
    requiredScore: 80,
  },
});

const dataLevels = await Promise.all([
  prisma.level.create({ data: { unitId: dataUnit1.id, orderInUnit: 0, type: 'LESSON', icon: '📚', title: 'Advanced SQL', config: {}, bonusXp: 75 }}),
  prisma.level.create({ data: { unitId: dataUnit1.id, orderInUnit: 1, type: 'PRACTICE', icon: '🔄', title: 'ETL Pipeline', config: {}, bonusXp: 100, adaptive: true }}),
  prisma.level.create({ data: { unitId: dataUnit1.id, orderInUnit: 2, type: 'PRACTICE', icon: '🐛', title: 'Optimize Query', config: {}, bonusXp: 100, adaptive: true }}),
  prisma.level.create({ data: { unitId: dataUnit2.id, orderInUnit: 0, type: 'PRACTICE', icon: '🏢', title: 'Data Warehouse', config: {}, bonusXp: 125, adaptive: true }}),
  prisma.level.create({ data: { unitId: dataUnit2.id, orderInUnit: 1, type: 'UNIT_REVIEW', icon: '🎯', title: 'Data Review', config: {}, bonusXp: 200, timeLimit: 3600 }}),
  prisma.level.create({ data: { unitId: dataUnit2.id, orderInUnit: 2, type: 'XP_RAMP_UP', icon: '⭐', title: 'Data Master', config: {}, bonusXp: 500, optional: true, blocking: false }}),
]);

await prisma.levelChallenge.createMany({
  data: dataChallenges.map((ch, idx) => ({
    levelId: dataLevels[idx]?.id,
    challengeId: ch.id,
    orderInLevel: 1,
    required: true,
  })).filter(c => c.levelId),
});

console.log(`  ✅ Created 2 Data units, 6 levels, connected 5 challenges`);

console.log('\n🎉 Complete learning hierarchy created!');
console.log('📊 Summary:');
console.log('   • 12 Units total (1 existing + 11 new)');
console.log('   • 34 Levels total (1 existing + 33 new)');
console.log('   • 28 Challenges all connected');
console.log('   • 7 Level types: LESSON, PRACTICE, STORY, UNIT_REVIEW, MATCH_MADNESS, RAPID_REVIEW, XP_RAMP_UP\n');

//  USER METRICS - Update to use challenge1 instead of apiChallenge
await prisma.userMetrics.create({
  data: {
    userId: gabriel.id,
    averageDI: 65.5,
    averagePR: 72.3,
    averageCS: 7.2,
    weeklyTrends: [
      { week: 1, di: 85, pr: 45, cs: 5 },
      { week: 2, di: 75, pr: 60, cs: 6.5 },
      { week: 3, di: 65, pr: 70, cs: 7 },
      { week: 4, di: 55, pr: 85, cs: 8 },
    ],
    metricsByCategory: {
      BACKEND: { avgDI: 60, avgPR: 75, avgCS: 7.5, attempts: 8 },
      FRONTEND: { avgDI: 70, avgPR: 68, avgCS: 6.8, attempts: 5 },
    },
    firstWeekDI: 85,
    currentWeekDI: 55,
    improvement: 30,
    strongAreas: ['depuração', 'testes'],
    weakAreas: ['dependência-ia', 'segurança'],
  },
});

// CHALLENGE ATTEMPT - Use challenge1 instead of apiChallenge
const attempt = await prisma.challengeAttempt.create({
  data: {
    userId: gabriel.id,
    challengeId: challenge1.id,
    sessionId: crypto.randomUUID(),
    attemptNumber: 1,
    status: 'COMPLETED',
    currentStep: 7,
    completedAt: new Date(),
    duration: 3600,
    finalCode: '// Código da solução final aqui',
    codeSnapshots: [],
    language: 'typescript',
    testResults: [
      { testId: 'test-1', passed: true, output: 'Sucesso' },
      { testId: 'test-2', passed: true, output: 'Sucesso' },
      { testId: 'test-3', passed: false, output: 'Falha: Sem verificação de autenticação' },
      { testId: 'test-4', passed: true, output: 'Sucesso' },
      { testId: 'test-5', passed: true, output: 'Sucesso' },
    ],
    score: 75,
    passed: true,
    finalDI: 45,
    finalPR: 71,
    finalCS: 7.5,
  },
});

console.log('✅ Seed completed successfully!');
console.log({
  empresas: 2,
  usuários: 4,
  módulos: 5,
  units: 12,
  levels: 34,
  levelTypes: 7,
  badges: 3,
  desafios: 28,
  challengesConnected: 28,
  tentativas: 1,
  métricas: 1,
});
}

main()
 .catch((e) => {
   console.error('❌ Seed failed:', e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
