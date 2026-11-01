import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserX,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Users,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { CATEGORIES } from '../../data/categories';
import { sound } from '../../utils/audio';
import { setOnlineRoomPhase, confirmOnlineCardSeen } from '../../services/multiplayerService';

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
  const isHost = currentPlayer.isHost;
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(currentPlayer.hasSeenCard || false);

  const isImposter = privateRole?.role === 'imposter';
  const categoryInfo = privateRole ? CATEGORIES[privateRole.category] : null;

  const handleFlip = () => {
    sound.playCardFlip();
    setIsRevealed(!isRevealed);
  };

  const handleAcknowledge = async () => {
    sound.playClick();
    setHasAcknowledged(true);
    await confirmOnlineCardSeen(room.roomCode);
  };

  const handleProceedToClues = async () => {
    sound.playClick();
    const clueDuration = room.settings.clueTimer || 30;
    await setOnlineRoomPhase(room.roomCode, 'CLUE', clueDuration);
  };

  const confirmedPlayersCount = players.filter((p) => p.hasSeenCard).length;
  const allConfirmed = confirmedPlayersCount === players.length && players.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <span>{categoryInfo?.icon || '📦'}</span>
          <span>
            {isEn
              ? `Category: ${categoryInfo?.nameEn || 'General'}`
              : `ক্যাটাগরি: ${categoryInfo?.nameBn || 'সাধারণ'}`}
          </span>
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

      {/* Secret Identity Flashcard */}
      <div className="my-auto py-4">
        <div
          onClick={handleFlip}
          className="relative w-full max-w-sm mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-3xl cursor-pointer select-none transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl"
        >
          {/* Card Body */}
          <div
            className={`w-full h-full rounded-3xl p-6 sm:p-7 border-2 transition-all duration-500 flex flex-col justify-between items-center text-center relative overflow-hidden ${
              !isRevealed
                ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-amber-500/40 text-white shadow-amber-500/10'
                : isImposter
                ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 border-rose-500/80 text-white shadow-rose-500/20'
                : 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/80 text-white shadow-amber-500/20'
            }`}
          >
            {/* Top Bar of Flashcard */}
            <div className="w-full flex items-center justify-between text-xs font-bold tracking-wider uppercase opacity-80">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ধাপ্পাবাজ</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  !isRevealed
                    ? 'bg-slate-800 text-slate-300'
                    : isImposter
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {!isRevealed ? '🔒 SECRET' : isImposter ? '🕵️ IMPOSTER' : '🛡️ CITIZEN'}
              </span>
            </div>

            {/* Center Area */}
            {!isRevealed ? (
              <div className="space-y-4 my-auto">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-4xl shadow-inner">
                  <Lock className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    {isEn ? 'Tap to Reveal Secret' : 'গোপন তথ্য দেখতে ট্যাপ করুন'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                    {isEn
                      ? 'Ensure nobody is looking at your device screen'
                      : 'অন্যরা যেন আপনার স্ক্রিনের দিকে না তাকায় খেয়াল রাখুন'}
                  </p>
                </div>
              </div>
            ) : isImposter ? (
              /* Imposter Revealed Flashcard */
              <div className="space-y-4 my-auto w-full animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 text-4xl shadow-lg shadow-rose-500/20">
                  <UserX className="w-10 h-10 text-rose-500" />
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                    {isEn ? 'YOU ARE THE IMPOSTER!' : 'আপনি ধাপ্পাবাজ!'}
                  </span>
                  <p className="text-xs text-rose-300 font-medium pt-1">
                    {isEn
                      ? 'You do NOT know the secret word. Blend in and fool everyone!'
                      : 'আসল শব্দটি আপনার অজানা। সবাইকে ধোঁকা দিন!'}
                  </p>
                </div>

                {/* Secret Imposter Clue/Hint */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/40 text-left space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <span>💡</span>
                    <span>{isEn ? 'Your Secret Hint / Clue' : 'আপনার গোপন ইঙ্গিত'}</span>
                  </div>
                  <div className="text-base font-black text-rose-100">
                    {isEn
                      ? privateRole?.shortHintEn || privateRole?.hintEn || 'Related to this category'
                      : privateRole?.shortHintBn || privateRole?.hintBn || 'ক্যাটাগরি সম্পর্কিত বিষয়'}
                  </div>
                </div>
              </div>
            ) : (
              /* Innocent Citizen Revealed Flashcard */
              <div className="space-y-4 my-auto w-full animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 text-4xl shadow-lg shadow-amber-500/20">
                  <ShieldCheck className="w-10 h-10 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                    {isEn ? 'YOUR SECRET WORD' : 'আপনার আসল গোপন শব্দ'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wide pt-1 drop-shadow-md">
                    {privateRole?.wordBn}
                  </div>
                  <div className="text-sm font-bold text-slate-300">
                    {privateRole?.wordEn}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/30 text-amber-200 text-xs font-medium">
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

      {/* Confirmation Tracker: Who has viewed the card */}
      <div className="my-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Players Word Confirmation' : 'খেলোয়াড়দের প্রস্তুতি অবস্থা'}
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {confirmedPlayersCount} / {players.length}
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {!hasAcknowledged ? (
          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isEn ? 'I have seen my word & role' : 'আমি আমার তথ্য দেখে নিয়েছি'}</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'You are confirmed! Ready for clues.' : 'আপনার দেখা সম্পন্ন হয়েছে! ক্লুর জন্য প্রস্তুত।'}</span>
          </div>
        )}

        {isHost && (
          <button
            type="button"
            onClick={handleProceedToClues}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              allConfirmed
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white shadow-sky-500/25'
            }`}
          >
            <span>
              {allConfirmed
                ? isEn
                  ? 'All Ready! Start Clue Stage'
                  : 'সবাই প্রস্তুত! ক্লু পর্ব শুরু করুন'
                : isEn
                ? `Proceed to Clues (${confirmedPlayersCount}/${players.length})`
                : `ক্লু ধাপে নিয়ে চলুন (${confirmedPlayersCount}/${players.length})`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
