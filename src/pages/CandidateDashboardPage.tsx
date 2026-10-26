import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { adminDb, OfferLetterRecord } from '../services/adminDb';
import { saveCandidateDocumentFirestore } from '../firebase/firestoreService';

interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  candidateId: string;
  appliedRole: string;
  appliedDate: string;
}

interface AptitudeQuestion {
  id: number;
  category: 'Quantitative' | 'Logical' | 'Technical' | 'Verbal';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface TestSubmissionSummary {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  totalQuestions: number;
  attemptedCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  passed: boolean;
  submittedAt: string;
  submittedIso?: string;
  userAnswers: Record<number, number>;
  wasTimeout?: boolean;
  wasViolation?: boolean;
}

interface CandidateDoc {
  id: string;
  title: string;
  category: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  verifierNotes?: string;
  verifiedBy?: string;
}

const DEFAULT_DOCUMENTS: CandidateDoc[] = [
  {
    id: 'doc-resume',
    title: 'Resume / Curriculum Vitae',
    category: 'Resume & Bio-data',
    required: true,
    status: 'pending',
  },
  {
    id: 'doc-idproof',
    title: 'Government Photo ID Proof',
    category: 'Identity Proof',
    required: true,
    status: 'pending',
  },
  {
    id: 'doc-cert',
    title: 'Prior Certifications / Experience',
    category: 'Skill Credentials',
    required: false,
    status: 'pending',
  },
];

const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: 1,
    category: 'Quantitative',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long at the same speed?',
    options: ['65 seconds', '89 seconds', '72 seconds', '100 seconds'],
    correct: 1,
    explanation: 'Speed = 240 / 24 = 10 m/s. Total distance for platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
  },
  {
    id: 2,
    category: 'Logical',
    question: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?',
    options: ['7', '10', '12', '13'],
    correct: 1,
    explanation: 'Alternating addition/subtraction: +3, -2, +3, -2, +3, -2. So 12 - 2 = 10.',
  },
  {
    id: 3,
    category: 'Technical',
    question: 'In JavaScript / TypeScript, which data structure provides O(1) average time complexity for key-value lookups?',
    options: ['Array', 'Map / Object hash table', 'Linked List', 'Binary Search Tree'],
    correct: 1,
    explanation: 'Hash maps (ES6 Map / Object) have O(1) average lookup time via hashing.',
  },
  {
    id: 4,
    category: 'Technical',
    question: 'Which HTTP method is considered idempotent according to REST architectural principles?',
    options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
    correct: 1,
    explanation: 'PUT is idempotent because multiple identical PUT requests produce the exact same outcome.',
  },
  {
    id: 5,
    category: 'Logical',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
    correct: 2,
    explanation: 'The only son of Suresh\'s mother is Suresh himself. So the boy is Suresh\'s son, making Suresh his father.',
  },
  {
    id: 6,
    category: 'Quantitative',
    question: 'If an item is purchased for ₹800 and sold for ₹960, what is the profit percentage?',
    options: ['16%', '20%', '25%', '18.5%'],
    correct: 1,
    explanation: 'Profit = ₹960 - ₹800 = ₹160. Profit % = (160 / 800) * 100 = 20%.',
  },
  {
    id: 7,
    category: 'Technical',
    question: 'In SQL relational databases, which keyword is used to eliminate duplicate rows from a query result?',
    options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'GROUP ROW'],
    correct: 1,
    explanation: 'The DISTINCT keyword in SELECT DISTINCT column FROM table removes duplicates.',
  },
  {
    id: 8,
    category: 'Verbal',
    question: 'Select the synonym for the word "METICULOUS":',
    options: ['Careless', 'Thorough & Precise', 'Rapid', 'Ambiguous'],
    correct: 1,
    explanation: '"Meticulous" means showing great attention to detail; very careful and precise.',
  },
  {
    id: 9,
    category: 'Logical',
    question: 'Statement: All laptops are electronic gadgets. Some electronic gadgets are portable chargers. Conclusion: Some laptops are portable chargers.',
    options: ['Conclusion logically follows', 'Conclusion does NOT necessarily follow', 'Both are mutually exclusive', 'Data is insufficient'],
    correct: 1,
    explanation: 'We cannot conclude that laptops intersect with portable chargers from the premises given.',
  },
  {
    id: 10,
    category: 'Technical',
    question: 'Which of the following is an immutable primitive type in modern programming languages like JavaScript & Python?',
    options: ['String', 'Array', 'Object literal', 'List'],
    correct: 0,
    explanation: 'Strings and numbers are primitive and immutable in JavaScript and Python.',
  },
  {
    id: 11,
    category: 'Quantitative',
    question: 'A can complete a project in 12 days and B can complete the same project in 24 days. Working together, how many days will they take to finish the work?',
    options: ['6 days', '8 days', '10 days', '14 days'],
    correct: 1,
    explanation: 'Combined rate = 1/12 + 1/24 = 3/24 = 1/8 work per day. Therefore, together they will finish in 8 days.',
  },
  {
    id: 12,
    category: 'Quantitative',
    question: 'The ratio of boys to girls in a computer science class is 5 : 3. If there are 45 boys, what is the total number of students in the class?',
    options: ['64', '72', '80', '90'],
    correct: 1,
    explanation: '5 units = 45 boys => 1 unit = 9 students. Total students = (5 + 3) * 9 = 72.',
  },
  {
    id: 13,
    category: 'Quantitative',
    question: 'What is the simple interest earned on a principal of ₹15,000 at an annual interest rate of 8% over 3 years?',
    options: ['₹3,200', '₹3,600', '₹4,000', '₹4,200'],
    correct: 1,
    explanation: 'Simple Interest = (P * R * T) / 100 = (15,000 * 8 * 3) / 100 = ₹3,600.',
  },
  {
    id: 14,
    category: 'Quantitative',
    question: 'The average score of 5 coding assessments is 78. If the scores on four tests are 70, 85, 80, and 75, what is the score on the fifth test?',
    options: ['76', '80', '82', '84'],
    correct: 1,
    explanation: 'Total required sum = 5 * 78 = 390. Sum of 4 tests = 310. Fifth score = 390 - 310 = 80.',
  },
  {
    id: 15,
    category: 'Quantitative',
    question: 'A software course listed at ₹25,000 is offered with a discount of 20%, followed by an additional discount of 10% on the reduced price. What is the final price?',
    options: ['₹17,500', '₹18,000', '₹19,200', '₹20,000'],
    correct: 1,
    explanation: 'Price after 20% discount = 25,000 * 0.80 = ₹20,000. Price after second 10% discount = 20,000 * 0.90 = ₹18,000.',
  },
  {
    id: 16,
    category: 'Logical',
    question: 'A developer walks 30 meters North from office, turns right and walks 40 meters, then turns right again and walks 30 meters. How far and in which direction is the developer from the starting point?',
    options: ['30 meters North', '40 meters East', '50 meters North-East', '40 meters West'],
    correct: 1,
    explanation: 'Moving North 30m, East 40m, and South 30m places the developer exactly 40 meters directly East of the origin.',
  },
  {
    id: 17,
    category: 'Logical',
    question: 'In a specific coding system, if "REACT" is encrypted as "TGCEV", how will "NODE" be coded under the exact same pattern?',
    options: ['PQFG', 'OPEF', 'PQEF', 'NQFG'],
    correct: 0,
    explanation: 'Each letter is shifted forward by +2 positions in the alphabet: N(+2)->P, O(+2)->Q, D(+2)->F, E(+2)->G. Hence "PQFG".',
  },
  {
    id: 18,
    category: 'Logical',
    question: 'Five interns (P, Q, R, S, T) sit in a row facing North. R sits in the exact middle. P sits to the immediate left of R. S is at the extreme right end. Where does Q sit if T is next to S?',
    options: ['Extreme left end', 'Between P and R', 'Immediate right of R', 'Extreme right end'],
    correct: 0,
    explanation: 'Row positions from left to right: (1) Q, (2) P, (3) R, (4) T, (5) S. Q sits at the extreme left end.',
  },
  {
    id: 19,
    category: 'Logical',
    question: 'Identify the odd one out among the following software engineering terms:',
    options: ['Polymorphism', 'Encapsulation', 'Normalization', 'Inheritance'],
    correct: 2,
    explanation: 'Polymorphism, Encapsulation, and Inheritance are core pillars of Object-Oriented Programming (OOP), whereas Normalization is a relational database design technique.',
  },
  {
    id: 20,
    category: 'Technical',
    question: 'Which fundamental data structure operates on a First-In-First-Out (FIFO) access order?',
    options: ['Stack', 'Queue', 'Binary Heap', 'Graph'],
    correct: 1,
    explanation: 'A Queue adheres strictly to the First-In-First-Out (FIFO) principle, where the oldest element is removed first.',
  },
  {
    id: 21,
    category: 'Technical',
    question: 'Which Git command stages modified files from your working tree into the index before committing?',
    options: ['git push', 'git checkout', 'git add', 'git stash'],
    correct: 2,
    explanation: 'The "git add" command copies changes in the working directory to the staging area ready for the next commit.',
  },
  {
    id: 22,
    category: 'Technical',
    question: 'In standard CSS, what is the default value of the "position" property for HTML elements?',
    options: ['relative', 'absolute', 'static', 'fixed'],
    correct: 2,
    explanation: 'The initial/default CSS position property for HTML elements is "static", participating in normal layout flow.',
  },
  {
    id: 23,
    category: 'Verbal',
    question: 'Choose the word that is most nearly OPPOSITE in meaning to "OBSOLETE":',
    options: ['Archaic', 'Contemporary', 'Ancient', 'Redundant'],
    correct: 1,
    explanation: '"Obsolete" means outdated or no longer in practice. "Contemporary" means modern and present-day.',
  },
  {
    id: 24,
    category: 'Verbal',
    question: 'Complete the word relationship analogy: ALGORITHM : CODE :: BLUEPRINT : ?',
    options: ['Foundation', 'Building', 'Draftsman', 'Cement'],
    correct: 1,
    explanation: 'An algorithm provides the architectural logic for code, just as a blueprint provides the design plan for a building.',
  },
  {
    id: 25,
    category: 'Verbal',
    question: 'Identify the grammatically correct sentence regarding subject-verb agreement:',
    options: [
      'Neither the frontend engineer nor the backend developers was available.',
      'Neither the frontend engineer nor the backend developers were available.',
      'Neither the frontend engineer nor the backend developers is available.',
      'Neither the frontend engineer or the backend developers was available.',
    ],
    correct: 1,
    explanation: 'With "Neither... nor", the verb agrees with the subject closest to it ("backend developers" is plural, requiring "were").',
  },
];

export const CandidateDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Candidate session synchronization
  useEffect(() => {
    try {
      const candParam = searchParams.get('cand');
      const emailParam = searchParams.get('email');
      if (candParam || emailParam) {
        const u = {
          name: candParam || profile.name,
          email: emailParam || profile.email,
          phone: profile.phone,
        };
        localStorage.setItem('itpl_candidate_user', JSON.stringify(u));
      }
    } catch {
      // ignore
    }
  }, [searchParams]);
  // ─────────────────────────────────────────────────────────────────────────

  // Active View (direct Aptitude Test)
  const [activeTab, setActiveTab] = useState<'overview' | 'aptitude' | 'documents'>('aptitude');

  // Candidate Profile (clean - no hardcoded dummy data)
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    try {
      const saved = localStorage.getItem('itpl_candidate_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.name && u.name !== 'Amit Patil' && u.name !== 'Akshad') {
          return {
            name: u.name,
            email: u.email || 'applicant@itpl.in',
            phone: u.phone || '+91 80555 14368',
            candidateId: `ITPL-${Math.floor(1000 + Math.random() * 9000)}`,
            appliedRole: 'Full Stack Web Development & Placement',
            appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      name: 'Applicant',
      email: 'applicant@itpl.in',
      phone: '+91 80555 14368',
      candidateId: `ITPL-${Math.floor(1000 + Math.random() * 9000)}`,
      appliedRole: 'Software Developer / Trainee Program',
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  });

  const [candidateStage, setCandidateStage] = useState<string>('submitted');
  const [candidateOffer, setCandidateOffer] = useState<OfferLetterRecord | null>(null);

  // Sync profile & stage from DB
  useEffect(() => {
    try {
      const apps = adminDb.getApplications();
      const match = apps.find(
        (a) =>
          (profile.email && a.candidateEmail.toLowerCase() === profile.email.toLowerCase()) ||
          (profile.name && a.candidateName.toLowerCase() === profile.name.toLowerCase())
      );
      if (match) {
        setCandidateStage(match.stage);
      }
      const offs = adminDb.getOffers();
      const offMatch = offs.find(
        (o) =>
          (profile.email && o.candidateEmail.toLowerCase() === profile.email.toLowerCase()) ||
          (profile.name && o.candidateName.toLowerCase() === profile.name.toLowerCase())
      );
      if (offMatch) {
        setCandidateOffer(offMatch);
      }
    } catch {
      // ignore
    }
  }, [profile]);

  // Clean Documents state (no pre-filled dummy documents)
  const [documents, setDocuments] = useState<CandidateDoc[]>(() => {
    try {
      const saved = localStorage.getItem('itpl_candidate_docs');
      if (saved) {
        // If old dummy files exist, purge and return clean DEFAULT_DOCUMENTS
        if (
          saved.includes('Amit_Patil') ||
          saved.includes('BE_Computer') ||
          saved.includes('Aadhaar_Card') ||
          saved.includes('doc-marksheet')
        ) {
          localStorage.removeItem('itpl_candidate_docs');
          return DEFAULT_DOCUMENTS;
        }
        const parsed: CandidateDoc[] = JSON.parse(saved);
        const filtered = parsed.filter((d) => d.id !== 'doc-marksheet' && !d.title?.includes('Marksheet'));
        if (filtered.length > 0) return filtered;
      }
    } catch {
      // ignore
    }
    return DEFAULT_DOCUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('itpl_candidate_docs', JSON.stringify(documents));
    } catch {
      // ignore
    }
  }, [documents]);

  // URL Search Parameters synchronization
  useEffect(() => {
    const candParam = searchParams.get('cand');
    const emailParam = searchParams.get('email');
    const roleParam = searchParams.get('role');
    const testIdParam = searchParams.get('testId');
    const tabParam = searchParams.get('tab');

    if (candParam || emailParam) {
      setProfile((prev) => ({
        ...prev,
        name: candParam || prev.name,
        email: emailParam || prev.email,
        appliedRole: roleParam || prev.appliedRole,
      }));
    }
    if (testIdParam || tabParam === 'aptitude') {
      setActiveTab('aptitude');
    }
  }, [searchParams]);

  // Aptitude test constants
  const TEST_DURATION_SECONDS = 25 * 60; // 25 minutes for 25 questions

  // Helper to retrieve saved test result for the candidate from candidate-specific localStorage or adminDb
  const getSavedCandidateTest = (
    email?: string,
    candId?: string,
    name?: string
  ): { summary: TestSubmissionSummary | null; score: number; finished: boolean } => {
    try {
      const normEmail = (email || '').toLowerCase().trim();
      // 1. Try candidate-specific localStorage keys
      const rawLocal =
        (normEmail && localStorage.getItem(`itpl_cand_test_${normEmail}`)) ||
        (email && localStorage.getItem(`itpl_cand_test_${email}`)) ||
        (candId && localStorage.getItem(`itpl_cand_test_${candId}`)) ||
        localStorage.getItem('itpl_test_summary');

      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (parsed && typeof parsed.scorePercentage === 'number') {
          return {
            summary: parsed,
            score: parsed.scorePercentage,
            finished: true,
          };
        }
      }

      // 2. Try candidate-specific completion flag
      if (
        (normEmail && localStorage.getItem(`itpl_cand_test_completed_${normEmail}`) === 'true') ||
        (email && localStorage.getItem(`itpl_cand_test_completed_${email}`) === 'true') ||
        (candId && localStorage.getItem(`itpl_cand_test_completed_${candId}`) === 'true')
      ) {
        const s = localStorage.getItem('itpl_test_score');
        return {
          summary: null,
          score: s ? parseInt(s, 10) : 0,
          finished: true,
        };
      }

      // 3. Try adminDb applications
      const app = adminDb.getCandidateApplication({ email: normEmail || email, candidateId: candId, name });
      if (app && (app.isTestLocked || app.testPercentage !== undefined || app.testStatus)) {
        const percentage = app.testPercentage ?? 0;
        const passed = percentage >= 60 && app.testStatus !== 'Failed';
        const synthesized: TestSubmissionSummary = {
          candidateId: app.candidateId || candId || 'ITPL-CAND',
          candidateName: app.candidateName || name || 'Candidate',
          candidateEmail: app.candidateEmail || email || '',
          totalQuestions: 25,
          attemptedCount: Math.round((percentage / 100) * 25),
          unansweredCount: 0,
          correctCount: Math.round((percentage / 100) * 25),
          incorrectCount: 25 - Math.round((percentage / 100) * 25),
          scorePercentage: percentage,
          passed,
          submittedAt: app.lastTestAttemptDate || app.appliedDate || new Date().toLocaleDateString('en-IN'),
          submittedIso: (normEmail && localStorage.getItem(`itpl_test_result_ts_${normEmail}`)) || undefined,
          userAnswers: {},
        };
        return {
          summary: synthesized,
          score: percentage,
          finished: true,
        };
      }

      // 4. Fallback to generic localStorage test completed
      if (localStorage.getItem('itpl_test_completed') === 'true') {
        const s = localStorage.getItem('itpl_test_score');
        return {
          summary: null,
          score: s ? parseInt(s, 10) : 0,
          finished: true,
        };
      }
    } catch {
      // ignore
    }
    return { summary: null, score: 0, finished: false };
  };

  const initialSavedTest = (() => {
    try {
      const savedUserStr = localStorage.getItem('itpl_candidate_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        return getSavedCandidateTest(u.email, undefined, u.name);
      }
    } catch {
      // ignore
    }
    return { summary: null, score: 0, finished: false };
  })();

  // Aptitude test state
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState<boolean>(() => initialSavedTest.finished);
  const [isTestLocked, setIsTestLocked] = useState<boolean>(() => initialSavedTest.finished);
  const [testSummary, setTestSummary] = useState<TestSubmissionSummary | null>(() => initialSavedTest.summary);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const [testScore, setTestScore] = useState<number>(() => initialSavedTest.score);

  // Anti-Cheat / Proctored Tab-Switch Monitoring States
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningTitle, setWarningTitle] = useState<string>('');
  const [warningDesc, setWarningDesc] = useState<string>('');
  const [isAutoSubmittedViolation, setIsAutoSubmittedViolation] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itpl_test_violation') === 'true';
    } catch {
      return false;
    }
  });
  const [isAutoSubmittedTimeout, setIsAutoSubmittedTimeout] = useState<boolean>(false);

  const tabSwitchCountRef = useRef(0);
  const lastViolationTimeRef = useRef(0);

  // Check for prior submission to prevent duplicate attempts for the logged-in candidate
  useEffect(() => {
    try {
      const email = profile.email;
      const candId = profile.candidateId;
      const saved = getSavedCandidateTest(email, candId, profile.name);

      if (saved.finished) {
        setTestFinished(true);
        setIsTestLocked(true);
        setTestScore(saved.score);
        if (saved.summary) {
          setTestSummary(saved.summary);
        }
        localStorage.setItem('itpl_test_completed', 'true');
        localStorage.setItem('itpl_test_score', saved.score.toString());
        if (saved.summary) {
          localStorage.setItem('itpl_test_summary', JSON.stringify(saved.summary));
          const normEmail = (email || '').toLowerCase().trim();
          if (normEmail) {
            localStorage.setItem(`itpl_cand_test_${normEmail}`, JSON.stringify(saved.summary));
            localStorage.setItem(`itpl_cand_test_completed_${normEmail}`, 'true');
          }
        }
      }
    } catch {
      // ignore
    }
  }, [profile]);

  // Mark current question as visited whenever active index changes while test is underway
  useEffect(() => {
    if (testStarted) {
      setVisitedQuestions((prev) => ({
        ...prev,
        [currentQuestionIndex]: true,
      }));
    }
  }, [currentQuestionIndex, testStarted]);

  // Live Timer countdown and auto-submission
  useEffect(() => {
    if (!testStarted || testFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(false, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, testFinished, userAnswers, profile]);

  // PROCTORED TAB SWITCH DETECTION ENGINE
  useEffect(() => {
    if (!testStarted || testFinished) return;

    const triggerTabViolation = () => {
      const now = Date.now();
      // Debounce minimum 1.5 seconds so rapid blur/focus counts as 1 violation
      if (now - lastViolationTimeRef.current < 1500) return;
      lastViolationTimeRef.current = now;

      tabSwitchCountRef.current += 1;
      const count = tabSwitchCountRef.current;
      setTabSwitchWarnings(count);

      if (count === 1) {
        setWarningTitle('⚠️ Warning 1 of 3: Tab Switch Detected!');
        setWarningDesc(
          'You navigated away from the proctored test window. Switching tabs, opening search engines, or minimizing the browser is strictly prohibited. You have 2 warnings remaining before auto-submission.'
        );
        setShowWarningModal(true);
      } else if (count === 2) {
        setWarningTitle('🚨 Warning 2 of 3: Critical Violation!');
        setWarningDesc(
          'Tab switch detected again! This is your FINAL warning. If you navigate away one more time, your assessment will be immediately terminated and auto-submitted.'
        );
        setShowWarningModal(true);
      } else if (count >= 3) {
        // 3rd violation: Auto submit the test immediately!
        setShowWarningModal(false);
        handleSubmitTest(true, false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerTabViolation();
      }
    };

    const handleWindowBlur = () => {
      triggerTabViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [testStarted, testFinished, userAnswers, profile]);

  const handleStartTest = () => {
    if (isTestLocked) return;
    setTestStarted(true);
    setTestFinished(false);
    setTimeLeft(TEST_DURATION_SECONDS);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setVisitedQuestions({ 0: true });
    setTabSwitchWarnings(0);
    tabSwitchCountRef.current = 0;
    lastViolationTimeRef.current = 0;
    setIsAutoSubmittedViolation(false);
    setIsAutoSubmittedTimeout(false);
    setShowWarningModal(false);
    setShowConfirmSubmitModal(false);
    try {
      localStorage.removeItem('itpl_test_violation');
      localStorage.removeItem('itpl_test_completed');
      localStorage.removeItem('itpl_test_score');
      localStorage.removeItem('itpl_test_summary');
    } catch {
      // ignore
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
    setVisitedQuestions((prev) => ({
      ...prev,
      [qIndex]: true,
    }));
  };

  const handleClearAnswer = (qIndex: number) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qIndex];
      return copy;
    });
  };

  const handleJumpQuestion = (qIndex: number) => {
    setCurrentQuestionIndex(qIndex);
    setVisitedQuestions((prev) => ({
      ...prev,
      [qIndex]: true,
    }));
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(APTITUDE_QUESTIONS.length - 1, prev + 1));
  };

  const handleSubmitTest = (wasViolation = false, wasTimeout = false) => {
    let correctCount = 0;
    let attempted = 0;
    APTITUDE_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] !== undefined) {
        attempted++;
        if (userAnswers[idx] === q.correct) {
          correctCount++;
        }
      }
    });

    const totalQuestions = APTITUDE_QUESTIONS.length;
    const unanswered = totalQuestions - attempted;
    const incorrectCount = attempted - correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 60;
    const nowStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const summary: TestSubmissionSummary = {
      candidateId: profile.candidateId,
      candidateName: profile.name,
      candidateEmail: profile.email,
      totalQuestions,
      attemptedCount: attempted,
      unansweredCount: unanswered,
      correctCount,
      incorrectCount,
      scorePercentage: percentage,
      passed,
      submittedAt: nowStr,
      submittedIso: new Date().toISOString(),
      userAnswers: { ...userAnswers },
      wasTimeout,
      wasViolation,
    };

    setTestSummary(summary);
    setTestScore(percentage);
    setTestFinished(true);
    setTestStarted(false);
    setIsTestLocked(true);
    setShowWarningModal(false);
    setShowConfirmSubmitModal(false);

    if (wasViolation) {
      setIsAutoSubmittedViolation(true);
    }
    if (wasTimeout) {
      setIsAutoSubmittedTimeout(true);
    }

    try {
      localStorage.setItem('itpl_test_completed', 'true');
      localStorage.setItem('itpl_test_score', percentage.toString());
      localStorage.setItem('itpl_test_summary', JSON.stringify(summary));
      // Persist ISO submission timestamp for 3-month cooldown (fail case)
      const submittedIso = summary.submittedIso || new Date().toISOString();
      localStorage.setItem('itpl_test_result_ts', submittedIso);
      localStorage.setItem('itpl_test_result_passed', passed.toString());
      const normEmail = profile.email?.toLowerCase().trim();
      if (normEmail) {
        localStorage.setItem(`itpl_test_result_ts_${normEmail}`, submittedIso);
        localStorage.setItem(`itpl_test_result_passed_${normEmail}`, passed.toString());
        localStorage.setItem(`itpl_cand_test_${normEmail}`, JSON.stringify(summary));
        localStorage.setItem(`itpl_cand_test_completed_${normEmail}`, 'true');
      }
      if (profile.email) {
        localStorage.setItem(`itpl_test_result_ts_${profile.email}`, submittedIso);
        localStorage.setItem(`itpl_test_result_passed_${profile.email}`, passed.toString());
        localStorage.setItem(`itpl_cand_test_${profile.email}`, JSON.stringify(summary));
        localStorage.setItem(`itpl_cand_test_completed_${profile.email}`, 'true');
      }
      if (profile.candidateId) {
        localStorage.setItem(`itpl_cand_test_${profile.candidateId}`, JSON.stringify(summary));
        localStorage.setItem(`itpl_cand_test_completed_${profile.candidateId}`, 'true');
      }
      if (wasViolation) {
        localStorage.setItem('itpl_test_violation', 'true');
      } else {
        localStorage.removeItem('itpl_test_violation');
      }

      adminDb.saveCandidateTestResult(
        {
          candidateId: profile.candidateId,
          candidateName: profile.name,
          candidateEmail: profile.email,
        },
        {
          testPercentage: percentage,
          testStatus: passed ? 'Passed' : 'Failed',
          totalQuestions,
          attemptedCount: attempted,
          unansweredCount: unanswered,
          correctCount,
          wasTimeout,
          wasViolation,
        }
      );
    } catch {
      // ignore
    }
  };

  // ── 3-Month Retake Cooldown Logic ────────────────────────────────────────
  const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90 days = 3 months

  const getRetakeInfo = (): { eligible: boolean; retakeDate: Date | null; passed: boolean | null; daysLeft: number } => {
    try {
      const email = profile.email;
      const normEmail = (email || '').toLowerCase().trim();
      const tsRaw =
        (normEmail && localStorage.getItem(`itpl_test_result_ts_${normEmail}`)) ||
        (email && localStorage.getItem(`itpl_test_result_ts_${email}`)) ||
        localStorage.getItem('itpl_test_result_ts') ||
        testSummary?.submittedIso;

      let didPass: boolean | null = null;
      if (testSummary) {
        didPass = testSummary.passed;
      } else {
        const passedRaw =
          (normEmail && localStorage.getItem(`itpl_test_result_passed_${normEmail}`)) ||
          (email && localStorage.getItem(`itpl_test_result_passed_${email}`)) ||
          localStorage.getItem('itpl_test_result_passed');
        if (passedRaw !== null) {
          didPass = passedRaw === 'true';
        } else if (testFinished) {
          didPass = testScore >= 60;
        }
      }

      if (didPass === true) {
        return { eligible: false, retakeDate: null, passed: true, daysLeft: 0 };
      }
      if (didPass === false) {
        let submittedAt: Date;
        if (tsRaw) {
          submittedAt = new Date(tsRaw);
        } else if (testSummary?.submittedAt) {
          submittedAt = new Date(testSummary.submittedAt);
        } else {
          submittedAt = new Date();
        }
        if (isNaN(submittedAt.getTime())) {
          submittedAt = new Date();
        }
        const retakeDate = new Date(submittedAt.getTime() + THREE_MONTHS_MS);
        const now = Date.now();
        const eligible = now >= retakeDate.getTime();
        const msLeft = Math.max(0, retakeDate.getTime() - now);
        const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
        return { eligible, retakeDate, passed: false, daysLeft };
      }
      return { eligible: false, retakeDate: null, passed: null, daysLeft: 0 };
    } catch {
      return { eligible: false, retakeDate: null, passed: null, daysLeft: 0 };
    }
  };

  const retakeInfo = getRetakeInfo();

  // Candidate failed state: failed test and not cleared
  const isCandidateFailed =
    (testFinished && (testSummary ? !testSummary.passed : testScore < 60)) ||
    retakeInfo.passed === false;

  // Reapply handler: allowed only when 3 months cooldown has passed
  const handleReapply = () => {
    try {
      const email = profile.email;
      const normEmail = (email || '').toLowerCase().trim();
      if (normEmail) {
        localStorage.removeItem(`itpl_test_result_ts_${normEmail}`);
        localStorage.removeItem(`itpl_test_result_passed_${normEmail}`);
        localStorage.removeItem(`itpl_cand_test_${normEmail}`);
        localStorage.removeItem(`itpl_cand_test_completed_${normEmail}`);
      }
      if (email) {
        localStorage.removeItem(`itpl_test_result_ts_${email}`);
        localStorage.removeItem(`itpl_test_result_passed_${email}`);
        localStorage.removeItem(`itpl_cand_test_${email}`);
        localStorage.removeItem(`itpl_cand_test_completed_${email}`);
      }
      if (profile.candidateId) {
        localStorage.removeItem(`itpl_cand_test_${profile.candidateId}`);
        localStorage.removeItem(`itpl_cand_test_completed_${profile.candidateId}`);
      }
      localStorage.removeItem('itpl_test_result_ts');
      localStorage.removeItem('itpl_test_result_passed');
      localStorage.removeItem('itpl_test_completed');
      localStorage.removeItem('itpl_test_score');
      localStorage.removeItem('itpl_test_summary');
      localStorage.removeItem('itpl_test_violation');
    } catch {
      // ignore
    }
    setIsTestLocked(false);
    setTestFinished(false);
    setTestSummary(null);
    setTestScore(0);
    setUserAnswers({});
    setVisitedQuestions({ 0: true });
    setCurrentQuestionIndex(0);
    setTimeLeft(TEST_DURATION_SECONDS);
    setActiveTab('aptitude');
  };

  // Guard: if candidate failed, hide and block documents tab immediately
  useEffect(() => {
    if (isCandidateFailed && activeTab === 'documents') {
      setActiveTab('aptitude');
    }
  }, [isCandidateFailed, activeTab]);
  // ─────────────────────────────────────────────────────────────────────────

  const getQuestionStatus = (idx: number): 'answered' | 'not_answered' | 'not_visited' => {
    if (userAnswers[idx] !== undefined) return 'answered';
    if (visitedQuestions[idx]) return 'not_answered';
    return 'not_visited';
  };

  const answeredCount = Object.keys(userAnswers).length;
  const notAnsweredCount = APTITUDE_QUESTIONS.filter(
    (_, idx) => visitedQuestions[idx] && userAnswers[idx] === undefined
  ).length;
  const notVisitedCount = APTITUDE_QUESTIONS.filter(
    (_, idx) => !visitedQuestions[idx] && userAnswers[idx] === undefined
  ).length;
  const liveUnansweredCount = APTITUDE_QUESTIONS.length - answeredCount;

  const handleSignOut = () => {
    try {
      localStorage.removeItem('itpl_candidate_user');
      localStorage.removeItem('itpl_candidate_docs');
      localStorage.removeItem('itpl_test_completed');
      localStorage.removeItem('itpl_test_score');
      localStorage.removeItem('itpl_test_violation');
      localStorage.removeItem('itpl_test_summary');
    } catch {
      // ignore
    }
    navigate('/');
  };

  // Upload handler for documents
  const handleUploadFile = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const updatedDoc = {
            ...doc,
            fileName: file.name,
            fileSize: `${sizeInMb} MB`,
            uploadedAt: nowStr,
            status: 'under_review' as const,
            verifierNotes: 'Document uploaded successfully. Queueing for verification.',
          };
          saveCandidateDocumentFirestore(profile.candidateId, updatedDoc).catch(() => {});
          return updatedDoc;
        }
        return doc;
      })
    );
  };

  // Immediate HR verification simulator action
  const handleVerifyDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'verified',
            verifiedBy: 'ITPL Verification Officer',
            verifierNotes: 'All authenticity checks completed successfully.',
          };
        }
        return doc;
      })
    );
  };

  // Remove document
  const handleRemoveDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileName: undefined,
            fileSize: undefined,
            uploadedAt: undefined,
            status: 'pending',
            verifierNotes: undefined,
            verifiedBy: undefined,
          };
        }
        return doc;
      })
    );
  };

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const totalRequired = documents.filter((d) => d.required).length;

  return (
    <div className="w-full bg-[#FAF8FF] min-h-screen pb-20">
      {/* ======================================================= */}
      {/* PROCTORED TAB SWITCH WARNING MODAL (ANTI-CHEAT) */}
      {/* ======================================================= */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-bounce-header">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border-2 border-red-500 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center border border-red-200">
              <span className="material-symbols-outlined text-4xl animate-pulse">warning</span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    tabSwitchWarnings >= 1 ? 'bg-red-500 ring-2 ring-red-300' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full ${
                    tabSwitchWarnings >= 2 ? 'bg-red-500 ring-2 ring-red-300' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full ${
                    tabSwitchWarnings >= 3 ? 'bg-red-500 ring-2 ring-red-300' : 'bg-slate-200'
                  }`}
                />
              </div>
              <h3 className="text-xl font-black text-slate-900">{warningTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{warningDesc}</p>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-[11px] text-red-800 font-semibold text-left">
              <strong>Proctoring Notice:</strong> Full-screen focus is mandatory. 3rd violation results in automatic test submission with no re-attempt.
            </div>

            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>I Understand &amp; Resume Test</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TEST SUBMISSION CONFIRMATION MODAL */}
      {/* ======================================================= */}
      {showConfirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-bounce-header">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#232884] mx-auto flex items-center justify-center border border-indigo-100">
              <span className="material-symbols-outlined text-4xl">fact_check</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0E1538]">Confirm Assessment Submission</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Please review your test status before finalizing your submission.
              </p>
            </div>

            {/* Assessment stats grid in popup */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="block text-[11px] font-bold text-slate-500 uppercase">Total MCQs</span>
                <span className="text-lg font-black text-[#0E1538]">{APTITUDE_QUESTIONS.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
                <span className="block text-[11px] font-bold text-emerald-800 uppercase">Attempted</span>
                <span className="text-lg font-black text-emerald-700">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
                <span className="block text-[11px] font-bold text-amber-850 uppercase">Unanswered</span>
                <span className="text-lg font-black text-amber-700">{liveUnansweredCount}</span>
              </div>
            </div>

            {liveUnansweredCount > 0 ? (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold text-left flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Attention:</strong> You have {liveUnansweredCount} unanswered question(s). Once submitted, answers cannot be edited or retaken.
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold text-left flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong>All Questions Attempted!</strong> You have answered all {APTITUDE_QUESTIONS.length} questions.
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(false)}
                className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={() => handleSubmitTest(false, false)}
                className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-[#232884] to-[#3D48C8] hover:from-[#1b2685] hover:to-[#2e379d] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Yes, Submit Now</span>
                <span className="material-symbols-outlined text-base">check</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        badge="ITPL Assessment Center"
        title="ONLINE APTITUDE &amp;"
        highlightedText="TECHNICAL ASSESSMENT"
        description="Complete your proctored assessment to qualify for upcoming technical interview rounds with Infoyashonand Technology Pvt. Ltd."
        breadcrumbCurrent="Aptitude Test"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        {/* Top Profile Card Banner */}
        <div className="bg-gradient-to-r from-[#00113a] via-[#1b2685] to-[#232884] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Candidate Identity */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-[#00113a] font-extrabold text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white/20">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Candidate #{profile.candidateId}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  {profile.appliedRole} • Applied on {profile.appliedDate}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2 text-xs text-slate-300 font-mono-tech">
                  {profile.email && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-amber-400">mail</span>
                      {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-amber-400">call</span>
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Pill Action */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/15 text-center">
                <span className="block text-[10px] uppercase tracking-wider text-slate-300 font-bold">Aptitude Test</span>
                <span className={`text-sm sm:text-base font-black ${
                  isCandidateFailed ? 'text-red-400' : testFinished ? 'text-emerald-400' : 'text-amber-300'
                }`}>
                  {isCandidateFailed ? 'Not Cleared' : testFinished ? 'Submitted' : 'Pending'}
                </span>
              </div>
              {isCandidateFailed && (
                <div className="bg-red-500/20 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-red-400/30 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-red-200 font-bold">Status</span>
                  <span className="text-sm sm:text-base font-black text-red-300">
                    Not Cleared
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500/30 hover:border-red-400/50 border border-white/20 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 self-center"
                title="Sign out from candidate session"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* DIRECT ONLINE APTITUDE ASSESSMENT */}
        {/* ============================================================ */}
        
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            {!testStarted && !testFinished && (
              <div className="max-w-2xl mx-auto text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#232884] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <span className="material-symbols-outlined text-3xl">timer</span>
                </div>
                <h3 className="text-2xl font-black text-[#0E1538] mb-2">Online Aptitude &amp; Technical Assessment</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-6">
                  This proctored assessment evaluates quantitative reasoning, logical problem solving, technical foundations, and verbal ability.
                </p>

                {/* If candidate already has locked submission */}
                {isTestLocked ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 text-left mb-6 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#0E1538]">
                      <span className="material-symbols-outlined text-amber-600 text-xl">lock</span>
                      <span>Assessment Already Completed</span>
                    </div>
                    {/* Show 3-month cooldown info for failed candidates */}
                    {retakeInfo.passed === false && retakeInfo.retakeDate && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{retakeInfo.eligible ? 'Cooldown Completed: Reapplication Open' : 'Retake Restriction: 3-Month Cooling Period'}</span>
                        </div>
                        <p>
                          You did not clear this assessment. As per ITPL policy, candidates who fail must wait <strong>3 months</strong> before reapplying. All further options, including document upload, are locked.
                        </p>
                        <p className="font-semibold">
                          Earliest retake eligible date:{' '}
                          <span className="text-red-900">
                            {retakeInfo.retakeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          {!retakeInfo.eligible && (
                            <span className="ml-2 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                              {retakeInfo.daysLeft} days remaining
                            </span>
                          )}
                        </p>
                        {retakeInfo.eligible && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleReapply}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">refresh</span>
                              <span>Reapply Now &amp; Start Fresh Assessment</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {retakeInfo.passed === true && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        You have already submitted this assessment. To prevent duplicate submissions and protect evaluation integrity, retakes are restricted.
                      </p>
                    )}
                    {retakeInfo.passed === null && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        You have already submitted this assessment. To prevent duplicate submissions and protect evaluation integrity, retakes are restricted.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setTestFinished(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#232884] hover:bg-[#1b2685] text-white font-bold text-xs shadow-sm cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>View Your Assessment Result</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Anti-cheat proctoring notice */}
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left mb-6 text-xs text-red-900 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                        <span className="material-symbols-outlined text-lg">shield</span>
                        <span>Proctored Test Security Guidelines</span>
                      </div>
                      <p>• <strong>Strict Tab-Switching Restriction:</strong> Do not switch browser tabs, open other applications, or minimize this window.</p>
                      <p>• <strong>3-Warning Limit:</strong> On the <strong>3rd violation</strong>, your assessment will be <strong>automatically submitted</strong> immediately.</p>
                      <p>• <strong>Countdown Timer:</strong> The assessment is timed for 25 minutes. If time expires, your answers will automatically submit.</p>
                      <p>• <strong>Single Attempt:</strong> Once submitted, your score is permanently recorded and duplicate submissions are blocked.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-left">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="block text-[11px] text-slate-500 font-bold uppercase">Duration</span>
                        <span className="text-sm font-black text-[#0E1538]">25 Minutes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="block text-[11px] text-slate-500 font-bold uppercase">Questions</span>
                        <span className="text-sm font-black text-[#0E1538]">25 MCQs</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="block text-[11px] text-slate-500 font-bold uppercase">Passing Score</span>
                        <span className="text-sm font-black text-emerald-600">60%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="block text-[11px] text-slate-500 font-bold uppercase">Negative Mark</span>
                        <span className="text-sm font-black text-slate-700">None</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartTest}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#232884] to-[#3D48C8] text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Start Assessment Now</span>
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {testStarted && !testFinished && (
              <div>
                {/* Test Top Bar with Live Timer, Warnings Counter, and Submit Shortcut */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Question {currentQuestionIndex + 1} of {APTITUDE_QUESTIONS.length}
                        </span>
                        {/* Current Question Status Pill */}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            getQuestionStatus(currentQuestionIndex) === 'answered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {getQuestionStatus(currentQuestionIndex) === 'answered' ? 'check_circle' : 'pending'}
                          </span>
                          <span>
                            {getQuestionStatus(currentQuestionIndex) === 'answered' ? 'Answered' : 'Not Answered'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          APTITUDE_QUESTIONS[currentQuestionIndex].category === 'Quantitative'
                            ? 'bg-blue-100 text-blue-800'
                            : APTITUDE_QUESTIONS[currentQuestionIndex].category === 'Logical'
                            ? 'bg-purple-100 text-purple-800'
                            : APTITUDE_QUESTIONS[currentQuestionIndex].category === 'Technical'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {APTITUDE_QUESTIONS[currentQuestionIndex].category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Proctoring Tab Warnings Badge */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        tabSwitchWarnings === 0
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : tabSwitchWarnings === 1
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-900 border-red-400 font-extrabold animate-bounce'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {tabSwitchWarnings > 0 ? 'warning' : 'security'}
                      </span>
                      <span>Tab Warnings: {tabSwitchWarnings} / 3</span>
                    </div>

                    {/* Live Countdown Timer Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border font-mono text-sm font-black transition-all ${
                        timeLeft < 300
                          ? 'bg-red-100 border-red-400 text-red-800 animate-pulse'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {timeLeft < 300 ? 'alarm_on' : 'alarm'}
                      </span>
                      <span>
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmitModal(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Submit Test</span>
                    </button>
                  </div>
                </div>

                {/* Anti-cheat banner reminder */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-medium mb-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-amber-600 shrink-0">info</span>
                    <span>
                      <strong>Proctoring Active:</strong> Do not navigate away from this screen. Leaving 3 times will trigger instant auto-submission.
                    </span>
                  </div>
                  {timeLeft < 300 && (
                    <span className="font-bold text-red-700 text-[11px] animate-pulse">
                      ⏳ Less than 5 minutes remaining!
                    </span>
                  )}
                </div>

                {/* Main Content Layout: Question Area (Left) + Question Palette (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Active Question Box & Navigation */}
                  <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                        <span className="text-xs font-black text-[#232884] uppercase tracking-wider">
                          Question {currentQuestionIndex + 1}
                        </span>
                        {userAnswers[currentQuestionIndex] !== undefined && (
                          <button
                            type="button"
                            onClick={() => handleClearAnswer(currentQuestionIndex)}
                            className="text-[11px] text-slate-500 hover:text-red-600 font-semibold cursor-pointer underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">backspace</span>
                            <span>Clear Response</span>
                          </button>
                        )}
                      </div>

                      <p className="text-sm sm:text-base font-semibold text-[#111A3A] mb-5 leading-relaxed">
                        {APTITUDE_QUESTIONS[currentQuestionIndex].question}
                      </p>

                      {/* 4 Options Grid */}
                      <div className="space-y-3">
                        {APTITUDE_QUESTIONS[currentQuestionIndex].options.map((opt, optIdx) => {
                          const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(currentQuestionIndex, optIdx)}
                              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-[#232884] text-[#232884] font-bold shadow-xs ring-1 ring-[#232884]'
                                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                                    isSelected
                                      ? 'border-[#232884] bg-[#232884] text-white'
                                      : 'border-slate-300 text-slate-600 bg-slate-50'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && (
                                <span className="material-symbols-outlined text-lg text-[#232884]">
                                  check_circle
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Question Controls: Previous, Jump Indicator, Next */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrevQuestion}
                        className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                        <span>Previous</span>
                      </button>

                      <div className="text-xs font-bold text-slate-500">
                        {currentQuestionIndex + 1} / {APTITUDE_QUESTIONS.length}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentQuestionIndex < APTITUDE_QUESTIONS.length - 1 ? (
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#232884] hover:bg-[#1b2685] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <span>Next Question</span>
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowConfirmSubmitModal(true)}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <span>Submit Assessment</span>
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Question Navigation Panel / Palette */}
                  <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                        <h4 className="font-extrabold text-[#0E1538] text-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-[#232884]">grid_view</span>
                          <span>Question Navigation Panel</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          {APTITUDE_QUESTIONS.length} Total
                        </span>
                      </div>

                      {/* Status Legend */}
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] mb-4 p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
                          <span className="font-medium text-slate-700">Answered ({answeredCount})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="font-medium text-slate-700">Not Ans. ({notAnsweredCount})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400 shrink-0"></span>
                          <span className="font-medium text-slate-700">Not Visited ({notVisitedCount})</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Attempt Progress</span>
                          <span>{Math.round((answeredCount / APTITUDE_QUESTIONS.length) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${(answeredCount / APTITUDE_QUESTIONS.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Question Palette Grid (Click to Jump Directly) */}
                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {APTITUDE_QUESTIONS.map((_, qIdx) => {
                          const status = getQuestionStatus(qIdx);
                          const isCurrent = currentQuestionIndex === qIdx;

                          let bgClasses = 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';
                          if (status === 'answered') {
                            bgClasses = 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 font-bold';
                          } else if (status === 'not_answered') {
                            bgClasses = 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 font-bold';
                          }

                          return (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => handleJumpQuestion(qIdx)}
                              className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${bgClasses} ${
                                isCurrent
                                  ? 'ring-3 ring-[#232884] ring-offset-2 scale-105 shadow-md font-black z-10'
                                  : ''
                              }`}
                              title={`Question ${qIdx + 1}: ${
                                status === 'answered'
                                  ? 'Answered'
                                  : status === 'not_answered'
                                  ? 'Not Answered'
                                  : 'Not Visited'
                              }`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmitModal(true)}
                      className="w-full py-3 rounded-xl bg-[#232884] hover:bg-[#1b2685] text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-4"
                    >
                      <span className="material-symbols-outlined text-sm">fact_check</span>
                      <span>Finish &amp; Submit Assessment</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {testFinished && (
              <div className="py-6 max-w-4xl mx-auto space-y-6">
                {/* Auto-submission alert banner if terminated due to violations */}
                {isAutoSubmittedViolation && (
                  <div className="p-4 rounded-2xl bg-red-100 border border-red-300 text-red-900 flex items-start gap-3 text-left">
                    <span className="material-symbols-outlined text-2xl text-red-600 shrink-0 mt-0.5">cancel</span>
                    <div>
                      <h4 className="font-bold text-sm">Assessment Auto-Submitted: Proctoring Violation</h4>
                      <p className="text-xs text-red-800 mt-0.5">
                        You switched away from the assessment window 3 times. The test was terminated and automatically submitted based on attempted questions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Auto-submission alert banner if terminated due to timeout */}
                {isAutoSubmittedTimeout && (
                  <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-start gap-3 text-left">
                    <span className="material-symbols-outlined text-2xl text-amber-600 shrink-0 mt-0.5">timer_off</span>
                    <div>
                      <h4 className="font-bold text-sm">Assessment Auto-Submitted: Time Expired</h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Your 25-minute assessment timer ended. Your answers were automatically finalized and saved.
                      </p>
                    </div>
                  </div>
                )}

                {/* Result Hero Header */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-100 text-emerald-600 shadow-xs">
                    <span className="material-symbols-outlined text-4xl">
                      verified
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#0E1538] mb-1.5">
                    Assessment Submitted Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                    Your aptitude assessment has been finalized and recorded with the ITPL evaluation cell.
                  </p>
                </div>

                {/* Performance Summary Grid: Total, Attempted, Unanswered Only */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-xs">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Total Questions
                    </span>
                    <span className="text-3xl font-black text-[#0E1538]">
                      {testSummary ? testSummary.totalQuestions : APTITUDE_QUESTIONS.length}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center shadow-xs">
                    <span className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                      Attempted Questions
                    </span>
                    <span className="text-3xl font-black text-[#232884]">
                      {testSummary ? testSummary.attemptedCount : answeredCount}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-xs">
                    <span className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                      Unanswered Questions
                    </span>
                    <span className="text-3xl font-black text-amber-700">
                      {testSummary
                        ? testSummary.unansweredCount
                        : APTITUDE_QUESTIONS.length - answeredCount}
                    </span>
                  </div>
                </div>

                {/* Candidate & Evaluation Record */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-[#0E1538]">Candidate Evaluation Record</div>
                    <div className="text-slate-600">
                      Candidate: <strong>{profile.name}</strong> ({profile.candidateId}) • {profile.email}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Submitted: {testSummary?.submittedAt || new Date().toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Status: Submitted</span>
                    </span>
                  </div>
                </div>

                {/* Duplicate Submission Lock Notice (Requirement 8) */}
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-slate-600 shrink-0">lock</span>
                  <span>
                    <strong>Assessment Locked:</strong> Your test submission has been recorded. Duplicate submissions for this assessment are prohibited to preserve testing standards.
                  </span>
                </div>

                {/* Action Buttons — pass/fail specific */}
                {testSummary?.passed ? (
                  /* PASSED: proceed normally */
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <div className="space-y-4 pt-2">
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-base">
                        <span className="material-symbols-outlined text-emerald-600 text-xl">verified</span>
                        <span>Assessment Cleared Successfully!</span>
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed max-w-xl mx-auto">
                        Congratulations! You scored <strong>{testSummary?.scorePercentage}%</strong> and cleared the assessment. Your evaluation has been recorded and submitted to the recruitment team. Our HR panel will contact you for the technical interview round.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Link
                        to="/"
                        className="px-6 py-2.5 rounded-xl bg-[#232884] text-white text-xs sm:text-sm font-bold hover:bg-[#1b2685] cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">home</span>
                        <span>Return to Home</span>
                      </Link>
                      <a
                        href="https://wa.me/918055514368?text=Hello%20ITPL,%20I%20have%20cleared%20the%20aptitude%20test."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <img
                          src="/live_assets/whatsapp-icon.png"
                          alt="WhatsApp"
                          className="w-4 h-4 object-contain shrink-0"
                        />
                        <span>Contact HR on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                  </div>
                ) : (
                  /* FAILED: show 3-month cooldown notice — reapplication only after 3 months */
                  <div className="space-y-4 pt-2">
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-left space-y-3">
                      <div className="flex items-center gap-2 font-black text-base text-red-800">
                        <span className="material-symbols-outlined text-xl text-red-600">sentiment_dissatisfied</span>
                        <span>Assessment Not Cleared</span>
                      </div>
                      <p className="text-xs text-red-700 leading-relaxed">
                        Unfortunately, you did not achieve the minimum passing score of <strong>60%</strong> required to clear this assessment.
                        As per ITPL selection policy, candidates who do not clear the aptitude test must wait <strong>3 months</strong> before reapplying.
                      </p>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-amber-600">lock</span>
                        <span>
                          <strong>Further Options Locked:</strong> All further application options (including document upload and technical interviews) have been hidden.
                        </span>
                      </div>
                      {retakeInfo.retakeDate && (
                        <div className="p-3 rounded-xl bg-white border border-red-200 text-xs font-semibold text-red-900 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-red-500">calendar_month</span>
                            <span>
                              You may reapply from:{' '}
                              <strong>
                                {retakeInfo.retakeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </strong>
                            </span>
                          </div>
                          {!retakeInfo.eligible && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                              {retakeInfo.daysLeft} days remaining
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-red-600">
                        We encourage you to use this time to strengthen your quantitative, logical, and technical skills. Our WhatsApp coordinator can guide you with resources.
                      </p>
                    </div>

                    {/* Reapplication allowed only after 3 months */}
                    {retakeInfo.eligible ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm">
                          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                          <span>3-Month Cooling Period Concluded</span>
                        </div>
                        <p className="text-xs text-emerald-700">
                          You are now eligible to submit a new application and retake the online aptitude assessment.
                        </p>
                        <button
                          type="button"
                          onClick={handleReapply}
                          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          <span>Reapply Now &amp; Start Fresh Assessment</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-500 text-xs font-bold flex items-center gap-2 cursor-not-allowed select-none">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span>Reapplication Allowed Only After 3 Months</span>
                        </div>
                        <a
                          href="https://wa.me/918055514368?text=Hello%20ITPL,%20I%20need%20guidance%20after%20failing%20the%20aptitude%20test."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                        >
                          <img
                            src="/live_assets/whatsapp-icon.png"
                            alt="WhatsApp"
                            className="w-4 h-4 object-contain shrink-0"
                          />
                          <span>Contact ITPL on WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

      </div>
    </div>
  );
};
