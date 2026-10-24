import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { AboutSection } from '../components/AboutSection';
import { MetricsBanner } from '../components/MetricsBanner';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full">
      <PageHeader
        badge="About Our Company"
        title="PIONEERING IT INNOVATION &"
        highlightedText="DIGITAL EXCELLENCE"
        description="Infoyashonand Technology Pvt. Ltd. delivers world-class software development, IT infrastructure management, and industry-oriented job training from Vishrambag, Sangli."
        breadcrumbCurrent="About Us"
      />

      {/* Main About Component */}
      <AboutSection />

      {/* Mission & Vision Section */}
      <section className="w-full py-20 bg-gradient-to-b from-[#F7F9FF] via-[#FAF8FF] to-white border-b border-slate-200/70 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* Section Header */}
          <div className="reveal-up text-center max-w-3xl mx-auto mb-12">
            <span className="pill-bounce font-mono-tech text-xs uppercase tracking-widest text-[#232884] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 font-extrabold inline-block shadow-xs cursor-default">
              FOUNDATIONAL PURPOSE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight mt-3">
              DRIVEN BY <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">MISSION</span>, GUIDED BY <span className="text-[#3D48C8]">VISION</span>
            </h2>
            <p className="text-slate-600 mt-2.5 text-sm sm:text-base leading-relaxed">
              The dual pillars powering our engineering rigor, regional leadership, and long-term client trust.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-8">
            {/* 1. OUR MISSION CARD */}
            <div className="reveal-left hover-lift-card bounce-card-dark mobile-float-card group relative rounded-3xl bg-gradient-to-br from-[#090E29] via-[#10174A] to-[#1C256E] border border-white/10 p-7 sm:p-9 shadow-[0_15px_35px_-10px_rgba(9,14,41,0.3)] flex flex-col justify-between overflow-hidden h-full">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-[#3D48C8]" />

              {/* Glowing Corner Aura */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl group-hover:bg-cyan-400/25 transition-all duration-700 pointer-events-none" />

              {/* Subtle Tech Micro-Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

              {/* Huge Background Watermark Emblem */}
              <div className="absolute -bottom-10 -right-10 pointer-events-none select-none transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                <span className="material-symbols-outlined text-[240px] text-cyan-400/5 group-hover:text-cyan-400/10 transition-colors">
                  track_changes
                </span>
              </div>

              {/* Card Content Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  {/* 3D Glowing Icon Container */}
                  <div className="relative">
                    <div className="bounce-card-icon w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-[#232884] p-[1.5px] shadow-[0_0_24px_rgba(56,189,248,0.35)] group-hover:shadow-[0_0_32px_rgba(56,189,248,0.55)]">
                      <div className="w-full h-full rounded-[14px] bg-[#0E1538]/95 flex items-center justify-center text-cyan-300">
                        <span className="material-symbols-outlined text-3xl">track_changes</span>
                      </div>
                    </div>
                  </div>

                  {/* Monospace Tech Tag */}
                  <div className="pill-bounce font-mono-tech text-[11px] font-bold tracking-wider text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>[CORE PURPOSE]</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3.5 group-hover:text-cyan-200 transition-colors uppercase">
                  OUR MISSION
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  To empower startups, SMEs, and enterprise organizations across Maharashtra and worldwide with robust, cost-effective, and secure software applications. We are committed to fostering technological self-reliance, local job opportunities, and practical IT education.
                </p>

                {/* Key Deliverable Pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="pill-bounce text-[11px] font-semibold text-cyan-200 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                    Enterprise Reliability
                  </span>
                  <span className="pill-bounce text-[11px] font-semibold text-blue-200 bg-blue-950/50 border border-blue-500/30 px-2.5 py-1 rounded-lg">
                    Local Tech Empowerment
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-base text-cyan-400">verified</span>
                  <span className="text-xs sm:text-sm font-bold text-cyan-100">Customer-Centric Engineering</span>
                </div>
                <span className="bounce-card-arrow material-symbols-outlined text-lg text-cyan-400/60 group-hover:text-cyan-300 transition-all">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* 2. OUR VISION CARD */}
            <div className="reveal-right hover-lift-card bounce-card-dark mobile-float-card group relative rounded-3xl bg-gradient-to-br from-[#120B33] via-[#1D1656] to-[#2D1F78] border border-white/10 p-7 sm:p-9 shadow-[0_15px_35px_-10px_rgba(18,11,51,0.3)] flex flex-col justify-between overflow-hidden h-full">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-400 via-indigo-500 to-fuchsia-400" />

              {/* Glowing Corner Aura */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-violet-500/15 rounded-full blur-3xl group-hover:bg-violet-400/25 transition-all duration-700 pointer-events-none" />

              {/* Subtle Tech Micro-Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

              {/* Huge Background Watermark Emblem */}
              <div className="absolute -bottom-10 -right-10 pointer-events-none select-none transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                <span className="material-symbols-outlined text-[240px] text-violet-400/5 group-hover:text-violet-400/10 transition-colors">
                  visibility
                </span>
              </div>

              {/* Card Content Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  {/* 3D Glowing Icon Container */}
                  <div className="relative">
                    <div className="bounce-card-icon w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-[#3D48C8] p-[1.5px] shadow-[0_0_24px_rgba(168,85,247,0.35)] group-hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]">
                      <div className="w-full h-full rounded-[14px] bg-[#0E1538]/95 flex items-center justify-center text-violet-300">
                        <span className="material-symbols-outlined text-3xl">visibility</span>
                      </div>
                    </div>
                  </div>

                  {/* Monospace Tech Tag */}
                  <div className="pill-bounce font-mono-tech text-[11px] font-bold tracking-wider text-violet-300 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span>[STRATEGIC HORIZON]</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3.5 group-hover:text-violet-200 transition-colors uppercase">
                  OUR VISION
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  To be recognized as Western Maharashtra&apos;s premier IT hub and digital solutions partner, bridging the gap between cutting-edge global software engineering and local talent development with relentless quality and trust.
                </p>

                {/* Key Deliverable Pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="pill-bounce text-[11px] font-semibold text-violet-200 bg-violet-950/50 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                    Global Quality Benchmark
                  </span>
                  <span className="pill-bounce text-[11px] font-semibold text-fuchsia-200 bg-fuchsia-950/50 border border-fuchsia-500/30 px-2.5 py-1 rounded-lg">
                    Premier Regional IT Hub
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-violet-400/40 group-hover:bg-violet-500/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-base text-violet-400">rocket_launch</span>
                  <span className="text-xs sm:text-sm font-bold text-violet-100">Scalable Growth &amp; Excellence</span>
                </div>
                <span className="bounce-card-arrow material-symbols-outlined text-lg text-violet-400/60 group-hover:text-violet-300 transition-all">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <MetricsBanner />

      {/* Meet Team CTA */}
      <section className="w-full py-14 bg-white">
        <div className="reveal-up max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-[#0E1538]">Want to meet the people behind our success?</h3>
            <p className="text-slate-600 text-sm mt-1">Get to know our visionary leaders and experienced developer team.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/team"
              className="btn-glow w-full sm:w-auto text-center justify-center px-6 py-3 rounded-xl bg-[#232884] text-white font-bold text-xs sm:text-sm hover:bg-[#141759] transition-all shadow-md"
            >
              Meet Our Team
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto text-center justify-center px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
