'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

  const handleFollow = async () => {
    if (!currentUserId) {
      alert('Please sign in to follow');
      return;
    }
    if (currentUserId === userId) return;
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

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}