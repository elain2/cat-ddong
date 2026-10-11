// 자랑하기: 도감의 고양이들이 줄지어 들어와 인사하는 12초짜리 장면.
// 같은 장면을 화면으로 보여주고, 영상(MediaRecorder)이나 사진으로 저장한다.
(function (root) {
  const W = 540, H = 960;   // 9:16 세로 (스토리/릴스용)
  const S = 3;              // 스프라이트 배율: 32px → 96px
  const DUR = 12;           // 영상 길이(초)
  const T_WALK = 1.6;       // 걸어 들어오기 시작
  const T_GREET = 6.4;      // 인사 시작
  const T_END = 10.4;       // 마무리 카드

  const THEME = {
    spring: { wall: '#fbe4e8', trim: '#e9b8c2', rug: '#f4a6b8', rug2: '#fbd3dc', fall: '#f7b6c8' },
    summer: { wall: '#def2ee', trim: '#a9d6cf', rug: '#4fb3a9', rug2: '#a6e3da', fall: '#ffffff' },
    autumn: { wall: '#f7e1bf', trim: '#d9b27a', rug: '#c8693a', rug2: '#e7a36b', fall: '#c8693a' },
    winter: { wall: '#e6ebf6', trim: '#b8c4dd', rug: '#c8414f', rug2: '#f1f1f1', fall: '#ffffff' },
  };
  const INK = '#2b2333';
  const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);

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

    // ---- 그리기 ----
    function heart(c, x, y, scale, color) {
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
      c.fillStyle = T.wall; c.fillRect(0, 0, W, 560);
      c.fillStyle = T.trim; c.globalAlpha = 0.35;
      for (let x = 0; x < W; x += 36) c.fillRect(x, 0, 4, 560);
      c.globalAlpha = 1;
      c.fillStyle = T.trim; c.fillRect(0, 548, W, 12);
      // 바닥
      c.fillStyle = '#dcae78'; c.fillRect(0, 560, W, H - 560);
      c.fillStyle = '#c99763';
      for (let y = 560, row = 0; y < H; y += 40, row++) {
        c.fillRect(0, y, W, 3);
        for (let x = (row % 2) * 60; x < W; x += 120) c.fillRect(x, y, 3, 40);
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
      c.fillStyle = T.rug; c.fillRect(30, 600, 480, 330);
      c.fillStyle = T.rug2; c.fillRect(44, 614, 452, 302);
      c.fillStyle = T.rug; c.fillRect(58, 628, 424, 274);
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

      // 인사 구간의 콩콩 + 하트
      const greeting = t >= T_GREET && t < T_END;
      actors.slice().sort((a, b) => a.y - b.y).forEach((a) => {
        const start = T_WALK + a.order * 0.32;
        const p = clamp((t - start) / 2.2, 0, 1);
        if (t < start) return;
        const startX = W + 80;
        const x = startX + (a.homeX - startX) * easeOut(p);
        const walking = p < 1;
        let frame;
        if (walking) {
          frame = a.frames[Math.floor(t / 0.18) % 2];
        } else {
          const total = a.seq.reduce((s, q) => s + q[1], 0);
          let ms = ((t * 1000) + a.order * 137) % total;
          frame = a.frames[0];
          for (const [f, d] of a.seq) { if (ms < d) { frame = a.frames[f]; break; } ms -= d; }
        }
        let hop = 0;
        if (greeting && !walking) {
          const phase = (t - T_GREET) * 6.5 - a.order * 0.55;
          hop = Math.max(0, Math.sin(phase)) * 22;
        }
        const ox = Math.round(x - 16 * S);
        const oy = Math.round(a.y - 31 * S - hop);
        // 그림자
        c.fillStyle = 'rgba(43,35,51,0.18)';
        c.fillRect(Math.round(x - 30), Math.round(a.y - 2), 60, 8);
        Render.drawGrid(c, frame, S, ox, oy, walking);

        if (!walking) {
          label(c, a.cat.name, Math.round(x), Math.round(a.y + 26), 18, INK);
          if (a.isMe) heart(c, Math.round(x - 10), oy - 6, 3, '#f0607a');
          if (greeting) {
            const k = ((t - T_GREET) * 0.9 + a.order * 0.37) % 1;
            if (k < 0.8) {
              c.globalAlpha = 1 - k / 0.8;
              heart(c, Math.round(x - 8 + Math.sin(a.order * 3 + k * 6) * 10), oy - 4 - Math.round(k * 50), 2, '#f0607a');
              c.globalAlpha = 1;
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
      draw(cx, 9.2);
      c.toBlob(cb, 'image/png');
    }

    return {
      replay, record, snapshot,
      duration: DUR,
      stop() {
        cancelAnimationFrame(raf);
        if (recorder && recorder.state === 'recording') { try { recorder.stop(); } catch (e) { /* 무시 */ } }
      },
    };
  }

  root.Showcase = { mount, DUR };
})(typeof window !== 'undefined' ? window : globalThis);
