import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from './Comments';
import LikeButton from '@/components/LikeButton';
import FavoriteButton from '@/components/FavoriteButton';
import Avatar from '@/components/Avatar';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  await supabase.rpc('increment_post_views', { post_id: parseInt(id) });

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

  // Получаем теги
  const { data: postTags } = await supabase
    .from('post_tags')
    .select('tag_id, tags(name)')
    .eq('post_id', post.id);
  const tags = postTags?.map(pt => (pt.tags as any).name) || [];

  // Рейтинг поста (с запасным значением)
  const postRating = post.rating || 'safe';
  const ratingColor: Record<string, string> = {
    safe: 'green',
    questionable: 'orange',
    explicit: 'red',
  };
  const ratingDisplay = postRating.toUpperCase();
  const color = ratingColor[postRating] || 'gray';

  return (
    <div className="container">
      <div className="post-page">
        <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
        <h1 className="post-title">{post.title}</h1>
        <img src={post.image_url} alt={post.title} className="post-image" />
        <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Avatar url={authorProfile.avatar_url} size={32} />
          <div>by {authorName}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span title={`Rating: ${postRating}`} style={{ color: color, fontWeight: 'bold' }}>
              {ratingDisplay}
            </span>
            <FavoriteButton postId={post.id} />
            <span>👁️ {post.views || 0}</span>
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            {isAuthor && (
              <Link href={`/post/${post.id}/edit`} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Edit
              </Link>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <Comments postId={post.id} />
      </div>
    </div>
  );
}