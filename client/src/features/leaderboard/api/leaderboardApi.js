import api from '@/lib/api';

export const leaderboardApi = {
  get: (period = 'weekly') => api.get('/leaderboard', { params: { period } }),
  myRank: (period = 'weekly') => api.get('/leaderboard/me', { params: { period } }),
};
