'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
};

export default function FavoritesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login?redirect_to=/favorites';
          return;
        }

        // 1. Получить избранные (post_id)
        const { data: favorites, error: favError } = await supabase
          .from('favorites')
          .select('post_id')
          .eq('user_id', session.user.id);

        if (favError) throw favError;

        const postIds = favorites?.map(f => f.post_id) || [];
        if (postIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // 2. Получить посты (без join)
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, image_url, user_id')
          .in('id', postIds)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">My Favorites</h1>
        <UserMenu />
      </header>
      {posts.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <div className="gallery">
          {posts.map(post => (
            <div key={post.id} className="card">
              <Link href={`/post/${post.id}`}>
                <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto' }} />
              </Link>
              <div className="card-content">
                <div className="card-title">{post.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}