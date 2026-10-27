/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollAnimationManager } from './components/ScrollAnimationManager';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
import { ProjectModal } from './components/ProjectModal';
import { ApplyModal } from './components/ApplyModal';
import { EnquiryModal } from './components/EnquiryModal';
import { BookletFloatingButton } from './components/BookletFloatingButton';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { TrainingPage } from './pages/TrainingPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TeamPage } from './pages/TeamPage';
import { ContactPage } from './pages/ContactPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { BonafideCertificatePage } from './pages/BonafideCertificatePage';
import { OfferLetterPage } from './pages/OfferLetterPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { adminDb } from './services/adminDb';

import { CourseItem, ProjectItem, ToastMessage } from './types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseItem | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ProjectItem | null>(null);

  // Quote Modal Form States
  const [quoteName, setQuoteName] = useState('');
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteBudget, setQuoteBudget] = useState('₹25k - ₹50k');
  const [quoteSummary, setQuoteSummary] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteName.trim() || !quotePhone.trim()) {
      triggerToast('Please provide your name and phone number', 'error');
      return;
    }

    setIsSubmittingQuote(true);
    try {
      // 1. Record inquiry lead in admin database (synced to Firestore & localStorage)
      adminDb.saveInquiry({
        name: quoteName.trim(),
        phone: quotePhone.trim(),
        company: quoteCompany.trim() || 'N/A',
        budget: quoteBudget,
        service: `IT Quote Request (${quoteBudget})`,
        message: quoteSummary.trim() || 'Free IT quote requested via website modal',
        source: 'Request a Free IT Quote Modal',
        status: 'New',
      });

      triggerToast('Quote request submitted successfully! An IT architect will respond within 2 hours.');
      setQuoteName('');
      setQuoteCompany('');
      setQuotePhone('');
      setQuoteBudget('₹25k - ₹50k');
      setQuoteSummary('');
      setIsQuoteModalOpen(false);
    } catch (err) {
      console.error('Error submitting quote:', err);
      triggerToast('Quote submitted! Our team will contact you shortly.');
      setIsQuoteModalOpen(false);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Automatic Enquiry Form trigger after 15 seconds (15,000 ms)
  useEffect(() => {
    // 15 seconds delay in milliseconds for desktop & mobile
    const FIFTEEN_SECONDS_MS = 15 * 1000;

    // Instant preview trigger via query param (?enquiry=true)
    const query = new URLSearchParams(window.location.search);
    if (query.get('enquiry') === 'true' || query.get('enquiry') === 'open') {
      setIsEnquiryModalOpen(true);
      return;
    }

    const timer = setTimeout(() => {
      // Don't interrupt candidates taking active proctored aptitude test or admin operations
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/candidate-dashboard')) {
        return;
      }
      setIsEnquiryModalOpen(true);
    }, FIFTEEN_SECONDS_MS);

    // Expose global trigger for instant testing in console
    (window as any).triggerEnquiryForm = () => setIsEnquiryModalOpen(true);

    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  const handleInstantSubmit = (scope: string, contactInfo: string) => {
    triggerToast(
      `Scope Request logged for [${scope}]: ${contactInfo}. Our IT consultant will call you within 30 minutes!`
    );
  };

  const handleServiceSelectInquiry = (serviceName: string) => {
    navigate(`/contact?service=${encodeURIComponent(serviceName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] overflow-x-clip w-full print:overflow-visible print:min-h-0 print:bg-white print:block print:w-full">
      {/* Scroll instantly to top on page navigation */}
      <ScrollToTop />

      {/* Global Scroll Animation Observer */}
      <ScrollAnimationManager />

      {/* Top Header Navbar */}
      <Header
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
      />

      {/* Multi-Page Routes with smooth page entrance transition */}
      <main className="w-full pt-[92px] min-[380px]:pt-[100px] sm:pt-28 lg:pt-32 flex-1 overflow-x-clip print:p-0 print:m-0 print:overflow-visible print:block print:w-full">
        <div key={location.pathname} className="animate-page-enter w-full print:animate-none print:transform-none print:overflow-visible print:block print:w-full">
          <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onInstantSubmit={handleInstantSubmit}
                onOpenSyllabusModal={(course) => setSelectedCourseForModal(course)}
                onSelectProject={(project) => setSelectedProjectForModal(project)}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/services"
            element={<ServicesPage onSelectServiceInquiry={handleServiceSelectInquiry} />}
          />
          <Route
            path="/training"
            element={
              <TrainingPage
                onOpenSyllabusModal={(course) => setSelectedCourseForModal(course)}
              />
            }
          />
          <Route
            path="/portfolio"
            element={
              <PortfolioPage
                onSelectProject={(project) => setSelectedProjectForModal(project)}
              />
            }
          />
          <Route path="/team" element={<TeamPage />} />
          <Route
            path="/contact"
            element={<ContactPage onFormSubmitSuccess={(msg) => triggerToast(msg)} />}
          />
          <Route path="/candidate-dashboard" element={<CandidateDashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<AdminPage />} />
          <Route path="/bonafide-certificate" element={<BonafideCertificatePage />} />
          <Route path="/bonafide" element={<BonafideCertificatePage />} />
          <Route path="/offer-letter" element={<OfferLetterPage />} />
          <Route path="/offer-letter-generator" element={<OfferLetterPage />} />
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
          <Route path="/verify-certificate/:certId" element={<VerifyCertificatePage />} />
          <Route path="/certificate/:certId" element={<VerifyCertificatePage />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Modal: Get Free Quote */}
      <Modal
        isOpen={isQuoteModalOpen}
        title="Request a Free IT Quote"
        onClose={() => setIsQuoteModalOpen(false)}
      >
        <form onSubmit={handleQuoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              required
              type="text"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={quoteCompany}
              onChange={(e) => setQuoteCompany(e.target.value)}
              placeholder="Your Business or Startup Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                required
                type="tel"
                value={quotePhone}
                onChange={(e) => setQuotePhone(e.target.value)}
                placeholder="+91 8055514368"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget</label>
              <select
                value={quoteBudget}
                onChange={(e) => setQuoteBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#232884] focus:bg-white cursor-pointer"
              >
                <option value="₹25k - ₹50k">₹25k - ₹50k</option>
                <option value="₹50k - ₹1.5 Lakh">₹50k - ₹1.5 Lakh</option>
                <option value="₹1.5 Lakh - ₹5 Lakh">₹1.5 Lakh - ₹5 Lakh</option>
                <option value="₹5 Lakh+">₹5 Lakh+</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Summary</label>
            <textarea
              rows={3}
              value={quoteSummary}
              onChange={(e) => setQuoteSummary(e.target.value)}
              placeholder="Explain requirements (web, app, enterprise software, marketing, cloud)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmittingQuote}
            className="btn-glow w-full py-3 rounded-xl bg-[#232884] text-white text-xs sm:text-sm font-bold hover:bg-[#141759] shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmittingQuote ? 'Submitting Request...' : 'Submit Free Quote Request'}
          </button>
        </form>
      </Modal>

      {/* Modal: Apply Now with Login & Application Workflow */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmitSuccess={(msg) => triggerToast(msg)}
      />

      {/* Modal: View Syllabus & Enroll */}
      {selectedCourseForModal && (
        <Modal
          isOpen={Boolean(selectedCourseForModal)}
          title={`${selectedCourseForModal.title} — Syllabus`}
          onClose={() => setSelectedCourseForModal(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <div>
                <span className="font-bold text-[#232884]">Batch Duration: </span>
                <span className="text-slate-700 font-semibold">{selectedCourseForModal.duration}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                {selectedCourseForModal.badge}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Curriculum Highlights:</h4>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-700">
                {selectedCourseForModal.highlights.map((highlight, idx) => (
                  <li key={idx} className="leading-snug">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const courseTitle = selectedCourseForModal.title;
                  setSelectedCourseForModal(null);
                  handleServiceSelectInquiry(courseTitle);
                  triggerToast(`Pre-selected "${courseTitle}". Fill your details to enroll!`);
                }}
                className="btn-glow w-full py-3 rounded-xl bg-[#232884] text-white text-xs sm:text-sm font-bold hover:bg-[#141759] shadow-md transition-all cursor-pointer"
              >
                Proceed to Enroll &amp; Apply
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Project Case Study Details with Architecture & ROI */}
      <ProjectModal
        project={selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onRequestSimilar={(projectName) => {
          setSelectedProjectForModal(null);
          handleServiceSelectInquiry(projectName);
          triggerToast(`Logged interest for [${projectName}]. Our lead architect will call you!`);
        }}
      />

      {/* Automatic Animated Enquiry Form (Displays automatically after 15 seconds) */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        onSubmitSuccess={(msg) => triggerToast(msg)}
      />

      {/* Animated Floating Company Booklet (PDF) Button in the corner */}
      <BookletFloatingButton onNotify={(msg) => triggerToast(msg, 'info')} />
    </div>
  );
}
