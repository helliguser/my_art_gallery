'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import InfiniteScroll from '@/components/InfiniteScroll';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function TagPage() {
  const params = useParams();
  const tagName = decodeURIComponent(params.name as string);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number, reset = false) => {
    try {
      const res = await fetch(`/api/posts?tag=${encodeURIComponent(tagName)}&page=${pageNum}&limit=12`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts(1, true).finally(() => setLoading(false));
  }, [tagName]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    await fetchPosts(nextPage);
    setLoadingMore(false);
  };

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
        <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loadingMore}>
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
      )}
    </div>
  );
}