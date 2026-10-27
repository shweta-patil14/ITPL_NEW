import React, { useState, useEffect } from 'react';
import { adminDb } from '../services/adminDb';

interface ContactSectionProps {
  selectedService: string;
  onFormSubmitSuccess: (message: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedService,
  onFormSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: selectedService || '',
    message: '',
  });

  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      return;
    }

    // Save inquiry to Admin DB (persists locally & syncs to Cloud Firestore in real time)
    adminDb.saveInquiry({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      service: formData.service,
      message: formData.message.trim(),
      source: 'Website Contact & Inquiry Form',
      status: 'New',
    });

    onFormSubmitSuccess(
      `Thank you, ${formData.name}! Your inquiry for "${formData.service}" has been received. Our Sangli team will contact you promptly at ${formData.phone}.`
    );
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    });
  };

  return (
    <section className="w-full py-16 bg-[#FAF8FF] border-b border-slate-200/70" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 self-start reveal-left">
            <span className="pill-bounce inline-block text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 cursor-default">
              CONTACT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2 mb-3">
              LET&apos;S <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">CONNECT NOW</span>
            </h2>
            <p className="text-slate-600 mb-6 text-xs sm:text-sm leading-relaxed">
              Connect with our software architects, cloud consultants, or student training counselors. We provide tailored proposals and career guidance.
            </p>

            <div className="space-y-3 mb-6">
              <div className="bounce-card mobile-float-card hover-lift-card flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#232884]/30 cursor-default">
                <span className="bounce-card-icon material-symbols-outlined text-[#232884] mt-0.5 text-xl">location_on</span>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Address</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                    1st Floor, Pearl Enclave, M.S.E.B. Road, Vishrambag, Sangli, Maharashtra 416416
                  </div>
                </div>
              </div>

              <div className="bounce-card mobile-float-card hover-lift-card flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#232884]/30 cursor-default">
                <span className="bounce-card-icon material-symbols-outlined text-[#232884] text-xl">call</span>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Call Us</div>
                  <div className="text-xs sm:text-sm font-bold text-[#232884]">
                    +91 8055514368
                  </div>
                </div>
              </div>

              <div className="bounce-card mobile-float-card hover-lift-card flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-[#232884]/30 cursor-default">
                <span className="bounce-card-icon material-symbols-outlined text-[#232884] text-xl">mail</span>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Email Us</div>
                  <div className="text-xs sm:text-sm font-bold text-[#232884]">
                    support@infoyashonand.com
                  </div>
                </div>
              </div>
            </div>

            <a
              className="btn-bounce inline-flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
              href="https://wa.me/918055514368"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/live_assets/whatsapp-icon.png"
                alt="WhatsApp"
                className="w-5 h-5 object-contain shrink-0"
              />
              <span>Chat Instantly on WhatsApp</span>
            </a>
          </div>

          {/* Right Column: Controlled Form */}
          <div className="lg:col-span-7 self-start reveal-right">
            <div className="p-5 sm:p-8 rounded-3xl bg-white border border-[#232884]/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full pointer-events-none"></div>
              <h3 className="text-xl font-extrabold text-[#0E1538] mb-1">Send an Inquiry</h3>
              <p className="text-xs text-slate-500 mb-5">
                Fill out the form below and our team will get back to you shortly.
              </p>

              <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@domain.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 8055514368"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service or Training Required *</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                    >
                      <option value="">Select Requirement</option>
                      <option value="Custom Software Development">Custom Software Development</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Android App Development">Android App Development</option>
                      <option value="Digital Marketing & SEO">Digital Marketing &amp; SEO</option>
                      <option value="Official WhatsApp & Bulk SMS API">Official WhatsApp &amp; Bulk SMS API</option>
                      <option value="IT Training & Job Placement">IT Training &amp; Job Placement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your project scope or training inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-bounce w-full py-3.5 rounded-xl bg-[#232884] text-white text-xs sm:text-sm font-bold hover:bg-[#141759] shadow-md transition-all cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
