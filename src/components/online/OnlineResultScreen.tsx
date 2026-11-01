import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldAlert, Award, ArrowRight, UserX, CheckCircle, XCircle } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineResultScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineResultScreen: React.FC<OnlineResultScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const eliminatedPlayer = players.find((p) => p.id === room.eliminatedPlayerId);
  const imposterIds = room.revealedImposterIds || [];
  const isEliminatedImposter = eliminatedPlayer ? imposterIds.includes(eliminatedPlayer.id) : false;
  const isImposterWin = room.winner === 'imposter';

  useEffect(() => {
    sound.playTada();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas not ready
    }
  }, []);

  const handleProceedToScoreboard = async () => {
    sound.playClick();
    await setOnlineRoomPhase(room.roomCode, 'ROUND_SUMMARY');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{isEn ? `Round ${room.currentRound} Results` : `${room.currentRound}ম রাউন্ডের ফলাফল`}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {isImposterWin
            ? isEn
              ? '🕵️ Imposter Wins the Round!'
              : '🕵️ ধাপ্পাবাজ জয়ী হয়েছে!'
            : isEn
            ? '🛡️ Innocent Citizens Win!'
            : '🛡️ নির্দোষ নাগরিক দল জয়ী!'}
        </h2>
      </div>

      {/* Main Results Card */}
      <div className="my-auto py-6 space-y-5 animate-in zoom-in-95 duration-300">
        {/* Eliminated Player Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isEn ? 'Eliminated by Majority Vote' : 'সর্বোচ্চ ভোটে বহিষ্কৃত খেলোয়াড়'}
          </div>

          {eliminatedPlayer ? (
            <div className="space-y-2">
              <div className="text-5xl">{eliminatedPlayer.avatar || '🕵️'}</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {eliminatedPlayer.name}
              </div>
              <div className="text-xs text-slate-500">
                {isEn ? eliminatedPlayer.titleEn : eliminatedPlayer.titleBn}
              </div>

              <div className="pt-2">
                {isEliminatedImposter ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black bg-rose-500 text-white shadow-md">
                    <UserX className="w-4 h-4" />
                    <span>{isEn ? 'WAS THE IMPOSTER!' : 'ধাপ্পাবাজ প্রমাণিত!'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black bg-amber-500 text-slate-950 shadow-md">
                    <CheckCircle className="w-4 h-4" />
                    <span>{isEn ? 'WAS AN INNOCENT CITIZEN!' : 'একজন নির্দোষ নাগরিক ছিলেন!'}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm font-bold text-slate-500">
              {isEn ? 'Vote was tied! Nobody was eliminated.' : 'ভোট সমান হওয়ায় কাউকে বহিষ্কার করা হয়নি।'}
            </div>
          )}

          {/* Imposter guess result if applicable */}
          {room.imposterGuessedWord !== undefined && room.imposterGuessAnswer && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold">
                {isEn ? 'Imposter Guess: ' : 'ধাপ্পাবাজের অনুমান: '}
              </span>
              <span className="font-bold text-amber-500">"{room.imposterGuessAnswer}"</span>
              <span className="ml-2 font-bold">
                {room.imposterGuessedWord
                  ? isEn
                    ? '✓ Correct! Stole the win!'
                    : '✓ সঠিক! জয় ছিনিয়ে নিল!'
                  : isEn
                  ? '✗ Wrong guess!'
                  : '✗ ভুল অনুমান!'}
              </span>
            </div>
          )}
        </div>

        {/* Secret Word Revealed */}
        {room.revealedWord && (
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              {isEn ? 'Secret Word Revealed' : 'আসল গোপন শব্দ'}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {room.revealedWord.wordBn}
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {room.revealedWord.wordEn}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost ? (
          <button
            type="button"
            onClick={handleProceedToScoreboard}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>{isEn ? 'View Round Scores & Leaderboard' : 'রাউন্ডের স্কোর ও পয়েন্ট তালিকা'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
            {isEn ? 'Waiting for host to proceed to scoreboard...' : 'হোস্ট স্কোরবোর্ডে যাওয়ার জন্য অপেক্ষা করুন...'}
          </div>
        )}
      </div>
    </div>
  );
};
