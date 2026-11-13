import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Zap,
  Lock,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { submitOnlineClue, advanceOnlineClueTurn } from '../../services/multiplayerService';
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
  const [clueInput, setClueInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  // Turn-based ordering:
  // clueOrder contains the rotated sequence of player IDs for this round
  const clueOrder = room.clueOrder && room.clueOrder.length > 0
    ? room.clueOrder
    : players.map((p) => p.id);

  const currentTurnIndex = room.clueTurnIndex ?? 0;
  const currentTurnPlayerId = room.clueTurnPlayerId || clueOrder[currentTurnIndex] || null;
  const isMyTurn = currentTurnPlayerId === currentPlayer.id;
  const currentTurnPlayer = players.find((p) => p.id === currentTurnPlayerId);

  // Synchronized countdown timer for the current player's turn (default 30s)
  const clueDuration = room.settings.clueTimer || 30;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return clueDuration;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  const submittingRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const syncTimer = () => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    syncTimer();

    const interval = setInterval(() => {
      const remaining = syncTimer();

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If time expires for current turn: active player advances immediately, host acts after 1s grace
      if (remaining === 0 && !hasTimedOut) {
        if (isMyTurn) {
          setHasTimedOut(true);
          advanceOnlineClueTurn(room.roomCode, currentTurnPlayerId || undefined);
        } else if (currentPlayer.isHost) {
          setHasTimedOut(true);
          setTimeout(() => {
            advanceOnlineClueTurn(room.roomCode, currentTurnPlayerId || undefined);
          }, 1200);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, currentTurnPlayerId, hasTimedOut, room.roomCode, isMyTurn, currentPlayer.isHost]);

  // Reset timeout guard when active turn changes
  useEffect(() => {
    setHasTimedOut(false);
    submittingRef.current = false;
  }, [currentTurnPlayerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clueInput.trim();
    if (!trimmed || submitting || submittingRef.current || !isMyTurn) return;

    submittingRef.current = true;
    setSubmitting(true);
    sound.playClick();
    try {
      await submitOnlineClue(room.roomCode, trimmed);
      setClueInput('');
    } catch (err) {
      console.error(err);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Build sequential list of players in the order they give clues
  const orderedPlayers = clueOrder.map((id) => players.find((p) => p.id === id)).filter(Boolean) as OnlinePlayer[];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Header with Sequential Turn Status & Timer */}
      <div className="space-y-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Stage 1: Sequential Clues (One by One)' : '১ম ধাপ: এক এক করে ক্লু প্রদান'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Each player submits clue in turn. Everyone can see previous clues!'
                  : 'প্রত্যেকে ক্রমানুসারে ক্লু দেবেন। পূর্ববর্তী সবার ক্লু দেখে নেওয়া যাবে!'}
              </p>
            </div>
          </div>

          {/* Turn Timer */}
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

        {/* Turn Progress Tracker */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-700 dark:text-slate-300">
              {isEn ? 'Clue Turn Order' : 'ক্লু দেওয়ার পর্যায়ক্রম'}
            </span>
            <span className="font-mono text-amber-500">
              {Math.min(currentTurnIndex + 1, orderedPlayers.length)} / {orderedPlayers.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {orderedPlayers.map((p, idx) => {
              const isCurrent = p.id === currentTurnPlayerId;
              const isDone = !!p.clue;
              const isMe = p.id === currentPlayer.id;

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-md ring-2 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-mono text-[10px]">{idx + 1}.</span>
                  <span>{p.avatar || '🕵️'}</span>
                  <span className="truncate max-w-[80px]">
                    {p.name} {isMe && '*'}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {isCurrent && <Clock className="w-3.5 h-3.5 animate-spin shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: Active Turn Box & Prior Clues */}
      <div className="my-3 space-y-3.5">
        {/* Active Turn Interactive Box */}
        {isMyTurn ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500 shadow-lg space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? 'IT IS YOUR TURN NOW!' : 'এখন আপনার ক্লু দেওয়ার পালা!'}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                {isEn ? `${timeLeft}s left` : `${timeLeft}s বাকি`}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                maxLength={45}
                placeholder={isEn ? 'Type your 1-2 words clue...' : '১-২ শব্দের ক্লু লিখুন...'}
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/50 text-sm font-bold focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={submitting || !clueInput.trim()}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isEn ? 'Submit' : 'জমা দিন'}</span>
              </button>
            </form>

            {/* Secret Identity Reminder for Active Player */}
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-amber-500/30 text-xs">
              {privateRole?.role === 'imposter' ? (
                <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 flex-wrap">
                  <span>🕵️</span>
                  <span>{isEn ? 'Imposter Hint: ' : 'ধাপ্পাবাজ ইঙ্গিত: '}</span>
                  <span className="underline">
                    {isEn
                      ? privateRole.shortHintEn || privateRole.hintEn || 'Related to category'
                      : privateRole.shortHintBn || privateRole.hintBn || 'ক্যাটাগরি সম্পর্কিত'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({isEn ? 'Blend in with others' : 'অন্যদের ক্লু লক্ষ্য করে মিল রাখুন'})
                  </span>
                </div>
              ) : (
                <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>{isEn ? 'Secret Word: ' : 'আপনার আসল গোপন শব্দ: '}</span>
                  <span className="text-amber-500 font-black text-sm underline">
                    {privateRole?.wordBn}
                  </span>
                  <span className="text-slate-400">({privateRole?.wordEn})</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Waiting for other player's turn */
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>
                {isEn
                  ? `Waiting for ${currentTurnPlayer?.name || 'Player'} to submit clue...`
                  : `এখন ${currentTurnPlayer?.name || 'খেলোয়াড়'}-এর পালা... অপেক্ষা করুন`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn
                ? 'Review clues given by previous players below before your turn arrives!'
                : 'আপনার পালার পূর্বে নিচের আগের খেলোয়াড়দের ক্লুগুলো দেখে রাখুন!'}
            </p>
          </div>
        )}

        {/* Live Sequential Clues Feed (Visible to all, one by one) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Chronological Clues Feed' : 'ধারাবাহিক ক্লু তালিকা'}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {orderedPlayers.filter((p) => !!p.clue).length} / {orderedPlayers.length} {isEn ? 'Done' : 'সম্পন্ন'}
            </span>
          </div>

          <div className="space-y-2 max-h-[42vh] overflow-y-auto p-1">
            {orderedPlayers.map((p, idx) => {
              const hasClue = !!p.clue;
              const isCurrent = p.id === currentTurnPlayerId;
              const isMe = p.id === currentPlayer.id;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-400/30'
                      : hasClue
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 w-4">
                      {idx + 1}.
                    </span>
                    <span className="text-xl shrink-0">{p.avatar || '🕵️'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isEn ? p.titleEn : p.titleBn}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {hasClue ? (
                      <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                        "{p.clue}"
                      </span>
                    ) : isCurrent ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold text-amber-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? 'Thinking...' : 'লিখছেন...'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{isEn ? 'Waiting turn' : 'অপেক্ষমাণ'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auto Progression Notice with 3-Second Wait Notification */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {orderedPlayers.length > 0 && orderedPlayers.every((p) => !!p.clue) ? (
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {isEn
                ? '✓ All clues submitted! Waiting 3 seconds before starting discussion...'
                : '✓ সকল খেলোয়াড় ক্লু জমা দিয়েছেন! ৩ সেকেন্ড অপেক্ষা শেষে আলোচনা পর্ব শুরু হচ্ছে...'}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isEn
                ? 'Stage automatically advances to Live Discussion when all players submit clues or time ends'
                : 'সকল খেলোয়াড়ের ক্লু জমা শেষ হলে বা সময় ফুরিয়ে গেলে স্বয়ংক্রিয়ভাবে সরাসরি আলোচনা পর্ব শুরু হবে'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
