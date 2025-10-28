import type { FastifyRequest, FastifyReply } from 'fastify';
import { ListModulesWithProgressUseCase } from '../../application/use-cases/list-modules-with-progress.use-case';
import { GetModuleDetailsUseCase } from '../../application/use-cases/get-module-details.use-case';
import { UpdateModuleProgressUseCase } from '../../application/use-cases/update-module-progress.use-case';
import { ListModuleChallengesUseCase } from '../../application/use-cases/list-module-challenges.use-case';

export class ModuleController {
  constructor(
    private readonly listModulesWithProgressUseCase: ListModulesWithProgressUseCase,
    private readonly getModuleDetailsUseCase: GetModuleDetailsUseCase,
    private readonly updateModuleProgressUseCase: UpdateModuleProgressUseCase,
    private readonly listModuleChallengesUseCase: ListModuleChallengesUseCase
  ) {}

  listModulesWithProgress = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;

      const modules = await this.listModulesWithProgressUseCase.execute({ userId });

      reply.code(200).send({
        success: true,
        data: modules,
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  getModuleDetails = async (
    request: FastifyRequest<{
      Params: { slug: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any)?.id;
      const { slug } = request.params;

      const module = await this.getModuleDetailsUseCase.execute({ userId, slug });

      reply.code(200).send({
        success: true,
        data: module,
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

  updateModuleProgress = async (
    request: FastifyRequest<{
      Params: { moduleId: string };
      Body: {
        challengesCompleted: number;
        xpEarned: number;
        score: number;
      };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { moduleId } = request.params;
      const { challengesCompleted, xpEarned, score } = request.body;

      const progress = await this.updateModuleProgressUseCase.execute({
        userId,
        moduleId,
        challengesCompleted,
        xpEarned,
        score,
      });

      reply.code(200).send({
        success: true,
        data: progress,
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  listModuleChallenges = async (
    request: FastifyRequest<{
      Params: { slug: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const userId = (request.user as any).id;
      const { slug } = request.params;

      const challenges = await this.listModuleChallengesUseCase.execute({ userId, slug });

      reply.code(200).send({
        success: true,
        data: challenges,
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
