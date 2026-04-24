import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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

type Post = {
  id: number
  title: string
  image_url: string
  created_at: string
  user_id: string
}

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

export default async function HomePage() {
  const supabase = await createClient()

  // Проверяем, залогинен ли пользователь
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  // Загружаем посты
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div style={{ padding: '2rem' }}>Error loading images: {error.message}</div>
  }

  // Загружаем профили авторов
  const userIds = [...new Set((posts as Post[]).map(p => p.user_id).filter(Boolean))]
  let profilesMap: Record<string, Profile> = {}
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .in('id', userIds)
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]))
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Art Gallery</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link href="/upload" style={{ marginRight: '1rem', background: '#0070f3', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}>
                Upload Artwork
              </Link>
              <Link href="/profile" style={{ marginRight: '1rem', background: '#333', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}>
                My Profile
              </Link>
            </>
          ) : (
            <Link href="/login" style={{ background: '#666', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {(posts as Post[]).map(post => {
          const profile = profilesMap[post.user_id]
          const authorName = profile?.full_name || profile?.username || 'Anonymous'
          return (
            <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '0.5rem' }}>
              <Link href={`/post/${post.id}`} style={{ display: 'block' }}>
                <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </Link>
              <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{post.title}</p>
              </Link>
              <small style={{ display: 'block', textAlign: 'center' }}>
                by{' '}
                <Link href={`/user/${post.user_id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
                  {authorName}
                </Link>
              </small>
            </div>
          )
        })}
      </div>
      {(!posts || posts.length === 0) && <p style={{ textAlign: 'center' }}>No artworks yet. Be the first to upload!</p>}
    </div>
  )
}