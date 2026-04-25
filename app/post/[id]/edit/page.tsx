import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import EditPostForm from './EditPostForm';

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Проверяем авторизацию и авторство
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, user_id')
    .eq('id', id)
    .single();

  if (error || !post) notFound();
  if (post.user_id !== session.user.id) redirect('/'); // не автор

  return (
    <div className="container">
      <div className="post-page">
        <Link href={`/post/${id}`} className="btn btn-outline" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back to post</Link>
        <h1>Edit Artwork</h1>
        <EditPostForm postId={post.id} currentTitle={post.title} />
      </div>
    </div>
  );
}