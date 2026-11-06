import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CompletedMatchRecord } from '../types/user';

const MATCH_HISTORY_COLLECTION = 'match_history';

/**
 * Saves a completed match record with players, scores, word played, and funny awards.
 */
export async function saveCompletedMatch(record: CompletedMatchRecord): Promise<void> {
  try {
    const historyRef = doc(db, MATCH_HISTORY_COLLECTION, record.id || record.matchId);
    await setDoc(historyRef, record);
  } catch (err) {
    console.warn('Failed to save match history to Firestore:', err);
    // Save to local cache as fallback
    try {
      const localHist = getLocalMatchHistory();
      localHist.unshift(record);
      localStorage.setItem('dhappabaj_local_matches', JSON.stringify(localHist.slice(0, 30)));
    } catch {}
  }
}

/**
 * Fetches recent completed matches for Admin Panel or Match Review.
 */
export async function fetchRecentMatches(maxResults: number = 30): Promise<CompletedMatchRecord[]> {
  try {
    const histRef = collection(db, MATCH_HISTORY_COLLECTION);
    const q = query(histRef, orderBy('completedAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    const records: CompletedMatchRecord[] = [];
    snap.forEach((d) => {
      records.push(d.data() as CompletedMatchRecord);
    });
    if (records.length > 0) return records;
  } catch (err) {
    console.warn('Failed to fetch match history from Firestore:', err);
  }

  return getLocalMatchHistory();
}

/**
 * Fallback local storage retrieval.
 */
export function getLocalMatchHistory(): CompletedMatchRecord[] {
  try {
    const raw = localStorage.getItem('dhappabaj_local_matches');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
