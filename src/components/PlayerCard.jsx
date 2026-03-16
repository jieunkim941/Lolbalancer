import { useState } from 'react';

const POSITION_ICON_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg';
const POSITION_ICON_MAP = {
  TOP: 'position-top.svg',
  JG: 'position-jungle.svg',
  MID: 'position-middle.svg',
  ADC: 'position-bottom.svg',
  SUP: 'position-utility.svg',
};

function PositionIcon({ position, size = 16 }) {
  const file = POSITION_ICON_MAP[position];
  if (!file) return null;
  return (
    <img
      src={`${POSITION_ICON_BASE}/${file}`}
      alt={position}
      width={size}
      height={size}
      className="brightness-0 invert opacity-80"
    />
  );
}

const POSITION_COLORS = {
  TOP: '#FF6B6B',
  JG: '#4ECDC4',
  MID: '#4CC9FF',
  ADC: '#FFD93D',
  SUP: '#C084FC',
};

const TIER_COLORS = {
  Challenger: '#F4C874',
  Grandmaster: '#FF4E50',
  Master: '#9B59B6',
  Diamond: '#576CBC',
  Emerald: '#2ECC71',
  Platinum: '#1ABC9C',
  Gold: '#F1C40F',
  Silver: '#95A5A6',
  Bronze: '#CD7F32',
  Iron: '#7F8C8D',
  Unranked: '#555',
};

function getTierColor(tier) {
  for (const [key, color] of Object.entries(TIER_COLORS)) {
    if (tier.startsWith(key)) return color;
  }
  return '#555';
}

function getTierImageKey(tier) {
  const t = tier.toLowerCase();
  if (t.startsWith('challenger')) return 'challenger';
  if (t.startsWith('grandmaster')) return 'grandmaster';
  if (t.startsWith('master')) return 'master';
  if (t.startsWith('diamond')) return 'diamond';
  if (t.startsWith('emerald')) return 'emerald';
  if (t.startsWith('platinum')) return 'platinum';
  if (t.startsWith('gold')) return 'gold';
  if (t.startsWith('silver')) return 'silver';
  if (t.startsWith('bronze')) return 'bronze';
  if (t.startsWith('iron')) return 'iron';
  return null;
}

function TierEmblem({ tier, size = 20 }) {
  const key = getTierImageKey(tier);
  if (!key) return null;
  return (
    <img
      src={`https://opgg-static.akamaized.net/images/medals_new/${key}.png`}
      alt={tier}
      width={size}
      height={size}
      className="inline-block"
      style={{ objectFit: 'contain' }}
    />
  );
}

function ChampionIcon({ championKey, ddragonVersion, size = 40 }) {
  if (!championKey) return <span className="text-lg">🎮</span>;
  return (
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${championKey}.png`}
      alt={championKey}
      width={size}
      height={size}
      className="rounded"
      style={{ objectFit: 'cover' }}
    />
  );
}

export default function PlayerCard({ player, team, onToggleLockTeam, onToggleLockPosition, onToggleLockChampion }) {
  const [expanded, setExpanded] = useState(false);
  const posColor = POSITION_COLORS[player.assignedPosition] || '#A09B8C';
  const tierColor = getTierColor(player.tiers.current);
  const isLocked = player.lockedTeam || player.lockedPosition || player.lockedChampion;
  const teamColor = team === 'A' ? '#4CC9FF' : '#FF4655';
  const teamColorDim = team === 'A' ? 'rgba(76,201,255,0.06)' : 'rgba(255,70,85,0.06)';
  const teamBorder = team === 'A' ? 'rgba(76,201,255,0.15)' : 'rgba(255,70,85,0.15)';

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-200 ${
        isLocked
          ? 'border-2 border-[#C8AA6E] shadow-[0_0_16px_rgba(200,170,110,0.12)]'
          : 'border border-[rgba(200,170,110,0.1)]'
      }`}
      style={{
        background: `linear-gradient(135deg, ${teamColorDim} 0%, rgba(30,35,40,0.95) 40%, rgba(26,26,46,0.9) 100%)`,
      }}
    >
      {/* Collapsed row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        {/* 팀 컬러 인디케이터 */}
        <div
          className="w-[3px] h-8 rounded-full shrink-0"
          style={{ backgroundColor: teamColor, opacity: 0.6 }}
        />

        {/* Position badge */}
        <div className="flex flex-col items-center shrink-0 min-w-[44px]">
          <PositionIcon position={player.assignedPosition} size={18} />
          <span
            className="text-[10px] font-bold mt-0.5"
            style={{ color: posColor }}
          >
            {player.assignedPosition}
          </span>
        </div>

        {/* Name + 승률 */}
        <div className="flex-1 text-left min-w-0">
          <span className="text-[15px] text-[#F0E6D2] font-semibold truncate block">{player.name}</span>
          <span className="text-[11px] text-[#A09B8C]">
            승률 {player.champion?.winRate ?? '-'}%
          </span>
        </div>

        {/* Lock icon */}
        {isLocked && (
          <span className="text-[#C8AA6E] text-[10px] bg-[rgba(200,170,110,0.1)] px-1.5 py-0.5 rounded shrink-0">
            🔒
          </span>
        )}

        {/* Tier badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md shrink-0"
          style={{ backgroundColor: tierColor + '14', border: `1px solid ${tierColor}25` }}
        >
          <TierEmblem tier={player.tiers.current} size={18} />
          <span className="text-[11px] font-bold" style={{ color: tierColor }}>
            {player.tiers.current}
          </span>
        </div>

        {/* Score */}
        <div className="shrink-0 min-w-[40px] text-right">
          <span className="text-[17px] font-mono font-bold" style={{ color: teamColor }}>
            {player.finalScore}
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A09B8C"
          strokeWidth="2.5"
          className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="divider-glow mb-4" />

          {/* 상단: 티어 + 챔피언 나란히 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 좌: 추천 챔피언 */}
            {player.champion && (
              <div
                className="rounded-lg p-3 border"
                style={{ backgroundColor: 'rgba(10,10,15,0.5)', borderColor: teamBorder }}
              >
                <p className="text-[10px] text-[#A09B8C] mb-2 uppercase tracking-wider font-semibold">추천 챔피언</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#1E2328] flex items-center justify-center overflow-hidden border border-[rgba(200,170,110,0.08)]">
                    <ChampionIcon championKey={player.champion.championKey} ddragonVersion={player.ddragonVersion} size={44} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0E6D2]">{player.champion.name}</p>
                    <p className="text-[11px] text-[#A09B8C]">
                      {player.champion.games}게임 · <span style={{ color: player.champion.winRate >= 50 ? '#00C853' : '#FF4655' }}>{player.champion.winRate}%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 우: 추천 포지션 */}
            <div
              className="rounded-lg p-3 border"
              style={{ backgroundColor: 'rgba(10,10,15,0.5)', borderColor: teamBorder }}
            >
              <p className="text-[10px] text-[#A09B8C] mb-2 uppercase tracking-wider font-semibold">추천 포지션</p>
              <div className="flex items-center gap-2.5 mt-1">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: posColor + '15', border: `1px solid ${posColor}30` }}
                >
                  <PositionIcon position={player.positionData.main.name} size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F0E6D2]">{player.positionData.main.name}</p>
                  {player.positionData.sub && (
                    <p className="text-[11px] text-[#A09B8C]">부: {player.positionData.sub.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3시즌 티어 */}
          <div className="mb-4">
            <p className="text-[10px] text-[#A09B8C] mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
              시즌 티어 추이
              {player.tiers.rankType === 'flex' && (
                <span className="text-[9px] bg-[#C8AA6E20] text-[#C8AA6E] px-1.5 py-0.5 rounded normal-case">자유랭크</span>
              )}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: `${player.tiers.currentLabel} (50%)`, tier: player.tiers.current },
                { label: `${player.tiers.season1Label} (30%)`, tier: player.tiers.season1 },
                { label: `${player.tiers.season2Label} (20%)`, tier: player.tiers.season2 },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg px-3 py-2.5 text-center border"
                  style={{ backgroundColor: 'rgba(10,10,15,0.5)', borderColor: 'rgba(200,170,110,0.06)' }}
                >
                  <p className="text-[10px] text-[#A09B8C] mb-1">{s.label}</p>
                  <div className="flex items-center justify-center gap-1">
                    <TierEmblem tier={s.tier} size={20} />
                    <p className="text-[13px] font-bold" style={{ color: getTierColor(s.tier) }}>
                      {s.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 고정 체크박스 */}
          <div
            className="flex gap-4 text-xs pt-2 px-3 py-2.5 rounded-lg border"
            style={{ backgroundColor: 'rgba(10,10,15,0.3)', borderColor: 'rgba(200,170,110,0.06)' }}
          >
            <label className="flex items-center gap-1.5 cursor-pointer text-[#A09B8C] hover:text-[#F0E6D2] transition-colors">
              <input
                type="checkbox"
                checked={player.lockedTeam || false}
                onChange={() => onToggleLockTeam(player.id)}
                className="accent-[#C8AA6E]"
              />
              팀 고정
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#A09B8C] hover:text-[#F0E6D2] transition-colors">
              <input
                type="checkbox"
                checked={player.lockedPosition || false}
                onChange={() => onToggleLockPosition(player.id)}
                className="accent-[#C8AA6E]"
              />
              포지션 고정
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#A09B8C] hover:text-[#F0E6D2] transition-colors">
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
      )}
    </div>
  );
}
