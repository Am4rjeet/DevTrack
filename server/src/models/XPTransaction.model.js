import mongoose from 'mongoose';

const xpTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'XP amount is required'],
    },
    source: {
      type: String,
      required: [true, 'XP source is required'],
      enum: ['progress', 'goal', 'achievement', 'streak_bonus', 'admin'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['ProgressEntry', 'Goal', 'Achievement'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after transaction is required'],
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

xpTransactionSchema.index({ userId: 1, createdAt: -1 });
xpTransactionSchema.index({ userId: 1, source: 1, createdAt: -1 });
xpTransactionSchema.index({ referenceId: 1 }, { sparse: true });

const XPTransaction = mongoose.model('XPTransaction', xpTransactionSchema);

export default XPTransaction;
