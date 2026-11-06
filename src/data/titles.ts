export interface TitlePair {
  bn: string;
  en: string;
  icon?: string;
}

export interface ScenePack {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  firstPlayerTitle: TitlePair;
  titles: TitlePair[];
}

/**
 * 65+ Authentic Bangladeshi Professions for distinct, randomized player designations.
 * Replaces the static cabinet/ministry theme with everyday familiar professions.
 */
export const BANGLADESHI_PROFESSIONS: TitlePair[] = [
  { bn: 'প্রধান শিক্ষক 📚', en: 'Headmaster 📚' },
  { bn: 'ডাক্তার 🩺', en: 'Doctor 🩺' },
  { bn: 'সফটওয়্যার ইঞ্জিনিয়ার 💻', en: 'Software Engineer 💻' },
  { bn: 'রিকশাচালক 🛺', en: 'Rickshaw Puller 🛺' },
  { bn: 'অনুসন্ধানী সাংবাদিক 📰', en: 'Journalist 📰' },
  { bn: 'পুলিশ অফিসার 👮‍♂️', en: 'Police Officer 👮‍♂️' },
  { bn: 'ব্যবসায়ী 💼', en: 'Businessman 💼' },
  { bn: 'কৃষক 🌾', en: 'Farmer 🌾' },
  { bn: 'বিমান চালক (পাইলট) 👨‍✈️', en: 'Pilot 👨‍✈️' },
  { bn: 'হাইকোর্টের আইনজীবী ⚖️', en: 'Lawyer ⚖️' },
  { bn: 'ব্যাংকার 🏦', en: 'Banker 🏦' },
  { bn: 'সিনিয়র নার্স 👩‍⚕️', en: 'Senior Nurse 👩‍⚕️' },
  { bn: 'মুদি দোকানদার 🏪', en: 'Grocer 🏪' },
  { bn: 'প্রধান বাবুর্চি / শেফ 👨‍🍳', en: 'Head Chef 👨‍🍳' },
  { bn: 'চারুকলার চিত্রশিল্পী 🎨', en: 'Painter / Artist 🎨' },
  { bn: 'সংগীতশিল্পী 🎤', en: 'Musician 🎤' },
  { bn: 'ওয়েডিং ফটোগ্রাফার 📸', en: 'Photographer 📸' },
  { bn: 'ইলেকট্রিশিয়ান 🔌', en: 'Electrician 🔌' },
  { bn: 'কাঠমিস্ত্রি 🪚', en: 'Carpenter 🪚' },
  { bn: 'দক্ষ দর্জি 🧵', en: 'Tailor 🧵' },
  { bn: 'বাস ড্রাইভার 🚌', en: 'Bus Driver 🚌' },
  { bn: 'সিএনজি চালক 🛵', en: 'CNG Driver 🛵' },
  { bn: 'নৌকার মাঝি ⛵', en: 'Boatman ⛵' },
  { bn: 'পদ্মার ইলিশ জেলে 🎣', en: 'Fisherman 🎣' },
  { bn: 'রাজমিস্ত্রি 🧱', en: 'Mason 🧱' },
  { bn: 'টংয়ের চা বিক্রেতা ☕', en: 'Tea Vendor ☕' },
  { bn: 'চিঠির পিয়ন (পোস্টম্যান) ✉️', en: 'Postman ✉️' },
  { bn: 'কবি ও সাহিত্যিক ✍️', en: 'Poet & Writer ✍️' },
  { bn: 'বিজ্ঞানী ও গবেষক 🔬', en: 'Scientist 🔬' },
  { bn: 'বিশ্ববিদ্যালয় অধ্যাপক 🎓', en: 'Professor 🎓' },
  { bn: 'চার্টার্ড অ্যাকাউন্ট্যান্ট 📊', en: 'Chartered Accountant 📊' },
  { bn: 'স্থপতি (আর্কিটেক্ট) 📐', en: 'Architect 📐' },
  { bn: 'ফায়ার ফাইটার 🚒', en: 'Firefighter 🚒' },
  { bn: 'জেলা জজ 👨‍⚖️', en: 'Judge 👨‍⚖️' },
  { bn: 'কাস্টমস অফিসার 🛂', en: 'Customs Officer 🛂' },
  { bn: 'রাইডার / ডেলিভারি ম্যান 📦', en: 'Delivery Rider 📦' },
  { bn: 'ফুড ভ্লগার 🍲', en: 'Food Vlogger 🍲' },
  { bn: 'ইউটিউবার 📹', en: 'Content Creator 📹' },
  { bn: 'এসি মেকানিক ❄️', en: 'AC Technician ❄️' },
  { bn: 'প্লাম্বার 🔧', en: 'Plumber 🔧' },
  { bn: 'নিরাপত্তারক্ষী 🛡️', en: 'Security Guard 🛡️' },
  { bn: 'ফ্যাশন ডিজাইনার 👗', en: 'Fashion Designer 👗' },
  { bn: 'জাতীয় দলের ক্রিকেটার 🏏', en: 'National Cricketer 🏏' },
  { bn: 'ফুটবলার ⚽', en: 'Footballer ⚽' },
  { bn: 'পরিচ্ছন্নতাকর্মী 🧹', en: 'Sanitation Worker 🧹' },
  { bn: 'সেলুন হেয়ার স্টাইলিস্ট ✂️', en: 'Hairstylist ✂️' },
  { bn: 'চর্মকার (মুচি) 👞', en: 'Cobbler 👞' },
  { bn: 'স্বর্ণকার 💍', en: 'Goldsmith 💍' },
  { bn: 'মৃৎশিল্পী (কুমার) 🏺', en: 'Potter 🏺' },
  { bn: 'কর্মকার (কামার) 🔨', en: 'Blacksmith 🔨' },
  { bn: 'ট্রাফিক পুলিশ 🚦', en: 'Traffic Police 🚦' },
  { bn: 'রেডিও জকি (আরজে) 📻', en: 'Radio Jockey 📻' },
  { bn: 'ইভেন্ট প্ল্যানার 🎈', en: 'Event Planner 🎈' },
  { bn: 'ট্যুর গাইড 🧳', en: 'Tour Guide 🧳' },
  { bn: 'থ্রিডি অ্যানিমেটর 🎬', en: '3D Animator 🎬' },
  { bn: 'ফার্মাসিস্ট 💊', en: 'Pharmacist 💊' },
  { bn: 'লাইব্রেরিয়ান 📖', en: 'Librarian 📖' },
  { bn: 'পশু চিকিৎসক 🐾', en: 'Veterinarian 🐾' },
  { bn: 'কেবিন ক্রু / বিমানবালা 🛫', en: 'Flight Attendant 🛫' },
  { bn: 'ডেটা সায়েন্টিস্ট 📈', en: 'Data Scientist 📈' },
  { bn: 'সাইবার সিকিউরিটি স্পেশালিস্ট 🔐', en: 'Cybersecurity Expert 🔐' },
  { bn: 'পরিবেশ আন্দোলনকর্মী 🌳', en: 'Environmentalist 🌳' },
  { bn: 'প্রত্নতাত্ত্বিক 🏛️', en: 'Archaeologist 🏛️' },
  { bn: 'ফিটনেস ট্রেনার 💪', en: 'Fitness Coach 💪' },
  { bn: 'গ্রাফিক ডিজাইনার 🎨', en: 'Graphic Designer 🎨' },
];

/**
 * Assigns distinctly randomized Bangladeshi professions to all players in a match.
 * No duplicates within the same match.
 */
export function assignRandomBangladeshiDesignations(count: number): TitlePair[] {
  const shuffled = [...BANGLADESHI_PROFESSIONS].sort(() => 0.5 - Math.random());
  const selected: TitlePair[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }
  return selected;
}

export const SCENE_PACKS: ScenePack[] = [
  {
    id: 'bangladesh_professions',
    nameBn: 'বাংলার পেশাজীবী সমাজ',
    nameEn: 'Bangladeshi Professions Society',
    icon: '🇧🇩',
    firstPlayerTitle: { bn: 'প্রধান শিক্ষক 📚', en: 'Headmaster 📚' },
    titles: BANGLADESHI_PROFESSIONS.slice(1),
  },
  {
    id: 'police',
    nameBn: 'পুলিশ স্টেশন ও তদন্ত শাখা',
    nameEn: 'Police Station & Investigation',
    icon: '👮‍♂️',
    firstPlayerTitle: { bn: 'পুলিশ কমিশনার 👮‍♂️', en: 'Police Commissioner 👮‍♂️' },
    titles: [
      { bn: 'এসপি সাহেব 🚓', en: 'Superintendent of Police 🚓' },
      { bn: 'ওসি সাহেব 🏢', en: 'Officer-in-Charge (OC) 🏢' },
      { bn: 'সিআইডি স্পেশাল গোয়েন্দা 🔍', en: 'CID Special Detective 🔍' },
      { bn: 'ফরেনসিক বিশেষজ্ঞ 🔬', en: 'Forensic Specialist 🔬' },
      { bn: 'ডিবি কর্মকর্তা 🕶️', en: 'Detective Branch Officer 🕶️' },
      { bn: 'আন্ডারকভার স্পাই 🕵️', en: 'Undercover Spy 🕵️' },
      { bn: 'এসআই তদন্ত কর্মকর্তা 📋', en: 'Sub-Inspector (SI) 📋' },
      { bn: 'ট্রাফিক সার্জেন্ট 🚦', en: 'Traffic Sergeant 🚦' },
      { bn: 'ওয়্যারলেস অপারেটর 📻', en: 'Wireless Operator 📻' },
      { bn: 'সিনিয়র হাবিলদার 🎖️', en: 'Senior Havildar 🎖️' },
      { bn: 'কনস্টেবল 🚨', en: 'Police Constable 🚨' },
    ],
  },
  {
    id: 'hospital',
    nameBn: 'হাসপাতাল ও মেডিকেল টিম',
    nameEn: 'Hospital & Medical Team',
    icon: '🏥',
    firstPlayerTitle: { bn: 'হাসপাতালের পরিচালক 🏥', en: 'Hospital Director 🏥' },
    titles: [
      { bn: 'চিফ কার্ডিয়াক সার্জন 🩺', en: 'Chief Cardiac Surgeon 🩺' },
      { bn: 'এনেস্থেসিওলজিস্ট 💉', en: 'Chief Anesthesiologist 💉' },
      { bn: 'সিনিয়র নিউরোলজিস্ট 🧠', en: 'Senior Neurologist 🧠' },
      { bn: 'জরুরি বিভাগ ইনচার্জ 🚑', en: 'Emergency In-Charge 🚑' },
      { bn: 'হেড নার্স 👩‍⚕️', en: 'Head Nurse 👩‍⚕️' },
      { bn: 'প্যাথলজি ও ল্যাব হেড 🧪', en: 'Chief Pathologist 🧪' },
      { bn: 'চিফ ফার্মাসিস্ট 💊', en: 'Chief Pharmacist 💊' },
      { bn: 'রেডিওলজিস্ট 🩻', en: 'Senior Radiologist 🩻' },
      { bn: 'ইন্টার্ন ডাক্তার 📋', en: 'Intern Doctor 📋' },
      { bn: 'ওয়ার্ড সুপারভাইজার 🛏️', en: 'Ward Supervisor 🛏️' },
    ],
  },
  {
    id: 'media',
    nameBn: 'নিউজরুম ও সংবাদমাধ্যম',
    nameEn: 'Newsroom & Media',
    icon: '📰',
    firstPlayerTitle: { bn: 'প্রধান সম্পাদক 📰', en: 'Editor-in-Chief 📰' },
    titles: [
      { bn: 'প্রাইম টাইম নিউজ অ্যাঙ্কর 🎙️', en: 'Prime Time News Anchor 🎙️' },
      { bn: 'অনুসন্ধানী প্রতিবেদক 🕵️‍♂️', en: 'Investigative Reporter 🕵️‍♂️' },
      { bn: 'চিফ ক্যামেরাপারসন 🎥', en: 'Chief Camera Director 🎥' },
      { bn: 'বুলেটিন প্রযোজক 🎬', en: 'Executive News Producer 🎬' },
      { bn: 'সিনিয়র ফ্যাক্ট-চেকার 🔍', en: 'Senior Fact-Checker 🔍' },
      { bn: 'রাজনৈতিক বিশ্লেষক 🗣️', en: 'Political Analyst 🗣️' },
      { bn: 'স্পোর্টস এডিটর ⚽', en: 'Chief Sports Editor ⚽' },
    ],
  },
];

export function getScenePack(sceneId?: string): ScenePack {
  if (sceneId) {
    const found = SCENE_PACKS.find((s) => s.id === sceneId);
    if (found) return found;
  }
  return SCENE_PACKS[0]; // Defaults to bangladesh_professions
}

export const FIRST_PLAYER_TITLE: TitlePair = BANGLADESHI_PROFESSIONS[0];

export function generatePlayerTitles(count: number, sceneId?: string): { titles: TitlePair[]; scene: ScenePack } {
  if (!sceneId || sceneId === 'bangladesh_professions') {
    const titles = assignRandomBangladeshiDesignations(count);
    return { titles, scene: SCENE_PACKS[0] };
  }
  const scene = getScenePack(sceneId);
  const titles: TitlePair[] = [scene.firstPlayerTitle];
  const shuffledSubTitles = [...scene.titles].sort(() => 0.5 - Math.random());
  for (let i = 1; i < count; i++) {
    titles.push(shuffledSubTitles[(i - 1) % shuffledSubTitles.length]);
  }
  return { titles, scene };
}
