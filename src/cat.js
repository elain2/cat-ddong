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
      honey: '꿀처럼 따뜻한 금빛 털이에요 → 한낮의 햇볕 아래가 제일 좋아요.',
      blue: '비 갠 하늘 같은 푸른 털이에요 → 차분한 오후를 좋아해요.',
      white: '눈처럼 하얀 털이에요 → 조용하고 깨끗한 날이 좋아요.',
      brown: '진한 초콜릿 빛 털이에요 → 따뜻한 저녁 한 잔을 좋아해요.',
      butler: '턱시도를 차려입었어요 → 언제나 단정한 사랑방의 집사예요.',
      gray: '새벽 같은 은회색이에요 → 고요한 시간을 사랑해요.',
    },
    look: {
      ear: {
        round: '귀가 동글동글해요 → 맞장구를 잘 쳐 줘요.',
        fold: '귀가 접혀 있어요 → 한 귀로 듣고 한 귀로 흘려요.',
        big: '귀가 커다래요 → 리액션이 아주 커요.',
      },
      tail: {
        bob: '꼬리가 몽땅해요 → 좋아도 속으로만 좋아해요.',
        long: '꼬리가 길어요 → 기분이 온몸에 다 드러나요.',
        fluffy: '꼬리가 풍성해요 → 기분이 좋으면 온몸이 부풀어요.',
      },
      build: {
        slim: '날씬한 편이에요 → 소식하고 가벼워요.',
        chubby: '통통해요 → 먹는 즐거움을 아는 고양이예요.',
      },
      coat: {
        tuft: '볼 털이 살짝 뻗쳤어요 → 꾸미지 않아도 매력이 있어요.',
        fluffy: '털이 폭신폭신해요 → 어디서든 포근한 인상이에요.',
      },
    },
    pattern: {
      plain: '무늬 없이 깔끔해요 → 담백하고 단정한 매력이에요.',
      tabby: '줄무늬가 있어요 → 개성이 뚜렷하고 존재감이 있어요.',
      spots: '점박이 무늬가 있어요 → 어딜 가도 눈에 띄는 매력이에요.',
      point: '귀와 꼬리 끝이 진해요 → 포인트 하나로 멋을 낼 줄 알아요.',
    },
    accessory: {
      bottle: '술병을 꼭 쥐고 있어요 → 한 잔이면 세상이 다 내 편이에요.',
      tie: '넥타이를 머리에 감았어요 → 오늘은 달리는 날, 분위기 메이커예요.',
      glasses: '안경을 쓰고 있어요 → 책 한 권이면 충분해요.',
      bell: '방울을 달고 있어요 → 주전부리를 못 참아요.',
      none: '아직 아무것도 안 걸쳤어요 → 손님이 주는 선물을 기다리고 있어요.',
      crown: '왕관을 썼어요 → 사랑방의 주인은 바로 나예요.',
      partyhat: '고깔모자를 썼어요 → 오늘은 누군가의 생일이에요.',
      flowers: '꽃관을 썼어요 → 걸음마다 봄이 따라와요.',
      cape: '망토를 둘렀어요 → 사랑방을 지키는 영웅이에요.',
      headphones: '헤드폰을 썼어요 → 나만의 음악이 필요해요.',
      ribbonpin: '리본핀을 꽂았어요 → 작은 멋도 놓치지 않아요.',
      bowtie: '나비넥타이를 맸어요 → 손님 맞을 준비는 늘 끝나 있어요.',
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
      goldribbon: '금빛 리본을 맸어요 → 도감을 끝까지 채운 집사의 훈장이에요.',
    },
  };

  const FUR_LABEL = {
    cream: '크림', orange: '오렌지', black: '검정', gray: '은회색', butler: '턱시도',
    honey: '꿀색', blue: '블루', white: '화이트', brown: '초콜릿',
  };
  const ACC_LABEL = {
    bowtie: '나비넥타이', bottle: '술병', tie: '넥타이', glasses: '안경', bell: '방울', none: '맨몸',
    blossom: '벚꽃', shades: '선글라스', leaf: '단풍잎', scarf: '목도리',
    crown: '왕관', partyhat: '고깔모자', flowers: '꽃관', cape: '망토', headphones: '헤드폰', ribbonpin: '리본핀',
    pearl: '진주 목걸이', shell: '조개 목걸이',
    beret: '베레모', strawhat: '밀짚모자', santahat: '산타모자',
    monocle: '외눈안경', heartglasses: '하트 안경', sleepmask: '수면안대',
    bandana: '반다나', medal: '메달', lei: '꽃목걸이',
    wings: '천사 날개', butterfly: '나비 날개', backpack: '배낭',
    fish: '생선', balloon: '풍선', icecream: '아이스크림',
    goldribbon: '금빛 리본',
  };

  // 선물: 손님이 가끔 가져오는 악세사리. 호스트(내 고양이)가 착용할 수 있다.
  // 자기가 하고 있는 걸 건네고, 아무것도 안 한 고양이는 아래 특별 선물 중 하나를 준다.
  const EXTRA_GIFTS = ['crown', 'partyhat', 'flowers', 'cape', 'headphones', 'ribbonpin', 'pearl', 'shell',
    'beret', 'strawhat', 'santahat', 'monocle', 'heartglasses', 'sleepmask',
    'bandana', 'medal', 'lei', 'wings', 'butterfly', 'backpack', 'fish', 'balloon', 'icecream'];
  // 술병은 선물에서 제외. 금빛 리본은 도감 완주 보상이라 손님이 들고 오지 않는다(EXTRA_GIFTS에 없음).
  const GIFT_IDS = ['tie', 'glasses', 'bell', 'blossom', 'shades', 'leaf', 'scarf'].concat(EXTRA_GIFTS, ['goldribbon']);
  // 착용 자리(슬롯): 슬롯마다 하나씩, 서로 다른 슬롯은 같이 착용할 수 있다.
  const SLOTS = ['head', 'face', 'neck', 'back', 'hold'];
  const SLOT_LABEL = { head: '머리', face: '얼굴', neck: '목', back: '등', hold: '손' };
  const SLOT_OF = {
    tie: 'head', blossom: 'head', leaf: 'head', crown: 'head', partyhat: 'head', flowers: 'head',
    ribbonpin: 'head', headphones: 'head', beret: 'head', strawhat: 'head', santahat: 'head',
    glasses: 'face', shades: 'face', monocle: 'face', heartglasses: 'face', sleepmask: 'face',
    bell: 'neck', scarf: 'neck', pearl: 'neck', shell: 'neck', bandana: 'neck', medal: 'neck', lei: 'neck',
    bowtie: 'neck', goldribbon: 'neck',
    cape: 'back', wings: 'back', butterfly: 'back', backpack: 'back',
    bottle: 'hold', fish: 'hold', balloon: 'hold', icecream: 'hold',
  };

  // 저장된 worn(예전엔 문자열 하나)을 {슬롯: id}로 정리한다.
  function normalizeWorn(w) {
    const out = {};
    if (typeof w === 'string' && SLOT_OF[w] && GIFT_IDS.includes(w)) out[SLOT_OF[w]] = w;
    else if (w && typeof w === 'object') {
      SLOTS.forEach((s) => {
        if (typeof w[s] === 'string' && SLOT_OF[w[s]] === s && GIFT_IDS.includes(w[s])) out[s] = w[s];
      });
    }
    return out;
  }

  // 지금 입고 있는 모든 악세사리(슬롯 순서). 설문 악세사리는 같은 슬롯을 선물이 차지하면 밀려난다.
  function outfitOf(cat) {
    const bySlot = {};
    [cat.accessory, cat.accessory2].forEach((base) => {      // 설문으로 정해진 악세사리(주말 + 저녁)
      if (base && base !== 'none' && SLOT_OF[base]) bySlot[SLOT_OF[base]] = base;
    });
    const worn = normalizeWorn(cat.worn);
    SLOTS.forEach((s) => { if (worn[s]) bySlot[s] = worn[s]; });
    return SLOTS.map((s) => bySlot[s]).filter(Boolean);
  }

  // 보여 줄 악세사리 이름 목록 ('none' 제외). 아무것도 없으면 ['none'].
  function accessoryList(cat) {
    const list = (cat.accessories && cat.accessories.length ? cat.accessories : [cat.accessory, cat.accessory2])
      .filter((a) => a && a !== 'none');
    return list.length ? list : ['none'];
  }

  // 그릴 때 쓰는 복사본: accessories에 입은 것 전체가 들어간다.
  function dressed(cat) {
    return Object.assign({}, cat, { accessories: outfitOf(cat) });
  }

  // 처음 만났을 때 설문 답에 어울리는 액세서리 하나를 준다. 맞는 후보가 여럿이면 시드로 하나를 고른다.
  function starterGift(cat) {
    if (!cat || cat.egg) return null;
    const c = [];
    if (cat.pattern === 'point') c.push('beret');          // 신발·모자로 포인트
    if (cat.build === 'chubby') c.push('icecream');        // 먹보
    if (cat.energy === 2) c.push('backpack');              // 어디 갈지 검색 중
    if (cat.energy === 0) c.push('sleepmask');             // 이불 속 한 시간
    if (cat.social === 2) c.push('bandana');               // 먼저 말 거는 사람
    if (cat.social === 0) c.push('headphones');            // 구석에서 조용히
    if (cat.delicacy === 2) c.push('monocle');             // 모든 물건에 제자리
    if (cat.boldness === 2) c.push('cape');                // 일단 하고 본다
    if (cat.tail === 'fluffy') c.push('butterfly');        // 온몸이 부풀어 오름
    if (cat.ear === 'big') c.push('heartglasses');         // 리액션이 큼
    if (!c.length) c.push('ribbonpin');
    return c[(cat.seed >>> 0) % c.length];
  }

  const GIFT_RATE = 0.45;   // 손님이 선물을 들고 올 확률(30분 슬롯마다)

  // 시즌 한정 손님: 방 배경이 그 계절일 때만 놀러 온다. id는 100번부터, 계절마다 3마리.
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
  // 털색 격자: 따뜻한 계열 / 시원한 계열 x 밝기 4단계
  const FUR_GRID = {
    warm: ['cream', 'honey', 'orange', 'brown'],
    cool: ['white', 'blue', 'gray', 'black'],
  };
  const ACCESSORY_IDS = ['none', 'tie', 'glasses', 'bell', 'bottle', 'bowtie', 'beret', 'strawhat',
    'headphones', 'partyhat', 'scarf'];
  const PATTERNS = ['plain', 'tabby', 'spots', 'point'];
  // 외형 축(설문으로 정하며 악세사리와 무관): 귀 모양, 꼬리, 체형, 털 결
  const EARS = ['pointy', 'round', 'fold', 'big'];
  const TAILS = ['normal', 'bob', 'long', 'fluffy'];
  const BUILDS = ['slim', 'normal', 'chubby'];
  const COATS = ['smooth', 'tuft', 'fluffy'];
  const PATTERN_PREFIX = { tabby: '줄무늬 ', spots: '점박이 ', point: '포인트 ' };

  function buildCat(questions, picks, nickname) {
    if (isZipsa(nickname)) return zipsaCat();
    const scores = { energy: [], social: [], delicacy: [], boldness: [] };
    let fur = 'cream';
    let accessory = 'none';
    let accessory2 = 'none';
    let pattern = 'plain';
    let ear = 'pointy', tail = 'normal', build = 'normal', coat = 'smooth';
    let tone = null;
    let family = 'warm';
    questions.forEach((q, i) => {
      if (q.trait === 'fur') fur = picks[i];                  // (예전 설문: 한 질문에 털색 직접)
      else if (q.trait === 'furTone') tone = picks[i];
      else if (q.trait === 'furFamily') family = picks[i];
      else if (q.trait === 'accessory') accessory = picks[i];
      else if (q.trait === 'accessory2') accessory2 = picks[i];
      else if (q.trait === 'pattern') pattern = picks[i];
      else if (q.trait === 'ear') ear = picks[i];
      else if (q.trait === 'tail') tail = picks[i];
      else if (q.trait === 'build') build = picks[i];
      else if (q.trait === 'coat') coat = picks[i];
      else scores[q.trait].push(picks[i]);
    });

    // 털색: 시간대(밝기 0~3) x 분위기(따뜻/시원) 두 질문의 조합
    if (tone !== null) fur = (FUR_GRID[family] || FUR_GRID.warm)[tone] || fur;

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
    cat.accessory2 = ACCESSORY_IDS.includes(accessory2) ? accessory2 : 'none';   // 시드 뒤에 붙인다
    cat.ear = EARS.includes(ear) ? ear : 'pointy';
    cat.tail = TAILS.includes(tail) ? tail : 'normal';
    cat.build = BUILDS.includes(build) ? build : 'normal';
    cat.coat = COATS.includes(coat) ? coat : 'smooth';
    cat.pattern = PATTERNS.includes(pattern) ? pattern : 'plain';   // 시드 뒤에 붙여 같은 답의 기존 고양이는 그대로 나온다
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
    if (cat.egg) return cat;                 // 집사 고양이는 그 자체가 디자인이다
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

  // 이름을 안 넣었을 때 시드로 지어 주는 이름
  function autoName(seed) {
    const r = rng(seed ^ 0x9e3779b9);
    return pick(r, NAME_HEAD) + pick(r, NAME_TAIL);
  }

  function finish(cat) {
    // 설문 고양이는 '고양이가 된 나'다. 입력한 이름이 곧 고양이 이름이다.
    cat.name = cat.owner || autoName(cat.seed);
    cat.title = (PATTERN_PREFIX[cat.pattern] || '') + TITLES[cat.energy][cat.social];
    if (cat.egg === 'zipsa') { cat.name = '집사'; cat.title = '사랑방의 집사 냥'; }
    return cat;
  }

  // 이스터에그: 이름에 'zipsa'를 넣으면 사랑방의 집사 고양이가 나온다.
  // 별도 스프라이트 없이 일반 생성기로 만들어서 선물도 그대로 입힐 수 있다.
  function isZipsa(v) {
    return String(v == null ? '' : v).trim().toLowerCase() === 'zipsa';
  }
  function zipsaCat() {
    return finish({
      energy: 1, social: 2, delicacy: 2, boldness: 1,
      fur: 'butler', accessory: 'bowtie', seed: 7, egg: 'zipsa', owner: '',
    });
  }

  // 사랑방 손님: 시드만으로 고양이를 복원한다.
  function fromSeed(seed) {
    const r = rng(seed);
    const base = {
      energy: Math.floor(r() * 3),
      social: Math.floor(r() * 3),
      delicacy: Math.floor(r() * 3),
      boldness: Math.floor(r() * 3),
      fur: pick(r, ['cream', 'orange', 'black', 'gray']),
      accessory: pick(r, ['none', 'none', 'tie', 'glasses', 'bell', 'bottle']),
      chubby: r() < 0.15,
      seed,
    };
    // 새 외형 축: 기존 속성의 난수 순서를 건드리지 않도록 마지막에 뽑는다
    base.ear = pick(r, ['pointy', 'pointy', 'round', 'fold', 'big']);
    base.tail = pick(r, ['normal', 'normal', 'bob', 'long', 'fluffy']);
    base.coat = pick(r, ['smooth', 'smooth', 'tuft', 'fluffy']);
    return finish(base);
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

  // 도감 완주 후 유저가 직접 만드는 손님. id 200 하나뿐이고 도감 수에는 들어가지 않는다.
  const CUSTOM_BASE = 200;
  const CUSTOM_FURS = ['cream', 'honey', 'orange', 'brown', 'white', 'blue', 'gray', 'black'];
  let customSpec = null, customCache = null;
  function cleanCustom(o) {
    if (!o || typeof o !== 'object') return null;
    const name = cleanOwner(o.name);
    if (!name) return null;
    const lv = (v) => (Number.isInteger(v) && v >= 0 && v <= 2 ? v : 1);
    const one = (list, v, d) => (list.includes(v) ? v : d);
    return {
      name, fur: one(CUSTOM_FURS, o.fur, 'cream'), pattern: one(PATTERNS, o.pattern, 'plain'),
      ear: one(EARS, o.ear, 'pointy'), tail: one(TAILS, o.tail, 'normal'),
      build: one(BUILDS, o.build, 'normal'), coat: one(COATS, o.coat, 'smooth'),
      energy: lv(o.energy), social: lv(o.social),
      seed: Number.isFinite(o.seed) ? o.seed >>> 0 : hashStr('custom-' + name),
    };
  }
  // 저장된 설계도를 등록한다. 없으면(null) 손님으로 오지 않는다.
  function setCustom(spec) { customSpec = cleanCustom(spec); customCache = null; return customSpec; }
  function customCat(spec) {
    const c = cleanCustom(spec === undefined ? customSpec : spec);
    if (!c) return null;
    if (spec === undefined && customCache) return customCache;
    const cat = finish({
      energy: c.energy, social: c.social, delicacy: 1, boldness: 1, fur: c.fur, accessory: 'none',
      accessory2: 'none', pattern: c.pattern, ear: c.ear, tail: c.tail, build: c.build, coat: c.coat,
      chubby: c.build === 'chubby', seed: c.seed, owner: c.name,
    });
    cat.custom = true; cat.id = CUSTOM_BASE;
    if (spec === undefined) customCache = cat;
    return cat;
  }

  // 도감 id → 고양이. 0~59는 일반 손님, 100~111은 시즌 한정 손님, 200은 내가 만든 손님.
  function catById(id) {
    if (id === CUSTOM_BASE) return customCat() || poolCat(0);
    return id >= LIMITED_BASE ? limitedCat(id - LIMITED_BASE) : poolCat(id);
  }

  // slot(30분 단위)마다 손님이 선물을 들고 오는지. 없으면 null.
  // who: 사람마다 다른 시드. 같은 시각에 접속한 친구와 손님·선물이 겹치지 않는다.
  function giftOf(catId, slot, who) {
    const r = rng(hashStr(`gift-${slot}-${catId}-${who == null ? '' : who}`));
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
  // season(방 배경의 계절)을 넘기면 절반쯤의 확률로 그 계절의 한정 손님이 한 자리를 차지한다.
  // 계절마다 따로 굴리므로, 배경을 바꾸면 그 계절의 한정 손님이 올지 다시 정해진다.
  // bonus(간식이 놓여 있음)면 기본 손님은 그대로 두고 2마리가 더 온다.
  // 이때 한정 손님이 아직 없으면 70% 확률로 그 계절의 한정 손님이 합류한다.
  // who: 사람마다 다른 시드(같은 시각에도 손님이 다르다). 같은 사람은 같은 슬롯에 항상 같은 손님이다.
  function visitorsFor(now, count, season, bonus, who) {
    const slot = Math.floor(now / (30 * 60 * 1000));
    const tag = who == null ? '' : '-' + who;
    const r = rng(hashStr('slot-' + slot + tag));
    const ids = [];
    while (ids.length < count) {
      const k = Math.floor(r() * POOL_SIZE);
      if (!ids.includes(k)) ids.push(k);
    }
    const rs = rng(hashStr('limited-' + slot + tag + '-' + season));
    const roll = rs();
    const pickIdx = rs();
    if (season && roll < 0.5) {
      const specials = limitedIdsOf(season);
      ids[count - 1] = specials[Math.floor(pickIdx * specials.length)];
    }
    if (bonus) {
      const r2 = rng(hashStr('extra-' + slot + tag));
      const extra = [];
      while (extra.length < 2) {
        const k = Math.floor(r2() * POOL_SIZE);
        if (!ids.includes(k) && !extra.includes(k)) extra.push(k);
      }
      const roll2 = rs();
      const pick2 = rs();
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
    if (!['cream', 'orange', 'black', 'gray', 'honey', 'blue', 'white', 'brown', 'butler'].includes(o.fur)) return null;
    if (!ACCESSORY_IDS.includes(o.accessory)) return null;
    if (!Number.isFinite(o.seed)) return null;
    return withSignature(finish({
      energy: o.energy, social: o.social, delicacy: o.delicacy, boldness: o.boldness,
      fur: o.fur, accessory: o.accessory, accessory2: ACCESSORY_IDS.includes(o.accessory2) ? o.accessory2 : 'none',
      seed: o.seed >>> 0, chubby: !!o.chubby,
      owner: cleanOwner(o.owner),
      egg: o.egg === 'zipsa' ? 'zipsa' : undefined,
      worn: normalizeWorn(o.worn),
      pattern: PATTERNS.includes(o.pattern) ? o.pattern : 'plain',
      ear: EARS.includes(o.ear) ? o.ear : 'pointy',
      tail: TAILS.includes(o.tail) ? o.tail : 'normal',
      build: BUILDS.includes(o.build) ? o.build : 'normal',
      coat: COATS.includes(o.coat) ? o.coat : 'smooth',
    }));
  }

  function reasonsOf(cat) {
    return [
      REASONS.energy[cat.energy],
      REASONS.social[cat.social],
      REASONS.delicacy[cat.delicacy],
      REASONS.boldness[cat.boldness],
      REASONS.fur[cat.fur],
      REASONS.pattern[cat.pattern || 'plain'],
    ].concat(['ear', 'tail', 'build', 'coat'].map((k) => (REASONS.look[k] || {})[cat[k]]).filter(Boolean)).concat(cat.mark ? [`이마의 ${MARK_LABEL[cat.mark]} 무늬와 ${EYE_LABEL[cat.eyeColor] || ''} 눈, 꼬리 끝과 양말 색 → 도감의 어떤 고양이와도 다른, 이 사랑방의 호스트만의 표식이에요.`] : [])
    .concat(accessoryList(cat).map((a) => REASONS.accessory[a]).filter(Boolean));
  }

  root.Cat = {
    buildCat, accessoryList, FUR_GRID, autoName, isZipsa, withSignature, sameComboInAlbum, MARK_LABEL, normalizeCat, cleanOwner, giftOf, starterGift, GIFT_IDS, SLOTS, SLOT_LABEL, SLOT_OF, normalizeWorn, outfitOf, dressed, reasonsOf, rng, hashStr, fromSeed, poolCat, catById, visitorsFor, seasonOf,
    POOL_SIZE, LIMITED_BASE, LIMITED_COUNT: LIMITED.length, CUSTOM_BASE, CUSTOM_FURS, PATTERNS, EARS, TAILS, BUILDS, COATS,
    setCustom, customCat, cleanCustom, hasCustom: () => !!customSpec, SEASONS, SEASON_NAME, limitedIdsOf,
    FUR_LABEL, ACC_LABEL,
  };
})(typeof window !== 'undefined' ? window : globalThis);
