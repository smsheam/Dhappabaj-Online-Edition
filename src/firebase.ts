import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultAppletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultAppletConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || defaultAppletConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultAppletConfig.messagingSenderId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config (CRITICAL as per skill)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

// Ensure authenticated user (tries existing session, then anonymous auth, with safety timeout)
export async function ensureAuthenticatedUser(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        if (auth.currentUser) {
          resolve(auth.currentUser);
        } else {
          reject(new Error('Authentication timeout. Please check your connection or sign in with Google.'));
        }
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (resolved) return;
        if (user) {
          resolved = true;
          clearTimeout(timeout);
          unsubscribe();
          resolve(user);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              unsubscribe();
              resolve(userCredential.user);
            }
          } catch (err: any) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              unsubscribe();
              reject(err);
            }
          }
        }
      },
      (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          unsubscribe();
          reject(err);
        }
      }
    );
  });
}

// Validate connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected when test doc does not exist or rules are active
  }
}

// Run test connection
testConnection();
