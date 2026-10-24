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
    // Check for prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Select all animatable targets
    const setupObserver = () => {
      const selector = '.scroll-reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .itpl-card, .stitch-card, .bounce-card, .glass-card, [data-reveal]';
      const targets = document.querySelectorAll<HTMLElement>(selector);

      if (prefersReducedMotion) {
        targets.forEach((el) => el.classList.add('is-revealed'));
        return;
      }

      if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-revealed'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add('is-revealed');
              // Unobserve once revealed to keep performance 60fps
              observer.unobserve(el);
            }
          });
        },
        {
          root: null,
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      targets.forEach((el) => {
        // If already in viewport on load, reveal immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 30) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });

      return observer;
    };

    // Slight delay to allow DOM render after route transition
    const timer = setTimeout(() => {
      const observer = setupObserver();

      // Safety timeout: ensure everything becomes visible after 1s so no content is ever stuck hidden
      const safetyTimer = setTimeout(() => {
        const unrevealed = document.querySelectorAll<HTMLElement>('.scroll-reveal:not(.is-revealed), .reveal-up:not(.is-revealed)');
        unrevealed.forEach((el) => el.classList.add('is-revealed'));
      }, 1000);

      return () => {
        if (observer) observer.disconnect();
        clearTimeout(safetyTimer);
      };
    }, 60);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};
