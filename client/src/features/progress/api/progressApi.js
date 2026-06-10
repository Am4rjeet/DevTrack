import api from '@/lib/api';

export const progressApi = {
  list: (params) => api.get('/progress', { params }),
  create: (data) => api.post('/progress', data),
  update: (id, data) => api.put(`/progress/${id}`, data),
  delete: (id) => api.delete(`/progress/${id}`),
  summary: (params) => api.get('/progress/summary', { params }),
};
