// 자랑하기: 도감의 고양이들이 줄지어 들어와 인사하는 12초짜리 장면.
// 같은 장면을 화면으로 보여주고, 영상(MediaRecorder)이나 사진으로 저장한다.
(function (root) {
  const W = 540, H = 960;   // 9:16 세로 (스토리/릴스용)
  const S = 3;              // 스프라이트 배율: 32px → 96px
  const T_WALK = 1.6;       // 걸어 들어오기 시작
  const T_GREET = 6.4;      // 인사 시작
  // 간식이 놓여 있으면 인사(3초) 뒤에 간식 먹는 장면(4.4초)이 들어간다.
  const GREET_LEN = 3.0;
  const EAT_LEN = 4.4;

  const THEME = {
    spring: { wall: '#fbe4e8', trim: '#e9b8c2', rug: '#f4a6b8', rug2: '#fbd3dc', fall: '#f7b6c8' },
    summer: { wall: '#def2ee', trim: '#a9d6cf', rug: '#4fb3a9', rug2: '#a6e3da', fall: '#ffffff' },
    autumn: { wall: '#f7e1bf', trim: '#d9b27a', rug: '#c8693a', rug2: '#e7a36b', fall: '#c8693a' },
    winter: { wall: '#e6ebf6', trim: '#b8c4dd', rug: '#c8414f', rug2: '#f1f1f1', fall: '#ffffff' },
  };
  const INK = '#2b2333';
  const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const FISH = ['.XXXX.X', 'XXXXXXX', '.XXXX.X'];
  const HEART_ROWS = HEART;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

  function pickMime() {
    if (!root.MediaRecorder) return null;
    const list = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    return list.find((m) => root.MediaRecorder.isTypeSupported(m)) || '';
  }

  // opts: { me, cats: [cat...], title, stats: {met, total, limited, limitedTotal}, season, url }
  function mount(canvas, opts) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const T = THEME[opts.season] || THEME.autumn;
    const snack = !!opts.snack;
    const T_EAT = T_GREET + GREET_LEN;
    const T_END = snack ? T_EAT + EAT_LEN : 10.4;
    const DUR = Math.ceil(T_END + 1.6);
    const GREET_END = snack ? T_EAT : T_END;
    const BOWL = { x: W / 2, y: 770 };

    // ---- 배치: 앞줄 6마리(내 고양이는 가운데), 나머지는 뒷줄 ----
    const others = opts.cats.slice(0, 11);
    const frontCount = Math.min(6, others.length + 1);
    const frontOthers = others.slice(0, frontCount - 1);
    const backCats = others.slice(frontCount - 1);
    const front = frontOthers.slice();
    front.splice(Math.floor(frontCount / 2), 0, opts.me);
    const frontY = backCats.length ? 880 : 800;
    const backY = 720;
    const spacing = 86;

    const actors = [];
    const place = (cats, y) => cats.forEach((cat, i) => {
      actors.push({
        cat, frames: Render.framesOf(cat), seq: Render.sequenceOf(cat),
        homeX: W / 2 - ((cats.length - 1) * spacing) / 2 + i * spacing,
        y, isMe: cat === opts.me, order: 0,
      });
    });
    place(backCats, backY);
    place(front, frontY);
    // 도착 순서: 내 고양이가 맨 앞, 나머지는 입력 순서
    const arrival = [opts.me].concat(others);
    actors.forEach((a) => { a.order = arrival.indexOf(a.cat); });
    actors.forEach((a) => {
      const th = Math.PI / 2 + (2 * Math.PI * a.order) / actors.length;   // 내 고양이가 맨 앞(아래)
      a.eatX = BOWL.x + 190 * Math.cos(th);
      a.eatY = BOWL.y + 95 * Math.sin(th);
    });

    // ---- 그리기 ----
    function heart(c, x, y, scale, color, rows) {
      const HEART = rows || HEART_ROWS;
      c.fillStyle = INK;
      HEART.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === 'X') c.fillRect(x + (i - 1) * scale, y + j * scale, scale * 3, scale);
        if (ch === 'X') c.fillRect(x + i * scale, y + (j - 1) * scale, scale, scale * 3);
      }));
      c.fillStyle = color;
      HEART.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === 'X') c.fillRect(x + i * scale, y + j * scale, scale, scale);
      }));
    }

    function bowl(c, cx, cy, fill) {
      c.fillStyle = INK; c.fillRect(cx - 78, cy - 8, 156, 46);
      c.fillStyle = '#e9e4dc'; c.fillRect(cx - 74, cy - 4, 148, 38);
      c.fillStyle = '#c98d5a'; c.fillRect(cx - 74, cy - 4, 148, 10);
      const h = Math.round(36 * fill);
      c.fillStyle = INK; c.fillRect(cx - 64, cy - 14 - h, 128, h + 12);
      c.fillStyle = '#b9733c'; c.fillRect(cx - 60, cy - 10 - h, 120, h + 8);
      c.fillStyle = '#c98550'; c.fillRect(cx - 48, cy - 10 - h, 96, 8);
      c.fillStyle = '#8a4b2a';
      [[-40, 4], [-12, 12], [20, 2], [40, 14], [-26, 20], [8, 24]].forEach(([dx, dy]) => {
        if (dy < h) c.fillRect(cx + dx, cy - 10 - h + dy, 8, 6);
      });
    }

    function label(c, text, x, y, size, color, stroke) {
      c.font = `${size}px Galmuri11, "Apple SD Gothic Neo", sans-serif`;
      c.textAlign = 'center';
      c.lineJoin = 'round';
      c.lineWidth = Math.max(4, size / 4);
      c.strokeStyle = stroke || '#fffaf0';
      c.strokeText(text, x, y);
      c.fillStyle = color || INK;
      c.fillText(text, x, y);
    }

    function background(c, t) {
      // 벽 (인테리어 벽지)
      const deco = opts.deco || {};
      let trim = T.trim;
      if (deco.wall === 'cream') {
        c.fillStyle = '#fff4dc'; c.fillRect(0, 0, W, 560);
        c.fillStyle = '#ecd9b0';
        for (let y = 10; y < 560; y += 18) c.fillRect(0, y, W, 2);
        trim = '#e6c98a';
      } else if (deco.wall === 'mint' || deco.wall === 'pink') {
        const mint = deco.wall === 'mint';
        c.fillStyle = mint ? '#dff3ea' : '#fde4ee'; c.fillRect(0, 0, W, 560);
        c.fillStyle = mint ? '#bfe3d3' : '#f7b6c8';
        for (let y = 14, row = 0; y < 540; y += 28, row++) {
          for (let x = (row % 2) * 14 + 10; x < W; x += 28) c.fillRect(x, y, 6, 6);
        }
        trim = mint ? '#9fd4bd' : '#eaa0b8';
      } else if (deco.wall === 'night') {
        c.fillStyle = '#2f3556'; c.fillRect(0, 0, W, 560);
        let seed = 7;
        for (let i = 0; i < 70; i++) {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          const sx = seed % W;
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          const sy = seed % 540;
          c.fillStyle = i % 3 ? '#ffe9a8' : '#ffffff';
          c.fillRect(sx, sy, i % 5 === 0 ? 6 : 3, i % 5 === 0 ? 6 : 3);
        }
        trim = '#232846';
      } else {
        c.fillStyle = T.wall; c.fillRect(0, 0, W, 560);
        c.fillStyle = T.trim; c.globalAlpha = 0.35;
        for (let x = 0; x < W; x += 36) c.fillRect(x, 0, 4, 560);
        c.globalAlpha = 1;
      }
      c.fillStyle = trim; c.fillRect(0, 548, W, 12);
      // 바닥 (인테리어 바닥)
      if (deco.floor === 'tile') {
        c.fillStyle = '#ece6da'; c.fillRect(0, 560, W, H - 560);
        c.fillStyle = '#cfc6b4';
        for (let y = 560; y < H; y += 40) c.fillRect(0, y, W, 2);
        for (let x = 0; x < W; x += 40) c.fillRect(x, 560, 2, H - 560);
      } else if (deco.floor === 'check') {
        c.fillStyle = '#f4d9a8'; c.fillRect(0, 560, W, H - 560);
        c.fillStyle = '#e3bd7e';
        for (let y = 560, row = 0; y < H; y += 30, row++) {
          for (let x = (row % 2) * 30; x < W; x += 60) c.fillRect(x, y, 30, 30);
        }
      } else {
        c.fillStyle = '#dcae78'; c.fillRect(0, 560, W, H - 560);
        c.fillStyle = '#c99763';
        for (let y = 560, row = 0; y < H; y += 40, row++) {
          c.fillRect(0, y, W, 3);
          for (let x = (row % 2) * 60; x < W; x += 120) c.fillRect(x, y, 3, 40);
        }
      }
      // 창문과 선반
      c.fillStyle = '#8a6a4a'; c.fillRect(60, 130, 180, 150);
      c.fillStyle = opts.season === 'summer' ? '#7fd0ff' : opts.season === 'winter' ? '#cdd9ef'
        : opts.season === 'spring' ? '#bfe4ff' : '#f3b67c';
      c.fillRect(72, 142, 156, 126);
      c.fillStyle = '#8a6a4a'; c.fillRect(146, 142, 8, 126); c.fillRect(72, 198, 156, 8);
      c.fillStyle = '#a98259'; c.fillRect(300, 190, 200, 12);
      c.fillStyle = '#c8693a'; c.fillRect(330, 156, 30, 34);
      c.fillStyle = '#5fa85a'; c.fillRect(324, 124, 42, 32);
      c.fillStyle = '#8a6a4a'; c.fillRect(400, 130, 56, 60);
      c.fillStyle = '#f4e4a8'; c.fillRect(408, 138, 40, 44);
      // 러그
      const RUGC = { blue: ['#4f7fd2', '#bcd0f5'], green: ['#4fa86b', '#bfe6c9'], purple: ['#8a5ac8', '#d6c4f0'] };
      const [rug1, rug2] = RUGC[deco.rug] || [T.rug, T.rug2];
      c.fillStyle = rug1; c.fillRect(30, 600, 480, 330);
      c.fillStyle = rug2; c.fillRect(44, 614, 452, 302);
      c.fillStyle = rug1; c.fillRect(58, 628, 424, 274);
      // 인테리어 가구: 고양이들이 줄 서는 바닥을 가리지 않도록, 가로 위치는 방과 같게 하고
      // 뒷벽 쪽 띠(고양이 뒷줄의 귀 바로 위)에 줄지어 놓는다. 방에서 더 앞쪽에 둔 가구가 살짝 아래에 온다.
      (opts.items || []).slice().sort((a, b) => a.y - b.y).forEach((it) => {
        c.save();
        c.translate(Math.round(it.x * (W / 240)), Math.round(616 + ((it.y - 104) / 68) * 10));   // 616~626: 뒷줄 고양이 귀(627) 바로 위
        c.scale(2.5, 2.5);
        Room.drawItem(c, it.id, 0, 0, t * 1000);
        c.restore();
      });
      // 떨어지는 파티클
      c.fillStyle = T.fall;
      for (let i = 0; i < 26; i++) {
        const sx = (i * 97) % W;
        if (opts.season === 'summer') {
          if (Math.floor(t * 2.5 + i) % 3 === 0) c.fillRect(sx, (i * 61) % 500, 6, 6);
          continue;
        }
        const y = (t * (30 + (i % 5) * 10) + i * 53) % 560;
        c.fillRect(sx + Math.round(Math.sin(t * 1.5 + i) * 10), y, 6, 6);
      }
    }

    function draw(c, t) {
      background(c, t);

      const greeting = t >= T_GREET && t < GREET_END;
      const eatingPhase = snack && t >= T_EAT;

      // 위치 계산: 걸어 들어오기 → (간식이 있으면) 밥그릇 둘레로 이동
      const items = [];
      actors.forEach((a) => {
        const start = T_WALK + a.order * 0.32;
        if (t < start) return;
        const p = clamp((t - start) / 2.2, 0, 1);
        const startX = W + 80;
        let x = startX + (a.homeX - startX) * easeOut(p);
        let y = a.y;
        let walking = p < 1;
        let flip = true;                                  // 왼쪽으로 걷는다
        if (eatingPhase) {
          const q = clamp((t - T_EAT - a.order * 0.08) / 1.2, 0, 1);
          const k = easeInOut(q);
          x = a.homeX + (a.eatX - a.homeX) * k;
          y = a.y + (a.eatY - a.y) * k;
          walking = q < 1;
          flip = a.eatX < a.homeX;
        }
        items.push({ kind: 'cat', a, x, y, walking, flip });
      });
      if (eatingPhase || (snack && t >= T_EAT - 0.6)) items.push({ kind: 'bowl', y: BOWL.y });
      items.sort((m, n) => m.y - n.y);

      items.forEach((it) => {
        if (it.kind === 'bowl') {
          const prog = clamp((t - T_EAT) / EAT_LEN, 0, 1);
          bowl(c, BOWL.x, BOWL.y, 1 - 0.65 * prog);
          return;
        }
        const { a, x, y, walking, flip } = it;
        let frame;
        if (walking) {
          frame = a.frames[Math.floor(t / 0.18) % 2];
        } else {
          const total = a.seq.reduce((s, q) => s + q[1], 0);
          let ms = ((t * 1000) + a.order * 137) % total;
          frame = a.frames[0];
          for (const [f, d] of a.seq) { if (ms < d) { frame = a.frames[f]; break; } ms -= d; }
        }
        let dy = 0;
        if (greeting && !walking) {                       // 인사: 콩콩
          const phase = (t - T_GREET) * 6.5 - a.order * 0.55;
          dy = -Math.max(0, Math.sin(phase)) * 22;
        }
        if (eatingPhase && !walking) {                    // 냠냠: 고개를 끄덕끄덕
          dy = Math.max(0, Math.sin(t * 9 + a.order * 1.3)) * 8;
        }
        const ox = Math.round(x - 16 * S);
        const oy = Math.round(y - 31 * S + dy);
        c.fillStyle = 'rgba(43,35,51,0.18)';
        c.fillRect(Math.round(x - 30), Math.round(y - 2), 60, 8);
        Render.drawGrid(c, frame, S, ox, oy, flip && walking);

        if (!walking) {
          label(c, a.cat.name, Math.round(x), Math.round(y + 26), 18, INK);
          if (a.isMe) heart(c, Math.round(x - 10), oy - 6, 3, '#f0607a');
          if (greeting) {
            const k = ((t - T_GREET) * 0.9 + a.order * 0.37) % 1;
            if (k < 0.8) {
              c.globalAlpha = 1 - k / 0.8;
              heart(c, Math.round(x - 8 + Math.sin(a.order * 3 + k * 6) * 10), oy - 4 - Math.round(k * 50), 2, '#f0607a');
              c.globalAlpha = 1;
            }
          }
          if (eatingPhase) {
            if (Math.floor(t * 3 + a.order) % 2 === 0) {
              heart(c, Math.round(x - 10), oy - 14, 3, '#6fb7e8', FISH);
            } else {
              label(c, '냠냠', Math.round(x), oy - 4, 20, '#b8662a');
            }
          }
        }
      });

      // 제목 카드 → 상단 제목
      const title = `${opts.title}의 고양이 사랑방`;
      if (t < T_WALK + 0.4) {
        c.fillStyle = 'rgba(255,243,224,0.92)';
        c.fillRect(0, 0, W, H);
        label(c, title, W / 2, 440, 40, INK);
        label(c, `도감 ${opts.stats.met} / ${opts.stats.total}`, W / 2, 500, 26, '#b8662a');
        label(c, '🐾', W / 2, 380, 52, INK);
      } else {
        label(c, title, W / 2, 72, 32, INK);
        label(c, `도감 ${opts.stats.met} / ${opts.stats.total} · 한정 ${opts.stats.limited} / ${opts.stats.limitedTotal}`,
          W / 2, 112, 20, '#b8662a');
      }

      // 마무리 카드
      if (t >= T_END) {
        const a = clamp((t - T_END) / 0.6, 0, 1);
        c.globalAlpha = a;
        c.fillStyle = 'rgba(43,35,51,0.82)';
        c.fillRect(0, 430, W, 120);
        label(c, '고양이 사랑방', W / 2, 482, 34, '#fffaf0', INK);
        label(c, opts.url, W / 2, 526, 20, '#ffd84a', INK);
        c.globalAlpha = 1;
      }
    }

    // ---- 재생/녹화 ----
    let raf = 0;
    let mode = 'loop';         // 'loop' | 'record'
    let t0 = performance.now();
    let recorder = null;
    let progressCb = null;

    function frame(now) {
      let t;
      if (mode === 'record') {
        t = (now - t0) / 1000;
        if (t >= DUR + 0.4 && recorder && recorder.state === 'recording') recorder.stop();
        if (progressCb) progressCb(clamp(t / (DUR + 0.4), 0, 1));
        t = Math.min(t, DUR);
      } else {
        t = ((now - t0) / 1000) % (DUR + 1.5);
        t = Math.min(t, DUR);
      }
      draw(ctx, t);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function replay() { mode = 'loop'; t0 = performance.now(); }

    // 영상으로 저장. done(blob, ext) / fail(message)
    function record(done, fail, onProgress) {
      if (!canvas.captureStream || !root.MediaRecorder) { fail('이 브라우저는 영상 저장을 지원하지 않아요. 사진으로 저장해 보세요.'); return; }
      const mime = pickMime();
      let rec;
      try {
        rec = new MediaRecorder(canvas.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 5000000 } : undefined);
      } catch (e) { fail('영상 녹화를 시작하지 못했어요.'); return; }
      const chunks = [];
      rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
      rec.onstop = () => {
        mode = 'loop'; t0 = performance.now(); recorder = null; progressCb = null;
        const type = rec.mimeType || mime || 'video/webm';
        done(new Blob(chunks, { type }), type.includes('mp4') ? 'mp4' : 'webm');
      };
      recorder = rec;
      progressCb = onProgress || null;
      mode = 'record';
      t0 = performance.now();
      rec.start();
    }

    // 인사하는 장면을 사진으로
    function snapshot(cb) {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;
      draw(cx, snack ? T_EAT + 2.2 : 9.2);
      c.toBlob(cb, 'image/png');
    }

    return {
      replay, record, snapshot,
      duration: DUR,
      hasSnack: snack,
      stop() {
        cancelAnimationFrame(raf);
        if (recorder && recorder.state === 'recording') { try { recorder.stop(); } catch (e) { /* 무시 */ } }
      },
    };
  }

  root.Showcase = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
