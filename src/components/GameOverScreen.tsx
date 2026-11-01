import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Users, Sparkles } from 'lucide-react';
import { Player, RoundResult, Language, Theme } from '../types/game';
import { GameTopBar } from './GameTopBar';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface GameOverScreenProps {
  players: Player[];
  roundResults: RoundResult[];
  onPlayAgainSamePlayers: () => void;
  onResetToSetup: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  players,
  roundResults,
  onPlayAgainSamePlayers,
  onResetToSetup,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const winnerTitle = isEn ? winner?.titleEn : winner?.titleBn;

  useEffect(() => {
    sound.playSuccessChime();

    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 md:px-8 max-w-3xl mx-auto transition-colors duration-200">
      <GameTopBar
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenRules={onOpenRules}
        roundBadge={isEn ? 'Final Champions' : 'খেলা সমাপ্ত'}
      />

      {/* Main Podium & Standings */}
      <div className="my-auto py-5 space-y-6">
        {/* Winner Hero Banner */}
        <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-500/15 via-white dark:via-slate-900 to-white dark:to-slate-950 border border-amber-500/50 text-center shadow-xl relative overflow-hidden">
          <div className="mx-auto mb-3">
            <PlayerAvatar
              avatar={winner?.avatar || '🕵️'}
              color={winner?.avatarColor || 'bg-amber-500'}
              size="xl"
              className="mx-auto shadow-2xl animate-bounce"
            />
          </div>

          <span className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">
            {isEn ? 'Grand Champion' : 'গ্র্যান্ড চ্যাম্পিয়ন'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            {winner?.name}
          </h2>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-bold border border-slate-200 dark:border-slate-700 inline-block mt-1 mb-2">
            {winnerTitle}
          </span>
          <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {isEn ? `Final Score: ${winner?.score} pts` : `সর্বমোট স্কোর: ${winner?.score} পয়েন্ট`}
          </p>
        </div>

        {/* Podium for Top 3 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-2">
          {/* 2nd Place */}
          {sorted[1] && (
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <PlayerAvatar
                avatar={sorted[1].avatar || '🕵️'}
                color={sorted[1].avatarColor || 'bg-slate-300'}
                size="md"
                badge={2}
                className="mx-auto mb-1"
              />
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sorted[1].name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isEn ? sorted[1].titleEn : sorted[1].titleBn}
              </p>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold block">
                {sorted[1].score} {isEn ? 'pts' : 'পয়েন্ট'}
              </span>
            </div>
          )}

          {/* 1st Place Podium Center */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-t from-amber-500/15 to-white dark:to-slate-900 border border-amber-500/40 text-center space-y-1 -translate-y-2 shadow-md">
            <PlayerAvatar
              avatar={winner?.avatar || '🕵️'}
              color={winner?.avatarColor || 'bg-amber-500'}
              size="lg"
              badge="👑"
              className="mx-auto mb-1 shadow-md"
            />
            <p className="text-base font-black text-amber-600 dark:text-amber-400 truncate">{winner?.name}</p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-300/80 truncate">{winnerTitle}</p>
            <span className="text-sm font-mono text-slate-900 dark:text-white font-black block">
              {winner?.score} {isEn ? 'pts' : 'পয়েন্ট'}
            </span>
          </div>

          {/* 3rd Place */}
          {sorted[2] && (
            <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <PlayerAvatar
                avatar={sorted[2].avatar || '🕵️'}
                color={sorted[2].avatarColor || 'bg-amber-700'}
                size="md"
                badge={3}
                className="mx-auto mb-1"
              />
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sorted[2].name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isEn ? sorted[2].titleEn : sorted[2].titleBn}
              </p>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold block">
                {sorted[2].score} {isEn ? 'pts' : 'পয়েন্ট'}
              </span>
            </div>
          )}
        </div>

        {/* Match rounds summary */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isEn ? `Match History (${roundResults.length} Rounds)` : `খেলা রিভিউ (${roundResults.length}টি রাউন্ড)`}
          </h4>

          <div className="space-y-1.5 text-xs">
            {roundResults.map((r) => {
              const imposterNames = players
                .filter((p) => r.imposterIds.includes(p.id))
                .map((p) => p.name)
                .join(', ');

              return (
                <div
                  key={r.roundNumber}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-amber-600 dark:text-amber-400 font-bold mr-2">
                      {isEn ? `R${r.roundNumber}:` : `রাউন্ড ${r.roundNumber}:`}
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {isEn ? r.word.wordEn : r.word.wordBn}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1.5 font-mono">
                      ({isEn ? r.word.wordBn : r.word.wordEn})
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-slate-500 dark:text-slate-400">{isEn ? 'Imposter: ' : 'ধাপ্পাবাজ: '}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{imposterNames}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onPlayAgainSamePlayers();
          }}
          className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{isEn ? 'Play Again (Same Players)' : 'একই খেলোয়াড়দের নিয়ে পুনরায় খেলুন'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onResetToSetup();
          }}
          className="py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Users className="w-5 h-5" />
          <span>{isEn ? 'New Game / Setup' : 'নতুন খেলোয়াড় বা সেটআপ'}</span>
        </button>
      </div>
    </div>
  );
};
