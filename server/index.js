import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.RIOT_API_KEY;
const ASIA_BASE = 'https://asia.api.riotgames.com';
const KR_BASE = 'https://kr.api.riotgames.com';

const riot = (base) =>
  axios.create({
    baseURL: base,
    headers: { 'X-Riot-Token': API_KEY },
  });

// 1. 소환사 검색 (닉네임#태그 → puuid, summonerId)
app.get('/api/account/:gameName/:tagLine', async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const { data } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    res.json(data);
  } catch (e) {
    console.error('Account error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
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
    console.error('Summoner error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
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
    console.error('League error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
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
    console.error('Matches error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
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
    console.error('Match detail error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
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
    console.error('Mastery error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({ error: e.response?.data || e.message });
  }
});

// 7. 통합 API: 닉네임 하나로 모든 데이터 수집
app.get('/api/player/:gameName/:tagLine', async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;

    // 1) 계정 조회
    const { data: account } = await riot(ASIA_BASE).get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );

    // 2) 랭크 정보 (puuid로 직접 조회)
    const { data: leagues } = await riot(KR_BASE).get(
      `/lol/league/v4/entries/by-puuid/${account.puuid}`
    );
    const soloRank = leagues.find((l) => l.queueType === 'RANKED_SOLO_5x5');

    // 4) 최근 매치 (20게임)
    const { data: matchIds } = await riot(ASIA_BASE).get(
      `/lol/match/v5/matches/by-puuid/${account.puuid}/ids`,
      { params: { queue: 420, count: 20 } }
    );

    // 5) 매치 상세 (최대 10게임 분석 - API 호출 제한 고려)
    const matchLimit = Math.min(matchIds.length, 10);
    const matchDetails = [];
    for (let i = 0; i < matchLimit; i++) {
      const { data: match } = await riot(ASIA_BASE).get(
        `/lol/match/v5/matches/${matchIds[i]}`
      );
      matchDetails.push(match);
    }

    // 6) 챔피언 숙련도
    const { data: masteries } = await riot(KR_BASE).get(
      `/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top`,
      { params: { count: 5 } }
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

    // 티어 정보
    const tierString = soloRank
      ? `${capitalize(soloRank.tier)} ${soloRank.rank}`
      : 'Unranked';

    // 최고 숙련도 챔피언
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
