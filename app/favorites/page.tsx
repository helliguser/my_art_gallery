import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?redirect_to=/favorites');

  // 1. Получаем избранные посты (post_id)
  const { data: favorites } = await supabase
    .from('favorites')
    .select('post_id')
    .eq('user_id', session.user.id);

  const postIds = favorites?.map(f => f.post_id) || [];
  if (postIds.length === 0) {
    return (
      <div className="container">
        <h1>My Favorites</h1>
        <p>No favorites yet.</p>
      </div>
    );
  }

  // 2. Получаем сами посты
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .in('id', postIds)
    .order('created_at', { ascending: false });

  // 3. Получаем профили авторов отдельно
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, any> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  const enrichedPosts = posts.map(post => ({
    ...post,
    profile: profilesMap[post.user_id] || null,
  }));

  return (
    <div className="container">
      <h1>My Favorites</h1>
      {enrichedPosts.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <div className="gallery">
          {enrichedPosts.map(post => (
            <div key={post.id} className="card">
              <Link href={`/post/${post.id}`}>
                <img src={post.image_url} alt={post.title} />
              </Link>
              <div className="card-content">
                <div className="card-title">{post.title}</div>
                <div className="card-author">
                  <Avatar url={post.profile?.avatar_url} size={24} />
                  <Link href={`/user/${post.user_id}`}>
                    {post.profile?.full_name || post.profile?.username || 'Anonymous'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}