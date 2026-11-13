import React, { useState } from 'react';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import { Player, RoundResult, Language, Theme } from '../types/game';
import { GameTopBar } from './GameTopBar';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';
import { triggerThreeRoundVideoAd } from '../utils/adsense';

interface ScoreboardScreenProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  lastRoundResult: RoundResult | null;
  onStartNextRound: () => void;
  onFinishGame: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({
  players,
  currentRound,
  totalRounds,
  lastRoundResult,
  onStartNextRound,
  onFinishGame,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isFinalRound = currentRound >= totalRounds;
  const [isLoadingAd, setIsLoadingAd] = useState<boolean>(false);

  const handleProceedWithAdBreak = async () => {
    if (isLoadingAd) return;
    if (isFinalRound) {
      sound.playSuccessChime();
    } else {
      sound.playClick();
    }

    if (currentRound > 0 && currentRound % 3 === 0) {
      setIsLoadingAd(true);
      await triggerThreeRoundVideoAd(currentRound);
      setIsLoadingAd(false);
    }

    if (isFinalRound) {
      onFinishGame();
    } else {
      onStartNextRound();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 max-w-2xl mx-auto transition-colors duration-200">
      <GameTopBar
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenRules={onOpenRules}
        roundBadge={isEn ? `Round ${currentRound}/${totalRounds}` : `রাউন্ড ${currentRound}/${totalRounds}`}
      />

      {/* Leaderboard List */}
      <div className="my-auto py-5 space-y-3">
        <div className="text-center mb-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>{isEn ? 'Scoreboard' : 'স্কোরবোর্ড'}</span>
          </h2>
        </div>

        {sortedPlayers.map((player, rank) => {
          const lastDetail = lastRoundResult?.scoreDetails.find((d) => d.playerId === player.id);
          const delta = lastDetail?.pointsDelta ?? 0;
          const isTop = rank === 0;
          const pTitle = isEn ? player.titleEn : player.titleBn;

          return (
            <div
              key={player.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isTop
                  ? 'bg-gradient-to-r from-amber-500/15 via-white dark:via-slate-900 to-white dark:to-slate-900 border-amber-500/50 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-sm shrink-0 ${
                    rank === 0
                      ? 'bg-amber-500 text-slate-950'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rank === 0 ? <Crown className="w-4 h-4 fill-slate-950" /> : rank + 1}
                </div>

                <PlayerAvatar
                  avatar={player.avatar || '🕵️'}
                  color={player.avatarColor || 'bg-amber-500'}
                  size="sm"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{player.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-semibold border border-slate-200 dark:border-slate-700">
                      {pTitle}
                    </span>
                    {rank === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                        {isEn ? 'Leader' : 'শীর্ষ'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isEn ? 'Last Round: ' : 'সর্বশেষ রাউন্ড: '}
                    <span
                      className={`font-mono font-bold ${
                        delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta} {isEn ? 'pts' : 'পয়েন্ট'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Total Cumulative Score */}
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{isEn ? 'Total Score' : 'মোট স্কোর'}</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {player.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        {isFinalRound ? (
          <button
            type="button"
            disabled={isLoadingAd}
            onClick={handleProceedWithAdBreak}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <span>
              {isLoadingAd
                ? isEn ? 'Loading...' : 'লোড হচ্ছে...'
                : isEn ? 'Final Champion & Podium 🏆' : 'চূড়ান্ত ফলাফল ও চ্যাম্পিয়ন দেখুন 🏆'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoadingAd}
            onClick={handleProceedWithAdBreak}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <span>
              {isLoadingAd
                ? isEn ? 'Loading...' : 'লোড হচ্ছে...'
                : isEn
                ? `Start Round ${currentRound + 1} of ${totalRounds}`
                : `পরবর্তী রাউন্ড শুরু করুন (রাউন্ড ${currentRound + 1} / ${totalRounds})`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
