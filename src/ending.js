// 엔딩: 도감(일반 60 + 한정 12)을 모두 모으면 열리는 졸업앨범과 "내가 만드는 손님 고양이".
// 화면 조립은 app.js가 넘겨 주는 도구(d)를 쓰고, 이 파일은 저장 값 검증/앨범 그림/디자인 화면만 맡는다.
(function (root) {
  const TOTAL = () => Cat.POOL_SIZE + Cat.LIMITED_COUNT;
  const MAX_BEST = 3;
  const FRAMES = [
    { color: '#f2a64e', label: '호박색' }, { color: '#f7a8b8', label: '분홍' }, { color: '#7fd0ff', label: '하늘' },
    { color: '#8fd694', label: '연두' }, { color: '#b9a0f0', label: '보라' }, { color: '#f6c945', label: '금색' },
  ];
  const LABELS = {
    pattern: { plain: '무늬 없음', tabby: '줄무늬', spots: '점박이', point: '포인트' },
    ear: { pointy: '뾰족', round: '둥근', fold: '접힌', big: '큰 귀' },
    tail: { normal: '보통', bob: '몽땅', long: '긴 꼬리', fluffy: '풍성' },
    build: { slim: '날씬', normal: '보통', chubby: '통통' },
    coat: { smooth: '매끈', tuft: '삐죽', fluffy: '폭신' },
    energy: ['느긋', '보통', '활발'],
    social: ['수줍', '보통', '사교적'],
  };

  const validId = (k) => Number.isInteger(k) &&
    ((k >= 0 && k < Cat.POOL_SIZE) || (k >= Cat.LIMITED_BASE && k < Cat.LIMITED_BASE + Cat.LIMITED_COUNT));
  const allIds = () => Array.from({ length: Cat.POOL_SIZE }, (_, k) => k)
    .concat(Array.from({ length: Cat.LIMITED_COUNT }, (_, i) => Cat.LIMITED_BASE + i));
  const text = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max);

  // 저장/백업에서 읽은 값을 검증해서 새 객체로 돌려준다. 값이 없으면 null.
  function clean(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const best = Array.isArray(raw.best) ? [...new Set(raw.best.filter(validId))].slice(0, MAX_BEST) : [];
    const frame = FRAMES.some((f) => f.color === raw.frame) ? raw.frame : FRAMES[0].color;
    return {
      room: text(raw.room, 12), msg: text(raw.msg, 60), best, frame,
      at: Number.isFinite(raw.at) && raw.at > 0 ? raw.at : 0,
    };
  }

  // 단짝을 정하지 않았다면 방문이 많은 순으로 3마리.
  function bestOf(ending, met, log) {
    const picked = (ending && ending.best || []).filter((k) => met.has(k));
    if (picked.length) return picked;
    return [...met].sort((a, b) => ((log[b] && log[b].n) || 0) - ((log[a] && log[a].n) || 0) || a - b).slice(0, MAX_BEST);
  }

  // 방 안 액자에 담길 모습(테두리 색 + 단짝 털색)
  function frameStyleOf(ending, met, log) {
    const e = ending || clean({});
    return {
      border: e.frame || FRAMES[0].color,
      furs: bestOf(e, met, log).map((k) => Room.FUR_HEX[Cat.catById(k).fur] || '#d9c8a8'),
    };
  }

  function dateText(ts) {
    const d = new Date(ts || Date.now());
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  }

  // 졸업앨범 PNG: 방 이름, 나, 단짝 3마리, 한마디, 도감 전체
  async function albumBlob(d, ending) {
    if (document.fonts && document.fonts.load) await document.fonts.load('28px Galmuri11');
    const COLS = 12, CELL = 48, PAD = 32;
    const W = COLS * CELL + PAD * 2;
    const ids = allIds();
    const gridRows = Math.ceil(ids.length / COLS);
    const bestIds = bestOf(ending, d.met, d.log);
    const custom = Cat.customCat();
    const FONT = (px) => `${px}px Galmuri11, "Apple SD Gothic Neo", sans-serif`;
    const INK = '#2b2333';

    // 한마디 줄바꿈 (글자 수 기준, 미리 높이를 알아야 한다)
    const lines = [];
    const msg = ending.msg || '모두 만나서 반가웠어!';
    for (let i = 0; i < msg.length; i += 22) lines.push(msg.slice(i, i + 22));
    const HEAD = 110, MINE = 190, BESTH = 150, MSGH = 44 + lines.length * 26, GRIDH = 40 + gridRows * CELL, FOOT = 60;
    const H = HEAD + MINE + BESTH + MSGH + GRIDH + FOOT + (custom ? 70 : 0);

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#fff3e0'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#f0dcc0';
    for (let yy = 10; yy < H; yy += 16) for (let xx = 10; xx < W; xx += 16) x.fillRect(xx, yy, 2, 2);
    x.strokeStyle = INK; x.lineWidth = 6; x.strokeRect(3, 3, W - 6, H - 6);
    x.strokeStyle = ending.frame; x.lineWidth = 10; x.strokeRect(12, 12, W - 24, H - 24);

    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = INK; x.font = FONT(30);
    x.fillText(`${ending.room || d.me.name + '의 사랑방'} 졸업앨범`, W / 2, 68);
    x.fillStyle = '#b8662a'; x.font = FONT(16);
    x.fillText(`도감 ${TOTAL()}/${TOTAL()} 완주 · ${dateText(ending.at)}`, W / 2, 96);

    // 나
    let y = HEAD;
    Render.drawGrid(x, Render.framesOf(d.meCat)[0], 4, W / 2 - 64, y + 6, false);
    x.fillStyle = INK; x.font = FONT(22);
    x.fillText(d.me.name, W / 2, y + 168);
    y += MINE;

    // 단짝
    x.fillStyle = INK; x.font = FONT(16); x.textAlign = 'left';
    x.fillText('단짝 고양이', PAD, y + 6);
    const slotW = (W - PAD * 2) / MAX_BEST;
    bestIds.forEach((k, i) => {
      const cx = PAD + i * slotW + slotW / 2;
      Render.drawGrid(x, Render.framesOf(Cat.catById(k))[0], 3, cx - 48, y + 14, false);
      x.textAlign = 'center'; x.fillStyle = INK; x.font = FONT(14);
      x.fillText(Cat.catById(k).name, cx, y + 128);
    });
    y += BESTH;

    // 한마디
    x.fillStyle = '#fffaf0'; x.fillRect(PAD, y, W - PAD * 2, MSGH - 12);
    x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(PAD, y, W - PAD * 2, MSGH - 12);
    x.fillStyle = INK; x.font = FONT(16); x.textAlign = 'center';
    lines.forEach((ln, i) => x.fillText(ln, W / 2, y + 30 + i * 26));
    y += MSGH;

    // 도감 전체 (모두 모았으니 전부 채워져 있다)
    x.fillStyle = INK; x.font = FONT(16); x.textAlign = 'left';
    x.fillText('함께한 고양이들', PAD, y + 6);
    ids.forEach((k, i) => {
      const cx = PAD + (i % COLS) * CELL, cy = y + 16 + Math.floor(i / COLS) * CELL;
      Render.drawGrid(x, Render.framesOf(Cat.catById(k))[0], 1, cx + 8, cy + 4, false);
    });
    y += GRIDH;

    if (custom) {
      Render.drawGrid(x, Render.framesOf(custom)[0], 2, PAD, y - 4, false);
      x.fillStyle = INK; x.font = FONT(16); x.textAlign = 'left';
      x.fillText(`새 손님 ${custom.name}`, PAD + 76, y + 26);
      x.fillStyle = '#a89878'; x.font = FONT(13);
      x.fillText('내가 만들어 사랑방에 초대한 고양이', PAD + 76, y + 48);
    }

    x.textAlign = 'center'; x.fillStyle = INK; x.font = FONT(14);
    x.fillText('고양이 사랑방 · elain2.github.io/cat-ddong', W / 2, H - 28);
    return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
  }

  // 사계절 영상: 모인 고양이들 뒤로 봄→여름→가을→겨울 배경이 4초씩 바뀐다. 방 화면을 큰 캔버스에 옮겨 그리며 녹화한다.
  const SEASON_SEC = 4;
  function recordSeasons(canvas, handle, ending, roomName, done, fail, onProgress) {
    if (!HTMLCanvasElement.prototype.captureStream || !root.MediaRecorder) {
      fail('이 브라우저는 영상 저장을 지원하지 않아요. 앨범 PNG로 저장해 보세요.'); return;
    }
    const W = 960, H = Math.round(960 * canvas.height / canvas.width);   // 방 화면의 4배
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const x = off.getContext('2d');
    x.imageSmoothingEnabled = false;
    const mimes = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mime = mimes.find((m) => root.MediaRecorder.isTypeSupported(m)) || '';
    let rec;
    try {
      rec = new MediaRecorder(off.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 5000000 } : undefined);
    } catch (e) { fail('영상 녹화를 시작하지 못했어요.'); return; }
    const chunks = [];
    rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
    const seasons = Cat.SEASONS, total = seasons.length * SEASON_SEC;
    const original = handle.season;
    const t0 = performance.now();
    let shown = '', timer = 0;
    rec.onstop = () => {
      clearInterval(timer);
      handle.setSeason(original);
      const type = rec.mimeType || mime || 'video/webm';
      done(new Blob(chunks, { type }), type.includes('mp4') ? 'mp4' : 'webm');
    };
    const FONT = (px) => `${px}px Galmuri11, "Apple SD Gothic Neo", sans-serif`;
    function frame() {
      const t = (performance.now() - t0) / 1000;
      if (t >= total) { if (rec.state === 'recording') rec.stop(); return; }
      const idx = Math.min(seasons.length - 1, Math.floor(t / SEASON_SEC));
      const season = seasons[idx];
      if (season !== shown) { shown = season; handle.setSeason(season); }
      x.drawImage(canvas, 0, 0, W, H);
      const into = t - idx * SEASON_SEC;
      if (idx > 0 && into < 0.4) { x.fillStyle = `rgba(255,255,255,${(1 - into / 0.4) * 0.8})`; x.fillRect(0, 0, W, H); }   // 계절이 바뀔 때 번쩍
      x.textAlign = 'left'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#fffaf0'; x.fillStyle = '#2b2333';
      x.font = FONT(36); x.strokeText(roomName, 28, 56); x.fillText(roomName, 28, 56);
      x.font = FONT(28); x.fillStyle = '#b8662a';
      const label = `${Cat.SEASON_NAME[season]} · 도감 ${TOTAL()}/${TOTAL()}`;
      x.strokeText(label, 28, 96); x.fillText(label, 28, 96);
      if (onProgress) onProgress(t / total);
    }
    rec.start();
    timer = setInterval(frame, 33);   // 탭이 가려져도 시간은 흘러서 녹화가 끝나도록 rAF 대신 타이머
  }

  // ---- 졸업앨범 화면 ----
  // d: { el, say, show, setCleanup, store, KEY_ENDING, KEY_CUSTOM, me, meCat, met, log, deco, back, onChange }
  function open(d) {
    const { el, say } = d;
    let ending = clean(d.store.get(d.KEY_ENDING, null)) || clean({});
    if (!ending.at) ending.at = Date.now();
    if (!ending.room) ending.room = d.me.name + '의 사랑방';
    const save = () => { d.store.set(d.KEY_ENDING, ending); Room.setFrameStyle(frameStyleOf(ending, d.met, d.log)); d.onChange(); };
    save();

    say(ending.msg ? '졸업앨범을 다시 펼쳤어. 고쳐서 저장할 수 있어!' : '축하해! 72마리를 전부 만났어. 졸업앨범을 만들어 보자.');

    // 엔딩 장면: 도감 고양이 전원이 사랑방에 모인다
    const canvas = el('canvas', { className: 'room' });
    const handle = Room.mount(canvas, {
      deco: d.deco, items: [], me: d.meCat, visitors: allIds(),
      snackOn: () => false, giftOf: () => null, isCollected: () => true,
    });

    const title = el('input', { type: 'text', maxLength: 12, className: 'input', value: ending.room, placeholder: '사랑방 이름' });
    const msg = el('textarea', { className: 'input', rows: 2, maxLength: 60, value: ending.msg, placeholder: '고양이들에게 한마디 (60자까지)' });
    [title, msg].forEach((n) => { n.style.width = '100%'; n.style.marginBottom = '8px'; });
    title.oninput = () => { ending.room = text(title.value, 12); save(); };
    msg.oninput = () => { ending.msg = text(msg.value, 60); save(); };

    const frameRow = el('div', { className: 'irow' }, [el('b', { textContent: '테두리' })]);
    const bestRow = el('div', { className: 'book' });
    const bestHint = el('p', { className: 'book-hint' });
    function renderFrames() {
      frameRow.replaceChildren(el('b', { textContent: '테두리' }), ...FRAMES.map((f) => {
        const b = el('button', { className: 'chip' + (ending.frame === f.color ? ' on' : ''), textContent: f.label });
        b.style.borderColor = f.color;
        b.onclick = () => { ending.frame = f.color; save(); renderFrames(); };
        return b;
      }));
    }
    function renderBest() {
      const chosen = ending.best;
      bestHint.textContent = `단짝 ${chosen.length}/${MAX_BEST} — 눌러서 고르고 다시 눌러 빼요. 앨범과 방 안 액자에 담겨요.`;
      bestRow.replaceChildren(...allIds().map((k) => {
        const cat = Cat.catById(k);
        const c = el('canvas', { width: Render.N, height: Render.N });
        Render.drawGrid(c.getContext('2d'), Render.framesOf(cat)[0], 1, 0, 0, false);
        const on = chosen.includes(k);
        const node = el('div', { className: 'slot got gift-slot' + (on ? ' worn' : ''), title: cat.name },
          [c, el('span', { textContent: cat.name })]);
        node.onclick = () => {
          const cur = ending.best;
          if (cur.includes(k)) ending.best = cur.filter((v) => v !== k);
          else if (cur.length < MAX_BEST) ending.best = cur.concat(k);
          else { say(`단짝은 ${MAX_BEST}마리까지야. 하나를 먼저 빼 줘.`); return; }
          save(); renderBest();
        };
        return node;
      }));
    }
    renderFrames(); renderBest();

    const note = el('p', { className: 'stage-note' });
    const albumBtn = el('button', {
      className: 'btn', textContent: '🎓 졸업앨범 PNG로 저장',
      onclick: async () => {
        albumBtn.disabled = true;
        try {
          const blob = await albumBlob(d, ending);
          const a = el('a', { href: URL.createObjectURL(blob), download: `${d.me.name}-졸업앨범.png` });
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          note.textContent = '졸업앨범을 저장했어요! 자랑해 봐요.';
        } finally { albumBtn.disabled = false; }
      },
    });
    const seasonBtn = el('button', {
      className: 'btn', textContent: '🎬 사계절 영상으로 저장',
      onclick: () => {
        seasonBtn.disabled = albumBtn.disabled = true;
        const finish = () => { seasonBtn.disabled = albumBtn.disabled = false; };
        recordSeasons(canvas, handle, ending, ending.room, (blob, ext) => {
          const a = el('a', { href: URL.createObjectURL(blob), download: `${d.me.name}-사계절.${ext}` });
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          note.textContent = ext === 'webm' ? '저장했어요! (webm 형식이에요. 인스타 등에는 mp4 변환이 필요할 수 있어요.)' : '저장했어요!';
          finish();
        }, (msg) => { note.textContent = msg; finish(); },
        (p) => { note.textContent = `녹화 중이에요… ${Math.round(p * 100)}%  (탭을 켜 둔 채로 기다려 주세요)`; });
      },
    });
    const custom = Cat.hasCustom();
    const designBtn = el('button', {
      className: 'btn', textContent: custom ? '🐱 내가 만든 손님 고치기' : '🐱 다음 고양이는 내가 만들기',
      onclick: () => design(d),
    });
    const card = el('div', { className: 'card' }, [
      el('h3', { className: 'book-title', textContent: '🎓 졸업앨범' }),
      title, msg, frameRow,
      el('h3', { className: 'book-title', textContent: '단짝 고르기' }), bestHint, bestRow,
    ]);
    card.style.textAlign = 'left';
    d.show(canvas, card, albumBtn, seasonBtn, note, designBtn,
      el('button', { className: 'btn ghost', textContent: '← 사랑방으로', onclick: d.back }));
    d.setCleanup(() => handle.stop());
  }

  // ---- 내가 만드는 손님 ----
  function design(d, initial) {
    const { el, say } = d;
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let spec = initial || Cat.cleanCustom(d.store.get(d.KEY_CUSTOM, null)) || {
      name: '', fur: rnd(Cat.CUSTOM_FURS), pattern: rnd(Cat.PATTERNS), ear: rnd(Cat.EARS),
      tail: rnd(Cat.TAILS), build: rnd(Cat.BUILDS), coat: rnd(Cat.COATS),
      energy: 1, social: 1, seed: (Math.random() * 4294967296) >>> 0,
    };
    say('완주 기념으로 새 손님을 만들어 줘. 만들면 사랑방에 계속 놀러 와!');

    const canvas = el('canvas', { width: Render.N, height: Render.N, className: 'cat' });
    let stopAnim = null;
    const preview = () => {
      if (stopAnim) stopAnim();
      const cat = Cat.customCat(Object.assign({}, spec, { name: spec.name || '이름 없음' }));
      stopAnim = Render.animate(canvas, cat);
    };
    const chips = (label, key, values, labelOf) => {
      const wrap = el('div', { className: 'irow' }, [el('b', { textContent: label })]);
      const draw = () => wrap.replaceChildren(el('b', { textContent: label }), ...values.map((v) => {
        const b = el('button', { className: 'chip' + (spec[key] === v ? ' on' : ''), textContent: labelOf(v) });
        b.onclick = () => { spec[key] = v; draw(); preview(); };
        return b;
      }));
      draw();
      return wrap;
    };
    const name = el('input', { type: 'text', maxLength: 12, className: 'input', value: spec.name, placeholder: '이름 (12자까지)' });
    name.oninput = () => { spec.name = Cat.cleanOwner(name.value); preview(); };

    const rows = [
      chips('털색', 'fur', Cat.CUSTOM_FURS, (v) => Cat.FUR_LABEL[v]),
      chips('무늬', 'pattern', Cat.PATTERNS, (v) => LABELS.pattern[v]),
      chips('귀', 'ear', Cat.EARS, (v) => LABELS.ear[v]),
      chips('꼬리', 'tail', Cat.TAILS, (v) => LABELS.tail[v]),
      chips('체형', 'build', Cat.BUILDS, (v) => LABELS.build[v]),
      chips('털 결', 'coat', Cat.COATS, (v) => LABELS.coat[v]),
      chips('기운', 'energy', [0, 1, 2], (v) => LABELS.energy[v]),
      chips('붙임성', 'social', [0, 1, 2], (v) => LABELS.social[v]),
    ];
    const invite = el('button', {
      className: 'btn', textContent: Cat.hasCustom() ? '이 모습으로 바꾸기' : '사랑방에 초대하기',
      onclick: () => {
        if (!Cat.cleanOwner(name.value)) { say('먼저 이름을 지어 줘!'); name.focus(); return; }
        spec.name = Cat.cleanOwner(name.value);
        const saved = Cat.setCustom(spec);
        d.store.set(d.KEY_CUSTOM, saved);
        d.onChange();
        d.back(`${saved.name}, 이제 사랑방에 계속 놀러 올 거야! 방에서 찾아서 눌러 봐.`);
      },
    });
    const clear = el('button', {
      className: 'btn ghost', textContent: '이 손님 돌려보내기', disabled: !Cat.hasCustom(),
      onclick: () => {
        if (!confirm('내가 만든 손님을 사랑방에서 돌려보낼까요? (다시 만들 수 있어요)')) return;
        Cat.setCustom(null);
        d.store.remove(d.KEY_CUSTOM);
        d.onChange();
        d.back('손님이 잠시 집으로 돌아갔어. 언제든 다시 만들 수 있어.');
      },
    });
    const dice = el('button', {
      className: 'btn ghost', textContent: '🎲 랜덤으로 섞기',
      onclick: () => {   // 칩 상태를 다시 그리려고 화면을 새로 만든다. 입력한 이름은 유지한다.
        design(d, Object.assign({}, spec, {
          name: Cat.cleanOwner(name.value), fur: rnd(Cat.CUSTOM_FURS), pattern: rnd(Cat.PATTERNS),
          ear: rnd(Cat.EARS), tail: rnd(Cat.TAILS), build: rnd(Cat.BUILDS), coat: rnd(Cat.COATS),
          energy: Math.floor(Math.random() * 3), social: Math.floor(Math.random() * 3),
          seed: (Math.random() * 4294967296) >>> 0,
        }));
      },
    });

    name.style.width = '100%';
    const card = el('div', { className: 'card' }, [canvas, name]);
    d.show(card, el('div', { className: 'card' }, rows), invite, dice, clear,
      el('button', { className: 'btn ghost', textContent: '← 졸업앨범으로', onclick: () => open(d) }));
    d.setCleanup(() => { if (stopAnim) stopAnim(); });
    preview();
  }

  root.Ending = { albumBlob, TOTAL, FRAMES, clean, frameStyleOf, bestOf, open, validId };
})(typeof window !== 'undefined' ? window : globalThis);
