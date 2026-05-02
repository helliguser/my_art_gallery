'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FavoriteButton({ postId }: { postId: number }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('post_id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
      setIsFavorited(!!data);
    };
    checkFavorite();
  }, [userId, postId]);

  const handleToggle = async () => {
    if (!userId) {
      alert('Please sign in to favorite');
      return;
    }
    setLoading(true);
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      setIsFavorited(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, post_id: postId });
      setIsFavorited(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? '⭐' : '☆'}
    </button>
  );
}