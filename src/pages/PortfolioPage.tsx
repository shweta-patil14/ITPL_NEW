import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { PortfolioSection } from '../components/PortfolioSection';
import { ProjectItem } from '../types';

interface PortfolioPageProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectProject }) => {
  return (
    <div className="w-full">
      <PageHeader
        badge="Engineered Production Systems"
        title="ENTERPRISE SOFTWARE &"
        highlightedText="COMPLETED CASE STUDIES"
        description="Explore custom software platforms, cooperative banking solutions, healthcare ERPs, and mobile applications engineered by Infoyashonand Technology Pvt. Ltd."
        breadcrumbCurrent="Portfolio"
      />

      {/* Main Portfolio Component with Domain Filter & Modal Triggers */}
      <PortfolioSection onSelectProject={onSelectProject} />

      {/* Enterprise Engineering Guarantees */}
      <section className="w-full py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 reveal-up">
            <span className="font-mono-tech text-[10px] text-[#3D48C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase font-bold tracking-widest">
              [ENTERPRISE COMMITMENTS]
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0E1538] mt-2">
              Why Companies Trust Infoyashonand for Custom Systems
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: 'verified_user',
                title: '100% IP & Code Ownership',
                desc: 'You own all intellectual property, source code, repositories, and architectural schematics upon delivery.',
              },
              {
                icon: 'security',
                title: 'Strict NDA & Data Privacy',
                desc: 'Every project is protected under comprehensive non-disclosure agreements before technical scoping begins.',
              },
              {
                icon: 'speed',
                title: 'Milestone Sprint Delivery',
                desc: 'Agile sprints with bi-weekly interactive demonstrations and transparent progress tracking.',
              },
              {
                icon: 'support_agent',
                title: 'Dedicated Post-Launch SLA',
                desc: 'Includes 90 days of free warranty support, bug triage, server optimization, and engineer handoff.',
              },
            ].map((guarantee, i) => (
              <div
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="bounce-card mobile-float-card hover-lift-card reveal-up p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#3D48C8]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#232884] mb-4">
                    <span className="material-symbols-outlined text-2xl">{guarantee.icon}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#0E1538] mb-2 uppercase">{guarantee.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{guarantee.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom RFP prompt */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Ready to develop your custom software or mobile platform?
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/contact"
                  className="btn-glow w-full sm:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-[#232884] text-white text-xs font-bold hover:bg-[#191D65] transition-all"
                >
                  Request a Formal Proposal
                </Link>
                <a
                  href="https://wa.me/918055514368?text=Hello%20Infoyashonand,%20I%20would%20like%20to%20discuss%20a%20new%20project%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all"
                >
                  WhatsApp Lead Architect
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
