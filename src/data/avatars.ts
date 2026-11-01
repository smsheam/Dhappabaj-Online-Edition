export interface AvatarOption {
  id: string;
  emoji: string;
  labelBn: string;
  labelEn: string;
  bg: string;
}

export const PLAYER_AVATARS: AvatarOption[] = [
  { id: 'spy', emoji: '🕵️', labelBn: 'গোয়েন্দা', labelEn: 'Detective', bg: 'bg-amber-500' },
  { id: 'sunglasses', emoji: '🕶️', labelBn: 'গোপন এজেন্ট', labelEn: 'Secret Agent', bg: 'bg-slate-700' },
  { id: 'ninja', emoji: '🥷', labelBn: 'নিনজা', labelEn: 'Ninja', bg: 'bg-stone-800' },
  { id: 'detective_f', emoji: '🕵️‍♀️', labelBn: 'সত্যান্বেষী', labelEn: 'Investigator', bg: 'bg-rose-500' },
  { id: 'magician', emoji: '🎩', labelBn: 'জাদুকর', labelEn: 'Magician', bg: 'bg-purple-600' },
  { id: 'police', emoji: '👮', labelBn: 'পুলিশ অফিসার', labelEn: 'Officer', bg: 'bg-blue-600' },
  { id: 'fox', emoji: '🦊', labelBn: 'চতুর শিয়াল', labelEn: 'Clever Fox', bg: 'bg-orange-500' },
  { id: 'tiger', emoji: '🐯', labelBn: 'রয়েল বাঘ', labelEn: 'Tiger', bg: 'bg-amber-600' },
  { id: 'lion', emoji: '🦁', labelBn: 'সিংহ', labelEn: 'Lion', bg: 'bg-yellow-600' },
  { id: 'owl', emoji: '🦉', labelBn: 'জ্ঞানী পেঁচা', labelEn: 'Wise Owl', bg: 'bg-emerald-600' },
  { id: 'cat', emoji: '🐱', labelBn: 'বিড়াল', labelEn: 'Sneaky Cat', bg: 'bg-pink-500' },
  { id: 'panda', emoji: '🐼', labelBn: 'পান্ডা', labelEn: 'Panda', bg: 'bg-teal-600' },
  { id: 'alien', emoji: '👽', labelBn: 'ভিনগ্রহী', labelEn: 'Alien', bg: 'bg-lime-600' },
  { id: 'robot', emoji: '🤖', labelBn: 'রোবট', labelEn: 'Robot', bg: 'bg-cyan-600' },
  { id: 'wizard', emoji: '🧙', labelBn: 'মায়াবী', labelEn: 'Wizard', bg: 'bg-indigo-600' },
  { id: 'superhero', emoji: '🦸', labelBn: 'নায়ক', labelEn: 'Hero', bg: 'bg-red-600' },
];

export const DEFAULT_AVATARS_BY_INDEX = [
  '🕵️',
  '🕶️',
  '🥷',
  '🕵️‍♀️',
  '🎩',
  '👮',
  '🦊',
  '🐯',
  '🦁',
  '🦉',
  '🐱',
  '🐼',
];
