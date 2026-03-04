import { useState, useEffect, useRef } from 'react';
import { fetchPlayerData } from '../api/riotApi';
import { apiDataToPlayer } from '../api/playerAdapter';
import { calcPlayerScores } from '../utils/scoring';
import { assignTeams } from '../utils/teamAssigner';

const STATUS = { waiting: '○', analyzing: '◎', done: '✓', error: '✗' };

export default function LoadingScreen({ playerNames, onComplete }) {
  const [statuses, setStatuses] = useState(playerNames.map(() => 'waiting'));
  const [errors, setErrors] = useState(playerNames.map(() => ''));
  const [players, setPlayers] = useState([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function analyzeAll() {
      const results = [];

      for (let i = 0; i < playerNames.length; i++) {
        // 분석 시작
        setStatuses((prev) => {
          const next = [...prev];
          next[i] = 'analyzing';
          return next;
        });

        try {
          const apiData = await fetchPlayerData(playerNames[i]);
          const player = apiDataToPlayer(apiData, i, playerNames[i]);
          results.push(player);

          setStatuses((prev) => {
            const next = [...prev];
            next[i] = 'done';
            return next;
          });
        } catch (err) {
          console.error(`Error fetching ${playerNames[i]}:`, err);
          setStatuses((prev) => {
            const next = [...prev];
            next[i] = 'error';
            return next;
          });
          setErrors((prev) => {
            const next = [...prev];
            next[i] = err.message;
            return next;
          });
          // 에러 시 기본 데이터로 대체
          results.push({
            id: i + 1,
            name: playerNames[i],
            tag: 'KR1',
            tiers: { current: 'Unranked', season1: 'Unranked', season2: 'Unranked' },
            positions: [{ name: 'MID', games: 1, wins: 0 }],
            champion: { name: '알 수 없음', icon: '❓', mastery: 1, winRate: 50, games: 0 },
            recentWinRate: 50,
          });
        }
      }

      // 점수 계산 + 팀 배정
      const scoredPlayers = results.map((p) => calcPlayerScores(p));
      const teams = assignTeams(scoredPlayers);
      setTimeout(() => onComplete(teams), 500);
    }

    analyzeAll();
  }, []);

  const doneCount = statuses.filter((s) => s === 'done' || s === 'error').length;
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
                  : statuses[i] === 'error'
                  ? 'text-[#FF4655]'
                  : statuses[i] === 'analyzing'
                  ? 'text-[#4CC9FF] animate-pulse'
                  : 'text-[#8888AA]'
              }
            >
              {STATUS[statuses[i]]}
            </span>
            <span className={
              statuses[i] === 'done' ? 'text-[#F0F0F0]'
              : statuses[i] === 'error' ? 'text-[#FF4655]'
              : 'text-[#8888AA]'
            }>
              {name}
            </span>
            <span className="text-[#8888AA] text-xs">
              {statuses[i] === 'done'
                ? '완료'
                : statuses[i] === 'error'
                ? errors[i] || '오류'
                : statuses[i] === 'analyzing'
                ? '분석 중...'
                : '대기'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
