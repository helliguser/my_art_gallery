'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  useEffect(() => {
    const cards = document.querySelectorAll('.card');
    if (cards.length) {
      animate(cards, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 500,
        delay: stagger(80),
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return null;
}