import axios from 'axios';
import * as cheerio from 'cheerio';

const ASIA_BASE = 'https://asia.api.riotgames.com';
const KR_BASE = 'https://kr.api.riotgames.com';
const DDRAGON_VERSION = '16.5.1';

// 챔피언 ID → 영문키 매핑 (serverless에서 매 요청 시 로드)
let championIdToKey = null;
async function getChampionMap() {
  if (championIdToKey) return championIdToKey;
  const { data } = await axios.get(
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/champion.json`
  );
  championIdToKey = {};
  for (const [key, val] of Object.entries(data.data)) {
    championIdToKey[val.key] = key;
  }
  return championIdToKey;
}

function createRiotClient(base) {
  const client = axios.create({
    baseURL: base,
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
  });

  client.interceptors.response.use(null, async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    config._retryCount = config._retryCount || 0;
    if (error.response?.status === 429 && config._retryCount < 3) {
      config._retryCount++;
      const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000 + 200));
      return client(config);
    }
    return Promise.reject(error);
  });

  return client;
}

const riot = (base) => createRiotClient(base);

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

function normalizePosition(pos) {
  const map = { TOP: 'TOP', JUNGLE: 'JG', MIDDLE: 'MID', BOTTOM: 'ADC', UTILITY: 'SUP' };
  return map[pos] || null;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// op.gg 크롤링
function capitalizeTier(tierStr) {
  if (!tierStr) return 'Unranked';
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

    if (soloRows.length > 0) return pickRecent3(soloRows);
    if (flexRows.length > 0) return pickRecent3(flexRows);
    return null;
  } catch (e) {
    console.error('op.gg scrape error:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  const { gameName, tagLine } = req.query;

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName and tagLine are required' });
  }

  try {
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

    const rankSource = soloRank || flexRank;
    const tierString = rankSource
      ? `${capitalize(rankSource.tier)} ${rankSource.rank}`
      : 'Unranked';
    const rankType = soloRank ? 'solo' : flexRank ? 'flex' : 'unranked';

    const topMastery = masteries[0];
    const champMap = await getChampionMap();

    res.json({
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
      topChampionKey: champMap[String(topMastery?.championId)] || null,
      topChampionMastery: topMastery?.championLevel || 0,
      topChampionPoints: topMastery?.championPoints || 0,
      masteries: masteries.map((m) => ({
        championId: m.championId,
        championKey: champMap[String(m.championId)] || null,
        level: m.championLevel,
        points: m.championPoints,
      })),
      ddragonVersion: DDRAGON_VERSION,
      seasonTiers,
    });
  } catch (e) {
    console.error('Player API error:', e.response?.status, e.response?.data, e.message);
    const status = e.response?.status || 500;
    const detail = e.response?.data?.status?.message || e.message;
    const message = status === 404 ? '소환사를 찾을 수 없습니다' : '플레이어 정보를 불러올 수 없습니다';
    res.status(status).json({ error: message });
  }
}
