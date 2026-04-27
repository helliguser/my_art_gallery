import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import UserMenu from '@/components/UserMenu';

type PageProps = {
  params: Promise<{ name: string }>;
};

export default async function TagPage({ params }: PageProps) {
  const { name } = await params;
  const supabase = await createClient();

  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('name', decodeURIComponent(name))
    .single();

  if (!tag) {
    return <div className="container">Tag not found</div>;
  }

  const { data: postTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id);

  const postIds = postTags?.map(pt => pt.post_id) || [];
  let posts: any[] = [];
  if (postIds.length) {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(full_name, username, avatar_url)')
      .in('id', postIds)
      .order('created_at', { ascending: false });
    posts = data || [];
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery – #{name}</h1>
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
                <Avatar url={post.profiles?.avatar_url} size={24} />
                <Link href={`/user/${post.user_id}`}>
                  {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && <p>No artworks with tag #{name}</p>}
    </div>
  );
}