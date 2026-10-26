import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Search,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  X
} from 'lucide-react';
import { itplPrograms, InternshipTrack } from '../data/itplConnectPrograms';
import { TrackDetailsModal } from '../components/itplconnect/TrackDetailsModal';
import { ApplyModal } from '../components/itplconnect/ApplyModal';
import { ApplicationStatusModal } from '../components/itplconnect/ApplicationStatusModal';
import { AnnouncementBannerModal } from '../components/itplconnect/AnnouncementBannerModal';
import { CourseItem } from '../types';

interface TrainingPageProps {
  onOpenSyllabusModal?: (course: CourseItem) => void;
}

// Hook matching itplconnect.com's IntersectionObserver scroll-reveal system
function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// Card entrance reveal wrapper matching itplconnect.com (WC component)
const RevealCard: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      } h-full ${className}`}
    >
      {children}
    </div>
  );
};

// 3D Tilt Track Card component matching itplconnect.com (kC component)
interface InteractiveTrackCardProps {
  track: InternshipTrack;
  isExpanded: boolean;
  onToggleSkills: (e: React.MouseEvent) => void;
  onSelectTrack: () => void;
  onApply: () => void;
}

const InteractiveTrackCard: React.FC<InteractiveTrackCardProps> = ({
  track,
  isExpanded,
  onToggleSkills,
  onSelectTrack,
  onApply,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0, sheenX: 50, sheenY: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    const sheenX = (x / rect.width) * 100;
    const sheenY = (y / rect.height) * 100;
    setTilt({ x: rotateX, y: rotateY, sheenX, sheenY, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50, active: false });
  };

  const visibleSkills = isExpanded ? track.skills : track.skills.slice(0, 4);
  const remainingCount = track.skills.length - 4;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelectTrack}
      style={{
        transform: tilt.active
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.015)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition: tilt.active
          ? 'transform 0.1s ease-out'
          : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
      className="group relative rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,17,58,0.35)] hover:shadow-[0_20px_50px_rgba(0,17,58,0.55)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-full"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001030] via-[#00113a] to-[#001a4d]" />
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#cc0000]/20 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-400/10 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#cc0000] via-amber-400 to-[#cc0000] z-30" />

      {/* Dynamic Sheen Overlay matching itplconnect.com */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10"
        style={{
          background: `radial-gradient(600px circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.07), transparent 50%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-20 p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Icon & Badge */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-amber-300 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/15 transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[30px]">{track.icon}</span>
            </div>
            {track.popular && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                Popular
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <h3 className="font-heading font-extrabold text-[22px] sm:text-[24px] text-white group-hover:text-amber-300 transition-colors leading-tight mb-1 uppercase tracking-tight">
            {track.title}
          </h3>
          <p className="text-[13px] font-bold text-amber-400 mb-3">{track.tagline}</p>
          <p className="text-[14px] text-slate-300 leading-relaxed mb-5 line-clamp-3">
            {track.description}
          </p>

          {/* Skills Chips */}
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Technologies &amp; Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[12px] font-semibold text-slate-200 group-hover:text-white border border-white/10 group-hover:border-amber-400/40 transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                >
                  {sk}
                </span>
              ))}
              {!isExpanded && remainingCount > 0 && (
                <button
                  type="button"
                  onClick={onToggleSkills}
                  className="px-2.5 py-1 rounded-lg text-[12px] font-bold text-amber-400 border border-amber-400/40 hover:bg-amber-400/10 transition-colors cursor-pointer"
                  style={{ background: 'rgba(251, 191, 36, 0.08)' }}
                >
                  +{remainingCount} more
                </button>
              )}
              {isExpanded && (
                <button
                  type="button"
                  onClick={onToggleSkills}
                  className="px-2.5 py-1 rounded-lg text-[12px] font-bold text-slate-400 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between text-[13px] font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              {track.duration}
            </span>
            <span className="text-emerald-400 font-bold text-xs">{track.vacancies} Seats Available</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTrack();
              }}
              className="w-full py-2.5 px-3 rounded-xl font-heading font-bold text-[13px] sm:text-[14px] text-[#00113a] transition-all shadow-md hover:shadow-amber-400/20 flex items-center justify-center gap-1 group/btn cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
            >
              <span>View Track</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              className="w-full py-2.5 px-3 rounded-xl font-heading font-bold text-[13px] sm:text-[14px] bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrainingPage: React.FC<TrainingPageProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<InternshipTrack | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [applyModalTrackId, setApplyModalTrackId] = useState<string | undefined>(undefined);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const phoneHotline = '9146835824';
  const hotlineFormatted = '+91 9146835824';

  // Section scroll reveal hooks
  const pillarsReveal = useScrollReveal();
  const programsHeaderReveal = useScrollReveal();
  const cultureHeaderReveal = useScrollReveal();
  const advantageHeaderReveal = useScrollReveal();
  const statsBoxReveal = useScrollReveal();
  const innovationReveal = useScrollReveal();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const toggleSkills = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSkills((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const handleOpenApply = (trackId?: string) => {
    setApplyModalTrackId(trackId || itplPrograms[0].id);
    setIsApplyModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter programs based on category and search query
  const filteredPrograms = itplPrograms.filter((program) => {
    const matchesCategory =
      selectedCategory === 'all' || program.category === selectedCategory;
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      program.tools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getWhatsappUrl = (trackTitle?: string) => {
    const msg = trackTitle
      ? `Hello Infoyashonand Team, I am interested in applying for the ${trackTitle} Internship Track. Please share the details.`
      : 'Hello Infoyashonand Team, I am interested in applying for your Internship Programs. Please share the details.';
    return `https://wa.me/91${phoneHotline}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="w-full bg-[#f8f9fa] text-[#191c1d] selection:bg-[#0059bb]/20 selection:text-[#00113a]">
      {/* 1. HERO SECTION */}
      <section
        id="itpl-hero"
        className="relative w-full overflow-hidden bg-[#00113a] text-white pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 min-h-[92vh] flex items-center justify-center"
      >
        {/* Background Image matching itplconnect.com */}
        <div
          className="absolute inset-0 bg-cover bg-[position:70%_center] md:bg-center bg-no-repeat pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url('/assets/hero_banner.jpg')` }}
        />
        {/* Exact backdrop & contrast overlays from itplconnect.com */}
        <div className="absolute inset-0 bg-[#00113a]/40 backdrop-brightness-90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00113a]/65 via-transparent to-[#00113a]/85 pointer-events-none" />

        {/* Ambient Glowing Orbs & Bottom Slanted Skew */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-[#0059bb]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-amber-500/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 lg:h-20 bg-[#f8f9fa] transform -skew-y-1 sm:-skew-y-2 origin-bottom-left" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {/* Top Badge with 6s spin animation */}
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/50 text-amber-300 shadow-md backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase font-heading">
                Innovate • Develop • Grow
              </span>
            </div>

            {/* Headline with 3D drop shadows */}
            <div className="space-y-1 sm:space-y-2">
              <span className="block font-heading font-extrabold text-[28px] sm:text-[44px] md:text-[54px] lg:text-[62px] leading-[1.1] tracking-tight text-white uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Kickstart Your Career With
              </span>
              <span className="block font-heading font-black text-[32px] sm:text-[50px] md:text-[62px] lg:text-[70px] leading-[1.05] tracking-tight uppercase bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 text-transparent bg-clip-text drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Real-World Experience
              </span>
            </div>

            {/* Paragraph */}
            <p className="font-body text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed text-slate-100 max-w-2xl font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              Work on live enterprise projects, build an industry-ready portfolio, and accelerate your tech trajectory with 1-on-1 mentorship.
            </p>

            {/* Call to Actions with exact itplconnect animations */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
              <a
                href={getWhatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white font-heading font-extrabold text-[15px] sm:text-[16px] px-8 sm:px-10 py-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_14px_30px_rgba(37,211,102,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer animate-btn-glow select-none"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
                <MessageCircle className="w-5 h-5 text-white animate-icon-wiggle shrink-0 drop-shadow-sm" />
                <span>WhatsApp Enquiry</span>
              </a>

              <button
                onClick={() => scrollToSection('roles')}
                className="w-full sm:w-auto border-2 border-white/80 hover:border-white hover:bg-white/20 text-white font-heading font-bold text-[15px] sm:text-[16px] px-8 sm:px-9 py-3.5 rounded-full transition-all flex items-center justify-center gap-2.5 backdrop-blur-md shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-5 h-5 text-amber-300" />
                <span>View Programs</span>
              </button>

              <button
                onClick={() => handleOpenApply()}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#00113a] font-heading font-black text-[15px] sm:text-[16px] px-8 sm:px-9 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 border-t border-white/20 w-full max-w-2xl">
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-black/50 border border-white/20 backdrop-blur-md text-[10px] sm:text-[13px] text-white shadow-md whitespace-nowrap shrink-0 hover:border-amber-400/50 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>100%</strong> Practical</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-black/50 border border-white/20 backdrop-blur-md text-[10px] sm:text-[13px] text-white shadow-md whitespace-nowrap shrink-0 hover:border-emerald-400/50 transition-colors">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>98%</strong> Placement</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-black/50 border border-white/20 backdrop-blur-md text-[10px] sm:text-[13px] text-white shadow-md whitespace-nowrap shrink-0 hover:border-amber-400/50 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Fast-Track</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE PILLARS with Scroll Reveal */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={pillarsReveal.ref}
          className={`bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,17,58,0.08)] border border-[#c5c6d2]/40 p-6 sm:p-10 overflow-hidden transition-all duration-700 ${
            pillarsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="flex flex-col justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#cc0000] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[28px]">model_training</span>
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#cc0000] block mb-1">
                  PRACTICAL TRAINING
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#00113a] mb-2 group-hover:text-[#cc0000] transition-colors">
                  100% Hands-on Experience
                </h3>
                <p className="text-sm text-[#444650] leading-relaxed">
                  Build real client applications and enterprise capstone software with production workflows.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#cc0000]">
                <span>Zero Boring Theory</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group hover:-translate-y-1 border-t md:border-t-0 md:border-l border-slate-100">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d07c00] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">
                  CERTIFICATE PROVIDED
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#00113a] mb-2 group-hover:text-amber-600 transition-colors">
                  Industry-Recognized Credential
                </h3>
                <p className="text-sm text-[#444650] leading-relaxed">
                  Earn a verifiable certificate of completion, performance scorecard, and Letter of Recommendation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-amber-600">
                <span>Accredited ISO Standard</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group hover:-translate-y-1 border-t md:border-t-0 md:border-l border-slate-100">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0059bb] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[28px]">supervisor_account</span>
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0059bb] block mb-1">
                  EXPERT MENTORSHIP
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#00113a] mb-2 group-hover:text-[#0059bb] transition-colors">
                  Guidance from Professionals
                </h3>
                <p className="text-sm text-[#444650] leading-relaxed">
                  Weekly 1-on-1 code reviews, architectural feedback, and rigorous technical mock interviews.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#0059bb]">
                <span>1-on-1 Engineering Leads</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED CAREER PROGRAMS GRID with 3D Tilt and Staggered Reveal */}
      <section id="roles" className="py-20 sm:py-28 bg-[#f8f9fa] relative z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#cc0000]/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0059bb]/5 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Reveal */}
          <div
            ref={programsHeaderReveal.ref}
            className={`text-center max-w-3xl mx-auto mb-10 sm:mb-14 transition-all duration-700 ${
              programsHeaderReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-[#cc0000] border border-red-200 font-heading font-bold text-[12px] uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Career Programs</span>
            </div>
            <h2 className="font-heading font-extrabold text-[32px] sm:text-[42px] lg:text-[48px] text-[#00113a] tracking-tight leading-tight">
              Choose Your Tech Path
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#444650] mt-4 leading-relaxed">
              We offer specialized internship tracks designed to equip you with industry-relevant skills in today's most in-demand technological domains.
            </p>
          </div>

          {/* Filter Bar: Category Tabs & Search */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'All Programs' },
                { id: 'data_ai', label: 'Data & AI' },
                { id: 'development', label: 'Development' },
                { id: 'qa_marketing', label: 'Quality & Growth' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#00113a] text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, skills, or tracks..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0059bb] bg-[#f8f9fa]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid with Staggered Entrance & 3D Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPrograms.map((track, idx) => (
              <RevealCard key={track.id} delay={idx * 110}>
                <InteractiveTrackCard
                  track={track}
                  isExpanded={!!expandedSkills[track.id]}
                  onToggleSkills={(e) => toggleSkills(track.id, e)}
                  onSelectTrack={() => setSelectedTrackForModal(track)}
                  onApply={() => handleOpenApply(track.id)}
                />
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIFE AT INFOYASHONAND / CULTURE & ENVIRONMENT */}
      <section id="culture" className="py-16 sm:py-24 bg-white border-y border-[#c5c6d2]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={cultureHeaderReveal.ref}
            className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ${
              cultureHeaderReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-[#0059bb] font-heading font-bold text-[12px] uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Culture &amp; Environment</span>
            </div>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[38px] text-[#00113a] tracking-tight flex flex-col items-center justify-center gap-3 sm:gap-4">
              <span>Life at</span>
              <div className="inline-flex items-center gap-3 sm:gap-4 md:gap-5 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4.5 rounded-2xl sm:rounded-3xl bg-[#1b2685] text-white shadow-2xl border border-white/15 select-none hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/10 p-1">
                    <img
                      src="/assets/nav_logo.png"
                      alt="INFOYASHONAND Logo"
                      className="w-full h-full object-cover scale-[1.2]"
                    />
                  </div>
                </div>
                <div className="w-[2.5px] sm:w-[3px] h-10 sm:h-12 bg-white/90 rounded-full shrink-0 shadow-xs mx-0.5 sm:mx-1" />
                <div className="flex items-center min-w-0">
                  <svg viewBox="0 0 670 170" className="w-auto h-[38px] sm:h-[48px] shrink-0 select-none" style={{ overflow: 'visible' }}>
                    <text x="0" y="90" fill="#ffffff" fontFamily="'Oswald', sans-serif" fontWeight="700" fontSize="102" textLength="670" lengthAdjust="spacing">
                      INFOYASHONAND
                    </text>
                    <text x="0" y="162" fill="#ffffff" fontFamily="'Oswald', sans-serif" fontWeight="700" fontSize="64" textLength="670" lengthAdjust="spacing">
                      TECHNOLOGY PVT. LTD.
                    </text>
                  </svg>
                </div>
              </div>
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[#444650] mt-4 max-w-2xl mx-auto">
              We don't believe in boring busywork. We nurture aspiring software developers, data practitioners, and marketers into confident industry leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: 'auto_stories',
                title: 'Continuous Learning',
                desc: 'Access to premium tech libraries, curated architectural roadmaps, and weekly deep-dive masterclasses led by principal engineers.',
                badge: 'Skill Mastery',
              },
              {
                icon: 'rocket_launch',
                title: 'Rapid Practical Growth',
                desc: 'Work on actual production codebases and live client software. Every sprint you push real code to GitHub repositories and staging servers.',
                badge: 'Zero Fluff',
              },
              {
                icon: 'groups',
                title: 'Collaborative & Inclusive Culture',
                desc: 'Join a dynamic, supportive cohort of fellow builders. Participate in internal hackathons, pair programming, and networking meetups.',
                badge: 'Community First',
              },
            ].map((item, idx) => (
              <RevealCard key={idx} delay={idx * 130}>
                <div className="relative bg-[#f8f9fa] rounded-3xl p-7 sm:p-8 border border-[#c5c6d2]/30 hover:border-[#0059bb]/50 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,17,58,0.08)] transition-all duration-300 flex flex-col justify-between group h-full">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#00113a] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#0059bb] transition-all duration-300">
                        <span className="material-symbols-outlined text-[28px] text-[#b3c5ff]">{item.icon}</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100/70 text-[#00113a]">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-[19px] sm:text-[20px] text-[#00113a] mb-3 group-hover:text-[#0059bb] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[14px] sm:text-[15px] text-[#444650] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-[13px] font-semibold text-[#0059bb]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Internship Component</span>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE INFOYASHONAND ADVANTAGE with Expanding Accent & Shimmer */}
      <section id="why-us" className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#cc0000]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0059bb]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            ref={advantageHeaderReveal.ref}
            className={`text-center max-w-3xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
              advantageHeaderReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-[#cc0000] font-heading font-bold text-[12px] uppercase tracking-widest mb-4 border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-[#cc0000]" />
              <span>The INFOYASHONAND Advantage</span>
            </div>
            <h2 className="font-heading font-extrabold text-[32px] sm:text-[42px] lg:text-[48px] text-[#00113a] tracking-tight leading-tight">
              Why Intern With Us?
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#444650] mt-4 leading-relaxed">
              We bridge the gap between academic theory and real software engineering. Here is why our interns stand out in competitive job markets.
            </p>
          </div>

          {/* 4 Feature Cards with Hover Accent & Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: 'trending_up',
                title: 'Career Growth',
                highlight: 'Fast-Track Trajectory',
                desc: 'Work on production codebases and high-impact projects that transform your resume from standard to outstanding.',
                metric: '3x',
                metricLabel: 'Faster Skill Mastery',
                accent: 'from-[#cc0000] to-[#ff4444]',
              },
              {
                icon: 'devices',
                title: 'Industry Exposure',
                highlight: 'Real Enterprise Stacks',
                desc: 'Get hands-on with cutting-edge tools: React 19, TypeScript, PyTorch, Flutter, Selenium, and Google Analytics 4.',
                metric: '80+',
                metricLabel: 'Hiring Partners',
                accent: 'from-[#0059bb] to-[#0077ff]',
              },
              {
                icon: 'verified',
                title: 'Certification & LOR',
                highlight: 'Verifiable Credentials',
                desc: 'Earn an accredited Internship Certificate, project completion badges, and a custom Letter of Recommendation.',
                metric: '100%',
                metricLabel: 'Recognized by Top Tech',
                accent: 'from-[#cc0000] to-amber-600',
              },
              {
                icon: 'psychology',
                title: 'Expert Mentorship',
                highlight: '1-on-1 Technical Leads',
                desc: 'Receive continuous guidance, direct PR code reviews, and structured mock technical interview rounds.',
                metric: '1:1',
                metricLabel: 'Personalized Coaching',
                accent: 'from-[#00113a] to-[#0059bb]',
              },
            ].map((feat, idx) => (
              <RevealCard key={idx} delay={idx * 120}>
                <div className="relative overflow-hidden bg-[#f8f9fa] rounded-3xl p-7 border border-[#c5c6d2]/30 hover:border-[#cc0000]/40 hover:bg-white hover:shadow-[0_20px_45px_rgba(204,0,0,0.10)] hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-out flex flex-col justify-between group cursor-pointer h-full">
                  {/* Shimmer sweep on card hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                  {/* Top expanding accent line matching itplconnect.com */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feat.accent} rounded-t-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  />

                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.accent} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-500`}
                    >
                      <span className="material-symbols-outlined text-[28px] text-white">{feat.icon}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#cc0000] block mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feat.highlight}
                    </span>
                    <h3 className="font-heading font-extrabold text-[20px] text-[#00113a] mb-3 group-hover:text-[#cc0000] transition-colors duration-300">
                      {feat.title}
                    </h3>
                    <p className="text-[14px] text-[#444650] leading-relaxed group-hover:text-[#191c1d] transition-colors duration-300">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="font-heading font-black text-[22px] text-[#00113a] group-hover:text-[#cc0000] group-hover:scale-105 transition-all duration-300 inline-block">
                      {feat.metric}
                    </span>
                    <span className="text-[11px] font-semibold text-[#757682] uppercase text-right group-hover:text-[#00113a] transition-colors duration-300">
                      {feat.metricLabel}
                    </span>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>

          {/* 4 Big Numbers Box with entrance reveal */}
          <div
            ref={statsBoxReveal.ref}
            className={`mt-16 bg-[#1b2685] text-white rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden relative transition-all duration-700 delay-300 ${
              statsBoxReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#cc0000] to-transparent" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 sm:gap-y-8 text-center">
              {[
                { value: '200+', label: 'Students Placed & Mentored' },
                { value: '98%', label: 'Placement Success Rate' },
                { value: '80+', label: 'Corporate Hiring Partners' },
                { value: '100%', label: 'Hands-On Practical Code' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-start text-center space-y-2 py-2 sm:py-3 px-3 group ${
                    idx >= 2 ? 'border-t border-white/10 lg:border-t-0' : ''
                  } ${idx % 2 === 0 ? 'border-r border-white/10 lg:border-r-0' : ''} ${
                    idx > 0 ? 'lg:border-l lg:border-white/10' : ''
                  }`}
                >
                  <div className="font-heading font-black text-[32px] sm:text-[42px] lg:text-[46px] text-amber-300 group-hover:text-[#ff6666] tracking-tight leading-none transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-[13px] sm:text-[14px] text-[#b3c5ff] font-medium max-w-[160px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CORPORATE INNOVATION CENTER / SANGLI OFFICE with Reveal */}
      <section id="about" className="py-20 sm:py-28 bg-[#f8f9fa] border-t border-[#c5c6d2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={innovationReveal.ref}
            className={`max-w-4xl mx-auto space-y-8 transition-all duration-700 ${
              innovationReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#0059bb] font-heading font-bold text-[12px] uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About The Company</span>
              </div>
              <h2 className="font-heading font-extrabold text-[32px] sm:text-[42px] text-[#00113a] tracking-tight leading-tight">
                Shaping Tomorrow's Tech Leaders Today
              </h2>
              <p className="text-[16px] sm:text-[18px] text-[#444650] leading-relaxed">
                <strong>INFOYASHONAND TECHNOLOGY PVT. LTD.</strong> is a premier software development and talent incubation firm dedicated to empowering engineering students and professionals.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <p className="text-[15px] sm:text-[16px] text-[#444650] leading-relaxed">
                We bridge the critical gap between academic syllabi and industrial production workflows. Our comprehensive internship cohorts work alongside seasoned engineers on enterprise SaaS platforms, AI systems, cloud data warehouses, and high-impact digital campaigns.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0059bb] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[16px] text-[#00113a] group-hover:text-[#0059bb] transition-colors">
                      Corporate Innovation Center
                    </h4>
                    <p className="text-[13px] text-[#444650] mt-1 leading-relaxed">
                      State-of-the-art developer labs with dedicated mentor pods and high-speed infrastructure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">pin_drop</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[16px] text-[#00113a] group-hover:text-emerald-700 transition-colors">
                      Sangli Corporate Office
                    </h4>
                    <p className="text-[13px] text-[#444650] mt-1 leading-relaxed">
                      1st Floor, Pearl Enclave, M.S.E.B. Road, Vishrambag, Sangli, Maharashtra 416416
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact and Map Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:+91${phoneHotline}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#00113a] text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 animate-phone-ring" />
                    <span>{hotlineFormatted}</span>
                  </a>
                  <a
                    href="mailto:contact@infoyashonand.com"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#00113a] text-xs font-bold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0059bb]" />
                    <span>contact@infoyashonand.com</span>
                  </a>
                </div>

                <a
                  href="https://maps.google.com/?q=Pearl+Enclave+Vishrambag+Sangli"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-[#004799] text-white text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM ADMISSION CTA BANNER with Shimmer and Pulse */}
      <section className="bg-gradient-to-r from-[#00113a] via-[#1b2685] to-[#00113a] text-white py-16 px-4 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0059bb]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d07c00]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-heading font-bold text-xs uppercase tracking-widest">
            <span>🚀 Batch 2026 Admissions Open</span>
          </div>

          <h3 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Ready to Accelerate Your Career with Infoyashonand?
          </h3>

          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto">
            Join 200+ placed graduates who transformed their engineering journey into high-paying software jobs. Limited seats per batch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleOpenApply()}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#00113a] font-heading font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Internship Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={getWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer animate-btn-glow"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
              <MessageCircle className="w-5 h-5 text-white animate-icon-wiggle shrink-0" />
              <span>Direct WhatsApp Counseling</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. MOBILE FLOATING ACTION BAR with Pulsing Wave & Rings */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,17,58,0.08)] px-2 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => scrollToSection('itpl-hero')}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#0059bb]"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            onClick={() => scrollToSection('roles')}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#757682]"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            <span className="text-[10px] font-bold">Tracks</span>
          </button>

          {/* Central Pulsing WhatsApp Button matching itplconnect.com */}
          <a
            href={getWhatsappUrl()}
            target="_blank"
            rel="noreferrer"
            className="relative flex flex-col items-center -mt-7 cursor-pointer group select-none"
          >
            <span className="absolute -top-5.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md whitespace-nowrap animate-bounce flex items-center gap-1 z-10 border border-emerald-300/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
              Chat Now
            </span>
            <div className="relative">
              <span className="absolute -inset-1.5 rounded-full bg-emerald-400/50 animate-ping pointer-events-none" />
              <span className="absolute -inset-2 rounded-full bg-emerald-500/40 blur-md animate-pulse pointer-events-none" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-600 text-white flex items-center justify-center border-[3px] border-white group-hover:scale-110 active:scale-95 transition-all duration-200 animate-whatsapp-pulse">
                <MessageCircle className="w-7 h-7 text-white drop-shadow-sm" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-700 mt-1 uppercase tracking-wider">
              WhatsApp
            </span>
          </a>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#757682]"
          >
            <span className="material-symbols-outlined text-[20px]">checklist</span>
            <span className="text-[10px] font-bold">Tracker</span>
          </button>

          <a
            href={`tel:+91${phoneHotline}`}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#00113a] hover:text-[#0059bb] transition-all group select-none relative"
          >
            <div className="relative w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors shadow-xs">
              <span className="absolute -inset-0.5 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
              <Phone className="w-4 h-4 text-amber-600 animate-phone-ring" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 group-hover:text-amber-800">Call</span>
          </a>
        </div>
      </div>

      {/* 9. MODALS with Smooth In-Out Animations */}
      {/* Track Curriculum Details Modal */}
      <TrackDetailsModal
        track={selectedTrackForModal}
        onClose={() => setSelectedTrackForModal(null)}
        onApply={(trackId) => handleOpenApply(trackId)}
      />

      {/* Internship Application Form Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preSelectedTrackId={applyModalTrackId}
        onApplicationSubmitted={(app) => {
          triggerToast(`Application ${app.trackingNumber} submitted successfully!`);
        }}
      />

      {/* Application Status Tracker Modal */}
      <ApplicationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onApplyNew={() => {
          setIsStatusModalOpen(false);
          handleOpenApply();
        }}
      />

      {/* Welcome / Announcement Banner Modal */}
      <AnnouncementBannerModal onOpenApplyModal={() => handleOpenApply()} />

      {/* Toast Notification with slide-in animation */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-8 z-50 bg-[#00113a] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-[13px] font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-[#b3c5ff] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
