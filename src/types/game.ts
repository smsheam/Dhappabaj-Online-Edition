export type CategoryId =
  | 'school_life'
  | 'sports'
  | 'lifestyle'
  | 'historical_places'
  | 'bd_tourist'
  | 'food'
  | 'people'
  | 'animal'
  | 'object'
  | 'tech'
  | 'movies'
  | 'geography'
  | 'professions'
  | 'nature'
  | 'transport'
  | 'festivals'
  | 'everyday_activities'
  | 'science'
  | 'clothing'
  | 'landmarks';

export type Language = 'bn' | 'en';
export type Theme = 'dark' | 'light';

export interface CategoryInfo {
  id: CategoryId;
  nameBn: string;
  nameEn: string;
  icon: string;
  color: string;
}

export interface WordItem {
  id: number;
  category: CategoryId;
  wordBn: string;
  wordEn: string;
  hintBn: string;
  hintEn: string;
  shortHintBn?: string; // Concise 2-3 words hint
  shortHintEn?: string;
  explanationEn?: string; // Short English explanation
  tag?: string;
}

export interface Player {
  id: string;
  name: string;
  titleBn: string;
  titleEn: string;
  score: number;
  avatarColor: string;
  avatar: string;
  isImposter?: boolean;
}

export interface RoundScoreDetail {
  playerId: string;
  playerName: string;
  playerTitleBn: string;
  playerTitleEn: string;
  playerAvatar?: string;
  isImposter: boolean;
  votedForId: string | null;
  votesReceived: number;
  pointsDelta: number;
  reasons: { bn: string; en: string }[];
}

export interface RoundResult {
  roundNumber: number;
  word: WordItem;
  imposterIds: string[];
  votes: Record<string, string>; // voterId -> suspectId
  scoreDetails: RoundScoreDetail[];
  imposterGuessedWord?: boolean;
}

export type GamePhase =
  | 'INTRO'
  | 'SETUP'
  | 'ROLE_HANDOVER'
  | 'ROLE_REVEAL'
  | 'CLUE_SPEAKING'
  | 'DISCUSSION'
  | 'VOTING'
  | 'ROUND_REVEAL'
  | 'ROUND_SCOREBOARD'
  | 'GAME_OVER';

export interface GameSettings {
  playerCount: number;
  imposterCount: 1 | 2 | 3;
  totalRounds: number; // Configured or optimal rounds (at least 3)
  timerSeconds: number; // 0 for unlimited, or 60, 90, 120
  votingStyle: 'host_input' | 'pass_and_play';
  allowCategorySelection: boolean;
  selectedCategories: CategoryId[];
}
