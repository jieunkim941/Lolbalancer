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
      {/* 헤더: 포지션 + 총점 */}
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

      {/* 닉네임 + 티어 */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-lg text-[#F0F0F0]">{player.name}</span>
        <span className="text-sm text-[#C8AA6E]">{player.tiers.current}</span>
      </div>

      <div className="border-t border-[#2A2A4A] my-3" />

      {/* 추천 포지션 */}
      <div className="mb-3">
        <p className="text-xs text-[#8888AA] mb-1.5">🗺 추천 포지션</p>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1">
            <span className="text-[#FFD600]">★</span>
            <span className="text-[#F0F0F0] font-semibold">{player.positionData.main.name}</span>
          </span>
          {player.positionData.sub && (
            <span className="flex items-center gap-1">
              <span className="text-[#8888AA]">☆</span>
              <span className="text-[#8888AA]">{player.positionData.sub.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* 추천 챔피언 */}
      {player.champion && (
        <div className="mb-3">
          <p className="text-xs text-[#8888AA] mb-1.5">🎮 추천 챔피언</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{player.champion.icon}</span>
            <span className="font-semibold text-sm text-[#F0F0F0]">{player.champion.name}</span>
            {player.lockedChampion && <span className="text-[#C8AA6E] text-xs">🔒</span>}
          </div>
        </div>
      )}

      {/* 고정 체크박스 */}
      <div className="border-t border-[#2A2A4A] my-3" />
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
