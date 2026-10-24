import React from 'react';
import { X, Sparkles, Check, Clock, Code2, Award, Briefcase, MessageCircle, ExternalLink } from 'lucide-react';
import { InternshipTrack } from '../../data/itplConnectPrograms';

interface TrackDetailsModalProps {
  track: InternshipTrack | null;
  onClose: () => void;
  onApply: (trackId: string) => void;
}

export const TrackDetailsModal: React.FC<TrackDetailsModalProps> = ({ track, onClose, onApply }) => {
  if (!track) return null;

  const whatsappMessage = `Hello Infoyashonand Team, I am interested in applying for the ${track.title} Internship Track. Please share the details.`;
  const whatsappUrl = `https://wa.me/919146835824?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#00113a]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative bg-gradient-to-br from-[#00113a] via-[#001f5c] to-[#00113a] text-white w-full max-w-3xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-white/10 text-white p-6 sm:p-8 shrink-0 border-b border-white/15 backdrop-blur-md">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 border border-red-400/30"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[36px]">{track.icon}</span>
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-[24px] sm:text-[28px] text-white leading-tight uppercase tracking-tight">
                {track.title}
              </h2>
              <p className="text-[13px] sm:text-[14px] text-amber-300 font-semibold">{track.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/15 text-[13px] text-slate-200 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{track.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>{track.stipend}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-300">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>{track.mode}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-100">
          {/* Overview */}
          <div>
            <h3 className="font-heading font-bold text-[17px] text-amber-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Track Overview</span>
            </h3>
            <p className="text-[14px] sm:text-[15px] text-slate-200/90 leading-relaxed font-light">
              {track.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-heading font-bold text-[17px] text-amber-300 mb-2.5 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Technologies &amp; Tools Stack</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {track.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-[13px] font-semibold bg-white/15 text-white border border-white/20"
                >
                  {skill}
                </span>
              ))}
              {track.tools.map((tool, idx) => (
                <span
                  key={`t-${idx}`}
                  className="px-3 py-1 rounded-xl text-[13px] font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Capstone Project */}
          <div className="bg-white/10 rounded-2xl p-5 sm:p-6 border border-white/15 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-[12px] uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Featured Capstone Project</span>
            </div>
            <h4 className="font-heading font-bold text-[17px] text-white mb-2">
              {track.capstoneProject.title}
            </h4>
            <p className="text-[14px] text-slate-200/90 mb-4 leading-relaxed font-light">
              {track.capstoneProject.description}
            </p>
            <div className="space-y-1.5">
              <span className="text-[12px] font-bold text-amber-300 uppercase tracking-wider block">
                Deliverables for Your Resume:
              </span>
              {track.capstoneProject.deliverables.map((deliv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[13px] text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <h3 className="font-heading font-bold text-[16px] text-amber-300 mb-2.5">
              Prerequisites &amp; Eligibility
            </h3>
            <ul className="space-y-2">
              {track.prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[13px] sm:text-[14px] text-slate-200/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Target Roles */}
          <div>
            <h3 className="font-heading font-bold text-[16px] text-amber-300 mb-2.5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Target Career Roles</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {track.careerRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                >
                  ✓ {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-white/10 border-t border-white/15 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onApply(track.id);
            }}
            className="w-full sm:flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#00113a] text-[14px] sm:text-[15px] font-heading font-extrabold px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <span>Apply For {track.shortTitle}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="relative overflow-hidden w-full sm:flex-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white text-[14px] sm:text-[15px] font-extrabold px-6 py-3.5 rounded-full transition-all flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
          >
            <MessageCircle className="w-5 h-5 text-white shrink-0 drop-shadow-sm" />
            <span className="tracking-wide">WhatsApp Inquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
};
