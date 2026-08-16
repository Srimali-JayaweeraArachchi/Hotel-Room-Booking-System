import httpClient from './httpClient.js';

export async function getRoomTypeReviews(roomTypeId) {
  const response = await httpClient.get(`/reviews/room-types/${roomTypeId}`);
  return response.data.data;
}
export async function getMyReviews() {
  const response = await httpClient.get('/reviews/me');
  return response.data.data.reviews;
}
export async function createReview(bookingId, data) {
  const response = await httpClient.post(
    `/reviews/bookings/${bookingId}`,
    data,
  );
  return response.data.data.review;
}
export async function updateReview(id, data) {
  const response = await httpClient.put(`/reviews/${id}`, data);
  return response.data.data.review;
}
export async function deleteReview(id) {
  await httpClient.delete(`/reviews/${id}`);
}
