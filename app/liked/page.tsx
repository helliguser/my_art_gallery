'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import UserMenu from '@/components/UserMenu';

type LikedPost = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  views: number;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function LikedPage() {
  const [posts, setPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login?redirect_to=/liked';
        return;
      }
      setUserId(session.user.id);
      loadLikedPosts(session.user.id);
    });
  }, []);

  const loadLikedPosts = async (uid: string) => {
    setLoading(true);
    // Получаем все post_id, которые лайкнул пользователь
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', uid);
    if (likesError) {
      console.error('Likes error:', likesError);
      setLoading(false);
      return;
    }
    if (!likes.length) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postIds = likes.map(l => l.post_id);
    // Загружаем посты (без JOIN)
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });
    if (postsError) {
      console.error('Posts error:', postsError);
      setLoading(false);
      return;
    }

    // Загружаем профили авторов отдельно
    const userIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))];
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

    const enriched = postsData.map(post => ({
      ...post,
      profile: profilesMap[post.user_id] || null,
    }));
    setPosts(enriched);
    setLoading(false);
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Liked Artworks</h1>
        <UserMenu />
      </header>
      {posts.length === 0 ? (
        <p>You haven't liked any posts yet.</p>
      ) : (
        <div className="gallery">
          {posts.map(post => (
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
                <div className="card-actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span>👁️ {post.views || 0}</span>
                  <span>❤️ {post.likes_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}