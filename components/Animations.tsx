'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';

export default function Animations() {
  useEffect(() => {
    // Анимация появления карточек при загрузке
    const cards = document.querySelectorAll('.card');
    if (cards.length) {
      animate(cards, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(100), // автоматическая задержка между элементами
        easing: 'easeOutQuad',
      });
    }

    // Анимация при скролле (для карточек, которые не попали в первый экран)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target, {
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 600,
              easing: 'easeOutQuad',
            });
            observer.unobserve(entry.target); // анимируем только один раз
          }
        });
      },
      { threshold: 0.2 }
    );

    const allCards = document.querySelectorAll('.card');
    allCards.forEach((card) => observer.observe(card));

    // Очистка при размонтировании
    return () => observer.disconnect();
  }, []);

  return null;
}