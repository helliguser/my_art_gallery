'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Notification = {
  id: number;
  type: 'like' | 'comment' | 'follow';
  actor_id: string;
  post_id: number | null;
  read: boolean;
  created_at: string;
  actor?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(username, full_name, avatar_url)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return;
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
  };

  useEffect(() => {
    fetchNotifications();

    // Подписка на realtime (новые уведомления)
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
        router.refresh();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = async (id: number) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getMessage = (n: Notification) => {
    const actorName = n.actor?.full_name || n.actor?.username || 'Someone';
    switch (n.type) {
      case 'like':
        return `${actorName} liked your artwork`;
      case 'comment':
        return `${actorName} commented on your artwork`;
      case 'follow':
        return `${actorName} started following you`;
      default:
        return '';
    }
  };

  const getLink = (n: Notification) => {
    if (n.type === 'follow') return `/user/${n.actor_id}`;
    if (n.post_id) return `/post/${n.post_id}`;
    return '#';
  };

  return (
    <div className="notification-bell">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline"
        style={{ position: 'relative', fontSize: '1.2rem', padding: '0.3rem 0.6rem' }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '0 4px',
              fontSize: '0.7rem',
              minWidth: '16px',
              textAlign: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-outline" style={{ fontSize: '0.7rem' }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && <div style={{ padding: '1rem', textAlign: 'center' }}>No notifications</div>}
          {notifications.map(n => (
            <Link
              key={n.id}
              href={getLink(n)}
              onClick={() => {
                if (!n.read) markAsRead(n.id);
                setOpen(false);
              }}
              style={{
                display: 'block',
                padding: '0.75rem',
                borderBottom: '1px solid var(--border)',
                background: n.read ? 'transparent' : 'rgba(0, 112, 243, 0.1)',
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '0.9rem' }}>{getMessage(n)}</div>
              <small style={{ color: '#666' }}>{new Date(n.created_at).toLocaleString()}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}