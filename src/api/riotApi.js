// 로컬 개발: Express 서버 (localhost:3001)
// 배포(Vercel): 같은 도메인의 /api/player
import { getCache, setCache } from '../utils/playerCache.js';

const IS_DEV = import.meta.env.DEV;

export async function fetchPlayerData(nameWithTag) {
  const cached = getCache(nameWithTag);
  if (cached) return cached;

  // "닉네임#TAG" 형태를 파싱
  const [gameName, tagLine] = nameWithTag.includes('#')
    ? nameWithTag.split('#')
    : [nameWithTag, 'KR1']; // 태그 없으면 기본 KR1

  const url = IS_DEV
    ? `http://localhost:3001/api/player/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    : `/api/player?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `소환사 "${nameWithTag}"을 찾을 수 없습니다.`);
  }

  const data = await res.json();
  setCache(nameWithTag, data);
  return data;
}

export async function searchPlayers(gameName) {
  try {
    const url = IS_DEV
      ? `http://localhost:3001/api/search/${encodeURIComponent(gameName)}`
      : `/api/search?gameName=${encodeURIComponent(gameName)}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}
