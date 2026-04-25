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

export default function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [postAuthorId, setPostAuthorId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);

      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      setPostAuthorId(post?.user_id || null);

      await fetchComments();
    }
    fetchData();
  }, [postId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error && data) setComments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      content: newComment.trim(),
      post_id: postId,
      user_id: userId,
    });
    if (error) alert('Error: ' + error.message);
    else {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: number, commentUserId: string) => {
    if (userId !== commentUserId && userId !== postAuthorId) {
      alert('You can only delete your own comments');
      return;
    }
    if (!confirm('Delete this comment?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) alert('Error: ' + error.message);
    else fetchComments();
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
        <p><a href="/login" style={{ color: '#0070f3' }}>Sign in</a> to comment.</p>
      )}
      <div>
        {comments.map(comment => {
          const canDelete = userId === comment.user_id || userId === postAuthorId;
          return (
            <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <b>{comment.profiles?.full_name || comment.profiles?.username || 'User'}</b>
                <small style={{ marginLeft: '0.5rem', color: '#666' }}>{new Date(comment.created_at).toLocaleString()}</small>
                <p style={{ marginTop: '0.25rem' }}>{comment.content}</p>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id, comment.user_id)}
                  style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1rem' }}
                  aria-label="Delete comment"
                >
                  🗑️
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}