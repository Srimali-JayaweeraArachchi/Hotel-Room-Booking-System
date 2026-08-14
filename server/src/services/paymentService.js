import { findBookingPayments, findPaymentById, processPaymentRecord } from '../repositories/paymentRepository.js';
import { AppError } from '../utils/AppError.js';

export function listGuestBookingPayments(bookingId, userId) {
  return findBookingPayments(bookingId, userId);
}

export async function payForGuestBooking(bookingId, userId, data) {
  const result = await processPaymentRecord({ bookingId, userId, ...data });
  if (result.reason === 'BOOKING_NOT_FOUND') throw new AppError(404, 'Booking not found');
  if (result.reason === 'BOOKING_NOT_PAYABLE') throw new AppError(409, 'This booking is not awaiting payment');
  if (result.reason === 'PAYMENT_DECLINED') {
    throw new AppError(402, 'Payment was declined by the prototype gateway', { paymentId: result.paymentId });
  }
  return { payment: await findPaymentById(result.paymentId), alreadyPaid: Boolean(result.alreadyPaid) };
}
