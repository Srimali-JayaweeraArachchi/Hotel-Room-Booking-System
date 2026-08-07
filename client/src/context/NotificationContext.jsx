import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationApi.js';
import { useAuth } from './authContext.js';
import { NotificationContext } from './notificationContext.js';

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [center, setCenter] = useState({ notifications: [], unreadCount: 0 });
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) { setCenter({ notifications: [], unreadCount: 0 }); return; }
    try { setCenter(await getNotifications()); setError(''); }
    catch { setError('Unable to load notifications'); }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return undefined;
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh, user]);

  const readOne = useCallback(async (id) => { setCenter(await markNotificationRead(id)); }, []);
  const readAll = useCallback(async () => { setCenter(await markAllNotificationsRead()); }, []);
  const value = useMemo(() => ({ ...center, error, refresh, readOne, readAll }), [center, error, readAll, readOne, refresh]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
