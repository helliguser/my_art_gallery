'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import UserMenu from '@/components/UserMenu';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  views: number;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    params.then(({ name }) => {
      setTagName(decodeURIComponent(name));
    });
  }, [params]);

  useEffect(() => {
    if (!tagName) return;
    const fetchPostsByTag = async () => {
      setLoading(true);
      // Ищем тег
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', tagName)
        .maybeSingle();
      if (!tag) {
        setPosts([]);
        setLoading(false);
        return;
      }
      // Получаем post_ids
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', tag.id);
      const postIds = postTags?.map(pt => pt.post_id) || [];
      if (postIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      // Загружаем посты и профили
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(full_name, username, avatar_url)')
        .in('id', postIds)
        .order('created_at', { ascending: false });
      const enriched = (postsData || []).map(p => ({
        ...p,
        profile: p.profiles,
      }));
      setPosts(enriched);
      setLoading(false);
    };
    fetchPostsByTag();
  }, [tagName]);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery – #{tagName}</h1>
        <UserMenu />
      </header>
      {posts.length === 0 ? (
        <p>No artworks with tag #{tagName}</p>
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