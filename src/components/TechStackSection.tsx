import React, { useState } from 'react';
import { TECH_STACK_ITEMS } from '../data';
import { TechStackItem } from '../types';

export const TechStackSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Technologies' },
    { id: 'frontend', label: 'Frontend & UI' },
    { id: 'backend', label: 'Backend & APIs' },
    { id: 'mobile', label: 'Mobile Engineering' },
    { id: 'cloud', label: 'Cloud & DevOps' },
    { id: 'database', label: 'Databases & Cache' },
    { id: 'integration', label: 'APIs & Telecom' },
  ];

  const filteredItems = activeTab === 'all'
    ? TECH_STACK_ITEMS
    : TECH_STACK_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section className="w-full py-16 lg:py-24 bg-white border-b border-slate-200/80 relative" id="tech-stack">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 reveal-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#232884] mb-3 pill-bounce cursor-default">
            <span className="font-mono-tech text-[10px] text-[#3D48C8]">[ENGINEERING EXCELLENCE]</span>
            <span>Zero-Compromise Stack</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight">
            MODERN ENTERPRISE <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">TECH STACK</span>
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            We engineer resilient digital solutions leveraging industry-proven open-source and cloud-native frameworks engineered for sub-second performance.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 mt-7 overflow-x-auto no-scrollbar py-1 px-1 sm:flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn-bounce shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#232884] text-white shadow-md shadow-[#232884]/20 scale-102'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stack Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item: TechStackItem, tIdx: number) => (
            <div
              key={item.name}
              style={{ transitionDelay: `${tIdx * 30}ms` }}
              className="stitch-card bounce-card mobile-float-card hover-lift-card reveal-up p-4 rounded-2xl border border-slate-200 hover:border-[#3D48C8]/40 bg-white shadow-xs flex flex-col justify-between group cursor-default"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="bounce-card-icon h-10 w-10 rounded-xl bg-blue-50/80 flex items-center justify-center text-[#232884]">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <span className="pill-bounce font-mono-tech text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors uppercase">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.useCase}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
                <span>STABILITY // HIGH</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  READY
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
