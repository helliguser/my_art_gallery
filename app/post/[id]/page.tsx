import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Профиль
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) notFound();

  // Посты пользователя
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, image_url, created_at, likes_count')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  // Количество подписчиков
  const { count: followersCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', id);

  // Количество подписок (кого подписан)
  const { count: followingCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', id);

  const authorName = profile.full_name || profile.username || 'Anonymous';
  const isCurrentUser = false; // определим на клиенте через FollowButton

  return (
    <div className="container">
      <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Avatar url={profile.avatar_url} size={80} />
        <div>
          <h1>{authorName}</h1>
          <p>@{profile.username}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span><strong>{followersCount || 0}</strong> followers</span>
            <span><strong>{followingCount || 0}</strong> following</span>
          </div>
        </div>
      </div>
      <FollowButton userId={id} />

      {profile.bio && <p style={{ marginTop: '1rem' }}>{profile.bio}</p>}

      <h2 style={{ marginTop: '2rem' }}>Artworks ({posts?.length || 0})</h2>
      <div className="gallery">
        {posts?.map(post => (
          <div key={post.id} className="card">
            <Link href={`/post/${post.id}`}>
              <img src={post.image_url} alt={post.title} />
            </Link>
            <div className="card-content">
              <div className="card-title">{post.title}</div>
              <div className="card-actions">❤️ {post.likes_count || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}