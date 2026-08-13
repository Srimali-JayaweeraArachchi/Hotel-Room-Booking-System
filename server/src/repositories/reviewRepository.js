import database from '../config/database.js';
import { createRoleNotificationRecords } from './notificationRepository.js';

const reviewColumns = `rv.id, rv.booking_id AS bookingId, rv.user_id AS userId,
  rv.room_type_id AS roomTypeId, u.name AS guestName, rv.rating, rv.title,
  rv.comment, rv.status, rv.created_at AS createdAt, rv.updated_at AS updatedAt`;

function normalize(row) {
  return row
    ? {
        ...row,
        id: Number(row.id),
        bookingId: Number(row.bookingId),
        userId: Number(row.userId),
        roomTypeId: Number(row.roomTypeId),
        rating: Number(row.rating),
      }
    : null;
}

export async function findPublicRoomTypeReviews(roomTypeId) {
  const [rows] = await database.execute(
    `SELECT ${reviewColumns} FROM reviews rv JOIN users u ON u.id = rv.user_id
     WHERE rv.room_type_id = ? AND rv.status = 'published'
     ORDER BY rv.created_at DESC LIMIT 50`,
    [roomTypeId],
  );
  const reviews = rows.map(normalize);
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    : 0;
  return {
    reviews,
    reviewCount: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
  };
}

export async function findUserReviews(userId) {
  const [rows] = await database.execute(
    `SELECT ${reviewColumns}, rt.name AS roomTypeName, b.reference AS bookingReference
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     JOIN room_types rt ON rt.id = rv.room_type_id
     JOIN bookings b ON b.id = rv.booking_id
     WHERE rv.user_id = ? ORDER BY rv.created_at DESC`,
    [userId],
  );
  return rows.map(normalize);
}

export async function createReviewRecord(userId, bookingId, data) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [bookings] = await connection.execute(
      `SELECT b.id, b.reference, b.status, r.room_type_id AS roomTypeId
       FROM bookings b JOIN rooms r ON r.id = b.room_id
       WHERE b.id = ? AND b.user_id = ? FOR UPDATE`,
      [bookingId, userId],
    );
    const booking = bookings[0];
    if (!booking) {
      await connection.rollback();
      return { reason: 'BOOKING_NOT_FOUND' };
    }
    if (booking.status !== 'completed') {
      await connection.rollback();
      return { reason: 'STAY_NOT_COMPLETED' };
    }
    const [payments] = await connection.execute(
      "SELECT id FROM payments WHERE booking_id = ? AND status = 'succeeded' LIMIT 1 FOR UPDATE",
      [bookingId],
    );
    if (!payments[0]) {
      await connection.rollback();
      return { reason: 'PAYMENT_REQUIRED' };
    }
    const [existing] = await connection.execute(
      'SELECT id FROM reviews WHERE booking_id = ? LIMIT 1 FOR UPDATE',
      [bookingId],
    );
    if (existing[0]) {
      await connection.rollback();
      return { reason: 'ALREADY_REVIEWED' };
    }
    const [result] = await connection.execute(
      `INSERT INTO reviews (booking_id, user_id, room_type_id, rating, title, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        userId,
        booking.roomTypeId,
        data.rating,
        data.title,
        data.comment,
      ],
    );
    await createRoleNotificationRecords(
      connection,
      {
        bookingId,
        eventType: 'review_submitted',
        title: 'New guest review',
        message: `A ${data.rating}-star review was submitted for reservation ${booking.reference}.`,
      },
      ['admin'],
    );
    await connection.commit();
    return { reviewId: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findReviewById(id) {
  const [rows] = await database.execute(
    `SELECT ${reviewColumns} FROM reviews rv JOIN users u ON u.id = rv.user_id WHERE rv.id = ? LIMIT 1`,
    [id],
  );
  return normalize(rows[0]);
}

export async function updateReviewRecord(id, userId, data) {
  const [result] = await database.execute(
    `UPDATE reviews SET rating = ?, title = ?, comment = ? WHERE id = ? AND user_id = ?`,
    [data.rating, data.title, data.comment, id, userId],
  );
  return result.affectedRows > 0;
}

export async function deleteReviewRecord(id, userId) {
  const [result] = await database.execute(
    'DELETE FROM reviews WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}
