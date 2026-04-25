import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from './Comments';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

// Динамические мета-теги для каждого поста
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('title, image_url, user_id')
    .eq('id', id)
    .single();

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Art Gallery`,
    description: `View artwork "${post.title}" by ${post.user_id}. Like and comment on this piece.`,
    openGraph: {
      title: post.title,
      description: `Artwork by ${post.user_id}`,
      images: [post.image_url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, likes_count')
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
  const authorName = authorProfile.full_name || authorProfile.username || 'Anonymous';

  const { data: { session } } = await supabase.auth.getSession();
  const isAuthor = session?.user?.id === post.user_id;

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