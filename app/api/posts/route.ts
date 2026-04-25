import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, likes_count')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Получаем профили авторов
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  // Добавляем данные авторов к постам
  const postsWithAuthors = posts.map(post => ({
    ...post,
    author: profilesMap[post.user_id] || { full_name: null, username: null, avatar_url: null }
  }));

  return NextResponse.json({ posts: postsWithAuthors, hasMore: posts.length === limit });
}