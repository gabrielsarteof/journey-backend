import type { FastifyRequest, FastifyReply } from 'fastify';
import { ListLevelsWithProgressUseCase } from '../../application/use-cases/list-levels-with-progress.use-case';
import { GetLevelDetailsUseCase } from '../../application/use-cases/get-level-details.use-case';
import { StartLevelUseCase } from '../../application/use-cases/start-level.use-case';
import { CompleteLevelUseCase } from '../../application/use-cases/complete-level.use-case';

/**
 * Lida com HTTP requests/responses da camada de apresentação
 */
export class LevelController {
  constructor(
    private readonly listLevelsWithProgressUseCase: ListLevelsWithProgressUseCase,
    private readonly getLevelDetailsUseCase: GetLevelDetailsUseCase,
    private readonly startLevelUseCase: StartLevelUseCase,
    private readonly completeLevelUseCase: CompleteLevelUseCase
  ) {}

  /**
   * GET /units/:unitId/levels
   * Lista todos os níveis de uma unidade com progresso
   */
  listLevelsByUnit = async (
    request: FastifyRequest<{
      Params: { unitId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { unitId } = request.params;

      const levels = await this.listLevelsWithProgressUseCase.execute({
        unitId,
        userId,
      });

      reply.code(200).send({
        success: true,
        data: levels,
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * GET /levels/:levelId
   * Obtém detalhes completos de um nível
   */
  getLevelDetails = async (
    request: FastifyRequest<{
      Params: { levelId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { levelId } = request.params;

      const level = await this.getLevelDetailsUseCase.execute({
        levelId,
        userId,
      });

      reply.code(200).send({
        success: true,
        data: level,
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
   * POST /levels/:levelId/start
   * Inicia um nível para o usuário
   */
  startLevel = async (
    request: FastifyRequest<{
      Params: { levelId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { levelId } = request.params;

      const result = await this.startLevelUseCase.execute({
        levelId,
        userId,
      });

      reply.code(200).send(result);
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
   * POST /levels/:levelId/complete
   * Completa um nível com score
   */
  completeLevel = async (
    request: FastifyRequest<{
      Params: { levelId: string };
      Body: {
        score: number;
        timeSpent?: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { levelId } = request.params;
      const { score, timeSpent } = request.body;

      const result = await this.completeLevelUseCase.execute({
        levelId,
        userId,
        score,
        timeSpent,
      });

      reply.code(200).send(result);
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
