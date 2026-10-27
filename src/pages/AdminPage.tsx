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
  subscribeToInquiries,
  ContactInquiryFirestore,
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
    'inquiries' | 'applications' | 'offers' | 'certifications' | 'team' | 'company' | 'internships'
  >('inquiries');

  // Database Data States
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiryFirestore[]>([]);
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [selectedInquiryForDetails, setSelectedInquiryForDetails] = useState<ContactInquiryFirestore | null>(null);
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
    setInquiries(adminDb.getInquiries());
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
        const cleanCloud = cloudApps.filter(
          (a) =>
            !a.jobTitle?.toLowerCase().includes('quote') &&
            !a.candidateEmail?.endsWith('@quote.itpl') &&
            !a.candidateEmail?.includes('lead-') &&
            !(a.candidateName === 'Shweta Patil' && a.department === 'IT Consulting & Solutions') &&
            !(a.candidateName === 'Akshad Shinde' || a.candidateEmail === 'shindeakshad55@gmail.com')
        );
        setApplications(cleanCloud);
        localStorage.setItem('itpl_admin_applications', JSON.stringify(cleanCloud));
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

    // Real-time Firestore & Local storage listeners for Candidate & Client Inquiries
    const unsubInquiries = subscribeToInquiries((cloudInquiries) => {
      if (cloudInquiries && cloudInquiries.length > 0) {
        const cleanInquiries = cloudInquiries.filter(
          (i) =>
            i.id !== 'inq-1792991313175-475' &&
            i.id !== 'inq-1793011259287-967' &&
            i.email !== 'shindeakshad55@gmail.com' &&
            i.name !== 'Akshad Shinde' &&
            i.phone !== '8010861316'
        );
        setInquiries(cleanInquiries);
        localStorage.setItem('itpl_inquiries', JSON.stringify(cleanInquiries));
      }
    });

    const unsubLocalInquiries = adminDb.subscribeToInquiries(() => {
      setInquiries(adminDb.getInquiries());
    });

    return () => {
      window.removeEventListener('itpl_firestore_synced', handleFirestoreSynced);
      if (unsubApps) unsubApps();
      if (unsubInquiries) unsubInquiries();
      if (unsubLocalInquiries) unsubLocalInquiries();
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
    if (
      app.jobTitle?.toLowerCase().includes('quote') ||
      app.candidateEmail?.endsWith('@quote.itpl') ||
      app.candidateEmail?.includes('lead-') ||
      (app.candidateName === 'Shweta Patil' && app.department === 'IT Consulting & Solutions') ||
      app.candidateName === 'Akshad Shinde' ||
      app.candidateEmail === 'shindeakshad55@gmail.com'
    ) {
      return false;
    }
    const q = appSearch.toLowerCase();
    return (
      app.candidateName.toLowerCase().includes(q) ||
      app.jobTitle.toLowerCase().includes(q) ||
      app.candidateEmail.toLowerCase().includes(q)
    );
  });

  // Filtered Candidate & Client Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    if (
      inq.id === 'inq-1792991313175-475' ||
      inq.id === 'inq-1793011259287-967' ||
      inq.email === 'shindeakshad55@gmail.com' ||
      inq.name === 'Akshad Shinde' ||
      inq.phone === '8010861316'
    ) {
      return false;
    }
    const q = inquirySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inq.name.toLowerCase().includes(q) ||
      (inq.email && inq.email.toLowerCase().includes(q)) ||
      (inq.phone && inq.phone.includes(q)) ||
      (inq.service && inq.service.toLowerCase().includes(q)) ||
      (inq.message && inq.message.toLowerCase().includes(q)) ||
      (inq.company && inq.company.toLowerCase().includes(q));

    const matchesStatus =
      inquiryStatusFilter === 'all' ||
      (inquiryStatusFilter === 'New' && (inq.status === 'New' || !inq.status)) ||
      inq.status === inquiryStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const newInquiriesCount = inquiries.filter((i) => i.status === 'New' || !i.status).length;

  const handleUpdateInquiryStatus = (id: string, status: ContactInquiryFirestore['status']) => {
    adminDb.updateInquiryStatus(id, status);
    setInquiries(adminDb.getInquiries());
    showToast(`Inquiry status updated to "${status}"`);
  };

  const handleDeleteInquiry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate inquiry?')) {
      adminDb.deleteInquiry(id);
      setInquiries(adminDb.getInquiries());
      if (selectedInquiryForDetails?.id === id) {
        setSelectedInquiryForDetails(null);
      }
      showToast('Candidate inquiry removed successfully.');
    }
  };

  const handleConvertInquiryToCandidate = (inquiry: ContactInquiryFirestore) => {
    const cleanEmail = (inquiry.email || '').trim().toLowerCase();
    const existing = cleanEmail
      ? applications.find((a) => a.candidateEmail.toLowerCase() === cleanEmail)
      : null;

    if (existing) {
      showToast(`${inquiry.name} already exists in Candidate ATS Pipeline!`);
      setActiveTab('applications');
      return;
    }

    adminDb.createApplication({
      jobTitle: inquiry.service || 'Candidate Intern / Trainee',
      candidateName: inquiry.name,
      candidateEmail: inquiry.email || `candidate-${Date.now()}@itpl.com`,
      candidatePhone: inquiry.phone,
      department: 'Technology',
      stage: 'submitted',
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: [
        `Converted from Inquiry Desk (${inquiry.source || 'Website Inquiry'})`,
        inquiry.company ? `College/Org: ${inquiry.company}` : '',
        inquiry.message ? `Requirement: ${inquiry.message}` : '',
      ].filter(Boolean),
    });

    if (inquiry.id) {
      adminDb.updateInquiryStatus(inquiry.id, 'Converted');
    }

    setApplications(adminDb.getApplications());
    setInquiries(adminDb.getInquiries());
    showToast(`Converted ${inquiry.name} to Candidate ATS Pipeline! Opening pipeline...`);
    setActiveTab('applications');
  };

  const exportInquiriesToCSV = () => {
    if (inquiries.length === 0) {
      showToast('No inquiries available to export.');
      return;
    }
    const headers = ['ID', 'Candidate Name', 'Email', 'Phone', 'Interested Domain/Service', 'College/Company', 'Status', 'Source', 'Date', 'Message'];
    const rows = inquiries.map((i) => [
      `"${i.id || ''}"`,
      `"${i.name || ''}"`,
      `"${i.email || ''}"`,
      `"${i.phone || ''}"`,
      `"${i.service || ''}"`,
      `"${i.company || ''}"`,
      `"${i.status || 'New'}"`,
      `"${i.source || ''}"`,
      `"${i.createdAt || ''}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ITPL_Candidate_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inquiries spreadsheet exported successfully!');
  };

  const formatInquiryDate = (rawDate: any): string => {
    if (!rawDate) return '--';
    try {
      if (rawDate?.seconds) {
        return new Date(rawDate.seconds * 1000).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {}
    return String(rawDate);
  };

  const getWhatsAppUrl = (phone: string, candidateName: string, service?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone.replace(/^0+/, '')}`;
    const text = encodeURIComponent(
      `Hello ${candidateName}, greetings from Infoyashonand Technologies! We received your inquiry regarding "${service || 'our training programs'}". How can our HR team assist you today?`
    );
    return `https://wa.me/${finalPhone}?text=${text}`;
  };

  // Navigation Items according to Role
  const navItems = [
    {
      id: 'inquiries',
      label: userRole === 'admin' ? 'Candidate & Client Inquiries' : 'Candidate Inquiries',
      icon: 'contact_support',
      count: inquiries.length,
      badgeText: newInquiriesCount > 0 ? `${newInquiriesCount} NEW` : undefined,
    },
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(item as any).badgeText && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold bg-rose-500 text-white animate-pulse">
                          {(item as any).badgeText}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
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

            {/* ======================================================= */}
            {/* TAB: CANDIDATE & CLIENT INQUIRIES (HR & ADMIN DESK) */}
            {/* ======================================================= */}
            {activeTab === 'inquiries' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 animate-in fade-in duration-200">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Real-Time Inquiries Sync</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {isAdmin ? 'Candidate & Client Inquiries Management' : 'Candidate Inquiries & Admission Leads'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time candidate inquiry submissions from website popup, contact page, and course counseling forms
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={exportInquiriesToCSV}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Export inquiries to CSV"
                    >
                      <span className="material-symbols-outlined text-sm text-slate-500">download</span>
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={reloadData}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Refresh inquiries"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{inquiries.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">All received submissions</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">New / Unread</div>
                      {newInquiriesCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <div className="text-2xl font-black text-amber-900 mt-1">{newInquiriesCount}</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Awaiting initial HR contact</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                    <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">In Discussion</div>
                    <div className="text-2xl font-black text-indigo-900 mt-1">
                      {inquiries.filter((i) => i.status === 'Contacted' || i.status === 'In Discussion').length}
                    </div>
                    <div className="text-[10px] text-indigo-700 mt-0.5">Active counselor follow-up</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Converted Leads</div>
                    <div className="text-2xl font-black text-emerald-900 mt-1">
                      {inquiries.filter((i) => i.status === 'Converted').length}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Admitted &amp; enrolled</div>
                  </div>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    {(['all', 'New', 'Contacted', 'In Discussion', 'Converted', 'Closed'] as const).map((st) => {
                      const isSel = inquiryStatusFilter === st;
                      const count =
                        st === 'all'
                          ? inquiries.length
                          : st === 'New'
                          ? inquiries.filter((i) => i.status === 'New' || !i.status).length
                          : inquiries.filter((i) => i.status === st).length;

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setInquiryStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#232884] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{st === 'all' ? 'All Inquiries' : st}</span>
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSel ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72 shrink-0">
                    <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name, phone, course..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Inquiries Table or Empty State */}
                {filteredInquiries.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">No candidate inquiries found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Whenever any candidate submits the Quick Enquiry form, Contact form, or internship inquiry on the website, their details appear here instantly.
                      </p>
                    </div>
                    {inquirySearch && (
                      <button
                        type="button"
                        onClick={() => setInquirySearch('')}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Clear search query
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Candidate Info</th>
                          <th className="p-3.5">Interested Domain / Track</th>
                          <th className="p-3.5 min-w-[200px]">Candidate Inquiry Message</th>
                          <th className="p-3.5">Date &amp; Source</th>
                          <th className="p-3.5">HR Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                        {filteredInquiries.map((inq) => {
                          const isNew = inq.status === 'New' || !inq.status;
                          const waUrl = getWhatsAppUrl(inq.phone, inq.name, inq.service);
                          const initials = inq.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || 'C';

                          return (
                            <tr key={inq.id || inq.phone} className="hover:bg-slate-50/80 transition-colors">
                              {/* Candidate Info */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#232884] to-[#3D48C8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                        {inq.name}
                                      </span>
                                      {isNew && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                                          NEW
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                      <a
                                        href={`tel:${inq.phone}`}
                                        className="font-mono font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                        title="Click to call candidate"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">call</span>
                                        <span>{inq.phone}</span>
                                      </a>
                                    </div>
                                    {inq.email && (
                                      <a
                                        href={`mailto:${inq.email}`}
                                        className="text-[11px] font-mono text-slate-400 hover:text-slate-700 truncate block mt-0.5"
                                        title="Click to email candidate"
                                      >
                                        {inq.email}
                                      </a>
                                    )}
                                    {inq.company && (
                                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                        🎓 {inq.company}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Interested Domain */}
                              <td className="p-3.5">
                                <span className="inline-block px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px] leading-tight">
                                  {inq.service || 'IT Solutions & Consulting'}
                                </span>
                                {inq.budget && (
                                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                                    Budget: {inq.budget}
                                  </div>
                                )}
                              </td>

                              {/* Candidate Inquiry Message */}
                              <td className="p-3.5">
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                  {inq.message || 'Candidate requested detailed information and career counseling.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setSelectedInquiryForDetails(inq)}
                                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>View full details</span>
                                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </button>
                              </td>

                              {/* Date & Source */}
                              <td className="p-3.5">
                                <div className="text-xs font-semibold text-slate-800">
                                  {formatInquiryDate(inq.createdAt)}
                                </div>
                                <span className="inline-block text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 font-medium">
                                  {inq.source || 'Website Form'}
                                </span>
                              </td>

                              {/* HR Status Selector */}
                              <td className="p-3.5">
                                <select
                                  value={inq.status || 'New'}
                                  onChange={(e) =>
                                    inq.id &&
                                    handleUpdateInquiryStatus(
                                      inq.id,
                                      e.target.value as ContactInquiryFirestore['status']
                                    )
                                  }
                                  className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all shadow-2xs ${
                                    isNew
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : inq.status === 'Contacted'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : inq.status === 'In Discussion'
                                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                      : inq.status === 'Converted'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  <option value="New">● New</option>
                                  <option value="Contacted">● Contacted</option>
                                  <option value="In Discussion">● In Discussion</option>
                                  <option value="Converted">● Converted</option>
                                  <option value="Closed">● Closed</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* WhatsApp */}
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer border border-emerald-200 shadow-2xs"
                                    title="Open WhatsApp chat with candidate"
                                  >
                                    <span className="material-symbols-outlined text-base">chat</span>
                                  </a>

                                  {/* Call */}
                                  <a
                                    href={`tel:${inq.phone}`}
                                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-all cursor-pointer border border-blue-200 shadow-2xs"
                                    title="Call candidate"
                                  >
                                    <span className="material-symbols-outlined text-base">call</span>
                                  </a>

                                  {/* View Details */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedInquiryForDetails(inq)}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="View full candidate inquiry details"
                                  >
                                    <span className="material-symbols-outlined text-base">visibility</span>
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => inq.id && handleDeleteInquiry(inq.id)}
                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="Delete inquiry"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
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
      {/* MODAL: CANDIDATE INQUIRY FULL DETAILS & HR DESK */}
      {/* ======================================================= */}
      {selectedInquiryForDetails && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedInquiryForDetails(null)}
        >
          <div
            className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#232884] text-white flex items-center justify-center font-bold text-base shadow-md">
                  {selectedInquiryForDetails.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase mb-1">
                    <span>Candidate Inquiry Lead</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedInquiryForDetails.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ID: {selectedInquiryForDetails.id || '--'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiryForDetails(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              {/* Quick Contact & Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <a
                  href={getWhatsAppUrl(
                    selectedInquiryForDetails.phone,
                    selectedInquiryForDetails.name,
                    selectedInquiryForDetails.service
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                  <span>WhatsApp Chat</span>
                </a>

                <a
                  href={`tel:${selectedInquiryForDetails.phone}`}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base text-blue-600">call</span>
                  <span>Call {selectedInquiryForDetails.phone}</span>
                </a>

                {selectedInquiryForDetails.email && (
                  <a
                    href={`mailto:${selectedInquiryForDetails.email}`}
                    className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base text-slate-600">mail</span>
                    <span>Send Email</span>
                  </a>
                )}
              </div>

              {/* Inquiry Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Interested Domain / Program
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedInquiryForDetails.service || 'IT Solutions & Consulting'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Inquiry Source Form
                  </span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                    {selectedInquiryForDetails.source || 'Website Form'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date &amp; Time Received
                  </span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                    {formatInquiryDate(selectedInquiryForDetails.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    College / Organization
                  </span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                    {selectedInquiryForDetails.company || 'Not Specified'}
                  </span>
                </div>

                {selectedInquiryForDetails.budget && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Estimated Budget
                    </span>
                    <span className="text-xs font-semibold text-slate-700 mt-0.5 block font-mono">
                      {selectedInquiryForDetails.budget}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current HR Status
                  </span>
                  <select
                    value={selectedInquiryForDetails.status || 'New'}
                    onChange={(e) => {
                      const newSt = e.target.value as ContactInquiryFirestore['status'];
                      if (selectedInquiryForDetails.id) {
                        handleUpdateInquiryStatus(selectedInquiryForDetails.id, newSt);
                        setSelectedInquiryForDetails({
                          ...selectedInquiryForDetails,
                          status: newSt,
                        });
                      }
                    }}
                    className="mt-1 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="New">● New</option>
                    <option value="Contacted">● Contacted</option>
                    <option value="In Discussion">● In Discussion</option>
                    <option value="Converted">● Converted</option>
                    <option value="Closed">● Closed</option>
                  </select>
                </div>
              </div>

              {/* Message Statement */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Candidate Message / Statement of Purpose:
                </label>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed text-xs">
                  {selectedInquiryForDetails.message || 'No additional message entered by candidate.'}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (selectedInquiryForDetails.id) {
                    handleDeleteInquiry(selectedInquiryForDetails.id);
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Delete Inquiry</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiryForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
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
