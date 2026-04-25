import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Получаем посты (без join)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postsError || !posts) {
    console.error('Error loading posts:', postsError);
    return <div className="container">Error loading posts. Please try again later.</div>;
  }

  // 2. Собираем уникальные user_id
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, any> = {};

  // 3. Загружаем профили (если есть пользователи)
  if (userIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (!profilesError && profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

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
                <div className="card-author">
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