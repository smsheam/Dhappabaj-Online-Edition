import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  enableNetwork,
  Firestore,
} from 'firebase/firestore';
import defaultAppletConfig from '../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultAppletConfig?.projectId || 'semiotic-dryad-kwpgt',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultAppletConfig?.appId || '1:730462018709:web:a12aee3e1050a653aacf9c',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultAppletConfig?.apiKey || 'AIzaSyCL-DpBxGovTk1JzA4g_BPltIwyK_uMKx4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultAppletConfig?.authDomain || 'semiotic-dryad-kwpgt.firebaseapp.com',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    defaultAppletConfig?.firestoreDatabaseId ||
    'ai-studio-dhappabajonlinee-ceeaf2df-4aeb-4a70-8e6b-1923970426eb',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultAppletConfig?.storageBucket || 'semiotic-dryad-kwpgt.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultAppletConfig?.messagingSenderId || '730462018709',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID and robust long polling for instant iframe/mobile connectivity
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1-Click Google Sign-In (fully supported by ProvisionFirebase)
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Global singleton promise to prevent concurrent race conditions during auth initialization
let authInitPromise: Promise<User> | null = null;

// Ensure authenticated user (tries existing session, then anonymous auth, with safety timeout)
export async function ensureAuthenticatedUser(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (authInitPromise) {
    return authInitPromise;
  }

  authInitPromise = (async () => {
    try {
      // 1. Wait briefly for stored credentials (IndexedDB / LocalStorage) to hydrate
      try {
        await Promise.race([
          auth.authStateReady(),
          new Promise((r) => setTimeout(r, 1500)),
        ]);
      } catch {
        // Fallthrough to direct check
      }

      if (auth.currentUser) {
        return auth.currentUser;
      }

      // 2. Sign in anonymously with a 7s safety timeout
      const signInPromise = signInAnonymously(auth).then((cred) => cred.user);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Authentication timeout. Please check your internet connection or sign in with Google.')),
          7000
        )
      );

      const user = await Promise.race([signInPromise, timeoutPromise]);
      return user;
    } finally {
      authInitPromise = null;
    }
  })();

  return authInitPromise;
}

// Ensure network is active
export async function ensureFirestoreConnected(): Promise<void> {
  try {
    await enableNetwork(db);
  } catch {
    // Already active or unsupported
  }
}

// Proactively initiate connection and authenticate without blocking
ensureFirestoreConnected();
ensureAuthenticatedUser().catch(() => {});

