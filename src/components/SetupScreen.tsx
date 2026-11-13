import React, { useState } from 'react';
import { Users, UserX, Clock, Check, Shuffle, X, Smile, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import { CategoryId, Language, Theme } from '../types/game';
import { CATEGORIES } from '../data/categories';
import { generatePlayerTitles, SCENE_PACKS, ScenePack, TitlePair } from '../data/titles';
import { PLAYER_AVATARS, DEFAULT_AVATARS_BY_INDEX } from '../data/avatars';
import { PlayerAvatar } from './PlayerAvatar';
import { GameTopBar } from './GameTopBar';
import { sound } from '../utils/audio';

export function calculateBestRounds(players: number, imposters: number): number {
  // Strategy requested by user:
  // "round number = player number, seems too long game. Modify round number with best strategy, like at least 3 round or round number = player number by imposter number (upper round number) etc."
  const upperRatio = Math.ceil(players / Math.max(imposters, 1));
  // At least 3 rounds, capped between 3 and 5 for crisp, optimal gameplay
  return Math.max(3, Math.min(5, upperRatio));
}

const DEFAULT_NAMES_BN = [
  'তাহসান',
  'সাফা',
  'রোজা',
  'নিহা',
  'হাসিব',
  'সিজান',
  'সিয়াম',
  'তামান্না',
  'শান্ত',
  'স্বাধীন',
  'জারিফ',
  'তাইফ',
];

const DEFAULT_NAMES_EN = [
  'Tahsan',
  'Safa',
  'Roza',
  'Niha',
  'Hasib',
  'Sijan',
  'Siam',
  'Tamanna',
  'Shanto',
  'Swadhin',
  'Zarif',
  'Taif',
];

const FUN_NAMES_BN = [
  'তাহসান', 'সাফা', 'রোজা', 'নিহা', 'হাসিব', 'সিজান',
  'সিয়াম', 'তামান্না', 'শান্ত', 'স্বাধীন', 'জারিফ', 'তাইফ'
];

const FUN_NAMES_EN = [
  'Tahsan', 'Safa', 'Roza', 'Niha', 'Hasib', 'Sijan',
  'Siam', 'Tamanna', 'Shanto', 'Swadhin', 'Zarif', 'Taif'
];

const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

interface SetupScreenProps {
  onStartGame: (
    playersData: { name: string; titleBn: string; titleEn: string; avatar: string }[],
    imposterCount: 1 | 2 | 3,
    selectedCategories: CategoryId[],
    timerSeconds: number,
    votingStyle: 'host_input' | 'pass_and_play',
    totalRounds: number
  ) => void;
  onBackToHome?: () => void;
  onOpenOnlineMode?: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartGame,
  onBackToHome,
  onOpenOnlineMode,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenRules,
}) => {
  const isEn = lang === 'en';
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [imposterCount, setImposterCount] = useState<1 | 2 | 3>(1);
  const [totalRounds, setTotalRounds] = useState<number>(() => calculateBestRounds(5, 1));
  const [playerNames, setPlayerNames] = useState<string[]>(
    isEn ? DEFAULT_NAMES_EN.slice(0, 5) : DEFAULT_NAMES_BN.slice(0, 5)
  );
  const [playerAvatars, setPlayerAvatars] = useState<string[]>(
    DEFAULT_AVATARS_BY_INDEX.slice(0, 5)
  );
  const [currentScene, setCurrentScene] = useState<ScenePack>(() => SCENE_PACKS[0]);
  const [playerTitles, setPlayerTitles] = useState<TitlePair[]>(() => generatePlayerTitles(5, SCENE_PACKS[0].id).titles);

  // Avatar picker modal state
  const [editingAvatarIndex, setEditingAvatarIndex] = useState<number | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([
    'food',
    'people',
    'object',
    'animal',
  ]);
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [votingStyle, setVotingStyle] = useState<'host_input' | 'pass_and_play'>('host_input');

  const getMaxImposters = (count: number): 1 | 2 | 3 => {
    if (count <= 4) return 1;
    if (count <= 7) return 2;
    return 3;
  };

  const maxAllowedImposters = getMaxImposters(playerCount);

  const handleSwitchScene = () => {
    sound.playClick();
    const currentIndex = SCENE_PACKS.findIndex((s) => s.id === currentScene.id);
    const nextScene = SCENE_PACKS[(currentIndex + 1) % SCENE_PACKS.length];
    setCurrentScene(nextScene);
    const { titles } = generatePlayerTitles(playerCount, nextScene.id);
    setPlayerTitles(titles);
  };

  const handlePlayerCountChange = (count: number) => {
    sound.playClick();
    setPlayerCount(count);

    if (count > playerNames.length) {
      const pool = isEn ? DEFAULT_NAMES_EN : DEFAULT_NAMES_BN;
      const addedNames: string[] = [];
      const addedAvatars: string[] = [];

      for (let i = playerNames.length; i < count; i++) {
        addedNames.push(pool[i] || (isEn ? `Player ${i + 1}` : `খেলোয়াড় ${i + 1}`));
        addedAvatars.push(DEFAULT_AVATARS_BY_INDEX[i % DEFAULT_AVATARS_BY_INDEX.length]);
      }
      setPlayerNames([...playerNames, ...addedNames]);
      setPlayerAvatars([...playerAvatars, ...addedAvatars]);
    } else {
      setPlayerNames(playerNames.slice(0, count));
      setPlayerAvatars(playerAvatars.slice(0, count));
    }

    const { titles } = generatePlayerTitles(count, currentScene.id);
    setPlayerTitles(titles);

    const maxImp = getMaxImposters(count);
    const newImp = imposterCount > maxImp ? maxImp : imposterCount;
    if (imposterCount > maxImp) {
      setImposterCount(maxImp);
    }
    setTotalRounds(calculateBestRounds(count, newImp));
  };

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...playerNames];
    updated[index] = newName;
    setPlayerNames(updated);
  };

  const handleAvatarSelect = (emoji: string) => {
    sound.playClick();
    if (editingAvatarIndex !== null) {
      const updated = [...playerAvatars];
      updated[editingAvatarIndex] = emoji;
      setPlayerAvatars(updated);
      setEditingAvatarIndex(null);
    }
  };

  const handleRandomizeNamesAndTitles = () => {
    sound.playClick();
    const namePool = isEn ? FUN_NAMES_EN : FUN_NAMES_BN;
    const shuffledNames = [...namePool].sort(() => 0.5 - Math.random());
    setPlayerNames(shuffledNames.slice(0, playerCount));

    // Also pick a fresh random scene pack!
    const randomScene = SCENE_PACKS[Math.floor(Math.random() * SCENE_PACKS.length)];
    setCurrentScene(randomScene);
    const { titles } = generatePlayerTitles(playerCount, randomScene.id);
    setPlayerTitles(titles);

    // Shuffle avatars
    const shuffledAvatars = [...PLAYER_AVATARS.map((a) => a.emoji)].sort(() => 0.5 - Math.random());
    setPlayerAvatars(shuffledAvatars.slice(0, playerCount));
  };

  const toggleCategory = (catId: CategoryId) => {
    sound.playClick();
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCardFlip();
    const playersData = playerNames.map((n, i) => ({
      name: n.trim() ? n.trim() : isEn ? `Player ${i + 1}` : `খেলোয়াড় ${i + 1}`,
      titleBn: playerTitles[i]?.bn || currentScene.firstPlayerTitle.bn,
      titleEn: playerTitles[i]?.en || currentScene.firstPlayerTitle.en,
      avatar: playerAvatars[i] || DEFAULT_AVATARS_BY_INDEX[i % DEFAULT_AVATARS_BY_INDEX.length] || '🕵️',
    }));
    onStartGame(playersData, imposterCount, selectedCategories, timerSeconds, votingStyle, totalRounds);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 max-w-4xl mx-auto transition-colors duration-200">
      <GameTopBar
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenRules={onOpenRules}
        onBack={onBackToHome}
        onHome={onBackToHome}
      />

      {/* Setup Form */}
      <form onSubmit={handleSubmit} className="my-auto py-5 space-y-5">
        {/* Quick Mode Indicator & Return to Home / Switch to Online */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span className="text-base">📱</span>
            <span>
              {isEn ? 'Pass & Play Mode (Local 1 Device)' : 'পাস-অ্যান্ড-প্লে মোড (অফলাইন ১টি ডিভাইস)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOnlineMode && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenOnlineMode();
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>{isEn ? 'Switch to Online Room ➔' : 'অনলাইন প্রাইভেট রুমে যান ➔'}</span>
              </button>
            )}

            {onBackToHome && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onBackToHome();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:text-amber-500 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1"
                title={isEn ? 'Back to Home' : 'হোমে ফিরে যান'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEn ? 'Main Menu' : 'মূল মেন্যু'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Player count, Imposter count, and Rounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player Count */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>{isEn ? `Players (${playerCount})` : `খেলোয়াড় (${playerCount} জন)`}</span>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handlePlayerCountChange(num)}
                  className={`py-2 rounded-xl text-sm font-bold font-mono transition-all cursor-pointer ${
                    playerCount === num
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Imposter Count */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-500" />
                <span>{isEn ? 'Imposters' : 'ধাপ্পাবাজ'}</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {playerCount <= 4
                  ? isEn ? 'Max 1' : 'সর্বোচ্চ ১'
                  : playerCount <= 7
                  ? isEn ? 'Max 2' : 'সর্বোচ্চ ২'
                  : isEn ? 'Max 3' : 'সর্বোচ্চ ৩'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => {
                const isAllowed = num <= maxAllowedImposters;
                const isSelected = imposterCount === num;

                return (
                  <button
                    type="button"
                    key={num}
                    disabled={!isAllowed}
                    onClick={() => {
                      sound.playClick();
                      const nextImp = num as 1 | 2 | 3;
                      setImposterCount(nextImp);
                      setTotalRounds(calculateBestRounds(playerCount, nextImp));
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-md'
                        : isAllowed
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-100/50 dark:bg-slate-850/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <span>{isEn ? `${num} Imposter` : `${num} জন`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Rounds */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-500" />
                <span>{isEn ? `Rounds (${totalRounds})` : `রাউন্ড সংখ্যা (${totalRounds})`}</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isEn ? 'Min 3' : 'কমপক্ষে ৩'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    sound.playClick();
                    setTotalRounds(num);
                  }}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
                    totalRounds === num
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Player Names, Titles & Custom Avatars */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isEn ? 'Players & Roles' : 'খেলোয়াড় ও চরিত্র পদবী'}
                </label>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <span>{currentScene.icon}</span>
                  <span>{isEn ? currentScene.nameEn : currentScene.nameBn}</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {isEn ? 'All player roles belong to this common scene' : 'সকল খেলোয়াড় এই একই পরিবেশের চরিত্রে অভিনয় করবেন'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSwitchScene}
                className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>{isEn ? 'Change Scene ↻' : 'থিম পরিবর্তন ↻'}</span>
              </button>
              <button
                type="button"
                onClick={handleRandomizeNamesAndTitles}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>{isEn ? 'Randomize' : 'র‍্যান্ডম করুন'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3">
            {playerNames.map((name, index) => {
              const currentTitle = isEn ? playerTitles[index]?.en : playerTitles[index]?.bn;
              const avatar = playerAvatars[index] || '🕵️';
              const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

              return (
                <div
                  key={index}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-colors space-y-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Interactive Avatar button */}
                    <PlayerAvatar
                      avatar={avatar}
                      color={color}
                      size="sm"
                      badge={index + 1}
                      onClick={() => {
                        sound.playClick();
                        setEditingAvatarIndex(index);
                      }}
                      title={isEn ? 'Change Avatar' : 'অবতার পরিবর্তন করুন'}
                    />

                    <input
                      type="text"
                      value={name}
                      maxLength={16}
                      onChange={(e) => {
                        sound.playKeySound();
                        handleNameChange(index, e.target.value);
                      }}
                      placeholder={isEn ? `Player ${index + 1}` : `খেলোয়াড় ${index + 1}`}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="pl-10 text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                    {currentTitle || (isEn ? 'Citizen' : 'নাগরিক')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Word Categories */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isEn ? 'Word Categories' : 'শব্দ ক্যাটাগরি'}
            </label>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                const all = Object.keys(CATEGORIES) as CategoryId[];
                if (selectedCategories.length === all.length) {
                  setSelectedCategories([all[0]]);
                } else {
                  setSelectedCategories(all);
                }
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {selectedCategories.length === Object.keys(CATEGORIES).length
                ? (isEn ? 'Deselect All' : 'সব বাতিল')
                : (isEn ? 'Select All' : 'সব নির্বাচন')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => {
              const cat = CATEGORIES[catId];
              const isSelected = selectedCategories.includes(catId);
              return (
                <button
                  type="button"
                  key={catId}
                  onClick={() => toggleCategory(catId)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50'
                  }`}
                >
                  <span className="text-xs font-bold truncate">
                    {isEn ? cat.nameEn : cat.nameBn}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Timer & Voting Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discussion Timer */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>{isEn ? 'Discussion Timer' : 'আলোচনার সময়'}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: isEn ? 'Off' : 'সীমাহীন', value: 0 },
                { label: '60s', value: 60 },
                { label: '90s', value: 90 },
                { label: '120s', value: 120 },
              ].map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => {
                    sound.playClick();
                    setTimerSeconds(t.value);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                    timerSeconds === t.value
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voting System */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">
              {isEn ? 'Voting Style' : 'ভোট নেওয়ার পদ্ধতি'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setVotingStyle('host_input');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  votingStyle === 'host_input'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{isEn ? 'Host Input' : 'প্রথম প্লেয়ার ইনপুট'}</div>
                <div className="text-[10px] opacity-75">{isEn ? 'One device, quick' : 'হোস্ট সবার ভোট ইনপুট দেবে'}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setVotingStyle('pass_and_play');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  votingStyle === 'pass_and_play'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{isEn ? 'Pass & Play' : 'পাস-অ্যান্ড-প্লে'}</div>
                <div className="text-[10px] opacity-75">{isEn ? 'Secret individual vote' : 'প্রত্যেকে গোপন ভোট দেবে'}</div>
              </button>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <span>{isEn ? 'Start 1st Round' : 'প্রথম রাউন্ড শুরু করুন'}</span>
          </button>

          {onBackToHome && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBackToHome();
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Back to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}</span>
            </button>
          )}
        </div>
      </form>

      {/* Avatar Selection Modal */}
      {editingAvatarIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isEn
                    ? `Choose Avatar for ${playerNames[editingAvatarIndex]}`
                    : `${playerNames[editingAvatarIndex]}-এর অবতার নির্বাচন`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAvatarIndex(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {PLAYER_AVATARS.map((opt) => {
                const isSelected = playerAvatars[editingAvatarIndex] === opt.emoji;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleAvatarSelect(opt.emoji)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate w-full">
                      {isEn ? opt.labelEn : opt.labelBn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
