import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Post = {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  user_id: string;
};

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading images: {error.message}</div>;
  }

  // Получаем уникальные user_id и загружаем email (или можно сделать join, но для простоты так)
  const userIds = [...new Set((posts as Post[]).map(p => p.user_id).filter(Boolean))];
  let usersMap: Record<string, string> = {};
  if (userIds.length) {
    const { data: users } = await supabase.auth.admin.listUsers(); // не работает без admin прав, лучше использовать profiles таблицу. Для простоты пока пропустим.
    // Временно просто показываем user_id
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Art Gallery</h1>
        <div>
          <Link href="/upload" style={{ marginRight: '1rem', textDecoration: 'none', background: '#0070f3', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px' }}>
            Upload Artwork
          </Link>
          <Link href="/login" style={{ textDecoration: 'none', background: '#333', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px' }}>
            Sign In
          </Link>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {(posts as Post[]).map((post) => (
          <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '0.5rem' }}>
            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{post.title}</p>
            <small style={{ display: 'block', textAlign: 'center' }}>by {post.user_id ? `User ${post.user_id.slice(0,6)}` : 'anonymous'}</small>
          </div>
        ))}
      </div>
    </div>
  );
}