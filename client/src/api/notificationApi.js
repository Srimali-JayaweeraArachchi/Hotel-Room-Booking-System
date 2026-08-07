import httpClient from './httpClient.js';

export async function getNotifications() {
  const response = await httpClient.get('/notifications');
  return response.data.data;
}
export async function markNotificationRead(id) {
  const response = await httpClient.patch(`/notifications/${id}/read`);
  return response.data.data;
}
export async function markAllNotificationsRead() {
  const response = await httpClient.patch('/notifications/read-all');
  return response.data.data;
}
