'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import InfiniteScroll from '@/components/InfiniteScroll';
import Icon from '@/components/Icon';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchTrending = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trending?page=${pageNum}&limit=12`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(prev => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrending(1).finally(() => setInitialLoading(false));
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchTrending(nextPage);
  };

  if (initialLoading) return null;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo"><Icon name="Trending_Up" folder="interface" size={24} /> Furline – Trending</h1>
        <UserMenu />
      </header>
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
        {posts.length === 0 && !loading && <p>No trending posts at the moment.</p>}
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
                  <div className="card-author">
                    <Avatar url={post.profile?.avatar_url} size={24} />
                    <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                  </div>
                  <div className="card-actions">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>❤️ {post.likes_count || 0}</span>
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