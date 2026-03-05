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

  const allFilled = names.every((n) => n.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-[40px] font-bold mb-3 tracking-wide">
          <span className="text-[#C8AA6E]">⚔</span>{' '}
          <span className="text-[#C8AA6E] uppercase">Naejeonhajang</span>
        </h1>
        <p className="text-[#A09B8C] text-base max-w-md">
          10명의 소환사명을 입력하면 자동으로 밸런스를 맞춰 팀을 생성합니다
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[720px] bg-[#1E2328] border border-[rgba(200,170,110,0.2)] rounded-[10px] p-8 mb-8">
        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#F0E6D2]">소환사명 입력</h2>
          <button
            type="button"
            onClick={fillExample}
            className="px-4 py-2 text-sm text-[#C8AA6E] border border-[rgba(200,170,110,0.3)] rounded
                       hover:bg-[rgba(200,170,110,0.1)] transition-colors"
          >
            예시 채우기
          </button>
        </div>

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-4">
          {names.map((name, i) => (
            <div key={i}>
              <label className="block text-sm text-[#A09B8C] mb-1.5">
                소환사 {i + 1}
              </label>
              <PlayerSearchInput
                value={name}
                onChange={(val) => updateName(i, val)}
                placeholder="닉네임#TAG"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={() => { trackEvent('create_team'); onStart(names); }}
        disabled={!allFilled}
        className={`w-full max-w-[720px] h-[56px] rounded font-bold text-lg transition-all
          ${allFilled
            ? 'bg-gradient-to-r from-[#C8AA6E] to-[#A0884A] text-[#0A0A0F] hover:shadow-[0_4px_20px_rgba(200,170,110,0.3)]'
            : 'bg-[#2A2A3A] text-[#555] cursor-not-allowed'
          }`}
      >
        팀 생성하기
      </button>

      {/* Footer notes */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-xs text-[#A09B8C]">
          * Riot Games API를 통해 실시간 데이터를 수집합니다
        </p>
        <p className="text-xs text-[#A09B8C]">
          * 티어, 주 포지션, 최근 승률을 기반으로 자동 밸런싱됩니다
        </p>
      </div>
    </div>
  );
}
