import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Vote, AlertTriangle, ArrowRight } from 'lucide-react';
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

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return room.settings.discussionTimer || 90;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If timer hits 0 and player is host, automatically transition to voting
      if (remaining === 0 && isHost) {
        clearInterval(interval);
        handleStartVoting();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, isHost]);

  const handleStartVoting = async () => {
    sound.playClick();
    const votingTime = room.settings.votingTimer || 45;
    await setOnlineRoomPhase(room.roomCode, 'VOTING', votingTime);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-3xl mx-auto transition-colors duration-200">
      {/* Synchronized Timer Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Open Discussion' : 'মুক্ত আলোচনা পর্ব'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? 'Discuss clues and interrogate suspects' : 'সন্দেহভাজনদের জেরা করুন ও আলোচনা করুন'}
            </p>
          </div>
        </div>

        {/* Countdown Pill */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xl sm:text-2xl font-black border transition-all ${
            timeLeft <= 10
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Clues Review Grid */}
      <div className="my-6 space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {isEn
                ? 'Spot inconsistencies or hesitation in clues!'
                : 'কার ক্লু বেশি সন্দেহজনক মনে হচ্ছে খতিয়ে দেখুন!'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
          {players.map((p) => {
            const isMe = p.id === currentPlayer.id;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl">{p.avatar || '🕵️'}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {isEn ? p.titleEn : p.titleBn}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {isEn ? 'Submitted Clue' : 'প্রদত্ত ক্লু'}
                  </div>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {p.clue ? `"${p.clue}"` : isEn ? '(No clue provided)' : '(কোন ক্লু দেয়নি)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartVoting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-lg shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Vote className="w-5 h-5" />
            <span>{isEn ? 'End Discussion & Start Voting' : 'আলোচনা শেষ করে ভোট শুরু করুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
            {isEn
              ? 'Discuss freely. Voting will begin when timer ends or host advances.'
              : 'মুক্তভাবে আলোচনা করুন। সময় শেষ হলে বা হোস্ট ক্লিক করলে ভোট শুরু হবে।'}
          </div>
        )}
      </div>
    </div>
  );
};
