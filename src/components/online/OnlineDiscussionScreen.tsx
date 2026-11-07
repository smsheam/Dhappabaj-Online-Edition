import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Vote,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineDiscussionScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineDiscussionScreen: React.FC<OnlineDiscussionScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const [showCluesList, setShowCluesList] = useState<boolean>(true);

  // Synchronized Discussion Timer
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return room.settings.discussionTimer || 90;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  const [autoAdvancing, setAutoAdvancing] = useState<boolean>(false);

  // Synchronized countdown timer
  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If timer hits 0: strictly the HOST automatically transitions to voting to prevent client clock skew
      if (remaining === 0 && !autoAdvancing) {
        if (isHost) {
          setAutoAdvancing(true);
          clearInterval(interval);
          handleStartVoting();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, autoAdvancing, isHost]);

  const handleStartVoting = async () => {
    sound.playClick();
    const votingTime = room.settings.votingTimer || 30;
    await setOnlineRoomPhase(room.roomCode, 'VOTING', votingTime);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 max-w-3xl mx-auto transition-colors duration-200">
      {/* Top Synchronized Timer Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Discussion' : 'আলোচনা পর্ব'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Interrogate suspects before voting' : 'ভোটের পূর্বে সবাইকে জেরা করুন'}
            </p>
          </div>
        </div>

        {/* Countdown Pill in Seconds */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono text-base sm:text-lg font-black border transition-all ${
            timeLeft <= 10
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft} sec</span>
        </div>
      </div>

      {/* Clues Review Collapsible Tray */}
      <div className="my-2 flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs">
        <button
          type="button"
          onClick={() => setShowCluesList(!showCluesList)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1 py-0.5 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Submitted Clues for Reference' : 'খেলোয়াড়দের দেওয়া ক্লুসমূহ'}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{showCluesList ? (isEn ? 'Hide' : 'লুকান') : (isEn ? 'Show' : 'দেখুন')}</span>
            {showCluesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showCluesList && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[55vh] overflow-y-auto pt-1 border-t border-slate-100 dark:border-slate-800">
            {players.map((p) => {
              const isMe = p.id === currentPlayer.id;
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1 min-w-0 font-semibold truncate">
                      <span>{p.avatar || '🕵️'}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  </div>
                  <div className="font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                    "{p.clue || (isEn ? 'No clue' : 'ক্লু নেই')}"
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartVoting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Vote className="w-5 h-5" />
            <span>{isEn ? 'End Discussion & Start Voting' : 'আলোচনা শেষ করে ভোট শুরু করুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-1 font-medium">
            {isEn
              ? 'Discuss clues. Voting begins when timer ends or host advances.'
              : 'ক্লু নিয়ে আলোচনা করুন। সময় শেষ হলে বা হোস্ট ক্লিক করলে ভোট শুরু হবে।'}
          </div>
        )}
      </div>
    </div>
  );
};
