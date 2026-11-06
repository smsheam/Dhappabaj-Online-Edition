import React from 'react';
import { Sparkles, Award } from 'lucide-react';
import { FunnyAward } from '../utils/funnyAwards';
import { Language } from '../types/game';

interface FunnyAwardsSectionProps {
  awards: FunnyAward[];
  lang: Language;
}

export const FunnyAwardsSection: React.FC<FunnyAwardsSectionProps> = ({ awards, lang }) => {
  const isEn = lang === 'en';
  if (!awards || awards.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Match Special Awards' : 'ম্যাচের বিশেষ খেতাব ও অ্যাওয়ার্ড'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Humorous titles based on real match moments' : 'ম্যাচের বাস্তব পারফর্মেন্সের উপর ভিত্তি করে মজার খেতাব'}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{awards.length} {isEn ? 'Awards' : 'খেতাব'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {awards.map((award) => (
          <div
            key={award.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-amber-500/40 transition-all flex items-start gap-3 relative overflow-hidden group"
          >
            {/* Left Emoji / Icon with gradient */}
            <div className={`w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br ${award.badgeColor} text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform`}>
              {award.icon}
            </div>

            {/* Award Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {isEn ? award.nameEn : award.nameBn}
                </h4>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                  {award.recipientName}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {isEn ? award.reasonEn : award.reasonBn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
