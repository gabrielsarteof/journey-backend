import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListModulesWithProgressUseCase } from '@/modules/modules/application/use-cases/list-modules-with-progress.use-case';
import { GetModuleDetailsUseCase } from '@/modules/modules/application/use-cases/get-module-details.use-case';
import { UpdateModuleProgressUseCase } from '@/modules/modules/application/use-cases/update-module-progress.use-case';
import { ModuleEntity } from '@/modules/modules/domain/entities/module.entity';
import { UserModuleProgressEntity } from '@/modules/modules/domain/entities/user-module-progress.entity';
import { ModuleThemeVO } from '@/modules/modules/domain/value-objects/module-theme.vo';

vi.mock('@/shared/infrastructure/monitoring/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockModuleRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByOrderIndex: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  countChallengesInModule: vi.fn(),
};

const mockProgressRepository = {
  findByUserIdAndModuleId: vi.fn(),
  findByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('Module Integration Tests', () => {
  let listModulesUseCase: ListModulesWithProgressUseCase;
  let getModuleDetailsUseCase: GetModuleDetailsUseCase;
  let updateProgressUseCase: UpdateModuleProgressUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    listModulesUseCase = new ListModulesWithProgressUseCase(mockModuleRepository, mockProgressRepository);
    getModuleDetailsUseCase = new GetModuleDetailsUseCase(mockModuleRepository, mockProgressRepository);
    updateProgressUseCase = new UpdateModuleProgressUseCase(mockProgressRepository);
  });

  const createMockModule = (overrides = {}) => {
    const theme = ModuleThemeVO.create({
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'],
    });

    return ModuleEntity.create({
      slug: 'backend',
      title: 'Núcleo da Nebulosa',
      description: 'Fundamentos Backend',
      orderIndex: 1,
      iconImage: 'backend.png',
      theme,
      isLocked: false,
      ...overrides,
    });
  };

  const createMockProgress = (moduleId: string, overrides = {}) => {
    return UserModuleProgressEntity.create({
      userId: 'user-123',
      moduleId,
      totalChallenges: 5,
      ...overrides,
    });
  };

  describe('ListModulesWithProgressUseCase', () => {
    it('should list all modules with user progress', async () => {
      const module1 = createMockModule({ slug: 'backend', orderIndex: 1 });
      const module2 = createMockModule({ slug: 'frontend', orderIndex: 2 });

      const progress1 = createMockProgress(module1.getId());
      progress1.unlock();
      progress1.start();
      progress1.updateProgress(2, 100, 80);

      mockModuleRepository.findAll.mockResolvedValue([module1, module2]);
      mockProgressRepository.findByUserId.mockResolvedValue([progress1]);

      const result = await listModulesUseCase.execute({ userId: 'user-123' });

      expect(result).toHaveLength(2);

      const backendResult = result.find(r => r.slug === 'backend');
      const frontendResult = result.find(r => r.slug === 'frontend');

      expect(backendResult).toBeDefined();
      expect(frontendResult).toBeDefined();
      expect(backendResult?.progress?.status).toBe('IN_PROGRESS');
      expect(backendResult?.progress?.challengesCompleted).toBe(2);

      // Apenas verifica que o progresso do frontend não é o mesmo do backend
      if (frontendResult?.progress) {
        expect(frontendResult.progress.challengesCompleted).not.toBe(2);
      }
    });

    it('should return modules sorted by orderIndex', async () => {
      const modules = [
        createMockModule({ slug: 'devops', orderIndex: 3 }),
        createMockModule({ slug: 'backend', orderIndex: 1 }),
        createMockModule({ slug: 'frontend', orderIndex: 2 }),
      ];

      mockModuleRepository.findAll.mockResolvedValue(modules);
      mockProgressRepository.findByUserId.mockResolvedValue([]);

      const result = await listModulesUseCase.execute({ userId: 'user-123' });

      expect(result[0].orderIndex).toBe(1);
      expect(result[1].orderIndex).toBe(2);
      expect(result[2].orderIndex).toBe(3);
    });

    it('should handle user with no progress', async () => {
      const module = createMockModule();

      mockModuleRepository.findAll.mockResolvedValue([module]);
      mockProgressRepository.findByUserId.mockResolvedValue([]);

      const result = await listModulesUseCase.execute({ userId: 'user-123' });

      expect(result).toHaveLength(1);
      expect(result[0].progress).toBeNull();
    });
  });

  describe('GetModuleDetailsUseCase', () => {
    it('should get module details with progress', async () => {
      const module = createMockModule({ slug: 'backend' });
      const progress = createMockProgress(module.getId());
      progress.unlock();
      progress.start();
      progress.updateProgress(3, 150, 85);

      mockModuleRepository.findBySlug.mockResolvedValue(module);
      mockModuleRepository.countChallengesInModule.mockResolvedValue(5);
      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(progress);

      const result = await getModuleDetailsUseCase.execute({
        userId: 'user-123',
        slug: 'backend',
      });

      expect(result.slug).toBe('backend');
      expect(result.totalChallenges).toBe(5);
      expect(result.progress?.challengesCompleted).toBe(3);
      expect(result.progress?.status).toBe('IN_PROGRESS');
    });

    it('should get module details without progress', async () => {
      const module = createMockModule({ slug: 'backend' });

      mockModuleRepository.findBySlug.mockResolvedValue(module);
      mockModuleRepository.countChallengesInModule.mockResolvedValue(5);
      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(null);

      const result = await getModuleDetailsUseCase.execute({
        userId: 'user-123',
        slug: 'backend',
      });

      expect(result.slug).toBe('backend');
      expect(result.progress).toBeNull();
    });

    it('should throw error for non-existent module', async () => {
      mockModuleRepository.findBySlug.mockResolvedValue(null);

      await expect(
        getModuleDetailsUseCase.execute({
          userId: 'user-123',
          slug: 'non-existent',
        })
      ).rejects.toThrow('Module not found: non-existent');
    });
  });

  describe('UpdateModuleProgressUseCase', () => {
    it('should update module progress', async () => {
      const moduleId = 'module-123';
      const progress = createMockProgress(moduleId);
      progress.unlock();
      progress.start();

      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(progress);
      mockProgressRepository.update.mockResolvedValue(undefined);

      const result = await updateProgressUseCase.execute({
        userId: 'user-123',
        moduleId,
        challengesCompleted: 3,
        xpEarned: 150,
        score: 85,
      });

      expect(result.challengesCompleted).toBe(3);
      expect(result.status).toBe('IN_PROGRESS');
      expect(mockProgressRepository.update).toHaveBeenCalled();
    });

    it('should complete module when all challenges are done', async () => {
      const moduleId = 'module-123';
      const progress = createMockProgress(moduleId);
      progress.unlock();
      progress.start();

      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(progress);
      mockProgressRepository.update.mockResolvedValue(undefined);

      const result = await updateProgressUseCase.execute({
        userId: 'user-123',
        moduleId,
        challengesCompleted: 5,
        xpEarned: 500,
        score: 90,
      });

      expect(result.completionPercentage).toBe(100);
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw error for non-existent progress', async () => {
      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(null);

      await expect(
        updateProgressUseCase.execute({
          userId: 'user-123',
          moduleId: 'module-123',
          challengesCompleted: 1,
          xpEarned: 50,
          score: 80,
        })
      ).rejects.toThrow('Progress not found');
    });

    it('should calculate average score correctly', async () => {
      const moduleId = 'module-123';
      const progress = createMockProgress(moduleId);
      progress.unlock();
      progress.start();
      progress.updateProgress(1, 50, 80);

      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(progress);
      mockProgressRepository.update.mockResolvedValue(undefined);

      const result = await updateProgressUseCase.execute({
        userId: 'user-123',
        moduleId,
        challengesCompleted: 2,
        xpEarned: 50,
        score: 90,
      });

      expect(result.averageScore).toBe(85);
    });
  });

  describe('Module Progression Flow', () => {
    it('should handle complete module progression flow', async () => {
      const module = createMockModule({ slug: 'backend' });
      const progress = createMockProgress(module.getId());

      mockModuleRepository.findBySlug.mockResolvedValue(module);
      mockModuleRepository.countChallengesInModule.mockResolvedValue(5);
      mockProgressRepository.findByUserIdAndModuleId.mockResolvedValue(progress);
      mockProgressRepository.update.mockResolvedValue(undefined);

      progress.unlock();
      expect(progress.getStatus()).toBe('AVAILABLE');

      progress.start();
      expect(progress.getStatus()).toBe('IN_PROGRESS');

      for (let i = 1; i <= 5; i++) {
        progress.updateProgress(i, 50, 80);
      }

      expect(progress.getStatus()).toBe('COMPLETED');
      expect(progress.getCompletionPercentage()).toBe(100);
    });

    it('should track XP correctly across challenges', async () => {
      const progress = createMockProgress('module-123');
      progress.unlock();
      progress.start();

      progress.updateProgress(1, 100, 85);
      expect(progress.toJSON().totalXpEarned).toBe(100);

      progress.updateProgress(2, 150, 90);
      expect(progress.toJSON().totalXpEarned).toBe(250);

      progress.updateProgress(3, 200, 95);
      expect(progress.toJSON().totalXpEarned).toBe(450);
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockModuleRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(
        listModulesUseCase.execute({ userId: 'user-123' })
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid module slug', async () => {
      mockModuleRepository.findBySlug.mockResolvedValue(null);

      await expect(
        getModuleDetailsUseCase.execute({ userId: 'user-123', slug: '' })
      ).rejects.toThrow();
    });
  });
});
