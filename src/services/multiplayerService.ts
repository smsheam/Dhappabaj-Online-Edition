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
  DocumentReference,
  DocumentSnapshot,
  Query,
  CollectionReference,
  QuerySnapshot,
  enableNetwork,
} from 'firebase/firestore';
import { db, auth, ensureAuthenticatedUser, handleFirestoreError, OperationType } from '../firebase';
import { logProductionEvent } from '../utils/productionDiagnostics';

// Timeout helper to prevent infinite hanging on mobile or unstable networks
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 7000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Helper to safely execute getDoc with automatic retry and network reconnection
export async function safeGetDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  let attempts = 0;
  while (attempts < 2) {
    try {
      return await withTimeout(getDoc(docRef), 6000);
    } catch (err: any) {
      attempts++;
      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable') ||
        err?.message?.includes('timed out');

      if (isOffline && attempts < 2) {
        try {
          await enableNetwork(db);
          await new Promise((r) => setTimeout(r, 200));
          continue;
        } catch {
          // Continue to next attempt
        }
      }
      if (attempts >= 2) {
        throw err;
      }
    }
  }
  return await withTimeout(getDoc(docRef), 6000);
}

// Helper to safely execute getDocs with automatic retry and network reconnection
export async function safeGetDocs(queryRef: Query | CollectionReference): Promise<QuerySnapshot> {
  let attempts = 0;
  while (attempts < 2) {
    try {
      return await withTimeout(getDocs(queryRef), 7000);
    } catch (err: any) {
      attempts++;
      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable') ||
        err?.message?.includes('timed out');

      if (isOffline && attempts < 2) {
        try {
          await enableNetwork(db);
          await new Promise((r) => setTimeout(r, 200));
          continue;
        } catch {
          // Continue to next attempt
        }
      }
      if (attempts >= 2) {
        throw err;
      }
    }
  }
  return await withTimeout(getDocs(queryRef), 7000);
}
import {
  OnlineRoomData,
  OnlinePlayer,
  PrivatePlayerRole,
  RoomSettings,
  OnlineVote,
  OnlineGamePhase,
  ChatMessage,
  RoomClosedReason,
} from '../types/multiplayer';
import { WordItem, CategoryId } from '../types/game';
import { pickRandomWord, ALL_WORDS } from '../data/words';
import { calculateRoundScores } from '../utils/scoring';
import { generatePlayerTitles, SCENE_PACKS } from '../data/titles';

const ROOM_CODE_CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

// Inactivity limits
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
export const HOST_DISCONNECT_GRACE_MS = 60 * 1000; // 60 seconds grace period

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

export function generateSessionToken(prefix: string = 'st'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// Recursively strips or converts undefined fields so Firestore never throws 'Unsupported field value: undefined'
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as unknown as T;
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
  );
}

export const DEFAULT_ONLINE_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  imposterCount: 1,
  clueTimer: 30,
  discussionTimer: 90,
  votingTimer: 30,
  language: 'mixed',
  selectedCategories: ['food', 'people', 'object', 'animal'],
  imposterFinalGuess: true,
  totalRounds: 3,
};

// 1. Create a new room with collision avoidance & session tokens
export async function createOnlineRoom(
  playerName: string,
  playerAvatar: string = '🕵️'
): Promise<{ roomCode: string; player: OnlinePlayer; roomData: OnlineRoomData }> {
  logProductionEvent('CreateRoom: Initiated by user', { playerName, playerAvatar });
  const user = await ensureAuthenticatedUser();
  logProductionEvent('CreateRoom: Authenticated host status verified', {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
  });

  // Fire-and-forget cleanup of any previously active room created by this host in current browser session
  const previousRoomCode = sessionStorage.getItem('dhappabaj_active_room');
  if (previousRoomCode) {
    // Non-blocking background cleanup: never await or stall creating a new room
    updateDoc(doc(db, 'rooms', previousRoomCode), {
      status: 'CLOSED',
      closedReason: 'host_left',
      updatedAt: Date.now(),
    }).catch(() => {});
    sessionStorage.removeItem(`dhappabaj_host_token_${previousRoomCode}`);
    sessionStorage.removeItem('dhappabaj_active_room');
  }

  // Generate unique 6-char alphanumeric room code (1,073,741,824 possible combinations)
  const roomCode = generateRandomCode();
  logProductionEvent('CreateRoom: Room ID generated', { roomCode });

  const roomRef = doc(db, 'rooms', roomCode);
  const hostSessionToken = generateSessionToken('hst');
  const now = Date.now();

  const initialSettings = { ...DEFAULT_ONLINE_SETTINGS };

  const initialRoom: OnlineRoomData = {
    roomCode,
    hostId: user.uid,
    hostSessionToken,
    status: 'WAITING',
    closedReason: null,
    currentPhase: 'LOBBY',
    currentRound: 1,
    totalRounds: initialSettings.totalRounds,
    playerCount: 1,
    settings: initialSettings,
    phaseEndsAt: null,
    usedWordIds: [],
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    hostDisconnectedAt: null,
  };

  const initialPlayer: OnlinePlayer = {
    id: user.uid,
    sessionToken: hostSessionToken,
    name: playerName.trim() || 'Host',
    avatar: playerAvatar,
    avatarColor: AVATAR_COLORS[0],
    titleBn: 'প্রধান অনুসন্ধানকারী',
    titleEn: 'Lead Investigator',
    isReady: true, // Host is ready by default
    isHost: true,
    score: 0,
    hasVoted: false,
    hasSeenCard: false,
    connectionStatus: 'online',
    joinedAt: now,
    lastSeenAt: now,
  };

  try {
    const batch = writeBatch(db);
    batch.set(roomRef, sanitizeForFirestore(initialRoom));
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
    batch.set(playerRef, sanitizeForFirestore(initialPlayer));
    await withTimeout(batch.commit(), 8000);

    logProductionEvent('CreateRoom: Database commit successful', { roomCode, hostId: user.uid });

    // Store session tokens locally
    sessionStorage.setItem(`dhappabaj_host_token_${roomCode}`, hostSessionToken);
    sessionStorage.setItem('dhappabaj_active_room', roomCode);
    sessionStorage.setItem('dhappabaj_player_id', user.uid);

    logProductionEvent('CreateRoom: Final response ready', { roomCode });
    return { roomCode, player: initialPlayer, roomData: initialRoom };
  } catch (error: any) {
    logProductionEvent('CreateRoom: Batch write failed, checking for retry', {
      roomCode,
      error: error?.message || error,
    });

    const isOffline =
      error?.message?.includes('offline') ||
      error?.code === 'unavailable' ||
      error?.message?.includes('unavailable') ||
      error?.message?.includes('timed out');

    if (isOffline) {
      try {
        await enableNetwork(db);
        await new Promise((r) => setTimeout(r, 300));
        const retryBatch = writeBatch(db);
        retryBatch.set(roomRef, sanitizeForFirestore(initialRoom));
        const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
        retryBatch.set(playerRef, sanitizeForFirestore(initialPlayer));
        await withTimeout(retryBatch.commit(), 8000);

        logProductionEvent('CreateRoom: Retry commit succeeded', { roomCode });
        sessionStorage.setItem(`dhappabaj_host_token_${roomCode}`, hostSessionToken);
        sessionStorage.setItem('dhappabaj_active_room', roomCode);
        sessionStorage.setItem('dhappabaj_player_id', user.uid);

        return { roomCode, player: initialPlayer, roomData: initialRoom };
      } catch (retryErr) {
        logProductionEvent('CreateRoom: Retry failed', { roomCode, error: retryErr });
        handleFirestoreError(retryErr, OperationType.CREATE, `rooms/${roomCode}`);
        throw retryErr;
      }
    }
    logProductionEvent('CreateRoom: Unrecoverable error', { roomCode, error });
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomCode}`);
    throw error;
  }
}

// 2. Join an existing room with validation, closed/expired rejection & reconnection
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
    roomSnap = await safeGetDoc(roomRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `rooms/${roomCode}`);
    throw err;
  }

  if (!roomSnap.exists()) {
    throw new Error('এই কোডের কোন রুম খুঁজে পাওয়া যায়নি (Room not found)');
  }

  const roomData = roomSnap.data() as OnlineRoomData;
  const now = Date.now();

  // Strict check: Status must not be CLOSED or EXPIRED
  const isClosedStatus =
    roomData.status === 'CLOSED' ||
    roomData.status === 'EXPIRED' ||
    (roomData.status as string) === 'closed' ||
    (roomData.status as string) === 'expired' ||
    (roomData.status as string) === 'ended';

  if (isClosedStatus) {
    throw new Error('এই রুমটি আর চালু নেই। নতুন একটি রুমে যোগ দিন।');
  }

  // Check 5-minute inactivity timeout
  const lastActive = roomData.lastActivityAt || roomData.updatedAt || roomData.createdAt || 0;
  if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
    try {
      await updateDoc(roomRef, {
        status: 'EXPIRED',
        closedReason: 'inactivity_timeout',
        updatedAt: now,
      });
    } catch {
      // Ignore update error on expired check
    }
    throw new Error('এই রুমটি আর চালু নেই। নতুন একটি রুমে যোগ দিন।');
  }

  // Fetch current players
  const playersColl = collection(db, 'rooms', roomCode, 'players');
  const playersSnap = await safeGetDocs(playersColl);
  const existingPlayers = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  // Check if player is already in this room (reconnection)
  const existingSelf = existingPlayers.find((p) => p.id === user.uid);
  if (existingSelf) {
    const isHost = existingSelf.isHost || user.uid === roomData.hostId;
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);

    const playerUpdates: Record<string, any> = {
      connectionStatus: 'online',
      lastSeenAt: now,
    };

    const roomUpdates: Record<string, any> = {
      lastActivityAt: now,
      updatedAt: now,
    };

    // If host is reconnecting, clear disconnection window
    if (isHost && roomData.hostDisconnectedAt) {
      roomUpdates.hostDisconnectedAt = null;
    }

    try {
      const batch = writeBatch(db);
      batch.update(playerRef, playerUpdates);
      batch.update(roomRef, roomUpdates);
      await batch.commit();

      sessionStorage.setItem('dhappabaj_active_room', roomCode);
      sessionStorage.setItem('dhappabaj_player_id', user.uid);

      return {
        roomData: { ...roomData, ...roomUpdates },
        player: { ...existingSelf, connectionStatus: 'online', lastSeenAt: now },
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomCode}`);
      throw err;
    }
  }

  // If game is in progress or ended, reject brand-new players
  const isWaiting = roomData.status === 'WAITING' || (roomData.status as string) === 'waiting';
  if (!isWaiting) {
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
  const playerSessionToken = generateSessionToken('pst');

  const newPlayer: OnlinePlayer = {
    id: user.uid,
    sessionToken: playerSessionToken,
    name: finalName,
    avatar: playerAvatar,
    avatarColor: AVATAR_COLORS[colorIndex],
    titleBn: assignedTitle.bn,
    titleEn: assignedTitle.en,
    isReady: false,
    isHost: false,
    score: 0,
    hasVoted: false,
    hasSeenCard: false,
    connectionStatus: 'online',
    joinedAt: now,
    lastSeenAt: now,
  };

  try {
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
    const batch = writeBatch(db);
    batch.set(playerRef, sanitizeForFirestore(newPlayer));
    batch.update(roomRef, {
      playerCount: existingPlayers.length + 1,
      lastActivityAt: now,
      updatedAt: now,
    });
    await batch.commit();

    sessionStorage.setItem('dhappabaj_active_room', roomCode);
    sessionStorage.setItem('dhappabaj_player_id', user.uid);
    sessionStorage.setItem(`dhappabaj_player_token_${roomCode}`, playerSessionToken);

    return {
      roomData: {
        ...roomData,
        playerCount: existingPlayers.length + 1,
        lastActivityAt: now,
        updatedAt: now,
      },
      player: newPlayer,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomCode}/players/${user.uid}`);
    throw error;
  }
}

// 3. Close room explicitly (authoritative)
export async function closeOnlineRoom(roomCode: string, reason: RoomClosedReason = 'host_left') {
  try {
    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      status: 'CLOSED',
      closedReason: reason,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error closing room:', error);
  } finally {
    sessionStorage.removeItem(`dhappabaj_host_token_${roomCode}`);
    sessionStorage.removeItem('dhappabaj_active_room');
  }
}

// 4. Leave room with automatic closure on host leave or empty room
export async function leaveOnlineRoom(roomCode: string) {
  const user = auth.currentUser;
  if (!user) return;

  const roomRef = doc(db, 'rooms', roomCode);
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);

  try {
    const roomSnap = await safeGetDoc(roomRef);
    if (!roomSnap.exists()) {
      sessionStorage.removeItem('dhappabaj_active_room');
      return;
    }

    const roomData = roomSnap.data() as OnlineRoomData;
    const isHost = roomData.hostId === user.uid;

    if (isHost) {
      // RULE: When host intentionally exits the lobby or active game -> room status changes to CLOSED immediately!
      await updateDoc(roomRef, {
        status: 'CLOSED',
        closedReason: 'host_left',
        updatedAt: Date.now(),
      });
      try {
        await deleteDoc(playerRef);
      } catch {
        // Best effort
      }
    } else {
      // Ordinary player leaving
      await deleteDoc(playerRef);

      const playersSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'players'));
      const remainingPlayers = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

      if (remainingPlayers.length === 0) {
        // RULE: If all players leave a room -> room status changes to CLOSED immediately!
        await updateDoc(roomRef, {
          status: 'CLOSED',
          closedReason: 'empty_room',
          playerCount: 0,
          updatedAt: Date.now(),
        });
      } else {
        await updateDoc(roomRef, {
          playerCount: remainingPlayers.length,
          lastActivityAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  } catch (error) {
    console.error('Error leaving room:', error);
  } finally {
    sessionStorage.removeItem(`dhappabaj_host_token_${roomCode}`);
    sessionStorage.removeItem('dhappabaj_active_room');
  }
}

// 5. Host disconnect notification & 30s grace window
export async function setHostDisconnected(roomCode: string, isDisconnected: boolean) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const roomRef = doc(db, 'rooms', roomCode);
    const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);

    const now = Date.now();
    if (isDisconnected) {
      await updateDoc(roomRef, {
        hostDisconnectedAt: now,
        updatedAt: now,
      });
      await updateDoc(playerRef, {
        connectionStatus: 'offline',
        lastSeenAt: now,
      });
    } else {
      await updateDoc(roomRef, {
        hostDisconnectedAt: null,
        lastActivityAt: now,
        updatedAt: now,
      });
      await updateDoc(playerRef, {
        connectionStatus: 'online',
        lastSeenAt: now,
      });
    }
  } catch (err) {
    console.error('Error updating host connection status:', err);
  }
}

// 6. Ordinary player heartbeat & connection updates
export async function sendPlayerHeartbeat(
  roomCode: string,
  isHost: boolean,
  name?: string,
  avatar?: string
) {
  const user = auth.currentUser;
  if (!user) return;

  const now = Date.now();
  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  const roomRef = doc(db, 'rooms', roomCode);

  const updates: Record<string, any> = {
    connectionStatus: 'online',
    lastSeenAt: now,
  };
  if (name) updates.name = name.trim().slice(0, 24);
  if (avatar) updates.avatar = avatar;

  try {
    await updateDoc(playerRef, updates);
    // Touch room activity
    const roomUpdates: Record<string, any> = {
      lastActivityAt: now,
    };
    if (isHost) {
      roomUpdates.hostDisconnectedAt = null;
    }
    await updateDoc(roomRef, roomUpdates);
  } catch (error) {
    // Non-critical background heartbeat
  }
}

// 7. Check if room is expired or host disconnected past 30s grace period
export async function checkAndExpireRoomIfNeeded(
  roomCode: string,
  roomData: OnlineRoomData
): Promise<boolean> {
  const now = Date.now();
  const isAlreadyClosed =
    roomData.status === 'CLOSED' ||
    roomData.status === 'EXPIRED' ||
    (roomData.status as string) === 'closed' ||
    (roomData.status as string) === 'expired';

  if (isAlreadyClosed) return true;

  const roomRef = doc(db, 'rooms', roomCode);

  // Check 1: Host disconnected for > grace period (only active during PLAYING, not in LOBBY/WAITING)
  const isPlaying = roomData.status === 'PLAYING' || (roomData.status as string) === 'playing';
  if (isPlaying && roomData.hostDisconnectedAt && now - roomData.hostDisconnectedAt > HOST_DISCONNECT_GRACE_MS) {
    try {
      await updateDoc(roomRef, {
        status: 'CLOSED',
        closedReason: 'host_disconnected',
        updatedAt: now,
      });
      return true;
    } catch {
      return false;
    }
  }

  // Check 2: Inactivity timeout (15 mins in lobby/waiting, 10 mins during active game)
  const maxInactivity = !isPlaying ? 15 * 60 * 1000 : INACTIVITY_TIMEOUT_MS;
  const lastActive = roomData.lastActivityAt || roomData.updatedAt || roomData.createdAt || 0;
  if (now - lastActive > maxInactivity) {
    try {
      await updateDoc(roomRef, {
        status: 'EXPIRED',
        closedReason: 'inactivity_timeout',
        updatedAt: now,
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
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
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  const updates: Record<string, any> = {
    name: name.trim().slice(0, 24),
    lastSeenAt: now,
  };
  if (avatar) {
    updates.avatar = avatar;
  }

  try {
    await updateDoc(playerRef, updates);
    await updateDoc(roomRef, { lastActivityAt: now });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}/players/${user.uid}`);
  }
}

// Toggle ready status
export async function togglePlayerReady(roomCode: string, isReady: boolean) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  try {
    await updateDoc(playerRef, {
      isReady,
      lastSeenAt: now,
    });
    await updateDoc(roomRef, { lastActivityAt: now });
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
  const now = Date.now();
  try {
    await updateDoc(roomRef, {
      settings,
      totalRounds: settings.totalRounds ?? DEFAULT_ONLINE_SETTINGS.totalRounds,
      lastActivityAt: now,
      updatedAt: now,
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
    const playersSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'players'));
    await updateDoc(roomRef, {
      playerCount: playersSnap.size,
      lastActivityAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `rooms/${roomCode}/players/${targetPlayerId}`);
  }
}

// Host starts the online game
export async function startOnlineRound(roomCode: string, roundNumber: number = 1) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await safeGetDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const playersSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'players'));
  const players = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  if (players.length < 3) {
    throw new Error('খেলা শুরু করতে কমপক্ষে ৩ জন খেলোয়াড় প্রয়োজন (Minimum 3 players required to start)');
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
        hintBn: word.hintBn || '',
        hintEn: word.hintEn || '',
        shortHintBn: word.shortHintBn || word.hintBn || '',
        shortHintEn: word.shortHintEn || word.hintEn || '',
        category: word.category,
      };
      batch.set(privateRef, sanitizeForFirestore(imposterData));
    } else {
      // Innocents receive the secret word
      const innocentData: PrivatePlayerRole = {
        playerId: p.id,
        role: 'innocent',
        wordBn: word.wordBn || '',
        wordEn: word.wordEn || '',
        hintBn: word.hintBn || '',
        hintEn: word.hintEn || '',
        shortHintBn: word.shortHintBn || word.hintBn || '',
        shortHintEn: word.shortHintEn || word.hintEn || '',
        category: word.category,
      };
      batch.set(privateRef, sanitizeForFirestore(innocentData));
    }

    // Reset player round flags
    const playerRef = doc(db, 'rooms', roomCode, 'players', p.id);
    batch.update(playerRef, {
      hasVoted: false,
      clue: '',
      hasSeenCard: false,
    });
  });

  // Delete previous votes if any
  const votesSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'votes'));
  votesSnap.docs.forEach((vDoc) => {
    batch.delete(vDoc.ref);
  });

  // Delete previous messages if any
  const msgsSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'messages'));
  msgsSnap.docs.forEach((mDoc) => {
    batch.delete(mDoc.ref);
  });

  const now = Date.now();

  // Update room status and state
  batch.update(roomRef, {
    status: 'PLAYING',
    currentPhase: 'ROLE_REVEAL',
    currentRound: roundNumber,
    currentWordCategory: word.category,
    phaseEndsAt: null,
    usedWordIds: [...prevUsedIds, word.id],
    winner: null,
    eliminatedPlayerId: null,
    imposterGuessedWord: false,
    imposterGuessAnswer: null,
    revealedWord: sanitizeForFirestore(word),
    revealedImposterIds: assignedImposterIds,
    revealedVotes: {},
    scoreDetails: [],
    lastActivityAt: now,
    updatedAt: now,
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
  const now = Date.now();
  const phaseEndsAt = durationSeconds > 0 ? now + durationSeconds * 1000 : null;

  try {
    await updateDoc(roomRef, {
      currentPhase: phase,
      phaseEndsAt,
      lastActivityAt: now,
      updatedAt: now,
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
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  try {
    await updateDoc(playerRef, {
      clue: clueText.trim().slice(0, 80),
      lastSeenAt: now,
    });
    await updateDoc(roomRef, { lastActivityAt: now });
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
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  const voteData: OnlineVote = {
    voterId: user.uid,
    suspectId,
    timestamp: now,
  };

  try {
    const batch = writeBatch(db);
    batch.set(voteRef, voteData);
    batch.update(playerRef, { hasVoted: true, lastSeenAt: now });
    batch.update(roomRef, { lastActivityAt: now });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomCode}/votes/${user.uid}`);
  }
}

// Resolve voting results
export async function resolveOnlineVotingResults(roomCode: string) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await safeGetDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const playersSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'players'));
  const players = playersSnap.docs.map((d) => d.data() as OnlinePlayer);

  const votesSnap = await safeGetDocs(collection(db, 'rooms', roomCode, 'votes'));
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
  const now = Date.now();

  batch.update(roomRef, {
    currentPhase: nextPhase,
    phaseEndsAt: shouldGuess ? now + 45000 : null,
    eliminatedPlayerId: eliminatedId,
    revealedVotes: votesMap,
    scoreDetails: sanitizeForFirestore(scoreDetails),
    winner: shouldGuess ? null : initialWinner,
    lastActivityAt: now,
    updatedAt: now,
  });

  await batch.commit();
}

// Imposter final guess
export async function submitOnlineImposterGuess(
  roomCode: string,
  guess: string
) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await safeGetDoc(roomRef);
  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data() as OnlineRoomData;
  const secretWord = roomData.revealedWord;
  if (!secretWord) return;

  const cleanGuess = guess.trim().toLowerCase();
  const wordBnClean = secretWord.wordBn.trim().toLowerCase();
  const wordEnClean = secretWord.wordEn.trim().toLowerCase();

  const isCorrect = cleanGuess === wordBnClean || cleanGuess === wordEnClean;
  const now = Date.now();

  // If correct, Imposter steals the win! Update scores
  const batch = writeBatch(db);
  if (isCorrect && roomData.scoreDetails) {
    const imposterIds = roomData.revealedImposterIds || [];
    imposterIds.forEach((impId) => {
      const pRef = doc(db, 'rooms', roomCode, 'players', impId);
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
    lastActivityAt: now,
    updatedAt: now,
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

// Player confirms they saw their secret role & word
export async function confirmOnlineCardSeen(roomCode: string) {
  const user = auth.currentUser;
  if (!user) return;

  const playerRef = doc(db, 'rooms', roomCode, 'players', user.uid);
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  try {
    await updateDoc(playerRef, {
      hasSeenCard: true,
      lastSeenAt: now,
    });
    await updateDoc(roomRef, { lastActivityAt: now });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomCode}/players/${user.uid}`);
  }
}

// Send discussion chat message
export async function sendOnlineChatMessage(
  roomCode: string,
  player: OnlinePlayer,
  text: string
) {
  const user = auth.currentUser;
  if (!user || !text.trim()) return;

  const msgId = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const msgRef = doc(db, 'rooms', roomCode, 'messages', msgId);
  const roomRef = doc(db, 'rooms', roomCode);
  const now = Date.now();

  const messageData: ChatMessage = {
    id: msgId,
    senderId: user.uid,
    senderName: player.name,
    senderAvatar: player.avatar,
    senderColor: player.avatarColor,
    text: text.trim().slice(0, 140),
    timestamp: now,
  };

  try {
    await setDoc(msgRef, sanitizeForFirestore(messageData));
    await updateDoc(roomRef, { lastActivityAt: now });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomCode}/messages/${msgId}`);
  }
}

// Subscribe to live chat messages
export function subscribeToChatMessages(
  roomCode: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
) {
  const msgsColl = collection(db, 'rooms', roomCode, 'messages');
  return onSnapshot(
    msgsColl,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as ChatMessage);
      list.sort((a, b) => a.timestamp - b.timestamp);
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomCode}/messages`);
      if (onError) onError(error);
    }
  );
}
