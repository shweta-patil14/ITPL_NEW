import React, { useState, useRef, useEffect } from 'react';

export interface OfferLetterData {
  letterDate: string; // "Date: 03-08-2026"
  candidateName: string; // "Mr. Akshad Anandrao Shinde" (BOLD)
  candidateAddress: string; // "A/p Sangli" (BOLD)
  position: string; // "Web Developer Intern" (BOLD)
  joiningDate: string; // "3 August, 2026" (BOLD)
  endDate: string; // "3 July, 2027" (BOLD)
  postingPlace: string; // "Walchand College Corner, S.No4360/K;FLAT NO F-3;Pearl Enclave, MSEB Rd, opp. Safa Bakery, Vishrambag, Sangli, Maharashtra 416416"
  workingHours: string; // "9:00 AM to 6:00 PM, Monday to Saturday"
  reportingAuthority: string; // "Ms. Kshitija Patil [HR Manager]"
  noticePeriod: string; // "prior 1 month"
  mandatoryDays: string; // "297 working days"
  evaluationPeriod: string; // "two-month"
  hrName: string; // "Ms. Kshitija Patil"
  hrTitle: string; // "Human Resource Manager"
  companyName: string; // "Infoyashonand Technology Pvt. Ltd"
  hrEmail: string; // "hr@infoyashonand.com"
  supportEmail: string; // "support@infoyashonand.com"
  supportPhone: string; // "8600876577 / 8055514368"
  websiteUrl: string; // "www.infoyashonand.com"
  cinNumber: string; // "U01100PN2016PTC164525"
  gstNumber: string; // "27AAECI1576L2Z7"
  showCollegeStamp: boolean; // Dean/HOD stamp box toggle
  includeLetterhead: boolean; // Toggle header/footer (default true)
  printOnLetterheadPaper: boolean; // true: Blank space for pre-printed letterhead, false: Digital branding with full color header/footer
  letterheadTopSpaceMm: number; // Blank space at top in mm (default 42)
  letterheadBottomSpaceMm: number; // Blank space at bottom in mm (default 26)
  letterheadSideMarginMm: number; // Left/Right side margin in mm (default 20)
  contentFontSizePt: number; // Font size in px (default 12.5)
  contentLineSpacing: 'tight' | 'normal' | 'relaxed'; // Line spacing
  showLetterheadGuide: boolean; // Show guide outlines in preview (default true)
  previewLetterheadPaper?: boolean; // legacy alias
}

const DEFAULT_OFFER_DATA: OfferLetterData = {
  letterDate: '03-08-2026',
  candidateName: 'Ms. shweta',
  candidateAddress: 'A/p Sangli',
  position: 'Web Developer Intern',
  joiningDate: '3 August, 2026',
  endDate: '3 nov, 2026',
  postingPlace:
    'Pearl Enclave, S.No. 4360/K; Walchand College Corner, MSEB Rd, Opp. Safa Bakery, Vishrambag, Sangli, Maharashtra 416 416.',
  workingHours: '9:00 AM to 6:00 PM, Monday to Saturday',
  reportingAuthority: 'Ms. Kshitija Patil [HR Manager]',
  noticePeriod: 'prior 1 month',
  mandatoryDays: '297 working days',
  evaluationPeriod: 'two-month',
  hrName: 'Ms. Kshitija Patil',
  hrTitle: 'Human Resource Manager',
  companyName: 'Infoyashonand Technology Pvt. Ltd',
  hrEmail: 'hr@infoyashonand.com',
  supportEmail: 'support@infoyashonand.com',
  supportPhone: '8600876577 / 8055514368',
  websiteUrl: 'www.infoyashonand.com',
  cinNumber: 'U01100PN2016PTC164525',
  gstNumber: '27AAECI1576L2Z7',
  showCollegeStamp: true,
  includeLetterhead: true,
  printOnLetterheadPaper: true,
  letterheadTopSpaceMm: 42,
  letterheadBottomSpaceMm: 26,
  letterheadSideMarginMm: 20,
  contentFontSizePt: 12.5,
  contentLineSpacing: 'normal',
  showLetterheadGuide: true,
  previewLetterheadPaper: false,
};

export const OfferLetterGenerator: React.FC = () => {
  const [data, setData] = useState<OfferLetterData>(() => {
    try {
      const saved = localStorage.getItem('itpl_current_offer_letter');
      return saved ? { ...DEFAULT_OFFER_DATA, ...JSON.parse(saved) } : DEFAULT_OFFER_DATA;
    } catch {
      return DEFAULT_OFFER_DATA;
    }
  });

  const [activePreviewPage, setActivePreviewPage] = useState<'both' | 'page1' | 'page2'>('both');
  const [printScope, setPrintScope] = useState<'both' | 'page1' | 'page2'>('both');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleFieldChange = (field: keyof OfferLetterData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    try {
      localStorage.setItem('itpl_current_offer_letter', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const handleReset = () => {
    setData(DEFAULT_OFFER_DATA);
    localStorage.setItem('itpl_current_offer_letter', JSON.stringify(DEFAULT_OFFER_DATA));
    showToast('Loaded original offer letter template.');
  };

  const handleResetMargins = () => {
    const updated = {
      ...data,
      letterheadTopSpaceMm: 42,
      letterheadBottomSpaceMm: 26,
      letterheadSideMarginMm: 20,
      contentFontSizePt: 12.5,
      contentLineSpacing: 'normal' as const,
    };
    setData(updated);
    localStorage.setItem('itpl_current_offer_letter', JSON.stringify(updated));
    showToast('Reset letterhead margins to official standard (Top 42mm, Bottom 26mm, Side 20mm).');
  };

  const handlePrint = (mode: 'both' | 'page1' | 'page2' = 'both') => {
    setPrintScope(mode);
    if (mode === 'both') {
      setActivePreviewPage('both');
    } else if (mode === 'page1') {
      setActivePreviewPage('page1');
    } else if (mode === 'page2') {
      setActivePreviewPage('page2');
    }
    document.body.setAttribute('data-offer-print-scope', mode);
    document.body.classList.add('printing-offer-letter');

    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-offer-letter');
      document.body.removeAttribute('data-offer-print-scope');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      document.body.classList.remove('printing-offer-letter');
      document.body.removeAttribute('data-offer-print-scope');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // 1. Official Digital Header (Image 1 replica)
  const renderDigitalHeader = () => (
    <div className="letterhead-header w-full relative z-10 shrink-0 select-none">
      {/* Deep Navy Blue Header Bar */}
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

        <div className="text-right text-[10px] sm:text-[11px] font-bold text-white space-y-1 font-mono">
          <div className="flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 bg-white inline-block"></span>
            <span>CIN : {data.cinNumber}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 bg-white inline-block"></span>
            <span>GST : {data.gstNumber}</span>
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
      <div className="w-full bg-[#102068] text-white py-1 px-4 sm:px-6 flex items-center justify-center gap-1.5 text-center shadow-xs">
        <span className="material-symbols-outlined text-rose-400 text-xs sm:text-sm shrink-0">
          location_on
        </span>
        <p className="text-[9px] sm:text-[10px] font-semibold tracking-wide font-sans leading-tight">
          {data.postingPlace}
        </p>
      </div>
    </div>
  );

  // 2. Official Digital Footer (Image 1 replica)
  const renderDigitalFooter = () => (
    <div className="letterhead-footer w-full bg-[#102068] text-white py-2 px-4 sm:px-6 relative z-10 shrink-0 shadow-inner select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[9px] sm:text-[10.5px] font-medium font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
            ✉
          </span>
          <span>Email : {data.supportEmail}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
            🌐
          </span>
          <span>Website : {data.websiteUrl}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
            📞
          </span>
          <span>Mobile : {data.supportPhone}</span>
        </div>
      </div>
    </div>
  );

  // 3. Dynamic Header Zone (WYSIWYG: exact same height on screen and in print)
  const renderHeaderZone = () => {
    if (data.printOnLetterheadPaper) {
      return (
        <div
          className="w-full relative z-10 shrink-0 flex items-center justify-center transition-all select-none"
          style={{ height: `${data.letterheadTopSpaceMm || 42}mm` }}
        >
          {data.showLetterheadGuide && (
            <div className="no-print mx-4 sm:mx-6 w-full h-[calc(100%-8px)] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-center text-center p-2">
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-white rounded-full border border-blue-200 text-blue-900 text-[11px] font-mono shadow-xs font-semibold">
                <span className="material-symbols-outlined text-sm text-blue-600">vertical_align_top</span>
                <span>Pre-Printed Letterhead Header Zone ({data.letterheadTopSpaceMm || 42}mm)</span>
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
    if (data.printOnLetterheadPaper) {
      return (
        <div
          className="w-full relative z-10 shrink-0 flex items-center justify-center transition-all select-none"
          style={{ height: `${data.letterheadBottomSpaceMm || 26}mm` }}
        >
          {data.showLetterheadGuide && (
            <div className="no-print mx-4 sm:mx-6 w-full h-[calc(100%-6px)] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-center text-center p-2">
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-white rounded-full border border-blue-200 text-blue-900 text-[11px] font-mono shadow-xs font-semibold">
                <span className="material-symbols-outlined text-sm text-blue-600">vertical_align_bottom</span>
                <span>Pre-Printed Letterhead Footer Zone ({data.letterheadBottomSpaceMm || 26}mm)</span>
              </span>
            </div>
          )}
        </div>
      );
    }

    return renderDigitalFooter();
  };

  return (
    <div className="offer-letter-outer-wrapper w-full space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Control Actions */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-2xl">mail</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Official Offer Letter Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured for printing cleanly onto company letterhead with customized top &amp; bottom blank margins.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Page switch tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActivePreviewPage('both');
                setPrintScope('both');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewPage === 'both' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Both Pages (1 &amp; 2)
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePreviewPage('page1');
                setPrintScope('both');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewPage === 'page1' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Page 1 (Terms)
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePreviewPage('page2');
                setPrintScope('both');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewPage === 'page2' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Page 2 (Signatures)
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset Sample</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrint('both')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Print Complete 2-Page Offer Letter on A4 paper"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Print 2-Page Offer Letter</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrint('page1')}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print Page 1 only"
          >
            <span className="material-symbols-outlined text-base">looks_one</span>
            <span>Page 1 Only</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrint('page2')}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print Page 2 only"
          >
            <span className="material-symbols-outlined text-base">looks_two</span>
            <span>Page 2 Only</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="offer-letter-grid-wrapper grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: EDITABLE INPUT FORMAT FOR ALL BOLD FIELDS */}
        {/* ============================================================ */}
        <div className="no-print lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1e295a] font-display">
              Input Format (Editable Content)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Bold Fields Live Synced
            </span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
            {/* 0. Pre-Printed Letterhead Paper Print Setup */}
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
                  onClick={handleResetMargins}
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
                    onClick={() => handleFieldChange('printOnLetterheadPaper', true)}
                    className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      data.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    <span>Pre-Printed Stationery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('printOnLetterheadPaper', false)}
                    className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      !data.printOnLetterheadPaper
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">palette</span>
                    <span>Digital Branding</span>
                  </button>
                </div>
                <p className="text-[10px] text-indigo-700">
                  {data.printOnLetterheadPaper
                    ? '✓ Blank top & bottom margins reserved for company pre-printed stationery paper.'
                    : '✓ Full navy blue company header and footer ribbon printed directly.'}
                </p>
              </div>

              {data.printOnLetterheadPaper && (
                <div className="pt-2 border-t border-indigo-200/60 space-y-3">
                  {/* Top Blank Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-indigo-950 text-[11px]">
                        Top Blank Margin (Header Zone):
                      </label>
                      <span className="font-mono font-bold text-xs text-blue-800 px-2 py-0.5 rounded-md bg-white border border-indigo-200">
                        {data.letterheadTopSpaceMm || 42} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={20}
                        max={70}
                        step={1}
                        value={data.letterheadTopSpaceMm || 42}
                        onChange={(e) =>
                          handleFieldChange('letterheadTopSpaceMm', Number(e.target.value) || 42)
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
                        {data.letterheadBottomSpaceMm || 26} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={data.letterheadBottomSpaceMm || 26}
                        onChange={(e) =>
                          handleFieldChange('letterheadBottomSpaceMm', Number(e.target.value) || 26)
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
                        {data.letterheadSideMarginMm || 20} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      step={1}
                      value={data.letterheadSideMarginMm || 20}
                      onChange={(e) =>
                        handleFieldChange('letterheadSideMarginMm', Number(e.target.value) || 20)
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
                        {[11.5, 12, 12.5, 13].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleFieldChange('contentFontSizePt', size)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (data.contentFontSizePt || 12.5) === size
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
                            onClick={() => handleFieldChange('contentLineSpacing', spacing)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border capitalize transition-all cursor-pointer ${
                              (data.contentLineSpacing || 'normal') === spacing
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
                      htmlFor="showLetterheadGuide"
                      className="text-[11px] font-semibold text-indigo-900 cursor-pointer select-none"
                    >
                      Show safe zone outlines on screen
                    </label>
                    <input
                      type="checkbox"
                      id="showLetterheadGuide"
                      checked={data.showLetterheadGuide}
                      onChange={(e) => handleFieldChange('showLetterheadGuide', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Toggle: Include Official Letterhead on Screen */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900">Digital Letterhead Header &amp; Footer</p>
                <p className="text-[11px] text-blue-700">Display company branding in preview</p>
              </div>
              <input
                type="checkbox"
                id="includeLetterhead"
                checked={data.includeLetterhead}
                onChange={(e) => handleFieldChange('includeLetterhead', e.target.checked)}
                className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
              />
            </div>

            {/* 1. Candidate Details */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Recipient / Candidate (Bold in letter)
              </span>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Candidate Full Name (Bold) *
                </label>
                <input
                  type="text"
                  value={data.candidateName}
                  onChange={(e) => handleFieldChange('candidateName', e.target.value)}
                  placeholder="e.g. Mr. Akshad Anandrao Shinde"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Candidate Address (Bold) *
                </label>
                <input
                  type="text"
                  value={data.candidateAddress}
                  onChange={(e) => handleFieldChange('candidateAddress', e.target.value)}
                  placeholder="e.g. A/p Sangli"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-blue-600"
                />
              </div>
            </div>

            {/* 2. Position & Key Dates */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Position &amp; Timeline (Bold in letter)
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Offer Letter Date *
                  </label>
                  <input
                    type="text"
                    value={data.letterDate}
                    onChange={(e) => handleFieldChange('letterDate', e.target.value)}
                    placeholder="03-08-2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Designation / Position (Bold) *
                  </label>
                  <input
                    type="text"
                    value={data.position}
                    onChange={(e) => handleFieldChange('position', e.target.value)}
                    placeholder="Web Developer Intern"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date of Joining (Bold) *
                  </label>
                  <input
                    type="text"
                    value={data.joiningDate}
                    onChange={(e) => handleFieldChange('joiningDate', e.target.value)}
                    placeholder="3 August, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Date (Bold) *
                  </label>
                  <input
                    type="text"
                    value={data.endDate}
                    onChange={(e) => handleFieldChange('endDate', e.target.value)}
                    placeholder="3 July, 2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Terms & Durations */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Employment Terms &amp; Policies
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mandatory Days (Term 9)
                  </label>
                  <input
                    type="text"
                    value={data.mandatoryDays}
                    onChange={(e) => handleFieldChange('mandatoryDays', e.target.value)}
                    placeholder="297 working days"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Evaluation Period (Term 10)
                  </label>
                  <input
                    type="text"
                    value={data.evaluationPeriod}
                    onChange={(e) => handleFieldChange('evaluationPeriod', e.target.value)}
                    placeholder="two-month"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Notice Period (Term 8)
                  </label>
                  <input
                    type="text"
                    value={data.noticePeriod}
                    onChange={(e) => handleFieldChange('noticePeriod', e.target.value)}
                    placeholder="prior 1 month"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Working Hours (Term 5)
                  </label>
                  <input
                    type="text"
                    value={data.workingHours}
                    onChange={(e) => handleFieldChange('workingHours', e.target.value)}
                    placeholder="9:00 AM to 6:00 PM, Monday to Saturday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Place of Posting (Term 4)
                </label>
                <textarea
                  rows={2}
                  value={data.postingPlace}
                  onChange={(e) => handleFieldChange('postingPlace', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reporting Authority (Term 6)
                </label>
                <input
                  type="text"
                  value={data.reportingAuthority}
                  onChange={(e) => handleFieldChange('reportingAuthority', e.target.value)}
                  placeholder="Ms. Kshitija Patil [HR Manager]"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                />
              </div>
            </div>

            {/* 4. HR Signatures & Authority */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4. HR Signatory &amp; College Stamp
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HR Signatory Name</label>
                  <input
                    type="text"
                    value={data.hrName}
                    onChange={(e) => handleFieldChange('hrName', e.target.value)}
                    placeholder="Ms. Kshitija Patil"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HR Title</label>
                  <input
                    type="text"
                    value={data.hrTitle}
                    onChange={(e) => handleFieldChange('hrTitle', e.target.value)}
                    placeholder="Human Resource Manager"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showCollegeStamp"
                  checked={data.showCollegeStamp}
                  onChange={(e) => handleFieldChange('showCollegeStamp', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="showCollegeStamp"
                  className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                >
                  Include Dean / HOD &amp; College Stamp Signature Block
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LIVE 2-PAGE OFFER LETTER PREVIEW (IMAGE 1 LETTERHEAD) */}
        {/* ============================================================ */}
        <div ref={containerRef} className="offer-letter-preview-column lg:col-span-7 flex flex-col items-center w-full space-y-4">
          {/* Live Preview Mode & Margin Status Bar */}
          <div className="no-print w-full max-w-[720px] bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
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
                  onClick={() => handleFieldChange('printOnLetterheadPaper', true)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    data.printOnLetterheadPaper
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  <span>Letterhead Paper</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('printOnLetterheadPaper', false)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    !data.printOnLetterheadPaper
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
                {data.printOnLetterheadPaper && (
                  <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.showLetterheadGuide}
                      onChange={(e) => handleFieldChange('showLetterheadGuide', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
                    />
                    <span>Show Safe Zone Outlines in Preview</span>
                  </label>
                )}
              </div>
              <div className="font-mono text-slate-600 font-medium">
                {data.printOnLetterheadPaper ? (
                  <span>
                    Blank Top: <strong className="text-blue-800">{data.letterheadTopSpaceMm || 42}mm</strong> | Blank Bottom: <strong className="text-blue-800">{data.letterheadBottomSpaceMm || 26}mm</strong> | Sides: <strong className="text-blue-800">{data.letterheadSideMarginMm || 20}mm</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    ✓ Full Navy Blue Header &amp; Footer Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* PAGE 1: OFFER LETTER ON OFFICIAL LETTERHEAD (IMAGE 1) */}
          {/* ========================================================== */}
          <div
            id="offer-letter-page-1"
            className={`offer-letter-page-doc w-full max-w-[720px] bg-white border border-slate-300 shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between relative transition-all ${
              activePreviewPage === 'page2' ? 'hidden' : 'flex'
            } ${
              printScope === 'page2' ? 'print:hidden' : 'print:flex'
            } ${
              printScope === 'page1' ? 'print-page1-only' : 'print-both-pages'
            }`}
            style={{
              minHeight: '1018px',
              fontFamily: "'Times New Roman', Times, serif, system-ui",
            }}
          >
              {/* Central Background Watermark (Only shown for Digital Branding, removed for Pre-Printed Stationery) */}
              {!data.printOnLetterheadPaper && (
                <div
                  className="letterhead-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  style={{ opacity: 0.08 }}
                >
                  <img
                    src="/company-logo-clean.png"
                    alt="ITPL Watermark"
                    className="w-[360px] sm:w-[440px] max-w-full h-auto object-contain filter grayscale"
                  />
                </div>
              )}

              {/* Dynamic Header Zone (Pre-printed blank margin or Digital Header) */}
              {renderHeaderZone()}

              {/* Page 1 Body */}
              <div
                className="offer-letter-content relative z-10 flex-1 flex flex-col justify-start text-slate-900 transition-all"
                style={{
                  paddingLeft: `${data.letterheadSideMarginMm || 20}mm`,
                  paddingRight: `${data.letterheadSideMarginMm || 20}mm`,
                  paddingTop: data.printOnLetterheadPaper ? '2px' : '14px',
                  paddingBottom: data.printOnLetterheadPaper ? '2px' : '14px',
                  fontSize: `${data.contentFontSizePt || 12.5}px`,
                  lineHeight:
                    data.contentLineSpacing === 'tight'
                      ? 1.32
                      : data.contentLineSpacing === 'relaxed'
                      ? 1.5
                      : 1.38,
                }}
              >
                <div className="space-y-3 sm:space-y-3.5">
                  {/* Title & Date */}
                  <div className="relative pb-0.5">
                    <div className="text-center">
                      <h1 className="text-base sm:text-lg font-bold underline underline-offset-4 tracking-wider uppercase inline-block">
                        OFFER LETTER
                      </h1>
                    </div>
                    <div className="text-right text-xs sm:text-[13px] font-normal">
                      <span>Date: </span>
                      <span className="font-semibold">{data.letterDate || '03-08-2026'}</span>
                    </div>
                  </div>

                  {/* Recipient Address (BOLD as in Image) */}
                  <div className="space-y-0.5 text-xs sm:text-[13px]">
                    <p>To,</p>
                    <p className="font-bold text-slate-950 text-sm sm:text-[15px]">
                      {data.candidateName || 'Ms. shweta'}
                    </p>
                    <p className="font-bold text-slate-950">
                      {data.candidateAddress || 'A/p Sangli'}
                    </p>
                  </div>

                  {/* Subject Line (BOLD as in Image) */}
                  <div className="text-center py-0.5">
                    <p className="font-bold text-slate-950 text-xs sm:text-[13px]">
                      Subject: Offer Letter for the Position of {data.position || 'Web Developer Intern'}
                    </p>
                  </div>

                  {/* Salutation */}
                  <div>
                    <p>
                      Dear <span className="font-bold">{data.candidateName || 'Ms. shweta'}</span>
                    </p>
                  </div>

                  {/* Opening Paragraph (Position and Effective Date are BOLD) */}
                  <p className="text-justify leading-relaxed">
                    We are pleased to offer you the position of{' '}
                    <strong className="font-bold">{data.position || 'Web Developer Intern'}</strong> at{' '}
                    {data.companyName || 'Infoyashonand Technology Pvt. Ltd'}, effective from{' '}
                    <strong className="font-bold">{data.joiningDate || '3 August, 2026'}</strong>. Your appointment
                    is based on your qualifications, skills, and performance during the selection process, which aligns
                    with our organizational requirements and values.
                  </p>

                  {/* Terms and Conditions Section Title (Italic & Bold) */}
                  <p className="font-bold italic text-slate-950 pt-0.5">
                    Terms and Conditions of Employment:
                  </p>

                  {/* Numbered Terms (Exact text from Image) */}
                  <ol className="space-y-1 text-justify pl-1 text-[11.5px] sm:text-[12.5px] leading-relaxed">
                    <li>
                      1. Position: <strong className="font-bold">{data.position || 'Web Developer Intern'}</strong>
                    </li>
                    <li>
                      2. Date of Joining: <strong className="font-bold">{data.joiningDate || '3 August, 2026'}</strong>
                    </li>
                    <li>
                      3. End Date : <strong className="font-bold">{data.endDate || '3 nov, 2026'}</strong>
                    </li>
                    <li>
                      4. Place of Posting: {data.postingPlace}
                    </li>
                    <li>
                      5. Working Hours: {data.workingHours}
                    </li>
                    <li>
                      6. Reporting Authority: You will report directly to {data.reportingAuthority}.
                    </li>
                    <li>
                      7. Company Policies: During your tenure, you are required to comply with all the company rules,
                      policies, and standards of professional conduct, which will be provided upon joining.
                    </li>
                    <li>
                      8. The notice period for resignation is {data.noticePeriod}.
                    </li>
                    <li>
                      9. Manditory to Complete the {data.mandatoryDays} of internship for issuing the complition certificate
                    </li>
                    <li>
                      10. You will undergo a {data.evaluationPeriod} working days, after which your salary will be discussed and
                      finalized based on your performance and overall evaluation during this period.
                    </li>
                    <li>
                      11. Documentation Required: You are requested to carry the following original documents, along with
                      one set of self-attested copies, on your joining date for verification and HR formalities:
                      <ul className="list-disc pl-5 mt-0.5 space-y-0.5 text-slate-800">
                        <li>Government-issued Identity Proof (Aadhar Card/Passport/Voter ID)</li>
                        <li>Address Proof</li>
                        <li>Educational Certificates (Mark Sheets &amp; Degree Certificates)</li>
                        <li>Previous Employment Relieving Letter (if applicable)</li>
                        <li>1 Passport-size Photographs</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Dynamic Footer Zone (Pre-printed blank margin or Digital Footer) */}
              {renderFooterZone()}
            </div>

          {/* ========================================================== */}
          {/* PAGE 2: OFFER LETTER CONTINUATION ON LETTERHEAD (IMAGE 1) */}
          {/* ========================================================== */}
          <div
            id="offer-letter-page-2"
            className={`offer-letter-page-doc w-full max-w-[720px] bg-white border border-slate-300 shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between relative transition-all ${
              activePreviewPage === 'page1' ? 'hidden' : 'flex'
            } ${
              printScope === 'page1' ? 'print:hidden' : 'print:flex'
            } ${
              printScope === 'page2' ? 'print-page2-only' : 'print-both-pages'
            }`}
            style={{
              minHeight: '1018px',
              fontFamily: "'Times New Roman', Times, serif, system-ui",
            }}
          >
              {/* Central Background Watermark (Only shown for Digital Branding, removed for Pre-Printed Stationery) */}
              {!data.printOnLetterheadPaper && (
                <div
                  className="letterhead-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  style={{ opacity: 0.08 }}
                >
                  <img
                    src="/company-logo-clean.png"
                    alt="ITPL Watermark"
                    className="w-[360px] sm:w-[440px] max-w-full h-auto object-contain filter grayscale"
                  />
                </div>
              )}

              {/* Dynamic Header Zone */}
              {renderHeaderZone()}

              {/* Page 2 Body Content */}
              <div
                className="offer-letter-content relative z-10 flex-1 flex flex-col justify-between text-slate-900 transition-all space-y-5"
                style={{
                  paddingLeft: `${data.letterheadSideMarginMm || 20}mm`,
                  paddingRight: `${data.letterheadSideMarginMm || 20}mm`,
                  paddingTop: data.printOnLetterheadPaper ? '4px' : '16px',
                  paddingBottom: data.printOnLetterheadPaper ? '4px' : '16px',
                  fontSize: `${data.contentFontSizePt || 12.5}px`,
                  lineHeight:
                    data.contentLineSpacing === 'tight'
                      ? 1.32
                      : data.contentLineSpacing === 'relaxed'
                      ? 1.5
                      : 1.38,
                }}
              >
                <div className="space-y-5">
                  <p className="text-justify leading-relaxed">
                    We are delighted to welcome you to {data.companyName || 'Infoyashonand Technology Pvt. Ltd.'} and look
                    forward to your valuable contributions to the growth and success of our organization. Should you have any
                    queries, please feel free to reach out to us at {data.hrEmail || 'hr@infoyashonand.com'}.
                  </p>

                  <p className="leading-relaxed">
                    Wishing you a successful and rewarding career with us.
                  </p>

                  {/* Signatures Section (Yours sincerely & Dean/HOD Stamp) */}
                  <div className="pt-8 grid grid-cols-2 gap-6 items-start text-xs sm:text-sm font-sans">
                    {/* Left: HR Manager */}
                    <div className="space-y-1">
                      <p className="font-serif italic text-slate-700">Yours sincerely,</p>
                      <div className="h-10 flex items-end">
                        <span className="font-mono text-blue-900 font-bold italic text-xs">
                          ~ {data.hrName}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{data.hrName}</p>
                      <p className="text-slate-700 text-xs">{data.hrTitle}</p>
                      <p className="font-semibold text-slate-800 text-xs">{data.companyName}</p>
                    </div>

                    {/* Right: Dean / HOD & Stamp of College */}
                    {data.showCollegeStamp && (
                      <div className="text-right space-y-2 flex flex-col items-end">
                        <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center w-48 space-y-1">
                          <p className="font-bold text-slate-700 text-xs">Signature of Dean/Hod</p>
                          <p className="text-[10px] text-slate-500">and stamp of college</p>
                          <div className="h-6"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acknowledgement and Acceptance Section (Exact replica) */}
                <div className="pt-6 pb-2 border-t border-slate-300 space-y-3">
                  <div className="text-center">
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide underline underline-offset-4 inline-block">
                      Acknowledgement and Acceptance of Offer
                    </h3>
                  </div>

                  <p className="text-justify text-xs sm:text-[13px] leading-relaxed pt-1">
                    I, <strong className="font-bold text-slate-950">{data.candidateName}</strong> accept the
                    terms and conditions stated in this appointment letter and confirm my joining on{' '}
                    <strong className="font-bold text-slate-950">{data.joiningDate}</strong>.
                  </p>

                  <div className="pt-6 grid grid-cols-2 gap-4 text-xs sm:text-sm font-sans">
                    <div>
                      <p className="text-slate-800">
                        <span className="font-bold">Signature: </span>___________________________
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-800">
                        <span className="font-bold">Date: </span>___________________________
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Footer Zone */}
              {renderFooterZone()}
            </div>

          {/* Quick Notice under Preview */}
          <p className="no-print text-center text-[11px] text-slate-400">
            Tip: What you see in the preview above matches the printed output 1:1. Use the calibration sliders on the left to fine-tune margins.
          </p>
        </div>
      </div>
    </div>
  );
};
