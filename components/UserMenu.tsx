'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });
    return () => listener?.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsOpen(false);
  };

  if (loading) return <div className="user-menu-placeholder">...</div>;
  if (!user) {
    return (
      <div className="user-menu">
        <Link href="/about" className="btn btn-outline">About</Link>
        <ThemeSwitcher />
        <Link href="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  // Если у пользователя есть аватар в профиле, подгрузим его
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url || null));
  }, [user.id]);

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div className="user-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Avatar url={avatarUrl} size={32} />
        <span className="user-greeting">{displayName}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="user-dropdown-menu">
          <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">👤</span> Profile
          </Link>
          <Link href="/my-posts" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">🖼️</span> My Posts
          </Link>
          <Link href="/liked" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">❤️</span> Liked
          </Link>
          <Link href="/favorites" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">⭐</span> Favorites
          </Link>
          <Link href="/saved-searches" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">🔖</span> Saved Searches
          </Link>
          <Link href="/trending" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">🔥</span> Trending
          </Link>
          <Link href="/upload" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <span className="dropdown-icon">📤</span> Upload
          </Link>
          <div className="dropdown-divider"></div>
          <button onClick={handleLogout} className="dropdown-item logout">
            <span className="dropdown-icon">🚪</span> Logout
          </button>
        </div>
      )}
      <div className="user-menu-icons">
        <NotificationBell />
        <ThemeSwitcher />
      </div>
    </div>
  );
}