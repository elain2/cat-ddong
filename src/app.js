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
    say('사랑방에 온 걸 환영해냥! 놀러 온 고양이를 눌러서 만나봐.');

    const canvas = el('canvas', { className: 'room' });
    const visitors = Cat.visitorsFor(Date.now(), 4);
    const handle = Room.mount(canvas, {
      me,
      visitors,
      isCollected: (k) => met.has(k),
      onPick(actor) {
        if (actor.isMe) {
          say(`내 고양이 ${me.name}! ${me.title}`);
          return;
        }
        const c = actor.cat;
        if (met.has(actor.poolIndex)) {
          say(`${c.name}가 또 놀러 왔어. ${c.title}`);
        } else {
          met.add(actor.poolIndex);
          store.set(KEY_MET, [...met]);
          say(`${c.name}(${c.title})를 처음 만났어! 도감 ${met.size}/${Cat.POOL_SIZE}`);
          renderBook();
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
    function renderBook() {
      bookTitle.textContent = `도감 ${met.size} / ${Cat.POOL_SIZE}`;
      const nodes = [];
      for (let k = 0; k < Cat.POOL_SIZE; k++) {
        const c = el('canvas', { width: Render.N, height: Render.N });
        const cat = Cat.poolCat(k);
        const got = met.has(k);
        Render.drawGrid(c.getContext('2d'), Render.framesOf(cat)[0], 1, 0, 0, false, got ? null : '#d9c8a8');
        nodes.push(el('div', { className: 'slot' + (got ? ' got' : ''), title: got ? cat.name : '???' }, [
          c,
          el('span', { textContent: got ? cat.name : '?' }),
        ]));
      }
      grid.replaceChildren(...nodes);
    }
    renderBook();

    const mine = el('button', { className: 'btn ghost', textContent: '내 고양이 보기', onclick: () => result(me) });
    const again = el('button', {
      className: 'btn ghost', textContent: '다시 하기',
      onclick: () => { store.remove(KEY_ME); intro(); },
    });

    show(canvas, seasonRow, el('div', { className: 'card' }, [bookTitle, grid]),
      el('div', { className: 'row' }, [mine, again]));
    cleanup = () => handle.stop();
  }

  const saved = store.get(KEY_ME, null);
  if (saved && saved.accessory === 'headphones') saved.accessory = 'tie'; // 이름 변경 마이그레이션
  if (saved) room(saved); else intro();
})();
