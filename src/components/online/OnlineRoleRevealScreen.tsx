import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserX,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { CATEGORIES } from '../../data/categories';
import { sound } from '../../utils/audio';
import { setOnlineRoomPhase, confirmOnlineCardSeen } from '../../services/multiplayerService';
import { getAiWordDescription, AiWordDescription } from '../../services/aiDescriptionService';
import { WordItem } from '../../types/game';

interface OnlineRoleRevealScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  privateRole: PrivatePlayerRole | null;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineRoleRevealScreen: React.FC<OnlineRoleRevealScreenProps> = ({
  room,
  currentPlayer,
  privateRole,
  players,
  lang,
}) => {
  const isEn = lang === 'en';
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(currentPlayer.hasSeenCard || false);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);
  const [aiDesc, setAiDesc] = useState<AiWordDescription | null>(null);
  const advanceTriggeredRef = useRef<boolean>(false);

  const isImposter = privateRole?.role === 'imposter';
  const categoryInfo = privateRole ? CATEGORIES[privateRole.category] : null;

  // Fetch AI description for innocent player only
  useEffect(() => {
    if (!privateRole || privateRole.role === 'imposter' || !privateRole.wordBn) return;
    const dummyWord: WordItem = {
      id: room.usedWordIds?.[room.usedWordIds.length - 1] || 1,
      wordBn: privateRole.wordBn,
      wordEn: privateRole.wordEn || '',
      category: privateRole.category,
      hintBn: '',
      hintEn: '',
    };
    getAiWordDescription(dummyWord).then((desc) => {
      setAiDesc(desc);
    });
  }, [privateRole, room.usedWordIds]);

  // Synchronized countdown timer for the 45s role reveal phase
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return 45;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  const handleFlip = () => {
    sound.playCardFlip();
    setIsRevealed(!isRevealed);
  };

  const handleAcknowledge = async () => {
    sound.playClick();
    setHasAcknowledged(true);
    try {
      await confirmOnlineCardSeen(room.roomCode, currentPlayer.id);
    } catch (err) {
      console.error('Failed to confirm card seen:', err);
    }
  };

  const proceedToClues = async () => {
    if (isProceeding) return;
    setIsProceeding(true);
    sound.playClick();
    try {
      const clueDuration = room.settings.clueTimer || 30;
      await setOnlineRoomPhase(room.roomCode, 'CLUE', clueDuration, room.clueOrder);
    } catch (err) {
      console.error('Failed to advance phase to CLUE:', err);
      // Reset ref and state so retry is possible
      advanceTriggeredRef.current = false;
      setIsProceeding(false);
    }
  };

  const confirmedPlayersCount = players.filter((p) => p.hasSeenCard).length;
  const allConfirmed = confirmedPlayersCount === players.length && players.length > 0;

  // 1. Countdown timer for the 45s phase duration: HOST ONLY advances on timeout
  useEffect(() => {
    if (!room.phaseEndsAt || room.currentPhase !== 'ROLE_REVEAL') return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Auto-advance if time runs out: Strictly Host client triggers to avoid clock-drift phase skipping
      if (remaining === 0 && !advanceTriggeredRef.current && room.currentPhase === 'ROLE_REVEAL') {
        if (currentPlayer.isHost) {
          advanceTriggeredRef.current = true;
          clearInterval(interval);
          proceedToClues();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, room.currentPhase, currentPlayer.isHost]);

  // 2. Requirement 3 & 4: Automatically advance to Clue stage when all players confirm their card!
  useEffect(() => {
    if (allConfirmed && room.currentPhase === 'ROLE_REVEAL') {
      // Primary: Host client initiates advance quickly (1s).
      // Fallback: If host tab is asleep or slow, other clients will advance after 3s.
      const delay = currentPlayer.isHost ? 1000 : 3000;
      const timer = setTimeout(() => {
        if (!advanceTriggeredRef.current && room.currentPhase === 'ROLE_REVEAL') {
          advanceTriggeredRef.current = true;
          proceedToClues();
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [allConfirmed, room.currentPhase, currentPlayer.isHost]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <span>{categoryInfo?.icon || '📦'}</span>
            <span>
              {isEn
                ? `Category: ${categoryInfo?.nameEn || 'General'}`
                : `ক্যাটাগরি: ${categoryInfo?.nameBn || 'সাধারণ'}`}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isEn
            ? `Round ${room.currentRound} of ${room.totalRounds}`
            : `${room.currentRound}ম রাউন্ড (মোট ${room.totalRounds})`}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn
            ? 'Tap the card below to reveal your secret identity. Keep your screen private!'
            : 'আপনার গোপন পরিচয় দেখতে কার্ডে ট্যাপ করুন। স্ক্রিন অন্যের কাছ থেকে আড়ালে রাখুন!'}
        </p>
      </div>

      {/* Secret Identity Flashcard - Enhanced Visuals & Contrast */}
      <div className="my-auto py-3">
        <div
          onClick={handleFlip}
          className="relative w-full max-w-sm mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-3xl cursor-pointer select-none transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl"
        >
          {/* Card Body */}
          <div
            className={`w-full h-full rounded-3xl p-6 sm:p-7 border-2 transition-all duration-500 flex flex-col justify-between items-center text-center relative overflow-hidden backdrop-blur-md ${
              !isRevealed
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-amber-500/50 text-white shadow-amber-500/20'
                : isImposter
                ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 border-rose-500 text-white shadow-rose-500/30'
                : 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-emerald-500/80 text-white shadow-emerald-500/25'
            }`}
          >
            {/* Top Bar of Flashcard */}
            <div className="w-full flex items-center justify-between text-xs font-bold tracking-wider uppercase opacity-90">
              <span className="flex items-center gap-1.5 text-amber-400 font-black">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ধাপ্পাবাজ</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                  !isRevealed
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : isImposter
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 animate-pulse'
                    : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50'
                }`}
              >
                {!isRevealed ? '🔒 গোপন কার্ড' : isImposter ? '🕵️ IMPOSTER' : '🛡️ CITIZEN'}
              </span>
            </div>

            {/* Center Area */}
            {!isRevealed ? (
              <div className="space-y-4 my-auto">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-4xl shadow-inner shadow-amber-500/20">
                  <Lock className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    {isEn ? 'Tap to Reveal Secret' : 'গোপন তথ্য দেখতে ট্যাপ করুন'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-[220px] mx-auto font-medium">
                    {isEn
                      ? 'Ensure nobody is looking at your device screen'
                      : 'অন্যরা যেন আপনার স্ক্রিনের দিকে না তাকায় খেয়াল রাখুন'}
                  </p>
                </div>
              </div>
            ) : isImposter ? (
              /* Imposter Revealed Flashcard */
              <div className="space-y-4 my-auto w-full animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 text-4xl shadow-lg shadow-rose-500/30">
                  <UserX className="w-10 h-10 text-rose-500" />
                </div>

                <div className="space-y-1.5">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg tracking-wide">
                    {isEn ? 'YOU ARE THE IMPOSTER!' : 'আপনি ধাপ্পাবাজ!'}
                  </span>
                  <p className="text-xs text-rose-200 font-medium pt-1 max-w-xs mx-auto">
                    {isEn
                      ? 'You do NOT know the secret word. Blend in and fool everyone!'
                      : 'আসল শব্দটি আপনার অজানা। সবার সাথে মিশে যান এবং ধোঁকা দিন!'}
                  </p>
                </div>

                {/* Secret Imposter Clue/Hint */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-rose-500/50 text-left space-y-1">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡</span>
                    <span>{isEn ? 'Your Secret Hint / Clue:' : 'আপনার গোপন ইঙ্গিত:'}</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-rose-100">
                    {isEn
                      ? privateRole?.shortHintEn || privateRole?.hintEn || 'Related to this category'
                      : privateRole?.shortHintBn || privateRole?.hintBn || 'ক্যাটাগরি সম্পর্কিত বিষয়'}
                  </div>
                </div>
              </div>
            ) : (
              /* Innocent Citizen Revealed Flashcard */
              <div className="space-y-4 my-auto w-full animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 text-4xl shadow-lg shadow-emerald-500/30">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                    {isEn ? 'YOUR SECRET WORD' : 'আপনার আসল গোপন শব্দ'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wide pt-1 drop-shadow-md">
                    {privateRole?.wordBn}
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    {privateRole?.wordEn}
                  </div>
                </div>

                {/* AI-Driven Word Insight for Innocent Players */}
                {aiDesc && (
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'AI Word Insight (Citizens Only):' : 'এআই শব্দ পরিচিতি (শুধুমাত্র নির্দোষদের জন্য):'}</span>
                    </div>
                    <p className="text-xs text-amber-100 font-medium leading-relaxed">
                      {isEn ? aiDesc.en : aiDesc.bn}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/40 text-emerald-200 text-xs font-medium">
                  {isEn
                    ? 'Give clever clues without revealing the word directly to the imposter!'
                    : 'চালাক ক্লু দিন যাতে নাগরিকরা বোঝে কিন্তু ধাপ্পাবাজ ধরতে না পারে!'}
                </div>
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400">
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {isRevealed
                  ? isEn
                    ? 'Tap to hide card'
                    : 'লুকিয়ে ফেলতে ট্যাপ করুন'
                  : isEn
                  ? 'Tap to view card'
                  : 'দেখতে ট্যাপ করুন'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Tracker: Live view of who confirmed they saw their word */}
      <div className="my-2.5 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Word Confirmation Tracker' : 'শব্দ নিশ্চিতকরণ ট্র্যাকার'}
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {confirmedPlayersCount} / {players.length} {isEn ? 'Confirmed' : 'দেখেছেন'}
          </span>
        </div>

        {/* Players status pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players.map((p) => {
            const isMe = p.id === currentPlayer.id;
            const seen = p.hasSeenCard;
            return (
              <div
                key={p.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-1.5 transition-all text-xs ${
                  seen
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
                <div className="shrink-0">
                  {seen ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Seen' : 'দেখেছেন'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium text-[10px]">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>{isEn ? 'Viewing...' : 'দেখছেন...'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!hasAcknowledged && (
          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isEn ? 'I have seen my word & role' : 'আমি আমার তথ্য দেখে নিয়েছি'}</span>
          </button>
        )}

        {/* When everyone has confirmed: Show active transition button & status */}
        {allConfirmed ? (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center text-xs font-black flex items-center justify-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>
                {isEn
                  ? 'All players confirmed! Advancing to Clue Stage...'
                  : 'সবাই নিশ্চিত করেছেন! ক্লু পর্ব শুরু হচ্ছে...'}
              </span>
            </div>

            <button
              type="button"
              disabled={isProceeding}
              onClick={proceedToClues}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {isProceeding ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>{isEn ? 'Transitioning to Clues...' : 'ক্লু পর্বে প্রবেশ করা হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Proceed to Clues Now' : 'পরবর্তী ক্লু পর্বে চলুন'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : hasAcknowledged ? (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-center text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                {isEn
                  ? `You are confirmed! Waiting for others (${confirmedPlayersCount}/${players.length})...`
                  : `আপনার দেখা সম্পন্ন হয়েছে! বাকিদের জন্য অপেক্ষা করুন (${confirmedPlayersCount}/${players.length})...`}
              </span>
            </div>

            {/* Host override button if someone's device is unresponsive */}
            {currentPlayer.isHost && (
              <button
                type="button"
                disabled={isProceeding}
                onClick={proceedToClues}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {isEn
                    ? 'Start Clue Stage Now (Host Action)'
                    : 'হোস্ট হিসেবে এখনই ক্লু পর্ব শুরু করুন'}
                </span>
              </button>
            )}
          </div>
        ) : null}

        {/* Informational banner about automatic progression */}
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>
            {isEn
              ? 'Stage advances automatically when everyone confirms or timer ends'
              : 'সবাই নিশ্চিত করলে অথবা সময় শেষ হলে স্বয়ংক্রিয়ভাবে পরের ধাপে যাবে'}
          </span>
        </div>
      </div>
    </div>
  );
};
