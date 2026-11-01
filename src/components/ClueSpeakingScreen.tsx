import React, { useState, useMemo, useEffect } from 'react';
import { Mic, ArrowRight, CheckCircle2, Clock, Volume2, ShieldAlert } from 'lucide-react';
import { Player, WordItem, Language, Theme } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { GameTopBar } from './GameTopBar';
import { sound } from '../utils/audio';

interface ClueSpeakingScreenProps {
  players: Player[];
  currentRound?: number;
  roundNumber?: number;
  totalRounds: number;
  word?: WordItem;
  onProceedToDiscussion: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const ClueSpeakingScreen: React.FC<ClueSpeakingScreenProps> = ({
  players,
  currentRound,
  roundNumber,
  totalRounds,
  onProceedToDiscussion,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  const effectiveRound = currentRound ?? roundNumber ?? 1;

  // Rule: 1st round starts 1st player (index 0), 2nd round starts from 2nd player (index 1), etc.
  const startPlayerIndex = (effectiveRound - 1) % players.length;

  // Build sequential speaker order starting from startPlayerIndex
  const speakerOrder = useMemo(() => {
    const order: number[] = [];
    for (let i = 0; i < players.length; i++) {
      order.push((startPlayerIndex + i) % players.length);
    }
    return order;
  }, [effectiveRound, players.length, startPlayerIndex]);

  // Current speaker step (0 to players.length - 1)
  const [speakerStep, setSpeakerStep] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  const activePlayerIndex = speakerOrder[speakerStep];
  const activePlayer = players[activePlayerIndex];
  const isLastSpeaker = speakerStep === players.length - 1;
  const nextPlayerIndex = !isLastSpeaker ? speakerOrder[speakerStep + 1] : null;
  const nextPlayer = nextPlayerIndex !== null ? players[nextPlayerIndex] : null;

  // Reset 30s timer on speaker change
  useEffect(() => {
    setSecondsLeft(30);
    setTimerActive(true);
  }, [speakerStep]);

  // Optional 30s speaker countdown timer
  useEffect(() => {
    if (!timerActive || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          sound.playClick();
          return 0;
        }
        if (prev <= 6) {
          sound.playClick();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  const handleNextSpeaker = () => {
    sound.playClick();
    if (!isLastSpeaker) {
      setSpeakerStep((prev) => prev + 1);
    } else {
      sound.playSuccessChime();
      onProceedToDiscussion();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 max-w-lg mx-auto transition-colors duration-200">
      {/* Top Bar with round indicator */}
      <div>
        <GameTopBar
          lang={lang}
          onToggleLang={onToggleLang}
          theme={theme}
          onToggleTheme={onToggleTheme}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onOpenRules={onOpenRules}
        />

        {/* Phase Header */}
        <div className="text-center mt-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {isEn ? `Round ${currentRound} of ${totalRounds}` : `রাউন্ড ${currentRound} / ${totalRounds}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isEn ? 'Clue Sharing Phase' : 'ইঙ্গিত প্রদানের পর্ব'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEn
              ? `Speaker ${speakerStep + 1} of ${players.length} • Started with ${players[startPlayerIndex].name}`
              : `${players.length} জনের মধ্যে ${speakerStep + 1} নম্বর বক্তা • শুরুতে: ${players[startPlayerIndex].name}`}
          </p>
        </div>

        {/* Turn order progress strip */}
        <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
            {speakerOrder.map((playerIdx, idx) => {
              const p = players[playerIdx];
              const hasSpoken = idx < speakerStep;
              const isCurrent = idx === speakerStep;

              return (
                <div key={p.id} className="flex flex-col items-center min-w-[52px] relative">
                  <div className="relative">
                    <div
                      className={`transition-all duration-300 rounded-full p-0.5 ${
                        isCurrent
                          ? 'ring-3 ring-amber-500 scale-110 shadow-md shadow-amber-500/30'
                          : hasSpoken
                          ? 'opacity-60 grayscale'
                          : 'opacity-40'
                      }`}
                    >
                      <PlayerAvatar avatar={p.avatar} color={p.avatarColor} size="sm" />
                    </div>
                    {hasSpoken && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                    {isCurrent && (
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-bold truncate max-w-[50px] text-center ${
                      isCurrent
                        ? 'text-amber-500 dark:text-amber-400'
                        : hasSpoken
                        ? 'text-slate-400 line-through'
                        : 'text-slate-400'
                    }`}
                  >
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spotlight Card for Current Speaker */}
      <div className="my-auto py-6">
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-xl shadow-amber-500/5 p-6 text-center space-y-4">
          {/* Speaking Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/30">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>{isEn ? 'Now Speaking' : 'এখন কথা বলছেন'}</span>
          </div>

          {/* Player Big Avatar & Name */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="p-1 rounded-full ring-4 ring-amber-500/40 shadow-xl">
                <PlayerAvatar
                  avatar={activePlayer.avatar}
                  color={activePlayer.avatarColor}
                  size="xl"
                />
              </div>
              <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-slate-900 dark:bg-slate-800 text-amber-400 text-xs font-bold shadow">
                #{speakerStep + 1}
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-wide">
                {activePlayer.name}
              </h2>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {isEn ? activePlayer.titleEn : activePlayer.titleBn}
              </p>
            </div>
          </div>

          {/* Clue Prompt Instructions */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isEn
                    ? 'Give one short clue or sentence about your word.'
                    : 'আপনার প্রাপ্ত শব্দটি সম্পর্কে একটি ছোট বক্তব্য বা ইঙ্গিত দিন।'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isEn
                    ? 'Do not say the word directly! Convince other citizens without letting the imposter know what the secret word is.'
                    : 'সরাসরি শব্দটি বলবেন না! এমন ইঙ্গিত দিন যাতে নাগরিকরা বুঝতে পারে আপনি নির্দোষ, কিন্তু ধাপ্পাবাজ যেন শব্দটি ধরতে না পারে।'}
                </p>
              </div>
            </div>
          </div>

          {/* Timer display */}
          <div className="flex items-center justify-center gap-2 pt-1 text-slate-500 dark:text-slate-400 text-xs font-mono">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              {isEn ? 'Recommended time:' : 'প্রস্তাবিত সময়:'}{' '}
              <strong className={secondsLeft <= 5 ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                {secondsLeft}s
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleNextSpeaker}
          className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <span>
            {isLastSpeaker
              ? isEn
                ? 'All Spoken • Start Open Discussion ➔'
                : 'সবার বক্তব্য সমাপ্ত • উন্মুক্ত আলোচনা শুরু করুন ➔'
              : isEn
              ? `Finished • Next Speaker: ${nextPlayer?.name || ''} ➔`
              : `বক্তব্য সম্পন্ন • পরবর্তী বক্তা: ${nextPlayer?.name || ''} ➔`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-medium">
          {isEn
            ? 'Each player speaks in clockwise order before open debate'
            : 'উন্মুক্ত তর্কের আগে প্রত্যেকে পর্যায়ক্রমে নিজ নিজ ইঙ্গিত প্রকাশ করবেন'}
        </p>
      </div>
    </div>
  );
};
