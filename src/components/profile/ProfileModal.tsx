import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Award,
  Sparkles,
  Palette,
  Check,
  TrendingUp,
  LogOut,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, UserCustomization } from '../../types/user';
import { Language, Theme } from '../../types/game';
import { PLAYER_AVATARS } from '../../data/avatars';
import { COSMETIC_SKIN_BADGES, ACHIEVEMENTS_LIST } from '../../data/achievements';
import {
  upgradeGuestToGoogle,
  updateProfileCustomization,
  saveUserProfile,
} from '../../services/userService';
import { auth, signOutUser } from '../../firebase';
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

const ACCENT_COLORS = [
  { id: 'amber', hex: '#f59e0b', nameBn: 'সোনালী হলুদ', nameEn: 'Amber' },
  { id: 'emerald', hex: '#10b981', nameBn: 'সবুজ', nameEn: 'Emerald' },
  { id: 'sky', hex: '#0284c7', nameBn: 'আকাশি', nameEn: 'Sky Blue' },
  { id: 'rose', hex: '#f43f5e', nameBn: 'গোলাপী', nameEn: 'Rose' },
  { id: 'purple', hex: '#a855f7', nameBn: 'বেগুনি', nameEn: 'Purple' },
  { id: 'orange', hex: '#f97316', nameBn: 'কমলা', nameEn: 'Orange' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onSignOut,
  lang,
}) => {
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'profile' | 'customize' | 'stats'>('profile');
  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || '');
  const [bio, setBio] = useState<string>(userProfile?.bio || userProfile?.customization?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userProfile?.customization?.avatar || '🕵️');
  const [selectedColor, setSelectedColor] = useState<string>(userProfile?.customization?.avatarColor || '#f59e0b');
  const [selectedBadge, setSelectedBadge] = useState<string | undefined>(userProfile?.customization?.skinBadge);
  const [customTitle, setCustomTitle] = useState<string>(userProfile?.customization?.customTitle || '');

  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeMsg, setUpgradeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || userProfile.customization?.bio || '');
      setSelectedAvatar(userProfile.customization?.avatar || '🕵️');
      setSelectedColor(userProfile.customization?.avatarColor || '#f59e0b');
      setSelectedBadge(userProfile.customization?.skinBadge);
      setCustomTitle(userProfile.customization?.customTitle || '');
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  const isGuest = userProfile.accountType === 'guest';
  const unlockedBadges = userProfile.unlockedBadges || [];

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

  const handleSaveCustomization = async () => {
    sound.playClick();
    setIsSaving(true);
    const updated: UserProfile = {
      ...userProfile,
      displayName: displayName.trim() || userProfile.displayName,
      bio: bio.trim() || userProfile.bio,
      customization: {
        ...userProfile.customization,
        avatar: selectedAvatar,
        avatarColor: selectedColor,
        skinBadge: selectedBadge,
        customTitle: customTitle.trim() || userProfile.customization?.customTitle,
        bio: bio.trim() || userProfile.customization?.bio,
      },
    };

    await saveUserProfile(updated);
    onProfileUpdated(updated);
    setIsSaving(false);
    setActiveTab('profile');
  };

  const equippedBadgeConfig = selectedBadge ? COSMETIC_SKIN_BADGES[selectedBadge] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Player Profile & Customization' : 'প্রোফাইল ও কাস্টমাইজেশন'}
              </h2>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isGuest ? (isEn ? 'Guest Mode' : 'গেস্ট অ্যাকাউন্ট') : (userProfile.email || 'Google Account')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title={isEn ? 'Sign Out' : 'সাইন আউট'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isEn ? 'Sign Out' : 'সাইন আউট'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2 bg-slate-50/30 dark:bg-slate-950/30 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? 'Overview' : 'পরিচিতি'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'customize'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? 'Customize Look' : 'সাজসজ্জা ও স্কিন'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? 'Stats & Career' : 'পরিসংখ্যান'}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Profile Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 dark:via-slate-900 to-amber-500/5 border border-amber-500/30 flex items-center gap-4 relative overflow-hidden">
                <div
                  className={`w-18 h-18 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 ${
                    equippedBadgeConfig?.border || 'border-amber-500'
                  }`}
                  style={{ backgroundColor: selectedColor }}
                >
                  {selectedAvatar}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                      {displayName || userProfile.displayName}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isGuest
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isGuest ? (isEn ? 'Guest' : 'গেস্ট') : 'Google'}
                    </span>
                  </div>

                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate">
                    {equippedBadgeConfig ? (isEn ? equippedBadgeConfig.en : equippedBadgeConfig.bn) : (customTitle || 'চতুর গোয়েন্দা')}
                  </p>

                  {userProfile.bio && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic truncate pt-0.5">
                      "{userProfile.bio}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                    <span>🏆 {userProfile.stats?.totalPoints || 0} {isEn ? 'pts' : 'পয়েন্ট'}</span>
                    <span>🎮 {userProfile.stats?.totalMatches || 0} {isEn ? 'games' : 'ম্যাচ'}</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Guest to Google Banner */}
              {isGuest && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      G
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isEn ? 'Save Progress with Google' : 'Google দিয়ে অ্যাকাউন্ট সংরক্ষণ করুন'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {isEn
                          ? 'Link your guest profile to Google to keep all your achievements, skins, and stats across devices.'
                          : 'গেস্ট অ্যাকাউন্টটি Google-এর সাথে যুক্ত করলে অন্য ডিভাইসেও আপনার স্কোর ও ব্যাজ সংরক্ষিত থাকবে।'}
                      </p>
                    </div>
                  </div>

                  {upgradeMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        upgradeMsg.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {upgradeMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{upgradeMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUpgradeGoogle}
                    disabled={isUpgrading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <span>
                      {isUpgrading
                        ? isEn ? 'Connecting...' : 'যুক্ত করা হচ্ছে...'
                        : isEn ? 'Continue with Google' : 'Google অ্যাকাউন্ট যুক্ত করুন'}
                    </span>
                  </button>
                </div>
              )}

              {/* Quick Action to Customize */}
              <button
                type="button"
                onClick={() => setActiveTab('customize')}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>{isEn ? 'Customize Avatar, Color & Title' : 'অ্যাভাটার, রং ও টাইটেল পরিবর্তন করুন'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* TAB 2: CUSTOMIZE LOOK */}
          {activeTab === 'customize' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Display Name' : 'খেলোয়াড়ের নাম'}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={25}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                  placeholder={isEn ? 'Your In-Game Name' : 'আপনার ইন-গেম নাম'}
                />
              </div>

              {/* Custom Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Custom Cosmetic Title' : 'কসমেটিক টাইটেল'}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  maxLength={30}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                  placeholder={isEn ? 'e.g. Master Detective' : 'যেমন: চতুর গোয়েন্দা'}
                />
              </div>

              {/* Bio / Motto Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Player Bio / Motto' : 'খেলোয়াড় বায়ো বা নীতিবাক্য'}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={80}
                  rows={2}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 resize-none"
                  placeholder={isEn ? 'e.g. Always sniffing out the imposter!' : 'যেমন: ধাপ্পাবাজ ধরার আসল কারিগর!'}
                />
              </div>

              {/* Avatar Emoji Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Choose Avatar' : 'অ্যাভাটার নির্বাচন করুন'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PLAYER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedAvatar(av.emoji);
                      }}
                      className={`p-3 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === av.emoji
                          ? 'ring-2 ring-amber-500 bg-amber-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Avatar Background Color' : 'অ্যাভাটার ব্যাকগ্রাউন্ড রং'}
                </label>
                <div className="flex items-center gap-2.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedColor(c.hex);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedColor === c.hex ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.hex && <Check className="w-4 h-4 text-white stroke-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cosmetic Skin Badges from Achievements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? 'Equip Unlocked Badge / Skin' : 'আনলককৃত স্কিন বা ব্যাজ'}
                  </label>
                  <span className="text-[11px] font-mono text-amber-500 font-bold">
                    {unlockedBadges.length} / {ACHIEVEMENTS_LIST.length} {isEn ? 'Unlocked' : 'আনলক'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(undefined)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      !selectedBadge
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>❌</span>
                    <span>{isEn ? 'None (Default)' : 'কোনোটি নয়'}</span>
                  </button>

                  {Object.entries(COSMETIC_SKIN_BADGES).map(([key, item]) => {
                    const isUnlocked = unlockedBadges.includes(key);
                    const isSelected = selectedBadge === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (isUnlocked) {
                            sound.playClick();
                            setSelectedBadge(key);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all ${
                          !isUnlocked
                            ? 'opacity-40 border-slate-200 dark:border-slate-800 cursor-not-allowed bg-slate-50 dark:bg-slate-950'
                            : isSelected
                            ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate text-[11px] text-slate-900 dark:text-white">
                            {isEn ? item.en : item.bn}
                          </p>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {isUnlocked ? (isEn ? 'Unlocked' : 'আনলক') : (isEn ? 'Locked' : 'লক করা')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 stroke-3" />
                  <span>{isSaving ? (isEn ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (isEn ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ করুন')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STATS & CAREER */}
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase block">
                    {isEn ? 'Matches' : 'মোট ম্যাচ'}
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {userProfile.stats?.totalMatches || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">
                    {isEn ? 'Wins' : 'জয়'}
                  </span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {userProfile.stats?.matchesWon || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase block">
                    {isEn ? 'Total Points' : 'সর্বমোট পয়েন্ট'}
                  </span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {userProfile.stats?.totalPoints || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold uppercase block">
                    {isEn ? 'Imposter Wins' : 'ধাপ্পাবাজ জয়'}
                  </span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {userProfile.stats?.imposterWins || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase block">
                    {isEn ? 'Citizen Wins' : 'নাগরিক জয়'}
                  </span>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {userProfile.stats?.citizenWins || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase block">
                    {isEn ? 'Detective Votes' : 'সঠিক ভোট'}
                  </span>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {userProfile.stats?.correctVotes || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
