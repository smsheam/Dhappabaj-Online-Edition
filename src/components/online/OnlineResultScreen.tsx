import React, { useEffect, useState } from 'react';
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
  AlertTriangle,
  Clock,
  ShieldCheck,
  MessageSquare,
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
  const imposters = players.filter((p) => imposterIds.includes(p.id));
  const isEliminatedImposter = eliminatedPlayer ? imposterIds.includes(eliminatedPlayer.id) : false;
  const isImposterWin = room.winner === 'imposter';

  // Auto progression countdown to scoreboard (Requirement 7: exactly 15 seconds)
  const [autoTimer, setAutoTimer] = useState<number>(() => {
    if (room.phaseEndsAt) {
      const remaining = Math.ceil((room.phaseEndsAt - Date.now()) / 1000);
      return Math.max(1, Math.min(15, remaining));
    }
    return 15;
  });

  useEffect(() => {
    sound.playSuspenseReveal();
    const confettiTimer = setTimeout(() => {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }
    }, 400);

    return () => clearTimeout(confettiTimer);
  }, []);

  const handleProceedToScoreboard = async () => {
    sound.playClick();
    await setOnlineRoomPhase(room.roomCode, 'ROUND_SUMMARY');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleProceedToScoreboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.roomCode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 max-w-3xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{isEn ? `Round ${room.currentRound} Results` : `${room.currentRound}ম রাউন্ডের চূড়ান্ত ফলাফল`}</span>
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
      <div className="my-3 space-y-3.5">
        {/* Requirement 6: Reveal Who was Dhappabaj & What was his clue */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-rose-950/30 border-2 border-rose-500/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">
                {isEn ? 'The Real Dhappabaj (Imposter)' : 'আসল ধাপ্পাবাজ পরিচয় ও ক্লু'}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
              {imposters.length} {isEn ? 'Imposter' : 'ধাপ্পাবাজ'}
            </span>
          </div>

          <div className="space-y-3">
            {imposters.map((imp) => {
              const clueHeGotBn = room.revealedWord?.shortHintBn || room.revealedWord?.hintBn || 'ক্যাটাগরি সম্পর্কিত ইঙ্গিত';
              const clueHeGotEn = room.revealedWord?.shortHintEn || room.revealedWord?.hintEn || 'Category hint';
              const clueHeGot = isEn ? clueHeGotEn : clueHeGotBn;
              const clueHeProvided = imp.clue || (isEn ? 'No clue provided' : 'কোনো ক্লু দেননি');

              return (
                <div
                  key={imp.id}
                  className="p-4 rounded-2xl bg-black/50 border border-rose-500/40 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-2xl shrink-0 shadow-md">
                      {imp.avatar || '🕵️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-black text-white truncate">
                        {imp.name}
                      </div>
                      <div className="text-xs text-rose-300">
                        {isEn ? imp.titleEn : imp.titleBn}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                      🕵️ {isEn ? 'Dhappabaj' : 'ধাপ্পাবাজ'}
                    </span>
                  </div>

                  {/* Dual Clues: The Clue Dhappabaj GOT + The Clue Dhappabaj PROVIDED */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* 1. Clue / Secret Hint Dhappabaj Got */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isEn ? 'The Clue / Hint Dhappabaj Got:' : 'ধাপ্পাবাজ যে গোপন ইঙ্গিতটি পেয়েছিল:'}</span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-amber-200">
                        "{clueHeGot}"
                      </div>
                    </div>

                    {/* 2. Clue Dhappabaj Provided in Game */}
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isEn ? 'Clue Dhappabaj Provided in Game:' : 'ধাপ্পাবাজ খেলায় যে ক্লু দিয়েছিল:'}</span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-rose-100">
                        "{clueHeProvided}"
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requirement 6: Mention Player Selected / Accused by Majority Vote */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                {isEn ? 'Player Selected by Majority Vote' : 'ভোটের মাধ্যমে অভিযুক্ত খেলোয়াড়'}
              </h3>
            </div>
          </div>

          {eliminatedPlayer ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl shrink-0">{eliminatedPlayer.avatar || '🕵️'}</span>
                <div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {eliminatedPlayer.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isEn ? eliminatedPlayer.titleEn : eliminatedPlayer.titleBn}
                  </div>
                </div>
              </div>

              <div>
                {isEliminatedImposter ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>{isEn ? '✓ Correct! Dhappabaj Caught' : '✓ সঠিক! ধাপ্পাবাজ ধরা পড়েছে'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isEn ? '✗ False Accusation! Was Innocent' : '✗ ভুল অভিযোগ! নির্দোষ নাগরিক ছিলেন'}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-xs font-bold text-slate-500">
              {isEn
                ? 'Vote was tied! Nobody received a clear majority.'
                : 'ভোট সমান হওয়ায় কোনো একক খেলোয়াড়কে নির্বাচন করা হয়নি।'}
            </div>
          )}

          {/* Secret Word Revealed */}
          {room.revealedWord && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {isEn ? 'Secret Word for the Round' : 'এই রাউন্ডের আসল গোপন শব্দ'}
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
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-center sm:text-left">
              <span className="font-bold text-slate-600 dark:text-slate-400">
                {isEn ? 'Imposter Guess: ' : 'ধাপ্পাবাজের অনুমান: '}
              </span>
              <span className="font-bold text-amber-500">"{room.imposterGuessAnswer}"</span>
              <span className="ml-2 font-bold">
                {room.imposterGuessedWord
                  ? isEn ? '✓ Correct! Stole the victory!' : '✓ সঠিক শব্দ অনুমান করে জয় ছিনিয়ে নিয়েছে!'
                  : isEn ? '✗ Wrong guess!' : '✗ ভুল অনুমান!'}
              </span>
            </div>
          )}
        </div>

        {/* Detailed Points Breakdown Section (Requirement 7) */}
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
            <div className="space-y-2.5 max-h-[34vh] overflow-y-auto p-1">
              {room.scoreDetails.map((detail) => {
                const isMe = detail.playerId === currentPlayer.id;
                const isImp = imposterIds.includes(detail.playerId);
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
                            {isImp
                              ? isEn ? '🕵️ Dhappabaj' : '🕵️ ধাপ্পাবাজ'
                              : isEn ? '🛡️ Citizen' : '🛡️ নাগরিক'}
                          </span>
                        </div>
                      </div>

                      {/* Points Delta Badge */}
                      <div
                        className={`px-3 py-1 rounded-xl font-mono text-xs sm:text-sm font-black ${
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
                      <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-2 flex-wrap">
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

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleProceedToScoreboard}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Award className="w-5 h-5" />
          <span>
            {isEn
              ? `View Match Leaderboard (${autoTimer}s)`
              : `ম্যাচের লিডারবোর্ড দেখুন (${autoTimer}s)`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {isEn
              ? `Automatically advancing to Leaderboard in ${autoTimer}s`
              : `${autoTimer} সেকেন্ড পর স্বয়ংক্রিয়ভাবে লিডারবোর্ডে নিয়ে যাওয়া হবে`}
          </span>
        </div>
      </div>
    </div>
  );
};
