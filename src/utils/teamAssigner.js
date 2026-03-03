import { POSITIONS } from '../data/constants';

export function assignTeams(players) {
  const teamA = [];
  const teamB = [];
  const positionsA = {};
  const positionsB = {};

  // 1. 고정된 플레이어 먼저 배치
  for (const player of players) {
    if (player.locked) {
      const team = player.lockedTeam === 'A' ? teamA : teamB;
      const positions = player.lockedTeam === 'A' ? positionsA : positionsB;
      const pos = player.lockedPosition || player.positionData.main.name;
      team.push({ ...player, assignedPosition: pos });
      positions[pos] = true;
    }
  }

  // 2. 나머지 플레이어를 점수 내림차순 정렬
  const unlockedPlayers = players
    .filter(p => !p.locked)
    .sort((a, b) => b.finalScore - a.finalScore);

  // 3. 그리디 배정: 점수 높은 순으로 낮은 팀에 배치
  for (const player of unlockedPlayers) {
    const scoreA = teamA.reduce((sum, p) => sum + p.finalScore, 0);
    const scoreB = teamB.reduce((sum, p) => sum + p.finalScore, 0);

    const availableA = POSITIONS.filter(p => !positionsA[p]);
    const availableB = POSITIONS.filter(p => !positionsB[p]);

    const bestPosA = findBestPosition(player, availableA);
    const bestPosB = findBestPosition(player, availableB);

    if (teamA.length >= 5) {
      teamB.push({ ...player, assignedPosition: bestPosB });
      positionsB[bestPosB] = true;
    } else if (teamB.length >= 5) {
      teamA.push({ ...player, assignedPosition: bestPosA });
      positionsA[bestPosA] = true;
    } else if (scoreA <= scoreB) {
      teamA.push({ ...player, assignedPosition: bestPosA });
      positionsA[bestPosA] = true;
    } else {
      teamB.push({ ...player, assignedPosition: bestPosB });
      positionsB[bestPosB] = true;
    }
  }

  return { teamA, teamB };
}

function findBestPosition(player, available) {
  if (available.length === 0) return player.positionData.main.name;
  const mainPos = player.positionData.main.name;
  if (available.includes(mainPos)) return mainPos;
  const subPos = player.positionData.sub?.name;
  if (subPos && available.includes(subPos)) return subPos;
  return available[0];
}
