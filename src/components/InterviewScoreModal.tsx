import React, { useState, useEffect } from 'react';
import { adminDb, ApplicationItem, TechnicalInterviewScore, HrInterviewScore } from '../services/adminDb';

interface InterviewScoreModalProps {
  application: ApplicationItem;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onGenerateOfferLetter?: (app: ApplicationItem) => void;
}

export const InterviewScoreModal: React.FC<InterviewScoreModalProps> = ({
  application,
  isOpen,
  onClose,
  onSaved,
  onGenerateOfferLetter,
}) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'hr'>('technical');

  // Technical Round State
  const [techInterviewer, setTechInterviewer] = useState(
    application.technicalInterview?.interviewerName || 'Tushar Pawar [Senior Technical Lead]'
  );
  const [techDate, setTechDate] = useState(
    application.technicalInterview?.interviewDate || new Date().toISOString().split('T')[0]
  );
  const [techCoding, setTechCoding] = useState(application.technicalInterview?.codingScore ?? 20);
  const [techProblemSolving, setTechProblemSolving] = useState(
    application.technicalInterview?.problemSolvingScore ?? 20
  );
  const [techStack, setTechStack] = useState(application.technicalInterview?.techStackScore ?? 20);
  const [techComm, setTechComm] = useState(application.technicalInterview?.communicationScore ?? 20);
  const [techFeedback, setTechFeedback] = useState(
    application.technicalInterview?.feedback ||
      'Demonstrated solid problem solving skills and strong grasp of core fundamentals. Ready for HR evaluation.'
  );
  const [techRecommendation, setTechRecommendation] = useState<'Pass' | 'Hold' | 'Fail'>(
    application.technicalInterview?.recommendation || 'Pass'
  );

  // HR Round State
  const [hrInterviewer, setHrInterviewer] = useState(
    application.hrInterview?.interviewerName || 'Ms. Kshitija Patil [HR Manager]'
  );
  const [hrDate, setHrDate] = useState(
    application.hrInterview?.interviewDate || new Date().toISOString().split('T')[0]
  );
  const [hrComm, setHrComm] = useState(application.hrInterview?.communicationScore ?? 22);
  const [hrCulturalFit, setHrCulturalFit] = useState(application.hrInterview?.culturalFitScore ?? 22);
  const [hrAttitude, setHrAttitude] = useState(application.hrInterview?.attitudeScore ?? 22);
  const [hrCommitment, setHrCommitment] = useState(application.hrInterview?.commitmentScore ?? 22);
  const [hrJoiningDate, setHrJoiningDate] = useState(
    application.hrInterview?.expectedJoiningDate || '2026-11-01'
  );
  const [hrSalary, setHrSalary] = useState(
    application.hrInterview?.offeredStipendOrSalary || '₹ 6,50,000 / year'
  );
  const [hrFeedback, setHrFeedback] = useState(
    application.hrInterview?.feedback ||
      'Excellent interpersonal communication and enthusiasm for the role. Displays strong alignment with company values.'
  );
  const [hrRecommendation, setHrRecommendation] = useState<'Pass' | 'Hold' | 'Fail'>(
    application.hrInterview?.recommendation || 'Pass'
  );

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state whenever application changes
  useEffect(() => {
    if (application) {
      if (application.technicalInterview) {
        setTechInterviewer(application.technicalInterview.interviewerName);
        setTechDate(application.technicalInterview.interviewDate);
        setTechCoding(application.technicalInterview.codingScore);
        setTechProblemSolving(application.technicalInterview.problemSolvingScore);
        setTechStack(application.technicalInterview.techStackScore);
        setTechComm(application.technicalInterview.communicationScore);
        setTechFeedback(application.technicalInterview.feedback);
        setTechRecommendation(application.technicalInterview.recommendation);
      }
      if (application.hrInterview) {
        setHrInterviewer(application.hrInterview.interviewerName);
        setHrDate(application.hrInterview.interviewDate);
        setHrComm(application.hrInterview.communicationScore);
        setHrCulturalFit(application.hrInterview.culturalFitScore);
        setHrAttitude(application.hrInterview.attitudeScore);
        setHrCommitment(application.hrInterview.commitmentScore);
        setHrJoiningDate(application.hrInterview.expectedJoiningDate || '2026-11-01');
        setHrSalary(application.hrInterview.offeredStipendOrSalary || '₹ 6,50,000 / year');
        setHrFeedback(application.hrInterview.feedback);
        setHrRecommendation(application.hrInterview.recommendation);
      }
      // If candidate is already at hr_interview stage, default to hr tab
      if (application.stage === 'hr_interview' && !application.hrInterview) {
        setActiveTab('hr');
      } else {
        setActiveTab('technical');
      }
    }
  }, [application]);

  if (!isOpen) return null;

  const techTotal = Math.min(100, Math.max(0, techCoding + techProblemSolving + techStack + techComm));
  const hrTotal = Math.min(100, Math.max(0, hrComm + hrCulturalFit + hrAttitude + hrCommitment));
  const overallAverage = Math.round((techTotal + hrTotal) / 2);

  const isTechPassed = techRecommendation === 'Pass' && techTotal >= 60;
  const isHrPassed = hrRecommendation === 'Pass' && hrTotal >= 60;
  const isOfferEligible = isTechPassed && isHrPassed && overallAverage >= 60;

  const handleSaveScores = (options?: { generateOffer?: boolean }) => {
    const techData: TechnicalInterviewScore = {
      interviewerName: techInterviewer,
      interviewDate: techDate,
      codingScore: techCoding,
      problemSolvingScore: techProblemSolving,
      techStackScore: techStack,
      communicationScore: techComm,
      totalScore: techTotal,
      feedback: techFeedback,
      recommendation: techRecommendation,
      completedAt: new Date().toISOString(),
    };

    // Only save HR score if it was filled/touched or if tab is hr
    const hrData: HrInterviewScore = {
      interviewerName: hrInterviewer,
      interviewDate: hrDate,
      communicationScore: hrComm,
      culturalFitScore: hrCulturalFit,
      attitudeScore: hrAttitude,
      commitmentScore: hrCommitment,
      totalScore: hrTotal,
      feedback: hrFeedback,
      expectedJoiningDate: hrJoiningDate,
      offeredStipendOrSalary: hrSalary,
      recommendation: hrRecommendation,
      completedAt: new Date().toISOString(),
    };

    const updatedApp = adminDb.saveInterviewScores(application.id, {
      technical: techData,
      hr: activeTab === 'hr' || application.hrInterview || hrRecommendation !== 'Hold' ? hrData : undefined,
    });

    if (!updatedApp) {
      setNotification({ type: 'error', message: 'Failed to save interview score sheet.' });
      return;
    }

    onSaved();

    if (updatedApp.stage === 'selected') {
      const offerRes = adminDb.generateOfferLetterForApplicant(application.id, {
        joiningDate: hrJoiningDate,
        employmentType: 'Full-Time Employment / Trainee',
      });
      onSaved();
      setNotification({
        type: 'success',
        message: `🎉 Candidate cleared all interview rounds! Status set to "Selected" and Offer Letter #${offerRes.offer?.verificationId || ''} automatically generated.`,
      });
      setTimeout(() => {
        setNotification(null);
        if (onGenerateOfferLetter) {
          onGenerateOfferLetter(updatedApp);
        }
        onClose();
      }, 1200);
    } else if (options?.generateOffer) {
      const offerCheck = adminDb.canGenerateOfferLetter(application.id);
      if (!offerCheck.allowed) {
        setNotification({ type: 'error', message: offerCheck.reason || 'Offer Letter requirements not satisfied.' });
        return;
      }

      const offerRes = adminDb.generateOfferLetterForApplicant(application.id, {
        joiningDate: hrJoiningDate,
        employmentType: 'Full-Time Employment / Trainee',
      });

      if (offerRes.success) {
        onSaved();
        if (onGenerateOfferLetter) {
          onGenerateOfferLetter(updatedApp);
        }
        onClose();
      } else {
        setNotification({ type: 'error', message: offerRes.error || 'Failed to generate offer letter.' });
      }
    } else {
      setNotification({
        type: 'success',
        message: 'Evaluation score sheet successfully saved and candidate record updated!',
      });
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="glass-card max-w-4xl w-full p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl bg-white max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-xs">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Interview Evaluation Sheet &amp; Scorecard
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Stage: {application.stage.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Candidate: <strong className="text-slate-800">{application.candidateName}</strong> • {application.jobTitle} ({application.department || 'Technology'}) • {application.candidateEmail}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {notification && (
          <div
            className={`my-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* CANDIDATE ASSESSMENT & PIPELINE STATUS SUMMARY */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Online Aptitude</span>
              <span className="font-bold text-emerald-600 text-sm">
                {application.testPercentage ? `${application.testPercentage}%` : '80%'} (Passed)
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Round 4: Technical</span>
              <span
                className={`font-bold text-sm ${
                  isTechPassed ? 'text-emerald-700' : techRecommendation === 'Fail' ? 'text-rose-600' : 'text-amber-600'
                }`}
              >
                {techTotal}/100 • {techRecommendation}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Round 5: HR Round</span>
              <span
                className={`font-bold text-sm ${
                  isHrPassed ? 'text-emerald-700' : hrRecommendation === 'Fail' ? 'text-rose-600' : 'text-amber-600'
                }`}
              >
                {hrTotal}/100 • {hrRecommendation}
              </span>
            </div>
          </div>

          {/* Offer Letter Unlock Badge */}
          <div className="flex items-center gap-2">
            {isOfferEligible ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                Offer Letter Unlocked
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5" title="Both Technical & HR Rounds must be marked 'Pass' with >=60% combined score">
                <span className="material-symbols-outlined text-sm text-amber-600">lock</span>
                Offer Letter Locked (Pass both rounds)
              </span>
            )}
          </div>
        </div>

        {/* ROUND SELECTOR TABS */}
        <div className="flex border-b border-slate-200 mt-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'technical'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span>Round 4: Technical Round Scorecard</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isTechPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {techTotal}/100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'hr'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            <span>Round 5: HR Interview Scorecard</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isHrPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {hrTotal}/100
            </span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'technical' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              {/* Interviewer & Date Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Technical Lead / Interviewer *
                  </label>
                  <input
                    type="text"
                    value={techInterviewer}
                    onChange={(e) => setTechInterviewer(e.target.value)}
                    placeholder="e.g. Tushar Pawar [Senior Technical Lead]"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    value={techDate}
                    onChange={(e) => setTechDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* TECHNICAL PARAMETERS SCORING */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-blue-600">analytics</span>
                    Technical Skill Matrix Evaluation (Total: 100 Marks)
                  </h4>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-bold block">Aggregated Score</span>
                    <span
                      className={`text-lg font-black ${
                        techTotal >= 75
                          ? 'text-emerald-600'
                          : techTotal >= 60
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {techTotal} / 100
                    </span>
                  </div>
                </div>

                {/* Score Item 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      1. Core Programming &amp; Coding Proficiency <span className="text-slate-400 font-normal">(Syntax, Algorithms, Data Structures)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {techCoding} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={techCoding}
                    onChange={(e) => setTechCoding(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Score Item 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      2. Problem Solving &amp; Logic Building <span className="text-slate-400 font-normal">(Edge cases, analytical thought process)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {techProblemSolving} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={techProblemSolving}
                    onChange={(e) => setTechProblemSolving(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Score Item 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      3. Tech Stack &amp; Domain Expertise <span className="text-slate-400 font-normal">(React, Node, Database, APIs, Git)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {techStack} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={techStack}
                    onChange={(e) => setTechStack(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Score Item 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      4. System Architecture, Clean Code &amp; Debugging <span className="text-slate-400 font-normal">(Modularity, scalability, error tracking)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {techComm} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={techComm}
                    onChange={(e) => setTechComm(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Technical Feedback & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Technical Lead Feedback &amp; Observations *
                  </label>
                  <textarea
                    rows={3}
                    value={techFeedback}
                    onChange={(e) => setTechFeedback(e.target.value)}
                    placeholder="Document candidate's coding performance, technical strengths, and improvement areas..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Round 4 Recommendation *
                  </label>
                  <select
                    value={techRecommendation}
                    onChange={(e) => setTechRecommendation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-blue-600 cursor-pointer"
                  >
                    <option value="Pass">✅ Pass (Promote to HR Round)</option>
                    <option value="Hold">⏳ Hold (Needs Further Review)</option>
                    <option value="Fail">❌ Fail (Did Not Qualify)</option>
                  </select>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-2 text-[11px] text-slate-600">
                    Passing threshold is <strong>60%</strong> with Recommendation marked as <strong>Pass</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hr' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              {/* HR Interviewer & Date Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    HR Manager / Interviewer *
                  </label>
                  <input
                    type="text"
                    value={hrInterviewer}
                    onChange={(e) => setHrInterviewer(e.target.value)}
                    placeholder="e.g. Ms. Kshitija Patil [HR Manager]"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    HR Interview Date *
                  </label>
                  <input
                    type="date"
                    value={hrDate}
                    onChange={(e) => setHrDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* HR PARAMETERS SCORING */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-blue-600">psychology</span>
                    Behavioral &amp; Culture Assessment (Total: 100 Marks)
                  </h4>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-bold block">HR Score</span>
                    <span
                      className={`text-lg font-black ${
                        hrTotal >= 75
                          ? 'text-emerald-600'
                          : hrTotal >= 60
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {hrTotal} / 100
                    </span>
                  </div>
                </div>

                {/* HR Item 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      1. Communication, Articulation &amp; Confidence <span className="text-slate-400 font-normal">(Verbal clarity, listening, active engagement)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {hrComm} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={hrComm}
                    onChange={(e) => setHrComm(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* HR Item 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      2. Cultural Fit &amp; Corporate Alignment <span className="text-slate-400 font-normal">(Integrity, respect, teamwork, work environment)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {hrCulturalFit} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={hrCulturalFit}
                    onChange={(e) => setHrCulturalFit(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* HR Item 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      3. Professional Attitude &amp; Adaptability <span className="text-slate-400 font-normal">(Work ethic, resilience under pressure, openness to learn)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {hrAttitude} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={hrAttitude}
                    onChange={(e) => setHrAttitude(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* HR Item 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">
                      4. Career Commitment &amp; Long-Term Vision <span className="text-slate-400 font-normal">(Growth aspirations, tenure dedication)</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {hrCommitment} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={hrCommitment}
                    onChange={(e) => setHrCommitment(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Offer Letter Pre-requisites & HR Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    Expected Joining Date
                  </label>
                  <input
                    type="date"
                    value={hrJoiningDate}
                    onChange={(e) => setHrJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    Agreed Annual CTC / Stipend
                  </label>
                  <input
                    type="text"
                    value={hrSalary}
                    onChange={(e) => setHrSalary(e.target.value)}
                    placeholder="e.g. ₹ 6,50,000 / year"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-slate-900 font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* HR Feedback & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    HR Manager Remarks &amp; Final Assessment *
                  </label>
                  <textarea
                    rows={3}
                    value={hrFeedback}
                    onChange={(e) => setHrFeedback(e.target.value)}
                    placeholder="Document behavioral feedback, cultural alignment, and salary negotiations..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Final HR Recommendation *
                  </label>
                  <select
                    value={hrRecommendation}
                    onChange={(e) => setHrRecommendation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-blue-600 cursor-pointer"
                  >
                    <option value="Pass">🎉 Pass (Approve for Offer Letter)</option>
                    <option value="Hold">⏳ Hold (Under Consideration)</option>
                    <option value="Fail">❌ Reject</option>
                  </select>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-2 text-[11px] text-slate-600">
                    Both rounds must be marked <strong>Pass</strong> with aggregated score &ge; <strong>60%</strong> to unlock offer letter generation.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-xs text-slate-500">
            {isOfferEligible ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                Both rounds cleared ({overallAverage}%). Ready to generate Offer Letter!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                Offer Letter will unlock once both rounds are marked Pass (Min. 60%).
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSaveScores({ generateOffer: false })}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-900 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Save Evaluation Sheet
            </button>

            {isOfferEligible && (
              <button
                type="button"
                onClick={() => handleSaveScores({ generateOffer: true })}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                title="Generates official corporate offer letter and updates candidate status to Selected"
              >
                <span className="material-symbols-outlined text-sm">mark_email_read</span>
                Issue Official Offer Letter
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
