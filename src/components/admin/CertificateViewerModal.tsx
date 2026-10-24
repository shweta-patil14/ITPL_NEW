import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { adminDb, CertificateCategory, CertificateRecord } from '../../services/adminDb';

export interface CertificateCalibrationSettings {
  printOnLetterheadPaper: boolean; // true: Blank space for pre-printed letterhead, false: Digital branding
  letterheadTopSpaceMm: number;    // default 42
  letterheadBottomSpaceMm: number; // default 26
  letterheadSideMarginMm: number;  // default 20
  contentFontSizePt: number;       // default 13
  contentLineSpacing: 'tight' | 'normal' | 'relaxed'; // default 'normal'
  showLetterheadGuide: boolean;    // default true
}

const DEFAULT_CERT_CALIBRATION: CertificateCalibrationSettings = {
  printOnLetterheadPaper: true,
  letterheadTopSpaceMm: 42,
  letterheadBottomSpaceMm: 26,
  letterheadSideMarginMm: 20,
  contentFontSizePt: 13,
  contentLineSpacing: 'normal',
  showLetterheadGuide: true,
};

interface CertificateViewerModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
  onSave?: (updatedCert: CertificateRecord) => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  certificate,
  onClose,
  onSave,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Live editable form state
  const [formData, setFormData] = useState<CertificateRecord | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Letterhead & Print Calibration state
  const [calibration, setCalibration] = useState<CertificateCalibrationSettings>(() => {
    try {
      const saved = localStorage.getItem('itpl_certificate_calibration');
      return saved ? { ...DEFAULT_CERT_CALIBRATION, ...JSON.parse(saved) } : DEFAULT_CERT_CALIBRATION;
    } catch {
      return DEFAULT_CERT_CALIBRATION;
    }
  });

  const handleCalibrationChange = <K extends keyof CertificateCalibrationSettings>(
    field: K,
    value: CertificateCalibrationSettings[K]
  ) => {
    setCalibration((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem('itpl_certificate_calibration', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetCalibration = () => {
    setCalibration(DEFAULT_CERT_CALIBRATION);
    try {
      localStorage.setItem('itpl_certificate_calibration', JSON.stringify(DEFAULT_CERT_CALIBRATION));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (certificate) {
      setFormData({ ...certificate });
      setHasSaved(false);
    }
  }, [certificate]);

  // Manage print classes on document.body for 100% isolated certificate printing
  useEffect(() => {
    if (!certificate) return;
    document.body.classList.add('certificate-modal-open');

    const handleBeforePrint = () => {
      document.body.classList.add('printing-certificate-only');
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-certificate-only');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      document.body.classList.remove('certificate-modal-open');
      document.body.classList.remove('printing-certificate-only');
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [certificate]);

  if (!certificate || !formData) return null;

  const handleFieldChange = (field: keyof CertificateRecord, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = () => {
    if (!formData) return;
    const updated = adminDb.updateCertificate(formData.id, formData);
    if (updated) {
      if (onSave) onSave(updated);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 3000);
    }
  };

  const handleReset = () => {
    if (certificate) {
      setFormData({ ...certificate });
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-certificate-only');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getVerificationUrl = (verificationId?: string) => {
    const id = verificationId || formData?.verificationId || '';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/verify-certificate?id=${encodeURIComponent(id)}`;
    }
    return `https://infoyashonand.com/verify-certificate?id=${encodeURIComponent(id)}`;
  };

  const handleCopyLink = () => {
    if (!formData) return;
    const url = getVerificationUrl(formData.verificationId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-IN');
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadgeLabel = () => {
    switch (formData.category) {
      case 'experience':
        return 'Experience Certificate';
      case 'award':
        return 'Award Certificate';
      case 'recommendation':
        return 'Recommendation Certificate';
      default:
        return 'Official Certificate';
    }
  };

  const getCategoryTitle = () => {
    switch (formData.category) {
      case 'experience':
        return 'CERTIFICATE OF EXPERIENCE';
      case 'award':
        return 'CERTIFICATE OF EXCELLENCE & ACHIEVEMENT';
      case 'recommendation':
        return 'LETTER OF RECOMMENDATION';
      default:
        return 'CERTIFICATE OF COMPLETION';
    }
  };

  // 1. Digital Letterhead Header (Navy Blue Bar, Logos, CIN, GST, Core Values, Address Ribbon)
  const renderDigitalHeader = () => (
    <div className="w-full relative z-10 shrink-0">
      {/* Primary Header Row: Navy Blue Bar with Dual White Stripes, Logo, Company Name, CIN, GST */}
      <div className="w-full bg-[#102068] text-white px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 shrink-0 h-11 sm:h-13">
            <div className="w-1.5 h-full bg-white rounded-xs"></div>
            <div className="w-1.5 h-full bg-white rounded-xs"></div>
          </div>

          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full p-0.5 flex items-center justify-center shrink-0 shadow-sm border border-white">
            <img
              src="/company-logo-clean.png"
              alt="Infoyashonand Technology Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="leading-tight">
            <h1
              className="text-base sm:text-xl font-black tracking-tight text-white font-sans uppercase"
              style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}
            >
              INFOYASHONAND
            </h1>
            <h2
              className="text-sm sm:text-lg font-bold tracking-tight text-white font-sans uppercase"
              style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}
            >
              TECHNOLOGY PVT. LTD.
            </h2>
          </div>
        </div>

        {/* Right: CIN & GST */}
        <div className="text-right text-[10px] sm:text-[11px] font-bold text-white space-y-1 font-mono">
          <div className="flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 bg-white inline-block"></span>
            <span>CIN : U01100PN2016PTC164525</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 bg-white inline-block"></span>
            <span>GST : 27AAECI1576L2Z7</span>
          </div>
        </div>
      </div>

      {/* Core Values Sub-bar */}
      <div className="w-full bg-white border-y border-slate-200 py-1 px-4 text-center">
        <p className="text-[8px] sm:text-[9.5px] font-black tracking-wider text-[#102068] uppercase font-sans">
          INNOVATION &nbsp;|&nbsp; EMPOWERMENT &nbsp;|&nbsp; COMMITMENT &nbsp;|&nbsp; POSITIVE MIND SET &nbsp;|&nbsp; INTEGRITY &nbsp;|&nbsp; COLLABORATION &nbsp;|&nbsp; GROWTH
        </p>
      </div>

      {/* Address Ribbon Bar */}
      <div className="w-full bg-[#16234d] text-white py-1.5 px-4 sm:px-6 flex items-center justify-center gap-1.5 text-center shadow-xs">
        <span className="material-symbols-outlined text-rose-400 text-xs sm:text-sm shrink-0">
          location_on
        </span>
        <p className="text-[9px] sm:text-[10px] font-semibold tracking-wide font-sans leading-tight">
          Pearl Enclave, S.No. 4360/K; Walchand College Corner, MSEB Rd, Opp. Safa Bakery, Vishrambag, Sangli, Maharashtra 416 416.
        </p>
      </div>
    </div>
  );

  // 2. Digital Letterhead Footer Ribbon
  const renderDigitalFooter = () => (
    <div className="w-full bg-[#16234d] text-white py-2 px-4 sm:px-6 relative z-10 shrink-0 shadow-inner">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[9px] sm:text-[10.5px] font-medium font-sans">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-rose-400 text-xs sm:text-sm">mail</span>
          <span>Email : support@infoyashonand.com</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-400 text-xs sm:text-sm">language</span>
          <span>Website : www.infoyashonand.com</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-emerald-400 text-xs sm:text-sm">call</span>
          <span>Mobile : 8600876577 / 8055514368</span>
        </div>
      </div>
    </div>
  );

  // 3. Dynamic Header Zone (WYSIWYG: exact same height on screen and in print)
  const renderHeaderZone = () => {
    if (calibration.printOnLetterheadPaper) {
      return (
        <div
          className="w-full relative z-10 shrink-0 flex items-center justify-center transition-all select-none"
          style={{ height: `${calibration.letterheadTopSpaceMm || 42}mm` }}
        >
          {calibration.showLetterheadGuide && (
            <div className="no-print mx-4 sm:mx-6 w-full h-[calc(100%-8px)] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-center text-center p-2">
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-white rounded-full border border-blue-200 text-blue-900 text-[11px] font-mono shadow-xs font-semibold">
                <span className="material-symbols-outlined text-sm text-blue-600">vertical_align_top</span>
                <span>Pre-Printed Letterhead Header Zone ({calibration.letterheadTopSpaceMm || 42}mm)</span>
              </span>
            </div>
          )}
        </div>
      );
    }

    return renderDigitalHeader();
  };

  // 4. Dynamic Footer Zone (WYSIWYG: exact same height on screen and in print)
  const renderFooterZone = () => {
    if (calibration.printOnLetterheadPaper) {
      return (
        <div
          className="w-full relative z-10 shrink-0 flex items-center justify-center transition-all select-none"
          style={{ height: `${calibration.letterheadBottomSpaceMm || 26}mm` }}
        >
          {calibration.showLetterheadGuide && (
            <div className="no-print mx-4 sm:mx-6 w-full h-[calc(100%-6px)] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-center text-center p-2">
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-white rounded-full border border-blue-200 text-blue-900 text-[11px] font-mono shadow-xs font-semibold">
                <span className="material-symbols-outlined text-sm text-blue-600">vertical_align_bottom</span>
                <span>Pre-Printed Letterhead Footer Zone ({calibration.letterheadBottomSpaceMm || 26}mm)</span>
              </span>
            </div>
          )}
        </div>
      );
    }

    return renderDigitalFooter();
  };

  return (
    <div className="certificate-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="certificate-modal-container bg-white max-w-[1550px] w-full rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[96vh] overflow-y-auto flex flex-col">
        {/* Top Controls Header (Hidden in Print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Certificate Studio: Edit &amp; Live Preview</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {getCategoryBadgeLabel()}
                </span>
                {hasSaved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check</span>
                    <span>Saved Live!</span>
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Verification ID: <span className="font-bold text-blue-700">{formData.verificationId}</span> • Status:{' '}
                <span className="text-emerald-600 font-bold">Valid Corporate Record</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Save changes to database"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-lg font-bold"
              title="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN 2-COLUMN GRID: LEFT = LIVE EDITOR, RIGHT = LIVE PREVIEW */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* ========================================================== */}
          {/* LEFT COLUMN: LIVE FORM EDITOR (.no-print) */}
          {/* ========================================================== */}
          <div className="no-print lg:col-span-5 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-display">
                  Input Format (Editable Content)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Edits below update the official certificate preview in real time.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Bold Fields Live Synced
              </span>
            </div>

            {/* 0. Pre-Printed Letterhead Paper & Print Calibration Setup */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-200/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-700 text-lg">tune</span>
                  <div>
                    <p className="font-black text-indigo-950 text-xs">
                      Letterhead &amp; Print Calibration
                    </p>
                    <p className="text-[10.5px] text-indigo-700">
                      Live sync between on-screen preview &amp; print output
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetCalibration}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Reset to official standard (Top 42mm, Bottom 26mm, Sides 20mm)"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-indigo-950 text-[11px]">
                  Letterhead Paper Output Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCalibrationChange('printOnLetterheadPaper', true)}
                    className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      calibration.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    <span>Pre-Printed Stationery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCalibrationChange('printOnLetterheadPaper', false)}
                    className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      !calibration.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">palette</span>
                    <span>Digital Branding</span>
                  </button>
                </div>
                <p className="text-[10px] text-indigo-700">
                  {calibration.printOnLetterheadPaper
                    ? '✓ Blank top & bottom margins reserved for company pre-printed stationery paper.'
                    : '✓ Full navy blue company header and footer ribbon printed directly.'}
                </p>
              </div>

              {calibration.printOnLetterheadPaper && (
                <div className="pt-2 border-t border-indigo-200/60 space-y-3">
                  {/* Top Blank Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-indigo-950 text-[11px]">
                        Top Blank Margin (Header Zone):
                      </label>
                      <span className="font-mono font-bold text-xs text-blue-800 px-2 py-0.5 rounded-md bg-white border border-indigo-200">
                        {calibration.letterheadTopSpaceMm || 42} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={20}
                        max={70}
                        step={1}
                        value={calibration.letterheadTopSpaceMm || 42}
                        onChange={(e) =>
                          handleCalibrationChange('letterheadTopSpaceMm', Number(e.target.value) || 42)
                        }
                        className="w-full accent-blue-700 cursor-pointer"
                      />
                    </div>
                    <span className="text-[9.5px] text-indigo-600 block mt-0.5">
                      Standard company header: 42mm
                    </span>
                  </div>

                  {/* Bottom Blank Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-indigo-950 text-[11px]">
                        Bottom Blank Margin (Footer Zone):
                      </label>
                      <span className="font-mono font-bold text-xs text-blue-800 px-2 py-0.5 rounded-md bg-white border border-indigo-200">
                        {calibration.letterheadBottomSpaceMm || 26} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={calibration.letterheadBottomSpaceMm || 26}
                        onChange={(e) =>
                          handleCalibrationChange('letterheadBottomSpaceMm', Number(e.target.value) || 26)
                        }
                        className="w-full accent-blue-700 cursor-pointer"
                      />
                    </div>
                    <span className="text-[9.5px] text-indigo-600 block mt-0.5">
                      Standard company footer ribbon: 26mm
                    </span>
                  </div>

                  {/* Side Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-indigo-950 text-[11px]">
                        Left &amp; Right Side Margins:
                      </label>
                      <span className="font-mono font-bold text-xs text-blue-800 px-2 py-0.5 rounded-md bg-white border border-indigo-200">
                        {calibration.letterheadSideMarginMm || 20} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      step={1}
                      value={calibration.letterheadSideMarginMm || 20}
                      onChange={(e) =>
                        handleCalibrationChange('letterheadSideMarginMm', Number(e.target.value) || 20)
                      }
                      className="w-full accent-blue-700 cursor-pointer"
                    />
                  </div>

                  {/* Font Size & Spacing Live Calibration */}
                  <div className="pt-2 border-t border-indigo-200/60 grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-indigo-950 text-[10.5px] mb-1">
                        Body Font Size
                      </label>
                      <div className="flex items-center gap-1">
                        {[12, 12.5, 13, 13.5].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleCalibrationChange('contentFontSizePt', size)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (calibration.contentFontSizePt || 13) === size
                                ? 'bg-blue-700 text-white border-blue-800 shadow-2xs'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-indigo-950 text-[10.5px] mb-1">
                        Line Spacing
                      </label>
                      <div className="flex items-center gap-1">
                        {(['tight', 'normal', 'relaxed'] as const).map((spacing) => (
                          <button
                            key={spacing}
                            type="button"
                            onClick={() => handleCalibrationChange('contentLineSpacing', spacing)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border capitalize transition-all cursor-pointer ${
                              (calibration.contentLineSpacing || 'normal') === spacing
                                ? 'bg-blue-700 text-white border-blue-800 shadow-2xs'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {spacing === 'tight' ? 'Tight' : spacing === 'normal' ? 'Norm' : 'Wide'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label
                      htmlFor="certShowLetterheadGuide"
                      className="text-[11px] font-semibold text-indigo-900 cursor-pointer select-none"
                    >
                      Show safe zone outlines on screen
                    </label>
                    <input
                      type="checkbox"
                      id="certShowLetterheadGuide"
                      checked={calibration.showLetterheadGuide}
                      onChange={(e) => handleCalibrationChange('showLetterheadGuide', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value as CertificateCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-blue-900 font-bold focus:outline-blue-600 cursor-pointer shadow-xs"
                >
                  <option value="experience">1. Experience Certificate</option>
                  <option value="award">2. Award Certificate</option>
                  <option value="recommendation">3. Recommendation Certificate</option>
                </select>
              </div>

              {/* Recipient Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => handleFieldChange('recipientName', e.target.value)}
                  placeholder="e.g. Akshad Shinde"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-semibold"
                />
              </div>

              {/* Recipient Email & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.recipientEmail}
                    onChange={(e) => handleFieldChange('recipientEmail', e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Issue *</label>
                  <input
                    type="date"
                    required
                    value={formData.issuedDate}
                    onChange={(e) => handleFieldChange('issuedDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* ====================================================== */}
              {/* CATEGORY 1: EXPERIENCE CERTIFICATE FIELDS */}
              {/* ====================================================== */}
              {formData.category === 'experience' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Designation / Role *</label>
                      <input
                        type="text"
                        required
                        value={formData.designation || ''}
                        onChange={(e) => handleFieldChange('designation', e.target.value)}
                        placeholder="Full-Stack Web Development (React & Node.js)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department *</label>
                      <input
                        type="text"
                        required
                        value={formData.department || ''}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        placeholder="Technology"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => handleFieldChange('startDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => handleFieldChange('endDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => handleFieldChange('duration', e.target.value)}
                        placeholder="4 Months"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Performance Grade</label>
                    <select
                      value={formData.performanceGrade || 'Outstanding (A+)'}
                      onChange={(e) => handleFieldChange('performanceGrade', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    >
                      <option value="Outstanding (A+)">Outstanding (A+)</option>
                      <option value="Excellent (A)">Excellent (A)</option>
                      <option value="Very Good (B+)">Very Good (B+)</option>
                      <option value="Commendable">Commendable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Key Responsibilities &amp; Focus</label>
                    <textarea
                      rows={3}
                      value={formData.responsibilities || ''}
                      onChange={(e) => handleFieldChange('responsibilities', e.target.value)}
                      placeholder="Successfully built and delivered responsive web applications, integrated microservices, and collaborated on full-stack architecture."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* CATEGORY 2: AWARD CERTIFICATE FIELDS */}
              {/* ====================================================== */}
              {formData.category === 'award' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Award Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.awardTitle || ''}
                        onChange={(e) => handleFieldChange('awardTitle', e.target.value)}
                        placeholder="e.g. Star Performer of the Year"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Award Domain / Category *</label>
                      <input
                        type="text"
                        required
                        value={formData.awardCategory || ''}
                        onChange={(e) => handleFieldChange('awardCategory', e.target.value)}
                        placeholder="e.g. Mobile Engineering &amp; Cloud"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Citation / Reason for Recognition *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.citation || ''}
                      onChange={(e) => handleFieldChange('citation', e.target.value)}
                      placeholder="Presented in recognition of outstanding commitment, exceptional technical skill, and exemplary contributions to enterprise systems."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* ====================================================== */}
              {/* CATEGORY 3: RECOMMENDATION CERTIFICATE FIELDS */}
              {/* ====================================================== */}
              {formData.category === 'recommendation' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role / Association at ITPL *</label>
                      <input
                        type="text"
                        required
                        value={formData.associationRole || ''}
                        onChange={(e) => handleFieldChange('associationRole', e.target.value)}
                        placeholder="e.g. Full-Stack Web Development Trainee"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recommended For *</label>
                      <input
                        type="text"
                        required
                        value={formData.recommendedFor || ''}
                        onChange={(e) => handleFieldChange('recommendedFor', e.target.value)}
                        placeholder="e.g. Master's in CS / Senior Software Engineer"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Key Strengths &amp; Competencies</label>
                    <input
                      type="text"
                      value={formData.keyStrengths || ''}
                      onChange={(e) => handleFieldChange('keyStrengths', e.target.value)}
                      placeholder="Full-Stack Architecture, Algorithmic Thinking, Problem Solving, High Ownership"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Recommendation Letter Note *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.recommendationNote || ''}
                      onChange={(e) => handleFieldChange('recommendationNote', e.target.value)}
                      placeholder="Official recommendation endorsement statement..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Form Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
                >
                  Reset Edits
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

            {/* Live QR Verification Card in Editor Column */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50/90 to-indigo-50/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-lg">qr_code_scanner</span>
                    <h5 className="font-bold text-xs text-blue-950">Live QR Verification</h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    <span>Live Synced</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg shrink-0">
                    <QRCodeSVG
                      value={getVerificationUrl(formData.verificationId)}
                      size={68}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-[11px] space-y-1 min-w-0 flex-1">
                    <p className="font-bold text-slate-800 leading-tight">
                      Scan or test verification URL
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate" title={getVerificationUrl(formData.verificationId)}>
                      {getVerificationUrl(formData.verificationId)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={getVerificationUrl(formData.verificationId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                        <span>Open Page</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Scanning this QR code or visiting the URL loads the authenticated verification portal. All changes saved here update that page live in real time.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: LIVE REAL-TIME CERTIFICATE PREVIEW */}
          {/* ========================================================== */}
          <div className="certificate-preview-column lg:col-span-7 flex flex-col items-center w-full">
            {/* Live Preview Mode & Margin Status Bar */}
            <div className="no-print w-full max-w-[760px] bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-lg">preview</span>
                  <div>
                    <span className="font-black text-xs text-slate-900 font-display uppercase tracking-wider block">
                      Live Project Preview &amp; Print Calibration
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      What is shown below will print identically in the print preview
                    </span>
                  </div>
                </div>

                {/* Instant View Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleCalibrationChange('printOnLetterheadPaper', true)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      calibration.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>Letterhead Paper</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCalibrationChange('printOnLetterheadPaper', false)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      !calibration.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">palette</span>
                    <span>Digital Branding</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-3">
                  {calibration.printOnLetterheadPaper && (
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={calibration.showLetterheadGuide}
                        onChange={(e) => handleCalibrationChange('showLetterheadGuide', e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
                      />
                      <span>Show Safe Zone Outlines in Preview</span>
                    </label>
                  )}
                </div>
                <div className="font-mono text-slate-600 font-medium">
                  {calibration.printOnLetterheadPaper ? (
                    <span>
                      Blank Top: <strong className="text-blue-800">{calibration.letterheadTopSpaceMm || 42}mm</strong> | Blank Bottom: <strong className="text-blue-800">{calibration.letterheadBottomSpaceMm || 26}mm</strong> | Sides: <strong className="text-blue-800">{calibration.letterheadSideMarginMm || 20}mm</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      ✓ Full Navy Blue Header &amp; Footer Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={printRef}
              id="itpl-certificate-printable"
              className="w-full max-w-[760px] bg-white border border-slate-300 shadow-xl rounded-sm text-slate-900 flex flex-col justify-between overflow-hidden relative"
              style={{
                minHeight: '940px',
                fontFamily: "'Times New Roman', Times, serif, system-ui",
              }}
            >
              {/* Background Watermark (Only shown for Digital Branding, removed for Pre-Printed Stationery) */}
              {!calibration.printOnLetterheadPaper && (
                <div
                  className="letterhead-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  style={{ opacity: 0.07 }}
                >
                  <img
                    src="/company-logo-clean.png"
                    alt="Infoyashonand Technology Watermark"
                    className="w-[360px] sm:w-[440px] h-auto object-contain filter grayscale"
                  />
                </div>
              )}

              {/* Dynamic Header Zone (Pre-printed blank margin or Digital Header) */}
              {renderHeaderZone()}

              {/* 2. CERTIFICATE BODY CONTENT ACCORDING TO LIVE FORM DATA */}
              <div
                className="flex-1 flex flex-col justify-between relative z-10 text-slate-900 transition-all"
                style={{
                  paddingLeft: `${calibration.letterheadSideMarginMm || 20}mm`,
                  paddingRight: `${calibration.letterheadSideMarginMm || 20}mm`,
                  paddingTop: calibration.printOnLetterheadPaper ? '6px' : '14px',
                  paddingBottom: calibration.printOnLetterheadPaper ? '6px' : '14px',
                  fontSize: `${calibration.contentFontSizePt || 13}px`,
                  lineHeight:
                    calibration.contentLineSpacing === 'tight'
                      ? 1.32
                      : calibration.contentLineSpacing === 'relaxed'
                      ? 1.55
                      : 1.4,
                }}
              >
                <div>
                  {/* Meta numbers row */}
                  <div className="flex justify-between items-start text-xs sm:text-sm font-sans font-bold pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-500">Certificate ID:</span>{' '}
                        <span className="font-mono text-blue-900 font-bold">{formData.verificationId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Category:</span>{' '}
                        <span className="text-slate-800 uppercase text-[11px] font-extrabold tracking-wider">
                          {getCategoryBadgeLabel()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div>
                        <span className="text-slate-500">Date of Issue:</span>{' '}
                        <span className="font-mono text-slate-900">{formatDate(formData.issuedDate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className="text-emerald-700 font-bold">● Valid Corporate Record</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Badge Pill: Certificate Title */}
                  <div className="text-center my-6">
                    <span className="inline-block bg-[#102068] text-white px-8 sm:px-10 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm font-sans">
                      {getCategoryTitle()}
                    </span>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 1: EXPERIENCE CERTIFICATE */}
                  {/* ======================================================= */}
                  {formData.category === 'experience' && (
                    <div className="space-y-5 text-justify leading-relaxed">
                      <p className="text-center font-bold text-sm tracking-wider uppercase text-slate-700 font-sans">
                        TO WHOMSOEVER IT MAY CONCERN
                      </p>

                      <p className="text-sm sm:text-base pt-2">
                        This is to certify that{' '}
                        <strong className="font-bold text-slate-950 underline decoration-slate-400 underline-offset-4">
                          {formData.recipientName || 'Candidate Name'}
                        </strong>{' '}
                        was employed and actively engaged with{' '}
                        <strong>Infoyashonand Technology Pvt. Ltd.</strong> in the capacity of{' '}
                        <strong className="text-blue-950 font-bold">
                          {formData.designation || 'Full-Stack Web Development (React & Node.js)'}
                        </strong>{' '}
                        within the <strong>{formData.department || 'Technology'}</strong> department from{' '}
                        <span className="font-mono font-semibold">{formatDate(formData.startDate)}</span> to{' '}
                        <span className="font-mono font-semibold">{formatDate(formData.endDate)}</span>
                        {formData.duration ? ` (${formData.duration})` : ''}.
                      </p>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2 font-sans">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-700 shrink-0">Key Responsibilities &amp; Focus:</span>
                          <span className="text-slate-800 font-medium">
                            {formData.responsibilities ||
                              'Successfully built and delivered responsive web applications, integrated microservices, and collaborated on full-stack architecture.'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                          <span className="font-bold text-slate-700 shrink-0">Overall Performance Grade:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                            {formData.performanceGrade || 'Outstanding (A+)'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base">
                        During their tenure, we observed {formData.recipientName || 'them'} to be a highly dedicated, self-motivated, and disciplined professional with a strong commitment to quality engineering. Their conduct, character, and professional attitude were exemplary.
                      </p>

                      <p className="text-sm sm:text-base">
                        We extend our sincere appreciation for their valuable contributions to Infoyashonand Technology Pvt. Ltd. and wish them immense success and growth in all their future career pursuits.
                      </p>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* CATEGORY 2: AWARD CERTIFICATE */}
                  {/* ======================================================= */}
                  {formData.category === 'award' && (
                    <div className="space-y-6 text-center leading-relaxed">
                      <p className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-slate-500">
                        THIS CERTIFICATE IS PROUDLY CONFERRED UPON
                      </p>

                      <div className="py-2">
                        <h2
                          className="text-2xl sm:text-3xl font-black text-[#102068] tracking-tight uppercase underline decoration-amber-400 decoration-2 underline-offset-8"
                          style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}
                        >
                          {formData.recipientName || 'Candidate Name'}
                        </h2>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium">
                        In formal recognition of extraordinary technical competence, outstanding dedication, and exemplary achievements in:
                      </p>

                      <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-1.5 max-w-xl mx-auto shadow-xs">
                        <h3 className="text-base sm:text-lg font-black text-amber-950 font-sans uppercase tracking-tight">
                          {formData.awardTitle || 'Excellence in Engineering & Innovation'}
                        </h3>
                        {formData.awardCategory && (
                          <p className="text-xs font-bold text-amber-800 font-sans">
                            Domain / Category: {formData.awardCategory}
                          </p>
                        )}
                      </div>

                      <div className="max-w-xl mx-auto text-justify text-xs sm:text-sm leading-relaxed text-slate-700 italic px-4">
                        &quot;{formData.citation ||
                          'Awarded for demonstration of outstanding work ethic, technical brilliance, and significant contributions toward driving innovation and project excellence at Infoyashonand Technology Pvt. Ltd.'}&quot;
                      </div>

                      <p className="text-xs text-slate-500 font-sans font-medium pt-1">
                        Conferred on this day,{' '}
                        <span className="font-mono font-bold text-slate-800">{formatDate(formData.issuedDate)}</span>, under corporate authority of Infoyashonand Technology Pvt. Ltd.
                      </p>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* CATEGORY 3: RECOMMENDATION CERTIFICATE */}
                  {/* ======================================================= */}
                  {formData.category === 'recommendation' && (
                    <div className="space-y-4 text-justify leading-relaxed">
                      <p className="text-center font-bold text-sm tracking-wider uppercase text-slate-700 font-sans">
                        TO WHOM IT MAY CONCERN
                      </p>

                      <p className="text-sm sm:text-base pt-1">
                        It is my distinct privilege to furnish this official recommendation for{' '}
                        <strong className="font-bold text-slate-950 underline decoration-slate-400 underline-offset-4">
                          {formData.recipientName || 'Candidate Name'}
                        </strong>
                        , who has been associated with <strong>Infoyashonand Technology Pvt. Ltd.</strong> in the capacity of{' '}
                        <strong className="text-blue-950">
                          {formData.associationRole || 'Full-Stack Web Development Trainee'}
                        </strong>
                        .
                      </p>

                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-xs sm:text-sm space-y-2 font-sans">
                        <div>
                          <span className="font-bold text-blue-950">Recommended For: </span>
                          <span className="text-slate-800 font-semibold">
                            {formData.recommendedFor ||
                              "Master's Degree in Computer Science & Advanced Software Engineering Roles"}
                          </span>
                        </div>
                        {formData.keyStrengths && (
                          <div className="pt-1 border-t border-blue-200">
                            <span className="font-bold text-blue-950">Demonstrated Strengths &amp; Core Competencies: </span>
                            <span className="text-slate-700 font-medium">{formData.keyStrengths}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm sm:text-base">
                        {formData.recommendationNote ||
                          'Throughout their engagement with us, they demonstrated exceptional intellectual agility, structured problem-solving skills, and deep engineering discipline. They adapted rapidly to enterprise workflows, collaborated effectively with cross-functional development teams, and displayed exemplary accountability.'}
                      </p>

                      <p className="text-sm sm:text-base">
                        Based on their consistent excellence and strong character, I recommend{' '}
                        {formData.recipientName || 'them'} with highest confidence. I am certain they will be an invaluable asset to any prospective academic program or corporate organization.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Authority Signature & QR block */}
                <div className="pt-10 sm:pt-14 pb-2 flex justify-between items-end text-xs sm:text-sm font-sans gap-2">
                  {/* Official Stamp Box / Verification Seal */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center text-[10px] text-slate-400 space-y-1 w-28 sm:w-32 shrink-0">
                    <span className="material-symbols-outlined text-lg text-slate-300 block">verified_user</span>
                    <p className="font-bold text-slate-600 font-mono">SEAL &amp; STAMP</p>
                    <p className="text-[8px] text-slate-400">ITPL Authorized Corporate Seal</p>
                  </div>

                  {/* Middle: LIVE SYNCED QR CODE */}
                  <div className="border border-slate-200 bg-white p-2 rounded-xl text-center flex flex-col items-center justify-center shadow-xs shrink-0">
                    <QRCodeSVG
                      value={getVerificationUrl(formData.verificationId)}
                      size={74}
                      level="M"
                      includeMargin={false}
                    />
                    <p className="font-bold text-[8.5px] text-slate-700 font-sans tracking-tight uppercase mt-1">
                      Scan to Verify Live
                    </p>
                    <p className="font-mono text-[7.5px] font-bold text-blue-700">
                      {formData.verificationId}
                    </p>
                  </div>

                  {/* Signatory Title */}
                  <div className="text-right space-y-1 shrink-0 w-44 sm:w-52">
                    <div className="h-8 flex items-end justify-end">
                      <span className="text-[12px] font-mono italic text-blue-900 font-bold">
                        ~ {formData.signatoryName || 'Shriram Khabale'}
                      </span>
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {formData.signatoryName || 'Shriram Khabale'}
                      </p>
                      <p className="text-[11px] font-semibold text-blue-800">
                        {formData.signatoryTitle || 'Founder & Chief Executive Officer'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {formData.companyName || 'Infoyashonand Technology Pvt. Ltd.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Footer Zone (Pre-printed blank margin or Digital Footer) */}
              {renderFooterZone()}
            </div>

            <p className="no-print text-center text-[11px] text-slate-400 mt-2">
              Tip: What you see in the preview above matches the printed output 1:1. Use the calibration sliders on the left to fine-tune margins.
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer Notice */}
        <div className="no-print pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            All modifications made in the left editor update the official certificate preview live and can be saved with one click.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
