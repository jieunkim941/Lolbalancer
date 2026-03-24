import axios from 'axios';

const ASIA_BASE = 'https://asia.api.riotgames.com';
const KR_BASE = 'https://kr.api.riotgames.com';

const riot = (base) =>
  axios.create({
    baseURL: base,
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
  });

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
}

const TAG_CANDIDATES = ['KR1', 'KOR', 'KR'];

// 인메모리 캐시 (Vercel warm lambda 간 유지)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30분

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    for (let i = 0; i < 50; i++) cache.delete(oldest[i][0]);
  }
  cache.set(key, { data, ts: Date.now() });
}

async function tryAccount(gameName, tagLine) {
  try {
    const { data: account } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    const { data: summoner } = await riot(KR_BASE).get(
      `/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
    );
    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  const { gameName } = req.query;

  if (!gameName) {
    return res.status(400).json({ error: 'gameName is required' });
  }

  // 캐시 확인
  const cacheKey = `search:${gameName.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const attempts = TAG_CANDIDATES.map((tag) => tryAccount(gameName, tag));
    const settled = await Promise.all(attempts);
    const results = settled.filter(Boolean);

    const response = { results };
    setCache(cacheKey, response);
    res.json(response);
  } catch (e) {
    console.error('Search API error:', e.message);
    res.status(500).json({ error: '소환사 검색에 실패했습니다' });
  }
}
