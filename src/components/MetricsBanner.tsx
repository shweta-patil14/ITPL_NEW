import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  start: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  suffix = '+',
  duration = 2000,
  delay = 0,
  start,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return;
    }

    let animationFrameId: number;
    let timerId: ReturnType<typeof setTimeout>;

    // Easing function: smooth deceleration (ease-out cubic / expo hybrid)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    timerId = setTimeout(() => {
      let startTime: number | null = null;

      const step = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        const currentVal = Math.round(eased * end);
        setCount(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timerId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [start, end, duration, delay]);

  return (
    <>
      {count.toLocaleString('en-US')}
      {suffix}
    </>
  );
};

export const MetricsBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Immediate check if element is already in the viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { target: 3019, suffix: '+', label: 'Happy Clients', dark: false },
    { target: 300, suffix: '+', label: 'Approved Projects', dark: false },
    { target: 160, suffix: '+', label: 'Certified Professionals', dark: false },
    { target: 68, suffix: '+', label: 'Ongoing Projects', dark: false },
  ];

  return (
    <section ref={sectionRef} className="w-full py-10 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`reveal-up delay-${(idx + 1) * 100} bounce-card mobile-float-card hover-lift-card sheen-glow p-3.5 sm:p-5 rounded-2xl text-center group cursor-default transition-all duration-300 ${
                s.dark
                  ? 'bg-gradient-to-br from-[#232884] via-[#1E2270] to-[#141759] text-white shadow-md shadow-[#232884]/25 hover:shadow-[0_20px_35px_-8px_rgba(35,40,132,0.4)]'
                  : 'bg-[#FAF8FF] border border-[#232884]/15 text-[#0E1538] hover:border-[#3D48C8]/50'
              }`}
            >
              <div
                className={`text-2xl min-[380px]:text-3xl sm:text-4xl font-black tracking-tight tabular-nums group-hover:scale-108 transition-transform duration-300 ${
                  s.dark ? 'text-white' : 'text-[#0E1538] group-hover:text-[#232884]'
                }`}
              >
                <AnimatedCounter
                  end={s.target}
                  suffix={s.suffix}
                  duration={1800}
                  delay={idx * 75}
                  start={isVisible}
                />
              </div>
              <div
                className={`text-[11px] sm:text-xs font-bold mt-1 uppercase tracking-wider ${
                  s.dark ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

