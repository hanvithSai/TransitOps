import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../lib/utils';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=10');
      setItems(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--error)] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[var(--border-base)] bg-[var(--bg-elevated)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-base)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-[var(--color-brand-600)] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No notifications</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => !n.read && markRead(n._id)}
                  className={cn(
                    'block w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left hover:bg-[var(--bg-surface-hover)]',
                    !n.read && 'bg-[var(--color-brand-50)]/50 dark:bg-[var(--color-brand-900)]/10'
                  )}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{n.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
