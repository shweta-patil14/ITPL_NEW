import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { MetricsBanner } from '../components/MetricsBanner';
import { ValuableClientsSection } from '../components/ValuableClientsSection';
import { HOME_FEATURED_SERVICES, PORTFOLIO_PROJECTS } from '../data';
import { CourseItem, ProjectItem } from '../types';

interface HomePageProps {
  onInstantSubmit: (scope: string, contact: string) => void;
  onOpenSyllabusModal?: (course: CourseItem) => void;
  onSelectProject: (project: ProjectItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onInstantSubmit,
  onOpenSyllabusModal,
  onSelectProject,
}) => {
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const servicesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsServicesVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    if (servicesSectionRef.current) {
      observer.observe(servicesSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Section with Live Operational Status & Quick Scope */}
      <HeroSection onInstantSubmit={onInstantSubmit} />

      {/* 2. Enterprise Metrics & Trust Proof Banner */}
      <MetricsBanner />


      {/* 4. Core Capabilities (Featured Services with Stitch Design) */}
      <section
        ref={servicesSectionRef}
        className="relative w-full py-12 sm:py-16 lg:py-24 bg-[#F8FAFF] border-b border-indigo-100/80 overflow-hidden"
        id="services"
      >
        {/* Ambient glowing background blur elements */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-200/25 via-purple-150/15 to-sky-200/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 hero-dot-grid opacity-30 pointer-events-none" />

        {/* Decorative corner stitch markers */}
        <span className="absolute top-6 left-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute top-6 right-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute bottom-6 left-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute bottom-6 right-8 text-indigo-300/50 font-mono-tech text-sm select-none pointer-events-none">+</span>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isServicesVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-6 filter blur-xs'
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/90 text-[11px] sm:text-xs font-extrabold text-[#232884] shadow-xs backdrop-blur-md mb-3 pill-bounce cursor-default max-w-full flex-wrap sm:flex-nowrap">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D48C8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#232884]"></span>
                </span>
                <span className="font-mono-tech text-[10px] text-[#3D48C8] shrink-0">[CAPABILITIES // FULL LIFECYCLE]</span>
                <span>End-to-End Delivery</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#111A3A] tracking-tight">
                FEATURED <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">IT SERVICES</span>
              </h2>
              <p className="text-slate-600 mt-2 text-xs sm:text-base max-w-2xl leading-relaxed font-medium">
                We design, build, deploy, and scale high-reliability digital software ecosystems for modern organizations.
              </p>
            </div>
            <Link
              to="/services"
              className="btn-bounce group inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#232884] bg-white hover:bg-gradient-to-r hover:from-white hover:to-indigo-50/80 border border-indigo-200/90 px-5 py-3 rounded-2xl transition-all shrink-0 w-full sm:w-auto shadow-sm hover:shadow-md hover:border-[#3D48C8]/60 cursor-pointer"
            >
              <span>Explore All 10+ Services</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {HOME_FEATURED_SERVICES.map((service, index) => (
              <div
                key={service.id}
                style={{
                  animationDelay: isServicesVisible ? `${index * 100}ms` : undefined,
                  transitionDelay: `${index * 70}ms`,
                }}
                className={`itpl-card group p-5 sm:p-7 flex flex-col justify-between h-full relative cursor-pointer ${
                  isServicesVisible ? 'animate-bounce-in opacity-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
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
                    <div className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6 pt-3 border-t border-indigo-100/80">
                      {service.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#111A3A] bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70 group-hover:bg-indigo-50/50 group-hover:border-indigo-200 group-hover:translate-x-1.5 transition-all duration-300 shadow-2xs"
                        >
                          <span className="text-[#3D48C8] font-bold">✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-between w-full pt-3.5 sm:pt-4 mt-auto border-t border-slate-100 group/btn text-xs font-extrabold text-[#232884] group-hover:text-[#3D48C8] cursor-pointer transition-colors"
                >
                  <span className="tracking-wide">Learn architecture &amp; pricing</span>
                  <span className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#232884] group-hover:text-white group-hover:border-[#232884] group-hover:translate-x-1.5 flex items-center justify-center transition-all duration-300 shadow-xs">
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Our Valuable Clients (From infoyashonand.com) */}
      <ValuableClientsSection />

      {/* 5. Successfully Completed Projects Showcase (Featured Portfolio) */}
      <section className="relative w-full py-16 lg:py-24 bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] border-b border-indigo-200/90 overflow-hidden" id="portfolio-featured">
        {/* Subtle glowing ambient background orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-300/35 via-purple-200/30 to-sky-300/30 blur-[110px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />

        {/* Decorative corner stitch markers */}
        <span className="absolute top-6 left-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>
        <span className="absolute top-6 right-8 text-indigo-400/60 font-mono-tech text-sm select-none pointer-events-none">+</span>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="reveal-up flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/90 text-[11px] sm:text-xs font-extrabold text-[#232884] shadow-xs backdrop-blur-md mb-3 pill-bounce cursor-default max-w-full flex-wrap sm:flex-nowrap">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D48C8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#232884]"></span>
                </span>
                <span className="font-mono-tech text-[10px] text-[#3D48C8] shrink-0">[PRODUCTION PORTFOLIO]</span>
                <span>Successfully Delivered Systems</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight mt-1">
                CLIENT SUCCESS <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">CASE STUDIES</span>
              </h2>
              <p className="text-slate-700 mt-2 text-xs sm:text-base max-w-2xl leading-relaxed font-semibold">
                Real software platforms and mobile applications engineered and published by Infoyashonand Technology.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="btn-bounce group inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#232884] hover:bg-[#141759] px-6 py-3.5 rounded-2xl transition-all shrink-0 w-full sm:w-auto shadow-md shadow-[#232884]/20 cursor-pointer"
            >
              <span>View All Completed Projects</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {PORTFOLIO_PROJECTS.slice(0, 3).map((project: ProjectItem, pIdx: number) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`reveal-up delay-${(pIdx + 1) * 100} itpl-card hover-lift-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between cursor-pointer group relative overflow-hidden`}
              >
                {/* 1. Shimmer light sweep across the card on hover */}
                <div className="itpl-card-shimmer" />

                {/* 2. Expanding top accent border line on hover */}
                <div className="itpl-card-accent-line" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="pill-bounce font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#3D48C8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {project.badge || project.category}
                    </span>
                    {project.keyMetrics && (
                      <span className="pill-bounce font-mono-tech text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {project.keyMetrics[0]}
                      </span>
                    )}
                  </div>

                  {/* Product Graphic / Screenshot Preview */}
                  {project.image ? (
                    <div className="h-32 sm:h-36 w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:scale-102 transition-transform duration-300 overflow-hidden relative shadow-2xs">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="max-h-24 sm:max-h-28 max-w-[85%] object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-32 sm:h-36 w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:scale-102 transition-transform duration-300 overflow-hidden relative shadow-2xs">
                      <span className={`material-symbols-outlined text-4xl ${project.color}`}>
                        {project.icon}
                      </span>
                    </div>
                  )}

                  {/* Title & Category */}
                  <div className="mb-3">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors uppercase">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {project.subCategory || project.category}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {project.desc}
                  </p>

                  {project.techStack && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="font-mono-tech text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50/70"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#232884] group-hover:text-[#3D48C8] transition-colors">
                  <span>Explore Case Study &amp; Architecture</span>
                  <span className="bounce-card-arrow material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. High-Impact Call to Action Banner */}
      <section className="w-full py-14 sm:py-16 lg:py-20 bg-gradient-to-r from-[#232884] via-[#141759] to-[#0E1538] text-white relative overflow-hidden">
        <div className="reveal-up max-w-7xl mx-auto px-4 sm:px-8 text-center relative z-10">
          <span className="pill-bounce font-mono-tech text-[11px] sm:text-xs text-cyan-300 uppercase tracking-widest px-3.5 py-1 rounded-full bg-white/10 border border-white/20 mb-3 inline-block">
            READY TO ACCELERATE YOUR TECH?
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 mb-4 text-white">
            Let&apos;s Build Your Custom Software Solution
          </h2>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            From architecture design to production rollout, partner with Maharashtra&apos;s trusted software development firm.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link
              to="/contact"
              className="btn-bounce w-full sm:w-auto text-center justify-center px-6 sm:px-8 py-3.5 rounded-xl bg-white text-[#232884] font-bold text-xs sm:text-sm shadow-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Book Architecture Discovery Call
            </Link>
            <a
              href="https://wa.me/918055514368?text=Hello%20Infoyashonand,%20I%20would%20like%20to%20discuss%20a%20new%20project%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bounce animate-btn-pulse-glow w-full sm:w-auto text-center justify-center px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <img
                src="/live_assets/whatsapp-icon.png"
                alt="WhatsApp"
                className="w-5 h-5 object-contain shrink-0 animate-icon-wiggle"
              />
              <span>Direct WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
