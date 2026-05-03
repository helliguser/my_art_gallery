'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { animate } from 'animejs';
import LikeIcon from './LikeIcon';

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        if (buttonRef.current) {
          animate(buttonRef.current, { scale: [1.2, 1], duration: 200 });
        }
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });
      if (!error) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        if (buttonRef.current) {
          animate(buttonRef.current, { scale: [1, 1.5, 1], duration: 400, easing: 'spring(1.2, 80, 10, 0)' });
        }
      }
    }
    setLoading(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleLike}
      disabled={loading}
      className="like-button"
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
    >
      <LikeIcon filled={userLiked} size={18} />
      <span style={{ fontSize: '0.9rem' }}>{likes}</span>
    </button>
  );
}