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
    honey: { base: '#f0c35a', shade: '#d9a63a', patch: '#fbe3a0' },
    blue: { base: '#8fa4bd', shade: '#6f86a3', patch: '#c5d2e3' },
    white: { base: '#f3f1ee', shade: '#d9d5cf', patch: '#dcd6cc' },
    brown: { base: '#a67c5b', shade: '#85603f', patch: '#c9a27e' },
    butler: { base: '#3b3b52', shade: '#3b3b52', patch: '#555570' },   // 집사 턱시도
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

  // 이미 색이 칠해진 위에 올리는 소품: 외곽선과 함께 찍는다.
  function stampCells(g, cells, fill) {
    const has = new Set(cells.map(([x, y]) => x + ',' + y));
    cells.forEach(([x, y]) => {
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        if (!has.has((x + dx) + ',' + (y + dy))) pset(g, x + dx, y + dy, OUT);
      });
    });
    cells.forEach(([x, y]) => pset(g, x, y, typeof fill === 'function' ? fill(x, y) : fill));
  }
  function rowsToCells(rows) {
    const out = [];
    rows.forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) out.push([x, y]); });
    return out;
  }

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

    // 호스트 표식 색: 털색과 대비되는 색 (이마 무늬, 꼬리 끝에 쓴다)
    const MC = cat.mark ? ({ cream: '#d9886a', orange: '#fffaf0', black: '#ffd84a', gray: '#f06a9a',
      honey: '#b8662a', blue: '#fffaf0', white: '#f06a9a', brown: '#ffd84a' }[cat.fur] || '#f06a9a') : null;

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
    sp(29, 31 - edge, tx + 1, K);    // 몸통 끝과 꼬리 사이 한 칸까지 이어 붙인다
    if (MC) {                                       // 호스트: 꼬리 끝을 물들인다
      if (e === 2 && !cat.chubby) { sp(9, tx + sway, tx + 1 + sway, MC); sp(10, tx + sway, tx + 1 + sway, MC); }
      else if (e === 1 || cat.chubby) { sp(18, tx - 1 + sway, tx - 1 + sway, MC); sp(19, tx - 1 + sway, tx + sway, MC); }
      else { sp(23, tx - 1 + sway, tx + sway, MC); }
    }

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
    if (cat.sock) { mr(28, 10, 14, cat.sock); mr(29, 9, 14, cat.sock); }   // 호스트: 색깔 양말

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

    // 무늬(설문 '옷장 속 내 옷'): 줄무늬, 점박이, 포인트. 털 색(K)인 칸만 칠한다.
    const ptn = cat.pattern;
    if (ptn && ptn !== 'plain') {
      const lightFur = ['cream', 'orange', 'honey', 'white', 'gray', 'blue'].includes(cat.fur);
      const ink = lightFur ? '#3f3a4a' : '#e8e4f0';                 // 점 색: 밝은 털엔 어둡게, 어두운 털엔 밝게
      const stripe = p.shade === K ? '#2a2a3a' : p.shade;
      const paintK = (y, x0, x1, c) => { for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === K) g[y][x] = c; };
      const paintBoth = (y, x0, x1, c) => { paintK(y, x0, x1, c); paintK(y, 31 - x1, 31 - x0, c); };
      if (ptn === 'tabby') {
        [9, 10].forEach((y) => { paintBoth(y, 12, 12, stripe); paintK(y, 15, 16, stripe); });   // 이마 세 줄
        [12, 14].forEach((y) => paintBoth(y, 5, 7, stripe));                                    // 볼
        [21, 23, 25, 27].forEach((y) => paintBoth(y, edge, edge + 2, stripe));                  // 몸 옆
        for (let y = 10; y <= 28; y += 3) paintK(y, 31 - edge + 1, 31, stripe);                 // 꼬리 고리
      } else if (ptn === 'spots') {
        paintK(9, 7, 9, ink); paintK(10, 6, 9, ink); paintK(11, 6, 8, ink);                     // 머리 왼쪽 큰 점
        paintK(9, 19, 21, ink);                                                                  // 머리 오른쪽 작은 점
        paintK(22, edge, edge + 3, ink); paintK(23, edge, edge + 3, ink); paintK(24, edge, edge + 2, ink);
        paintK(25, 31 - edge - 3, 31 - edge, ink); paintK(26, 31 - edge - 3, 31 - edge, ink);
        paintK(27, 31 - edge - 2, 31 - edge, ink);
      } else if (ptn === 'point') {
        const PT = { cream: '#6b4f3a', orange: '#8a4a1c', black: '#1f1f2e', gray: '#4a5060', honey: '#8a5a1c',
          blue: '#45566e', white: '#7a6a60', brown: '#4a3020' }[cat.fur] || '#4a3a2e';
        for (let y = 2; y <= 7; y++) paintK(y, 0, 31, PT);                                      // 귀
        for (let y = 5; y <= 29; y++) paintK(y, 31 - edge + 1, 31, PT);                         // 꼬리
        for (let y = 11; y <= 13; y++) paintK(y, 14, 17, PT);                                   // 콧등
      }
    }

    // 얼굴: 흰 주둥이, 볼터치 (친화적이거나 취했을 때)
    mr(14, 12, 15, WHITE);
    mr(15, 10, 15, WHITE);
    mr(16, 10, 15, WHITE);
    mr(17, 11, 15, WHITE);
    const accs = cat.accessories && cat.accessories.length ? cat.accessories : [cat.accessory];
    if (s === 2 || accs.includes('tie') || accs.includes('bottle')) mr(14, 7, 8, BLUSH);

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
    if (cat.eyeColor && e !== 0 && f !== 2) {        // 호스트 전용 눈동자 색
      for (let y = top + 1; y <= 13; y++) mr(y, ex, 11, cat.eyeColor);
      pset(g, ex, top + 1, WHITE);
      pset(g, 31 - 11, top + 1, WHITE);
      if (b === 2) { pset(g, 11, 13, WHITE); pset(g, 31 - ex, 13, WHITE); }
    }
    if (s === 0) mr(10, ex, 11, OUT);          // 도도한 눈썹

    // 호스트 전용 이마 무늬 (털색과 대비되는 색)
    if (cat.mark) {
      const shapes = {
        star: [[15, 9], [16, 9], [14, 10], [15, 10], [16, 10], [17, 10], [15, 11], [16, 11]],
        heart: [[14, 10], [15, 10], [16, 10], [17, 10], [14, 11], [15, 11], [16, 11], [17, 11], [15, 12], [16, 12]],
        bolt: [[16, 9], [17, 9], [15, 10], [16, 10], [15, 11], [16, 11], [14, 12], [15, 12]],
        tabby: [[14, 10], [14, 11], [15, 9], [15, 10], [16, 9], [16, 10], [17, 10], [17, 11]],
      };
      (shapes[cat.mark] || []).forEach(([x, y]) => pset(g, x, y, MC));
    }

    // 코와 입: 친화적이면 W, 독립적이면 일자
    sp(14, 15, 16, PINK);
    if (s === 2) {
      [[13, 15], [15, 15], [16, 15], [18, 15], [14, 16], [17, 16]].forEach(([x, y]) => pset(g, x, y, OUT));
    } else if (s === 1) {
      [[15, 15], [16, 15], [14, 16], [17, 16]].forEach(([x, y]) => pset(g, x, y, OUT));
    } else {
      sp(16, 14, 17, OUT);
    }

    // 액세서리: 등(망토) → 목 → 머리 → 얼굴 → 손 순서로 겹쳐 그린다
    const ORDER = { cape: 0, wings: 0, butterfly: 0, backpack: 0,
      pearl: 1, shell: 1, scarf: 1, bell: 1, bandana: 1, medal: 1, lei: 1, bowtie: 1,
      tie: 2, blossom: 2, leaf: 2, crown: 2, partyhat: 2, flowers: 2, ribbonpin: 2, headphones: 2,
      beret: 2, strawhat: 2, santahat: 2,
      glasses: 3, shades: 3, monocle: 3, heartglasses: 3, sleepmask: 3,
      bottle: 4, fish: 4, balloon: 4, icecream: 4 };
    // 날개: 몸 옆으로 펼쳐진다(이미 칠해진 칸은 건드리지 않음)
    const wingsOf = (c1, c2, rows) => {
      rows.forEach(([y, w]) => {
        for (let k = 1; k <= w; k++) {
          const x = edge - k;
          const col = k === w ? c2 : c1;
          if (x >= 0 && g[y][x] === null) g[y][x] = col;
          const mx = 31 - x;
          if (mx < 32 && g[y][mx] === null) g[y][mx] = col;
        }
      });
    };
    const drawAcc = (acc) => {
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
    } else if (acc === 'bowtie') {
      // 나비넥타이: 양끝은 넓고 가운데는 좁다
      mr(18, 9, 11, RED);
      mr(19, 9, 14, RED);
      mr(20, 9, 14, RED);
      mr(21, 9, 11, RED);
      sp(19, 14, 17, '#b83a4a');
      sp(20, 14, 17, '#b83a4a');
    } else if (acc === 'crown') {
      const G = '#f6c945';
      mr(8, 11, 15, G); mr(7, 11, 15, G);                       // 띠
      [11, 15, 16, 20].forEach((x) => { pset(g, x, 6, G); pset(g, x, 5, G); });
      pset(g, 15, 4, G); pset(g, 16, 4, G);
      pset(g, 14, 7, RED); pset(g, 17, 7, '#4f7fd2');            // 보석
    } else if (acc === 'partyhat') {
      [[7, 13, 18], [6, 14, 17], [5, 14, 17], [4, 15, 16], [3, 15, 16]].forEach(([y, a, b]) => {
        sp(y, a, b, (y % 2) ? '#fff0a8' : '#e04f5f');
      });
      sp(2, 14, 17, '#ffd84a');                                  // 방울
    } else if (acc === 'flowers') {
      const cols = ['#f06a9a', '#ffe45c', '#fffaf0', '#f7a6c0'];
      for (let x = 8; x <= 23; x++) {
        pset(g, x, 8, x % 2 ? '#5fa85a' : cols[(x >> 1) % cols.length]);
        if (x % 4 === 0) pset(g, x, 7, cols[(x >> 2) % cols.length]);
      }
    } else if (acc === 'cape') {
      // 몸 뒤로 펼쳐지는 망토. 이미 칠해진 칸은 건드리지 않는다.
      const RC = '#c8414f', RD = '#a3303c';
      for (let y = 19; y <= 28; y++) {
        for (let x = edge - 3; x < edge; x++) {
          const col = y > 25 ? RD : RC;
          if (x >= 0 && g[y][x] === null) g[y][x] = col;
          const mx = 31 - x;
          if (mx < 32 && g[y][mx] === null) g[y][mx] = col;
        }
      }
      sp(18, 13, 18, '#f6c945');                                 // 여밈
    } else if (acc === 'headphones') {
      sp(8, 6, 25, '#3a3a4a');
      mr(9, 5, 5, '#3a3a4a');
      mr(10, 4, 4, '#3a3a4a');
      for (let y = 11; y <= 16; y++) { mr(y, 3, 4, RED); }
      mr(12, 3, 3, '#f2808c');
    } else if (acc === 'ribbonpin') {
      const P = '#f06a9a', KN = '#c0407a';
      [[7, 7], [8, 7], [10, 7], [11, 7], [7, 9], [8, 9], [10, 9], [11, 9]].forEach(([x, y]) => pset(g, x, y, P));
      sp(8, 7, 11, P);
      pset(g, 9, 8, KN);
    } else if (acc === 'pearl' || acc === 'shell') {
      // 목에 걸친 U자 줄. 가운데에 큰 알(진주) 또는 부채꼴 조개가 달린다.
      const path = [[9, 18], [10, 19], [11, 20], [12, 21], [13, 21], [14, 22], [15, 22],
        [16, 22], [17, 22], [18, 21], [19, 21], [20, 20], [21, 19], [22, 18]];
      if (acc === 'pearl') {
        path.forEach(([x, y], i) => pset(g, x, y, i % 2 ? '#8f7fb8' : '#cbbfe8'));
        sp(23, 15, 16, '#8f7fb8'); sp(24, 15, 16, '#cbbfe8');          // 큰 진주
        pset(g, 15, 23, '#ffffff'); pset(g, 14, 23, OUT); pset(g, 17, 23, OUT);
        pset(g, 14, 24, OUT); pset(g, 17, 24, OUT); sp(25, 15, 16, OUT);
      } else {
        path.forEach(([x, y], i) => pset(g, x, y, i % 3 === 1 ? '#f7c6b5' : '#8a6a4a'));
        sp(23, 14, 17, '#f7c6b5'); sp(24, 15, 16, '#f7c6b5');           // 부채꼴 조개
        pset(g, 15, 23, '#e89a85'); pset(g, 16, 23, '#e89a85'); pset(g, 14, 22, '#f7c6b5');
        sp(25, 15, 16, '#e89a85');
        pset(g, 13, 23, OUT); pset(g, 18, 23, OUT); pset(g, 14, 24, OUT); pset(g, 17, 24, OUT);
      }
    } else if (acc === 'beret') {
      const B = '#3f4f8f';
      [[8, 8, 22], [7, 9, 23], [6, 11, 21], [5, 15, 18]].forEach(([y, a, b]) => sp(y, a, b, B));
      pset(g, 17, 4, B);
      sp(6, 12, 14, '#5a6fb5');
    } else if (acc === 'strawhat') {
      [[3, 12, 19], [4, 11, 20], [5, 11, 20]].forEach(([y, a, b]) => sp(y, a, b, '#e8c86a'));
      sp(6, 11, 20, RED);
      sp(7, 5, 26, '#d4a94a');
      sp(8, 6, 25, '#b88a35');
    } else if (acc === 'santahat') {
      const S = '#d83a4a';
      [[7, 10, 21], [6, 11, 21], [5, 13, 22], [4, 15, 23], [3, 18, 24]].forEach(([y, a, b]) => sp(y, a, b, S));
      sp(8, 7, 24, '#fffaf0');                               // 하얀 털단
      for (let y = 2; y <= 4; y++) sp(y, 24, 26, '#fffaf0');  // 방울
    } else if (acc === 'monocle') {
      const GD = '#d4a94a';
      const rx = 31 - 11 - 1;
      for (let x = rx; x <= rx + ew + 1; x++) { pset(g, x, 10, GD); pset(g, x, 14, GD); }
      for (let y = 10; y <= 14; y++) { pset(g, rx, y, GD); pset(g, rx + ew + 1, y, GD); }
      [[rx + ew + 1, 15], [rx + ew + 2, 16], [rx + ew + 2, 17], [rx + ew + 3, 18]].forEach(([x, y]) => pset(g, x, y, GD));
    } else if (acc === 'heartglasses') {
      const H = '#f06a9a';
      const heart = (x0) => {
        [[1, 9], [2, 9], [4, 9], [5, 9], [0, 10], [3, 10], [6, 10], [0, 11], [6, 11],
          [1, 12], [5, 12], [2, 13], [4, 13], [3, 14]].forEach(([dx, y]) => pset(g, x0 + dx, y, H));
      };
      heart(7); heart(18);
      sp(10, 14, 17, H);
    } else if (acc === 'sleepmask') {
      const M = '#f2a6c0';
      sp(9, 8, 23, M); sp(10, 8, 23, M);
      mr(9, 5, 7, '#c0407a');                                // 끈
      [11, 12, 13].forEach((x) => { pset(g, x, 9, '#6b3a5a'); pset(g, 31 - x, 9, '#6b3a5a'); });
      pset(g, 12, 10, '#6b3a5a'); pset(g, 19, 10, '#6b3a5a');
    } else if (acc === 'bandana') {
      const RB = '#d2554f';
      [[18, 9, 22], [19, 10, 21], [20, 11, 20], [21, 12, 19], [22, 13, 18], [23, 14, 17], [24, 15, 16]]
        .forEach(([y, a, b]) => sp(y, a, b, RB));
      sp(18, 9, 22, '#a3303c');
      [[12, 19], [15, 20], [18, 19], [14, 22], [17, 21]].forEach(([x, y]) => pset(g, x, y, '#fffaf0'));
    } else if (acc === 'medal') {
      [[11, 18], [12, 19], [13, 20], [14, 21]].forEach(([x, y]) => { pset(g, x, y, '#4f7fd2'); pset(g, 31 - x, y, '#e04f5f'); });
      stampCells(g, rowsToCells([[22, 14, 17], [23, 14, 17], [24, 14, 17]]), (x, y) => (y === 22 ? '#fff0a8' : '#f6c945'));
      pset(g, 15, 23, '#d4a94a'); pset(g, 16, 23, '#d4a94a');
    } else if (acc === 'lei') {
      const path = [[9, 18], [10, 19], [11, 20], [12, 21], [13, 21], [14, 22], [15, 22],
        [16, 22], [17, 22], [18, 21], [19, 21], [20, 20], [21, 19], [22, 18]];
      const colors = ['#f06a9a', '#ffd84a', '#f2a64e', '#5fa85a'];
      path.forEach(([x, y], i) => {
        pset(g, x, y, colors[i % 4]);
        if (i % 2 === 0) pset(g, x, y + 1, colors[(i + 1) % 4]);
      });
    } else if (acc === 'wings') {
      wingsOf('#ffffff', '#cfd9ee', [[15, 2], [16, 3], [17, 4], [18, 5], [19, 5], [20, 5], [21, 4], [22, 4], [23, 3], [24, 2]]);
    } else if (acc === 'butterfly') {
      wingsOf('#f5a6d8', '#b58be6', [[16, 3], [17, 4], [18, 5], [19, 5], [20, 5], [21, 4], [22, 3], [23, 4], [24, 4], [25, 3], [26, 2]]);
    } else if (acc === 'backpack') {
      const GB = '#4fa86b', GD = '#2f7a4a';
      for (let y = 20; y <= 27; y++) {
        [edge - 2, edge - 1].forEach((x) => {
          const c = (x === edge - 2 || y === 27) ? GD : GB;
          if (x >= 0 && g[y][x] === null) g[y][x] = c;
          const mx = 31 - x;
          if (mx < 32 && g[y][mx] === null) g[y][mx] = c;
        });
      }
      for (let y = 18; y <= 23; y++) mr(y, 12, 12, GD);       // 어깨끈
      pset(g, 12, 22, '#f6c945'); pset(g, 19, 22, '#f6c945');
    } else if (acc === 'fish') {
      const cells = rowsToCells([[22, 13, 18], [23, 12, 19], [24, 12, 19], [25, 13, 18]])
        .concat([[10, 22], [11, 23], [11, 24], [10, 25]]);
      stampCells(g, cells, (x, y) => (y >= 24 ? '#bfe3f7' : '#6fb7e8'));
      pset(g, 17, 23, OUT);
      sp(23, 14, 14, '#4f93c8');
    } else if (acc === 'balloon') {
      const cells = [];
      for (let y = 5; y <= 13; y++) for (let x = 20; x <= 28; x++) {
        if ((x - 24) * (x - 24) + (y - 9) * (y - 9) <= 14) cells.push([x, y]);
      }
      stampCells(g, cells, (x, y) => (x <= 22 && y <= 8 ? '#f2808c' : RED));
      [[24, 15], [23, 16], [23, 17], [22, 18], [22, 19], [21, 20], [21, 21]].forEach(([x, y]) => pset(g, x, y, '#6a6a7a'));
      stampCells(g, rowsToCells([[22, 19, 22], [23, 19, 22]]), WHITE);   // 풍선 끈을 쥔 앞발
    } else if (acc === 'icecream') {
      stampCells(g, rowsToCells([[22, 19, 23], [23, 19, 23], [24, 20, 22], [25, 20, 22], [26, 21, 21], [27, 21, 21]]),
        (x, y) => ((x + y) % 2 ? '#d9a85a' : '#c48f3f'));
      stampCells(g, rowsToCells([[19, 19, 23], [20, 19, 23], [21, 19, 23]]), '#f7a8b8');
      stampCells(g, rowsToCells([[17, 20, 22], [18, 19, 23]]), '#8ad4a0');
      stampCells(g, rowsToCells([[24, 17, 18], [25, 17, 18]]), WHITE);    // 쥔 앞발
    } else if (acc === 'bell') {
      mr(18, 11, 14, RED);
      sp(18, 15, 16, RED);
      mr(19, 15, 15, '#f6c945');
      mr(20, 15, 15, '#f6c945');
    }
    };
    accs.slice().sort((a, b) => (ORDER[a] || 0) - (ORDER[b] || 0)).forEach(drawAcc);

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
      cat.accessory, (cat.accessories || []).join('+'), cat.seed, !!cat.chubby, cat.style,
      cat.mark || '', cat.eyeColor || '', cat.sock || '']);
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

  // 움직이는 모습을 GIF로 (눈 깜빡임, 꼬리 흔들림). 색이 너무 많으면 null.
  function toGifBlob(cat, opts) {
    const transparent = !!(opts && opts.transparent);
    const frames = framesOf(cat);
    const seq = sequenceOf(cat).map(([f, ms]) => ({ grid: frames[f], delay: ms }));
    const bytes = root.Gif.encode(seq, 8, '#fff3e0', transparent);
    return bytes ? new Blob([bytes], { type: 'image/gif' }) : null;
  }

  root.Render = { buildFrame, framesOf, sequenceOf, drawGrid, animate, toPngBlob, toGifBlob, N };
})(typeof window !== 'undefined' ? window : globalThis);
