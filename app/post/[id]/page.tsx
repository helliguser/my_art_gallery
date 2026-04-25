import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('[PostPage] ID:', id);
  const supabase = await createClient();

  // Простой запрос без join для начала
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[PostPage] Error loading post:', error);
    return <div className="container">Error loading post: {error.message}</div>;
  }
  if (!post) {
    console.log('[PostPage] Post not found');
    notFound();
  }

  console.log('[PostPage] Post found:', post.title);
  return (
    <div className="container">
      <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
      <h1>{post.title}</h1>
      <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: '8px' }} />
      <p>by {post.user_id}</p>
    </div>
  );
}