'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export default function InfiniteScroll({ onLoadMore, hasMore, loading, children }: any) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
  const loaded = useRef(false);

  useEffect(() => {
    if (inView && hasMore && !loading && !loaded.current) {
      loaded.current = true;
      onLoadMore().finally(() => { loaded.current = false; });
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={ref} style={{ textAlign: 'center', padding: '2rem' }}>
          {loading && <div className="loader-spinner-small" />}
        </div>
      )}
    </>
  );
}