import api from '@/lib/api';

export const usersApi = {
  getPublicProfile: (username) => api.get(`/users/${username}`),
};
