import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { createInquiryFirestore } from '../firebase/firestoreService';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Custom Web Development',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Cloud Firestore
      await createInquiryFirestore({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service,
        message: formData.message.trim(),
        source: 'Auto Popup Enquiry Form (2-Min Timer)',
      });

      // 2. Cache locally
      try {
        const stored = localStorage.getItem('itpl_enquiries');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          ...formData,
          id: `inq-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('itpl_enquiries', JSON.stringify(list));
      } catch {
        // ignore storage errors
      }

      // 3. Mark handled in session so it never pops up again in same session
      sessionStorage.setItem('itpl_enquiry_handled', 'true');

      // 4. Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onSubmitSuccess(
        `Thank you, ${formData.name.trim()}! Your enquiry for "${formData.service}" has been received. Our Sangli team will connect with you within 30 minutes!`
      );

      // Close modal
      onClose();
    } catch (err) {
      console.error('Enquiry submission error:', err);
      onSubmitSuccess(`Enquiry noted for ${formData.name.trim()}! Our consultant will call you.`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('itpl_enquiry_handled', 'true');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-enquiry-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card with real-time glow & animated entrance on Desktop & Mobile */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-100/90 p-4 sm:p-6 md:p-7 overflow-hidden max-h-[92dvh] overflow-y-auto z-10 animate-enquiry-modal">
        {/* Real-time Flowing Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#3D48C8] via-emerald-400 to-[#232884] animate-enquiry-flow" />

        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#232884] to-[#3D48C8] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 animate-enquiry-icon">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Tech Desk • Quick Enquiry</span>
              </div>
              <h3
                id="enquiry-modal-title"
                className="text-lg sm:text-xl font-black text-[#0E1538] leading-tight"
              >
                How Can We Help You Today?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-all cursor-pointer shrink-0 tap-feedback active:scale-90"
            aria-label="Close enquiry form"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Looking for custom software development, mobile apps, or IT career training in Sangli?
          Share your requirement below and our senior consultant will reach out with a tailored solution.
        </p>

        {/* Enquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs sm:text-sm">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                person
              </span>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#232884] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Phone Number & Email in 2 columns on tablets/desktop, responsive on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  call
                </span>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 80555 14368"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#232884] focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  mail
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#232884] focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Service / Training selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Interested Domain / Service <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                category
              </span>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#232884] focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer"
              >
                <option value="Custom Web Development">Custom Web Development</option>
                <option value="Mobile App Development (Android & iOS)">Mobile App Development (Android &amp; iOS)</option>
                <option value="Enterprise Software & ERP/CRM">Enterprise Software &amp; ERP/CRM</option>
                <option value="Full-Stack Python & Java Training">Full-Stack Python &amp; Java Job Training</option>
                <option value="MERN & Next.js Web Stack">MERN &amp; Next.js Web Stack</option>
                <option value="UI/UX & Product Design">UI/UX &amp; Product Design</option>
                <option value="Cloud, AWS & DevOps Setup">Cloud, AWS &amp; DevOps Setup</option>
                <option value="Other IT Consultation">Other IT Consultation</option>
              </select>
              <span className="material-symbols-outlined text-sm absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Message / Requirements */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Requirements / Message <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="message"
              rows={2}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us briefly about your project or career training goal..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#232884] focus:bg-white transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Submit Button with Real-time Light-Sweep Shimmer */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative overflow-hidden w-full py-3.5 rounded-xl bg-gradient-to-r from-[#232884] via-[#3239a0] to-[#232884] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {/* Real-time Shimmer Light Sweep */}
            {!isSubmitting && (
              <div
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-enquiry-shimmer"
                aria-hidden="true"
              />
            )}
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Your Enquiry...</span>
              </>
            ) : (
              <>
                <span>Submit Enquiry &amp; Request Callback</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* WhatsApp & Direct Call Footer Ribbon */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
            <span>100% Free Consultation • No Obligation</span>
          </div>
          <a
            href="https://wa.me/918055514368?text=Hello%20ITPL,%20I%20have%20an%20enquiry%20regarding%20IT%20services%20and%20training."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold text-[11px] hover:underline"
          >
            <img
              src="/live_assets/whatsapp-icon.png"
              alt="WhatsApp"
              className="w-3.5 h-3.5 object-contain"
            />
            <span>Instant Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
