import React, { useState, useRef, useEffect } from 'react';

export interface BonafideRecord {
  id: string;
  registerNo: string;
  name: string;
  mothersName: string;
  religion: string;
  className: string;
  division: string;
  academicYear: string;
  dob: string;
  owNo: string;
  showOwNo: boolean;
  reason: string;
  grNo?: string;
  penNo?: string;
  aadharNo?: string;
  apaarId?: string;
  issueDate?: string;
  gender?: 'female' | 'male';
  createdAt: string;
}

const DEFAULT_RECORD: BonafideRecord = {
  id: 'ITPL-BC-194',
  registerNo: '1042',
  name: 'Pooja Shrikant Patil',
  mothersName: 'Sunita',
  religion: 'Hindu - Maratha',
  className: 'B.E. Computer Technology',
  division: 'A',
  academicYear: '2025 - 2026',
  dob: '2003-08-15',
  owNo: '194',
  showOwNo: true,
  reason: 'To avail of travel benefits',
  grNo: '1042',
  penNo: 'PEN-8839210',
  aadharNo: 'XXXX-XXXX-4819',
  apaarId: 'APAAR-2026-901',
  issueDate: new Date().toISOString().split('T')[0],
  gender: 'female',
  createdAt: new Date().toISOString(),
};

const REASON_OPTIONS = [
  'To avail of travel benefits',
  'For Higher Education / College Admission',
  'For State / National Scholarship Application',
  'For Passport / Visa Verification',
  'For Bank Account Opening & Educational Loan',
  'For Industrial Internship & Technical Training',
  'For Employment Verification & Background Check',
  'Other Reason',
];

export const BonafideCertificateGenerator: React.FC = () => {
  const [formData, setFormData] = useState<BonafideRecord>(() => {
    try {
      const saved = localStorage.getItem('itpl_current_bonafide');
      return saved ? JSON.parse(saved) : DEFAULT_RECORD;
    } catch {
      return DEFAULT_RECORD;
    }
  });

  const [customReason, setCustomReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const certPrintRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInputChange = (field: keyof BonafideRecord, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    try {
      localStorage.setItem('itpl_current_bonafide', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const handleReasonChange = (val: string) => {
    if (val === 'Other Reason') {
      setIsCustomReason(true);
      handleInputChange('reason', customReason || 'For official educational verification');
    } else {
      setIsCustomReason(false);
      handleInputChange('reason', val);
    }
  };

  const handleFillSample = () => {
    setFormData(DEFAULT_RECORD);
    setIsCustomReason(false);
    localStorage.setItem('itpl_current_bonafide', JSON.stringify(DEFAULT_RECORD));
    showToast('Loaded sample bonafide details!');
  };

  const handleClear = () => {
    const cleared: BonafideRecord = {
      id: `ITPL-BC-${Math.floor(100 + Math.random() * 900)}`,
      registerNo: '',
      name: '',
      mothersName: '',
      religion: '',
      className: '',
      division: '',
      academicYear: '2025 - 2026',
      dob: '',
      owNo: '194',
      showOwNo: true,
      reason: 'To avail of travel benefits',
      grNo: '',
      penNo: '',
      aadharNo: '',
      apaarId: '',
      issueDate: new Date().toISOString().split('T')[0],
      gender: 'female',
      createdAt: new Date().toISOString(),
    };
    setFormData(cleared);
    setIsCustomReason(false);
    localStorage.setItem('itpl_current_bonafide', JSON.stringify(cleared));
    showToast('Form cleared.');
  };

  const handlePrint = () => {
    document.body.classList.add('printing-bonafide-only');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-bonafide-only');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      document.body.classList.remove('printing-bonafide-only');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Format Date for Display (DD-MM-YYYY)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Invalid date';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Invalid date';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-2xl">verified</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Official Bonafide Certificate Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable, verifiable bonafide certificates formatted on official Infoyashonand Technology Pvt. Ltd. letterhead.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleFillSample}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">auto_fix_high</span>
            <span>Sample Data</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid (Image 2 format) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: BONAFIDE CERTIFICATE FORM (Exact match to Image 2) */}
        {/* ============================================================ */}
        <div className="no-print lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1e295a] font-display">
              Bonafide Certificate
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Live Editor
            </span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5 text-xs">
            {/* Register No */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Register No</label>
              <input
                type="text"
                value={formData.registerNo}
                onChange={(e) => {
                  handleInputChange('registerNo', e.target.value);
                  if (!formData.grNo || formData.grNo === formData.registerNo) {
                    handleInputChange('grNo', e.target.value);
                  }
                }}
                placeholder="Register / GR Number (e.g. 1042)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Search by name... (Student Full Name)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mother&apos;s Name</label>
              <input
                type="text"
                value={formData.mothersName}
                onChange={(e) => handleInputChange('mothersName', e.target.value)}
                placeholder="e.g. Sunita"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>

            {/* Religion & Caste */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Religion</label>
              <input
                type="text"
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                placeholder="e.g. Hindu - Maratha"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>

            {/* Class & Division */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Class</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => handleInputChange('className', e.target.value)}
                  placeholder="e.g. B.E. Computer Technology"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  placeholder="e.g. A"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium text-center"
                />
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                placeholder="e.g. 2025 - 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">DOB</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Gender</label>
                <select
                  value={formData.gender || 'female'}
                  onChange={(e) => handleInputChange('gender', e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
                >
                  <option value="female">Female (her behavior)</option>
                  <option value="male">Male (his behavior)</option>
                </select>
              </div>
            </div>

            {/* O.W. No. */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">O.W. No.</label>
              <input
                type="text"
                value={formData.owNo}
                onChange={(e) => handleInputChange('owNo', e.target.value)}
                placeholder="194"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium font-mono"
              />
            </div>

            {/* Checkbox: Show O.W. No. on Certificate */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <input
                type="checkbox"
                id="showOwNoCheckbox"
                checked={formData.showOwNo}
                onChange={(e) => handleInputChange('showOwNo', e.target.checked)}
                className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600 border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="showOwNoCheckbox"
                className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                Show O.W. No. on Certificate
              </label>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason</label>
              <select
                value={isCustomReason ? 'Other Reason' : formData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium cursor-pointer"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {isCustomReason && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    handleInputChange('reason', e.target.value);
                  }}
                  placeholder="Type specific reason for certificate issue..."
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/50 text-slate-900 focus:outline-blue-600 font-medium"
                />
              )}
            </div>

            {/* Collapsible / Additional Registry Identifiers */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Certificate Registry Identifiers
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pen No</label>
                  <input
                    type="text"
                    value={formData.penNo || ''}
                    onChange={(e) => handleInputChange('penNo', e.target.value)}
                    placeholder="e.g. PEN-88392"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Aadhar No</label>
                  <input
                    type="text"
                    value={formData.aadharNo || ''}
                    onChange={(e) => handleInputChange('aadharNo', e.target.value)}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Apaar Id</label>
                  <input
                    type="text"
                    value={formData.apaarId || ''}
                    onChange={(e) => handleInputChange('apaarId', e.target.value)}
                    placeholder="APAAR-99210"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LIVE CERTIFICATE PREVIEW ON ITPL LETTERHEAD */}
        {/* (Exact match to Image 1 letterhead with Image 2 certificate content) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          {/* Certificate Container with A4 aspect styling */}
          <div
            ref={certPrintRef}
            id="itpl-bonafide-document"
            className="w-full max-w-[720px] bg-white border border-slate-300 shadow-xl rounded-sm text-slate-900 flex flex-col justify-between overflow-hidden relative"
            style={{
              minHeight: '940px',
              fontFamily: "'Times New Roman', Times, serif, system-ui",
            }}
          >
            {/* Background Watermark (Exact Circular Logo from Image 1) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
              style={{ opacity: 0.08 }}
            >
              <img
                src="/company-logo-clean.png"
                alt="Infoyashonand Technology Watermark"
                className="w-[340px] sm:w-[420px] h-auto object-contain filter grayscale"
              />
            </div>

            {/* ======================================================= */}
            {/* 1. TOP LETTERHEAD HEADER (EXACT REPLICA OF IMAGE 1) */}
            {/* ======================================================= */}
            <div className="w-full relative z-10 shrink-0">
              {/* Primary Header Row: Navy Blue Bar with Dual White Stripes, Logo, Company Name, CIN, GST */}
              <div className="w-full bg-[#102068] text-white px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
                {/* Left: Dual Vertical White Stripes + Circular Seal Logo + Company Name */}
                <div className="flex items-center gap-3">
                  {/* Dual Vertical White Accent Stripes */}
                  <div className="flex items-center gap-1 shrink-0 h-11 sm:h-13">
                    <div className="w-1.5 h-full bg-white rounded-xs"></div>
                    <div className="w-1.5 h-full bg-white rounded-xs"></div>
                  </div>

                  {/* Circular Seal Logo with white circular backing */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full p-0.5 flex items-center justify-center shrink-0 shadow-sm border border-white">
                    <img
                      src="/company-logo-clean.png"
                      alt="Infoyashonand Technology Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Company Name in bold white */}
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

              {/* Core Values Sub-bar (From Image 1) */}
              <div className="w-full bg-white border-y border-slate-200 py-1 px-4 text-center">
                <p className="text-[8px] sm:text-[9.5px] font-black tracking-wider text-[#102068] uppercase font-sans">
                  INNOVATION &nbsp;|&nbsp; EMPOWERMENT &nbsp;|&nbsp; COMMITMENT &nbsp;|&nbsp; POSITIVE MIND SET &nbsp;|&nbsp; INTEGRITY &nbsp;|&nbsp; COLLABORATION &nbsp;|&nbsp; GROWTH
                </p>
              </div>

              {/* Address Ribbon Bar (Blue bar with pin icon from Image 1) */}
              <div className="w-full bg-[#16234d] text-white py-1.5 px-4 sm:px-6 flex items-center justify-center gap-1.5 text-center shadow-xs">
                <span className="material-symbols-outlined text-rose-400 text-xs sm:text-sm shrink-0">
                  location_on
                </span>
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-wide font-sans leading-tight">
                  Pearl Enclave, S.No. 4360/K; Walchand College Corner, MSEB Rd, Opp. Safa Bakery, Vishrambag, Sangli, Maharashtra 416 416.
                </p>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 2. CERTIFICATE BODY CONTENT (EXACT REPLICA OF IMAGE 2) */}
            {/* ======================================================= */}
            <div className="px-8 sm:px-12 py-6 flex-1 flex flex-col justify-between relative z-10 text-slate-900 leading-relaxed text-sm sm:text-base">
              <div>
                {/* Meta registry numbers row */}
                <div className="flex justify-between items-start text-xs sm:text-sm font-sans font-bold pb-4">
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-600">GR. No. :</span>{' '}
                      <span className="font-mono text-slate-900">{formData.grNo || formData.registerNo || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Pen No :</span>{' '}
                      <span className="font-mono text-slate-900">{formData.penNo || '—'}</span>
                    </div>
                    {formData.showOwNo && (
                      <div>
                        <span className="text-slate-600">O.W. No. :</span>{' '}
                        <span className="font-mono text-slate-900">{formData.owNo || '194'}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-slate-600">Date :</span>{' '}
                      <span className="font-mono text-slate-900">{formatDate(formData.issueDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Aadhar No :</span>{' '}
                      <span className="font-mono text-slate-900">{formData.aadharNo || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Apaar Id :</span>{' '}
                      <span className="font-mono text-slate-900">{formData.apaarId || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Center Badge Pill: Bonafide Certificate */}
                <div className="text-center my-4">
                  <span className="inline-block bg-black text-white px-7 sm:px-9 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm font-sans">
                    Bonafide Certificate
                  </span>
                </div>

                {/* Opening affirmation line */}
                <p className="text-center font-bold text-sm sm:text-base italic pt-1 pb-4">
                  It is certified that
                </p>

                {/* Student Details Section (Exact match to Image 2 structure) */}
                <div className="space-y-3 pt-1 text-sm sm:text-base">
                  {/* Full Name */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-slate-800 shrink-0">Full name of student :</span>
                    <span className="font-bold text-slate-900 underline decoration-dotted underline-offset-4 flex-1 min-w-[200px]">
                      {formData.name || '__________________________________________'}
                    </span>
                  </div>

                  {/* Mother's Name & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <div className="sm:col-span-6 flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 shrink-0">Mother&apos;s name :</span>
                      <span className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 flex-1">
                        {formData.mothersName || '__________________'}
                      </span>
                    </div>
                    <div className="sm:col-span-6 flex items-baseline gap-2 sm:justify-end">
                      <span className="font-bold text-slate-800 shrink-0">Date of Birth :</span>
                      <span className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4">
                        {formatDate(formData.dob)}
                      </span>
                    </div>
                  </div>

                  {/* Academic Year, Class & Division */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <div className="sm:col-span-6 flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 shrink-0">Academic Year :</span>
                      <span className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 flex-1">
                        {formData.academicYear || '__________________'}
                      </span>
                    </div>
                    <div className="sm:col-span-6 flex items-baseline gap-2 sm:justify-end">
                      <span className="font-bold text-slate-800 shrink-0">Class :</span>
                      <span className="font-semibold text-slate-900">
                        {formData.className || '________'}
                      </span>
                      {formData.division && (
                        <>
                          <span className="font-bold text-slate-800">, Division :</span>
                          <span className="font-semibold text-slate-900">{formData.division}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Caste and Religion */}
                  <div className="flex flex-wrap items-baseline gap-2 pt-1">
                    <span className="font-bold text-slate-800 shrink-0">caste and religion :</span>
                    <span className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 flex-1 min-w-[150px]">
                      {formData.religion || '________________________'}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="flex flex-wrap items-baseline gap-2 pt-1">
                    <span className="font-bold text-slate-800 shrink-0">Reason :</span>
                    <span className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 flex-1 min-w-[150px]">
                      {formData.reason || 'To avail of travel benefits'}
                    </span>
                  </div>
                </div>

                {/* Concluding Paragraph (from Image 2) */}
                <div className="pt-6 sm:pt-8 text-justify text-xs sm:text-sm leading-relaxed text-slate-800">
                  <p>
                    This student belongs to our college / institute and all the information given above is correct. According to our information, {formData.gender === 'male' ? 'his' : 'her'} behavior is satisfactory.
                  </p>
                </div>
              </div>

              {/* Bottom Authority Signature block */}
              <div className="pt-12 sm:pt-16 pb-4 flex justify-between items-end text-xs sm:text-sm font-sans">
                {/* Official Stamp Box / Verification Seal */}
                <div className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center text-[10px] text-slate-400 space-y-1 w-32">
                  <span className="material-symbols-outlined text-lg text-slate-300 block">verified_user</span>
                  <p className="font-bold text-slate-500 font-mono">SEAL &amp; STAMP</p>
                  <p className="text-[8px] text-slate-400">ITPL Authorized</p>
                </div>

                {/* Signatory Title */}
                <div className="text-right space-y-1">
                  <div className="h-10 flex items-end justify-end">
                    <span className="text-[11px] font-mono italic text-blue-900 font-bold">
                      ~ Shriram Khabale
                    </span>
                  </div>
                  <div className="w-44 border-t border-slate-900 pt-1">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">Principal / Dean</p>
                    <p className="text-[10px] font-semibold text-slate-600">
                      Infoyashonand Technology Pvt. Ltd.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 3. BOTTOM LETTERHEAD FOOTER (EXACT REPLICA OF IMAGE 1) */}
            {/* ======================================================= */}
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
          </div>

          {/* Quick Notice under Preview */}
          <p className="no-print text-center text-[11px] text-slate-400 mt-3">
            Tip: Click &quot;Print / Save PDF&quot; above to print directly on A4 paper or save as high-resolution PDF.
          </p>
        </div>
      </div>
    </div>
  );
};
