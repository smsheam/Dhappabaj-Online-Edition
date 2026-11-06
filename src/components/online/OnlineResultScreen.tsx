import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  ArrowRight,
  Vote,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
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

  const eliminatedPlayer = players.find((p) => p.id === room.eliminatedPlayerId);
  const imposterIds = room.revealedImposterIds || [];
  const imposters = players.filter((p) => imposterIds.includes(p.id));
  const isEliminatedImposter = eliminatedPlayer ? imposterIds.includes(eliminatedPlayer.id) : false;
  const isImposterWin = room.winner === 'imposter';

  // Auto progression countdown to scoreboard (20 seconds)
  const [autoTimer, setAutoTimer] = useState<number>(() => {
    if (room.phaseEndsAt) {
      const remaining = Math.ceil((room.phaseEndsAt - Date.now()) / 1000);
      return Math.max(1, Math.min(20, remaining));
    }
    return 20;
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

  // Vote map: voterId -> suspectId or suspectIds
  const revealedVotes = room.revealedVotes || {};

  // Count votes received per player
  const voteCountMap: Record<string, number> = {};
  players.forEach((p) => {
    voteCountMap[p.id] = 0;
  });
  Object.values(revealedVotes).forEach((suspectVal) => {
    const list = Array.isArray(suspectVal) ? suspectVal : suspectVal ? [suspectVal] : [];
    list.forEach((sId) => {
      if (voteCountMap[sId] !== undefined) {
        voteCountMap[sId]++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 max-w-3xl mx-auto transition-colors duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{isEn ? `Round ${room.currentRound} Reveal` : `${room.currentRound}ম রাউন্ডের পরিচয় উন্মোচন`}</span>
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
        {/* 1. Who is Imposter, his secret hint & his provided clue */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-rose-950/30 border-2 border-rose-500/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">
                {isEn ? 'The Real Dhappabaj (Imposter)' : 'আসল ধাপ্পাবাজ পরিচয় ও ইঙ্গিত'}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
              {imposters.length} {isEn ? 'Imposter' : 'ধাপ্পাবাজ'}
            </span>
          </div>

          <div className="space-y-3">
            {imposters.map((imp) => {
              const clueHeGotBn =
                room.revealedWord?.shortHintBn || room.revealedWord?.hintBn || 'ক্যাটাগরি সম্পর্কিত ইঙ্গিত';
              const clueHeGotEn =
                room.revealedWord?.shortHintEn || room.revealedWord?.hintEn || 'Category hint';
              const clueHeGot = isEn ? clueHeGotEn : clueHeGotBn;
              const clueHeProvided = imp.clue || (isEn ? 'No clue given' : 'কোনো ক্লু দেননি');

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

                  {/* Dual Clues: Clue Imposter Got + Clue Imposter Provided */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Clue / Secret Hint Dhappabaj Got */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isEn ? 'Secret Hint Imposter Received:' : 'ধাপ্পাবাজ যে গোপন ইঙ্গিতটি পেয়েছিল:'}</span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-amber-200">
                        "{clueHeGot}"
                      </div>
                    </div>

                    {/* Clue Dhappabaj Provided in Game */}
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isEn ? 'Clue Imposter Provided in Game:' : 'ধাপ্পাবাজ খেলায় যে ক্লু দিয়েছিল:'}</span>
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

        {/* 2. Actual Secret Word & Actual Hints */}
        {room.revealedWord && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2 text-center">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {isEn ? 'Actual Secret Word & Hints' : 'এই রাউন্ডের আসল গোপন শব্দ ও ইঙ্গিত'}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {room.revealedWord.wordBn}
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {room.revealedWord.wordEn}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                {isEn ? 'Category: ' : 'ক্যাটাগরি: '}{room.revealedWord.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
                {isEn ? 'Hint: ' : 'আসল ইঙ্গিত: '}{isEn ? (room.revealedWord.hintEn || room.revealedWord.shortHintEn) : (room.revealedWord.hintBn || room.revealedWord.shortHintBn)}
              </span>
            </div>

            {/* Imposter guess result if applicable */}
            {room.imposterGuessedWord !== undefined && room.imposterGuessAnswer && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {isEn ? 'Imposter Word Guess: ' : 'ধাপ্পাবাজের শব্দ অনুমান: '}
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
        )}

        {/* 3. Elimination Status: If innocent eliminated, show clearly! */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                {isEn ? 'Majority Vote Accusation & Elimination' : 'ভোটের রায় ও বহিষ্কারের ফলাফল'}
              </h3>
            </div>
          </div>

          {eliminatedPlayer ? (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                isEliminatedImposter
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl shrink-0">{eliminatedPlayer.avatar || '🕵️'}</span>
                <div>
                  <div className="text-base font-black">
                    {eliminatedPlayer.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {isEn ? eliminatedPlayer.titleEn : eliminatedPlayer.titleBn}
                  </div>
                </div>
              </div>

              <div>
                {isEliminatedImposter ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>{isEn ? '✓ Dhappabaj Caught & Eliminated!' : '✓ সঠিক শনাক্তকরণ! ধাপ্পাবাজ বহিষ্কৃত'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-rose-500 text-white shadow-md animate-pulse">
                    <XCircle className="w-4 h-4" />
                    <span>{isEn ? '❌ Innocent Citizen Wrongly Eliminated!' : '❌ ভুল বিচার! নির্দোষ নাগরিককে ফাঁসিয়ে বহিষ্কার করা হয়েছে'}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {isEn
                ? '⚖️ Tie Vote! Nobody received a clear majority to be eliminated.'
                : '⚖️ ভোটে টাই হয়েছে! কোনো একক খেলোয়াড় সংখ্যাগরিষ্ঠ ভোট না পাওয়ায় কেউ বহিষ্কৃত হননি।'}
            </div>
          )}
        </div>

        {/* 4. Who Voted to Who (Detailed Voting Matrix - Without Scores!) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isEn ? 'Voting Breakdown: Who Voted for Whom' : 'কার ভোট কার প্রতি ছিল (সম্পূর্ণ ভোটের তালিকা)'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {players.length} {isEn ? 'Players' : 'জন খেলোয়াড়'}
            </span>
          </div>

          <div className="space-y-2 max-h-[38vh] overflow-y-auto p-1">
            {players.map((voter) => {
              const isVoterImposter = imposterIds.includes(voter.id);
              const rawVote = revealedVotes[voter.id];
              const votedIds = Array.isArray(rawVote) ? rawVote : rawVote ? [rawVote] : [];
              const votedPlayers = votedIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as OnlinePlayer[];
              const isMe = voter.id === currentPlayer.id;

              return (
                <div
                  key={voter.id}
                  className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-all ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Voter Info */}
                  <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                    <span className="text-xl shrink-0">{voter.avatar || '🕵️'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{voter.name} {isMe && (isEn ? '(You)' : '(আপনি)')}</span>
                        {isVoterImposter ? (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/15 px-1.5 py-0.5 rounded-full">
                            🕵️ {isEn ? 'Imposter' : 'ধাপ্পাবাজ'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                            🛡️ {isEn ? 'Citizen' : 'নাগরিক'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isEn ? 'Received: ' : 'ভোট পেয়েছেন: '}
                        <strong className="text-slate-600 dark:text-slate-300 font-mono">
                          {voteCountMap[voter.id] || 0}
                        </strong> {isEn ? 'votes' : 'ভোট'}
                      </div>
                    </div>
                  </div>

                  {/* Arrow & Target */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap justify-end">
                    <span className="text-xs text-slate-400 font-bold">➔</span>
                    {votedPlayers.length > 0 ? (
                      votedPlayers.map((target) => {
                        const targetIsImposter = imposterIds.includes(target.id);
                        return (
                          <span
                            key={target.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                              targetIsImposter
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{target.avatar || '🕵️'}</span>
                            <span className="max-w-[100px] truncate">{target.name}</span>
                            <span className="text-[10px]">
                              {targetIsImposter ? '🎯' : '⚪'}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {isEn ? '(No vote cast)' : '(ভোট দেননি)'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer: Proceed to Scoreboard (Scores are displayed in Scoreboard section) */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleProceedToScoreboard}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Award className="w-5 h-5" />
          <span>
            {isEn
              ? `Proceed to Scoreboard (${autoTimer}s)`
              : `পয়েন্ট ও স্কোরবোর্ড পেজে যান (${autoTimer}s)`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {isEn
              ? `Score breakdown & leaderboard will show on next page (${autoTimer}s)`
              : `পয়েন্ট হিসাব ও লিডারবোর্ড পরবর্তী পেজে প্রদর্শিত হবে (${autoTimer}s)`}
          </span>
        </div>
      </div>
    </div>
  );
};
