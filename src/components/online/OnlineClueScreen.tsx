import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { submitOnlineClue, setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineClueScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  privateRole: PrivatePlayerRole | null;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineClueScreen: React.FC<OnlineClueScreenProps> = ({
  room,
  currentPlayer,
  privateRole,
  players,
  lang,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;
  const [clueInput, setClueInput] = useState<string>(currentPlayer.clue || '');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!currentPlayer.clue);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Synchronized countdown timer
  const clueDuration = room.settings.clueTimer || 30;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return clueDuration;
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

      if (remaining === 0 && isHost) {
        clearInterval(interval);
        handleProceedToDiscussion();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, isHost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueInput.trim()) return;
    setSubmitting(true);
    sound.playClick();
    try {
      await submitOnlineClue(room.roomCode, clueInput);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToDiscussion = async () => {
    sound.playClick();
    const discussionTime = room.settings.discussionTimer || 90;
    await setOnlineRoomPhase(room.roomCode, 'DISCUSSION', discussionTime);
  };

  const submittedCount = players.filter((p) => !!p.clue).length;
  const allCluesIn = submittedCount === players.length && players.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Header with Timer */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Stage 1: Give Your Clue' : '১ম ধাপ: আপনার ক্লু দিন'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Enter 1-2 words hint' : '১-২ শব্দের ইঙ্গিত লিখুন'}
            </p>
          </div>
        </div>

        {/* Synchronized Clue Timer */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono text-lg font-black border transition-all ${
            timeLeft <= 5
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Clue Input Form */}
      <div className="my-5 space-y-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Your Clue' : 'আপনার ক্লু'}
            </label>
            {isSubmitted && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Clue Saved' : 'ক্লু জমা হয়েছে'}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={clueInput}
              onChange={(e) => {
                setClueInput(e.target.value);
                if (isSubmitted) setIsSubmitted(false);
              }}
              maxLength={40}
              placeholder={isEn ? 'e.g. Yellow, Sweet, Morning...' : 'যেমন: মিষ্টি, গোল, সকাল...'}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={submitting || !clueInput.trim()}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isEn ? 'Submit' : 'জমা দিন'}</span>
            </button>
          </form>

          {/* Quick role reminder */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 text-[11px] text-center">
            {privateRole?.role === 'imposter' ? (
              <span className="text-rose-500 font-bold">
                🕵️ {isEn ? 'Imposter Hint: ' : 'ধাপ্পাবাজ ইঙ্গিত: '}
                {isEn
                  ? privateRole.shortHintEn || privateRole.hintEn || 'Blend in smoothly'
                  : privateRole.shortHintBn || privateRole.hintBn || 'সবার সাথে মিশে যান'}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                🛡️ {isEn ? `Secret Word: "${privateRole?.wordBn} (${privateRole?.wordEn})"` : `আসল শব্দ: "${privateRole?.wordBn}"`}
              </span>
            )}
          </div>
        </div>

        {/* Live Clue Submissions Feed */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Clues Submitted So Far' : 'জমা হওয়া ক্লুসমূহ'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {submittedCount} / {players.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[35vh] overflow-y-auto p-1">
            {players.map((p) => {
              const hasClue = !!p.clue;
              const isMe = p.id === currentPlayer.id;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    hasClue
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{p.avatar || '🕵️'}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                    </span>
                  </div>

                  <div className="text-right">
                    {hasClue ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                        "{p.clue}"
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>{isEn ? 'Thinking...' : 'লিখছেন...'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Host Controls */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {isHost ? (
          <button
            type="button"
            onClick={handleProceedToDiscussion}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              allCluesIn
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <span>
              {allCluesIn
                ? isEn
                  ? 'All Clues In! Proceed to Discussion'
                  : 'সব ক্লু জমা হয়েছে! আলোচনায় চলুন'
                : isEn
                ? `Proceed to Discussion (${submittedCount}/${players.length})`
                : `আলোচনায় এগিয়ে চলুন (${submittedCount}/${players.length})`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
            {isEn
              ? 'Waiting for host to proceed to discussion stage...'
              : 'হোস্ট আলোচনার ধাপে নিয়ে যাওয়ার জন্য অপেক্ষা করুন...'}
          </div>
        )}
      </div>
    </div>
  );
};
