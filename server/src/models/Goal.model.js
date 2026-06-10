import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Milestone title cannot exceed 200 characters'],
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['dsa', 'coding', 'learning', 'career', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    targetDate: { type: Date },
    completedAt: { type: Date },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    xpReward: {
      type: Number,
      default: 100,
      min: 0,
    },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, status: 1, targetDate: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

goalSchema.pre('save', function calculateProgress(next) {
  if (this.milestones.length > 0) {
    const completed = this.milestones.filter((m) => m.completed).length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
  }
  next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
