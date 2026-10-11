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
  function background(season) {
    if (bgCache[season]) return bgCache[season];
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const T = THEME[season];
    const R = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };

    // 벽
    R(0, 0, W, FLOOR_Y, T.wall);
    ctx.globalAlpha = 0.35;
    for (let x = 0; x < W; x += 16) R(x, 0, 2, FLOOR_Y, T.trim);
    ctx.globalAlpha = 1;
    R(0, FLOOR_Y - 4, W, 4, T.trim);

    // 바닥
    R(0, FLOOR_Y, W, H - FLOOR_Y, '#dcae78');
    for (let y = FLOOR_Y, row = 0; y < H; y += 12, row++) {
      R(0, y, W, 1, '#c99763');
      for (let x = (row % 2) * 20; x < W; x += 40) R(x, y, 1, 12, '#c99763');
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
    R(60, 118, 120, 44, T.rug);
    R(64, 122, 112, 36, T.rug2);
    R(68, 126, 104, 28, T.rug);

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
      R(38, 126, 22, 14, '#e8892a'); R(46, 126, 2, 14, '#c76f1a'); R(52, 126, 2, 14, '#c76f1a');
      R(47, 120, 4, 6, '#5b7a3a');
      R(90, 160, 4, 3, '#c8693a'); R(20, 150, 4, 3, '#e8892a'); R(130, 168, 4, 3, '#b5683a');
    } else {
      for (let i = 0; i < 6; i++) R(46 - i * 3, 100 + i * 8, 6 + i * 6, 8, '#3f8f55');
      R(46, 148, 4, 6, '#7a5230'); R(46, 94, 4, 4, '#ffe45c');
      [[44, 108, '#e04f5f'], [52, 114, '#ffe45c'], [40, 122, '#4f7fd2'], [56, 128, '#e04f5f'], [46, 136, '#ffe45c']]
        .forEach(([x, y, col]) => R(x, y, 2, 2, col));
    }
    bgCache[season] = c;
    return c;
  }
  const OUT = '#2b2333';

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

  // 고양이끼리 만났을 때 머리 위에 뜨는 말풍선 아이콘 (X가 칠해지는 칸)
  const ICONS = {
    heart: { rows: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], color: '#f0607a' },
    annoyed: { rows: ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'], color: '#e04f5f' },
    note: { rows: ['..XXX', '..X.X', '..X..', 'XXX..', 'XXX..'], color: '#6b5b95' },
    dots: { rows: ['XX.XX.XX', 'XX.XX.XX'], color: '#2b2333' },
    zzz: { rows: ['XXX', '..X', '.X.', 'XXX'], color: '#6b5b95' },
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
  function reactionOf(a, b) {
    const A = a.cat, B = b.cat;
    if (DRINKERS.includes(A.accessory) && DRINKERS.includes(B.accessory)) return 'note'; // 건배
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
        .concat(visitors.map((k) => makeActor(Cat.poolCat(k), { poolIndex: k })));
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

    function update(dt) {
      const b = bounds();
      time += dt;
      actors.forEach((a) => {
        a.clock += dt * 1000;
        if (a.tx === null) {
          a.wait -= dt;
          if (a.wait <= 0) {
            const others = actors.filter((o) => o !== a);
            if (a.cat.social === 2 && others.length && Math.random() < 0.6) {
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
        const speed = a.cat.chubby ? 9 : 16;
        a.x += (dx / dist) * speed * dt;
        a.y += (dy / dist) * speed * dt;
        if (Math.abs(dx) > 1) a.flip = dx < 0;
      });

      // 가까이 있는 고양이끼리 반응
      actors.forEach((a) => {
        a.emoteCool -= dt;
        if (a.emote && time > a.emote.until) a.emote = null;
        if (a.emote || a.emoteCool > 0) return;
        const o = actors.find((c) => c !== a && near(a, c));
        if (o) react(a, o);
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
      if (p > 0.8 && Math.floor(time * 8) % 2) return;       // 끝날 때 깜빡
      const x = Math.round(a.x) + 12, y = Math.round(a.y) - 44 - Math.round(p * 6);
      if (e.kind === 'zzz') {
        [[0, 0, 0.0], [5, -5, 0.25], [10, -10, 0.5]].forEach(([dx, dy, from]) => {
          if (p >= from) drawIcon(ctx, ICONS.zzz, x + dx, y + dy + 4);
        });
      } else {
        drawIcon(ctx, ICONS[e.kind], x, y);
      }
    }

    function draw(t) {
      ctx.drawImage(background(season), 0, 0);
      drawParticles(ctx, season, t);
      actors.slice().sort((a, b) => a.y - b.y).forEach((a) => {
        // 신난 고양이는 콩콩 뛴다
        const hop = a.emote && a.emote.kind === 'note' ? Math.round(Math.abs(Math.sin(time * 9)) * 3) : 0;
        Render.drawGrid(ctx, frameOf(a), 1, Math.round(a.x), Math.round(a.y) - 31 - hop, a.flip);
        if (a.emote) emoteIcon(a); else marker(a, t);
      });
    }

    function loop(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      update(dt);
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function onClick(ev) {
      const r = canvas.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W;
      const py = ((ev.clientY - r.top) / r.height) * H;
      const hit = actors.slice().sort((a, b) => b.y - a.y).find((a) =>
        px >= a.x + 6 && px <= a.x + 26 && py >= a.y - 30 && py <= a.y + 1);
      if (hit) opts.onPick(hit);
    }
    canvas.addEventListener('click', onClick);

    setCats(opts.me, opts.visitors);
    raf = requestAnimationFrame(loop);

    return {
      setSeason(s) { season = s; },
      get season() { return season; },
      stop() { cancelAnimationFrame(raf); canvas.removeEventListener('click', onClick); },
    };
  }

  root.Room = { mount, seasonOf, SEASONS, SEASON_LABEL, W, H };
})(typeof window !== 'undefined' ? window : globalThis);
