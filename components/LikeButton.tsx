'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { animate } from 'animejs';

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const heartRef = useRef<HTMLButtonElement>(null);

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
      } else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });
      if (!error) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        // Анимация сердечка
        if (heartRef.current) {
          animate(heartRef.current, {
            scale: [1, 1.8, 1],
            duration: 400,
            easing: 'spring(1.2, 80, 10, 0)',
          });
        }
      } else alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <button
      ref={heartRef}
      onClick={handleLike}
      disabled={loading}
      className="like-button"
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
    >
      {userLiked ? '❤️' : '🤍'} {likes}
    </button>
  );
}