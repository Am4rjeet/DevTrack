import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stars: { type: Number, default: 0 },
    language: { type: String },
    url: { type: String },
    description: { type: String },
    updatedAt: { type: Date },
  },
  { _id: false }
);

const commitSchema = new mongoose.Schema(
  {
    repo: { type: String, required: true },
    message: { type: String },
    date: { type: Date },
    sha: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const githubStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    githubUsername: {
      type: String,
      required: [true, 'GitHub username is required'],
      trim: true,
      lowercase: true,
    },
    accessToken: {
      type: String,
      select: false,
    },
    profile: {
      name: { type: String },
      avatar: { type: String },
      bio: { type: String },
      location: { type: String },
      company: { type: String },
      blog: { type: String },
      htmlUrl: { type: String },
    },
    followers: { type: Number, default: 0, min: 0 },
    following: { type: Number, default: 0, min: 0 },
    publicRepos: { type: Number, default: 0, min: 0 },
    repositories: {
      type: [repositorySchema],
      default: [],
      validate: {
        validator: (repos) => repos.length <= 10,
        message: 'Cannot cache more than 10 repositories',
      },
    },
    recentCommits: {
      type: [commitSchema],
      default: [],
      validate: {
        validator: (commits) => commits.length <= 20,
        message: 'Cannot cache more than 20 commits',
      },
    },
    lastSyncedAt: { type: Date },
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'error'],
      default: 'idle',
    },
    syncError: { type: String },
  },
  { timestamps: true }
);

githubStatsSchema.index({ githubUsername: 1 });
githubStatsSchema.index({ lastSyncedAt: 1 });

githubStatsSchema.methods.isStale = function isStale(maxAgeMs = 3_600_000) {
  if (!this.lastSyncedAt) return true;
  return Date.now() - this.lastSyncedAt.getTime() > maxAgeMs;
};

const GithubStats = mongoose.model('GithubStats', githubStatsSchema);

export default GithubStats;
