import React, { useState, useEffect, useRef } from 'react';
import { FEATURED_SERVICES, ALL_SERVICES } from '../data';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onSelectServiceInquiry: (serviceTitle: string) => void;
  searchQuery?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceInquiry,
  searchQuery,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isFeaturedVisible, setIsFeaturedVisible] = useState(false);
  const featuredSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFeaturedVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    if (featuredSectionRef.current) {
      observer.observe(featuredSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filtered = ALL_SERVICES.filter((s) => {
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    const matchesSearch = !searchQuery || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'development', label: 'Development' },
    { id: 'marketing', label: 'Marketing & SEO' },
    { id: 'telecom', label: 'APIs & Telecom' },
    { id: 'consulting', label: 'Training & Consulting' },
  ];

  return (
    <div id="services">
      {/* Featured Services */}
      <section
        ref={featuredSectionRef}
        className="relative w-full py-12 sm:py-16 lg:py-24 bg-[#F8FAFF] border-b border-indigo-100/80 overflow-hidden"
      >
        {/* Subtle glowing ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-200/25 via-purple-150/15 to-sky-200/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 hero-dot-grid opacity-30 pointer-events-none" />

        {/* Decorative corner stitch markers */}
        <span className="absolute top-6 left-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute top-6 right-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute bottom-6 left-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute bottom-6 right-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* Section Header with smooth entrance */}
          <div
            className={`text-center max-w-3xl mx-auto mb-10 sm:mb-14 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isFeaturedVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-6 filter blur-xs'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/90 text-xs font-extrabold text-[#232884] shadow-xs backdrop-blur-md mb-3 pill-bounce cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D48C8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#232884]"></span>
              </span>
              <span className="uppercase tracking-widest text-[11px]">Services</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#111A3A] tracking-tight mt-1">
              FEATURED <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">SERVICES</span>
            </h2>
            <p className="text-slate-600 mt-2 text-xs sm:text-base leading-relaxed font-medium">
              Specialized end-to-end technology solutions crafted for modern business acceleration.
            </p>
          </div>

          {/* Cards Grid with staggered entrance & hover animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {FEATURED_SERVICES.map((service: ServiceItem, index: number) => (
              <div
                key={service.id}
                style={{
                  animationDelay: isFeaturedVisible ? `${index * 100}ms` : undefined,
                  transitionDelay: `${index * 70}ms`,
                }}
                className={`itpl-card group p-5 sm:p-7 flex flex-col justify-between h-full relative cursor-pointer ${
                  isFeaturedVisible ? 'animate-bounce-in opacity-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
                }`}
              >
                {/* 1. Shimmer light sweep across the card on hover */}
                <div className="itpl-card-shimmer" />

                {/* 2. Expanding top accent border line on hover */}
                <div className="itpl-card-accent-line" />

                <div>
                  {/* 3. Icon box with smooth scale, rotation, and gradient shift on hover */}
                  <div className="itpl-icon-box h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-indigo-200/80 flex items-center justify-center text-[#232884] mb-4 sm:mb-5 group-hover:bg-gradient-to-r group-hover:from-[#232884] group-hover:to-[#3D48C8] group-hover:text-white group-hover:border-[#232884] shadow-xs overflow-hidden p-2">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-[#111A3A] group-hover:text-[#232884] transition-colors duration-300 mb-2 uppercase">
                    {service.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-800 transition-colors duration-300 leading-relaxed mb-4 sm:mb-5 line-clamp-5"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {service.desc}
                  </p>
                  {service.features && (
                    <div className="flex flex-wrap gap-1.5 mb-5 sm:mb-6 pt-3 border-t border-indigo-100/80">
                      {service.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-[11px] font-semibold bg-slate-50/80 text-[#111A3A] px-2.5 py-1 rounded-lg border border-slate-200/70 flex items-center gap-1.5 group-hover:border-indigo-200 group-hover:bg-indigo-50/50 group-hover:translate-x-1 transition-all duration-300 shadow-2xs"
                        >
                          <span className="text-[#3D48C8] font-bold text-[10px]">✓</span>
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectServiceInquiry(service.title)}
                  className="inline-flex items-center justify-between w-full pt-3.5 sm:pt-4 mt-auto border-t border-slate-100 group/btn text-xs font-bold text-[#232884] group-hover:text-[#3D48C8] cursor-pointer transition-colors text-left"
                >
                  <span className="font-extrabold tracking-wide">Inquire Now</span>
                  <span className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#232884] group-hover:text-white group-hover:border-[#232884] group-hover:translate-x-1.5 flex items-center justify-center transition-all duration-300 shadow-xs">
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 10 Services Grid */}
      <section className="w-full py-12 sm:py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 reveal-up">
            <span className="pill-bounce inline-block text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 cursor-default">
              SERVICES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2">
              CHECK OUR <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">SERVICES</span>
            </h2>
            <p className="text-slate-600 mt-2 text-xs sm:text-base">
              Comprehensive digital, software, cloud, and telecommunication solutions designed for growth.
            </p>

            {/* Filter Pills with Horizontal Touch Scroll on Mobile */}
            <div className="flex items-center justify-start sm:justify-center gap-2 mt-6 overflow-x-auto no-scrollbar py-2 px-1 max-w-full flex-nowrap sm:flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`btn-bounce shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    filterCategory === cat.id
                      ? 'bg-[#232884] text-white shadow-md shadow-[#232884]/20 scale-105 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectServiceInquiry(item.title)}
                style={{ transitionDelay: `${idx * 40}ms` }}
                className="bounce-card mobile-float-card stitch-card hover-lift-card reveal-up p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:bg-white hover:border-[#3b82f6]/40 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-2">
                  <div className="bounce-card-icon h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#232884] shrink-0 border border-blue-100 group-hover:bg-[#232884] group-hover:text-white transition-all shadow-xs overflow-hidden p-1.5">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined">{item.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#0E1538] group-hover:text-[#232884] transition-colors uppercase">
                        {item.title}
                      </h4>
                      <span className="bounce-card-arrow material-symbols-outlined text-slate-400 group-hover:text-[#232884] text-sm opacity-0 group-hover:opacity-100 transition-all">
                        arrow_forward
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
