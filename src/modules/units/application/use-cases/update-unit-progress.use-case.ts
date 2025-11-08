import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IUserUnitProgressRepository } from '../../domain/repositories/unit.repository.interface';
import { z } from 'zod';

export const UpdateUnitProgressSchema = z.object({
  userId: z.string().cuid(),
  unitId: z.string().cuid(),
  levelsCompleted: z.number().int().min(0),
  currentLevelId: z.string().cuid().nullable().optional(),
  xpEarned: z.number().int().min(0).optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export type UpdateUnitProgressDTO = z.infer<typeof UpdateUnitProgressSchema>;

export interface UpdateUnitProgressResult {
  success: boolean;
  message: string;
  progress: {
    id: string;
    unitId: string;
    userId: string;
    status: string;
    levelsCompleted: number;
    totalLevels: number;
    completionPercentage: number;
    currentLevelId: string | null;
    highestScore: number;
    totalXpEarned: number;
    attemptsCount: number;
    completedAt: Date | null;
  };
  achievements?: Array<{
    type: string;
    message: string;
  }>;
}

/**
 *
 * Responsabilidades:
 * - Atualizar níveis completados
 * - Calcular porcentagem de conclusão
 * - Atualizar XP e score
 * - Detectar conclusão da unidade
 * - Gerar achievements quando aplicável
 *
 * Regras de negócio:
 * - Quando levelsCompleted >= totalLevels, unidade é completada
 * - Score mais alto é mantido
 * - XP é acumulativo
 * - Cada update incrementa attemptsCount
 *
 * Importante para TCC: Demonstra cálculo de métricas e progressão
 */
export class UpdateUnitProgressUseCase {
  constructor(
    private readonly progressRepository: IUserUnitProgressRepository
  ) {}

  async execute(data: UpdateUnitProgressDTO): Promise<UpdateUnitProgressResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'update_unit_progress_started',
      userId: data.userId,
      unitId: data.unitId,
      levelsCompleted: data.levelsCompleted,
    }, 'Updating unit progress');

    try {
      // Busca progresso existente
      const progress = await this.progressRepository.findByUserIdAndUnitId(
        data.userId,
        data.unitId
      );

      if (!progress) {
        logger.warn({
          operation: 'update_unit_progress_not_found',
          userId: data.userId,
          unitId: data.unitId,
        }, 'Unit progress not found');
        throw new Error(`Unit progress not found for user ${data.userId} and unit ${data.unitId}`);
      }

      const previousStatus = progress.getStatus();
      const wasCompleted = progress.isCompleted();

      // Atualiza progresso (inclui lógica de auto-completion)
      progress.updateProgress({
        levelsCompleted: data.levelsCompleted,
        currentLevelId: data.currentLevelId ?? null,
        xpEarned: data.xpEarned,
        score: data.score,
      });

      // Persiste mudanças
      const updatedProgress = await this.progressRepository.update(progress);
      const progressData = updatedProgress.toJSON();

      // Detecta achievements
      const achievements: Array<{ type: string; message: string }> = [];

      // Achievement: Primeira vez completando a unidade
      if (!wasCompleted && updatedProgress.isCompleted()) {
        achievements.push({
          type: 'unit_completed',
          message: `Unidade completada! ${progressData.totalXpEarned} XP ganhos`,
        });
      }

      // Achievement: Score perfeito
      if (data.score && data.score === 100) {
        achievements.push({
          type: 'perfect_score',
          message: 'Score perfeito! 100%',
        });
      }

      // Achievement: Score alto
      if (data.score && data.score >= 90 && !achievements.some(a => a.type === 'perfect_score')) {
        achievements.push({
          type: 'high_score',
          message: `Excelente desempenho! ${data.score}%`,
        });
      }

      const result: UpdateUnitProgressResult = {
        success: true,
        message: updatedProgress.isCompleted()
          ? 'Unidade completada com sucesso!'
          : 'Progresso atualizado com sucesso',
        progress: {
          id: progressData.id,
          unitId: progressData.unitId,
          userId: progressData.userId,
          status: progressData.status,
          levelsCompleted: progressData.levelsCompleted,
          totalLevels: progressData.totalLevels,
          completionPercentage: progressData.completionPercentage,
          currentLevelId: progressData.currentLevelId,
          highestScore: progressData.highestScore,
          totalXpEarned: progressData.totalXpEarned,
          attemptsCount: progressData.attemptsCount,
          completedAt: progressData.completedAt,
        },
        achievements: achievements.length > 0 ? achievements : undefined,
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'update_unit_progress_completed',
        userId: data.userId,
        unitId: data.unitId,
        previousStatus,
        newStatus: progressData.status,
        levelsCompleted: progressData.levelsCompleted,
        totalLevels: progressData.totalLevels,
        completionPercentage: progressData.completionPercentage,
        achievements: achievements.map(a => a.type),
        processingTime,
      }, 'Unit progress updated successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'update_unit_progress_failed',
        userId: data.userId,
        unitId: data.unitId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to update unit progress');
      throw error;
    }
  }
}
