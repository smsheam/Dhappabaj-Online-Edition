import { WordItem, CategoryId } from '../types/game';
import { WORDS_FOOD } from './wordsFood';
import { WORDS_PEOPLE } from './wordsPeople';
import { WORDS_OBJECT } from './wordsObject';
import { WORDS_ANIMAL } from './wordsAnimal';

export const ALL_WORDS: WordItem[] = [
  ...WORDS_FOOD,
  ...WORDS_PEOPLE,
  ...WORDS_OBJECT,
  ...WORDS_ANIMAL,
];

// Helper to pick a random word avoiding recently used words in the current match
export function pickRandomWord(usedWordIds: number[], allowedCategories?: CategoryId[]): WordItem {
  let pool = ALL_WORDS;
  if (allowedCategories && allowedCategories.length > 0) {
    pool = pool.filter((w) => allowedCategories.includes(w.category));
  }

  // Try to pick an unused word first
  const unused = pool.filter((w) => !usedWordIds.includes(w.id));
  const selectionPool = unused.length > 0 ? unused : pool;

  const randomIndex = Math.floor(Math.random() * selectionPool.length);
  return selectionPool[randomIndex];
}

export function getWordCountStats() {
  return {
    total: ALL_WORDS.length,
    food: WORDS_FOOD.length,
    people: WORDS_PEOPLE.length,
    object: WORDS_OBJECT.length,
    animal: WORDS_ANIMAL.length,
  };
}
