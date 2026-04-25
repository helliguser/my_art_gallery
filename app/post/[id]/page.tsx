import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  // Получаем пост
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Получаем профиль автора (если есть)
  let authorName = 'Anonymous'
  if (post.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', post.user_id)
      .single()
    if (profile) {
      authorName = profile.full_name || profile.username || 'Anonymous'
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/">← Back to Gallery</Link>
      <h1>{post.title}</h1>
      <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: '8px' }} />
      <p>by {authorName}</p>
    </div>
  )
}