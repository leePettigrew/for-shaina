/* GAME: the journey. An auto-runner you cannot lose: tap to hop, tap again in the air to hop twice. */
(function () {
  'use strict';
  const SPEED = 52;                 // world units per second (1 unit = 1% of the stage width)
  const LEN = SPEED * 19;           // every stage is the same fixed distance: about 19 seconds
  const GRAV = 330, JUMP = 128, JUMP2 = 108;
  const PX = 18, PW = 30;           // where the cat stands on screen, and how big he is
  const STAGES = {
    ireland: { idx: 0, special: 'coffee', obs: ['sheep'], cls: 'st-ireland', ground: 0.79 },
    sea: { idx: 1, special: 'bear', obs: ['wave'], cls: 'st-sea', ground: 0.81, boat: true },
    philippines: { idx: 2, special: 'rose', obs: ['crab', 'castle'], cls: 'st-philippines', ground: 0.79 },
  };
  // drawing size (w, h) and the much smaller, kinder hitbox (hw, hh)
  const SIZE = {
    sheep: { w: 21, h: 17.5, hw: 10, hh: 9.5 }, wave: { w: 19, h: 16, hw: 8, hh: 9.5 },
    crab: { w: 18, h: 13.5, hw: 9, hh: 6.5 }, castle: { w: 17, h: 14, hw: 9, hh: 9.5 },
    heart: { w: 8.5, h: 8.5 }, coffee: { w: 12.5, h: 12.5 }, bear: { w: 13, h: 13 }, rose: { w: 13, h: 13 }, shamrock: { w: 7, h: 7 },
  };
  const ROSES = ['#ffc1d6', '#d5c3ff', '#ffd9b8', '#fff1b8', '#ffc1d6'];

  let root = null, el = {}, st = null, raf = 0, last = 0, U = 3.9, W = 390, H = 844;

  function h(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }

  function mount(section) {
    root = section;
    root.innerHTML = '';
    el.sky = root.appendChild(h('div', 'g-sky'));
    el.far = root.appendChild(h('div', 'g-layer g-far'));
    el.mid = root.appendChild(h('div', 'g-layer g-mid'));
    el.ground = root.appendChild(h('div', 'g-ground'));
    el.shadow = root.appendChild(h('div', 'g-shadow'));
    el.world = root.appendChild(h('div', 'g-world'));
    el.goal = root.appendChild(h('div', 'goal is-wave'));
    el.player = root.appendChild(h('div', 'g-player'));
    el.player.innerHTML = '<div class="p-in">' + Art.cat({ scarf: true, bag: true }) + '<div class="p-boat">' + Art.boat() + '</div></div>';
    el.pin = el.player.firstChild;
    el.boat = el.pin.querySelector('.p-boat');
    el.front = root.appendChild(h('div', 'g-front'));
    el.hud = root.appendChild(h('div', 'hud'));
    el.hud.innerHTML = '<div class="route"><div class="route-line"></div><div class="route-flag a">' + Art.shamrock() + '</div><div class="route-flag b">' + Art.penguinFace() + '</div><div class="route-cat">' + Art.catFace() + '</div></div>' +
      '<div class="counts">' + ['coffee', 'bear', 'rose', 'heart'].map(function (k) {
        return '<div class="count" data-k="' + k + '">' + (k === 'heart' ? Art.heart() : Art[k]()) + '<span>0</span></div>';
      }).join('') + '</div>';
    el.hud.querySelector('.route-flag.a').style.width = 'calc(var(--u) * 7.5)';
    el.routeCat = el.hud.querySelector('.route-cat');
    el.banner = root.appendChild(h('div', 'g-banner'));
    el.hint = root.appendChild(h('div', 'g-hint', Art.finger() + '<span></span>'));
    el.quip = root.appendChild(h('div', 'g-quip'));
    root.addEventListener('pointerdown', function (e) { if (st && st.on) { e.preventDefault(); hop(); } });
    document.addEventListener('keydown', function (e) {
      if (st && st.on && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter')) { e.preventDefault(); hop(); }
    });
  }

  function measure() {
    if (!root) return;
    W = root.clientWidth || 390; H = root.clientHeight || 844;
    U = Math.min(W / 100, H / 178);
  }

  /* ---------- the level: the same friendly layout every time ---------- */
  function buildLevel(def) {
    const L = [];
    const gaps = [112, 126, 108, 134, 118, 122, 110];
    const obsX = [];
    let x = SPEED * 3.5, i = 0;
    while (x < LEN - 120) { obsX.push(x); x += gaps[i % gaps.length]; i++; }
    obsX.forEach(function (ox, k) {
      const kind = def.obs[k % def.obs.length];
      L.push({ t: 'ob', kind: kind, x: ox, y: 0 });
      const cx = ox + SIZE[kind].w / 2 - SIZE.heart.w / 2;
      [[-15, 20], [0, 28], [15, 20]].forEach(function (p) { L.push({ t: 'pick', kind: 'heart', x: cx + p[0], y: p[1] }); });
    });
    const highs = [29, 10, 35];
    let s = 0;
    for (let k = 0; k < obsX.length - 1; k++) {
      const mid = (obsX[k] + 21 + obsX[k + 1]) / 2 - 6;
      if (k % 2 === 0) { L.push({ t: 'pick', kind: def.special, x: mid, y: highs[s % highs.length] }); s++; }
      else [-10, 0, 10].forEach(function (dx) { L.push({ t: 'pick', kind: 'heart', x: mid + dx, y: 9 }); });
    }
    [66, 78, 90].forEach(function (hx) { L.push({ t: 'pick', kind: 'heart', x: hx, y: 9 }); });
    L.push({ t: 'pick', kind: def.special, x: 128, y: 9 });
    L.push({ t: 'pick', kind: def.special, x: LEN - 52, y: 9 });      // always on his path: nobody arrives empty-handed
    if (def.idx === 0) for (let d = 40; d < LEN + 100; d += 74) L.push({ t: 'decor', kind: 'shamrock', x: d, y: -1 });
    return L;
  }

  function deco(layer, html, cls, leftPct, pos, widthU) {
    for (let k = 0; k < 2; k++) {
      const d = h('div', cls || '', html || '');
      d.style.left = (k * 50 + leftPct / 2) + '%';
      d.style.width = 'calc(var(--u) * ' + widthU + ')';
      Object.keys(pos).forEach(function (p) { d.style[p] = pos[p]; });
      layer.appendChild(d);
    }
  }

  function scenery(id) {
    el.far.innerHTML = ''; el.mid.innerHTML = '';
    if (id === 'ireland') {
      deco(el.far, Art.rainbow(), '', 44, { top: '25%' }, 64);
      deco(el.far, Art.cloud(), '', 6, { top: '19%' }, 30);
      deco(el.far, Art.cloud(), '', 62, { top: '33%' }, 22);
      deco(el.far, '<i style="left:12%"></i><i style="left:34%;animation-delay:-.3s"></i><i style="left:56%;animation-delay:-.55s"></i><i style="left:78%;animation-delay:-.15s"></i>', 'drizzle', 8, { top: 'calc(19% + var(--u) * 14)', height: 'calc(var(--u) * 12)' }, 26);
      [[-6, 70, 20, '#bfeec8'], [38, 84, 26, '#b2e8bd'], [84, 64, 17, '#bfeec8']].forEach(function (p) {
        deco(el.mid, '', 'hill', p[0], { height: 'calc(var(--u) * ' + p[2] + ')', background: p[3] }, p[1]);
      });
    } else if (id === 'sea') {
      deco(el.far, '', 'sun', 62, { top: '20%', height: 'calc(var(--u) * 15)' }, 15);
      deco(el.far, Art.cloud(), '', 8, { top: '24%' }, 28);
      deco(el.far, Art.cloud(), '', 48, { top: '36%' }, 20);
      [[10, 44, 9, '#d9c7ff'], [66, 30, 6, '#c9f2e0']].forEach(function (p) {
        deco(el.mid, '', 'hill', p[0], { height: 'calc(var(--u) * ' + p[2] + ')', background: p[3], bottom: '19%' }, p[1]);
      });
    } else {
      deco(el.far, '', 'sun', 16, { top: '49%', height: 'calc(var(--u) * 24)' }, 24);
      deco(el.far, Art.cloud(), '', 50, { top: '22%' }, 26);
      deco(el.far, Art.cloud(), '', 4, { top: '32%' }, 18);
      deco(el.mid, Art.palm(), '', 8, { bottom: '20%' }, 34);
      deco(el.mid, Art.palm(), '', 62, { bottom: '20%' }, 26);
    }
  }

  function start(id, opts) {
    stop();
    const def = STAGES[id];
    if (!def || !root) return;
    measure();
    root.classList.remove('st-ireland', 'st-sea', 'st-philippines');
    root.classList.add(def.cls);
    scenery(id);
    el.world.innerHTML = '';
    const ents = buildLevel(def).map(function (it, n) {
      const sz = SIZE[it.kind];
      const d = h('div', 'g-ent ' + it.kind + (it.t === 'pick' ? ' pick' : ''));
      d.innerHTML = it.kind === 'heart' ? Art.heart() : it.kind === 'rose' ? Art.rose(ROSES[n % ROSES.length]) : Art[it.kind]();
      d.style.width = 'calc(var(--u) * ' + sz.w + ')';
      d.style.display = 'none';
      if (it.t === 'pick') d.firstChild.style.animationDelay = (-(n % 5) * 0.23) + 's';
      el.world.appendChild(d);
      return { t: it.t, kind: it.kind, x: it.x, y: it.y, w: sz.w, h: sz.h, hw: sz.hw || sz.w, hh: sz.hh || sz.h, el: d, vis: false, done: false };
    });
    el.player.classList.toggle('boating', !!def.boat);
    el.boat.style.display = def.boat ? 'block' : 'none';
    el.player.style.width = 'calc(var(--u) * ' + PW + ')';
    el.goal.innerHTML = def.idx === 2 ? Art.penguin() : '';
    el.goal.style.width = 'calc(var(--u) * 27)';
    el.goal.style.display = def.idx === 2 ? 'block' : 'none';
    const C = window.COPY || {};
    const text = (C.stages && C.stages[id]) || { name: '', line: '', clear: '' };
    st = {
      on: true, id: id, def: def, ents: ents, opts: opts || {}, text: text,
      camX: 0, py: 0, vy: 0, ground: true, jumps: 0, buffer: 0, sq: 0, stun: 0, inv: 0, t: 0,
      phase: 'run', outT: 0, extraX: 0, hopped: false, streak: 0, lastPick: -9, quipN: 0, mode: '',
      counts: (opts && opts.counts) || { coffee: 0, bear: 0, rose: 0, heart: 0 },
    };
    banner(text.name, text.line, 3100);
    el.hint.querySelector('span').textContent = C.hop || 'tap to hop!';
    el.hint.classList.toggle('show', def.idx === 0);
    el.quip.classList.remove('show');
    syncCounts();
    last = performance.now();
    render();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (st) { st.on = false; clearTimeout(st.bannerT); clearTimeout(st.quipT); }
    st = null;
    if (el.banner) el.banner.classList.remove('show');
    if (el.hint) el.hint.classList.remove('show');
  }

  function banner(title, line, ms) {
    el.banner.innerHTML = '<b></b><span></span>';
    el.banner.firstChild.textContent = title || '';
    el.banner.lastChild.textContent = line || '';
    el.banner.lastChild.style.display = line ? 'block' : 'none';
    el.banner.classList.add('show');
    clearTimeout(st.bannerT);
    st.bannerT = setTimeout(function () { el.banner.classList.remove('show'); }, ms);
  }

  function syncCounts() {
    el.hud.querySelectorAll('.count').forEach(function (c) { c.lastChild.textContent = st.counts[c.dataset.k] || 0; });
  }

  function hop() {
    if (!st || !st.on || st.phase !== 'run') return;
    if (!st.hopped) { st.hopped = true; el.hint.classList.remove('show'); }
    if (st.ground) {
      st.vy = JUMP; st.jumps = 1; st.ground = false; st.py = 0.01; st.sq = 0.2;
      Sfx.play('hop'); puff(st.def.boat);
    } else if (st.jumps < 2) {
      st.vy = JUMP2; st.jumps = 2; st.sq = 0.16;
      Sfx.play('hop2');
      fx('ring', (PX + PW / 2) * U, groundY() - st.py * U - PW * U * 0.2);
    } else {
      st.buffer = 0.16;
    }
  }

  function groundY() { return H * st.def.ground; }
  function fx(kind, x, y, extra) { if (st && st.opts.fx) st.opts.fx(kind, x, y, extra); }
  function puff(water) { fx(water ? 'splash' : 'dust', (PX + PW * 0.45) * U, groundY()); }

  function bonk(e) {
    st.stun = 0.45; st.inv = 1.3; st.sq = -0.26;
    e.el.classList.remove('bonk'); void e.el.offsetWidth; e.el.classList.add('bonk');
    Sfx.play('thud'); Sfx.buzz(25);
    fx('stars', (PX + PW * 0.7) * U, groundY() - st.py * U - PW * U * 0.6);
    const quips = (window.COPY && window.COPY.quips) || [];
    if (quips.length) {
      el.quip.textContent = quips[st.quipN % quips.length]; st.quipN++;
      el.quip.classList.add('show');
      clearTimeout(st.quipT);
      st.quipT = setTimeout(function () { el.quip.classList.remove('show'); }, 1200);
    }
  }

  function collect(e) {
    e.done = true;
    const sx = (e.x - st.camX) * U, sy = groundY() - (e.y + e.h) * U;
    e.el.classList.add('got');
    e.el.style.transform = 'translate3d(' + sx + 'px,' + (sy - 9 * U) + 'px,0) scale(1.5)';
    st.counts[e.kind] = (st.counts[e.kind] || 0) + 1;
    const chip = el.hud.querySelector('.count[data-k="' + e.kind + '"]');
    if (chip) { chip.lastChild.textContent = st.counts[e.kind]; chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); }
    if (e.kind === 'heart') {
      st.streak = (st.t - st.lastPick < 1.3) ? st.streak + 1 : 0;
      Sfx.play('heart', st.streak);
    } else {
      Sfx.play('gift'); Sfx.buzz(12);
    }
    st.lastPick = st.t;
    fx(e.kind === 'heart' ? 'pick' : 'gift', sx + e.w * U / 2, sy + e.h * U / 2);
  }

  function update(dt) {
    const def = st.def;
    st.t += dt;
    if (st.stun > 0) st.stun -= dt;
    if (st.inv > 0) st.inv -= dt;
    if (st.buffer > 0) st.buffer -= dt;
    if (st.phase === 'run') {
      st.camX += SPEED * (st.stun > 0 ? 0.35 : 1) * dt;
      if (!st.hopped && st.t > 7) el.hint.classList.remove('show');
      if (st.camX >= LEN) {
        st.camX = LEN; st.phase = 'outro'; st.outT = 0;
        banner(st.text.clear, '', 2400);
        Sfx.play('open');
        el.hint.classList.remove('show');
      }
    } else {
      st.outT += dt;
      st.extraX = Math.min(st.extraX + SPEED * 1.15 * dt, def.idx === 2 ? 13 : 120);
      if (st.outT > 1.9) { const done = st.opts.onDone; const id = st.id; stop(); if (done) done(id); return false; }
    }
    // hop physics
    st.vy -= GRAV * dt;
    st.py += st.vy * dt;
    if (st.py <= 0) {
      if (!st.ground && st.vy < -30) { st.sq = -0.2; Sfx.play('land'); puff(def.boat); }
      st.py = 0; st.vy = 0; st.ground = true; st.jumps = 0;
      if (st.buffer > 0) { st.buffer = 0; hop(); }
    }
    st.sq *= Math.pow(0.0008, dt);
    // touching things
    if (st.phase === 'run') {
      const px0 = st.camX + PX + 8, px1 = st.camX + PX + 22, py0 = st.py, py1 = st.py + 22;
      for (let i = 0; i < st.ents.length; i++) {
        const e = st.ents[i];
        if (e.done || e.t === 'decor') continue;
        if (e.x > px1 + 3 || e.x + e.w < px0 - 3) continue;
        if (e.t === 'ob') {
          const hx0 = e.x + (e.w - e.hw) / 2;
          if (st.inv <= 0 && px1 > hx0 && px0 < hx0 + e.hw && py0 < e.hh) bonk(e);
        } else if (py1 + 1 > e.y && py0 - 1 < e.y + e.h) {
          collect(e);
        }
      }
    }
    return true;
  }

  function render() {
    const gy = groundY();
    const sink = st.def.boat ? 2.2 * U + Math.sin(st.t * 3.2) * 0.5 * U : 0;
    const x = (PX + st.extraX) * U;
    const y = gy - PW * U * 0.975 - st.py * U + sink;
    el.player.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    const tilt = st.ground ? (st.def.boat ? Math.sin(st.t * 3.2) * 3 : 0) : Math.max(-14, Math.min(14, -st.vy * 0.08));
    el.pin.style.transform = 'rotate(' + tilt.toFixed(2) + 'deg) scale(' + (1 - st.sq * 0.7).toFixed(3) + ',' + (1 + st.sq).toFixed(3) + ')';
    const mode = st.stun > 0 ? 'is-happy' : st.ground ? (st.def.boat ? '' : 'is-run') : 'is-air';
    if (mode !== st.mode) { el.player.classList.remove('is-run', 'is-air', 'is-happy'); if (mode) el.player.classList.add(mode); st.mode = mode; }
    el.player.classList.toggle('blink', st.inv > 0);
    const sw = Math.max(8, 19 - st.py * 0.28) * U;
    el.shadow.style.display = st.def.boat ? 'none' : 'block';
    el.shadow.style.width = sw + 'px';
    el.shadow.style.transform = 'translate3d(' + (x + PW * U / 2 - sw / 2) + 'px,' + (gy - 1.2 * U) + 'px,0)';
    if (el.quip.classList.contains('show')) el.quip.style.transform = 'translate3d(' + (x + PW * U * 0.55) + 'px,' + (y - 7 * U) + 'px,0)';
    const right = W / U + 12;
    for (let i = 0; i < st.ents.length; i++) {
      const e = st.ents[i];
      if (e.done) { if (e.vis && e.x - st.camX < -40) { e.el.style.display = 'none'; e.vis = false; } continue; }
      const sx = e.x - st.camX;
      const on = sx > -32 && sx < right;
      if (on !== e.vis) { e.el.style.display = on ? 'block' : 'none'; e.vis = on; }
      if (on) e.el.style.transform = 'translate3d(' + (sx * U).toFixed(1) + 'px,' + (gy - (e.y + e.h) * U).toFixed(1) + 'px,0)';
    }
    const cam = st.camX * U;
    el.ground.style.backgroundPositionX = (-(cam % 96)).toFixed(1) + 'px';
    el.far.style.transform = 'translate3d(' + (-(cam * 0.12) % W).toFixed(1) + 'px,0,0)';
    el.mid.style.transform = 'translate3d(' + (-(cam * 0.34) % W).toFixed(1) + 'px,0,0)';
    if (st.def.boat) el.front.style.transform = 'translate3d(' + (-(cam * 1.25) % 40).toFixed(1) + 'px,' + (Math.sin(st.t * 2.4) * 3).toFixed(1) + 'px,0)';
    if (st.def.idx === 2) el.goal.style.transform = 'translate3d(' + ((LEN + 60 - st.camX) * U).toFixed(1) + 'px,' + (gy - 27 * U * 0.97) + 'px,0)';
    const p = (st.def.idx + Math.min(st.camX / LEN, 1)) / 3;
    el.routeCat.style.left = (13 + p * 74) + '%';
  }

  function frame(now) {
    if (!st || !st.on) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    if (document.hidden) return;
    if (update(dt) !== false && st) render();
  }

  window.Game = { mount: mount, start: start, stop: stop, hop: hop, measure: measure, running: function () { return !!(st && st.on); } };
})();
