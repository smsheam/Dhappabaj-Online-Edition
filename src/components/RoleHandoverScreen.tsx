import React from 'react';
import { Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { Player, Language, Theme } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface RoleHandoverScreenProps {
  player: Player;
  playerIndex: number;
  totalPlayers: number;
  roundNumber: number;
  onProceedToCard: () => void;
  onQuitToMenu?: () => void;
  lang: Language;
  theme: Theme;
}

export const RoleHandoverScreen: React.FC<RoleHandoverScreenProps> = ({
  player,
  playerIndex,
  totalPlayers,
  roundNumber,
  onProceedToCard,
  onQuitToMenu,
  lang,
}) => {
  const isEn = lang === 'en';
  const titleText = isEn ? player.titleEn : player.titleBn;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 max-w-md mx-auto transition-colors duration-200">
      {/* Top indicator with Back button */}
      <div className="flex items-center justify-between">
        {onQuitToMenu ? (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-500 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Menu' : 'মেন্যু'}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="text-center space-y-0.5">
          <span className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono font-bold block">
            {isEn ? `Round ${roundNumber} · Handover` : `রাউন্ড ${roundNumber} · হস্তান্তর`}
          </span>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{isEn ? 'Player' : 'খেলোয়াড়'}</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{playerIndex + 1}</span>
            <span>/ {totalPlayers}</span>
          </div>
        </div>

        <div className="w-8" />
      </div>

      {/* Main Privacy Shield Card */}
      <div className="my-auto py-8 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xl relative overflow-hidden">
        <div className="mb-4">
          <PlayerAvatar
            avatar={player.avatar}
            color={player.avatarColor}
            size="xl"
            badge={playerIndex + 1}
          />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
          {player.name}
        </h2>

        {/* Assigned Scene Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold mb-4">
          <span>{titleText}</span>
        </div>

        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">
          {isEn ? 'Please pass the device to' : 'ডিভাইসটি হস্তান্তর করুন'}
          <span className="text-amber-600 dark:text-amber-400 font-black block text-base mt-1">
            "{player.name}"
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-amber-300 mb-2">
          <Eye className="w-3.5 h-3.5" />
          <span>{isEn ? 'Keep screen private' : 'অন্য কেউ যেন স্ক্রিনে না তাকায়'}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={() => {
            sound.playCardFlip();
            onProceedToCard();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <span>{isEn ? 'Reveal the Word' : 'শব্দটি উন্মোচন করুন'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {onQuitToMenu && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{isEn ? 'Cancel & Return to Menu' : 'খেলা বাতিল করে মূল মেন্যুতে যান'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
