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

const TIER_SHORT = {
  Challenger: 'C',
  Grandmaster: 'G',
  Master: 'M',
  'Diamond 1': 'DI', 'Diamond 2': 'DII', 'Diamond 3': 'DIII', 'Diamond 4': 'DIV',
  'Emerald 1': 'EI', 'Emerald 2': 'EII', 'Emerald 3': 'EIII', 'Emerald 4': 'EIV',
  'Platinum 1': 'PI', 'Platinum 2': 'PII', 'Platinum 3': 'PIII', 'Platinum 4': 'PIV',
  'Gold 1': 'GI', 'Gold 2': 'GII', 'Gold 3': 'GIII', 'Gold 4': 'GIV',
  'Silver 1': 'SI', 'Silver 2': 'SII', 'Silver 3': 'SIII', 'Silver 4': 'SIV',
  'Bronze 1': 'BI', 'Bronze 2': 'BII', 'Bronze 3': 'BIII', 'Bronze 4': 'BIV',
  'Iron 1': 'II', 'Iron 2': 'III', 'Iron 3': 'IIII', 'Iron 4': 'IIV',
  Unranked: 'U',
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

// 티어 문자열 → op.gg 엠블럼 이미지 키 (소문자)
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
  const tierShort = TIER_SHORT[player.tiers.current] || player.tiers.current.charAt(0);
  const tierColor = getTierColor(player.tiers.current);
  const isLocked = player.lockedTeam || player.lockedPosition || player.lockedChampion;

  return (
    <div
      className={`bg-[#1E2328] rounded-[6px] overflow-hidden transition-all ${
        isLocked
          ? 'border-2 border-[#C8AA6E] shadow-[0_0_12px_rgba(200,170,110,0.15)]'
          : 'border border-[rgba(200,170,110,0.12)]'
      }`}
    >
      {/* Collapsed row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(200,170,110,0.04)] transition-colors"
      >
        {/* Position badge */}
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded shrink-0 min-w-[60px] text-center"
          style={{ backgroundColor: posColor + '18', color: posColor }}
        >
          {player.assignedPosition}
        </span>

        {/* Name */}
        <span className="flex-1 text-left text-[#F0E6D2] font-medium truncate">{player.name}</span>

        {/* Lock icon */}
        {isLocked && <span className="text-[#C8AA6E] text-xs shrink-0">🔒</span>}

        {/* Tier badge */}
        <span
          className="text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1"
          style={{ backgroundColor: tierColor + '20', color: tierColor }}
        >
          <TierEmblem tier={player.tiers.current} size={16} />
          {player.tiers.current}
        </span>

        {/* Score */}
        <span className="text-sm font-mono font-bold text-[#F0E6D2] shrink-0 min-w-[32px] text-right">
          {player.finalScore}
        </span>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A09B8C"
          strokeWidth="2"
          className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[rgba(200,170,110,0.1)]">
          {/* 최근 3시즌 티어 */}
          <div className="mt-3 mb-4">
            <p className="text-xs text-[#A09B8C] mb-2 flex items-center gap-1">
              최근 3시즌 티어
              {player.tiers.rankType === 'flex' && (
                <span className="ml-1 text-[9px] bg-[#C8AA6E20] text-[#C8AA6E] px-1.5 py-0.5 rounded">자유랭크</span>
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
                  className="bg-[#0A0A0F] rounded px-3 py-2 text-center border border-[rgba(200,170,110,0.1)]"
                >
                  <p className="text-[10px] text-[#A09B8C] mb-0.5">{s.label}</p>
                  <div className="flex items-center justify-center gap-1">
                    <TierEmblem tier={s.tier} size={18} />
                    <p className="text-sm font-bold" style={{ color: getTierColor(s.tier) }}>
                      {TIER_SHORT[s.tier] || s.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 포지션 */}
          <div className="mb-4">
            <p className="text-xs text-[#A09B8C] mb-1.5 flex items-center gap-1">
              추천 포지션
            </p>
            <div className="flex items-center gap-2 text-sm">
              <PositionIcon position={player.positionData.main.name} />
              <span className="font-semibold text-[#F0E6D2]">{player.positionData.main.name}</span>
              {player.positionData.sub && (
                <span className="text-[#A09B8C] text-xs">(부: {player.positionData.sub.name})</span>
              )}
            </div>
          </div>

          {/* 추천 챔피언 */}
          {player.champion && (
            <div className="mb-4">
              <p className="text-xs text-[#A09B8C] mb-1.5 flex items-center gap-1">
                추천 챔피언
              </p>
              <div className="flex items-center gap-3 bg-[#0A0A0F] rounded p-2.5 border border-[rgba(200,170,110,0.1)]">
                <div className="w-10 h-10 rounded bg-[#1E2328] flex items-center justify-center overflow-hidden">
                  <ChampionIcon championKey={player.champion.championKey} ddragonVersion={player.ddragonVersion} size={40} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0E6D2]">{player.champion.name}</p>
                  <p className="text-xs text-[#A09B8C]">
                    {player.champion.games}게임 · 승률 {player.champion.winRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 고정 체크박스 */}
          <div className="flex gap-5 text-xs pt-2">
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
