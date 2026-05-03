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
  const ratingColor: Record<string, string> = { safe: 'green', questionable: 'orange', explicit: 'red' };
  const ratingDisplay = postRating.toUpperCase();
  const color = ratingColor[postRating] || 'gray';

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Furline</h1>
        <UserMenu />
      </header>
      <div className="post-wrapper">
        <div className="glass-card post-card">
          <Link href="/" className="back-link"><Icon name="Arrow_Left_LG" folder="arrow" size={16} /> Back</Link>
          <img src={post.image_url} alt={post.title} className="post-image" />
          <div className="post-info">
            <div className="post-author">
              <Avatar url={authorProfile.avatar_url} size={40} name={authorName} />
              <div>
                <div className="post-author-name">{authorName}</div>
                <div className="post-meta">Posted {new Date(post.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="post-actions">
              <span className="rating" style={{ color }}>{ratingDisplay}</span>
              <FavoriteButton postId={post.id} />
              <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
              {isAuthor && <Link href={`/post/${post.id}/edit`} className="btn btn-secondary">Edit</Link>}
            </div>
          </div>
          <div className="post-details">
            {post.source_url && (
              <div className="detail-item">
                <Icon name="Link_Horizontal" folder="interface" size={16} />
                <a href={post.source_url} target="_blank" rel="noopener noreferrer">Source</a>
              </div>
            )}
            {post.artist_name && (
              <div className="detail-item">
                <Icon name="User" folder="interface" size={16} />
                <span>Artist: {post.artist_name}</span>
              </div>
            )}
            {post.description && (
              <div className="detail-item description">
                <Icon name="Book_Open" folder="interface" size={16} />
                <p>{post.description}</p>
              </div>
            )}
          </div>
          {tags.length > 0 && (
            <div className="post-tags">
              {tags.map(tag => (
                <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="tag-pill">#{tag}</Link>
              ))}
            </div>
          )}
          <Comments postId={post.id} />
        </div>
      </div>
    </div>
  );
}