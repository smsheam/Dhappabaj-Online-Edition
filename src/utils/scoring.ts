import { Player, RoundScoreDetail, WordItem } from '../types/game';

export interface GameScoringConfig {
  citizenCorrectVotePoints: number;
  citizenWrongVotePoints: number;
  citizenImposterLossBonus: number;
  citizenConsolationPoints: number;
  imposterWinPoints: number;
  imposterZeroVotesBonus: number;
  imposterLossPoints: number;
}

export const DEFAULT_SCORING_CONFIG: GameScoringConfig = {
  citizenCorrectVotePoints: 1,
  citizenWrongVotePoints: -1,
  citizenImposterLossBonus: 4,
  citizenConsolationPoints: 3,
  imposterWinPoints: 5,
  imposterZeroVotesBonus: 3,
  imposterLossPoints: 0,
};

const SCORING_STORAGE_KEY = 'dhappabaj_scoring_config_v1';

export function getActiveScoringConfig(): GameScoringConfig {
  try {
    const raw = localStorage.getItem(SCORING_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SCORING_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SCORING_CONFIG;
}

export function saveActiveScoringConfig(config: GameScoringConfig) {
  try {
    localStorage.setItem(SCORING_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export interface ScoreCalculationInput {
  players: Player[];
  imposterIds: string[];
  votes: Record<string, string | string[]>; // voterId -> suspectId or suspectIds
  word: WordItem;
  eliminatedPlayerId?: string | null;
  imposterGuessedWord?: boolean;
  scoringConfig?: GameScoringConfig;
}

export function calculateRoundScores({
  players,
  imposterIds,
  votes,
  eliminatedPlayerId,
  imposterGuessedWord = false,
  scoringConfig,
}: ScoreCalculationInput): RoundScoreDetail[] {
  const cfg = scoringConfig || getActiveScoringConfig() || DEFAULT_SCORING_CONFIG;

  // Count how many votes each player received
  const voteCountMap: Record<string, number> = {};
  players.forEach((p) => {
    voteCountMap[p.id] = 0;
  });

  Object.entries(votes).forEach(([, suspect]) => {
    const list = Array.isArray(suspect) ? suspect : suspect ? [suspect] : [];
    list.forEach((sId) => {
      if (voteCountMap[sId] !== undefined) {
        voteCountMap[sId]++;
      }
    });
  });

  // Determine eliminated player if not directly provided
  let effectiveEliminatedId = eliminatedPlayerId;
  if (effectiveEliminatedId === undefined) {
    let maxVotes = 0;
    let topSuspects: string[] = [];
    Object.entries(voteCountMap).forEach(([pId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        topSuspects = [pId];
      } else if (count === maxVotes && count > 0) {
        topSuspects.push(pId);
      }
    });
    effectiveEliminatedId = topSuspects.length === 1 ? topSuspects[0] : null;
  }

  return players.map((player) => {
    const isImposter = imposterIds.includes(player.id);
    const rawVote = votes[player.id];
    const votedList = Array.isArray(rawVote) ? rawVote : rawVote ? [rawVote] : [];
    const votedForId = votedList[0] || null;
    const votesReceived = voteCountMap[player.id] || 0;
    let pointsDelta = 0;
    const reasons: { bn: string; en: string }[] = [];

    // Did the imposter team lose the game?
    // An imposter was caught/eliminated AND did not guess the secret word.
    const imposterCaught = effectiveEliminatedId !== null && imposterIds.includes(effectiveEliminatedId);
    const imposterWon = !imposterCaught || imposterGuessedWord;
    const imposterLost = !imposterWon;

    if (!isImposter) {
      // CITIZEN SCORING
      // 1. Correct choice/vote for Imposter
      if (votedList.length > 0) {
        votedList.forEach((sId) => {
          if (imposterIds.includes(sId)) {
            pointsDelta += cfg.citizenCorrectVotePoints;
            reasons.push({
              bn: `সঠিক ধাপ্পাবাজ নির্বাচন (+${cfg.citizenCorrectVotePoints})`,
              en: `Correct Imposter choice (+${cfg.citizenCorrectVotePoints})`,
            });
          } else {
            // Mistaken vote for Citizen
            pointsDelta += cfg.citizenWrongVotePoints;
            reasons.push({
              bn: `নির্দোষকে ভুল ভোট (${cfg.citizenWrongVotePoints})`,
              en: `Wrong vote on Citizen (${cfg.citizenWrongVotePoints})`,
            });
          }
        });
      }

      // 2. Imposter lose game: citizen bonus
      if (imposterLost) {
        pointsDelta += cfg.citizenImposterLossBonus;
        reasons.push({
          bn: `ধাপ্পাবাজ পরাজিত হওয়ায় নাগরিক জয় (+${cfg.citizenImposterLossBonus})`,
          en: `Citizens bonus for Imposter defeat (+${cfg.citizenImposterLossBonus})`,
        });
      }

      // 3. Citizen eliminated as unique highest-voted player: consolation bonus
      if (effectiveEliminatedId === player.id) {
        pointsDelta += cfg.citizenConsolationPoints;
        reasons.push({
          bn: `নির্দোষ হয়ে বহিষ্কৃত হওয়ার সান্ত্বনা বোনাস (+${cfg.citizenConsolationPoints})`,
          en: `Wrongly eliminated Citizen bonus (+${cfg.citizenConsolationPoints})`,
        });
      }
    } else {
      // IMPOSTER SCORING
      // Imposter's own vote has NO scoring impact (0 points, no penalty)
      if (imposterLost) {
        // Imposter lose game: exactly imposterLossPoints (0 points)
        pointsDelta = cfg.imposterLossPoints;
        reasons.push({
          bn: `ধাপ্পাবাজ পরাজিত (${cfg.imposterLossPoints} পয়েন্ট)`,
          en: `Imposter defeated (${cfg.imposterLossPoints} pts)`,
        });
      } else {
        // Imposter survived or won via final guess
        pointsDelta += cfg.imposterWinPoints;
        if (imposterGuessedWord) {
          reasons.push({
            bn: `সঠিক শব্দ অনুমান করে জয়লাভ (+${cfg.imposterWinPoints})`,
            en: `Won by guessing secret word (+${cfg.imposterWinPoints})`,
          });
        } else {
          reasons.push({
            bn: `ধাপ্পাবাজের সফল জয় (+${cfg.imposterWinPoints})`,
            en: `Imposter survived and won (+${cfg.imposterWinPoints})`,
          });
        }

        // Additional bonus if Imposter received ZERO votes
        if (votesReceived === 0) {
          pointsDelta += cfg.imposterZeroVotesBonus;
          reasons.push({
            bn: `কোনো ভোট না পাওয়ার বোনাস (+${cfg.imposterZeroVotesBonus})`,
            en: `Zero votes received bonus (+${cfg.imposterZeroVotesBonus})`,
          });
        }
      }
    }

    return {
      playerId: player.id,
      playerName: player.name,
      playerTitleBn: player.titleBn,
      playerTitleEn: player.titleEn,
      playerAvatar: player.avatar,
      isImposter,
      votedForId,
      votesReceived,
      pointsDelta,
      reasons,
    };
  });
}
