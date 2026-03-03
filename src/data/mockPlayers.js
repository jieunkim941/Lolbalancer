const mockPlayers = [
  {
    id: 1,
    name: 'Hide on bush',
    tag: 'KR1',
    tiers: { current: 'Challenger', season1: 'Challenger', season2: 'Grandmaster' },
    positions: [
      { name: 'MID', games: 150, wins: 102 },
      { name: 'TOP', games: 30, wins: 18 },
      { name: 'JG', games: 10, wins: 5 },
    ],
    champion: { name: '아칼리', icon: '🗡️', mastery: 7, winRate: 72, games: 320 },
    recentWinRate: 71.0,
  },
  {
    id: 2, name: 'T1 Gumayusi', tag: 'KR1',
    tiers: { current: 'Challenger', season1: 'Grandmaster', season2: 'Challenger' },
    positions: [
      { name: 'ADC', games: 180, wins: 115 },
      { name: 'SUP', games: 15, wins: 8 },
      { name: 'MID', games: 5, wins: 2 },
    ],
    champion: { name: '진', icon: '🔫', mastery: 7, winRate: 68, games: 280 },
    recentWinRate: 65.0,
  },
  {
    id: 3, name: 'Zeus', tag: 'KR1',
    tiers: { current: 'Grandmaster', season1: 'Challenger', season2: 'Master' },
    positions: [
      { name: 'TOP', games: 200, wins: 130 },
      { name: 'MID', games: 20, wins: 11 },
      { name: 'JG', games: 8, wins: 4 },
    ],
    champion: { name: '잭스', icon: '⚔️', mastery: 7, winRate: 70, games: 250 },
    recentWinRate: 67.0,
  },
  {
    id: 4, name: 'Oner', tag: 'KR1',
    tiers: { current: 'Grandmaster', season1: 'Master', season2: 'Grandmaster' },
    positions: [
      { name: 'JG', games: 170, wins: 100 },
      { name: 'TOP', games: 18, wins: 9 },
      { name: 'MID', games: 6, wins: 3 },
    ],
    champion: { name: '리신', icon: '👊', mastery: 7, winRate: 65, games: 300 },
    recentWinRate: 62.0,
  },
  {
    id: 5, name: 'Keria', tag: 'KR1',
    tiers: { current: 'Challenger', season1: 'Challenger', season2: 'Challenger' },
    positions: [
      { name: 'SUP', games: 190, wins: 125 },
      { name: 'ADC', games: 10, wins: 5 },
      { name: 'MID', games: 5, wins: 2 },
    ],
    champion: { name: '쓰레쉬', icon: '⛓️', mastery: 7, winRate: 74, games: 350 },
    recentWinRate: 69.0,
  },
  {
    id: 6, name: 'Deft', tag: 'KR2',
    tiers: { current: 'Master', season1: 'Grandmaster', season2: 'Challenger' },
    positions: [
      { name: 'ADC', games: 160, wins: 96 },
      { name: 'MID', games: 25, wins: 13 },
      { name: 'SUP', games: 8, wins: 4 },
    ],
    champion: { name: '이즈리얼', icon: '✨', mastery: 7, winRate: 66, games: 270 },
    recentWinRate: 63.0,
  },
  {
    id: 7, name: 'Chovy', tag: 'KR1',
    tiers: { current: 'Challenger', season1: 'Challenger', season2: 'Grandmaster' },
    positions: [
      { name: 'MID', games: 175, wins: 118 },
      { name: 'ADC', games: 15, wins: 9 },
      { name: 'TOP', games: 5, wins: 3 },
    ],
    champion: { name: '아지르', icon: '🏛️', mastery: 7, winRate: 71, games: 290 },
    recentWinRate: 70.0,
  },
  {
    id: 8, name: 'Canyon', tag: 'KR1',
    tiers: { current: 'Challenger', season1: 'Grandmaster', season2: 'Grandmaster' },
    positions: [
      { name: 'JG', games: 185, wins: 120 },
      { name: 'MID', games: 12, wins: 7 },
      { name: 'TOP', games: 5, wins: 2 },
    ],
    champion: { name: '니달리', icon: '🐆', mastery: 7, winRate: 69, games: 310 },
    recentWinRate: 68.0,
  },
  {
    id: 9, name: 'Kiin', tag: 'KR1',
    tiers: { current: 'Grandmaster', season1: 'Master', season2: 'Master' },
    positions: [
      { name: 'TOP', games: 165, wins: 99 },
      { name: 'JG', games: 20, wins: 10 },
      { name: 'MID', games: 10, wins: 5 },
    ],
    champion: { name: '케넨', icon: '⚡', mastery: 6, winRate: 63, games: 200 },
    recentWinRate: 61.0,
  },
  {
    id: 10, name: 'BeryL', tag: 'KR1',
    tiers: { current: 'Master', season1: 'Grandmaster', season2: 'Master' },
    positions: [
      { name: 'SUP', games: 155, wins: 88 },
      { name: 'MID', games: 22, wins: 11 },
      { name: 'ADC', games: 8, wins: 3 },
    ],
    champion: { name: '레오나', icon: '☀️', mastery: 7, winRate: 60, games: 230 },
    recentWinRate: 58.0,
  },
];

export default mockPlayers;
