// 사랑방: 고양이들이 오가는 방. 시즌에 맞게 꾸며진다.
(function (root) {
  const W = 240, H = 176, FLOOR_Y = 84;
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const SEASON_LABEL = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };

  const THEME = {
    spring: { wall: '#fbe4e8', trim: '#e9b8c2', sky: '#bfe4ff', rug: '#f4a6b8', rug2: '#fbd3dc' },
    summer: { wall: '#def2ee', trim: '#a9d6cf', sky: '#7fd0ff', rug: '#4fb3a9', rug2: '#a6e3da' },
    autumn: { wall: '#f7e1bf', trim: '#d9b27a', sky: '#f3b67c', rug: '#c8693a', rug2: '#e7a36b' },
    winter: { wall: '#e6ebf6', trim: '#b8c4dd', sky: '#cdd9ef', rug: '#c8414f', rug2: '#f1f1f1' },
  };

  function seasonOf(date) {
    const m = date.getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  // 배경은 시즌마다 한 번만 그려서 캐시한다.
  const bgCache = {};
  function background(season, deco) {
    const d = Object.assign({ wall: 'default', floor: 'wood', rug: 'default' }, deco || {});
    const key = `${season}|${d.wall}|${d.floor}|${d.rug}|${d.hidePumpkin ? 1 : 0}`;
    if (bgCache[key]) return bgCache[key];
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const T = THEME[season];
    const R = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };

    // 벽
    let trim = T.trim;
    if (d.wall === 'cream') {
      R(0, 0, W, FLOOR_Y, '#fff4dc');
      ctx.globalAlpha = 0.7;
      for (let y = 4; y < FLOOR_Y; y += 8) R(0, y, W, 1, '#ecd9b0');
      ctx.globalAlpha = 1;
      trim = '#e6c98a';
    } else if (d.wall === 'mint' || d.wall === 'pink') {
      const base = d.wall === 'mint' ? '#dff3ea' : '#fde4ee';
      const dot = d.wall === 'mint' ? '#bfe3d3' : '#f7b6c8';
      R(0, 0, W, FLOOR_Y, base);
      for (let y = 6, row = 0; y < FLOOR_Y - 4; y += 12, row++) {
        for (let x = (row % 2) * 6 + 4; x < W; x += 12) R(x, y, 2, 2, dot);
      }
      trim = d.wall === 'mint' ? '#9fd4bd' : '#eaa0b8';
    } else if (d.wall === 'night') {
      R(0, 0, W, FLOOR_Y, '#2f3556');
      let seed = 7;
      for (let i = 0; i < 40; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const sx = seed % W;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const sy = seed % (FLOOR_Y - 8);
        R(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1, i % 3 ? '#ffe9a8' : '#ffffff');
      }
      trim = '#232846';
    } else {
      R(0, 0, W, FLOOR_Y, T.wall);
      ctx.globalAlpha = 0.35;
      for (let x = 0; x < W; x += 16) R(x, 0, 2, FLOOR_Y, T.trim);
      ctx.globalAlpha = 1;
    }
    R(0, FLOOR_Y - 4, W, 4, trim);

    // 바닥
    if (d.floor === 'tile') {
      R(0, FLOOR_Y, W, H - FLOOR_Y, '#ece6da');
      for (let y = FLOOR_Y; y < H; y += 16) R(0, y, W, 1, '#cfc6b4');
      for (let x = 0; x < W; x += 16) R(x, FLOOR_Y, 1, H - FLOOR_Y, '#cfc6b4');
    } else if (d.floor === 'check') {
      R(0, FLOOR_Y, W, H - FLOOR_Y, '#f4d9a8');
      for (let y = FLOOR_Y, row = 0; y < H; y += 12, row++) {
        for (let x = (row % 2) * 12, col = 0; x < W; x += 24, col++) R(x, y, 12, 12, '#e3bd7e');
      }
    } else {
      R(0, FLOOR_Y, W, H - FLOOR_Y, '#dcae78');
      for (let y = FLOOR_Y, row = 0; y < H; y += 12, row++) {
        R(0, y, W, 1, '#c99763');
        for (let x = (row % 2) * 20; x < W; x += 40) R(x, y, 1, 12, '#c99763');
      }
    }

    // 창문
    R(22, 12, 60, 48, '#8a6a4a');
    R(26, 16, 52, 40, T.sky);
    if (season === 'summer') R(58, 20, 12, 12, '#ffe45c');
    if (season === 'spring') { R(28, 40, 18, 14, '#f7b6c8'); R(34, 46, 4, 10, '#8a6a4a'); }
    if (season === 'autumn') R(26, 46, 52, 10, '#b5683a');
    if (season === 'winter') R(26, 48, 52, 8, '#ffffff');
    R(50, 16, 4, 40, '#8a6a4a');
    R(26, 34, 52, 3, '#8a6a4a');
    R(18, 60, 68, 5, '#a98259');

    // 선반
    R(110, 32, 100, 4, '#a98259');
    R(120, 22, 10, 10, '#c8693a'); R(118, 12, 14, 10, '#5fa85a');
    R(150, 16, 18, 16, '#8a6a4a'); R(152, 18, 14, 12, '#f4e4a8');
    R(182, 20, 6, 12, '#d2554f'); R(188, 22, 6, 10, '#4f7fd2'); R(194, 18, 6, 14, '#e8b84a');

    // 러그
    const RUGC = { blue: ['#4f7fd2', '#bcd0f5'], green: ['#4fa86b', '#bfe6c9'], purple: ['#8a5ac8', '#d6c4f0'] };
    const [rug1, rug2] = RUGC[d.rug] || [T.rug, T.rug2];
    R(60, 118, 120, 44, rug1);
    R(64, 122, 112, 36, rug2);
    R(68, 126, 104, 28, rug1);

    // 캣타워
    R(194, 138, 34, 12, '#b98c5a');
    R(206, 70, 10, 70, '#e8d2a8');
    for (let y = 74; y < 136; y += 8) R(206, y, 10, 2, '#c9ad7c');
    R(196, 62, 30, 8, '#b98c5a');
    R(198, 100, 26, 6, '#b98c5a');

    // 밥그릇
    R(150, 150, 18, 6, '#e9e4dc');
    R(152, 148, 14, 3, '#c98d5a');

    // 시즌 장식
    if (season === 'spring') {
      R(40, 134, 12, 10, '#c8693a'); R(45, 120, 2, 14, '#5fa85a');
      R(42, 116, 8, 6, '#f7a6c0'); R(45, 118, 2, 2, '#ffe45c');
      R(32, 138, 6, 6, '#f7a6c0'); R(34, 134, 2, 6, '#5fa85a');
    } else if (season === 'summer') {
      R(36, 126, 24, 9, '#e0405a'); R(36, 135, 24, 3, '#4aa056');
      R(42, 129, 2, 2, OUT); R(50, 129, 2, 2, OUT);
      R(100, 168, 8, 3, '#7fd0ff'); // 물방울 자국
    } else if (season === 'autumn') {
      // 호박은 가구('호박')로 꺼내 놓으면 배경에서는 빠진다
      if (!d.hidePumpkin) drawItem(ctx, 'pumpkin', 49, 140, 0);
      R(90, 160, 4, 3, '#c8693a'); R(20, 150, 4, 3, '#e8892a'); R(130, 168, 4, 3, '#b5683a');
    } else {
      for (let i = 0; i < 6; i++) R(46 - i * 3, 100 + i * 8, 6 + i * 6, 8, '#3f8f55');
      R(46, 148, 4, 6, '#7a5230'); R(46, 94, 4, 4, '#ffe45c');
      [[44, 108, '#e04f5f'], [52, 114, '#ffe45c'], [40, 122, '#4f7fd2'], [56, 128, '#e04f5f'], [46, 136, '#ffe45c']]
        .forEach(([x, y, col]) => R(x, y, 2, 2, col));
    }
    bgCache[key] = c;
    return c;
  }
  const OUT = '#2b2333';

  // 올라앉을 수 있는 자리: 고양이 발(발바닥 y)이 이 높이에 닿으면 앉는다.
  const PERCHES = [
    { label: '캣타워 꼭대기', x0: 196, x1: 226, y: 62 },
    { label: '캣타워 중간', x0: 198, x1: 224, y: 100 },
    { label: '선반', x0: 112, x1: 208, y: 32 },
    { label: '창틀', x0: 20, x1: 84, y: 60 },
  ];

  // 창 밖 파티클 (봄 꽃잎, 가을 낙엽, 겨울 눈, 여름 반짝임)
  const PARTICLE_COLOR = { spring: '#f7b6c8', autumn: '#c8693a', winter: '#ffffff', summer: '#ffffff' };
  function drawParticles(ctx, season, t) {
    ctx.fillStyle = PARTICLE_COLOR[season];
    for (let i = 0; i < 12; i++) {
      const sx = 28 + ((i * 37) % 48);
      if (season === 'summer') {
        if (Math.floor(t / 400 + i) % 3 === 0) ctx.fillRect(sx, 20 + ((i * 11) % 28), 2, 2);
        continue;
      }
      const speed = 6 + (i % 4) * 2;
      const y = 16 + ((t / 1000 * speed + i * 9) % 38);
      const x = sx + Math.round(Math.sin(t / 700 + i) * 3);
      ctx.fillRect(Math.min(76, Math.max(26, x)), y, 2, 2);
    }
  }

  // 단체사진 액자에 담길 내용: 테두리 색과 단짝 고양이 털색(최대 3). 졸업앨범에서 정한다.
  const FUR_HEX = {
    cream: '#f6e3b8', honey: '#e8b84a', orange: '#f09a3e', brown: '#8a5a3a',
    white: '#fffaf0', blue: '#8fa8c8', gray: '#a9a5b0', black: '#4a4352', butler: '#4a4352',
  };
  let frameStyle = { border: '#f2a64e', furs: [] };
  function setFrameStyle(s) { frameStyle = Object.assign({ border: '#f2a64e', furs: [] }, s || {}); }

  // 가구 그림. (x, y)는 바닥에 닿는 아래쪽 가운데.
  function drawItem(ctx, id, x, y, t) {
    const R = (rx, ry, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(rx), Math.round(ry), w, h); };
    const edge = (rx, ry, w, h) => R(rx - 1, ry - 1, w + 2, h + 2, OUT);
    if (id === 'cushion') {
      edge(x - 10, y - 9, 20, 9);
      R(x - 10, y - 9, 20, 9, '#f2808c');
      R(x - 8, y - 8, 7, 2, '#f9b0b8');
      [[-10, -9], [8, -9], [-10, -2], [8, -2]].forEach(([dx, dy]) => R(x + dx, y + dy, 2, 2, '#ffd84a'));
    } else if (id === 'plant') {
      R(x - 7, y - 20, 5, 8, '#5fa85a'); R(x - 2, y - 22, 4, 10, '#4f9a4f'); R(x + 2, y - 19, 5, 7, '#5fa85a');
      edge(x - 5, y - 9, 10, 9);
      R(x - 5, y - 9, 10, 9, '#c8693a'); R(x - 5, y - 9, 10, 2, '#e08a55');
    } else if (id === 'lamp') {
      ctx.globalAlpha = 0.18; R(x - 15, y - 9, 30, 11, '#ffe9a8'); ctx.globalAlpha = 1;
      R(x - 1, y - 22, 2, 22, '#8a6a4a');
      edge(x - 5, y - 2, 10, 2); R(x - 5, y - 2, 10, 2, '#6a4f36');
      edge(x - 6, y - 29, 12, 9);
      R(x - 6, y - 28, 12, 3, '#ffe9a8'); R(x - 5, y - 25, 10, 3, '#ffd979'); R(x - 4, y - 22, 8, 2, '#f0c050');
    } else if (id === 'bed') {
      edge(x - 14, y - 11, 28, 11);
      R(x - 14, y - 11, 28, 11, '#b98c5a');
      R(x - 11, y - 9, 22, 6, '#f6c9d4'); R(x - 9, y - 8, 8, 2, '#fde0e8');
      R(x - 14, y - 11, 28, 2, '#cba06a');
    } else if (id === 'tank') {
      R(x - 12, y - 4, 24, 4, '#8a6a4a');
      edge(x - 11, y - 20, 22, 16);
      R(x - 11, y - 20, 22, 16, '#bfe6f5'); R(x - 11, y - 14, 22, 10, '#7fd0ff'); R(x - 11, y - 7, 22, 3, '#e8d2a8');
      const fx = x - 8 + Math.floor((t / 70) % 14);
      R(fx, y - 12, 4, 2, '#f2a64e'); R(fx - 2, y - 13, 2, 4, '#e8892a');
      R(x + 6, y - 14, 2, 7, '#5fa85a'); R(x - 8, y - 11, 1, 1, '#ffffff');
    } else if (id === 'pumpkin') {
      R(x - 11, y - 14, 22, 14, '#e8892a');
      R(x - 3, y - 14, 2, 14, '#c76f1a'); R(x + 3, y - 14, 2, 14, '#c76f1a');
      R(x - 2, y - 20, 4, 6, '#5b7a3a');
    } else if (id === 'frame') {
      edge(x - 11, y - 18, 22, 18);
      R(x - 11, y - 18, 22, 18, frameStyle.border);
      R(x - 9, y - 16, 18, 14, '#fff3e0');
      R(x - 9, y - 16, 18, 1, '#e8d8b8');
      const cols = frameStyle.furs.length ? frameStyle.furs : ['#d9c8a8', '#d9c8a8', '#d9c8a8'];
      cols.slice(0, 3).forEach((c, i) => {                       // 단짝 3마리: 귀 + 얼굴
        const cx = x - 8 + i * 6;
        R(cx, y - 11, 1, 2, c); R(cx + 3, y - 11, 1, 2, c);
        R(cx, y - 9, 5, 4, c);
        R(cx + 1, y - 8, 1, 1, OUT); R(cx + 3, y - 8, 1, 1, OUT);
      });
      R(x - 9, y - 4, 18, 1, frameStyle.border);
    } else if (id === 'bear') {
      edge(x - 6, y - 8, 12, 8); R(x - 6, y - 8, 12, 8, '#b98c5a');
      edge(x - 5, y - 15, 10, 8); R(x - 5, y - 15, 10, 8, '#b98c5a');
      R(x - 6, y - 17, 3, 3, '#a07040'); R(x + 3, y - 17, 3, 3, '#a07040');
      R(x - 3, y - 12, 1, 1, OUT); R(x + 2, y - 12, 1, 1, OUT); R(x - 1, y - 10, 2, 1, '#6a4f36');
      R(x - 2, y - 7, 4, 4, '#d9b88a');
    }
  }

  // 고양이끼리 만났을 때 머리 위에 뜨는 말풍선 아이콘 (X가 칠해지는 칸)
  const ICONS = {
    heart: { rows: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], color: '#f0607a' },
    annoyed: { rows: ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'], color: '#e04f5f' },
    note: { rows: ['..XXX', '..X.X', '..X..', 'XXX..', 'XXX..'], color: '#6b5b95' },
    dots: { rows: ['XX.XX.XX', 'XX.XX.XX'], color: '#2b2333' },
    zzz: { rows: ['XXX', '..X', '.X.', 'XXX'], color: '#6b5b95' },
    look: { rows: ['.XXX.', 'X...X', '...X.', '..X..', '..X..', '.....', '..X..'], color: '#4f7fd2' },
    eat: { rows: ['.XXXX.X', 'XXXXXXX', '.XXXX.X'], color: '#6fb7e8' },
    star: { rows: ['..X..', '..X..', 'XXXXX', '.XXX.', '.X.X.'], color: '#ffd84a' },
  };
  function drawIcon(ctx, icon, x, y) {
    const cells = [];
    icon.rows.forEach((row, j) => [...row].forEach((c, i) => { if (c === 'X') cells.push([x + i, y + j]); }));
    ctx.fillStyle = OUT;
    cells.forEach(([cx, cy]) => {
      ctx.fillRect(cx - 1, cy, 3, 1);
      ctx.fillRect(cx, cy - 1, 1, 3);
    });
    ctx.fillStyle = icon.color;
    cells.forEach(([cx, cy]) => ctx.fillRect(cx, cy, 1, 1));
  }

  // a가 b 곁에 있을 때 a의 반응. 성격과 취향으로 정해진다.
  const DRINKERS = ['tie', 'bottle'];
  // 지금 입고 있는 것 중에 건배 소품이 있는지 (선물로 입은 넥타이도 포함)
  const drinks = (cat) => (cat.accessories && cat.accessories.length ? cat.accessories : [cat.accessory, cat.accessory2])
    .some((x) => DRINKERS.includes(x));
  function reactionOf(a, b) {
    const A = a.cat, B = b.cat;
    if (drinks(A) && drinks(B)) return 'note'; // 건배
    if (A.social === 0) return 'annoyed';
    if (A.social === 2) return 'heart';
    if (A.energy === 2 && B.energy === 2) return 'note';
    if (A.energy === 0) return 'zzz';
    return 'dots';
  }

  function mount(canvas, opts) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    let season = opts.season || seasonOf(new Date());
    let actors = [];
    let raf = 0, last = performance.now();
    let time = 0;          // 방 안에서 흐른 시간(초)
    let deco = Object.assign({ wall: 'default', floor: 'wood', rug: 'default' }, opts.deco || {});
    let items = (opts.items || []).map((it) => Object.assign({}, it));
    let editMode = false;
    let dance = null;      // 춤 모드: 0 콩콩 · 1 살랑살랑 · 2 빙글 · 3 스텝. null이면 평소대로
    let selected = null;   // 편집 중 선택한 가구 uid
    let lastMsg = -99;     // 마지막으로 말풍선 알림을 보낸 시간

    function bounds() { return { x0: 14, x1: W - 46, y0: FLOOR_Y + 36, y1: H - 6 }; }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    function makeActor(cat, extra) {
      const b = bounds();
      return Object.assign({
        cat, frames: Render.framesOf(cat), seq: Render.sequenceOf(cat),
        x: rnd(b.x0, b.x1), y: rnd(b.y0, b.y1),
        tx: null, ty: null, wait: rnd(0.5, 5), flip: Math.random() < 0.5,
        clock: rnd(0, 2000), seqI: 0,
        emote: null, emoteCool: rnd(2, 6),
      }, extra);
    }

    function setCats(me, visitors) {
      actors = [makeActor(me, { isMe: true })]
        .concat(visitors.map((k) => makeActor(Cat.catById(k), { poolIndex: k })));
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function near(a, o) { return Math.abs(a.x - o.x) < 26 && Math.abs(a.y - o.y) < 10; }

    function react(a, o) {
      const kind = reactionOf(a, o);
      a.emote = { kind, until: time + 2.4, t0: time };
      a.emoteCool = rnd(7, 12);
      if (kind === 'annoyed') {                      // 독립적인 고양이는 슬며시 자리를 뜬다
        const b = bounds();
        a.tx = clamp(a.x + (a.x >= o.x ? 1 : -1) * rnd(40, 70), b.x0, b.x1);
        a.ty = clamp(a.y + rnd(-14, 14), b.y0, b.y1);
      }
      if (kind === 'heart' && !o.emote && o.cat.social === 2) {
        o.emote = { kind: 'heart', until: time + 2.4, t0: time };   // 서로 좋아하면 같이 하트
        o.emoteCool = rnd(7, 12);
      }
      if (opts.onReact && time - lastMsg > 6) {
        lastMsg = time;
        opts.onReact(kind, a, o);
      }
    }

    // 위에 앉은 a가 바닥의 o를 내려다본다. o는 올려다본다.
    function lookDown(a, o) {
      const A = a.cat, B = o.cat;
      let kind = 'look';
      if (A.social === 2) kind = 'heart';
      else if (A.social === 0) kind = 'dots';
      else if (A.energy === 2) kind = 'note';
      a.emote = { kind, until: time + 2.8, t0: time, down: true };
      a.flip = o.x < a.x;
      a.emoteCool = rnd(4, 8);

      if (!o.emote && !o.held) {
        let reply = 'look';                                  // 올려다보기 ?
        if (kind === 'heart' && B.social > 0) reply = 'heart';
        else if (B.social === 0) reply = 'annoyed';          // 뭘 쳐다봐
        o.emote = { kind: reply, until: time + 2.4, t0: time + 0.5 };
        o.emoteCool = rnd(6, 10);
      }
      if (opts.onReact && time - lastMsg > 6) { lastMsg = time; opts.onReact('lookdown', a, o); }
    }

    function update(dt) {
      const b = bounds();
      time += dt;
      actors.forEach((a) => {
        a.clock += dt * 1000;
        if (a.held || a.perch) return;        // 잡혀 있거나 높은 곳에 앉아 있다
        if (dance !== null && a.tx === null) return;   // 대형에 도착했으면 제자리에서 춤춘다
        if (a.tx === null) {
          a.wait -= dt;
          if (a.wait <= 0) {
            const others = actors.filter((o) => o !== a);
            if (opts.snackOn && opts.snackOn() && Math.random() < 0.55) {
              // 간식이 놓여 있으면 밥그릇으로 간다
              a.tx = clamp(143 + rnd(-6, 10), b.x0, b.x1);
              a.ty = clamp(154 + rnd(-3, 6), b.y0, b.y1);
            } else if (a.cat.social === 2 && others.length && Math.random() < 0.6) {
              // 친화적인 고양이는 다른 고양이 곁으로 간다
              const o = others[Math.floor(Math.random() * others.length)];
              a.tx = clamp(o.x + (Math.random() < 0.5 ? -20 : 20), b.x0, b.x1);
              a.ty = clamp(o.y + rnd(-4, 4), b.y0, b.y1);
            } else {
              a.tx = rnd(b.x0, b.x1); a.ty = rnd(b.y0, b.y1);
            }
          }
          return;
        }
        const dx = a.tx - a.x, dy = a.ty - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) { a.tx = null; a.wait = rnd(3, 9); return; }
        const speed = (a.cat.chubby ? 9 : 16) * (dance !== null ? 4 : 1);   // 춤 대형으로 모일 때는 서둘러 걷는다
        a.x += (dx / dist) * speed * dt;
        a.y += (dy / dist) * speed * dt;
        if (Math.abs(dx) > 1) a.flip = dx < 0;
      });

      if (dance !== null) return;            // 춤추는 동안은 반응/내려다보기/간식 없음

      // 높은 곳(캣타워/선반/창틀)에 앉은 고양이가 가끔 아래를 내려다본다
      actors.forEach((a) => {
        if (!a.perch || a.held || a.emote) return;
        if (a.perchCool === undefined) a.perchCool = rnd(3, 6);
        a.perchCool -= dt;
        if (a.perchCool > 0) return;
        a.perchCool = rnd(8, 14);
        const below = actors.filter((o) => o !== a && !o.perch && !o.held);
        if (below.length) lookDown(a, below[Math.floor(Math.random() * below.length)]);
      });

      // 밥그릇 앞에서 냠냠
      if (opts.snackOn && opts.snackOn()) {
        actors.forEach((a) => {
          if (a.held || a.emote || a.emoteCool > 0) return;
          const nearBowl = Math.abs(a.x + 16 - 159) < 14 && Math.abs(a.y - 154) < 9;
          if (!nearBowl) return;
          a.emote = { kind: 'eat', until: time + 2.6, t0: time };
          a.emoteCool = rnd(6, 10);
          if (opts.onReact && time - lastMsg > 6) { lastMsg = time; opts.onReact('eat', a, a); }
        });
      }

      // 가까이 있는 고양이끼리 반응
      actors.forEach((a) => {
        a.emoteCool -= dt;
        if (a.emote && time > a.emote.until) a.emote = null;
        if (a.held || a.emote || a.emoteCool > 0) return;
        const o = actors.find((c) => c !== a && near(a, c));
        if (o) react(a, o);
      });
    }

    // 춤 동작: 스타일마다 박자와 몸짓이 다르다. 내 고양이는 조금 더 높이 뛴다.
    function danceOf(a) {
      const T = time, boost = a.isMe ? 1 : 0;
      const beat = Math.floor(T * 6) % 2;
      let hop = 0, dx = 0, flip = a.flip;
      if (dance === 0) { hop = Math.round(Math.abs(Math.sin(T * 8)) * 4) + boost; flip = Math.floor(T * 2) % 2 === 0; }
      else if (dance === 1) { dx = Math.round(Math.sin(T * 5) * 4); hop = Math.round(Math.abs(Math.sin(T * 10)) * 2) + boost; flip = Math.cos(T * 5) > 0; }
      else if (dance === 2) { hop = Math.round(Math.abs(Math.sin(T * 9)) * 3) + boost; flip = Math.floor(T * 7) % 2 === 0; }
      else { dx = Math.floor(T * 3) % 2 ? 3 : -3; hop = Math.round(Math.abs(Math.sin(T * 12)) * 2) + boost; flip = dx > 0; }
      return { frame: a.frames[beat], dx, hop, flip };
    }

    // 춤 시작/끝. 시작하면 출연진이 방 가운데 한 줄로 모인 뒤 춤춘다(내 고양이가 센터).
    function setDance(style) {
      dance = Number.isInteger(style) ? style : null;
      if (dance === null) return;
      const b = bounds();
      const others = actors.filter((a) => !a.isMe).sort((p, q) => p.x - q.x);
      const row = others.slice();
      row.splice(Math.floor((others.length + 1) / 2), 0, actors.find((a) => a.isMe));
      const n = row.filter(Boolean).length;
      row.filter(Boolean).forEach((a, i) => {
        a.perch = null; a.emote = null; a.held = false;
        a.tx = clamp((W - 32) / 2 - (n - 1) * 17 + i * 34, b.x0, b.x1);
        a.ty = clamp(b.y0 + (b.y1 - b.y0) * 0.55 + (i % 2) * 5, b.y0, b.y1);
      });
    }

    function frameOf(a) {
      if (a.tx !== null) return a.frames[Math.floor(a.clock / 220) % 2];
      const total = a.seq.reduce((s, q) => s + q[1], 0);
      let t = a.clock % total;
      for (const [f, d] of a.seq) { if (t < d) return a.frames[f]; t -= d; }
      return a.frames[0];
    }

    function marker(a, t) {
      const bob = Math.round(Math.sin(t / 250 + a.x));
      const x = Math.round(a.x) + 15, y = Math.round(a.y) - 42 + bob;
      if (a.isMe) {
        ctx.fillStyle = '#f0607a';
        ctx.fillRect(x - 2, y, 2, 2); ctx.fillRect(x + 2, y, 2, 2);
        ctx.fillRect(x - 3, y + 2, 8, 2); ctx.fillRect(x - 1, y + 4, 4, 2); ctx.fillRect(x, y + 6, 2, 1);
      } else if (opts.giftOf && opts.giftOf(a.poolIndex)) {
        // 선물을 들고 왔다: 누르면 받는다
        const gy = y + 2;
        ctx.fillStyle = OUT;
        ctx.fillRect(x - 5, gy + 1, 11, 9); ctx.fillRect(x - 6, gy - 1, 13, 4);
        ctx.fillStyle = '#e04f5f'; ctx.fillRect(x - 4, gy + 3, 9, 6);
        ctx.fillStyle = '#f2808c'; ctx.fillRect(x - 5, gy, 11, 3);
        ctx.fillStyle = '#ffd84a'; ctx.fillRect(x - 1, gy, 2, 9);
        ctx.fillRect(x - 3, gy - 2, 2, 2); ctx.fillRect(x + 1, gy - 2, 2, 2);
      } else if (a.cat.limited && !opts.isCollected(a.poolIndex)) {
        // 시즌 한정 손님은 별이 반짝인다
        if (Math.floor(t / 300) % 4 !== 3) drawIcon(ctx, ICONS.star, x - 2, y - 1);
      } else if (!opts.isCollected(a.poolIndex)) {
        ctx.fillStyle = OUT;
        ctx.fillRect(x - 1, y - 1, 4, 9);
        ctx.fillStyle = '#ffd84a';
        ctx.fillRect(x, y, 2, 5);
        ctx.fillRect(x, y + 6, 2, 1);
      }
    }

    function emoteIcon(a) {
      const e = a.emote;
      const p = (time - e.t0) / (e.until - e.t0);           // 0 → 1
      if (p < 0) return;                                     // 아직 시작 전(올려다보기 지연)
      if (p > 0.8 && Math.floor(time * 8) % 2) return;       // 끝날 때 깜빡
      let x = Math.round(a.x) + 12, y = Math.round(a.y) - 44 - Math.round(p * 6);
      if (y < 2) { x = Math.round(a.x) + 27; y = Math.round(a.y) - 26 - Math.round(p * 4); }  // 천장 근처는 옆에
      if (e.kind === 'zzz') {
        [[0, 0, 0.0], [5, -5, 0.25], [10, -10, 0.5]].forEach(([dx, dy, from]) => {
          if (p >= from) drawIcon(ctx, ICONS.zzz, x + dx, y + dy + 4);
        });
      } else {
        drawIcon(ctx, ICONS[e.kind], x, y);
      }
    }

    function draw(t) {
      ctx.drawImage(background(season, Object.assign({}, deco, { hidePumpkin: items.some((it) => it.id === 'pumpkin') })), 0, 0);
      if (opts.snackOn && opts.snackOn()) {         // 간식이 소복
        ctx.fillStyle = '#b9733c'; ctx.fillRect(152, 144, 14, 5);
        ctx.fillStyle = '#c98550'; ctx.fillRect(154, 142, 10, 3);
        ctx.fillStyle = '#8a4b2a';
        [[155, 145], [160, 146], [163, 144], [158, 143]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 1));
      }
      drawParticles(ctx, season, t);

      // 들고 있는 고양이가 앉을 수 있는 자리를 반짝여 알려준다 (가구를 끄는 중에는 drag.a가 없다)
      if (drag && drag.moved && drag.a) {
        const P = perchAt(drag.a.x + 16, drag.a.y);
        if (P && Math.floor(t / 180) % 2 === 0) {
          ctx.fillStyle = '#ffd84a';
          ctx.fillRect(P.x0 - 2, P.y - 1, P.x1 - P.x0 + 4, 3);
        }
      }

      // 가구와 고양이를 아래쪽(발) 기준으로 섞어 그린다. 가구에 올라앉은 고양이는 가구 앞에 온다.
      // 인테리어를 편집하는 동안은 고양이를 숨겨서 가구가 가려지거나 걸리적거리지 않게 한다.
      const drawables = (editMode ? [] : actors).map((a) => ({ a, d: (a.held ? 1000 : 0) + depthOf(a) }))
        .concat(items.map((it) => ({ it, d: it.y })));
      drawables.sort((p, q) => p.d - q.d).forEach((o) => {
        if (o.it) {
          drawItem(ctx, o.it.id, o.it.x, o.it.y, t);
          if (editMode && selected === o.it.uid && Math.floor(t / 250) % 2 === 0) {
            const def = Interior.byId(Interior.ITEMS, o.it.id);
            ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 1;
            ctx.strokeRect(Math.round(o.it.x - def.w / 2) - 2.5, Math.round(o.it.y - def.h) - 2.5, def.w + 5, def.h + 5);
          }
          return;
        }
        const a = o.a;
        if (a.held) {
          // 번쩍 들린 고양이: 바닥에 그림자, 몸은 살짝 위로
          ctx.fillStyle = 'rgba(43,35,51,0.22)';
          ctx.fillRect(Math.round(a.x) + 8, Math.round(a.y) + 2, 16, 3);
          const sway = Math.floor(t / 160) % 2 ? 1 : 0;
          Render.drawGrid(ctx, a.frames[1], 1, Math.round(a.x) + sway, Math.round(a.y) - 31 - 5, a.flip);
          return;
        }
        if (dance !== null && a.tx === null) {                // 춤: 모두 박자를 맞춰 움직인다
          const d = danceOf(a);
          Render.drawGrid(ctx, d.frame, 1, Math.round(a.x) + d.dx, Math.round(a.y) - 31 - d.hop, d.flip);
          if (Math.floor(time * 4 + a.x) % 2 === 0) drawIcon(ctx, ICONS.note, Math.round(a.x) + 12, Math.round(a.y) - 46 - d.hop);
          return;
        }
        // 신난 고양이는 콩콩 뛴다
        const hop = a.emote && a.emote.kind === 'note' && !a.emote.down
          ? Math.round(Math.abs(Math.sin(time * 9)) * 3) : 0;
        const lean = a.emote && a.emote.down ? 1 : 0;       // 내려다보느라 살짝 숙임
        Render.drawGrid(ctx, frameOf(a), 1, Math.round(a.x), Math.round(a.y) - 31 - hop + lean, a.flip);
        if (a.emote) emoteIcon(a); else marker(a, t);
      });
    }

    function loop(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // 한 프레임에서 에러가 나도 루프가 멈추지 않게 한다. (멈추면 방이 배경만 남은 채 굳는다)
      try {
        update(dt);
        draw(now);
      } catch (err) {
        if (!loop.warned) { loop.warned = true; console.error('사랑방 그리기 오류:', err); }
      }
      raf = requestAnimationFrame(loop);
    }

    // ---- 집어서 옮기기 ----
    // 가볍게 누르면 '만나기', 끌면 '옮기기'. 놓은 자리가 가구 위면 올라앉는다.
    let drag = null;   // { a, offX, offY, sx, sy, moved }

    function toLogical(ev) {
      const r = canvas.getBoundingClientRect();
      return { px: ((ev.clientX - r.left) / r.width) * W, py: ((ev.clientY - r.top) / r.height) * H };
    }
    function hitTest(px, py) {
      if (editMode) return null;
      return actors.slice().sort((a, b) => b.y - a.y).find((a) =>
        px >= a.x + 6 && px <= a.x + 26 && py >= a.y - 30 && py <= a.y + 1);
    }
    // 앉을 수 있는 자리: 고정 가구 + 내가 놓은 쿠션/침대/곰인형
    function itemPerch(it) {
      const def = Interior.byId(Interior.ITEMS, it.id);
      return { label: def.label + ' 위', x0: it.x - def.w / 2, x1: it.x + def.w / 2, y: it.y - def.h + 3, uid: it.uid };
    }
    function allPerches() {
      return PERCHES.concat(items.filter((it) => Interior.byId(Interior.ITEMS, it.id).perch).map(itemPerch));
    }
    function perchAt(cx, feetY) {
      return allPerches().find((p) => cx >= p.x0 - 6 && cx <= p.x1 + 6 && Math.abs(feetY - p.y) <= 12) || null;
    }
    function depthOf(a) {
      if (a.perch && a.perch.uid) {
        const it = items.find((i) => i.uid === a.perch.uid);
        if (it) return it.y + 0.5;
      }
      return a.y;
    }
    function hitItem(px, py) {
      return items.slice().sort((a, b) => b.y - a.y).find((it) => {
        const def = Interior.byId(Interior.ITEMS, it.id);
        const m = 5;   // 작은 소품도 손가락/마우스로 잡기 쉽게 여유를 둔다
        return px >= it.x - def.w / 2 - m && px <= it.x + def.w / 2 + m && py >= it.y - def.h - m && py <= it.y + m;
      });
    }
    // 가구를 옮기면 그 위에 앉은 고양이도 같이 간다
    function syncPerched(it) {
      actors.forEach((a) => {
        if (a.perch && a.perch.uid === it.uid) {
          a.perch = itemPerch(it);
          a.x = it.x + (a.perchOff || 0) - 16;
          a.y = a.perch.y + 1;
        }
      });
    }

    function drop() {
      const a = drag.a;
      const P = perchAt(a.x + 16, a.y);
      a.held = false;
      a.emote = null;
      if (P) {
        a.perch = P;
        a.x = clamp(a.x + 16, P.x0 + 8, P.x1 - 8) - 16;
        a.y = P.y + 1;
        a.tx = a.ty = null;
        if (P.uid) {
          const it = items.find((i) => i.uid === P.uid);
          a.perchOff = it ? (a.x + 16) - it.x : 0;
        }
      } else {
        const b = bounds();
        a.perch = null;
        a.x = clamp(a.x, b.x0, b.x1);
        a.y = clamp(a.y, b.y0, b.y1);
        a.tx = a.ty = null;
        a.wait = rnd(2, 5);
      }
      a.emoteCool = rnd(2, 4);
      if (opts.onMove) opts.onMove(a, P);
    }

    function onDown(ev) {
      const { px, py } = toLogical(ev);
      if (editMode) {
        const it = hitItem(px, py);
        if (it) {
          selected = it.uid;
          drag = { it, offX: px - it.x, offY: py - it.y, sx: px, sy: py, moved: false };
          if (opts.onSelect) opts.onSelect(it.uid);
          try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* 무시 */ }
          return;
        }
      }
      const a = hitTest(px, py);
      if (!a) return;
      drag = { a, offX: px - a.x, offY: py - a.y, sx: px, sy: py, moved: false };
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* 무시 */ }
    }
    function onMove(ev) {
      const { px, py } = toLogical(ev);
      if (!drag) {
        canvas.style.cursor = (editMode && hitItem(px, py)) || hitTest(px, py) ? 'grab' : 'default';
        return;
      }
      if (drag.it) {                                   // 가구 옮기기
        if (!drag.moved && Math.hypot(px - drag.sx, py - drag.sy) > 3) drag.moved = true;
        if (drag.moved) {
          drag.it.x = clamp(Math.round(px - drag.offX), 12, W - 12);
          drag.it.y = clamp(Math.round(py - drag.offY), FLOOR_Y + 20, H - 4);
          syncPerched(drag.it);
        }
        return;
      }
      if (!drag.moved && Math.hypot(px - drag.sx, py - drag.sy) > 3) {
        drag.moved = true;
        drag.a.held = true;
        drag.a.perch = null;
        drag.a.tx = drag.a.ty = null;
        drag.a.emote = null;
        canvas.style.cursor = 'grabbing';
      }
      if (drag.moved) {
        drag.a.x = clamp(px - drag.offX, -4, W - 28);
        drag.a.y = clamp(py - drag.offY, 20, H - 2);
        drag.a.flip = px < drag.sx ? true : drag.a.flip;
      }
    }
    function onUp() {
      if (!drag) return;
      if (drag.it) {
        if (drag.moved && opts.onItemsChange) opts.onItemsChange(items.map((i) => Object.assign({}, i)));
        drag = null;
        return;
      }
      if (drag.moved) drop(); else if (opts.onPick) opts.onPick(drag.a);
      drag = null;
      canvas.style.cursor = 'grab';
    }
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    setCats(opts.me, opts.visitors);
    raf = requestAnimationFrame(loop);

    // 손님 목록을 바꾼다. 남는 손님은 그대로 두고, 새 손님은 오른쪽에서 들어온다.
    function setVisitors(ids) {
      const b = bounds();
      const keep = actors.filter((a) => a.isMe || ids.includes(a.poolIndex));
      const have = new Set(keep.map((a) => a.poolIndex));
      const added = ids.filter((k) => !have.has(k)).map((k) => {
        const a = makeActor(Cat.catById(k), { poolIndex: k });
        a.x = W - 30; a.y = rnd(b.y0, b.y1); a.wait = 0;
        return a;
      });
      actors = keep.concat(added);
    }

    // 내 고양이의 모습을 바꾼다(선물 착용)
    function setMe(cat) {
      const a = actors.find((o) => o.isMe);
      if (!a) return;
      a.cat = cat;
      a.frames = Render.framesOf(cat);
      a.seq = Render.sequenceOf(cat);
    }

    // ---- 인테리어 ----
    function addItem(id) {
      if (items.length >= Interior.MAX_ITEMS) return null;
      const it = { uid: 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1000), id,
        x: Math.round(120 + rnd(-30, 30)), y: Math.round(150 + rnd(-8, 10)) };
      items.push(it);
      selected = it.uid;
      return it;
    }
    function removeItem(uid) {
      items = items.filter((i) => i.uid !== uid);
      actors.forEach((a) => {                      // 위에 앉아 있던 고양이는 바닥으로 내려온다
        if (a.perch && a.perch.uid === uid) {
          a.perch = null;
          a.y = clamp(a.y + 6, bounds().y0, bounds().y1);
          a.wait = rnd(0.5, 2);
        }
      });
      if (selected === uid) selected = null;
    }

    return {
      setVisitors,
      setMe,
      setDance,
      setDeco(d) { deco = Object.assign({ wall: 'default', floor: 'wood', rug: 'default' }, d || {}); },
      setEditMode(on) {
        editMode = !!on;
        if (!editMode) selected = null;
        if (drag && drag.a) { drag.a.held = false; }   // 고양이를 들고 있던 중이면 놓는다
        drag = null;
      },
      addItem,
      removeItem,
      getItems() { return items.map((i) => Object.assign({}, i)); },
      get selected() { return selected; },
      setSeason(s) { season = s; },
      get season() { return season; },
      stop() {
        cancelAnimationFrame(raf);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
      },
    };
  }

  root.Room = { mount, seasonOf, SEASONS, SEASON_LABEL, W, H, drawItem, setFrameStyle, FUR_HEX };
})(typeof window !== 'undefined' ? window : globalThis);
