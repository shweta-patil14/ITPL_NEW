import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Copy, ArrowRight, MessageCircle, Upload, CheckCircle2, Phone, Mail, Building, GraduationCap, MapPin, User } from 'lucide-react';
import { itplPrograms } from '../../data/itplConnectPrograms';
import { adminDb } from '../../services/adminDb';
import { createApplicationFirestore } from '../../firebase/firestoreService';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedTrackId?: string;
  onApplicationSubmitted?: (app: any) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  preSelectedTrackId,
  onApplicationSubmitted,
}) => {
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form states
  const [trackId, setTrackId] = useState<string>(preSelectedTrackId || itplPrograms[0].id);
  const [mode, setMode] = useState<string>('Hybrid');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('Sangli');
  const [education, setEducation] = useState<string>('B.E. / B.Tech Computer Science');
  const [collegeName, setCollegeName] = useState<string>('');
  const [graduationYear, setGraduationYear] = useState<string>('2026');
  const [experienceLevel, setExperienceLevel] = useState<string>('Student');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('My_Resume.pdf');
  const [whyJoin, setWhyJoin] = useState<string>('');

  useEffect(() => {
    if (preSelectedTrackId) {
      setTrackId(preSelectedTrackId);
    }
  }, [preSelectedTrackId]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  const handleNextOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      const selectedTrack = itplPrograms.find((t) => t.id === trackId) || itplPrograms[0];
      const trackingCode = `INF-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const newApp = {
        id: `app_${Date.now()}`,
        trackingNumber: trackingCode,
        fullName: fullName || 'Candidate',
        email: email || 'candidate@example.com',
        phone: phone || '9146835824',
        trackId: trackId,
        trackTitle: selectedTrack.title,
        education: education,
        graduationYear: graduationYear,
        collegeName: collegeName || 'Shivaji University / Pune University',
        city: city,
        experienceLevel: experienceLevel,
        mode: mode,
        githubUrl: githubUrl,
        linkedinUrl: linkedinUrl,
        portfolioUrl: portfolioUrl,
        resumeFileName: resumeFileName,
        whyJoin: whyJoin || 'Looking to master production coding and build industry projects.',
        submittedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Application Received',
        interviewDate: 'Upcoming (2-3 business days)',
        assignedMentor: 'Senior Technical Lead',
      };

      try {
        const stored = JSON.parse(localStorage.getItem('infoyashonand_applications') || '[]');
        localStorage.setItem('infoyashonand_applications', JSON.stringify([newApp, ...stored]));

        // Sync with adminDb & Firestore (ATS Pipeline)
        const adminApp = adminDb.createApplication({
          id: newApp.id,
          jobTitle: newApp.trackTitle,
          candidateName: newApp.fullName,
          candidateEmail: newApp.email,
          candidatePhone: newApp.phone,
          department: 'Technology',
          stage: 'submitted',
          appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: [`Tracking ID: ${newApp.trackingNumber}`, `Education: ${newApp.education} (${newApp.collegeName})`, `City: ${newApp.city}`],
        });
        createApplicationFirestore(adminApp);

        // Also record inquiry in Admin DB so it appears in HR Admin inquiries desk
        adminDb.saveInquiry({
          id: `inq-${newApp.id}`,
          name: newApp.fullName,
          email: newApp.email,
          phone: newApp.phone,
          service: `Internship Track: ${newApp.trackTitle}`,
          company: newApp.collegeName || newApp.city,
          message: `Tracking ID: ${newApp.trackingNumber} | Education: ${newApp.education} (${newApp.graduationYear}) | College: ${newApp.collegeName} | City: ${newApp.city} | Mode: ${newApp.mode} | Statement: ${newApp.whyJoin}`,
          source: 'Candidate Internship Application Form',
          status: 'New',
        });
      } catch (err) {
        console.error('Failed to save application to storage/Firestore', err);
      }

      setSubmittedData(newApp);
      if (onApplicationSubmitted) {
        onApplicationSubmitted(newApp);
      }
      setStep(4);
    }
  };

  const copyTracking = () => {
    if (submittedData?.trackingNumber) {
      navigator.clipboard.writeText(submittedData.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const whatsappInquiryUrl = submittedData
    ? `https://wa.me/919146835824?text=${encodeURIComponent(
        `Hello Infoyashonand Team, I have submitted my internship application for ${submittedData.trackTitle}. My Tracking ID is ${submittedData.trackingNumber}. Name: ${submittedData.fullName}.`
      )}`
    : `https://wa.me/919146835824`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#00113a]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-amber-50/70 text-[#00113a] p-6 sm:p-7 shrink-0 relative border-b border-slate-200/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 border border-red-400/30"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 text-[#0059bb] text-[12px] font-bold uppercase tracking-widest font-heading mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>INFOYASHONAND Internship Portal</span>
          </div>

          <h2 className="font-heading font-extrabold text-[22px] sm:text-[26px] text-[#00113a] leading-tight">
            {step === 4 ? 'Application Submitted!' : 'Internship Application Form'}
          </h2>

          {step < 4 && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-2 flex-1 rounded-full transition-all ${
                      s <= step ? 'bg-[#0059bb]' : 'bg-slate-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* STEP 1: Track & Mode */}
          {step === 1 && (
            <form onSubmit={handleNextOrSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Career Internship Track *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {itplPrograms.map((p) => {
                    const isSelected = trackId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setTrackId(p.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#0059bb] bg-blue-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#0059bb] text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading font-bold text-sm text-[#00113a] truncate">
                            {p.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{p.duration}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Preferred Internship Mode *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Hybrid', 'Offline (Sangli)', 'Online'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer text-center ${
                        mode === m
                          ? 'border-[#0059bb] bg-blue-50 text-[#0059bb]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00113a] hover:bg-[#0059bb] text-white font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continue to Personal Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Personal & Academic Details */}
          {step === 2 && (
            <form onSubmit={handleNextOrSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    WhatsApp / Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Current City / Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Sangli, Pune, Kolhapur, etc."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Degree / Qualification *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="B.E. Computer / BCA / MCA / BSC"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    College / University Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Walchand College of Engg."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Graduation Year *
                  </label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb] bg-white"
                  >
                    {['2027', '2026', '2025', '2024', '2023', '2022', 'Earlier'].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Current Status *
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb] bg-white"
                  >
                    <option value="Student">Current Student</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#00113a] hover:bg-[#0059bb] text-white font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continue to Profiles &amp; Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Profiles & Resume */}
          {step === 3 && (
            <form onSubmit={handleNextOrSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    GitHub / Portfolio Profile Link
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Attach Resume (PDF/DOCX)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-[#0059bb] transition-colors relative cursor-pointer bg-slate-50/60">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-[#0059bb] mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      {resumeFileName ? resumeFileName : 'Click or drag resume file to upload'}
                    </p>
                    <span className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 5MB</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Why do you want to intern at Infoyashonand?
                  </label>
                  <textarea
                    rows={3}
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="Briefly describe your interest in live production software, your learning goals, and what you hope to achieve..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0059bb]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-heading font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Submit Application</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation Screen */}
          {step === 4 && submittedData && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Submission Confirmed
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-[#00113a] mt-2">
                  Thank You, {submittedData.fullName}!
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                  Your application for the <strong>{submittedData.trackTitle}</strong> track ({submittedData.mode}) has been safely recorded in our admissions system.
                </p>
              </div>

              {/* Tracking ID Badge */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Your Tracking Number:
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#00113a]">
                    {submittedData.trackingNumber}
                  </span>
                </div>
                <button
                  onClick={copyTracking}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 max-w-md mx-auto bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-left">
                <strong>Next Step:</strong> Our technical recruiting panel will screen your profile and schedule a 15-minute alignment call within 2 to 3 business days. You can also send a fast WhatsApp notification below!
              </div>

              {/* WhatsApp Notify */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>Send Notification on WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
