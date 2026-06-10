import mongoose from 'mongoose';

const dsaMetadataSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['leetcode', 'hackerrank', 'codeforces', 'codewars', 'other'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    problemUrl: { type: String },
    tags: [{ type: String, trim: true }],
    solved: { type: Boolean, default: true },
  },
  { _id: false }
);

const progressEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: {
        values: ['coding', 'dsa', 'learning', 'project', 'other'],
        message: '{VALUE} is not a valid activity type',
      },
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
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours'],
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    metadata: {
      type: dsaMetadataSchema,
      default: undefined,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

progressEntrySchema.index({ userId: 1, date: -1 });
progressEntrySchema.index({ userId: 1, type: 1, date: -1 });
progressEntrySchema.index({ userId: 1, date: 1 });
progressEntrySchema.index({ createdAt: -1 });

const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);

export default ProgressEntry;
