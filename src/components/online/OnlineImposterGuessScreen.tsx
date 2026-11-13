import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Sparkles, Check, Send, AlertTriangle } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, PrivatePlayerRole } from '../../types/multiplayer';
import { submitOnlineImposterGuess, generateGuessChoices } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineImposterGuessScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  privateRole: PrivatePlayerRole | null;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineImposterGuessScreen: React.FC<OnlineImposterGuessScreenProps> = ({
  room,
  currentPlayer,
  privateRole,
  lang,
}) => {
  const isEn = lang === 'en';
  const isImposter = privateRole?.role === 'imposter';
  const eliminatedPlayerId = room.eliminatedPlayerId;
  const isCaughtImposter = isImposter && currentPlayer.id === eliminatedPlayerId;

  const [customGuess, setCustomGuess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  // Generate 4 multiple choice cards for quick tap
  const [choices] = useState(() => {
    if (room.revealedWord && room.currentWordCategory) {
      return generateGuessChoices(room.revealedWord, room.currentWordCategory);
    }
    return [];
  });

  const handleSelectChoice = async (wordText: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    sound.playClick();
    try {
      await submitOnlineImposterGuess(room.roomCode, wordText);
    } catch (err) {
      console.error(err);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGuess.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    sound.playClick();
    try {
      await submitOnlineImposterGuess(room.roomCode, customGuess.trim());
    } catch (err) {
      console.error(err);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return 30;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const updateTick = () => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    updateTick();
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      const remaining = updateTick();

      if (remaining === 0 && !submittingRef.current) {
        clearInterval(interval);
        if (isCaughtImposter) {
          submittingRef.current = true;
          setIsSubmitting(true);
          submitOnlineImposterGuess(room.roomCode, '(সময় শেষ)');
        } else if (currentPlayer.isHost) {
          fallbackTimer = setTimeout(() => {
            if (!submittingRef.current) {
              submittingRef.current = true;
              setIsSubmitting(true);
              submitOnlineImposterGuess(room.roomCode, '(সময় শেষ)');
            }
          }, 1500);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [room.phaseEndsAt, room.roomCode, isCaughtImposter, currentPlayer.isHost]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isEn ? 'Imposter Caught! Final Guess' : 'ধাপ্পাবাজ শনাক্ত! শেষ সুযোগ'}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-rose-500">
            <span>{timeLeft}s</span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Guess the Secret Word' : 'আসল শব্দ অনুমান করুন'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isCaughtImposter
            ? isEn
              ? 'You have one chance to guess the secret word and steal victory!'
              : 'সঠিক শব্দটি বলতে পারলে আপনি জয় ছিনিয়ে নিতে পারবেন!'
            : isEn
            ? 'The caught imposter is attempting their final guess...'
            : 'শনাক্ত ধাপ্পাবাজ শব্দটি অনুমানের চেষ্টা করছে...'}
        </p>
      </div>

      {/* Main Content */}
      <div className="my-auto py-6 space-y-6">
        {isCaughtImposter ? (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            {/* Multiple choice options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center">
                {isEn ? 'Pick the Secret Word' : 'সঠিক শব্দটি নির্বাচন করুন'}
              </label>

              <div className="grid grid-cols-2 gap-3">
                {choices.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    disabled={isSubmitting}
                    onClick={() => handleSelectChoice(c.wordBn)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 text-center space-y-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {c.wordBn}
                    </div>
                    <div className="text-xs font-bold text-slate-500">{c.wordEn}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Or Type In Custom */}
            <div className="pt-2">
              <div className="text-center text-xs font-bold text-slate-400 mb-2">
                {isEn ? '— OR TYPE YOUR GUESS —' : '— অথবা টাইপ করুন —'}
              </div>
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customGuess}
                  onChange={(e) => setCustomGuess(e.target.value)}
                  placeholder={isEn ? 'Type the secret word...' : 'আসল শব্দটি লিখুন...'}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customGuess.trim() || isSubmitting}
                  className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Guess' : 'জমা দিন'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Waiting Screen for Citizens */
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center text-4xl animate-bounce">
              ⏳
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Hold your breath!' : 'দম বন্ধ করা মুহূর্ত!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {isEn
                  ? 'If the imposter guesses the secret word correctly, they will steal the win!'
                  : 'ধাপ্পাবাজ সঠিক শব্দ অনুমান করতে পারলে জয় ছিনিয়ে নেবে! ফলাফল শীঘ্রই প্রকাশিত হচ্ছে...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        {isEn ? 'ধাপ্পাবাজ • Final Guess Challenge' : 'ধাপ্পাবাজ • চূড়ান্ত অনুমান চ্যালেঞ্জ'}
      </div>
    </div>
  );
};
