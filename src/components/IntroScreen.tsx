import React from 'react';
import {
  Smartphone,
  Users,
  Globe2,
  Lock,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Language, Theme } from '../types/game';
import { DhappabajLogo } from './DhappabajLogo';
import { sound } from '../utils/audio';

interface IntroScreenProps {
  onStartPassAndPlay: () => void;
  onOpenOnlineRoom: () => void;
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
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
}) => {
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-xl mx-auto transition-colors duration-200">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-end gap-2.5">
        {/* Language switch */}
        <button
          type="button"
          onClick={() => {
            sound.playKeySound();
            onToggleLang();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer"
          title={isEn ? 'Switch to বাংলা' : 'Switch to English'}
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEn ? 'বাংলা' : 'English'}</span>
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

        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 shadow-xs transition-all cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
        </button>
      </div>

      {/* Center Hero: Logo + Tagline */}
      <div className="my-auto text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Transparent Logo */}
        <div className="relative mx-auto transition-transform duration-300 hover:scale-105">
          <DhappabajLogo theme={theme} size="xl" />
        </div>

        {/* Catchy Tagline */}
        <div className="max-w-md mx-auto px-2">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-xs sm:text-sm font-bold tracking-tight">
              {isEn
                ? 'Expose the sneaky imposter hiding among you — bring them to justice!'
                : 'আপনার সাথে থাকা ধাপ্পাবাজকে আইনের হাতে তুলে দিন!'}
            </p>
          </div>
        </div>
      </div>

      {/* Game Mode Selection Cards */}
      <div className="space-y-3 pt-2">
        <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {isEn ? 'Choose Game Mode' : 'খেলার ধরন নির্বাচন করুন'}
        </div>

        {/* 1. Create Room (Private Online Multiplayer) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenOnlineRoom();
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-between gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-950/15 flex items-center justify-center text-slate-950 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg">
                  {isEn ? 'Create Room (Online)' : 'প্রাইভেট রুম (অনলাইন)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-amber-400 uppercase tracking-wider">
                  HOT
                </span>
              </div>
              <p className="text-xs text-slate-900 font-semibold opacity-85">
                {isEn
                  ? 'Join from separate mobile devices with room code'
                  : 'আলাদা মোবাইল ফোন থেকে কোড দিয়ে একসাথে খেলুন'}
              </p>
            </div>
          </div>
          <div className="text-xl font-black">→</div>
        </button>

        {/* 2. Pass & Play (Existing Local Multiplayer) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onStartPassAndPlay();
          }}
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-900 dark:text-white shadow-sm flex items-center justify-between gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base">
                {isEn ? 'Pass & Play' : 'পাস-অ্যান্ড-প্লে'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? '1 Device • Pass between turns' : '১টি মোবাইল হাতবদল করে অফলাইনে খেলুন'}
              </p>
            </div>
          </div>
          <div className="text-lg font-bold text-slate-400">→</div>
        </button>

        {/* 3. Online Match (Coming Soon) */}
        <div className="w-full p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 flex items-center justify-between gap-3 cursor-not-allowed">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  {isEn ? 'Online Matchmaking' : 'অনলাইন ম্যাচমেকিং'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>{isEn ? 'Coming Soon' : 'শীঘ্রই আসছে'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                {isEn
                  ? 'Auto match with players around the globe'
                  : 'বিশ্বব্যাপী অচেনা খেলোয়াড়দের সাথে স্বয়ংক্রিয় ম্যাচ'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
