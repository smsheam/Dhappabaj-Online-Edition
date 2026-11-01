import { WordItem } from '../types/game';

// In-memory cache for word images to guarantee zero flicker and instant subsequent loads
const imageMemoryCache = new Map<string, string>();

/**
 * Curated high-resolution images for popular / iconic terms to ensure instant loading
 */
const CURATED_IMAGES: Record<string, string> = {
  // Foods
  'কাচ্চি বিরিয়ানি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Dum_Biryani.jpg/640px-Hyderabadi_Dum_Biryani.jpg',
  'ফুচকা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Pani_Puri_1.JPG/640px-Pani_Puri_1.JPG',
  'ইলিশ পোলাও': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ilish_Polao.jpg/640px-Ilish_Polao.jpg',
  'মিষ্টি দই': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mishti_Doi_%28Sweet_Curd%29.jpg/640px-Mishti_Doi_%28Sweet_Curd%29.jpg',
  'রসগোল্লা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rasgulla_sweet.jpg/640px-Rasgulla_sweet.jpg',
  'রসমালাই': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Rasmalai_at_home.jpg/640px-Rasmalai_at_home.jpg',
  'বাকরখানি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bakarkhani_at_Dhaka.jpg/640px-Bakarkhani_at_Dhaka.jpg',
  'পিৎজা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/640px-Pizza-3007395.jpg',
  'বার্গার': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/640px-Hamburger_%28black_bg%29.jpg',
  'ঝালমুড়ি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jhalmuri_in_paper_cone.jpg/640px-Jhalmuri_in_paper_cone.jpg',
  'হালিম': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Hyderabadi_Haleem.JPG/640px-Hyderabadi_Haleem.JPG',
  'সিঙাড়া': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Samosa-with-sauce.jpg/640px-Samosa-with-sauce.jpg',
  'চটপটি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chotpoti.JPG/640px-Chotpoti.JPG',
  'কালা ভুনা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Kala_Bhuna_Meat.jpg/640px-Kala_Bhuna_Meat.jpg',
  'বোরহানি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Borhani_Drink.jpg/640px-Borhani_Drink.jpg',
  'জিলাপি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Jalebi_India.jpg/640px-Jalebi_India.jpg',

  // People
  'বঙ্গবন্ধু শেখ মুজিবুর রহমান': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Sheikh_Mujibur_Rahman_in_1972.jpg/640px-Sheikh_Mujibur_Rahman_in_1972.jpg',
  'কাজী নজরুল ইসলাম': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kazi_Nazrul_Islam_1940s.jpg/640px-Kazi_Nazrul_Islam_1940s.jpg',
  'রবীন্দ্রনাথ ঠাকুর': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Rabindranath_Tagore_in_1909.jpg/640px-Rabindranath_Tagore_in_1909.jpg',
  'হুমায়ূন আহমেদ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Humayun_Ahmed_in_New_York_%28cropped%29.jpg/640px-Humayun_Ahmed_in_New_York_%28cropped%29.jpg',
  'ড. মুহাম্মদ ইউনূস': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Muhammad_Yunus_WEF_2009.jpg/640px-Muhammad_Yunus_WEF_2009.jpg',
  'মাশরাফি বিন মর্তুজা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mashrafe_Mortaza_2018.jpg/640px-Mashrafe_Mortaza_2018.jpg',
  'সাকিব আল হাসান': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Shakib_Al_Hasan_2018.jpg/640px-Shakib_Al_Hasan_2018.jpg',
  'লিওনেল মেসি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/640px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg',
  'ক্রিশ্চিয়ানো রোনালদো': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg/640px-Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg',
  'স্টিভ জবস': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Steve_Jobs_with_red_shawl_edit.jpg/640px-Steve_Jobs_with_red_shawl_edit.jpg',
  'অ্যালবার্ট আইনস্টাইন': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/640px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
  'বিল গেটস': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/640px-Bill_Gates_2017_%28cropped%29.jpg',
  'ইলন মাস্ক': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Elon_Musk_Royal_Society_crop.jpg/640px-Elon_Musk_Royal_Society_crop.jpg',
  'বিরাট কোহলি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Virat_Kohli_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium_05.jpg/640px-Virat_Kohli_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium_05.jpg',

  // Objects
  'ল্যাপটপ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Dell_Inspiron_1525_laptop.jpg/640px-Dell_Inspiron_1525_laptop.jpg',
  'স্মার্টফোন': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_%C3%A9cran_smartphone_P20.jpg/640px-Image_%C3%A9cran_smartphone_P20.jpg',
  'রিকশা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/JapaneseRickshaw.jpg/640px-JapaneseRickshaw.jpg',
  'ছাতা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/M033_regenschirm_zu.jpg/640px-M033_regenschirm_zu.jpg',
  'পাঞ্জাবি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kurta_Pajama_Traditional_Indian_Men_Garment.jpg/640px-Kurta_Pajama_Traditional_Indian_Men_Garment.jpg',
  'লুঙ্গি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Lungi_Indian_wear.jpg/640px-Lungi_Indian_wear.jpg',
  'সিলিং ফ্যান': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ceiling_fan.jpg/640px-Ceiling_fan.jpg',
  'হাতঘড়ি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Wristwatch_wristwatch.jpg/640px-Wristwatch_wristwatch.jpg',
  'চশমা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Glasses_against_white_background.jpg/640px-Glasses_against_white_background.jpg',
  'ক্যামেরা': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Leica_M9_black_front.png/640px-Leica_M9_black_front.png',
  'ফুটবল': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Football_%28soccer_ball%29.svg/640px-Football_%28soccer_ball%29.svg.png',
  'ক্রিকেট ব্যাট': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Cricket_bat_and_ball.jpg/640px-Cricket_bat_and_ball.jpg',
  'গিটার': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/GuitareClassique5.png/640px-GuitareClassique5.png',
  'পদ্মা সেতু (মডেল/স্মারক)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Padma_Multipurpose_Bridge_under_construction_-_September_2021_%28cropped%29.jpg/640px-Padma_Multipurpose_Bridge_under_construction_-_September_2021_%28cropped%29.jpg',

  // Animals
  'রয়েল বেঙ্গল টাইগার': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/640px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg',
  'দোয়েল': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Oriental_magpie-robin_%28Copsychus_saularis_erimelas%29_male.jpg/640px-Oriental_magpie-robin_%28Copsychus_saularis_erimelas%29_male.jpg',
  'ইলিশ মাছ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Ilish_%28Tenualosa_ilisha%29_in_a_market_in_Kolkata.jpg/640px-Ilish_%28Tenualosa_ilisha%29_in_a_market_in_Kolkata.jpg',
  'হাতি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/640px-African_Bush_Elephant.jpg',
  'সিংহ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg',
  'কুমির': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Nile_crocodile_head.jpg/640px-Nile_crocodile_head.jpg',
  'প্রজাপতি': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Fesoj_-_Papilio_machaon_%28by%29.jpg/640px-Fesoj_-_Papilio_machaon_%28by%29.jpg',
  'ময়ূর': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Peacock_Plumage.jpg/640px-Peacock_Plumage.jpg',
  'ঘোড়া': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Nokota_Horses_cropped.jpg/640px-Nokota_Horses_cropped.jpg',
  'চিতাবাঘ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Leopard_africa.jpg/640px-Leopard_africa.jpg',
};

// Strips unnecessary parentheses or secondary names to construct best search term
function cleanQueryTerm(rawWord: string): string {
  return rawWord
    .replace(/\(.*?\)/g, '')
    .replace(/\//g, ' ')
    .trim()
    .split(/\s+/)[0] || rawWord;
}

/**
 * Searches and fetches picture for a secret word using Wikipedia & Wikimedia APIs
 */
export async function getWordImageUrl(word: WordItem): Promise<string | null> {
  const cacheKey = `img-${word.id}-${word.wordBn}`;

  // 1. Check in-memory cache
  if (imageMemoryCache.has(cacheKey)) {
    return imageMemoryCache.get(cacheKey)!;
  }

  // 2. Check curated instant mapping
  if (CURATED_IMAGES[word.wordBn]) {
    const url = CURATED_IMAGES[word.wordBn];
    imageMemoryCache.set(cacheKey, url);
    return url;
  }

  // 3. Check browser localStorage cache
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      imageMemoryCache.set(cacheKey, stored);
      return stored;
    }
  } catch {}

  // 4. Clean queries to search
  const englishClean = word.wordEn
    .replace(/\(.*?\)/g, '')
    .replace(/\//g, ' ')
    .trim();

  const searchQueries = [
    englishClean,
    cleanQueryTerm(word.wordEn),
    word.wordBn,
  ].filter(Boolean);

  for (const q of searchQueries) {
    try {
      // Try Wikipedia REST API summary
      const cleanSlug = encodeURIComponent(q.replace(/\s+/g, '_'));
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanSlug}`;
      const res = await fetch(summaryUrl);
      if (res.ok) {
        const data = await res.json();
        const foundUrl = data.thumbnail?.source || data.originalimage?.source;
        if (foundUrl) {
          imageMemoryCache.set(cacheKey, foundUrl);
          try {
            localStorage.setItem(cacheKey, foundUrl);
          } catch {}
          return foundUrl;
        }
      }
    } catch {}

    try {
      // Fallback: Wikipedia generator search
      const actionSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json&origin=*`;
      const res = await fetch(actionSearchUrl);
      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const firstPage = Object.values(pages)[0] as { thumbnail?: { source: string } };
          if (firstPage?.thumbnail?.source) {
            const foundUrl = firstPage.thumbnail.source;
            imageMemoryCache.set(cacheKey, foundUrl);
            try {
              localStorage.setItem(cacheKey, foundUrl);
            } catch {}
            return foundUrl;
          }
        }
      }
    } catch {}
  }

  // Fallback to Unsplash topic photo
  const unsplashFallback = `https://images.unsplash.com/featured/?${encodeURIComponent(englishClean || word.category)}`;
  imageMemoryCache.set(cacheKey, unsplashFallback);
  return unsplashFallback;
}

/**
 * Preloads the image into cache ahead of time (e.g. right when round starts)
 */
export function preloadWordImage(word: WordItem): void {
  getWordImageUrl(word).catch(() => {});
}
