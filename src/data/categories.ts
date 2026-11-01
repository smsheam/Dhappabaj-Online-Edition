import { CategoryInfo, CategoryId } from '../types/game';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: {
    id: 'food',
    nameBn: 'খাবার ও পানীয়',
    nameEn: 'Food & Cuisine',
    icon: 'UtensilsCrossed',
    color: 'amber',
  },
  people: {
    id: 'people',
    nameBn: 'বিখ্যাত ব্যক্তিত্ব',
    nameEn: 'Famous People',
    icon: 'UserCheck',
    color: 'violet',
  },
  object: {
    id: 'object',
    nameBn: 'দৈনন্দিন বস্তু ও জিনিস',
    nameEn: 'Objects & Things',
    icon: 'Package',
    color: 'emerald',
  },
  animal: {
    id: 'animal',
    nameBn: 'প্রাণী ও পাখি',
    nameEn: 'Animals & Birds',
    icon: 'PawPrint',
    color: 'rose',
  },
};
