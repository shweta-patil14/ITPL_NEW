import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080C1D] text-white pt-11 pb-7 border-t border-white/10 relative overflow-hidden">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3D48C8] to-transparent shadow-[0_0_20px_rgba(61,72,200,0.8)]" />

      {/* Ambient Background Radial Glows */}
      <div className="absolute top-0 left-1/6 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-0 right-1/6 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.35fr_0.9fr_1fr_1.1fr_1.25fr] gap-6 lg:gap-7 xl:gap-8 mb-8 text-slate-300 items-start">
          {/* Column 1: Company Profile & Contacts */}
          <div>
            {/* Header: Exact Official Brand Logo */}
            <div className="h-12 sm:h-14 mb-3.5 flex items-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer"
                aria-label="Infoyashonand Technology Home"
              >
                {/* Emblem Icon */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-400/40 transition-all shadow-md">
                  <img
                    src="/company-logo-clean.png"
                    alt="Infoyashonand Technology Logo"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>

                {/* Vertical White Divider Line */}
                <div className="w-[2px] h-8 sm:h-10 bg-gradient-to-b from-white/90 via-white/50 to-white/20 rounded-full shrink-0 shadow-xs mx-0.5 sm:mx-1" />

                {/* Dual-line Official Brand Typography */}
                <div className="flex items-center min-w-0">
                  <svg
                    viewBox="0 0 670 170"
                    className="w-auto h-[26px] min-[360px]:h-[30px] sm:h-[36px] lg:h-[42px] shrink-0 select-none max-w-full"
                    style={{ overflow: 'visible' }}
                  >
                    <text
                      x="0"
                      y="90"
                      className="fill-white group-hover:fill-cyan-300 transition-colors duration-200"
                      fontFamily="'Oswald', Arial, sans-serif"
                      fontWeight="700"
                      fontSize="102"
                      textLength="670"
                      lengthAdjust="spacingAndGlyphs"
                    >
                      INFOYASHONAND
                    </text>
                    <text
                      x="0"
                      y="162"
                      className="fill-slate-300"
                      fontFamily="'Oswald', Arial, sans-serif"
                      fontWeight="700"
                      fontSize="64"
                      textLength="670"
                      lengthAdjust="spacingAndGlyphs"
                    >
                      TECHNOLOGY PVT. LTD.
                    </text>
                  </svg>
                </div>
              </Link>
            </div>

            <p className="leading-relaxed mb-3 text-slate-300 text-xs">
              Infoyashonand Technology Pvt. Ltd. is a trusted software development and IT services company based in Sangli, Maharashtra.
            </p>

            {/* Direct Contact Items */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-400 shrink-0 mt-0.5">location_on</span>
                <span className="text-slate-200 font-medium leading-snug">
                  1st Floor, Pearl Enclave, M.S.E.B. Rd, Sangli 416416
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-400 shrink-0">call</span>
                <div className="flex flex-wrap gap-x-1.5 text-slate-300">
                  <a href="tel:+918055514368" className="hover:text-white hover:underline transition-colors font-medium">
                    +91 8055514368
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-400 shrink-0">mail</span>
                <a
                  href="mailto:support@infoyashonand.com"
                  className="text-cyan-300 hover:text-white hover:underline transition-colors font-medium"
                >
                  support@infoyashonand.com
                </a>
              </div>
            </div>

            {/* Instagram and WhatsApp Social Action Logos */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
                <a
                  href="https://www.instagram.com/infoyashonand/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm hover:shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/918055514368"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] flex items-center justify-center text-white shadow-sm hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Chat on WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>

          {/* Column 2: Useful Links */}
          <div>
            <div className="h-10 mb-3.5 flex flex-col justify-center">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
                <span>Useful Links</span>
              </h4>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-1.5" />
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/about">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Services</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/training">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Training &amp; Job Consultant</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/portfolio">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Portfolio</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/team">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Our Team</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/contact">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/candidate-dashboard">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Candidate Portal &amp; Test</span>
                </Link>
              </li>
              <li>
                <a
                  className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group"
                  href="/INFOYASHONAND%20BOOKLET_20260117_161247_0000.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Company Booklet (PDF)</span>
                  <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    open_in_new
                  </span>
                </a>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/admin">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Admin Workspace</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <div className="h-10 mb-3.5 flex flex-col justify-center">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
                <span>Our Services</span>
              </h4>
              <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-1.5" />
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">App Development</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Web Development</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Software Development</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Digital Marketing</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/training">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Training &amp; Job Consultant</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">Cloud &amp; DevOps</span>
                </Link>
              </li>
              <li>
                <Link className="text-slate-300 hover:text-white transition-all inline-flex items-center gap-2 group" to="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">WhatsApp API</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div>
            <div className="h-10 mb-3.5 flex flex-col justify-center">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
                <span>Location</span>
              </h4>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1.5" />
            </div>
            <p className="mb-2 text-slate-400 leading-snug text-xs">Visit our development center:</p>
            <div className="p-3.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-300 shadow-md hover:border-blue-400/40 hover:bg-white/[0.06] transition-all group">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-base text-cyan-400">domain</span>
                <div className="font-bold text-white text-xs sm:text-sm">Vishrambag Headquarters</div>
              </div>
              <div className="text-xs leading-relaxed text-slate-300 pl-6">
                Opposite MSEB Office, Vishrambag, Sangli, Maharashtra 416416
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/10 text-emerald-400 font-semibold text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">schedule</span>
                <span>Open Mon - Sat (9:00 AM - 7:00 PM)</span>
              </div>
            </div>
          </div>

          {/* Column 5: Google Maps Section */}
          <div>
            <div className="h-10 mb-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">Google Maps</h4>
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1.5" />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Infoyashonand+Technology+Pvt+Ltd+Vishrambag+Sangli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-400/20 text-xs text-cyan-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-400/40 transition-all font-medium"
                title="Open location in Google Maps"
              >
                <span>Open in Maps</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
            <div className="w-full h-[142px] sm:h-[150px] rounded-xl overflow-hidden border border-white/10 shadow-md relative bg-slate-900 group hover:border-cyan-400/40 transition-all">
              <iframe
                title="Infoyashonand Technology Pvt Ltd Google Map"
                src="https://maps.google.com/maps?q=Infoyashonand%20Technology%20Pvt%20Ltd%20Vishrambag%20Sangli&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3.5">
          <p className="text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} <span className="text-slate-200 font-semibold">Infoyashonand Technology Pvt. Ltd.</span> All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
