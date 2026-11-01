import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  ArrowRight,
  UserX,
  CheckCircle,
  HelpCircle,
  Vote,
  Sparkles,
} from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-3xl mx-auto transition-colors duration-200">
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

      {/* Main Results Container */}
      <div className="my-4 space-y-4">
        {/* Eliminated Player & Secret Word Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-3">
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
            <div className="py-2 text-sm font-bold text-slate-500">
              {isEn ? 'Vote was tied! Nobody was eliminated.' : 'ভোট সমান হওয়ায় কাউকে বহিষ্কার করা হয়নি।'}
            </div>
          )}

          {/* Secret Word Revealed */}
          {room.revealedWord && (
            <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {isEn ? 'Secret Word' : 'আসল গোপন শব্দ'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {room.revealedWord.wordBn}
              </div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {room.revealedWord.wordEn}
              </div>
            </div>
          )}

          {/* Imposter guess result if applicable */}
          {room.imposterGuessedWord !== undefined && room.imposterGuessAnswer && (
            <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold">
                {isEn ? 'Imposter Guess: ' : 'ধাপ্পাবাজের অনুমান: '}
              </span>
              <span className="font-bold text-amber-500">"{room.imposterGuessAnswer}"</span>
              <span className="ml-2 font-bold">
                {room.imposterGuessedWord
                  ? isEn ? '✓ Correct! Stole the win!' : '✓ সঠিক! জয় ছিনিয়ে নিল!'
                  : isEn ? '✗ Wrong guess!' : '✗ ভুল অনুমান!'}
              </span>
            </div>
          )}
        </div>

        {/* Detailed Points Breakdown Section */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isEn ? 'Round Points Breakdown & Reasons' : 'এই রাউন্ডের পয়েন্ট হিসাব ও কারণ'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {isEn ? 'All Players' : 'সকল খেলোয়াড়'}
            </span>
          </div>

          {room.scoreDetails && room.scoreDetails.length > 0 ? (
            <div className="space-y-2.5 max-h-[36vh] overflow-y-auto p-1">
              {room.scoreDetails.map((detail) => {
                const isMe = detail.playerId === currentPlayer.id;
                const isImposterRole = imposterIds.includes(detail.playerId);
                const votedSuspect = players.find((p) => p.id === detail.votedForId);

                return (
                  <div
                    key={detail.playerId}
                    className={`p-3 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{detail.playerAvatar || '🕵️'}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {detail.playerName} {isMe && (isEn ? '(You)' : '(আপনি)')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isImposterRole
                              ? isEn ? '🕵️ Imposter' : '🕵️ ধাপ্পাবাজ'
                              : isEn ? '🛡️ Citizen' : '🛡️ নাগরিক'}
                          </span>
                        </div>
                      </div>

                      {/* Points Delta Badge */}
                      <div
                        className={`px-3 py-1 rounded-xl font-mono text-sm font-black ${
                          detail.pointsDelta > 0
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : detail.pointsDelta < 0
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {detail.pointsDelta > 0 ? `+${detail.pointsDelta}` : detail.pointsDelta} {isEn ? 'pts' : 'পয়েন্ট'}
                      </div>
                    </div>

                    {/* Breakdown Reasons list */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      {detail.reasons && detail.reasons.length > 0 ? (
                        detail.reasons.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1">
                              <span className="text-amber-500">•</span>
                              <span>{isEn ? r.en : r.bn}</span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          {isEn ? 'Standard participation' : 'অংশগ্রহণ'}
                        </div>
                      )}

                      {/* Vote details */}
                      <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-2">
                        {votedSuspect && (
                          <span>
                            {isEn ? 'Voted for: ' : 'ভোট দিয়েছেন: '}
                            <strong className="text-slate-600 dark:text-slate-300">{votedSuspect.name}</strong>
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {isEn ? 'Votes received: ' : 'ভোট পেয়েছেন: '}
                          <strong className="text-slate-600 dark:text-slate-300">{detail.votesReceived || 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              {isEn ? 'Calculating point breakdown...' : 'পয়েন্ট হিসাব করা হচ্ছে...'}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {isHost ? (
          <button
            type="button"
            onClick={handleProceedToScoreboard}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Award className="w-5 h-5" />
            <span>{isEn ? 'View Match Leaderboard' : 'ম্যাচের সামগ্রিক লিডারবোর্ড দেখুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
            {isEn ? 'Waiting for host to proceed to leaderboard...' : 'হোস্ট লিডারবোর্ডে যাওয়ার জন্য অপেক্ষা করুন...'}
          </div>
        )}
      </div>
    </div>
  );
};
