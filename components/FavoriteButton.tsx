'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Icon from './Icon';

export default function FavoriteButton({ postId }: { postId: number }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const starId = `star-${postId}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
      .then(({ data }) => setIsFavorited(!!data));
  }, [userId, postId]);

  const starYellowFilter = "brightness(0) saturate(100%) invert(83%) sepia(60%) saturate(3502%) hue-rotate(359deg) brightness(103%) contrast(102%)";

  const handleToggle = async () => {
    if (!userId) {
      alert('Please sign in to favorite');
      return;
    }
    setLoading(true);
    const starEl = document.getElementById(starId);
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      setIsFavorited(false);
      if (starEl) starEl.style.filter = 'none';
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, post_id: postId });
      setIsFavorited(true);
      if (starEl) starEl.style.filter = starYellowFilter;
    }
    setLoading(false);
  };

  return (
    <button
      id={starId}
      onClick={handleToggle}
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      <Icon name="Star" folder="interface" size={18} />
    </button>
  );
}