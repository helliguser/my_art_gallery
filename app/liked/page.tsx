'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

export default function LikedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login?redirect_to=/liked';
        return;
      }
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', session.user.id);
      if (!likes || likes.length === 0) {
        setLoading(false);
        return;
      }
      const postIds = likes.map(l => l.post_id);
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(full_name, username, avatar_url)')
        .in('id', postIds)
        .order('created_at', { ascending: false });
      const enriched = postsData?.map(p => ({ ...p, profile: p.profiles })) || [];
      setPosts(enriched);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Liked Artworks</h1>
      {posts.length === 0 ? (
        <p>No liked posts yet.</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}