'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import { animate } from 'animejs';
import Icon from './Icon';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
    if (!user?.id) return;
    supabase.from('profiles').select('avatar_url').eq('id', user.id).single().then(({ data }) => setAvatarUrl(data?.avatar_url || null));
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuRef.current) {
      if (isOpen) animate(menuRef.current, { translateY: [-10, 0], opacity: [0, 1], duration: 200, easing: 'easeOutQuad' });
      else animate(menuRef.current, { translateY: [0, -10], opacity: [1, 0], duration: 150, easing: 'easeOutQuad' });
    }
  }, [isOpen]);

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

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div className="user-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Avatar url={avatarUrl} size={32} name={displayName} />
        <span className="user-greeting">{displayName}</span>
        <Icon name="Caret_Down_SM" folder="arrow" size={12} />
      </div>
      {isOpen && (
        <div className="user-dropdown-menu" ref={menuRef}>
          <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>Profile</Link>
          <Link href="/my-posts" className="dropdown-item" onClick={() => setIsOpen(false)}>My Posts</Link>
          <Link href="/liked" className="dropdown-item" onClick={() => setIsOpen(false)}>Liked</Link>
          <Link href="/favorites" className="dropdown-item" onClick={() => setIsOpen(false)}>Favorites</Link>
          <Link href="/saved-searches" className="dropdown-item" onClick={() => setIsOpen(false)}>Saved Searches</Link>
          <Link href="/trending" className="dropdown-item" onClick={() => setIsOpen(false)}>Trending</Link>
          <Link href="/upload" className="dropdown-item" onClick={() => setIsOpen(false)}>Upload</Link>
          <div className="dropdown-divider"></div>
          <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
        </div>
      )}
      <div className="user-menu-icons">
        <NotificationBell />
        <ThemeSwitcher />
      </div>
    </div>
  );
}