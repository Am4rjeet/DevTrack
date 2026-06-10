import api from '@/lib/api';

export const analyticsApi = {
  overview: (params) => api.get('/analytics/overview', { params }),
  hoursChart: (params) => api.get('/analytics/charts/hours', { params }),
  xpChart: (params) => api.get('/analytics/charts/xp', { params }),
  dsaBreakdown: (params) => api.get('/analytics/charts/dsa', { params }),
  heatmap: (params) => api.get('/analytics/heatmap', { params }),
};
