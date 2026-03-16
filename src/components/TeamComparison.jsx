import { BALANCE_THRESHOLDS } from '../data/constants';

export default function TeamComparison({ teamA, teamB }) {
  const scoreA = teamA.reduce((sum, p) => sum + p.finalScore, 0);
  const scoreB = teamB.reduce((sum, p) => sum + p.finalScore, 0);
  const diff = Math.abs(scoreA - scoreB);
  const total = scoreA + scoreB;
  const diffPercent = total > 0 ? (diff / total) * 100 : 0;
  const ratioA = total > 0 ? (scoreA / total) * 100 : 50;

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
    <div className="glass-card rounded-xl p-6">
      <div className="grid grid-cols-3 items-center text-center mb-5">
        {/* Team A 총점 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">팀 A 총점</p>
          <p className="text-[32px] font-bold text-[#4CC9FF]">{Math.round(scoreA)}</p>
        </div>

        {/* 밸런스 차이 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">밸런스 차이</p>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="text-[28px] font-bold text-[#F0E6D2]">{Math.round(diff)}</span>
          </div>
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-semibold badge-pulse"
            style={{ backgroundColor: balanceColor + '20', color: balanceColor }}
          >
            {balanceLabel}
          </span>
        </div>

        {/* Team B 총점 */}
        <div>
          <p className="text-sm text-[#A09B8C] mb-1">팀 B 총점</p>
          <p className="text-[32px] font-bold text-[#FF4655]">{Math.round(scoreB)}</p>
        </div>
      </div>

      {/* 비주얼 밸런스 바 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4CC9FF] font-mono w-10 text-right">{Math.round(ratioA)}%</span>
        <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden flex">
          <div
            className="team-bar bg-gradient-to-r from-[#4CC9FF] to-[#3AA8DD]"
            style={{ width: `${ratioA}%`, height: '100%' }}
          />
          <div
            className="team-bar bg-gradient-to-r from-[#DD3A3A] to-[#FF4655]"
            style={{ width: `${100 - ratioA}%`, height: '100%' }}
          />
        </div>
        <span className="text-xs text-[#FF4655] font-mono w-10">{Math.round(100 - ratioA)}%</span>
      </div>
    </div>
  );
}
