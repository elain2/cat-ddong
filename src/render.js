// 고양이 속성 → 32x32 픽셀 그리드 → 캔버스 애니메이션
(function (root) {
  const N = 32;
  const OUT = '#2b2333';
  const WHITE = '#fffaf0';
  const PINK = '#f08fa4';
  const BLUSH = '#f7a8b8';
  const RED = '#e04f5f';

  const PAL = {
    cream: { base: '#f7e2b8', shade: '#e2c08c', patch: '#e9b97a' },
    orange: { base: '#f2a64e', shade: '#d4802c', patch: '#fbe3b8' },
    black: { base: '#4a4a63', shade: '#33334a', patch: '#6c6c8a' },
    gray: { base: '#b7bcc8', shade: '#939aaa', patch: '#e8ebf2' },
  };

  function newGrid() {
    return Array.from({ length: N }, () => Array(N).fill(null));
  }
  function pset(g, x, y, c) {
    if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c;
  }
  function rect(g, x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) pset(g, i, j, c);
  }
  function paintOn(g, x, y, w, h, from, to) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (i >= 0 && i < N && j >= 0 && j < N && g[j][i] === from) g[j][i] = to;
  }
  function hollow(g, x, y, w, h, c) {
    rect(g, x, y, w, 1, c);
    rect(g, x, y + h - 1, w, 1, c);
    rect(g, x, y, 1, h, c);
    rect(g, x + w - 1, y, 1, h, c);
  }
  function hspan(g, y, x0, x1, c) { for (let x = x0; x <= x1; x++) pset(g, x, y, c); }
  // 좌우 대칭: x' = 31 - x
  function hmirror(g, y, x0, x1, c) { hspan(g, y, x0, x1, c); hspan(g, y, 31 - x1, 31 - x0, c); }

  function addOutline(g) {
    const out = g.map((row) => row.slice());
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (g[y][x] !== null) continue;
        if ((y > 0 && g[y - 1][x]) || (y < N - 1 && g[y + 1][x]) ||
            (x > 0 && g[y][x - 1]) || (x < N - 1 && g[y][x + 1])) out[y][x] = OUT;
      }
    }
    return out;
  }

  // 집사 고양이: 앉아 있는 통통한 턱시도 냥. 서양배 몸통, 하얀 앞다리, 옆으로 말려 올라간 꼬리.
  function buildButler(f) {
    const g = newGrid();
    const K = '#3b3b52', KNOT = '#b83a4a';
    const span = (y, x0, x1, c) => hspan(g, y, x0, x1, c);
    const mirror = (y, x0, x1, c) => hmirror(g, y, x0, x1, c);

    // 꼬리
    const sway = f === 1 ? 1 : 0;
    for (let y = 20; y <= 28; y++) span(y, 28, 29, K);
    span(29, 26, 29, K);
    span(19, 27 + sway, 28 + sway, K);
    span(18, 27 + sway, 27 + sway, K);

    // 몸통
    [[18, 8], [19, 7], [20, 6]].forEach(([y, x]) => mirror(y, x, 15, K));
    for (let y = 21; y <= 28; y++) mirror(y, 5, 15, K);
    mirror(29, 6, 9, K);

    // 가슴/배/앞다리 (흰색), 다리 사이 틈
    for (let y = 18; y <= 21; y++) mirror(y, 11, 15, WHITE);
    for (let y = 22; y <= 25; y++) mirror(y, 10, 15, WHITE);
    for (let y = 26; y <= 28; y++) mirror(y, 10, 14, WHITE);
    mirror(29, 9, 14, WHITE);
    for (let y = 26; y <= 29; y++) span(y, 15, 16, null);

    // 귀
    [[3, 7, 8], [4, 7, 9], [5, 7, 10], [6, 7, 11], [7, 7, 12]].forEach(([y, a, b]) => mirror(y, a, b, K));
    mirror(5, 8, 8, PINK);
    mirror(6, 8, 9, PINK);
    mirror(7, 8, 10, PINK);

    // 머리
    mirror(8, 7, 15, K);
    mirror(9, 6, 15, K);
    for (let y = 10; y <= 15; y++) mirror(y, 5, 15, K);
    mirror(16, 6, 15, K);
    mirror(17, 7, 15, K);

    // 얼굴: 흰 주둥이, 점 눈, 코, W 입, 볼터치
    mirror(14, 12, 15, WHITE);
    mirror(15, 10, 15, WHITE);
    mirror(16, 10, 15, WHITE);
    mirror(17, 11, 15, WHITE);
    mirror(14, 7, 8, BLUSH);
    if (f === 2) {
      mirror(13, 10, 11, OUT);
    } else {
      mirror(11, 10, 11, OUT);
      mirror(12, 10, 11, OUT);
      mirror(13, 10, 11, OUT);
      pset(g, 10, 11, WHITE);
      pset(g, 20, 11, WHITE);
    }
    span(14, 15, 16, PINK);
    [[13, 15], [15, 15], [16, 15], [18, 15], [14, 16], [17, 16]].forEach(([x, y]) => pset(g, x, y, OUT));

    // 나비넥타이: 양끝은 넓고 가운데는 좁다
    mirror(18, 9, 11, RED);
    mirror(19, 9, 14, RED);
    mirror(20, 9, 14, RED);
    mirror(21, 9, 11, RED);
    span(19, 14, 17, KNOT);
    span(20, 14, 17, KNOT);
    return addOutline(g);
  }

  // 일반 고양이. 집사와 같은 앉은 자세(서양배 몸통, 흰 앞다리, 옆으로 올라간 꼬리)에
  // 성격 축을 얹는다. f: 0 기본, 1 꼬리 흔들림, 2 깜빡임
  function buildFrame(cat, f) {
    if (cat.style === 'butler') return buildButler(f);
    const p = PAL[cat.fur] || PAL.cream;
    const K = p.base;
    const r = root.Cat.rng(cat.seed);
    const g = newGrid();
    const e = cat.energy, s = cat.social, d = cat.delicacy, b = cat.boldness;
    const sp = (y, x0, x1, c) => hspan(g, y, x0, x1, c);
    const mr = (y, x0, x1, c) => hmirror(g, y, x0, x1, c);

    const edge = cat.chubby ? 3 : [4, 5, 6][e];   // 엉덩이 왼쪽 끝: 작을수록 통통
    const sway = f === 1 ? 1 : 0;
    const tx = 31 - edge + 2;                     // 꼬리 x

    // 꼬리: 활발은 길게 쭉, 보통은 끝이 말림, 느긋은 짧게
    if (e === 2 && !cat.chubby) {
      for (let y = 14; y <= 28; y++) sp(y, tx, tx + 1, K);
      for (let y = 9; y <= 13; y++) sp(y, tx + sway, tx + 1 + sway, K);
    } else if (e === 1 || cat.chubby) {
      for (let y = 20; y <= 28; y++) sp(y, tx, tx + 1, K);
      sp(19, tx - 1 + sway, tx + sway, K);
      sp(18, tx - 1 + sway, tx - 1 + sway, K);
    } else {
      for (let y = 24; y <= 28; y++) sp(y, tx, tx + 1, K);
      sp(23, tx - 1 + sway, tx + sway, K);
    }
    sp(29, 31 - edge + 1, tx + 1, K);

    // 몸통
    mr(18, edge + 3, 15, K);
    mr(19, edge + 2, 15, K);
    mr(20, edge + 1, 15, K);
    for (let y = 21; y <= 28; y++) mr(y, edge, 15, K);
    mr(29, edge + 1, 9, p.shade);

    // 가슴/배/앞다리 (흰색), 다리 사이 틈
    for (let y = 18; y <= 21; y++) mr(y, 11, 15, WHITE);
    for (let y = 22; y <= 25; y++) mr(y, 10, 15, WHITE);
    for (let y = 26; y <= 28; y++) mr(y, 10, 14, WHITE);
    mr(29, 9, 14, WHITE);
    for (let y = 26; y <= 29; y++) sp(y, 15, 16, null);

    // 귀: 사교적이면 쫑긋, 독립적이면 옆으로 눕는다
    if (s === 0) {
      [[5, 5, 8], [6, 5, 10], [7, 6, 11]].forEach(([y, a, c]) => mr(y, a, c, K));
    } else {
      [[3, 7, 8], [4, 7, 9], [5, 7, 10], [6, 7, 11], [7, 7, 12]].forEach(([y, a, c]) => mr(y, a, c, K));
      mr(5, 8, 8, PINK); mr(6, 8, 9, PINK); mr(7, 8, 10, PINK);
    }

    // 머리
    mr(8, 7, 15, K);
    mr(9, 6, 15, K);
    for (let y = 10; y <= 15; y++) mr(y, 5, 15, K);
    mr(16, 6, 15, K);
    mr(17, 7, 15, K);

    // 털털함: 삐죽 털과 얼룩, 예민함: 깔끔한 단색
    if (d === 0) { sp(7, 15, 15, K); sp(6, 15, 15, K); sp(7, 16, 16, K); }
    for (let k = 0; k < [3, 1, 0][d]; k++) {
      if (r() < 0.5) {
        paintOn(g, 6 + Math.floor(r() * 14), 9 + Math.floor(r() * 4), 2 + Math.floor(r() * 3), 2, K, p.patch);
      } else {
        paintOn(g, edge + Math.floor(r() * 4), 20 + Math.floor(r() * 6), 3 + Math.floor(r() * 2), 3, K, p.patch);
      }
    }

    // 얼굴: 흰 주둥이, 볼터치 (친화적이거나 취했을 때)
    mr(14, 12, 15, WHITE);
    mr(15, 10, 15, WHITE);
    mr(16, 10, 15, WHITE);
    mr(17, 11, 15, WHITE);
    if (s === 2 || cat.accessory === 'tie' || cat.accessory === 'bottle') mr(14, 7, 8, BLUSH);

    // 눈: 대범할수록 크다. 느긋하면 반쯤 감겨 있다.
    const ew = b === 2 ? 3 : 2;
    const ex = 12 - ew;                       // 왼쪽 눈 시작 x
    const top = b === 0 ? 12 : 11;            // 눈 윗줄
    if (e === 0 || f === 2) {
      mr(e === 0 ? 12 : 13, ex, 11, OUT);
    } else {
      for (let y = top; y <= 13; y++) mr(y, ex, 11, OUT);
      pset(g, ex, top, WHITE);
      pset(g, 31 - 11, top, WHITE);
      if (b === 2) { pset(g, 11, 13, WHITE); pset(g, 31 - ex, 13, WHITE); }
    }
    if (s === 0) mr(10, ex, 11, OUT);          // 도도한 눈썹

    // 코와 입: 친화적이면 W, 독립적이면 일자
    sp(14, 15, 16, PINK);
    if (s === 2) {
      [[13, 15], [15, 15], [16, 15], [18, 15], [14, 16], [17, 16]].forEach(([x, y]) => pset(g, x, y, OUT));
    } else if (s === 1) {
      [[15, 15], [16, 15], [14, 16], [17, 16]].forEach(([x, y]) => pset(g, x, y, OUT));
    } else {
      sp(16, 14, 17, OUT);
    }

    // 액세서리
    const acc = cat.accessory;
    if (acc === 'tie') {
      // 회식 끝난 아저씨처럼 넥타이를 머리에 감았다: 줄무늬 띠 + 왼쪽 매듭 + 늘어진 끝자락
      const TIE = '#4f7fd2', STRIPE = '#dfe9ff', KNOT = '#33539a';
      for (let x = 6; x <= 25; x++) pset(g, x, 9, (x % 4 < 2) ? TIE : STRIPE);
      for (let x = 5; x <= 26; x++) pset(g, x, 10, (x % 4 < 2) ? STRIPE : TIE);
      for (let y = 8; y <= 11; y++) sp(y, 5, 8, KNOT);        // 매듭
      for (let y = 12; y <= 16; y++) sp(y, 3, 4, TIE);        // 긴 끝자락
      sp(17, 3, 3, TIE);
      for (let y = 12; y <= 14; y++) sp(y, 5, 6, STRIPE);     // 짧은 끝자락
      sp(15, 5, 5, STRIPE);
    } else if (acc === 'glasses') {
      const c = '#7a5c3e';
      [[ex - 1, 10, ew + 2, 5], [31 - 11 - 1, 10, ew + 2, 5]].forEach(([x, y, w, h]) => hollow(g, x, y, w, h, c));
      sp(12, ex + ew + 1, 31 - ex - ew - 1, c);
    } else if (acc === 'bottle') {
      // 배 앞에 소주병을 안고 있다. 흰 배 위라 외곽선을 직접 그린다.
      const GLASS = '#4fa86b', CAP = '#2f7a4a';
      for (let y = 16; y <= 20; y++) sp(y, 18, 21, OUT);     // 목 외곽선
      for (let y = 20; y <= 28; y++) sp(y, 17, 22, OUT);     // 몸통 외곽선
      sp(17, 19, 20, CAP);                                   // 마개
      for (let y = 18; y <= 20; y++) sp(y, 19, 20, GLASS);   // 목
      for (let y = 21; y <= 27; y++) sp(y, 18, 21, GLASS);   // 몸통
      for (let y = 23; y <= 25; y++) sp(y, 18, 21, WHITE);   // 라벨
      sp(24, 19, 20, RED);                                   // 라벨 무늬
      sp(22, 18, 18, '#8ad4a0');                             // 유리 하이라이트
    } else if (acc === 'blossom') {
      // 오른쪽 머리에 꽂은 벚꽃
      [[21, 7], [23, 7], [21, 9], [23, 9]].forEach(([x, y]) => pset(g, x, y, '#fbd3dc'));
      [[22, 7], [21, 8], [23, 8], [22, 9]].forEach(([x, y]) => pset(g, x, y, '#f06a9a'));
      pset(g, 22, 8, '#ffe45c');
    } else if (acc === 'shades') {
      // 선글라스: 두 렌즈와 브릿지
      mr(11, 8, 13, OUT);
      mr(12, 8, 13, OUT);
      mr(13, 9, 12, OUT);
      sp(11, 14, 17, OUT);
      pset(g, 9, 11, '#7fd0ff'); pset(g, 22, 11, '#7fd0ff');
    } else if (acc === 'leaf') {
      // 머리 위에 얹은 단풍잎
      [[15, 5], [16, 5], [14, 6], [15, 6], [16, 6], [17, 6], [15, 7], [16, 7]].forEach(([x, y]) => pset(g, x, y, '#d2554f'));
      pset(g, 14, 5, '#e8892a'); pset(g, 17, 5, '#e8892a');
      pset(g, 15, 8, '#8a4b2a');
    } else if (acc === 'scarf') {
      // 목도리: 목을 두르고 한쪽이 늘어진다
      const A = '#c8414f', B = '#fff0d8';
      for (let y = 18; y <= 20; y++) {
        for (let x = 8; x <= 23; x++) pset(g, x, y, (x % 4 < 1) ? B : A);
      }
      for (let y = 21; y <= 25; y++) {
        for (let x = 19; x <= 22; x++) pset(g, x, y, (y % 3 === 0) ? B : A);
      }
    } else if (acc === 'bell') {
      mr(18, 11, 14, RED);
      sp(18, 15, 16, RED);
      mr(19, 15, 15, '#f6c945');
      mr(20, 15, 15, '#f6c945');
    }

    // 졸음 z
    if (e === 0 && f === 2) {
      sp(2, 27, 29, '#6b5b95'); sp(3, 28, 28, '#6b5b95'); sp(4, 27, 29, '#6b5b95');
    }
    return addOutline(g);
  }

  // flip: 좌우 반전, tint: 단색 실루엣
  function drawGrid(ctx, grid, scale, ox, oy, flip, tint) {
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const c = grid[y][x];
        if (!c) continue;
        ctx.fillStyle = tint || c;
        const dx = flip ? N - 1 - x : x;
        ctx.fillRect(ox + dx * scale, oy + y * scale, scale, scale);
      }
    }
  }

  const frameCache = new Map();
  function framesOf(cat) {
    const key = JSON.stringify([cat.energy, cat.social, cat.delicacy, cat.boldness, cat.fur,
      cat.accessory, cat.seed, !!cat.chubby, cat.style]);
    if (!frameCache.has(key)) frameCache.set(key, [0, 1, 2].map((f) => buildFrame(cat, f)));
    return frameCache.get(key);
  }

  // [프레임, 지속ms]
  function sequenceOf(cat) {
    const d = cat.chubby ? 700 : [650, 400, 250][cat.energy];
    return [[0, d], [1, d], [0, d], [2, 220]];
  }

  // canvas는 N x N 고정. CSS로 확대한다. 반환값은 정지 함수.
  function animate(canvas, cat) {
    const ctx = canvas.getContext('2d');
    const frames = framesOf(cat);
    const seq = sequenceOf(cat);
    let i = 0, timer = null, stopped = false;
    function tick() {
      if (stopped) return;
      ctx.clearRect(0, 0, N, N);
      drawGrid(ctx, frames[seq[i][0]], 1, 0, 0);
      const wait = seq[i][1];
      i = (i + 1) % seq.length;
      timer = setTimeout(tick, wait);
    }
    tick();
    return function stop() { stopped = true; clearTimeout(timer); };
  }

  function toPngBlob(cat, cb) {
    const scale = 16;
    const c = document.createElement('canvas');
    c.width = c.height = N * scale;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff3e0';
    ctx.fillRect(0, 0, c.width, c.height);
    drawGrid(ctx, buildFrame(cat, 0), scale, 0, 0);
    c.toBlob(cb, 'image/png');
  }

  root.Render = { buildFrame, framesOf, sequenceOf, drawGrid, animate, toPngBlob, N };
})(typeof window !== 'undefined' ? window : globalThis);
