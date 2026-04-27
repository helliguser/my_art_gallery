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
  const tagName = decodeURIComponent(name);

  // Ищем тег без учёта регистра
  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .ilike('name', tagName)
    .maybeSingle();

  if (!tag) {
    return (
      <div className="container">
        <header className="header">
          <h1 className="logo">Art Gallery</h1>
          <UserMenu />
        </header>
        <p>Tag "{tagName}" not found.</p>
      </div>
    );
  }

  // Получаем все post_id для этого тега
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

  // Приводим к формату, ожидаемому компонентом Avatar (profile)
  const enriched = posts.map(post => ({
    ...post,
    profile: post.profiles,
  }));

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery – #{tagName}</h1>
        <UserMenu />
      </header>
      {enriched.length === 0 ? (
        <p>No artworks with tag #{tagName}</p>
      ) : (
        <div className="gallery">
          {enriched.map(post => (
            <div key={post.id} className="card">
              <Link href={`/post/${post.id}`}>
                <img src={post.image_url} alt={post.title} />
              </Link>
              <div className="card-content">
                <div className="card-title">{post.title}</div>
                <div className="card-author">
                  <Avatar url={post.profile?.avatar_url} size={24} />
                  <Link href={`/user/${post.user_id}`}>
                    {post.profile?.full_name || post.profile?.username || 'Anonymous'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}