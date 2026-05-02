'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Notification = {
  id: number;
  type: string;
  source_id: number;
  actor_id: string;
  is_read: boolean;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);

      const actorIds = [...new Set(data?.map(n => n.actor_id).filter(Boolean) || [])];
      if (actorIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', actorIds);
        if (profiles) {
          const map: Record<string, Profile> = {};
          profiles.forEach(p => {
            map[p.id] = { full_name: p.full_name, username: p.username, avatar_url: p.avatar_url };
          });
          setProfilesMap(map);
        }
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (id: number) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount(prev => Math.max(prev - 1, 0));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationText = (notif: Notification) => {
    const actor = profilesMap[notif.actor_id] || {};
    const actorName = actor.full_name || actor.username || 'Someone';
    switch (notif.type) {
      case 'like': return `${actorName} liked your post`;
      case 'comment': return `${actorName} commented on your post`;
      case 'follow': return `${actorName} started following you`;
      default: return 'New notification';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn btn-outline"
        style={{ position: 'relative', fontSize: '1.2rem' }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-link">Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet</div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`notification-item ${notif.is_read ? 'notification-item-read' : 'notification-item-unread'}`}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.type === 'like' || notif.type === 'comment') window.location.href = `/post/${notif.source_id}`;
                  else if (notif.type === 'follow') window.location.href = `/user/${notif.actor_id}`;
                  setShowDropdown(false);
                }}
              >
                <div>{getNotificationText(notif)}</div>
                <div className="notification-time">{new Date(notif.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}