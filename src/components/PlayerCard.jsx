export default function PlayerCard({ player, team, onToggleLockPosition, onToggleLockChampion }) {
  const teamColor = team === 'A' ? '#4CC9FF' : '#FF4655';
  const isLocked = player.lockedPosition || player.lockedChampion;

  return (
    <div
      className={`rounded-xl p-5 transition-all ${
        isLocked ? 'border-2 border-[#C8AA6E] shadow-[0_0_12px_rgba(200,170,110,0.2)]' : 'border border-[#2A2A4A]'
      }`}
      style={{ backgroundColor: '#1A1A2E' }}
    >
      {/* 헤더: 포지션 + FinalScore */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLocked && <span className="text-[#C8AA6E]">🔒</span>}
          <span
            className="text-sm font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: teamColor + '20', color: teamColor }}
          >
            {player.assignedPosition}
          </span>
        </div>
        <span className="font-mono font-bold text-lg" style={{ color: teamColor }}>
          {player.finalScore}
        </span>
      </div>

      {/* 소환사 정보 */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-lg text-[#F0F0F0]">{player.name}</span>
        <span className="text-sm text-[#C8AA6E]">{player.tiers.current}</span>
      </div>

      <div className="border-t border-[#2A2A4A] my-3" />

      {/* 점수 구성 */}
      <div className="mb-4">
        <p className="text-xs text-[#8888AA] mb-2">📊 점수 구성</p>
        <div className="grid grid-cols-2 gap-1 text-sm font-mono">
          <span className="text-[#8888AA]">TierScore</span>
          <span className="text-right text-[#F0F0F0]">{player.tierScore}</span>
          <span className="text-[#8888AA]">MainWinRate</span>
          <span className="text-right text-[#F0F0F0]">{player.mainWinRate}%</span>
          <span className="text-[#8888AA]">RecentWinRate</span>
          <span className="text-right text-[#F0F0F0]">{player.recentWinRate}%</span>
          <span className="text-[#8888AA]">RawScore</span>
          <span className="text-right text-[#4CC9FF]">{player.rawScore}</span>
        </div>
      </div>

      {/* 챔피언 고정 */}
      {player.champion && (
        <div className="mb-4">
          <p className="text-xs text-[#8888AA] mb-2">🎮 챔피언</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{player.champion.icon}</span>
            <span className="font-semibold text-[#F0F0F0]">{player.champion.name}</span>
            {player.lockedChampion && <span className="text-[#C8AA6E] text-xs">🔒</span>}
          </div>
          <div className="text-xs text-[#8888AA] font-mono space-y-0.5">
            <p>숙련도 M{player.champion.mastery} | 승률 {player.champion.winRate}% | {player.champion.games}게임</p>
            <p>ChampionScore: <span className="text-[#00C853]">+{player.championScore}</span></p>
            <p>Raw + Champ: <span className="text-[#4CC9FF]">{player.rawScoreWithChamp}</span></p>
          </div>
        </div>
      )}

      {/* 포지션 정보 */}
      <div className="mb-4">
        <p className="text-xs text-[#8888AA] mb-2">🗺 포지션</p>
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#FFD600]">★</span>
            <span className="text-[#F0F0F0] w-8">{player.positionData.main.name}</span>
            <span className="text-[#8888AA]">({player.positionData.main.weight})</span>
            <span className="text-[#8888AA] ml-auto">
              {player.positionData.main.games}회 | 승률 {Math.round(player.positionData.main.wins / player.positionData.main.games * 100)}%
            </span>
          </div>
          {player.positionData.sub && (
            <div className="flex items-center gap-2">
              <span className="text-[#8888AA]">☆</span>
              <span className="text-[#F0F0F0] w-8">{player.positionData.sub.name}</span>
              <span className="text-[#8888AA]">({player.positionData.sub.weight})</span>
              <span className="text-[#8888AA] ml-auto">
                {player.positionData.sub.games}회 | 승률 {Math.round(player.positionData.sub.wins / player.positionData.sub.games * 100)}%
              </span>
            </div>
          )}
          {player.positionData.others.map((pos) => (
            <div key={pos.name} className="flex items-center gap-2">
              <span className="text-[#8888AA]">·</span>
              <span className="text-[#8888AA] w-8">{pos.name}</span>
              <span className="text-[#8888AA]">({pos.weight})</span>
              <span className="text-[#8888AA] ml-auto">
                {pos.games}회 | 승률 {Math.round(pos.wins / pos.games * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 최종 계산 */}
      <div className="text-xs font-mono text-[#8888AA] mb-3 bg-[#0A0A0F] rounded px-3 py-2">
        최종: {player.rawScoreWithChamp} × {
          player.assignedPosition === player.positionData.main.name
            ? player.positionData.main.weight
            : player.positionData.sub?.name === player.assignedPosition
            ? player.positionData.sub.weight
            : 0.6
        } = <span className="text-[#4CC9FF] font-bold">{player.finalScore}</span>
      </div>

      {/* 고정 체크박스 */}
      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer text-[#8888AA] hover:text-[#F0F0F0] transition-colors">
          <input
            type="checkbox"
            checked={player.lockedPosition || false}
            onChange={() => onToggleLockPosition(player.id)}
            className="accent-[#C8AA6E]"
          />
          포지션 고정
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-[#8888AA] hover:text-[#F0F0F0] transition-colors">
          <input
            type="checkbox"
            checked={player.lockedChampion || false}
            onChange={() => onToggleLockChampion(player.id)}
            className="accent-[#C8AA6E]"
          />
          챔피언 고정
        </label>
      </div>
    </div>
  );
}
