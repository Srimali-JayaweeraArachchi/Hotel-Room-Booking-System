import httpClient from './httpClient.js';

export async function payForBooking(bookingId, paymentToken) {
  const response = await httpClient.post(`/payments/bookings/${bookingId}`, {
    paymentToken,
    method: 'card',
  });
  return response.data.data;
}

export async function getBookingPayments(bookingId) {
  const response = await httpClient.get(`/payments/bookings/${bookingId}`);
  return response.data.data.payments;
}
