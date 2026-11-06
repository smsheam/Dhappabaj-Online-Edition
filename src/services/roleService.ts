import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserRoleRecord, EditorPermission } from '../types/user';

export const OWNER_EMAILS = [
  'smsheam1@gmail.com',
  's m sheam1@gmail.com',
];

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().replace(/\s+/g, '');
  return clean === 'smsheam1@gmail.com';
}

export const DEFAULT_EDITOR_PERMISSIONS: EditorPermission = {
  canManageWords: true,
  canManageHints: true,
  canManageTexts: true,
  canViewAnalytics: true,
};

/**
 * Checks if the given user (or currently logged in user) is the owner or an authorized editor.
 */
export async function getUserRole(uid?: string, email?: string): Promise<{ role: 'owner' | 'editor' | 'player'; permissions?: EditorPermission }> {
  const targetEmail = email || auth.currentUser?.email || undefined;
  const targetUid = uid || auth.currentUser?.uid || undefined;

  // 1. Owner check
  if (isOwnerEmail(targetEmail)) {
    return {
      role: 'owner',
      permissions: {
        canManageWords: true,
        canManageHints: true,
        canManageTexts: true,
        canViewAnalytics: true,
      },
    };
  }

  // 2. Editor check via Firestore roles
  if (targetUid) {
    try {
      const roleDoc = await getDoc(doc(db, 'roles', targetUid));
      if (roleDoc.exists()) {
        const data = roleDoc.data() as UserRoleRecord;
        return {
          role: data.role || 'editor',
          permissions: data.permissions || DEFAULT_EDITOR_PERMISSIONS,
        };
      }
    } catch {}
  }

  // Fallback check by email if uid didn't match
  if (targetEmail) {
    try {
      const q = query(collection(db, 'roles'), where('email', '==', targetEmail.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data() as UserRoleRecord;
        return {
          role: data.role || 'editor',
          permissions: data.permissions || DEFAULT_EDITOR_PERMISSIONS,
        };
      }
    } catch {}
  }

  return { role: 'player' };
}

/**
 * Assigns or updates Editor permissions for a Google account.
 */
export async function assignEditor(
  email: string,
  displayName: string,
  permissions: EditorPermission = DEFAULT_EDITOR_PERMISSIONS
): Promise<UserRoleRecord> {
  const cleanEmail = email.toLowerCase().trim();
  const recordId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const record: UserRoleRecord = {
    uid: recordId,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
    role: 'editor',
    permissions,
    assignedBy: auth.currentUser?.email || 'Owner',
    assignedAt: Date.now(),
  };

  const ref = doc(db, 'roles', recordId);
  await setDoc(ref, record);
  return record;
}

/**
 * Revokes Editor privileges.
 */
export async function revokeEditor(recordId: string): Promise<void> {
  const ref = doc(db, 'roles', recordId);
  await deleteDoc(ref);
}

/**
 * Fetches all assigned Editors.
 */
export async function fetchAllEditors(): Promise<UserRoleRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'roles'));
    const records: UserRoleRecord[] = [];
    snap.forEach((d) => {
      records.push(d.data() as UserRoleRecord);
    });
    return records;
  } catch (err) {
    console.warn('Failed to fetch editors:', err);
    return [];
  }
}
