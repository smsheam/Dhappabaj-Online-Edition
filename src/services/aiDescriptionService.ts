import { GoogleGenAI } from '@google/genai';
import { WordItem, Language } from '../types/game';

const CACHE_PREFIX = 'dhappabaj_ai_desc_v1_';

export interface AiWordDescription {
  bn: string;
  en: string;
}

// Fallback smart descriptions when offline or before AI resolves
function generateFallbackDescription(word: WordItem): AiWordDescription {
  const cat = word.category;
  const wordBn = word.wordBn;
  const wordEn = word.wordEn;

  let descBn = `"${wordBn}" হলো ${cat} ক্যাটাগরির একটি সুপরিচিত বিষয়। এটি সম্পর্কে সংকেত দেওয়ার সময় এর ব্যবহার, বৈশিষ্ট্য বা অনুভূতির ওপর জোর দিন।`;
  let descEn = `"${wordEn}" is a well-known item in the ${cat} category. When giving your clue, focus on its function, daily appearance, or unique traits.`;

  if (cat === 'food') {
    descBn = `"${wordBn}" একটি জনপ্রিয় খাবার বা পানীয়। এটি কীভাবে রান্না করা হয়, এর স্বাদ কেমন বা কখন খাওয়া হয় তা নিয়ে চতুর ক্লু দিন।`;
    descEn = `"${wordEn}" is a popular food or beverage item. Think about its distinctive taste, preparation, or dining occasions when dropping your clue.`;
  } else if (cat === 'animal') {
    descBn = `"${wordBn}" একটি পরিচিত প্রাণী বা জীব। এর শারীরিক বৈশিষ্ট্য, স্বভাব, ডাক বা প্রাকৃতিক আবাসস্থল মাথায় রেখে ইঙ্গিত দিন।`;
    descEn = `"${wordEn}" is a living creature or animal. Think of its natural habitat, movement, behavior, or sound to form your clue.`;
  } else if (cat === 'people' || cat === 'professions') {
    descBn = `"${wordBn}" একটি সুনির্দিষ্ট পেশা বা ব্যক্তিত্বের ধরণ। তারা সমাজে কী ভূমিকা পালন করেন বা কী পোশাক/সরঞ্জাম ব্যবহার করেন তা নিয়ে বলুন।`;
    descEn = `"${wordEn}" represents a profession or character role. Reflect on their tools, workplace, or responsibilities when crafting your clue.`;
  } else if (cat === 'tech') {
    descBn = `"${wordBn}" একটি আধুনিক প্রযুক্তি বা ইলেকট্রনিক্স সরঞ্জাম। এটি আমরা যোগাযোগের বা কাজের কী কাজে ব্যবহার করি তা স্মরণ করুন।`;
    descEn = `"${wordEn}" is a tech device, software, or digital concept. Consider its everyday utility and how people interact with it.`;
  } else if (cat === 'bd_tourist' || cat === 'historical_places' || cat === 'landmarks' || cat === 'geography') {
    descBn = `"${wordBn}" একটি দর্শনীয় ভৌগোলিক স্থান বা ঐতিহাসিক নিদর্শন। এর বিশেষত্ব ও গুরুত্ব নিয়ে পরোক্ষ সংকেত দিন।`;
    descEn = `"${wordEn}" is a notable geographic spot, attraction, or landmark. Give subtle hints regarding its atmosphere and significance.`;
  }

  return { bn: descBn, en: descEn };
}

// Global in-memory cache to prevent redundant fetches within current browser session
const inMemoryCache = new Map<number, AiWordDescription>();

export async function getAiWordDescription(word: WordItem): Promise<AiWordDescription> {
  const fallback = generateFallbackDescription(word);

  if (inMemoryCache.has(word.id)) {
    return inMemoryCache.get(word.id)!;
  }

  const cacheKey = `${CACHE_PREFIX}${word.id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as AiWordDescription;
      inMemoryCache.set(word.id, parsed);
      return parsed;
    }
  } catch {}

  // Attempt live generation via Google GenAI SDK if API key is present
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    inMemoryCache.set(word.id, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the game master for a social deduction party game 'Dhappabaj'.
The innocent players were given this secret word: "${word.wordBn}" (${word.wordEn}) in category "${word.category}".
Provide a clear, clever, concise 1-sentence description in Bengali and 1 sentence in English explaining what this word represents in everyday life, so innocent players who may not be experts have an immediate, vivid grasp of the word to give great clues.
Format output strictly as JSON with keys "bn" and "en" only. No markdown fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.bn && parsed.en) {
      const result: AiWordDescription = {
        bn: parsed.bn.trim(),
        en: parsed.en.trim(),
      };
      inMemoryCache.set(word.id, result);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch (err) {
    console.warn('AI word description generation failed, using smart fallback:', err);
  }

  inMemoryCache.set(word.id, fallback);
  return fallback;
}
