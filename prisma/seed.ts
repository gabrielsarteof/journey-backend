import { PrismaClient } from '@prisma/client';
import { Password } from '../src/shared/domain/value-objects/password.vo';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

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
  await prisma.challenge.deleteMany();
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
  badges: 3,
  desafios: 28, // Updated count
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
