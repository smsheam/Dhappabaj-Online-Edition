import React, { useState, useEffect } from 'react';
import { Award, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { Player, RoundResult, Language, Theme } from '../types/game';
import { CATEGORIES } from '../data/categories';
import { GameTopBar } from './GameTopBar';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';
import { getHardHint } from '../utils/hintHelper';

interface RevealScreenProps {
  players: Player[];
  roundResult: RoundResult;
  onProceedToScoreboard: (imposterGuessedWord: boolean) => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  players,
  roundResult,
  onProceedToScoreboard,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  const [imposterGuessedWord, setImposterGuessedWord] = useState<boolean>(false);

  const { word, imposterIds, scoreDetails } = roundResult;
  const category = CATEGORIES[word.category];
  const imposters = players.filter((p) => imposterIds.includes(p.id));

  // Directly play dramatic scary horror reveal sound upon entering this screen!
  useEffect(() => {
    sound.playSuspenseReveal();
  }, []);

  const handleToggleImposterGuess = () => {
    sound.playClick();
    setImposterGuessedWord(!imposterGuessedWord);
  };

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
        roundBadge={isEn ? `Results · Round ${roundResult.roundNumber}` : `ফলাফল · রাউন্ড ${roundResult.roundNumber}`}
      />

      {/* Main Reveal Content - Direct Imposter Reveal with Sinister Presentation */}
      <div className="my-auto py-5 space-y-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Imposter Spotlight Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-rose-100/90 dark:from-rose-950/80 via-white dark:via-slate-900 to-white dark:to-slate-950 border-2 border-rose-500 shadow-2xl text-center space-y-4 relative overflow-hidden">
          {/* Sinister Red Ambient Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white dark:bg-rose-600 text-xs font-black uppercase tracking-widest shadow-md">
            <AlertTriangle className="w-4 h-4" />
            <span>{isEn ? 'The Imposter Discovered!' : 'ধাপ্পাবাজের মুখোশ উন্মোচিত!'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {imposters.map((imp) => {
              const iTitle = isEn ? imp.titleEn : imp.titleBn;
              return (
                <div key={imp.id} className="text-center group">
                  <div className="relative inline-block mb-3">
                    <PlayerAvatar
                      avatar={imp.avatar || '🕵️'}
                      color={imp.avatarColor || 'bg-rose-500'}
                      size="xl"
                      className="mx-auto shadow-xl ring-4 ring-rose-500/40"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border border-white dark:border-slate-900 shadow">
                      {isEn ? 'Imposter' : 'ধাপ্পাবাজ'}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{imp.name}</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block mt-1">{iTitle}</span>
                </div>
              );
            })}
          </div>

          {/* Secret Word Reveal */}
          <div className="pt-4 border-t border-rose-200 dark:border-rose-900/50">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">
              {isEn ? `The Secret Word (${category?.nameEn})` : `আসল গোপন শব্দটি ছিল (${category?.nameBn})`}
            </span>
            <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-wide">
              {isEn ? word.wordEn : word.wordBn}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {isEn ? word.wordBn : word.wordEn}
            </p>

            {(() => {
              const impHint = getHardHint(word);
              return (
                <div className="mt-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto">
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block mb-0.5">
                    {isEn ? 'Imposter Hint was:' : 'ধাপ্পাবাজকে দেওয়া হিন্ট (Hint):'}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                    &ldquo;{isEn ? impHint.en : impHint.bn}&rdquo;
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">
                      ({isEn ? `Bangla: ${impHint.bn}` : `English: ${impHint.en}`})
                    </span>
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Imposter Word Guess Bonus Interactive Check */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleToggleImposterGuess}
              className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                imposterGuessedWord
                  ? 'bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{isEn ? 'Did the Imposter guess the secret word?' : 'Imposter কি আসল শব্দটি সঠিকভাবে অনুমান করতে পেরেছে?'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">
                {imposterGuessedWord
                  ? (isEn ? 'Yes (+3 Bonus)' : 'হ্যাঁ (+৩ বোনাস)')
                  : (isEn ? 'No (Click if yes)' : 'না (হ্যাঁ হলে ক্লিক করুন)')}
              </span>
            </button>
          </div>
        </div>

        {/* Voting Details & Practical Points Delta */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{isEn ? 'Voting Breakdown & Round Points' : 'ভোটের ফলাফল ও পয়েন্ট সমন্বয়'}</span>
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {scoreDetails.map((detail) => {
              const votedPlayer = players.find((p) => p.id === detail.votedForId);
              const extraBonus = detail.isImposter && imposterGuessedWord ? 3 : 0;
              const totalDelta = detail.pointsDelta + extraBonus;
              const isPositive = totalDelta > 0;
              const isZero = totalDelta === 0;
              const dTitle = isEn ? detail.playerTitleEn : detail.playerTitleBn;

              const reasonTexts = detail.reasons.map((r) => (isEn ? r.en : r.bn));
              if (extraBonus > 0) {
                reasonTexts.push(isEn ? 'Word guess (+3)' : 'শব্দ অনুমান (+৩)');
              }

              return (
                <div key={detail.playerId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        detail.isImposter
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {detail.isImposter ? '🕵️' : '🛡️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{detail.playerName}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">({dTitle})</span>
                        {detail.isImposter && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold">
                            ধাপ্পাবাজ
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {isEn ? 'Voted for: ' : 'ভোট দিয়েছে: '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {votedPlayer ? votedPlayer.name : (isEn ? 'None' : 'কোনোটি নয়')}
                        </strong>
                        {' · '}
                        {isEn ? `Votes received: ${detail.votesReceived}` : `পাওয়া ভোট: ${detail.votesReceived}টি`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : isZero
                          ? 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {isPositive ? `+${totalDelta}` : totalDelta}
                    </span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[150px] truncate">
                      {reasonTexts.join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Button - Changed to 'স্কোরবোর্ড দেখুন' */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onProceedToScoreboard(imposterGuessedWord);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <span>{isEn ? 'View Scoreboard' : 'স্কোরবোর্ড দেখুন'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
