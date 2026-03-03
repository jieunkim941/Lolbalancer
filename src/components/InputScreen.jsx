import { useState } from 'react';

export default function InputScreen({ onStart }) {
  const [names, setNames] = useState(Array(10).fill(''));

  const updateName = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const allFilled = names.every((n) => n.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      {/* 타이틀 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-[#4CC9FF]">⚔</span> LoL 내전 밸런서
        </h1>
        <p className="text-[#8888AA] text-lg">공정한 5:5를 위한 팀 배정</p>
      </div>

      {/* 입력 영역 */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[#8888AA] font-mono w-6 text-right text-sm">
              {i + 1}.
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder="닉네임#TAG"
              className="w-72 px-4 py-3 bg-[#1A1A2E] border border-[#2A2A4A] rounded-lg
                         text-[#F0F0F0] placeholder-[#8888AA]/50
                         focus:outline-none focus:border-[#4CC9FF] focus:ring-1 focus:ring-[#4CC9FF]/30
                         transition-colors"
            />
          </div>
        ))}
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={() => onStart(names)}
        disabled={!allFilled}
        className={`px-10 py-4 rounded-lg font-bold text-lg transition-all
          ${allFilled
            ? 'bg-[#4CC9FF] text-[#0A0A0F] hover:bg-[#4CC9FF]/80 hover:shadow-[0_0_20px_rgba(76,201,255,0.3)]'
            : 'bg-[#2A2A4A] text-[#8888AA] cursor-not-allowed'
          }`}
      >
        팀 배정 시작
      </button>
    </div>
  );
}
