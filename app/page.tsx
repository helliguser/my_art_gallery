'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import { useDebounce } from 'use-debounce';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const url = `/api/posts?search=${encodeURIComponent(debouncedSearch)}&following=${feedType === 'following'}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
      setLoading(false);
    };
    fetchPosts();
  }, [debouncedSearch, feedType]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>

      {isLoggedIn && (
        <div className="feed-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => setFeedType('all')} className={`btn ${feedType === 'all' ? 'btn-primary' : 'btn-outline'}`}>
            All Artworks
          </button>
          <button onClick={() => setFeedType('following')} className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-outline'}`}>
            Following
          </button>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      {loading && <p>Loading...</p>}
      {!loading && posts.length === 0 && <p>No artworks found.</p>}
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
    </div>
  );
}