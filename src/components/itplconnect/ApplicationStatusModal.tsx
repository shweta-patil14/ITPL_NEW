import React, { useState } from 'react';
import { X, Search, Sparkles, CheckCircle2, Clock, Calendar, User, Phone, MapPin, Building, MessageCircle } from 'lucide-react';
import { adminDb } from '../../services/adminDb';

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNew: () => void;
}

export const ApplicationStatusModal: React.FC<ApplicationStatusModalProps> = ({
  isOpen,
  onClose,
  onApplyNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundApp, setFoundApp] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const stored = JSON.parse(localStorage.getItem('infoyashonand_applications') || '[]');
      const cleanTerm = searchTerm.trim().toLowerCase();
      const match = stored.find(
        (app: any) =>
          app.trackingNumber?.toLowerCase() === cleanTerm ||
          app.email?.toLowerCase() === cleanTerm ||
          app.phone?.includes(cleanTerm)
      );

      const adminApps = adminDb.getApplications();
      const adminMatch = adminApps.find(
        (a) =>
          a.id.toLowerCase() === cleanTerm ||
          a.candidateEmail.toLowerCase() === cleanTerm ||
          (a.candidatePhone && a.candidatePhone.includes(cleanTerm)) ||
          (a.notes && a.notes.some((n) => n.toLowerCase().includes(cleanTerm)))
      );

      if (match) {
        setFoundApp(match);
      } else if (adminMatch) {
        const trackNote = adminMatch.notes?.find((n) => n.startsWith('Tracking ID:'));
        setFoundApp({
          id: adminMatch.id,
          trackingNumber: trackNote ? trackNote.replace('Tracking ID:', '').trim() : adminMatch.id,
          fullName: adminMatch.candidateName,
          email: adminMatch.candidateEmail,
          phone: adminMatch.candidatePhone || '',
          trackId: adminMatch.department,
          trackTitle: adminMatch.jobTitle,
          education: 'Engineering / Computer Science',
          graduationYear: '2026',
          collegeName: 'ITPL Platform',
          city: 'Sangli / Maharashtra',
          experienceLevel: 'Trainee',
          mode: 'In-office / Hybrid',
          whyJoin: 'Live industry project and job placement.',
          submittedAt: adminMatch.appliedDate || 'Recently Submitted',
          status: adminMatch.stage.replace(/_/g, ' ').toUpperCase(),
          interviewDate: adminMatch.technicalInterview ? 'Technical Completed' : 'Upcoming review',
          assignedMentor: 'Senior Technical Lead',
        });
      } else if (
        cleanTerm.includes('test') ||
        cleanTerm.includes('inf') ||
        cleanTerm.includes('9146835824')
      ) {
        setFoundApp({
          id: 'sample_1',
          trackingNumber: 'INF-2026-84920',
          fullName: 'Aarav Kulkarni',
          email: 'aarav.kulkarni@example.com',
          phone: '+91 9146835824',
          trackId: 'data-analyst',
          trackTitle: 'Data Analyst',
          education: 'B.E. Computer Science',
          graduationYear: '2026',
          collegeName: 'Pune Institute of Computer Technology',
          city: 'Pune / Sangli',
          experienceLevel: 'Student',
          mode: 'Hybrid',
          whyJoin: 'Passionate about PowerBI and SQL dashboarding.',
          submittedAt: 'Today at 10:30 AM',
          status: 'Profile Under Review',
          interviewDate: 'Upcoming Friday, 3:00 PM IST',
          assignedMentor: 'Er. Sandeep Patil (Lead Data Architect)',
        });
      } else {
        setFoundApp(null);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Search error', err);
      setFoundApp(null);
      setHasSearched(true);
    }
  };

  const milestones = [
    {
      title: 'Application Submitted',
      desc: 'Received & logged in database',
      active: true,
    },
    {
      title: 'Profile Screening',
      desc: 'Reviewed by Tech Lead & HR Panel',
      active: true,
    },
    {
      title: 'Technical Discussion',
      desc: '15-min fit & roadmap call',
      active:
        foundApp?.status?.includes('Selected') ||
        foundApp?.status?.includes('Interview') ||
        foundApp?.status?.includes('Discussion'),
    },
    {
      title: 'Offer Letter & Onboarding',
      desc: 'Formal welcome pack sent',
      active: foundApp?.status?.includes('Selected') || foundApp?.status?.includes('Onboarded'),
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#00113a]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00113a] via-[#001f5c] to-[#002366] text-white p-6 sm:p-7 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 border border-red-400/30"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-[12px] font-bold uppercase tracking-widest font-heading mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Application Status Portal</span>
          </div>

          <h2 className="font-heading font-extrabold text-[22px] sm:text-[24px] text-white leading-tight">
            Track Your Internship Application
          </h2>
          <p className="text-[13px] text-[#b3c5ff] mt-1">
            Check review status, interview schedule, and assigned mentor.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Tracking ID (e.g. INF-2026-XXXXX) or Phone"
                className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] rounded-2xl border border-slate-200 text-sm text-[#00113a] focus:outline-none focus:border-[#0059bb] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00113a] hover:bg-[#0059bb] text-white font-heading font-bold text-sm px-5 py-3 rounded-2xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Search</span>
            </button>
          </form>

          {!hasSearched && (
            <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 text-xs sm:text-sm text-[#00113a] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0059bb] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold">Searching for your application?</p>
                <p className="text-slate-600 mt-1 leading-relaxed text-xs">
                  If you just submitted an application in this browser, search by your 10-digit mobile number, or enter <strong>INF</strong> to test the live tracking view.
                </p>
              </div>
            </div>
          )}

          {hasSearched && foundApp && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* App Summary Card */}
              <div className="bg-[#f8f9fa] rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {foundApp.trackingNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0059bb] border border-blue-200">
                    {foundApp.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#00113a]">
                    {foundApp.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-[#0059bb]">
                    Track: {foundApp.trackTitle} ({foundApp.mode})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div>
                    Submitted: <strong className="text-slate-800">{foundApp.submittedAt}</strong>
                  </div>
                  <div>
                    City: <strong className="text-slate-800">{foundApp.city}</strong>
                  </div>
                  <div className="col-span-2">
                    College: <strong className="text-slate-800">{foundApp.collegeName}</strong>
                  </div>
                  <div className="col-span-2">
                    Mentor: <strong className="text-[#0059bb]">{foundApp.assignedMentor}</strong>
                  </div>
                  {foundApp.interviewDate && (
                    <div className="col-span-2 text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Interview / Call: <strong>{foundApp.interviewDate}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestones Pipeline */}
              <div>
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                  Application Milestones
                </h4>
                <div className="space-y-3">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          m.active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {m.active ? '✓' : idx + 1}
                      </div>
                      <div>
                        <h5
                          className={`text-sm font-bold ${
                            m.active ? 'text-[#00113a]' : 'text-slate-400'
                          }`}
                        >
                          {m.title}
                        </h5>
                        <p className="text-xs text-slate-500">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <a
                  href={`https://wa.me/919146835824?text=${encodeURIComponent(
                    `Hello Infoyashonand Team, checking status for application ${foundApp.trackingNumber} (${foundApp.fullName})`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect with Admissions Desk</span>
                </a>
              </div>
            </div>
          )}

          {hasSearched && !foundApp && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#00113a]">
                No Application Found
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We couldn't find an application matching "{searchTerm}". Please check your tracking number or register a new one.
              </p>
              <button
                onClick={onApplyNew}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#00113a] hover:bg-[#0059bb] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Apply for New Internship
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
