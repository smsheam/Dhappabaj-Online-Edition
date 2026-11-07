import React, { useState } from 'react';
import { User, Sparkles, Check, Smile } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { Language, Theme } from '../../types/game';
import { PLAYER_AVATARS } from '../../data/avatars';
import { saveUserProfile } from '../../services/userService';
import { sound } from '../../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  userProfile: UserProfile;
  onComplete: (updated: UserProfile) => void;
  lang: Language;
  theme: Theme;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userProfile,
  onComplete,
  lang,
}) => {
  const isEn = lang === 'en';

  const [name, setName] = useState<string>(userProfile.displayName || '');
  const [avatar, setAvatar] = useState<string>(userProfile.customization?.avatar || '🕵️');
  const [bio, setBio] = useState<string>(userProfile.bio || 'ধাপ্পাবাজ ধরার রোমাঞ্চকর মিশনে প্রস্তুত!');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playClick();
    setIsSaving(true);

    const updated: UserProfile = {
      ...userProfile,
      displayName: name.trim(),
      bio: bio.trim(),
      hasCompletedOnboarding: true,
      customization: {
        ...userProfile.customization,
        avatar,
        bio: bio.trim(),
      },
    };

    await saveUserProfile(updated);
    setIsSaving(false);
    onComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-left animate-in zoom-in-95 duration-200">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl shadow-inner shadow-amber-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isEn ? 'Welcome to Dhappabaj!' : 'ধাপ্পাবাজে স্বাগতম!'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isEn
                ? 'Set up your player identity before entering the game'
                : 'খেলায় প্রবেশের পূর্বে আপনার পরিচয় সাজিয়ে নিন'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input (Pre-filled from Google ID or Guest) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Your In-Game Name' : 'আপনার ইন-গেম নাম'}
            </label>
            <input
              type="text"
              required
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
              placeholder={isEn ? 'e.g. Inspector Kabir' : 'যেমন: ইন্সপেক্টর কবির'}
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{isEn ? 'Choose Avatar' : 'অ্যাভাটার নির্বাচন করুন'}</span>
              <span className="text-xl">{avatar}</span>
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
              {PLAYER_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAvatar(av.emoji);
                  }}
                  className={`p-2 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av.emoji
                      ? 'bg-amber-500/25 ring-2 ring-amber-500 scale-105'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Player Bio / Catchphrase' : 'আপনার স্লোগান বা বায়ো'}
            </label>
            <textarea
              value={bio}
              maxLength={80}
              rows={2}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 text-xs font-medium text-slate-900 dark:text-white focus:outline-none resize-none"
              placeholder={isEn ? 'e.g. Master of Bluffing!' : 'যেমন: ধাপ্পাবাজ ধরার আসল কারিগর!'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-3" />
            <span>{isSaving ? (isEn ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (isEn ? 'Save & Start Playing' : 'সংরক্ষণ করে খেলা শুরু করুন')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
