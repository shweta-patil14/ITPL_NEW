import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { adminDb, CertificateRecord } from '../services/adminDb';
import { getCertificateByVerificationIdFirestore } from '../firebase/firestoreService';

export const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const params = useParams<{ certId?: string }>();

  // Extract ID from path param or query string (?id=... or ?code=...)
  const queryId = searchParams.get('id') || searchParams.get('code') || searchParams.get('certId') || params.certId || '';
  const [searchInput, setSearchInput] = useState(queryId);
  const [activeCertId, setActiveCertId] = useState(queryId);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Fetch certificate and activate real-time live sync
  useEffect(() => {
    let isCancelled = false;

    const fetchCert = async () => {
      if (!activeCertId.trim()) {
        setCertificate(null);
        return;
      }
      const found = adminDb.getCertificateById(activeCertId.trim());
      if (found) {
        setCertificate(found);
        setLastSyncedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        return;
      }

      // If not in local storage, query Cloud Firestore directly
      try {
        const cloudCert = await getCertificateByVerificationIdFirestore(activeCertId.trim());
        if (!isCancelled && cloudCert) {
          setCertificate(cloudCert);
          setLastSyncedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else if (!isCancelled) {
          setCertificate(null);
        }
      } catch {
        if (!isCancelled) setCertificate(null);
      }
    };

    fetchCert();

    // Subscribe to live updates (same window or cross-tab storage changes)
    const unsubscribe = adminDb.subscribeToCertificates(() => {
      fetchCert();
    });

    return () => {
      unsubscribe();
    };
  }, [activeCertId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveCertId(searchInput.trim());
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-certificate-only');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-certificate-only');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      document.body.classList.remove('printing-certificate-only');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(certificate?.verificationId || activeCertId)}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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

  const getVerificationUrl = (verifId: string) => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/verify-certificate?id=${encodeURIComponent(verifId)}`;
    }
    return `https://infoyashonand.com/verify-certificate?id=${encodeURIComponent(verifId)}`;
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'experience':
        return 'CERTIFICATE OF EXPERIENCE';
      case 'award':
        return 'CERTIFICATE OF EXCELLENCE & ACHIEVEMENT';
      case 'recommendation':
        return 'LETTER OF RECOMMENDATION';
      default:
        return 'OFFICIAL CORPORATE CERTIFICATE';
    }
  };

  const getCategoryBadgeLabel = (category: string) => {
    switch (category) {
      case 'experience':
        return 'Experience Certificate';
      case 'award':
        return 'Award Certificate';
      case 'recommendation':
        return 'Recommendation Certificate';
      default:
        return 'Corporate Certificate';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* ========================================================= */}
        {/* TOP VERIFICATION HEADER BANNER (.no-print) */}
        {/* ========================================================= */}
        <div className="no-print glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs shrink-0">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                    Official Certificate Verification Portal
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Synced Active</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticated and served live from Infoyashonand Technology Pvt. Ltd. Enterprise Gateway.
                </p>
              </div>
            </div>

            {certificate && (
              <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy verification link"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink ? 'check' : 'link'}
                  </span>
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print or Save PDF"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Print / Save PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Box to Lookup Other Certificates */}
          <form onSubmit={handleSearchSubmit} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate Verification ID (e.g. ITPL-CERT-2026-9769, ITPL-EXP-..., ITPL-AWD-...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs font-mono font-bold focus:outline-blue-600 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              <span>Verify ID</span>
            </button>
          </form>

          {/* Real-Time Live Sync Status Pill */}
          {certificate && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-slate-700">
                  Status: <strong className="text-emerald-700 font-bold">100% Genuine &amp; Valid Corporate Document</strong>
                </span>
                <span className="hidden sm:inline text-slate-400">•</span>
                <span className="hidden sm:inline text-slate-500">
                  Ref: <strong className="font-mono text-blue-700">{certificate.verificationId}</strong>
                </span>
              </div>
              {lastSyncedTime && (
                <span className="font-mono text-[10px] text-slate-400">
                  Synced: {lastSyncedTime}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CASE 1: CERTIFICATE NOT FOUND */}
        {/* ========================================================= */}
        {!certificate && (
          <div className="glass-card p-10 sm:p-14 rounded-3xl border border-slate-200 bg-white shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 shadow-xs">
              <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active certificate found matching <strong className="font-mono text-slate-800">{activeCertId || 'the requested ID'}</strong>. Please verify the ID or check sample certificates below.
              </p>
            </div>

            {/* Quick Demo Certificate Buttons */}
            <div className="pt-4 border-t border-slate-100 max-w-md mx-auto space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sample Registered Certificates:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['ITPL-CERT-2026-9769', 'ITPL-AWD-2026-4102', 'ITPL-REC-2026-7821'].map((sampleId) => (
                  <button
                    key={sampleId}
                    type="button"
                    onClick={() => {
                      setSearchInput(sampleId);
                      setActiveCertId(sampleId);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                  >
                    {sampleId}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <span>← Return to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CASE 2: LIVE CERTIFICATE PREVIEW ON OFFICIAL LETTERHEAD */}
        {/* ========================================================= */}
        {certificate && (
          <div className="flex justify-center w-full py-2">
            <div
              id="itpl-certificate-printable"
              className="w-full max-w-[800px] bg-white border border-slate-300 shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between overflow-hidden relative"
              style={{
                minHeight: '960px',
                fontFamily: "'Times New Roman', Times, serif, system-ui",
              }}
            >
              {/* Background Watermark (Circular Logo) */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                style={{ opacity: 0.07 }}
              >
                <img
                  src="/company-logo-clean.png"
                  alt="Infoyashonand Technology Watermark"
                  className="w-[380px] sm:w-[460px] h-auto object-contain filter grayscale"
                />
              </div>

              {/* 1. TOP LETTERHEAD HEADER */}
              <div className="w-full relative z-10 shrink-0">
                {/* Navy Blue Header Bar with Dual Vertical Stripes, Logo, Company Name, CIN, GST */}
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

              {/* 2. CERTIFICATE BODY CONTENT */}
              <div className="px-8 sm:px-12 py-6 flex-1 flex flex-col justify-between relative z-10 text-slate-900 leading-relaxed text-sm sm:text-base">
                <div>
                  {/* Meta numbers row */}
                  <div className="flex justify-between items-start text-xs sm:text-sm font-sans font-bold pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-500">Certificate ID:</span>{' '}
                        <span className="font-mono text-blue-900 font-bold">{certificate.verificationId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Category:</span>{' '}
                        <span className="text-slate-800 uppercase text-[11px] font-extrabold tracking-wider">
                          {getCategoryBadgeLabel(certificate.category)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div>
                        <span className="text-slate-500">Date of Issue:</span>{' '}
                        <span className="font-mono text-slate-900">{formatDate(certificate.issuedDate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className="text-emerald-700 font-bold">● Valid Corporate Record</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Badge Pill */}
                  <div className="text-center my-6">
                    <span className="inline-block bg-[#102068] text-white px-8 sm:px-10 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm font-sans">
                      {getCategoryTitle(certificate.category)}
                    </span>
                  </div>

                  {/* EXPERIENCE CERTIFICATE */}
                  {certificate.category === 'experience' && (
                    <div className="space-y-5 text-justify leading-relaxed">
                      <p className="text-center font-bold text-sm tracking-wider uppercase text-slate-700 font-sans">
                        TO WHOMSOEVER IT MAY CONCERN
                      </p>

                      <p className="text-sm sm:text-base pt-2">
                        This is to certify that{' '}
                        <strong className="font-bold text-slate-950 underline decoration-slate-400 underline-offset-4">
                          {certificate.recipientName}
                        </strong>{' '}
                        was employed and actively engaged with{' '}
                        <strong>Infoyashonand Technology Pvt. Ltd.</strong> in the capacity of{' '}
                        <strong className="text-blue-950 font-bold">
                          {certificate.designation || 'Full-Stack Web Development (React & Node.js)'}
                        </strong>{' '}
                        within the <strong>{certificate.department || 'Technology'}</strong> department from{' '}
                        <span className="font-mono font-semibold">{formatDate(certificate.startDate)}</span> to{' '}
                        <span className="font-mono font-semibold">{formatDate(certificate.endDate)}</span>
                        {certificate.duration ? ` (${certificate.duration})` : ''}.
                      </p>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2 font-sans">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-700 shrink-0">Key Responsibilities &amp; Focus:</span>
                          <span className="text-slate-800 font-medium">
                            {certificate.responsibilities ||
                              'Successfully built and delivered responsive web applications, integrated microservices, and collaborated on full-stack architecture.'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                          <span className="font-bold text-slate-700 shrink-0">Overall Performance Grade:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                            {certificate.performanceGrade || 'Outstanding (A+)'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base">
                        During their tenure, we observed {certificate.recipientName} to be a highly dedicated, self-motivated, and disciplined professional with a strong commitment to quality engineering. Their conduct, character, and professional attitude were exemplary.
                      </p>

                      <p className="text-sm sm:text-base">
                        We extend our sincere appreciation for their valuable contributions to Infoyashonand Technology Pvt. Ltd. and wish them immense success and growth in all their future career pursuits.
                      </p>
                    </div>
                  )}

                  {/* AWARD CERTIFICATE */}
                  {certificate.category === 'award' && (
                    <div className="space-y-6 text-center leading-relaxed">
                      <p className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-slate-500">
                        THIS CERTIFICATE IS PROUDLY CONFERRED UPON
                      </p>

                      <div className="py-2">
                        <h2
                          className="text-2xl sm:text-3xl font-black text-[#102068] tracking-tight uppercase underline decoration-amber-400 decoration-2 underline-offset-8"
                          style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}
                        >
                          {certificate.recipientName}
                        </h2>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium">
                        In formal recognition of extraordinary technical competence, outstanding dedication, and exemplary achievements in:
                      </p>

                      <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-1.5 max-w-xl mx-auto shadow-xs">
                        <h3 className="text-base sm:text-lg font-black text-amber-950 font-sans uppercase tracking-tight">
                          {certificate.awardTitle || 'Excellence in Engineering & Innovation'}
                        </h3>
                        {certificate.awardCategory && (
                          <p className="text-xs font-bold text-amber-800 font-sans">
                            Domain / Category: {certificate.awardCategory}
                          </p>
                        )}
                      </div>

                      <div className="max-w-xl mx-auto text-justify text-xs sm:text-sm leading-relaxed text-slate-700 italic px-4">
                        &quot;{certificate.citation ||
                          'Awarded for demonstration of outstanding work ethic, technical brilliance, and significant contributions toward driving innovation and project excellence at Infoyashonand Technology Pvt. Ltd.'}&quot;
                      </div>

                      <p className="text-xs text-slate-500 font-sans font-medium pt-1">
                        Conferred on this day,{' '}
                        <span className="font-mono font-bold text-slate-800">{formatDate(certificate.issuedDate)}</span>, under corporate authority of Infoyashonand Technology Pvt. Ltd.
                      </p>
                    </div>
                  )}

                  {/* RECOMMENDATION CERTIFICATE */}
                  {certificate.category === 'recommendation' && (
                    <div className="space-y-4 text-justify leading-relaxed">
                      <p className="text-center font-bold text-sm tracking-wider uppercase text-slate-700 font-sans">
                        TO WHOM IT MAY CONCERN
                      </p>

                      <p className="text-sm sm:text-base pt-1">
                        It is my distinct privilege to furnish this official recommendation for{' '}
                        <strong className="font-bold text-slate-950 underline decoration-slate-400 underline-offset-4">
                          {certificate.recipientName}
                        </strong>
                        , who has been associated with <strong>Infoyashonand Technology Pvt. Ltd.</strong> in the capacity of{' '}
                        <strong className="text-blue-950">
                          {certificate.associationRole || 'Full-Stack Web Development Trainee'}
                        </strong>.
                      </p>

                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-xs sm:text-sm space-y-2 font-sans">
                        <div>
                          <span className="font-bold text-blue-950">Recommended For: </span>
                          <span className="text-slate-800 font-semibold">
                            {certificate.recommendedFor ||
                              "Master's Degree in Computer Science & Advanced Software Engineering Roles"}
                          </span>
                        </div>
                        {certificate.keyStrengths && (
                          <div className="pt-1 border-t border-blue-200">
                            <span className="font-bold text-blue-950">Demonstrated Strengths &amp; Core Competencies: </span>
                            <span className="text-slate-700 font-medium">{certificate.keyStrengths}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm sm:text-base">
                        {certificate.recommendationNote ||
                          'Throughout their engagement with us, they demonstrated exceptional intellectual agility, structured problem-solving skills, and deep engineering discipline. They adapted rapidly to enterprise workflows, collaborated effectively with cross-functional development teams, and displayed exemplary accountability.'}
                      </p>

                      <p className="text-sm sm:text-base">
                        Based on their consistent excellence and strong character, I recommend {certificate.recipientName} with highest confidence. I am certain they will be an invaluable asset to any prospective academic program or corporate organization.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. BOTTOM AUTHORITY SIGNATURE, QR CODE & SEAL BLOCK */}
                <div className="pt-10 sm:pt-14 pb-2 flex justify-between items-end text-xs sm:text-sm font-sans gap-2">
                  {/* Left: Official Stamp Box */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center text-[10px] text-slate-400 space-y-1 w-28 sm:w-32 shrink-0">
                    <span className="material-symbols-outlined text-lg text-slate-300 block">verified_user</span>
                    <p className="font-bold text-slate-600 font-mono">SEAL &amp; STAMP</p>
                    <p className="text-[8px] text-slate-400">ITPL Authorized Corporate Seal</p>
                  </div>

                  {/* Middle: LIVE SYNCED QR CODE */}
                  <div className="border border-slate-200 bg-white p-2 rounded-xl text-center flex flex-col items-center justify-center shadow-xs shrink-0">
                    <QRCodeSVG
                      value={getVerificationUrl(certificate.verificationId)}
                      size={74}
                      level="M"
                      includeMargin={false}
                    />
                    <p className="font-bold text-[8.5px] text-slate-700 font-sans tracking-tight uppercase mt-1">
                      Scan to Verify Live
                    </p>
                    <p className="font-mono text-[7.5px] font-bold text-blue-700">
                      {certificate.verificationId}
                    </p>
                  </div>

                  {/* Right: Founder & CEO Signature */}
                  <div className="text-right space-y-1 shrink-0 w-44 sm:w-52">
                    <div className="h-8 flex items-end justify-end">
                      <span className="text-[12px] font-mono italic text-blue-900 font-bold">
                        ~ {certificate.signatoryName || 'Shriram Khabale'}
                      </span>
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {certificate.signatoryName || 'Shriram Khabale'}
                      </p>
                      <p className="text-[11px] font-semibold text-blue-800">
                        {certificate.signatoryTitle || 'Founder & Chief Executive Officer'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {certificate.companyName || 'Infoyashonand Technology Pvt. Ltd.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BOTTOM LETTERHEAD FOOTER */}
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
          </div>
        )}
      </div>
    </div>
  );
};
