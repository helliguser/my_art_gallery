'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { animate } from 'animejs';
import StarIcon from './StarIcon';

export default function FavoriteButton({ postId }: { postId: number }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    if (buttonRef.current) {
      animate(buttonRef.current, { scale: [1, 1.3, 1], duration: 300, easing: 'easeOutQuad' });
    }
    setLoading(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      <StarIcon filled={isFavorited} size={18} />
    </button>
  );
}