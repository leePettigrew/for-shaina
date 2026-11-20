/* AUDIO: a tiny music box and sound effects, made with the Web Audio API (no files). */
(function () {
  'use strict';
  let ctx = null, master = null, sfxBus = null, musicBus = null;
  let muted = false, timer = null, track = null, noiseBuf = null, primed = false;
  try { muted = localStorage.getItem('forShaina.muted') === '1'; } catch (e) { /* private mode */ }

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      // let the music box be heard even when an iPhone's ringer switch is on silent, as videos are;
      // nothing plays before her first tap and the mute button still works
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older browsers */ }
      ctx = new AC();
      // after a phone call or an app switch, pick the sound back up when the browser allows it
      ctx.onstatechange = function () { if (primed && !document.hidden) resume(); };
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
      // a soft echo so the music box rings a little
      const delay = ctx.createDelay(1); delay.delayTime.value = 0.29;
      const fb = ctx.createGain(); fb.gain.value = 0.26;
      const wet = ctx.createGain(); wet.gain.value = 0.3;
      musicBus.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      const len = Math.floor(ctx.sampleRate * 0.5);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
    return ctx;
  }

  // Must be called from inside a tap handler: browsers only start audio on a gesture.
  function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === 'running' && primed) return;
    try {
      if (c.state !== 'running') { const p = c.resume(); if (p && p.catch) p.catch(function () { /* the next tap tries again */ }); }
      const b = c.createBufferSource(); b.buffer = c.createBuffer(1, 1, 22050); b.connect(c.destination); b.start(0);
      primed = true;
    } catch (e) { /* carry on silently */ }
  }

  function ready() { return !!ctx && ctx.state === 'running'; }
  function live() { return !!ctx && (ctx.state === 'running' || ctx.state === 'suspended') && !document.hidden; }

  function tone(f0, f1, dur, vol, type, when, bus) {
    if (!live()) return;
    const t = (when || ctx.currentTime);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + dur + 0.03);
  }

  // one music-box note: a bell-like pluck
  function box(midi, when, vol, bus, ring) {
    if (!live()) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const t = when || ctx.currentTime;
    const dur = ring || 1.5;
    [[1, 1], [2, 0.32], [3.01, 0.1], [4.2, 0.04]].forEach(function (p) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * p[0];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * p[1], t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / p[0] + 0.2);
      o.connect(g); g.connect(bus || musicBus);
      o.start(t); o.stop(t + dur / p[0] + 0.25);
    });
  }

  function noise(dur, vol, freq, q, when) {
    if (!live() || !noiseBuf) return;
    const t = when || ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1200; f.Q.value = q || 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const FX = {
    tap: function () { tone(880, 620, 0.07, 0.1, 'sine'); },
    pop: function () { tone(520, 1040, 0.09, 0.16, 'sine'); noise(0.06, 0.05, 2400, 1); },
    hop: function () { tone(440, 820, 0.13, 0.13, 'sine'); },
    hop2: function () { tone(620, 1180, 0.13, 0.12, 'sine'); },
    land: function () { tone(180, 120, 0.07, 0.06, 'sine'); },
    thud: function () { tone(190, 70, 0.2, 0.2, 'sine'); noise(0.12, 0.08, 400, 0.7); },
    heart: function (step) { box(79 + PENTA[Math.min(step || 0, PENTA.length - 1)], 0, 0.14, sfxBus, 0.5); },
    gift: function () { const t = ctx ? ctx.currentTime : 0; [84, 88, 91, 96].forEach(function (m, i) { box(m, t + i * 0.07, 0.15, sfxBus, 0.7); }); },
    shake: function () { noise(0.12, 0.07, 900, 2); tone(300, 240, 0.08, 0.08, 'triangle'); },
    open: function () { const t = ctx ? ctx.currentTime : 0; [72, 76, 79, 84, 88, 91, 96, 100].forEach(function (m, i) { box(m, t + i * 0.055, 0.15, sfxBus, 0.9); }); noise(0.3, 0.07, 3000, 0.6); },
    puff: function () { noise(0.28, 0.12, 700, 0.6); tone(500, 200, 0.2, 0.04, 'sine'); },
    cheer: function () { const t = ctx ? ctx.currentTime : 0; [72, 76, 79, 84].forEach(function (m) { box(m, t, 0.14, sfxBus, 1.6); }); [88, 91, 96].forEach(function (m, i) { box(m, t + 0.12 + i * 0.08, 0.12, sfxBus, 1.2); }); noise(0.5, 0.06, 4000, 0.5); },
    mew: function () { const t = ctx ? ctx.currentTime : 0; tone(760, 1150, 0.12, 0.1, 'triangle', t); tone(1150, 820, 0.2, 0.1, 'triangle', t + 0.12); },
    squeak: function () { const t = ctx ? ctx.currentTime : 0; tone(1250, 1600, 0.07, 0.1, 'sine', t); tone(1500, 1900, 0.09, 0.1, 'sine', t + 0.09); },
    purr: function () {
      if (!live()) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 55; l.frequency.value = 24; lg.gain.value = 0.05;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
      l.connect(lg); lg.connect(g.gain); o.connect(f); f.connect(g); g.connect(sfxBus);
      o.start(t); l.start(t); o.stop(t + 1); l.stop(t + 1);
    },
    kiss: function () { const t = ctx ? ctx.currentTime : 0; box(88, t, 0.15, sfxBus, 0.6); box(93, t + 0.1, 0.15, sfxBus, 0.8); },
  };

  function play(name, arg) {
    if (!live() || muted) return;
    try { if (FX[name]) FX[name](arg); } catch (e) { /* never let a sound break the card */ }
  }

  /* ----- music: [midi, beats] melodies scheduled a little ahead of time ----- */
  const TRACKS = {
    // a gentle wandering pattern for the story and the journey (not the birthday tune)
    loop: { bpm: 104, vol: 0.075, gap: 0, notes: [[77, 0.5], [81, 0.5], [84, 0.5], [89, 0.5], [84, 0.5], [81, 0.5], [79, 0.5], [82, 0.5], [86, 0.5], [91, 0.5], [86, 0.5], [82, 0.5], [77, 0.5], [81, 0.5], [84, 0.5], [89, 0.5], [84, 0.5], [81, 0.5], [72, 0.5], [76, 0.5], [79, 0.5], [84, 0.5], [79, 0.5], [76, 0.5]], bass: [] },
    // "Happy Birthday to You"
    birthday: { bpm: 104, vol: 0.2, gap: 3, notes: [[79, 0.75], [79, 0.25], [81, 1], [79, 1], [84, 1], [83, 2], [79, 0.75], [79, 0.25], [81, 1], [79, 1], [86, 1], [84, 2], [79, 0.75], [79, 0.25], [91, 1], [88, 1], [84, 1], [83, 1], [81, 2], [89, 0.75], [89, 0.25], [88, 1], [84, 1], [86, 1], [84, 3]], bass: [[1, 60], [1, 64], [4, 55], [4, 62], [7, 55], [7, 59], [10, 60], [10, 64], [13, 60], [13, 67], [16, 55], [17, 53], [17, 60], [20, 60], [20, 64], [22, 55], [23, 60], [23, 64], [23, 67]] },
  };

  function music(kind) {
    if (timer) { clearInterval(timer); timer = null; }
    track = null;
    if (!kind || !TRACKS[kind]) return;
    track = { def: TRACKS[kind], kind: kind, i: 0, next: 0, beat: 0, round: 0, started: false };
    timer = setInterval(pump, 70);
    pump();
  }
  function pump() {
    if (!track || !ready()) return;
    const d = track.def, spb = 60 / d.bpm;
    if (!track.started) { track.started = true; track.next = ctx.currentTime + 0.12; }
    if (track.next < ctx.currentTime - 0.5) track.next = ctx.currentTime + 0.05; // after a pause, do not machine-gun old notes
    while (track.next < ctx.currentTime + 0.3) {
      const n = d.notes[track.i];
      const vol = d.vol * (track.round > 0 && track.kind === 'birthday' ? 0.6 : 1);
      box(n[0], track.next, vol, musicBus, 1.6);
      for (let b = 0; b < d.bass.length; b++) {
        if (d.bass[b][0] >= track.beat - 0.001 && d.bass[b][0] < track.beat + n[1] - 0.001) {
          box(d.bass[b][1], track.next + (d.bass[b][0] - track.beat) * spb, vol * 0.5, musicBus, 1.8);
        }
      }
      track.next += n[1] * spb; track.beat += n[1]; track.i++;
      if (track.i >= d.notes.length) { track.i = 0; track.beat = 0; track.round++; track.next += d.gap * spb; }
    }
  }

  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem('forShaina.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.03);
  }
  function musicLevel(v) { if (musicBus && ctx) musicBus.gain.setTargetAtTime(v, ctx.currentTime, 0.4); }
  function pause() { if (ctx && ctx.state === 'running') { try { ctx.suspend(); } catch (e) { /* ignore */ } } }
  function resume() {
    if (!ctx || ctx.state === 'running' || ctx.state === 'closed') return;
    try { const p = ctx.resume(); if (p && p.catch) p.catch(function () { /* needs a tap first */ }); } catch (e) { /* ignore */ }
  }
  function buzz(ms) { try { if (!muted && navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { /* ignore */ } }

  window.Sfx = { unlock, play, music, setMuted, isMuted: function () { return muted; }, musicLevel, pause, resume, buzz, kind: function () { return track ? track.kind : null; } };
})();
