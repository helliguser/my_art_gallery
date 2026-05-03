'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { animate } from 'animejs';

export default function InfiniteScroll({ onLoadMore, hasMore, loading, children }: any) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
  const loaded = useRef(false);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && hasMore && !loading && !loaded.current) {
      loaded.current = true;
      onLoadMore().finally(() => { loaded.current = false; });
    }
  }, [inView, hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (loading && spinnerRef.current) {
      animate(spinnerRef.current, { rotate: [0, 360], duration: 800, loop: true, easing: 'linear' });
    }
  }, [loading]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={ref} style={{ textAlign: 'center', padding: '2rem' }}>
          {loading && <div ref={spinnerRef} className="loader-spinner-small" />}
        </div>
      )}
    </>
  );
}