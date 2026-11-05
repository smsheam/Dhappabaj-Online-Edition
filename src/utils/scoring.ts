import { Player, RoundScoreDetail, WordItem } from '../types/game';

export interface ScoreCalculationInput {
  players: Player[];
  imposterIds: string[];
  votes: Record<string, string | string[]>; // voterId -> suspectId or suspectIds
  word: WordItem;
  eliminatedPlayerId?: string | null;
  imposterGuessedWord?: boolean;
}

export function calculateRoundScores({
  players,
  imposterIds,
  votes,
  eliminatedPlayerId,
  imposterGuessedWord = false,
}: ScoreCalculationInput): RoundScoreDetail[] {
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
      // 1. Correct choice/vote for Imposter: +1 point
      if (votedList.length > 0) {
        votedList.forEach((sId) => {
          if (imposterIds.includes(sId)) {
            pointsDelta += 1;
            reasons.push({
              bn: 'সঠিক ধাপ্পাবাজ নির্বাচন (+১)',
              en: 'Correct Imposter choice (+1)',
            });
          } else {
            // Mistaken vote for Citizen: -1 point
            pointsDelta -= 1;
            reasons.push({
              bn: 'নির্দোষকে ভুল ভোট (-১)',
              en: 'Wrong vote on Citizen (-1)',
            });
          }
        });
      }

      // 2. Imposter lose game: +4 points to citizens
      if (imposterLost) {
        pointsDelta += 4;
        reasons.push({
          bn: 'ধাপ্পাবাজ পরাজিত হওয়ায় নাগরিক জয় (+৪)',
          en: 'Citizens bonus for Imposter defeat (+4)',
        });
      }

      // 3. Citizen eliminated as unique highest-voted player: +3 consolation bonus
      if (effectiveEliminatedId === player.id) {
        pointsDelta += 3;
        reasons.push({
          bn: 'নির্দোষ হয়ে বহিষ্কৃত হওয়ার সান্ত্বনা বোনাস (+৩)',
          en: 'Wrongly eliminated Citizen bonus (+3)',
        });
      }
    } else {
      // IMPOSTER SCORING
      // Imposter's own vote has NO scoring impact (0 points, no penalty)
      if (imposterLost) {
        // Imposter lose game: exactly 0 points (no deduction)
        pointsDelta = 0;
        reasons.push({
          bn: 'ধাপ্পাবাজ পরাজিত (০ পয়েন্ট)',
          en: 'Imposter defeated (0 pts)',
        });
      } else {
        // Imposter survived or won via final guess: +5 points
        pointsDelta += 5;
        if (imposterGuessedWord) {
          reasons.push({
            bn: 'সঠিক শব্দ অনুমান করে জয়লাভ (+৫)',
            en: 'Won by guessing secret word (+5)',
          });
        } else {
          reasons.push({
            bn: 'ধাপ্পাবাজের সফল জয় (+৫)',
            en: 'Imposter survived and won (+5)',
          });
        }

        // Additional +3 bonus if Imposter received ZERO votes
        if (votesReceived === 0) {
          pointsDelta += 3;
          reasons.push({
            bn: 'কোনো ভোট না পাওয়ার বোনাস (+৩)',
            en: 'Zero votes received bonus (+3)',
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
