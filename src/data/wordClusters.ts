import { WordItem, CategoryId } from '../types/game';
import { ALL_WORDS } from './words';

// Defined semantic clusters of closely related items
export const WORD_CLUSTERS: string[][] = [
  // Birds
  ['কবুতর (পায়রা)', 'ময়না পাখি', 'টিয়া পাখি', 'শালিক', 'চড়ুই পাখি', 'কোকিল', 'দোয়েল', 'বুলবুলি', 'টুনটুনি', 'বাবুই পাখি', 'মাছরাঙা', 'বক', 'ঈগল', 'চিল', 'পেঁচা'],
  
  // Poets and Literary Authors
  ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জসিমউদদীন', 'শরৎচন্দ্র চট্টোপাধ্যায়', 'হুমায়ূন আহমেদ', 'মাইকেল মধুসূদন দত্ত', 'জীবনানন্দ দাশ', 'শামসুর রাহমান', 'সুকান্ত ভট্টাচার্য', 'বেগম রোকেয়া', 'সুফিয়া কামাল', 'ঈশ্বরচন্দ্র বিদ্যাসাগর'],
  
  // Bangladeshi Cricketers
  ['সাকিব আল হাসান', 'মাশরাফি বিন মর্তুজা', 'তামিম ইকবাল', 'মুশফিকুর রহিম', 'মাহমুদুল্লাহ রিয়াদ', 'মোস্তাফিজুর রহমান', 'লিটন দাস', 'তাসকিন আহমেদ', 'মোহাম্মদ আশরাফুল'],
  
  // World Football Legends
  ['লিওনেল মেসি', 'ক্রিশ্চিয়ান রোমেলো / ক্রিশ্চিয়ানো রোনালদো', 'ক্রিশ্চিয়ানো রোনালদো', 'মারাদোনা', 'পেলে', 'নেইমার', 'কিলিয়ান এমবাপ্পে', 'জিনেদিন জিদান', 'রোনালদিনহো', 'কাজী সালাউদ্দিন'],
  
  // Iconic Scientists
  ['অ্যালবার্ট আইনস্টাইন', 'আইজ্যাক নিউটন', 'জগদীশ চন্দ্র বসু', 'এপিজে আব্দুল কালাম', 'স্টিফেন হকিং', 'মেরি কুরি', 'সত্যেন্দ্রনাথ বসু', 'মেঘনাদ সাহা', 'কুদ্‌রাত-এ-খুদা'],
  
  // Tech Titans
  ['স্টিভ জবস', 'বিল গেটস', 'ইলন মাস্ক', 'মার্ক জাকারবার্গ', 'সুন্দর পিচাই', 'জেফ বেজোস'],
  
  // Cinema Superstars
  ['নায়ক রাজ রাজ্জাক', 'সালমান শাহ', 'শাকিব খান', 'রিয়াজ (অভিনেতা)', 'মান্না', 'ইলিয়াস কাঞ্চন', 'মোশাররফ করিম', 'চঞ্চল চৌধুরী', 'হুমায়ুন ফরীদি'],
  
  // Rock & Popular Singers
  ['জেমস (নগর বাউল)', 'আইয়ুব বাচ্চু', 'আজম খান', 'হাসান (আর্ক)', 'বালাম', 'তাহসান খান', 'হাবিব ওয়াহিদ', 'বাপ্পা মজুমদার'],
  
  // Classical & Melodious Singers
  ['রুনা লায়লা', 'সাবিনা ইয়াসমিন', 'এন্ড্রু কিশোর', 'সুবীর নন্দী', 'আব্দুল আলীম', 'ফরিদা পারভীন', 'শাহনাজ রহমতুল্লাহ', 'ফিরোজা বেগম'],
  
  // Freedom Fighters & National Icons
  ['বঙ্গবন্ধু শেখ মুজিবুর রহমান', 'তাজউদ্দীন আহমদ', 'মাওলানা ভাসানী', 'হোসেন শহীদ সোহরাওয়ার্দী', 'শেরে বাংলা এ কে ফজলুল হক', 'বীরশ্রেষ্ঠ মতিউর রহমান', 'বীরশ্রেষ্ঠ হামিদুর রহমান', 'প্রীতিলতা ওয়াদ্দেদার', 'মাস্টারদা সূর্য সেন', 'তিতুমীর'],
  
  // Traditional Rice Dishes
  ['কাচ্চি বিরিয়ানি', 'মোরগ পোলাও', 'তেহারি', 'ভুনা খিচুড়ি', 'ইলিশ পোলাও', 'পান্তা ভাত ও ইলিশ'],
  
  // Traditional Sweets
  ['রসগোল্লা', 'মিষ্টি দই', 'রসমালাই', 'চমচম', 'কাঁচাগোল্লা', 'বালুশাহী', 'গোলাপ জাম', 'সন্দেশ', 'রসমঞ্জরী'],
  
  // Street Snacks
  ['ফুচকা', 'চটপটি', 'ঝালমুড়ি', 'সিঙাড়া', 'সমুচা', 'ভেলপুরি', 'আমড়া মাখা', 'দই ফুচকা', 'ডালপুরি'],
  
  // Pitha Varieties
  ['ভাপা পিঠা', 'চিতই পিঠা', 'পাটিসাপটা পিঠা', 'দুধ পুলি', 'তেল পিঠা', 'নকশী পিঠা', 'মেরা পিঠা'],
  
  // Spicy Meat Dishes
  ['কালা ভুনা', 'হালিম', 'গরুর রেজালা', 'খাসির মাংস', 'হাঁসের মাংস ও চিতই পিঠা', 'চুইঝাল মাংস', 'শিক কাবাব', 'বটি কাবাব'],
  
  // Traditional Fish Delicacies
  ['শর্ষে ইলিশ', 'রুই মাছের ঝোল', 'চিংড়ি মালাইকারি', 'পাবদা মাছ', 'কৈ মাছ', 'চিতল মাছের মুইঠ্যা', 'রূপচাঁদা ফ্রাই', 'লইট্টা শুঁটকি ভুনা'],
  
  // Fast Food Delights
  ['বার্গার', 'পিৎজা', 'পাস্তা', 'মোমো', 'ফ্রাই চিকেন', 'স্যান্ডউইচ', 'চিকেন রোল', 'টাকো'],
  
  // Cold & Hot Beverages
  ['বোরহানি', 'চা / দুধ চা', 'কফি / কোল্ড কফি', 'ডাবের পানি', 'লেবুর শরবত', 'আখের রস', 'লাচ্ছি', 'রুহ আফজা', 'মাঠা'],
  
  // Big Wild Mammals
  ['রয়েল বেঙ্গল টাইগার', 'সিংহ', 'চিতাবাঘ', 'হাতি', 'গণ্ডার', 'চিত্রা হরিণ', 'ঘোড়া', 'শিয়াল', 'বানর'],
  
  // Scaly Reptiles
  ['কুমির', 'কিং কোবরা / শঙ্খচূড়', 'অজগর', 'গোখরো সাপ', 'গুইসাপ', 'কচ্ছপ', 'গিরগিটি', 'তক্ষক'],
  
  // Marine & River Aquatic Animals
  ['শুশুক / ডলফিন', 'নীল তিমি', 'হাঙর', 'অক্টোপাস', 'জেলিফিশ', 'চিংড়ি (গলদা / বাগদা)', 'কাঁকড়া', 'ইলিশ মাছ'],
  
  // Flying & Small Insects
  ['মৌমাছি', 'প্রজাপতি', 'মশা', 'তেলাপোকা', 'পিঁপড়া', 'ঝিঁঝিঁ পোকা', 'জোনাকি', 'ঘাসফড়িং', 'মাকড়সা'],
  
  // Kitchen Utensils & Cutting
  ['বটি / দা', 'ছুরি', 'কড়াই', 'প্রেশার কুকার', 'হাতা / খুন্তি', 'বেলুন-পিরি', 'ব্লেন্ডার', 'শিল-পাটা', 'তাওয়া'],
  
  // Home Furniture
  ['খাট / পালঙ্ক', 'সোফা', 'আলমারি / ওয়ারড্রোব', 'ডাইনিং টেবিল', 'ড্রেসিং টেবিল', 'বইয়ের র্যাক', 'রিডিং টেবিল'],
  
  // Traditional & Casual Clothing
  ['শাড়ি (জামদানি / কাতান)', 'পাঞ্জাবি', 'লুঙ্গি', 'শার্ট', 'টি-শার্ট', 'জিন্স প্যান্ট', 'সালোয়ার কামিজ', 'বোরকা', 'কুর্তি'],
  
  // Tourist Sea Beaches
  ['কক্সবাজার সমুদ্র সৈকত', 'কুয়াকাটা সৈকত', 'সেন্ট মার্টিন দ্বীপ', 'ইনানী সৈকত', 'পতেঙ্গা সৈকত', 'সোনার চর', 'হিমছড়ি সৈকত'],
  
  // Hill Stations & Mountain Escapes
  ['সাজেক ভ্যালি', 'নীলগিরি রিসোর্ট', 'বগা লেক', 'নাফাখুম জলপ্রপাত', 'কেঁওক্রাডং', 'মাধবকুণ্ড জলপ্রপাত', 'নীলাচল পাহাড়', 'ডিম পাহাড়'],
  
  // Historic Forts & Palaces
  ['লালবাগ কেল্লা', 'মহাস্থানগড়', 'আহসান মঞ্জিল', 'ষাট গম্বুজ মসজিদ', 'সোনারগাঁও পানাম নগর', 'শালবন বিহার', 'সোমপুর মহাবিহার', 'কান্তজিউ মন্দির', 'উত্তরা গণভবন', 'বালিয়াটি প্রাসাদ', 'তাজহাট রাজবাড়ি'],
  
  // Popular Sports
  ['ক্রিকেট', 'ফুটবল', 'হা-ডু-ডু', 'ব্যাডমিন্টন', 'ক্যারম বোর্ড', 'দাবা', 'ভলিবল', 'টেনিস', 'টেবিল টেনিস', 'সাঁতার'],
  
  // Technology & Gadgets
  ['স্মার্টফোন', 'ল্যাপটপ', 'ট্যাবলেট / আইপ্যাড', 'স্মার্টওয়াচ', 'ওয়্যারলেস এয়ারবাডস', 'ব্লুটুথ স্পিকার', 'গেমিং কনসোল', 'ড্রোন'],
  
  // School Life Items
  ['টিফিন বক্স', 'জ্যামিতি বক্স', 'পেন্সিল বক্স', 'স্কুল ড্রেস', 'হোমওয়ার্ক ডায়েরি', 'রিপোর্ট কার্ড', 'স্কুল ব্যাগ'],
  
  // Everyday Commute Vehicles
  ['রিকশা', 'সিএনজি অটো রিকশা', 'বাস / লোকাল বাস', 'লেগুনা', 'মোটরসাইকেল / বাইক', 'মেট্রোরেল', 'উবার / রাইডশেয়ার']
];

// Helper to normalize names for fuzzy matching
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[()\/,\-.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find close word choices for imposter guess
export function getSmartGuessChoices(correctWord: WordItem, category?: CategoryId): WordItem[] {
  const normCorrectBn = normalizeText(correctWord.wordBn);
  const normCorrectEn = normalizeText(correctWord.wordEn);

  // 1. Try to find an explicit semantic cluster that contains the correct word
  let matchedCluster: string[] | null = null;
  for (const cluster of WORD_CLUSTERS) {
    const isInside = cluster.some((item) => {
      const norm = normalizeText(item);
      return (
        norm.includes(normCorrectBn) ||
        normCorrectBn.includes(norm) ||
        (normCorrectEn && norm.includes(normCorrectEn))
      );
    });

    if (isInside) {
      matchedCluster = cluster;
      break;
    }
  }

  const categoryPool = ALL_WORDS.filter((w) => w.id !== correctWord.id && (!category || w.category === category));

  // If cluster matched, select 3 distractors from that cluster
  if (matchedCluster) {
    const clusterMatches: WordItem[] = [];
    const usedIds = new Set<number>([correctWord.id]);

    for (const clusterName of matchedCluster) {
      const normClusterName = normalizeText(clusterName);
      if (normClusterName.includes(normCorrectBn) || normCorrectBn.includes(normClusterName)) {
        continue;
      }

      // Find corresponding WordItem in ALL_WORDS
      const found = ALL_WORDS.find((w) => {
        if (usedIds.has(w.id)) return false;
        const normW = normalizeText(w.wordBn);
        return normW.includes(normClusterName) || normClusterName.includes(normW);
      });

      if (found) {
        usedIds.add(found.id);
        clusterMatches.push(found);
      } else {
        // If exact WordItem not in dataset, synthesize closely matching item
        const syntheticItem: WordItem = {
          id: 90000 + Math.floor(Math.random() * 8999),
          category: correctWord.category,
          wordBn: clusterName,
          wordEn: clusterName,
          hintBn: correctWord.hintBn,
          hintEn: correctWord.hintEn,
        };
        clusterMatches.push(syntheticItem);
      }

      if (clusterMatches.length >= 3) break;
    }

    if (clusterMatches.length >= 3) {
      const selected = clusterMatches.slice(0, 3);
      const choices = [correctWord, ...selected].sort(() => 0.5 - Math.random());
      return choices;
    }
  }

  // 2. Intelligent semantic fallback:
  // Score candidates in the same category by token overlap and semantic affinity
  const correctTokens = normCorrectBn.split(' ').filter((t) => t.length > 2);
  const scored = categoryPool.map((candidate) => {
    let score = 0;
    const normCand = normalizeText(candidate.wordBn);
    const candTokens = normCand.split(' ');

    // Check shared tokens (e.g. "পাখি", "মাছ", "মসজিদ", "মন্দির", "সৈকত", "বিরিয়ানি", "পিঠা")
    for (const token of correctTokens) {
      if (normCand.includes(token)) score += 10;
    }

    // Check hint token overlap (subtopic proximity)
    const normCorrectHint = normalizeText(correctWord.hintBn || '');
    const normCandHint = normalizeText(candidate.hintBn || '');
    const hintKeywords = ['পাখি', 'মাছ', 'মিষ্টি', 'খাবার', 'লেখক', 'কবি', 'পশু', 'গাছ', 'নদী', 'পাহাড়', 'সৈকত', 'ঐতিহাসিক', 'ক্রিকেট', 'ফুটবল', 'যানবাহন'];
    for (const kw of hintKeywords) {
      if (normCorrectHint.includes(kw) && normCandHint.includes(kw)) {
        score += 8;
      }
    }

    // Subcategory proximity
    if (candidate.category === correctWord.category) {
      score += 3;
    }

    // Add small random noise for variety
    score += Math.random();

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3).map((s) => s.candidate);

  const choices = [correctWord, ...top3].sort(() => 0.5 - Math.random());
  return choices;
}
