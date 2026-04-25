import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from './Comments';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  let authorProfile = { full_name: null, username: null, avatar_url: null };
  if (post.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username, avatar_url')
      .eq('id', post.user_id)
      .single();
    if (profile) authorProfile = profile;
  }

  const { data: { session } } = await supabase.auth.getSession();
  const isAuthor = session?.user?.id === post.user_id;
  const authorName = authorProfile.full_name || authorProfile.username || 'Anonymous';

  return (
    <div className="container">
      <div className="post-page">
        <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
        <h1 className="post-title">{post.title}</h1>
        <img src={post.image_url} alt={post.title} className="post-image" />
        <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Avatar url={authorProfile.avatar_url} size={32} />
          <div>by {authorName}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            {isAuthor && (
              <Link href={`/post/${post.id}/edit`} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
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