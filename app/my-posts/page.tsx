import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeletePostButton from './DeletePostButton';
import Icon from '@/components/Icon';

export default async function MyPostsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect_to=/my-posts');
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, image_url, created_at, likes_count')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="container">Error loading your posts: {error.message}</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">My Posts</h1>
        <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="arrow/Arrow_Left_MD" size={16} />
          Back to Gallery
        </Link>
      </header>
      {posts.length === 0 ? (
        <p>You haven't posted anything yet. <Link href="/upload">Upload your first artwork</Link></p>
      ) : (
        <div className="gallery">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <Link href={`/post/${post.id}`}>
                <img src={post.image_url} alt={post.title} />
              </Link>
              <div className="card-content">
                <div className="card-title">{post.title}</div>
                <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <Link href={`/post/${post.id}/edit`} className="btn btn-secondary">Edit</Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}