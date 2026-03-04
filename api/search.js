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

  try {
    const attempts = TAG_CANDIDATES.map((tag) => tryAccount(gameName, tag));
    const settled = await Promise.all(attempts);
    const results = settled.filter(Boolean);

    res.json({ results });
  } catch (e) {
    console.error('Search API error:', e.message);
    res.status(500).json({ error: '소환사 검색에 실패했습니다' });
  }
}
