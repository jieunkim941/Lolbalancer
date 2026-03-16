import { useState, useEffect, useRef, useCallback } from 'react';
import { searchPlayers } from '../api/riotApi';
import { searchHistory } from '../hooks/usePlayerHistory';
import { searchFriends } from '../data/friends';

const PROFILE_ICON_URL = 'https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon';

export default function PlayerSearchInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [historyResults, setHistoryResults] = useState([]);
  const [friendResults, setFriendResults] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  const query = value.trim();
  const hasTag = value.includes('#');

  // 친구 + 히스토리 즉시 검색
  useEffect(() => {
    if (hasTag) {
      setFriendResults([]);
      setHistoryResults([]);
      return;
    }
    setFriendResults(query ? searchFriends(query) : searchFriends(''));
    setHistoryResults(query ? searchHistory(query) : []);
  }, [query, hasTag]);

  // API 디바운스 검색
  useEffect(() => {
    if (!query || hasTag || query.length < 2) {
      setApiResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlayers(query);
      setApiResults(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query, hasTag]);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (player) => {
      onChange(`${player.gameName}#${player.tagLine}`);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  // 친구 목록에서 히스토리/API와 중복 제거
  const usedNames = new Set([
    ...historyResults.map((p) => `${p.gameName}#${p.tagLine}`),
  ]);
  const dedupedFriends = friendResults.filter(
    (f) => !usedNames.has(`${f.gameName}#${f.tagLine}`)
  );
  const historyPuuids = new Set(historyResults.map((p) => p.puuid));
  const dedupedApi = apiResults.filter((p) => !historyPuuids.has(p.puuid));
  const allResults = [...dedupedFriends, ...historyResults, ...dedupedApi];
  const showDropdown = open && !hasTag && (allResults.length > 0 || loading);

  // 결과 변경 시 activeIndex 리셋
  useEffect(() => {
    setActiveIndex(-1);
  }, [allResults.length]);

  // 키보드 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < allResults.length - 1 ? prev + 1 : 0;
        scrollToItem(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : allResults.length - 1;
        scrollToItem(next);
        return next;
      });
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < allResults.length) {
      e.preventDefault();
      handleSelect(allResults[activeIndex]);
    }
  };

  const scrollToItem = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => !hasTag && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-[52px] px-4 input-glow rounded-lg
                   text-[#F0E6D2] placeholder-[#A09B8C]/40
                   focus:outline-none transition-all"
      />

      {showDropdown && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto
                     glass-card rounded-lg shadow-xl shadow-black/40"
          style={{ zIndex: 9999 }}
        >
          {allResults.map((player, i) => (
            <DropdownItem
              key={`${player.gameName}#${player.tagLine}-${i}`}
              player={player}
              active={i === activeIndex}
              onClick={() => handleSelect(player)}
              onMouseEnter={() => setActiveIndex(i)}
            />
          ))}

          {loading && allResults.length === 0 && (
            <div className="px-3 py-3 text-sm text-[#A09B8C] text-center">
              검색 중...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ player, active, onClick, onMouseEnter }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
        ${active ? 'bg-[rgba(200,170,110,0.12)]' : 'hover:bg-[rgba(200,170,110,0.06)]'}`}
    >
      <img
        src={`${PROFILE_ICON_URL}/${player.profileIconId || 29}.png`}
        alt=""
        className="w-8 h-8 rounded-full border border-[rgba(200,170,110,0.15)]"
        onError={(e) => { e.target.src = `${PROFILE_ICON_URL}/29.png`; }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[#F0E6D2] truncate">
          {player.gameName}
          <span className="text-[#A09B8C]">#{player.tagLine}</span>
        </div>
        {player.summonerLevel && (
          <div className="text-[11px] text-[#A09B8C]">
            Lv. {player.summonerLevel}
          </div>
        )}
      </div>
    </button>
  );
}
