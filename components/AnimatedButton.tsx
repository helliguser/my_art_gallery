'use client';

import { useRef } from 'react';
import { animate } from 'animejs';

export default function AnimatedButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: 1.05,
        duration: 200,
        easing: 'easeOutQuad',
      });
    }
  };

  const handleMouseLeave = () => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: 1,
        duration: 200,
        easing: 'easeOutQuad',
      });
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </button>
  );
}