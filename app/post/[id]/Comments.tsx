'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
  };
};

export default function Comments({ postId, currentUserId }: { postId: number; currentUserId?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Загружаем комментарии
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, username)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
      } else {
        setComments(data || []);
      }
      setLoading(false);
    };

    fetchComments();

    // Подписка на новые комментарии (в реальном времени)
    const subscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, (payload) => {
        // Добавляем новый комментарий в список (самый безопасный способ – перезагрузить)
        fetchComments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  // Отправка нового комментария
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        post_id: postId,
        user_id: currentUserId,
      });

    if (error) {
      alert('Error posting comment: ' + error.message);
    } else {
      setNewComment('');
      // Перезагружаем комментарии
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(full_name, username)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Comments ({comments.length})</h3>
      
      {/* Форма для новых комментариев (только для авторизованных) */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            style={{ background: '#0070f3', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p style={{ color: '#666', marginBottom: '1rem' }}><a href="/login" style={{ color: '#0070f3' }}>Sign in</a> to leave a comment.</p>
      )}

      {/* Список комментариев */}
      <div>
        {comments.length === 0 && <p>No comments yet. Be the first!</p>}
        {comments.map((comment) => (
          <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '0.75rem 0' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {comment.profiles?.full_name || comment.profiles?.username || 'Anonymous'}
              <span style={{ fontWeight: 'normal', color: '#666', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: '0.25rem' }}>{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}