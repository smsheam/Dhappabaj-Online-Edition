import { GoogleGenAI } from '@google/genai';
import { WordItem } from '../types/game';

const CACHE_PREFIX = 'dhappabaj_ai_definition_v2_';

export interface AiWordDescription {
  en: string;
  bn?: string;
}

// Fallback real-world dictionary definitions and working methods by category
function generateFallbackDefinition(word: WordItem): AiWordDescription {
  const cat = word.category;
  const wordEn = word.wordEn || word.wordBn;

  let def = `${wordEn} is a distinct entity categorized under ${cat}, defined by its real-world function, characteristics, and practical role.`;

  if (cat === 'food') {
    def = `${wordEn} is a nutritious substance consumed by living organisms to sustain growth, energy, and vital functions, prepared through culinary methods like cooking, boiling, or baking.`;
  } else if (cat === 'animal') {
    def = `${wordEn} is a living multicellular organism that feeds on organic matter, breathes oxygen, possesses sensory organs, and interacts with its ecosystem through instinctual behaviors.`;
  } else if (cat === 'people' || cat === 'professions') {
    def = `${wordEn} is a profession or recognized individual role specialized in executing specific tasks, applying professional training, and fulfilling socio-economic responsibilities.`;
  } else if (cat === 'tech') {
    def = `${wordEn} is an electronic apparatus or digital software system operating via microprocessors, algorithmic logic, or networked electrical circuitry to process information and execute commands.`;
  } else if (cat === 'bd_tourist' || cat === 'historical_places' || cat === 'landmarks' || cat === 'geography') {
    def = `${wordEn} is a geographically recognized location or historical architectural monument characterized by distinct cultural heritage, topographical features, or public significance.`;
  } else if (cat === 'sports') {
    def = `${wordEn} is a physical activity or regulated competitive game governed by formalized rules, requiring athletic skills, strategic teamwork, or individual physical exertion.`;
  } else if (cat === 'science') {
    def = `${wordEn} is a scientific principle, phenomenon, or natural entity investigated through empirical observation, reproducible testing, and systematic natural laws.`;
  } else if (cat === 'transport') {
    def = `${wordEn} is a mechanical conveyance or vehicle engineered to transport passengers and freight across designated transit routes using motorized or kinetic propulsion.`;
  } else if (cat === 'clothing') {
    def = `${wordEn} is an item of apparel or textile wear manufactured to protect, cover, insulate, or adorn the human body in diverse climatic and social settings.`;
  } else if (cat === 'object') {
    def = `${wordEn} is a physical artifact or utilitarian instrument constructed from material components to perform designated mechanical, domestic, or industrial operations.`;
  }

  return { en: def };
}

// Global in-memory cache to prevent redundant fetches
const inMemoryCache = new Map<number, AiWordDescription>();

export async function getAiWordDescription(word: WordItem): Promise<AiWordDescription> {
  const fallback = generateFallbackDefinition(word);

  if (inMemoryCache.has(word.id)) {
    return inMemoryCache.get(word.id)!;
  }

  const cacheKey = `${CACHE_PREFIX}${word.id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as AiWordDescription;
      if (parsed.en) {
        inMemoryCache.set(word.id, parsed);
        return parsed;
      }
    }
  } catch {}

  // Attempt live generation via Google GenAI SDK if API key is available
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    inMemoryCache.set(word.id, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetTerm = word.wordEn || word.wordBn;
    const prompt = `Provide ONLY the accurate, real-world factual definition or working method of the term "${targetTerm}" (Category: "${word.category}").
Rules:
- Write strictly in English.
- No conversational text, no intro, no instructions, no markdown formatting.
- Only the definition or working method in 1 to 2 concise sentences explaining what it is and how it functions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    if (text) {
      // Strip any extra quotes or markdown fences
      const cleanText = text.replace(/^["']|["']$/g, '').replace(/```.*?\n|```/g, '').trim();
      const result: AiWordDescription = { en: cleanText };
      inMemoryCache.set(word.id, result);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch (err) {
    console.warn('AI word definition generation failed, using fallback:', err);
  }

  inMemoryCache.set(word.id, fallback);
  return fallback;
}
