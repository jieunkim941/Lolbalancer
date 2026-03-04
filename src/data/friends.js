const friends = [
  { gameName: '레몬 쿵야', tagLine: 'KOR' },
  { gameName: '서핑꿀잼', tagLine: 'KR2' },
  { gameName: '마라탕후루냠', tagLine: 'KR1' },
  { gameName: '한방역전', tagLine: 'KR1' },
  { gameName: 'TIG Joker', tagLine: 'KR1' },
  { gameName: '스킨사고싶다', tagLine: 'KR1' },
  { gameName: '휘밤새어라', tagLine: 'KR1' },
  { gameName: '만두연구소장', tagLine: '10002' },
  { gameName: '만두집강아지', tagLine: '10002' },
  { gameName: '푸히히히힛', tagLine: 'KOR' },
  { gameName: '예요정', tagLine: 'KR1' },
  { gameName: '바이퍼황수호', tagLine: 'KR1' },
  { gameName: '만두마당주인', tagLine: '10002' },
  { gameName: 'in the middle', tagLine: '1026' },
];

export function searchFriends(query) {
  if (!query) return friends;
  const lower = query.toLowerCase();
  return friends.filter(
    (f) =>
      f.gameName.toLowerCase().includes(lower) ||
      `${f.gameName}#${f.tagLine}`.toLowerCase().includes(lower)
  );
}

export default friends;
