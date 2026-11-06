export type AccountType = 'google' | 'guest';

export interface UserCustomization {
  avatar: string;
  avatarColor: string;
  skinBadge?: string; // cosmetic badge/frame unlocked via achievements
  favoriteCategory?: string;
  customTitle?: string;
}

export interface UserStats {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  imposterWins: number;
  citizenWins: number;
  totalPoints: number;
  imposterCount: number;
  correctVotes: number;
  wrongVotes: number;
  eliminatedAsInnocent: number;
  cleanImposterWins: number; // 0 votes imposter wins
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName: string;
  username: string;
  photoURL?: string | null;
  accountType: AccountType;
  createdAt: number;
  updatedAt: number;
  isBanned?: boolean;
  bannedReason?: string;
  customization: UserCustomization;
  stats: UserStats;
  unlockedBadges: string[];
}

export interface AchievementItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: string;
  category: 'imposter' | 'citizen' | 'points' | 'veteran';
  maxProgress: number;
  rewardSkinBadge?: string;
}

export interface MatchHistoryPlayerRecord {
  id: string;
  name: string;
  avatar: string;
  titleBn: string;
  titleEn: string;
  role: 'imposter' | 'innocent';
  score: number;
  votesReceived: number;
  votedForId?: string | null;
}

export interface CompletedMatchRecord {
  id: string;
  matchId: string;
  roomCode?: string;
  mode: 'online' | 'pass_and_play';
  completedAt: number;
  totalRounds: number;
  winnerTeam: 'imposter' | 'innocents';
  imposterIds: string[];
  players: MatchHistoryPlayerRecord[];
  wordsPlayed: {
    wordBn: string;
    wordEn: string;
    category: string;
  }[];
  awardsGiven: {
    awardId: string;
    awardNameBn: string;
    awardNameEn: string;
    icon: string;
    playerId: string;
    playerName: string;
    reasonBn: string;
    reasonEn: string;
  }[];
}

export type UserRole = 'owner' | 'editor' | 'player';

export interface EditorPermission {
  canManageWords: boolean;
  canManageHints: boolean;
  canManageTexts: boolean;
  canViewAnalytics: boolean;
}

export interface UserRoleRecord {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: EditorPermission;
  assignedBy: string;
  assignedAt: number;
}
