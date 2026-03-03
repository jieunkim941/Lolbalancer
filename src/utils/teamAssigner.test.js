import { describe, it, expect } from 'vitest';
import { assignTeams } from './teamAssigner';

describe('assignTeams', () => {
  it('10명을 5:5로 나눈다', () => {
    const players = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      finalScore: 50 + i * 5,
      positionData: {
        main: { name: ['TOP', 'JG', 'MID', 'ADC', 'SUP'][i % 5] },
        sub: { name: ['JG', 'MID', 'ADC', 'SUP', 'TOP'][i % 5] },
      },
    }));
    const { teamA, teamB } = assignTeams(players);
    expect(teamA).toHaveLength(5);
    expect(teamB).toHaveLength(5);
  });

  it('고정된 플레이어는 팀이 유지된다', () => {
    const players = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      finalScore: 50 + i * 5,
      positionData: {
        main: { name: ['TOP', 'JG', 'MID', 'ADC', 'SUP'][i % 5] },
        sub: { name: ['JG', 'MID', 'ADC', 'SUP', 'TOP'][i % 5] },
      },
      locked: i === 0,
      lockedTeam: 'A',
      lockedPosition: 'TOP',
    }));
    const { teamA } = assignTeams(players);
    const lockedPlayer = teamA.find(p => p.id === 1);
    expect(lockedPlayer).toBeDefined();
    expect(lockedPlayer.assignedPosition).toBe('TOP');
  });
});
