import { BALANCE_THRESHOLDS } from '../data/constants';

export default function TeamComparison({ teamA, teamB }) {
  const scoreA = teamA.reduce((sum, p) => sum + p.finalScore, 0);
  const scoreB = teamB.reduce((sum, p) => sum + p.finalScore, 0);
  const diff = Math.abs(scoreA - scoreB);
  const total = scoreA + scoreB;
  const diffPercent = total > 0 ? (diff / total) * 100 : 0;

  let balanceLabel, balanceColor;
  if (diffPercent < BALANCE_THRESHOLDS.excellent) {
    balanceLabel = '매우 좋음';
    balanceColor = '#00C853';
  } else if (diffPercent < BALANCE_THRESHOLDS.good) {
    balanceLabel = '양호';
    balanceColor = '#C8AA6E';
  } else {
    balanceLabel = '불균형';
    balanceColor = '#FF4655';
  }

  return (
    <div className="bg-[#1E2328] border border-[rgba(200,170,110,0.2)] rounded-[10px] p-6">
      <div className="grid grid-cols-3 items-center text-center">
        {/* Team A 총점 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">팀 A 총점</p>
          <p className="text-[32px] font-bold text-[#F0E6D2]">{Math.round(scoreA)}</p>
        </div>

        {/* 밸런스 차이 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">밸런스 차이</p>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={balanceColor} strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[24px] font-bold text-[#F0E6D2]">{Math.round(diff)}</span>
          </div>
          <span
            className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: balanceColor + '20', color: balanceColor }}
          >
            {balanceLabel}
          </span>
        </div>

        {/* Team B 총점 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">팀 B 총점</p>
          <p className="text-[32px] font-bold text-[#F0E6D2]">{Math.round(scoreB)}</p>
        </div>
      </div>
    </div>
  );
}
