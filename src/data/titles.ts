export interface TitlePair {
  bn: string;
  en: string;
}

export interface ScenePack {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  firstPlayerTitle: TitlePair;
  titles: TitlePair[];
}

export const SCENE_PACKS: ScenePack[] = [
  {
    id: 'cabinet',
    nameBn: 'মন্ত্রী পরিষদ ও সচিবালয়',
    nameEn: 'Cabinet Ministry & Secretariat',
    icon: '🏛️',
    firstPlayerTitle: { bn: 'প্রধানমন্ত্রী 🏛️', en: 'Prime Minister 🏛️' },
    titles: [
      { bn: 'স্বরাষ্ট্রমন্ত্রী 🛡️', en: 'Home Minister 🛡️' },
      { bn: 'অর্থমন্ত্রী 💰', en: 'Finance Minister 💰' },
      { bn: 'পররাষ্ট্রমন্ত্রী 🌐', en: 'Foreign Minister 🌐' },
      { bn: 'স্বাস্থ্যমন্ত্রী 🏥', en: 'Health Minister 🏥' },
      { bn: 'তথ্য ও সম্প্রচার মন্ত্রী 📢', en: 'Information Minister 📢' },
      { bn: 'শিক্ষামন্ত্রী 🎓', en: 'Education Minister 🎓' },
      { bn: 'বাণিজ্যমন্ত্রী 💼', en: 'Commerce Minister 💼' },
      { bn: 'বিদ্যুৎ ও জ্বালানি প্রতিমন্ত্রী ⚡', en: 'Power State Minister ⚡' },
      { bn: 'ক্যাবিনেট সচিব 📜', en: 'Cabinet Secretary 📜' },
      { bn: 'প্রধান উপদেষ্টার বিশেষ সহকারী 🤝', en: 'Special Assistant 🤝' },
      { bn: 'প্রেস সচিব 🎙️', en: 'Press Secretary 🎙️' },
      { bn: 'আইন উপদেষ্টা ⚖️', en: 'Legal Advisor ⚖️' },
    ],
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
      { bn: 'কমান্ডো স্কোয়াড লিড 🪖', en: 'SWAT Squad Leader 🪖' },
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
      { bn: 'অ্যাম্বুলেন্স চালক 🚨', en: 'Ambulance Driver 🚨' },
      { bn: 'মেডিকেল অফিসার 🔬', en: 'Medical Officer 🔬' },
    ],
  },
  {
    id: 'court',
    nameBn: 'আদালত ও বিচারকক্ষ',
    nameEn: 'Courtroom & Judiciary',
    icon: '⚖️',
    firstPlayerTitle: { bn: 'প্রধান বিচারপতি ⚖️', en: 'Chief Justice ⚖️' },
    titles: [
      { bn: 'সিনিয়র জেলা জজ 👨‍⚖️', en: 'Senior District Judge 👨‍⚖️' },
      { bn: 'সরকারি কৌঁসুলি / পিপি 📜', en: 'Public Prosecutor 📜' },
      { bn: 'সিনিয়র আইনজীবী 💼', en: 'Senior Defense Counsel 💼' },
      { bn: 'স্পেশাল ব্যারিস্টার 🎓', en: 'Distinguished Barrister 🎓' },
      { bn: 'পেশকার সাহেব ✍️', en: 'Court Registrar / Peshkar ✍️' },
      { bn: 'বিশেষ তদন্ত কর্মকর্তা 🔍', en: 'Special Court Investigator 🔍' },
      { bn: 'ফরেনসিক বিশেষজ্ঞ সাক্ষী 🔬', en: 'Forensic Expert Witness 🔬' },
      { bn: 'প্রত্যক্ষদর্শী সাক্ষী 👁️', en: 'Key Eyewitness 👁️' },
      { bn: 'কোর্ট স্টেনোগ্রাফার ⌨️', en: 'Court Stenographer ⌨️' },
      { bn: 'কোর্ট পুলিশ অফিসার 👮', en: 'Court Police Officer 👮' },
      { bn: 'আদালতের পেয়াদা 🔔', en: 'Court Bailiff 🔔' },
      { bn: 'জুরি প্রধান 👥', en: 'Jury Foreman 👥' },
    ],
  },
  {
    id: 'airport',
    nameBn: 'এয়ারপোর্ট ও ফ্লাইট ক্রু',
    nameEn: 'Airport & Flight Crew',
    icon: '✈️',
    firstPlayerTitle: { bn: 'চিফ ক্যাপ্টেন / পাইলট 👨‍✈️', en: 'Chief Captain / Pilot 👨‍✈️' },
    titles: [
      { bn: 'ফার্স্ট অফিসার 🛫', en: 'First Officer (Co-Pilot) 🛫' },
      { bn: 'ফ্লাইট ইঞ্জিনিয়ার 🛠️', en: 'Flight Engineer 🛠️' },
      { bn: 'চিফ পার্সার 🧑‍✈️', en: 'Chief Purser 🧑‍✈️' },
      { bn: 'সিনিয়র কেবিন ক্রু 🍹', en: 'Senior Flight Attendant 🍹' },
      { bn: 'এয়ার ট্রাফিক কন্ট্রোলার 📡', en: 'Air Traffic Controller 📡' },
      { bn: 'এভিয়েশন সিকিউরিটি চিফ 🛂', en: 'Aviation Security Chief 🛂' },
      { bn: 'প্রধান ইমিগ্রেশন অফিসার 🛂', en: 'Chief Immigration Officer 🛂' },
      { bn: 'কাস্টমস ইন্সপেক্টর 🧳', en: 'Customs Inspector 🧳' },
      { bn: 'গ্রাউন্ড অপারেশন ম্যানেজার 📋', en: 'Ground Operations Manager 📋' },
      { bn: 'ব্যাগেজ সুপারভাইজার 🧳', en: 'Baggage Supervisor 🧳' },
      { bn: 'ভিআইপি লাউঞ্জ ইনচার্জ ☕', en: 'VIP Lounge Host ☕' },
      { bn: 'মার্শালিং সিগন্যালার 🦺', en: 'Marshalling Signal Officer 🦺' },
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
      { bn: 'স্পেশাল করেসপন্ডেন্ট ✈️', en: 'Special Correspondent ✈️' },
      { bn: 'আবহাওয়া পূর্বাভাসকারী 🌤️', en: 'Weather Anchor 🌤️' },
      { bn: 'ব্রডকাস্ট ইঞ্জিনিয়ার 📡', en: 'Broadcast Engineer 📡' },
      { bn: 'লাইভ ওবি ভ্যান ক্রু 🚐', en: 'Live OB Van Crew 🚐' },
      { bn: 'হেড অফ গ্রাফিক্স 💻', en: 'Broadcast Graphics Head 💻' },
      { bn: 'স্পোর্টস এডিটর ⚽', en: 'Chief Sports Editor ⚽' },
    ],
  },
];

// Helper to get a random scene or specific scene
export function getScenePack(sceneId?: string): ScenePack {
  if (sceneId) {
    const found = SCENE_PACKS.find((s) => s.id === sceneId);
    if (found) return found;
  }
  return SCENE_PACKS[Math.floor(Math.random() * SCENE_PACKS.length)];
}

// Backward compatible export for FIRST_PLAYER_TITLE default
export const FIRST_PLAYER_TITLE: TitlePair = SCENE_PACKS[0].firstPlayerTitle;

/**
 * Generates player titles where ALL players in the game belong to the SAME cohesive scene/scenario.
 * Player 1 is always the Chief/Lead of that scene, and other players receive unique titles from the scene.
 */
export function generatePlayerTitles(count: number, sceneId?: string): { titles: TitlePair[]; scene: ScenePack } {
  const scene = getScenePack(sceneId);
  const titles: TitlePair[] = [scene.firstPlayerTitle];

  const shuffledSubTitles = [...scene.titles].sort(() => 0.5 - Math.random());
  for (let i = 1; i < count; i++) {
    titles.push(shuffledSubTitles[(i - 1) % shuffledSubTitles.length]);
  }

  return { titles, scene };
}
