import { useState, useEffect, useRef } from 'react';
import { fetchPlayerData } from '../api/riotApi';
import { apiDataToPlayer } from '../api/playerAdapter';
import { calcPlayerScores } from '../utils/scoring';
import { assignTeams } from '../utils/teamAssigner';
import { addToHistory } from '../hooks/usePlayerHistory';

export default function LoadingScreen({ playerNames, onComplete }) {
  const [statuses, setStatuses] = useState(playerNames.map(() => 'waiting'));
  const [errors, setErrors] = useState(playerNames.map(() => ''));
  const [players, setPlayers] = useState([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function analyzeOne(i) {
      setStatuses((prev) => {
        const next = [...prev];
        next[i] = 'analyzing';
        return next;
      });

      try {
        const apiData = await fetchPlayerData(playerNames[i]);
        const player = apiDataToPlayer(apiData, i, playerNames[i]);
        addToHistory(apiData);
        setStatuses((prev) => {
          const next = [...prev];
          next[i] = 'done';
          return next;
        });
        return player;
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
        return {
          id: i + 1,
          name: playerNames[i],
          tag: 'KR1',
          tiers: { current: 'Unranked', season1: 'Unranked', season2: 'Unranked' },
          positions: [{ name: 'MID', games: 1, wins: 0 }],
          champion: { name: '알 수 없음', icon: '❓', mastery: 1, winRate: 50, games: 0 },
          recentWinRate: 50,
        };
      }
    }

    async function analyzeAll() {
      const results = new Array(playerNames.length);
      const BATCH = 2; // 2명씩 호출
      const BATCH_DELAY = 1000; // 배치 간 1초 대기

      for (let start = 0; start < playerNames.length; start += BATCH) {
        if (start > 0) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY));
        }
        const batch = [];
        for (let j = start; j < Math.min(start + BATCH, playerNames.length); j++) {
          batch.push(analyzeOne(j).then((p) => { results[j] = p; }));
        }
        await Promise.all(batch);
      }

      const scoredPlayers = results.map((p) => calcPlayerScores(p));
      const teams = assignTeams(scoredPlayers);
      setTimeout(() => onComplete(teams), 500);
    }

    analyzeAll();
  }, []);

  const doneCount = statuses.filter((s) => s === 'done' || s === 'error').length;
  const progressPercent = (doneCount / playerNames.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 relative">
      {/* 앰비언트 배경 */}
      <div className="ambient-bg" />

      {/* Spinner icon */}
      <div className="relative mb-8 fade-in-up z-10">
        {/* 외부 링 */}
        <div
          className="w-[88px] h-[88px] rounded-full border-[3px] border-[rgba(200,170,110,0.08)]"
          style={{ animation: 'spin 3s linear infinite reverse' }}
        />
        {/* 내부 링 */}
        <div
          className="absolute inset-[8px] rounded-full border-[3px] border-[rgba(200,170,110,0.1)] border-t-[#C8AA6E]"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        {/* 중앙 카운터 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#C8AA6E] font-bold text-lg font-mono">{doneCount}/{playerNames.length}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[32px] font-bold text-[#F0E6D2] mb-2 fade-in-up stagger-1 z-10 text-glow-gold">
        데이터 수집 중...
      </h2>
      <p className="text-[16px] text-[#A09B8C] mb-4 fade-in-up stagger-2 z-10">
        소환사들의 프로필과 전적 정보를 가져오고 있습니다
      </p>

      {/* 전체 프로그레스 바 */}
      <div className="w-full max-w-[720px] mb-8 fade-in-up stagger-3 z-10">
        <div className="progress-bar-bg h-2">
          <div
            className="progress-bar-fill h-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[720px] glass-card rounded-xl p-8 z-10 fade-in-up stagger-4">
        {/* Card title */}
        <h3 className="text-[20px] font-bold text-[#F0E6D2] text-center mb-6">
          수집 중인 소환사
        </h3>

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-3">
          {playerNames.map((name, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                statuses[i] === 'done'
                  ? 'bg-[rgba(200,170,110,0.08)] border border-[rgba(200,170,110,0.15)]'
                  : statuses[i] === 'error'
                  ? 'bg-[rgba(255,70,85,0.06)] border border-[rgba(255,70,85,0.15)]'
                  : statuses[i] === 'analyzing'
                  ? 'bg-[rgba(200,170,110,0.05)] border border-[rgba(200,170,110,0.1)]'
                  : 'bg-[rgba(200,170,110,0.02)] border border-transparent'
              }`}
            >
              {/* User icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                statuses[i] === 'done'
                  ? 'bg-[rgba(200,170,110,0.12)]'
                  : 'bg-[#0A0A0F]'
              }`}>
                {statuses[i] === 'done' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8AA6E" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : statuses[i] === 'error' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A09B8C" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div className={`text-[15px] truncate font-medium ${
                  statuses[i] === 'done' ? 'text-[#F0E6D2]'
                  : statuses[i] === 'error' ? 'text-[#FF4655]'
                  : 'text-[#F0E6D2]/50'
                }`}>
                  {name.split('#')[0]}
                </div>
                <div className={`text-[13px] ${
                  statuses[i] === 'done' ? 'text-[#C8AA6E]'
                  : statuses[i] === 'error' ? 'text-[#FF4655]'
                  : 'text-[#A09B8C]'
                }`}>
                  {statuses[i] === 'done'
                    ? '✓ 완료'
                    : statuses[i] === 'error'
                    ? errors[i] || '오류'
                    : statuses[i] === 'analyzing'
                    ? '전적 분석 중...'
                    : '대기'}
                </div>
              </div>

              {/* Right: spinner for analyzing */}
              <div className="shrink-0">
                {statuses[i] === 'analyzing' && (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-[rgba(200,170,110,0.15)] border-t-[#C8AA6E]"
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="divider-glow mt-6 mb-5" />
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-3">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-[#C8AA6E]"
                style={{
                  animation: 'dotBounce 1.4s ease-in-out infinite',
                  animationDelay: `${idx * 0.2}s`,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-[#A09B8C]">
            솔로랭크 티어, 주 포지션, 최근 승률 정보 수집 중
          </p>
        </div>
      </div>
    </div>
  );
}
