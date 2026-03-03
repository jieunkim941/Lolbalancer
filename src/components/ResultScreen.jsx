import { useState, useCallback } from 'react';
import PlayerCard from './PlayerCard';
import TeamComparison from './TeamComparison';
import { assignTeams } from '../utils/teamAssigner';
import { POSITIONS } from '../data/constants';

export default function ResultScreen({ teamData, onReassign, onReset }) {
  const [teamA, setTeamA] = useState(teamData.teamA);
  const [teamB, setTeamB] = useState(teamData.teamB);
  const [highlightedIds, setHighlightedIds] = useState(new Set());

  const toggleLock = useCallback((teamSetter, playerId, field) => {
    teamSetter((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, [field]: !p[field] } : p
      )
    );
  }, []);

  const handleReassign = () => {
    const allPlayers = [...teamA, ...teamB].map((p) => ({
      ...p,
      locked: p.lockedPosition || false,
      lockedTeam: teamA.find((a) => a.id === p.id) ? 'A' : 'B',
      lockedPosition: p.lockedPosition ? p.assignedPosition : undefined,
    }));

    const previousIds = new Set([
      ...teamA.map((p) => `A-${p.id}`),
      ...teamB.map((p) => `B-${p.id}`),
    ]);

    const result = assignTeams(allPlayers);
    setTeamA(result.teamA);
    setTeamB(result.teamB);

    // 변경된 카드 하이라이트
    const newIds = new Set();
    result.teamA.forEach((p) => {
      if (!previousIds.has(`A-${p.id}`)) newIds.add(p.id);
    });
    result.teamB.forEach((p) => {
      if (!previousIds.has(`B-${p.id}`)) newIds.add(p.id);
    });
    setHighlightedIds(newIds);
    setTimeout(() => setHighlightedIds(new Set()), 1000);
  };

  const lockedCount = [...teamA, ...teamB].filter(
    (p) => p.lockedPosition || p.lockedChampion
  ).length;

  // 포지션 순서대로 정렬
  const sortByPosition = (team) =>
    [...team].sort(
      (a, b) => POSITIONS.indexOf(a.assignedPosition) - POSITIONS.indexOf(b.assignedPosition)
    );

  return (
    <div className="min-h-screen px-8 py-6 max-w-7xl mx-auto">
      {/* 팀 비교 (sticky) */}
      <div className="sticky top-0 z-10 pt-2 pb-4 bg-[#0A0A0F]">
        <TeamComparison teamA={teamA} teamB={teamB} />
      </div>

      {/* 팀 카드 좌우 배치 */}
      <div className="grid grid-cols-2 gap-8">
        {/* Team A */}
        <div>
          <h2 className="text-xl font-bold text-[#4CC9FF] mb-4 text-center">TEAM A</h2>
          <div className="space-y-4">
            {sortByPosition(teamA).map((player) => (
              <div
                key={player.id}
                className={`transition-all duration-500 ${
                  highlightedIds.has(player.id)
                    ? 'ring-2 ring-[#4CC9FF] shadow-[0_0_20px_rgba(76,201,255,0.3)] rounded-xl'
                    : ''
                }`}
              >
                <PlayerCard
                  player={player}
                  team="A"
                  onToggleLockPosition={(id) => toggleLock(setTeamA, id, 'lockedPosition')}
                  onToggleLockChampion={(id) => toggleLock(setTeamA, id, 'lockedChampion')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div>
          <h2 className="text-xl font-bold text-[#FF4655] mb-4 text-center">TEAM B</h2>
          <div className="space-y-4">
            {sortByPosition(teamB).map((player) => (
              <div
                key={player.id}
                className={`transition-all duration-500 ${
                  highlightedIds.has(player.id)
                    ? 'ring-2 ring-[#FF4655] shadow-[0_0_20px_rgba(255,70,85,0.3)] rounded-xl'
                    : ''
                }`}
              >
                <PlayerCard
                  player={player}
                  team="B"
                  onToggleLockPosition={(id) => toggleLock(setTeamB, id, 'lockedPosition')}
                  onToggleLockChampion={(id) => toggleLock(setTeamB, id, 'lockedChampion')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="text-center mt-10 mb-8">
        <p className="text-sm text-[#8888AA] mb-4">
          고정: {lockedCount}명 | 재배정 대상: {10 - lockedCount}명
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReassign}
            className="px-8 py-3 bg-[#4CC9FF] text-[#0A0A0F] rounded-lg font-bold
                       hover:bg-[#4CC9FF]/80 hover:shadow-[0_0_20px_rgba(76,201,255,0.3)]
                       transition-all"
          >
            🔄 재배정
          </button>
          <button
            onClick={onReset}
            className="px-8 py-3 bg-[#2A2A4A] text-[#8888AA] rounded-lg font-bold
                       hover:bg-[#2A2A4A]/80 hover:text-[#F0F0F0]
                       transition-all"
          >
            ↩ 처음으로
          </button>
        </div>
      </div>
    </div>
  );
}
