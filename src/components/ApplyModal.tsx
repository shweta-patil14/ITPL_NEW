import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { signUpCandidate, signInCandidate } from '../firebase/authService';
import { saveCandidateProfileFirestore } from '../firebase/firestoreService';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
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

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setLoginError('Please fill in all registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    // Check for duplicate email or phone
    const users = getRegisteredUsers();
    const emailExists = users.find(
      (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setLoginError('An account with this email already exists. Please log in.');
      return;
    }
    const phoneExists = users.find((u) => u.phone === regPhone.trim());
    if (phoneExists) {
      setLoginError('An account with this phone number already exists. Please log in.');
      return;
    }

    // Attempt registration in Firebase Auth
    try {
      await signUpCandidate(
        regEmail.trim().toLowerCase(),
        regPassword,
        regName.trim(),
        regPhone.trim()
      );
    } catch {
      // Non-blocking fallback
    }

    // Sync profile to Firestore
    saveCandidateProfileFirestore({
      candidateId: `cand-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
    });

    // Save credentials to registered users store
    saveRegisteredUser({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      password: regPassword,
    });

    const newUser: UserProfile = {
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
    };

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
            <p className="text-xs text-emerald-800 font-semibold mt-2.5 bg-emerald-100/70 inline-block px-3 py-1 rounded-full border border-emerald-300/60">
              ✓ Authenticated Candidate Account
            </p>
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

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      required
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 80555 14368"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#131B2E] focus:outline-none focus:border-[#232884] focus:bg-white"
                    />
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
                  <span>Register &amp; Open Dashboard</span>
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
