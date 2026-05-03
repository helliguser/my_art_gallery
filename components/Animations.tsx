'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  const animated = useRef<Set<Element>>(new Set());

  const animateCard = (card: Element) => {
    if (animated.current.has(card)) return;
    animated.current.add(card);
    animate(card, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad',
    });
  };

  const animateBatch = (cards: Element[]) => {
    if (!cards.length) return;
    animate(cards, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(80),
      easing: 'easeOutQuad',
    });
    cards.forEach(card => animated.current.add(card));
  };

  useEffect(() => {
    // Анимируем все существующие карточки
    const existingCards = Array.from(document.querySelectorAll('.card'));
    if (existingCards.length) animateBatch(existingCards);

    // Наблюдаем за появлением новых карточек
    const observer = new MutationObserver(() => {
      const newCards = Array.from(document.querySelectorAll('.card')).filter(
        card => !animated.current.has(card)
      );
      if (newCards.length) {
        console.log(`[Animations] New cards found: ${newCards.length}`);
        animateBatch(newCards);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}