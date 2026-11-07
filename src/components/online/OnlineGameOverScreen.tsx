import React, { useEffect, useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Sparkles, AlertTriangle } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { setOnlineRoomPhase } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';
import { calculateFunnyAwards, MatchContextStats } from '../../utils/funnyAwards';
import { FunnyAwardsSection } from '../FunnyAwardsSection';
import { ScoreboardShareCard } from '../scoreboard/ScoreboardShareCard';
import { saveCompletedMatch } from '../../services/matchHistoryService';
import { recordPlayerMatchStats } from '../../services/userService';

interface OnlineGameOverScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
  onExitToMenu: () => void;
}

export const OnlineGameOverScreen: React.FC<OnlineGameOverScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
  onExitToMenu,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;
  const [showExitWarning, setShowExitWarning] = useState<boolean>(false);
  const hasSavedMatchRef = useRef<boolean>(false);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const champion = sortedPlayers[0];

  const awards = useMemo(() => {
    const revealedImposterIds = room.revealedImposterIds || [];
    const scoreMap = new Map((room.scoreDetails || []).map((sd) => [sd.playerId, sd]));
    const context: MatchContextStats = {
      players: players.map((p) => {
        const sd = scoreMap.get(p.id);
        const isImp = revealedImposterIds.includes(p.id) || Boolean(sd?.isImposter);
        const votes = sd ? sd.votesReceived : 0;
        return {
          id: p.id,
          name: p.name,
          role: isImp ? 'imposter' : 'innocent',
          score: p.score || 0,
          votesReceived: votes,
          wasEliminated: room.eliminatedPlayerId === p.id,
        };
      }),
      imposterIds: revealedImposterIds,
      winnerTeam: room.winner === 'imposter' ? 'imposter' : 'innocents',
      eliminatedPlayerId: room.eliminatedPlayerId,
    };
    return calculateFunnyAwards(context);
  }, [players, room]);

  useEffect(() => {
    // Record lifetime stats for current player
    if (currentPlayer && currentPlayer.id) {
      const revealedImposterIds = room.revealedImposterIds || [];
      const scoreMap = new Map((room.scoreDetails || []).map((sd) => [sd.playerId, sd]));
      const sd = scoreMap.get(currentPlayer.id);
      const isImposter = revealedImposterIds.includes(currentPlayer.id) || Boolean(sd?.isImposter);
      const isWin = (room.winner === 'imposter' && isImposter) || (room.winner !== 'imposter' && !isImposter);
      recordPlayerMatchStats(
        currentPlayer.id,
        currentPlayer.score || 0,
        isImposter ? 'imposter' : 'innocent',
        isWin,
        sd ? sd.votesReceived : 0,
        Boolean(sd?.reasons?.some((r) => r.en.includes('Correct'))),
        room.eliminatedPlayerId === currentPlayer.id
      ).catch(() => {});
    }

    // Save completed match record
    if (isHost && !hasSavedMatchRef.current) {
      hasSavedMatchRef.current = true;
      const revealedImposterIds = room.revealedImposterIds || [];
      const scoreMap = new Map((room.scoreDetails || []).map((sd) => [sd.playerId, sd]));
      saveCompletedMatch({
        id: room.currentMatchId || `${room.roomCode}_${Date.now()}`,
        matchId: room.currentMatchId || `${room.roomCode}_${Date.now()}`,
        roomCode: room.roomCode,
        mode: 'online',
        completedAt: Date.now(),
        totalRounds: room.totalRounds || 1,
        winnerTeam: room.winner === 'imposter' ? 'imposter' : 'innocents',
        imposterIds: revealedImposterIds,
        players: players.map((p) => {
          const sd = scoreMap.get(p.id);
          const isImp = revealedImposterIds.includes(p.id) || Boolean(sd?.isImposter);
          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar || '🕵️',
            titleBn: p.titleBn || '',
            titleEn: p.titleEn || '',
            role: isImp ? 'imposter' : 'innocent',
            score: p.score || 0,
            votesReceived: sd ? sd.votesReceived : 0,
          };
        }),
        wordsPlayed: room.revealedWord
          ? [
              {
                wordBn: room.revealedWord.wordBn,
                wordEn: room.revealedWord.wordEn,
                category: room.revealedWord.category,
              },
            ]
          : [],
        awardsGiven: awards.map((a) => ({
          awardId: a.id,
          awardNameBn: a.nameBn,
          awardNameEn: a.nameEn,
          icon: a.icon,
          playerId: a.recipientId,
          playerName: a.recipientName,
          reasonBn: a.reasonBn,
          reasonEn: a.reasonEn,
        })),
      }).catch(() => {});
    }
  }, [currentPlayer, isHost, room, players, awards]);

  useEffect(() => {
    sound.playVictory();
    try {
      const end = Date.now() + 2.5 * 1000;
      const interval: any = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 300);
      return () => clearInterval(interval);
    } catch {
      // Ignored
    }
  }, []);

  const handlePlayAgain = async () => {
    sound.playClick();
    // Return room to LOBBY
    await setOnlineRoomPhase(room.roomCode, 'LOBBY');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto transition-colors duration-200 relative">
      {/* Top Banner with Top-Right Exit */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{isEn ? 'Match Concluded!' : 'খেলা সমাপ্ত!'}</span>
        </div>

        {/* Top-Right Exit Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowExitWarning(true);
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/60"
          title={isEn ? 'Exit to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center pt-2 space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {isEn ? 'Tournament Champions' : 'ধাপ্পাবাজ চ্যাম্পিয়নশিপ'}
        </h2>
      </div>

      {/* Champion Podium */}
      <div className="my-auto py-6 space-y-6">
        {champion && (
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/20 via-white dark:via-slate-900 to-amber-500/10 border-2 border-amber-500/50 shadow-2xl text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-amber-500">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>

            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/30 border-2 border-amber-500 flex items-center justify-center text-5xl shadow-xl">
                {champion.avatar || '🕵️'}
              </div>
              <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {isEn ? 'GRAND CHAMPION' : 'প্রধান চ্যাম্পিয়ন'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {champion.name}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? champion.titleEn : champion.titleBn}
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg shadow-md">
              <Trophy className="w-5 h-5 fill-slate-950" />
              <span>{champion.score} {isEn ? 'Points' : 'পয়েন্ট'}</span>
            </div>
          </div>
        )}

        {/* Runner-ups list */}
        <div className="space-y-2">
          {sortedPlayers.slice(1).map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono font-bold text-slate-400">
                  #{idx + 2}
                </span>
                <span className="text-xl">{p.avatar || '🕵️'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {p.name}
                </span>
              </div>
              <span className="font-mono font-black text-amber-500">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        {/* Humorous Special Awards */}
        <FunnyAwardsSection awards={awards} lang={lang} />

        {/* Download & Social Media Share Scoreboard */}
        {champion && (
          <ScoreboardShareCard
            champion={{
              id: champion.id,
              name: champion.name,
              avatar: champion.avatar || '🕵️',
              score: champion.score || 0,
            }}
            players={players.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar || '🕵️',
              score: p.score || 0,
            }))}
            matchMode="Online Multiplayer"
            totalRounds={room.totalRounds || 5}
            lang={lang}
          />
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {isHost && (
          <button
            type="button"
            onClick={handlePlayAgain}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isEn ? 'Play Again in this Room' : 'এই রুমে আবার খেলুন'}</span>
          </button>
        )}
      </div>

      {/* Exit Warning Dialog Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Leave Match?' : 'খেলা ছেড়ে যেতে চান?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Are you sure you want to return to the main menu?'
                  : 'আপনি কি নিশ্চিত যে খেলা ছেড়ে মূল মেন্যুতে ফিরে যেতে চান?'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Stay Here' : 'না, এখানে থাকুন'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitWarning(false);
                  onExitToMenu();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-md shadow-rose-500/20"
              >
                {isEn ? 'Yes, Exit' : 'হ্যাঁ, বের হন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
