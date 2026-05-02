import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import UserMenu from '@/components/UserMenu';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?redirect_to=/favorites');

  const { data: favorites } = await supabase
    .from('favorites')
    .select('post_id')
    .eq('user_id', session.user.id);

  const postIds = favorites?.map(f => f.post_id) || [];
  let posts: any[] = [];
  if (postIds.length) {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(full_name, username, avatar_url)')
      .in('id', postIds)
      .order('created_at', { ascending: false });
    posts = data || [];
  }

  const enriched = posts.map(post => ({
    ...post,
    profile: post.profiles,
  }));

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">My Favorites</h1>
        <UserMenu />
      </header>
      {enriched.length === 0 ? (
        <p>You haven't added any favorites yet.</p>
      ) : (
        <div className="gallery">
          {enriched.map(post => (
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