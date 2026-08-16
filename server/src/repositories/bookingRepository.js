import crypto from 'node:crypto';
import database from '../config/database.js';
import {
  createNotificationRecord,
  createRoleNotificationRecords,
} from './notificationRepository.js';

const bookingSelect = `
  SELECT b.id, b.reference, b.user_id AS userId, u.name AS guestName,
    u.email AS guestEmail, b.room_id AS roomId, r.room_number AS roomNumber,
    r.room_type_id AS roomTypeId, rt.name AS roomTypeName,
    b.check_in AS checkIn, TIME_FORMAT(b.check_in_time, '%H:%i') AS checkInTime,
    b.check_out AS checkOut, TIME_FORMAT(b.check_out_time, '%H:%i') AS checkOutTime, b.guests,
    b.total_amount AS totalAmount, b.status,
    (SELECT p.status FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS paymentStatus,
    (SELECT p.provider_reference FROM payments p WHERE p.booking_id = b.id AND p.status IN ('succeeded', 'refunded') ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS paymentReference,
    (SELECT rv.id FROM reviews rv WHERE rv.booking_id = b.id LIMIT 1) AS reviewId,
    (SELECT rv.rating FROM reviews rv WHERE rv.booking_id = b.id LIMIT 1) AS reviewRating,
    (SELECT rv.title FROM reviews rv WHERE rv.booking_id = b.id LIMIT 1) AS reviewTitle,
    (SELECT rv.comment FROM reviews rv WHERE rv.booking_id = b.id LIMIT 1) AS reviewComment,
    b.special_requests AS specialRequests, b.cancelled_at AS cancelledAt,
    b.created_at AS createdAt, b.updated_at AS updatedAt
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  JOIN rooms r ON r.id = b.room_id
  JOIN room_types rt ON rt.id = r.room_type_id`;

function dateOnly(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function normalizeBooking(row) {
  return row
    ? {
        ...row,
        id: Number(row.id),
        userId: Number(row.userId),
        roomId: Number(row.roomId),
        roomTypeId: Number(row.roomTypeId),
        guests: Number(row.guests),
        totalAmount: Number(row.totalAmount),
        reviewId: row.reviewId ? Number(row.reviewId) : null,
        reviewRating: row.reviewRating ? Number(row.reviewRating) : null,
        checkIn: dateOnly(row.checkIn),
        checkOut: dateOnly(row.checkOut),
      }
    : null;
}

function createReference() {
  return `HB-${new Date().getUTCFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function createBookingRecord(data) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [typeRows] = await connection.execute(
      'SELECT id, base_price AS basePrice, capacity FROM room_types WHERE id = ? FOR UPDATE',
      [data.roomTypeId],
    );
    const roomType = typeRows[0];
    if (!roomType) {
      await connection.rollback();
      return { reason: 'ROOM_TYPE_NOT_FOUND' };
    }
    if (Number(roomType.capacity) < data.guests) {
      await connection.rollback();
      return { reason: 'CAPACITY_EXCEEDED' };
    }

    const [roomRows] = await connection.execute(
      `SELECT r.id FROM rooms r
       WHERE r.room_type_id = ? AND r.status = 'available'
         AND NOT EXISTS (
           SELECT 1 FROM bookings b
           WHERE b.room_id = r.id
             AND b.status IN ('pending', 'confirmed', 'checked_in')
             AND b.check_in < ? AND b.check_out > ?
         )
       ORDER BY r.room_number ASC LIMIT 1 FOR UPDATE`,
      [data.roomTypeId, data.checkOut, data.checkIn],
    );
    if (!roomRows[0]) {
      await connection.rollback();
      return { reason: 'NO_AVAILABILITY' };
    }

    const totalAmount = Number(roomType.basePrice) * data.nights;
    const reference = createReference();
    const [result] = await connection.execute(
      `INSERT INTO bookings
        (reference, user_id, room_id, check_in, check_in_time, check_out, check_out_time, guests, total_amount, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference,
        data.userId,
        roomRows[0].id,
        data.checkIn,
        data.checkInTime,
        data.checkOut,
        data.checkOutTime,
        data.guests,
        totalAmount,
        data.specialRequests || null,
      ],
    );
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, note)
       VALUES (?, NULL, 'pending', ?, 'Booking created')`,
      [result.insertId, data.userId],
    );
    await createRoleNotificationRecords(
      connection,
      {
        bookingId: result.insertId,
        eventType: 'booking_created',
        title: 'New booking received',
        message: `Reservation ${reference} was created and is awaiting payment.`,
      },
      ['staff'],
    );
    await connection.commit();
    return { bookingId: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findBookingById(id) {
  const [rows] = await database.execute(
    `${bookingSelect} WHERE b.id = ? LIMIT 1`,
    [id],
  );
  return normalizeBooking(rows[0]);
}

export async function findUserBookings(userId) {
  const [rows] = await database.execute(
    `${bookingSelect} WHERE b.user_id = ? ORDER BY b.created_at DESC`,
    [userId],
  );
  return rows.map(normalizeBooking);
}

export async function findAllBookings(filters = {}) {
  const conditions = [];
  const values = [];
  if (filters.status) {
    conditions.push('b.status = ?');
    values.push(filters.status);
  }
  if (filters.search) {
    conditions.push(
      '(b.reference LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.room_number LIKE ?)',
    );
    const term = `%${filters.search}%`;
    values.push(term, term, term, term);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await database.execute(
    `${bookingSelect} ${where} ORDER BY b.created_at DESC`,
    values,
  );
  return rows.map(normalizeBooking);
}

export async function updateGuestBookingRecord(id, userId, data) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT b.id, b.room_id AS roomId, b.status, rt.base_price AS basePrice, rt.capacity
       FROM bookings b JOIN rooms r ON r.id = b.room_id JOIN room_types rt ON rt.id = r.room_type_id
       WHERE b.id = ? AND b.user_id = ? FOR UPDATE`,
      [id, userId],
    );
    const booking = rows[0];
    if (!booking) {
      await connection.rollback();
      return { reason: 'NOT_FOUND' };
    }
    if (booking.status !== 'pending') {
      await connection.rollback();
      return { reason: 'NOT_MODIFIABLE' };
    }
    if (Number(booking.capacity) < data.guests) {
      await connection.rollback();
      return { reason: 'CAPACITY_EXCEEDED' };
    }

    const [overlaps] = await connection.execute(
      `SELECT id FROM bookings
       WHERE room_id = ? AND id <> ?
         AND status IN ('pending', 'confirmed', 'checked_in')
         AND check_in < ? AND check_out > ?
       LIMIT 1 FOR UPDATE`,
      [booking.roomId, id, data.checkOut, data.checkIn],
    );
    if (overlaps[0]) {
      await connection.rollback();
      return { reason: 'NO_AVAILABILITY' };
    }

    await connection.execute(
      `UPDATE bookings SET check_in = ?, check_in_time = ?, check_out = ?, check_out_time = ?, guests = ?,
       total_amount = ?, special_requests = ? WHERE id = ?`,
      [
        data.checkIn,
        data.checkInTime,
        data.checkOut,
        data.checkOutTime,
        data.guests,
        Number(booking.basePrice) * data.nights,
        data.specialRequests || null,
        id,
      ],
    );
    await connection.commit();
    return { bookingId: id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function cancelGuestBookingRecord(id, userId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT status FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE',
      [id, userId],
    );
    if (!rows[0]) {
      await connection.rollback();
      return { reason: 'NOT_FOUND' };
    }
    if (!['pending', 'confirmed'].includes(rows[0].status)) {
      await connection.rollback();
      return { reason: 'NOT_CANCELLABLE' };
    }
    await connection.execute(
      "UPDATE bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );
    if (rows[0].status === 'confirmed') {
      await connection.execute(
        "UPDATE payments SET status = 'refunded', refunded_at = CURRENT_TIMESTAMP WHERE booking_id = ? AND status = 'succeeded'",
        [id],
      );
    }
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, note)
       VALUES (?, ?, 'cancelled', ?, 'Cancelled by guest')`,
      [id, rows[0].status, userId],
    );
    await createNotificationRecord(connection, {
      userId,
      bookingId: id,
      eventType:
        rows[0].status === 'confirmed'
          ? 'booking_refunded'
          : 'booking_cancelled',
      title:
        rows[0].status === 'confirmed'
          ? 'Booking cancelled and refunded'
          : 'Booking cancelled',
      message:
        rows[0].status === 'confirmed'
          ? 'Your confirmed booking was cancelled and its prototype payment was refunded.'
          : 'Your pending booking was cancelled successfully.',
    });
    await createRoleNotificationRecords(
      connection,
      {
        bookingId: id,
        eventType:
          rows[0].status === 'confirmed'
            ? 'booking_refunded'
            : 'booking_cancelled',
        title:
          rows[0].status === 'confirmed'
            ? 'Guest cancellation and refund'
            : 'Guest cancelled booking',
        message: `Booking ${id} was cancelled by the guest${rows[0].status === 'confirmed' ? ' and its prototype payment was refunded' : ''}.`,
      },
      ['staff', 'admin'],
    );
    await connection.commit();
    return { bookingId: id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateBookingStatusRecord(id, status, changedBy, note) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT status, user_id AS userId, reference FROM bookings WHERE id = ? FOR UPDATE',
      [id],
    );
    if (!rows[0]) {
      await connection.rollback();
      return { reason: 'NOT_FOUND' };
    }
    const previous = rows[0].status;
    if (status === 'cancelled') {
      const [paidRows] = await connection.execute(
        "SELECT id FROM payments WHERE booking_id = ? AND status = 'succeeded' LIMIT 1 FOR UPDATE",
        [id],
      );
      if (paidRows[0]) {
        await connection.rollback();
        return { reason: 'PAID_BOOKING' };
      }
    }
    await connection.execute(
      `UPDATE bookings SET status = ?, cancelled_at = CASE WHEN ? = 'cancelled' THEN CURRENT_TIMESTAMP ELSE cancelled_at END WHERE id = ?`,
      [status, status, id],
    );
    if (status === 'cancelled' && previous === 'confirmed') {
      await connection.execute(
        "UPDATE payments SET status = 'refunded', refunded_at = CURRENT_TIMESTAMP WHERE booking_id = ? AND status = 'succeeded'",
        [id],
      );
    }
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, previous, status, changedBy, note || null],
    );
    const messages = {
      confirmed: [
        'Booking confirmed',
        `Reservation ${rows[0].reference} was confirmed by the front desk.`,
      ],
      cancelled: [
        'Booking cancelled',
        `Reservation ${rows[0].reference} was cancelled by the front desk.`,
      ],
      checked_in: [
        'Check-in completed',
        `You have been checked in for reservation ${rows[0].reference}.`,
      ],
      completed: [
        'Stay completed',
        `Check-out is complete for reservation ${rows[0].reference}. Thank you for staying with us.`,
      ],
    };
    if (messages[status]) {
      await createNotificationRecord(connection, {
        userId: rows[0].userId,
        bookingId: id,
        eventType: `booking_${status}`,
        title: messages[status][0],
        message: messages[status][1],
      });
      if (['checked_in', 'completed', 'cancelled'].includes(status)) {
        await createRoleNotificationRecords(
          connection,
          {
            bookingId: id,
            eventType: `booking_${status}`,
            title: `Booking ${status.replace('_', ' ')}`,
            message: `Reservation ${rows[0].reference} status changed from ${previous} to ${status}.`,
          },
          ['admin'],
        );
      }
    }
    await connection.commit();
    return { bookingId: id, previous };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
