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

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error && data) setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      content: newComment.trim(),
      post_id: postId,
      user_id: currentUserId,
    });
    if (error) alert('Error: ' + error.message);
    else {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Comments ({comments.length})</h3>
      {currentUserId ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button type="submit" disabled={submitting}>Post</button>
        </form>
      ) : (
        <p><a href="/login">Sign in</a> to comment.</p>
      )}
      {comments.map(comment => (
        <div key={comment.id}>
          <b>{comment.profiles?.full_name || comment.profiles?.username || 'User'}</b> <small>{new Date(comment.created_at).toLocaleString()}</small>
          <p>{comment.content}</p>
        </div>
      ))}
    </div>
  );
}