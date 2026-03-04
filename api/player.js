import axios from 'axios';

const ASIA_BASE = 'https://asia.api.riotgames.com';
const KR_BASE = 'https://kr.api.riotgames.com';

const riot = (base) =>
  axios.create({
    baseURL: base,
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
  });

function normalizePosition(pos) {
  const map = { TOP: 'TOP', JUNGLE: 'JG', MIDDLE: 'MID', BOTTOM: 'ADC', UTILITY: 'SUP' };
  return map[pos] || null;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { gameName, tagLine } = req.query;

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName and tagLine are required' });
  }

  try {
    // 1) 계정 조회
    const { data: account } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );

    // 2) 랭크 정보
    const { data: leagues } = await riot(KR_BASE).get(
      `/lol/league/v4/entries/by-puuid/${account.puuid}`
    );
    const soloRank = leagues.find((l) => l.queueType === 'RANKED_SOLO_5x5');

    // 3) 최근 매치 ID (20게임)
    const { data: matchIds } = await riot(ASIA_BASE).get(
      `/lol/match/v5/matches/by-puuid/${account.puuid}/ids`,
      { params: { queue: 420, count: 20 } }
    );

    // 4) 매치 상세 (최대 10게임)
    const matchLimit = Math.min(matchIds.length, 10);
    const matchDetails = [];
    for (let i = 0; i < matchLimit; i++) {
      const { data: match } = await riot(ASIA_BASE).get(
        `/lol/match/v5/matches/${matchIds[i]}`
      );
      matchDetails.push(match);
    }

    // 5) 챔피언 숙련도
    const { data: masteries } = await riot(KR_BASE).get(
      `/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top`,
      { params: { count: 5 } }
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
    const tierString = soloRank
      ? `${capitalize(soloRank.tier)} ${soloRank.rank}`
      : 'Unranked';
    const topMastery = masteries[0];

    res.json({
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      tier: tierString,
      lp: soloRank?.leaguePoints || 0,
      wins: soloRank?.wins || 0,
      losses: soloRank?.losses || 0,
      positions,
      recentWinRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 1000) / 10 : 0,
      topChampionId: topMastery?.championId || null,
      topChampionMastery: topMastery?.championLevel || 0,
      topChampionPoints: topMastery?.championPoints || 0,
      masteries: masteries.map((m) => ({
        championId: m.championId,
        level: m.championLevel,
        points: m.championPoints,
      })),
    });
  } catch (e) {
    console.error('Player API error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({
      error: e.response?.data?.status?.message || e.message,
    });
  }
}
