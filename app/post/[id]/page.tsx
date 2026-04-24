import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteButton from './DeleteButton'

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

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles(id, username, full_name)')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  const { data: { session } } = await supabase.auth.getSession()
  const isAuthor = session?.user?.id === post.user_id

  const authorName = post.profiles?.full_name || post.profiles?.username || 'Anonymous'

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#0070f3' }}>
        ← Back to Gallery
      </Link>

      <div style={{ marginTop: '1rem' }}>
        <img
          src={post.image_url}
          alt={post.title}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
        <h1>{post.title}</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <p>
            by{' '}
            <Link href={`/user/${post.user_id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
              {authorName}
            </Link>
            {' '} on {new Date(post.created_at).toLocaleDateString()}
          </p>

          {/* Исправлено: добавили проверку session && */}
          {isAuthor && session && (
            <div>
              <button
                style={{
                  marginRight: '0.5rem',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Edit functionality coming soon')}
              >
                Edit
              </button>
              <DeleteButton postId={post.id} userId={session.user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}