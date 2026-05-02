'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  const animated = useRef<Set<Element>>(new Set());

  const animateElement = (el: Element) => {
    if (animated.current.has(el)) return;
    animated.current.add(el);
    animate(el, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuad',
    });
  };

  const animateBatch = (elements: Element[], delayStagger = 50) => {
    if (!elements.length) return;
    animate(elements, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(delayStagger),
      easing: 'easeOutQuad',
    });
    elements.forEach(el => animated.current.add(el));
  };

  useEffect(() => {
    // 1. Анимация уже существующих карточек
    const existingCards = Array.from(document.querySelectorAll('.card'));
    console.log(`[Animations] Found ${existingCards.length} existing cards`);
    if (existingCards.length) {
      animateBatch(existingCards, 100);
    }

    // 2. Наблюдатель за появлением новых карточек (для бесконечного скролла)
    const observer = new MutationObserver(() => {
      const newCards = Array.from(document.querySelectorAll('.card')).filter(
        card => !animated.current.has(card)
      );
      if (newCards.length) {
        console.log(`[Animations] New cards detected: ${newCards.length}`);
        animateBatch(newCards);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}