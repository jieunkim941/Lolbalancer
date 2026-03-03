import { POSITIONS, BALANCE_THRESHOLDS } from '../data/constants';

export default function TeamComparison({ teamA, teamB }) {
  const scoreA = teamA.reduce((sum, p) => sum + p.finalScore, 0);
  const scoreB = teamB.reduce((sum, p) => sum + p.finalScore, 0);
  const total = scoreA + scoreB;
  const diff = Math.abs(scoreA - scoreB);
  const diffPercent = total > 0 ? (diff / total) * 100 : 0;
  const percentA = total > 0 ? (scoreA / total) * 100 : 50;

  let balanceStatus, balanceColor;
  if (diffPercent < BALANCE_THRESHOLDS.excellent) {
    balanceStatus = '밸런스 우수';
    balanceColor = '#00C853';
  } else if (diffPercent < BALANCE_THRESHOLDS.good) {
    balanceStatus = '밸런스 양호';
    balanceColor = '#FFD600';
  } else {
    balanceStatus = '밸런스 불균형';
    balanceColor = '#FF4655';
  }

  const positionComparison = POSITIONS.map((pos) => {
    const playerA = teamA.find((p) => p.assignedPosition === pos);
    const playerB = teamB.find((p) => p.assignedPosition === pos);
    return {
      position: pos,
      scoreA: playerA?.finalScore ?? 0,
      scoreB: playerB?.finalScore ?? 0,
    };
  });

  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-xl p-6 mb-8">
      {/* 총합 비교 */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xl text-[#4CC9FF]">
          TEAM A: {Math.round(scoreA * 10) / 10}
        </span>
        <span className="font-bold text-xl text-[#FF4655]">
          TEAM B: {Math.round(scoreB * 10) / 10}
        </span>
      </div>

      {/* 비율 바 */}
      <div className="w-full h-3 bg-[#2A2A4A] rounded-full overflow-hidden mb-2 flex">
        <div
          className="h-full bg-[#4CC9FF] transition-all duration-500"
          style={{ width: `${percentA}%` }}
        />
        <div
          className="h-full bg-[#FF4655] transition-all duration-500"
          style={{ width: `${100 - percentA}%` }}
        />
      </div>

      {/* 차이 + 밸런스 상태 */}
      <div className="text-center mb-4">
        <p className="text-sm text-[#8888AA]">
          차이: {Math.round(diff * 10) / 10} ({Math.round(diffPercent * 10) / 10}%)
        </p>
        <p className="text-sm font-bold" style={{ color: balanceColor }}>
          ✅ {balanceStatus}
        </p>
      </div>

      {/* 포지션별 비교 */}
      <div className="space-y-2">
        {positionComparison.map(({ position, scoreA: sA, scoreB: sB }) => {
          const posTotal = sA + sB;
          const pctA = posTotal > 0 ? (sA / posTotal) * 100 : 50;
          return (
            <div key={position} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-8 text-[#8888AA]">{position}</span>
              <span className="w-12 text-right text-[#4CC9FF]">{Math.round(sA * 10) / 10}</span>
              <div className="flex-1 h-1.5 bg-[#2A2A4A] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#4CC9FF]" style={{ width: `${pctA}%` }} />
                <div className="h-full bg-[#FF4655]" style={{ width: `${100 - pctA}%` }} />
              </div>
              <span className="w-12 text-[#FF4655]">{Math.round(sB * 10) / 10}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
