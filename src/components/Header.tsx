import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onOpenQuoteModal: () => void;
  onOpenApplyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuoteModal, onOpenApplyModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks: { label: string; href: string; isExternal?: boolean }[] = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Training & Job Consultant', href: '/training' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Our Team', href: '/team' },
    { label: 'Contact', href: '/contact' },
  ];

  const marqueeItems = (
    <>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-amber-400">🏆</span>
        <strong className="text-white">200+ Alumni Placed</strong> across Top Tech Companies with 98% Rate.
      </span>
      <span className="text-white/30 shrink-0">•</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-amber-400">🎓</span>
        <strong className="text-white">ISO 9001:2015 Certified</strong> IT Company &amp; Training Institute.
      </span>
      <span className="text-white/30 shrink-0">•</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-amber-400">💼</span>
        <strong className="text-amber-300">Live Enterprise Projects:</strong> Custom Software, Web &amp; Mobile Apps.
      </span>
      <span className="text-white/30 shrink-0">•</span>
      <a href="tel:+918055514368" className="flex items-center gap-2 hover:underline cursor-pointer shrink-0">
        <span className="text-amber-400">📞</span>
        <span>
          <strong className="text-amber-300">Hotline:</strong> +91 8055514368
        </span>
      </a>
      <span className="text-white/30 shrink-0">•</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-amber-400">📍</span>
        <strong className="text-white">Vishrambag, Sangli</strong> — IT Services &amp; Job Academy.
      </span>
      <span className="text-white/30 shrink-0">•</span>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all">
      {/* Top Ticker Bar matching itplconnect.com */}
      <div className="w-full bg-gradient-to-r from-[#00113a] via-[#002366] to-[#00113a] text-white py-1.5 overflow-hidden border-b border-amber-400/20 text-[12px] sm:text-[13px] shadow-sm select-none">
        <div className="marquee-track flex items-center gap-6 whitespace-nowrap">
          {marqueeItems}
          {marqueeItems}
        </div>
      </div>

      {/* Main Navbar Bar matching itplconnect.com (#1b2685, Oswald SVG typography, amber active states) */}
      <div
        className={`bg-[#1b2685] border-b border-white/10 shadow-[0_4px_25px_rgba(0,17,58,0.5)] transition-all duration-200 ${
          scrolled ? 'shadow-[0_6px_30px_rgba(0,17,58,0.7)]' : ''
        }`}
      >
        <div className="w-full px-2.5 min-[360px]:px-3 min-[400px]:px-4 sm:px-6 lg:px-8 xl:px-10 h-16 min-[380px]:h-18 sm:h-20 lg:h-22 flex items-center justify-between gap-1.5 min-[380px]:gap-2 sm:gap-4 max-w-full">
          {/* Brand Logo & Typography */}
          <Link
            to="/"
            className="flex items-center justify-start gap-1.5 min-[340px]:gap-2 min-[400px]:gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0 select-none shrink"
            aria-label="Infoyashonand Technology Home"
          >
            {/* Logo Emblem Icon - Borderless without circular frame */}
            <div className="relative w-8 h-8 min-[340px]:w-9 min-[340px]:h-9 min-[380px]:w-10 min-[380px]:h-10 min-[440px]:w-12 min-[440px]:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
              <img
                src="/company-logo-clean.png"
                alt="Infoyashonand Technology Official Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Vertical White Divider Line */}
            <div className="w-[1.5px] sm:w-[2px] h-6 min-[340px]:h-7 min-[380px]:h-8 min-[440px]:h-9 sm:h-10 bg-white/90 rounded-full shrink-0 shadow-xs mx-0.5 min-[380px]:mx-1" />

            {/* Dual-line Vector Brand Text */}
            <div className="flex items-center min-w-0 shrink">
              <svg
                viewBox="0 0 670 170"
                className="w-auto h-[20px] min-[340px]:h-[22px] min-[380px]:h-[26px] min-[440px]:h-[30px] sm:h-[38px] lg:h-[44px] max-w-full select-none"
                style={{ overflow: 'visible' }}
              >
                <text
                  x="0"
                  y="90"
                  className="fill-white group-hover:fill-amber-300 transition-colors duration-200"
                  fontFamily="'Oswald', sans-serif"
                  fontWeight="700"
                  fontSize="102"
                  textLength="670"
                  lengthAdjust="spacing"
                >
                  INFOYASHONAND
                </text>
                <text
                  x="0"
                  y="162"
                  className="fill-white/95"
                  fontFamily="'Oswald', sans-serif"
                  fontWeight="700"
                  fontSize="64"
                  textLength="670"
                  lengthAdjust="spacing"
                >
                  TECHNOLOGY PVT. LTD.
                </text>
              </svg>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const linkClass = `px-3.5 py-2 rounded-full text-[13px] xl:text-[14px] font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-amber-300 bg-white/15 font-bold shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`;

              if (link.isExternal) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={linkClass}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 min-[380px]:gap-2 sm:gap-2.5 shrink-0">
            {/* Apply Now Action Button (Amber / Gold CTA) */}
            <button
              type="button"
              onClick={onOpenApplyModal}
              className="inline-flex items-center gap-1 min-[380px]:gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-[#00113a] font-extrabold text-[11px] min-[360px]:text-xs sm:text-[13px] px-2.5 min-[360px]:px-3 min-[400px]:px-4 sm:px-4.5 py-1.5 min-[360px]:py-2 sm:py-2.5 rounded-full shadow-md shadow-amber-400/25 hover:shadow-lg hover:shadow-amber-400/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Apply Now</span>
              <span className="material-symbols-outlined text-[15px] sm:text-base font-bold">how_to_reg</span>
            </button>

            {/* Quote Action Button (#EC1D24 Red CTA) */}
            <button
              type="button"
              onClick={onOpenQuoteModal}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#EC1D24] hover:bg-[#d0151b] text-white font-bold text-xs sm:text-[13px] px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full shadow-md shadow-[#EC1D24]/30 hover:shadow-lg hover:shadow-[#EC1D24]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Get Free Quote</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center p-1.5 min-[360px]:p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="22px" height="22px" className="min-[360px]:w-6 min-[360px]:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="fixed top-0 right-0 w-[80%] max-w-[320px] h-full bg-[#00113a] text-white shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-white/10">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1b2685]">
              <div className="flex items-center gap-2">
                <div className="h-9 w-auto flex items-center justify-center">
                  <img src="/company-logo-clean.png" alt="Logo" className="h-full w-auto object-contain" />
                </div>
                <span className="font-bold text-sm tracking-wider uppercase text-amber-300">
                  Infoyashonand
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                aria-label="Close menu"
              >
                <svg width="22px" height="22px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links list */}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const linkClass = `block py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/15 text-amber-300 font-bold border-l-4 border-amber-400'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`;

                if (link.isExternal) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className={linkClass}
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={linkClass}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenApplyModal?.();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#00113a] shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Apply Now</span>
                  <span className="material-symbols-outlined text-sm font-bold">how_to_reg</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuoteModal();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#EC1D24] hover:bg-[#d0151b] text-white shadow-lg shadow-[#EC1D24]/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Get Free Quote</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>

                <div className="mt-4 text-center text-xs text-slate-400">
                  <p>Vishrambag, Sangli</p>
                  <p className="text-amber-300 mt-1 font-semibold">+91 8055514368</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
