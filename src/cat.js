// 설문 답변 → 고양이 속성 + 결과 텍스트
(function (root) {
  const NAME_HEAD = ['몽', '보', '두', '찹', '치', '콩', '모', '호', '구', '밤', '쿠', '마'];
  const NAME_TAIL = ['실', '리', '부', '쌀', '즈', '이', '찌', '두', '름', '톨'];

  // TITLES[energy][social]
  const TITLES = [
    ['창가 철학자 냥', '햇볕 수집가 냥', '무릎 점령 냥'],
    ['도도한 관찰자 냥', '동네 단골 냥', '골목 사교계 냥'],
    ['지붕 위 탐험가 냥', '바람 따라 냥', '동네 인싸 냥'],
  ];

  const REASONS = {
    energy: [
      '동글동글하고 눈이 반쯤 감겨 있어요 → 서두르는 건 질색, 느긋하게 즐겨요.',
      '적당한 몸매에 눈이 또렷해요 → 쉴 땐 쉬고 움직일 땐 움직여요.',
      '날씬하고 꼬리가 꼿꼿해요 → 가만히 있으면 몸이 근질근질해요.',
    ],
    social: [
      '귀가 옆으로 눕고 입이 일자예요 → 혼자만의 시간이 소중해요.',
      '귀가 살짝 서 있고 입이 작아요 → 마음이 열리는 데 시간이 조금 걸려요.',
      '귀가 쫑긋하고 볼이 발그레해요 → 새로운 얼굴이 반가워요.',
    ],
    delicacy: [
      '털이 얼룩덜룩하고 삐죽 솟았어요 → 털털해서 신경 안 써요.',
      '무늬가 살짝 있어요 → 적당히 챙기고 적당히 넘겨요.',
      '털이 깔끔한 단색이에요 → 디테일에 예민하고 깔끔해요.',
    ],
    boldness: [
      '눈이 작고 몸을 웅크렸어요 → 먼저 살펴보고 움직여요.',
      '눈이 또렷해요 → 상황 봐서 나서요.',
      '눈이 크고 가슴을 폈어요 → 일단 해보는 타입이에요.',
    ],
    fur: {
      cream: '아침 햇살 같은 크림색이에요 → 하루의 시작을 좋아해요.',
      orange: '노을빛 오렌지색이에요 → 해질녘이 제일 좋아요.',
      black: '밤처럼 까만 털이에요 → 조용한 밤이 편해요.',
      gray: '새벽 같은 은회색이에요 → 고요한 시간을 사랑해요.',
    },
    accessory: {
      bottle: '술병을 꼭 쥐고 있어요 → 한 잔이면 세상이 다 내 편이에요.',
      tie: '넥타이를 머리에 감았어요 → 오늘은 달리는 날, 분위기 메이커예요.',
      glasses: '안경을 쓰고 있어요 → 책 한 권이면 충분해요.',
      bell: '방울을 달고 있어요 → 주전부리를 못 참아요.',
      none: '아무것도 안 걸쳤어요 → 몸만 가볍게 다녀요.',
      crown: '왕관을 썼어요 → 사랑방의 주인은 바로 나예요.',
      partyhat: '고깔모자를 썼어요 → 오늘은 누군가의 생일이에요.',
      flowers: '꽃관을 썼어요 → 걸음마다 봄이 따라와요.',
      cape: '망토를 둘렀어요 → 사랑방을 지키는 영웅이에요.',
      headphones: '헤드폰을 썼어요 → 나만의 음악이 필요해요.',
      ribbonpin: '리본핀을 꽂았어요 → 작은 멋도 놓치지 않아요.',
      beret: '베레모를 썼어요 → 오늘은 예술가가 되기로 했어요.',
      strawhat: '밀짚모자를 썼어요 → 소풍 갈 준비가 끝났어요.',
      santahat: '산타모자를 썼어요 → 누군가에게 선물을 주러 가요.',
      monocle: '외눈안경을 꼈어요 → 세상을 한 눈으로 꿰뚫어 봐요.',
      heartglasses: '하트 안경을 꼈어요 → 세상이 온통 분홍빛이에요.',
      sleepmask: '수면안대를 이마에 올렸어요 → 낮잠 준비는 언제나 완료예요.',
      bandana: '반다나를 둘렀어요 → 카우보이처럼 터프해요.',
      medal: '메달을 걸었어요 → 오늘 하루도 잘 해냈어요.',
      lei: '꽃목걸이를 걸었어요 → 마음은 이미 휴양지예요.',
      wings: '천사 날개를 달았어요 → 날 수 있을 것 같은 기분이에요.',
      butterfly: '나비 날개를 달았어요 → 살랑살랑 가볍게 다녀요.',
      backpack: '배낭을 멨어요 → 소풍도 모험도 준비 완료예요.',
      fish: '생선을 들었어요 → 이건 절대 안 나눠 줄 거예요.',
      balloon: '풍선을 들었어요 → 바람이 불어도 놓치지 않아요.',
      icecream: '아이스크림을 들었어요 → 녹기 전에 먹어야 해요.',
      pearl: '진주 목걸이를 걸었어요 → 품위는 잃지 않아요.',
      shell: '조개 목걸이를 걸었어요 → 마음은 늘 바닷가에 있어요.',
      blossom: '머리에 벚꽃을 꽂았어요 → 봄바람이 불면 가만있질 못해요.',
      shades: '선글라스를 썼어요 → 여름은 내 세상이에요.',
      leaf: '단풍잎을 얹었어요 → 가을 산책길이 제일 좋아요.',
      scarf: '목도리를 둘렀어요 → 따뜻한 게 최고예요.',
    },
  };

  const FUR_LABEL = { cream: '크림', orange: '오렌지', black: '검정', gray: '은회색' };
  const ACC_LABEL = {
    bottle: '술병', tie: '넥타이', glasses: '안경', bell: '방울', none: '맨몸',
    blossom: '벚꽃', shades: '선글라스', leaf: '단풍잎', scarf: '목도리',
    crown: '왕관', partyhat: '고깔모자', flowers: '꽃관', cape: '망토', headphones: '헤드폰', ribbonpin: '리본핀',
    pearl: '진주 목걸이', shell: '조개 목걸이',
    beret: '베레모', strawhat: '밀짚모자', santahat: '산타모자',
    monocle: '외눈안경', heartglasses: '하트 안경', sleepmask: '수면안대',
    bandana: '반다나', medal: '메달', lei: '꽃목걸이',
    wings: '천사 날개', butterfly: '나비 날개', backpack: '배낭',
    fish: '생선', balloon: '풍선', icecream: '아이스크림',
  };

  // 선물: 손님이 가끔 가져오는 악세사리. 호스트(내 고양이)가 착용할 수 있다.
  // 자기가 하고 있는 걸 건네고, 아무것도 안 한 고양이는 아래 특별 선물 중 하나를 준다.
  const EXTRA_GIFTS = ['crown', 'partyhat', 'flowers', 'cape', 'headphones', 'ribbonpin', 'pearl', 'shell',
    'beret', 'strawhat', 'santahat', 'monocle', 'heartglasses', 'sleepmask',
    'bandana', 'medal', 'lei', 'wings', 'butterfly', 'backpack', 'fish', 'balloon', 'icecream'];
  const GIFT_IDS = ['tie', 'glasses', 'bell', 'bottle', 'blossom', 'shades', 'leaf', 'scarf'].concat(EXTRA_GIFTS);
  // 착용 자리(슬롯): 슬롯마다 하나씩, 서로 다른 슬롯은 같이 착용할 수 있다.
  const SLOTS = ['head', 'face', 'neck', 'back', 'hold'];
  const SLOT_LABEL = { head: '머리', face: '얼굴', neck: '목', back: '등', hold: '손' };
  const SLOT_OF = {
    tie: 'head', blossom: 'head', leaf: 'head', crown: 'head', partyhat: 'head', flowers: 'head',
    ribbonpin: 'head', headphones: 'head', beret: 'head', strawhat: 'head', santahat: 'head',
    glasses: 'face', shades: 'face', monocle: 'face', heartglasses: 'face', sleepmask: 'face',
    bell: 'neck', scarf: 'neck', pearl: 'neck', shell: 'neck', bandana: 'neck', medal: 'neck', lei: 'neck',
    cape: 'back', wings: 'back', butterfly: 'back', backpack: 'back',
    bottle: 'hold', fish: 'hold', balloon: 'hold', icecream: 'hold',
  };

  // 저장된 worn(예전엔 문자열 하나)을 {슬롯: id}로 정리한다.
  function normalizeWorn(w) {
    const out = {};
    if (typeof w === 'string' && SLOT_OF[w]) out[SLOT_OF[w]] = w;
    else if (w && typeof w === 'object') {
      SLOTS.forEach((s) => { if (typeof w[s] === 'string' && SLOT_OF[w[s]] === s) out[s] = w[s]; });
    }
    return out;
  }

  // 지금 입고 있는 모든 악세사리(슬롯 순서). 설문 악세사리는 같은 슬롯을 선물이 차지하면 밀려난다.
  function outfitOf(cat) {
    const bySlot = {};
    const base = cat.accessory;
    if (base && base !== 'none' && SLOT_OF[base]) bySlot[SLOT_OF[base]] = base;
    const worn = normalizeWorn(cat.worn);
    SLOTS.forEach((s) => { if (worn[s]) bySlot[s] = worn[s]; });
    return SLOTS.map((s) => bySlot[s]).filter(Boolean);
  }

  // 그릴 때 쓰는 복사본: accessories에 입은 것 전체가 들어간다.
  function dressed(cat) {
    return Object.assign({}, cat, { accessories: outfitOf(cat) });
  }

  const GIFT_RATE = 0.45;   // 손님이 선물을 들고 올 확률(30분 슬롯마다)

  // 시즌 한정 손님: 그 계절에만 놀러 온다. id는 100번부터, 계절마다 3마리.
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const SEASON_NAME = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
  const LIMITED_BASE = 100;
  const LIMITED = [
    { season: 'spring', name: '벚꽃이', title: '꽃잎 줍는 냥', energy: 1, social: 2, delicacy: 2, boldness: 1, fur: 'cream', accessory: 'blossom' },
    { season: 'spring', name: '꽃비', title: '봄바람 마중 냥', energy: 2, social: 1, delicacy: 1, boldness: 2, fur: 'gray', accessory: 'blossom' },
    { season: 'spring', name: '아지랑이', title: '꽃그늘 낮잠 냥', energy: 0, social: 1, delicacy: 0, boldness: 0, fur: 'orange', accessory: 'blossom' },
    { season: 'summer', name: '소다', title: '해변 인싸 냥', energy: 2, social: 2, delicacy: 0, boldness: 2, fur: 'orange', accessory: 'shades' },
    { season: 'summer', name: '빙수', title: '그늘 속 철학자 냥', energy: 0, social: 1, delicacy: 2, boldness: 1, fur: 'gray', accessory: 'shades' },
    { season: 'summer', name: '파도', title: '선글라스 낭인 냥', energy: 1, social: 0, delicacy: 1, boldness: 2, fur: 'black', accessory: 'shades' },
    { season: 'autumn', name: '도토리', title: '낙엽 수집가 냥', energy: 1, social: 1, delicacy: 0, boldness: 1, fur: 'orange', accessory: 'leaf' },
    { season: 'autumn', name: '단풍이', title: '단풍길 산책 냥', energy: 0, social: 2, delicacy: 1, boldness: 0, fur: 'black', accessory: 'leaf' },
    { season: 'autumn', name: '밤송이', title: '밤 줍는 모험가 냥', energy: 2, social: 0, delicacy: 0, boldness: 2, fur: 'cream', accessory: 'leaf' },
    { season: 'winter', name: '눈꽃', title: '목도리 온기 냥', energy: 0, social: 2, delicacy: 2, boldness: 1, fur: 'gray', accessory: 'scarf' },
    { season: 'winter', name: '군고구마', title: '겨울 간식 지킴이 냥', energy: 1, social: 2, delicacy: 1, boldness: 2, fur: 'orange', accessory: 'scarf' },
    { season: 'winter', name: '성에', title: '눈밭 질주 냥', energy: 2, social: 1, delicacy: 1, boldness: 0, fur: 'black', accessory: 'scarf' },
  ];

  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 축 점수 평균 → 0/1/2
  function level(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg < 2 / 3 ? 0 : avg < 4 / 3 ? 1 : 2;
  }

  // picks[i] = QUESTIONS[i]에서 고른 option.value
  function buildCat(questions, picks, nickname) {
    const scores = { energy: [], social: [], delicacy: [], boldness: [] };
    let fur = 'cream';
    let accessory = 'none';
    questions.forEach((q, i) => {
      if (q.trait === 'fur') fur = picks[i];
      else if (q.trait === 'accessory') accessory = picks[i];
      else scores[q.trait].push(picks[i]);
    });

    const cat = {
      energy: level(scores.energy),
      social: level(scores.social),
      delicacy: level(scores.delicacy),
      boldness: level(scores.boldness),
      fur,
      accessory,
    };
    cat.seed = hashStr(JSON.stringify([cat, (nickname || '').trim()]));
    cat.owner = cleanOwner(nickname);   // 시드 계산 뒤에 붙인다 (생김새에 영향 없음)
    return withSignature(finish(cat));
  }

  // 호스트(내 고양이) 전용 표식. 도감/손님 고양이에게는 절대 붙지 않는다.
  // 이마 무늬 4종 x 눈동자 색 4종이 시드로 정해지고, 도감과 같은 설문 조합이어도 한눈에 구별된다.
  const MARKS = ['star', 'heart', 'bolt', 'tabby'];
  const MARK_LABEL = { star: '별', heart: '하트', bolt: '번개', tabby: 'M자' };
  const EYE_COLORS = ['#c8892a', '#3f9a5a', '#4f7fd2', '#8a5ac8'];
  const SOCKS = ['#f7c6d8', '#c8ecd8', '#d8ccf5', '#fff0a8'];   // 분홍, 민트, 연보라, 버터
  const EYE_LABEL = { '#c8892a': '호박색', '#3f9a5a': '초록색', '#4f7fd2': '파란색', '#8a5ac8': '보라색' };

  function withSignature(cat) {
    if (!cat || typeof cat !== 'object') return cat;
    const r = rng(((cat.seed >>> 0) ^ 0x51ed270b) >>> 0);
    const mark = MARKS[Math.floor(r() * MARKS.length)];
    const eyeColor = EYE_COLORS[Math.floor(r() * EYE_COLORS.length)];
    cat.mark = mark;
    cat.eyeColor = eyeColor;
    cat.sock = SOCKS[Math.floor(r() * SOCKS.length)];   // 앞발 양말 색 (꼬리 끝은 이마 무늬와 같은 색)
    return cat;
  }

  // 도감(일반+한정)에 몸 형태·털색·악세사리가 완전히 같은 고양이가 있는지
  function sameComboInAlbum(cat) {
    const key = (c) => [c.energy, c.social, c.delicacy, c.boldness, c.fur, c.accessory].join('|');
    const k = key(cat);
    for (let i = 0; i < POOL_SIZE; i++) if (key(poolCat(i)) === k) return true;
    for (let i = 0; i < LIMITED.length; i++) if (key(limitedCat(i)) === k) return true;
    return false;
  }

  // 사용자가 넣은 이름: 공백 정리, 제어문자 제거, 12자까지
  function cleanOwner(v) {
    return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 12);
  }

  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  function finish(cat) {
    const r = rng(cat.seed ^ 0x9e3779b9);
    cat.name = pick(r, NAME_HEAD) + pick(r, NAME_TAIL);
    cat.title = TITLES[cat.energy][cat.social];
    return cat;
  }

  // 사랑방 손님: 시드만으로 고양이를 복원한다.
  function fromSeed(seed) {
    const r = rng(seed);
    return finish({
      energy: Math.floor(r() * 3),
      social: Math.floor(r() * 3),
      delicacy: Math.floor(r() * 3),
      boldness: Math.floor(r() * 3),
      fur: pick(r, ['cream', 'orange', 'black', 'gray']),
      accessory: pick(r, ['none', 'none', 'tie', 'glasses', 'bell', 'bottle']),
      chubby: r() < 0.15,
      seed,
    });
  }

  // 도감: 만날 수 있는 고양이는 POOL_SIZE마리로 정해져 있다.
  const POOL_SIZE = 60;
  const poolCache = [];
  function poolCat(k) {
    if (!poolCache[k]) poolCache[k] = fromSeed(hashStr('pool-' + k));
    return poolCache[k];
  }

  const limitedCache = [];
  function limitedCat(i) {
    if (!limitedCache[i]) {
      limitedCache[i] = Object.assign({}, LIMITED[i], {
        seed: hashStr('limited-' + i), limited: true, id: LIMITED_BASE + i,
      });
    }
    return limitedCache[i];
  }

  // 도감 id → 고양이. 0~59는 일반 손님, 100~111은 시즌 한정 손님.
  function catById(id) {
    return id >= LIMITED_BASE ? limitedCat(id - LIMITED_BASE) : poolCat(id);
  }

  // slot(30분 단위)마다 손님이 선물을 들고 오는지. 없으면 null.
  function giftOf(catId, slot) {
    const r = rng(hashStr(`gift-${slot}-${catId}`));
    if (r() > GIFT_RATE) return null;
    const own = catById(catId).accessory;
    if (own && own !== 'none' && GIFT_IDS.includes(own)) return own;
    return EXTRA_GIFTS[Math.floor(r() * EXTRA_GIFTS.length)];
  }

  function limitedIdsOf(season) {
    return LIMITED.map((c, i) => (c.season === season ? LIMITED_BASE + i : -1)).filter((i) => i >= 0);
  }

  function seasonOf(date) {
    const m = date.getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  // 30분마다 손님이 바뀐다. 반환값은 도감 id 배열.
  // season을 넘기면 절반쯤의 확률로 그 계절의 한정 손님이 한 자리를 차지한다.
  // bonus(간식이 놓여 있음)면 기본 손님은 그대로 두고 2마리가 더 온다.
  // 이때 한정 손님이 아직 없으면 70% 확률로 그 계절의 한정 손님이 합류한다.
  function visitorsFor(now, count, season, bonus) {
    const slot = Math.floor(now / (30 * 60 * 1000));
    const r = rng(hashStr('slot-' + slot));
    const ids = [];
    while (ids.length < count) {
      const k = Math.floor(r() * POOL_SIZE);
      if (!ids.includes(k)) ids.push(k);
    }
    const roll = r();
    const pickIdx = r();
    if (season && roll < 0.5) {
      const specials = limitedIdsOf(season);
      ids[count - 1] = specials[Math.floor(pickIdx * specials.length)];
    }
    if (bonus) {
      const r2 = rng(hashStr('extra-' + slot));
      const extra = [];
      while (extra.length < 2) {
        const k = Math.floor(r2() * POOL_SIZE);
        if (!ids.includes(k) && !extra.includes(k)) extra.push(k);
      }
      const roll2 = r2();
      const pick2 = r2();
      if (season && !ids.some((k) => k >= LIMITED_BASE) && roll2 < 0.7) {
        const specials = limitedIdsOf(season);
        extra[1] = specials[Math.floor(pick2 * specials.length)];
      }
      return ids.concat(extra);
    }
    return ids;
  }

  // 백업 코드에서 불러온 고양이를 검증하고 이름/타이틀을 다시 계산한다.
  function normalizeCat(o) {
    if (!o || typeof o !== 'object') return null;
    const lv = (v) => Number.isInteger(v) && v >= 0 && v <= 2;
    if (![o.energy, o.social, o.delicacy, o.boldness].every(lv)) return null;
    if (!['cream', 'orange', 'black', 'gray'].includes(o.fur)) return null;
    if (!['none', 'tie', 'glasses', 'bell', 'bottle'].includes(o.accessory)) return null;
    if (!Number.isFinite(o.seed)) return null;
    return withSignature(finish({
      energy: o.energy, social: o.social, delicacy: o.delicacy, boldness: o.boldness,
      fur: o.fur, accessory: o.accessory, seed: o.seed >>> 0, chubby: !!o.chubby,
      owner: cleanOwner(o.owner),
      worn: normalizeWorn(o.worn),
    }));
  }

  function reasonsOf(cat) {
    return [
      REASONS.energy[cat.energy],
      REASONS.social[cat.social],
      REASONS.delicacy[cat.delicacy],
      REASONS.boldness[cat.boldness],
      REASONS.fur[cat.fur],
    ].concat(cat.mark ? [`이마의 ${MARK_LABEL[cat.mark]} 무늬와 ${EYE_LABEL[cat.eyeColor] || ''} 눈, 꼬리 끝과 양말 색 → 도감의 어떤 고양이와도 다른, 이 사랑방의 호스트만의 표식이에요.`] : [])
    .concat((cat.accessories && cat.accessories.length ? cat.accessories : [cat.accessory])
      .map((a) => REASONS.accessory[a]).filter(Boolean));
  }

  root.Cat = {
    buildCat, withSignature, sameComboInAlbum, MARK_LABEL, normalizeCat, cleanOwner, giftOf, GIFT_IDS, SLOTS, SLOT_LABEL, SLOT_OF, normalizeWorn, outfitOf, dressed, reasonsOf, rng, hashStr, fromSeed, poolCat, catById, visitorsFor, seasonOf,
    POOL_SIZE, LIMITED_BASE, LIMITED_COUNT: LIMITED.length, SEASONS, SEASON_NAME, limitedIdsOf,
    FUR_LABEL, ACC_LABEL,
  };
})(typeof window !== 'undefined' ? window : globalThis);
