'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FollowButton({ userId }: { userId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId || currentUserId === userId) return;
    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .maybeSingle();
      setIsFollowing(!!data);
    };
    checkFollow();
  }, [currentUserId, userId]);

  const handleClick = async () => {
    if (!currentUserId) {
      alert('Please log in');
      return;
    }
    setLoading(true);
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);
      setIsFollowing(false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: userId });
      setIsFollowing(true);
    }
    setLoading(false);
  };

  if (currentUserId === userId) return null;
  if (!currentUserId) return <Link href="/login" className="btn btn-primary">Sign in to follow</Link>;

  return (
    <button onClick={handleClick} disabled={loading} className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}