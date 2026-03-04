const STORAGE_KEY = 'lol-balancer-player-history';
const MAX_HISTORY = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addToHistory(player) {
  const history = loadHistory();
  const filtered = history.filter((p) => p.puuid !== player.puuid);
  const entry = {
    gameName: player.gameName,
    tagLine: player.tagLine,
    puuid: player.puuid,
    profileIconId: player.profileIconId ?? null,
    summonerLevel: player.summonerLevel ?? null,
    addedAt: Date.now(),
  };
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  saveHistory(updated);
}

export function searchHistory(query) {
  if (!query || query.length < 1) return [];
  const history = loadHistory();
  const lower = query.toLowerCase();
  return history.filter(
    (p) =>
      p.gameName.toLowerCase().includes(lower) ||
      `${p.gameName}#${p.tagLine}`.toLowerCase().includes(lower)
  );
}
