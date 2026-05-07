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

  const rating = post.rating || 'safe';
  const ratingColor: Record<string, string> = { safe: '#4caf50', questionable: '#ff9800', explicit: '#f44336' };

  return (
    <div className="container">
      <div className="post-page">
        <Link href="/" className="glass-back-link">
          <Icon name="Arrow_Left_LG" folder="arrow" size={16} /> Back
        </Link>
        <h1 className="post-title">{post.title}</h1>
        <img src={post.image_url} alt={post.title} className="post-image" />
        <div className="post-meta">
          <div className="post-author">
            <Avatar url={authorProfile.avatar_url} size={32} />
            <span>by {authorName}</span>
          </div>
          <div className="post-actions">
            <span className="rating" style={{ backgroundColor: ratingColor[rating] + '20', color: ratingColor[rating] }}>
              {rating.toUpperCase()}
            </span>
            <FavoriteButton postId={post.id} />
            <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
            {isAuthor && <Link href={`/post/${post.id}/edit`} className="btn btn-secondary">Edit</Link>}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="tags-row">
            {tags.map(tag => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="tag-chip">#{tag}</Link>
            ))}
          </div>
        )}
        <Comments postId={post.id} />
      </div>
    </div>
  );
}