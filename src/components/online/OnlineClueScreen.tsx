import React, { useState } from 'react';
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
  const allCluesIn = submittedCount === players.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isEn ? 'Stage 1: Give Your Clue' : '১ম ধাপ: আপনার ক্লু দিন'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Submit Your Secret Clue' : 'আপনার ইঙ্গিতমূলক ক্লু লিখুন'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn
            ? 'Type a 1-2 word hint about your role. Innocents know the word; Imposter pretends!'
            : '১-২ শব্দের ক্লু লিখুন। নাগরিকরা মূল শব্দের আভাস দিন, আর ধাপ্পাবাজ আন্দাজে নাটক করুন!'}
        </p>
      </div>

      {/* Clue Input Form */}
      <div className="my-6 space-y-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Your Clue (1-3 words)' : 'আপনার ক্লু (১-৩ শব্দ)'}
            </label>
            {isSubmitted && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Submitted' : 'জমা হয়েছে'}</span>
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
              placeholder={isEn ? 'e.g. Delicious, spicy...' : 'যেমন: সুস্বাদু, ঝাল, লাল...'}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={submitting || !clueInput.trim()}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isEn ? 'Send' : 'জমা দিন'}</span>
            </button>
          </form>

          {/* Quick reminder pill */}
          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            {privateRole?.role === 'imposter'
              ? isEn
                ? 'Hint: Blend in! Listen carefully to other clues.'
                : 'পরামর্শ: এমন ক্লু দিন যেন কেউ সন্দেহ না করে!'
              : isEn
              ? `Secret Word: "${privateRole?.wordBn} (${privateRole?.wordEn})"`
              : `আসল শব্দ: "${privateRole?.wordBn}"`}
          </div>
        </div>

        {/* Live Clue Submissions Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Clues Submitted So Far' : 'জমা হওয়া ক্লুসমূহ'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {submittedCount} / {players.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {players.map((p) => {
              const hasClue = !!p.clue;
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
                      {p.name}
                    </span>
                  </div>

                  <div className="text-right">
                    {hasClue ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                        "{p.clue}"
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isEn ? 'Thinking...' : 'লিখছে...'}</span>
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
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost ? (
          <button
            type="button"
            onClick={handleProceedToDiscussion}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              allCluesIn
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/25'
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
