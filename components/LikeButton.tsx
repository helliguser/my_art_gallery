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

  const heartRedFilter = "brightness(0) saturate(100%) invert(22%) sepia(84%) saturate(6797%) hue-rotate(357deg) brightness(96%) contrast(117%)";

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to like');
      setLoading(false);
      return;
    }
    const heartEl = document.getElementById(heartId);
    if (userLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);
      if (!error) {
        setLikes(prev => prev - 1);
        setUserLiked(false);
        if (heartEl) {
          animate(heartEl, { scale: [1.2, 1], duration: 200 });
          heartEl.style.filter = 'none';
        }
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });
      if (!error) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        if (heartEl) {
          animate(heartEl, {
            scale: [1, 1.5, 1],
            duration: 400,
            easing: 'spring(1.2, 80, 10, 0)',
          });
          heartEl.style.filter = heartRedFilter;
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
      <Icon name="Heart_01" folder="interface" size={18} />
      <span>{likes}</span>
    </button>
  );
}