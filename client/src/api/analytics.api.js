import api from './client';

export const getOverviewAnalytics = () => api.get('/analytics/overview');
