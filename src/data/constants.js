export const POSITIONS = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

// 티어 구간별 포지션 가중치 (고티어일수록 비주류 페널티 작음)
export const POSITION_WEIGHT_TABLE = [
  { minScore: 76, main: 1.0, sub: 0.95, other: 0.90 }, // 다이아+
  { minScore: 52, main: 1.0, sub: 0.85, other: 0.70 }, // 에메~플래
  { minScore: 28, main: 1.0, sub: 0.75, other: 0.55 }, // 골드~실버
  { minScore: 0,  main: 1.0, sub: 0.65, other: 0.40 }, // 브론즈 이하
];

export function getPositionWeight(tierScore) {
  const row = POSITION_WEIGHT_TABLE.find((r) => tierScore >= r.minScore) || POSITION_WEIGHT_TABLE.at(-1);
  return { main: row.main, sub: row.sub, other: row.other };
}

export const TIER_SCORE = {
  'Challenger': 100,
  'Grandmaster': 95,
  'Master': 90,
  'Diamond 1': 85, 'Diamond 2': 82, 'Diamond 3': 79, 'Diamond 4': 76,
  'Emerald 1': 73, 'Emerald 2': 70, 'Emerald 3': 67, 'Emerald 4': 64,
  'Platinum 1': 61, 'Platinum 2': 58, 'Platinum 3': 55, 'Platinum 4': 52,
  'Gold 1': 49, 'Gold 2': 46, 'Gold 3': 43, 'Gold 4': 40,
  'Silver 1': 37, 'Silver 2': 34, 'Silver 3': 31, 'Silver 4': 28,
  'Bronze 1': 25, 'Bronze 2': 22, 'Bronze 3': 19, 'Bronze 4': 16,
  'Iron 1': 13, 'Iron 2': 10, 'Iron 3': 7, 'Iron 4': 4,
  'Unranked': 30,
};

export const CHAMPION_WEIGHT = 0.12;

export const MASTERY_SCORE = {
  7: 10,
  6: 8,
  5: 6,
  4: 4,
  3: 2,
  2: 1,
  1: 0.5,
};

export const BALANCE_THRESHOLDS = {
  excellent: 3,
  good: 5,
};
