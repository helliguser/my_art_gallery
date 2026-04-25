'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

type Props = {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  children: React.ReactNode;
};

export default function InfiniteScroll({ onLoadMore, hasMore, loading, children }: Props) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadedRef.current) {
      loadedRef.current = true;
      onLoadMore().finally(() => {
        loadedRef.current = false;
      });
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={ref} style={{ textAlign: 'center', padding: '2rem' }}>
          {loading && <div>Loading more...</div>}
        </div>
      )}
    </>
  );
}