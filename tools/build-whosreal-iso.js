/* Who's Real? story panels, low-poly isometric house style.
   Usage: node build-whosreal-iso.js out.html */
const fs = require('fs');
const P = { white:'#E8ECEF', steel:'#8A949E', graph:'#2B3038', navy:'#121826', cyan:'#3FE0D0', mag:'#FF3EA5', amber:'#FFB020',
  red:'#E5383B', green:'#4ADE80', brass:'#B08D57', violet:'#5B2A86', ember:'#FF6B35', black:'#1A1424' };
const FONT = 'font-family="Chakra Petch, system-ui, sans-serif"';
const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

const CREW = {
  jake: { skin:'#F5C66B', torso:'#3B82F6', legs:'#1F2A44' },
  mia:  { skin:'#E9B48A', torso:'#FF6B35', legs:'#2B3038' },
  sam:  { skin:'#C68A5E', torso:'#FFB020', legs:'#3A3F4A' },
  leo:  { skin:'#F2D2B6', torso:'#4ADE80', legs:'#26323A' },
  tyrant: { skin:P.brass, torso:'#8A6A3E', legs:'#3A2A44' },
};
const PARTS = { legL:[-15,-34,14,34], legR:[1,-34,14,34], torso:[-16,-64,32,30], armL:[-28,-64,12,30], armR:[16,-64,12,30], head:[-12,-90,24,24] };
const PCOL = { legL:'legs', legR:'legs', torso:'torso', armL:'skin', armR:'skin', head:'skin' };

function av(x, y, s, col, o = {}) {
  const d = o.depth ?? 5;
  let g = `<g transform="translate(${x},${y}) scale(${s})${o.extra || ''}"${o.attr ? ' ' + o.attr : ''}>`;
  for (const k of ['legL','legR','armL','torso','armR','head']) {
    const [bx, by, w, h] = PARTS[k];
    const rot = o.rot && o.rot[k] ? ` transform="rotate(${o.rot[k]} ${bx + w/2} ${by + 2})"` : '';
    const c = o.mono || col[PCOL[k]];
    g += `<g${rot}>`;
    if (d) {
      g += `<polygon points="${bx+w},${by} ${bx+w+d},${by-d} ${bx+w+d},${by+h-d} ${bx+w},${by+h}" fill="${o.mono ? shade(c,-.15) : shade(c,-.28)}"/>`;
      g += `<polygon points="${bx},${by} ${bx+d},${by-d} ${bx+w+d},${by-d} ${bx+w},${by}" fill="${o.mono ? shade(c,.15) : shade(c,.25)}"/>`;
    }
    g += `<rect x="${bx}" y="${by}" width="${w}" height="${h}" fill="${c}"/></g>`;
  }
  if (o.face !== false && !o.mono) {
    g += `<rect x="-6" y="-80" width="4" height="5" fill="#1A1424"/><rect x="3" y="-80" width="4" height="5" fill="#1A1424"/><path d="M-5 -72 q5 4 10 0" stroke="#1A1424" stroke-width="1.6" fill="none"/>`;
  }
  if (o.inner) g += o.inner;
  g += `</g>`;
  if (o.tag) { const ty = y - 98*s - 8, tw = o.tag.length*8 + 16;
    g += `<rect x="${(x - tw/2).toFixed(1)}" y="${(ty - 14).toFixed(1)}" width="${tw}" height="19" rx="9.5" fill="${P.navy}" opacity=".78"/>`;
    g += `<text x="${x}" y="${ty}" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="${o.tagCol || P.white}">${esc(o.tag)}</text>`; }
  return g;
}
const shadow = (x, y, s=1, op=.35) => `<ellipse cx="${x}" cy="${y}" rx="${26*s}" ry="${8*s}" fill="#000" opacity="${op}"/>`;

/* standard room: L(80,360) T(400,230) R(720,360) B(400,490); walls 130 tall */
const WL = (inner) => `<g transform="matrix(1,-0.406,0,1,80,230)">${inner}</g>`;
const WR = (inner) => `<g transform="matrix(1,0.406,0,1,400,100)">${inner}</g>`;
function room(o) {
  let b = `<rect width="800" height="500" fill="${o.bg || P.navy}"/>`;
  (o.stars !== false) && [[40,140],[120,108],[700,120],[760,180],[640,96],[30,260]].forEach(([x,y]) => b += `<rect x="${x}" y="${y}" width="3" height="3" fill="${P.white}" opacity=".45"/>`);
  b += `<polygon points="80,360 400,230 400,100 80,230" fill="${o.wallL}"/><polygon points="400,230 720,360 720,230 400,100" fill="${o.wallR}"/>`;
  b += `<polygon points="80,360 400,230 720,360 400,490" fill="${o.floor}"/>`;
  for (let i = 1; i < 6; i++) { const t = i/6;
    b += `<line x1="${80+320*t}" y1="${360+130*t}" x2="${400+320*t}" y2="${230+130*t}" stroke="${o.grid}" stroke-width="2"/>`;
    b += `<line x1="${80+320*t}" y1="${360-130*t}" x2="${400+320*t}" y2="${490-130*t}" stroke="${o.grid}" stroke-width="2"/>`; }
  b += `<polyline points="80,360 400,230 720,360" fill="none" stroke="${o.trim}" stroke-width="4"/>`;
  b += `<polyline points="80,230 400,100 720,230" fill="none" stroke="${P.steel}" stroke-width="3"/>`;
  b += `<line x1="400" y1="100" x2="400" y2="230" stroke="${shade(o.wallL,-.12)}" stroke-width="2"/>`;
  return b;
}
function caption(n, title, body) {
  return `<rect x="16" y="16" width="768" height="72" rx="12" fill="${P.navy}" fill-opacity=".94" stroke="${P.cyan}" stroke-opacity=".5" stroke-width="2"/>` +
    `<text x="36" y="46" ${FONT} font-size="21" font-weight="700" fill="${P.cyan}">${n} · ${esc(title)}</text>` +
    `<text x="36" y="72" ${FONT} font-size="15" font-weight="500" fill="${P.white}">${esc(body)}</text>`;
}
function hud(x, y, w, h, inner, stroke = P.cyan) {
  return `<rect x="${x+3}" y="${y+5}" width="${w}" height="${h}" rx="12" fill="#000" opacity=".35"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${P.navy}" stroke="${stroke}" stroke-width="2"/>${inner}`;
}
const t = (x, y, s, size, col, extra='') => `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="700" fill="${col}" ${extra}>${esc(s)}</text>`;
const tm = (x, y, s, size, col) => t(x, y, s, size, col, 'text-anchor="middle"');

/* iso box on floor: base centre (cx,cy), half-extents A (along L->T), Bv (along L->B), height h */
function isoBox(cx, cy, A, Bv, h, col) {
  const ux = [0.926,-0.376], uy = [0.926,0.376];
  const p = (sa, sb, up=0) => [cx + sa*A*ux[0] + sb*Bv*uy[0], cy + sa*A*ux[1] + sb*Bv*uy[1] - up];
  const pts = a => a.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ');
  return `<polygon points="${pts([p(-1,-1),p(-1,1),p(-1,1,h),p(-1,-1,h)])}" fill="${shade(col,-.2)}"/>` +
    `<polygon points="${pts([p(-1,1),p(1,1),p(1,1,h),p(-1,1,h)])}" fill="${shade(col,-.38)}"/>` +
    `<polygon points="${pts([p(-1,-1,h),p(1,-1,h),p(1,1,h),p(-1,1,h)])}" fill="${shade(col,.12)}"/>`;
}
const button = (x, y) => `<ellipse cx="${x}" cy="${y+26}" rx="34" ry="13" fill="#4A515C"/><rect x="${x-20}" y="${y}" width="40" height="24" fill="#B32A2D"/><ellipse cx="${x}" cy="${y+24}" rx="20" ry="7" fill="#B32A2D"/><ellipse cx="${x}" cy="${y}" rx="20" ry="7" fill="${P.red}"/>`;
const portal = (u, v, rx, ry, col, glowId) => `<ellipse cx="${u}" cy="${v}" rx="${rx+10}" ry="${ry+10}" fill="${col}" opacity=".18"/><ellipse cx="${u}" cy="${v}" rx="${rx}" ry="${ry}" fill="#0A0F1C" stroke="${col}" stroke-width="7"${glowId ? ` filter="url(#${glowId})"` : ''}/><ellipse cx="${u}" cy="${v}" rx="${rx*.62}" ry="${ry*.66}" fill="none" stroke="${col}" stroke-width="2" opacity=".7"/><ellipse cx="${u}" cy="${v}" rx="${rx*.3}" ry="${ry*.32}" fill="${col}" opacity=".35"/>`;
const GLOW = id => `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
const svg = (label, body, defs='') => `<svg class="ill" viewBox="0 0 800 500" role="img" aria-label="${esc(label)}"><defs>${defs}</defs>${body}</svg>`;

const panels = [];
const CONTROL = { wallL:'#C3CBD2', wallR:P.white, floor:P.graph, grid:'#3A414B', trim:P.cyan };

/* 1 · control room */
{
  let b = room(CONTROL);
  b += WL(portal(130, 70, 46, 56, P.cyan) + `<rect x="200" y="40" width="70" height="44" fill="${P.graph}"/><rect x="206" y="46" width="58" height="26" fill="${P.cyan}" opacity=".8"/>`);
  b += WR(`<rect x="80" y="26" width="170" height="74" rx="6" fill="${P.navy}" stroke="${P.red}" stroke-width="3"/>${tm(165, 46, 'DOOMSDAY CLOCK', 11, P.red, )}${tm(165, 88, '100', 36, P.red)}`);
  b += button(400, 346) + tm(400, 404, 'MEETING', 11, P.amber);
  b += shadow(232,404,1.05) + av(232, 404, 1.05, CREW.mia, { tag:'Mia' });
  b += shadow(316,446,1.15) + av(316, 446, 1.15, CREW.jake, { tag:'Jake' });
  b += shadow(500,446,1.15) + av(500, 446, 1.15, CREW.sam, { tag:'Sam' });
  b += shadow(590,404,1.05) + av(590, 404, 1.05, CREW.leo, { tag:'Leo' });
  b += caption(1, 'NIGHT SHIFT AT THE PORTAL LAB', 'Your crew keeps reality stable before the Doomsday Clock hits zero.');
  panels.push({ cap:'Night shift', svg: svg('Step 1: four blocky crew members stand in an isometric sci-fi control room with a portal, an emergency button and a Doomsday Clock reading 100.', b) });
}

/* 2 · cafeteria anomaly */
{
  let b = room({ wallL:'#C9DCC5', wallR:'#E2EFDE', floor:'#2E3530', grid:'#3D4740', trim:'#A8E6A1' });
  b += WR(`<g stroke="#5C6670" stroke-width="5" fill="none"><path d="M70 0 v22 M112 0 v22"/></g><rect x="62" y="22" width="58" height="9" fill="#7A848E"/><rect x="62" y="31" width="9" height="40" fill="#7A848E"/>
    <rect x="48" y="-4" width="90" height="86" fill="none" stroke="${P.red}" stroke-width="3" stroke-dasharray="8 6"/>`);
  b += WR(`<rect x="220" y="44" width="70" height="40" rx="4" fill="${P.graph}"/><rect x="226" y="50" width="58" height="22" fill="#A8E6A1" opacity=".85"/>`);
  b += t(560, 150, '!', 34, P.red);
  b += isoBox(300, 380, 46, 22, 30, '#8A949E') + isoBox(250, 420, 18, 10, 18, '#5C6670') + isoBox(350, 340, 18, 10, 18, '#5C6670');
  b += isoBox(470, 430, 46, 22, 30, '#8A949E');
  b += shadow(180, 400, 1.05) + av(180, 400, 1.05, CREW.sam, { tag:'Sam', rot:{ armR:-150 } });
  b += shadow(560, 450, 1.05) + av(560, 450, 1.05, CREW.mia, { tag:'Mia' });
  b += hud(560, 104, 216, 214, tm(668, 130, 'REPORT · CAFETERIA', 13, P.cyan) +
    ['MOVED','MISSING','EXTRA','LIGHT','TEXT','FIGURE'].map((c, i) => { const x = 574 + (i%2)*98, y = 142 + Math.floor(i/2)*42, on = i===0;
      return `<rect x="${x}" y="${y}" width="90" height="34" rx="8" fill="${on ? P.cyan : '#1E2738'}" stroke="${on ? P.cyan : '#3A4560'}" stroke-width="2"/>` + tm(x+45, y+22, c, 12, on ? P.navy : P.white); }).join('') +
    `<rect x="574" y="272" width="188" height="34" rx="8" fill="#123524" stroke="${P.green}" stroke-width="2"/>` + tm(668, 294, '✓ CORRECT · ANOMALY FIXED', 11, P.green));
  b += caption(2, 'SPOT WHAT\'S WRONG', 'A chair is stuck to the ceiling. Report it at the terminal to keep the clock up.');
  panels.push({ cap:'Spot the anomaly', svg: svg('Step 2: in the cafeteria a chair is stuck to the ceiling. A report panel shows Moved selected and marked correct.', b) });
}

/* 3 · incursion */
{
  let b = room({ wallL:'#B9E6E2', wallR:'#D5F3F0', floor:'#262E36', grid:'#36424C', trim:P.cyan });
  b += WR(portal(190, 66, 62, 54, P.mag, 'g3'));
  b += WL(`<rect x="40" y="30" width="110" height="16" fill="${P.amber}"/><path d="M40 30 l16 16 M64 30 l16 16 M88 30 l16 16 M112 30 l16 16 M136 30 l14 14" stroke="${P.navy}" stroke-width="6"/>`);
  for (let i = 0; i < 14; i++) { const x = 560 + (i*37)%120, y = 200 + (i*53)%110; b += `<rect x="${x}" y="${y}" width="6" height="6" fill="${P.mag}" opacity="${.4 + (i%3)*.2}"/>`; }
  b += shadow(180,420) + av(180, 420, 1.0, CREW.mia, { tag:'Mia' });
  b += shadow(260,452) + av(260, 452, 1.05, CREW.jake, { tag:'Jake' });
  b += shadow(350,470) + av(350, 470, 1.05, CREW.sam, { tag:'Sam' });
  b += shadow(560,356, .95) + av(560, 356, .95, CREW.leo, { tag:'Leo', tagCol:P.mag, rot:{ armR:-30, legL:12, legR:-12 } });
  b += t(588, 236, '?', 26, P.mag);
  b += hud(470, 420, 290, 52, tm(615, 452, 'SECRETLY THE VARIANT', 15, P.mag), P.mag);
  b += `<path d="M560 420 v-28" stroke="${P.mag}" stroke-width="2" stroke-dasharray="4 4"/>`;
  b += caption(3, 'A PORTAL OPENS', 'One crewmate is secretly a Variant, a fake from another universe, and steps in.');
  panels.push({ cap:'A portal opens', svg: svg('Step 3: in Portal Bay a magenta portal opens on the wall. Leo, secretly the Variant, walks toward it while Mia, Jake and Sam stand back.', b, GLOW('g3')) });
}

/* 4 · two jakes */
{
  let b = room(CONTROL);
  b += `<ellipse cx="330" cy="432" rx="44" ry="15" fill="none" stroke="${P.mag}" stroke-width="2" opacity=".6"/><ellipse cx="480" cy="432" rx="44" ry="15" fill="none" stroke="${P.mag}" stroke-width="2" opacity=".6"/>`;
  b += shadow(330,432,1.25,.45) + shadow(480,432,1.25,.45);
  b += av(330, 404, 1.35, CREW.jake, { tag:'Jake', rot:{ armL:-35, armR:35 } });
  b += av(480, 404, 1.35, CREW.jake, { tag:'Jake', rot:{ armL:-35, armR:35 } });
  b += `<path d="M300 424 h60 M450 424 h60" stroke="${P.white}" stroke-width="3" opacity=".6"/>`;
  b += `<text x="404" y="196" text-anchor="middle" ${FONT} font-size="48" font-weight="700" fill="${P.mag}" stroke="${P.navy}" stroke-width="8" paint-order="stroke" stroke-linejoin="round">WHO'S REAL?</text>`;
  b += `<text x="400" y="192" text-anchor="middle" ${FONT} font-size="48" font-weight="700" fill="${P.white}">WHO'S REAL?</text>`;
  b += hud(250, 440, 300, 34, tm(400, 462, 'ENTANGLED · BOTH JUMP AT ONCE', 13, P.mag), P.mag);
  b += caption(4, 'NOW THERE ARE TWO JAKES', 'Same name, same look, same spot. One of them is lying.');
  panels.push({ cap:'Two Jakes', svg: svg('Step 4: two identical Jakes jump at the same time in the control room under the words Who\'s Real?', b) });
}

/* 5 · mirror hall */
{
  let b = room({ wallL:'#CFC3E3', wallR:'#E6DDF3', floor:'#2C2838', grid:'#3C3650', trim:'#C3B1E1' });
  const mirror = (u, inner) => `<rect x="${u}" y="12" width="84" height="110" rx="4" fill="#9AA6C8" stroke="#6E6290" stroke-width="5"/><rect x="${u+6}" y="18" width="72" height="98" fill="#C9D3EC"/>${inner}<path d="M${u+14} 24 l18 26 M${u+52} 24 l20 30" stroke="#fff" stroke-width="4" opacity=".7"/>`;
  b += WR(mirror(40, av(82, 112, .78, CREW.jake, { depth:0, attr:'opacity=".55"' })) + mirror(190, `<rect x="196" y="18" width="72" height="98" fill="#AFB9D6"/>`));
  b += t(612, 214, '?!', 30, P.mag);
  b += shadow(470,360) + av(470, 360, 1.15, CREW.jake, { tag:'Jake' });
  b += shadow(610,420) + av(610, 420, 1.15, CREW.jake, { tag:'Jake' });
  b += hud(286, 388, 150, 34, tm(361, 410, 'REFLECTION ✓', 13, P.green), P.green);
  b += hud(470, 436, 200, 34, tm(570, 458, 'NO REFLECTION ?!', 13, P.mag), P.mag);
  b += caption(5, 'FIND THE TINY MISTAKE', 'Every fake has one tell. In the Mirror Hall, only one Jake has a reflection.');
  panels.push({ cap:'Find the tell', svg: svg('Step 5: in the Mirror Hall the first Jake\'s mirror shows his reflection; the second Jake\'s mirror is empty.', b) });
}

/* 6 · meeting */
{
  let b = room(CONTROL);
  b += av(250, 330, 1.0, CREW.mia, { tag:'Mia' }) + av(420, 318, 1.0, CREW.sam, { tag:'Sam' });
  b += `<ellipse cx="335" cy="390" rx="140" ry="56" fill="#4A515C"/><rect x="195" y="372" width="280" height="18" fill="#4A515C"/><ellipse cx="335" cy="372" rx="140" ry="56" fill="${P.steel}"/>`;
  b += button(335, 352);
  b += shadow(220,460) + av(220, 460, 1.1, CREW.jake, { tag:'Jake' });
  b += shadow(450,470) + av(450, 470, 1.1, CREW.jake, { tag:'Jake' });
  b += hud(548, 104, 228, 260,
    t(566, 134, 'VOTE', 18, P.white) + t(758, 134, '0:30', 16, P.amber, 'text-anchor="end"') +
    `<rect x="564" y="148" width="196" height="40" rx="10" fill="#1E2738"/>` + t(578, 174, 'Jake', 15, P.white) + `<circle cx="736" cy="168" r="7" fill="${P.amber}"/>` +
    `<rect x="564" y="196" width="196" height="76" rx="10" fill="${P.mag}"/>` + t(578, 222, 'Jake', 15, P.white) +
    `<circle cx="704" cy="216" r="7" fill="${P.white}"/><circle cx="720" cy="216" r="7" fill="${P.white}"/><circle cx="736" cy="216" r="7" fill="${P.white}"/>` +
    `<rect x="576" y="236" width="172" height="26" rx="13" fill="${P.navy}"/>` + tm(662, 254, 'EVIDENCE: NO REFLECTION', 10, P.cyan) +
    `<rect x="564" y="280" width="196" height="40" rx="10" fill="#1E2738"/>` + t(578, 306, 'Skip', 15, P.steel) +
    tm(662, 344, 'DISCUSS · VOTE · ATTACH A TELL', 10, P.steel));
  b += caption(6, 'CALL A MEETING', 'Discuss, vote, and attach your evidence: "no reflection".');
  panels.push({ cap:'Meeting and vote', svg: svg('Step 6: the crew meets around a table with the emergency button. The ballot lists two players named Jake; the second has three votes and the evidence no reflection.', b) });
}

/* 7 · ejected */
{
  let b = room({ wallL:'#B9E6E2', wallR:'#D5F3F0', floor:'#262E36', grid:'#36424C', trim:P.cyan });
  b += WR(portal(190, 66, 62, 54, P.mag, 'g7'));
  for (let i = 0; i < 22; i++) { const x = 540 + (i*41)%150, y = 160 + (i*29)%140; b += `<rect x="${x}" y="${y}" width="${5 + i%3*2}" height="${5 + i%3*2}" fill="${i%4 ? P.mag : P.white}" opacity=".8"/>`; }
  b += av(592, 250, .7, CREW.leo, { extra:' rotate(-35)', face:false, rot:{ armL:-70, armR:70 } });
  b += shadow(200,420) + av(200, 420, 1.0, CREW.mia, { tag:'Mia', rot:{ armL:150, armR:-150 } });
  b += shadow(290,452) + av(290, 452, 1.05, CREW.jake, { tag:'Jake', rot:{ armL:150, armR:-150 } });
  b += shadow(380,476) + av(380, 476, 1.05, CREW.sam, { tag:'Sam', rot:{ armL:150, armR:-150 } });
  b += hud(470, 330, 300, 120, tm(620, 366, 'LEO WAS THE VARIANT', 18, P.mag) + tm(620, 392, 'TELL: NO REFLECTION', 12, P.white) +
    `<rect x="520" y="406" width="200" height="30" rx="15" fill="${P.mag}"/>` + tm(620, 427, '+ MYTHIC CARD', 13, P.white), P.mag);
  b += caption(7, 'THE FAKE GOES INTO THE PORTAL', 'Right call with the right evidence: a rare card for every voter.');
  panels.push({ cap:'Ejected', svg: svg('Step 7: Leo tumbles into the magenta portal in a burst of pixels while the crew cheers. A banner reads Leo was the Variant, plus Mythic card.', b, GLOW('g7')) });
}

/* 8 · doomsday chase */
{
  let b = room({ bg:'#160A10', stars:false, wallL:'#5A1E24', wallR:'#6E242B', floor:'#24121A', grid:'#3A1C26', trim:P.red });
  b += WR(portal(230, 70, 46, 52, P.green, 'g8') + `<rect x="40" y="20" width="110" height="60" rx="6" fill="${P.black}" stroke="${P.red}" stroke-width="3"/>${tm(95, 64, '00', 34, P.red)}`);
  b += WL(`<rect x="0" y="0" width="320" height="16" fill="${P.red}" opacity=".35"/>`);
  const crown = `<rect x="-14" y="-102" width="28" height="8" fill="${P.brass}"/>` + [-12,-6,0,6,12].map((x,i) => `<rect x="${x-2}" y="${i%2 ? -108 : -112}" width="5" height="${i%2 ? 8 : 12}" fill="${P.brass}"/>`).join('');
  const core = `<circle cx="0" cy="-49" r="9" fill="${P.ember}"/><circle cx="0" cy="-49" r="4" fill="#FFE2B8"/><path d="M-14 -60 l6 6 l-3 6 M10 -40 l-5 6" stroke="#B57BFF" stroke-width="1.6" fill="none"/>`;
  const eyes = `<rect x="-7" y="-81" width="5" height="4" fill="${P.ember}"/><rect x="3" y="-81" width="5" height="4" fill="${P.ember}"/>`;
  b += shadow(210, 470, 2.6, .5) + av(210, 470, 2.75, CREW.tyrant, { face:false, inner: crown + core + eyes, rot:{ armR:-70 } });
  b += `<circle cx="210" cy="335" r="40" fill="${P.ember}" opacity=".18"/>`;
  b += shadow(430,440) + av(430, 440, .95, CREW.jake, { rot:{ armL:40, armR:-40, legL:-22, legR:22 } });
  b += shadow(500,410) + av(500, 410, .9, CREW.mia, { rot:{ armL:40, armR:-40, legL:-22, legR:22 } });
  b += shadow(560,452) + av(560, 452, .95, CREW.sam, { rot:{ armL:40, armR:-40, legL:-22, legR:22 } });
  b += `<path d="M620 300 l40 -20 M630 330 l44 -18" stroke="${P.green}" stroke-width="3" opacity=".6"/>`;
  b += tm(652, 248, 'ESCAPE', 12, P.green);
  b += `<ellipse cx="400" cy="470" rx="380" ry="30" fill="${P.red}" opacity=".12"/>`;
  b += caption(8, 'THE TYRANT WAKES', 'Miss too many anomalies and the clock hits zero. Run for the escape portal!');
  panels.push({ cap:'Doomsday chase', svg: svg('Step 8: the room glows red, the clock reads 00, and a giant brass clockwork emperor with a gear crown and ember core chases the crew toward a green escape portal.', b, GLOW('g8')) });
}

/* 9 · results */
{
  let b = room({ wallL:'#2E3856', wallR:'#3A4670', floor:'#1C2232', grid:'#283048', trim:P.green });
  b += av(560, 330, .8, CREW.jake) + av(620, 352, .8, CREW.mia) + av(680, 330, .8, CREW.sam);
  b += av(170, 330, .8, CREW.leo) + `<rect x="130" y="250" width="80" height="20" rx="10" fill="${P.black}" opacity=".7"/>` + tm(170, 264, 'IN LOBBY', 10, P.steel);
  b += hud(36, 108, 330, 240,
    t(56, 140, 'ROUND RESULTS', 16, P.cyan) + t(56, 176, 'CREW WINS', 26, P.green) +
    `<path d="M56 194 H346" stroke="#2A3550" stroke-width="2"/>` +
    t(56, 220, 'Variant', 13, P.steel) + t(346, 220, 'Leo', 13, P.mag, 'text-anchor="end"') +
    t(56, 246, 'Tell', 13, P.steel) + t(346, 246, 'No reflection', 13, P.white, 'text-anchor="end"') +
    t(56, 272, 'Caught by', 13, P.steel) + t(346, 272, 'Evidence vote', 13, P.white, 'text-anchor="end"') +
    t(56, 298, 'Rewards', 13, P.steel) + t(346, 298, 'Card + coins', 13, P.amber, 'text-anchor="end"') +
    `<rect x="56" y="312" width="290" height="22" rx="11" fill="#1E2738"/>` + tm(201, 328, 'NEXT ROUND IN 10', 11, P.steel));
  b += `<g transform="rotate(4 560 300)"><rect x="453" y="124" width="214" height="320" rx="16" fill="${P.mag}"/><rect x="461" y="132" width="198" height="304" rx="11" fill="#151A2C"/>
    <rect x="473" y="144" width="80" height="22" rx="11" fill="${P.mag}"/>${tm(513, 160, 'MYTHIC', 11, P.white)}
    <rect x="473" y="176" width="174" height="140" rx="8" fill="#1F1A3C"/>
    <rect x="489" y="190" width="62" height="104" fill="#C9D3EC" stroke="${P.white}" stroke-width="2"/><rect x="569" y="190" width="62" height="104" fill="#3A3F5E" stroke="${P.white}" stroke-width="2"/>
    ${av(520, 286, .62, CREW.jake, { depth:3, attr:'opacity=".6"' })}${av(600, 306, .62, CREW.jake, { depth:3 })}
    ${tm(600, 230, '?!', 20, P.mag)}
    ${tm(560, 350, 'NO REFLECTION', 20, P.white)}
    ${tm(560, 374, 'The copy casts nothing', 11, '#B9C3D6')}${tm(560, 390, 'in the Mirror Hall.', 11, '#B9C3D6')}
    ${tm(560, 418, 'NEW IN YOUR ANOMALY LOG', 10, P.cyan)}</g>`;
  b += caption(9, 'AFTER THE ROUND', 'See who the fake was and how you could tell. Every catch joins your Anomaly Log.');
  panels.push({ cap:'Results and Anomaly Log', svg: svg('Step 9: the results screen says Crew wins: Leo was the Variant, caught by the tell no reflection. A Mythic card joins the Anomaly Log; Leo waits in the lobby.', b) });
}

let html = '';
panels.forEach(p => {
  html += `              <div class="slide" data-url="Who's Real? · how to play" data-cap="${esc(p.cap)}">\n                <div class="screen">${p.svg}</div>\n              </div>\n`;
});
fs.writeFileSync(process.argv[2], html);
console.log('panels', panels.length, html.length);
