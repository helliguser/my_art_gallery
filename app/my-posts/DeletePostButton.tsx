'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will permanently delete the artwork and all its comments.')) return;

    // Удаляем пост (каскадно удалятся лайки и комментарии благодаря ON DELETE CASCADE)
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      router.refresh(); // обновляем страницу
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger" style={{ fontSize: '0.8rem' }}>
      Delete
    </button>
  );
}