import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollAnimationManager
 * Global high-performance scroll animation observer for desktop and mobile.
 * Observes all elements with .scroll-reveal, .reveal-up, .reveal-left, .reveal-right,
 * .reveal-zoom, as well as automatically decorating major page sections and cards.
 */
export const ScrollAnimationManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let activeObserver: IntersectionObserver | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const setupObserver = () => {
      const selector = '.scroll-reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .itpl-card, .stitch-card, .bounce-card, .glass-card, [data-reveal]';
      const targets = document.querySelectorAll<HTMLElement>(selector);

      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-revealed'));
        return null;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add('is-revealed');
              observer.unobserve(el);
            }
          });
        },
        {
          root: null,
          threshold: 0.05,
          rootMargin: '50px 0px 50px 0px',
        }
      );

      targets.forEach((el) => {
        observer.observe(el);
      });

      return observer;
    };

    const timer = setTimeout(() => {
      activeObserver = setupObserver();

      // Safety timeout: ensure everything becomes visible after 800ms
      safetyTimer = setTimeout(() => {
        const unrevealed = document.querySelectorAll<HTMLElement>('.scroll-reveal:not(.is-revealed), .reveal-up:not(.is-revealed)');
        unrevealed.forEach((el) => el.classList.add('is-revealed'));
      }, 800);
    }, 40);

    return () => {
      clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (activeObserver) activeObserver.disconnect();
    };
  }, [location.pathname]);

  return null;
};
