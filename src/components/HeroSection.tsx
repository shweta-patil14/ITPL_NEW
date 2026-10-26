import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  onInstantSubmit?: (scope: string, contact: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reveal content smoothly on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 py-16 sm:py-28 lg:py-36 border-b border-slate-800 flex items-center justify-center min-h-[70vh] sm:min-h-[85vh]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/hero-bg.png"
          alt="Hero Background"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center brightness-125 contrast-105 saturate-110"
        />
      </div>

      {/* Light Overlay: Soft subtle gradient layer so image remains bright while preserving text contrast */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isVisible ? 'bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/50' : 'bg-slate-950/20'
        }`}
      ></div>

      {/* Decorative corner stitch markers */}
      <span className="absolute top-4 left-6 text-white/40 font-mono-tech text-sm select-none z-10">+</span>
      <span className="absolute top-4 right-6 text-white/40 font-mono-tech text-sm select-none z-10">+</span>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 z-10 text-center flex flex-col items-center">
        {/* Top pill — Staggered entrance */}
        <div
          className={`transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          <div className="pill-bounce cursor-default inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl sm:rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-white mb-6 drop-shadow-md flex-wrap justify-center">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span>SANGLI, MAHARASHTRA</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-bold">ISO 9001:2015 CERTIFIED</span>
            <span className="text-white/40">•</span>
            <span className="text-cyan-300 font-bold">INFOYASHONAND TECHNOLOGY</span>
          </div>
        </div>

        {/* Main Tagline: Down-to-up cinematic entrance with 5-second timing */}
        <div
          className={`transform transition-all duration-1000 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible
              ? 'opacity-100 translate-y-0 filter blur-none scale-100'
              : 'opacity-0 translate-y-14 filter blur-sm scale-[0.98] pointer-events-none'
          }`}
        >
          <h1
            style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
            className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.15] mb-4 sm:mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          >
            BUILDING NEXT-GEN SOFTWARE.{' '}
            <span
              style={{ color: '#FFB800' }}
              className="text-[#FFB800] drop-shadow-[0_4px_20px_rgba(255,184,0,0.45)]"
            >
              LAUNCHING TECH CAREERS.
            </span>
          </h1>
        </div>

        {/* Supporting Sub-headline: Down-to-up smooth entrance */}
        <div
          className={`transform transition-all duration-1000 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible
              ? 'opacity-100 translate-y-0 filter blur-none'
              : 'opacity-0 translate-y-12 filter blur-sm pointer-events-none'
          }`}
        >
          <p className="text-xs min-[360px]:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-100 font-semibold max-w-3xl leading-relaxed drop-shadow-[0_3px_14px_rgba(0,0,0,0.9)]">
            Partner with Sangli’s premier IT firm for scalable enterprise solutions, or join our ISO-certified academy to become a job-ready developer with 100% placement support.
          </p>
        </div>
      </div>
    </section>
  );
};
