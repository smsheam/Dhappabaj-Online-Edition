import { Player, RoundScoreDetail, WordItem } from '../types/game';

export interface ScoreCalculationInput {
  players: Player[];
  imposterIds: string[];
  votes: Record<string, string>; // voterId -> suspectId
  word: WordItem;
  imposterGuessedWord?: boolean;
}

export function calculateRoundScores({
  players,
  imposterIds,
  votes,
  imposterGuessedWord = false,
}: ScoreCalculationInput): RoundScoreDetail[] {
  // Count how many votes each player received
  const voteCountMap: Record<string, number> = {};
  players.forEach((p) => {
    voteCountMap[p.id] = 0;
  });

  Object.entries(votes).forEach(([, suspectId]) => {
    if (voteCountMap[suspectId] !== undefined) {
      voteCountMap[suspectId]++;
    }
  });

  const totalInnocents = players.filter((p) => !imposterIds.includes(p.id)).length;

  return players.map((player) => {
    const isImposter = imposterIds.includes(player.id);
    const votedForId = votes[player.id] || null;
    const votesReceived = voteCountMap[player.id] || 0;
    let pointsDelta = 0;
    const reasons: { bn: string; en: string }[] = [];

    if (!isImposter) {
      // INNOCENT CITIZEN SCORING
      if (votedForId) {
        if (imposterIds.includes(votedForId)) {
          // Correct vote on Imposter: +4
          pointsDelta += 4;
          reasons.push({
            bn: 'সঠিক Imposter শনাক্ত (+৪)',
            en: 'Correct Imposter vote (+4)',
          });
        } else {
          // Practical penalty: -1 (fair deduction, prevents unfair negative score drops)
          pointsDelta -= 1;
          reasons.push({
            bn: 'ভুল সন্দেহ (-১)',
            en: 'Mistaken suspect (-1)',
          });
        }
      }

      // Framed Innocent Bonus: If framed by everyone else
      if (votesReceived >= players.length - 1 && players.length > 2) {
        pointsDelta += 3;
        reasons.push({
          bn: 'নির্দোষ ফাঁসানো বোনাস (+৩)',
          en: 'Framed innocent martyr bonus (+3)',
        });
      }
    } else {
      // IMPOSTER SCORING
      const innocentVotesAgainstImposter = Object.entries(votes).filter(
        ([voterId, suspectId]) => !imposterIds.includes(voterId) && suspectId === player.id
      ).length;

      // Unanimously caught by all innocents
      if (innocentVotesAgainstImposter >= totalInnocents && totalInnocents > 0) {
        pointsDelta -= 2;
        reasons.push({
          bn: 'সবার ভোটে শনাক্ত (-২)',
          en: 'Caught unanimously (-2)',
        });
      } else {
        // Survived undetected
        pointsDelta += 5;
        reasons.push({
          bn: 'সফলভাবে আত্মগোপন (+৫)',
          en: 'Survived undetected (+5)',
        });
      }

      // Zero votes against Imposter bonus: +3
      if (votesReceived === 0) {
        pointsDelta += 3;
        reasons.push({
          bn: 'শূন্য ভোট প্রাপ্তি বোনাস (+৩)',
          en: 'Ghost stealth (0 votes) bonus (+3)',
        });
      }

      // Secret word guess bonus: +3
      if (imposterGuessedWord) {
        pointsDelta += 3;
        reasons.push({
          bn: 'সঠিক শব্দ অনুমান বোনাস (+৩)',
          en: 'Guessed secret word bonus (+3)',
        });
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
