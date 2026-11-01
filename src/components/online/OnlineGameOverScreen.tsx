import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Sparkles } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineGameOverScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
  onExitToMenu: () => void;
}

export const OnlineGameOverScreen: React.FC<OnlineGameOverScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
  onExitToMenu,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const champion = sortedPlayers[0];

  useEffect(() => {
    sound.playVictory();
    try {
      const end = Date.now() + 2.5 * 1000;
      const interval: any = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 300);
      return () => clearInterval(interval);
    } catch {
      // Ignored
    }
  }, []);

  const handlePlayAgain = async () => {
    sound.playClick();
    // Return room to LOBBY
    await setOnlineRoomPhase(room.roomCode, 'LOBBY');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{isEn ? 'Match Concluded!' : 'খেলা সমাপ্ত!'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Tournament Champions' : 'ধাপ্পাবাজ চ্যাম্পিয়নশিপ'}
        </h2>
      </div>

      {/* Champion Podium */}
      <div className="my-auto py-6 space-y-6">
        {champion && (
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/20 via-white dark:via-slate-900 to-amber-500/10 border-2 border-amber-500/50 shadow-2xl text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-amber-500">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>

            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/30 border-2 border-amber-500 flex items-center justify-center text-5xl shadow-xl">
                {champion.avatar || '🕵️'}
              </div>
              <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {isEn ? 'GRAND CHAMPION' : 'প্রধান চ্যাম্পিয়ন'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {champion.name}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? champion.titleEn : champion.titleBn}
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg shadow-md">
              <Trophy className="w-5 h-5 fill-slate-950" />
              <span>{champion.score} {isEn ? 'Points' : 'পয়েন্ট'}</span>
            </div>
          </div>
        )}

        {/* Runner-ups list */}
        <div className="space-y-2">
          {sortedPlayers.slice(1).map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono font-bold text-slate-400">
                  #{idx + 2}
                </span>
                <span className="text-xl">{p.avatar || '🕵️'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {p.name}
                </span>
              </div>
              <span className="font-mono font-black text-amber-500">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost && (
          <button
            type="button"
            onClick={handlePlayAgain}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isEn ? 'Play Again in this Room' : 'এই রুমে আবার খেলুন'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExitToMenu}
          className="w-full py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          <Home className="w-4 h-4" />
          <span>{isEn ? 'Return to Home Menu' : 'মূল মেন্যুতে ফিরে যান'}</span>
        </button>
      </div>
    </div>
  );
};
