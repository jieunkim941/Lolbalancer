const BASE = 'http://localhost:3001/api';

export async function fetchPlayerData(nameWithTag) {
  // "닉네임#TAG" 형태를 파싱
  const [gameName, tagLine] = nameWithTag.includes('#')
    ? nameWithTag.split('#')
    : [nameWithTag, 'KR1']; // 태그 없으면 기본 KR1

  const res = await fetch(`${BASE}/player/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `소환사 "${nameWithTag}"을 찾을 수 없습니다.`);
  }

  return res.json();
}
