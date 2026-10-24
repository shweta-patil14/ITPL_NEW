import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBannerModalProps {
  onOpenApplyModal: () => void;
}

export const AnnouncementBannerModal: React.FC<AnnouncementBannerModalProps> = ({ onOpenApplyModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show banner after 800ms
    const timerShow = setTimeout(() => {
      setIsOpen(true);
    }, 800);

    return () => clearTimeout(timerShow);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Progress bar for 8 seconds
    const stepDuration = 80;
    const totalDuration = 8000;
    const decrement = (stepDuration / totalDuration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setIsOpen(false);
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/919146835824?text=${encodeURIComponent(
    'Hello Infoyashonand Team, I saw the Admission Open announcement and would like more details on the courses & internships.'
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#00113a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative max-w-lg w-full rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,17,58,0.7)] border border-white/20 bg-[#00113a] my-auto animate-in zoom-in-95 duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 border-2 border-white/40"
          aria-label="Close banner"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative cursor-pointer group"
          title="Click to inquire on WhatsApp"
        >
          <img
            src="/assets/Welcomeimage.png"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('Welcomeimage.png')) {
                target.src = '/assets/Welcome image.png';
              }
            }}
            alt="Infoyashonand Technology - Courses & Internship Admission Banner"
            className="w-full h-auto object-contain block group-hover:opacity-95 transition-opacity"
          />
        </a>

        {/* Action bar under image */}
        <div className="p-4 bg-[#00174d] border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Admissions Open 2026
            </span>
            <span className="text-xs text-white font-semibold">
              Limited seats in each cohort
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenApplyModal();
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#00113a] text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Apply Now
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
