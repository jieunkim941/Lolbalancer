import { describe, it, expect } from 'vitest';
import {
  calcTierScore,
  calcRawScore,
  calcChampionScore,
  calcPositionData,
  calcFinalScore,
} from './scoring';

describe('calcTierScore', () => {
  it('가중 평균 계산 (현시즌 0.5, 직전1 0.3, 직전2 0.2)', () => {
    const tiers = { current: 'Challenger', season1: 'Challenger', season2: 'Grandmaster' };
    expect(calcTierScore(tiers)).toBe(99);
  });
});

describe('calcRawScore', () => {
  it('TierScore 0.6 + MainWin 0.2 + RecentWin 0.2', () => {
    const result = calcRawScore(99, 68, 71);
    expect(result).toBeCloseTo(87.2, 1);
  });
});

describe('calcChampionScore', () => {
  it('챔피언 점수 계산', () => {
    const champ = { mastery: 7, winRate: 72, games: 320 };
    const score = calcChampionScore(champ);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(15);
  });
});

describe('calcPositionData', () => {
  it('포지션을 주/부/기타로 분류 (고티어 — 페널티 작음)', () => {
    const positions = [
      { name: 'MID', games: 150, wins: 102 },
      { name: 'TOP', games: 30, wins: 18 },
      { name: 'JG', games: 10, wins: 5 },
    ];
    const result = calcPositionData(positions, 85); // 다이아1 tierScore
    expect(result.main.name).toBe('MID');
    expect(result.sub.name).toBe('TOP');
    expect(result.others[0].name).toBe('JG');
    expect(result.main.weight).toBe(1.0);
    expect(result.sub.weight).toBe(0.95);
    expect(result.others[0].weight).toBe(0.90);
  });

  it('포지션을 주/부/기타로 분류 (저티어 — 페널티 큼)', () => {
    const positions = [
      { name: 'MID', games: 150, wins: 102 },
      { name: 'TOP', games: 30, wins: 18 },
      { name: 'JG', games: 10, wins: 5 },
    ];
    const result = calcPositionData(positions, 20); // 브론즈 tierScore
    expect(result.main.weight).toBe(1.0);
    expect(result.sub.weight).toBe(0.65);
    expect(result.others[0].weight).toBe(0.40);
  });
});
