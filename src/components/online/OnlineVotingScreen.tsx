import React, { useState, useEffect } from 'react';
import { Vote, Clock, CheckCircle2, ArrowRight, UserCheck, Users } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, OnlineVote } from '../../types/multiplayer';
import { castOnlineVote, resolveOnlineVotingResults } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineVotingScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  votes: OnlineVote[];
  lang: Language;
  theme: Theme;
}

export const OnlineVotingScreen: React.FC<OnlineVotingScreenProps> = ({
  room,
  currentPlayer,
  players,
  votes,
  lang,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(currentPlayer.hasVoted);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resolving, setResolving] = useState<boolean>(false);

  // Synchronized Voting Timer (default 30s)
  const votingDuration = room.settings.votingTimer || 30;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return votingDuration;
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

      if (remaining === 0 && isHost && !resolving) {
        clearInterval(interval);
        handleResolveResults();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, isHost, resolving]);

  const handleCastVote = async () => {
    if (!selectedSuspectId) return;
    setIsSubmitting(true);
    sound.playVoteCast();
    try {
      await castOnlineVote(room.roomCode, selectedSuspectId);
      setHasVoted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveResults = async () => {
    setResolving(true);
    sound.playClick();
    try {
      await resolveOnlineVotingResults(room.roomCode);
    } catch (err) {
      console.error(err);
      setResolving(false);
    }
  };

  const votedCount = players.filter((p) => p.hasVoted).length;
  const allVoted = votedCount === players.length && players.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-3xl mx-auto transition-colors duration-200">
      {/* Top Header */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Secret Voting' : 'গোপন ভোটদান'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Vote for the suspect you believe is the imposter' : 'যাকে ধাপ্পাবাজ মনে করেন তাকে ভোট দিন'}
            </p>
          </div>
        </div>

        {/* Voting Timer */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono text-lg font-black border transition-all ${
            timeLeft <= 5
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Live Who Has Voted / Who Hasn't Voted Tracker */}
      <div className="my-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'Voting Status' : 'ভোটদানের অগ্রগতি'}</span>
          </span>
          <span className="font-mono text-amber-600 dark:text-amber-400">
            {votedCount} / {players.length} {isEn ? 'Voted' : 'ভোট দিয়েছেন'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(votedCount / Math.max(1, players.length)) * 100}%` }}
          />
        </div>

        {/* Player vote status tags: Voted vs Waiting */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {players.map((p) => {
            const isMe = p.id === currentPlayer.id;
            return (
              <div
                key={p.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-1.5 text-xs transition-all ${
                  p.hasVoted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0">{p.avatar || '🕵️'}</span>
                  <span className="font-semibold truncate">
                    {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                  </span>
                </div>
                <div className="shrink-0 font-bold text-[10px]">
                  {p.hasVoted ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Voted' : 'ভোট দিয়েছেন'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-slate-400">
                      <Clock className="w-3 h-3 animate-pulse" />
                      <span>{isEn ? 'Pending' : 'ভোট বাকি'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suspects Voting Grid */}
      <div className="my-2 space-y-3">
        {hasVoted ? (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {isEn ? 'Your Secret Vote is Registered!' : 'আপনার গোপন ভোট জমা হয়েছে!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn
                ? 'Individual votes will be revealed together when voting concludes.'
                : 'ভোটের সময় শেষ হলে বা সবাই ভোট দিলে একসাথে ফলাফল প্রকাশিত হবে।'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
              {isEn ? 'Select who you suspect is the Imposter:' : 'যাকে ধাপ্পাবাজ মনে করেন তাকে নির্বাচন করুন:'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[38vh] overflow-y-auto p-1">
              {players.map((p) => {
                const isMe = p.id === currentPlayer.id;
                const isSelected = selectedSuspectId === p.id;

                return (
                  <button
                    type="button"
                    key={p.id}
                    disabled={isMe || hasVoted}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSuspectId(p.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isMe
                        ? 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30 shadow-lg scale-[1.01] cursor-pointer'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
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

                      {!isMe && (
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      )}
                    </div>

                    {p.clue && (
                      <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                        {isEn ? 'Clue: ' : 'ক্লু: '}"{p.clue}"
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {!hasVoted && (
          <button
            type="button"
            disabled={!selectedSuspectId || isSubmitting}
            onClick={handleCastVote}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Vote className="w-5 h-5" />
            <span>{isEn ? 'Confirm Secret Vote' : 'গোপন ভোট চূড়ান্ত করুন'}</span>
          </button>
        )}

        {isHost && (
          <button
            type="button"
            disabled={resolving}
            onClick={handleResolveResults}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              allVoted
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <span>
              {resolving
                ? isEn ? 'Calculating Results...' : 'ফলাফল হিসাব হচ্ছে...'
                : allVoted
                ? isEn ? 'All Players Voted! Reveal Results' : 'সবাই ভোট দিয়েছেন! ফলাফল উন্মোচন করুন'
                : isEn ? `Reveal Results (${votedCount}/${players.length})` : `ফলাফল উন্মোচন করুন (${votedCount}/${players.length})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
