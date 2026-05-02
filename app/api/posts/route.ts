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
  const tag = searchParams.get('tag') || '';
  const rating = searchParams.get('rating') || ''; // safe, questionable, explicit
  const following = searchParams.get('following') === 'true';
  const userId = searchParams.get('userId');
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Парсинг тегов и исключений (как ранее)
  const parts = tag.trim().split(/\s+/);
  const requiredTags: string[] = [];
  const forbiddenTags: string[] = [];

  for (const part of parts) {
    if (part.startsWith('-')) {
      const t = part.slice(1);
      if (t) forbiddenTags.push(t);
    } else {
      if (part) requiredTags.push(part);
    }
  }

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Фильтр по рейтингу
  if (rating && ['safe', 'questionable', 'explicit'].includes(rating)) {
    query = query.eq('rating', rating);
  }

  // Обязательные теги
  if (requiredTags.length) {
    const { data: tagRecords } = await supabase
      .from('tags')
      .select('id')
      .in('name', requiredTags);
    if (!tagRecords || tagRecords.length !== requiredTags.length) {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
    }
    const requiredTagIds = tagRecords.map(t => t.id);
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('post_id, tag_id')
      .in('tag_id', requiredTagIds);
    if (!postTags || postTags.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
    }
    const counts: Record<number, number> = {};
    for (const pt of postTags) {
      counts[pt.post_id] = (counts[pt.post_id] || 0) + 1;
    }
    const postIds = Object.entries(counts)
      .filter(([, c]) => c === requiredTagIds.length)
      .map(([id]) => parseInt(id));
    if (postIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
    }
    query = query.in('id', postIds);
  }

  // Запрещённые теги
  if (forbiddenTags.length) {
    const { data: forbiddenTagRecords } = await supabase
      .from('tags')
      .select('id')
      .in('name', forbiddenTags);
    if (forbiddenTagRecords && forbiddenTagRecords.length) {
      const forbiddenTagIds = forbiddenTagRecords.map(t => t.id);
      const { data: postsWithForbidden } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', forbiddenTagIds);
      const forbiddenPostIds = [...new Set(postsWithForbidden?.map(p => p.post_id) || [])];
      if (forbiddenPostIds.length) {
        query = query.not('id', 'in', `(${forbiddenPostIds.join(',')})`);
      }
    }
  }

  // Поиск по заголовку
  if (search) {
    query = query.ilike('title', `%${search}%`);
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

  // Профили авторов
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

  const enriched = posts.map(post => ({
    ...post,
    profile: profilesMap[post.user_id] || null,
  }));

  return NextResponse.json({
    posts: enriched,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}