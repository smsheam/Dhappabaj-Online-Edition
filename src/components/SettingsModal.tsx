import React from 'react';
import { X, Volume2, VolumeX, Moon, Sun, Globe, BookOpen, ShieldCheck } from 'lucide-react';
import { Language, Theme } from '../types/game';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {isEn ? 'Game Settings' : 'গেম সেটিংস'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Sound Effects' : 'শব্দ ও সাউন্ড'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isMuted ? (isEn ? 'Muted' : 'বন্ধ') : (isEn ? 'Enabled' : 'চালু')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isMuted ? (isEn ? 'Unmute' : 'চালু করুন') : (isEn ? 'Mute' : 'বন্ধ করুন')}
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Appearance Theme' : 'থিম মোড'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {theme === 'dark' ? (isEn ? 'Dark Mode' : 'ডার্ক মোড') : (isEn ? 'Light Mode' : 'লাইট মোড')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playKeySound();
                onToggleTheme();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 cursor-pointer"
            >
              {theme === 'dark' ? (isEn ? 'Light' : 'লাইট') : (isEn ? 'Dark' : 'ডার্ক')}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Language' : 'ভাষা'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isEn ? 'English' : 'বাংলা (Bangla)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playKeySound();
                onToggleLang();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 cursor-pointer transition-colors"
            >
              {isEn ? 'বাংলা' : 'English'}
            </button>
          </div>

          {/* Rules Guide Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRules();
            }}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'How to Play (Game Rules)' : 'খেলার নিয়মাবলী'}</span>
            </div>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
