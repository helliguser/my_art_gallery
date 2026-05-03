'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { animate } from 'animejs';
import Icon from './Icon';

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const heartId = `like-icon-${postId}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => setUserLiked(!!data));
    });
  }, [postId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to like');
      setLoading(false);
      return;
    }
    if (userLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);
      if (!error) {
        setLikes(prev => prev - 1);
        setUserLiked(false);
        const heart = document.getElementById(heartId);
        if (heart) {
          animate(heart, {
            scale: [1.2, 1],
            duration: 200,
            easing: 'easeOutQuad',
          });
          // возвращаем исходный цвет (фильтр убираем)
          heart.style.filter = 'none';
        }
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });
      if (!error) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        const heart = document.getElementById(heartId);
        if (heart) {
          animate(heart, {
            scale: [1, 1.5, 1],
            duration: 400,
            easing: 'spring(1.2, 80, 10, 0)',
          });
          // анимируем цвет к красному
          animate(heart, {
            filter: ['brightness(1) sepia(0) hue-rotate(0deg) saturate(0%)', 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(7485%) hue-rotate(356deg) brightness(100%) contrast(112%)'],
            duration: 400,
            easing: 'easeOutQuad',
          });
        }
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      id={heartId}
      className="like-button"
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
    >
      <Icon name="Heart_01" size={18} />
      <span>{likes}</span>
    </button>
  );
}