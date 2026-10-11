// 화면 흐름: 인트로 → 설문 → 별명 → 결과 → 사랑방
(function () {
  const $ = (id) => document.getElementById(id);
  const screen = $('screen');
  const bubble = $('bubble');

  // 집사 고양이: 턱시도 뚱냥이 + 나비넥타이 (전용 스프라이트)
  const BUTLER = { style: 'butler', energy: 1, seed: 7, chubby: true };
  Render.animate($('butler'), BUTLER);

  const KEY_ME = 'cat-ddong.me';
  const KEY_MET = 'cat-ddong.met';
  const KEY_SNACK = 'cat-ddong.snack';
  const SNACK_MS = 30 * 60 * 1000;   // 간식 효과 시간 (손님 교체 주기와 같다)
  const SNACK_MAX = 10;
  const SNACK_CAP_MS = 2 * 60 * 60 * 1000;   // 연장해도 남은 시간은 최대 2시간
  const KEY_LOG = 'cat-ddong.log';   // 손님별 방문 기록 {id: {n, first, last, prev, slot}}
  const SLOT_MS = 30 * 60 * 1000;
  const BACKUP_PREFIX = 'CATDDONG1:';
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경이면 무시 */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* 무시 */ }
    },
  };

  let picks = [];
  let cleanup = null; // 화면을 벗어날 때 정리할 것(애니메이션, 방)

  function el(tag, props, children) {
    const n = document.createElement(tag);
    Object.assign(n, props || {});
    (children || []).forEach((c) => n.append(c));
    return n;
  }
  function say(text) { bubble.textContent = text; }
  function show(...nodes) {
    if (cleanup) { cleanup(); cleanup = null; }
    screen.replaceChildren(...nodes);
  }

  function intro() {
    say('어서 와냥. 여기는 고양이 사랑방이야. 몇 가지만 물어보면 너를 닮은 고양이가 찾아올 거야.');
    picks = [];
    show(el('button', { className: 'btn', textContent: '시작하기', onclick: () => ask(0) }));
  }

  function ask(i) {
    const q = QUESTIONS[i];
    say(q.text);
    const dots = el('div', { className: 'dots' },
      QUESTIONS.map((_, k) => el('span', { className: 'dot' + (k <= i ? ' on' : '') })));
    const opts = q.options.map((o) =>
      el('button', {
        className: 'btn opt',
        textContent: o.label,
        onclick: () => { picks[i] = o.value; i + 1 < QUESTIONS.length ? ask(i + 1) : nickname(); },
      }));
    show(dots, ...opts);
  }

  function nickname() {
    say('마지막이야. 네 이름이나 별명을 알려줘. 고양이 옆에 붙여 줄게. 비워둬도 돼.');
    const input = el('input', { type: 'text', maxLength: 12, placeholder: '이름 / 별명 (선택)', className: 'input' });
    const go = () => summon(input.value);
    input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
    show(input, el('button', { className: 'btn', textContent: '고양이 부르기', onclick: go }));
    input.focus();
  }

  function summon(nick) {
    say('고양이를 부르는 중…');
    show(el('div', { className: 'loading', textContent: '🐾 🐾 🐾' }));
    setTimeout(() => {
      const cat = Cat.buildCat(QUESTIONS, picks, nick);
      store.set(KEY_ME, cat);
      result(cat);
    }, 1000);
  }

  function result(cat) {
    say(cat.owner ? `${cat.owner}, 새 친구가 왔어냥!` : '새 친구가 왔어냥!');
    const canvas = el('canvas', { width: Render.N, height: Render.N, className: 'cat' });

    const tags = el('div', { className: 'tags' }, [
      el('span', { className: 'tag', textContent: Cat.FUR_LABEL[cat.fur] }),
      el('span', { className: 'tag', textContent: Cat.ACC_LABEL[cat.accessory] }),
    ]);
    const reasons = el('ul', { className: 'reasons' },
      Cat.reasonsOf(cat).map((t) => el('li', { textContent: t })));

    const enter = el('button', { className: 'btn', textContent: '사랑방 입장 →', onclick: () => room(cat) });
    const save = el('button', {
      className: 'btn ghost', textContent: 'PNG로 저장',
      onclick: () => Render.toPngBlob(cat, (blob) => {
        const a = el('a', { href: URL.createObjectURL(blob), download: cat.name + '.png' });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }),
    });
    const again = el('button', { className: 'btn ghost', textContent: '다시 하기', onclick: intro });

    const card = el('div', { className: 'card' }, [
      canvas,
      el('h2', { textContent: cat.name }),
      el('p', { className: 'title', textContent: cat.title }),
      el('p', { className: 'owner', textContent: cat.owner ? `${cat.owner}의 고양이` : '' }),
      tags,
      reasons,
    ]);
    show(card, enter, el('div', { className: 'row' }, [save, again]));
    cleanup = Render.animate(canvas, cat);
  }

  // ---- 백업: 도감, 방문 기록, 내 고양이를 문자열 하나로 ----
  function encodeBackup() {
    const data = {
      v: 1,
      me: store.get(KEY_ME, null),
      met: store.get(KEY_MET, []),
      log: store.get(KEY_LOG, {}),
      snack: store.get(KEY_SNACK, {}),
    };
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    return BACKUP_PREFIX + btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
  }

  // 코드는 남이 만든 것일 수 있으므로 모든 값을 검증해서 새 객체로 만든다.
  function decodeBackup(text) {
    try {
      const t = String(text).trim();
      if (!t.startsWith(BACKUP_PREFIX)) return null;
      const bin = atob(t.slice(BACKUP_PREFIX.length));
      const raw = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
      if (!raw || raw.v !== 1) return null;
      const me = Cat.normalizeCat(raw.me);
      if (!me) return null;
      const validId = (k) => Number.isInteger(k) &&
        ((k >= 0 && k < Cat.POOL_SIZE) || (k >= Cat.LIMITED_BASE && k < Cat.LIMITED_BASE + Cat.LIMITED_COUNT));
      const num = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);
      const met = Array.isArray(raw.met) ? [...new Set(raw.met.filter(validId))] : [];
      const log = {};
      Object.keys(raw.log || {}).forEach((k) => {
        const id = Number(k), e = raw.log[k];
        if (validId(id) && e && typeof e === 'object') {
          log[id] = {
            n: Math.min(9999, Math.floor(num(e.n))),
            first: num(e.first), last: num(e.last), prev: num(e.prev),
            slot: Number.isInteger(e.slot) ? e.slot : -1,
          };
        }
      });
      const s = raw.snack && typeof raw.snack === 'object' ? raw.snack : {};
      const snack = {
        count: Math.min(SNACK_MAX, Math.floor(num(s.count))),
        daily: typeof s.daily === 'string' ? s.daily.slice(0, 12) : '',
        until: num(s.until),
      };
      return { me, met, log, snack };
    } catch (e) {
      return null;
    }
  }

  function ago(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return '방금 전';
    if (s < 3600) return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    return `${Math.floor(s / 86400)}일 전`;
  }

  function room(me) {
    const met = new Set(store.get(KEY_MET, []));
    const log = store.get(KEY_LOG, {});
    const slotNow = () => Math.floor(Date.now() / SLOT_MS);

    // 손님이 이번 30분 슬롯에 처음 보이면 방문 1회로 센다.
    function recordVisits(ids) {
      const slotId = slotNow();
      let changed = false;
      ids.forEach((id) => {
        const e = log[id] || (log[id] = { n: 0, first: Date.now(), last: 0, prev: 0, slot: -1 });
        if (e.slot !== slotId) {
          e.prev = e.last; e.last = Date.now(); e.n += 1; e.slot = slotId;
          changed = true;
        }
      });
      if (changed) store.set(KEY_LOG, log);
      return changed;
    }
    const canvas = el('canvas', { className: 'room' });
    const nowSeason = Cat.seasonOf(new Date());

    // 간식: 하루 첫 접속에 3개, 새 고양이를 만날 때마다 1개
    const snack = Object.assign({ count: 0, daily: '', until: 0 }, store.get(KEY_SNACK, {}));
    const dayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; })();
    let gotDaily = false;
    if (snack.daily !== dayKey) {
      snack.daily = dayKey;
      snack.count = Math.min(SNACK_MAX, snack.count + 3);
      gotDaily = true;
    }
    const saveSnack = () => store.set(KEY_SNACK, snack);
    saveSnack();
    const snackOn = () => Date.now() < snack.until;
    const visitorIds = () => Cat.visitorsFor(Date.now(), 4, nowSeason, snackOn());
    const visitors = visitorIds();
    recordVisits(visitors);
    let visitorKey = `${slotNow()}:${visitors.join(',')}`;
    const countMet = () => {
      const ids = [...met];
      return {
        normal: ids.filter((k) => k < Cat.LIMITED_BASE).length,
        limited: ids.filter((k) => k >= Cat.LIMITED_BASE).length,
      };
    };
    const handle = Room.mount(canvas, {
      me,
      visitors,
      snackOn,
      isCollected: (k) => met.has(k),
      onReact(kind, a, b) {
        const x = a.cat.name, y = b.cat.name;
        const lines = {
          heart: `${x} ♥ ${y}, 사이가 좋아 보여!`,
          annoyed: `${x}: …혼자 있고 싶대.`,
          note: `${x}, ${y} 둘 다 신났어!`,
          zzz: `${x}: 꾸벅꾸벅…`,
          dots: `${x} → ${y}: 가만히 쳐다봐…`,
          eat: `${x}: 냠냠, 간식 맛있다!`,
          lookdown: `${x}(${a.perch ? a.perch.label : '높은 곳'}) → ${y}: 내려다봐…`,
        };
        say(lines[kind]);
      },
      onMove(actor, perch) {
        const n = actor.cat.name;
        say(perch ? `${n}: ${perch.label} 위에서 내려다보는 중!` : `${n}: 여기도 좋은데?`);
      },
      onPick(actor) {
        if (actor.isMe) {
          say(`${me.owner ? me.owner + '의 ' : '내 '}고양이 ${me.name}! ${me.title}`);
          return;
        }
        const c = actor.cat;
        if (met.has(actor.poolIndex)) {
          const e = log[actor.poolIndex];
          const prevText = e && e.prev ? ` 지난번은 ${ago(e.prev)}이었어.` : '';
          say(`${c.name}: ${c.title}. ${e ? e.n : 1}번째 방문이야!${prevText}`);
        } else {
          met.add(actor.poolIndex);
          store.set(KEY_MET, [...met]);
          snack.count = Math.min(SNACK_MAX, snack.count + 1);   // 새 친구를 만나면 간식 +1
          saveSnack();
          const n = countMet();
          say(c.limited
            ? `✨ ${Cat.SEASON_NAME[c.season]} 한정 손님 ${c.name}(${c.title})! 한정 도감 ${n.limited}/${Cat.LIMITED_COUNT} (간식 +1)`
            : `${c.name}(${c.title})를 처음 만났어! 도감 ${n.normal}/${Cat.POOL_SIZE} (간식 +1)`);
          renderBook();
          renderSnack();
        }
      },
    });

    const seasonRow = el('div', { className: 'seasons' },
      Room.SEASONS.map((s) => el('button', {
        className: 'chip' + (s === handle.season ? ' on' : ''),
        textContent: Room.SEASON_LABEL[s],
        onclick: (ev) => {
          handle.setSeason(s);
          seasonRow.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
          ev.currentTarget.classList.add('on');
        },
      })));

    const bookTitle = el('h3', { className: 'book-title' });
    const bookHint = el('p', { className: 'book-hint' });
    const grid = el('div', { className: 'book' });
    const limitedTitle = el('h3', { className: 'book-title' });
    const limitedHint = el('p', { className: 'book-hint' });
    const limitedGrid = el('div', { className: 'book' });

    function slot(id, hintText) {
      const cat = Cat.catById(id);
      const got = met.has(id);
      const c = el('canvas', { width: Render.N, height: Render.N });
      Render.drawGrid(c.getContext('2d'), Render.framesOf(cat)[0], 1, 0, 0, false, got ? null : '#d9c8a8');
      const e = log[id];
      const visits = got && e ? ` ×${e.n}` : '';
      const tip = got ? `${cat.name}${e ? ` · ${e.n}번 방문 · 마지막 ${ago(e.last)}` : ''}` : '???';
      return el('div', { className: 'slot' + (got ? ' got' : ''), title: tip }, [
        c,
        el('span', { textContent: got ? cat.name + visits : hintText }),
      ]);
    }

    function renderBook() {
      const n = countMet();
      bookTitle.textContent = `도감 ${n.normal} / ${Cat.POOL_SIZE}`;
      const total = Object.values(log).reduce((s, e) => s + e.n, 0);
      bookHint.textContent = `지금까지 손님이 ${total}번 다녀갔어요. (이름 옆 ×숫자는 방문 횟수)`;
      grid.replaceChildren(...Array.from({ length: Cat.POOL_SIZE }, (_, k) => slot(k, '?')));

      limitedTitle.textContent = `✨ 시즌 한정 ${n.limited} / ${Cat.LIMITED_COUNT}`;
      limitedHint.textContent = `지금은 ${Cat.SEASON_NAME[nowSeason]}이에요. 이 계절의 한정 손님이 가끔 놀러 와요. (머리 위에 ★)`;
      const ids = Array.from({ length: Cat.LIMITED_COUNT }, (_, i) => Cat.LIMITED_BASE + i);
      limitedGrid.replaceChildren(...ids.map((id) => slot(id, Cat.SEASON_NAME[Cat.catById(id).season])));
    }
    renderBook();

    // 간식 바: 밥그릇에 간식을 놓으면 30분 동안 손님이 늘어난다
    const snackInfo = el('span', { className: 'snack-info' });
    const snackBtn = el('button', { className: 'btn snack-btn', onclick: useSnack });
    const snackBar = el('div', { className: 'snack' }, [snackInfo, snackBtn]);

    function renderSnack() {
      const left = snack.until - Date.now();
      if (left > 0) {
        const h = Math.floor(left / 3600000);
        const m = Math.floor((left % 3600000) / 60000), s = Math.floor((left % 60000) / 1000);
        const pad = (n) => String(n).padStart(2, '0');
        const clock = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
        snackInfo.textContent = `🐟 ${snack.count}개 · 먹는 중 ${clock}`;
        const full = left + SNACK_MS > SNACK_CAP_MS;
        snackBtn.textContent = full ? '가득 놓여 있어요' : '간식 더 놓기 (+30분)';
        snackBtn.disabled = full || snack.count <= 0;
      } else {
        snackInfo.textContent = `🐟 간식 ${snack.count}개`;
        snackBtn.textContent = '간식 놓기';
        snackBtn.disabled = snack.count <= 0;
      }
    }

    function syncVisitors() {
      const ids = visitorIds();
      const key = `${slotNow()}:${ids.join(',')}`;
      if (key !== visitorKey) {
        visitorKey = key;
        handle.setVisitors(ids);
        if (recordVisits(ids)) renderBook();
      }
    }

    function useSnack() {
      if (snack.count <= 0) return;
      const left = Math.max(0, snack.until - Date.now());
      if (left + SNACK_MS > SNACK_CAP_MS) return;      // 이미 가득
      const extending = left > 0;
      snack.count -= 1;
      snack.until = Math.max(Date.now(), snack.until) + SNACK_MS;   // 남은 시간에 이어 붙인다
      saveSnack();
      syncVisitors();
      renderSnack();
      say(extending
        ? '간식을 더 놓았어! 30분 더 오래 머물러 줄 거야.'
        : '밥그릇에 간식을 놓았어! 손님이 더 올 거야. (한정 손님 확률도 올라가요)');
    }

    renderSnack();
    say(gotDaily
      ? `${me.owner ? me.owner + ', ' : ''}사랑방에 온 걸 환영해냥! 오늘의 간식 3개를 줬어. 밥그릇에 놓아봐.`
      : `${me.owner ? me.owner + ', ' : ''}사랑방에 온 걸 환영해냥! 놀러 온 고양이를 눌러서 만나봐.`);
    // 1초마다: 남은 시간 갱신 + 손님 교체/간식 종료 반영
    const timer = setInterval(() => { syncVisitors(); renderSnack(); }, 1000);

    const code = el('textarea', {
      className: 'code', rows: 3, spellcheck: false,
      placeholder: '다른 기기에서 만든 코드를 여기에 붙여넣고 "불러오기"를 누르세요',
    });
    const exportBtn = el('button', {
      className: 'btn ghost', textContent: '코드 만들기',
      onclick: () => {
        code.value = encodeBackup();
        code.select();
        const done = () => say('도감 코드를 복사했어! 다른 기기에서 붙여넣어 봐.');
        const manual = () => say('아래 코드를 직접 복사해 줘.');
        if (navigator.clipboard) navigator.clipboard.writeText(code.value).then(done, manual); else manual();
      },
    });
    const importBtn = el('button', {
      className: 'btn ghost', textContent: '불러오기',
      onclick: () => {
        const data = decodeBackup(code.value);
        if (!data) { say('코드가 올바르지 않아. 처음부터 끝까지 그대로 붙여넣었는지 확인해 줘.'); return; }
        if (!confirm('이 기기의 내 고양이와 도감이 코드의 내용으로 바뀌어요. 계속할까요?')) return;
        store.set(KEY_ME, data.me);
        store.set(KEY_MET, data.met);
        store.set(KEY_LOG, data.log);
        store.set(KEY_SNACK, data.snack);
        location.reload();
      },
    });
    const backup = el('details', { className: 'card backup' }, [
      el('summary', { textContent: '백업 / 다른 기기로 옮기기' }),
      el('p', { className: 'book-hint', textContent: '브라우저를 바꾸거나 사이트 데이터를 지우면 도감이 사라져요. 코드로 저장해 두세요.' }),
      code,
      el('div', { className: 'row' }, [exportBtn, importBtn]),
    ]);

    // 자랑하기: 도감 고양이들이 줄지어 들어와 인사하는 영상
    function openShowcase() {
      const ids = [...met];
      // 한정 손님 먼저, 그다음 방문 많은 순
      ids.sort((a, b) =>
        (b >= Cat.LIMITED_BASE) - (a >= Cat.LIMITED_BASE) ||
        ((log[b] && log[b].n) || 0) - ((log[a] && log[a].n) || 0) || a - b);
      const n = countMet();
      const canvas = el('canvas', { className: 'stage' });
      const note = el('p', { className: 'stage-note' });
      say(!ids.length
        ? '아직 도감이 비어 있어. 사랑방에서 손님을 먼저 만나 보자!'
        : snackOn()
          ? '간식 먹는 장면도 같이 들어가! 영상으로 저장해서 자랑해 봐.'
          : '도감 고양이들이 인사하러 모였어! 영상으로 저장해서 자랑해 봐. (간식을 놓으면 냠냠 장면이 들어가요)');

      const stage = Showcase.mount(canvas, {
        me,
        cats: ids.map(Cat.catById),
        title: me.owner || me.name,
        stats: { met: n.normal, total: Cat.POOL_SIZE, limited: n.limited, limitedTotal: Cat.LIMITED_COUNT },
        season: nowSeason,
        snack: snackOn(),              // 간식이 놓여 있으면 간식 먹는 장면이 들어간다
        url: 'elain2.github.io/cat-ddong',
      });

      const download = (blob, name) => {
        const a = el('a', { href: URL.createObjectURL(blob), download: name });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      const recBtn = el('button', { className: 'btn' });
      recBtn.textContent = '🎬 영상으로 저장';
      recBtn.onclick = () => {
        recBtn.disabled = true;
        note.textContent = `녹화 중이에요… (${stage.duration}초) 이 탭을 켜 둔 채로 기다려 주세요.`;
        stage.record(
          (blob, ext) => {
            download(blob, `${me.name}-고양이사랑방.${ext}`);
            note.textContent = ext === 'webm'
              ? '저장했어요! (webm 형식이에요. 인스타 등에는 mp4 변환이 필요할 수 있어요.)'
              : '저장했어요!';
            recBtn.disabled = false;
          },
          (msg) => { note.textContent = msg; recBtn.disabled = false; },
          (p) => { note.textContent = `녹화 중이에요… ${Math.round(p * 100)}%  (탭을 켜 둔 채로 기다려 주세요)`; },
        );
      };
      const photoBtn = el('button', {
        className: 'btn ghost', textContent: '🖼 사진으로 저장',
        onclick: () => stage.snapshot((blob) => { download(blob, `${me.name}-고양이사랑방.png`); note.textContent = '사진을 저장했어요!'; }),
      });
      const replayBtn = el('button', { className: 'btn ghost', textContent: '↻ 처음부터', onclick: () => stage.replay() });
      const back = el('button', { className: 'btn ghost', textContent: '← 사랑방으로', onclick: () => room(me) });

      show(canvas, note, el('div', { className: 'row' }, [recBtn, photoBtn]),
        el('div', { className: 'row' }, [replayBtn, back]));
      cleanup = () => stage.stop();
    }

    const brag = el('button', { className: 'btn', textContent: '🎬 자랑하기', onclick: openShowcase });
    const mine = el('button', { className: 'btn ghost', textContent: '내 고양이 보기', onclick: () => result(me) });
    const again = el('button', {
      className: 'btn ghost', textContent: '다시 하기',
      onclick: () => { store.remove(KEY_ME); intro(); },
    });
    const rename = el('button', {
      className: 'btn ghost', textContent: '내 이름 바꾸기',
      onclick: () => {
        const v = prompt('이름이나 별명을 알려줘 (12자까지)', me.owner || '');
        if (v === null) return;                       // 취소
        me.owner = Cat.cleanOwner(v);
        store.set(KEY_ME, me);
        say(me.owner ? `${me.owner}, 이름을 기억해 둘게!` : '이름을 지웠어.');
      },
    });

    show(canvas, snackBar, brag, seasonRow, el('div', { className: 'card' }, [bookTitle, bookHint, grid]),
      el('div', { className: 'card' }, [limitedTitle, limitedHint, limitedGrid]),
      backup,
      el('div', { className: 'row' }, [mine, rename, again]));
    cleanup = () => { handle.stop(); clearInterval(timer); };
  }

  const saved = store.get(KEY_ME, null);
  if (saved && saved.accessory === 'headphones') saved.accessory = 'tie'; // 이름 변경 마이그레이션
  if (saved) room(saved); else intro();
})();
