import mongoose from 'mongoose';
import userRepository from '../repositories/user.repository.js';
import xpRepository from '../repositories/xp.repository.js';
import { calculateLevel } from '../utils/level.calculator.js';
import AppError from '../utils/AppError.js';

const xpService = {
  async awardXP(userId, amount, { source, referenceId, referenceModel, description, session } = {}) {
    if (amount === 0) return null;

    const runAward = async (activeSession) => {
      const user = await userRepository.findById(userId);
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

      const newBalance = Math.max(0, user.totalXP + amount);
      user.totalXP = newBalance;
      user.level = calculateLevel(newBalance);

      await userRepository.save(user, activeSession);

      return xpRepository.create(
        {
          userId,
          amount,
          source,
          referenceId,
          referenceModel,
          description,
          balanceAfter: newBalance,
        },
        activeSession
      );
    };

    if (session) {
      return runAward(session);
    }

    const ownSession = await mongoose.startSession();
    ownSession.startTransaction();
    try {
      const transaction = await runAward(ownSession);
      await ownSession.commitTransaction();
      return transaction;
    } catch (error) {
      await ownSession.abortTransaction();
      throw error;
    } finally {
      ownSession.endSession();
    }
  },

  async deductXP(userId, amount, { source, referenceId, referenceModel, description } = {}) {
    return this.awardXP(userId, -Math.abs(amount), {
      source,
      referenceId,
      referenceModel,
      description: description || 'XP adjustment',
    });
  },

  async getHistory(userId, options) {
    const [transactions, total] = await xpRepository.findByUser(userId, options);
    return { transactions, total };
  },
};

export default xpService;
