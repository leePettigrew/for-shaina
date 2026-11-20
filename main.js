/* MAIN: the words, the scenes and the glue. */
(function () {
  'use strict';

  /* ================= CONFIG AND COPY: every word she sees lives here ================= */
  const COPY = window.COPY = {
    gift: {
      tag: 'For Shaina', hint: 'tap the present',
      lines: ["Careful... it's wriggling.", 'Something in there has whiskers.'],
      hello: 'Hi, my little penguin! I have a story for you.',
      sound: 'best with sound on',
      skip: 'Skip to my card',
    },
    story: [
      'Once upon a time, in rainy Ireland, there lived an orange cat.',
      'The cat was hopelessly in love with a penguin.',
      'But the penguin lived far, far away: across the whole world, in the Philippines.',
      'And today was her birthday. So the cat packed his bag...',
    ],
    storyBtn: 'Help him get to her', storyHint: 'tap to continue',
    map: { a: 'Ireland', b: 'the Philippines', km: 'more than 10,000 km' },
    hop: 'tap to hop!',
    stages: {
      ireland: { name: 'Ireland', line: "First stop: coffee. (The penguin can't function without it.)", clear: 'Coffee: secured.' },
      sea: { name: 'The sea', line: 'Bears ahoy! Every occasion gets a bear.', clear: 'Bears: rescued.' },
      philippines: { name: 'The Philippines', line: 'Nearly there! Pick her roses.', clear: 'Roses: picked. Pastel, obviously.' },
    },
    quips: ['oof.', 'the cat is fine.', 'worth it.', 'nothing stops this cat.'],
    arrival: {
      a: 'And there she was.', b: 'The cutest penguin in the whole world.', cat: '*out of breath* ...hi.', hint: 'tap the penguin',
      compliments: ['Look at that face. Illegally cute.', 'Cutest penguin in the Philippines. (Also the only one. Still counts.)', 'The cat checked the whole planet. Nobody cuter.'],
    },
    gifts: {
      intro: 'He did not come empty-handed.', hearts: ' (He also carried {n} hearts across the world.)', hint: 'tap a gift to give it',
      coffee: 'First things first: coffee. The penguin cannot function without it.',
      bear: "A bear. Because it's an occasion, and every occasion gets a bear.",
      roses: "Pastel roses, with lots and lots of baby's breath. Just how she likes them.",
      sansa1: 'Sansa inspects the orange cat...', sansa2: '...Sansa allows it.',
    },
    cake: { a: 'One more thing.', b: 'Make a wish, my little penguin... then blow out the candles!', hint: 'tap the candles' },
    party: { a: 'Happy Birthday,', b: 'Shaina!', sub: 'from your orange cat, who loves you more than tuna', btn: 'Open your card' },
    letter: [
      { t: 'Shaina,', c: 'l-greet' },
      { t: 'Happy birthday, my little penguin.', c: 'l-big' },
      { t: "I can't be beside you today, so I sent the next best thing: one orange cat, a bit out of breath, carrying everything I wish I could hand you myself. Your coffee. Another bear for the collection. Pastel roses with far too much baby's breath." },
      { t: "You are the cutest thing in my whole world. That's not the cat talking. That's me." },
      { t: 'Talking to you felt safe from the very first day, and you are still my favourite place to be, even from the other side of the world.' },
      { t: "One day the cat won't need a boat. Until then, I'll keep crossing every ocean I can to get to you." },
      { t: 'Give Sansa a kiss from me.' },
      { t: 'I love you. Happy birthday.', c: 'l-big' },
    ],
    sign: ['Lee', '(your orange cat)'],
    end: { again: 'Play again', kiss: 'Send the cat a kiss', kissText: 'The penguin got her birthday card 🐧💌🐈' },
    rotate: 'Turn your phone upright, my little penguin',
    sound: ['Turn sound off', 'Turn sound on'],
  };

  const SCENES = ['gift', 'story', 'ireland', 'sea', 'philippines', 'arrival', 'gifts', 'cake', 'party', 'letter'];
  const SECTION = { gift: 's-gift', story: 's-story', ireland: 's-game', sea: 's-game', philippines: 's-game', arrival: 's-island', gifts: 's-island', cake: 's-island', party: 's-island', letter: 's-letter' };
  const PASTELS = ['#ffb3d1', '#d5c3ff', '#c9f2e0', '#cfe6ff', '#fff1b8', '#ffd6ba', '#ff9fc0'];
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const stage = $('#stage');
  const counts = { coffee: 0, bear: 0, rose: 0, heart: 0 };
  const scenes = {};
  let current = null, timers = [], tapTarget = null, letterDone = false;

  function later(fn, ms) {
    const id = setTimeout(function () { timers = timers.filter(function (t) { return t !== id; }); fn(); }, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function setTap(t) { tapTarget = t; }
  function onTap(node, fn) {
    let t = 0;
    node.addEventListener('pointerdown', function (e) { if (e.button > 0) return; t = Date.now(); fn(e); });
    node.addEventListener('click', function (e) { if (Date.now() - t < 800) return; fn(e); });   // keyboard users
  }
  function bounce(node) { if (!node) return; node.classList.remove('react'); void node.offsetWidth; node.classList.add('react'); }
  function spot(node) { const r = node.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height }; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* private mode */ } return null; }

  /* ================= PARTICLES: hearts, sparkles and confetti on one canvas ================= */
  const FX = (function () {
    const cv = $('#fx'), g = cv.getContext('2d');
    let parts = [], emitters = [], raf = 0, last = 0, dpr = 1, w = 0, h = 0;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); w = stage.clientWidth; h = stage.clientHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function add(p) { if (parts.length < 190) { parts.push(p); wake(); } }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function pick(a) { return a[(Math.random() * a.length) | 0]; }
    function burst(x, y, o) {
      o = o || {};
      const n = Math.max(2, Math.round((o.n || 10) * (calm ? 0.4 : 1)));
      for (let i = 0; i < n; i++) {
        const a = o.up ? rnd(-Math.PI * 0.9, -Math.PI * 0.1) : rnd(0, Math.PI * 2), sp = rnd(0.4, 1) * (o.speed || 160);
        add({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.lift || 0), g: o.g === undefined ? 260 : o.g, drag: o.drag || 1.2, life: rnd(0.5, 1) * (o.life || 0.9), fade: 0.35, size: rnd(0.6, 1) * (o.size || 10), col: pick(o.cols || PASTELS), shape: o.shape || 'dot', rot: rnd(-0.5, 0.5), vr: rnd(-4, 4) });
      }
    }
    function confetti(seconds) { emitters.push({ kind: 'confetti', t: seconds, acc: 0, rate: calm ? 8 : 26 }); wake(); }
    function fountain(x, y, seconds) { emitters.push({ kind: 'hearts', t: seconds, acc: 0, rate: calm ? 2 : 7, x: x, y: y }); wake(); }
    function clear() { parts = []; emitters = []; }
    function heartPath(s) { g.beginPath(); g.moveTo(0, s * 0.45); g.bezierCurveTo(-s * 1.1, -s * 0.2, -s * 0.5, -s * 1.0, 0, -s * 0.38); g.bezierCurveTo(s * 0.5, -s * 1.0, s * 1.1, -s * 0.2, 0, s * 0.45); g.fill(); }
    function starPath(s) { g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.38 : s, a = i * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
    function tick(now) {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05); last = now;
      emitters = emitters.filter(function (e) {
        e.t -= dt; e.acc += e.rate * dt;
        while (e.acc >= 1) {
          e.acc -= 1;
          if (e.kind === 'confetti') add({ x: rnd(0, w), y: -12, vx: rnd(-50, 50), vy: rnd(90, 210), g: 40, drag: 0.2, life: 6, fade: 0.5, size: rnd(7, 13), col: pick(PASTELS), shape: 'rect', rot: rnd(0, 6), vr: rnd(-6, 6) });
          else add({ x: e.x + rnd(-26, 26), y: e.y, vx: rnd(-26, 26), vy: rnd(-150, -80), g: -10, drag: 0.3, life: rnd(1.3, 2.2), fade: 0.6, size: rnd(7, 13), col: pick(['#ff9fc0', '#ffb3d1', '#ff7fae', '#d5c3ff']), shape: 'heart', rot: rnd(-0.3, 0.3), vr: rnd(-1, 1) });
        }
        return e.t > 0;
      });
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      parts = parts.filter(function (p) {
        p.life -= dt; if (p.life <= 0 || p.y > h + 30) return false;
        p.vy += p.g * dt; p.vx *= Math.max(0, 1 - p.drag * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        g.globalAlpha = Math.min(1, p.life / p.fade);
        g.fillStyle = p.col;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        if (p.shape === 'heart') heartPath(p.size);
        else if (p.shape === 'star') starPath(p.size);
        else if (p.shape === 'rect') { g.scale(1, Math.cos(p.rot * 2.3)); g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        else { g.beginPath(); g.arc(0, 0, p.size / 2, 0, 6.2832); g.fill(); }
        g.restore();
        return true;
      });
      g.globalAlpha = 1;
      raf = (parts.length || emitters.length) ? requestAnimationFrame(tick) : 0;
    }
    return { size: size, burst: burst, confetti: confetti, fountain: fountain, clear: clear };
  })();

  function hearts(node, n) { const p = spot(node); FX.burst(p.x, p.y - p.h * 0.15, { n: n || 8, shape: 'heart', cols: ['#ff9fc0', '#ffb3d1', '#ff7fae', '#d5c3ff'], speed: 170, up: true, g: 120, size: 11, life: 1.1 }); }
  function gameFx(kind, x, y) {
    if (kind === 'dust') FX.burst(x, y, { n: 5, cols: ['#ffffff', '#f3e9d8'], speed: 70, up: true, g: 60, size: 7, life: 0.5 });
    else if (kind === 'splash') FX.burst(x, y, { n: 7, cols: ['#ffffff', '#cfe9fb', '#a9d8f7'], speed: 150, up: true, g: 420, size: 7, life: 0.6 });
    else if (kind === 'ring') FX.burst(x, y, { n: 6, cols: ['#ffffff', '#fff1b8'], speed: 110, g: 0, size: 6, life: 0.4, shape: 'star' });
    else if (kind === 'stars') FX.burst(x, y, { n: 6, cols: ['#fff1b8', '#ffd166'], speed: 170, g: 200, size: 9, life: 0.7, shape: 'star' });
    else if (kind === 'pick') FX.burst(x, y, { n: 5, cols: ['#ff9fc0', '#ffb3d1', '#fff'], speed: 110, g: 60, size: 7, life: 0.5, shape: 'heart' });
    else FX.burst(x, y, { n: 12, speed: 190, g: 140, size: 9, life: 0.8, shape: 'star' });
  }

  /* ================= SCENES ================= */
  function go(id) {
    if (!scenes[id]) return;
    if (current && scenes[current].exit) scenes[current].exit();
    clearTimers(); Game.stop(); setTap(null);
    const sec = SECTION[id], same = current && SECTION[current] === sec;
    current = id;
    $$('.scene').forEach(function (s) { s.classList.toggle('on', s.id === sec); });
    if (same && sec === 's-game') { const s = $('#' + sec); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); }
    $('#bg').style.display = (sec === 's-gift' || sec === 's-story' || sec === 's-letter') ? 'block' : 'none';
    scenes[id].enter();
  }
  function next() { go(SCENES[Math.min(SCENES.indexOf(current) + 1, SCENES.length - 1)]); }

  /* ----- 1. gift ----- */
  let giftTaps = 0, giftOpen = false;
  function buildGift() {
    const s = $('#s-gift');
    s.innerHTML = '<div class="gift-stack"><div class="bubble gift-bubble"></div><div class="gift-cat">' + Art.cat({ scarf: true }) + '</div>' +
      '<button class="gift-btn" aria-label="Open your present">' + Art.giftBox() + '<span class="gift-tag"></span></button></div>' +
      '<div class="gift-line" aria-live="polite"></div><div class="hint gift-hint"></div><div class="gift-sound">' + Art.speaker(true) + '<span></span></div><button class="skip-link" hidden></button>';
    $('.gift-sound span', s).textContent = COPY.gift.sound;
    $('.gift-tag', s).textContent = COPY.gift.tag;
    $('.gift-bubble', s).textContent = COPY.gift.hello;
    $('.gift-hint', s).textContent = COPY.gift.hint;
    $('.skip-link', s).textContent = COPY.gift.skip;
    onTap($('.gift-btn', s), tapGift);
    onTap($('.skip-link', s), function () { Sfx.unlock(); Sfx.music('birthday'); go('letter'); });
    onTap(s, function (e) { if (giftOpen === 'ready' && current === 'gift' && !e.target.closest('.skip-link')) go('story'); });
  }
  function tapGift() {
    if (current !== 'gift' || giftOpen) return;
    const s = $('#s-gift'), btn = $('.gift-btn', s), p = spot(btn);
    Sfx.unlock();
    giftTaps++;
    if (giftTaps < 3) {
      btn.style.setProperty('--amp', giftTaps === 1 ? 7 : 12);
      btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
      $('.gift-line', s).textContent = COPY.gift.lines[giftTaps - 1];
      Sfx.play('shake'); Sfx.buzz(12);
      FX.burst(p.x, p.y, { n: 6 + giftTaps * 3, shape: 'heart', speed: 150 + giftTaps * 40, size: 9, g: 160 });
      return;
    }
    giftOpen = true;
    setTap(null);
    $('.gift-stack', s).classList.add('open');
    $('.gift-cat', s).classList.add('is-happy');
    $('.gift-line', s).textContent = '';
    $('.gift-hint', s).style.visibility = 'hidden';
    $('.gift-sound', s).style.visibility = 'hidden';
    $('.skip-link', s).hidden = true;
    Sfx.play('open'); Sfx.buzz(30); Sfx.music('loop');
    FX.burst(p.x, p.y - p.h * 0.2, { n: 34, speed: 330, up: true, g: 320, size: 11, life: 1.5, shape: 'rect' });
    FX.burst(p.x, p.y - p.h * 0.2, { n: 14, speed: 240, up: true, g: 200, size: 12, life: 1.4, shape: 'heart', cols: ['#ff9fc0', '#ff7fae', '#d5c3ff'] });
    later(function () { Sfx.play('mew'); }, 500);
    later(function () { giftOpen = 'ready'; }, 1500);
    later(function () { go('story'); }, 4200);
  }
  scenes.gift = {
    enter: function () {
      const s = $('#s-gift');
      giftTaps = 0; giftOpen = false;
      $('.gift-stack', s).classList.remove('open');
      $('.gift-cat', s).classList.remove('is-happy');
      $('.gift-btn', s).classList.remove('shake');
      $('.gift-line', s).textContent = '';
      $('.gift-hint', s).style.visibility = 'visible';
      $('.gift-sound', s).style.visibility = 'visible';
      $('.skip-link', s).hidden = store('forShaina.seen') !== '1';
      setTap($('.gift-btn', s));
    },
  };

  /* ----- 2. story ----- */
  let storyI = 0, storyLock = 0;
  function nest(svg, x, y, size) { return svg.replace('<svg ', '<svg x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" '); }
  function storyArt(i) {
    if (i === 0) return '<div class="sa sa-sky1"></div><div class="sa sa-sham" style="left:7%">' + Art.shamrock() + '</div><div class="sa sa-sham" style="right:9%">' + Art.shamrock() + '</div>' +
      '<div class="sa sa-cat">' + Art.cat({ scarf: true }) + '</div><div class="sa sa-cloud">' + Art.cloud() + '</div>' +
      '<div class="sa sa-rain"><i style="left:8%"></i><i style="left:30%;animation-delay:-.25s"></i><i style="left:52%;animation-delay:-.5s"></i><i style="left:74%;animation-delay:-.1s"></i><i style="left:92%;animation-delay:-.4s"></i></div>';
    if (i === 1) return '<div class="sa sa-sky2"></div><div class="sa sa-cat is-happy" style="left:8%">' + Art.cat({ scarf: true }) + '</div><div class="sa sa-thought">' + Art.penguinFace() + '</div>' +
      '<div class="sa sa-heart" style="left:50%;top:56%">' + Art.heart() + '</div><div class="sa sa-heart" style="left:62%;top:70%;animation-delay:-.3s">' + Art.heart('#d5c3ff') + '</div><div class="sa sa-heart" style="left:74%;top:58%;animation-delay:-.6s">' + Art.heart('#ffb3d1') + '</div>';
    if (i === 2) return '<div class="sa sa-sky3"></div><div class="sa sa-map"><svg viewBox="0 0 320 240" aria-hidden="true">' +
      '<path d="M66 176 Q150 -10 254 84" fill="none" stroke="#b9a3cf" stroke-width="5" stroke-dasharray="1 13" stroke-linecap="round"/>' +
      nest(Art.catFace(), 18, 150, 80) + nest(Art.penguinFace(), 222, 40, 84) +
      '<text x="104" y="212" class="map-t">' + COPY.map.a + '</text><text x="312" y="146" text-anchor="end" class="map-t">' + COPY.map.b + '</text>' +
      '<text x="204" y="180" text-anchor="middle" class="map-k">' + COPY.map.km + '</text>' +
      '<g><path d="M0 7 C-17 -5 -9 -17 0 -8 C9 -17 17 -5 0 7 Z" fill="#ff7fae" stroke="#5b4a66" stroke-width="2.500"/><animateMotion dur="2.800s" repeatCount="indefinite" path="M66 176 Q150 -10 254 84"/></g>' +
      '</svg></div>';
    return '<div class="sa sa-sky4"></div><div class="sa sa-cat is-happy">' + Art.cat({ scarf: true, bag: true }) + '</div>' +
      '<div class="sa sa-item" style="left:7%;top:12%">' + Art.coffee() + '</div><div class="sa sa-item" style="right:8%;top:8%;animation-delay:-.6s">' + Art.bear() + '</div><div class="sa sa-item" style="right:4%;top:50%;animation-delay:-1.1s">' + Art.rose() + '</div>';
  }
  function buildStory() {
    const s = $('#s-story');
    s.innerHTML = '<div class="story-card"><div class="story-art"></div><p class="story-text" aria-live="polite"></p><div class="story-dots">' + COPY.story.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
      '<div class="story-foot"><div class="hint story-hint"></div><button class="btn story-btn"></button></div>';
    $('.story-hint', s).textContent = COPY.storyHint;
    $('.story-btn', s).textContent = COPY.storyBtn;
    onTap(s, function (e) {
      if (current !== 'story' || Date.now() - storyLock < 380) return;
      Sfx.unlock();
      if (storyI < COPY.story.length - 1) { storyLock = Date.now(); Sfx.play('tap'); showStory(storyI + 1); }
      else if (e.target.closest('.story-btn')) { Sfx.play('pop'); go('ireland'); }
    });
  }
  function showStory(i) {
    const s = $('#s-story'), art = $('.story-art', s), text = $('.story-text', s), last = i === COPY.story.length - 1;
    storyI = i;
    art.innerHTML = storyArt(i); text.textContent = COPY.story[i];
    [art, text].forEach(function (n) { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
    $$('.story-dots i', s).forEach(function (d, k) { d.classList.toggle('on', k === i); });
    $('.story-hint', s).style.display = last ? 'none' : 'block';
    $('.story-btn', s).style.display = last ? 'inline-flex' : 'none';
    setTap(last ? $('.story-btn', s) : $('.story-card', s));
  }
  scenes.story = { enter: function () { storyLock = Date.now(); showStory(0); Sfx.music('loop'); } };

  /* ----- 3-5. the journey ----- */
  ['ireland', 'sea', 'philippines'].forEach(function (id) {
    scenes[id] = {
      enter: function () {
        if (id === 'ireland') { counts.coffee = counts.bear = counts.rose = counts.heart = 0; }
        if (Sfx.kind() !== 'loop') Sfx.music('loop');
        Sfx.musicLevel(0.55);
        Game.start(id, { counts: counts, fx: gameFx, onDone: function () { if (current === id) next(); } });
      },
      exit: function () { Game.stop(); },
    };
  });

  /* ----- 6-9. the island ----- */
  const isl = {};
  function buildIsland() {
    const s = $('#s-island');
    s.innerHTML = '<div class="isl-sky"></div><div class="isl-sun sun"></div><div class="isl-palm">' + Art.palm() + '</div>' +
      '<div class="isl-caption" aria-live="polite"></div><div class="isl-banner"><span></span><strong></strong><em></em></div>' +
      '<div class="pile"><div class="pl-roses">' + Art.bouquet() + '</div><div class="pl-bear">' + Art.bear() + '</div><div class="pl-coffee">' + Art.coffee() + '</div></div>' +
      '<button class="ch isl-cat" aria-label="The orange cat"><span class="ch-in">' + Art.cat({ scarf: true, bag: true }) + '</span></button>' +
      '<button class="ch isl-penguin" aria-label="The penguin"><span class="ch-in">' + Art.penguin() + '</span></button>' +
      '<button class="ch isl-sansa is-sleep" aria-label="Sansa"><span class="zzz">z z</span><span class="sansa-hat">' + Art.partyHat() + '</span><span class="ch-in">' + Art.cat({ grey: true }) + '</span></button>' +
      '<div class="bubble isl-bubble"></div>' +
      '<div class="isl-gifts"><button class="gift-item" data-k="coffee" aria-label="Give her the coffee">' + Art.coffee() + '</button><button class="gift-item" data-k="bear" aria-label="Give her the bear">' + Art.bear() + '</button><button class="gift-item" data-k="roses" aria-label="Give her the roses">' + Art.bouquet() + '</button></div>' +
      '<div class="isl-cake">' + Art.cake() + '<div class="candles">' + ['#ffb3d1', '#d5c3ff', '#c9f2e0', '#fff1b8', '#cfe6ff'].map(function (c, i) { return '<button class="candle-btn" aria-label="Blow out candle ' + (i + 1) + '">' + Art.candle(c) + '</button>'; }).join('') + '</div></div>' +
      '<div class="hint isl-hint"></div><button class="btn isl-open"></button>';
    ['sky', 'palm', 'caption', 'banner', 'pile', 'cat', 'penguin', 'sansa', 'bubble', 'gifts', 'cake', 'hint', 'open'].forEach(function (k) { isl[k] = $('.isl-' + k, s) || $('.' + k, s); });
    isl.root = s;
    isl.items = $$('.gift-item', s);
    isl.candles = $$('.candle-btn', s);
    $('.isl-banner span', s).textContent = COPY.party.a;
    $('.isl-banner strong', s).innerHTML = COPY.party.b.split('').map(function (ch, i) { return '<i style="animation-delay:' + (i * 0.09) + 's">' + ch + '</i>'; }).join('');
    $('.isl-banner em', s).textContent = COPY.party.sub;
    isl.open.textContent = COPY.party.btn;
    onTap(isl.penguin, tapPenguin);
    onTap(isl.cat, function () { bounce(isl.cat.firstElementChild); hearts(isl.cat, 5); Sfx.play('purr'); });
    onTap(isl.sansa, function () { bounce($('.ch-in', isl.sansa)); Sfx.play('mew'); if (!isl.sansa.classList.contains('is-sleep')) hearts(isl.sansa, 4); });
    isl.items.forEach(function (b) { onTap(b, function () { giveGift(b); }); });
    isl.candles.forEach(function (b) { onTap(b, function () { blow(b); }); });
    onTap(isl.open, function () { if (current === 'party') { Sfx.play('pop'); go('letter'); } });
  }
  function caption(text) {
    isl.caption.textContent = text;
    isl.caption.classList.add('show');
    isl.caption.classList.remove('swap'); void isl.caption.offsetWidth; isl.caption.classList.add('swap');
  }
  function bubble(text, ms) {
    isl.bubble.textContent = text;
    isl.bubble.classList.remove('show'); void isl.bubble.offsetWidth; isl.bubble.classList.add('show');
    clearTimeout(isl.bubbleT);
    isl.bubbleT = setTimeout(function () { isl.bubble.classList.remove('show'); }, ms || 2600);
  }
  function hint(text) { isl.hint.textContent = text || ''; isl.hint.classList.toggle('show', !!text); }
  function mood(node, cls, ms) {
    ['is-wave', 'is-blush', 'is-sparkle', 'is-happy', 'is-flap', 'is-hug', 'is-puff'].forEach(function (c) { node.classList.remove(c); });
    (cls || '').split(' ').forEach(function (c) { if (c) node.classList.add(c); });
    clearTimeout(node._moodT);
    if (ms) node._moodT = setTimeout(function () { (cls || '').split(' ').forEach(function (c) { if (c) node.classList.remove(c); }); }, ms);
  }
  // put the island into the right state for a phase, whichever scene we came from
  function islandBase(phase) {
    const n = ['arrival', 'gifts', 'cake', 'party'].indexOf(phase);
    isl.root.classList.remove('party', 'hug', 'arrive');
    isl.root.dataset.phase = phase;
    isl.caption.classList.remove('show'); isl.bubble.classList.remove('show'); clearTimeout(isl.bubbleT);
    isl.gifts.classList.remove('show'); isl.cake.classList.remove('show'); isl.banner.classList.remove('show'); isl.open.classList.remove('show');
    hint('');
    mood(isl.cat, ''); mood(isl.penguin, '');
    $$('.balloon-fly, .pen-hold', isl.root).forEach(function (b) { b.remove(); });
    isl.items.forEach(function (b) { b.classList.remove('given', 'next'); b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); });
    $$('.pile > div', isl.root).forEach(function (d) { d.classList.toggle('in', n >= 2); });
    isl.candles.forEach(function (b) { b.classList.remove('out'); });
    isl.sansa.classList.toggle('is-sleep', n < 2);
    isl.sansa.classList.remove('hat', 'is-happy');
    isl.sansa.style.transform = n >= 2 ? 'translateX(calc(var(--u) * -69))' : '';
    Sfx.musicLevel(0.55);
  }

  let penTaps = 0, penLock = 0, penReady = false;
  function tapPenguin() {
    const inner = isl.penguin.firstElementChild;
    if (current === 'arrival') {
      if (!penReady || Date.now() - penLock < 750 || penTaps >= 3) return;
      penLock = Date.now(); penTaps++;
      bounce(inner); hearts(isl.penguin, 7 + penTaps * 2); Sfx.play('squeak'); Sfx.buzz(10);
      mood(isl.penguin, ['is-wave', 'is-blush', 'is-blush is-happy is-flap'][penTaps - 1]);
      bubble(COPY.arrival.compliments[penTaps - 1], 4200);
      hint(penTaps < 3 ? COPY.arrival.hint : '');
      if (penTaps >= 3) { setTap(null); mood(isl.cat, 'is-happy'); later(function () { go('gifts'); }, 3000); }
      return;
    }
    bounce(inner); hearts(isl.penguin, 6); Sfx.play('squeak');
  }
  scenes.arrival = {
    enter: function () {
      islandBase('arrival');
      penTaps = 0; penReady = false;
      void isl.root.offsetWidth;
      isl.root.classList.add('arrive');
      mood(isl.cat, 'is-puff');
      mood(isl.penguin, 'is-wave', 2600);
      later(function () { caption(COPY.arrival.a); }, 500);
      later(function () { bubble(COPY.arrival.cat, 1900); Sfx.play('mew'); }, 1500);
      later(function () { caption(COPY.arrival.b); hint(COPY.arrival.hint); penReady = true; setTap(isl.penguin); }, 3300);
    },
  };

  let giftN = 0, giftLock = false;
  function giveGift(b) {
    if (current !== 'gifts' || giftLock || !b.classList.contains('next')) return;
    const k = b.dataset.k, from = spot(b), to = spot(isl.penguin);
    giftLock = true; setTap(null); hint('');
    b.style.setProperty('--tx', (to.x - from.x) + 'px'); b.style.setProperty('--ty', (to.y - from.y) + 'px');
    b.classList.remove('next'); b.classList.add('given');
    Sfx.play('pop'); Sfx.buzz(10);
    later(function () {
      const inner = isl.penguin.firstElementChild;
      bounce(inner); Sfx.play('gift'); hearts(isl.penguin, 10);
      // she holds it for a moment, then it joins the little pile beside her
      const hold = document.createElement('span');
      hold.className = 'pen-hold';
      hold.innerHTML = k === 'coffee' ? Art.coffee() : k === 'bear' ? Art.bear() : Art.bouquet();
      isl.penguin.appendChild(hold);
      later(function () { hold.remove(); $('.pl-' + k, isl.root).classList.add('in'); }, 1450);
      later(function () { Sfx.play('squeak'); }, 250);
      caption(COPY.gifts[k]);
      mood(isl.penguin, k === 'coffee' ? 'is-sparkle' : k === 'bear' ? 'is-happy is-flap' : 'is-blush is-happy', 2600);
      giftN++;
    }, 480);
    later(function () {
      giftLock = false;
      if (giftN < 3) { isl.items[giftN].classList.add('next'); setTap(isl.items[giftN]); }
      else later(sansaInspects, 1500);
    }, 1900);
  }
  function sansaInspects() {
    isl.gifts.classList.remove('show');
    caption(COPY.gifts.sansa1);
    isl.sansa.classList.remove('is-sleep'); Sfx.play('mew'); bounce($('.ch-in', isl.sansa));
    later(function () { isl.sansa.style.transform = 'translateX(calc(var(--u) * -69))'; }, 500);
    later(function () { mood(isl.cat, 'is-puff'); }, 1400);
    later(function () {
      caption(COPY.gifts.sansa2);
      isl.sansa.classList.add('is-happy'); mood(isl.cat, 'is-happy');
      hearts(isl.sansa, 8); Sfx.play('purr'); bounce($('.ch-in', isl.sansa));
    }, 3000);
    later(function () { go('cake'); }, 5600);
  }
  scenes.gifts = {
    enter: function () {
      islandBase('gifts');
      giftN = 0; giftLock = false;
      mood(isl.cat, 'is-happy');
      caption(COPY.gifts.intro + (counts.heart > 0 ? COPY.gifts.hearts.replace('{n}', counts.heart) : ''));
      later(function () {
        isl.gifts.classList.add('show');
        isl.items.forEach(function (b, i) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); b.style.animationDelay = (i * 0.12) + 's'; });
        Sfx.play('gift');
      }, 700);
      later(function () { isl.items.forEach(function (b) { b.classList.remove('pop'); b.style.animationDelay = ''; }); isl.items[0].classList.add('next'); hint(COPY.gifts.hint); setTap(isl.items[0]); }, 1700);
    },
  };

  let cakeReady = false;
  function blow(b) {
    if (current !== 'cake' || !cakeReady || b.classList.contains('out')) return;
    b.classList.add('out');
    const p = spot(b);
    Sfx.play('puff'); Sfx.buzz(12);
    FX.burst(p.x, p.y - p.h * 0.3, { n: 5, cols: ['#ffffff', '#e6dcef'], speed: 60, up: true, g: -40, size: 9, life: 0.8 });
    const left = isl.candles.filter(function (c) { return !c.classList.contains('out'); });
    if (!left.length) { setTap(null); hint(''); cakeReady = false; later(function () { go('party'); }, 650); }
  }
  scenes.cake = {
    enter: function () {
      islandBase('cake');
      cakeReady = false;
      mood(isl.cat, 'is-happy');
      caption(COPY.cake.a);
      later(function () { isl.cake.classList.add('show'); Sfx.play('open'); mood(isl.penguin, 'is-sparkle', 2400); }, 1100);
      later(function () {
        caption(COPY.cake.b); hint(COPY.cake.hint); cakeReady = true;
        setTap(function () { const c = isl.candles.filter(function (x) { return !x.classList.contains('out'); })[0]; return c || null; });
      }, 2300);
    },
  };

  scenes.party = {
    enter: function () {
      islandBase('party');
      isl.root.classList.add('party');
      isl.cake.classList.add('show');
      isl.candles.forEach(function (b) { b.classList.add('out'); });
      isl.banner.classList.add('show');
      mood(isl.penguin, 'is-happy is-flap'); mood(isl.cat, 'is-happy');
      Sfx.play('cheer'); Sfx.buzz(40); Sfx.music('birthday'); Sfx.musicLevel(0.75);
      FX.confetti(calm ? 2.500 : 6);
      const w = stage.clientWidth;
      FX.burst(w * 0.2, stage.clientHeight * 0.5, { n: 26, speed: 420, up: true, g: 380, size: 11, life: 1.6, shape: 'rect' });
      FX.burst(w * 0.8, stage.clientHeight * 0.5, { n: 26, speed: 420, up: true, g: 380, size: 11, life: 1.6, shape: 'rect' });
      for (let i = 0; i < (calm ? 3 : 9); i++) {
        const b = document.createElement('div');
        b.className = 'balloon-fly';
        b.innerHTML = Art.balloon(PASTELS[i % PASTELS.length]);
        b.style.left = (3 + (i * 37) % 86) + '%';
        b.style.animationDuration = (6.500 + (i % 4) * 1.300) + 's';
        b.style.animationDelay = (i * 0.45) + 's';
        isl.root.appendChild(b);
      }
      later(function () {
        isl.root.classList.add('hug');
        mood(isl.penguin, 'is-happy is-hug is-blush'); mood(isl.cat, 'is-happy is-hug');
        const a = spot(isl.cat), p = spot(isl.penguin);
        FX.fountain((a.x + p.x) / 2, Math.min(a.y, p.y) - a.h * 0.2, 5);
        isl.sansa.classList.add('hat', 'is-happy');
        Sfx.play('kiss');
      }, 1700);
      later(function () { isl.open.classList.add('show'); setTap(isl.open); }, 4600);
    },
    exit: function () { FX.clear(); },
  };

  /* ----- 10. the letter ----- */
  function buildLetter() {
    const s = $('#s-letter');
    s.innerHTML = '<div class="letter-wrap"><article class="letter-card"><div class="letter-stamp">' + Art.heart('#ff7fae') + '</div>' +
      COPY.letter.map(function (l) { return '<p class="l-line ' + (l.c || '') + '"></p>'; }).join('') + '<p class="l-line l-sign"></p></article>' +
      '<div class="letter-pair"><button class="lp-cat is-happy" aria-label="The orange cat">' + Art.cat({ scarf: true }) + '</button><div class="lp-heart">' + Art.heart() + '</div><button class="lp-pen is-happy is-blush" aria-label="The penguin">' + Art.penguin() + '</button></div>' +
      '<div class="letter-btns"><button class="btn again"></button><a class="btn ghost kiss" target="_blank" rel="noopener"></a></div></div>';
    $$('.l-line', s).forEach(function (p, i) { if (COPY.letter[i]) p.textContent = COPY.letter[i].t; });
    $('.l-sign', s).innerHTML = '<span></span>';
    $('.l-sign', s).insertBefore(document.createTextNode(COPY.sign[0]), $('.l-sign span', s));
    $('.l-sign span', s).textContent = COPY.sign[1];
    $('.again', s).textContent = COPY.end.again;
    const kiss = $('.kiss', s);
    kiss.textContent = COPY.end.kiss;
    kiss.href = 'https://wa.me/?text=' + encodeURIComponent(COPY.end.kissText);
    kiss.addEventListener('click', function () { hearts(kiss, 12); Sfx.play('kiss'); });
    onTap($('.again', s), function () { if (current === 'letter' && letterDone) { Sfx.play('pop'); Sfx.music(null); go('gift'); } });
    onTap($('.lp-cat', s), function () { hearts($('.lp-cat', s), 6); Sfx.play('purr'); });
    onTap($('.lp-pen', s), function () { hearts($('.lp-pen', s), 6); Sfx.play('squeak'); });
    onTap($('.letter-card', s), function () { if (current === 'letter' && !letterDone) revealAll(); });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { s.addEventListener(ev, function () { letterTouched = true; }, { passive: true }); });
    s.addEventListener('scroll', letterMore, { passive: true });
    const more = document.createElement('div');
    more.id = 'more'; more.setAttribute('aria-hidden', 'true');
    more.innerHTML = '<svg viewBox="0 0 48 48"><path d="M12 18 L24 30 L36 18" fill="none" stroke="#5b4a66" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    stage.appendChild(more);
  }
  // The letter is longer than a phone screen. While it writes itself the page follows the newest line;
  // the moment she touches or scrolls, she is in charge and a small arrow shows there is more below.
  let letterTouched = false;
  function letterMore() {
    const s = $('#s-letter'), more = $('#more');
    if (!more) return;
    more.classList.toggle('show', current === 'letter' && s.scrollHeight - s.scrollTop - s.clientHeight > 48);
  }
  function letterFollow(node, pad) {
    const s = $('#s-letter');
    if (letterTouched || current !== 'letter') return;
    let top = 0, n = node;
    while (n && n !== s) { top += n.offsetTop; n = n.offsetParent; }
    const want = top + node.offsetHeight + (pad || 90) - s.clientHeight;
    if (want > s.scrollTop) { try { s.scrollTo({ top: want, behavior: calm ? 'auto' : 'smooth' }); } catch (e) { s.scrollTop = want; } }
  }
  function revealAll() {
    const s = $('#s-letter');
    $$('.l-line', s).forEach(function (p) { p.classList.add('in'); });
    $('.letter-wrap', s).classList.add('done');
    letterDone = true;
    store('forShaina.seen', '1');
    later(function () { letterFollow($('.letter-btns', s), 30); }, 900);
    later(letterMore, 1000);
  }
  scenes.letter = {
    enter: function () {
      const s = $('#s-letter'), lines = $$('.l-line', s);
      letterDone = false; letterTouched = false;
      s.scrollTop = 0;
      $('.letter-wrap', s).classList.remove('done');
      lines.forEach(function (p) { p.classList.remove('in'); });
      const card = $('.letter-card', s);
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      if (Sfx.kind() !== 'birthday') Sfx.music('birthday');
      Sfx.musicLevel(0.4);
      lines.forEach(function (p, i) {
        later(function () {
          p.classList.add('in'); letterFollow(p); letterMore();
          if (i === lines.length - 1) later(revealAll, 900);
        }, 800 + i * (calm ? 300 : 1150));
      });
    },
    exit: function () { letterDone = false; const more = $('#more'); if (more) more.classList.remove('show'); },
  };

  /* ================= TEST CONTRACT ================= */
  function tapNode() { let t = tapTarget; if (typeof t === 'function') t = t(); return (t && t.getBoundingClientRect) ? t : null; }
  window.__card = {
    scenes: function () { return SCENES.slice(); },
    scene: function () { return current; },
    goto: function (id) { go(id); },
    nextTap: function () {
      const t = tapNode();
      if (!t) return null;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    done: function () { return current === 'letter' && letterDone; },
  };

  /* ================= BOOT ================= */
  function measure() {
    const w = stage.clientWidth, h = stage.clientHeight;
    document.documentElement.style.setProperty('--u', (Math.min(w / 100, h / 178)).toFixed(3) + 'px');
    FX.size(); Game.measure();
  }
  function boot() {
    measure();
    const bg = $('#bg');
    for (let i = 0; i < (calm ? 6 : 14); i++) {
      const h = document.createElement('i');
      h.innerHTML = Art.heart(PASTELS[i % PASTELS.length]);
      h.style.left = ((i * 53) % 96) + '%';
      h.style.width = 'calc(var(--u) * ' + (4 + (i * 7) % 5) + ')';
      h.style.animationDuration = (11 + (i * 5) % 9) + 's';
      h.style.animationDelay = (-(i * 1.700)) + 's';
      bg.appendChild(h);
    }
    buildGift(); buildStory(); Game.mount($('#s-game')); buildIsland(); buildLetter();
    $('#rotate').textContent = COPY.rotate;
    const mute = $('#mute');
    function paintMute() { mute.innerHTML = Art.speaker(!Sfx.isMuted()); mute.setAttribute('aria-label', COPY.sound[Sfx.isMuted() ? 1 : 0]); }
    paintMute();
    onTap(mute, function (e) { e.stopPropagation(); Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); paintMute(); });
    ['pointerdown', 'pointerup', 'click', 'keydown'].forEach(function (ev) { document.addEventListener(ev, Sfx.unlock, { passive: true }); });
    const finger = document.createElement('div');
    finger.id = 'finger'; finger.innerHTML = Art.finger(); stage.appendChild(finger);
    let idleSince = Date.now(), lastNode = null;
    document.addEventListener('pointerdown', function () { idleSince = Date.now(); finger.classList.remove('show'); }, { passive: true, capture: true });
    // if she waits a moment, a little finger shows exactly what to tap
    setInterval(function () {
      const node = Game.running() || current === 'letter' ? null : tapNode();
      const t = node ? window.__card.nextTap() : null;
      if (node !== lastNode) { lastNode = node; idleSince = Date.now(); }
      if (t && Date.now() - idleSince > 2600) {
        const s = stage.getBoundingClientRect();
        finger.style.transform = 'translate3d(' + (t.x - s.left) + 'px,' + (t.y - s.top) + 'px,0)';
        finger.classList.add('show');
      } else finger.classList.remove('show');
    }, 300);
    document.addEventListener('visibilitychange', function () { if (document.hidden) Sfx.pause(); else Sfx.resume(); });
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', function () { setTimeout(measure, 250); });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });
    go('gift');
  }
  boot();
})();
