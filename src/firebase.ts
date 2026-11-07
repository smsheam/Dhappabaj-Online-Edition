import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  signOut,
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

// Initialize Firestore with specific database ID and auto-detect long polling for fast websockets
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

// Initialize Firebase Auth
export const auth = getAuth(app);

// Use local persistence so users stay logged in across visits
try {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} catch {
  // Ignored if unsupported in certain environments
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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
export async function ensureAuthenticatedUser(forceFresh: boolean = false): Promise<User> {
  if (forceFresh && auth.currentUser?.isAnonymous) {
    try {
      await signOut(auth);
    } catch {}
  }

  if (!forceFresh && auth.currentUser) {
    return auth.currentUser;
  }

  if (!forceFresh && authInitPromise) {
    return authInitPromise;
  }

  authInitPromise = (async () => {
    try {
      if (!forceFresh) {
        // 1. Wait briefly for stored session credentials to hydrate
        try {
          await Promise.race([
            auth.authStateReady(),
            new Promise((r) => setTimeout(r, 1200)),
          ]);
        } catch {
          // Fallthrough
        }

        if (auth.currentUser) {
          return auth.currentUser;
        }
      }

      // 2. Sign in anonymously with a 14s safety timeout
      const signInPromise = signInAnonymously(auth).then((cred) => cred.user);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Authentication timeout. Please check your internet connection or sign in with Google.')),
          14000
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

// Sign out user completely (clears local session and Firebase auth state)
export async function signOutUser(): Promise<void> {
  try {
    sessionStorage.removeItem('dhappabaj_session_name');
    sessionStorage.removeItem('dhappabaj_session_avatar');
    sessionStorage.removeItem('dhappabaj_name');
    sessionStorage.removeItem('dhappabaj_avatar');
    sessionStorage.removeItem('dhappabaj_active_room');
    localStorage.removeItem('dhappabaj_user_profile');
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Reset to a completely fresh session (clears lingering stored names/active rooms/anonymous UID)
export async function resetToFreshSession(): Promise<User> {
  try {
    sessionStorage.clear();
    localStorage.removeItem('dhappabaj_name');
    localStorage.removeItem('dhappabaj_avatar');
    localStorage.removeItem('dhappabaj_active_room');
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      await signOut(auth);
    }
  } catch {}
  return ensureAuthenticatedUser(true);
}

// Ensure network is active
export async function ensureFirestoreConnected(): Promise<void> {
  try {
    await enableNetwork(db);
  } catch {
    // Already active or unsupported
  }
}

// Proactively initiate network connection
ensureFirestoreConnected();


