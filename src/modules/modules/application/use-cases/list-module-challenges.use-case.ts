import { logger } from '@/shared/infrastructure/monitoring/logger';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const ListModuleChallengesSchema = z.object({
  userId: z.string().cuid(),
  slug: z.string(),
});

export type ListModuleChallengesDTO = z.infer<typeof ListModuleChallengesSchema>;

export interface ChallengeWithStatusResult {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderInModule: number;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
  languages: string[];
  planetImage: string | null;
  visualTheme: any;
  baseXp: number;
  bonusXp: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completedStars: number;
  lastAttempt?: {
    score: number;
    completedAt: Date;
  };
}

export class ListModuleChallengesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(data: ListModuleChallengesDTO): Promise<ChallengeWithStatusResult[]> {
    const startTime = Date.now();

    logger.info({
      operation: 'list_module_challenges_started',
      userId: data.userId,
      slug: data.slug,
    }, 'Listing module challenges with user status');

    try {
      // Busca o módulo
      const module = await this.prisma.module.findUnique({
        where: { slug: data.slug },
        include: {
          challenges: {
            orderBy: { orderInModule: 'asc' },
            include: {
              attempts: {
                where: { userId: data.userId },
                orderBy: { startedAt: 'desc' },
                take: 1,
              },
            },
          },
          userProgress: {
            where: { userId: data.userId },
          },
        },
      });

      if (!module) {
        throw new Error(`Module not found: ${data.slug}`);
      }

      // Determina se o módulo está bloqueado para o usuário
      const moduleProgress = module.userProgress[0];
      const isModuleLocked = moduleProgress?.status === 'LOCKED' || module.isLocked;

      // Mapeia challenges com status calculado
      const challengesWithStatus: ChallengeWithStatusResult[] = module.challenges.map((challenge, index) => {
        const lastAttempt = challenge.attempts[0];
        const previousChallenge = module.challenges[index - 1];

        let status: 'locked' | 'available' | 'in_progress' | 'completed';
        let completedStars = 0;

        if (isModuleLocked) {
          // Se módulo está bloqueado, todos challenges estão bloqueados
          status = 'locked';
        } else if (lastAttempt?.status === 'COMPLETED') {
          // Challenge completado
          status = 'completed';
          completedStars = this.calculateStars(lastAttempt.score);
        } else if (lastAttempt?.status === 'IN_PROGRESS') {
          // Challenge em progresso
          status = 'in_progress';
        } else if (index === 0) {
          // Primeiro challenge sempre disponível se módulo não está locked
          status = 'available';
        } else {
          // Verifica se challenge anterior foi completado
          const prevLastAttempt = previousChallenge?.attempts[0];
          const prevCompleted = prevLastAttempt?.status === 'COMPLETED';
          status = prevCompleted ? 'available' : 'locked';
        }

        return {
          id: challenge.id,
          slug: challenge.slug,
          title: challenge.title,
          description: challenge.description,
          orderInModule: challenge.orderInModule || 0,
          difficulty: challenge.difficulty,
          category: challenge.category,
          estimatedMinutes: challenge.estimatedMinutes,
          languages: challenge.languages,
          planetImage: challenge.planetImage,
          visualTheme: challenge.visualTheme,
          baseXp: challenge.baseXp,
          bonusXp: challenge.bonusXp,
          status,
          completedStars,
          lastAttempt: lastAttempt ? {
            score: lastAttempt.score,
            completedAt: lastAttempt.completedAt!,
          } : undefined,
        };
      });

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'list_module_challenges_completed',
        userId: data.userId,
        slug: data.slug,
        challengesCount: challengesWithStatus.length,
        processingTime,
      }, 'Module challenges listed successfully');

      return challengesWithStatus;
    } catch (error) {
      logger.error({
        operation: 'list_module_challenges_failed',
        userId: data.userId,
        slug: data.slug,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to list module challenges');
      throw error;
    }
  }

  private calculateStars(score: number): number {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  }
}
