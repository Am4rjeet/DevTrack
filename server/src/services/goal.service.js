import goalRepository from '../repositories/goal.repository.js';
import AppError from '../utils/AppError.js';
import xpService from './xp.service.js';
import achievementService from './achievement.service.js';

const goalService = {
  async create(userId, data) {
    return goalRepository.create({
      ...data,
      userId,
      ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
    });
  },

  async getAll(userId, query) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);

    const [goals, total] = await goalRepository.findByUser(userId, {
      status: query.status,
      category: query.category,
      page,
      limit,
    });

    return { goals, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async getById(userId, goalId) {
    const goal = await goalRepository.findByIdAndUser(goalId, userId);
    if (!goal) throw new AppError('Goal not found', 404, 'NOT_FOUND');
    return goal;
  },

  async update(userId, goalId, data) {
    const goal = await goalRepository.findByIdAndUser(goalId, userId);
    if (!goal) throw new AppError('Goal not found', 404, 'NOT_FOUND');

    const wasCompleted = goal.status === 'completed';

    Object.assign(goal, {
      ...data,
      ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
    });

    if (goal.milestones?.length > 0) {
      const completed = goal.milestones.filter((m) => m.completed).length;
      goal.progress = Math.round((completed / goal.milestones.length) * 100);
    }

    if (goal.status === 'completed' && !goal.completedAt) {
      goal.completedAt = new Date();
    }

    await goalRepository.save(goal);

    let achievements = [];
    if (goal.status === 'completed' && !wasCompleted) {
      await xpService.awardXP(userId, goal.xpReward, {
        source: 'goal',
        referenceId: goal._id,
        referenceModel: 'Goal',
        description: `Goal completed: ${goal.title}`,
      });
      achievements = await achievementService.checkAfterGoalComplete(userId);
    }

    return { goal, achievements };
  },

  async delete(userId, goalId) {
    const goal = await goalRepository.deleteById(goalId, userId);
    if (!goal) throw new AppError('Goal not found', 404, 'NOT_FOUND');
    return { message: 'Goal deleted' };
  },

  async toggleMilestone(userId, goalId, milestoneId, completed) {
    const goal = await goalRepository.findByIdAndUser(goalId, userId);
    if (!goal) throw new AppError('Goal not found', 404, 'NOT_FOUND');

    const wasCompleted = goal.status === 'completed';

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) throw new AppError('Milestone not found', 404, 'NOT_FOUND');

    milestone.completed = completed ?? !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : undefined;

    const completedCount = goal.milestones.filter((m) => m.completed).length;
    goal.progress =
      goal.milestones.length > 0
        ? Math.round((completedCount / goal.milestones.length) * 100)
        : goal.progress;

    if (goal.progress === 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    await goalRepository.save(goal);

    let achievements = [];
    if (goal.status === 'completed' && !wasCompleted) {
      await xpService.awardXP(userId, goal.xpReward, {
        source: 'goal',
        referenceId: goal._id,
        referenceModel: 'Goal',
        description: `Goal completed: ${goal.title}`,
      });
      achievements = await achievementService.checkAfterGoalComplete(userId);
    }

    return { goal, achievements };
  },

  async complete(userId, goalId) {
    return this.update(userId, goalId, { status: 'completed', completedAt: new Date() });
  },
};

export default goalService;
