// 인테리어: 도감을 모을수록 열리는 벽지/바닥/러그/가구. 카탈로그와 검증만 담당한다.
(function (root) {
  // 만난 고양이 수(일반+한정 합계)에 따른 단계. 0이면 잠겨 있다.
  const TIER_AT = [10, 20, 30];
  const MAX_ITEMS = 8;

  const WALLS = [
    { id: 'default', label: '계절 기본', tier: 1 },
    { id: 'cream', label: '크림 줄무늬', tier: 1 },
    { id: 'mint', label: '민트 물방울', tier: 1 },
    { id: 'pink', label: '분홍 물방울', tier: 2 },
    { id: 'night', label: '밤하늘 별', tier: 3 },
  ];
  const FLOORS = [
    { id: 'wood', label: '원목', tier: 1 },
    { id: 'tile', label: '타일', tier: 1 },
    { id: 'check', label: '체크무늬', tier: 2 },
  ];
  const RUGS = [
    { id: 'default', label: '계절 기본', tier: 1 },
    { id: 'blue', label: '파랑', tier: 1 },
    { id: 'green', label: '초록', tier: 2 },
    { id: 'purple', label: '보라', tier: 3 },
  ];
  // w, h: 그림 크기(방 좌표), perch: 고양이가 올라앉을 수 있는지
  const ITEMS = [
    { id: 'cushion', label: '쿠션', tier: 1, w: 20, h: 9, perch: true },
    { id: 'plant', label: '화분', tier: 1, w: 14, h: 20, perch: false },
    { id: 'lamp', label: '스탠드', tier: 2, w: 12, h: 28, perch: false },
    { id: 'bed', label: '고양이 침대', tier: 2, w: 28, h: 11, perch: true },
    { id: 'tank', label: '어항', tier: 3, w: 24, h: 20, perch: false },
    { id: 'pumpkin', label: '호박', tier: 1, w: 22, h: 20, perch: false },
    { id: 'bear', label: '곰인형', tier: 3, w: 14, h: 16, perch: true },
  ];

  const byId = (list, id) => list.find((o) => o.id === id);

  function tierFor(metCount) {
    let t = 0;
    TIER_AT.forEach((n, i) => { if (metCount >= n) t = i + 1; });
    return t;
  }
  const needFor = (tier) => TIER_AT[tier - 1];

  // 저장/백업에서 읽은 값을 검증해서 새 객체로 돌려준다.
  function clean(raw) {
    const o = raw && typeof raw === 'object' ? raw : {};
    const pick = (list, id, fallback) => (byId(list, id) ? id : fallback);
    const items = (Array.isArray(o.items) ? o.items : [])
      .filter((it) => it && byId(ITEMS, it.id) && Number.isFinite(it.x) && Number.isFinite(it.y))
      .slice(0, MAX_ITEMS)
      .map((it, i) => ({
        uid: 'i' + i,
        id: it.id,
        x: Math.max(12, Math.min(228, Math.round(it.x))),
        y: Math.max(104, Math.min(172, Math.round(it.y))),
      }));
    return {
      wall: pick(WALLS, o.wall, 'default'),
      floor: pick(FLOORS, o.floor, 'wood'),
      rug: pick(RUGS, o.rug, 'default'),
      items,
    };
  }

  root.Interior = { TIER_AT, MAX_ITEMS, WALLS, FLOORS, RUGS, ITEMS, byId, tierFor, needFor, clean };
})(typeof window !== 'undefined' ? window : globalThis);
