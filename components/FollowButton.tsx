'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function FollowButton({ userId }: { userId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[FollowButton] Session user:', session?.user?.id);
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId || currentUserId === userId) return;
    const checkFollow = async () => {
      console.log('[FollowButton] Checking follow status for', currentUserId, '->', userId);
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .maybeSingle();
      if (error) console.error('[FollowButton] Check error:', error);
      console.log('[FollowButton] Is following?', !!data);
      setIsFollowing(!!data);
    };
    checkFollow();
  }, [currentUserId, userId]);

  const handleClick = async () => {
    console.log('[FollowButton] Clicked, currentUserId:', currentUserId, 'userId:', userId, 'isFollowing:', isFollowing);
    if (!currentUserId) {
      alert('Please log in');
      return;
    }
    setLoading(true);
    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);
      if (error) console.error('[FollowButton] Delete error:', error);
      else setIsFollowing(false);
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: userId });
      if (error) console.error('[FollowButton] Insert error:', error);
      else setIsFollowing(true);
    }
    setLoading(false);
  };

  if (currentUserId === userId) {
    console.log('[FollowButton] Own profile, hiding button');
    return null;
  }

  return (
    <button onClick={handleClick} disabled={loading} className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}