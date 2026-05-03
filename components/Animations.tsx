'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  const animated = useRef<Set<Element>>(new Set());

  const animateBatch = (cards: Element[]) => {
    if (!cards.length) return;
    animate(cards, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(80),
      easing: 'easeOutQuad',
    });
    cards.forEach(card => animated.current.add(card));
  };

  useEffect(() => {
    // Анимация существующих карточек
    const existing = Array.from(document.querySelectorAll('.card'));
    if (existing.length) animateBatch(existing);

    // Анимация логотипа
    const logo = document.querySelector('.logo');
    if (logo) {
      animate(logo, {
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'spring(1.2, 80, 10, 0)',
      });
    }

    // Наблюдатель за новыми карточками (бесконечный скролл)
    const observer = new MutationObserver(() => {
      const newCards = Array.from(document.querySelectorAll('.card')).filter(c => !animated.current.has(c));
      if (newCards.length) animateBatch(newCards);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}