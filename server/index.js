import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

// CORS: 허용 도메인 제한
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];

app.use(cors({
  origin(origin, callback) {
    // 서버 직접 호출(origin 없음) 또는 허용 목록에 있으면 통과
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Rate Limiting: IP당 분당 30회
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 많습니다. 1분 후 다시 시도해주세요.' },
});
app.use('/api/', apiLimiter);

app.use(express.json());

const API_KEY = process.env.RIOT_API_KEY;
const ASIA_BASE = 'https://asia.api.riotgames.com';
const KR_BASE = 'https://kr.api.riotgames.com';
const DDRAGON_VERSION = '16.5.1';

// 챔피언 ID → 영문키 매핑 (이미지 URL용)
let championIdToKey = {};
async function loadChampionData() {
  try {
    const { data } = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/champion.json`
    );
    for (const [key, val] of Object.entries(data.data)) {
      championIdToKey[val.key] = key;
    }
    console.log(`Loaded ${Object.keys(championIdToKey).length} champions`);
  } catch (e) {
    console.error('Failed to load champion data:', e.message);
  }
}
loadChampionData();

function createRiotClient(base) {
  const client = axios.create({
    baseURL: base,
    headers: { 'X-Riot-Token': API_KEY },
  });

  // 429 자동 재시도 (최대 3회, Retry-After 헤더 존중)
  client.interceptors.response.use(null, async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount || 0;

    if (error.response?.status === 429 && config._retryCount < 3) {
      config._retryCount++;
      const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10);
      const delay = retryAfter * 1000 + 200; // Retry-After + 여유 200ms
      console.log(`Rate limited, retry ${config._retryCount}/3 after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      return client(config);
    }

    return Promise.reject(error);
  });

  return client;
}

const riot = (base) => createRiotClient(base);

// 인메모리 캐시 (TTL 5분)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// 에러 응답 헬퍼 (내부 정보 숨김)
function apiError(res, e, publicMsg) {
  console.error(publicMsg, e.response?.status, e.message);
  const status = e.response?.status || 500;
  const message = status === 404 ? '소환사를 찾을 수 없습니다' : publicMsg;
  res.status(status).json({ error: message });
}

// 1. 소환사 검색 (닉네임#태그 → puuid, summonerId)
app.get('/api/account/:gameName/:tagLine', async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const { data } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '계정 정보를 불러올 수 없습니다');
  }
});

// 2. 소환사 정보 (puuid → summonerId)
app.get('/api/summoner/:puuid', async (req, res) => {
  try {
    const { data } = await riot(KR_BASE).get(
      `/lol/summoner/v4/summoners/by-puuid/${req.params.puuid}`
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '소환사 정보를 불러올 수 없습니다');
  }
});

// 3. 랭크 정보
app.get('/api/league/:summonerId', async (req, res) => {
  try {
    const { data } = await riot(KR_BASE).get(
      `/lol/league/v4/entries/by-summoner/${req.params.summonerId}`
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '랭크 정보를 불러올 수 없습니다');
  }
});

// 4. 최근 매치 ID 목록
app.get('/api/matches/:puuid', async (req, res) => {
  try {
    const count = req.query.count || 20;
    const { data } = await riot(ASIA_BASE).get(
      `/lol/match/v5/matches/by-puuid/${req.params.puuid}/ids`,
      { params: { queue: 420, count } } // 420 = 솔로랭크
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '매치 목록을 불러올 수 없습니다');
  }
});

// 5. 매치 상세
app.get('/api/match/:matchId', async (req, res) => {
  try {
    const { data } = await riot(ASIA_BASE).get(
      `/lol/match/v5/matches/${req.params.matchId}`
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '매치 정보를 불러올 수 없습니다');
  }
});

// 6. 챔피언 숙련도 (상위 5개)
app.get('/api/mastery/:puuid', async (req, res) => {
  try {
    const { data } = await riot(KR_BASE).get(
      `/lol/champion-mastery/v4/champion-masteries/by-puuid/${req.params.puuid}/top`,
      { params: { count: 5 } }
    );
    res.json(data);
  } catch (e) {
    apiError(res, e, '챔피언 숙련도를 불러올 수 없습니다');
  }
});

// 7. 소환사 검색 (닉네임으로 태그라인 자동 탐색)
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

app.get('/api/search/:gameName', async (req, res) => {
  try {
    const { gameName } = req.params;
    const attempts = TAG_CANDIDATES.map((tag) => tryAccount(gameName, tag));
    const settled = await Promise.all(attempts);
    const results = settled.filter(Boolean);
    res.json({ results });
  } catch (e) {
    apiError(res, e, '소환사 검색에 실패했습니다');
  }
});

// op.gg 크롤링으로 과거 시즌 티어 추출
function capitalizeTier(tierStr) {
  if (!tierStr) return 'Unranked';
  // "diamond 1" → "Diamond 1", "grandmaster" → "Grandmaster"
  return tierStr
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function parseSeasonTable($, tableEl) {
  const rows = [];
  $(tableEl)
    .find('tbody tr')
    .each((_, tr) => {
      const cells = $(tr).find('td');
      if (cells.length < 2) return;
      const season = $(cells[0]).text().trim();
      const tier = capitalizeTier($(cells[1]).text().trim());
      rows.push({ season, tier });
    });
  return rows;
}

async function fetchSeasonTiers(gameName, tagLine) {
  try {
    const url = `https://www.op.gg/summoners/kr/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`;
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(html);

    // 솔로랭크 테이블 (caption: "개인/2인 랭크 게임")
    let soloRows = [];
    let flexRows = [];

    $('table').each((_, table) => {
      const caption = $(table).find('caption').text().trim().toLowerCase();
      if (caption.includes('solo') || caption.includes('개인/2인')) {
        soloRows = parseSeasonTable($, table);
      } else if (caption.includes('flex') || caption.includes('자유 랭크')) {
        flexRows = parseSeasonTable($, table);
      }
    });

    // 최근 3시즌 추출 함수
    const pickRecent3 = (rows) => {
      if (rows.length === 0) return null;
      return {
        current: { tier: rows[0].tier, season: rows[0].season, type: rows === soloRows ? 'solo' : 'flex' },
        season1: rows[1]
          ? { tier: rows[1].tier, season: rows[1].season, type: rows === soloRows ? 'solo' : 'flex' }
          : null,
        season2: rows[2]
          ? { tier: rows[2].tier, season: rows[2].season, type: rows === soloRows ? 'solo' : 'flex' }
          : null,
      };
    };

    // 폴백 로직: 솔로 → 자유 → S2022까지 거슬러 탐색
    if (soloRows.length > 0) {
      return pickRecent3(soloRows);
    }
    if (flexRows.length > 0) {
      return pickRecent3(flexRows);
    }

    // 둘 다 없으면 null
    return null;
  } catch (e) {
    console.error('op.gg scrape error:', e.message);
    return null;
  }
}

// 8. 통합 API: 닉네임 하나로 모든 데이터 수집
app.get('/api/player/:gameName/:tagLine', async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const cacheKey = `player:${gameName.toLowerCase()}:${tagLine.toLowerCase()}`;

    // 캐시 확인
    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // 1) 계정 조회
    const { data: account } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );

    // 2) puuid 확보 후 독립적인 호출을 병렬 실행
    const [summoner, leagues, matchIds, masteries, seasonTiers] = await Promise.all([
      riot(KR_BASE).get(`/lol/summoner/v4/summoners/by-puuid/${account.puuid}`).then((r) => r.data),
      riot(KR_BASE).get(`/lol/league/v4/entries/by-puuid/${account.puuid}`).then((r) => r.data),
      riot(ASIA_BASE).get(`/lol/match/v5/matches/by-puuid/${account.puuid}/ids`, { params: { queue: 420, count: 20 } }).then((r) => r.data),
      riot(KR_BASE).get(`/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top`, { params: { count: 5 } }).then((r) => r.data),
      fetchSeasonTiers(gameName, tagLine),
    ]);

    const soloRank = leagues.find((l) => l.queueType === 'RANKED_SOLO_5x5');
    const flexRank = leagues.find((l) => l.queueType === 'RANKED_FLEX_SR');

    // 3) 매치 상세 병렬 호출 (최대 5게임 — API 속도 제한 고려)
    const matchLimit = Math.min(matchIds.length, 5);
    const matchDetails = await Promise.all(
      matchIds.slice(0, matchLimit).map((id) =>
        riot(ASIA_BASE).get(`/lol/match/v5/matches/${id}`).then((r) => r.data)
      )
    );

    // === 데이터 가공 ===

    // 포지션별 통계
    const positionStats = {};
    let totalWins = 0;
    let totalGames = 0;

    for (const match of matchDetails) {
      const me = match.info.participants.find((p) => p.puuid === account.puuid);
      if (!me) continue;

      const pos = normalizePosition(me.teamPosition || me.individualPosition);
      if (!pos) continue;

      if (!positionStats[pos]) positionStats[pos] = { name: pos, games: 0, wins: 0 };
      positionStats[pos].games++;
      if (me.win) positionStats[pos].wins++;

      totalGames++;
      if (me.win) totalWins++;
    }

    const positions = Object.values(positionStats).sort((a, b) => b.games - a.games);

    // 티어 정보 (솔로랭크 우선, 없으면 자유랭크 폴백)
    const rankSource = soloRank || flexRank;
    const tierString = rankSource
      ? `${capitalize(rankSource.tier)} ${rankSource.rank}`
      : 'Unranked';
    const rankType = soloRank ? 'solo' : flexRank ? 'flex' : 'unranked';

    // 최고 숙련도 챔피언
    const topMastery = masteries[0];

    const result = {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      tier: tierString,
      rankType,
      lp: rankSource?.leaguePoints || 0,
      wins: rankSource?.wins || 0,
      losses: rankSource?.losses || 0,
      positions,
      recentWinRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 1000) / 10 : 0,
      topChampionId: topMastery?.championId || null,
      topChampionKey: championIdToKey[String(topMastery?.championId)] || null,
      topChampionMastery: topMastery?.championLevel || 0,
      topChampionPoints: topMastery?.championPoints || 0,
      masteries: masteries.map((m) => ({
        championId: m.championId,
        championKey: championIdToKey[String(m.championId)] || null,
        level: m.championLevel,
        points: m.championPoints,
      })),
      ddragonVersion: DDRAGON_VERSION,
      seasonTiers,
    };

    cacheSet(cacheKey, result);
    res.json(result);
  } catch (e) {
    apiError(res, e, '플레이어 정보를 불러올 수 없습니다');
  }
});

function normalizePosition(pos) {
  const map = {
    TOP: 'TOP',
    JUNGLE: 'JG',
    MIDDLE: 'MID',
    BOTTOM: 'ADC',
    UTILITY: 'SUP',
  };
  return map[pos] || null;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
