const CACHE_PREFIX = 'player_cache:';
const TTL_MS = 30 * 60 * 1000; // 30분

function normalizeKey(nameWithTag) {
  return CACHE_PREFIX + nameWithTag.toLowerCase().trim();
}

export function getCache(nameWithTag) {
  try {
    const raw = localStorage.getItem(normalizeKey(nameWithTag));
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > TTL_MS) {
      localStorage.removeItem(normalizeKey(nameWithTag));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(nameWithTag, data) {
  try {
    localStorage.setItem(
      normalizeKey(nameWithTag),
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage 용량 초과 시 무시
  }
}
