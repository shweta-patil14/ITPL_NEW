import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string | null;
}

/**
 * Register a new candidate using Firebase Authentication
 */
export async function signUpCandidate(
  email: string,
  pass: string,
  name: string,
  phone?: string
): Promise<{ user: AuthUserProfile | null; error: string | null }> {
  if (!auth || !isFirebaseConfigured) {
    return {
      user: {
        uid: `local-${Date.now()}`,
        email,
        displayName: name,
        phoneNumber: phone || null,
      },
      error: null,
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    return {
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        phoneNumber: phone || null,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('🔥 [FirebaseAuth] Sign Up Error:', err);
    return { user: null, error: err.message || 'Registration failed' };
  }
}

/**
 * Sign in candidate with Email & Password
 */
export async function signInCandidate(
  email: string,
  pass: string
): Promise<{ user: AuthUserProfile | null; error: string | null }> {
  if (!auth || !isFirebaseConfigured) {
    return {
      user: {
        uid: `local-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      },
      error: null,
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        phoneNumber: cred.user.phoneNumber,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('🔥 [FirebaseAuth] Sign In Error:', err);
    return { user: null, error: err.message || 'Authentication failed' };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (auth && isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('🔥 [FirebaseAuth] Sign Out Warning:', err);
    }
  }
  try {
    localStorage.removeItem('itpl_candidate_user');
  } catch {
    // ignore
  }
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuthState(
  callback: (user: AuthUserProfile | null) => void
): () => void {
  if (!auth || !isFirebaseConfigured) {
    return () => {};
  }
  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        phoneNumber: firebaseUser.phoneNumber,
      });
    } else {
      callback(null);
    }
  });
}
