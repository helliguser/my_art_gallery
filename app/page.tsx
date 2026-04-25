import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, likes_count')
    .order('created_at', { ascending: false })

  if (error) return <div className="container">Error loading gallery</div>

  // Получение имён авторов (profiles) – можно позже
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>
      <div className="gallery">
        {posts.map(post => (
          <div key={post.id} className="card">
            <Link href={`/post/${post.id}`}>
              <img src={post.image_url} alt={post.title} />
            </Link>
            <div className="card-content">
              <div className="card-title">{post.title}</div>
              <div className="card-author">
                by <Link href={`/user/${post.user_id}`}>Artist</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}