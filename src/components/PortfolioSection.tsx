import React, { useState, useEffect, useRef } from 'react';
import { PORTFOLIO_PROJECTS } from '../data';
import { ProjectItem } from '../types';

interface PortfolioSectionProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ onSelectProject }) => {
  const [filter, setFilter] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    { id: 'All', label: 'All Apps' },
    { id: 'Business', label: 'Enterprise & Business' },
    { id: 'Education', label: 'EdTech & Learning' },
    { id: 'Finance', label: 'Finance & Taxation' },
    { id: 'Industrial', label: 'Security & IoT' },
  ];

  const filteredProjects = filter === 'All'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter((p) => p.category === filter);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] border-b border-indigo-200/90 overflow-hidden"
      id="portfolio"
    >
      {/* Subtle glowing ambient background orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-300/35 via-purple-200/30 to-sky-300/30 blur-[110px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />

      {/* Decorative corner stitch markers */}
      <span className="absolute top-6 left-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>
      <span className="absolute top-6 right-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>
      <span className="absolute bottom-6 left-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>
      <span className="absolute bottom-6 right-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-10 sm:mb-12 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-6 filter blur-xs'
          }`}
        >
          <div className="pill-bounce cursor-default inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/90 text-[11px] sm:text-xs font-extrabold text-[#232884] shadow-xs backdrop-blur-md mb-3 max-w-full flex-wrap sm:flex-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D48C8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#232884]"></span>
            </span>
            <span className="font-mono-tech text-[10px] text-[#3D48C8] shrink-0">[PROVEN PRODUCTION SYSTEMS]</span>
            <span>Successfully Completed Projects</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight mt-1">
            ENGINEERED FOR IMPACT: <br />
            <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">
              OUR CLIENT PORTFOLIO
            </span>
          </h2>
          <p className="text-slate-700 mt-2 text-xs sm:text-base leading-relaxed font-semibold">
            Explore live production mobile applications and enterprise solutions engineered and published by Infoyashonand Technology on the Google Play Store.
          </p>

          {/* Filter Pills with Horizontal Touch Scroll on Mobile */}
          <div className="flex items-center justify-start sm:justify-center gap-2 mt-6 sm:mt-7 overflow-x-auto no-scrollbar py-2 px-1 max-w-full flex-nowrap sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`btn-bounce shrink-0 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filter === cat.id
                    ? 'bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] text-white shadow-md shadow-[#232884]/25 scale-102 font-extrabold'
                    : 'bg-white border border-indigo-200/90 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-[#0E1538] shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-10 sm:mb-14">
          {filteredProjects.map((p: ProjectItem, index: number) => (
            <div
              key={p.id}
              style={{
                animationDelay: isVisible ? `${index * 90}ms` : undefined,
                transitionDelay: `${index * 60}ms`,
              }}
              onClick={() => onSelectProject(p)}
              className={`itpl-card hover-lift-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isVisible ? 'animate-bounce-in opacity-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
              }`}
            >
              {/* 1. Shimmer light sweep across the card on hover */}
              <div className="itpl-card-shimmer" />

              {/* 2. Expanding top accent border line on hover */}
              <div className="itpl-card-accent-line" />

              {/* Corner cross accent */}
              <span className="absolute top-3 right-3 font-mono-tech text-[10px] text-slate-300 select-none group-hover:text-[#3D48C8] transition-colors z-20">
                +
              </span>

              <div>
                {/* Top Badge & Metric */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="pill-bounce font-mono-tech text-[10px] font-extrabold uppercase tracking-wider text-[#3D48C8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {p.badge || p.category}
                  </span>
                  {p.keyMetrics && p.keyMetrics.length > 0 && (
                    <span className="pill-bounce font-mono-tech text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {p.keyMetrics[0]}
                    </span>
                  )}
                </div>

                {/* Product Graphic / Screenshot Preview */}
                {p.image ? (
                  <div className="h-32 sm:h-36 w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:scale-102 transition-transform duration-300 overflow-hidden relative shadow-2xs">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-24 sm:max-h-28 max-w-[85%] object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-32 sm:h-36 w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:scale-102 transition-transform duration-300 overflow-hidden relative shadow-2xs">
                    <span className={`material-symbols-outlined text-4xl ${p.color}`}>
                      {p.icon}
                    </span>
                  </div>
                )}

                {/* Title & Category Header */}
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors uppercase">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                    {p.subCategory || p.clientType || p.category}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-5">
                  {p.desc}
                </p>

                {/* Tech Stack Pills */}
                {p.techStack && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono-tech text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50/70"
                      >
                        {tech}
                      </span>
                    ))}
                    {p.techStack.length > 4 && (
                      <span className="font-mono-tech text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                        +{p.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Explore Case Study */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#232884] group-hover:text-[#3D48C8] transition-colors">
                <span>Explore Architecture &amp; Case Study</span>
                <span className="bounce-card-arrow w-7.5 h-7.5 rounded-full bg-blue-50 border border-blue-100 group-hover:bg-[#232884] group-hover:text-white flex items-center justify-center shadow-2xs">
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner: Call to Action */}
        <div className="reveal-up rounded-3xl bg-gradient-to-r from-[#232884] via-[#1E226B] to-[#0E1538] text-white p-8 sm:p-10 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="font-mono-tech text-[11px] text-cyan-300 uppercase tracking-widest font-extrabold">
              BESPOKE IT ENGINEERING // ZERO VENDOR LOCK-IN
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              Have a Project in Mind? Let&apos;s Build It Together.
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Schedule a technical discovery session with our Lead Software Architect to map out your architecture, timeline, and deliverables.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/918055514368?text=Hello%20Infoyashonand,%20I%20am%20interested%20in%20building%20a%20custom%20software%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow animate-btn-pulse-glow px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current shrink-0 animate-icon-wiggle"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>WhatsApp Tech Desk</span>
            </a>
            <a
              href="tel:+918055514368"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base animate-phone-ring">call</span>
              <span>+91 8055514368</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
