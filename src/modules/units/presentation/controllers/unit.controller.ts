import type { FastifyRequest, FastifyReply } from 'fastify';
import { ListUnitsWithProgressUseCase } from '../../application/use-cases/list-units-with-progress.use-case';
import { GetUnitDetailsUseCase } from '../../application/use-cases/get-unit-details.use-case';
import { StartUnitUseCase } from '../../application/use-cases/start-unit.use-case';
import { UpdateUnitProgressUseCase } from '../../application/use-cases/update-unit-progress.use-case';

/**
 *
 * Responsabilidades:
 * - Extrair dados do request
 * - Validar autenticação (via preHandler)
 * - Delegar para use cases
 * - Formatar responses HTTP
 * - Tratar erros e retornar status codes apropriados
 *
 * Padrão: Controller (Clean Architecture)
 */
export class UnitController {
  constructor(
    private readonly listUnitsWithProgressUseCase: ListUnitsWithProgressUseCase,
    private readonly getUnitDetailsUseCase: GetUnitDetailsUseCase,
    private readonly startUnitUseCase: StartUnitUseCase,
    private readonly updateUnitProgressUseCase: UpdateUnitProgressUseCase
  ) {}

  /**
   * GET /modules/:moduleId/units
   * Lista todas as unidades de um módulo com progresso do usuário
   */
  listUnitsByModule = async (
    request: FastifyRequest<{
      Params: { moduleId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { moduleId } = request.params;

      const units = await this.listUnitsWithProgressUseCase.execute({
        moduleId,
        userId,
      });

      reply.code(200).send({
        success: true,
        data: units,
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * GET /units/:unitId
   * Obtém detalhes completos de uma unidade
   */
  getUnitDetails = async (
    request: FastifyRequest<{
      Params: { unitId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { unitId } = request.params;

      const unit = await this.getUnitDetailsUseCase.execute({
        unitId,
        userId,
      });

      reply.code(200).send({
        success: true,
        data: unit,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({
          success: false,
          error: error.message,
        });
        return;
      }

      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * POST /units/:unitId/start
   * Inicia uma unidade para o usuário
   */
  startUnit = async (
    request: FastifyRequest<{
      Params: { unitId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { unitId } = request.params;

      const result = await this.startUnitUseCase.execute({
        unitId,
        userId,
      });

      reply.code(result.success ? 200 : 400).send({
        success: result.success,
        message: result.message,
        data: result.progress,
        nextSteps: result.nextSteps,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({
          success: false,
          error: error.message,
        });
        return;
      }

      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * PATCH /units/:unitId/progress
   * Atualiza progresso do usuário em uma unidade
   */
  updateUnitProgress = async (
    request: FastifyRequest<{
      Params: { unitId: string };
      Body: {
        levelsCompleted: number;
        currentLevelId?: string | null;
        xpEarned?: number;
        score?: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { unitId } = request.params;
      const { levelsCompleted, currentLevelId, xpEarned, score } = request.body;

      const result = await this.updateUnitProgressUseCase.execute({
        userId,
        unitId,
        levelsCompleted,
        currentLevelId,
        xpEarned,
        score,
      });

      reply.code(200).send({
        success: result.success,
        message: result.message,
        data: result.progress,
        achievements: result.achievements,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({
          success: false,
          error: error.message,
        });
        return;
      }

      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };
}
