import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInAnonymously,
  signInWithPopup,
  linkWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';
import { UserProfile, UserCustomization, UserStats } from '../types/user';
import { ACHIEVEMENTS_LIST } from '../data/achievements';

const USER_STORAGE_KEY = 'dhappabaj_user_profile';

const DEFAULT_STATS: UserStats = {
  totalMatches: 0,
  matchesWon: 0,
  matchesLost: 0,
  imposterWins: 0,
  citizenWins: 0,
  totalPoints: 0,
  imposterCount: 0,
  correctVotes: 0,
  wrongVotes: 0,
  eliminatedAsInnocent: 0,
  cleanImposterWins: 0,
};

const DEFAULT_CUSTOMIZATION: UserCustomization = {
  avatar: '🕵️',
  avatarColor: '#f59e0b',
  skinBadge: undefined,
  favoriteCategory: 'all',
  customTitle: 'চতুর গোয়েন্দা',
};

// Generate a random guest username
export function generateGuestName(): string {
  const prefixes = ['বুদ্ধিমান', 'চতুর', 'রহস্যময়', 'নিখুঁত', 'অজ্ঞাত', 'গোয়েন্দা', 'জাগ্রত'];
  const suffixes = ['নাগরিক', 'যাত্রী', 'বন্ধু', 'খেলোয়াড়', 'সদস্য', 'খন্দকার', 'চৌধুরী'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${p} ${s} #${num}`;
}

export function createDefaultProfile(uid: string, isGuest: boolean = true, email?: string | null, displayName?: string | null, photoURL?: string | null): UserProfile {
  const now = Date.now();
  const name = displayName?.trim() || (isGuest ? generateGuestName() : 'খেলোয়াড়');
  return {
    uid,
    email: email || null,
    displayName: name,
    username: name.toLowerCase().replace(/[\s#]/g, '_'),
    photoURL: photoURL || null,
    bio: isGuest ? 'ধাপ্পাবাজ খেলায় নতুন গোয়েন্দা' : 'চতুর গোয়েন্দা ও ধাপ্পাবাজ শিকারী',
    accountType: isGuest ? 'guest' : 'google',
    createdAt: now,
    updatedAt: now,
    hasCompletedOnboarding: false,
    isBanned: false,
    customization: {
      ...DEFAULT_CUSTOMIZATION,
      avatar: isGuest ? '🕵️' : '🦊',
      bio: isGuest ? 'ধাপ্পাবাজ খেলায় নতুন গোয়েন্দা' : 'চতুর গোয়েন্দা ও ধাপ্পাবাজ শিকারী',
    },
    stats: { ...DEFAULT_STATS },
    unlockedBadges: [],
  };
}

// Get user profile from Firestore or fallback to localStorage
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch user profile from Firestore:', err);
  }

  // Fallback to local storage if present and matches UID
  try {
    const local = localStorage.getItem(USER_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as UserProfile;
      if (parsed.uid === uid) return parsed;
    }
  } catch {}

  return null;
}

// Subscribe to real-time updates for a user's profile
export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
        } catch {}
        callback(data);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Profile listener warning:', err);
    }
  );
}

// Save or update profile in Firestore
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  profile.updatedAt = Date.now();
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch {}

  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Failed to save profile to Firestore:', err);
  }
}

// Sign in or continue as Guest
export async function loginAsGuest(desiredName?: string, desiredAvatar?: string): Promise<UserProfile> {
  let user: User;
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    user = auth.currentUser;
  } else {
    const cred = await signInAnonymously(auth);
    user = cred.user;
  }

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = createDefaultProfile(user.uid, true);
    if (desiredName) profile.displayName = desiredName;
    if (desiredAvatar) profile.customization.avatar = desiredAvatar;
    await saveUserProfile(profile);
  }

  return profile;
}

// Sign in with Google
export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = createDefaultProfile(
      user.uid,
      false,
      user.email,
      user.displayName,
      user.photoURL
    );
    await saveUserProfile(profile);
  } else {
    // Sync Google email and name if missing
    let updated = false;
    if (!profile.email && user.email) {
      profile.email = user.email;
      updated = true;
    }
    if (profile.accountType !== 'google') {
      profile.accountType = 'google';
      updated = true;
    }
    if (updated) {
      await saveUserProfile(profile);
    }
  }

  return profile;
}

// Sign out user
export async function signOutUser(): Promise<void> {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    await signOut(auth);
  } catch (err) {
    console.warn('Sign-out error:', err);
  }
}

// Upgrade / Link guest account to Google
export async function upgradeGuestToGoogle(): Promise<{ success: boolean; profile: UserProfile; merged?: boolean; message?: string }> {
  const current = auth.currentUser;
  if (!current) {
    const profile = await loginWithGoogle();
    return { success: true, profile, merged: false };
  }

  const currentProfile = await getUserProfile(current.uid);

  try {
    // Attempt in-place link
    const linkResult = await linkWithPopup(current, googleProvider);
    const linkedUser = linkResult.user;

    const updatedProfile: UserProfile = {
      ...(currentProfile || createDefaultProfile(linkedUser.uid, false)),
      uid: linkedUser.uid,
      email: linkedUser.email,
      displayName: linkedUser.displayName || currentProfile?.displayName || 'খেলোয়াড়',
      photoURL: linkedUser.photoURL || currentProfile?.photoURL,
      accountType: 'google',
      updatedAt: Date.now(),
    };

    await saveUserProfile(updatedProfile);
    return { success: true, profile: updatedProfile, merged: false };
  } catch (err: any) {
    // If the Google account is already used by an existing user, sign into that account
    if (err.code === 'auth/credential-already-in-use') {
      const signInResult = await signInWithPopup(auth, googleProvider);
      const googleUser = signInResult.user;
      let existingProfile = await getUserProfile(googleUser.uid);

      if (!existingProfile) {
        existingProfile = createDefaultProfile(
          googleUser.uid,
          false,
          googleUser.email,
          googleUser.displayName,
          googleUser.photoURL
        );
      }

      // If previous guest had stats, merge points/wins
      if (currentProfile && currentProfile.stats) {
        existingProfile.stats.totalMatches += currentProfile.stats.totalMatches;
        existingProfile.stats.matchesWon += currentProfile.stats.matchesWon;
        existingProfile.stats.totalPoints += currentProfile.stats.totalPoints;
        existingProfile.stats.imposterWins += currentProfile.stats.imposterWins;
        existingProfile.stats.citizenWins += currentProfile.stats.citizenWins;
        existingProfile.stats.correctVotes += currentProfile.stats.correctVotes;
      }

      await saveUserProfile(existingProfile);
      return {
        success: true,
        profile: existingProfile,
        merged: true,
        message: 'Google অ্যাকাউন্টের সাথে সফলভাবে যুক্ত ও মার্জ করা হয়েছে!',
      };
    }
    throw err;
  }
}

// Update customization settings
export async function updateProfileCustomization(
  uid: string,
  customization: Partial<UserCustomization>
): Promise<UserProfile | null> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  profile.customization = {
    ...profile.customization,
    ...customization,
  };
  await saveUserProfile(profile);
  return profile;
}

// Evaluate achievement progress and award badges
export function evaluateAchievements(stats: UserStats, currentUnlocked: string[]): { newlyUnlocked: string[]; updatedUnlocked: string[] } {
  const unlockedSet = new Set(currentUnlocked || []);
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS_LIST) {
    if (unlockedSet.has(ach.id)) continue;

    let satisfied = false;
    switch (ach.id) {
      case 'first_match':
        satisfied = stats.totalMatches >= 1;
        break;
      case 'imposter_win_1':
        satisfied = stats.imposterWins >= 1;
        break;
      case 'citizen_win_1':
        satisfied = stats.citizenWins >= 1;
        break;
      case 'catch_imposters_3':
        satisfied = stats.correctVotes >= 3;
        break;
      case 'matches_5':
        satisfied = stats.totalMatches >= 5;
        break;
      case 'silent_assassin':
        satisfied = stats.cleanImposterWins >= 1;
        break;
      case 'innocent_survivor':
        satisfied = stats.citizenWins >= 2;
        break;
      case 'points_50':
        satisfied = stats.totalPoints >= 50;
        break;
      case 'catch_imposters_10':
        satisfied = stats.correctVotes >= 10;
        break;
      case 'imposter_wins_5':
        satisfied = stats.imposterWins >= 5;
        break;
      case 'points_100':
        satisfied = stats.totalPoints >= 100;
        break;
      case 'matches_20':
        satisfied = stats.totalMatches >= 20;
        break;
      case 'points_250':
        satisfied = stats.totalPoints >= 250;
        break;
      default:
        break;
    }

    if (satisfied) {
      unlockedSet.add(ach.id);
      newlyUnlocked.push(ach.id);
    }
  }

  return {
    newlyUnlocked,
    updatedUnlocked: Array.from(unlockedSet),
  };
}

// Record match stats after game ends
export async function recordPlayerMatchStats(
  uid: string,
  earnedPoints: number,
  role: 'imposter' | 'innocent',
  isWin: boolean,
  votesReceived: number,
  correctVote: boolean,
  wasEliminated: boolean
): Promise<{ profile: UserProfile; newlyUnlockedBadges: string[] } | null> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  const stats = profile.stats || { ...DEFAULT_STATS };
  stats.totalMatches += 1;
  stats.totalPoints += earnedPoints;

  if (isWin) {
    stats.matchesWon += 1;
  } else {
    stats.matchesLost += 1;
  }

  if (role === 'imposter') {
    stats.imposterCount += 1;
    if (isWin) {
      stats.imposterWins += 1;
      if (votesReceived === 0) {
        stats.cleanImposterWins += 1;
      }
    }
  } else {
    if (isWin) {
      stats.citizenWins += 1;
    }
    if (wasEliminated) {
      stats.eliminatedAsInnocent += 1;
    }
  }

  if (correctVote) {
    stats.correctVotes += 1;
  } else {
    stats.wrongVotes += 1;
  }

  profile.stats = stats;

  const { newlyUnlocked, updatedUnlocked } = evaluateAchievements(stats, profile.unlockedBadges || []);
  profile.unlockedBadges = updatedUnlocked;

  await saveUserProfile(profile);

  return { profile, newlyUnlockedBadges: newlyUnlocked };
}

// Fetch all registered & guest users for admin dashboard
export async function fetchUsersForAdmin(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(100));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (err) {
    console.warn('Failed to fetch users for admin:', err);
    return [];
  }
}

// Ban / Unban user
export async function setUserBanStatus(uid: string, isBanned: boolean, reason?: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isBanned,
    bannedReason: reason || (isBanned ? 'নিয়ম লঙ্ঘনের কারণে সাময়িক স্থগিত' : null),
    updatedAt: Date.now(),
  });
}
