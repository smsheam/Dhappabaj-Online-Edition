import React, { useState, useEffect } from 'react';
import { GamePhase, GameSettings, Player, RoundResult, WordItem, CategoryId, Language, Theme } from './types/game';
import { IntroScreen } from './components/IntroScreen';
import { SetupScreen } from './components/SetupScreen';
import { RoleHandoverScreen } from './components/RoleHandoverScreen';
import { RoleCardScreen } from './components/RoleCardScreen';
import { ClueSpeakingScreen } from './components/ClueSpeakingScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { RevealScreen } from './components/RevealScreen';
import { ScoreboardScreen } from './components/ScoreboardScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { RulesModal } from './components/RulesModal';
import { pickRandomWord } from './data/words';
import { calculateRoundScores } from './utils/scoring';
import { sound } from './utils/audio';
import { syncAdSenseSound } from './utils/adsense';
import { preloadWordImage } from './utils/wordImageService';

import { OnlinePlayer, OnlineRoomData } from './types/multiplayer';
import { OnlineJoinCreateModal } from './components/online/OnlineJoinCreateModal';
import { OnlineGameContainer } from './components/online/OnlineGameContainer';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthPromptModal } from './components/auth/AuthPromptModal';
import { UserProfile } from './types/user';
import {
  getUserProfile,
  loginAsGuest,
  subscribeToUserProfile,
  signOutUser,
  createDefaultProfile,
  saveUserProfile,
} from './services/userService';
import { isOwnerEmail, getUserRole } from './services/roleService';
import { isUserAdmin } from './services/adminService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Analytics } from '@vercel/analytics/react';

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('dark');
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 5,
    imposterCount: 1,
    totalRounds: 5,
    timerSeconds: 90,
    votingStyle: 'host_input',
    allowCategorySelection: true,
    selectedCategories: ['food', 'people', 'object', 'animal'],
  });

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [usedWordIds, setUsedWordIds] = useState<number[]>([]);

  // Online Multiplayer State
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomData | null>(null);
  const [onlinePlayer, setOnlinePlayer] = useState<OnlinePlayer | null>(null);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>('');

  // Check URL query param for shared room invite code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join');
    if (roomParam) {
      setInviteCode(roomParam.trim().toUpperCase());
      setIsOnlineModalOpen(true);
    }
  }, []);

  // Round state
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [imposterIds, setImposterIds] = useState<string[]>([]);
  const [inspectingPlayerIndex, setInspectingPlayerIndex] = useState<number>(0);
  const [currentVotes, setCurrentVotes] = useState<Record<string, string>>({});
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);

  // Global settings and profiles
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [canAccessAdmin, setCanAccessAdmin] = useState<boolean>(false);

  // Initialize player profile silently & check admin permissions with Firebase Auth
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const checkAdmin = async (prof: UserProfile | null) => {
      const email = auth.currentUser?.email || prof?.email;
      if (isOwnerEmail(email) || isUserAdmin()) {
        setCanAccessAdmin(true);
        return;
      }
      const roleInfo = await getUserRole(auth.currentUser?.uid, email || undefined);
      setCanAccessAdmin(roleInfo.role === 'owner' || roleInfo.role === 'editor');
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!user) {
        // Silently initialize guest session without showing any popup modal at startup
        try {
          const guestProfile = await loginAsGuest();
          setUserProfile(guestProfile);
          checkAdmin(guestProfile);
          unsubProfile = subscribeToUserProfile(guestProfile.uid, (updated) => {
            if (updated) {
              setUserProfile(updated);
              checkAdmin(updated);
            }
          });
        } catch (err) {
          console.warn('Silent guest login note:', err);
        }
        return;
      }

      try {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          profile = createDefaultProfile(
            user.uid,
            user.isAnonymous,
            user.email,
            user.displayName,
            user.photoURL
          );
          await saveUserProfile(profile);
        }

        setUserProfile(profile);
        checkAdmin(profile);

        unsubProfile = subscribeToUserProfile(user.uid, (updated) => {
          if (updated) {
            setUserProfile(updated);
            checkAdmin(updated);
          }
        });
      } catch (err) {
        console.warn('User profile initialization warning:', err);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const handleSignOut = async () => {
    sound.playClick();
    setIsProfileOpen(false);
    await signOutUser();
    // Return to guest mode seamlessly on home screen
    const guestProfile = await loginAsGuest();
    setUserProfile(guestProfile);
    setCanAccessAdmin(false);
  };

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    syncAdSenseSound(muted);
  };

  // Intro -> Setup
  const handleIntroStart = () => {
    setPhase('SETUP');
  };

  // Start new game from setup
  const handleStartGame = (
    playersData: { name: string; titleBn: string; titleEn: string; avatar: string }[],
    imposterCount: 1 | 2 | 3,
    selectedCategories: CategoryId[],
    timerSeconds: number,
    votingStyle: 'host_input' | 'pass_and_play',
    selectedTotalRounds: number
  ) => {
    const initializedPlayers: Player[] = playersData.map((data, index) => ({
      id: `p-${index + 1}-${Date.now()}`,
      name: data.name.trim(),
      titleBn: data.titleBn,
      titleEn: data.titleEn,
      score: 0,
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      avatar: data.avatar || '🕵️',
    }));

    setPlayers(initializedPlayers);
    setSettings({
      playerCount: initializedPlayers.length,
      imposterCount,
      totalRounds: selectedTotalRounds,
      timerSeconds,
      votingStyle,
      allowCategorySelection: true,
      selectedCategories,
    });

    setCurrentRound(1);
    setTotalRounds(selectedTotalRounds);
    setUsedWordIds([]);
    setRoundResults([]);
    setLastRoundResult(null);

    // Initialize round 1
    initRound(1, initializedPlayers, selectedCategories, imposterCount, []);
  };

  // Helper to start or advance a round
  const initRound = (
    roundNum: number,
    currentPlayers: Player[],
    categories: CategoryId[],
    numImposters: 1 | 2 | 3,
    prevUsedIds: number[]
  ) => {
    const word = pickRandomWord(prevUsedIds, categories);
    setCurrentWord(word);
    setUsedWordIds([...prevUsedIds, word.id]);

    // Preload image for citizens in the background
    preloadWordImage(word);

    // Assign random imposter(s)
    const shuffledPlayerIds = [...currentPlayers.map((p) => p.id)].sort(() => 0.5 - Math.random());
    const assignedImposters = shuffledPlayerIds.slice(0, numImposters);
    setImposterIds(assignedImposters);

    setCurrentRound(roundNum);
    setInspectingPlayerIndex(0);
    setCurrentVotes({});
    setPhase('ROLE_HANDOVER');
  };

  const handleProceedToCard = () => {
    setPhase('ROLE_REVEAL');
  };

  const handleNextPlayerCard = () => {
    if (inspectingPlayerIndex + 1 < players.length) {
      setInspectingPlayerIndex(inspectingPlayerIndex + 1);
      setPhase('ROLE_HANDOVER');
    } else {
      sound.playClick();
      // Transition to clue speaking stage before discussion
      setPhase('CLUE_SPEAKING');
    }
  };

  const handleProceedToDiscussion = () => {
    sound.playClick();
    setPhase('DISCUSSION');
  };

  const handleProceedToVoting = () => {
    setPhase('VOTING');
  };

  const handleSubmitVotes = (votes: Record<string, string>) => {
    if (!currentWord) return;

    setCurrentVotes(votes);

    const scoreDetails = calculateRoundScores({
      players,
      imposterIds,
      votes,
      word: currentWord,
      imposterGuessedWord: false,
    });

    const result: RoundResult = {
      roundNumber: currentRound,
      word: currentWord,
      imposterIds,
      votes,
      scoreDetails,
      imposterGuessedWord: false,
    };

    setLastRoundResult(result);
    setPhase('ROUND_REVEAL');
  };

  const handleProceedToScoreboard = (imposterGuessedWord: boolean) => {
    if (!currentWord) return;

    const finalScoreDetails = calculateRoundScores({
      players,
      imposterIds,
      votes: currentVotes,
      word: currentWord,
      imposterGuessedWord,
    });

    const updatedPlayers = players.map((p) => {
      const detail = finalScoreDetails.find((d) => d.playerId === p.id);
      const delta = detail?.pointsDelta ?? 0;
      return {
        ...p,
        score: p.score + delta,
      };
    });

    setPlayers(updatedPlayers);

    const finalResult: RoundResult = {
      roundNumber: currentRound,
      word: currentWord,
      imposterIds,
      votes: currentVotes,
      scoreDetails: finalScoreDetails,
      imposterGuessedWord,
    };

    setLastRoundResult(finalResult);
    setRoundResults((prev) => [...prev, finalResult]);
    setPhase('ROUND_SCOREBOARD');
  };

  const handleStartNextRound = () => {
    initRound(
      currentRound + 1,
      players,
      settings.selectedCategories,
      settings.imposterCount,
      usedWordIds
    );
  };

  const handleFinishGame = () => {
    setPhase('GAME_OVER');
  };

  const handlePlayAgainSamePlayers = () => {
    const resetPlayers = players.map((p) => ({ ...p, score: 0 }));
    setPlayers(resetPlayers);
    setCurrentRound(1);
    setUsedWordIds([]);
    setRoundResults([]);
    setLastRoundResult(null);
    initRound(1, resetPlayers, settings.selectedCategories, settings.imposterCount, []);
  };

  const handleResetToSetup = () => {
    setPhase('SETUP');
  };

  const currentPlayer = players[inspectingPlayerIndex];
  const isCurrentPlayerImposter = currentPlayer ? imposterIds.includes(currentPlayer.id) : false;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 transition-colors duration-200">
      {/* Rules & Admin Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} lang={lang} />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} lang={lang} theme={theme} />

      {/* Profile & Customization Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={(updated) => setUserProfile(updated)}
        onSignOut={handleSignOut}
        lang={lang}
        theme={theme}
      />

      {/* Auth Prompt Modal (only when user clicks Sign In) */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        canDismiss={!!userProfile}
        onAuthenticated={(prof) => {
          setUserProfile(prof);
          setIsAuthModalOpen(false);
        }}
        lang={lang}
        theme={theme}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Online Multiplayer Active Game Container */}
      {onlineRoom && onlinePlayer ? (
        <OnlineGameContainer
          initialRoom={onlineRoom}
          initialPlayer={onlinePlayer}
          lang={lang}
          theme={theme}
          onExit={() => {
            setOnlineRoom(null);
            setOnlinePlayer(null);
            setPhase('INTRO');
          }}
          onReopenOnlineModal={() => {
            setOnlineRoom(null);
            setOnlinePlayer(null);
            setPhase('INTRO');
            setIsOnlineModalOpen(true);
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      ) : (
        <>
          {/* Screen Router for Local Game */}
          {phase === 'INTRO' && (
            <IntroScreen
              onStartPassAndPlay={handleIntroStart}
              onOpenOnlineRoom={() => setIsOnlineModalOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAdmin={() => setIsAdminOpen(true)}
              onOpenSignIn={() => setIsAuthModalOpen(true)}
              onSignOut={handleSignOut}
              canAccessAdmin={canAccessAdmin}
              userProfile={userProfile}
              lang={lang}
              onToggleLang={handleToggleLang}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {/* Online Room Modal */}
          <OnlineJoinCreateModal
            isOpen={isOnlineModalOpen}
            onClose={() => setIsOnlineModalOpen(false)}
            lang={lang}
            theme={theme}
            initialRoomCode={inviteCode}
            onRoomJoined={(roomData, player) => {
              setOnlineRoom(roomData);
              setOnlinePlayer(player);
              setIsOnlineModalOpen(false);
            }}
          />

      {phase === 'SETUP' && (
        <SetupScreen
          onStartGame={handleStartGame}
          onBackToHome={() => setPhase('INTRO')}
          onOpenOnlineMode={() => {
            setPhase('INTRO');
            setIsOnlineModalOpen(true);
          }}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'ROLE_HANDOVER' && currentPlayer && (
        <RoleHandoverScreen
          player={currentPlayer}
          playerIndex={inspectingPlayerIndex}
          totalPlayers={players.length}
          roundNumber={currentRound}
          onProceedToCard={handleProceedToCard}
          onQuitToMenu={() => setPhase('INTRO')}
          lang={lang}
          theme={theme}
        />
      )}

      {phase === 'ROLE_REVEAL' && currentPlayer && currentWord && (
        <RoleCardScreen
          player={currentPlayer}
          isImposter={isCurrentPlayerImposter}
          word={currentWord}
          playerIndex={inspectingPlayerIndex}
          totalPlayers={players.length}
          onNextPlayer={handleNextPlayerCard}
          lang={lang}
          theme={theme}
        />
      )}

      {phase === 'CLUE_SPEAKING' && (
        <ClueSpeakingScreen
          players={players}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          onProceedToDiscussion={handleProceedToDiscussion}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'DISCUSSION' && currentWord && (
        <DiscussionScreen
          players={players}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          word={currentWord}
          timerSeconds={settings.timerSeconds}
          onProceedToVoting={handleProceedToVoting}
          onHome={() => setPhase('INTRO')}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'VOTING' && (
        <VotingScreen
          players={players}
          roundNumber={currentRound}
          initialVotingStyle={settings.votingStyle}
          onSubmitVotes={handleSubmitVotes}
          onHome={() => setPhase('INTRO')}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'ROUND_REVEAL' && lastRoundResult && (
        <RevealScreen
          players={players}
          roundResult={lastRoundResult}
          onProceedToScoreboard={handleProceedToScoreboard}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'ROUND_SCOREBOARD' && (
        <ScoreboardScreen
          players={players}
          currentRound={currentRound}
          totalRounds={totalRounds}
          lastRoundResult={lastRoundResult}
          onStartNextRound={handleStartNextRound}
          onFinishGame={handleFinishGame}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {phase === 'GAME_OVER' && (
        <GameOverScreen
          players={players}
          roundResults={roundResults}
          onPlayAgainSamePlayers={handlePlayAgainSamePlayers}
          onResetToSetup={handleResetToSetup}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}
    </>
  )}
  <Analytics />
</div>
  );
}
