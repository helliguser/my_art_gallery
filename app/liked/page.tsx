'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

export default function LikedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login?redirect_to=/liked';
        return;
      }

      // 1. Получаем лайки пользователя
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', session.user.id);

      if (!likes || likes.length === 0) {
        setLoading(false);
        return;
      }

      const postIds = likes.map(l => l.post_id);

      // 2. Получаем посты
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      setPosts(postsData || []);

      // 3. Получаем профили авторов отдельным запросом
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);
        if (profiles) {
          const map = Object.fromEntries(profiles.map(p => [p.id, p]));
          setProfilesMap(map);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Liked Artworks</h1>
      {posts.length === 0 ? (
        <p>You haven't liked any posts yet.</p>
      ) : (
        <div className="gallery">
          {posts.map(post => {
            const profile = profilesMap[post.user_id];
            const authorName = profile?.full_name || profile?.username || 'Anonymous';
            return (
              <div key={post.id} className="card">
                <Link href={`/post/${post.id}`}>
                  <img src={post.image_url} alt={post.title} />
                </Link>
                <div className="card-content">
                  <div className="card-title">{post.title}</div>
                  <div className="card-author">
                    <Avatar url={profile?.avatar_url} size={24} />
                    <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}