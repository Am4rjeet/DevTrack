import api from '@/lib/api';

export const githubApi = {
  status: () => api.get('/github/status'),
  get: (refresh = false) => api.get('/github', { params: refresh ? { refresh: true } : {} }),
  connect: (data) => api.post('/github/connect', data),
  sync: () => api.post('/github/sync'),
  disconnect: () => api.delete('/github/disconnect'),
};
