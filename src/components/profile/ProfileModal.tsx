import React, { useState, useEffect } from 'react';
import { X, Check, LogOut, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { Language, Theme } from '../../types/game';
import { PLAYER_AVATARS } from '../../data/avatars';
import { upgradeGuestToGoogle, saveUserProfile } from '../../services/userService';
import { signOutUser } from '../../firebase';
import { sound } from '../../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onSignOut?: () => void;
  lang: Language;
  theme: Theme;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onSignOut,
  lang,
}) => {
  const isEn = lang === 'en';

  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userProfile?.customization?.avatar || '🕵️');
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeMsg, setUpgradeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setSelectedAvatar(userProfile.customization?.avatar || '🕵️');
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  const isGuest = userProfile.accountType === 'guest';

  const handleSignOut = async () => {
    sound.playClick();
    await signOutUser();
    if (onSignOut) {
      onSignOut();
    }
    onClose();
  };

  const handleUpgradeGoogle = async () => {
    try {
      sound.playClick();
      setIsUpgrading(true);
      setUpgradeMsg(null);
      const res = await upgradeGuestToGoogle();
      if (res.success && res.profile) {
        onProfileUpdated(res.profile);
        setUpgradeMsg({
          type: 'success',
          text: res.message || (isEn ? 'Successfully linked with Google!' : 'Google অ্যাকাউন্টের সাথে সফলভাবে যুক্ত হয়েছে!'),
        });
      }
    } catch (err: any) {
      setUpgradeMsg({
        type: 'error',
        text: err?.message || (isEn ? 'Failed to connect Google account' : 'Google অ্যাকাউন্ট যুক্ত করা সম্ভব হয়নি'),
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    sound.playClick();
    setIsSaving(true);
    setSavedSuccess(false);

    const updated: UserProfile = {
      ...userProfile,
      displayName: displayName.trim(),
      customization: {
        ...userProfile.customization,
        avatar: selectedAvatar,
      },
      updatedAt: Date.now(),
    };

    await saveUserProfile(updated);
    onProfileUpdated(updated);
    setIsSaving(false);
    setSavedSuccess(true);
    sound.playSuccessChime();

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-left animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEn ? 'Customize Player' : 'প্লেয়ার প্রোফাইল সাজান'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? 'Update your in-game name and personal avatar'
              : 'আপনার খেলার নাম ও পছন্দসই অ্যাভাটার পরিবর্তন করুন'}
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-500 shadow-md flex items-center justify-center text-4xl shrink-0">
            {selectedAvatar}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {isEn ? 'PREVIEW' : 'প্রিভিউ'}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {displayName.trim() || (isEn ? 'Player' : 'খেলোয়াড়')}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isGuest ? (isEn ? 'Guest Account' : 'গেস্ট অ্যাকাউন্ট') : (isEn ? 'Google Account' : 'গুগল অ্যাকাউন্ট')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'In-Game Name' : 'খেলোয়াড়ের নাম'}
            </label>
            <input
              type="text"
              required
              maxLength={24}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={isEn ? 'Enter your name' : 'আপনার নাম লিখুন'}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Avatar Selection Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isEn ? 'Select Avatar' : 'অ্যাভাটার নির্বাচন'}
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {PLAYER_AVATARS.length} {isEn ? 'available' : 'টি অ্যাভাটার'}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-44 overflow-y-auto">
              {PLAYER_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.emoji;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av.emoji);
                    }}
                    className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/25 ring-2 ring-amber-500 scale-105 shadow-xs'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {av.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving || !displayName.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-3 text-emerald-950" />
                <span>{isEn ? 'Saved Successfully!' : 'সফলভাবে সংরক্ষিত!'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isSaving ? (isEn ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (isEn ? 'Save Profile' : 'প্রোফাইল সংরক্ষণ')}</span>
              </>
            )}
          </button>
        </form>

        {/* Account Information & Management */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">
              {isEn ? 'Account Status:' : 'অ্যাকাউন্ট স্ট্যাটাস:'}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isGuest
                ? isEn ? 'Guest (Local)' : 'গেস্ট (ডিভাইস ভিত্তিক)'
                : userProfile.email || (isEn ? 'Google Account' : 'গুগল অ্যাকাউন্ট')}
            </span>
          </div>

          {upgradeMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold ${
                upgradeMsg.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}
            >
              {upgradeMsg.text}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isGuest && (
              <button
                type="button"
                onClick={handleUpgradeGoogle}
                disabled={isUpgrading}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{isUpgrading ? (isEn ? 'Connecting...' : 'যুক্ত হচ্ছে...') : (isEn ? 'Link Google Account' : 'Google যুক্ত করুন')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isEn ? 'Sign Out' : 'সাইন আউট'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
