import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IUnitRepository, IUserUnitProgressRepository } from '../../domain/repositories/unit.repository.interface';
import { UserUnitProgressEntity } from '../../domain/entities/user-unit-progress.entity';
import { UnitStatus } from '../../domain/enums/unit-status.enum';
import { z } from 'zod';

export const StartUnitSchema = z.object({
  unitId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type StartUnitDTO = z.infer<typeof StartUnitSchema>;

export interface StartUnitResult {
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
    startedAt: Date | null;
  };
  nextSteps: {
    action: 'view_theory' | 'start_first_level';
    message: string;
  };
}

/**
 *
 * Responsabilidades:
 * - Verificar se unidade existe
 * - Criar ou recuperar progresso do usuário
 * - Iniciar progresso (mudar status para IN_PROGRESS)
 * - Orientar próximos passos (teoria ou primeiro nível)
 *
 * Regras de negócio:
 * - Se unidade tem teoria, sugerir visualização antes
 * - Se não tem teoria, ir direto para primeiro nível
 * - Atualizar lastAccessedAt
 */
export class StartUnitUseCase {
  constructor(
    private readonly unitRepository: IUnitRepository,
    private readonly progressRepository: IUserUnitProgressRepository
  ) {}

  async execute(data: StartUnitDTO): Promise<StartUnitResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'start_unit_initiated',
      unitId: data.unitId,
      userId: data.userId,
    }, 'Starting unit');

    try {
      // Busca unidade
      const unit = await this.unitRepository.findById(data.unitId);
      if (!unit) {
        logger.warn({
          operation: 'start_unit_not_found',
          unitId: data.unitId,
          userId: data.userId,
        }, 'Unit not found');
        throw new Error(`Unit with ID ${data.unitId} not found`);
      }

      // Conta níveis da unidade
      const totalLevels = await this.unitRepository.countLevelsInUnit(data.unitId);

      // Busca ou cria progresso
      let progress = await this.progressRepository.findByUserIdAndUnitId(
        data.userId,
        data.unitId
      );

      let isNewProgress = false;

      if (!progress) {
        // Cria novo progresso
        progress = UserUnitProgressEntity.create({
          userId: data.userId,
          unitId: data.unitId,
          totalLevels,
          status: UnitStatus.AVAILABLE,
        });
        isNewProgress = true;
      }

      // Inicia a unidade (muda status para IN_PROGRESS)
      progress.start();

      // Persiste progresso
      if (isNewProgress) {
        progress = await this.progressRepository.create(progress);
      } else {
        progress = await this.progressRepository.update(progress);
      }

      const progressData = progress.toJSON();

      // Define próximos passos com base no conteúdo teórico
      const nextSteps = unit.hasTheoryContent()
        ? {
            action: 'view_theory' as const,
            message: 'Recomendamos ler o conteúdo teórico antes de iniciar os níveis',
          }
        : {
            action: 'start_first_level' as const,
            message: 'Você pode iniciar o primeiro nível agora',
          };

      const result: StartUnitResult = {
        success: true,
        message: isNewProgress
          ? 'Unidade iniciada com sucesso'
          : 'Continuando unidade em progresso',
        progress: {
          id: progressData.id,
          unitId: progressData.unitId,
          userId: progressData.userId,
          status: progressData.status,
          levelsCompleted: progressData.levelsCompleted,
          totalLevels: progressData.totalLevels,
          completionPercentage: progressData.completionPercentage,
          startedAt: progressData.startedAt,
        },
        nextSteps,
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'start_unit_completed',
        unitId: data.unitId,
        userId: data.userId,
        isNewProgress,
        status: progressData.status,
        hasTheory: unit.hasTheoryContent(),
        processingTime,
      }, 'Unit started successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'start_unit_failed',
        unitId: data.unitId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to start unit');
      throw error;
    }
  }
}
