import mongoose from 'mongoose';

const signupAttemptSchema = new mongoose.Schema(
  {
    ipHash: { type: String, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

signupAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86_400 });

const SignupAttempt = mongoose.model('SignupAttempt', signupAttemptSchema);

export default SignupAttempt;
