import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
const MAX_REFRESH_TOKENS = 5;

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    deviceId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    avatar: { type: String, default: '' },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      validate: {
        validator: (tokens) => tokens.length <= MAX_REFRESH_TOKENS,
        message: `Cannot have more than ${MAX_REFRESH_TOKENS} active sessions`,
      },
    },
    totalXP: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActivityDate: { type: Date },
    isProfilePublic: { type: Boolean, default: true },
    githubUsername: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
      },
      weeklyGoalHours: { type: Number, default: 10, min: 1, max: 168 },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ totalXP: -1 });
userSchema.index({ 'refreshTokens.tokenHash': 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addRefreshToken = function addRefreshToken(tokenHash, deviceId, expiresAt) {
  if (this.refreshTokens.length >= MAX_REFRESH_TOKENS) {
    this.refreshTokens.shift();
  }
  this.refreshTokens.push({ tokenHash, deviceId, expiresAt });
};

userSchema.methods.revokeRefreshToken = function revokeRefreshToken(tokenHash) {
  const token = this.refreshTokens.find((t) => t.tokenHash === tokenHash);
  if (token) token.revoked = true;
};

userSchema.methods.revokeAllRefreshTokens = function revokeAllRefreshTokens() {
  this.refreshTokens.forEach((t) => {
    t.revoked = true;
  });
};

const User = mongoose.model('User', userSchema);

export default User;
