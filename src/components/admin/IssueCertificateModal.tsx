import React, { useState, useEffect } from 'react';
import { adminDb, CertificateCategory, CertificateRecord } from '../../services/adminDb';

interface IssueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory: CertificateCategory;
  onIssued: (newCert: CertificateRecord) => void;
  certificateToEdit?: CertificateRecord | null;
  onUpdated?: (updatedCert: CertificateRecord) => void;
}

export const IssueCertificateModal: React.FC<IssueCertificateModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  onIssued,
  certificateToEdit,
  onUpdated,
}) => {
  const isEditing = Boolean(certificateToEdit);

  const [category, setCategory] = useState<CertificateCategory>(initialCategory);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Experience Certificate fields
  const [designation, setDesignation] = useState('Full-Stack Web Development (React & Node.js)');
  const [department, setDepartment] = useState('Technology');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('3 Months');
  const [performanceGrade, setPerformanceGrade] = useState('Outstanding (A+)');
  const [responsibilities, setResponsibilities] = useState(
    'Successfully developed enterprise web applications, integrated microservices, and collaborated on full-stack architecture.'
  );

  // Award Certificate fields
  const [awardTitle, setAwardTitle] = useState('Star Performer of the Year');
  const [awardCategory, setAwardCategory] = useState('Mobile Engineering & Cloud Architecture');
  const [citation, setCitation] = useState(
    'In recognition of exceptional dedication, outstanding technical excellence, and superior performance in delivering mission-critical applications.'
  );

  // Recommendation Certificate fields
  const [associationRole, setAssociationRole] = useState('Full-Stack Web Development Trainee');
  const [recommendedFor, setRecommendedFor] = useState(
    "Master's Degree in Computer Science & Advanced Software Engineering Roles"
  );
  const [keyStrengths, setKeyStrengths] = useState(
    'Full-Stack Architecture, Algorithmic Thinking, Problem Solving, High Ownership'
  );
  const [recommendationNote, setRecommendationNote] = useState(
    'Exhibited exemplary discipline, sharp technical intellect, and outstanding dedication during their tenure at Infoyashonand Technology. Highly recommended for future academic and professional endeavors.'
  );

  useEffect(() => {
    if (isOpen) {
      if (certificateToEdit) {
        setCategory(certificateToEdit.category);
        setRecipientName(certificateToEdit.recipientName || '');
        setRecipientEmail(certificateToEdit.recipientEmail || '');
        setIssueDate(certificateToEdit.issuedDate || new Date().toISOString().split('T')[0]);
        setDesignation(certificateToEdit.designation || 'Full-Stack Web Development (React & Node.js)');
        setDepartment(certificateToEdit.department || 'Technology');
        setStartDate(certificateToEdit.startDate || '2026-06-01');
        setEndDate(certificateToEdit.endDate || new Date().toISOString().split('T')[0]);
        setDuration(certificateToEdit.duration || '3 Months');
        setPerformanceGrade(certificateToEdit.performanceGrade || 'Outstanding (A+)');
        setResponsibilities(certificateToEdit.responsibilities || '');
        setAwardTitle(certificateToEdit.awardTitle || 'Star Performer of the Year');
        setAwardCategory(certificateToEdit.awardCategory || 'Mobile Engineering & Cloud Architecture');
        setCitation(certificateToEdit.citation || '');
        setAssociationRole(certificateToEdit.associationRole || 'Full-Stack Web Development Trainee');
        setRecommendedFor(certificateToEdit.recommendedFor || "Master's Degree in Computer Science & Advanced Software Engineering Roles");
        setKeyStrengths(certificateToEdit.keyStrengths || '');
        setRecommendationNote(certificateToEdit.recommendationNote || '');
      } else {
        setCategory(initialCategory);
        setRecipientName('');
        setRecipientEmail('');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDesignation('Full-Stack Web Development (React & Node.js)');
        setDepartment('Technology');
        setStartDate('2026-06-01');
        setEndDate(new Date().toISOString().split('T')[0]);
        setDuration('3 Months');
        setPerformanceGrade('Outstanding (A+)');
        setResponsibilities('Successfully developed enterprise web applications, integrated microservices, and collaborated on full-stack architecture.');
        setAwardTitle('Star Performer of the Year');
        setAwardCategory('Mobile Engineering & Cloud Architecture');
        setCitation('In recognition of exceptional dedication, outstanding technical excellence, and superior performance in delivering mission-critical applications.');
        setAssociationRole('Full-Stack Web Development Trainee');
        setRecommendedFor("Master's Degree in Computer Science & Advanced Software Engineering Roles");
        setKeyStrengths('Full-Stack Architecture, Algorithmic Thinking, Problem Solving, High Ownership');
        setRecommendationNote('Exhibited exemplary discipline, sharp technical intellect, and outstanding dedication during their tenure at Infoyashonand Technology. Highly recommended for future academic and professional endeavors.');
      }
    }
  }, [isOpen, initialCategory, certificateToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && certificateToEdit) {
      const updated = adminDb.updateCertificate(certificateToEdit.id, {
        category,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        issuedDate: issueDate,
        designation,
        department,
        startDate,
        endDate,
        duration,
        performanceGrade,
        responsibilities,
        awardTitle,
        awardCategory,
        citation,
        associationRole,
        recommendedFor,
        keyStrengths,
        recommendationNote,
      });

      if (updated && onUpdated) {
        onUpdated(updated);
      }
    } else {
      const newCert = adminDb.createCertificate({
        category,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        issuedDate: issueDate,
        designation,
        department,
        startDate,
        endDate,
        duration,
        performanceGrade,
        responsibilities,
        awardTitle,
        awardCategory,
        citation,
        associationRole,
        recommendedFor,
        keyStrengths,
        recommendationNote,
      });

      onIssued(newCert);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-4 bg-white max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{isEditing ? 'Edit Certificate Details' : 'Issue Corporate Certificate'}</span>
              {isEditing && certificateToEdit && (
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {certificateToEdit.verificationId}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isEditing
                ? 'Update recipient, project, or endorsement details (changes saved live)'
                : 'Create a verifiable certificate stored under the selected category (CEO Authorized)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Certificate Category Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Certificate Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CertificateCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-900 font-bold focus:outline-blue-600 cursor-pointer"
            >
              <option value="experience">1. Experience Certificate</option>
              <option value="award">2. Award Certificate</option>
              <option value="recommendation">3. Recommendation Certificate</option>
            </select>
          </div>

          {/* Recipient Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
              <input
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Snehal Kulkarni"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Corporate / Personal Email *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 font-medium"
              />
            </div>
          </div>

          {/* DYNAMIC FIELDS: 1. EXPERIENCE CERTIFICATE */}
          {category === 'experience' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Role / Designation *</label>
                  <input
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Full-Stack Web Development (React & Node.js)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Operations &amp; HR">Operations &amp; HR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Months"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Performance Grade</label>
                  <select
                    value={performanceGrade}
                    onChange={(e) => setPerformanceGrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  >
                    <option value="Outstanding (A+)">Outstanding (A+)</option>
                    <option value="Excellent (A)">Excellent (A)</option>
                    <option value="Very Good (B+)">Very Good (B+)</option>
                    <option value="Commendable">Commendable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Issue</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Responsibilities &amp; Remarks</label>
                <textarea
                  rows={2}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Key accomplishments and modules delivered..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS: 2. AWARD CERTIFICATE */}
          {category === 'award' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Award Title *</label>
                  <input
                    required
                    value={awardTitle}
                    onChange={(e) => setAwardTitle(e.target.value)}
                    placeholder="e.g. Star Performer of the Year"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Award Category / Domain *</label>
                  <input
                    required
                    value={awardCategory}
                    onChange={(e) => setAwardCategory(e.target.value)}
                    placeholder="e.g. Mobile Engineering &amp; Cloud"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Award *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Citation / Reason for Recognition *</label>
                <textarea
                  rows={3}
                  required
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  placeholder="Statement praising achievements, work ethic, and contributions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS: 3. RECOMMENDATION CERTIFICATE */}
          {category === 'recommendation' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Association at ITPL *</label>
                  <input
                    required
                    value={associationRole}
                    onChange={(e) => setAssociationRole(e.target.value)}
                    placeholder="e.g. Full-Stack Web Development Trainee"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recommended For *</label>
                  <input
                    required
                    value={recommendedFor}
                    onChange={(e) => setRecommendedFor(e.target.value)}
                    placeholder="e.g. Master's in CS / Senior Software Engineer"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Technical Strengths &amp; Skills</label>
                <input
                  value={keyStrengths}
                  onChange={(e) => setKeyStrengths(e.target.value)}
                  placeholder="Full-Stack Architecture, Algorithmic Thinking, Problem Solving"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommendation Letter Note *</label>
                <textarea
                  rows={3}
                  required
                  value={recommendationNote}
                  onChange={(e) => setRecommendationNote(e.target.value)}
                  placeholder="Official endorsement statement from leadership..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Issue</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 font-bold text-white rounded-xl shadow-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-blue-700 hover:bg-blue-600'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isEditing ? 'save' : 'workspace_premium'}
              </span>
              <span>{isEditing ? 'Save Changes' : 'Issue Certificate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
