import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from './Comments';
import LikeButton from '@/components/LikeButton';
import FavoriteButton from '@/components/FavoriteButton';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';

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

  const { data: postTags } = await supabase
    .from('post_tags')
    .select('tag_id, tags(name)')
    .eq('post_id', post.id);
  const tags = postTags?.map(pt => (pt.tags as any).name) || [];

  const postRating = post.rating || 'safe';
  const ratingColor: Record<string, string> = { safe: '#4caf50', questionable: '#ff9800', explicit: '#f44336' };
  const ratingDisplay = postRating.toUpperCase();

  return (
    <div className="glass-container post-container">
      <header className="glass-header">
        <h1 className="logo">Furline</h1>
        {/* Здесь можно добавить UserMenu, но на странице поста оно уже есть в layout, так что не дублируем */}
      </header>

      <div className="glass-post-card">
        <Link href="/" className="glass-back-link">
          <Icon name="Arrow_Left_LG" folder="arrow" size={16} />
          Back
        </Link>
        <h1 className="glass-post-title">{post.title || 'Untitled'}</h1>
        <img src={post.image_url} alt={post.title} className="glass-post-image" />
        <div className="glass-post-meta">
          <div className="glass-post-author">
            <Avatar url={authorProfile.avatar_url} size={32} name={authorName} />
            <span>by {authorName}</span>
          </div>
          <div className="glass-post-actions">
            <span className="glass-rating" style={{ backgroundColor: ratingColor[postRating] + '20', color: ratingColor[postRating] }}>
              {ratingDisplay}
            </span>
            <FavoriteButton postId={post.id} />
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            {isAuthor && (
              <Link href={`/post/${post.id}/edit`} className="glass-small-btn">Edit</Link>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="glass-tags-row post-tags">
            {tags.map(tag => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="glass-tag-chip">{tag}</Link>
            ))}
          </div>
        )}

        {/* Доп. информация из новых полей (source_url, artist_name, description) */}
        {post.source_url && (
          <div className="glass-info-row">
            <Icon name="Link_Horizontal" folder="interface" size={14} />
            <a href={post.source_url} target="_blank" rel="noopener noreferrer">Source</a>
          </div>
        )}
        {post.artist_name && (
          <div className="glass-info-row">
            <Icon name="User" folder="interface" size={14} />
            <span>Artist: {post.artist_name}</span>
          </div>
        )}
        {post.description && (
          <div className="glass-description">
            <Icon name="Book_Open" folder="interface" size={14} />
            <p>{post.description}</p>
          </div>
        )}

        <Comments postId={post.id} />
      </div>
    </div>
  );
}