import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Comments from './Comments';

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

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  let authorName = 'Anonymous';
  if (post.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', post.user_id)
      .single();
    if (profile) authorName = profile.full_name || profile.username || 'Anonymous';
  }

  return (
    <div className="container">
      <div className="post-page">
        <Link href="/" className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
        <h1 className="post-title">{post.title}</h1>
        <img src={post.image_url} alt={post.title} className="post-image" />
        <div className="post-meta">by {authorName}</div>
        <Comments postId={post.id} />
      </div>
    </div>
  );
}