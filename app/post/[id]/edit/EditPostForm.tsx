'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditPostForm({ postId, currentTitle }: { postId: number; currentTitle: string }) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('posts').update({ title: title.trim() }).eq('id', postId);
    if (error) alert('Error updating: ' + error.message);
    else router.push(`/post/${postId}`);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
    </form>
  );
}