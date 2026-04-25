import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select('*, likes_count', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: posts, error, count } = await query.range(start, end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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