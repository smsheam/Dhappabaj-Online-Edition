import { WordItem } from '../types/game';
import { lookupWordHint } from '../data/wordHints';

export interface HardHintResult {
  bn: string;
  en: string;
}

/**
 * Strips excessive whitespace and guarantees strictly 1 to 3 words maximum.
 */
function cleanTo1To3Words(str: string, fallback: string): string {
  if (!str) return fallback;
  const parts = str.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 3).join(' ');
}

/**
 * Returns individually selected 1–3 word associative hints.
 * User specifications:
 * - Hints should be 1–3 words maximum.
 * - Non-generic associations describing function, typical use, habitat, characteristics, location, or cultural trait.
 * - Explicit examples strictly honored:
 *   * ল্যাপটপ / কম্পিউটার: gadget
 *   * ফ্যান / সিলিং ফ্যান: Electronic device
 *   * ছাতা: rain
 *   * রিকশা: transport
 *   * পাঞ্জাবি: masjid
 *   * রয়েল বেঙ্গল টাইগার: fierce
 *   * কুমির: live in water
 *   * প্রজাপতি: can fly
 *   * রসমালাই: sweet
 *   * বিরাট কোহলি: cricketer
 */
export function getHardHint(word: WordItem): HardHintResult {
  // 1. Direct word item fields if provided
  if (word.shortHintBn && word.shortHintEn) {
    return {
      bn: cleanTo1To3Words(word.shortHintBn, 'ইঙ্গিত'),
      en: cleanTo1To3Words(word.shortHintEn, 'Hint'),
    };
  }

  // 2. Comprehensive 480-word curated dictionary
  const found = lookupWordHint(word);
  return {
    bn: cleanTo1To3Words(found.bn, 'ইঙ্গিত'),
    en: cleanTo1To3Words(found.en, 'Hint'),
  };
}

// Generates short English explanation for secret word on citizen card
export function getShortExplanation(word: WordItem): string {
  if (word.explanationEn) return word.explanationEn;
  return word.wordEn;
}
