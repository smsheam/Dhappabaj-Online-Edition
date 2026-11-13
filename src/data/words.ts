import { WordItem, CategoryId } from '../types/game';
import { WORDS_FOOD } from './wordsFood';
import { WORDS_PEOPLE } from './wordsPeople';
import { WORDS_OBJECT } from './wordsObject';
import { WORDS_ANIMAL } from './wordsAnimal';
import { WORDS_SCHOOL } from './words/wordsSchool';
import { WORDS_SPORTS } from './words/wordsSports';
import { WORDS_LIFESTYLE } from './words/wordsLifestyle';
import { WORDS_HISTORICAL } from './words/wordsHistorical';
import { WORDS_TOURIST } from './words/wordsTourist';
import { WORDS_TECH } from './words/wordsTech';
import { WORDS_MOVIES } from './words/wordsMovies';
import { WORDS_GEOGRAPHY } from './words/wordsGeography';
import { WORDS_PROFESSIONS } from './words/wordsProfessions';
import { WORDS_NATURE } from './words/wordsNature';
import { WORDS_TRANSPORT } from './words/wordsTransport';
import { WORDS_FESTIVALS } from './words/wordsFestivals';
import { WORDS_ACTIVITIES } from './words/wordsActivities';
import { WORDS_SCIENCE } from './words/wordsScience';
import { WORDS_CLOTHING } from './words/wordsClothing';
import { WORDS_LANDMARKS } from './words/wordsLandmarks';

export {
  WORDS_FOOD,
  WORDS_PEOPLE,
  WORDS_OBJECT,
  WORDS_ANIMAL,
  WORDS_SCHOOL,
  WORDS_SPORTS,
  WORDS_LIFESTYLE,
  WORDS_HISTORICAL,
  WORDS_TOURIST,
  WORDS_TECH,
  WORDS_MOVIES,
  WORDS_GEOGRAPHY,
  WORDS_PROFESSIONS,
  WORDS_NATURE,
  WORDS_TRANSPORT,
  WORDS_FESTIVALS,
  WORDS_ACTIVITIES,
  WORDS_SCIENCE,
  WORDS_CLOTHING,
  WORDS_LANDMARKS,
};

export const ALL_WORDS: WordItem[] = [
  ...WORDS_FOOD,
  ...WORDS_PEOPLE,
  ...WORDS_OBJECT,
  ...WORDS_ANIMAL,
  ...WORDS_SCHOOL,
  ...WORDS_SPORTS,
  ...WORDS_LIFESTYLE,
  ...WORDS_HISTORICAL,
  ...WORDS_TOURIST,
  ...WORDS_TECH,
  ...WORDS_MOVIES,
  ...WORDS_GEOGRAPHY,
  ...WORDS_PROFESSIONS,
  ...WORDS_NATURE,
  ...WORDS_TRANSPORT,
  ...WORDS_FESTIVALS,
  ...WORDS_ACTIVITIES,
  ...WORDS_SCIENCE,
  ...WORDS_CLOTHING,
  ...WORDS_LANDMARKS,
];

const GLOBAL_WORD_HISTORY_KEY = 'dhappabaj_global_word_history_v3';
const MAX_RECENT_HISTORY = 2400; // Keep history of up to 2,400 words so 3,000 words rotate smoothly without repetition

let cachedGlobalHistory: number[] | null = null;
let cachedWordOverrides: Record<number, Partial<WordItem>> | null = null;
let cachedDeletedWordIds: number[] | null = null;
let cachedFullWordPool: WordItem[] | null = null;

export function invalidateWordPoolCache() {
  cachedFullWordPool = null;
}

function getGlobalHistory(): number[] {
  if (cachedGlobalHistory) return cachedGlobalHistory;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(GLOBAL_WORD_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedGlobalHistory = parsed;
          return cachedGlobalHistory;
        }
      }
    }
  } catch {
    // In-memory fallback if storage unavailable
  }
  cachedGlobalHistory = [];
  return cachedGlobalHistory;
}

function recordWordPlayed(wordId: number) {
  try {
    const history = getGlobalHistory();
    const updated = [wordId, ...history.filter((id) => id !== wordId)].slice(0, MAX_RECENT_HISTORY);
    cachedGlobalHistory = updated;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GLOBAL_WORD_HISTORY_KEY, JSON.stringify(updated));
    }
  } catch {
    // Storage write failed
  }
}

// Cryptographically secure random integer in range [0, max - 1]
function getSecureRandomIndex(max: number): number {
  if (max <= 1) return 0;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

const WORD_OVERRIDES_KEY = 'dhappabaj_word_overrides_v1';
const DELETED_WORDS_KEY = 'dhappabaj_deleted_words_v1';

export function getWordOverrides(): Record<number, Partial<WordItem>> {
  if (cachedWordOverrides) return cachedWordOverrides;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(WORD_OVERRIDES_KEY);
      if (stored) {
        cachedWordOverrides = JSON.parse(stored);
        return cachedWordOverrides!;
      }
    }
  } catch {}
  cachedWordOverrides = {};
  return cachedWordOverrides;
}

export function saveWordOverride(id: number, override: Partial<WordItem>) {
  try {
    const current = { ...getWordOverrides() };
    current[id] = { ...(current[id] || {}), ...override };
    cachedWordOverrides = current;
    cachedFullWordPool = null;
    localStorage.setItem(WORD_OVERRIDES_KEY, JSON.stringify(current));
  } catch {}
}

export function getDeletedWordIds(): number[] {
  if (cachedDeletedWordIds) return cachedDeletedWordIds;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(DELETED_WORDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedDeletedWordIds = parsed;
          return cachedDeletedWordIds;
        }
      }
    }
  } catch {}
  cachedDeletedWordIds = [];
  return cachedDeletedWordIds;
}

export function saveDeletedWordId(id: number) {
  try {
    const current = [...getDeletedWordIds()];
    if (!current.includes(id)) {
      current.push(id);
      cachedDeletedWordIds = current;
      cachedFullWordPool = null;
      localStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(current));
    }
  } catch {}
}

export function bulkDeleteWords(ids: number[]) {
  try {
    const current = new Set(getDeletedWordIds());
    ids.forEach((id) => current.add(id));
    const arr = Array.from(current);
    cachedDeletedWordIds = arr;
    cachedFullWordPool = null;
    localStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(arr));
  } catch {}
}

export function bulkUpdateCategory(ids: number[], category: CategoryId) {
  try {
    const current = { ...getWordOverrides() };
    ids.forEach((id) => {
      current[id] = { ...(current[id] || {}), category };
    });
    cachedWordOverrides = current;
    cachedFullWordPool = null;
    localStorage.setItem(WORD_OVERRIDES_KEY, JSON.stringify(current));
  } catch {}
}

function getCustomWords(): WordItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('dhappabaj_custom_words_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {}
  return [];
}

export function getFullWordPool(): WordItem[] {
  if (cachedFullWordPool) return cachedFullWordPool;

  const overrides = getWordOverrides();
  const deletedSet = new Set(getDeletedWordIds());

  const baseWords = ALL_WORDS.filter((w) => !deletedSet.has(w.id)).map((w) => {
    if (overrides[w.id]) {
      return { ...w, ...overrides[w.id] };
    }
    return w;
  });

  const custom = getCustomWords().filter((w) => !deletedSet.has(w.id)).map((w) => {
    if (overrides[w.id]) {
      return { ...w, ...overrides[w.id] };
    }
    return w;
  });

  cachedFullWordPool = [...custom, ...baseWords];
  return cachedFullWordPool;
}

// Helper to pick a random word avoiding recently used words in the current match AND across matches
export function pickRandomWord(usedWordIds: number[] = [], allowedCategories?: CategoryId[]): WordItem {
  const fullPool = getFullWordPool();
  let categoryPool = fullPool;
  if (allowedCategories && allowedCategories.length > 0) {
    categoryPool = fullPool.filter((w) => allowedCategories.includes(w.category));
  }

  const globalHistory = getGlobalHistory();
  const matchUsedSet = new Set(usedWordIds);
  const globalHistorySet = new Set(globalHistory);

  // Level 1 Priority: Word has NOT been used in this match AND has NOT been used in recent global matches
  const freshWords = categoryPool.filter((w) => !matchUsedSet.has(w.id) && !globalHistorySet.has(w.id));

  let chosenWord: WordItem;

  if (freshWords.length > 0) {
    // Pick from truly fresh, unplayed words
    const idx = getSecureRandomIndex(freshWords.length);
    chosenWord = freshWords[idx];
  } else {
    // Level 2 Priority: If all category words have been played in recent matches,
    // pick an unused word in the CURRENT match that has been played furthest back in time
    const unusedInMatch = categoryPool.filter((w) => !matchUsedSet.has(w.id));
    if (unusedInMatch.length > 0) {
      // Sort by least recently used in global history
      unusedInMatch.sort((a, b) => {
        const idxA = globalHistory.indexOf(a.id);
        const idxB = globalHistory.indexOf(b.id);
        const rankA = idxA === -1 ? 999999 : idxA;
        const rankB = idxB === -1 ? 999999 : idxB;
        return rankB - rankA;
      });
      // Pick randomly from the top 35% oldest words to maintain randomization
      const topSliceCount = Math.max(1, Math.floor(unusedInMatch.length * 0.35));
      const pool = unusedInMatch.slice(0, topSliceCount);
      chosenWord = pool[getSecureRandomIndex(pool.length)];
    } else {
      // All words in match used, fallback to random from category pool
      chosenWord = categoryPool[getSecureRandomIndex(categoryPool.length)];
    }
  }

  // Record this word into global history so it won't repeat in upcoming matches
  recordWordPlayed(chosenWord.id);
  return chosenWord;
}

export function getWordCountStats() {
  return {
    total: ALL_WORDS.length,
    food: WORDS_FOOD.length,
    people: WORDS_PEOPLE.length,
    object: WORDS_OBJECT.length,
    animal: WORDS_ANIMAL.length,
    school_life: WORDS_SCHOOL.length,
    sports: WORDS_SPORTS.length,
    lifestyle: WORDS_LIFESTYLE.length,
    historical_places: WORDS_HISTORICAL.length,
    bd_tourist: WORDS_TOURIST.length,
    tech: WORDS_TECH.length,
    movies: WORDS_MOVIES.length,
    geography: WORDS_GEOGRAPHY.length,
    professions: WORDS_PROFESSIONS.length,
    nature: WORDS_NATURE.length,
    transport: WORDS_TRANSPORT.length,
    festivals: WORDS_FESTIVALS.length,
    everyday_activities: WORDS_ACTIVITIES.length,
    science: WORDS_SCIENCE.length,
    clothing: WORDS_CLOTHING.length,
    landmarks: WORDS_LANDMARKS.length,
  };
}
