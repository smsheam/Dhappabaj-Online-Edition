import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserX, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { CATEGORIES } from '../../data/categories';
import { sound } from '../../utils/audio';
import { setOnlineRoomPhase } from '../../services/multiplayerService';

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
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false);

  const isImposter = privateRole?.role === 'imposter';
  const categoryInfo = privateRole ? CATEGORIES[privateRole.category] : null;

  const handleFlip = () => {
    sound.playCardFlip();
    setIsRevealed(!isRevealed);
  };

  const handleAcknowledge = () => {
    sound.playClick();
    setHasAcknowledged(true);
  };

  const handleProceedToClues = async () => {
    sound.playClick();
    await setOnlineRoomPhase(room.roomCode, 'CLUE');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <span>{categoryInfo?.icon || '📦'}</span>
          <span>
            {isEn
              ? `Category: ${categoryInfo?.nameEn || 'General'}`
              : `ক্যাটাগরি: ${categoryInfo?.nameBn || 'সাধারণ'}`}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? `Round ${room.currentRound} of ${room.totalRounds}` : `${room.currentRound}ম রাউন্ড (মোট ${room.totalRounds})`}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn
            ? 'Tap the secret card to reveal your secret identity'
            : 'আপনার গোপন পরিচয় দেখতে কার্ডটিতে ট্যাপ করুন'}
        </p>
      </div>

      {/* Secret Identity Card */}
      <div className="my-auto py-6">
        <div
          onClick={handleFlip}
          className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-3xl cursor-pointer perspective-1000 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Card Wrapper */}
          <div
            className={`w-full h-full rounded-3xl p-6 shadow-2xl border transition-all duration-500 flex flex-col justify-between items-center text-center ${
              !isRevealed
                ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-amber-500/40 text-white'
                : isImposter
                ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 border-rose-500/60 text-white'
                : 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-amber-500/60 text-slate-900 dark:text-white'
            }`}
          >
            {/* Top of Card */}
            <div className="w-full flex items-center justify-between text-xs font-bold opacity-75">
              <span>ধাপ্পাবাজ • Dhappabaj</span>
              <span>{isRevealed ? (isImposter ? '🕵️ IMPOSTER' : '🛡️ CITIZEN') : '🔒 SECRET'}</span>
            </div>

            {/* Center Content */}
            {!isRevealed ? (
              <div className="space-y-4 my-auto">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
                  🔒
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400">
                    {isEn ? 'Tap to Reveal Secret' : 'গোপন তথ্য দেখতে ট্যাপ করুন'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isEn ? 'Keep your screen hidden from others!' : 'স্ক্রিন অন্যের কাছ থেকে আড়ালে রাখুন!'}
                  </p>
                </div>
              </div>
            ) : isImposter ? (
              /* Imposter Reveal */
              <div className="space-y-4 my-auto animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 text-4xl shadow-lg">
                  🕵️
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white">
                    {isEn ? 'YOU ARE THE IMPOSTER!' : 'আপনি ধাপ্পাবাজ!'}
                  </span>
                  <p className="text-xs text-rose-300 font-medium pt-2">
                    {isEn
                      ? 'You do NOT know the secret word. Blend in and fool the citizens!'
                      : 'আসল শব্দটি আপনার অজানা। এমন ক্লু দিন যেন কেউ আপনাকে না চেনে!'}
                  </p>
                </div>

                {/* Subtle Imposter Hint */}
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-left space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    {isEn ? 'Your Secret Hint' : 'আপনার গোপন ক্লু / ইঙ্গিত'}
                  </div>
                  <div className="text-sm font-bold">
                    {isEn
                      ? privateRole?.shortHintEn || privateRole?.hintEn || 'Related to category'
                      : privateRole?.shortHintBn || privateRole?.hintBn || 'ক্যাটাগরি সম্পর্কিত'}
                  </div>
                </div>
              </div>
            ) : (
              /* Innocent Citizen Reveal */
              <div className="space-y-4 my-auto animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center text-amber-500 text-4xl shadow-lg">
                  🛡️
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                    {isEn ? 'SECRET WORD' : 'গোপন আসল শব্দ'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-wide pt-1">
                    {privateRole?.wordBn}
                  </div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {privateRole?.wordEn}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium">
                  {isEn
                    ? 'Give clever clues related to this word without making it obvious to the imposter!'
                    : 'এমন চালাক ক্লু দিন যাতে নাগরিকরা বোঝে কিন্তু ধাপ্পাবাজ ধরতে না পারে!'}
                </div>
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400">
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isRevealed ? (isEn ? 'Tap again to hide' : 'লুকিয়ে ফেলতে ট্যাপ করুন') : (isEn ? 'Tap to view' : 'দেখতে ট্যাপ করুন')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {!hasAcknowledged ? (
          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isEn ? 'I have memorized my role' : 'আমি আমার তথ্য দেখে নিয়েছি'}</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{isEn ? 'Ready for Clue Stage' : 'ক্লু দেওয়ার জন্য প্রস্তুত'}</span>
          </div>
        )}

        {isHost && (
          <button
            type="button"
            onClick={handleProceedToClues}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-base shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isEn ? 'Start Clue Stage (All Players)' : 'সবাইকে ক্লু ধাপে নিয়ে চলুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
