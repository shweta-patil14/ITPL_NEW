import React from 'react';
import { Link } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  const coreValues = [
    'Accessibility',
    'Cost Effective',
    'Reliability',
    'Clear Accountability',
    'Prompt Service',
    'Excellent Support',
  ];

  return (
    <section className="w-full py-16 bg-white border-b border-slate-200/70" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="reveal-left lg:col-span-5">
            <div className="bounce-card mobile-float-card hover-lift-card relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
              <div className="p-6 bg-gradient-to-br from-[#232884] to-[#141759] text-white rounded-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#60A5FA]/20 blur-2xl pointer-events-none"></div>
                <div className="text-xs uppercase tracking-widest text-[#60A5FA] font-bold mb-2">
                  About Our Organization
                </div>
                <h3 className="text-2xl font-bold mb-3 uppercase">Pioneering IT Solutions in Maharashtra</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                  Infoyashonand Technology Pvt. Ltd. is a trusted software development and IT services company based in Sangli, Maharashtra. We empower startups, SMEs, and large organizations with robust technology solutions.
                </p>
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">location_on</span>
                    <span>Vishrambag, Sangli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#60A5FA]">support_agent</span>
                    <span>24/7 IT Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-right lg:col-span-7">
            <span className="pill-bounce inline-block text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 cursor-default">
              Company Profile
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2 mb-4">
              Welcome to <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">Infoyashonand Technology</span> Pvt. Ltd.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Infoyashonand Technology Pvt. Ltd. is a trusted software development and IT services company in Sangli, Maharashtra. We offer custom software development, web &amp; mobile app development, cloud computing solutions, managed IT services, IT infrastructure support, and enterprise IT solutions. Our expert team also provides technical support services and IT staffing solutions for startups, SMEs, and large enterprises. We focus on delivering secure, scalable, and high-performance IT solutions that help businesses grow digitally. Contact us today!
            </p>

            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-700 mb-3">
                Our Core Values:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coreValues.map((val, vIdx) => (
                  <div
                    key={val}
                    className={`bounce-card hover-lift-card delay-${(vIdx + 1) * 50} flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 cursor-default transition-all duration-300`}
                  >
                    <span className="bounce-card-icon material-symbols-outlined text-base text-[#232884]">check_circle</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                className="btn-bounce w-full sm:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-[#232884] text-white text-xs font-bold hover:bg-[#141759] transition-all shadow-md shadow-[#232884]/20"
                to="/services"
              >
                Check Our Services
              </Link>
              <Link
                className="btn-bounce w-full sm:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 text-[#232884] text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200"
                to="/contact"
              >
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
