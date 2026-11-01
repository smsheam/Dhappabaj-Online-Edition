import React, { useState } from 'react';
import { Vote, Check, ArrowRight } from 'lucide-react';
import { Player, Language, Theme } from '../types/game';
import { GameTopBar } from './GameTopBar';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface VotingScreenProps {
  players: Player[];
  roundNumber: number;
  initialVotingStyle: 'host_input' | 'pass_and_play';
  onSubmitVotes: (votes: Record<string, string>) => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onHome?: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  players,
  roundNumber,
  initialVotingStyle,
  onSubmitVotes,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
  onHome,
}) => {
  const isEn = lang === 'en';
  const [votingStyle, setVotingStyle] = useState<'host_input' | 'pass_and_play'>(initialVotingStyle);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [activeVoterIndex, setActiveVoterIndex] = useState<number>(0);
  const [isPassAndPlayRevealed, setIsPassAndPlayRevealed] = useState<boolean>(false);

  const currentVoter = players[activeVoterIndex];
  const allVoted = players.every((p) => votes[p.id]);

  const handleCastVote = (suspectId: string) => {
    sound.playKeySound();
    const updated = { ...votes, [currentVoter.id]: suspectId };
    setVotes(updated);

    if (activeVoterIndex < players.length - 1) {
      setActiveVoterIndex(activeVoterIndex + 1);
      setIsPassAndPlayRevealed(false);
    }
  };

  const handleSelectVoter = (idx: number) => {
    sound.playKeySound();
    setActiveVoterIndex(idx);
    setIsPassAndPlayRevealed(false);
  };

  const handleFinalSubmit = () => {
    if (!allVoted) return;
    sound.playSuspenseReveal();
    onSubmitVotes(votes);
  };

  const currentVoterTitle = isEn ? currentVoter?.titleEn : currentVoter?.titleBn;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 max-w-3xl mx-auto transition-colors duration-200">
      <GameTopBar
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenRules={onOpenRules}
        onHome={onHome}
        roundBadge={isEn ? `Voting · Round ${roundNumber}` : `ভোট · রাউন্ড ${roundNumber}`}
      />

      {/* Main Voting Body */}
      <div className="my-auto py-5 space-y-5">
        {/* Voting style mode switch */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Vote className="w-5 h-5 text-rose-500" />
            <span>{isEn ? 'Who is the Imposter?' : 'ধাপ্পাবাজ কে? ভোট দিন'}</span>
          </h2>

          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setVotingStyle('host_input');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                votingStyle === 'host_input'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEn ? 'Host Input' : '১ম ব্যক্তি ইনপুট'}
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setVotingStyle('pass_and_play');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                votingStyle === 'pass_and_play'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEn ? 'Pass & Play' : 'পাস-অ্যান্ড-প্লে'}
            </button>
          </div>
        </div>

        {/* Voter Selector Tabs */}
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn
                ? `Voter Status (${Object.keys(votes).length}/${players.length})`
                : `ভোটার তালিকা (${Object.keys(votes).length}/${players.length})`}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold">
              {allVoted
                ? isEn ? 'All votes cast!' : 'সবার ভোট সম্পন্ন!'
                : isEn ? 'Tap name to switch' : 'যেকোনো ভোটারের নাম চাপুন'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {players.map((p, idx) => {
              const hasVoted = !!votes[p.id];
              const isCurrent = idx === activeVoterIndex;
              const pTitle = isEn ? p.titleEn : p.titleBn;

              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectVoter(idx)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-white shadow-xs'
                      : hasVoted
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-base">{p.avatar || '🕵️'}</span>
                    {hasVoted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{pTitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voting Card for Current Voter */}
        {votingStyle === 'pass_and_play' && !isPassAndPlayRevealed ? (
          /* Pass and Play privacy handover */
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">
              {isEn ? 'Pass & Play Secret Vote' : 'পাস-অ্যান্ড-প্লে গোপন ভোট'}
            </span>
            <div className="mb-2">
              <PlayerAvatar
                avatar={currentVoter?.avatar || '🕵️'}
                color={currentVoter?.avatarColor || 'bg-amber-500'}
                size="lg"
                badge={activeVoterIndex + 1}
                className="mx-auto shadow-md"
              />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currentVoter?.name}</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-bold border border-slate-200 dark:border-slate-700 inline-block">
              {currentVoterTitle}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {isEn
                ? `Pass device to ${currentVoter?.name} privately.`
                : `মোবাইলটি ${currentVoter?.name}-এর হাতে দিন এবং অন্য কেউ যেন না দেখে।`}
            </p>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsPassAndPlayRevealed(true);
              }}
              className="py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              {isEn ? `I am ${currentVoter?.name}, Vote Privately` : `আমি ${currentVoter?.name}, গোপন ভোট দিন`}
            </button>
          </div>
        ) : (
          /* Host Input Mode OR Revealed Pass-and-Play */
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                {isEn ? `Voter: ${currentVoter?.name} (${currentVoterTitle})` : `ভোটার: ${currentVoter?.name} (${currentVoterTitle})`}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isEn ? 'Vote for the Imposter' : 'কাকে Imposter মনে করেন?'}
              </h3>
            </div>

            {/* Suspect Buttons List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
              {players.map((suspect) => {
                const isSelf = suspect.id === currentVoter?.id;
                const isSelected = votes[currentVoter?.id] === suspect.id;
                const sTitle = isEn ? suspect.titleEn : suspect.titleBn;

                return (
                  <button
                    type="button"
                    key={suspect.id}
                    disabled={isSelf}
                    onClick={() => handleCastVote(suspect.id)}
                    className={`py-3 px-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelf
                        ? 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950/20 scale-102 cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        avatar={suspect.avatar || '🕵️'}
                        color={suspect.avatarColor || 'bg-amber-500'}
                        size="sm"
                      />
                      <div>
                        <span className="text-sm font-bold block">{suspect.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isSelf ? (isEn ? '(Self)' : '(নিজের নাম)') : sTitle}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Voted' : 'ভোট'}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected feedback info */}
            {votes[currentVoter?.id] && (
              <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {currentVoter?.name} {isEn ? 'voted for: ' : 'ভোট দিয়েছেন: '}
                <span className="font-bold underline">
                  {players.find((p) => p.id === votes[currentVoter.id])?.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit / Reveal Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          disabled={!allVoted}
          onClick={handleFinalSubmit}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            allVoted
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-rose-950/20 transform active:scale-98'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <span>
            {allVoted
              ? isEn ? 'Reveal Results' : 'ফলাফল উন্মোচন করুন'
              : isEn
              ? `Waiting for all votes (${Object.keys(votes).length}/${players.length})`
              : `সবার ভোট প্রয়োজন (${Object.keys(votes).length}/${players.length})`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
