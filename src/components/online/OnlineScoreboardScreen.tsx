import React, { useState } from 'react';
import { Trophy, Award, ArrowRight, RotateCcw, Home, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { startOnlineRound, setOnlineRoomPhase, confirmOnlineNextRound } from '../../services/multiplayerService';
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

  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const [isSubmittingReady, setIsSubmittingReady] = useState<boolean>(false);

  // Sorted leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isLastRound = room.currentRound >= room.totalRounds;

  const confirmedPlayerIds = room.nextRoundConfirmed || [];
  const hasConfirmed = confirmedPlayerIds.includes(currentPlayer.id);

  const activePlayers = players.filter((p) => p.connectionStatus !== 'offline');
  const targetPlayers = activePlayers.length > 0 ? activePlayers : players;
  const confirmedCount = targetPlayers.filter((p) => confirmedPlayerIds.includes(p.id)).length;
  const totalCount = targetPlayers.length;

  // Automated transition once all players have confirmed (Host-executed to respect Firestore rules)
  const autoAdvanceTriggeredRef = React.useRef<boolean>(false);
  const isAllConfirmed = totalCount > 0 && confirmedCount >= totalCount;

  React.useEffect(() => {
    if (!isHost || !isAllConfirmed || autoAdvanceTriggeredRef.current) return;

    autoAdvanceTriggeredRef.current = true;
    const timer = setTimeout(async () => {
      try {
        if (isLastRound) {
          await setOnlineRoomPhase(room.roomCode, 'GAME_OVER');
        } else {
          await startOnlineRound(room.roomCode, room.currentRound + 1);
        }
      } catch (err) {
        console.error('Error auto-advancing to next round:', err);
        autoAdvanceTriggeredRef.current = false;
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isHost, isAllConfirmed, isLastRound, room.roomCode, room.currentRound]);

  const handleConfirmReady = async () => {
    if (hasConfirmed || isSubmittingReady) return;
    setIsSubmittingReady(true);
    sound.playClick();
    try {
      await confirmOnlineNextRound(room.roomCode, currentPlayer.id);
    } catch (err) {
      console.error('Error confirming next round:', err);
    } finally {
      setIsSubmittingReady(false);
    }
  };

  const handleHostForceAdvance = async () => {
    sound.playClick();
    if (isLastRound) {
      await setOnlineRoomPhase(room.roomCode, 'GAME_OVER');
    } else {
      await startOnlineRound(room.roomCode, room.currentRound + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200 relative">
      {/* Top Bar with Top-Right Exit Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Award className="w-3.5 h-3.5" />
          <span>
            {isEn
              ? `Leaderboard • Round ${room.currentRound}/${room.totalRounds}`
              : `পয়েন্ট তালিকা • রাউন্ড ${room.currentRound}/${room.totalRounds}`}
          </span>
        </div>

        {/* Top-Right Exit Button with Warning Dialog */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowExitWarning(true);
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/60"
          title={isEn ? 'Exit to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center pt-2 space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Current Match Standings' : 'বর্তমান অবস্থান ও স্কোর'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn
            ? 'All players must click Next Round to proceed'
            : 'পরবর্তী রাউন্ড শুরু করতে সব খেলোয়াড়কে নিশ্চিত করতে হবে'}
        </p>
      </div>

      {/* Confirmation Progress Bar */}
      <div className="my-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isEn
              ? `Ready for Next Round: ${confirmedCount}/${totalCount}`
              : `পরবর্তী রাউন্ডের প্রস্তুতি: ${confirmedCount}/${totalCount} জন`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {targetPlayers.map((p) => {
            const ready = confirmedPlayerIds.includes(p.id);
            return (
              <span
                key={p.id}
                title={`${p.name} (${ready ? 'Ready' : 'Waiting'})`}
                className={`text-sm px-1 py-0.5 rounded-lg border transition-all ${
                  ready
                    ? 'bg-emerald-500/20 border-emerald-500/50 scale-110 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-40'
                }`}
              >
                {p.avatar || '🕵️'}
              </span>
            );
          })}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="my-3 space-y-2.5 max-h-[46vh] overflow-y-auto p-1">
        {sortedPlayers.map((p, idx) => {
          const isMe = p.id === currentPlayer.id;
          const rank = idx + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
          const isReady = confirmedPlayerIds.includes(p.id);

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
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}</span>
                    {isReady && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isEn ? 'Ready' : 'প্রস্তুত'}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {isEn ? p.titleEn : p.titleBn}
                  </div>
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-xl font-black font-mono text-amber-500">
                    {p.score}
                  </span>
                  {(() => {
                    const delta = room.scoreDetails?.find((d) => d.playerId === p.id)?.pointsDelta;
                    if (delta === undefined) return null;
                    return (
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          delta >= 0
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {delta >= 0 ? `+${delta}` : delta}
                      </span>
                    );
                  })()}
                </div>
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
        <div className="mb-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>{isEn ? 'Round Points Breakdown & Reasons:' : 'রাউন্ডের পয়েন্ট ও অর্জনের কারণ:'}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {isEn ? `Round ${room.currentRound}` : `${room.currentRound}ম রাউন্ড`}
            </span>
          </div>
          <div className="space-y-1.5 max-h-[16vh] overflow-y-auto">
            {room.scoreDetails.map((detail) => (
              <div
                key={detail.playerId}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col gap-1 border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-bold text-slate-900 dark:text-white">
                    {detail.playerName}:
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${
                      detail.pointsDelta >= 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {detail.pointsDelta >= 0 ? `+${detail.pointsDelta}` : detail.pointsDelta} {isEn ? 'pts' : 'পয়েন্ট'}
                  </span>
                </div>
                {detail.reasons && detail.reasons.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
                    {detail.reasons.map((r, rIdx) => (
                      <span key={rIdx}>• {isEn ? r.en : r.bn}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions: All players confirm next round */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!hasConfirmed ? (
          <button
            type="button"
            disabled={isSubmittingReady}
            onClick={handleConfirmReady}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isLastRound
                ? isEn
                  ? 'Confirm Champions Podium'
                  : 'চ্যাম্পিয়ন পোডিয়ামে যান'
                : isEn
                ? `Confirm Next Round (${room.currentRound + 1})`
                : `পরবর্তী ${room.currentRound + 1}ম রাউন্ডে যাওয়ার নিশ্চিতকরণ`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-center flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span>
              {isEn
                ? `✓ You are ready! Waiting for all players (${confirmedCount}/${totalCount})...`
                : `✓ আপনি প্রস্তুত! সবার নিশ্চিতকরণের অপেক্ষা (${confirmedCount}/${totalCount})...`}
            </span>
          </div>
        )}

        {/* Host bypass button if players are taking too long or someone disconnected */}
        {isHost && (
          <button
            type="button"
            onClick={handleHostForceAdvance}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {isLastRound
                ? isEn
                  ? 'Host Override: Advance to Podium Now'
                  : 'হোস্ট হিসেবে সরাসরি পোডিয়ামে যান'
                : isEn
                ? `Host Override: Force Start Round ${room.currentRound + 1}`
                : `হোস্ট হিসেবে সরাসরি ${room.currentRound + 1}ম রাউন্ড শুরু করুন`}
            </span>
          </button>
        )}
      </div>

      {/* Exit Warning Dialog Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Leave Match?' : 'খেলা ছেড়ে যেতে চান?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Are you sure you want to return to the main menu? You will leave the active match.'
                  : 'আপনি কি নিশ্চিত যে খেলা ছেড়ে মূল মেন্যুতে ফিরে যেতে চান? আপনি ম্যাচ থেকে বের হয়ে যাবেন।'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Stay in Game' : 'না, খেলায় থাকুন'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitWarning(false);
                  onExitToMenu();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-md shadow-rose-500/20"
              >
                {isEn ? 'Yes, Exit' : 'হ্যাঁ, বের হন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

