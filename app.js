/* CoinFlip — логика анализа вопроса, рандом, интерфейс */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- Умная логика: категории по ключевым словам ---------- */
  // bias > 0 — подталкивает к «ДА», bias < 0 — к «НЕТ»
  const CATS = [
    {
      id: 'earn', bias: +1,
      keys: ['заработ', 'доход', 'прибыл', 'бонус', 'премия', 'инвестиц', 'скидк', 'акци', 'подработ'],
      yes: ['Деньги любят действие — шанс заработать лучше не упускать.', 'Потенциальная выгода перевешивает хлопоты.'],
      no: ['Быстрые деньги часто оказываются дорогими — проверь детали ещё раз.', 'Выгода пока слишком туманная, чтобы за ней гнаться.']
    },
    {
      id: 'spend', bias: -1,
      keys: ['потрат', 'купить', 'куплю', 'покуп', 'заказат', 'взять себе', 'шопинг', 'донат'],
      yes: ['Если это правда нужно и бюджет позволяет — бери.', 'Вещь, которой ты будешь пользоваться, — не трата, а вложение.'],
      no: ['Подожди пару дней: если желание не пройдёт — тогда покупай.', 'Деньги ещё пригодятся, а импульсивные покупки редко радуют долго.']
    },
    {
      id: 'health', bias: +1,
      keys: ['спорт', 'трениров', 'зарядк', 'бегать', 'пробеж', 'гулять', 'прогулк', 'погулять', 'вода', 'воду', 'овощ', 'врач', 'йог', 'зал'],
      yes: ['Движение и здоровье — решение, о котором не жалеют.', 'Тело скажет спасибо уже сегодня вечером.'],
      no: ['Организм просит передышки — не перегружай себя сегодня.', 'Лучше сделать это завтра, на свежую голову.']
    },
    {
      id: 'vice', bias: -1,
      keys: ['курить', 'сигар', 'вейп', 'алкогол', 'пиво', 'вино', 'виски', 'фастфуд', 'сладк', 'торт', 'чипс', 'бургер', 'пицц'],
      yes: ['Раз в жизни можно — только без фанатизма.', 'Иногда небольшая слабость — это нормально.'],
      no: ['Удовольствие на пять минут, а последствия надолго.', 'Будущий ты скажет спасибо, если откажешься.']
    },
    {
      id: 'social', bias: +1,
      keys: ['друг', 'подруг', 'позвать', 'позвонить', 'встретит', 'пригласит', 'написать', 'семь', 'родител', ' мам', 'бабушк', 'свидани', 'знаком'],
      yes: ['Живое общение всегда стоит усилий — человек наверняка обрадуется.', 'Первый шаг навстречу почти никогда не оказывается лишним.'],
      no: ['Сейчас не лучший момент — дай человеку и себе немного пространства.', 'Лучше подождать повода, чтобы разговор получился душевным.']
    },
    {
      id: 'leisure', bias: +1,
      keys: ['отдых', 'отпуск', 'путешеств', 'поехать', 'поездк', 'кино', 'фильм', 'сериал', 'игра', 'играть', 'концерт', 'праздник'],
      yes: ['Отдых — часть продуктивности. Ты это заслужил.', 'Новые впечатления лучше всего запоминаются.'],
      no: ['Сначала дела, потом удовольствие — так вкуснее.', 'Сейчас отвлекаться рановато, отдохнёшь с чистой совестью позже.']
    },
    {
      id: 'work', bias: +1,
      keys: ['работ', 'учить', 'выучить', 'курс', 'проект', 'задач', 'начать', 'попробовать', 'изуч', 'навык', 'резюме', 'собеседован'],
      yes: ['Начинать лучше сегодня: через месяц скажешь себе спасибо.', 'Маленький шаг сейчас лучше большого плана «когда-нибудь».'],
      no: ['Сначала расставь приоритеты — иначе распылишься.', 'Идея хорошая, но сейчас у неё конкуренты за твоё внимание.']
    },
    {
      id: 'risk', bias: -1,
      keys: ['рискн', 'кредит', 'долг', 'займ', 'ставк', 'казино', 'бросить', 'уволить', 'уволиться', 'поссор', 'ссор', 'ругать'],
      yes: ['Риск оправдан, если ты готов к худшему сценарию.', 'Иногда решительность — единственный выход.'],
      no: ['Слишком много неизвестных — рисковать вслепую не стоит.', 'Сначала запасной план, потом решительный шаг.']
    },
    {
      id: 'rest', bias: +1,
      keys: ['спать', 'поспать', 'отдохнуть', 'прилечь', 'выходной'],
      yes: ['Сон и отдых — самая недооценённая продуктивность.', 'Сделай паузу, мозг скажет спасибо.'],
      no: ['Ты ещё полон сил — используй их с толком.', 'Потерпи немного, отдых будет слаще.']
    },
    {
      id: 'late', bias: -1,
      keys: ['поздно', 'ночью', 'в полночь', 'на ночь', 'в три часа'],
      yes: ['Ночь иногда рождает лучшие идеи — но завтра выспись.', 'Если очень хочется — действуй, только недолго.'],
      no: ['Время уже не то — утро вечера мудренее.', 'Ночные решения обычно не переживают рассвет.']
    }
  ];

  const GENERIC = {
    yes: [
      'Ты уже склоняешься к «да» — иначе бы не спрашивал.',
      'Плюсы перевешивают, а жалеют чаще о несделанном.',
      'Шанс есть — используй его.',
      'Звучит разумно, особенно если не откладывать.'
    ],
    no: [
      'Если есть сомнения — это уже ответ: лучше подождать.',
      'Сейчас не лучший момент — вернись к вопросу позже.',
      'Выгода неочевидна, а усилий потребуется много.',
      'Лучше поберечь силы для более важного.'
    ]
  };

  const MULTI_ARGS = [
    'Интуиция чаще права, чем кажется.',
    'Этот вариант оставит меньше сожалений.',
    'Когда всё равно — выбирай то, что проще начать.',
    'Что-то подсказывает, что тебе этот вариант и самому нравится.'
  ];

  /* ---------- Разбор вопроса: «да/нет» или несколько вариантов ---------- */
  function parseQuestion(raw) {
    const q = raw.trim().replace(/[?!.…]+$/, '').trim();
    const colon = q.lastIndexOf(':');
    const body = colon > -1 ? q.slice(colon + 1).trim() : q;

    if (/\sили\s/i.test(body)) {
      const pieces = body.split(/\s+или\s+/i).map((s) => s.trim()).filter(Boolean);
      const parts = [];
      pieces.forEach((p) => {
        const c = p.split(/\s*,\s*/).filter(Boolean);
        const conditional = /^(если|когда|пока|раз|чтобы|так как)\s/i.test(p);
        if (!conditional && c.length > 1 && c.every((x) => x.split(/\s+/).length <= 3)) parts.push(...c);
        else parts.push(p);
      });

      if (parts.length >= 2) {
        const low = parts.map((p) => p.toLowerCase());
        const last = low[low.length - 1];
        if (parts.length === 2 && (last === 'нет' || last === 'не')) {
          return { type: 'yn', text: q.replace(/\s+или\s+(нет|не)\s*$/i, '') };
        }
        if (parts.length === 2 && low[0] === 'да' && last === 'нет') {
          return { type: 'yn', text: q };
        }
        if (parts.length <= 8 && parts.every((p) => p.length <= 60)) {
          return { type: 'multi', options: parts.map(cap), text: q };
        }
      }
    }
    return { type: 'yn', text: q };
  }

  /* ---------- Принятие решения ---------- */
  function decideYesNo(text, s) {
    const low = ' ' + text.toLowerCase();
    let p = s.yesWeight / 100;
    let matched = [];

    if (s.mode === 'smart') {
      let score = 0;
      CATS.forEach((c) => {
        if (c.keys.some((k) => low.includes(k))) { matched.push(c); score += c.bias; }
      });
      p += 0.18 * clamp(score, -3, 3);
    }
    p = clamp(p, 0.05, 0.95);

    const yes = Math.random() < p;
    let arg;
    if (s.mode === 'random') {
      arg = yes ? 'Монетка упала орлом.' : 'Монетка упала решкой.';
    } else {
      const pool = matched.length ? pick(matched)[yes ? 'yes' : 'no'] : GENERIC[yes ? 'yes' : 'no'];
      arg = pick(pool);
    }
    return { kind: yes ? 'yes' : 'no', answer: yes ? 'ДА' : 'НЕТ', arg };
  }

  function decideMulti(options, s) {
    const chosen = pick(options);
    const arg = s.mode === 'random' ? 'Выбор сделала монетка.' : pick(MULTI_ARGS);
    return { kind: 'multi', answer: chosen, arg };
  }

  function decide(rawQuestion) {
    const s = Store.settings();
    const parsed = parseQuestion(rawQuestion);
    return parsed.type === 'multi'
      ? decideMulti(parsed.options, s)
      : decideYesNo(parsed.text, s);
  }

  /* ---------- Интерфейс ---------- */
  const q = $('#q');
  const go = $('#go');
  const mic = $('#mic');
  const delay = $('#delay');
  const hint = $('#hint');
  const result = $('#result');

  function setHint(msg) {
    if (!msg) { hint.hidden = true; return; }
    hint.textContent = msg;
    hint.hidden = false;
  }

  const ICONS = { yes: '🟢', no: '🔴', multi: '🎯' };

  function run(text) {
    setHint('');
    result.hidden = false;
    result.className = 'result pending';
    $('#r-icon').textContent = '🪙';
    $('#r-answer').textContent = '';
    $('#r-arg').textContent = '';
    $('#r-q').textContent = '';

    setTimeout(() => {
      const d = decide(text);
      result.className = 'result show ' + d.kind;
      $('#r-icon').textContent = ICONS[d.kind];
      $('#r-answer').textContent = d.answer;
      $('#r-arg').textContent = d.arg;
      $('#r-q').textContent = '«' + text + '»';
      Store.add({ t: Date.now(), q: text, a: d.answer, kind: d.kind, arg: d.arg });
      renderHistory();
    }, 550);
  }

  let timer = null;
  function cancelTimer() {
    clearInterval(timer);
    timer = null;
    go.textContent = 'Решить';
  }

  function start() {
    if (timer) { cancelTimer(); return; }
    const text = q.value.trim();
    if (!text) { setHint('Сначала напиши вопрос или продиктуй его.'); q.focus(); return; }

    let left = parseInt(delay.value, 10) || 0;
    if (!left) { run(text); return; }

    result.hidden = true;
    setHint('Ответ появится через ' + left + ' сек. Можно отменить.');
    go.textContent = 'Отмена · ' + left;
    timer = setInterval(() => {
      left -= 1;
      if (left <= 0) { cancelTimer(); run(text); }
      else go.textContent = 'Отмена · ' + left;
    }, 1000);
  }

  go.addEventListener('click', start);
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); q.blur(); start(); }
  });

  /* Голос */
  mic.addEventListener('click', () => {
    if (!Voice.supported) {
      setHint('Голосовой ввод в этом браузере недоступен. Продиктуй вопрос кнопкой 🎙 на клавиатуре iPhone.');
      return;
    }
    if (Voice.active()) { Voice.stop(); return; }
    setHint('Слушаю…');
    mic.classList.add('rec');
    Voice.start({
      onText: (t) => { q.value = t; },
      onError: (msg) => setHint(msg),
      onEnd: (finalText) => {
        mic.classList.remove('rec');
        if (finalText) {
          q.value = finalText;
          setHint('');
          start();
        } else if (hint.textContent === 'Слушаю…') {
          setHint('');
        }
      }
    });
  });

  /* Вкладки */
  function showView(name) {
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
    $$('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    window.scrollTo(0, 0);
  }
  $$('.tabs button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

  /* История */
  function renderHistory() {
    const list = $('#history-list');
    const items = Store.history();
    list.textContent = '';
    $('#history-empty').hidden = items.length > 0;
    $('#clear').hidden = items.length === 0;

    items.forEach((it) => {
      const li = document.createElement('li');
      const top = document.createElement('div'); top.className = 'top';
      const qq = document.createElement('div'); qq.className = 'q'; qq.textContent = it.q;
      const aa = document.createElement('div'); aa.className = 'a ' + it.kind; aa.textContent = it.a;
      top.append(qq, aa);
      const arg = document.createElement('div'); arg.className = 'arg'; arg.textContent = it.arg;
      const date = document.createElement('div'); date.className = 'date';
      date.textContent = new Date(it.t).toLocaleString('ru-RU', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
      });
      li.append(top, arg, date);
      list.append(li);
    });
  }

  $('#clear').addEventListener('click', () => {
    if (confirm('Очистить всю историю решений?')) { Store.clear(); renderHistory(); }
  });

  /* Настройки */
  function renderSettings() {
    const s = Store.settings();
    $$('#mode-seg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === s.mode));
    $('#weight').value = s.yesWeight;
    $('#w-yes').textContent = '🟢 ДА ' + s.yesWeight + '%';
    $('#w-no').textContent = '🔴 НЕТ ' + (100 - s.yesWeight) + '%';
  }

  $$('#mode-seg button').forEach((b) => b.addEventListener('click', () => {
    const s = Store.settings();
    s.mode = b.dataset.mode;
    Store.saveSettings(s);
    renderSettings();
  }));

  $('#weight').addEventListener('input', (e) => {
    const s = Store.settings();
    s.yesWeight = parseInt(e.target.value, 10);
    Store.saveSettings(s);
    renderSettings();
  });

  $('#w-reset').addEventListener('click', () => {
    const s = Store.settings();
    s.yesWeight = 50;
    Store.saveSettings(s);
    renderSettings();
  });

  renderHistory();
  renderSettings();

  /* Service worker для офлайн-работы */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* не критично */ });
    });
  }
})();
