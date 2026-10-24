import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ServicesSection } from '../components/ServicesSection';

interface ServicesPageProps {
  onSelectServiceInquiry: (serviceName: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectServiceInquiry }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const handleServiceInquiry = (serviceTitle: string) => {
    onSelectServiceInquiry(serviceTitle);
    navigate(`/contact?service=${encodeURIComponent(serviceTitle)}`);
  };

  return (
    <div className="w-full">
      <PageHeader
        badge="Enterprise &amp; Digital Solutions"
        title="COMPREHENSIVE IT SERVICES &"
        highlightedText="CUSTOM SOFTWARE"
        description="From native mobile applications and enterprise ERPs to digital marketing funnels and telecom APIs, we architect high-impact solutions for businesses."
        breadcrumbCurrent="Services"
      />

      {search && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs sm:text-sm">
            <div>
              <span className="font-bold text-[#232884]">Search Results for: </span>
              <span className="text-slate-800 font-semibold italic">&ldquo;{search}&rdquo;</span>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="font-bold text-[#232884] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* Services Component */}
      <ServicesSection
        onSelectServiceInquiry={handleServiceInquiry}
        searchQuery={search}
      />

      {/* Why Choose Our IT Services */}
      <section className="w-full py-16 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 reveal-up">
            <span className="text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              The Infoyashonand Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2">
              Why Partner with <span className="text-[#232884]">Our Engineers?</span>
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              We combine deep technical mastery with client transparency and reliable ongoing support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bounce-card mobile-float-card hover-lift-card reveal-up delay-100 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-[#232884] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">security</span>
              </div>
              <h4 className="font-bold text-[#0E1538] text-base mb-1.5 uppercase">Secure by Design</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprise security standards, encrypted data transmissions, and strict vulnerability mitigation protocols.
              </p>
            </div>

            <div className="bounce-card mobile-float-card hover-lift-card reveal-up delay-200 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">speed</span>
              </div>
              <h4 className="font-bold text-[#0E1538] text-base mb-1.5 uppercase">High Performance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lightweight architectures with high throughput, low latency, and scalable cloud elasticity.
              </p>
            </div>

            <div className="bounce-card mobile-float-card hover-lift-card reveal-up delay-300 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">savings</span>
              </div>
              <h4 className="font-bold text-[#0E1538] text-base mb-1.5 uppercase">Cost Efficiency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Affordable technology solutions tailored to startup budgets and SME growth requirements with high ROI.
              </p>
            </div>

            <div className="bounce-card mobile-float-card hover-lift-card reveal-up delay-400 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">support_agent</span>
              </div>
              <h4 className="font-bold text-[#0E1538] text-base mb-1.5 uppercase">Dedicated Support</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct developer access, rapid SLA turnaround times, and local in-person support in Vishrambag, Sangli.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
