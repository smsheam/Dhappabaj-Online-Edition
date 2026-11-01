import { CategoryId, WordItem, RoundScoreDetail } from './game';

export type RoomStatus = 'waiting' | 'in_progress' | 'ended';

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
  maxPlayers: number; // 4 - 10
  imposterCount: 1 | 2;
  discussionTimer: number; // 60, 90, 120
  votingTimer: number; // 30, 45, 60
  language: 'bn' | 'en' | 'mixed';
  selectedCategories: CategoryId[];
  imposterFinalGuess: boolean;
  totalRounds: number;
}

export interface OnlinePlayer {
  id: string; // Firebase Auth UID
  name: string;
  avatar: string;
  avatarColor: string;
  titleBn: string;
  titleEn: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  hasVoted: boolean;
  clue?: string;
  connectionStatus: 'online' | 'offline';
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
  status: RoomStatus;
  currentPhase: OnlineGamePhase;
  currentRound: number;
  totalRounds: number;
  playerCount: number;
  settings: RoomSettings;
  phaseEndsAt: number | null; // Milliseconds timestamp for synchronized countdown
  usedWordIds: number[];
  currentWordCategory?: CategoryId;
  winner?: 'innocents' | 'imposter' | 'tie' | null;
  eliminatedPlayerId?: string | null;
  imposterGuessedWord?: boolean;
  imposterGuessAnswer?: string | null;
  // Revealed round summary data (populated after voting/result phase)
  revealedWord?: WordItem | null;
  revealedImposterIds?: string[];
  revealedVotes?: Record<string, string>; // voterId -> suspectId
  scoreDetails?: RoundScoreDetail[];
  createdAt: number;
  updatedAt: number;
}

export interface OnlineVote {
  voterId: string;
  suspectId: string;
  timestamp: number;
}
