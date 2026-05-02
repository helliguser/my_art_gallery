'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div>...</div>;
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
    <div className="user-menu">
      <span className="user-greeting">Hello, {displayName}</span>
      <Link href="/profile" className="btn btn-secondary">Profile</Link>
      <Link href="/my-posts" className="btn btn-secondary">My Posts</Link>
      <Link href="/favorites" className="btn btn-outline">Favorites</Link>
      <Link href="/liked" className="btn btn-outline">Liked</Link>
      <Link href="/saved-searches" className="btn btn-outline">Saved Searches</Link>
      <Link href="/upload" className="btn btn-primary">Upload</Link>
      <Link href="/about" className="btn btn-outline">About</Link>
      <NotificationBell />
      <ThemeSwitcher />
      <button onClick={handleLogout} className="btn btn-danger">Logout</button>
    </div>
  );
}