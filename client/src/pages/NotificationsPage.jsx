import { useNotifications } from '../context/notificationContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import { useState } from 'react';

function formatTimestamp(value) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function NotificationsPage() {
  const { error: loadError, notifications, readAll, readOne, unreadCount } = useNotifications();
  const [error, setError] = useState('');

  async function open(notification) {
    if (notification.readAt) return;
    try { await readOne(notification.id); } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function openAll() {
    try { await readAll(); } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  return (
    <main className="notifications-page">
      <section className="notifications-heading"><div><p className="eyebrow">Account updates</p><h1>Notifications</h1><p>Booking, payment, refund, check-in, and check-out updates relevant to your account role.</p></div>{unreadCount > 0 && <button className="button button-secondary" onClick={openAll} type="button">Mark all as read</button>}</section>
      {(error || loadError) && <div className="form-alert" role="alert">{error || loadError}</div>}
      <section className="notification-list">
        {notifications.map((notification) => <button className={`notification-card ${notification.readAt ? '' : 'notification-unread'}`} key={notification.id} onClick={() => open(notification)} type="button"><span className={`notification-channel channel-${notification.channel}`}>{notification.channel === 'in_app' ? 'In app' : 'Email'}</span><div><h2>{notification.title}</h2><p>{notification.message}</p><small>{formatTimestamp(notification.createdAt)} · {notification.deliveryStatus}</small></div>{!notification.readAt && <span className="unread-dot" aria-label="Unread" />}</button>)}
        {!notifications.length && <div className="empty-state"><h2>No notifications yet</h2><p>Your booking and payment updates will appear here.</p></div>}
      </section>
    </main>
  );
}

export default NotificationsPage;
