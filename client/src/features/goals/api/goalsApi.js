import api from '@/lib/api';

export const goalsApi = {
  list: (params) => api.get('/goals', { params }),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  complete: (id) => api.patch(`/goals/${id}/complete`),
  toggleMilestone: (goalId, milestoneId, completed) =>
    api.patch(`/goals/${goalId}/milestones/${milestoneId}`, { completed }),
};
