import { logger } from '@/shared/infrastructure/monitoring/logger';
import { ILevelRepository, IUserLevelProgressRepository } from '../../domain/repositories/level.repository.interface';
import { z } from 'zod';

export const CompleteLevelSchema = z.object({
  levelId: z.string().cuid(),
  userId: z.string().cuid(),
  score: z.number().int().min(0).max(100),
  timeSpent: z.number().int().min(0).optional(),
});

export type CompleteLevelDTO = z.infer<typeof CompleteLevelSchema>;

export interface CompleteLevelResult {
  success: boolean;
  passed: boolean;
  message: string;
  progress: {
    status: string;
    bestScore: number;
    xpEarned: number;
    attemptsCount: number;
  };
  xpBreakdown: {
    baseXp: number;
    bonusXp: number;
    totalXp: number;
  };
  nextLevel: {
    id: string;
    type: string;
    title: string | null;
  } | null;
}

/**
 *
 * Responsabilidades:
 * - Validar score
 * - Calcular XP baseado em score e bônus
 * - Atualizar progresso do nível
 * - Desbloquear próximo nível se passou
 * - Retornar dados de conclusão
 *
 * Regras de XP:
 * - Base XP = 50 pontos
 * - Score > 90%: +25 XP
 * - Score = 100%: +50 XP adicional
 * - Bonus XP do nível (se configurado)
 */
export class CompleteLevelUseCase {
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly progressRepository: IUserLevelProgressRepository
  ) {}

  async execute(data: CompleteLevelDTO): Promise<CompleteLevelResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'complete_level_started',
      levelId: data.levelId,
      userId: data.userId,
      score: data.score,
    }, 'Completing level');

    try {
      const [level, progress] = await Promise.all([
        this.levelRepository.findById(data.levelId),
        this.progressRepository.findByUserIdAndLevelId(data.userId, data.levelId),
      ]);

      if (!level) {
        throw new Error(`Level with ID ${data.levelId} not found`);
      }

      if (!progress) {
        throw new Error(`Level progress not found. Did you start the level?`);
      }

      // Calcula XP baseado no score e configuração do nível
      const baseXp = 50;
      let bonusXp = level.getBonusXp();

      // Bônus por high score
      if (data.score >= 90) {
        bonusXp += 25;
      }

      // Bônus adicional por score perfeito
      if (data.score === 100) {
        bonusXp += 50;
      }

      const totalXp = baseXp + bonusXp;

      // Atualiza progresso
      progress.complete(data.score, totalXp);
      await this.progressRepository.update(progress);

      const passed = progress.isCompleted();
      const isPerfect = progress.isPerfect();

      // Se passou e nível é blocking, desbloqueia próximo nível
      let nextLevel: { id: string; type: string; title: string | null } | null = null;

      if (passed && level.isBlocking()) {
        const nextLevelEntity = await this.levelRepository.findNextLevel(
          level.getUnitId(),
          level.getOrderInUnit()
        );

        if (nextLevelEntity) {
          // Desbloqueia próximo nível
          const nextProgress = await this.progressRepository.findOrCreate(
            data.userId,
            nextLevelEntity.getId()
          );

          nextProgress.unlock();
          await this.progressRepository.update(nextProgress);

          const nextLevelData = nextLevelEntity.toJSON();
          nextLevel = {
            id: nextLevelData.id,
            type: nextLevelData.type,
            title: nextLevelData.title,
          };
        }
      }

      const result: CompleteLevelResult = {
        success: true,
        passed,
        message: isPerfect
          ? 'Perfeito! 100% de acerto!'
          : passed
          ? 'Nível completado com sucesso!'
          : 'Continue tentando! Score insuficiente.',
        progress: {
          status: progress.getStatus(),
          bestScore: progress.getBestScore(),
          xpEarned: progress.getXpEarned(),
          attemptsCount: progress.getAttemptsCount(),
        },
        xpBreakdown: {
          baseXp,
          bonusXp,
          totalXp,
        },
        nextLevel,
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'complete_level_completed',
        levelId: data.levelId,
        userId: data.userId,
        score: data.score,
        passed,
        isPerfect,
        totalXp,
        nextLevelUnlocked: !!nextLevel,
        processingTime,
      }, 'Level completion processed');

      return result;
    } catch (error) {
      logger.error({
        operation: 'complete_level_failed',
        levelId: data.levelId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to complete level');
      throw error;
    }
  }
}
