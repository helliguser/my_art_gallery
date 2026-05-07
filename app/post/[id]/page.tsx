import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from './Comments';
import LikeButton from '@/components/LikeButton';
import FavoriteButton from '@/components/FavoriteButton';
import Avatar from '@/components/Avatar';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Увеличиваем счётчик просмотров
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

  const { data: postTags } = await supabase
    .from('post_tags')
    .select('tag_id, tags(name)')
    .eq('post_id', post.id);
  const tags = postTags?.map(pt => (pt.tags as any).name) || [];

  const postRating = post.rating || 'safe';
  const ratingColor: Record<string, string> = {
    safe: 'green',
    questionable: 'orange',
    explicit: 'red',
  };

  return (
    <div className="container">
      <header className="header">
        <Logo />
        <UserMenu />
      </header>
      <div className="post-page">
        <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
        <h1 className="post-title">{post.title || 'Untitled'}</h1>
        <img src={post.image_url} alt={post.title} className="post-image" />
        <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Avatar url={authorProfile.avatar_url} size={32} />
          <div>by {authorName}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span title={`Rating: ${postRating}`} style={{ color: ratingColor[postRating], fontWeight: 'bold' }}>
              {postRating.toUpperCase()}
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
          <div className="glass-tags-row" style={{ marginTop: '1rem' }}>
            {tags.map(tag => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="glass-tag-chip">
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