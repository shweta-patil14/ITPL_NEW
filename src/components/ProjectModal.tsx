import React from 'react';
import { ProjectItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onRequestSimilar: (projectName: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onRequestSimilar,
}) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner stitch markers */}
        <span className="absolute top-3 left-3 text-slate-300 font-mono-tech text-xs select-none">+</span>
        <span className="absolute top-3 right-3 text-slate-300 font-mono-tech text-xs select-none">+</span>

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#3D48C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {project.badge || project.category}
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Successfully Delivered // Production Live
          </span>
          {project.clientType && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Client: {project.clientType}
            </span>
          )}
        </div>

        {/* Title & Tagline */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            {project.image ? (
              <img src={project.image} alt={project.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className={`material-symbols-outlined text-3xl ${project.color}`}>
                {project.icon}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0E1538] tracking-tight">
              {project.name}
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {project.tagline || project.desc}
            </p>
          </div>
        </div>

        {/* Real Production Screenshot / Visual Showcase */}
        {(project.screenshot || project.image) && (
          <div className="mb-6 rounded-2xl bg-slate-900 border border-slate-800 p-2 overflow-hidden shadow-lg">
            <div className="flex items-center gap-1.5 px-3 py-1 border-b border-slate-800 text-[10px] text-slate-400 font-mono-tech mb-2">
              <span className="h-2 w-2 rounded-full bg-rose-500/80"></span>
              <span className="h-2 w-2 rounded-full bg-amber-500/80"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 text-slate-400 font-mono-tech">production://infoyashonand.cloud/{project.id}</span>
            </div>
            <div className="h-44 sm:h-56 w-full rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden p-2">
              <img
                src={project.screenshot || project.image}
                alt={`${project.name} Production View`}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>
          </div>
        )}

        {/* Key Measurable Impact Metrics Grid */}
        {project.keyMetrics && project.keyMetrics.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#141759] text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="font-mono-tech text-[10px] text-cyan-300 uppercase tracking-widest">
                VERIFIED OUTCOMES &amp; ROI
              </span>
              <span className="text-[10px] text-slate-400">Audited Production Data</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {project.keyMetrics.map((metric, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-mono-tech text-xs sm:text-sm font-bold text-white mb-0.5">
                    {metric.split(' ')[0]}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    {metric.split(' ').slice(1).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Statement vs Solution Delivered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Client Bottleneck / Problem</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {project.problemStatement ||
                'Legacy manual paper processes, untracked spreadsheets, and latency slowed down business growth and increased operational risk.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Infoyashonand Engineering Solution</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {project.solutionDelivered ||
                project.longDesc ||
                'Custom cloud architecture, offline-ready database synchronization, and modern responsive user interface.'}
            </p>
          </div>
        </div>

        {/* System Architecture Highlights */}
        {project.architecturePoints && project.architecturePoints.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#232884]">dns</span>
              <span>Core Architectural Highlights</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.architecturePoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="text-[#232884] font-bold text-sm leading-none mt-0.5">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technology Stack Tags */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#3D48C8]">code</span>
              <span>Production Tech Stack</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono-tech text-[11px] font-semibold px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Footers */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Want an enterprise portal tailored to your operational specifications?
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{project.liveUrl.includes('play.google.com') ? 'Google Play Store' : 'Live Project'}</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestSimilar(project.name);
              }}
              className="flex-1 sm:flex-none btn-glow px-5 py-2.5 rounded-xl bg-[#232884] text-white text-xs sm:text-sm font-bold hover:bg-[#191D65] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#232884]/25 cursor-pointer"
            >
              <span>Build Similar Solution</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
