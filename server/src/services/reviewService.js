import {
  createReviewRecord, deleteReviewRecord, findPublicRoomTypeReviews,
  findReviewById, findUserReviews, updateReviewRecord,
} from '../repositories/reviewRepository.js';
import { AppError } from '../utils/AppError.js';

export function listRoomTypeReviews(roomTypeId) { return findPublicRoomTypeReviews(roomTypeId); }
export function listGuestReviews(userId) { return findUserReviews(userId); }
export async function createGuestReview(userId, bookingId, data) {
  const result = await createReviewRecord(userId, bookingId, data);
  const errors = {
    BOOKING_NOT_FOUND: [404, 'Booking not found'],
    STAY_NOT_COMPLETED: [409, 'You can review this room after completing your stay'],
    PAYMENT_REQUIRED: [409, 'A successful payment is required before reviewing this stay'],
    ALREADY_REVIEWED: [409, 'This booking has already been reviewed'],
  };
  if (result.reason) throw new AppError(...errors[result.reason]);
  return findReviewById(result.reviewId);
}
export async function updateGuestReview(id, userId, data) {
  if (!await updateReviewRecord(id, userId, data)) throw new AppError(404, 'Review not found');
  return findReviewById(id);
}
export async function deleteGuestReview(id, userId) {
  if (!await deleteReviewRecord(id, userId)) throw new AppError(404, 'Review not found');
}
