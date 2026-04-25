'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Проверяем, лайкнул ли текущий пользователь этот пост
    const checkUserLike = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single();
      setUserLiked(!!data);
    };
    checkUserLike();
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
      // Убираем лайк
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);
      if (!deleteError) {
        setLikes(prev => prev - 1);
        setUserLiked(false);
        // Обновляем likes_count в posts (асинхронно, на сервере можно через триггер)
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      }
    } else {
      // Ставим лайк
      const { error: insertError } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });
      if (!insertError) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }
    }
    setLoading(false);
  };

  return (
    <button onClick={handleLike} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <span>{userLiked ? '❤️' : '🤍'}</span> <span>{likes}</span>
    </button>
  );
}