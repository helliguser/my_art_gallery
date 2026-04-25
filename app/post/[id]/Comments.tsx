'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
};

export default function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authors, setAuthors] = useState<Record<string, { full_name: string | null; username: string | null; avatar_url: string | null }>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id || null));
  }, []);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setComments(data || []);

    // Загружаем профили авторов комментариев
    const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);
      if (profiles) {
        const map = Object.fromEntries(profiles.map(p => [p.id, p]));
        setAuthors(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({ content: newComment.trim(), post_id: postId, user_id: userId });
    if (error) alert('Error: ' + error.message);
    else {
      setNewComment('');
      loadComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) alert('Error: ' + error.message);
    else loadComments();
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Comments ({comments.length})</h3>
      {userId ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p><a href="/login">Sign in to comment</a></p>
      )}
      {comments.map(comment => {
        const author = authors[comment.user_id] || { full_name: null, username: null, avatar_url: null };
        const authorName = author.full_name || author.username || 'User';
        return (
          <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
              <Avatar url={author.avatar_url} size={28} />
              <div>
                <b>{authorName}</b> <small>{new Date(comment.created_at).toLocaleString()}</small>
                <p>{comment.content}</p>
              </div>
            </div>
            {userId === comment.user_id && (
              <button onClick={() => handleDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>🗑️</button>
            )}
          </div>
        );
      })}
    </div>
  );
}