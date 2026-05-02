'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  const animated = useRef<Set<Element>>(new Set());

  const animateElement = (el: Element, delay = 0) => {
    if (animated.current.has(el)) return;
    animated.current.add(el);
    animate(el, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay,
      easing: 'easeOutQuad',
    });
  };

  const animateBatch = (elements: Element[], staggerDelay = 80) => {
    if (!elements.length) return;
    animate(elements, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay: stagger(staggerDelay),
      easing: 'easeOutQuad',
    });
    elements.forEach(el => animated.current.add(el));
  };

  // Эффект наведения для карточек (дополнительная плавность)
  const setupHoverEffects = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        animate(card, {
          scale: 1.02,
          duration: 200,
          easing: 'easeOutQuad',
        });
      });
      card.addEventListener('mouseleave', () => {
        animate(card, {
          scale: 1,
          duration: 200,
          easing: 'easeOutQuad',
        });
      });
    });
  };

  useEffect(() => {
    // 1. Анимация заголовка
    const logo = document.querySelector('.logo');
    if (logo) {
      animate(logo, {
        translateX: [-30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
      });
    }

    // 2. Анимация существующих карточек
    const existingCards = Array.from(document.querySelectorAll('.card'));
    if (existingCards.length) {
      animateBatch(existingCards, 100);
    }

    // 3. Эффекты наведения
    setupHoverEffects();

    // 4. Наблюдатель за новыми карточками (бесконечная прокрутка)
    const observer = new MutationObserver(() => {
      const newCards = Array.from(document.querySelectorAll('.card')).filter(
        card => !animated.current.has(card)
      );
      if (newCards.length) {
        animateBatch(newCards);
        setupHoverEffects(); // обновляем эффекты для новых карточек
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}