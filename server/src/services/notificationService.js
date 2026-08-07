import {
  countUnreadNotifications,
  findUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../repositories/notificationRepository.js';
import { AppError } from '../utils/AppError.js';

export async function getNotificationCenter(userId) {
  const [notifications, unreadCount] = await Promise.all([
    findUserNotifications(userId), countUnreadNotifications(userId),
  ]);
  return { notifications, unreadCount };
}

export async function readNotification(id, userId) {
  if (!await markNotificationRead(id, userId)) throw new AppError(404, 'Notification not found');
  return getNotificationCenter(userId);
}

export async function readAllNotifications(userId) {
  await markAllNotificationsRead(userId);
  return getNotificationCenter(userId);
}
