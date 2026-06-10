import User from '../models/User.model.js';

const authSelectFields =
  '+password +emailVerificationToken +emailVerificationExpires +passwordResetToken +passwordResetExpires +refreshTokens';

const userRepository = {
  create(data) {
    return User.create(data);
  },

  findById(id) {
    return User.findById(id);
  },

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  },

  findByEmailWithAuth(email) {
    return User.findOne({ email: email.toLowerCase() }).select(authSelectFields);
  },

  findByUsername(username) {
    return User.findOne({ username });
  },

  findByIdWithAuth(id) {
    return User.findById(id).select(authSelectFields);
  },

  findByEmailVerificationToken(tokenHash) {
    return User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).select(authSelectFields);
  },

  findByPasswordResetToken(tokenHash) {
    return User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select(authSelectFields);
  },

  save(user, session = null) {
    return user.save(session ? { session } : undefined);
  },

  deleteById(id) {
    return User.findByIdAndDelete(id);
  },
};

export default userRepository;
