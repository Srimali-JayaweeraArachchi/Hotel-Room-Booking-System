// Payment module — database access for payments

import crypto from 'node:crypto';
import database from '../config/database.js';
import { createNotificationRecord, createRoleNotificationRecords } from './notificationRepository.js';

const paymentColumns = `p.id, p.booking_id AS bookingId, p.provider, p.provider_reference AS providerReference,
  p.amount, p.currency, p.method, p.status, p.failure_reason AS failureReason, p.paid_at AS paidAt,
  p.refunded_at AS refundedAt, p.created_at AS createdAt`;

function normalizePayment(row) {
  return row ? { ...row, id: Number(row.id), bookingId: Number(row.bookingId), amount: Number(row.amount) } : null;
}

export async function findPaymentById(id) {
  const [rows] = await database.execute(`SELECT ${paymentColumns} FROM payments p WHERE p.id = ?`, [id]);
  return normalizePayment(rows[0]);
}

export async function findBookingPayments(bookingId, userId) {
  const [rows] = await database.execute(
    `SELECT ${paymentColumns} FROM payments p JOIN bookings b ON b.id = p.booking_id
     WHERE p.booking_id = ? AND b.user_id = ? ORDER BY p.created_at DESC`,
    [bookingId, userId],
  );
  return rows.map(normalizePayment);
}

export async function processPaymentRecord({ bookingId, userId, paymentToken, method }) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [bookings] = await connection.execute(
      'SELECT id, status, total_amount AS totalAmount FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE',
      [bookingId, userId],
    );
    const booking = bookings[0];
    if (!booking) { await connection.rollback(); return { reason: 'BOOKING_NOT_FOUND' }; }

    const [successful] = await connection.execute(
      "SELECT id FROM payments WHERE booking_id = ? AND status = 'succeeded' ORDER BY id DESC LIMIT 1 FOR UPDATE",
      [bookingId],
    );
    if (successful[0]) { await connection.commit(); return { paymentId: successful[0].id, alreadyPaid: true }; }
    if (booking.status !== 'pending') { await connection.rollback(); return { reason: 'BOOKING_NOT_PAYABLE' }; }

    const providerReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const [result] = await connection.execute(
      `INSERT INTO payments (booking_id, provider, provider_reference, amount, method)
       VALUES (?, 'prototype_gateway', ?, ?, ?)`,
      [bookingId, providerReference, booking.totalAmount, method],
    );

    if (paymentToken === 'tok_prototype_declined') {
      await connection.execute(
        "UPDATE payments SET status = 'failed', failure_reason = 'Payment was declined by the prototype gateway' WHERE id = ?",
        [result.insertId],
      );
      await createNotificationRecord(connection, {
        userId, bookingId, eventType: 'payment_failed', title: 'Payment declined',
        message: 'Your payment was declined. The booking remains pending and you can try again.',
      });
      await connection.commit();
      return { paymentId: result.insertId, reason: 'PAYMENT_DECLINED' };
    }

    await connection.execute("UPDATE payments SET status = 'succeeded', paid_at = CURRENT_TIMESTAMP WHERE id = ?", [result.insertId]);
    await connection.execute("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [bookingId]);
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, note)
       VALUES (?, 'pending', 'confirmed', ?, ?)`,
      [bookingId, userId, `Confirmed by payment ${providerReference}`],
    );
    await createNotificationRecord(connection, {
      userId, bookingId, eventType: 'payment_confirmed', title: 'Booking confirmed',
      message: `Payment ${providerReference} was successful. Your reservation is confirmed.`,
    });
    await createRoleNotificationRecords(connection, {
      bookingId, eventType: 'payment_confirmed', title: 'Booking payment received',
      message: `Payment ${providerReference} succeeded and booking ${bookingId} is confirmed.`,
    }, ['staff', 'admin']);
    await createNotificationRecord(connection, {
      userId, bookingId, eventType: 'confirmation_email', channel: 'email',
      title: 'Confirmation email sent',
      message: 'A prototype booking confirmation email was sent to your registered email address.',
    });
    await connection.commit();
    return { paymentId: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
