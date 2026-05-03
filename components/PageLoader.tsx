'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { animate } from 'animejs';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'flex';

    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); // задержка, чтобы анимация спиннера успела показаться

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    if (loading) {
      animate(loader, {
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
      const spinner = loader.querySelector('.loader-spinner');
      if (spinner) {
        animate(spinner, {
          rotate: [0, 360],
          duration: 800,
          loop: true,
          easing: 'linear',
        });
      }
    } else {
      animate(loader, {
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          if (loader) loader.style.display = 'none';
        },
      });
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      id="page-loader"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'var(--bg)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'background 0.3s',
      }}
    >
      <div className="loader-spinner" />
      <div className="loader-text">Loading</div>
    </div>
  );
}