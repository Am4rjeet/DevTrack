import api from '@/lib/api';

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};
