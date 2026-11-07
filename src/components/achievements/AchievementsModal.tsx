import React, { useState } from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import { ACHIEVEMENTS_LIST, COSMETIC_SKIN_BADGES } from '../../data/achievements';
import { UserProfile } from '../../types/user';
import { Language, Theme } from '../../types/game';
import { sound } from '../../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onEquipBadge?: (badgeKey: string) => void;
  lang: Language;
  theme: Theme;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onEquipBadge,
  lang,
}) => {
  const isEn = lang === 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const unlockedBadges = userProfile?.unlockedBadges || [];
  const stats = userProfile?.stats;

  const filtered = ACHIEVEMENTS_LIST.filter((ach) => {
    if (selectedCategory === 'all') return true;
    return ach.category === selectedCategory;
  });

  const getProgress = (achId: string, maxProgress: number): number => {
    if (!stats) return 0;
    let current = 0;
    switch (achId) {
      case 'first_match':
      case 'matches_5':
      case 'matches_20':
        current = stats.totalMatches;
        break;
      case 'imposter_win_1':
      case 'imposter_wins_5':
        current = stats.imposterWins;
        break;
      case 'citizen_win_1':
      case 'innocent_survivor':
        current = stats.citizenWins;
        break;
      case 'catch_imposters_3':
      case 'catch_imposters_10':
        current = stats.correctVotes;
        break;
      case 'silent_assassin':
        current = stats.cleanImposterWins;
        break;
      case 'points_50':
      case 'points_100':
      case 'points_250':
        current = stats.totalPoints;
        break;
      default:
        current = unlockedBadges.includes(achId) ? maxProgress : 0;
        break;
    }
    return Math.min(current, maxProgress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Achievements & Missions' : 'অর্জন ও মিশনসমূহ'}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {unlockedBadges.length} / {ACHIEVEMENTS_LIST.length} {isEn ? 'Unlocked' : 'সম্পন্ন হয়েছে'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold bg-slate-50/30 dark:bg-slate-950/30">
          {[
            { id: 'all', bn: 'সব অর্জন', en: 'All' },
            { id: 'imposter', bn: 'ধাপ্পাবাজ মিশন', en: 'Imposter' },
            { id: 'citizen', bn: 'নাগরিক মিশন', en: 'Citizen' },
            { id: 'points', bn: 'পয়েন্ট সংগ্রহ', en: 'Points' },
            { id: 'veteran', bn: 'অভিজ্ঞতা', en: 'Veteran' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isEn ? cat.en : cat.bn}
            </button>
          ))}
        </div>

        {/* Achievements List Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filtered.map((ach) => {
            const isUnlocked = unlockedBadges.includes(ach.id);
            const progress = getProgress(ach.id, ach.maxProgress);
            const percent = Math.min(100, Math.round((progress / ach.maxProgress) * 100));
            const rewardBadge = ach.rewardSkinBadge ? COSMETIC_SKIN_BADGES[ach.rewardSkinBadge] : null;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-amber-500/40 shadow-xs'
                    : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-80'
                }`}
              >
                {/* Left Badge Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {ach.titleEn}
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                        {ach.titleBn}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Unlocked' : 'সম্পন্ন'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">
                        {progress} / {ach.maxProgress}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug font-medium">
                    {ach.descEn}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {ach.descBn}
                  </p>

                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}

                  {/* Reward Badge Mention */}
                  {rewardBadge && (
                    <div className="flex items-center justify-between pt-1.5">
                      <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{isEn ? 'Skin Reward:' : 'পুরস্কার স্কিন:'}</span>
                        <span className="font-bold">{isEn ? rewardBadge.en : rewardBadge.bn}</span>
                      </div>

                      {isUnlocked && onEquipBadge && ach.rewardSkinBadge && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            onEquipBadge(ach.rewardSkinBadge!);
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-xs"
                        >
                          {isEn ? 'Equip Skin' : 'স্কিন পরুন'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
