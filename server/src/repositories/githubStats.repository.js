import GithubStats from '../models/GithubStats.model.js';

const authSelectFields = '+accessToken';

const githubStatsRepository = {
  findByUserId(userId) {
    return GithubStats.findOne({ userId });
  },

  findByUserIdWithToken(userId) {
    return GithubStats.findOne({ userId }).select(authSelectFields);
  },

  findByGithubUsername(githubUsername) {
    return GithubStats.findOne({ githubUsername: githubUsername.toLowerCase() });
  },

  upsert(userId, data) {
    return GithubStats.findOneAndUpdate(
      { userId },
      { $set: { userId, ...data } },
      { upsert: true, new: true }
    );
  },

  deleteByUserId(userId) {
    return GithubStats.findOneAndDelete({ userId });
  },
};

export default githubStatsRepository;
