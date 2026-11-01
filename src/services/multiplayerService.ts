import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, ensureAuthenticatedUser, handleFirestoreError, OperationType } from '../firebase';
import {
  OnlineRoomData,
  OnlinePlayer,
  PrivatePlayerRole,
  RoomSettings,
  OnlineVote,
  OnlineGamePhase,
} from '../types/multiplayer';
import { WordItem, CategoryId } from '../types/game';
import { pickRandomWord, ALL_WORDS } from '../data/words';
import { calculateRoundScores } from '../utils/scoring';
import { generatePlayerTitles, SCENE_PACKS } from '../data/titles';

const ROOM_CODE_CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

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

export function generateRandomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARACTERS.length);
    code += ROOM_CODE_CHARACTERS[randomIndex];
  }
  return code;
}

export const DEFAULT_ONLINE_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  imposterCount: 1,
  discussionTimer: 90,
  votingTimer: 45,
  language: 'mixed',
  selectedCategories: ['food', 'people', 'object', 'animal'],
  imposterFinalGuess: true,
  totalRounds: 3,
};

// Create a new room
export async function createOnlineRoom(
  playerName: string,
  playerAvatar: string = '🕵️'
): Promise<{ roomCode: string; player: OnlinePlayer }> {
  const user = await ensureAuthenticatedUser();
  const roomCode = generateRandomCode();
  const roomRef = doc(db, 'rooms', roomCode);

  const initialSettings = { ...DEFAULT_ONLINE_SETTINGS };

  const initialRoom: OnlineRoomData = {
    roomCode,
    hostId: user.uid,
    status: 'waiting',
    currentPhase: 'LOBBY',
    currentRound: 1,
    totalRounds: initialSettings.totalRounds,
    playerCount: 1,
    settings: initialSettings,
    phaseEndsAt: null,
    usedWordIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const initialPlayer: OnlinePlayer = {
    id: user.uid,
    name: playerName.trim() || 'Host',
    avatar: playerAvatar,
    avatarColor: AVATAR_COLORS[0],
    titleBn: 'প্রধান অনুসন্ধানকারী',
    titleEn: 'Lead Investigator',
    isReady: true, // Host is ready by default
    isHost: true,
    score: 0,
    hasVoted: false,
    connectionStatus: 'online',
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(roomRef, initialRoom);
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
    batch.set(playerRef, initialPlayer);
    await batch.commit();

    return { roomCode, player: initialPlayer };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomCode}`);
    throw error;
  }
}

// Join an existing room
export async function joinOnlineRoom(
  roomCodeInput: string,
  playerName: string,
  playerAvatar: string = '🕵️'
): Promise<{ roomData: OnlineRoomData; player: OnlinePlayer }> {
  const user = await ensureAuthenticatedUser();
  const roomCode = roomCodeInput.trim().toUpperCase();

  if (roomCode.length !== 6) {
    throw new Error('রুম কোডটি অবশ্যই ৬ অক্ষরের হতে হবে (Room code must be 6 characters)');
  }

  const roomRef = doc(db, 'rooms', roomCode);
  let roomSnap;
  try {
    roomSnap = await getDoc(roomRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `rooms/${roomCode}`);
    throw err;
  }

  if (!roomSnap.exists()) {
    throw new Error('এই কোডের কোন রুম খুঁজে পাওয়া যায়নি (Room not found)');
  }

  const roomData = roomSnap.data() as OnlineRoomData;

  // Fetch current players
  const playersColl = collection(db, 'rooms', roomCode, 'players');
  const playersSnap = await getDocs(playersColl);
  const existingPlayers = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  // Check if player is already in this room (reconnection)
  const existingSelf = existingPlayers.find((p) => p.id === user.uid);
  if (existingSelf) {
    // Player is reconnecting! Update connection status
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
    await updateDoc(playerRef, {
      connectionStatus: 'online',
      lastSeenAt: Date.now(),
    });
    return {
      roomData,
      player: { ...existingSelf, connectionStatus: 'online' },
    };
  }

  // If game is in progress or ended, reject new players
  if (roomData.status !== 'waiting') {
    throw new Error('খেলাটি ইতিমধ্যে শুরু হয়ে গেছে (Game is already in progress)');
  }

  if (existingPlayers.length >= (roomData.settings.maxPlayers || 10)) {
    throw new Error('রুমটিতে খেলোয়াড়ের সর্বোচ্চ সীমা পূর্ণ (Room is full)');
  }

  // Handle duplicate names gracefully
  let finalName = playerName.trim() || `Player ${existingPlayers.length + 1}`;
  if (existingPlayers.some((p) => p.name.toLowerCase() === finalName.toLowerCase())) {
    finalName = `${finalName} (${existingPlayers.length + 1})`;
  }

  const colorIndex = existingPlayers.length % AVATAR_COLORS.length;
  const titles = generatePlayerTitles(existingPlayers.length + 1, SCENE_PACKS[0].id).titles;
  const assignedTitle = titles[existingPlayers.length] || { bn: 'নাগরিক', en: 'Citizen' };

  const newPlayer: OnlinePlayer = {
    id: user.uid,
    name: finalName,
    avatar: playerAvatar,
    avatarColor: AVATAR_COLORS[colorIndex],
    titleBn: assignedTitle.bn,
    titleEn: assignedTitle.en,
    isReady: false,
    isHost: false,
    score: 0,
    hasVoted: false,
    connectionStatus: 'online',
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  try {
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
    await setDoc(playerRef, newPlayer);
    await updateDoc(roomRef, {
      playerCount: existingPlayers.length + 1,
      updatedAt: Date.now(),
    });

    return { roomData, player: newPlayer };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomCode}/players/${user.uid}`);
    throw error;
  }
}

// Update player display name or avatar
export async function updateOnlinePlayerProfile(
  roomCode: string,
  name: string,
  avatar?: string
) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  const updates: Record<string, any> = {
    name: name.trim().slice(0, 24),
    lastSeenAt: Date.now(),
  };
  if (avatar) {
    updates.avatar = avatar;
  }

  try {
    await updateDoc(playerRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}/players/${user.uid}`);
  }
}

// Toggle ready status
export async function togglePlayerReady(roomCode: string, isReady: boolean) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  try {
    await updateDoc(playerRef, {
      isReady,
      lastSeenAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}/players/${user.uid}`);
  }
}

// Host updates room settings
export async function updateOnlineRoomSettings(
  roomCode: string,
  settings: Partial<RoomSettings>
) {
  const roomRef = doc(db, 'rooms', roomCode);
  try {
    await updateDoc(roomRef, {
      settings,
      totalRounds: settings.totalRounds ?? DEFAULT_ONLINE_SETTINGS.totalRounds,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}`);
  }
}

// Kick player (host only)
export async function kickOnlinePlayer(roomCode: string, targetPlayerId: string) {
  const playerRef = doc(db, 'rooms', roomCode, 'players', targetPlayerId);
  try {
    await deleteDoc(playerRef);
    const roomRef = doc(db, 'rooms', roomCode);
    const playersSnap = await getDocs(collection(db, 'rooms', roomCode, 'players'));
    await updateDoc(roomRef, {
      playerCount: playersSnap.size,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `rooms/${roomCode}/players/${targetPlayerId}`);
  }
}

// Leave room
export async function leaveOnlineRoom(roomCode: string) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  const roomRef = doc(db, 'rooms', roomCode);

  try {
    await deleteDoc(playerRef);
    const playersSnap = await getDocs(collection(db, 'rooms', roomCode, 'players'));
    const remainingPlayers = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

    if (remainingPlayers.length === 0) {
      // Delete room if empty
      await deleteDoc(roomRef);
    } else {
      // If leaving player was host, transfer host to next player
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as OnlineRoomData;
        if (roomData.hostId === user.uid) {
          const nextHost = remainingPlayers[0];
          await updateDoc(roomRef, {
            hostId: nextHost.id,
            playerCount: remainingPlayers.length,
            updatedAt: Date.now(),
          });
          const nextHostRef = doc(db, 'rooms', roomCode, 'players', nextHost.id);
          await updateDoc(nextHostRef, { isHost: true });
        } else {
          await updateDoc(roomRef, {
            playerCount: remainingPlayers.length,
            updatedAt: Date.now(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error leaving room:', error);
  }
}

// Host starts the online game
export async function startOnlineRound(roomCode: string, roundNumber: number = 1) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const playersSnap = await getDocs(collection(db, 'rooms', roomCode, 'players'));
  const players = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  if (players.length < 4) {
    throw new Error('খেলা শুরু করতে কমপক্ষে ৪ জন খেলোয়াড় প্রয়োজন (Minimum 4 players required to start)');
  }

  // Pick random word
  const categories = roomData.settings.selectedCategories || ['food', 'people', 'object', 'animal'];
  const prevUsedIds = roomData.usedWordIds || [];
  const word = pickRandomWord(prevUsedIds, categories);

  // Assign imposter(s)
  const imposterCount = Math.min(roomData.settings.imposterCount || 1, players.length <= 4 ? 1 : 2);
  const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
  const assignedImposterIds = shuffledPlayers.slice(0, imposterCount).map((p) => p.id);

  // Batch write private role cards
  const batch = writeBatch(db);

  players.forEach((p) => {
    const isImposter = assignedImposterIds.includes(p.id);
    const privateRef = doc(db, 'rooms', roomCode, 'private', p.id);

    if (isImposter) {
      // Imposter DOES NOT receive the secret word! Only the hint and category!
      const imposterData: PrivatePlayerRole = {
        playerId: p.id,
        role: 'imposter',
        hintBn: word.hintBn,
        hintEn: word.hintEn,
        shortHintBn: word.shortHintBn,
        shortHintEn: word.shortHintEn,
        category: word.category,
      };
      batch.set(privateRef, imposterData);
    } else {
      // Innocents receive the secret word
      const innocentData: PrivatePlayerRole = {
        playerId: p.id,
        role: 'innocent',
        wordBn: word.wordBn,
        wordEn: word.wordEn,
        hintBn: word.hintBn,
        hintEn: word.hintEn,
        category: word.category,
      };
      batch.set(privateRef, innocentData);
    }

    // Reset player round flags
    const playerRef = doc(db, 'rooms', roomCode, 'players', p.id);
    batch.update(playerRef, {
      hasVoted: false,
      clue: '',
    });
  });

  // Delete previous votes if any
  const votesSnap = await getDocs(collection(db, 'rooms', roomCode, 'votes'));
  votesSnap.docs.forEach((vDoc) => {
    batch.delete(vDoc.ref);
  });

  // Update room status and state
  batch.update(roomRef, {
    status: 'in_progress',
    currentPhase: 'ROLE_REVEAL',
    currentRound: roundNumber,
    currentWordCategory: word.category,
    phaseEndsAt: null,
    usedWordIds: [...prevUsedIds, word.id],
    winner: null,
    eliminatedPlayerId: null,
    imposterGuessedWord: false,
    imposterGuessAnswer: null,
    // Store secretly on backend until reveal phase
    revealedWord: word,
    revealedImposterIds: assignedImposterIds,
    revealedVotes: {},
    scoreDetails: [],
    updatedAt: Date.now(),
  });

  await batch.commit();
}

// Advance phase
export async function setOnlineRoomPhase(
  roomCode: string,
  phase: OnlineGamePhase,
  durationSeconds: number = 0
) {
  const roomRef = doc(db, 'rooms', roomCode);
  const phaseEndsAt = durationSeconds > 0 ? Date.now() + durationSeconds * 1000 : null;

  try {
    await updateDoc(roomRef, {
      currentPhase: phase,
      phaseEndsAt,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}`);
  }
}

// Submit a clue
export async function submitOnlineClue(roomCode: string, clueText: string) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  try {
    await updateDoc(playerRef, {
      clue: clueText.trim().slice(0, 80),
      lastSeenAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}/players/${user.uid}`);
  }
}

// Cast a vote
export async function castOnlineVote(roomCode: string, suspectId: string) {
  const user = auth.currentUser;
  if (!user) return;

  if (user.uid === suspectId) {
    throw new Error('নিজেকে ভোট দেওয়া যাবে না (Cannot vote for yourself)');
  }

  const voteRef = doc(db, 'rooms', roomCode, 'votes', user.uid);
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);

  const voteData: OnlineVote = {
    voterId: user.uid,
    suspectId,
    timestamp: Date.now(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(voteRef, voteData);
    batch.update(playerRef, { hasVoted: true, lastSeenAt: Date.now() });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomCode}/votes/${user.uid}`);
  }
}

// Resolve voting results
export async function resolveOnlineVotingResults(roomCode: string) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const playersSnap = await getDocs(collection(db, 'rooms', roomCode, 'players'));
  const players = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  const votesSnap = await getDocs(collection(db, 'rooms', roomCode, 'votes'));
  const votesMap: Record<string, string> = {};
  votesSnap.docs.forEach((d) => {
    const v = d.data() as OnlineVote;
    votesMap[v.voterId] = v.suspectId;
  });

  const secretWord = roomData.revealedWord;
  const imposterIds = roomData.revealedImposterIds || [];

  if (!secretWord) return;

  // Calculate vote count per player
  const voteTally: Record<string, number> = {};
  players.forEach((p) => {
    voteTally[p.id] = 0;
  });
  Object.values(votesMap).forEach((suspectId) => {
    if (voteTally[suspectId] !== undefined) {
      voteTally[suspectId]++;
    }
  });

  // Find player(s) with highest votes
  let maxVotes = -1;
  let suspectsWithMaxVotes: string[] = [];
  Object.entries(voteTally).forEach(([pId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      suspectsWithMaxVotes = [pId];
    } else if (count === maxVotes && count > 0) {
      suspectsWithMaxVotes.push(pId);
    }
  });

  const isTie = suspectsWithMaxVotes.length > 1;
  const eliminatedId = !isTie && suspectsWithMaxVotes.length === 1 ? suspectsWithMaxVotes[0] : null;

  // Calculate scores using existing scoring logic
  const legacyPlayers = players.map((p) => ({
    id: p.id,
    name: p.name,
    titleBn: p.titleBn,
    titleEn: p.titleEn,
    score: p.score,
    avatarColor: p.avatarColor,
    avatar: p.avatar,
  }));

  const scoreDetails = calculateRoundScores({
    players: legacyPlayers,
    imposterIds,
    votes: votesMap,
    word: secretWord,
    imposterGuessedWord: false,
  });

  // Check if eliminated player is an imposter
  const caughtImposter = eliminatedId && imposterIds.includes(eliminatedId);

  // If imposter caught and imposterFinalGuess is enabled, go to IMPOSTER_GUESS
  const shouldGuess = caughtImposter && roomData.settings.imposterFinalGuess;

  const batch = writeBatch(db);

  // Update players' scores
  scoreDetails.forEach((detail) => {
    const pRef = doc(db, 'rooms', roomCode, 'players', detail.playerId);
    const existingP = players.find((p) => p.id === detail.playerId);
    const newScore = Math.max(0, (existingP?.score || 0) + detail.pointsDelta);
    batch.update(pRef, { score: newScore });
  });

  const nextPhase: OnlineGamePhase = shouldGuess ? 'IMPOSTER_GUESS' : 'RESULT';
  const initialWinner = caughtImposter ? 'innocents' : 'imposter';

  batch.update(roomRef, {
    currentPhase: nextPhase,
    phaseEndsAt: shouldGuess ? Date.now() + 45000 : null,
    eliminatedPlayerId: eliminatedId,
    revealedVotes: votesMap,
    scoreDetails,
    winner: shouldGuess ? null : initialWinner,
    updatedAt: Date.now(),
  });

  await batch.commit();
}

// Imposter final guess
export async function submitOnlineImposterGuess(
  roomCode: string,
  guess: string
) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const secretWord = roomData.revealedWord;
  if (!secretWord) return;

  const cleanGuess = guess.trim().toLowerCase();
  const wordBnClean = secretWord.wordBn.trim().toLowerCase();
  const wordEnClean = secretWord.wordEn.trim().toLowerCase();

  const isCorrect = cleanGuess === wordBnClean || cleanGuess === wordEnClean;

  // If correct, Imposter steals the win! Update scores
  const batch = writeBatch(db);
  if (isCorrect && roomData.scoreDetails) {
    const imposterIds = roomData.revealedImposterIds || [];
    imposterIds.forEach((impId) => {
      const pRef = doc(db, 'rooms', roomCode, 'players', impId);
      // Give imposter extra +3 points
      const existingDetail = roomData.scoreDetails?.find((d) => d.playerId === impId);
      if (existingDetail) {
        batch.update(pRef, {
          score: (existingDetail.votesReceived || 0) + 3,
        });
      }
    });
  }

  batch.update(roomRef, {
    currentPhase: 'RESULT',
    imposterGuessedWord: isCorrect,
    imposterGuessAnswer: guess.trim(),
    winner: isCorrect ? 'imposter' : 'innocents',
    phaseEndsAt: null,
    updatedAt: Date.now(),
  });

  await batch.commit();
}

// Generate 4 multiple choice options for imposter guess
export function generateGuessChoices(correctWord: WordItem, category: CategoryId): WordItem[] {
  const categoryPool = ALL_WORDS.filter((w) => w.category === category && w.id !== correctWord.id);
  const shuffled = [...categoryPool].sort(() => 0.5 - Math.random()).slice(0, 3);
  const choices = [correctWord, ...shuffled].sort(() => 0.5 - Math.random());
  return choices;
}

// Subscriptions
export function subscribeToOnlineRoom(
  roomCode: string,
  onUpdate: (data: OnlineRoomData | null) => void,
  onError?: (err: unknown) => void
) {
  const roomRef = doc(db, 'rooms', roomCode);
  return onSnapshot(
    roomRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as OnlineRoomData);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomCode}`);
      if (onError) onError(error);
    }
  );
}

export function subscribeToOnlinePlayers(
  roomCode: string,
  onUpdate: (players: OnlinePlayer[]) => void,
  onError?: (err: unknown) => void
) {
  const playersColl = collection(db, 'rooms', roomCode, 'players');
  return onSnapshot(
    playersColl,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as OnlinePlayer);
      // Sort by joinedAt so order remains consistent
      list.sort((a, b) => a.joinedAt - b.joinedAt);
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomCode}/players`);
      if (onError) onError(error);
    }
  );
}

export function subscribeToOnlinePrivateRole(
  roomCode: string,
  playerId: string,
  onUpdate: (roleData: PrivatePlayerRole | null) => void,
  onError?: (err: unknown) => void
) {
  const privateRef = doc(db, 'rooms', roomCode, 'private', playerId);
  return onSnapshot(
    privateRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as PrivatePlayerRole);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomCode}/private/${playerId}`);
      if (onError) onError(error);
    }
  );
}

export function subscribeToOnlineVotes(
  roomCode: string,
  onUpdate: (votes: OnlineVote[]) => void,
  onError?: (err: unknown) => void
) {
  const votesColl = collection(db, 'rooms', roomCode, 'votes');
  return onSnapshot(
    votesColl,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as OnlineVote);
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomCode}/votes`);
      if (onError) onError(error);
    }
  );
}
