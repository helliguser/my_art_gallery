import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }> | { id: string }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  
  if (!id) {
    notFound()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Post ID: {id}</h1>
      <p>If you see this, the route is working.</p>
    </div>
  )
}