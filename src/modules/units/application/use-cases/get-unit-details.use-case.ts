import { logger } from '@/shared/infrastructure/monitoring/logger';
import { IUnitRepository, IUserUnitProgressRepository } from '../../domain/repositories/unit.repository.interface';
import { z } from 'zod';

export const GetUnitDetailsSchema = z.object({
  unitId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type GetUnitDetailsDTO = z.infer<typeof GetUnitDetailsSchema>;

export interface UnitDetailsResult {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleId: string;
  orderInModule: number;
  iconImage: string | null;
  theme: {
    color: string;
    gradient?: string[];
    icon?: string;
  } | null;
  learningObjectives: string[];
  estimatedMinutes: number;
  theoryContent: string | null;
  resources: {
    articles: Array<{
      title: string;
      url: string;
      author?: string;
    }>;
    videos: Array<{
      title: string;
      url: string;
      duration?: string;
      platform?: string;
    }>;
  };
  requiredScore: number;
  totalLevels: number;
  hasTheoryContent: boolean;
  hasEducationalResources: boolean;
  progress: {
    status: string;
    levelsCompleted: number;
    totalLevels: number;
    completionPercentage: number;
    currentLevelId: string | null;
    highestScore: number;
    attemptsCount: number;
    totalXpEarned: number;
    startedAt: Date | null;
    completedAt: Date | null;
    lastAccessedAt: Date;
  } | null;
}

/**
 *
 * Responsabilidades:
 * - Buscar unidade por ID
 * - Buscar progresso do usuário
 * - Incluir conteúdo teórico e recursos educacionais
 * - Contar níveis da unidade
 *
 * Casos de uso:
 * - Exibir página de detalhes da unidade
 * - Mostrar teoria antes de iniciar níveis
 * - Exibir recursos complementares (importante para TCC)
 */
export class GetUnitDetailsUseCase {
  constructor(
    private readonly unitRepository: IUnitRepository,
    private readonly progressRepository: IUserUnitProgressRepository
  ) {}

  async execute(data: GetUnitDetailsDTO): Promise<UnitDetailsResult> {
    const startTime = Date.now();

    logger.info({
      operation: 'get_unit_details_started',
      unitId: data.unitId,
      userId: data.userId,
    }, 'Getting unit details');

    try {
      // Busca unidade
      const unit = await this.unitRepository.findById(data.unitId);
      if (!unit) {
        logger.warn({
          operation: 'get_unit_details_not_found',
          unitId: data.unitId,
          userId: data.userId,
        }, 'Unit not found');
        throw new Error(`Unit with ID ${data.unitId} not found`);
      }

      // Busca progresso do usuário
      const progress = await this.progressRepository.findByUserIdAndUnitId(
        data.userId,
        data.unitId
      );

      // Conta níveis da unidade
      const totalLevels = await this.unitRepository.countLevelsInUnit(data.unitId);

      const unitData = unit.toJSON();

      const result: UnitDetailsResult = {
        id: unitData.id,
        slug: unitData.slug,
        title: unitData.title,
        description: unitData.description,
        moduleId: unitData.moduleId,
        orderInModule: unitData.orderInModule,
        iconImage: unitData.iconImage,
        theme: unitData.theme,
        learningObjectives: unitData.learningObjectives,
        estimatedMinutes: unitData.estimatedMinutes,
        theoryContent: unitData.theoryContent,
        resources: unitData.resources,
        requiredScore: unitData.requiredScore,
        totalLevels,
        hasTheoryContent: unit.hasTheoryContent(),
        hasEducationalResources: unit.hasEducationalResources(),
        progress: progress ? progress.toJSON() : null,
      };

      const processingTime = Date.now() - startTime;

      logger.info({
        operation: 'get_unit_details_completed',
        unitId: data.unitId,
        userId: data.userId,
        totalLevels,
        hasProgress: !!progress,
        processingTime,
      }, 'Unit details retrieved successfully');

      return result;
    } catch (error) {
      logger.error({
        operation: 'get_unit_details_failed',
        unitId: data.unitId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }, 'Failed to get unit details');
      throw error;
    }
  }
}
