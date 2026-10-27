import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface BookletFloatingButtonProps {
  onNotify?: (message: string) => void;
}

export const BookletFloatingButton: React.FC<BookletFloatingButtonProps> = ({ onNotify }) => {
  const [isOpening, setIsOpening] = useState(false);
  const location = useLocation();

  // Visible ONLY on public customer-facing pages (Hidden on Admin Panels, Login, and Internal Portals)
  const isAdminOrPortalRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/candidate-dashboard') ||
    location.pathname.startsWith('/offer-letter') ||
    location.pathname.startsWith('/bonafide');

  if (isAdminOrPortalRoute) return null;

  const pdfUrl = '/INFOYASHONAND%20BOOKLET_20260117_161247_0000.pdf';

  const handleOpenPdf = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOpening) return;

    setIsOpening(true);

    // 1. Trigger micro celebration particles
    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { x: 0.92, y: 0.9 },
        colors: ['#3D48C8', '#F59E0B', '#10B981', '#ffffff'],
      });
    } catch {
      // ignore
    }

    // 2. Notify user via toast
    if (onNotify) {
      onNotify('Opening Infoyashonand Corporate Booklet (PDF)...');
    }

    // 3. Open PDF in a new tab smoothly after brief spring click animation
    setTimeout(() => {
      const opened = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        // Fallback for browsers with aggressive popup blockers
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      }
      setIsOpening(false);
    }, 450);
  };

  return (
    <div
      className="booklet-corner-button group fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 transition-all duration-300 pointer-events-auto"
      style={{ willChange: 'transform' }}
    >
      {/* Outer Halo Pulsing Ring */}
      <div
        className="absolute inset-0 rounded-full bg-amber-400/35 blur-md animate-booklet-halo pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Action Button (Only Logo, No Text) */}
      <button
        type="button"
        onClick={handleOpenPdf}
        title="Open & Download Infoyashonand Company Booklet (PDF)"
        aria-label="Open Infoyashonand Company Booklet PDF"
        className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-amber-400/90 shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden tap-feedback active:scale-95 ${
          isOpening
            ? 'scale-110 ring-4 ring-amber-400/60'
            : 'animate-booklet-float hover:scale-110 hover:shadow-indigo-500/30'
        }`}
      >
        {/* Continuous Real-time Shimmer Light Sweep */}
        <div
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none animate-enquiry-shimmer"
          aria-hidden="true"
        />

        {/* Dedicated Booklet Logo (Replaced Company Seal) */}
        <div className="relative w-full h-full flex items-center justify-center shrink-0 p-0.5">
          <img
            src="/booklet-logo.svg"
            alt="Infoyashonand Corporate Booklet PDF"
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${
              isOpening ? 'animate-booklet-opening' : 'animate-booklet-rock'
            }`}
          />
        </div>

        {/* Subtle live radar ping beacon */}
        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      </button>

      {/* Smooth Hover Tooltip (Appears above on hover, no text in button itself) */}
      <div
        className="pointer-events-none absolute bottom-full right-0 mb-2.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/80"
        role="tooltip"
      >
        <div className="flex items-center gap-1.5">
          <span>Company Booklet</span>
          <span className="px-1 py-0.2 rounded bg-rose-600 text-[9px] font-black uppercase text-white">PDF</span>
        </div>
      </div>
    </div>
  );
};
