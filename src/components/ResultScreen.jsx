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
    const allPlayers = [...teamA, ...teamB].map((p) => {
      const currentTeam = teamA.find((a) => a.id === p.id) ? 'A' : 'B';
      const isTeamLocked = p.lockedTeam || p.lockedPosition || false;
      return {
        ...p,
        locked: isTeamLocked,
        lockedTeam: isTeamLocked ? currentTeam : undefined,
        lockedPosition: p.lockedPosition ? p.assignedPosition : undefined,
      };
    });

    const previousIds = new Set([
      ...teamA.map((p) => `A-${p.id}`),
      ...teamB.map((p) => `B-${p.id}`),
    ]);

    const result = assignTeams(allPlayers);
    setTeamA(result.teamA);
    setTeamB(result.teamB);

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

  const sortByPosition = (team) =>
    [...team].sort(
      (a, b) => POSITIONS.indexOf(a.assignedPosition) - POSITIONS.indexOf(b.assignedPosition)
    );

  return (
    <div className="min-h-screen px-8 py-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold mb-2">
          <span className="text-[#C8AA6E]">⚔ 자동 라인 배정 + 밸런스 결과</span>
        </h1>
        <p className="text-[#A09B8C] text-sm mb-1">
          각 플레이어의 주 포지션과 승률을 고려한 최적의 팀 배정
        </p>
        <p className="text-[#C8AA6E] text-sm">
          챔피언을 선택하거나 포지션을 고정한 후 재배정을 눌러보세요
        </p>
      </div>

      {/* Score comparison */}
      <div className="mb-8">
        <TeamComparison teamA={teamA} teamB={teamB} />
      </div>

      {/* Two team columns */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {/* Team A */}
        <div>
          <div className="border-l-4 border-[#4CC9FF] bg-[#1E2328] rounded-[10px] px-6 py-4 mb-4">
            <h2 className="text-xl font-bold text-[#4CC9FF] text-center">팀 A</h2>
            <p className="text-sm text-[#A09B8C] text-center">
              총점: {Math.round(teamA.reduce((s, p) => s + p.finalScore, 0))}
            </p>
          </div>
          <div className="space-y-2">
            {sortByPosition(teamA).map((player) => (
              <div
                key={player.id}
                className={`transition-all duration-500 ${
                  highlightedIds.has(player.id)
                    ? 'ring-2 ring-[#4CC9FF] shadow-[0_0_20px_rgba(76,201,255,0.3)] rounded-[6px]'
                    : ''
                }`}
              >
                <PlayerCard
                  player={player}
                  team="A"
                  onToggleLockTeam={(id) => toggleLock(setTeamA, id, 'lockedTeam')}
                  onToggleLockPosition={(id) => toggleLock(setTeamA, id, 'lockedPosition')}
                  onToggleLockChampion={(id) => toggleLock(setTeamA, id, 'lockedChampion')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div>
          <div className="border-l-4 border-[#FF4655] bg-[#1E2328] rounded-[10px] px-6 py-4 mb-4">
            <h2 className="text-xl font-bold text-[#FF4655] text-center">팀 B</h2>
            <p className="text-sm text-[#A09B8C] text-center">
              총점: {Math.round(teamB.reduce((s, p) => s + p.finalScore, 0))}
            </p>
          </div>
          <div className="space-y-2">
            {sortByPosition(teamB).map((player) => (
              <div
                key={player.id}
                className={`transition-all duration-500 ${
                  highlightedIds.has(player.id)
                    ? 'ring-2 ring-[#FF4655] shadow-[0_0_20px_rgba(255,70,85,0.3)] rounded-[6px]'
                    : ''
                }`}
              >
                <PlayerCard
                  player={player}
                  team="B"
                  onToggleLockTeam={(id) => toggleLock(setTeamB, id, 'lockedTeam')}
                  onToggleLockPosition={(id) => toggleLock(setTeamB, id, 'lockedPosition')}
                  onToggleLockChampion={(id) => toggleLock(setTeamB, id, 'lockedChampion')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-4 justify-center mb-4">
        <button
          onClick={onReset}
          className="px-10 py-3 bg-[#1E2328] border border-[rgba(200,170,110,0.2)] text-[#F0E6D2] rounded font-semibold
                     hover:bg-[rgba(200,170,110,0.08)] transition-all min-w-[180px]"
        >
          처음으로
        </button>
        <button
          onClick={handleReassign}
          className="px-10 py-3 bg-gradient-to-r from-[#C8AA6E] to-[#A0884A] text-[#0A0A0F] rounded font-semibold
                     hover:shadow-[0_4px_20px_rgba(200,170,110,0.3)] transition-all min-w-[200px] flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          재배정하기
        </button>
      </div>
    </div>
  );
}
