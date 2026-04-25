import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, likes_count')
    .order('created_at', { ascending: false });

  if (error) return <div className="container">Error loading gallery</div>;

  // Получаем профили авторов (включая аватар)
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, { full_name: string | null; username: string | null; avatar_url: string | null }> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>
      <div className="gallery">
        {posts.map(post => {
          const profile = profilesMap[post.user_id];
          const authorName = profile?.full_name || profile?.username || 'Anonymous';
          return (
            <div key={post.id} className="card">
              <Link href={`/post/${post.id}`}>
                <img src={post.image_url} alt={post.title} />
              </Link>
              <div className="card-content">
                <div className="card-title">{post.title}</div>
                <div className="card-author" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <Avatar url={profile?.avatar_url} size={24} />
                  <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}