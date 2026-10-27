import api from './client';

export const getNotifications = (unreadOnly = false) =>
  api.get('/notifications', { params: { unreadOnly } });

export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);

export const markAllAsRead = () => api.patch('/notifications/read-all');
