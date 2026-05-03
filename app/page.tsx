'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Avatar from '@/components/Avatar';
import InfiniteScroll from '@/components/InfiniteScroll';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/lib/supabase';
import SaveSearchButton from '@/components/SaveSearchButton';
import LikeButton from '@/components/LikeButton';
import Icon from '@/components/Icon';

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  profile: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('tag') || '';
  const initialSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [tagTerm, setTagTerm] = useState(initialTag);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [debouncedTag] = useDebounce(tagTerm, 500);
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [popularTags, setPopularTags] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
      setIsLoggedIn(!!session);
    });
  }, []);

  useEffect(() => {
    const fetchPopularTags = async () => {
      const { data } = await supabase.from('post_tags').select('tags!inner(name)');
      if (!data) return;
      const counts: Record<string, number> = {};
      for (const item of data) {
        const name = (item as any).tags.name;
        counts[name] = (counts[name] || 0) + 1;
      }
      const popular = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
      setPopularTags(popular);
    };
    fetchPopularTags();
  }, []);

  useEffect(() => {
    setPosts([]); setPage(1); setHasMore(true);
    fetchPosts(1, debouncedSearch, debouncedTag, feedType);
  }, [debouncedSearch, debouncedTag, feedType]);

  const fetchPosts = async (pageNum: number, search: string, tag: string, type: 'all' | 'following') => {
    setLoading(true);
    let url = `/api/posts?page=${pageNum}&limit=12&search=${encodeURIComponent(search)}&following=${type === 'following'}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (type === 'following' && currentUserId) url += `&userId=${currentUserId}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(prev => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(pageNum < data.totalPages);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(1, initialSearch, initialTag, 'all').finally(() => setInitialLoading(false));
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, debouncedSearch, debouncedTag, feedType);
  };

  if (initialLoading) return null;

  return (
    <div className="glass-container">
      <header className="glass-header">
        <h1 className="logo">Furline</h1>
        <UserMenu />
      </header>

      {/* Панель фильтров */}
      <div className="glass-filters">
        <div className="filter-buttons">
          <button onClick={() => setFeedType('all')} className={`glass-btn ${feedType === 'all' ? 'active' : ''}`}>All</button>
          {isLoggedIn && <button onClick={() => setFeedType('following')} className={`glass-btn ${feedType === 'following' ? 'active' : ''}`}>Following</button>}
        </div>
      </div>

      {/* Блок поиска (основной) */}
      <div className="glass-search-wrapper">
        <div className="glass-search-field">
          <Icon name="Search_Magnifying_Glass" folder="interface" size={18} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="glass-search-field">
          <Icon name="Tag" folder="interface" size={18} />
          <input
            type="text"
            placeholder="Search by tag (e.g. cat -dog)..."
            value={tagTerm}
            onChange={(e) => setTagTerm(e.target.value)}
          />
        </div>
        <SaveSearchButton currentSearch={tagTerm} />
      </div>

      {/* Популярные теги (чипсы) */}
      {popularTags.length > 0 && (
        <div className="glass-tags-row">
          {popularTags.map(tag => (
            <button key={tag.name} onClick={() => setTagTerm(tag.name)} className="glass-tag-chip">
              #{tag.name} <span className="tag-count">{tag.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Галерея */}
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
        {posts.length === 0 && !loading && <p className="glass-empty">No artworks found.</p>}
        <div className="glass-gallery">
          {posts.map(post => {
            const authorName = post.profile?.full_name || post.profile?.username || 'Anonymous';
            return (
              <div key={post.id} className="glass-card">
                <Link href={`/post/${post.id}`}>
                  <img src={post.image_url} alt={post.title} className="glass-card-img" />
                </Link>
                <div className="glass-card-content">
                  <div className="glass-card-title">{post.title || 'Untitled'}</div>
                  <div className="glass-card-author">
                    <Avatar url={post.profile?.avatar_url} size={24} name={authorName} />
                    <Link href={`/user/${post.user_id}`}>{authorName}</Link>
                  </div>
                  <div className="glass-card-actions">
                    <LikeButton postId={post.id} initialLikes={post.likes_count || 0} />
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