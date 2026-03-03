import { useState, useEffect } from 'react';
import mockPlayers from '../data/mockPlayers';
import { calcPlayerScores } from '../utils/scoring';
import { assignTeams } from '../utils/teamAssigner';

const STATUS = { waiting: '○', analyzing: '◎', done: '✓' };

export default function LoadingScreen({ playerNames, onComplete }) {
  const [statuses, setStatuses] = useState(playerNames.map(() => 'waiting'));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= playerNames.length) {
      const scoredPlayers = mockPlayers.map((p) => calcPlayerScores(p));
      const teams = assignTeams(scoredPlayers);
      setTimeout(() => onComplete(teams), 500);
      return;
    }

    setStatuses((prev) => {
      const next = [...prev];
      next[current] = 'analyzing';
      return next;
    });

    const delay = 300 + Math.random() * 500;
    const timer = setTimeout(() => {
      setStatuses((prev) => {
        const next = [...prev];
        next[current] = 'done';
        return next;
      });
      setCurrent((c) => c + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [current]);

  const doneCount = statuses.filter((s) => s === 'done').length;
  const progress = (doneCount / playerNames.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <h2 className="text-2xl font-bold mb-2">데이터 수집 중...</h2>
      <p className="text-[#8888AA] mb-8">
        {doneCount}/{playerNames.length} 소환사 분석 완료
      </p>

      <div className="w-96 h-2 bg-[#2A2A4A] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#4CC9FF] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {playerNames.map((name, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm">
            <span
              className={
                statuses[i] === 'done'
                  ? 'text-[#00C853]'
                  : statuses[i] === 'analyzing'
                  ? 'text-[#4CC9FF] animate-pulse'
                  : 'text-[#8888AA]'
              }
            >
              {STATUS[statuses[i]]}
            </span>
            <span className={statuses[i] === 'done' ? 'text-[#F0F0F0]' : 'text-[#8888AA]'}>
              {name}
            </span>
            <span className="text-[#8888AA] text-xs">
              {statuses[i] === 'done' ? '완료' : statuses[i] === 'analyzing' ? '분석 중...' : '대기'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
