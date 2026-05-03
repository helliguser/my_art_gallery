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
import Icon from '@/components/Icon';
import LikeIcon from '@/components/LikeIcon';  // используем уже готовый компонент (не интерактивный)

type Post = {
  id: number;
  title: string;
  image_url: string;
  user_id: string;
  likes_count: number;
  views: number;
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

  const loadMore = () => { const nextPage = page + 1; setPage(nextPage); fetchPosts(nextPage, debouncedSearch, debouncedTag, feedType); };

  if (initialLoading) return null;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Furbyte</h1>
        <UserMenu />
      </header>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFeedType('all')} className={`btn ${feedType === 'all' ? 'btn-primary' : 'btn-outline'}`}>All Artworks</button>
        {isLoggedIn && <button onClick={() => setFeedType('following')} className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-outline'}`}>Following</button>}
      </div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--input-border)' }} />
        <div style={{ position: 'relative', flex: 2 }}>
          <input type="text" placeholder="Search by tag (e.g. cat -dog)..." value={tagTerm} onChange={e => setTagTerm(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 28px', borderRadius: '8px', border: '1px solid var(--input-border)' }} />
          <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="Search_Magnifying_Glass" folder="interface" size={16} />
          </div>
        </div>
        <SaveSearchButton currentSearch={tagTerm} />
      </div>
      {popularTags.length > 0 && <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{popularTags.map(tag => <button key={tag.name} onClick={() => setTagTerm(tag.name)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>#{tag.name} ({tag.count})</button>)}</div>}
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
        {posts.length === 0 && !loading && <p style={{ textAlign: 'center' }}>No artworks found.</p>}
        <div className="gallery">
          {posts.map(post => {
            const authorName = post.profile?.full_name || post.profile?.username || 'Anonymous';
            return (
              <div key={post.id} className="card">
                <Link href={`/post/${post.id}`}><img src={post.image_url} alt={post.title} /></Link>
                <div className="card-content">
                  <div className="card-title">{post.title}</div>
                  <div className="card-author"><Avatar url={post.profile?.avatar_url} size={24} /><Link href={`/user/${post.user_id}`}>{authorName}</Link></div>
                  <div className="card-actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {/* Просто иконка сердца без счётчика? Не, оставим сердечко + счётчик лайков, глаз убираем */}
                    <LikeIcon filled={false} size={14} />
                    <span>{post.likes_count || 0}</span>
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