'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will permanently delete the artwork and all its comments.')) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) alert('Error: ' + error.message);
    else router.refresh();
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger">
      Delete
    </button>
  );
}