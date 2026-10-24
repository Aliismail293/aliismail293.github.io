const fs = require('fs');

const C = {
  K:'#1a1c2c', PU:'#5d275d', RD:'#b13e53', OR:'#ef7d57', YE:'#ffcd75', LG:'#a7f070', GR:'#38b764',
  TE:'#257179', NV:'#29366f', BL:'#3b5dc9', SK:'#41a6f6', CY:'#73eff7', WH:'#f4f4f4', LGY:'#94b0c2',
  GY:'#566c86', DGY:'#333c57', SKIN:'#e9b48a', BR:'#8b5a2b', DBR:'#5a3a1e', WALL:'#2c334c'
};

const SPR = {
  bot: { pal:{o:C.OR,d:C.GY,t:C.TE,k:C.DGY,c:C.CY}, rows:[
    '......oo......','......dd......','..tttttttttt..','.tttttttttttt.','.tkkkkkkkkkkt.','.tkcckkkkcckt.',
    '.tkcckkkkcckt.','.tkkkkcckkkkt.','.tttttttttttt.','..tttttttttt..','....dddddd....','t.tttttttttt.t',
    't.tttttooott.t','t.tttttooott.t','..tttttttttt..','..dd......dd..']},
  owl: { pal:{o:C.OR,d:C.RD,k:C.K,w:C.WH,e:C.RD,c:C.YE}, rows:[
    '..o..........o..','..oo........oo..','.oooooooooooooo.','.okkkkkookkkkko.','.okwwwkkkkwwwko.',
    '.okwkwkookwkwko.','.okkkkkookkkkko.','.ooooooeeoooooo.','doooccccccccoood','ddooccccccccoodd',
    'ddooccccccccoodd','.dooccccccccood.','..ooccccccccoo..','...oooooooooo...','....ee....ee....']},
  checker: { pal:{v:C.PU,k:C.K,r:C.RD,s:C.LGY,w:C.WH}, rows:[
    '..s......s..','.vvvvvvvvvv.','.vkkkkkkkkv.','.vkrrrrrrkv.','.vkkkkkkkkv.','.vvvvvvvvvv.',
    '...ssssss...','vvvvvvvvvvvv','vv.vvvvvv.vv','vv.vwwwwv.vv','vv.vwwwwv.vv','...vvvvvv...',
    '...vv..vv...','...ss..ss...']},
  person: { pal:{h:C.K,s:C.SKIN,k:C.K,p:C.PU}, rows:[
    '...hhhh...','..hhhhhh..','..hsssss..','..skssks..','..ssssss..','...ssss...','..pppppp..',
    '.pppppppp.','pppppppppp','pp.pppp.pp','ss.pppp.ss','...pppp...','...kk.kk..','...kk.kk..','..kkk.kkk.']},
  check: { pal:{l:C.LG}, rows:['......l','.....ll','l...ll.','ll.ll..','.lll...','..l....']},
  cross: { pal:{r:C.OR}, rows:['r....r','rr..rr','.rrrr.','.rrrr.','rr..rr','r....r']},
  bang: { pal:{y:C.YE}, rows:['yy','yy','yy','yy','..','yy']},
  dial: { pal:{k:C.K,w:C.WH,g:C.LGY}, rows:['..kkkkk..','.kwwwwwk.','kwwwwwwwk','kwwwwwwwk','kwwwwwwwk','kwwwwwwwk','kgwwwwwgk','.kgggggk.','..kkkkk..']},
  bell: { pal:{y:C.YE,k:C.K,o:C.OR}, rows:['....y....','...yyy...','..yyyyy..','..yyyyy..','..yyyyy..','.yyyyyyy.','yyyyyyyyy','ooooooooo','....k....']},
  mag: { pal:{k:C.K,c:C.CY,b:C.BR}, rows:['.kkkk....','kcccck...','kcwcck...','kcccck...','.kkkk....','....bb...','.....bb..','......bb.','.......bb']},
  lock: { pal:{y:C.YE,k:C.K}, rows:['..yyy..','.y...y.','.y...y.','yyyyyyy','yyykyyy','yyykyyy','yyyyyyy']},
  eye: { pal:{w:C.WH,k:C.K}, rows:['..www..','.wwkww.','wwkkkww','.wwkww.','..www..']}
};
SPR.mag.pal.w = C.WH;

for (const [n, s] of Object.entries(SPR)) {
  const w = s.rows[0].length;
  s.rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${n} row ${i} len ${r.length} != ${w}`); });
}

const R = (x,y,w,h,c,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${extra}/>`;
function S(name, x, y, s, flip=false) {
  const sp = SPR[name], w = sp.rows[0].length; let out = '';
  sp.rows.forEach((row, j) => {
    let i = 0;
    while (i < row.length) {
      const ch = row[i];
      if (ch === '.') { i++; continue; }
      let k = i; while (k < row.length && row[k] === ch) k++;
      const px = flip ? x + (w - k) * s : x + i * s;
      out += R(px, y + j * s, (k - i) * s, s, sp.pal[ch]);
      i = k;
    }
  });
  return out;
}
const esc = t => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;');
const T = (x,y,t,size,c,anchor='start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${c}"${anchor!=='start'?` text-anchor="${anchor}"`:''}>${esc(t)}</text>`;

function caption(n, lines) {
  let o = R(16,16,768,96,C.WH) + R(20,20,760,88,C.K) + R(24,24,752,80,C.K) ;
  o += R(28,28,4,72,C.DGY);
  lines.forEach((l, i) => {
    const y = 50 + i * 24;
    if (i === 0) {
      const m = l.match(/^(\d+\.)(.*)$/);
      o += `<text x="44" y="${y}" font-size="13" fill="${C.WH}"><tspan fill="${C.YE}">${esc(m[1])}</tspan>${esc(m[2])}</text>`;
    } else o += T(44, y, l, 13, C.WH);
  });
  o += R(752,88,8,8,C.YE) + R(756,96,4,4,C.YE);
  return o;
}

function bubble(x, y, w, text, tailX, tailDir='down') {
  let o = R(x, y, w, 40, C.K) + R(x+4, y+4, w-8, 32, C.WH);
  o += R(tailX, y+36, 12, 4, C.WH) + R(tailX, y+40, 12, 4, C.K) + R(tailX+4, y+40, 4, 4, C.WH) + R(tailX+4, y+44, 4, 4, C.K);
  o += R(tailX-4, y+40, 4, 4, C.K) + R(tailX+12, y+40, 4, 4, C.K) + R(tailX+8, y+44, 4, 4, C.K) + R(tailX, y+44, 4, 4, C.K);
  o += T(x + w/2, y + 25, text, 10, C.K, 'middle');
  return o;
}

function card(x, y, s, opt={}) {
  let o = R(x+s, y+s, 15*s, 10*s, C.K, ' opacity=".45"') + R(x, y, 15*s, 10*s, C.WH);
  o += R(x+2*s, y+2*s, 10*s, s, C.LGY) + R(x+2*s, y+4*s, 8*s, s, C.LGY) + R(x+2*s, y+6*s, 11*s, s, C.LGY);
  if (opt.pin) o += R(x+s, y+s, 2*s, 2*s, C.RD);
  if (opt.tag) o += R(x+11*s, y+8*s, 3*s, s, opt.tag);
  return o;
}

const BOOKS = [C.TE,C.WH,C.OR,C.LGY,C.YE,C.BL,C.RD,C.GR,C.WH,C.SK];
function shelf(x, y, w, h) {
  let o = R(x, y, w, h, C.BR) + R(x+8, y+8, w-16, h-16, C.DBR);
  const rowH = Math.floor((h-16)/3);
  for (let r = 0; r < 3; r++) {
    const base = y + 8 + rowH*(r+1);
    o += R(x+8, base-8, w-16, 8, C.BR);
    let bx = x + 14, k = r*3;
    while (bx < x + w - 30) {
      const bw = [16,12,20,12,16,24,12][k % 7], bh = [60,52,64,48,56,44,58][(k*3) % 7];
      const c = BOOKS[(k*7 + r) % BOOKS.length];
      if (r === 2 && k % 5 === 4) { o += R(bx, base-8-24, 40, 24, C.WH) + R(bx+4, base-8-18, 32, 4, C.LGY) + R(bx+4, base-8-10, 32, 4, C.LGY); bx += 46; k++; continue; }
      o += R(bx, base-8-bh, bw, bh, c) + R(bx, base-8-bh+8, bw, 4, C.K, ' opacity=".25"');
      bx += bw + 4; k++;
    }
  }
  return o;
}

function page(x, y, s=4) {
  return R(x+s, y+s, 12*s, 16*s, C.K, ' opacity=".4"') + R(x, y, 12*s, 16*s, C.WH) + R(x+9*s, y, 3*s, 3*s, C.LGY) +
    R(x+2*s, y+4*s, 8*s, s, C.LGY) + R(x+2*s, y+7*s, 6*s, s, C.LGY) + R(x+2*s, y+10*s, 8*s, s, C.LGY) + R(x+2*s, y+13*s, 5*s, s, C.LGY);
}

function dots(pts, c, size=4) { return pts.map(([x,y]) => R(x, y, size, size, c)).join(''); }
function line(x1,y1,x2,y2,step){ const pts=[]; const n=Math.max(1,Math.round(Math.hypot(x2-x1,y2-y1)/step)); for(let i=0;i<=n;i++){pts.push([Math.round((x1+(x2-x1)*i/n)/4)*4,Math.round((y1+(y2-y1)*i/n)/4)*4]);} return pts; }

function floor(y, c1, c2) {
  let o = R(0, y, 800, 500-y, c1);
  for (let x = 0; x < 800; x += 64) o += R(x, y, 4, 500-y, c2);
  o += R(0, y, 800, 4, c2);
  return o;
}

const svg = (label, body) => `<svg class="ill pix f-pix" viewBox="0 0 800 500" role="img" aria-label="${esc(label)}">${body}</svg>`;

const panels = [];

/* 1 · library */
{
  let b = R(0,0,800,500,C.DGY);
  for (let x = 16; x < 800; x += 48) b += R(x, 112, 8, 330, C.WALL);
  b += floor(440, C.DBR, C.BR);
  b += shelf(48, 168, 232, 272);
  b += T(164, 462, 'COMPANY HANDBOOK', 10, C.YE, 'middle');
  b += S('bot', 352, 312, 8);
  b += R(476, 316, 8, 12, C.SK) + R(480, 308, 4, 8, C.SK);
  b += T(408, 462, 'BOT', 10, C.YE, 'middle');
  b += S('person', 628, 320, 8);
  b += bubble(504, 236, 284, 'HOW MUCH TIME OFF DO I GET?', 660);
  b += bubble(236, 192, 256, 'UHH... 30 DAYS? I THINK.', 404);
  b += caption(1, ['1. MEET BOT. IT ANSWERS QUESTIONS USING', 'A BIG PILE OF DOCUMENTS.', 'BUT IS IT READING THEM, OR JUST GUESSING?']);
  panels.push({cap:'Meet Bot', svg: svg('Step 1: a person asks Bot how much time off they get. Bot guesses 30 days instead of reading the company handbook.', b)});
}

/* 2 · owl's desk */
{
  let b = R(0,0,800,500,C.NV);
  b += R(560,128,120,88,C.K) + R(564,132,112,80,C.BL) + R(616,132,4,80,C.K) + R(564,168,112,4,C.K) + R(584,148,12,12,C.YE);
  b += floor(440, C.DGY, C.GY);
  b += R(32, 400, 736, 16, C.BR) + R(32, 416, 736, 4, C.DBR) + R(56, 420, 16, 20, C.BR) + R(728, 420, 16, 20, C.BR);
  b += S('owl', 88, 280, 8);
  b += page(232, 300, 4);
  b += T(256, 292, 'PAGE 12', 10, C.YE, 'middle');
  b += dots(line(284, 304, 436, 228, 14), C.RD);
  b += R(452, 204, 312, 176, C.K, ' opacity=".35"') + R(444, 196, 312, 176, C.LGY) + R(436, 188, 312, 176, C.WH);
  b += R(436, 188, 312, 4, C.K) + R(436, 360, 312, 4, C.K) + R(436, 188, 4, 176, C.K) + R(744, 188, 4, 176, C.K);
  b += R(448, 200, 12, 12, C.RD);
  b += T(472, 232, 'Q: HOW MANY VACATION', 13, C.K) + T(472, 256, 'DAYS DO EMPLOYEES', 13, C.K) + T(472, 280, 'GET PER YEAR?', 13, C.K);
  b += T(472, 312, 'A: 15 DAYS', 13, C.TE);
  b += T(732, 348, 'FROM: PAGE 12', 10, C.RD, 'end');
  b += R(320, 380, 56, 20, C.WH) + R(324, 384, 40, 4, C.LGY) + R(332, 372, 56, 20, C.WH) + R(336, 376, 40, 4, C.LGY);
  b += caption(2, ['2. ENTER RAGAUDIT, THE OWL. IT READS EVERY', 'PAGE AND WRITES A QUIZ. EACH ANSWER KEY IS', 'PINNED TO THE PAGE IT CAME FROM.']);
  panels.push({cap:'ragaudit writes a quiz', svg: svg('Step 2: an owl named ragaudit reads page 12 of the company handbook and writes a quiz card: how many vacation days do employees get per year? Answer: 15 days, pinned to page 12.', b)});
}

/* 3 · reword */
{
  let b = R(0,0,800,500,C.BL);
  [[60,140],[700,460],[220,180],[760,220],[120,460],[640,140],[540,470]].forEach(([x,y]) => b += R(x,y,8,8,C.SK) + R(x-8,y,8,8,C.SK,' opacity=".5"') + R(x+8,y,8,8,C.SK,' opacity=".5"') + R(x,y-8,8,8,C.SK,' opacity=".5"') + R(x,y+8,8,8,C.SK,' opacity=".5"'));
  b += R(252, 148, 520, 300, C.K) + R(244, 140, 520, 300, C.WH);
  b += R(244,140,520,4,C.K) + R(244,436,520,4,C.K) + R(244,140,4,300,C.K) + R(760,140,4,300,C.K);
  b += R(256, 152, 12, 12, C.RD);
  b += T(280, 186, 'HOW MANY VACATION DAYS', 13, C.GY) + T(280, 208, 'DO EMPLOYEES GET PER', 13, C.GY) + T(280, 230, 'YEAR?', 13, C.GY);
  b += R(276, 180, 296, 4, C.RD) + R(276, 202, 270, 4, C.RD) + R(276, 224, 74, 4, C.RD);
  b += T(268, 262, 'TOO EASY: IT COPIES THE PAGE', 10, C.RD);
  b += R(276, 288, 4, 16, C.BL) + R(280, 300, 4, 8, C.BL) + R(272, 300, 4, 8, C.BL);
  b += T(300, 340, 'HOW MUCH TIME', 24, C.BL) + T(300, 378, 'OFF DO I GET?', 24, C.BL);
  b += T(744, 420, 'ANSWER KEY: STILL PAGE 12', 10, C.TE, 'end');
  b += S('owl', 40, 332, 9);
  b += R(176, 360, 64, 12, C.YE) + R(240, 360, 12, 12, C.SKIN) + R(252, 364, 4, 4, C.K) + R(164, 360, 12, 12, C.RD);
  const bx = 600, by = 120;
  b += R(bx-8, by+16, 192, 56, C.K) + R(bx+16, by-8, 144, 104, C.K) + R(bx, by+8, 176, 64, C.K);
  b += R(bx-4, by+20, 184, 48, C.RD) + R(bx+20, by-4, 136, 96, C.RD) + R(bx+4, by+12, 168, 56, C.RD);
  b += T(bx+88, by+52, 'REWORD!', 18, C.YE, 'middle');
  b += caption(3, ['3. NO COPYING THE PAGE\'S EXACT WORDS!', 'REAL PEOPLE ASK VAGUELY, SO THE OWL', 'REWRITES EACH QUESTION THE SAME WAY.']);
  panels.push({cap:'No copying the page\'s words', svg: svg('Step 3: the owl crosses out a question that copies the page and rewrites it as: how much time off do I get?', b)});
}

/* 4 · verifier conveyor */
{
  let b = R(0,0,800,500,C.DGY);
  b += R(0, 132, 800, 12, C.GY) + R(0, 144, 800, 4, C.K) + R(120, 148, 12, 100, C.GY) + R(680, 148, 12, 60, C.GY);
  b += floor(452, C.K, C.DGY);
  b += S('checker', 300, 268, 8);
  b += R(396, 300, 72, 12, C.PU) + R(460, 300, 12, 20, C.LGY) + R(444, 316, 44, 20, C.RD) + R(440, 332, 52, 8, C.K);
  b += R(432, 344, 4, 4, C.YE) + R(496, 344, 4, 4, C.YE) + R(464, 346, 4, 4, C.YE);
  b += card(80, 352, 4) + card(184, 352, 4) + card(436, 352, 4);
  b += S('check', 474, 362, 3);
  b += R(40, 392, 560, 28, C.GY) + R(40, 392, 560, 4, C.LGY);
  for (let x = 52; x < 600; x += 40) b += R(x, 404, 12, 12, C.K);
  b += R(608, 380, 8, 8, C.LG) + R(616, 372, 8, 8, C.LG) + R(624, 364, 8, 8, C.LG) + R(632, 356, 8, 8, C.LG) + R(640, 348, 8, 8, C.LG);
  b += R(652, 324, 112, 16, C.GR) + R(652, 340, 112, 4, C.K) + card(660, 300, 3) + card(676, 292, 3) + card(700, 300, 3);
  b += T(708, 284, 'PASSED', 10, C.LG, 'middle');
  b += R(608, 424, 8, 8, C.OR) + R(616, 432, 8, 8, C.OR) + R(624, 440, 8, 8, C.OR);
  b += R(652, 432, 104, 8, C.GY) + R(660, 440, 88, 44, C.GY) + R(668, 448, 72, 4, C.DGY) + R(668, 460, 72, 4, C.DGY);
  b += R(684, 420, 28, 20, C.WH) + R(688, 424, 20, 4, C.OR) + R(700, 428, 4, 8, C.OR);
  b += T(708, 412, 'REJECTED', 10, C.OR, 'middle');
  b += T(348, 252, 'VERIFIER: A DIFFERENT AI', 10, C.YE, 'middle');
  b += T(492, 252, 'DOES PAGE 12 BACK IT?', 10, C.WH);
  b += T(320, 444, 'QUIZ CARDS FROM THE OWL', 10, C.LGY, 'middle');
  b += caption(4, ['4. A SECOND, DIFFERENT AI CHECKS EVERY', 'ANSWER KEY AGAINST ITS PAGE. WRONG KEYS', 'GET TOSSED. NO GRADING YOUR OWN HOMEWORK.']);
  panels.push({cap:'A second AI double-checks', svg: svg('Step 4: a different robot stamps every quiz card. Cards backed by their page pass; the rest go in the bin.', b)});
}

/* 5 · vault split */
{
  let b = R(0,0,800,500,C.K);
  for (let y = 116; y < 440; y += 24) for (let x = (y/24)%2 ? 0 : 24; x < 800; x += 48) b += R(x, y, 44, 20, C.DGY);
  b += floor(440, C.GY, C.LGY);
  b += S('owl', 72, 320, 8);
  b += R(200, 368, 24, 12, C.OR) + R(224, 360, 16, 12, C.OR);
  b += dots(line(244, 344, 440, 236, 18), C.LGY) + dots(line(244, 380, 512, 360, 18), C.LGY);
  b += card(300, 300, 3) + card(372, 248, 3) + card(404, 372, 3);
  b += card(468, 176, 3) + card(520, 168, 3) + card(576, 176, 3) + card(632, 168, 3) + card(680, 178, 3);
  b += R(448, 204, 312, 60, C.GR) + R(448, 204, 312, 4, C.LG) + R(448, 260, 312, 4, C.TE);
  b += T(604, 232, 'PRACTICE', 13, C.WH, 'middle') + T(604, 252, '7 OF EVERY 10', 10, C.K, 'middle');
  b += R(520, 288, 208, 152, C.K) + R(524, 292, 200, 144, C.LGY) + R(536, 304, 176, 120, C.GY);
  b += R(612, 280, 28, 12, C.WH) + R(616, 284, 20, 4, C.LGY);
  b += S('lock', 552, 316, 6);
  b += R(640, 320, 52, 52, C.K) + R(644, 324, 44, 44, C.YE) + R(660, 340, 12, 12, C.K) + R(664, 324, 4, 12, C.K);
  b += T(624, 400, 'FINAL EXAM', 13, C.WH, 'middle') + T(624, 418, '3 OF 10 · LOCKED', 10, C.YE, 'middle');
  b += R(736, 288, 48, 48, C.RD) + S('eye', 746, 302, 4) + R(740, 330, 8, 4, C.WH) + R(748, 322, 8, 4, C.WH) + R(756, 314, 8, 4, C.WH) + R(764, 306, 8, 4, C.WH) + R(772, 298, 8, 4, C.WH);
  b += T(760, 350, 'NO', 8, C.RD, 'middle') + T(760, 362, 'PEEKING', 8, C.RD, 'middle');
  b += caption(5, ['5. THE QUIZ IS SPLIT IN TWO: PRACTICE', 'QUESTIONS FOR TRAINING, AND A FINAL EXAM', 'LOCKED IN A SAFE TRAINING CAN\'T OPEN.']);
  panels.push({cap:'Practice set and locked exam', svg: svg('Step 5: the owl sends 7 of every 10 cards to a practice tray and locks the rest in a safe as the final exam.', b)});
}

/* 6 · practice quiz */
{
  let b = R(0,0,800,500,C.K);
  [[40,140],[230,170],[120,200],[260,124],[20,250],[200,236]].forEach(([x,y]) => b += R(x,y,4,4,C.GY));
  b += floor(440, C.DGY, C.NV);
  b += S('bot', 64, 250, 10);
  b += R(40, 410, 220, 16, C.GY) + R(56, 426, 12, 14, C.GY) + R(232, 426, 12, 14, C.GY);
  b += R(186, 392, 46, 18, C.WH) + R(192, 398, 34, 4, C.LGY);
  b += R(284, 128, 492, 308, C.BL) + R(290, 134, 480, 296, C.NV) + R(290, 134, 480, 36, C.BL);
  b += T(308, 158, 'PRACTICE QUIZ', 13, C.WH) + T(752, 158, '1/3', 13, C.YE, 'end');
  b += S('check', 312, 186, 5) + S('cross', 314, 262, 5) + S('bang', 324, 338, 5);
  b += R(306, 244, 448, 4, C.BL) + R(306, 320, 448, 4, C.BL);
  b += T(370, 204, 'Q1  PASS', 14, C.LG) + T(370, 226, 'FOUND THE RIGHT PAGE', 10, C.LGY);
  b += T(370, 280, 'Q2  WRONG PAGE', 14, C.OR) + T(370, 302, 'LOOKED IN THE WRONG PLACE', 10, C.LGY);
  b += T(370, 356, 'Q3  WRONG ANSWER', 14, C.YE) + T(370, 378, 'FOUND THE PAGE, MISREAD IT', 10, C.LGY);
  b += T(310, 416, 'NEXT: TUNE THE SETTINGS >', 10, C.CY);
  b += caption(6, ['6. BOT TAKES THE PRACTICE QUIZ.', 'EVERY MISS GETS A REASON, SO THE OWL', 'KNOWS WHAT TO FIX.']);
  panels.push({cap:'Practice quiz, every miss explained', svg: svg('Step 6: Bot takes the practice quiz. One question passes, one fails from looking on the wrong page, one fails from misreading the right page.', b)});
}

/* 7 · tuning */
{
  let b = R(0,0,800,500,C.K);
  for (let x = 0; x < 800; x += 40) b += R(x, 112, 2, 330, C.NV);
  for (let y = 152; y < 440; y += 40) b += R(0, y, 800, 2, C.NV);
  b += floor(440, C.DGY, C.GY);
  b += S('bot', 52, 344, 6);
  b += R(136, 392, 32, 8, C.YE) + R(160, 360, 8, 40, C.YE) + R(160, 360, 76, 8, C.YE);
  b += R(232, 176, 336, 232, C.K) + R(236, 180, 328, 224, C.BL) + R(244, 188, 312, 208, C.NV);
  b += T(400, 216, 'BOT\'S SETTINGS', 13, C.WH, 'middle');
  b += S('dial', 264, 236, 7) + S('dial', 369, 236, 7) + S('dial', 474, 236, 7);
  b += R(282, 258, 7, 7, C.K) + R(289, 265, 7, 7, C.K) + R(296, 272, 7, 7, C.RD);
  b += R(400, 251, 7, 7, C.K) + R(407, 258, 7, 7, C.K) + R(400, 265, 7, 7, C.K) + R(397, 272, 7, 7, C.RD);
  b += R(502, 251, 7, 7, C.K) + R(502, 258, 7, 7, C.K) + R(502, 265, 7, 7, C.K) + R(502, 272, 7, 7, C.RD);
  b += R(380, 228, 8, 4, C.YE) + R(388, 224, 24, 4, C.YE) + R(412, 228, 8, 4, C.YE) + R(420, 232, 4, 4, C.YE) + R(424, 236, 4, 4, C.YE);
  b += T(296, 324, 'PAGE SIZE', 8, C.WH, 'middle') + T(401, 324, 'HOW MANY', 8, C.WH, 'middle') + T(506, 324, 'RE-RANK', 8, C.WH, 'middle');
  b += T(296, 338, 'PAGES', 8, C.LGY, 'middle') + T(506, 338, 'RESULTS', 8, C.LGY, 'middle');
  b += T(400, 380, 'TESTED ON PRACTICE ONLY', 8, C.CY, 'middle');
  b += S('owl', 588, 350, 6, true);
  b += R(560, 380, 32, 8, C.OR) + R(552, 372, 8, 8, C.OR);
  b += R(620, 132, 152, 128, C.WH) + R(624, 136, 144, 120, C.K);
  b += T(696, 156, 'PRACTICE', 8, C.WH, 'middle') + T(696, 170, 'SCORE', 8, C.WH, 'middle');
  [[640,40],[664,52],[688,64],[712,76],[736,88]].forEach(([x,h],i) => b += R(x, 244-h, 16, h, i===4?C.LG:C.GR));
  b += R(744, 140+8, 4, 4, C.LG);
  b += caption(7, ['7. THE OWL TUNES BOT ONE DIAL AT A TIME', 'AND KEEPS WHATEVER SCORES BETTER ON', 'PRACTICE. ONLY THESE DIALS CAN MOVE.']);
  panels.push({cap:'Tuning Bot\'s settings', svg: svg('Step 7: the owl turns three dials on Bot\'s settings panel while the practice score climbs.', b)});
}

/* 8 · final exam */
{
  let b = R(0,0,800,500,C.NV);
  b += floor(440, C.DBR, C.BR);
  b += R(32, 128, 500, 196, C.BR) + R(40, 136, 484, 180, C.TE);
  b += T(60, 168, 'PRACTICE', 10, C.WH) + R(160, 156, 300, 16, C.WH);
  b += T(60, 208, 'EXAM', 10, C.YE) + R(160, 196, 284, 16, C.YE);
  b += R(160, 228, 4, 12, C.WH, ' opacity=".5"') + R(444, 228, 4, 12, C.WH, ' opacity=".5"') + R(460, 228, 4, 12, C.WH, ' opacity=".5"');
  b += T(60, 264, 'CLOSE TOGETHER =', 10, C.LG) + T(60, 284, 'AN HONEST SCORE', 10, C.LG);
  b += S('check', 240, 268, 3);
  b += R(320, 296, 40, 8, C.WH) + R(368, 296, 16, 8, C.YE);
  b += R(552, 128, 216, 196, C.WH) + R(556, 132, 208, 188, C.K);
  b += S('bell', 576, 156, 7);
  b += R(568, 168, 4, 8, C.YE) + R(560, 160, 4, 8, C.YE) + R(648, 168, 4, 8, C.YE) + R(656, 160, 4, 8, C.YE);
  b += T(676, 174, 'BIG GAP?', 10, C.YE, 'start') ;
  b += T(676, 198, 'ALARM!', 10, C.RD);
  b += T(576, 252, 'BOT MEMORIZED THE', 8, C.WH) + T(576, 268, 'PRACTICE INSTEAD', 8, C.WH) + T(576, 284, 'OF LEARNING.', 8, C.WH);
  b += S('bot', 92, 344, 6);
  b += R(56, 424, 220, 16, C.BR) + R(180, 412, 44, 12, C.WH) + R(186, 416, 30, 4, C.LGY);
  b += R(560, 332, 152, 108, C.K) + R(564, 336, 144, 100, C.LGY) + R(576, 348, 120, 76, C.K);
  b += R(712, 336, 8, 100, C.GY) + R(720, 340, 40, 92, C.GY) + R(724, 344, 32, 84, C.LGY) + R(736, 376, 12, 12, C.YE);
  b += card(588, 380, 3) + card(626, 372, 3);
  b += T(440, 372, 'OPENED ONCE', 10, C.OR, 'middle');
  b += R(400, 384, 8, 4, C.OR) + R(408, 388, 120, 4, C.OR) + R(524, 380, 4, 4, C.OR) + R(528, 384, 4, 12, C.OR) + R(532, 388, 4, 4, C.OR) + R(520, 396, 4, 4, C.OR);
  b += caption(8, ['8. THE SAFE OPENS ONCE FOR THE REAL SCORE.', 'IF PRACTICE IS WAY HIGHER THAN THE EXAM,', 'AN ALARM RINGS: BOT JUST MEMORIZED IT.']);
  panels.push({cap:'The final exam', svg: svg('Step 8: the safe opens once for the final exam. Practice and exam scores are compared, and a big gap rings an alarm.', b)});
}

/* 9 · new pages */
{
  let b = R(0,0,800,500,C.DGY);
  for (let x = 16; x < 800; x += 48) b += R(x, 112, 8, 330, C.WALL);
  b += R(320,132,112,72,C.K) + R(324,136,104,64,C.SK) + R(374,136,4,64,C.K) + R(324,166,104,4,C.K) + R(340,144,16,16,C.YE);
  b += floor(440, C.DBR, C.BR);
  b += shelf(40, 168, 232, 272);
  b += R(232, 196, 20, 56, C.YE) + R(256, 204, 16, 48, C.CY);
  b += page(468, 140, 3) + page(540, 124, 3) + page(400, 220, 3);
  b += R(480, 128, 28, 12, C.YE) + T(494, 137, 'NEW', 8, C.K, 'middle');
  b += R(552, 112, 28, 12, C.YE) + T(566, 121, 'NEW', 8, C.K, 'middle');
  b += R(412, 208, 28, 12, C.YE) + T(426, 217, 'NEW', 8, C.K, 'middle');
  b += dots([[520,192],[532,196],[588,176],[600,180],[612,184],[452,268],[464,272]], C.LGY);
  b += S('owl', 320, 350, 6);
  b += R(420, 380, 52, 36, C.WH) + R(426, 388, 36, 4, C.LGY) + R(426, 398, 28, 4, C.LGY) + R(412, 388, 8, 8, C.OR);
  b += T(420, 432, 'NEW QUESTION', 8, C.YE);
  b += card(604, 216, 4) + S('mag', 676, 232, 6);
  b += T(668, 300, 'SPOT-CHECK', 10, C.CY, 'middle') + T(668, 316, 'OLD QUESTIONS', 8, C.LGY, 'middle');
  b += R(600, 352, 152, 12, C.BR) + R(608, 364, 136, 76, C.BR) + R(616, 372, 120, 60, C.DBR);
  b += page(658, 330, 3);
  for (let i = 0; i < 9; i++) b += R(658 + i*4, 334 + i*5, 6, 6, C.RD) + R(690 - i*4, 334 + i*5, 6, 6, C.RD);
  b += T(676, 460, 'RETIRED', 10, C.OR, 'middle');
  b += caption(9, ['9. NEW PAGES ARRIVE? ONLY THEY GET NEW', 'QUESTIONS. OLD ONES GET A SPOT-CHECK, AND', 'DELETED PAGES\' QUESTIONS RETIRE.']);
  panels.push({cap:'New pages, smart re-testing', svg: svg('Step 9: new pages arrive and get new questions, old questions get a spot-check, and questions about a deleted page are retired.', b)});
}

let html = '';
panels.forEach((p, i) => {
  html += `              <div class="slide" data-url="ragaudit v2 · how it works" data-cap="${p.cap.replace(/'/g,'&#39;')}">\n                <div class="screen">${p.svg}</div>\n              </div>\n`;
});
fs.writeFileSync(process.argv[2], html);
console.log('panels', panels.length, 'bytes', html.length);
