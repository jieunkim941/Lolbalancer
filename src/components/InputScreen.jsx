import { useState } from 'react';
import PlayerSearchInput from './PlayerSearchInput';
import mockPlayers from '../data/mockPlayers';
import { trackEvent } from '../utils/analytics';

export default function InputScreen({ onStart }) {
  const [names, setNames] = useState(Array(10).fill(''));

  const updateName = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const fillExample = () => {
    trackEvent('fill_example');
    setNames(mockPlayers.map((p) => `${p.name}#${p.tag}`));
  };

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const allFilled = names.every((n) => n.trim().length > 0);
  const filledCount = names.filter((n) => n.trim().length > 0).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 relative">
      {/* 앰비언트 배경 */}
      <div className="ambient-bg" />

      {/* Header */}
      <div className="text-center mb-10 fade-in-up relative z-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#C8AA6E]" />
          <span className="text-[#C8AA6E] text-2xl">⚔</span>
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#C8AA6E]" />
        </div>
        <h1 className="text-[44px] font-bold mb-3 tracking-wider text-glow-gold">
          <span className="text-[#C8AA6E] uppercase">Naejeonhajang</span>
        </h1>
        <p className="text-[#A09B8C] text-base max-w-md mx-auto leading-relaxed">
          10명의 소환사명을 입력하면 자동으로 밸런스를 맞춰 팀을 생성합니다
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[720px] glass-card rounded-xl p-8 mb-6 fade-in-up stagger-2 relative z-10">
        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[#F0E6D2]">소환사명 입력</h2>
            <p className="text-xs text-[#A09B8C] mt-1">
              {filledCount}/10 입력 완료
            </p>
          </div>
          <button
            type="button"
            onClick={fillExample}
            className="btn-ghost px-4 py-2 text-sm text-[#C8AA6E] rounded-lg font-medium"
          >
            예시 채우기
          </button>
        </div>

        {/* 진행 바 */}
        <div className="progress-bar-bg h-1 mb-6">
          <div
            className="progress-bar-fill h-full"
            style={{ width: `${(filledCount / 10) * 100}%` }}
          />
        </div>

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-4">
          {names.map((name, i) => (
            <div key={i} className={`fade-in-up stagger-${Math.min(i + 1, 10)} relative`}
              style={{ zIndex: focusedIndex === i ? 9999 : 1 }}
            >
              <label className="block text-sm text-[#A09B8C] mb-1.5 font-medium">
                소환사 {i + 1}
              </label>
              <div onFocus={() => setFocusedIndex(i)} onBlur={() => setFocusedIndex(-1)}>
                <PlayerSearchInput
                  value={name}
                  onChange={(val) => updateName(i, val)}
                  placeholder="닉네임#TAG"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={() => { trackEvent('create_team'); onStart(names); }}
        disabled={!allFilled}
        className={`w-full max-w-[720px] h-[56px] rounded-xl font-bold text-lg fade-in-up stagger-6 relative z-[1]
          ${allFilled
            ? 'btn-gold cursor-pointer'
            : 'bg-[#1E2328] text-[#555] cursor-not-allowed border border-[rgba(200,170,110,0.1)]'
          }`}
      >
        {allFilled ? '⚔ 팀 생성하기' : `소환사 ${10 - filledCount}명 더 입력해주세요`}
      </button>

      {/* Footer notes */}
      <div className="mt-6 text-center space-y-1 fade-in-up stagger-8 relative z-[1]">
        <p className="text-xs text-[#A09B8C]/60">
          Riot Games API를 통해 실시간 데이터를 수집합니다
        </p>
        <p className="text-xs text-[#A09B8C]/60">
          티어, 주 포지션, 최근 승률을 기반으로 자동 밸런싱됩니다
        </p>
      </div>
    </div>
  );
}
