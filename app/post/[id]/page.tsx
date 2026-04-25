import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import Comments from './Comments';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Получаем пост
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    console.error('Post load error:', error);
    notFound();
  }

  // Получаем имя автора (просто, без аватара)
  let authorName = 'Anonymous';
  if (post.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', post.user_id)
      .single();
    if (profile) authorName = profile.full_name || profile.username || 'Anonymous';
  }

  // Проверяем, автор ли текущий пользователь
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthor = session?.user?.id === post.user_id;

  return (
    <div className="container">
      <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>{post.title}</h1>
        <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>by {authorName}</p>
          <div>
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            {isAuthor && (
              <Link href={`/post/${post.id}/edit`} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                Edit
              </Link>
            )}
          </div>
        </div>
        <Comments postId={post.id} />
      </div>
    </div>
  );
}