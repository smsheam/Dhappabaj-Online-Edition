import React, { useState } from 'react';
import {
  Smartphone,
  Users,
  Award,
  Palette,
  Settings,
  LogOut,
  ShieldAlert,
  Sparkles,
  User,
  Globe,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Language, Theme } from '../types/game';
import { UserProfile } from '../types/user';
import { DhappabajLogo } from './DhappabajLogo';
import { sound } from '../utils/audio';

interface IntroScreenProps {
  onStartPassAndPlay: () => void;
  onOpenOnlineRoom: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
  onExitApp?: () => void;
  canAccessAdmin: boolean;
  userProfile: UserProfile | null;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartPassAndPlay,
  onOpenOnlineRoom,
  onOpenProfile,
  onOpenSettings,
  onOpenAdmin,
  onOpenSignIn,
  onSignOut,
  onExitApp,
  canAccessAdmin,
  userProfile,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
}) => {
  const isEn = lang === 'en';
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const handleExit = () => {
    sound.playClick();
    if (onExitApp) {
      onExitApp();
    } else {
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto transition-colors duration-200">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Top-Left: Player Name & Sign Out, or Sign In button */}
        {userProfile ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all"
              title={isEn ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন'}
            >
              <span className="text-sm">{userProfile.customization?.avatar || '🕵️'}</span>
              <span className="text-xs font-black text-slate-900 dark:text-white max-w-[110px] truncate leading-tight">
                {userProfile.displayName}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (onSignOut) onSignOut();
              }}
              className="px-2 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 flex items-center gap-1 transition-all cursor-pointer"
              title={isEn ? 'Sign Out' : 'সাইন আউট'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">{isEn ? 'Sign Out' : 'আউট'}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onOpenSignIn) onOpenSignIn();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>{isEn ? 'Sign In' : 'সাইন ইন'}</span>
          </button>
        )}

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5">
          {/* Admin Dashboard: VISIBLE ONLY TO OWNER AND AUTHORIZED EDITORS */}
          {canAccessAdmin && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 shadow-xs transition-all cursor-pointer animate-pulse"
              title={isEn ? 'Master Admin Dashboard' : 'মাস্টার অ্যাডমিন কন্ট্রোল'}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Admin' : 'অ্যাডমিন'}</span>
            </button>
          )}

          {/* Quick Language switch */}
          <button
            type="button"
            onClick={() => {
              sound.playKeySound();
              onToggleLang();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer"
            title={isEn ? 'বাংলা ভাষায় দেখুন' : 'Switch to English'}
          >
            {isEn ? 'বাংলা' : 'EN'}
          </button>

          {/* Theme switch */}
          <button
            type="button"
            onClick={() => {
              sound.playKeySound();
              onToggleTheme();
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 shadow-xs transition-all cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Center Hero: Logo + Tagline */}
      <div className="my-auto text-center space-y-4 py-3 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mx-auto transition-transform duration-300 hover:scale-105">
          <DhappabajLogo theme={theme} size="xl" />
        </div>

        <div className="max-w-md mx-auto px-2">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-xs sm:text-sm font-bold tracking-tight">
              {isEn
                ? 'Expose the sneaky imposter hiding among you!'
                : 'আপনার সাথে থাকা ধাপ্পাবাজকে আইনের হাতে তুলে দিন!'}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Primary Menu Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* 1. Play Online (অনলাইন মাল্টিপ্লেয়ার) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenOnlineRoom();
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-between gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-950/15 flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg">
                  {isEn ? 'Play Online' : 'অনলাইন মাল্টিপ্লেয়ার'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-amber-400 uppercase tracking-wider">
                  HOT
                </span>
              </div>
              <p className="text-xs text-slate-950/80 font-semibold">
                {isEn ? 'Create or join a private room with friends' : 'রুম কোড দিয়ে বন্ধুদের সাথে আলাদা ফোনে খেলুন'}
              </p>
            </div>
          </div>
          <div className="text-xl font-black">→</div>
        </button>

        {/* 2. Pass & Play (এক ডিভাইসে খেলুন) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onStartPassAndPlay();
          }}
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-900 dark:text-white shadow-xs flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                {isEn ? 'Pass & Play' : 'পাস-অ্যান্ড-প্লে'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? '1 Device • Offline party mode' : 'একটি মাত্র মোবাইল হাতবদল করে খেলুন'}
              </p>
            </div>
          </div>
          <div className="text-base font-bold text-slate-400">→</div>
        </button>

        {/* 3. Customize Profile (Name & Avatar only) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-900 dark:text-white shadow-xs flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                {isEn ? 'Customize Profile' : 'প্রোফাইল সাজান'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Change player name & avatar' : 'খেলোয়াড়ের নাম ও অ্যাভাটার পরিবর্তন'}
              </p>
            </div>
          </div>
          <div className="text-base font-bold text-slate-400">→</div>
        </button>

        {/* Row for Settings & Exit */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 5. Settings */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>{isEn ? 'Settings' : 'সেটিংস'}</span>
          </button>

          {/* 6. Exit */}
          <button
            type="button"
            onClick={handleExit}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-900/90 dark:hover:bg-rose-600 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isEn ? 'Exit' : 'প্রস্থান'}</span>
          </button>
        </div>
      </div>

      {/* Exit Modal Prompt */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Close Dhappabaj?' : 'খেলা বন্ধ করতে চান?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isEn ? 'You can simply close the browser tab to exit.' : 'আপনি ব্রাউজারের ট্যাবটি বন্ধ করে বের হতে পারেন।'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExitConfirm(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              {isEn ? 'Got it' : 'ঠিক আছে'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
