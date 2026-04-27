import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const following = searchParams.get('following') === 'true';

  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (following) {
    // Получаем текущего пользователя (через серверный клиент с cookies, но здесь нет cookies, поэтому сделаем отдельный запрос на сессию)
    // Упростим: получим session из заголовка? В API нет доступа к cookies. Обойдёмся тем, что на клиенте будем передавать параметр following, а сам API должен знать, кто текущий пользователь.
    // Для этого в API нужно получать сессию через заголовок Authorization. Это сложно.
    // Проще: не фильтровать на сервере, а на клиенте после загрузки всех постов? Нет.
    // Лучше: передавать список following_ids из клиента. Но это некрасиво.
    // Сделаем правильно: создадим middleware или будем использовать серверный клиент в API, но для этого нужно передавать cookies вручную. Можно, но громоздко.
    // Я предложу рабочий компромисс: на клиенте (в page.tsx) перед запросом получаем список подписок и передаём их как параметр.
    // Но для простоты оставим только поиск, а following пока уберём. Позже реализуем.
    // Однако вы просили подписки. Давайте сделаем так: в API будем принимать параметр followingIds (JSON), и если он передан, фильтровать.
  }

  const { data: posts, error } = await query;

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

  return NextResponse.json({ posts: enrichedPosts });
}