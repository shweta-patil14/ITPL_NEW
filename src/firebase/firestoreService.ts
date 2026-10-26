import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  ApplicationItem,
  EmployeeMember,
  OfferLetterRecord,
  InternshipRecord,
  AttendanceRecord,
  CertificateRecord,
  TechnicalInterviewScore,
  HrInterviewScore,
} from '../services/adminDb';

// Collection references — single source of truth
export const COLLECTIONS = {
  APPLICATIONS: 'itpl_applications',
  CANDIDATES: 'itpl_candidates',
  TEST_RESULTS: 'itpl_test_results',
  DOCUMENTS: 'itpl_documents',
  OFFERS: 'itpl_offers',
  INTERNSHIPS: 'itpl_internships',
  EMPLOYEES: 'itpl_employees',
  ATTENDANCE: 'itpl_attendance',
  CERTIFICATES: 'itpl_certificates',
  OUR_TEAM: 'itpl_our_team',
  INQUIRIES: 'itpl_inquiries',
  SERVICES: 'itpl_services',
  PORTFOLIO: 'itpl_portfolio',
  TESTIMONIALS: 'itpl_testimonials',
  PROGRAMS: 'itpl_programs',
  COURSES: 'itpl_courses',
  CLIENT_PARTNERS: 'itpl_client_partners',
  ADMIN_PROFILES: 'itpl_admin_profiles',
} as const;

// ============================================================================
// HELPER — safe guard repeated across every operation
// ============================================================================

function isReady(): boolean {
  return Boolean(db && isFirebaseConfigured);
}

/**
 * Recursively strips undefined fields from an object so Firestore setDoc/updateDoc
 * will never fail with "Unsupported field value: undefined"
 */
export function cleanForFirestore<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanForFirestore(item) : item)) as any;
  }
  if (typeof obj === 'object') {
    // Preserve FieldValue (e.g. serverTimestamp()) and Date instances
    if (obj instanceof Date || (obj.constructor && obj.constructor.name === 'FieldValue')) {
      return obj;
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          result[key] = cleanForFirestore(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
  return obj;
}

// ============================================================================
// APPLICATIONS SERVICE
// ============================================================================

export async function createApplicationFirestore(app: ApplicationItem): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.APPLICATIONS, app.id);
    const cleaned = cleanForFirestore({
      ...app,
      createdAtIso: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(docRef, cleaned, { merge: true });
    console.log('✅ [Firestore] Application saved:', app.id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error creating application:', error);
    return false;
  }
}

export async function getApplicationsFirestore(): Promise<ApplicationItem[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.APPLICATIONS);
    const snap = await getDocs(colRef);
    const results: ApplicationItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      // Strip Firestore-only timestamp fields before returning
      const { createdAt, updatedAt, ...rest } = data as any;
      results.push(rest as ApplicationItem);
    });
    console.log('✅ [Firestore] Fetched applications:', results.length);
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error getting applications:', error);
    return null;
  }
}

export async function updateApplicationFirestore(
  appId: string,
  updates: Partial<ApplicationItem> & { notes?: string[] }
): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.APPLICATIONS, appId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Document doesn't exist yet — create it
      await setDoc(docRef, {
        ...updates,
        id: appId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error updating application:', error);
    return false;
  }
}

export async function updateApplicationStageFirestore(
  appId: string,
  stage: ApplicationItem['stage'],
  note?: string
): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.APPLICATIONS, appId);
    const docSnap = await getDoc(docRef);
    const currentNotes: string[] = (docSnap.exists() && docSnap.data().notes) || [];
    if (note) currentNotes.unshift(note);

    if (!docSnap.exists()) {
      // Document was not seeded yet — create a minimal record
      await setDoc(docRef, {
        id: appId,
        stage,
        notes: currentNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        stage,
        notes: currentNotes,
        updatedAt: serverTimestamp(),
      });
    }
    console.log('✅ [Firestore] Application stage updated:', appId, '->', stage);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error updating application stage:', error);
    return false;
  }
}

export async function saveInterviewScoresFirestore(
  appId: string,
  scores: {
    technicalInterview?: TechnicalInterviewScore;
    hrInterview?: HrInterviewScore;
    interviewOverallScore?: number;
    interviewPassed?: boolean;
    stage?: ApplicationItem['stage'];
  }
): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.APPLICATIONS, appId);
    const docSnap = await getDoc(docRef);
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (scores.technicalInterview !== undefined) payload.technicalInterview = scores.technicalInterview;
    if (scores.hrInterview !== undefined) payload.hrInterview = scores.hrInterview;
    if (scores.interviewOverallScore !== undefined) payload.interviewOverallScore = scores.interviewOverallScore;
    if (scores.interviewPassed !== undefined) payload.interviewPassed = scores.interviewPassed;
    if (scores.stage !== undefined) payload.stage = scores.stage;

    if (!docSnap.exists()) {
      await setDoc(docRef, { id: appId, ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, payload);
    }
    console.log('✅ [Firestore] Interview scores saved for:', appId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving interview scores:', error);
    return false;
  }
}

export async function deleteApplicationFirestore(appId: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.APPLICATIONS, appId));
    console.log('✅ [Firestore] Application deleted:', appId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting application:', error);
    return false;
  }
}

// ============================================================================
// TEST RESULTS SERVICE
// ============================================================================

export interface TestResultFirestore {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  status: 'Passed' | 'Failed';
  wasAutoSubmittedViolation: boolean;
  attemptDate: string;
}

export async function saveTestResultFirestore(result: TestResultFirestore): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docId = `test-${result.candidateId}-${Date.now()}`;
    await setDoc(doc(db!, COLLECTIONS.TEST_RESULTS, docId), {
      ...result,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving test result:', error);
    return false;
  }
}

// ============================================================================
// OFFER LETTERS SERVICE
// ============================================================================

export async function createOfferLetterFirestore(offer: OfferLetterRecord): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await setDoc(doc(db!, COLLECTIONS.OFFERS, offer.id), {
      ...offer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ [Firestore] Offer letter saved:', offer.id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error creating offer letter:', error);
    return false;
  }
}

export async function getOfferLettersFirestore(): Promise<OfferLetterRecord[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.OFFERS);
    const snap = await getDocs(colRef);
    const results: OfferLetterRecord[] = [];
    snap.forEach((d) => {
      const { createdAt, updatedAt, ...rest } = d.data() as any;
      results.push(rest as OfferLetterRecord);
    });
    console.log('✅ [Firestore] Fetched offer letters:', results.length);
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching offer letters:', error);
    return null;
  }
}

export async function deleteOfferLetterFirestore(offerId: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.OFFERS, offerId));
    console.log('✅ [Firestore] Offer letter deleted:', offerId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting offer letter:', error);
    return false;
  }
}

// ============================================================================
// INTERNSHIP CERTIFICATES SERVICE
// ============================================================================

export async function createInternshipFirestore(intern: InternshipRecord): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await setDoc(doc(db!, COLLECTIONS.INTERNSHIPS, intern.id), {
      ...intern,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ [Firestore] Internship saved:', intern.id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error creating internship certificate:', error);
    return false;
  }
}

export async function getInternshipsFirestore(): Promise<InternshipRecord[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.INTERNSHIPS);
    const snap = await getDocs(colRef);
    const results: InternshipRecord[] = [];
    snap.forEach((d) => {
      const { createdAt, updatedAt, ...rest } = d.data() as any;
      results.push(rest as InternshipRecord);
    });
    console.log('✅ [Firestore] Fetched internships:', results.length);
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching internship certificates:', error);
    return null;
  }
}

export async function deleteInternshipFirestore(internId: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.INTERNSHIPS, internId));
    console.log('✅ [Firestore] Internship deleted:', internId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting internship certificate:', error);
    return false;
  }
}

// ============================================================================
// CERTIFICATES SERVICE (Experience, Award, Recommendation)
// ============================================================================

export async function createCertificateFirestore(cert: CertificateRecord): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await setDoc(doc(db!, COLLECTIONS.CERTIFICATES, cert.id), {
      ...cert,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ [Firestore] Certificate saved:', cert.id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error creating certificate:', error);
    return false;
  }
}

export async function updateCertificateFirestore(
  certId: string,
  updates: Partial<CertificateRecord>
): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.CERTIFICATES, certId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { ...updates, id: certId, updatedAt: serverTimestamp(), createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }
    console.log('✅ [Firestore] Certificate updated:', certId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error updating certificate:', error);
    return false;
  }
}

export async function getCertificatesFirestore(): Promise<CertificateRecord[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.CERTIFICATES);
    const snap = await getDocs(colRef);
    const results: CertificateRecord[] = [];
    snap.forEach((d) => {
      const { createdAt, updatedAt, ...rest } = d.data() as any;
      results.push(rest as CertificateRecord);
    });
    console.log('✅ [Firestore] Fetched certificates:', results.length);
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching certificates:', error);
    return null;
  }
}

export async function deleteCertificateFirestore(certId: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.CERTIFICATES, certId));
    console.log('✅ [Firestore] Certificate deleted:', certId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting certificate:', error);
    return false;
  }
}

// ============================================================================
// EMPLOYEES SERVICE
// ============================================================================

export async function createEmployeeFirestore(member: EmployeeMember): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await setDoc(doc(db!, COLLECTIONS.EMPLOYEES, member.id), {
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ [Firestore] Employee saved:', member.id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving employee to Firestore:', error);
    return false;
  }
}

export async function updateEmployeeFirestore(id: string, updates: Partial<EmployeeMember>): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.EMPLOYEES, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { ...updates, id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    }
    console.log('✅ [Firestore] Employee updated:', id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error updating employee:', error);
    return false;
  }
}

export async function getEmployeesFirestore(): Promise<EmployeeMember[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.EMPLOYEES);
    const snap = await getDocs(colRef);
    const results: EmployeeMember[] = [];
    snap.forEach((d) => {
      const { createdAt, updatedAt, ...rest } = d.data() as any;
      results.push(rest as EmployeeMember);
    });
    console.log('✅ [Firestore] Fetched employees:', results.length);
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching employees from Firestore:', error);
    return null;
  }
}

export async function deleteEmployeeFirestore(id: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.EMPLOYEES, id));
    console.log('✅ [Firestore] Employee deleted:', id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting employee from Firestore:', error);
    return false;
  }
}

// ============================================================================
// OUR TEAM (Public Team Page) SERVICE
// ============================================================================

export async function saveOurTeamMemberFirestore(member: any): Promise<boolean> {
  if (!isReady() || !member.id) return false;
  try {
    await setDoc(
      doc(db!, COLLECTIONS.OUR_TEAM, member.id),
      {
        ...member,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving our team member:', error);
    return false;
  }
}

export async function deleteOurTeamMemberFirestore(id: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    await deleteDoc(doc(db!, COLLECTIONS.OUR_TEAM, id));
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting our team member:', error);
    return false;
  }
}

export async function getOurTeamMembersFirestore(): Promise<any[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.OUR_TEAM);
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const results: any[] = [];
    snap.forEach((d) => {
      const { updatedAt, ...rest } = d.data() as any;
      results.push(rest);
    });
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching our team members:', error);
    return null;
  }
}

// ============================================================================
// REAL-TIME LISTENERS (onSnapshot) — for AdminPage live sync
// ============================================================================

export function subscribeToApplications(
  onUpdate: (apps: ApplicationItem[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.APPLICATIONS);
    return onSnapshot(colRef, (snap) => {
      const results: ApplicationItem[] = [];
      snap.forEach((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as any;
        results.push(rest as ApplicationItem);
      });
      onUpdate(results);
    }, (error) => {
      console.error('🔥 [Firestore] onSnapshot applications error:', error);
    });
  } catch (error) {
    console.error('🔥 [Firestore] Failed to subscribe to applications:', error);
    return null;
  }
}

export function subscribeToOffers(
  onUpdate: (offers: OfferLetterRecord[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.OFFERS);
    return onSnapshot(colRef, (snap) => {
      const results: OfferLetterRecord[] = [];
      snap.forEach((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as any;
        results.push(rest as OfferLetterRecord);
      });
      onUpdate(results);
    }, (error) => {
      console.error('🔥 [Firestore] onSnapshot offers error:', error);
    });
  } catch (error) {
    console.error('🔥 [Firestore] Failed to subscribe to offers:', error);
    return null;
  }
}

export function subscribeToCertificates(
  onUpdate: (certs: CertificateRecord[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.CERTIFICATES);
    return onSnapshot(colRef, (snap) => {
      const results: CertificateRecord[] = [];
      snap.forEach((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as any;
        results.push(rest as CertificateRecord);
      });
      onUpdate(results);
    }, (error) => {
      console.error('🔥 [Firestore] onSnapshot certificates error:', error);
    });
  } catch (error) {
    console.error('🔥 [Firestore] Failed to subscribe to certificates:', error);
    return null;
  }
}

export function subscribeToInternships(
  onUpdate: (internships: InternshipRecord[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.INTERNSHIPS);
    return onSnapshot(colRef, (snap) => {
      const results: InternshipRecord[] = [];
      snap.forEach((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as any;
        results.push(rest as InternshipRecord);
      });
      onUpdate(results);
    }, (error) => {
      console.error('🔥 [Firestore] onSnapshot internships error:', error);
    });
  } catch (error) {
    console.error('🔥 [Firestore] Failed to subscribe to internships:', error);
    return null;
  }
}

export function subscribeToEmployees(
  onUpdate: (employees: EmployeeMember[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.EMPLOYEES);
    return onSnapshot(colRef, (snap) => {
      const results: EmployeeMember[] = [];
      snap.forEach((d) => {
        const { createdAt, updatedAt, ...rest } = d.data() as any;
        results.push(rest as EmployeeMember);
      });
      onUpdate(results);
    }, (error) => {
      console.error('🔥 [Firestore] onSnapshot employees error:', error);
    });
  } catch (error) {
    console.error('🔥 [Firestore] Failed to subscribe to employees:', error);
    return null;
  }
}

// ============================================================================
// INQUIRIES & CONTACT LEADS SERVICE
// ============================================================================

export interface ContactInquiryFirestore {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  service?: string;
  company?: string;
  budget?: string;
  message?: string;
  source?: string;
  status?: 'New' | 'Contacted' | 'In Discussion' | 'Converted' | 'Closed';
  createdAt?: any;
  updatedAt?: any;
}

export async function createInquiryFirestore(inquiry: ContactInquiryFirestore): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const inquiryId = inquiry.id || `inq-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const docRef = doc(db!, COLLECTIONS.INQUIRIES, inquiryId);
    const cleaned = cleanForFirestore({
      ...inquiry,
      id: inquiryId,
      name: inquiry.name || 'Client Lead',
      email: inquiry.email || '',
      phone: inquiry.phone || '',
      service: inquiry.service || 'IT Solutions & Consulting',
      company: inquiry.company || 'N/A',
      budget: inquiry.budget || '₹25k - ₹50k',
      message: inquiry.message || '',
      source: inquiry.source || 'Website Quote Form',
      status: inquiry.status || 'New',
      createdAtIso: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(docRef, cleaned, { merge: true });
    console.log('✅ [Firestore] Inquiry recorded in real time:', inquiryId);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving inquiry:', error);
    return false;
  }
}

export async function updateInquiryStatusFirestore(
  id: string,
  status: ContactInquiryFirestore['status']
): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.INQUIRIES, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ [Firestore] Inquiry status updated:', id, '->', status);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error updating inquiry status:', error);
    return false;
  }
}

export async function deleteInquiryFirestore(id: string): Promise<boolean> {
  if (!isReady()) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.INQUIRIES, id);
    await deleteDoc(docRef);
    console.log('✅ [Firestore] Inquiry deleted:', id);
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error deleting inquiry:', error);
    return false;
  }
}

export async function getInquiriesFirestore(): Promise<ContactInquiryFirestore[] | null> {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.INQUIRIES);
    const snap = await getDocs(colRef);
    const results: ContactInquiryFirestore[] = [];
    snap.forEach((d) => {
      const data = d.data();
      results.push(data as ContactInquiryFirestore);
    });
    return results;
  } catch (error) {
    console.error('🔥 [Firestore] Error getting inquiries:', error);
    return null;
  }
}

export function subscribeToInquiries(
  onUpdate: (inquiries: ContactInquiryFirestore[]) => void
): Unsubscribe | null {
  if (!isReady()) return null;
  try {
    const colRef = collection(db!, COLLECTIONS.INQUIRIES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ContactInquiryFirestore[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ContactInquiryFirestore);
        });

        // Helper to resolve exact timestamp for sorting newest first
        const resolveTimestamp = (inq: any): number => {
          if (inq.createdAt?.seconds) return inq.createdAt.seconds * 1000;
          if (inq.createdAt?.toMillis) return inq.createdAt.toMillis();
          if (inq.createdAt instanceof Date) return inq.createdAt.getTime();
          if (typeof inq.createdAtIso === 'string') {
            const t = new Date(inq.createdAtIso).getTime();
            if (!isNaN(t) && t > 0) return t;
          }
          if (typeof inq.createdAt === 'string') {
            const t = new Date(inq.createdAt).getTime();
            if (!isNaN(t) && t > 0) return t;
          }
          if (typeof inq.id === 'string') {
            const match = inq.id.match(/\d{12,}/);
            if (match) {
              const parsed = parseInt(match[0], 10);
              if (!isNaN(parsed) && parsed > 1000000000000) return parsed;
            }
          }
          // Fallback: If pending local write, sort to top
          return Date.now() + 60000;
        };

        // Sort newest first
        list.sort((a, b) => resolveTimestamp(b) - resolveTimestamp(a));
        onUpdate(list);
      },
      (error) => {
        console.warn('⚠️ [Firestore] Real-time inquiries listener error:', error);
      }
    );
  } catch (e) {
    console.warn('⚠️ [Firestore] subscribeToInquiries failed:', e);
    return null;
  }
}

// ============================================================================
// DIRECT CERTIFICATE LOOKUP (for VerifyCertificatePage cross-device)
// ============================================================================

export async function getCertificateByVerificationIdFirestore(
  idOrVerifId: string
): Promise<CertificateRecord | null> {
  if (!isReady() || !idOrVerifId.trim()) return null;
  try {
    const target = idOrVerifId.trim().toLowerCase();
    // 1. Direct doc ID lookup
    const docRef = doc(db!, COLLECTIONS.CERTIFICATES, idOrVerifId.trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { createdAt, updatedAt, ...rest } = docSnap.data() as any;
      return rest as CertificateRecord;
    }

    // 2. Scan collection for verificationId match
    const colRef = collection(db!, COLLECTIONS.CERTIFICATES);
    const snap = await getDocs(colRef);
    for (const d of snap.docs) {
      const data = d.data();
      const verif = (data.verificationId || '').toString().toLowerCase();
      if (verif === target || d.id.toLowerCase() === target) {
        const { createdAt, updatedAt, ...rest } = data as any;
        return rest as CertificateRecord;
      }
    }
    return null;
  } catch (error) {
    console.error('🔥 [Firestore] Error looking up certificate in Firestore:', error);
    return null;
  }
}

// ============================================================================
// CANDIDATES & DOCUMENTS SERVICE
// ============================================================================

export async function saveCandidateProfileFirestore(candidate: {
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  appliedRole?: string;
}): Promise<boolean> {
  if (!isReady() || !candidate.candidateId) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.CANDIDATES, candidate.candidateId);
    await setDoc(docRef, {
      ...candidate,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving candidate profile:', error);
    return false;
  }
}

export async function saveCandidateDocumentFirestore(
  candidateId: string,
  docItem: {
    id: string;
    title: string;
    fileName: string;
    fileSize?: string;
    uploadedAt: string;
    status: string;
    verifierNotes?: string;
  }
): Promise<boolean> {
  if (!isReady() || !candidateId) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.DOCUMENTS, `${candidateId}_${docItem.id}`);
    await setDoc(docRef, {
      candidateId,
      ...docItem,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving candidate document:', error);
    return false;
  }
}

// ============================================================================
// BULK INITIAL LOAD — fetches all collections at once for initial page load
// ============================================================================

export async function loadAllFromFirestore(): Promise<{
  applications: ApplicationItem[] | null;
  offers: OfferLetterRecord[] | null;
  internships: InternshipRecord[] | null;
  employees: EmployeeMember[] | null;
  certificates: CertificateRecord[] | null;
  inquiries: ContactInquiryFirestore[] | null;
}> {
  const [applications, offers, internships, employees, certificates, inquiries] = await Promise.allSettled([
    getApplicationsFirestore(),
    getOfferLettersFirestore(),
    getInternshipsFirestore(),
    getEmployeesFirestore(),
    getCertificatesFirestore(),
    getInquiriesFirestore(),
  ]);

  return {
    applications: applications.status === 'fulfilled' ? applications.value : null,
    offers: offers.status === 'fulfilled' ? offers.value : null,
    internships: internships.status === 'fulfilled' ? internships.value : null,
    employees: employees.status === 'fulfilled' ? employees.value : null,
    certificates: certificates.status === 'fulfilled' ? certificates.value : null,
    inquiries: inquiries.status === 'fulfilled' ? inquiries.value : null,
  };
}

export async function saveAdminProfileFirestore(
  role: string,
  profile: any
): Promise<boolean> {
  if (!isReady() || !role) return false;
  try {
    const docRef = doc(db!, COLLECTIONS.ADMIN_PROFILES, `profile_${role}`);
    await setDoc(docRef, {
      role,
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('🔥 [Firestore] Error saving admin profile:', error);
    return false;
  }
}

export async function getAdminProfileFirestore(role: string): Promise<any | null> {
  if (!isReady() || !role) return null;
  try {
    const docRef = doc(db!, COLLECTIONS.ADMIN_PROFILES, `profile_${role}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const { updatedAt, ...data } = snap.data();
    return data;
  } catch (error) {
    console.error('🔥 [Firestore] Error fetching admin profile:', error);
    return null;
  }
}

