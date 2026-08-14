import database from '../config/database.js';

const notificationColumns = `n.id, n.user_id AS userId, n.booking_id AS bookingId,
  n.event_type AS eventType, n.channel, n.title, n.message,
  n.delivery_status AS deliveryStatus, n.read_at AS readAt,
  n.sent_at AS sentAt, n.created_at AS createdAt`;

function normalize(row) {
  return row ? { ...row, id: Number(row.id), userId: Number(row.userId), bookingId: row.bookingId ? Number(row.bookingId) : null } : null;
}

export async function createNotificationRecord(connection, data) {
  const [result] = await connection.execute(
    `INSERT INTO notifications
      (user_id, booking_id, event_type, channel, title, message, delivery_status, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [data.userId, data.bookingId ?? null, data.eventType, data.channel ?? 'in_app', data.title, data.message, data.deliveryStatus ?? 'sent'],
  );
  return result.insertId;
}

export async function createRoleNotificationRecords(connection, data, roles = ['admin', 'staff']) {
  const placeholders = roles.map(() => '?').join(', ');
  const [users] = await connection.execute(
    `SELECT id FROM users WHERE is_active = TRUE AND role IN (${placeholders})`,
    roles,
  );
  for (const user of users) {
    await createNotificationRecord(connection, { ...data, userId: user.id, channel: 'in_app' });
  }
}

export async function findUserNotifications(userId, { limit = 50 } = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
  const [rows] = await database.execute(
    `SELECT ${notificationColumns} FROM notifications n
     WHERE n.user_id = ? ORDER BY n.created_at DESC, n.id DESC LIMIT ${safeLimit}`,
    [userId],
  );
  return rows.map(normalize);
}

export async function countUnreadNotifications(userId) {
  const [rows] = await database.execute(
    'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
  return Number(rows[0].unreadCount);
}

export async function markNotificationRead(id, userId) {
  const [result] = await database.execute(
    'UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}

export async function markAllNotificationsRead(userId) {
  const [result] = await database.execute(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
  return result.affectedRows;
}
