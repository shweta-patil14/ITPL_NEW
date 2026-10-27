// Database service mirroring iptl-2.vercel.app models with dual Firestore + localStorage persistence

import {
  createApplicationFirestore,
  getApplicationsFirestore,
  updateApplicationStageFirestore,
  updateApplicationFirestore,
  saveInterviewScoresFirestore,
  deleteApplicationFirestore,
  createOfferLetterFirestore,
  getOfferLettersFirestore,
  deleteOfferLetterFirestore,
  createInternshipFirestore,
  getInternshipsFirestore,
  deleteInternshipFirestore,
  createEmployeeFirestore,
  updateEmployeeFirestore,
  getEmployeesFirestore,
  deleteEmployeeFirestore,
  createCertificateFirestore,
  updateCertificateFirestore,
  getCertificatesFirestore,
  deleteCertificateFirestore,
  loadAllFromFirestore,
  saveTestResultFirestore,
  ContactInquiryFirestore,
  createInquiryFirestore,
  updateInquiryStatusFirestore,
  deleteInquiryFirestore,
} from '../firebase/firestoreService';
import { isFirebaseConfigured } from '../firebase/config';
import { teamService } from './teamService';

export interface TechnicalInterviewScore {
  interviewerName: string;
  interviewDate: string;
  codingScore: number; // 0-25
  problemSolvingScore: number; // 0-25
  techStackScore: number; // 0-25
  communicationScore: number; // 0-25
  totalScore: number; // 0-100
  feedback: string;
  recommendation: 'Pass' | 'Hold' | 'Fail';
  completedAt?: string;
}

export interface HrInterviewScore {
  interviewerName: string;
  interviewDate: string;
  communicationScore: number; // 0-25
  culturalFitScore: number; // 0-25
  attitudeScore: number; // 0-25
  commitmentScore: number; // 0-25
  totalScore: number; // 0-100
  feedback: string;
  expectedJoiningDate?: string;
  offeredStipendOrSalary?: string;
  recommendation: 'Pass' | 'Hold' | 'Fail';
  completedAt?: string;
}

export interface ApplicationItem {
  id: string;
  jobId?: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  department: string;
  stage: 'submitted' | 'screening' | 'aptitude_test' | 'technical_interview' | 'hr_interview' | 'selected' | 'rejected';
  testPercentage?: number;
  testStatus?: 'Passed' | 'Failed' | 'Pending';
  isTestLocked?: boolean;
  testLockReason?: string;
  nextEligibleTestDate?: string;
  lastTestAttemptDate?: string;
  appliedDate?: string;
  notes?: string[];
  // Interview scoring & offer letter eligibility
  technicalInterview?: TechnicalInterviewScore;
  hrInterview?: HrInterviewScore;
  interviewOverallScore?: number;
  interviewPassed?: boolean;
  offerLetterGenerated?: boolean;
  offerLetterId?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: string;
  type: string;
  openings: number;
  description: string;
}

export interface EmployeeMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  joiningDate: string;
  employeeId: string;
  avatar: string;
  achievements?: string[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  stage: string;
  status: string;
  interviewerName: string;
  interviewerRole: string;
  scheduledDate: string;
  scheduledTime: string;
  meetingLocation: string;
  meetingLink: string;
}

export interface OfferLetterRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAddress: string;
  jobTitle: string;
  department: string;
  reportingTo: string;
  joiningDate: string;
  workLocation: string;
  employmentType: string;
  ctcAnnual: number;
  ctcBreakup: {
    basic: number;
    hra: number;
    specialAllowance: number;
    performanceBonus: number;
    providentFund: number;
    insurance: number;
    totalAnnual: number;
  };
  probationPeriodMonths: number;
  workingHours?: string;
  terms: string[];
  signatoryName: string;
  signatoryTitle: string;
  issuedDate: string;
  acceptanceDeadline?: string;
  status: string;
  verificationId: string;
}

export type CertificateCategory = 'experience' | 'award' | 'recommendation';

export interface CertificateRecord {
  id: string;
  category: CertificateCategory;
  recipientName: string;
  recipientEmail: string;
  verificationId: string;
  issuedDate: string;
  status: string; // 'Valid'

  // Category 1: Experience Certificate
  designation?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  performanceGrade?: string;
  responsibilities?: string;

  // Category 2: Award Certificate
  awardTitle?: string;
  awardCategory?: string;
  citation?: string;

  // Category 3: Recommendation Certificate
  associationRole?: string;
  recommendedFor?: string;
  keyStrengths?: string;
  recommendationNote?: string;

  // Signatory & Org
  signatoryName: string;
  signatoryTitle: string;
  companyName: string;
}

export interface InternshipRecord {
  id: string;
  internName: string;
  internEmail: string;
  collegeOrInstitute?: string;
  collegeName?: string;
  degree?: string;
  domain: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  performanceGrade: string;
  projectTitle: string;
  projectDescription: string;
  mentorName: string;
  mentorDesignation: string;
  signatoryName: string;
  signatoryTitle: string;
  issuedDate: string;
  status: string;
  verificationId: string;
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  date: string;
  punchIn: string;
  punchOut: string;
  status: string;
}

export interface FinancialMetric {
  key: string;
  label: string;
  value: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    jobTitle: 'Full-Stack Web Developer Trainee',
    candidateId: 'ITPL-CAND-2026-081',
    candidateName: 'Aarav Sharma',
    candidateEmail: 'aarav.sharma@gmail.com',
    candidatePhone: '+91 98220 54321',
    department: 'Technology',
    stage: 'technical_interview',
    testPercentage: 82,
    testStatus: 'Passed',
    appliedDate: '10 Oct, 2026',
    notes: ['Applied via portal', 'Aptitude cleared with 82%'],
    technicalInterview: {
      interviewerName: 'Tushar Pawar',
      interviewDate: '2026-10-12',
      codingScore: 22,
      problemSolvingScore: 21,
      techStackScore: 20,
      communicationScore: 21,
      totalScore: 84,
      feedback: 'Strong grasp of React hooks, asynchronous JavaScript, and REST APIs.',
      recommendation: 'Pass',
      completedAt: '2026-10-12T11:00:00.000Z'
    },
    interviewOverallScore: 84,
    interviewPassed: true,
  },
  {
    id: 'app-2',
    jobTitle: 'Android Mobile Application Developer',
    candidateId: 'ITPL-CAND-2026-104',
    candidateName: 'Siddhi Chavan',
    candidateEmail: 'siddhi.chavan@gmail.com',
    candidatePhone: '+91 91468 35824',
    department: 'Technology',
    stage: 'submitted',
    testPercentage: 78,
    testStatus: 'Passed',
    appliedDate: '14 Oct, 2026',
    notes: ['Applied for Android Native track', 'Aptitude test completed'],
  },
  {
    id: 'app-3',
    jobTitle: 'Cloud DevOps & Infrastructure Associate',
    candidateId: 'ITPL-CAND-2026-119',
    candidateName: 'Rahul Chougule',
    candidateEmail: 'rahul.chougule@gmail.com',
    candidatePhone: '+91 80555 14368',
    department: 'Technology',
    stage: 'hr_interview',
    testPercentage: 88,
    testStatus: 'Passed',
    appliedDate: '11 Oct, 2026',
    notes: ['Technical round cleared with 90% score'],
  }
];

const INITIAL_TEAM: EmployeeMember[] = [
  {
    id: 'emp-shriram-khabale',
    name: 'Shriram Khabale',
    designation: 'Founder & Chief Executive Officer',
    department: 'Leadership',
    bio: 'Visionary entrepreneur driving IT modernization and software solutions since 2016. Passionate about empowering regional businesses with enterprise-grade digital systems.',
    skills: ['Enterprise Architecture', 'Business Operations', 'IT Leadership'],
    experienceYears: 10,
    joiningDate: '2016-01-01',
    employeeId: 'ITPL-001',
    avatar: '/live_assets/ceo1.79761e6e1db07dd71ee2.jpg?v=20261009',
  },
  {
    id: 'emp-netra-khabale',
    name: 'Netra Khabale',
    designation: 'Director',
    department: 'Leadership',
    bio: 'Oversees organizational growth, financial governance, client relationships, and community outreach programs across Western Maharashtra.',
    skills: ['Governance', 'Operations', 'Client Relations'],
    experienceYears: 8,
    joiningDate: '2016-01-01',
    employeeId: 'ITPL-002',
    avatar: '/live_assets/ceo-madam.d2b843ad800a281a1aa4.jpg?v=20261009',
  },
  {
    id: 'emp-suraj-jadhav',
    name: 'Suraj Jadhav',
    designation: 'Business Development Manager',
    department: 'Business Development',
    bio: 'Drives client acquisition, enterprise consulting partnerships, and digital transformation roadmaps for corporate and SME clients.',
    skills: ['Business Development', 'Client Acquisition', 'Consulting'],
    experienceYears: 6,
    joiningDate: '2018-03-01',
    employeeId: 'ITPL-003',
    avatar: '/live_assets/suraj1.4fcf1e7efd516742e4cc.jpg?v=20261009',
  },
  {
    id: 'emp-kshitija-patil',
    name: 'Kshitija Patil',
    designation: 'HR',
    department: 'Human Resources',
    bio: 'Oversees human resources operations, talent acquisition, employee relations, and team culture.',
    skills: ['HR Operations', 'Talent Acquisition', 'Team Culture'],
    experienceYears: 4,
    joiningDate: '2021-02-01',
    employeeId: 'ITPL-004',
    avatar: '/live_assets/kshitija-patil.jpg?v=20261010',
  },
  {
    id: 'emp-rehan-samalewale',
    name: 'Rehan Samalewale',
    designation: 'Web Developer',
    department: 'Technology',
    bio: 'Full-stack web engineer specializing in scalable frontends, modern component architectures, and APIs.',
    skills: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS'],
    experienceYears: 3,
    joiningDate: '2022-01-10',
    employeeId: 'ITPL-005',
    avatar: '/live_assets/rehan-samalewale.jpg?v=20261010-2',
  },
  {
    id: 'emp-tushar-pawar',
    name: 'Tushar Pawar',
    designation: 'Web Developer',
    department: 'Technology',
    bio: 'Frontend web developer skilled in modern JavaScript frameworks, responsive interfaces, and performant web apps.',
    skills: ['JavaScript', 'React', 'Frontend Engineering'],
    experienceYears: 3,
    joiningDate: '2022-04-15',
    employeeId: 'ITPL-006',
    avatar: '/live_assets/tushar-pawar.jpg?v=20261009',
  },
  {
    id: 'emp-amit-patil',
    name: 'Amit Patil',
    designation: 'Android Developer',
    department: 'Mobile Engineering',
    bio: 'Experienced Android developer building intuitive, scalable, and high-performance native mobile applications.',
    skills: ['Android Kotlin', 'Jetpack Compose', 'Mobile Architecture'],
    experienceYears: 4,
    joiningDate: '2021-08-01',
    employeeId: 'ITPL-007',
    avatar: '/live_assets/amit-patil.jpg?v=20261009',
  },
  {
    id: 'emp-milind-kumbhar',
    name: 'Milind Kumbhar',
    designation: 'Android Developer',
    department: 'Mobile Engineering',
    bio: 'Mobile application developer specializing in Android architecture, clean code, and interactive mobile UI.',
    skills: ['Android SDK', 'Kotlin', 'Room DB'],
    experienceYears: 3,
    joiningDate: '2022-06-01',
    employeeId: 'ITPL-008',
    avatar: '/live_assets/milind-kumbhar.jpg?v=20261009',
  },
  {
    id: 'emp-siban-hipparage',
    name: 'Siban Hipparage',
    designation: 'Web Developer',
    department: 'Technology',
    bio: 'Full-stack web developer specializing in responsive user interfaces, robust web applications, and modern framework integration.',
    skills: ['React', 'Full-Stack Development', 'API Design'],
    experienceYears: 3,
    joiningDate: '2022-09-01',
    employeeId: 'ITPL-009',
    avatar: '/live_assets/siban-hipparage.jpg?v=20261009',
  },
  {
    id: 'emp-shahid-nadaf',
    name: 'Shahid Nadaf',
    designation: 'Android Developer',
    department: 'Mobile Engineering',
    bio: 'Android software developer creating intuitive mobile solutions, native performance optimization, and seamless app architectures.',
    skills: ['Android Architecture', 'Kotlin', 'REST APIs'],
    experienceYears: 2,
    joiningDate: '2023-01-15',
    employeeId: 'ITPL-010',
    avatar: '/live_assets/shahid-nadaf.jpg?v=20261009',
  },
  {
    id: 'emp-mayur-yadav',
    name: 'Mayur Yadav',
    designation: 'Android Developer',
    department: 'Mobile Engineering',
    bio: 'Android developer focused on native mobile application engineering, reliable backend integrations, and responsive UI design.',
    skills: ['Android SDK', 'Native UI', 'Firebase'],
    experienceYears: 2,
    joiningDate: '2023-03-01',
    employeeId: 'ITPL-011',
    avatar: '/live_assets/mayur-yadav.jpg?v=20261009',
  },
  {
    id: 'emp-swaranjali-patil',
    name: 'Swaranjali Patil',
    designation: 'Web Developer',
    department: 'Technology',
    bio: 'Web developer specializing in clean code standards, dynamic frontend web engineering, and user-friendly web interfaces.',
    skills: ['Frontend Web', 'JavaScript', 'HTML/CSS'],
    experienceYears: 2,
    joiningDate: '2023-05-01',
    employeeId: 'ITPL-012',
    avatar: '/live_assets/swaranjali-patil.jpg?v=20261009',
  },
  {
    id: 'emp-sanket-lohar',
    name: 'Sanket Lohar',
    designation: 'Web Developer',
    department: 'Technology',
    bio: 'Frontend web developer proficient in modern JavaScript development, responsive layouts, and performant web applications.',
    skills: ['Modern JS', 'UI/UX Implementation', 'Responsive Layouts'],
    experienceYears: 2,
    joiningDate: '2023-07-01',
    employeeId: 'ITPL-013',
    avatar: '/live_assets/sanket-lohar.jpg?v=20261009',
  },
];

const INITIAL_INTERVIEWS: InterviewSession[] = [];

const INITIAL_OFFERS: OfferLetterRecord[] = [
  {
    id: 'off-1',
    candidateId: 'ITPL-CAND-2026-119',
    candidateName: 'Rahul Chougule',
    candidateEmail: 'rahul.chougule@gmail.com',
    candidateAddress: 'Vishrambag, Sangli, Maharashtra 416416',
    jobTitle: 'Cloud DevOps & Infrastructure Associate',
    department: 'Technology',
    reportingTo: 'Tushar Pawar (Technical Lead)',
    joiningDate: '2026-11-01',
    workLocation: 'Sangli Campus (Hybrid)',
    employmentType: 'Full-Time',
    ctcAnnual: 650000,
    ctcBreakup: {
      basic: 325000,
      hra: 130000,
      specialAllowance: 97500,
      performanceBonus: 65000,
      providentFund: 21600,
      insurance: 10900,
      totalAnnual: 650000,
    },
    probationPeriodMonths: 3,
    workingHours: '9:30 AM to 6:30 PM (Mon-Fri)',
    terms: [
      'Standard non-disclosure and intellectual property agreement applies.',
      'Offer is contingent upon successful verification of academic credentials.',
      'Medical fitness declaration to be provided at the time of onboarding.'
    ],
    signatoryName: 'Shriram Khabale',
    signatoryTitle: 'Founder & CEO',
    issuedDate: '2026-10-15',
    acceptanceDeadline: '2026-10-25',
    status: 'Issued',
    verificationId: 'ITPL-OFFER-2026-8841',
  }
];

const INITIAL_INTERNSHIPS: InternshipRecord[] = [
  {
    id: 'intern-1',
    internName: 'Sanika Patil',
    internEmail: 'sanika@infoyashonand.com',
    collegeOrInstitute: 'Walchand College of Engineering, Sangli',
    collegeName: 'Walchand College of Engineering, Sangli',
    degree: 'B.Tech in Computer Science',
    domain: 'Full-Stack Web Development',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    durationMonths: 4,
    performanceGrade: 'Outstanding (A+)',
    projectTitle: 'Enterprise Cooperative Banking Portal UI',
    projectDescription: 'Designed modular micro-frontend components for account ledgers, integrated WebSocket real-time alerts, and reduced page load latencies by 35%.',
    mentorName: 'Tushar Pawar',
    mentorDesignation: 'Senior Technical Lead',
    signatoryName: 'Shriram Khabale',
    signatoryTitle: 'Founder & CEO',
    issuedDate: '2026-09-30',
    status: 'Completed',
    verificationId: 'ITPL-CERT-2026-9769',
  }
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  // 1. Experience Certificate
  {
    id: 'cert-exp-1',
    category: 'experience',
    recipientName: 'sanika',
    recipientEmail: 'sanika@infoyashonand.com',
    verificationId: 'ITPL-CERT-2026-9769',
    issuedDate: '2026-09-30',
    status: 'Valid',
    designation: 'Full-Stack Web Development (React & Node.js)',
    department: 'Technology',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    duration: '4 Months',
    performanceGrade: 'Outstanding (A+)',
    responsibilities: 'Successfully built and delivered responsive web applications, integrated microservices, and collaborated on full-stack architecture.',
    signatoryName: 'Shriram Khabale',
    signatoryTitle: 'Founder & CEO',
    companyName: 'Infoyashonand Technology Pvt. Ltd.',
  },
  // 2. Award Certificate
  {
    id: 'cert-awd-1',
    category: 'award',
    recipientName: 'Rohit Patil',
    recipientEmail: 'rohit@infoyashonand.com',
    verificationId: 'ITPL-AWD-2026-4102',
    issuedDate: '2026-10-01',
    status: 'Valid',
    awardTitle: 'Excellence in Engineering & Innovation',
    awardCategory: 'Mobile Engineering & Cloud Architecture',
    citation: 'Presented in recognition of outstanding commitment, exceptional technical skill, and exemplary contributions to high-performance enterprise systems.',
    signatoryName: 'Shriram Khabale',
    signatoryTitle: 'Founder & CEO',
    companyName: 'Infoyashonand Technology Pvt. Ltd.',
  },
  // 3. Recommendation Certificate
  {
    id: 'cert-rec-1',
    category: 'recommendation',
    recipientName: 'Pooja Shrikant Patil',
    recipientEmail: 'pooja.patil@example.com',
    verificationId: 'ITPL-REC-2026-7821',
    issuedDate: '2026-10-10',
    status: 'Valid',
    associationRole: 'Full-Stack Web Development Trainee',
    recommendedFor: "Master's Degree in Computer Science & Advanced Software Engineering Roles",
    keyStrengths: 'Full-Stack Architecture, Algorithmic Thinking, Problem Solving, High Ownership',
    recommendationNote: 'Pooja has exhibited exemplary discipline, sharp technical intellect, and outstanding dedication during her tenure at Infoyashonand Technology. She has my highest recommendation for future academic and professional endeavors.',
    signatoryName: 'Shriram Khabale',
    signatoryTitle: 'Founder & CEO',
    companyName: 'Infoyashonand Technology Pvt. Ltd.',
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeName: 'Shriram Khabale',
    employeeId: 'ITPL-001',
    date: '16 Oct 2026',
    punchIn: '09:15 AM',
    punchOut: '07:30 PM',
    status: 'Present',
  },
  {
    id: 'att-2',
    employeeName: 'Tushar Pawar',
    employeeId: 'ITPL-006',
    date: '16 Oct 2026',
    punchIn: '09:28 AM',
    punchOut: '06:45 PM',
    status: 'Present',
  }
];

class AdminDatabase {
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Purge deleted inquiries and obsolete dummy data
    try {
      const storedApps = localStorage.getItem('itpl_admin_applications');
      if (storedApps && (storedApps.includes('Akshad') || storedApps.includes('Priya Deshpande') || storedApps.includes('shindeakshad55'))) {
        localStorage.removeItem('itpl_admin_applications');
        localStorage.removeItem('itpl_admin_offers');
        localStorage.removeItem('itpl_admin_interviews');
        localStorage.removeItem('itpl_admin_internships');
      }

      ['itpl_inquiries', 'itpl_enquiries'].forEach((key) => {
        const raw = localStorage.getItem(key);
        if (
          raw &&
          (raw.includes('1792991313175') ||
            raw.includes('shindeakshad55') ||
            raw.includes('Akshad Shinde') ||
            raw.includes('1793011259287') ||
            raw.includes('8010861316'))
        ) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const cleaned = list.filter(
              (i: any) =>
                i.id !== 'inq-1792991313175-475' &&
                i.id !== 'inq-1793011259287-967' &&
                i.email !== 'shindeakshad55@gmail.com' &&
                i.name !== 'Akshad Shinde' &&
                i.phone !== '8010861316'
            );
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        }
      });
    } catch {
      // ignore
    }

    if (!localStorage.getItem('itpl_admin_applications')) {
      localStorage.setItem('itpl_admin_applications', JSON.stringify(INITIAL_APPLICATIONS));
    }
    if (!localStorage.getItem('itpl_admin_team')) {
      localStorage.setItem('itpl_admin_team', JSON.stringify(INITIAL_TEAM));
    }
    if (!localStorage.getItem('itpl_admin_interviews')) {
      localStorage.setItem('itpl_admin_interviews', JSON.stringify(INITIAL_INTERVIEWS));
    }
    if (!localStorage.getItem('itpl_admin_offers')) {
      localStorage.setItem('itpl_admin_offers', JSON.stringify(INITIAL_OFFERS));
    }
    if (!localStorage.getItem('itpl_admin_internships')) {
      localStorage.setItem('itpl_admin_internships', JSON.stringify(INITIAL_INTERNSHIPS));
    }
    if (!localStorage.getItem('itpl_admin_certificates')) {
      const existingInternshipsStr = localStorage.getItem('itpl_admin_internships');
      const combined: CertificateRecord[] = [...INITIAL_CERTIFICATES];
      if (existingInternshipsStr) {
        try {
          const parsed = JSON.parse(existingInternshipsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((item: any) => {
              if (item && !combined.some((c) => c.verificationId === item.verificationId)) {
                combined.unshift({
                  id: item.id || `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  category: 'experience',
                  recipientName: item.internName || item.recipientName || 'Candidate',
                  recipientEmail: item.internEmail || item.recipientEmail || 'candidate@example.com',
                  verificationId: item.verificationId || `ITPL-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  issuedDate: item.issuedDate || new Date().toISOString().split('T')[0],
                  status: item.status || 'Valid',
                  designation: item.domain || 'Full-Stack Web Development (React & Node.js)',
                  department: 'Technology',
                  startDate: item.startDate || '2026-06-01',
                  endDate: item.endDate || new Date().toISOString().split('T')[0],
                  duration: item.durationMonths ? `${item.durationMonths} Months` : '3 Months',
                  performanceGrade: item.performanceGrade || 'Outstanding (A+)',
                  responsibilities: item.projectDescription || item.projectTitle || 'Completed live industrial project.',
                  signatoryName: item.signatoryName || 'Shriram Khabale',
                  signatoryTitle: item.signatoryTitle || 'Founder & CEO',
                  companyName: 'Infoyashonand Technology Pvt. Ltd.',
                });
              }
            });
          }
        } catch {
          // ignore
        }
      }
      localStorage.setItem('itpl_admin_certificates', JSON.stringify(combined));
    }
    if (!localStorage.getItem('itpl_admin_attendance')) {
      localStorage.setItem('itpl_admin_attendance', JSON.stringify(INITIAL_ATTENDANCE));
    }

    // If Firebase Firestore is active, fetch all cloud data at once and sync to localStorage,
    // then dispatch a storage event so any mounted UI (AdminPage) refreshes automatically.
    if (isFirebaseConfigured) {
      loadAllFromFirestore()
        .then(({ applications, offers, internships, employees, certificates }) => {
          let changed = false;
          if (applications !== null) {
            localStorage.setItem('itpl_admin_applications', JSON.stringify(applications));
            changed = true;
          }

          if (offers !== null) {
            localStorage.setItem('itpl_admin_offers', JSON.stringify(offers));
            changed = true;
          }

          if (internships !== null) {
            localStorage.setItem('itpl_admin_internships', JSON.stringify(internships));
            changed = true;
          }

          if (employees && employees.length > 0) {
            localStorage.setItem('itpl_admin_team', JSON.stringify(employees));
            changed = true;
          } else if (employees && employees.length === 0) {
            INITIAL_TEAM.forEach((emp) => createEmployeeFirestore(emp));
          }

          if (certificates && certificates.length > 0) {
            localStorage.setItem('itpl_admin_certificates', JSON.stringify(certificates));
            changed = true;
          } else if (certificates && certificates.length === 0) {
            INITIAL_CERTIFICATES.forEach((cert) => createCertificateFirestore(cert));
          }

          // Notify any listeners that data has been refreshed from Firestore
          if (changed && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('itpl_firestore_synced'));
          }
          console.log('✅ [AdminDB] Firestore initial sync complete.');
        })
        .catch((e) => console.warn('⚠️ [AdminDB] Firestore initial sync failed:', e));
    }
  }

  // Applications
  public getApplications(): ApplicationItem[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_applications');
      if (data) {
        const apps: ApplicationItem[] = JSON.parse(data);
        let changed = false;

        // Filter out any quote or non-candidate entries
        const cleanApps = apps.filter((app) => {
          const isQuoteLead =
            app.jobTitle?.toLowerCase().includes('quote') ||
            app.candidateEmail?.endsWith('@quote.itpl') ||
            app.candidateEmail?.includes('lead-') ||
            (app.candidateName === 'Shweta Patil' && app.department === 'IT Consulting & Solutions');
          if (isQuoteLead) {
            changed = true;
            if (isFirebaseConfigured && app.id) {
              deleteApplicationFirestore(app.id);
            }
            return false;
          }
          return true;
        });

        const normalized = cleanApps.map((app) => {
          if ((app.stage as string) === 'screening') {
            changed = true;
            return { ...app, stage: 'submitted' as const };
          }
          return app;
        });
        if (changed) {
          localStorage.setItem('itpl_admin_applications', JSON.stringify(normalized));
        }
        return normalized;
      }
      return INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  public updateApplicationStage(appId: string, stage: ApplicationItem['stage'], note?: string) {
    this.init();
    let selectedApp: ApplicationItem | null = null;
    const apps = this.getApplications().map((app) => {
      if (app.id === appId) {
        const notes = app.notes || [];
        if (note) notes.push(note);
        const updated = { ...app, stage, notes };
        if (stage === 'selected') {
          selectedApp = updated;
        }
        return updated;
      }
      return app;
    });
    localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
    if (isFirebaseConfigured) {
      updateApplicationStageFirestore(appId, stage, note);
    }

    // When status becomes "Selected" and candidate cleared interview rounds, automatically generate offer letter
    if (stage === 'selected' && selectedApp) {
      const check = this.canGenerateOfferLetter(appId);
      if (check.allowed) {
        this.generateOfferLetterForApplicant(appId);
      }
    }

    return apps;
  }

  public deleteApplication(appId: string) {
    this.init();
    const apps = this.getApplications().filter((app) => app.id !== appId);
    localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
    if (isFirebaseConfigured) {
      deleteApplicationFirestore(appId);
    }
    return apps;
  }

  public updateApplication(appId: string, updates: Partial<ApplicationItem>): ApplicationItem[] {
    this.init();
    const apps = this.getApplications().map((app) => {
      if (app.id === appId) {
        return { ...app, ...updates };
      }
      return app;
    });
    localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
    if (isFirebaseConfigured) {
      updateApplicationFirestore(appId, updates);
    }
    return apps;
  }

  public saveInterviewScores(
    appId: string,
    scores: {
      // Support both naming conventions: direct keys and aliased keys from InterviewScoreModal
      technicalInterview?: TechnicalInterviewScore;
      hrInterview?: HrInterviewScore;
      technical?: TechnicalInterviewScore;  // alias used by InterviewScoreModal
      hr?: HrInterviewScore;               // alias used by InterviewScoreModal
    }
  ): ApplicationItem | null {
    this.init();
    // Normalize: accept both key naming conventions
    const normalizedScores = {
      technicalInterview: scores.technicalInterview ?? scores.technical,
      hrInterview: scores.hrInterview ?? scores.hr,
    };

    let targetApp: ApplicationItem | null = null;
    const apps = this.getApplications().map((app) => {
      if (app.id === appId) {
        const technical = normalizedScores.technicalInterview !== undefined ? normalizedScores.technicalInterview : app.technicalInterview;
        const hr = normalizedScores.hrInterview !== undefined ? normalizedScores.hrInterview : app.hrInterview;

        let overallScore: number | undefined = undefined;
        let passed = false;

        if (technical && hr) {
          overallScore = Math.round((technical.totalScore + hr.totalScore) / 2);
          passed = technical.recommendation === 'Pass' && hr.recommendation === 'Pass' && overallScore >= 60;
        } else if (technical) {
          overallScore = technical.totalScore;
          passed = technical.recommendation === 'Pass' && technical.totalScore >= 60;
        } else if (hr) {
          overallScore = hr.totalScore;
          passed = hr.recommendation === 'Pass' && hr.totalScore >= 60;
        }

        // Auto transition stage
        let newStage = app.stage;
        if (technical && technical.recommendation === 'Pass' && !hr) {
          newStage = 'hr_interview';
        } else if (technical && technical.recommendation === 'Pass' && hr && hr.recommendation === 'Pass') {
          newStage = 'selected';
        } else if ((technical && technical.recommendation === 'Fail') || (hr && hr.recommendation === 'Fail')) {
          newStage = 'rejected';
        }

        const updatedApp: ApplicationItem = {
          ...app,
          technicalInterview: technical,
          hrInterview: hr,
          interviewOverallScore: overallScore,
          interviewPassed: passed,
          stage: newStage,
        };

        targetApp = updatedApp;

        // Sync interview scores + new stage to Firestore
        if (isFirebaseConfigured) {
          saveInterviewScoresFirestore(appId, {
            technicalInterview: technical,
            hrInterview: hr,
            interviewOverallScore: overallScore,
            interviewPassed: passed,
            stage: newStage,
          });
          updateApplicationFirestore(appId, updatedApp);
        }

        return updatedApp;
      }
      return app;
    });
    localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));

    // When candidate clears all interview rounds and status becomes 'selected', automatically generate offer letter!
    if (targetApp && (targetApp as ApplicationItem).stage === 'selected') {
      const check = this.canGenerateOfferLetter(appId);
      if (check.allowed) {
        this.generateOfferLetterForApplicant(appId, {
          joiningDate: (targetApp as ApplicationItem).hrInterview?.expectedJoiningDate,
        });
      }
    }

    return targetApp;
  }

  public canGenerateOfferLetter(appId: string): { allowed: boolean; reason?: string } {
    const app = this.getApplications().find((a) => a.id === appId);
    if (!app) {
      return { allowed: false, reason: 'Candidate application not found.' };
    }
    if (!app.technicalInterview) {
      return {
        allowed: false,
        reason: 'Technical Interview round has not been evaluated yet. Please conduct the technical round first.',
      };
    }
    if (app.technicalInterview.recommendation !== 'Pass') {
      return {
        allowed: false,
        reason: `Technical Interview status is "${app.technicalInterview.recommendation}". Candidate must pass Technical Interview (Min 60%).`,
      };
    }
    if (!app.hrInterview) {
      return {
        allowed: false,
        reason: 'HR Interview round has not been evaluated yet. Please conduct the HR round before generating offer letter.',
      };
    }
    if (app.hrInterview.recommendation !== 'Pass') {
      return {
        allowed: false,
        reason: `HR Interview status is "${app.hrInterview.recommendation}". Candidate must pass HR Interview (Min 60%).`,
      };
    }
    if ((app.interviewOverallScore || 0) < 60) {
      return {
        allowed: false,
        reason: `Combined interview score is ${app.interviewOverallScore}%. Minimum 60% required to generate Offer Letter.`,
      };
    }
    return { allowed: true };
  }

  public generateOfferLetterForApplicant(
    appId: string,
    offerDetails?: {
      joiningDate?: string;
      annualCtc?: number;
      workLocation?: string;
      employmentType?: string;
      reportingAuthority?: string;
    }
  ): { success: boolean; offer?: OfferLetterRecord; error?: string } {
    this.init();
    const check = this.canGenerateOfferLetter(appId);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const app = this.getApplications().find((a) => a.id === appId)!;
    const ctc = offerDetails?.annualCtc || 650000;
    const joinDate = offerDetails?.joiningDate || app.hrInterview?.expectedJoiningDate || '2026-11-01';

    // Check if an offer already exists for this applicant so we don't duplicate
    const existingOffers = this.getOffers();
    let offerRecord = existingOffers.find(
      (o) =>
        o.candidateId === app.candidateId ||
        o.candidateEmail === app.candidateEmail ||
        (app.offerLetterId && o.id === app.offerLetterId)
    );

    if (!offerRecord) {
      offerRecord = this.generateOfferLetter({
        candidateId: app.candidateId,
        candidateName: app.candidateName,
        candidateEmail: app.candidateEmail,
        candidateAddress: 'Walchand College Corner, Vishrambag, Sangli, Maharashtra 416416',
        jobTitle: app.jobTitle,
        department: app.department || 'Technology',
        reportingTo: offerDetails?.reportingAuthority || 'Tushar Pawar [Senior Technical Lead]',
        joiningDate: joinDate,
        workLocation: offerDetails?.workLocation || 'Pearl Enclave, MSEB Rd, Vishrambag, Sangli',
        employmentType: offerDetails?.employmentType || 'Full-Time Trainee / Intern',
        ctcAnnual: ctc,
      });
    }

    // Mark applicant with offer letter and stage 'selected'
    this.updateApplication(appId, {
      offerLetterGenerated: true,
      offerLetterId: offerRecord.id,
      stage: 'selected',
    });

    // Populate candidate details into the existing offer letter format without altering design or layout
    try {
      let existingFormat: any = null;
      const saved = localStorage.getItem('itpl_current_offer_letter');
      if (saved) {
        try {
          existingFormat = JSON.parse(saved);
        } catch {}
      }

      const todayStr = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');

      // Helper to format date cleanly like "3 August, 2026"
      const formatOfferDate = (dateStr?: string): string => {
        if (!dateStr) return '1 November, 2026';
        if (/[a-zA-Z]/.test(dateStr)) return dateStr;
        try {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            if (!isNaN(day) && month >= 0 && month < 12 && !isNaN(year)) {
              return `${day} ${monthNames[month]}, ${year}`;
            }
          }
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const day = d.getDate();
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return `${day} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
          }
        } catch {}
        return dateStr;
      };

      // Helper to compute end date (e.g. 3 months internship / 1 year)
      const computeOfferEndDate = (joinDateStr?: string): string => {
        try {
          let d: Date;
          if (joinDateStr && !isNaN(new Date(joinDateStr).getTime())) {
            d = new Date(joinDateStr);
          } else {
            d = new Date();
          }
          d.setMonth(d.getMonth() + 3);
          const day = d.getDate();
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          return `${day} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
        } catch {}
        return '3 February, 2027';
      };

      const formattedJoinDate = formatOfferDate(joinDate);
      const computedEndDate = computeOfferEndDate(joinDate);

      // Default fallback template if none exists in localStorage
      const defaultFormat = {
        letterDate: todayStr,
        candidateName: app.candidateName,
        candidateAddress: 'A/p Sangli',
        position: app.jobTitle,
        joiningDate: formattedJoinDate,
        endDate: computedEndDate,
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
        contentLineSpacing: 'normal' as const,
        showLetterheadGuide: true,
        previewLetterheadPaper: false,
      };

      // STRICTLY PRESERVE ALL EXISTING DESIGN, MARGINS, SPACING & TEMPLATE FIELDS!
      // ONLY POPULATE CANDIDATE'S NAME AND SPECIFIC DETAILS
      const base = existingFormat || defaultFormat;
      const candidateOfferData = {
        ...base,
        letterDate: todayStr,
        candidateName: app.candidateName,
        position: app.jobTitle,
        joiningDate: formattedJoinDate,
        endDate: computedEndDate,
        candidateAddress: (app as any).candidateAddress || (app as any).address || base.candidateAddress || 'A/p Sangli, Maharashtra',
      };

      localStorage.setItem('itpl_current_offer_letter', JSON.stringify(candidateOfferData));
      localStorage.setItem(`itpl_offer_candidate_${app.id}`, JSON.stringify(candidateOfferData));
    } catch (e) {
      console.warn('LocalStorage prime failed', e);
    }

    return { success: true, offer: offerRecord };
  }

  public loadOfferIntoGenerator(offer: OfferLetterRecord) {
    try {
      let existingFormat: any = null;
      const saved = localStorage.getItem('itpl_current_offer_letter');
      if (saved) {
        try {
          existingFormat = JSON.parse(saved);
        } catch {}
      }

      const todayStr = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');

      const formatOfferDate = (dateStr?: string): string => {
        if (!dateStr) return '1 November, 2026';
        if (/[a-zA-Z]/.test(dateStr)) return dateStr;
        try {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            if (!isNaN(day) && month >= 0 && month < 12 && !isNaN(year)) {
              return `${day} ${monthNames[month]}, ${year}`;
            }
          }
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const day = d.getDate();
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return `${day} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
          }
        } catch {}
        return dateStr;
      };

      const computeOfferEndDate = (joinDateStr?: string): string => {
        try {
          let d: Date;
          if (joinDateStr && !isNaN(new Date(joinDateStr).getTime())) {
            d = new Date(joinDateStr);
          } else {
            d = new Date();
          }
          d.setMonth(d.getMonth() + 3);
          const day = d.getDate();
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          return `${day} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
        } catch {}
        return '3 February, 2027';
      };

      const formattedJoinDate = formatOfferDate(offer.joiningDate);
      const computedEndDate = computeOfferEndDate(offer.joiningDate);

      const base = existingFormat || {
        letterDate: todayStr,
        candidateName: offer.candidateName,
        candidateAddress: offer.candidateAddress || 'A/p Sangli',
        position: offer.jobTitle,
        joiningDate: formattedJoinDate,
        endDate: computedEndDate,
        postingPlace:
          'Pearl Enclave, S.No. 4360/K; Walchand College Corner, MSEB Rd, Opp. Safa Bakery, Vishrambag, Sangli, Maharashtra 416 416.',
        workingHours: '9:00 AM to 6:00 PM, Monday to Saturday',
        reportingAuthority: offer.reportingTo || 'Ms. Kshitija Patil [HR Manager]',
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
        contentLineSpacing: 'normal' as const,
        showLetterheadGuide: true,
        previewLetterheadPaper: false,
      };

      const populated = {
        ...base,
        letterDate: todayStr,
        candidateName: offer.candidateName,
        position: offer.jobTitle,
        joiningDate: formattedJoinDate,
        endDate: computedEndDate,
        candidateAddress: offer.candidateAddress || base.candidateAddress || 'A/p Sangli, Maharashtra',
      };

      localStorage.setItem('itpl_current_offer_letter', JSON.stringify(populated));
    } catch (e) {
      console.warn('loadOfferIntoGenerator failed', e);
    }
  }

  public createApplication(app: Partial<ApplicationItem>): ApplicationItem {
    this.init();
    const apps = this.getApplications();
    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      jobTitle: app.jobTitle || 'Full-Stack Web Developer',
      candidateId: app.candidateId || `ITPL-CAND-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateName: app.candidateName || 'Candidate',
      candidateEmail: app.candidateEmail || 'candidate@example.com',
      candidatePhone: app.candidatePhone || '+91 80555 14368',
      department: app.department || 'Technology',
      stage: app.stage || 'submitted',
      testPercentage: app.testPercentage || 80,
      testStatus: app.testStatus || 'Passed',
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: app.notes || ['Applied via candidate portal'],
    };
    apps.unshift(newApp);
    localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
    if (isFirebaseConfigured) {
      createApplicationFirestore(newApp);
    }
    return newApp;
  }

  public saveCandidateTestResult(
    candidate: {
      candidateId?: string;
      candidateName: string;
      candidateEmail: string;
    },
    result: {
      testPercentage: number;
      testStatus: 'Passed' | 'Failed';
      totalQuestions: number;
      attemptedCount: number;
      unansweredCount: number;
      correctCount: number;
      wasTimeout?: boolean;
      wasViolation?: boolean;
    }
  ): ApplicationItem {
    this.init();
    const apps = this.getApplications();
    const candEmailLower = candidate.candidateEmail?.toLowerCase();
    const candNameLower = candidate.candidateName?.toLowerCase();
    const matchIndex = apps.findIndex(
      (a) =>
        (candEmailLower && a.candidateEmail.toLowerCase() === candEmailLower) ||
        (candidate.candidateId && a.candidateId === candidate.candidateId) ||
        (candNameLower && a.candidateName.toLowerCase() === candNameLower)
    );

    const nowStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const note = `Aptitude Test: ${result.testPercentage}% (${result.correctCount}/${result.totalQuestions} correct, ${result.attemptedCount} attempted, ${result.unansweredCount} skipped) on ${nowStr}.${
      result.wasViolation ? ' (Terminated: Proctoring Violation)' : ''
    }${result.wasTimeout ? ' (Auto-submitted: Time expired)' : ''}`;

    if (matchIndex >= 0) {
      const app = apps[matchIndex];
      const notes = app.notes ? [...app.notes] : [];
      notes.unshift(note);

      const updatedStage =
        result.testStatus === 'Passed' &&
        (app.stage === 'submitted' || app.stage === 'screening' || app.stage === 'aptitude_test')
          ? 'technical_interview'
          : app.stage;

      const updatedApp: ApplicationItem = {
        ...app,
        testPercentage: result.testPercentage,
        testStatus: result.testStatus,
        isTestLocked: true,
        testLockReason: 'Assessment completed & submitted',
        lastTestAttemptDate: nowStr,
        stage: updatedStage,
        notes,
      };

      apps[matchIndex] = updatedApp;
      localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
      if (isFirebaseConfigured) {
        updateApplicationFirestore(updatedApp.id, updatedApp);
        saveTestResultFirestore({
          candidateId: updatedApp.candidateId,
          candidateName: updatedApp.candidateName,
          candidateEmail: updatedApp.candidateEmail,
          scorePercentage: result.testPercentage,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctCount,
          status: result.testStatus,
          wasAutoSubmittedViolation: Boolean(result.wasViolation),
          attemptDate: nowStr,
        });
      }
      return updatedApp;
    } else {
      const newApp: ApplicationItem = {
        id: `app-${Date.now()}`,
        jobTitle: 'Full-Stack Web Developer Trainee',
        candidateId: candidate.candidateId || `ITPL-CAND-${Math.floor(1000 + Math.random() * 9000)}`,
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        department: 'Technology',
        stage: result.testStatus === 'Passed' ? 'technical_interview' : 'aptitude_test',
        testPercentage: result.testPercentage,
        testStatus: result.testStatus,
        isTestLocked: true,
        testLockReason: 'Assessment completed & submitted',
        lastTestAttemptDate: nowStr,
        appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        notes: [note],
      };
      apps.unshift(newApp);
      localStorage.setItem('itpl_admin_applications', JSON.stringify(apps));
      if (isFirebaseConfigured) {
        createApplicationFirestore(newApp);
        saveTestResultFirestore({
          candidateId: newApp.candidateId,
          candidateName: newApp.candidateName,
          candidateEmail: newApp.candidateEmail,
          scorePercentage: result.testPercentage,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctCount,
          status: result.testStatus,
          wasAutoSubmittedViolation: Boolean(result.wasViolation),
          attemptDate: nowStr,
        });
      }
      return newApp;
    }
  }

  public getCandidateApplication(identifier: {
    email?: string;
    candidateId?: string;
    name?: string;
  }): ApplicationItem | undefined {
    this.init();
    const apps = this.getApplications();
    const emailLower = identifier.email?.toLowerCase();
    const nameLower = identifier.name?.toLowerCase();
    return apps.find(
      (a) =>
        (emailLower && a.candidateEmail.toLowerCase() === emailLower) ||
        (identifier.candidateId && a.candidateId === identifier.candidateId) ||
        (nameLower && a.candidateName.toLowerCase() === nameLower)
    );
  }

  // Team
  public getTeam(): EmployeeMember[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_team');
      return data ? JSON.parse(data) : INITIAL_TEAM;
    } catch {
      return INITIAL_TEAM;
    }
  }

  public createTeamMember(member: Partial<EmployeeMember>): EmployeeMember {
    this.init();
    const team = this.getTeam();
    const newMember: EmployeeMember = {
      id: `emp-${Date.now()}`,
      name: member.name || 'New Employee',
      designation: member.designation || 'Software Engineer',
      department: member.department || 'Technology',
      bio: member.bio || 'Employee at Infoyashonand Technology',
      skills: member.skills || ['JavaScript', 'React'],
      experienceYears: member.experienceYears || 2,
      joiningDate: member.joiningDate || new Date().toISOString().split('T')[0],
      employeeId: member.employeeId || `ITPL-${Math.floor(100 + Math.random() * 900)}`,
      avatar: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80',
    };
    team.push(newMember);
    localStorage.setItem('itpl_admin_team', JSON.stringify(team));
    if (isFirebaseConfigured) {
      createEmployeeFirestore(newMember);
    }
    return newMember;
  }

  // Update existing team member
  public updateTeamMember(id: string, updates: Partial<EmployeeMember>): EmployeeMember[] {
    this.init();
    const team = this.getTeam().map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    localStorage.setItem('itpl_admin_team', JSON.stringify(team));
    if (isFirebaseConfigured) {
      updateEmployeeFirestore(id, updates);
    }
    return team;
  }

  // Our Team (Public "Our Team" Page & Directory)
  public getOurTeamMembers() {
    return teamService.getTeamMembers();
  }

  public updateOurTeamMember(id: string, updates: any) {
    return teamService.updateTeamMember(id, updates);
  }

  public createOurTeamMember(member: any) {
    return teamService.createTeamMember(member);
  }

  public deleteOurTeamMember(id: string) {
    return teamService.deleteTeamMember(id);
  }

  public resetOurTeamMembers() {
    return teamService.resetToDefaultTeam();
  }

  // Interviews
  public getInterviews(): InterviewSession[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_interviews');
      return data ? JSON.parse(data) : INITIAL_INTERVIEWS;
    } catch {
      return INITIAL_INTERVIEWS;
    }
  }

  // Offers
  public getOffers(): OfferLetterRecord[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_offers');
      return data ? JSON.parse(data) : INITIAL_OFFERS;
    } catch {
      return INITIAL_OFFERS;
    }
  }

  public generateOfferLetter(offer: Partial<OfferLetterRecord>): OfferLetterRecord {
    this.init();
    const offers = this.getOffers();
    const ctc = offer.ctcAnnual || 650000;
    const newOffer: OfferLetterRecord = {
      id: `off-${Date.now()}`,
      candidateId: offer.candidateId || `cand-${Date.now()}`,
      candidateName: offer.candidateName || 'Candidate',
      candidateEmail: offer.candidateEmail || 'candidate@example.com',
      candidateAddress: offer.candidateAddress || 'Maharashtra, India',
      jobTitle: offer.jobTitle || 'Full-Stack Web Developer',
      department: offer.department || 'Technology',
      reportingTo: offer.reportingTo || 'Technical Lead',
      joiningDate: offer.joiningDate || '2026-11-01',
      workLocation: offer.workLocation || 'Vishrambag, Sangli Tech Center',
      employmentType: offer.employmentType || 'Full-time Regular',
      ctcAnnual: ctc,
      ctcBreakup: {
        basic: Math.round(ctc * 0.4),
        hra: Math.round(ctc * 0.2),
        specialAllowance: Math.round(ctc * 0.25),
        performanceBonus: Math.round(ctc * 0.1),
        providentFund: 28000,
        insurance: 14500,
        totalAnnual: ctc,
      },
      probationPeriodMonths: 3,
      terms: ['Subject to background credential verification.'],
      signatoryName: 'Shriram Khabale',
      signatoryTitle: 'Founder & CEO',
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Issued',
      verificationId: `ITPL-OFFER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    offers.unshift(newOffer);
    localStorage.setItem('itpl_admin_offers', JSON.stringify(offers));
    if (isFirebaseConfigured) {
      createOfferLetterFirestore(newOffer);
    }
    return newOffer;
  }

  public deleteOfferLetter(id: string) {
    this.init();
    const offers = this.getOffers().filter((o) => o.id !== id);
    localStorage.setItem('itpl_admin_offers', JSON.stringify(offers));
    if (isFirebaseConfigured) {
      deleteOfferLetterFirestore(id);
    }
    return offers;
  }

  // Internships
  public getInternships(): InternshipRecord[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_internships');
      return data ? JSON.parse(data) : INITIAL_INTERNSHIPS;
    } catch {
      return INITIAL_INTERNSHIPS;
    }
  }

  public createInternshipCertificate(cert: Partial<InternshipRecord>): InternshipRecord {
    this.init();
    const certs = this.getInternships();
    const newCert: InternshipRecord = {
      id: `intern-${Date.now()}`,
      internName: cert.internName || 'Student Name',
      internEmail: cert.internEmail || 'student@example.com',
      collegeOrInstitute: cert.collegeOrInstitute || cert.collegeName || 'Walchand College of Engineering',
      collegeName: cert.collegeName || cert.collegeOrInstitute || 'Walchand College of Engineering',
      degree: cert.degree,
      domain: cert.domain || 'Full-Stack Web Development',
      startDate: cert.startDate || '2026-06-01',
      endDate: cert.endDate || new Date().toISOString().split('T')[0],
      durationMonths: cert.durationMonths || 3,
      performanceGrade: cert.performanceGrade || 'Outstanding (A+)',
      projectTitle: cert.projectTitle || 'Smart IT Cloud Platform',
      projectDescription: cert.projectDescription || 'Completed live industrial project.',
      mentorName: cert.mentorName || 'Tushar Pawar',
      mentorDesignation: cert.mentorDesignation || 'Senior Web Developer',
      signatoryName: 'Shriram Khabale',
      signatoryTitle: 'Founder & CEO',
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Valid',
      verificationId: `ITPL-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    certs.unshift(newCert);
    localStorage.setItem('itpl_admin_internships', JSON.stringify(certs));
    if (isFirebaseConfigured) {
      createInternshipFirestore(newCert);
    }
    return newCert;
  }

  public deleteInternshipCertificate(id: string) {
    this.init();
    const certs = this.getInternships().filter((c) => c.id !== id);
    localStorage.setItem('itpl_admin_internships', JSON.stringify(certs));
    if (isFirebaseConfigured) {
      deleteInternshipFirestore(id);
    }
    return certs;
  }

  // Certificates (Categorized: Experience, Award, Recommendation)
  public getCertificates(category?: CertificateCategory): CertificateRecord[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_certificates');
      const certs: CertificateRecord[] = data ? JSON.parse(data) : INITIAL_CERTIFICATES;
      if (category) {
        return certs.filter((c) => c.category === category);
      }
      return certs;
    } catch {
      return category ? INITIAL_CERTIFICATES.filter((c) => c.category === category) : INITIAL_CERTIFICATES;
    }
  }

  public createCertificate(cert: Partial<CertificateRecord>): CertificateRecord {
    this.init();
    const certs = this.getCertificates();
    const category: CertificateCategory = cert.category || 'experience';

    let prefix = 'ITPL-EXP';
    if (category === 'award') prefix = 'ITPL-AWD';
    if (category === 'recommendation') prefix = 'ITPL-REC';

    const newCert: CertificateRecord = {
      id: `cert-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      category,
      recipientName: cert.recipientName || 'Candidate Name',
      recipientEmail: cert.recipientEmail || 'candidate@example.com',
      verificationId: cert.verificationId || `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issuedDate: cert.issuedDate || new Date().toISOString().split('T')[0],
      status: 'Valid',
      designation: cert.designation || 'Full-Stack Web Development (React & Node.js)',
      department: cert.department || 'Technology',
      startDate: cert.startDate || '2026-06-01',
      endDate: cert.endDate || new Date().toISOString().split('T')[0],
      duration: cert.duration || '3 Months',
      performanceGrade: cert.performanceGrade || 'Outstanding (A+)',
      responsibilities: cert.responsibilities || 'Contributed to enterprise development projects and engineering standards.',
      awardTitle: cert.awardTitle || 'Excellence in Engineering',
      awardCategory: cert.awardCategory || 'Engineering Excellence',
      citation: cert.citation || 'Awarded for extraordinary dedication, innovation, and technical performance.',
      associationRole: cert.associationRole || 'Software Development Associate',
      recommendedFor: cert.recommendedFor || 'Higher Education & Senior Technical Roles',
      keyStrengths: cert.keyStrengths || 'Full-Stack Development, Problem Solving, Dedication',
      recommendationNote: cert.recommendationNote || 'Exhibited outstanding technical skill and dedication. Highly recommended.',
      signatoryName: 'Shriram Khabale',
      signatoryTitle: 'Founder & CEO',
      companyName: 'Infoyashonand Technology Pvt. Ltd.',
    };

    certs.unshift(newCert);
    localStorage.setItem('itpl_admin_certificates', JSON.stringify(certs));
    if (isFirebaseConfigured) {
      createCertificateFirestore(newCert);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('itpl_certificates_updated', { detail: { id: newCert.id, cert: newCert } }));
    }
    return newCert;
  }

  public updateCertificate(id: string, updates: Partial<CertificateRecord>): CertificateRecord | null {
    this.init();
    const certs = this.getCertificates();
    const index = certs.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCert: CertificateRecord = {
      ...certs[index],
      ...updates,
      id: certs[index].id,
      verificationId: updates.verificationId || certs[index].verificationId,
    };

    certs[index] = updatedCert;
    localStorage.setItem('itpl_admin_certificates', JSON.stringify(certs));
    if (isFirebaseConfigured) {
      updateCertificateFirestore(id, updatedCert);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('itpl_certificates_updated', { detail: { id, cert: updatedCert } }));
    }
    return updatedCert;
  }

  public deleteCertificate(id: string): CertificateRecord[] {
    this.init();
    const certs = this.getCertificates().filter((c) => c.id !== id);
    localStorage.setItem('itpl_admin_certificates', JSON.stringify(certs));
    if (isFirebaseConfigured) {
      deleteCertificateFirestore(id);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('itpl_certificates_updated', { detail: { id } }));
    }
    return certs;
  }

  public getCertificateById(idOrVerifId: string): CertificateRecord | undefined {
    this.init();
    const certs = this.getCertificates();
    const target = idOrVerifId.trim().toLowerCase();
    return certs.find(
      (c) =>
        c.id.toLowerCase() === target ||
        c.verificationId.toLowerCase() === target
    );
  }

  public subscribeToCertificates(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'itpl_admin_certificates' || !e.key) {
        listener();
      }
    };
    const handleCustom = () => {
      listener();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('itpl_certificates_updated', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('itpl_certificates_updated', handleCustom);
    };
  }

  // Attendance
  public getAttendance(): AttendanceRecord[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_admin_attendance');
      return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  }

  // Client Quotes & Inquiries Management
  public getInquiries(): ContactInquiryFirestore[] {
    this.init();
    try {
      const data = localStorage.getItem('itpl_inquiries');
      if (data) {
        return JSON.parse(data);
      }
      // Check legacy key if present
      const legacy = localStorage.getItem('itpl_enquiries');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('itpl_inquiries', JSON.stringify(parsed));
          return parsed;
        }
      }

      // Default sample candidate inquiries for HR initial view
      const defaultInquiries: ContactInquiryFirestore[] = [
        {
          id: 'inq-cand-101',
          name: 'Pranav Shinde',
          email: 'pranav.shinde@gmail.com',
          phone: '+91 98220 12345',
          service: 'Full-Stack Python & Java Job Training',
          company: 'Walchand College of Engineering',
          message: 'Final year BE CSE student looking for 6-month offline internship and placement training in Sangli center.',
          source: 'Live Tech Desk • Quick Enquiry Form',
          status: 'New',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
        {
          id: 'inq-cand-102',
          name: 'Neha Kulkarni',
          email: 'neha.kulkarni@gmail.com',
          phone: '+91 88884 56789',
          service: 'MERN & Next.js Web Stack',
          company: 'Shivaji University, Kolhapur',
          message: 'Interested in hands-on production code deployment and cloud integration modules.',
          source: 'Website Contact & Inquiry Form',
          status: 'In Discussion',
          createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        },
      ];
      localStorage.setItem('itpl_inquiries', JSON.stringify(defaultInquiries));
      return defaultInquiries;
    } catch (e) {
      console.warn('Could not read inquiries from localStorage', e);
    }
    return [];
  }

  public saveInquiry(inquiry: Partial<ContactInquiryFirestore>): ContactInquiryFirestore {
    this.init();
    const existing = this.getInquiries();
    const id = inquiry.id || `inq-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newInquiry: ContactInquiryFirestore = {
      id,
      name: inquiry.name || 'Client Lead',
      email: inquiry.email || '',
      phone: inquiry.phone || '',
      service: inquiry.service || 'IT Solutions & Consulting',
      company: inquiry.company || '',
      budget: inquiry.budget || '',
      message: inquiry.message || '',
      source: inquiry.source || 'Website Quote Form',
      status: inquiry.status || 'New',
      createdAt: new Date().toISOString(),
    };

    const updated = [newInquiry, ...existing.filter((i) => i.id !== id)];
    try {
      localStorage.setItem('itpl_inquiries', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('itpl_inquiries_updated'));
    } catch (e) {
      console.warn('Could not save inquiry to localStorage', e);
    }

    if (isFirebaseConfigured) {
      createInquiryFirestore(newInquiry).catch(() => {});
    }

    return newInquiry;
  }

  public updateInquiryStatus(id: string, status: NonNullable<ContactInquiryFirestore['status']>): void {
    const list = this.getInquiries();
    const found = list.find((i) => i.id === id);
    if (found) {
      found.status = status;
      try {
        localStorage.setItem('itpl_inquiries', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('itpl_inquiries_updated'));
      } catch (e) {}

      if (isFirebaseConfigured) {
        updateInquiryStatusFirestore(id, status).catch(() => {});
      }
    }
  }

  public deleteInquiry(id: string): void {
    const list = this.getInquiries().filter((i) => i.id !== id);
    try {
      localStorage.setItem('itpl_inquiries', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('itpl_inquiries_updated'));
    } catch (e) {}

    if (isFirebaseConfigured) {
      deleteInquiryFirestore(id).catch(() => {});
    }
  }

  public subscribeToInquiries(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'itpl_inquiries' || !e.key) {
        listener();
      }
    };
    const handleCustom = () => {
      listener();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('itpl_inquiries_updated', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('itpl_inquiries_updated', handleCustom);
    };
  }
}

export const adminDb = new AdminDatabase();
