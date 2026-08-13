import {
  cancelGuestBookingRecord,
  createBookingRecord,
  findAllBookings,
  findBookingById,
  findUserBookings,
  updateBookingStatusRecord,
  updateGuestBookingRecord,
} from '../repositories/bookingRepository.js';
import { AppError } from '../utils/AppError.js';

const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['completed'],
  completed: [],
  cancelled: [],
};

function calculateNights(checkIn, checkOut) {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);
}

function validateStay(data) {
  const today = new Date().toISOString().slice(0, 10);
  if (data.checkIn < today) throw new AppError(400, 'Check-in date cannot be in the past');
  const nights = calculateNights(data.checkIn, data.checkOut);
  if (nights < 1) throw new AppError(400, 'Check-out must be after check-in');
  if (nights > 30) throw new AppError(400, 'A booking cannot exceed 30 nights');
  return nights;
}

function handleBookingResult(result) {
  const messages = {
    ROOM_TYPE_NOT_FOUND: [404, 'Room type not found'],
    CAPACITY_EXCEEDED: [400, 'Guest count exceeds room capacity'],
    NO_AVAILABILITY: [409, 'No room is available for the selected dates'],
    NOT_FOUND: [404, 'Booking not found'],
    NOT_MODIFIABLE: [409, 'This booking can no longer be modified'],
    NOT_CANCELLABLE: [409, 'This booking can no longer be cancelled'],
  };
  if (result.reason) throw new AppError(...messages[result.reason]);
  return result;
}

export async function createGuestBooking(userId, data) {
  const result = handleBookingResult(await createBookingRecord({ ...data, userId, nights: validateStay(data) }));
  return findBookingById(result.bookingId);
}

export function listGuestBookings(userId) { return findUserBookings(userId); }

export async function getGuestBooking(user, id) {
  const booking = await findBookingById(id);
  if (!booking || (user.role === 'guest' && booking.userId !== user.id)) throw new AppError(404, 'Booking not found');
  return booking;
}

export async function modifyGuestBooking(userId, id, data) {
  const result = handleBookingResult(await updateGuestBookingRecord(id, userId, { ...data, nights: validateStay(data) }));
  return findBookingById(result.bookingId);
}

export async function cancelGuestBooking(userId, id) {
  const result = handleBookingResult(await cancelGuestBookingRecord(id, userId));
  return findBookingById(result.bookingId);
}

export function listBookingsAdmin(filters) { return findAllBookings(filters); }

export async function changeBookingStatus(id, data, changedBy) {
  const booking = await findBookingById(id);
  if (!booking) throw new AppError(404, 'Booking not found');
  if (data.status === 'cancelled' && booking.paymentStatus === 'succeeded') {
    throw new AppError(409, 'A paid booking cannot be cancelled by hotel staff');
  }
  if (!statusTransitions[booking.status].includes(data.status)) {
    throw new AppError(409, `Cannot change booking from ${booking.status} to ${data.status}`);
  }
  const result = await updateBookingStatusRecord(id, data.status, changedBy, data.note);
  if (result.reason === 'PAID_BOOKING') throw new AppError(409, 'A paid booking cannot be cancelled by hotel staff');
  return findBookingById(id);
}
