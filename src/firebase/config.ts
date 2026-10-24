import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Read configuration from environment variables (.env) with direct project defaults
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDfo8Jn8WDRbi_x_yMGQQ750MK2RbOfShw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'itpl-new.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'itpl-new',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'itpl-new.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1005951418566',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1005951418566:web:8d7a0478d18e3774fa17c7',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-C5EY03XDQT',
};

// Check whether real Firebase credentials have been provided
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey.startsWith('AIzaSy')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('🔥 [Firebase] Connected to live backend:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('⚠️ [Firebase] Initialization notice:', error);
  }
}

export { app, auth, db, storage };
