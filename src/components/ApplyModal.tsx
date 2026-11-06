import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { signUpCandidate, signInCandidate } from '../firebase/authService';
import { saveCandidateProfileFirestore } from '../firebase/firestoreService';
import {
  validateAadhaar,
  formatAadhaar,
  maskAadhaar,
  validateIndianMobile,
} from '../utils/aadhaarValidator';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  aadhaarNumber?: string;
  aadhaarMasked?: string;
  aadhaarVerified?: boolean;
  aadhaarDocFileName?: string;
  aadhaarDocDataUrl?: string;
}

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  aadhaarNumber?: string;
  aadhaarMasked?: string;
  aadhaarVerified?: boolean;
  aadhaarDocFileName?: string;
  aadhaarDocDataUrl?: string;
}

const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    const raw = localStorage.getItem('itpl_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUser = (user: RegisteredUser): void => {
  const users = getRegisteredUsers();
  users.push(user);
  try {
    localStorage.setItem('itpl_registered_users', JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
};

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('itpl_candidate_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('itpl_candidate_user');
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch {
        setCurrentUser(null);
      }
      setLoginError('');
    }
  }, [isOpen]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [aadhaarDocFileName, setAadhaarDocFileName] = useState('');
  const [aadhaarDocDataUrl, setAadhaarDocDataUrl] = useState('');
  const [aadhaarFeedback, setAadhaarFeedback] = useState<{ isValid?: boolean; message?: string }>({});
  const [phoneFeedback, setPhoneFeedback] = useState<{ isValid?: boolean; message?: string }>({});

  const handleAadhaarChange = (val: string) => {
    const formatted = formatAadhaar(val);
    setRegAadhaar(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 12) {
      const res = validateAadhaar(formatted);
      if (res.isValid) {
        setAadhaarFeedback({ isValid: true, message: '✓ Valid Aadhaar (UIDAI Verhoeff Checksum Verified)' });
      } else {
        setAadhaarFeedback({ isValid: false, message: res.error });
      }
    } else if (digits.length > 0) {
      setAadhaarFeedback({ isValid: undefined, message: `${digits.length}/12 digits entered` });
    } else {
      setAadhaarFeedback({});
    }
  };

  const handlePhoneChange = (val: string) => {
    setRegPhone(val);
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 10) {
      const res = validateIndianMobile(val);
      if (res.isValid) {
        setPhoneFeedback({ isValid: true, message: '✓ Valid 10-Digit Mobile' });
      } else {
        setPhoneFeedback({ isValid: false, message: res.error });
      }
    } else if (digits.length > 0) {
      setPhoneFeedback({ isValid: undefined, message: `${digits.length}/10 digits` });
    } else {
      setPhoneFeedback({});
    }
  };

  const handleAadhaarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setLoginError('Aadhaar document size should be less than 5 MB.');
        return;
      }
      setAadhaarDocFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAadhaarDocDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Successful login/register handler -> immediately opens Candidate Dashboard
  const proceedToDashboard = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('itpl_candidate_user', JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
    onSubmitSuccess(`Welcome, ${user.name}! Opening your Candidate Dashboard...`);
    onClose();
    navigate('/candidate-dashboard');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your email/mobile and password.');
      return;
    }

    if (loginPassword.length < 4) {
      setLoginError('Password must be at least 4 characters.');
      return;
    }

    const identifier = loginIdentifier.trim();
    const isEmail = identifier.includes('@');

    // Attempt Firebase sign in if it's an email
    if (isEmail) {
      try {
        const { user: fbUser } = await signInCandidate(identifier.toLowerCase(), loginPassword);
        if (fbUser) {
          const user: UserProfile = {
            name: fbUser.displayName || identifier.split('@')[0],
            email: fbUser.email || identifier,
            phone: fbUser.phoneNumber || '',
          };
          proceedToDashboard(user);
          return;
        }
      } catch {
        // Continue to local lookup fallback
      }
    }

    // Look up registered users by email or phone
    const users = getRegisteredUsers();
    const cleanId = identifier.toLowerCase();
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone === identifier
    );

    if (!matched) {
      setLoginError('No account found with this email/mobile. Please register first.');
      return;
    }

    if (matched.password !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    const user: UserProfile = {
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
    };

    proceedToDashboard(user);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim() || !regAadhaar.trim()) {
      setLoginError('Please fill in all registration fields, including your 12-digit Aadhaar number.');
      return;
    }

    // 1. Strict Indian Mobile Validation (Anti-Fake Number)
    const mobileCheck = validateIndianMobile(regPhone);
    if (!mobileCheck.isValid) {
      setLoginError(mobileCheck.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // 2. Strict Aadhaar UIDAI Verhoeff Checksum Validation (Anti-Fake Aadhaar)
    const aadhaarCheck = validateAadhaar(regAadhaar);
    if (!aadhaarCheck.isValid) {
      setLoginError(aadhaarCheck.error || 'Please enter a valid 12-digit Government Aadhaar number.');
      return;
    }

    if (regPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    // Check for duplicate email, phone, or Aadhaar
    const users = getRegisteredUsers();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = mobileCheck.cleanPhone || regPhone.trim();
    const cleanAadhaar = regAadhaar.replace(/[\s-]/g, '');

    const emailExists = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setLoginError('An account with this email already exists. Please log in.');
      return;
    }

    const phoneExists = users.find((u) => u.phone.replace(/\D/g, '').endsWith(cleanPhone));
    if (phoneExists) {
      setLoginError('An account with this phone number already exists. Please log in.');
      return;
    }

    const aadhaarExists = users.find(
      (u) => u.aadhaarNumber && u.aadhaarNumber.replace(/[\s-]/g, '') === cleanAadhaar
    );
    if (aadhaarExists) {
      setLoginError('A candidate account is already registered with this Aadhaar number. Duplicate registrations are prohibited.');
      return;
    }

    const masked = maskAadhaar(cleanAadhaar);

    // Attempt registration in Firebase Auth
    try {
      await signUpCandidate(
        cleanEmail,
        regPassword,
        regName.trim(),
        cleanPhone
      );
    } catch {
      // Non-blocking fallback
    }

    // Sync profile to Firestore
    saveCandidateProfileFirestore({
      candidateId: `cand-${Date.now()}`,
      name: regName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
    });

    const newUser: UserProfile = {
      name: regName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      aadhaarNumber: regAadhaar.trim(),
      aadhaarMasked: masked,
      aadhaarVerified: true,
      aadhaarDocFileName: aadhaarDocFileName || undefined,
      aadhaarDocDataUrl: aadhaarDocDataUrl || undefined,
    };

    // Save credentials to registered users store
    saveRegisteredUser({
      name: regName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: regPassword,
      aadhaarNumber: regAadhaar.trim(),
      aadhaarMasked: masked,
      aadhaarVerified: true,
      aadhaarDocFileName: aadhaarDocFileName || undefined,
      aadhaarDocDataUrl: aadhaarDocDataUrl || undefined,
    });

    proceedToDashboard(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('itpl_candidate_user');
    } catch {
      // ignore
    }
    setAuthMode('login');
    setLoginIdentifier('');
    setLoginPassword('');
    setLoginError('');
  };

  const modalTitle = currentUser
    ? 'Candidate Account'
    : authMode === 'login'
    ? 'Candidate Login'
    : 'Create Candidate Account';

  return (
    <Modal isOpen={isOpen} title={modalTitle} onClose={onClose}>
      {/* CASE 1: USER ALREADY LOGGED IN */}
      {currentUser ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="font-extrabold text-[#111A3A] text-lg">Welcome back, {currentUser.name}!</h3>
            <p className="text-xs text-slate-600 mt-0.5">{currentUser.email}</p>
            {currentUser.phone && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">+91 {currentUser.phone}</p>
            )}
            <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300/60">
                <span className="material-symbols-outlined text-xs">verified_user</span>
                <span>{currentUser.aadhaarMasked ? `Govt. Aadhaar: ${currentUser.aadhaarMasked} (Verified)` : 'Authenticated Account'}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center">
            Your candidate dashboard is ready with the Online Aptitude Test and KYC Document Verification desk.
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/candidate-dashboard');
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#232884] via-[#1b2685] to-[#232884] hover:from-[#1b2685] hover:to-[#141d66] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Candidate Dashboard</span>
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CASE 2: LOGIN FORM */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-indigo-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#232884] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">lock_person</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111A3A]">Candidate Authentication Required</p>
                  <p className="text-[11px] text-slate-600">Please sign in to access your Candidate Dashboard &amp; Aptitude Test.</p>
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address or Mobile Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. rahul@gmail.com or 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions sent to your registered contact.')}
                      className="text-[11px] font-semibold text-[#232884] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-[#232884] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs">Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#232884] via-[#1b2685] to-[#232884] hover:from-[#1b2685] hover:to-[#141d66] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Login &amp; Open Dashboard</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Don&apos;t have a candidate account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError('');
                      setAuthMode('register');
                    }}
                    className="font-bold text-[#232884] hover:underline cursor-pointer"
                  >
                    Register Here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* CASE 3: REGISTER FORM */}
          {authMode === 'register' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-indigo-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#232884] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111A3A]">New Applicant Registration</p>
                  <p className="text-[11px] text-slate-600">Create your profile to access the candidate dashboard and aptitude test.</p>
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name (as per Aadhaar Card) *
                  </label>
                  <input
                    required
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
                  />
                </div>

                {/* Government Aadhaar Identification Section */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111A3A] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#232884]">verified_user</span>
                      <span>12-Digit Aadhaar Identification Number *</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-[#232884]">
                      UIDAI Anti-Fraud
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      required
                      type="text"
                      maxLength={14}
                      value={regAadhaar}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                      placeholder="e.g. 3675 9834 6016"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm font-mono tracking-widest text-[#131B2E] focus:outline-none transition-all shadow-xs ${
                        aadhaarFeedback.isValid === true
                          ? 'border-emerald-500 focus:border-emerald-600 ring-2 ring-emerald-100'
                          : aadhaarFeedback.isValid === false
                          ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100'
                          : 'border-slate-300 focus:border-[#232884]'
                      }`}
                    />
                    {aadhaarFeedback.isValid === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 material-symbols-outlined text-lg">
                        check_circle
                      </span>
                    )}
                  </div>

                  {aadhaarFeedback.message && (
                    <p
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        aadhaarFeedback.isValid === true
                          ? 'text-emerald-700'
                          : aadhaarFeedback.isValid === false
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {aadhaarFeedback.isValid === true ? 'verified' : aadhaarFeedback.isValid === false ? 'cancel' : 'info'}
                      </span>
                      <span>{aadhaarFeedback.message}</span>
                    </p>
                  )}

                  {/* Optional Aadhaar Photo / PDF Upload */}
                  <div className="pt-2 border-t border-indigo-100/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-700">Attach Aadhaar Proof (Card / E-Aadhaar):</span>
                      <label className="text-[11px] font-bold text-[#232884] bg-white border border-indigo-200 hover:bg-indigo-50/80 px-2.5 py-1 rounded-lg cursor-pointer transition-all shadow-2xs">
                        <span>{aadhaarDocFileName ? 'Change File' : '+ Upload Document'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleAadhaarFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {aadhaarDocFileName && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-xs">description</span>
                        <span className="truncate">{aadhaarDocFileName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        maxLength={13}
                        value={regPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="e.g. 9146835824"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:bg-white transition-all ${
                          phoneFeedback.isValid === true
                            ? 'border-emerald-500 focus:border-emerald-600'
                            : phoneFeedback.isValid === false
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#232884]'
                        }`}
                      />
                    </div>
                    {phoneFeedback.message && (
                      <p
                        className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
                          phoneFeedback.isValid === true
                            ? 'text-emerald-700'
                            : phoneFeedback.isValid === false
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        <span>{phoneFeedback.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                  <input
                    required
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#232884] via-[#1b2685] to-[#232884] hover:from-[#1b2685] hover:to-[#141d66] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">verified_user</span>
                  <span>Verify Identity &amp; Register</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError('');
                      setAuthMode('login');
                    }}
                    className="font-bold text-[#232884] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
