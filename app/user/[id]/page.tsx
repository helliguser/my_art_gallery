import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('[UserPage] ID:', id);
  const supabase = await createClient();

  // Profil abrufen
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    console.error('[UserPage] Profile error:', profileError);
    notFound();
  }

  // Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, image_url, likes_count')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  // Current session
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;
  const isOwnProfile = currentUserId === id;

  console.log('[UserPage] currentUserId:', currentUserId, 'isOwnProfile:', isOwnProfile);

  const authorName = profile.full_name || profile.username || 'Anonymous';

  return (
    <div className="container">
      <Link href="/" className="btn btn-outline">← Back</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Avatar url={profile.avatar_url} size={80} />
        <div>
          <h1>{authorName}</h1>
          <p>@{profile.username}</p>
        </div>
      </div>

      {!isOwnProfile && currentUserId && (
        <div style={{ marginBottom: '1rem' }}>
          <FollowButton userId={id} />
        </div>
      )}
      {!currentUserId && (
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/login">Sign in to follow</Link>
        </div>
      )}

      {profile.bio && <p>{profile.bio}</p>}

      <h2>Artworks ({posts?.length || 0})</h2>
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