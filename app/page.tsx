'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import InfiniteScroll from '@/components/InfiniteScroll';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/lib/supabase';

type Post = {
  id: number;
  title: string;
  image_url: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, debouncedSearch, feedType);
  }, [debouncedSearch, feedType]);

  const fetchPosts = async (pageNum: number, search: string, type: 'all' | 'following') => {
    setLoading(true);
    const url = `/api/posts?page=${pageNum}&limit=12&search=${encodeURIComponent(search)}&following=${type === 'following'}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        setLoading(false);
        return;
      }
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(1, '', 'all').finally(() => setInitialLoading(false));
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, debouncedSearch, feedType);
  };

  if (initialLoading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>

      {/* Переключатель ленты */}
      {isLoggedIn && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setFeedType('all')}
            className={`btn ${feedType === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Artworks
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-outline'}`}
          >
            Following
          </button>
        </div>
      )}

      {/* Поиск */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
        {posts.length === 0 && !loading && <p style={{ textAlign: 'center' }}>No artworks found.</p>}
        <div className="gallery">
          {posts.map(post => {
            const authorName = post.profile?.full_name || post.profile?.username || 'Anonymous';
            return (
              <div key={post.id} className="card">
                <Link href={`/post/${post.id}`}>
                  <img src={post.image_url} alt={post.title} />
                </Link>
                <div className="card-content">
                  <div className="card-title">{post.title}</div>
                  <div className="card-author" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Avatar url={post.profile?.avatar_url} size={24} />
                    <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}