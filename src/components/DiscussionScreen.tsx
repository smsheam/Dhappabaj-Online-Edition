import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Player, WordItem, Language, Theme } from '../types/game';
import { CATEGORIES } from '../data/categories';
import { GameTopBar } from './GameTopBar';
import { sound } from '../utils/audio';

interface DiscussionScreenProps {
  players?: Player[];
  roundNumber: number;
  totalRounds: number;
  word: WordItem;
  timerSeconds: number;
  onProceedToVoting: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onHome?: () => void;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  roundNumber,
  totalRounds,
  word,
  timerSeconds,
  onProceedToVoting,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
  onHome,
}) => {
  const isEn = lang === 'en';

  const initialTime = timerSeconds > 0 ? timerSeconds : 90;
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const category = CATEGORIES[word.category];

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          sound.playBuzzer();
          return 0;
        }
        if (prev <= 10) {
          sound.playWarningTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAdd30Sec = () => {
    sound.playClick();
    setTimeLeft((prev) => prev + 30);
    if (!isTimerRunning) setIsTimerRunning(true);
  };

  const handleReset = () => {
    sound.playClick();
    setTimeLeft(initialTime);
    setIsTimerRunning(true);
  };

  const isLowTime = timeLeft <= 10 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 max-w-xl mx-auto transition-colors duration-200">
      <GameTopBar
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenRules={onOpenRules}
        onHome={onHome}
        roundBadge={isEn ? `Round ${roundNumber}/${totalRounds}` : `রাউন্ড ${roundNumber}/${totalRounds}`}
      />

      {/* Main Discussion Section: ONLY Timer and Category */}
      <div className="my-auto py-6 space-y-6 text-center animate-in fade-in duration-300">
        {/* Category Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isEn ? 'Category:' : 'ক্যাটাগরি:'}
          </span>
          <span className="text-sm font-black">
            {isEn ? category?.nameEn : category?.nameBn}
          </span>
        </div>

        {/* Central Timer Display */}
        <div className="relative p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <MessageCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold">
              {isEn ? 'Open Discussion' : 'মুক্ত আলোচনা'}
            </h2>
          </div>

          {/* Large Countdown Display */}
          <div className="flex justify-center">
            <div
              className={`px-8 py-5 rounded-3xl font-mono text-6xl sm:text-7xl font-black tracking-tight transition-all duration-300 select-none ${
                isTimeUp
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/50 scale-105'
                  : isLowTime
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60 shadow-inner'
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Discussion State Indicator */}
          <div className="text-sm font-semibold">
            {isTimeUp ? (
              <span className="text-rose-500 font-bold">
                {isEn ? "Time's up! Ready to cast your votes" : 'সময় শেষ! ধাপ্পাবাজ কে? এবার ভোট দেওয়ার পালা'}
              </span>
            ) : isTimerRunning ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                {isEn ? 'Anyone can speak anytime · Discuss freely!' : 'যেকোনো সময় যে কেউ কথা বলতে পারেন · মুক্ত আলোচনা করুন!'}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                {isEn ? 'Timer is paused' : 'টাইমার স্থগিত রয়েছে'}
              </span>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsTimerRunning(!isTimerRunning);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{isEn ? 'Pause' : 'বিরতি'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isEn ? 'Resume' : 'চালান'}</span>
                </>
              )}
            </button>

            {/* +30 Sec */}
            <button
              type="button"
              onClick={handleAdd30Sec}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-sm border border-amber-500/30 transition-all cursor-pointer"
              title={isEn ? 'Add 30 seconds' : '+৩০ সেকেন্ড যোগ করুন'}
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? '+30s' : '+৩০ সে'}</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title={isEn ? 'Reset timer' : 'রিসেট'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Button: Proceed to Voting */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onProceedToVoting();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base sm:text-lg shadow-xl shadow-rose-950/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>{isEn ? 'Proceed to Voting' : 'আলোচনা শেষ · এবার ভোট দেওয়ার পালা'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
