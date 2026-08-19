import httpClient from './httpClient.js';

export async function createBooking(data) {
  const response = await httpClient.post('/bookings', data);
  return response.data.data.booking;
}
export async function getMyBookings() {
  const response = await httpClient.get('/bookings/me');
  return response.data.data.bookings;
}
export async function updateBooking(id, data) {
  const response = await httpClient.put(`/bookings/${id}`, data);
  return response.data.data.booking;
}
export async function cancelBooking(id) {
  const response = await httpClient.patch(`/bookings/${id}/cancel`);
  return response.data.data.booking;
}
export async function getAdminBookings(filters = {}) {
  const response = await httpClient.get('/admin/bookings', { params: filters });
  return response.data.data.bookings;
}
export async function changeBookingStatus(id, status, note = '') {
  const response = await httpClient.patch(`/admin/bookings/${id}/status`, { status, note });
  return response.data.data.booking;
}
