import { POSITIONS } from '../data/constants';

const MAX_DIFF = 20; // 허용 총점 차이
const MAX_LANE_DIFF = 15; // 허용 라인별 점수 차이

export function assignTeams(players) {
  // 1. 고정된 플레이어 분리
  const lockedA = [];
  const lockedB = [];
  const unlocked = [];

  for (const player of players) {
    if (player.locked) {
      const pos = player.lockedPosition || player.positionData.main.name;
      const assigned = { ...player, assignedPosition: pos };
      if (player.lockedTeam === 'A') lockedA.push(assigned);
      else lockedB.push(assigned);
    } else {
      unlocked.push(player);
    }
  }

  const neededA = 5 - lockedA.length;
  const neededB = 5 - lockedB.length;

  // 2. 가능한 조합 생성 (unlocked에서 neededA명을 A팀으로)
  const usedPositionsA = new Set(lockedA.map((p) => p.assignedPosition));
  const usedPositionsB = new Set(lockedB.map((p) => p.assignedPosition));

  const candidates = [];
  const indices = unlocked.map((_, i) => i);

  // 조합 탐색 (C(n, neededA) — 최대 10명 중 5명 = 252가지)
  combinations(indices, neededA, (aIndices) => {
    const bIndices = indices.filter((i) => !aIndices.includes(i));

    // A팀 포지션 배정
    const aPlayers = aIndices.map((i) => unlocked[i]);
    const bPlayers = bIndices.map((i) => unlocked[i]);

    const aAssigned = assignPositions(aPlayers, usedPositionsA);
    const bAssigned = assignPositions(bPlayers, usedPositionsB);

    if (!aAssigned || !bAssigned) return;

    const teamA = [...lockedA, ...aAssigned];
    const teamB = [...lockedB, ...bAssigned];

    const scoreA = teamA.reduce((s, p) => s + p.finalScore, 0);
    const scoreB = teamB.reduce((s, p) => s + p.finalScore, 0);
    const diff = Math.abs(scoreA - scoreB);

    // 라인별 점수 차이 체크
    let laneFail = false;
    let maxLaneDiff = 0;
    for (const pos of POSITIONS) {
      const pA = teamA.find((p) => p.assignedPosition === pos);
      const pB = teamB.find((p) => p.assignedPosition === pos);
      if (pA && pB) {
        const laneDiff = Math.abs(pA.finalScore - pB.finalScore);
        if (laneDiff > maxLaneDiff) maxLaneDiff = laneDiff;
        if (laneDiff > MAX_LANE_DIFF) { laneFail = true; break; }
      }
    }

    if (diff <= MAX_DIFF && !laneFail) {
      candidates.push({ teamA, teamB, diff, maxLaneDiff });
    }
  });

  // 3. 후보 중 랜덤 선택 (밸런스 좋은 쪽에 가중치)
  if (candidates.length === 0) {
    // 후보가 없으면 기존 그리디 방식 폴백
    return greedyAssign(players);
  }

  // 총점 차이 + 라인 차이 둘 다 작을수록 높은 가중치
  const weights = candidates.map((c) => (MAX_DIFF - c.diff + 1) + (MAX_LANE_DIFF - c.maxLaneDiff + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return candidates[i];
  }

  return candidates[candidates.length - 1];
}

// 조합 유틸 (C(arr, k))
function combinations(arr, k, callback) {
  const result = [];
  function helper(start) {
    if (result.length === k) {
      callback([...result]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      result.push(arr[i]);
      helper(i + 1);
      result.pop();
    }
  }
  helper(0);
}

// 플레이어 배열에 포지션 배정 (헝가리안 간소화: 최적 매칭)
function assignPositions(players, usedPositions) {
  const available = POSITIONS.filter((p) => !usedPositions.has(p));
  if (players.length !== available.length) return null;

  // 모든 순열 중 가장 적합한 배정 찾기 (최대 5! = 120)
  let best = null;
  let bestScore = -Infinity;

  permutations(available, (perm) => {
    let score = 0;
    for (let i = 0; i < players.length; i++) {
      const pos = perm[i];
      const main = players[i].positionData.main.name;
      const sub = players[i].positionData.sub?.name;
      if (pos === main) score += 3;
      else if (pos === sub) score += 1;
      // other = 0
    }
    if (score > bestScore) {
      bestScore = score;
      best = perm;
    }
  });

  if (!best) return null;
  return players.map((p, i) => ({ ...p, assignedPosition: best[i] }));
}

function permutations(arr, callback) {
  if (arr.length <= 1) {
    callback([...arr]);
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    permutations(rest, (perm) => {
      callback([arr[i], ...perm]);
    });
  }
}

// 폴백: 기존 그리디 방식
function greedyAssign(players) {
  const teamA = [];
  const teamB = [];
  const positionsA = {};
  const positionsB = {};

  for (const player of players) {
    if (player.locked) {
      const team = player.lockedTeam === 'A' ? teamA : teamB;
      const positions = player.lockedTeam === 'A' ? positionsA : positionsB;
      const pos = player.lockedPosition || player.positionData.main.name;
      team.push({ ...player, assignedPosition: pos });
      positions[pos] = true;
    }
  }

  const unlocked = players
    .filter((p) => !p.locked)
    .sort((a, b) => b.finalScore - a.finalScore);

  for (const player of unlocked) {
    const scoreA = teamA.reduce((sum, p) => sum + p.finalScore, 0);
    const scoreB = teamB.reduce((sum, p) => sum + p.finalScore, 0);

    const availA = POSITIONS.filter((p) => !positionsA[p]);
    const availB = POSITIONS.filter((p) => !positionsB[p]);
    const bestA = findBestPosition(player, availA);
    const bestB = findBestPosition(player, availB);

    if (teamA.length >= 5) {
      teamB.push({ ...player, assignedPosition: bestB });
      positionsB[bestB] = true;
    } else if (teamB.length >= 5) {
      teamA.push({ ...player, assignedPosition: bestA });
      positionsA[bestA] = true;
    } else if (scoreA <= scoreB) {
      teamA.push({ ...player, assignedPosition: bestA });
      positionsA[bestA] = true;
    } else {
      teamB.push({ ...player, assignedPosition: bestB });
      positionsB[bestB] = true;
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
