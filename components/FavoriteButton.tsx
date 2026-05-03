'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { animate } from 'animejs';
import Icon from './Icon';

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
    supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
      .then(({ data }) => setIsFavorited(!!data));
  }, [userId, postId]);

  const handleToggle = async () => {
    if (!userId) {
      alert('Please sign in to favorite');
      return;
    }
    setLoading(true);
    const star = document.getElementById(`star-${postId}`);
    if (star) {
      animate(star, { scale: [1, 1.3, 1], duration: 200, easing: 'easeOutQuad' });
    }
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      setIsFavorited(false);
      if (star) star.style.filter = 'none';
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, post_id: postId });
      setIsFavorited(true);
      if (star) {
        star.style.filter = 'brightness(0) saturate(100%) invert(67%) sepia(87%) saturate(4125%) hue-rotate(359deg) brightness(102%) contrast(106%)';
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      id={`star-${postId}`}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      <Icon name="Star" size={18} />
    </button>
  );
}