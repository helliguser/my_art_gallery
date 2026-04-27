import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const following = searchParams.get('following') === 'true';
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Получаем текущего пользователя для фильтра подписок
  let followingIds: string[] = [];
  if (following) {
    // Нужно получить сессию из заголовков (через серверный клиент)
    // Проще передать токен через куки, но здесь используем анонимный клиент и отдельный запрос к auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', session.user.id);
      followingIds = follows?.map(f => f.following_id) || [];
    }
  }

  let query = supabase
    .from('posts')
    .select('*, likes_count', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (following && followingIds.length > 0) {
    query = query.in('user_id', followingIds);
  } else if (following && followingIds.length === 0) {
    // Нет подписок – возвращаем пустой результат
    return NextResponse.json({
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }

  const { data: posts, error, count } = await query.range(start, end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Загружаем профили авторов
  const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
  let profilesMap: Record<string, any> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  const enrichedPosts = posts.map(post => ({
    ...post,
    profile: profilesMap[post.user_id] || null,
  }));

  return NextResponse.json({
    posts: enrichedPosts,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}