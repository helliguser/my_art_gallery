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
  const queryStr = searchParams.get('q') || '';
  const following = searchParams.get('following') === 'true';
  const userId = searchParams.get('userId');
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Разбор запроса: теги с минусом убираем
  const tags = queryStr.split(/\s+/).filter(t => t && !t.startsWith('-'));
  const negTags = queryStr.split(/\s+/).filter(t => t.startsWith('-')).map(t => t.slice(1));

  let postIds: number[] | null = null;

  // Если есть теги (включая минус), сначала находим посты по тегам
  if (tags.length > 0 || negTags.length > 0) {
    // Получаем id тегов
    let tagIds: number[] = [];
    if (tags.length > 0) {
      const { data } = await supabase
        .from('tags')
        .select('id')
        .in('name', tags);
      tagIds = data?.map(t => t.id) || [];
    }
    let negTagIds: number[] = [];
    if (negTags.length > 0) {
      const { data } = await supabase
        .from('tags')
        .select('id')
        .in('name', negTags);
      negTagIds = data?.map(t => t.id) || [];
    }

    // Посты, которые содержат все tagIds
    let positivePostIds: number[] | null = null;
    if (tagIds.length > 0) {
      for (const tid of tagIds) {
        const { data } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tid);
        const ids = data?.map(p => p.post_id) || [];
        if (positivePostIds === null) positivePostIds = ids;
        else positivePostIds = positivePostIds.filter(id => ids.includes(id));
      }
    }

    // Посты, которые содержат negTagIds (их исключаем)
    let negativePostIds: number[] = [];
    if (negTagIds.length > 0) {
      for (const tid of negTagIds) {
        const { data } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tid);
        const ids = data?.map(p => p.post_id) || [];
        negativePostIds.push(...ids);
      }
      negativePostIds = [...new Set(negativePostIds)];
    }

    // Итоговый список постов: positivePostIds (если есть) минус negativePostIds
    if (positivePostIds === null) {
      // Если нет положительных тегов, берём все посты, кроме отрицательных
      const { data: allPosts } = await supabase.from('posts').select('id');
      positivePostIds = allPosts?.map(p => p.id) || [];
    }
    postIds = positivePostIds.filter(id => !negativePostIds.includes(id));
    if (postIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
    }
  }

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (postIds) {
    query = query.in('id', postIds);
  }

  // Дополнительный поиск по заголовку (если нет тегов)
  if (!postIds && queryStr) {
    query = query.ilike('title', `%${queryStr}%`);
  }

  // Лента подписок
  if (following && userId) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    const followingIds = follows?.map(f => f.following_id) || [];
    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
    }
    query = query.in('user_id', followingIds);
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