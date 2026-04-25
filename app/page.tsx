'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import InfiniteScroll from '@/components/InfiniteScroll';

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

  const fetchPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=12`);
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1).finally(() => setInitialLoading(false));
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage);
  };

  if (initialLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
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
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}