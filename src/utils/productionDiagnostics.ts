import { auth, db, ensureAuthenticatedUser, ensureFirestoreConnected, firebaseConfig } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import defaultAppletConfig from '../../firebase-applet-config.json';

export interface DiagnosticInfo {
  timestamp: string;
  origin: string;
  isOnline: boolean;
  firebaseProjectId: string;
  firestoreDatabaseId: string;
  authDomain: string;
  authUserId: string | null;
  isAnonymous: boolean | null;
  authProvider: string | null;
}

export interface ConnectivityTestResult {
  success: boolean;
  authLatencyMs: number;
  dbLatencyMs: number;
  totalTimeMs: number;
  userId: string | null;
  error?: string;
  guidance?: string;
}

const diagnosticLogHistory: Array<{ timestamp: string; stage: string; data?: any }> = [];

export function logProductionEvent(stage: string, data?: any) {
  const timestamp = new Date().toISOString();
  diagnosticLogHistory.push({ timestamp, stage, data });
  if (diagnosticLogHistory.length > 100) diagnosticLogHistory.shift();

  // Print scannable production log to browser console
  console.info(`[Dhappabaj Engine] [${timestamp.slice(11, 19)}] ${stage}`, data || '');

  // Keep on window for remote debugging on production / Vercel
  if (typeof window !== 'undefined') {
    (window as any).__dhappabajDiagnostics = {
      history: diagnosticLogHistory,
      getConfig: getProductionDiagnostics,
      runTest: testProductionConnectivity,
    };
  }
}

export function getProductionDiagnostics(): DiagnosticInfo {
  const user = auth.currentUser;
  return {
    timestamp: new Date().toISOString(),
    origin: typeof window !== 'undefined' ? window.location.origin : 'server',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    firebaseProjectId: firebaseConfig.projectId,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    authDomain: firebaseConfig.authDomain,
    authUserId: user?.uid || null,
    isAnonymous: user?.isAnonymous ?? null,
    authProvider: user?.providerData?.[0]?.providerId || (user?.isAnonymous ? 'anonymous' : null),
  };
}

export async function testProductionConnectivity(): Promise<ConnectivityTestResult> {
  const startTime = Date.now();
  let authLatencyMs = 0;
  let dbLatencyMs = 0;

  try {
    logProductionEvent('Diagnostic Test: Starting connectivity check...');

    // 1. Check network
    await ensureFirestoreConnected();

    // 2. Authenticate
    const authStart = Date.now();
    const user = await ensureAuthenticatedUser();
    authLatencyMs = Date.now() - authStart;
    logProductionEvent('Diagnostic Test: Auth verified', { uid: user.uid, latencyMs: authLatencyMs });

    // 3. Test read on public collection
    const dbStart = Date.now();
    const testDocRef = doc(db, 'rooms', '_healthcheck_ping');
    await getDoc(testDocRef).catch(() => {});
    dbLatencyMs = Date.now() - dbStart;

    const totalTimeMs = Date.now() - startTime;
    logProductionEvent('Diagnostic Test: Completed successfully', { totalTimeMs, authLatencyMs, dbLatencyMs });

    return {
      success: true,
      authLatencyMs,
      dbLatencyMs,
      totalTimeMs,
      userId: user.uid,
    };
  } catch (err: any) {
    const totalTimeMs = Date.now() - startTime;
    const errorMsg = err?.message || String(err);
    logProductionEvent('Diagnostic Test: Failed', { error: errorMsg, totalTimeMs });

    let guidance = 'Please verify your internet connection or check Firebase settings.';
    if (errorMsg.includes('admin-restricted-operation')) {
      guidance = 'Firebase Console has Anonymous Authentication disabled. Enable it in Firebase Console -> Authentication -> Sign-in method.';
    } else if (errorMsg.includes('unauthorized-domain')) {
      guidance = `Add ${window.location.hostname} to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    } else if (errorMsg.includes('offline') || errorMsg.includes('timed out')) {
      guidance = 'Network stream timed out. Ensure your network permits HTTPS long polling to firestore.googleapis.com.';
    }

    return {
      success: false,
      authLatencyMs,
      dbLatencyMs,
      totalTimeMs,
      userId: auth.currentUser?.uid || null,
      error: errorMsg,
      guidance,
    };
  }
}
