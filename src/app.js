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
    say('마지막이야. 이름이나 별명을 알려줘. 비워둬도 돼.');
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
    say('새 친구가 왔어냥!');
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
      tags,
      reasons,
    ]);
    show(card, enter, el('div', { className: 'row' }, [save, again]));
    cleanup = Render.animate(canvas, cat);
  }

  function room(me) {
    const met = new Set(store.get(KEY_MET, []));
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
    let visitorKey = visitors.join(',');
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
        };
        say(lines[kind]);
      },
      onPick(actor) {
        if (actor.isMe) {
          say(`내 고양이 ${me.name}! ${me.title}`);
          return;
        }
        const c = actor.cat;
        if (met.has(actor.poolIndex)) {
          say(`${c.name}: ${c.title}. 또 놀러 왔구나!`);
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
    const grid = el('div', { className: 'book' });
    const limitedTitle = el('h3', { className: 'book-title' });
    const limitedHint = el('p', { className: 'book-hint' });
    const limitedGrid = el('div', { className: 'book' });

    function slot(id, hintText) {
      const cat = Cat.catById(id);
      const got = met.has(id);
      const c = el('canvas', { width: Render.N, height: Render.N });
      Render.drawGrid(c.getContext('2d'), Render.framesOf(cat)[0], 1, 0, 0, false, got ? null : '#d9c8a8');
      return el('div', { className: 'slot' + (got ? ' got' : ''), title: got ? cat.name : '???' }, [
        c,
        el('span', { textContent: got ? cat.name : hintText }),
      ]);
    }

    function renderBook() {
      const n = countMet();
      bookTitle.textContent = `도감 ${n.normal} / ${Cat.POOL_SIZE}`;
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
        const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        snackInfo.textContent = `🐟 간식이 놓여 있어요 · ${m}:${String(s).padStart(2, '0')}`;
        snackBtn.textContent = '간식 먹는 중';
        snackBtn.disabled = true;
      } else {
        snackInfo.textContent = `🐟 간식 ${snack.count}개`;
        snackBtn.textContent = '간식 놓기';
        snackBtn.disabled = snack.count <= 0;
      }
    }

    function syncVisitors() {
      const ids = visitorIds();
      const key = ids.join(',');
      if (key !== visitorKey) { visitorKey = key; handle.setVisitors(ids); }
    }

    function useSnack() {
      if (snackOn() || snack.count <= 0) return;
      snack.count -= 1;
      snack.until = Date.now() + SNACK_MS;
      saveSnack();
      syncVisitors();
      renderSnack();
      say('밥그릇에 간식을 놓았어! 손님이 더 올 거야. (한정 손님 확률도 올라가요)');
    }

    renderSnack();
    say(gotDaily
      ? '사랑방에 온 걸 환영해냥! 오늘의 간식 3개를 줬어. 밥그릇에 놓아봐.'
      : '사랑방에 온 걸 환영해냥! 놀러 온 고양이를 눌러서 만나봐.');
    // 1초마다: 남은 시간 갱신 + 손님 교체/간식 종료 반영
    const timer = setInterval(() => { syncVisitors(); renderSnack(); }, 1000);

    const mine = el('button', { className: 'btn ghost', textContent: '내 고양이 보기', onclick: () => result(me) });
    const again = el('button', {
      className: 'btn ghost', textContent: '다시 하기',
      onclick: () => { store.remove(KEY_ME); intro(); },
    });

    show(canvas, snackBar, seasonRow, el('div', { className: 'card' }, [bookTitle, grid]),
      el('div', { className: 'card' }, [limitedTitle, limitedHint, limitedGrid]),
      el('div', { className: 'row' }, [mine, again]));
    cleanup = () => { handle.stop(); clearInterval(timer); };
  }

  const saved = store.get(KEY_ME, null);
  if (saved && saved.accessory === 'headphones') saved.accessory = 'tie'; // 이름 변경 마이그레이션
  if (saved) room(saved); else intro();
})();
