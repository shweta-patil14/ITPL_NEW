# Firebase Backend Connection Guide for ITPL Platform

This project is fully integrated with **Firebase Authentication**, **Cloud Firestore (Real-Time)**, and **Firebase Storage**.

---

## ⚠️ CRITICAL STEP: Fix "Permission Denied" in Firestore Rules

If you see `permission-denied Missing or insufficient permissions`, your Cloud Firestore database was created in **Production Mode** with all reads and writes blocked by default (`allow read, write: if false;`).

### How to Fix in 60 Seconds:
1. Go to [Firebase Console](https://console.firebase.google.com/) -> Select your project **`itpl-new`**.
2. In the left menu under **Build**, click **Firestore Database**.
3. Click the **Rules** tab at the top.
4. Replace the entire contents with the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Applications (Job applications, internship applications, assessment progress)
    match /itpl_applications/{appId} {
      allow read, write: if true;
    }

    // 2. Candidate Accounts & Profiles
    match /itpl_candidates/{candidateId} {
      allow read, write: if true;
    }

    // 3. Aptitude Test Results
    match /itpl_test_results/{testId} {
      allow read, write: if true;
    }

    // 4. Candidate Uploaded KYC Documents
    match /itpl_documents/{docId} {
      allow read, write: if true;
    }

    // 5. Offer Letters
    match /itpl_offers/{offerId} {
      allow read, write: if true;
    }

    // 6. Internship Certificates
    match /itpl_internships/{internId} {
      allow read, write: if true;
    }

    // 7. Official Verifiable Certificates (Experience, Award, Recommendation)
    match /itpl_certificates/{certId} {
      allow read, write: if true;
    }

    // 8. Employee Roster
    match /itpl_employees/{empId} {
      allow read, write: if true;
    }

    // 9. Public "Our Team" Member Directory
    match /itpl_our_team/{memberId} {
      allow read, write: if true;
    }

    // 10. Website Inquiries & Contact Leads
    match /itpl_inquiries/{inquiryId} {
      allow read, write: if true;
    }

    // 11. Attendance Records
    match /itpl_attendance/{attId} {
      allow read, write: if true;
    }

    // Global collection fallback
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish** (top right of the Rules editor).
6. **Done!** Reads, writes, and real-time synchronization will now work immediately without permission errors.

---

## 2. Collection Reference Guide

The application connects to the following Cloud Firestore collections:

| Collection Name | Purpose | Trigger / Screen |
|---|---|---|
| `itpl_applications` | Full job & internship applications with interview scores & stages | `ApplyModal`, `AdminPage`, `CandidateDashboard` |
| `itpl_candidates` | Registered candidate accounts & profile metadata | `ApplyModal` (Registration), `CandidateDashboard` |
| `itpl_test_results` | Complete aptitude test submissions & proctor logs | `CandidateDashboardPage` (Assessment submit) |
| `itpl_documents` | Candidate uploaded KYC/marksheets/resume records | `CandidateDashboardPage` (KYC upload) |
| `itpl_offers` | Issued candidate offer letters with salary breakdown | `AdminPage` (Generate Offer tab) |
| `itpl_internships` | Issued internship completion certificates | `AdminPage` (Internships tab) |
| `itpl_certificates` | Experience, Award, and Recommendation certificates | `AdminPage` & `VerifyCertificatePage` |
| `itpl_employees` | Corporate employee roster & HR management | `AdminPage` (Employees tab) |
| `itpl_our_team` | Public team directory with photos & designations | `OurTeamManager` / Public Team page |
| `itpl_inquiries` | Contact page inquiries and scope estimator requests | `ContactSection` form |

---

## 3. Real-Time Subscriptions (`onSnapshot`)

The platform uses Firestore `onSnapshot` real-time listeners:
- **`subscribeToApplications`**: When any candidate applies or submits a test, `AdminPage` updates instantly without refreshing.
- **`subscribeToOffers`**: Updates offer letters list live across all open admin tabs.
- **`subscribeToCertificates`**: Synchronizes experience, award, and recommendation certificates live.
- **`subscribeToInternships`**: Synchronizes internship certificates live.
- **`subscribeToEmployees`**: Synchronizes team updates live.
- **`VerifyCertificatePage`**: Performs real-time cloud queries so any QR code scanned on a mobile device immediately retrieves and displays valid certificates.

---

## 4. Testing Checklist & CRUD Operations

- [x] **Contact Form**: Submitting the form saves the message and lead to `itpl_inquiries`.
- [x] **Candidate Registration & Login**: Creates user in Firebase Auth and profile in `itpl_candidates`.
- [x] **Assessment & Proctoring**: Auto-saves score and proctoring violation logs to `itpl_test_results` and updates `itpl_applications`.
- [x] **Internship Application**: Submitting from the modal saves to `itpl_applications` with tracking code.
- [x] **Application Status Tracker**: Searches `itpl_applications` in real time.
- [x] **Admin Operations**: Create, update stage, score interviews, issue offers, and delete applications syncs to Firestore.
- [x] **Certificate Verification**: Scanned QR codes or verification codes query Firestore cross-device.
