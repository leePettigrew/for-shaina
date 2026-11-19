/* ART: every drawing in the card, as functions that return SVG markup. */
(function () {
  'use strict';
  const INK = '#5b4a66';
  const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const S3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

  function svg(viewBox, cls, inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="art ${cls}" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /* ---------- the cats (orange = Lee, grey = Sansa) ---------- */
  const CATS = {
    orange: { fur: '#f9a95f', dark: '#e9873c', light: '#fff2df', ear: '#ffb3c6' },
    grey: { fur: '#b3b9c9', dark: '#959cb0', light: '#eceef4', ear: '#f7c4d2' },
  };

  function cat(o) {
    o = o || {};
    const c = CATS[o.grey ? 'grey' : 'orange'];
    let s = '';
    // tail
    s += `<g class="p-tail"><path d="M128 160 q46 4 42 -34 q-3 -18 -18 -12" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
      <path d="M128 160 q46 4 42 -34 q-3 -18 -18 -12" fill="none" stroke="${c.fur}" stroke-width="15" stroke-linecap="round"/>
      ${o.grey ? '' : `<path d="M164 147 h13 M165 132 h12" stroke="${c.dark}" stroke-width="6" stroke-linecap="round"/>`}</g>`;
    // legs
    s += `<g class="p-leg p-leg-l"><ellipse cx="82" cy="186" rx="13" ry="9" fill="${c.fur}" ${S}/></g>
      <g class="p-leg p-leg-r"><ellipse cx="118" cy="186" rx="13" ry="9" fill="${c.fur}" ${S}/></g>`;
    // body
    s += `<g class="p-body"><ellipse cx="100" cy="152" rx="40" ry="36" fill="${c.fur}" ${S}/>
      <ellipse cx="100" cy="160" rx="23" ry="21" fill="${c.light}"/></g>`;
    // satchel
    if (o.bag) {
      s += `<g class="p-bag"><path d="M132 118 L66 158" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
        <path d="M132 118 L66 158" fill="none" stroke="#c9905c" stroke-width="5" stroke-linecap="round"/>
        <rect x="44" y="148" width="34" height="30" rx="8" fill="#d9a06b" ${S}/>
        <path d="M44 158 q17 12 34 0" fill="none" ${S3}/>
        <path d="M61 166 c-3 -4 -8 0 -4 4 l4 4 l4 -4 c4 -4 -1 -8 -4 -4z" fill="#ff9fc0"/></g>`;
    }
    // arms
    s += `<g class="p-arm p-arm-l"><ellipse cx="62" cy="148" rx="10" ry="14" transform="rotate(20 62 148)" fill="${c.fur}" ${S}/></g>
      <g class="p-arm p-arm-r"><ellipse cx="138" cy="148" rx="10" ry="14" transform="rotate(-20 138 148)" fill="${c.fur}" ${S}/></g>`;
    // scarf
    if (o.scarf) {
      s += `<g class="p-scarf"><rect x="116" y="122" width="16" height="30" rx="7" transform="rotate(-12 124 124)" fill="#7fd39a" ${S}/>
        <rect x="60" y="112" width="80" height="18" rx="9" fill="#8fdcA6" ${S}/>
        <path d="M78 114 v14 M100 114 v14 M122 114 v14" stroke="#6cc088" stroke-width="3" stroke-linecap="round"/></g>`;
    }
    // head
    s += `<g class="p-head">
      <path d="M46 52 L54 6 L92 34 Z" fill="${c.fur}" ${S}/><path d="M152 52 L146 6 L108 34 Z" fill="${c.fur}" ${S}/>
      <path d="M58 40 L60 20 L76 33 Z" fill="${c.ear}"/><path d="M142 40 L140 20 L124 33 Z" fill="${c.ear}"/>
      <ellipse cx="100" cy="78" rx="64" ry="54" fill="${c.fur}" ${S}/>
      ${o.grey ? '' : `<path d="M100 28 v15 M82 31 l4 13 M118 31 l-4 13" stroke="${c.dark}" stroke-width="7" stroke-linecap="round"/>
      <path d="M40 76 h11 M41 89 h9 M160 76 h-11 M159 89 h-9" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`}
      <ellipse cx="100" cy="98" rx="31" ry="22" fill="${c.light}"/>
      <ellipse class="p-blush" cx="54" cy="100" rx="11" ry="7" fill="#ff9fb8" opacity=".75"/>
      <ellipse class="p-blush" cx="146" cy="100" rx="11" ry="7" fill="#ff9fb8" opacity=".75"/>
      <g class="p-eye"><circle cx="72" cy="82" r="11" fill="#3d3148"/><circle cx="76" cy="78" r="4.2" fill="#fff"/><circle cx="68.500" cy="86" r="2" fill="#fff"/></g>
      <g class="p-eye"><circle cx="128" cy="82" r="11" fill="#3d3148"/><circle cx="132" cy="78" r="4.2" fill="#fff"/><circle cx="124.500" cy="86" r="2" fill="#fff"/></g>
      <path class="p-eye-shut" d="M62 84 q10 8 20 0 M118 84 q10 8 20 0" fill="none" ${S3}/>
      <path class="p-eye-happy" d="M62 86 q10 -12 20 0 M118 86 q10 -12 20 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M94 92 h12 l-6 7 z" fill="#ff8fa8" ${S3}/>
      <path class="p-mouth" d="M100 99 q-6 10 -14 3 M100 99 q6 10 14 3" fill="none" ${S3}/>
      <path class="p-mouth-open" d="M92 103 q8 12 16 0 z" fill="#ff8fa8" ${S3}/>
    </g>`;
    return svg('0 0 200 200', 'cat' + (o.grey ? ' cat-grey' : ' cat-orange'), s);
  }

  /* ---------- the penguin (Shaina) ---------- */
  function penguin() {
    const body = '#6473ab', white = '#fffdf8', beak = '#ffb35c', foot = '#ffbb7c';
    let s = '';
    s += `<g class="p-foot p-foot-l"><ellipse cx="76" cy="188" rx="18" ry="8" fill="${foot}" ${S}/></g>
      <g class="p-foot p-foot-r"><ellipse cx="124" cy="188" rx="18" ry="8" fill="${foot}" ${S}/></g>`;
    s += `<g class="p-flip p-flip-l"><ellipse cx="33" cy="126" rx="13" ry="32" transform="rotate(16 33 126)" fill="${body}" ${S}/></g>
      <g class="p-flip p-flip-r"><ellipse cx="167" cy="126" rx="13" ry="32" transform="rotate(-16 167 126)" fill="${body}" ${S}/></g>`;
    s += `<g class="p-body">
      <path d="M100 22 C150 22 168 70 168 116 C168 160 140 186 100 186 C60 186 32 160 32 116 C32 70 50 22 100 22 Z" fill="${body}" ${S}/>
      <path d="M100 66 C86 42 48 52 53 88 C55 102 62 106 61 120 C56 152 74 178 100 178 C126 178 144 152 139 120 C138 106 145 102 147 88 C152 52 114 42 100 66 Z" fill="${white}"/>
    </g>`;
    s += `<g class="p-face">
      <ellipse class="p-blush" cx="62" cy="108" rx="10" ry="6.500" fill="#ff9fb8" opacity=".8"/>
      <ellipse class="p-blush" cx="138" cy="108" rx="10" ry="6.500" fill="#ff9fb8" opacity=".8"/>
      <g class="p-eye"><circle cx="78" cy="92" r="10.500" fill="#3d3148"/><circle cx="82" cy="88" r="4" fill="#fff"/><circle cx="75" cy="96" r="2" fill="#fff"/>
        <path d="M68 86 l-6 -4 M71 82 l-4 -6" fill="none" ${S3}/></g>
      <g class="p-eye"><circle cx="122" cy="92" r="10.500" fill="#3d3148"/><circle cx="126" cy="88" r="4" fill="#fff"/><circle cx="119" cy="96" r="2" fill="#fff"/>
        <path d="M132 86 l6 -4 M129 82 l4 -6" fill="none" ${S3}/></g>
      <path class="p-eye-shut" d="M68 94 q10 8 20 0 M112 94 q10 8 20 0" fill="none" ${S3}/>
      <path class="p-eye-happy" d="M68 96 q10 -12 20 0 M112 96 q10 -12 20 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <g class="p-sparkle" fill="#fff"><path d="M82 82 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/><path d="M126 82 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g>
      <path class="p-beak" d="M89 104 Q100 98 111 104 Q100 118 89 104 Z" fill="${beak}" ${S3}/>
    </g>`;
    s += `<g class="p-bow" transform="rotate(14 130 36)">
      <path d="M130 38 C114 20 100 30 104 44 C106 54 120 50 130 38 Z" fill="#ffb3d1" ${S3}/>
      <path d="M130 38 C146 20 160 30 156 44 C154 54 140 50 130 38 Z" fill="#ffb3d1" ${S3}/>
      <circle cx="130" cy="38" r="6.500" fill="#ff8fbb" ${S3}/></g>`;
    return svg('0 0 200 200', 'penguin', s);
  }

  /* ---------- little faces for the route bar and the map ---------- */
  function catFace() {
    return svg('0 0 100 100', 'face', `<path d="M16 34 L22 6 L46 22 Z M84 34 L78 6 L54 22 Z" fill="#f9a95f" ${S}/>
      <ellipse cx="50" cy="54" rx="40" ry="34" fill="#f9a95f" ${S}/><ellipse cx="50" cy="66" rx="19" ry="13" fill="#fff2df"/>
      <circle cx="34" cy="54" r="6" fill="#3d3148"/><circle cx="66" cy="54" r="6" fill="#3d3148"/><circle cx="36" cy="52" r="2" fill="#fff"/><circle cx="68" cy="52" r="2" fill="#fff"/>
      <path d="M46 61 h8 l-4 5z" fill="#ff8fa8"/><path d="M50 22 v8 M40 24 l2 7 M60 24 l-2 7" stroke="#e9873c" stroke-width="4" stroke-linecap="round"/>`);
  }
  function penguinFace() {
    return svg('0 0 100 100', 'face', `<ellipse cx="50" cy="54" rx="40" ry="38" fill="#6473ab" ${S}/>
      <path d="M50 38 C42 22 18 30 22 52 C24 74 38 84 50 84 C62 84 76 74 78 52 C82 30 58 22 50 38 Z" fill="#fffdf8"/>
      <circle cx="37" cy="54" r="6" fill="#3d3148"/><circle cx="63" cy="54" r="6" fill="#3d3148"/><circle cx="39" cy="52" r="2" fill="#fff"/><circle cx="65" cy="52" r="2" fill="#fff"/>
      <path d="M44 62 Q50 58 56 62 Q50 70 44 62Z" fill="#ffb35c" stroke="${INK}" stroke-width="2.500" stroke-linejoin="round"/>
      <ellipse cx="27" cy="64" rx="6" ry="4" fill="#ff9fb8" opacity=".8"/><ellipse cx="73" cy="64" rx="6" ry="4" fill="#ff9fb8" opacity=".8"/>
      <path d="M68 20 C58 8 50 16 54 24 C56 30 64 26 68 20 Z M68 20 C78 8 86 16 82 24 C80 30 72 26 68 20 Z" fill="#ffb3d1" stroke="${INK}" stroke-width="2.500" stroke-linejoin="round"/>`);
  }

  /* ---------- the present ---------- */
  function giftBox() {
    return svg('0 0 200 200', 'giftbox', `
      <g class="g-base"><rect x="30" y="92" width="140" height="96" rx="12" fill="#ffc9de" ${S}/>
        <rect x="88" y="92" width="24" height="96" fill="#d5c3ff"/><path d="M88 92 v96 M112 92 v96" stroke="${INK}" stroke-width="3.500"/>
        <circle cx="54" cy="122" r="5" fill="#fff" opacity=".8"/><circle cx="146" cy="160" r="5" fill="#fff" opacity=".8"/><circle cx="60" cy="166" r="3.500" fill="#fff" opacity=".8"/><circle cx="142" cy="118" r="3.500" fill="#fff" opacity=".8"/></g>
      <g class="g-lid"><rect x="20" y="66" width="160" height="36" rx="11" fill="#ffb3d1" ${S}/>
        <rect x="88" y="66" width="24" height="36" fill="#d5c3ff"/><path d="M88 66 v36 M112 66 v36" stroke="${INK}" stroke-width="3.500"/>
        <path d="M100 64 C74 26 44 40 52 58 C58 72 84 68 100 64 Z" fill="#d5c3ff" ${S}/>
        <path d="M100 64 C126 26 156 40 148 58 C142 72 116 68 100 64 Z" fill="#d5c3ff" ${S}/>
        <circle cx="100" cy="62" r="10" fill="#c3adff" ${S}/></g>`);
  }

  /* ---------- gifts ---------- */
  function coffee() {
    return svg('0 0 100 100', 'coffee', `
      <path class="steam" d="M40 16 q-6 -6 0 -12 M54 18 q-6 -7 0 -14 M66 16 q-6 -6 0 -12" fill="none" stroke="#c9b8d8" stroke-width="3.500" stroke-linecap="round"/>
      <path d="M26 34 L33 88 q1 7 8 7 h18 q7 0 8 -7 L74 34 Z" fill="#fff7ec" ${S}/>
      <path d="M29 52 L32.500 76 h35 L71 52 Z" fill="#ffb3d1"/>
      <path d="M50 60 c-3 -5 -10 0 -5 5 l5 5 l5 -5 c5 -5 -2 -10 -5 -5z" fill="#fff"/>
      <rect x="20" y="22" width="60" height="14" rx="6" fill="#c79a74" ${S}/>`);
  }
  function bear() {
    const f = '#e0b184', l = '#fff0dc';
    return svg('0 0 100 100', 'bear', `
      <ellipse cx="30" cy="80" rx="10" ry="12" fill="${f}" ${S}/><ellipse cx="70" cy="80" rx="10" ry="12" fill="${f}" ${S}/>
      <ellipse cx="24" cy="58" rx="9" ry="11" transform="rotate(24 24 58)" fill="${f}" ${S}/><ellipse cx="76" cy="58" rx="9" ry="11" transform="rotate(-24 76 58)" fill="${f}" ${S}/>
      <ellipse cx="50" cy="68" rx="22" ry="22" fill="${f}" ${S}/><ellipse cx="50" cy="72" rx="12" ry="12" fill="${l}"/>
      <circle cx="28" cy="16" r="10" fill="${f}" ${S}/><circle cx="72" cy="16" r="10" fill="${f}" ${S}/><circle cx="28" cy="16" r="4.500" fill="#ffc6dc"/><circle cx="72" cy="16" r="4.500" fill="#ffc6dc"/>
      <circle cx="50" cy="32" r="25" fill="${f}" ${S}/><ellipse cx="50" cy="40" rx="11" ry="8.500" fill="${l}"/>
      <circle cx="40" cy="30" r="3.300" fill="#3d3148"/><circle cx="60" cy="30" r="3.300" fill="#3d3148"/><ellipse cx="50" cy="37" rx="4" ry="3" fill="#3d3148"/>
      <path d="M50 40 v3 M45 45 q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2.500" stroke-linecap="round"/>
      <ellipse cx="33" cy="38" rx="4.500" ry="3" fill="#ff9fb8" opacity=".7"/><ellipse cx="67" cy="38" rx="4.500" ry="3" fill="#ff9fb8" opacity=".7"/>
      <path d="M50 56 l-12 -6 v12 z M50 56 l12 -6 v12 z" fill="#d5c3ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="56" r="4" fill="#c3adff" stroke="${INK}" stroke-width="3"/>`);
  }
  function roseHead(cx, cy, r, fill) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S3}/>
      <path d="M${cx - r * 0.5} ${cy - r * 0.1} q${r * 0.5} -${r * 0.75} ${r} 0 q-${r * 0.2} ${r * 0.7} -${r * 0.6} ${r * 0.3} q-${r * 0.3} -${r * 0.3} ${r * 0.15} -${r * 0.4}" fill="none" stroke="${INK}" stroke-width="2.600" stroke-linecap="round" opacity=".75"/>`;
  }
  function rose(color) {
    return svg('0 0 100 100', 'rose', `
      <path d="M50 46 q-3 26 2 48" fill="none" stroke="#7cc592" stroke-width="5" stroke-linecap="round"/>
      <path d="M51 70 q16 -12 24 2 q-14 8 -24 -2z M49 78 q-16 -10 -22 4 q14 6 22 -4z" fill="#9adbac" ${S3}/>
      <g fill="#fff" stroke="#cfd8d2" stroke-width="1.500"><circle cx="20" cy="30" r="4"/><circle cx="28" cy="20" r="3.500"/><circle cx="80" cy="28" r="4"/><circle cx="74" cy="16" r="3.500"/><circle cx="84" cy="42" r="3.200"/><circle cx="15" cy="44" r="3.200"/></g>
      ${roseHead(50, 34, 22, color || '#ffc1d6')}`);
  }
  function bouquet() {
    return svg('0 0 120 120', 'bouquet', `
      <g fill="#fff" stroke="#cfd8d2" stroke-width="1.500"><circle cx="16" cy="40" r="4.500"/><circle cx="24" cy="24" r="4"/><circle cx="40" cy="10" r="4"/><circle cx="60" cy="6" r="4.500"/><circle cx="82" cy="10" r="4"/><circle cx="98" cy="24" r="4.500"/><circle cx="106" cy="42" r="4"/><circle cx="50" cy="20" r="3.500"/><circle cx="74" cy="22" r="3.500"/><circle cx="30" cy="50" r="3.500"/><circle cx="92" cy="52" r="3.500"/></g>
      <path d="M28 54 L60 114 L92 54 Z" fill="#fff7ec" ${S}/><path d="M28 54 L60 78 L92 54" fill="#ffe3ee" ${S3}/>
      ${roseHead(40, 40, 16, '#ffc1d6')}${roseHead(80, 40, 16, '#d5c3ff')}${roseHead(60, 28, 17, '#ffd9b8')}${roseHead(60, 52, 14, '#fff1b8')}
      <path d="M60 92 l-14 -6 v14 z M60 92 l14 -6 v14 z" fill="#ffb3d1" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="92" r="4.500" fill="#ff8fbb" stroke="${INK}" stroke-width="3"/>`);
  }
  function heart(color) {
    return svg('0 0 100 100', 'heart', `<path d="M50 84 C12 58 8 28 30 20 C42 16 50 26 50 32 C50 26 58 16 70 20 C92 28 88 58 50 84 Z" fill="${color || '#ff9fc0'}" ${S}/><path d="M30 34 q4 -8 12 -6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`);
  }
  function sparkle(color) {
    return svg('0 0 100 100', 'sparkle', `<path d="M50 6 L58 42 L94 50 L58 58 L50 94 L42 58 L6 50 L42 42 Z" fill="${color || '#fff1b8'}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`);
  }

  /* ---------- cake and candles ---------- */
  function cake() {
    return svg('0 0 240 150', 'cake', `
      <ellipse cx="120" cy="136" rx="112" ry="12" fill="#fff" ${S}/>
      <rect x="34" y="52" width="172" height="84" rx="16" fill="#ffe3ee" ${S}/>
      <path d="M34 92 h172" stroke="#ffc1d6" stroke-width="9"/>
      <path d="M34 70 q0 -18 16 -18 h140 q16 0 16 18 q-2 18 -14 10 q-8 -6 -14 6 q-8 14 -18 0 q-8 -12 -16 2 q-8 14 -18 0 q-8 -12 -16 2 q-8 14 -18 0 q-6 -10 -14 -2 q-10 10 -12 -18 z" fill="#fffdf8" ${S}/>
      <g><circle cx="62" cy="112" r="4.500" fill="#d5c3ff"/><circle cx="92" cy="120" r="4.500" fill="#fff1b8"/><circle cx="120" cy="110" r="4.500" fill="#c9f2e0"/><circle cx="150" cy="120" r="4.500" fill="#ffb3d1"/><circle cx="178" cy="112" r="4.500" fill="#cfe6ff"/></g>`);
  }
  function candle(color) {
    return svg('0 0 40 100', 'candle', `
      <g class="flame"><path d="M20 6 C30 22 30 34 20 38 C10 34 10 22 20 6 Z" fill="#ffd166" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M20 20 C25 28 24 34 20 36 C16 34 15 28 20 20 Z" fill="#fff6d6"/></g>
      <g class="smoke"><path d="M20 30 q-8 -8 0 -16 q8 -8 0 -14" fill="none" stroke="#c9b8d8" stroke-width="4" stroke-linecap="round"/></g>
      <path d="M20 38 v8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <rect x="11" y="44" width="18" height="54" rx="6" fill="${color}" ${S3}/>
      <path d="M12 60 l16 -8 M12 76 l16 -8 M12 92 l16 -8" stroke="#fff" stroke-width="4" opacity=".75"/>`);
  }

  /* ---------- journey things ---------- */
  function sheep() {
    return svg('0 0 120 100', 'sheep', `
      <path d="M40 78 v16 M56 80 v14 M72 80 v14 M88 78 v16" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <g fill="#fffdf8" ${S}><circle cx="42" cy="50" r="20"/><circle cx="64" cy="38" r="22"/><circle cx="88" cy="48" r="20"/><circle cx="78" cy="66" r="20"/><circle cx="52" cy="68" r="20"/></g>
      <circle cx="66" cy="54" r="24" fill="#fffdf8"/>
      <ellipse cx="26" cy="50" rx="17" ry="19" fill="#77688a" ${S}/><ellipse cx="13" cy="38" rx="8" ry="5" transform="rotate(-30 13 38)" fill="#77688a" ${S3}/>
      <circle cx="20" cy="46" r="3.200" fill="#fff"/><circle cx="32" cy="46" r="3.200" fill="#fff"/><circle cx="20" cy="47" r="1.600" fill="#3d3148"/><circle cx="32" cy="47" r="1.600" fill="#3d3148"/>
      <ellipse cx="18" cy="56" rx="4" ry="2.600" fill="#ff9fb8" opacity=".8"/><ellipse cx="34" cy="56" rx="4" ry="2.600" fill="#ff9fb8" opacity=".8"/>
      <circle cx="30" cy="30" r="9" fill="#fffdf8" ${S3}/>`);
  }
  function boat() {
    return svg('0 0 240 120', 'boat', `
      <path d="M196 44 v-40" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M196 6 l-30 12 l30 12 z" fill="#ffb3d1" ${S3}/>
      <path d="M8 44 H232 C226 92 200 112 166 112 H74 C40 112 14 92 8 44 Z" fill="#ffd9b8" ${S}/>
      <path d="M14 62 H226" stroke="#ffb98a" stroke-width="8"/><path d="M8 44 H232" ${S}/>
      <path d="M58 86 c-4 -6 -13 0 -7 7 l7 6 l7 -6 c6 -7 -3 -13 -7 -7z" fill="#ff9fc0"/>`);
  }
  function wave() {
    return svg('0 0 120 100', 'wave', `
      <path d="M4 98 C10 50 40 14 78 18 C100 20 112 38 104 52 C98 62 84 60 82 50 C70 54 64 74 80 98 Z" fill="#a9d8f7" ${S}/>
      <path d="M78 18 C100 20 112 38 104 52 C98 62 84 60 82 50" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <path d="M24 84 q8 -26 28 -40" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      <circle cx="52" cy="70" r="3.500" fill="#3d3148"/><circle cx="68" cy="66" r="3.500" fill="#3d3148"/><path d="M56 78 q5 5 10 -1" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
  }
  function crab() {
    return svg('0 0 120 90', 'crab', `
      <path d="M26 62 l-14 10 M30 72 l-12 14 M94 62 l14 10 M90 72 l12 14" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M22 46 q-18 -6 -12 -24 M98 46 q18 -6 12 -24" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="12" cy="18" r="11" fill="#ff9aa2" ${S}/><circle cx="108" cy="18" r="11" fill="#ff9aa2" ${S}/>
      <path d="M46 34 v-16 M74 34 v-16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="60" cy="56" rx="40" ry="28" fill="#ff9aa2" ${S}/>
      <circle cx="46" cy="16" r="8" fill="#fff" ${S3}/><circle cx="74" cy="16" r="8" fill="#fff" ${S3}/><circle cx="47" cy="17" r="3.500" fill="#3d3148"/><circle cx="75" cy="17" r="3.500" fill="#3d3148"/>
      <path d="M50 62 q10 9 20 0" fill="none" ${S3}/><ellipse cx="36" cy="60" rx="6" ry="4" fill="#ff7f8f" opacity=".7"/><ellipse cx="84" cy="60" rx="6" ry="4" fill="#ff7f8f" opacity=".7"/>`);
  }
  function castle() {
    return svg('0 0 120 100', 'castle', `
      <path d="M10 98 L18 52 h84 L110 98 Z" fill="#ffe6b0" ${S}/>
      <path d="M22 54 V24 h8 v8 h8 v-8 h8 V54 Z M74 54 V24 h8 v8 h8 v-8 h8 V54 Z" fill="#ffe6b0" ${S}/>
      <path d="M50 98 V78 q10 -14 20 0 V98 Z" fill="#e9c98a" ${S3}/>
      <path d="M60 52 V14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M60 14 l20 8 l-20 8 z" fill="#ffb3d1" ${S3}/>`);
  }
  function cloud() {
    return svg('0 0 160 90', 'cloud', `<path d="M36 78 C10 78 8 46 34 44 C36 20 70 14 82 34 C100 20 128 32 124 54 C148 54 148 78 126 78 Z" fill="#fff" stroke="#e3d8f0" stroke-width="4" stroke-linejoin="round"/>`);
  }
  function rainbow() {
    const cols = ['#ffb3c6', '#ffd6a5', '#fff1b8', '#c9f2e0', '#cfe6ff', '#d9c7ff'];
    return svg('0 0 240 130', 'rainbow', cols.map((c, i) => `<path d="M${20 + i * 12} 126 A${100 - i * 12} ${100 - i * 12} 0 0 1 ${220 - i * 12} 126" fill="none" stroke="${c}" stroke-width="12.500"/>`).join(''));
  }
  function palm() {
    return svg('0 0 200 260', 'palm', `
      <path d="M96 258 C92 190 104 130 116 84" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
      <path d="M96 258 C92 190 104 130 116 84" fill="none" stroke="#d9a878" stroke-width="15" stroke-linecap="round"/>
      <path d="M92 220 h14 M94 186 h14 M98 152 h14 M104 120 h14" stroke="#b98a5c" stroke-width="4" stroke-linecap="round"/>
      <g fill="#9fe0b0" ${S}><path d="M118 82 C80 40 34 46 12 76 C52 62 86 72 118 82 Z"/><path d="M118 82 C150 36 192 40 196 70 C164 58 140 70 118 82 Z"/>
      <path d="M118 82 C96 30 110 8 136 6 C128 36 126 58 118 82 Z"/><path d="M118 82 C74 80 46 104 40 134 C70 108 96 96 118 82 Z"/><path d="M118 82 C160 84 180 108 184 134 C160 110 140 96 118 82 Z"/></g>
      <circle cx="112" cy="90" r="9" fill="#c79a74" ${S3}/><circle cx="126" cy="94" r="9" fill="#c79a74" ${S3}/>`);
  }
  function shamrock() {
    return svg('0 0 100 100', 'shamrock', `<path d="M50 58 q4 20 -4 36" fill="none" stroke="#6cc088" stroke-width="6" stroke-linecap="round"/>
      <g fill="#8fdca6" stroke="#6cc088" stroke-width="3" stroke-linejoin="round"><path d="M50 52 C34 34 30 14 42 10 C48 8 50 14 50 16 C50 14 52 8 58 10 C70 14 66 34 50 52Z"/>
      <path d="M50 52 C26 50 10 62 14 74 C16 80 22 78 24 76 C22 78 22 86 28 88 C40 90 48 72 50 52Z"/><path d="M50 52 C74 50 90 62 86 74 C84 80 78 78 76 76 C78 78 78 86 72 88 C60 90 52 72 50 52Z"/></g>`);
  }
  function balloon(color) {
    return svg('0 0 60 130', 'balloon', `<path d="M30 76 q-8 26 2 52" fill="none" stroke="#c9b8d8" stroke-width="2.500" stroke-linecap="round"/>
      <ellipse cx="30" cy="40" rx="24" ry="30" fill="${color}" ${S3}/><path d="M24 70 h12 l-6 -6z" fill="${color}" ${S3}/><path d="M18 26 q4 -10 12 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
  }
  function partyHat() {
    return svg('0 0 60 60', 'hat', `<path d="M30 6 L52 52 H8 Z" fill="#d5c3ff" ${S3}/><path d="M22 24 l18 8 M16 38 l28 10" stroke="#ffb3d1" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="7" r="6" fill="#fff1b8" ${S3}/>`);
  }
  function speaker(on) {
    return svg('0 0 48 48', 'speaker', `<path d="M8 19 h8 l10 -9 v28 l-10 -9 h-8 z" fill="#fff" stroke="${INK}" stroke-width="3.500" stroke-linejoin="round"/>` +
      (on ? `<path d="M32 17 q6 7 0 14 M37 12 q10 12 0 24" fill="none" stroke="${INK}" stroke-width="3.500" stroke-linecap="round"/>`
        : `<path d="M32 18 l10 12 M42 18 l-10 12" stroke="${INK}" stroke-width="3.500" stroke-linecap="round"/>`));
  }
  function finger() {
    return svg('0 0 60 80', 'finger', `<path d="M24 34 V12 a6 6 0 0 1 12 0 V34 l12 4 a6 6 0 0 1 4 7 l-4 18 a10 10 0 0 1 -10 8 H28 a10 10 0 0 1 -9 -5 L8 48 a5 5 0 0 1 8 -6 l8 8z" fill="#fff" ${S3}/>`);
  }

  window.Art = { INK, cat, penguin, catFace, penguinFace, giftBox, coffee, bear, rose, bouquet, heart, sparkle, cake, candle, sheep, boat, wave, crab, castle, cloud, rainbow, palm, shamrock, balloon, partyHat, speaker, finger };
})();
