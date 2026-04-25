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
  profiles?: { username: string; full_name: string | null }
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(username, full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div style={{ padding: '2rem' }}>Error loading gallery</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Art Gallery</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link
                href="/upload"
                style={{ marginRight: '1rem', background: '#0070f3', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}
              >
                Upload Artwork
              </Link>
              <Link
                href="/profile"
                style={{ background: '#333', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}
              >
                My Profile
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              style={{ background: '#666', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {posts?.map((post: Post) => {
          const authorName = post.profiles?.full_name || post.profiles?.username || 'Anonymous'
          return (
            <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '0.5rem' }}>
              <Link href={`/post/${post.id}`} style={{ display: 'block' }}>
                <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </Link>
              <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{post.title}</p>
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

      {(!posts || posts.length === 0) && (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>No artworks yet. Be the first to upload!</p>
      )}
    </div>
  )
}