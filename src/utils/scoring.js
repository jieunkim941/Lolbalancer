import { TIER_SCORE, CHAMPION_WEIGHT, MASTERY_SCORE, getPositionWeight } from '../data/constants';

export function calcTierScore(tiers) {
  const current = TIER_SCORE[tiers.current] ?? 30;
  const s1 = TIER_SCORE[tiers.season1] ?? 30;
  const s2 = TIER_SCORE[tiers.season2] ?? 30;
  return current * 0.5 + s1 * 0.3 + s2 * 0.2;
}

export function calcRawScore(tierScore, mainWinRate, recentWinRate) {
  return tierScore * 0.6 + mainWinRate * 0.2 + recentWinRate * 0.2;
}

export function calcChampionScore(champion) {
  if (!champion) return 0;
  const masteryScore = MASTERY_SCORE[champion.mastery] ?? 0;
  const winRateScore = champion.winRate / 10;
  const gamesScore = Math.min(champion.games / 50, 10);
  return (masteryScore + winRateScore + gamesScore) * CHAMPION_WEIGHT;
}

export function calcPositionData(positions, tierScore) {
  const sorted = [...positions].sort((a, b) => {
    const scoreA = a.games + (a.wins / a.games) * 100;
    const scoreB = b.games + (b.wins / b.games) * 100;
    return scoreB - scoreA;
  });

  const pw = getPositionWeight(tierScore);

  return {
    main: { ...sorted[0], weight: pw.main, role: 'main' },
    sub: sorted[1] ? { ...sorted[1], weight: pw.sub, role: 'sub' } : null,
    others: sorted.slice(2).map(p => ({ ...p, weight: pw.other, role: 'other' })),
  };
}

export function calcFinalScore(rawScore, championScore, positionWeight) {
  return (rawScore + championScore) * positionWeight;
}

export function calcPlayerScores(player) {
  const tierScore = calcTierScore(player.tiers);
  const positionData = calcPositionData(player.positions, tierScore);
  const mainWinRate = (positionData.main.wins / positionData.main.games) * 100;
  const rawScore = calcRawScore(tierScore, mainWinRate, player.recentWinRate);
  const championScore = calcChampionScore(player.champion);
  const rawScoreWithChamp = rawScore + championScore;
  const finalScore = calcFinalScore(rawScore, championScore, positionData.main.weight);

  return {
    ...player,
    tierScore: Math.round(tierScore * 10) / 10,
    positionData,
    mainWinRate: Math.round(mainWinRate * 10) / 10,
    rawScore: Math.round(rawScore * 10) / 10,
    championScore: Math.round(championScore * 10) / 10,
    rawScoreWithChamp: Math.round(rawScoreWithChamp * 10) / 10,
    finalScore: Math.round(finalScore * 10) / 10,
  };
}
