import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export const dynamic = 'force-dynamic';

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="container">Error loading gallery</div>;

  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, { full_name: string | null; username: string | null }> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', userIds);
    if (profiles) profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
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
                  by{' '}
                  <Link href={`/user/${post.user_id}`}>
                    {authorName}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}