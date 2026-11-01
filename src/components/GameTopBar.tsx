import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Globe, HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { Language, Theme } from '../types/game';
import { DhappabajLogo } from './DhappabajLogo';
import { sound } from '../utils/audio';

interface GameTopBarProps {
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
  roundBadge?: string;
  onBack?: () => void;
  onHome?: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
  roundBadge,
  onBack,
  onHome,
}) => {
  const isEn = lang === 'en';

  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        {/* Back / Home button */}
        {(onBack || onHome) && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onBack) onBack();
              else if (onHome) onHome();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer"
            title={isEn ? 'Back to Main Menu' : 'মূল মেন্যুতে ফিরুন'}
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>{isEn ? 'Back' : 'ফিরে যান'}</span>
          </button>
        )}

        <DhappabajLogo theme={theme} size="sm" />
        <span className="font-black text-lg text-slate-900 dark:text-white hidden sm:inline">
          {isEn ? 'Dhappabaj' : 'ধাপ্পাবাজ'}
        </span>
        {roundBadge && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-500/30">
            {roundBadge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Lang switch */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleLang();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-500/40 transition-colors cursor-pointer"
          title="Change language"
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEn ? 'বাং' : 'EN'}</span>
        </button>

        {/* Theme switch */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleTheme();
          }}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Sound */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
        </button>

        {/* Rules */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">{isEn ? 'Rules' : 'নিয়মাবলি'}</span>
        </button>
      </div>
    </div>
  );
};
