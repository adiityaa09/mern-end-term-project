import api from './client';

export const getApplications = (params = {}) => api.get('/applications', { params });

export const getApplicationById = (id) => api.get(`/applications/${id}`);

export const createApplication = (data) => api.post('/applications', data);

export const updateApplication = (id, data) => api.patch(`/applications/${id}`, data);

export const transitionStage = (id, targetStage, note = '') =>
  api.patch(`/applications/${id}/stage`, { targetStage, note });

export const deleteApplication = (id) => api.delete(`/applications/${id}`);
