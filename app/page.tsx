import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(full_name, username, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading posts</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>
      <div className="gallery">
        {posts?.map((post) => (
          <div key={post.id} className="card">
            <Link href={`/post/${post.id}`}>
              <img src={post.image_url} alt={post.title} />
            </Link>
            <div className="card-content">
              <div className="card-title">{post.title}</div>
              <div className="card-author">
                <Avatar url={post.profiles?.avatar_url} size={24} />
                <Link href={`/user/${post.user_id}`}>
                  {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}