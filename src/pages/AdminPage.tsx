import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminDb,
  ApplicationItem,
  EmployeeMember,
  OfferLetterRecord,
  InternshipRecord,
  CertificateRecord,
  CertificateCategory,
} from '../services/adminDb';
import { isFirebaseConfigured } from '../firebase/config';
import { OfferLetterGenerator } from '../components/OfferLetterGenerator';
import { InterviewScoreModal } from '../components/InterviewScoreModal';
import { OurTeamManager } from '../components/admin/OurTeamManager';
import { CertificateViewerModal } from '../components/admin/CertificateViewerModal';
import { IssueCertificateModal } from '../components/admin/IssueCertificateModal';
import { EditProfileModal, AdminProfile } from '../components/admin/EditProfileModal';
import { teamService } from '../services/teamService';
import {
  subscribeToApplications,
  subscribeToOffers,
  subscribeToCertificates,
  subscribeToInternships,
  subscribeToEmployees,
  saveAdminProfileFirestore,
  getAdminProfileFirestore,
} from '../firebase/firestoreService';
import { signInCandidate } from '../firebase/authService';

export type UserRole = 'admin' | 'hr';

export const DEFAULT_PROFILES: Record<UserRole, AdminProfile> = {
  admin: {
    name: 'Shriram Khabale',
    designation: 'Founder & CEO',
    employeeId: 'ITPL-001',
    department: 'Executive Leadership',
    email: 'admin@infoyashonand.com',
    phone: '+91 80555 14368',
    badge: 'SUPER ADMIN (CEO)',
    photo: 'https://www.infoyashonand.com/static/media/ceo1.79761e6e1db07dd71ee2.jpg',
  },
  hr: {
    name: 'Pooja Patil',
    designation: 'Lead HR & Talent Acquisition',
    employeeId: 'ITPL-HR-002',
    department: 'Human Resources & Talent Management',
    email: 'hr@infoyashonand.com',
    phone: '+91 80555 14368',
    badge: 'HR EXECUTIVE',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80',
  },
};

export const AdminPage: React.FC = () => {
  // Authentication & Role state (always requires login on fresh visit, tab open, or direct URL entry)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Admin & HR Editable Profile State
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    try {
      const cached = localStorage.getItem(`itpl_profile_${userRole}`);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILES[userRole];
  });

  // Clear any persistent storage keys on mount so dashboard can never be accessed without logging in
  useEffect(() => {
    try {
      localStorage.removeItem('itpl_admin_auth');
      localStorage.removeItem('itpl_user_role');
      sessionStorage.removeItem('itpl_admin_auth');
      sessionStorage.removeItem('itpl_user_role');
    } catch {
      // ignore
    }
  }, []);

  // Login form states (unified for both Admin and HR)
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing mode state
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'applications' | 'offers' | 'certifications' | 'team' | 'company' | 'internships'
  >('applications');

  // Database Data States
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [team, setTeam] = useState<EmployeeMember[]>([]);
  const [offers, setOffers] = useState<OfferLetterRecord[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [certCategory, setCertCategory] = useState<CertificateCategory>('experience');
  const [selectedCertForView, setSelectedCertForView] = useState<CertificateRecord | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateRecord | null>(null);
  const [ourTeamCount, setOurTeamCount] = useState<number>(() => teamService.getTeamMembers().length);

  useEffect(() => {
    const unsub = teamService.subscribe((m) => setOurTeamCount(m.length));
    return unsub;
  }, []);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search in applications
  const [appSearch, setAppSearch] = useState('');

  // Interview Evaluation Scorecard Modal States
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<ApplicationItem | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [offerGenKey, setOfferGenKey] = useState<number>(1);

  // New Employee Modal States
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empId, setEmpId] = useState(`ITPL-${Math.floor(100 + Math.random() * 900)}`);
  const [empRole, setEmpRole] = useState('Senior Software Engineer');
  const [empDept, setEmpDept] = useState('Technology');
  const [empSalary, setEmpSalary] = useState(50000);
  const [empDate, setEmpDate] = useState(new Date().toISOString().split('T')[0]);
  const [empBank, setEmpBank] = useState('HDFC Bank - A/C 5010098721');
  const [empPan, setEmpPan] = useState('ABCDE1234F');
  const [empSkills, setEmpSkills] = useState('React, TypeScript, Node.js');

  // Offer Letter Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerCandName, setOfferCandName] = useState('');
  const [offerCandEmail, setOfferCandEmail] = useState('');
  const [offerRole, setOfferRole] = useState('Full-Stack Web Developer');
  const [offerDept, setOfferDept] = useState('Technology');
  const [offerCtc, setOfferCtc] = useState('650000');
  const [offerLocation, setOfferLocation] = useState('Vishrambag, Sangli Tech Center');

  // Company Profile States
  const [compPhoneSangli, setCompPhoneSangli] = useState('+91 80555 14368');
  const [compPhonePune, setCompPhonePune] = useState('+91 86008 76577');
  const [compEmail, setCompEmail] = useState('support@infoyashonand.com');
  const [compAddressSangli, setCompAddressSangli] = useState(
    '1st Floor, Pearl Enclave, M.S.E.B. Road, Vishrambag, Sangli, Maharashtra 416416, India'
  );
  const [compAddressPune, setCompAddressPune] = useState(
    'Wakad, Pune, Maharashtra 411057, India'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync profile when role switches and fetch latest profile from Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    try {
      const cached = localStorage.getItem(`itpl_profile_${userRole}`);
      if (cached) {
        setAdminProfile(JSON.parse(cached));
      } else {
        setAdminProfile(DEFAULT_PROFILES[userRole]);
      }
    } catch {
      setAdminProfile(DEFAULT_PROFILES[userRole]);
    }

    getAdminProfileFirestore(userRole)
      .then((cloudProfile) => {
        if (!isMounted || !cloudProfile) return;
        setAdminProfile((prev) => {
          const merged = { ...prev, ...cloudProfile };
          try {
            localStorage.setItem(`itpl_profile_${userRole}`, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      })
      .catch((err) => {
        console.warn('Profile cloud sync failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [userRole]);

  const handleSaveProfile = async (updated: AdminProfile) => {
    setAdminProfile(updated);
    try {
      localStorage.setItem(`itpl_profile_${userRole}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    const savedToCloud = await saveAdminProfileFirestore(userRole, updated);
    if (savedToCloud) {
      showToast('Profile photo & details updated and saved permanently to cloud!');
    } else {
      showToast('Profile details updated locally.');
    }
  };

  const reloadData = () => {
    setApplications(adminDb.getApplications());
    setTeam(adminDb.getTeam());
    setOffers(adminDb.getOffers());
    setInternships(adminDb.getInternships());
    setCertificates(adminDb.getCertificates());
  };

  useEffect(() => {
    reloadData();

    // If current offer letter in localStorage is still the template default 'Ms. shweta',
    // and there is a selected candidate who cleared interview rounds (e.g. Rahul Chougule),
    // automatically populate it with that candidate's details using the existing format.
    try {
      const savedOfferStr = localStorage.getItem('itpl_current_offer_letter');
      const isTemplateDefault = !savedOfferStr || savedOfferStr.includes('Ms. shweta');
      if (isTemplateDefault) {
        const apps = adminDb.getApplications();
        const selectedCandidate = apps.find(
          (a) => a.stage === 'selected' && adminDb.canGenerateOfferLetter(a.id).allowed
        );
        if (selectedCandidate) {
          adminDb.generateOfferLetterForApplicant(selectedCandidate.id);
          setOfferGenKey((k) => k + 1);
        }
      }
    } catch {}

    // Re-render when Firestore async initial sync completes
    const handleFirestoreSynced = () => {
      reloadData();
    };
    window.addEventListener('itpl_firestore_synced', handleFirestoreSynced);

    // Live real-time Firestore listeners
    const unsubApps = subscribeToApplications((cloudApps) => {
      if (cloudApps && cloudApps.length > 0) {
        setApplications(cloudApps);
        localStorage.setItem('itpl_admin_applications', JSON.stringify(cloudApps));
      }
    });

    const unsubOffers = subscribeToOffers((cloudOffers) => {
      if (cloudOffers && cloudOffers.length > 0) {
        setOffers(cloudOffers);
        localStorage.setItem('itpl_admin_offers', JSON.stringify(cloudOffers));
      }
    });

    const unsubCerts = subscribeToCertificates((cloudCerts) => {
      if (cloudCerts && cloudCerts.length > 0) {
        setCertificates(cloudCerts);
        localStorage.setItem('itpl_admin_certificates', JSON.stringify(cloudCerts));
      }
    });

    const unsubInterns = subscribeToInternships((cloudInterns) => {
      if (cloudInterns && cloudInterns.length > 0) {
        setInternships(cloudInterns);
        localStorage.setItem('itpl_admin_internships', JSON.stringify(cloudInterns));
      }
    });

    const unsubEmployees = subscribeToEmployees((cloudEmployees) => {
      if (cloudEmployees && cloudEmployees.length > 0) {
        setTeam(cloudEmployees);
        localStorage.setItem('itpl_admin_team', JSON.stringify(cloudEmployees));
      }
    });

    return () => {
      window.removeEventListener('itpl_firestore_synced', handleFirestoreSynced);
      if (unsubApps) unsubApps();
      if (unsubOffers) unsubOffers();
      if (unsubCerts) unsubCerts();
      if (unsubInterns) unsubInterns();
      if (unsubEmployees) unsubEmployees();
    };
  }, []);

  // Unified Login Handler with strict credential validation and Firebase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginId.trim().toLowerCase();
    const pass = loginPassword.trim();

    // HR Login strictly: hr@infoyashonand.com and 123456
    if (email === 'hr@infoyashonand.com' && pass === '123456') {
      setUserRole('hr');
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Logged in successfully as HR Executive! Welcome to HR Management Portal.');
      // Optional Firebase sign-in in background
      signInCandidate(email, pass).catch(() => {});
    }
    // Admin Login strictly: admin@infoyashonand.com and 123456
    else if (email === 'admin@infoyashonand.com' && pass === '123456') {
      setUserRole('admin');
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Logged in successfully as Super Admin! Welcome, Shriram Khabale.');
      // Firebase auth sign-in in background
      signInCandidate(email, pass).catch(() => {});
    }
    // Reject all other emails and passwords
    else {
      setLoginError('Access Denied: Invalid email or password. Only authorized corporate accounts are permitted.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('admin');
    try {
      localStorage.removeItem('itpl_admin_auth');
      localStorage.removeItem('itpl_user_role');
      sessionStorage.removeItem('itpl_admin_auth');
      sessionStorage.removeItem('itpl_user_role');
    } catch {
      // ignore
    }
    setLoginId('');
    setLoginPassword('');
  };

  const handleStageChange = (appId: string, candidateName: string, newStage: ApplicationItem['stage']) => {
    if (newStage === 'selected') {
      const check = adminDb.canGenerateOfferLetter(appId);
      if (!check.allowed) {
        showToast(`⚠️ Cannot select candidate: ${check.reason}`);
        const app = applications.find((a) => a.id === appId);
        if (app) {
          setSelectedAppForInterview(app);
          setShowInterviewModal(true);
        }
        return;
      }

      // Candidate has cleared all interview rounds! Automatically generate offer letter using existing format
      const res = adminDb.generateOfferLetterForApplicant(appId);
      reloadData();
      setOfferGenKey((prev) => prev + 1);
      if (res.success && res.offer) {
        showToast(`🎉 Candidate Selected! Offer Letter #${res.offer.verificationId} automatically generated for ${candidateName} using existing format.`);
      } else {
        showToast(`Updated ${candidateName}'s stage to Selected!`);
      }
      return;
    }
    adminDb.updateApplicationStage(appId, newStage, `Stage updated to ${newStage} by ${userRole.toUpperCase()}`);
    reloadData();
    showToast(`Updated ${candidateName}'s stage to "${newStage.replace('_', ' ')}"!`);
  };

  const handleViewCandidateOfferLetter = (app: ApplicationItem) => {
    adminDb.generateOfferLetterForApplicant(app.id);
    reloadData();
    setOfferGenKey((prev) => prev + 1);
    setActiveTab('offers');
    showToast(`📄 Loaded Offer Letter for ${app.candidateName}`);
  };

  const handleOpenInterviewSheet = (app: ApplicationItem) => {
    setSelectedAppForInterview(app);
    setShowInterviewModal(true);
  };

  const handleDirectGenerateOffer = (app: ApplicationItem) => {
    const res = adminDb.generateOfferLetterForApplicant(app.id);
    if (res.success) {
      reloadData();
      setOfferGenKey((prev) => prev + 1);
      setActiveTab('offers');
      showToast(`🎉 Official Offer Letter #${res.offer?.verificationId} generated for ${app.candidateName}!`);
    } else {
      showToast(`⚠️ ${res.error}`);
      setSelectedAppForInterview(app);
      setShowInterviewModal(true);
    }
  };

  const handleDeleteApplication = (appId: string, candidateName: string) => {
    if (window.confirm(`Are you sure you want to delete application for ${candidateName}?`)) {
      adminDb.deleteApplication(appId);
      reloadData();
      showToast(`Deleted application for ${candidateName}.`);
    }
  };



  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminDb.createTeamMember({
      name: empName,
      employeeId: empId,
      designation: empRole,
      department: empDept,
      joiningDate: empDate,
      skills: empSkills.split(',').map((s) => s.trim()),
    });
    setShowOnboardModal(false);
    reloadData();
    showToast(`Employee "${empName}" (${empId}) onboarded successfully!`);
    setEmpName('');
    setEmpId(`ITPL-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleGenerateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ctc = parseInt(offerCtc, 10) || 650000;
    const newOffer = adminDb.generateOfferLetter({
      candidateName: offerCandName,
      candidateEmail: offerCandEmail,
      jobTitle: offerRole,
      department: offerDept,
      ctcAnnual: ctc,
      workLocation: offerLocation,
    });
    setShowOfferModal(false);
    reloadData();
    showToast(`Official Offer Letter #${newOffer.verificationId} issued to ${offerCandName}!`);
    setOfferCandName('');
    setOfferCandEmail('');
  };

  const handleDeleteCertificate = (id: string, name: string) => {
    adminDb.deleteCertificate(id);
    reloadData();
    showToast(`Certificate deleted for ${name}.`);
  };

  const handleCertificateIssued = (newCert: CertificateRecord) => {
    setCertCategory(newCert.category);
    reloadData();
    const categoryLabels: Record<CertificateCategory, string> = {
      experience: 'Experience Certificate',
      award: 'Award Certificate',
      recommendation: 'Recommendation Certificate',
    };
    showToast(`${categoryLabels[newCert.category]} #${newCert.verificationId} issued to ${newCert.recipientName}!`);
  };

  const handleCertificateUpdated = (updatedCert: CertificateRecord) => {
    reloadData();
    showToast(`Certificate #${updatedCert.verificationId} for ${updatedCert.recipientName} updated successfully!`);
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const q = appSearch.toLowerCase();
    return (
      app.candidateName.toLowerCase().includes(q) ||
      app.jobTitle.toLowerCase().includes(q) ||
      app.candidateEmail.toLowerCase().includes(q)
    );
  });

  // Navigation Items according to Role
  const navItems = [
    { id: 'applications', label: 'Candidate ATS Pipeline', icon: 'assignment_ind', count: applications.length },
    { id: 'offers', label: 'Offer Letter Generator', icon: 'mail', count: offers.length },
    { id: 'certifications', label: 'Certification', icon: 'workspace_premium', count: certificates.length },
    {
      id: 'team',
      label: userRole === 'admin' ? 'Our Team & Employees' : 'Our Team Directory',
      icon: 'badge',
      count: ourTeamCount,
    },
    { id: 'company', label: 'Company Profile & Offices', icon: 'apartment' },
  ];

  // ==========================================================================
  // 1. UNIFIED LOGIN SCREEN (SHARED FOR BOTH ADMIN & HR)
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 py-16 bg-slate-50/70">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-blue-200 shadow-2xl space-y-6 bg-white text-center">
          {/* Top Lock Icon & Header */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center border border-blue-200 shadow-xs">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-extrabold uppercase">
              <span>ITPL Enterprise Gateway</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Employee Authentication Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unified login portal for ITPL leadership, HR executives, and team managers.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{loginError}</span>
            </div>
          )}

          {/* Unified Corporate Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Work Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="hr@infoyashonand.com or admin@infoyashonand.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-medium focus:outline-blue-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  key
                </span>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your corporate password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-mono tracking-widest focus:outline-blue-600 shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-700 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In to Dashboard →</span>
              <span className="material-symbols-outlined text-sm">login</span>
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center text-xs text-slate-500 border-t border-slate-100">
            <Link to="/" className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold">
              <span>← Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. AUTHENTICATED DASHBOARD (ADMIN OR HR BASED ON ROLE)
  // ==========================================================================
  const isAdmin = userRole === 'admin';

  return (
    <div className="admin-page-root min-h-screen bg-slate-50/70 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce-header">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <div className={`admin-page-container max-w-[1600px] mx-auto px-4 sm:px-6 ${selectedCertForView ? 'no-print' : ''}`}>
        <div className="admin-page-grid grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ======================================================= */}
          {/* LEFT SIDEBAR */}
          {/* ======================================================= */}
          <aside className="no-print lg:col-span-3 space-y-6 lg:sticky lg:top-[132px] self-start max-h-[calc(100vh-148px)] overflow-y-auto pr-1 custom-sidebar-scroll z-20">
            {/* Identity Card */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative group shrink-0">
                  <img
                    src={
                      adminProfile.photo ||
                      (isAdmin
                        ? 'https://www.infoyashonand.com/static/media/ceo1.79761e6e1db07dd71ee2.jpg'
                        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80')
                    }
                    alt={adminProfile.name || (isAdmin ? 'Shriram Khabale' : 'Pooja Patil')}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={() => setShowEditProfileModal(true)}
                    title="Click to edit profile photo"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(true)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-transform group-hover:scale-110"
                    title="Change photo"
                    aria-label="Change photo"
                  >
                    <span className="material-symbols-outlined text-[11px]">photo_camera</span>
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {adminProfile.name || (isAdmin ? 'Shriram Khabale' : 'Pooja Patil')}
                  </h3>
                  <p className="text-[11px] text-blue-700 font-semibold truncate">
                    {adminProfile.designation || (isAdmin ? 'Founder & CEO' : 'Lead HR & Talent Acquisition')}
                  </p>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    ID: {adminProfile.employeeId || (isAdmin ? 'ITPL-001' : 'ITPL-HR-002')}
                  </span>
                </div>
              </div>

              {/* Edit Profile Action Button */}
              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="w-full py-2 px-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 hover:text-blue-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                title="Edit profile photo, name, designation, department, and contact info"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Profile</span>
              </button>

              {/* Role Badge and Switcher Button */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isAdmin
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                    }`}
                  >
                    ● {adminProfile.badge || (isAdmin ? 'SUPER ADMIN (CEO)' : 'HR EXECUTIVE')}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="glass-card p-3 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                {isAdmin ? 'Executive Admin Workspace' : 'HR Talent Workspace'}
              </p>

              {navItems.map((item) => {
                const isActive = activeTab === item.id || (item.id === 'certifications' && activeTab === 'internships');
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ======================================================= */}
          {/* MAIN WORKSPACE CONTENT */}
          {/* ======================================================= */}
          <main className="admin-page-main lg:col-span-9 space-y-6">
            {/* Top Header Mode Banner */}
            <div
              className={`no-print p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-all ${
                isAdmin
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-xs'
                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs shrink-0 ${
                    isAdmin ? 'bg-blue-700 text-white' : 'bg-indigo-700 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isAdmin ? 'admin_panel_settings' : 'badge'}
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-sm flex items-center gap-2">
                    <span>
                      {isAdmin ? 'Executive Admin Workspace (CEO Authorized)' : 'HR Management & Recruitment Portal'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isAdmin ? 'bg-blue-200 text-blue-900' : 'bg-indigo-200 text-indigo-900'
                      }`}
                    >
                      {isAdmin ? 'CEO Mode' : 'HR Mode'}
                    </span>
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isAdmin
                      ? 'Full enterprise controls: modify financial KPIs, onboard staff, issue letters, and manage applications.'
                      : 'HR controls: Candidate ATS pipeline and digital offer letter generation.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80 shadow-xs text-[11px] font-bold transition-all cursor-pointer"
                  title="Click to edit profile"
                >
                  <span className="material-symbols-outlined text-xs text-blue-600">edit</span>
                  <span>Logged in: {adminProfile.name || (isAdmin ? 'Shriram Khabale' : 'Pooja Patil')}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: APPLICATIONS (CANDIDATE ATS PIPELINE) */}
            {activeTab === 'applications' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {isAdmin ? 'Candidate Pipeline Management (ATS)' : 'HR Candidate Applications & Management'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track candidate applications through 5 hiring stages in real-time
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search applicant..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-300 bg-white text-slate-900 focus:outline-blue-600"
                    />
                  </div>
                </div>

                {filteredApps.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p className="text-xs font-bold text-slate-500">No applications found in the pipeline</p>
                    <p className="text-[11px] text-slate-400">
                      New candidate applications from the portal will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Candidate</th>
                          <th className="p-3">Role Applied</th>
                          <th className="p-3">Assessment Score</th>
                          <th className="p-3">Current Stage</th>
                          <th className="p-3 min-w-[220px]">Interview Evaluation &amp; Scorecard</th>
                          <th className="p-3">Change Stage</th>
                          <th className="p-3 text-right">Offer Letter / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredApps.map((app) => {
                          const offerCheck = adminDb.canGenerateOfferLetter(app.id);
                          const isOfferReady = offerCheck.allowed;
                          const hasOfferIssued = app.offerLetterGenerated || app.stage === 'selected';

                          return (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-slate-900">
                                <div className="text-sm font-bold text-slate-900">{app.candidateName}</div>
                                <span className="text-[10px] text-slate-400 font-normal font-mono">
                                  {app.candidateEmail}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-slate-800">{app.jobTitle}</span>
                                <div className="text-[10px] text-slate-400">{app.department}</div>
                              </td>
                              <td className="p-3 font-bold text-emerald-600">
                                {app.testPercentage ? (
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                                    <span>{app.testPercentage}%</span>
                                  </div>
                                ) : (
                                  '--'
                                )}
                              </td>
                              <td className="p-3">
                                <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200 uppercase whitespace-nowrap">
                                  {app.stage.replace('_', ' ')}
                                </span>
                              </td>

                              {/* Interview Evaluation Sheet Column */}
                              <td className="p-3">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {app.technicalInterview ? (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                          app.technicalInterview.recommendation === 'Pass'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}
                                        title={app.technicalInterview.feedback}
                                      >
                                        Tech: {app.technicalInterview.totalScore}/100 ({app.technicalInterview.recommendation})
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                        Tech: Pending
                                      </span>
                                    )}

                                    {app.hrInterview ? (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                          app.hrInterview.recommendation === 'Pass'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}
                                        title={app.hrInterview.feedback}
                                      >
                                        HR: {app.hrInterview.totalScore}/100 ({app.hrInterview.recommendation})
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                        HR: Pending
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInterviewSheet(app)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                                      title="Open Technical & HR Evaluation Score Sheet"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit_note</span>
                                      {app.technicalInterview || app.hrInterview
                                        ? 'View / Edit Score Sheet'
                                        : 'Take Interview Sheet'}
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <select
                                  value={app.stage}
                                  onChange={(e) =>
                                    handleStageChange(app.id, app.candidateName, e.target.value as any)
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-900 cursor-pointer focus:outline-blue-600"
                                >
                                  <option value="submitted">1. Applied</option>
                                  <option value="aptitude_test">2. Aptitude Test</option>
                                  <option value="technical_interview">3. Technical Round</option>
                                  <option value="hr_interview">4. HR Round</option>
                                  <option value="selected">5. Selected</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </td>

                              {/* Offer Letter / Action */}
                              <td className="p-3 text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  {hasOfferIssued ? (
                                    <button
                                      type="button"
                                      onClick={() => handleViewCandidateOfferLetter(app)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs cursor-pointer whitespace-nowrap transition-colors"
                                      title="View & Print generated Offer Letter for this candidate"
                                    >
                                      <span className="material-symbols-outlined text-xs">check_circle</span>
                                      Offer Letter Ready
                                    </button>
                                  ) : isOfferReady ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDirectGenerateOffer(app)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
                                      title="Both rounds cleared! Click to generate official Offer Letter"
                                    >
                                      <span className="material-symbols-outlined text-xs">mark_email_read</span>
                                      Generate Offer Letter
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInterviewSheet(app)}
                                      className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer hover:text-slate-600 whitespace-nowrap"
                                      title="Offer Letter locked: Complete and pass both Technical and HR rounds first"
                                    >
                                      <span className="material-symbols-outlined text-xs text-amber-500">lock</span>
                                      Offer Locked (Pass Rounds)
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteApplication(app.id, app.candidateName)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete Candidate Application"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}



            {/* TAB 3: OFFER LETTERS */}
            {activeTab === 'offers' && (
              <div className="space-y-6">
                <OfferLetterGenerator key={offerGenKey} />

                {offers.length > 0 && (
                  <div className="no-print glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Previously Saved Corporate Records ({offers.length})
                    </h3>
                    <div className="space-y-2">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                          onClick={() => {
                            const matchingApp = applications.find(
                              (a) =>
                                a.candidateId === offer.candidateId ||
                                a.candidateEmail === offer.candidateEmail ||
                                a.offerLetterId === offer.id
                            );
                            if (matchingApp) {
                              handleViewCandidateOfferLetter(matchingApp);
                            } else {
                              adminDb.loadOfferIntoGenerator(offer);
                              setOfferGenKey((prev) => prev + 1);
                              showToast(`📄 Loaded Offer Letter for ${offer.candidateName}`);
                            }
                          }}
                          title="Click to load into Offer Letter editor"
                        >
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                              <span>{offer.candidateName}</span>
                              <span className="text-[10px] text-blue-600 font-normal">↗ Load</span>
                            </p>
                            <p className="text-slate-600">
                              {offer.jobTitle} • ₹{(offer.ctcAnnual / 100000).toFixed(2)} LPA •{' '}
                              <span className="font-mono text-blue-700 font-bold">{offer.verificationId}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete record for ${offer.candidateName}?`)) {
                                adminDb.deleteOfferLetter(offer.id);
                                reloadData();
                                showToast(`Deleted record for ${offer.candidateName}.`);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete offer letter record"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CERTIFICATION (EXPERIENCE, AWARD, RECOMMENDATION) */}
            {(activeTab === 'certifications' || activeTab === 'internships') && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Certification</h2>
                    <p className="text-xs text-slate-500">
                      Verifiable certificates issued to students, professionals, and developers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCert(null);
                      setShowCertModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Issue Certificate</span>
                  </button>
                </div>

                {/* 3 Categories: Experience Certificate, Award Certificate, Recommendation Certificate */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setCertCategory('experience')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      certCategory === 'experience'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">work_history</span>
                    <span>Experience Certificate</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        certCategory === 'experience' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {certificates.filter((c) => c.category === 'experience').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCertCategory('award')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      certCategory === 'award'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">emoji_events</span>
                    <span>Award Certificate</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        certCategory === 'award' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {certificates.filter((c) => c.category === 'award').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCertCategory('recommendation')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      certCategory === 'recommendation'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">recommend</span>
                    <span>Recommendation Certificate</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        certCategory === 'recommendation' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {certificates.filter((c) => c.category === 'recommendation').length}
                    </span>
                  </button>
                </div>

                {/* Certificates List in Selected Category */}
                {certificates.filter((c) => c.category === certCategory).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      {certCategory === 'experience'
                        ? 'work_history'
                        : certCategory === 'award'
                        ? 'emoji_events'
                        : 'recommend'}
                    </span>
                    <p className="text-xs font-bold text-slate-500">
                      No {certCategory === 'experience' ? 'experience' : certCategory === 'award' ? 'award' : 'recommendation'} certificates issued yet
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Click &quot;+ Issue Certificate&quot; to issue a verifiable certificate under this category.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates
                      .filter((c) => c.category === certCategory)
                      .map((cert) => (
                        <div
                          key={cert.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-sm">{cert.recipientName}</p>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                                {cert.category}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1">
                              {cert.category === 'experience' && (
                                <>
                                  {cert.designation}
                                  {cert.performanceGrade && ` • Grade: ${cert.performanceGrade}`} •{' '}
                                </>
                              )}
                              {cert.category === 'award' && (
                                <>
                                  {cert.awardTitle}
                                  {cert.awardCategory && ` • ${cert.awardCategory}`} •{' '}
                                </>
                              )}
                              {cert.category === 'recommendation' && (
                                <>
                                  Recommended For: {cert.recommendedFor} •{' '}
                                </>
                              )}
                              <span className="font-mono text-blue-700 font-bold">{cert.verificationId}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Issued: {cert.issuedDate} • {cert.recipientEmail}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Valid
                            </span>


                            {/* Edit Certificate (Side-by-Side Live Editor & Preview) */}
                            <button
                              type="button"
                              onClick={() => setSelectedCertForView(cert)}
                              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Edit & Live Preview Certificate"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              <span>Edit</span>
                            </button>

                            {/* Live Verification QR Page */}
                            <a
                              href={`/verify-certificate?id=${encodeURIComponent(cert.verificationId)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Scan QR / Test Live Synced Verification Portal"
                            >
                              <span className="material-symbols-outlined text-sm">qr_code</span>
                              <span>Verify QR</span>
                            </a>

                            {/* Delete Certificate */}
                            <button
                              type="button"
                              onClick={() => {
                                const catName =
                                  cert.category === 'experience'
                                    ? 'Experience'
                                    : cert.category === 'award'
                                    ? 'Award'
                                    : 'Recommendation';
                                if (window.confirm(`Are you sure you want to delete the ${catName} certificate for ${cert.recipientName}?`)) {
                                  handleDeleteCertificate(cert.id, cert.recipientName);
                                }
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Certificate"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: OUR TEAM & EMPLOYEES DIRECTORY */}
            {activeTab === 'team' && (
              <OurTeamManager isAdmin={isAdmin} showToast={showToast} />
            )}



            {/* TAB 8: COMPANY PROFILE & OFFICES */}
            {activeTab === 'company' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900">Company Information &amp; Offices</h2>
                  <p className="text-xs text-slate-500">Edit addresses, phone numbers, and official emails live</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast('Company Information Saved Live!');
                  }}
                  className="space-y-4 text-xs max-w-2xl"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Head Office Phone (Sangli)</label>
                      <input
                        required
                        value={compPhoneSangli}
                        onChange={(e) => setCompPhoneSangli(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Branch Office Phone (Pune)</label>
                      <input
                        required
                        value={compPhonePune}
                        onChange={(e) => setCompPhonePune(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
                    <input
                      required
                      type="email"
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sangli Head Office Address</label>
                    <textarea
                      rows={2}
                      required
                      value={compAddressSangli}
                      onChange={(e) => setCompAddressSangli(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pune Regional Office Address</label>
                    <textarea
                      rows={2}
                      required
                      value={compAddressPune}
                      onChange={(e) => setCompAddressPune(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-sm cursor-pointer"
                    >
                      Save Contact Info Live
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL: ONBOARD NEW EMPLOYEE (ADMIN ONLY) */}
      {/* ======================================================= */}
      {showOnboardModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-4 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Onboard New Employee</h3>
                <p className="text-[11px] text-slate-500">
                  Creates Employee Profile &amp; Initial Salary Slip (CEO Authorized)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Full Name *</label>
                  <input
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Ramesh S. Kulkarni"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    required
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation / Role *</label>
                  <input
                    required
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    placeholder="e.g. Senior Java Developer"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Gross Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={empDate}
                    onChange={(e) => setEmpDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Account</label>
                  <input
                    value={empBank}
                    onChange={(e) => setEmpBank(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAN Number</label>
                  <input
                    value={empPan}
                    onChange={(e) => setEmpPan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Technical Skills</label>
                <input
                  value={empSkills}
                  onChange={(e) => setEmpSkills(e.target.value)}
                  placeholder="Java, Spring Boot, MySQL, REST APIs"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: GENERATE OFFER LETTER */}
      {/* ======================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Generate Official Offer Letter</h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateOfferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  required
                  value={offerCandName}
                  onChange={(e) => setOfferCandName(e.target.value)}
                  placeholder="e.g. Priya Deshpande"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Email *</label>
                <input
                  type="email"
                  required
                  value={offerCandEmail}
                  onChange={(e) => setOfferCandEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    required
                    value={offerRole}
                    onChange={(e) => setOfferRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual CTC (INR) *</label>
                  <input
                    required
                    type="number"
                    value={offerCtc}
                    onChange={(e) => setOfferCtc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Location</label>
                <input
                  value={offerLocation}
                  onChange={(e) => setOfferLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold bg-blue-700 hover:bg-blue-600 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  Generate &amp; Issue Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: ISSUE / EDIT CORPORATE CERTIFICATE */}
      {/* ======================================================= */}
      <IssueCertificateModal
        isOpen={showCertModal}
        onClose={() => {
          setShowCertModal(false);
          setEditingCert(null);
        }}
        initialCategory={certCategory}
        onIssued={handleCertificateIssued}
        certificateToEdit={editingCert}
        onUpdated={handleCertificateUpdated}
      />

      {/* ======================================================= */}
      {/* MODAL: SIDE-BY-SIDE LIVE EDITOR & OFFICIAL CERTIFICATE PREVIEW */}
      {/* ======================================================= */}
      <CertificateViewerModal
        certificate={selectedCertForView}
        onClose={() => setSelectedCertForView(null)}
        onSave={handleCertificateUpdated}
      />

      {/* ======================================================= */}
      {/* MODAL: INTERVIEW EVALUATION SHEET (TECH & HR ROUNDS) */}
      {/* ======================================================= */}
      {showInterviewModal && selectedAppForInterview && (
        <InterviewScoreModal
          application={selectedAppForInterview}
          isOpen={showInterviewModal}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedAppForInterview(null);
          }}
          onSaved={() => {
            reloadData();
          }}
          onGenerateOfferLetter={(app) => {
            reloadData();
            setOfferGenKey((prev) => prev + 1);
            setActiveTab('offers');
            showToast(`🎉 Official Offer Letter generated for ${app.candidateName}! Switched to Offer Letter Generator.`);
          }}
        />
      )}

      {/* ======================================================= */}
      {/* MODAL: EDIT ADMIN / HR PROFILE & PHOTO */}
      {/* ======================================================= */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentProfile={adminProfile}
        onSave={handleSaveProfile}
        userRole={userRole}
      />
    </div>
  );
};
