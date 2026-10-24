import React, { useState } from 'react';

interface CostEstimatorSectionProps {
  onDirectQuoteSubmit: (scopeSummary: string) => void;
}

export const CostEstimatorSection: React.FC<CostEstimatorSectionProps> = ({ onDirectQuoteSubmit }) => {
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'erp' | 'whatsapp' | 'marketing'>('erp');
  const [scale, setScale] = useState<'mvp' | 'business' | 'enterprise'>('business');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'auth',
    'reports',
    'whatsapp',
  ]);

  const platformOptions = [
    { id: 'erp', name: 'ERP & Custom Software', icon: 'developer_mode', desc: 'Bespoke portals, cooperative banking & business workflows' },
    { id: 'web', name: 'Web SaaS Platform', icon: 'language', desc: 'High-speed modern React & cloud web applications' },
    { id: 'mobile', name: 'Android Mobile App', icon: 'phone_android', desc: 'Native Kotlin apps with offline sync & hardware POS' },
    { id: 'whatsapp', name: 'WhatsApp & Cloud API', icon: 'chat', desc: 'Automated CRM chatbots, OTPs & customer notifications' },
    { id: 'marketing', name: 'Digital Growth & SEO', icon: 'trending_up', desc: 'Technical SEO, Meta funnels & lead acquisition' },
  ];

  const featureOptions = [
    { id: 'auth', label: 'Role-Based Authentication & Permissions', icon: 'lock' },
    { id: 'payment', label: 'Payment Gateway / POS Device Sync', icon: 'payments' },
    { id: 'whatsapp', label: 'WhatsApp / SMS Transaction Alerts', icon: 'notifications_active' },
    { id: 'reports', label: 'Automated Audit & PDF Reports', icon: 'description' },
    { id: 'iot', label: 'Real-time Telemetry & WebSockets', icon: 'sensors' },
    { id: 'cloud', label: 'AWS High-Availability & Backups', icon: 'cloud_done' },
  ];

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  // Dynamic calculations based on selections
  const getTimeline = () => {
    let baseWeeks = scale === 'mvp' ? 3 : scale === 'business' ? 6 : 10;
    baseWeeks += Math.floor(selectedFeatures.length * 0.7);
    return `${baseWeeks} – ${baseWeeks + 2} Weeks`;
  };

  const getRecommendedStack = () => {
    if (platform === 'erp') return ['React 19', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'];
    if (platform === 'mobile') return ['Android Kotlin', 'Jetpack Compose', 'Room DB', 'REST APIs'];
    if (platform === 'web') return ['React', 'TypeScript', 'Tailwind', 'Node.js', 'MongoDB'];
    if (platform === 'whatsapp') return ['Meta Cloud API', 'Webhooks', 'Express', 'Redis'];
    return ['Google Search Console', 'Meta Ads', 'GA4', 'Technical SEO'];
  };

  const generateScopeText = () => {
    const platName = platformOptions.find((p) => p.id === platform)?.name || platform;
    const feats = selectedFeatures
      .map((fid) => featureOptions.find((f) => f.id === fid)?.label)
      .filter(Boolean)
      .join(', ');
    return `Project: ${platName} [Scale: ${scale.toUpperCase()}] | Features: ${feats} | Est. Timeline: ${getTimeline()}`;
  };

  const handleWhatsAppQuote = () => {
    const text = encodeURIComponent(
      `Hello Infoyashonand Team, I used your website project scope estimator and would like to discuss my project:\n\n${generateScopeText()}\n\nPlease connect me with an IT Architect.`
    );
    window.open(`https://wa.me/918055514368?text=${text}`, '_blank');
  };

  const handleRequestProposal = () => {
    onDirectQuoteSubmit(generateScopeText());
  };

  return (
    <section className="w-full py-16 lg:py-24 bg-[#FAF8FF] border-b border-slate-200/80 stitch-grid relative overflow-hidden" id="estimator">
      {/* Decorative corner stitch crosses */}
      <span className="absolute top-4 left-6 text-slate-400 font-mono-tech text-sm select-none">+</span>
      <span className="absolute top-4 right-6 text-slate-400 font-mono-tech text-sm select-none">+</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 reveal-up">
          <div className="pill-bounce cursor-default inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#232884] mb-3">
            <span className="font-mono-tech text-[10px] text-[#3D48C8]">[ESTIMATOR // INSTANT SCOPE]</span>
            <span>Transparent IT Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight">
            INTERACTIVE <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">PROJECT ESTIMATOR</span>
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            Configure your technical requirements to receive an instant architectural feasibility assessment, estimated deployment timeline, and recommended tech stack.
          </p>
        </div>

        {/* The Estimator Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-6 reveal-left">
            {/* Step 1: Select Platform */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-xs font-bold text-[#232884] uppercase tracking-wider">
                  01 // SELECT PLATFORM OR SYSTEM
                </span>
                <span className="text-[11px] text-slate-400">Step 1 of 3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {platformOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPlatform(opt.id as any)}
                    className={`bounce-card p-3.5 rounded-2xl border text-left cursor-pointer flex items-start gap-3 ${
                      platform === opt.id
                        ? 'border-[#232884] bg-blue-50/60 shadow-xs ring-1 ring-[#232884]'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`bounce-card-icon h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        platform === opt.id ? 'bg-[#232884] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0E1538] uppercase">{opt.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Scale & Complexity */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-xs font-bold text-[#232884] uppercase tracking-wider">
                  02 // DEPLOYMENT SCALE &amp; RELIABILITY TIER
                </span>
                <span className="text-[11px] text-slate-400">Step 2 of 3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mvp', title: 'Agile MVP', badge: 'Rapid Launch', desc: 'Core features, single branch, rapid validation' },
                  { id: 'business', title: 'Commercial SME', badge: 'Recommended', desc: 'Multi-user roles, high uptime, robust APIs' },
                  { id: 'enterprise', title: 'Enterprise Core', badge: 'Mission-Critical', desc: 'Multi-branch, banking level, dedicated SLA' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScale(s.id as any)}
                    className={`bounce-card p-3.5 rounded-2xl border text-left cursor-pointer ${
                      scale === s.id
                        ? 'border-[#232884] bg-blue-50/60 shadow-xs ring-1 ring-[#232884]'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-[#0E1538] uppercase">{s.title}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          scale === s.id ? 'bg-[#232884] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Select Required Features */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-xs font-bold text-[#232884] uppercase tracking-wider">
                  03 // ESSENTIAL MODULES &amp; INTEGRATIONS
                </span>
                <span className="text-[11px] text-slate-400">Step 3 of 3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {featureOptions.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggleFeature(feat.id)}
                      className={`bounce-card p-3 rounded-xl border text-left cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#3D48C8] bg-blue-50/50 text-[#0E1538]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#3D48C8]">
                          {feat.icon}
                        </span>
                        <span className="text-xs font-medium">{feat.label}</span>
                      </div>
                      <span
                        className={`h-4 w-4 rounded-md border flex items-center justify-center text-[10px] font-bold ${
                          isChecked
                            ? 'bg-[#232884] border-[#232884] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Output & Action Bridge (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 reveal-right">
            <div className="bounce-card-dark mobile-float-card rounded-3xl bg-gradient-to-b from-[#080C15] via-[#0E1526] to-[#141759] text-white p-6 sm:p-7 shadow-2xl border border-indigo-900/60 relative overflow-hidden">
              {/* Glowing Orb Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <span className="font-mono-tech text-[10px] text-cyan-300 uppercase tracking-widest">
                    SYSTEM SCOPE SPECIFICATION
                  </span>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    Architectural Summary
                  </div>
                </div>
                <span className="font-mono-tech text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  READY TO BUILD
                </span>
              </div>

              {/* Estimated Timeline */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Estimated Sprint Turnaround
                </div>
                <div className="text-2xl font-black text-cyan-300 font-mono-tech">
                  {getTimeline()}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Based on agile sprints with weekly milestone demonstrations.
                </div>
              </div>

              {/* Recommended Production Stack */}
              <div className="mb-5">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-mono-tech">
                  RECOMMENDED TECH STACK
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getRecommendedStack().map((t) => (
                    <span
                      key={t}
                      className="font-mono-tech text-[11px] px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features Count & Selected */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Platform:</span>
                  <span className="font-bold text-white uppercase">{platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Tier:</span>
                  <span className="font-bold text-white uppercase">{scale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Configured Modules:</span>
                  <span className="font-bold text-cyan-300">{selectedFeatures.length} Integrated</span>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleWhatsAppQuote}
                  className="btn-bounce w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  <img
                    src="/live_assets/whatsapp-icon.png"
                    alt="WhatsApp"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span>Send Scope to WhatsApp Architect</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestProposal}
                  className="btn-bounce w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  <span>Request Written Formal Proposal</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-emerald-400">verified_user</span>
                <span>Protected by Non-Disclosure Agreement (NDA) &amp; ISO Standards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
