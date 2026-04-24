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
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // не нужно для чтения
        },
      },
    }
  )
}

type PageProps = {
  params: Promise<{ id: string }> | { id: string }
}

export default async function UserPage({ params }: PageProps) {
  const { id: userId } = await params
  const supabase = await createClient()

  // Получаем профиль
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Получаем посты пользователя
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <Link href="/">← Back to Gallery</Link>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{profile.full_name || profile.username}</h1>
        <p style={{ color: '#666' }}>@{profile.username}</p>
        {profile.bio && <p style={{ maxWidth: '500px', margin: '0 auto' }}>{profile.bio}</p>}
        <p><strong>{posts?.length || 0}</strong> artworks published</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {posts?.map(post => (
          <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '0.5rem' }}>
            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{post.title}</p>
          </div>
        ))}
        {(!posts || posts.length === 0) && <p>No artworks yet.</p>}
      </div>
    </div>
  )
}