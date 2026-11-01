import React from 'react';
import { Trophy, Award, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { startOnlineRound, setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineScoreboardScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
  onExitToMenu: () => void;
}

export const OnlineScoreboardScreen: React.FC<OnlineScoreboardScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
  onExitToMenu,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  // Sorted leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isLastRound = room.currentRound >= room.totalRounds;

  const handleNextRound = async () => {
    sound.playClick();
    if (isLastRound) {
      await setOnlineRoomPhase(room.roomCode, 'GAME_OVER');
    } else {
      await startOnlineRound(room.roomCode, room.currentRound + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Award className="w-3.5 h-3.5" />
          <span>
            {isEn
              ? `Leaderboard • Round ${room.currentRound}/${room.totalRounds}`
              : `পয়েন্ট তালিকা • রাউন্ড ${room.currentRound}/${room.totalRounds}`}
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Current Match Standings' : 'বর্তমান অবস্থান ও স্কোর'}
        </h2>
      </div>

      {/* Leaderboard List */}
      <div className="my-6 space-y-2.5 max-h-[50vh] overflow-y-auto p-1">
        {sortedPlayers.map((p, idx) => {
          const isMe = p.id === currentPlayer.id;
          const rank = idx + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                rank === 1
                  ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                  : isMe
                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 text-center font-black font-mono text-base">
                  {medal}
                </span>

                <div className={`w-10 h-10 rounded-xl ${p.avatarColor || 'bg-amber-500'} flex items-center justify-center text-xl shrink-0`}>
                  {p.avatar || '🕵️'}
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {isEn ? p.titleEn : p.titleBn}
                  </div>
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right shrink-0">
                <span className="text-xl font-black font-mono text-amber-500">
                  {p.score}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isEn ? 'pts' : 'পয়েন্ট'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Round Score Breakdown (Details) */}
      {room.scoreDetails && room.scoreDetails.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-600 dark:text-slate-300">
            {isEn ? 'This Round Points Delta:' : 'এই রাউন্ডের পয়েন্ট হিসাব:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {room.scoreDetails.map((detail) => (
              <div key={detail.playerId} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="truncate font-semibold">{detail.playerName}:</span>
                <span className={`font-mono font-bold ${detail.pointsDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {detail.pointsDelta >= 0 ? `+${detail.pointsDelta}` : detail.pointsDelta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost ? (
          <button
            type="button"
            onClick={handleNextRound}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLastRound ? (
              <>
                <Trophy className="w-5 h-5 fill-slate-950" />
                <span>{isEn ? 'Show Final Champions Podium' : 'চূড়ান্ত চ্যাম্পিয়ন ঘোষণা'}</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>
                  {isEn
                    ? `Start Round ${room.currentRound + 1}`
                    : `পরবর্তী ${room.currentRound + 1}ম রাউন্ড শুরু করুন`}
                </span>
              </>
            )}
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
            {isEn
              ? 'Waiting for host to start next round...'
              : 'হোস্ট পরবর্তী রাউন্ড শুরু করার জন্য অপেক্ষা করুন...'}
          </div>
        )}

        <button
          type="button"
          onClick={onExitToMenu}
          className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{isEn ? 'Exit to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}</span>
        </button>
      </div>
    </div>
  );
};
