import api from './client';

export const registerUser = (userData) => api.post('/auth/register', userData);

export const loginUser = (credentials) => api.post('/auth/login', credentials);

export const logoutUser = () => api.post('/auth/logout');

export const getCurrentUser = () => api.get('/auth/me');

export const updateUserSettings = (settings) => api.patch('/auth/settings', { reminderSettings: settings });
