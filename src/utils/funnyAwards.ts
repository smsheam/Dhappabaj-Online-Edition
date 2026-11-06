export interface FunnyAward {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  badgeColor: string;
  recipientId: string;
  recipientName: string;
  reasonBn: string;
  reasonEn: string;
}

export interface PlayerMatchStat {
  id: string;
  name: string;
  role: 'imposter' | 'innocent';
  score: number;
  scoreGained?: number;
  votesReceived: number;
  votedForId?: string | null;
  votedCorrectly?: boolean;
  wasEliminated?: boolean;
  isImposter?: boolean;
}

export interface MatchContextStats {
  players: PlayerMatchStat[];
  imposterIds: string[];
  winnerTeam: 'imposter' | 'innocents';
  eliminatedPlayerId?: string | null;
  voteMatrix?: Record<string, string>; // voterId -> targetId
}

/**
 * Calculates 10 authentic, humorous Bangla awards based on actual match gameplay data.
 */
export function calculateFunnyAwards(context: MatchContextStats): FunnyAward[] {
  const { players, imposterIds, winnerTeam, eliminatedPlayerId, voteMatrix = {} } = context;
  if (!players || players.length === 0) return [];

  const awards: FunnyAward[] = [];
  const assignedPlayerIds = new Set<string>();

  // Helper to safely assign award to best candidate
  const assign = (
    id: string,
    nameBn: string,
    nameEn: string,
    icon: string,
    badgeColor: string,
    candidate: PlayerMatchStat | undefined,
    reasonBn: string,
    reasonEn: string
  ) => {
    if (!candidate) return;
    awards.push({
      id,
      nameBn,
      nameEn,
      icon,
      badgeColor,
      recipientId: candidate.id,
      recipientName: candidate.name,
      reasonBn,
      reasonEn,
    });
    assignedPlayerIds.add(candidate.id);
  };

  const imposters = players.filter((p) => imposterIds.includes(p.id) || p.role === 'imposter');
  const innocents = players.filter((p) => !imposterIds.includes(p.id) && p.role !== 'imposter');

  // 1. ধাপ্পাবাজ সম্রাট (Imposter Emperor) - Top imposter who won or got highest imposter score
  const topImposter = [...imposters].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  if (topImposter) {
    const isWin = winnerTeam === 'imposter';
    assign(
      'imposter_emperor',
      'ধাপ্পাবাজ সম্রাট',
      'Master of Deception',
      '👑',
      'from-amber-500 to-red-600',
      topImposter,
      isWin
        ? 'নিখুঁত অভিনয়ে সবাইকে ধোঁকা দিয়ে দলের জয় এনেছেন!'
        : 'চতুর অভিনয় দিয়ে শেষ মুহূর্ত পর্যন্ত লড়াই করেছেন!',
      isWin
        ? 'Deceived everyone with a brilliant poker face!'
        : 'Fought cunningly until the very end!'
    );
  }

  // 2. নীরব ঘাতক (Silent Assassin) - Imposter with 0 votes against them
  const zeroVoteImposter = imposters.find((p) => p.votesReceived === 0);
  if (zeroVoteImposter) {
    assign(
      'silent_assassin',
      'নীরব ঘাতক',
      'Silent Assassin',
      '🥷',
      'from-purple-600 to-indigo-800',
      zeroVoteImposter,
      'কেউ ঘুণাক্ষরেও টের পায়নি! একটা ভোটও গায়ে লাগেনি!',
      'Completely undetected! Not a single accusation vote received!'
    );
  }

  // 3. গোয়েন্দা সাহেব (Mr. Detective) - Innocent who voted correctly for imposter
  const accurateDetectives = innocents.filter((p) => p.votedCorrectly);
  const topDetective = accurateDetectives.length > 0
    ? [...accurateDetectives].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    : undefined;
  if (topDetective) {
    assign(
      'mr_detective',
      'গোয়েন্দা সাহেব',
      'Mr. Detective',
      '🔍',
      'from-sky-500 to-blue-700',
      topDetective,
      'ধারালো বুদ্ধিতে আসল ধাপ্পাবাজকে হাতেনাতে চিহ্নিত করেছেন!',
      'Pinpointed the real imposter with razor-sharp deduction!'
    );
  }

  // 4. সন্দেহের রাজা (King of Suspicion) - Received most votes (innocent or overall)
  const maxVotedPlayer = [...players].sort((a, b) => b.votesReceived - a.votesReceived)[0];
  if (maxVotedPlayer && maxVotedPlayer.votesReceived > 0) {
    assign(
      'king_of_suspicion',
      'সন্দেহের রাজা',
      'King of Suspicion',
      '👀',
      'from-orange-500 to-amber-600',
      maxVotedPlayer,
      `পুরো খেলায় সবার সন্দেহের তীর ছিল ওনার দিকে (${maxVotedPlayer.votesReceived} ভোট)!`,
      `Target of everyone's suspicion with ${maxVotedPlayer.votesReceived} votes received!`
    );
  }

  // 5. নিরীহ মুখোশ (Innocent Mask) - Innocent with 0 votes who survived silently
  const untouchedInnocent = innocents.find((p) => p.votesReceived === 0 && !assignedPlayerIds.has(p.id));
  if (untouchedInnocent) {
    assign(
      'innocent_mask',
      'নিরীহ মুখোশ',
      'Innocent Mask',
      '🕊️',
      'from-emerald-400 to-teal-600',
      untouchedInnocent,
      'এত বিতর্কের মাঝেও পুরোপুরি নিষ্পাপ ও ধরাছোঁয়ার বাইরে ছিলেন!',
      'Remained completely untouched by suspicion throughout the round!'
    );
  }

  // 6. ভোটের শিকার (Victim of Votes) - Innocent player who was unjustly eliminated
  const eliminatedInnocent = innocents.find((p) => p.id === eliminatedPlayerId || p.wasEliminated);
  if (eliminatedInnocent) {
    assign(
      'victim_of_votes',
      'ভোটের শিকার',
      'Victim of Votes',
      '🎯',
      'from-rose-500 to-red-700',
      eliminatedInnocent,
      'সম্পূর্ণ নির্দোষ হওয়া সত্ত্বেও বন্ধুদের ভুল সিদ্ধান্তের বলি হয়েছেন!',
      'Unjustly eliminated by fellow citizens despite being totally innocent!'
    );
  }

  // 7. ভুল গোয়েন্দা (Clueless Detective) - Innocent who voted for another innocent
  const wrongVoters = innocents.filter((p) => p.votedCorrectly === false && !assignedPlayerIds.has(p.id));
  if (wrongVoters.length > 0) {
    const wrongVoter = wrongVoters[0];
    assign(
      'clueless_detective',
      'ভুল গোয়েন্দা',
      'Clueless Detective',
      '🤦‍♂️',
      'from-fuchsia-500 to-pink-600',
      wrongVoter,
      'গোয়েন্দাগিরি করতে গিয়ে নির্দোষ বন্ধুর বুকে ছুরি চালিয়েছেন!',
      'Accused fellow innocent citizens instead of the actual imposter!'
    );
  }

  // 8. শেষ হাসি (The Last Laugh) - Player with highest overall match score
  const topScorer = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  if (topScorer && !assignedPlayerIds.has(topScorer.id)) {
    assign(
      'last_laugh',
      'শেষ হাসি',
      'The Last Laugh',
      '🏆',
      'from-yellow-400 to-amber-600',
      topScorer,
      `সর্বোচ্চ পয়েন্ট (${topScorer.score} পয়েন্ট) নিয়ে শেষ হাসি উনিই হাসলেন!`,
      `Took the match crown with top score of ${topScorer.score} points!`
    );
  }

  // 9. ভাগ্যের রাজা (King of Luck) - Narrow escape or tiebreaker survivor
  const luckyPlayer = players.find((p) => !assignedPlayerIds.has(p.id) && p.votesReceived === 1);
  if (luckyPlayer) {
    assign(
      'king_of_luck',
      'ভাগ্যের রাজা',
      'King of Luck',
      '🍀',
      'from-green-500 to-emerald-700',
      luckyPlayer,
      'মাত্র ১ ভোটের ব্যবধানে ফাঁসির দড়ি থেকে রক্ষা পেয়েছেন!',
      'Survived elimination by a hair with only 1 vote!'
    );
  }

  // 10. নাটকের গুরু (Master of Drama) - Fallback for any active unassigned player
  const unassigned = players.filter((p) => !assignedPlayerIds.has(p.id));
  if (unassigned.length > 0) {
    const dramatic = unassigned[0];
    assign(
      'master_of_drama',
      'নাটকের গুরু',
      'Master of Drama',
      '🎭',
      'from-violet-500 to-purple-700',
      dramatic,
      'আলোচনায় উত্তেজনা ও নাটকীয়তা তৈরি করে ম্যাচ জমিয়ে রেখেছেন!',
      'Brought unmatched energy and theatrical drama to the discussion!'
    );
  }

  return awards;
}
