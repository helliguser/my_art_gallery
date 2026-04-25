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

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading gallery</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Art Gallery</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link href="/upload">Upload</Link>
              <Link href="/profile">Profile</Link>
            </>
          ) : (
            <Link href="/login">Sign In</Link>
          )}
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {posts?.map(post => (
          <div key={post.id}>
            <Link href={`/post/${post.id}`}>
              <img src={post.image_url} alt={post.title} style={{ width: '100%' }} />
            </Link>
            <p>{post.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}