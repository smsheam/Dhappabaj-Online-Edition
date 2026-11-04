import { CategoryId, WordItem, RoundScoreDetail } from './game';

export type RoomStatus =
  | 'WAITING'
  | 'PLAYING'
  | 'CLOSED'
  | 'EXPIRED'
  | 'waiting'
  | 'in_progress'
  | 'ended';

export type RoomClosedReason =
  | 'host_left'
  | 'host_disconnected'
  | 'empty_room'
  | 'inactivity_timeout'
  | 'game_completed'
  | null;

export type OnlineGamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'CLUE'
  | 'DISCUSSION'
  | 'VOTING'
  | 'RESULT'
  | 'IMPOSTER_GUESS'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

export interface RoomSettings {
  maxPlayers: number; // 3 - 10
  imposterCount: 1 | 2;
  clueTimer: number; // 20, 30, 45, 60 (default 30s)
  discussionTimer: number; // 45, 60, 90, 120 (default 90s)
  votingTimer: number; // 20, 30, 45, 60 (default 30s)
  language: 'bn' | 'en' | 'mixed';
  selectedCategories: CategoryId[];
  imposterFinalGuess: boolean;
  totalRounds: number;
}

export interface OnlinePlayer {
  id: string; // Firebase Auth UID
  sessionToken?: string; // Token to safely reconnect from same client
  name: string;
  avatar: string;
  avatarColor: string;
  titleBn: string;
  titleEn: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  hasVoted: boolean;
  hasSeenCard?: boolean; // Track who confirmed viewing secret card
  clue?: string;
  connectionStatus: 'online' | 'offline';
  disconnectedAt?: number | null; // Track accidental disconnect for 35s rejoin grace period
  canRejoinUntil?: number | null;
  joinedAt: number;
  lastSeenAt: number;
}

export interface PrivatePlayerRole {
  playerId: string;
  role: 'innocent' | 'imposter';
  wordBn?: string;
  wordEn?: string;
  hintBn: string;
  hintEn: string;
  shortHintBn?: string;
  shortHintEn?: string;
  category: CategoryId;
}

export interface OnlineRoomData {
  roomCode: string;
  hostId: string;
  hostSessionToken?: string;
  status: RoomStatus;
  closedReason?: RoomClosedReason;
  currentPhase: OnlineGamePhase;
  currentRound: number;
  totalRounds: number;
  playerCount: number;
  settings: RoomSettings;
  phaseEndsAt: number | null; // Milliseconds timestamp for synchronized countdown
  clueOrder?: string[]; // Rotating sequence of players taking turns to give clues
  clueTurnPlayerId?: string | null; // ID of player whose turn it currently is
  clueTurnIndex?: number; // Current index in clueOrder (0, 1, 2, ...)
  usedWordIds: number[];
  currentWordCategory?: CategoryId;
  winner?: 'innocents' | 'imposter' | 'tie' | null;
  eliminatedPlayerId?: string | null;
  imposterGuessedWord?: boolean;
  imposterGuessAnswer?: string | null;
  // Revealed round summary data (populated after voting/result phase)
  revealedWord?: WordItem | null;
  revealedImposterIds?: string[];
  revealedVotes?: Record<string, string | string[]>; // voterId -> suspectId or suspectIds
  currentMatchId?: string; // Unique match/session ID for score reset per new match
  imposterCounts?: Record<string, number>; // playerId -> count of imposter assignments in current match (max 2)
  matchScores?: Record<string, number>; // playerId -> current match score
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number; // 5 min inactivity tracking
  hostDisconnectedAt?: number | null; // 30s grace period for host disconnect
}

export interface OnlineVote {
  voterId: string;
  suspectId: string;
  suspectIds?: string[]; // Multiple votes supported when 2 imposters
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor?: string;
  text: string;
  timestamp: number;
  isVoice?: boolean;
  audioData?: string;
  durationMs?: number;
}
