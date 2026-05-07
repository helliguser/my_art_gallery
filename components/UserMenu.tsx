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
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url || null));
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuRef.current) {
      if (isOpen) {
        animate(menuRef.current, {
          translateY: [-10, 0],
          opacity: [0, 1],
          duration: 200,
          easing: 'easeOutQuad',
        });
      } else {
        animate(menuRef.current, {
          translateY: [0, -10],
          opacity: [1, 0],
          duration: 150,
          easing: 'easeOutQuad',
        });
      }
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
        <Link href="/about" className="glass-small-btn">About</Link>
        <ThemeSwitcher />
        <Link href="/login" className="glass-btn" style={{ background: '#4f9cff', color: 'white' }}>Sign In</Link>
        <Link href="/register" className="glass-btn">Sign Up</Link>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="user-menu" ref={dropdownRef} style={{ position: 'relative' }}>
      <div className="user-dropdown-trigger" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '40px', background: 'rgba(255,255,255,0.05)' }}>
        <Avatar url={avatarUrl} size={32} name={displayName} />
        <span className="user-greeting">{displayName}</span>
        <Icon name="Caret_Down_SM" folder="arrow" size={12} />
      </div>
      {isOpen && (
        <div className="user-dropdown-menu" ref={menuRef}>
          <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="User" folder="interface" size={16} /> Profile
          </Link>
          <Link href="/my-posts" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Image" folder="interface" size={16} /> My Posts
          </Link>
          <Link href="/liked" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Heart_01" folder="interface" size={16} /> Liked
          </Link>
          <Link href="/favorites" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Star" folder="interface" size={16} /> Favorites
          </Link>
          <Link href="/saved-searches" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Bookmark" folder="interface" size={16} /> Saved Searches
          </Link>
          <Link href="/trending" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Trending_Up" folder="interface" size={16} /> Trending
          </Link>
          <Link href="/upload" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <Icon name="Download" folder="interface" size={16} /> Upload
          </Link>
          <div className="dropdown-divider"></div>
          <button onClick={handleLogout} className="dropdown-item" style={{ color: '#f44336' }}>
            <Icon name="Log_Out" folder="interface" size={16} /> Logout
          </button>
        </div>
      )}
      <div className="user-menu-icons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
        <NotificationBell />
        <ThemeSwitcher />
      </div>
    </div>
  );
}