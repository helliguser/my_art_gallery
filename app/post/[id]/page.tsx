import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Comments from './Comments'

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
}

type PageProps = {
  params: Promise<{ id: string }> | { id: string }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Получаем пост и автора (join с profiles)
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles(full_name, username)')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Получаем текущего пользователя (для проверки и передачи в Comments)
  const { data: { session } } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id

  const authorName = post.profiles?.full_name || post.profiles?.username || 'Anonymous'

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#0070f3' }}>← Back to Gallery</Link>
      <h1>{post.title}</h1>
      <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
      <p>by {authorName}</p>

      {/* Комментарии */}
      <Comments postId={post.id} currentUserId={currentUserId} />
    </div>
  )
}