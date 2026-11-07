import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cleanupRoomSubcollections } from './multiplayerService';
import { WordItem, CategoryId } from '../types/game';
import { ALL_WORDS } from '../data/words';
import { OnlineRoomData, OnlinePlayer } from '../types/multiplayer';

export const ADMIN_AUTHORIZED_EMAIL = 'smsheam1@gmail.com';

const CUSTOM_WORDS_STORAGE_KEY = 'dhappabaj_custom_words_v1';
const QUICK_CHATS_STORAGE_KEY = 'dhappabaj_custom_quick_chats_v1';
const SYSTEM_LOGS_STORAGE_KEY = 'dhappabaj_system_logs_v1';

export interface SystemLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: string;
}

export interface CustomQuickChats {
  suspect: { bn: string; en: string }[];
  defense: { bn: string; en: string }[];
  fun: { bn: string; en: string }[];
}

export const DEFAULT_QUICK_CHATS: CustomQuickChats = {
  suspect: [
    { bn: '১০০% শিওর এইটাই ধাপ্পাবাজ! 🫵', en: 'You are 100% the imposter! 🫵' },
    { bn: 'ক্লুটা তো পুরাই সন্দেহজনক! 🤔', en: 'That clue is super suspicious! 🤔' },
    { bn: 'আমার দিকে তাকাচ্ছেন কেন?! 👀', en: 'Why are you looking at me?! 👀' },
    { bn: 'ডাল মে কুচ কালা হ্যায়! 🍲', en: 'Something is fishy here! 🍲' },
    { bn: 'ধরা খাইলে খবর আছে! 💀', en: 'When you get caught you are done! 💀' },
    { bn: 'কথা কম, কাজ বেশি! 🤐', en: 'Less talk, confess now! 🤐' },
    { bn: 'চোখের ভাষা বলে দিচ্ছে আপনি ধাপ্পাবাজ! 🕵️', en: 'Your eyes say you are the imposter! 🕵️' },
    { bn: 'চোর চুরি করে পালানোর ধান্দায় আছে! 🏃‍♂️', en: 'Imposter is trying to sneak away! 🏃‍♂️' },
  ],
  defense: [
    { bn: 'বিশ্বাস করেন আমি নিষ্পাপ পাবলিক! 😇', en: 'Trust me, I am an innocent citizen! 😇' },
    { bn: 'আরে ধুর, আমি ১০০% নির্দোষ! 🛡️', en: 'Come on, I am 100% innocent! 🛡️' },
    { bn: 'আমাকে ভোট দিলে পরে আফসোস করবেন! 🛑', en: "Don't vote me, you will regret it! 🛑" },
    { bn: 'আমি কিন্তু একদম খাঁটি মানুষ! 💯', en: 'I am genuine and telling the truth! 💯' },
    { bn: 'ভুল মানুষকে ভোট দিয়েন না! ⚠️', en: "Don't waste your vote on an innocent! ⚠️" },
    { bn: 'আমার উপর ভরসা রাখেন! 🙏', en: 'Put your trust in me on this one! 🙏' },
  ],
  fun: [
    { bn: 'ধাপ্পাবাজের হাত-পা কাঁপতেছে! 😂', en: 'The imposter is trembling right now! 😂' },
    { bn: 'মিথ্যা কথা বলা মহাপাপ ভাই 🤫', en: 'Lying is a bad habit my friend 🤫' },
    { bn: 'দেরি কেন? খেলা শুরু করো! 🚀', en: 'Why the wait? Make your choice! 🚀' },
    { bn: 'চোর পালালে বুদ্ধি বাড়ে 🏃‍♂️', en: 'Regret comes after the imposter escapes! 🏃‍♂️' },
    { bn: 'খেলা হবে চরম! 🔥', en: 'Game on! This round is pure fire! 🔥' },
  ],
};

// Admin access is based on Firebase Authentication identity, never a client-side passcode.
export function isUserAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const currentEmail = auth.currentUser?.email?.toLowerCase();
  return Boolean(currentEmail && currentEmail === ADMIN_AUTHORIZED_EMAIL.toLowerCase());
}

// Custom words management
export function getLocalCustomWords(): WordItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalCustomWords(words: WordItem[]) {
  try {
    localStorage.setItem(CUSTOM_WORDS_STORAGE_KEY, JSON.stringify(words));
  } catch {}
}

// Add or edit a word (saves locally and to Firestore game_config/custom_words for all players)
export async function addOrUpdateWord(wordData: Omit<WordItem, 'id'>, existingId?: number): Promise<WordItem> {
  const customWords = getLocalCustomWords();
  const id = existingId || Date.now() + Math.floor(Math.random() * 1000);
  const newWord: WordItem = {
    ...wordData,
    id,
  };

  let updatedList: WordItem[];
  if (existingId) {
    updatedList = customWords.map((w) => (w.id === existingId ? newWord : w));
  } else {
    updatedList = [newWord, ...customWords];
  }

  saveLocalCustomWords(updatedList);

  // Sync to Firestore for real-time availability across all players
  try {
    const docRef = doc(db, 'game_config', 'custom_words', 'items', String(id));
    await setDoc(docRef, newWord);
  } catch (e) {
    console.warn('Could not sync custom word to Firestore cloud (saved locally):', e);
  }

  return newWord;
}

export async function deleteWord(wordId: number): Promise<void> {
  const customWords = getLocalCustomWords();
  const filtered = customWords.filter((w) => w.id !== wordId);
  saveLocalCustomWords(filtered);

  try {
    const docRef = doc(db, 'game_config', 'custom_words', 'items', String(wordId));
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Could not delete custom word from Firestore cloud:', e);
  }
}

// Get all words combined (built-in 3,000 + admin custom words)
export function getCombinedWordPool(): WordItem[] {
  const customWords = getLocalCustomWords();
  return [...customWords, ...ALL_WORDS];
}

// Quick Chats management
export function getCustomQuickChats(): CustomQuickChats {
  try {
    const raw = localStorage.getItem(QUICK_CHATS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.suspect && parsed.defense && parsed.fun) return parsed;
    }
  } catch {}
  return DEFAULT_QUICK_CHATS;
}

export function saveCustomQuickChats(chats: CustomQuickChats) {
  try {
    localStorage.setItem(QUICK_CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch {}
}

// System logging for admin monitoring
export function logSystemEvent(level: 'info' | 'warn' | 'error', message: string, details?: string) {
  try {
    const raw = localStorage.getItem(SYSTEM_LOGS_STORAGE_KEY);
    let logs: SystemLogEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: SystemLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      level,
      message,
      details,
    };
    logs = [newEntry, ...logs].slice(0, 100); // keep 100 recent
    localStorage.setItem(SYSTEM_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {}
}

export function getSystemLogs(): SystemLogEntry[] {
  try {
    const raw = localStorage.getItem(SYSTEM_LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function clearSystemLogs() {
  try {
    localStorage.removeItem(SYSTEM_LOGS_STORAGE_KEY);
  } catch {}
}

// Fetch all active rooms for live moderation
export async function fetchLiveRooms(): Promise<OnlineRoomData[]> {
  try {
    const snap = await getDocs(collection(db, 'rooms'));
    const rooms = snap.docs.map((d) => d.data() as OnlineRoomData);
    rooms.sort((a, b) => (b.lastActivityAt || b.createdAt || 0) - (a.lastActivityAt || a.createdAt || 0));
    return rooms;
  } catch (error) {
    console.error('Error fetching live rooms:', error);
    logSystemEvent('error', 'Failed to fetch live rooms', String(error));
    return [];
  }
}

// Close an active room by admin
export async function closeRoomByAdmin(roomCode: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();
  await updateDoc(roomRef, {
    status: 'CLOSED',
    closedReason: 'closed_by_admin',
    updatedAt: now,
    lastActivityAt: now,
    expiresAt: Timestamp.fromMillis(now + 24 * 60 * 60 * 1000),
  });
  logSystemEvent('info', `Admin closed room ${roomCode}`);
}

// Delete room completely
export async function deleteRoomByAdmin(roomCode: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomCode);
  await cleanupRoomSubcollections(roomCode);
  await deleteDoc(roomRef);
  logSystemEvent('info', `Admin deleted room ${roomCode}`);
}

// Test latency to Firestore
export async function pingFirestoreLatency(): Promise<number> {
  const start = performance.now();
  try {
    const testDocRef = doc(db, 'system_health', 'ping');
    await getDoc(testDocRef);
    return Math.round(performance.now() - start);
  } catch {
    return Math.round(performance.now() - start);
  }
}
