import mongoose from 'mongoose';

const rankingEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    displayName: { type: String },
    avatar: { type: String, default: '' },
    totalXP: { type: Number, required: true, min: 0 },
    level: { type: Number, required: true, min: 1 },
    rank: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const leaderboardSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'alltime'],
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: { type: Date },
    rankings: {
      type: [rankingEntrySchema],
      default: [],
      validate: {
        validator: (rankings) => rankings.length <= 100,
        message: 'Leaderboard cannot exceed 100 entries',
      },
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

leaderboardSchema.index({ period: 1, periodStart: -1 }, { unique: true });
leaderboardSchema.index({ computedAt: -1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
