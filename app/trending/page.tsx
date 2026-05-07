import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';

export const dynamic = 'force-dynamic';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  views: number;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function TrendingPage() {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, likes_count, views')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('likes_count', { ascending: false })
    .order('views', { ascending: false });

  if (error) return <div className="container">Error loading trending posts</div>;

  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, any> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (profiles) profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  }

  const enriched = posts.map(post => ({
    ...post,
    profile: profilesMap[post.user_id] || null,
  }));

  return (
    <div className="container">
      <h1 className="page-title">🔥 Trending This Week</h1>
      {enriched.length === 0 ? (
        <p>No trending posts at the moment.</p>
      ) : (
        <div className="gallery">
          {enriched.map(post => {
            const authorName = post.profile?.full_name || post.profile?.username || 'Anonymous';
            return (
              <div key={post.id} className="card">
                <Link href={`/post/${post.id}`}>
                  <img src={post.image_url} alt={post.title} />
                </Link>
                <div className="card-content">
                  <div className="card-title">{post.title}</div>
                  <div className="card-author">
                    <Avatar url={post.profile?.avatar_url} size={24} name={authorName} />
                    <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                  </div>
                  <div className="card-actions">
                    <span>🔥 { (post.likes_count || 0) + (post.views || 0) }</span>
                    <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}