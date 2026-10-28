/* Agro-Quant story panels in the pixel house style. Usage: node build-pixel-agro.js out.html */
const fs = require('fs');
const { C, SPR, R, S, T, esc, caption, bubble, dots, line, floor, svg } = require('./build-pixel.js');

SPR.capy = { pal:{ g:C.GR, c:'#7a4a28', b:'#a0663a', k:C.K, n:'#3b2416', d:C.DBR }, rows:[
  '...gg...........','..ccbbbbbbbbbb..','.cbbbbbbbbbbbbb.','bbkbbbbbbbbbbbbb','bbbbbbbbbbbbbbbb',
  'nbbbbbbbbbbbbbbc','nnbbbbbbbbbbbbbc','.bbbbbbbbbbbbbc.','..dd.dd...dd.dd.','..dd.dd...dd.dd.']};
SPR.gear = { pal:{ k:C.OR, h:C.DBR }, rows:[
  '..k.k.k..','.kkkkkkk.','kkkkkkkkk','.kkkhkkk.','kkkhhhkkk','.kkkhkkk.','kkkkkkkkk','.kkkkkkk.','..k.k.k..']};
for (const n of ['capy','gear']) { const w = SPR[n].rows[0].length; SPR[n].rows.forEach((r,i) => { if (r.length !== w) throw new Error(n + ' row ' + i); }); }

const cane = (x, y, h) => { let o = R(x, y - h, 8, h, C.GR); for (let k = y - 20; k > y - h; k -= 24) o += R(x, k, 8, 4, C.LG); o += R(x - 12, y - h + 4, 12, 4, C.GR) + R(x + 8, y - h + 12, 12, 4, C.GR) + R(x - 8, y - h, 4, 4, C.LG); return o; };
const thick = (x1, y1, x2, y2, c, s = 4) => dots(line(x1, y1, x2, y2, s), c, s);
const series = (pts, c, s = 4) => pts.slice(1).map((p, i) => thick(pts[i][0], pts[i][1], p[0], p[1], c, s)).join('');
const panel = (x, y, w, h, fill = C.K, border = C.WH) => R(x, y, w, h, border) + R(x + 4, y + 4, w - 8, h - 8, fill);
const sky = (top = C.SK) => R(0, 0, 800, 500, top) + R(0, 300, 800, 200, C.GR) + R(0, 300, 800, 4, C.LG);

const panels = [];

/* 1 · meet AGRO */
{
  let b = sky();
  b += R(680, 128, 40, 40, C.YE) + R(672, 136, 8, 24, C.YE) + R(720, 136, 8, 24, C.YE);
  for (let x = 24; x < 360; x += 36) b += cane(x, 420, 120 + (x % 3) * 16);
  b += R(0, 420, 800, 80, C.DBR) + R(0, 420, 800, 4, C.BR);
  b += R(468, 316, 12, 104, C.GY) + R(708, 316, 12, 104, C.GY);
  b += panel(420, 132, 340, 188, C.NV);
  b += T(440, 162, 'AGRO', 13, C.YE) + T(740, 162, 'STOCK', 10, C.LGY, 'end');
  b += series([[440,280],[476,252],[508,268],[540,216],[572,236],[604,196],[636,228],[668,184],[700,212],[736,176]], C.LG);
  b += R(440, 296, 300, 4, C.GY);
  b += T(590, 312, 'UP AND DOWN, EVERY DAY', 8, C.LGY, 'middle');
  b += S('capy', 236, 340, 8);
  b += bubble(256, 268, 72, '?', 300);
  b += T(300, 452, 'CAPY, OUR ANALYST', 10, C.YE, 'middle');
  b += caption(1, ['1. MEET AGRO: A COMPANY THAT FARMS SUGAR', 'CANE IN BRAZIL. ITS STOCK GOES UP AND', 'DOWN. CAN WE READ THE SIGNS EARLY?']);
  panels.push({ cap:'Meet AGRO', svg: svg('Step 1: a capybara analyst stands by a sugarcane field and looks at a screen showing the AGRO stock price zigzagging.', b) });
}

/* 2 · money */
{
  let b = R(0, 0, 800, 500, C.NV) + floor(440, C.DGY, C.GY);
  b += R(392, 236, 16, 204, C.LGY) + R(360, 428, 80, 12, C.LGY);
  b += thick(240, 276, 560, 212, C.WH, 8);
  b += dots(line(244, 284, 244, 330, 10), C.LGY) + dots(line(556, 220, 556, 266, 10), C.LGY);
  b += R(196, 332, 96, 12, C.WH) + R(508, 268, 96, 12, C.WH);
  [[212,308],[236,308],[260,308],[224,284],[248,284]].forEach(([x,y]) => b += R(x, y, 20, 20, C.LG) + T(x + 10, y + 15, '$', 10, C.K, 'middle'));
  [[540,244],[564,244]].forEach(([x,y]) => b += R(x, y, 20, 20, C.YE) + T(x + 10, y + 15, 'R', 10, C.K, 'middle'));
  b += T(244, 372, 'US DOLLAR', 10, C.LG, 'middle') + T(556, 308, 'BRAZIL REAL', 10, C.YE, 'middle');
  b += R(160, 260, 8, 40, C.LG) + R(152, 268, 24, 8, C.LG) + R(156, 264, 16, 4, C.LG);
  b += panel(596, 128, 180, 96, C.K, C.GY) + T(612, 152, 'USD/BRL', 10, C.LGY) + T(612, 180, '5.22', 18, C.WH) + T(612, 208, '+1.00% TODAY', 10, C.LG);
  b += S('capy', 40, 360, 6);
  b += caption(2, ['2. CLUE ONE: MONEY. AGRO SELLS IN DOLLARS', 'BUT PAYS ITS COSTS IN BRAZILIAN REAIS. A', 'STRONGER DOLLAR CAN MEAN FATTER MARGINS.']);
  panels.push({ cap:'Clue one: money', svg: svg('Step 2: a balance scale tips toward a stack of US dollar coins over Brazilian real coins. A readout shows USD/BRL 5.22, up 1 percent today.', b) });
}

/* 3 · crops */
{
  let b = sky();
  for (let x = 32; x < 260; x += 32) b += cane(x, 440, 130 + (x % 3) * 14);
  b += R(0, 440, 800, 60, C.DBR);
  b += thick(276, 316, 380, 268, C.WH) + R(372, 260, 12, 12, C.WH);
  b += thick(276, 352, 380, 380, C.WH) + R(372, 376, 12, 12, C.WH);
  b += R(400, 208, 96, 104, C.WH) + R(412, 196, 72, 16, C.WH) + R(420, 188, 56, 8, C.LGY) + T(448, 268, 'SUGAR', 10, C.K, 'middle');
  b += R(404, 340, 88, 100, C.RD) + R(404, 356, 88, 8, C.K) + R(404, 412, 88, 8, C.K) + T(448, 396, 'OIL', 10, C.WH, 'middle');
  b += panel(536, 196, 220, 64, C.K, C.YE) + T(552, 222, 'SUGAR FUTURES', 10, C.YE) + T(552, 246, '13.76 C/LB', 13, C.WH);
  b += panel(536, 344, 220, 64, C.K, C.OR) + T(552, 370, 'BRENT CRUDE', 10, C.OR) + T(552, 394, 'ETHANOL PROXY', 10, C.WH);
  b += T(648, 448, 'FROM YAHOO FINANCE', 8, C.WH, 'middle');
  b += S('capy', 280, 420, 5);
  b += caption(3, ['3. CLUE TWO: CROPS. SUGARCANE BECOMES', 'SUGAR AND ETHANOL FUEL, SO SUGAR AND OIL', 'PRICES ARE PULLED IN ON EVERY RUN.']);
  panels.push({ cap:'Clue two: crops', svg: svg('Step 3: sugarcane splits into a sugar sack and an oil barrel, with price readouts for sugar futures and Brent crude from Yahoo Finance.', b) });
}

/* 4 · weather */
{
  let b = R(0, 0, 800, 500, C.GY) + R(0, 330, 800, 170, '#2f6b45') + R(0, 330, 800, 4, C.GR);
  const cloud = (x, y) => R(x, y + 16, 160, 40, C.LGY) + R(x + 24, y, 72, 24, C.LGY) + R(x + 88, y + 6, 48, 20, C.LGY) + R(x, y + 52, 160, 4, C.WH);
  b += cloud(120, 128) + cloud(380, 140);
  for (let i = 0; i < 26; i++) { const x = 130 + (i * 29) % 410, y = 196 + (i * 47) % 120; b += R(x, y, 4, 12, C.SK); }
  for (let x = 40; x < 760; x += 40) b += cane(x, 344, 26);
  b += R(232, 380, 112, 40, C.YE) + R(312, 352, 40, 32, C.YE) + R(320, 360, 24, 16, C.SK) + R(236, 412, 36, 36, C.K) + R(244, 420, 20, 20, C.GY) + R(312, 420, 28, 28, C.K) + R(318, 426, 16, 16, C.GY);
  b += R(280, 340, 16, 28, C.RD) + R(284, 344, 8, 12, C.WH) + R(284, 360, 8, 4, C.WH);
  b += T(288, 476, 'HARVEST PAUSED', 10, C.WH, 'middle');
  b += panel(560, 236, 216, 168, C.K, C.SK) + T(576, 262, 'ANGELICA, BRAZIL', 10, C.SK);
  b += T(576, 292, 'RAIN TODAY', 8, C.LGY) + T(760, 292, '> 5MM', 10, C.RD, 'end');
  b += T(576, 320, 'TOMORROW', 8, C.LGY) + T(760, 320, '> 10MM', 10, C.RD, 'end');
  b += R(576, 336, 184, 4, C.GY) + T(576, 364, 'HARVEST AT RISK', 10, C.YE) + T(576, 388, 'OPEN-METEO API', 8, C.LGY);
  b += S('capy', 40, 388, 5);
  b += caption(4, ['4. CLUE THREE: WEATHER. HEAVY RAIN AT', 'THE FARM CAN STOP THE HARVEST, SO TODAY\'S', 'RAIN AND TOMORROW\'S FORECAST ARE CHECKED.']);
  panels.push({ cap:'Clue three: weather', svg: svg('Step 4: rain clouds pour over the cane field and a harvester stops. A readout for Angelica, Brazil flags rain over 5 mm today or 10 mm tomorrow.', b) });
}

/* 5 · news */
{
  let b = R(0, 0, 800, 500, C.DGY) + floor(440, C.K, C.DGY);
  const paper = (x, y, head, flag) => panel(x, y, 260, 72, C.WH, C.K) + R(x + 16, y + 44, 180, 4, C.LGY) + R(x + 16, y + 54, 140, 4, C.LGY) + T(x + 16, y + 30, head, 10, C.K) + (flag ? R(x + 220, y + 16, 24, 24, C.RD) + T(x + 232, y + 33, '!', 10, C.WH, 'middle') : '');
  b += paper(300, 132, 'PORT STRIKE, BRAZIL', true);
  b += paper(320, 220, 'FLOOD NEAR HARVEST', true);
  b += paper(290, 308, 'ARGENTINA DROUGHT', true);
  b += S('mag', 590, 180, 8);
  b += panel(600, 276, 176, 108, C.K, C.RD) + T(616, 302, 'BAD NEWS', 10, C.LGY) + T(616, 340, '3', 24, C.RD) + T(656, 340, 'ARTICLES', 10, C.WH) + T(616, 368, 'SOURCE: GDELT', 8, C.LGY);
  b += S('capy', 80, 344, 8);
  b += T(144, 452, 'NEWS SCANNER', 10, C.YE, 'middle');
  b += caption(5, ['5. CLUE FOUR: NEWS. A SCANNER SEARCHES', 'WORLD HEADLINES FOR STRIKES, FLOODS AND', 'DROUGHT IN BRAZIL AND ARGENTINA.']);
  panels.push({ cap:'Clue four: news', svg: svg('Step 5: the capybara scans newspaper headlines about a port strike, a flood and a drought. A counter shows 3 bad-news articles from GDELT.', b) });
}

/* 6 · math */
{
  let b = R(0, 0, 800, 500, C.K) + floor(440, C.DGY, C.NV);
  b += R(24, 252, 120, 24, C.GY) + dots([[36,260],[56,260],[76,260],[96,260],[116,260]], C.YE, 8);
  b += T(84, 300, '30 DAYS', 10, C.YE, 'middle') + T(84, 316, 'OF PRICES', 8, C.LGY, 'middle');
  b += panel(144, 168, 240, 216, C.DGY, C.OR);
  b += S('gear', 172, 204, 8) + S('gear', 264, 260, 6) + S('gear', 304, 196, 5);
  b += R(144, 356, 240, 28, C.OR) + T(264, 375, 'RUST CORE', 13, C.K, 'middle');
  b += R(384, 252, 40, 24, C.GY);
  b += panel(424, 196, 120, 136, C.WH, C.K);
  b += T(436, 228, 'AVERAGE', 8, C.K) + T(436, 260, 'SPREAD', 8, C.K) + T(436, 292, 'Z-SCORE', 8, C.K) + T(436, 320, 'FAST', 8, C.OR);
  b += panel(568, 152, 208, 200, C.NV, C.CY) + T(584, 178, 'ARIMA', 13, C.CY) + T(760, 178, 'USD/BRL', 8, C.LGY, 'end');
  b += series([[588,300],[612,284],[636,292],[660,264],[684,272],[708,244]], C.WH);
  b += dots([[720,236],[732,228],[744,220],[756,212]], C.YE, 6);
  b += R(708, 196, 4, 120, C.GY);
  b += T(672, 340, 'TOMORROW?', 10, C.YE, 'middle');
  b += S('capy', 36, 368, 5);
  b += caption(6, ['6. THE MATH. A RUST ENGINE CRUNCHES 30', 'DAYS OF EXCHANGE RATES, AND AN ARIMA', 'MODEL GUESSES WHERE THE RATE GOES NEXT.']);
  panels.push({ cap:'The math', svg: svg('Step 6: 30 days of prices feed a machine of orange gears labelled Rust core, which outputs average, spread and z-score. A screen labelled ARIMA extends the exchange-rate line one day ahead.', b) });
}

/* 7 · the call */
{
  let b = R(0, 0, 800, 500, C.NV) + floor(452, C.DGY, C.GY);
  b += panel(232, 124, 544, 316, C.K, C.WH);
  const rows = [['FREEZE', C.CY, 'BAD NEWS: 3 OR MORE', 'CHECKED FIRST', false], ['BUY', C.LG, 'DOLLAR UP OVER 0.5%', '', true], ['SELL', C.OR, 'DOLLAR DOWN OVER 0.5%', '', false], ['HOLD', C.YE, 'ANYTHING ELSE', '', false]];
  rows.forEach(([name, c, rule, note, on], i) => { const y = 144 + i * 72;
    b += R(256, y, 52, 52, on ? c : C.DGY) + R(264, y + 8, 36, 36, on ? C.WH : C.K) + R(268, y + 12, 28, 28, on ? c : C.DGY);
    b += T(332, y + 24, name, 14, on ? c : C.GY) + T(332, y + 46, rule, 10, on ? C.WH : C.LGY);
    if (note) b += T(756, y + 24, note, 8, C.CY, 'end'); });
  b += R(244, 214, 520, 4, C.DGY) + R(244, 286, 520, 4, C.DGY) + R(244, 358, 520, 4, C.DGY);
  b += S('capy', 40, 380, 6);
  b += R(152, 372, 40, 20, C.RD) + R(160, 364, 24, 8, C.RD);
  b += caption(7, ['7. THE CALL. TOO MUCH BAD NEWS? FREEZE.', 'DOLLAR UP OVER 0.5%? BUY. DOWN OVER 0.5%?', 'SELL. ANYTHING ELSE? HOLD.']);
  panels.push({ cap:'The call', svg: svg('Step 7: a panel of four signal lights: freeze if bad news is 3 or more, checked first; buy if the dollar rises over 0.5 percent; sell if it falls over 0.5 percent; otherwise hold. Buy is lit.', b) });
}

/* 8 · the log */
{
  let b = R(0, 0, 800, 500, C.DGY) + floor(452, C.K, C.DGY);
  b += panel(28, 128, 744, 288, C.WH, C.BR) + R(396, 132, 8, 280, C.LGY);
  b += T(52, 160, 'AGRO_TRADE_LOG.TXT', 10, C.BR);
  const cols = [52, 196, 276, 340, 412, 508];
  ['TIME', 'BRL', 'Z', 'RISK', 'ACTION', 'WHY'].forEach((h, i) => b += T(cols[i], 196, h, 10, C.GY));
  b += R(52, 206, 696, 4, C.LGY);
  const row = (y, r, actC) => r.map((v, i) => T(cols[i], y, v, 10, i === 4 ? actC : C.K)).join('');
  b += row(240, ['03-04 02:40', '5.28', '1.23', '25', 'FREEZE', 'USD +2.05%'], C.TE);
  b += row(276, ['03-04 12:47', '5.22', '0.17', '0', 'BUY', 'USD +1.00%'], C.GR);
  b += R(52, 292, 696, 4, C.LGY);
  b += T(52, 328, 'EVERY RUN ADDS ONE LINE:', 10, C.K) + T(52, 352, 'THE NUMBERS, THE CALL, AND WHY.', 10, C.K);
  b += T(52, 392, 'REAL ROWS FROM THE REPO LOG', 8, C.GY);
  b += S('capy', 592, 384, 6);
  b += caption(8, ['8. EVERY CALL IS WRITTEN DOWN WITH ITS', 'NUMBERS AND ITS REASON, SO IT CAN BE', 'CHECKED AGAINST WHAT REALLY HAPPENED.']);
  panels.push({ cap:'The log', svg: svg('Step 8: a log book lists two real rows from the trade log: one freeze with risk 25, and one buy when the dollar rose 1 percent.', b) });
}

/* 9 · backtest */
{
  let b = R(0, 0, 800, 500, C.NV) + floor(452, C.DGY, C.NV);
  b += panel(36, 136, 148, 148, C.K, C.YE);
  b += R(72, 172, 76, 76, C.YE) + R(80, 180, 60, 60, C.K) + R(108, 188, 4, 32, C.WH) + R(108, 216, 24, 4, C.WH);
  b += R(56, 196, 12, 4, C.YE) + R(52, 200, 8, 12, C.YE) + R(60, 204, 4, 4, C.YE);
  b += T(110, 272, '2 YEARS', 10, C.YE, 'middle');
  b += panel(208, 128, 324, 228, C.K, C.WH) + T(224, 152, 'ACTUAL VS MODEL', 10, C.LGY);
  b += series([[228,320],[256,296],[284,304],[312,268],[340,280],[368,240],[396,256],[424,216],[452,236],[480,200],[508,212]], C.WH);
  b += dots([[232,312],[260,300],[288,296],[316,276],[344,272],[372,252],[400,248],[428,228],[456,228],[484,212],[508,204]], C.LG, 6);
  b += R(228, 336, 72, 4, C.WH) + T(306, 342, 'STOCK', 8, C.WH) + R(388, 336, 24, 4, C.LG) + T(418, 342, 'MODEL', 8, C.LG);
  b += panel(556, 128, 220, 228, C.K, C.CY) + T(572, 152, 'WHICH CLUE MATTERS?', 8, C.CY);
  [['BRL', 120, C.LG], ['SUGAR', 80, C.YE], ['OIL', 56, C.OR], ['RAIN', 36, C.SK]].forEach(([n, h, c], i) => { const x = 576 + i * 48;
    b += R(x, 316 - h, 28, h, c, ' opacity=".35"') + T(x + 14, 306 - h, '?', 13, C.WH, 'middle') + T(x + 14, 336, n, 8, C.LGY, 'middle'); });
  b += S('capy', 300, 380, 5);
  b += caption(9, ['9. THE TIME MACHINE. REPLAY 2 YEARS OF', 'DATA TO SEE WHICH CLUES REALLY MOVED THE', 'STOCK, BEFORE TRUSTING ANY OF THEM.']);
  panels.push({ cap:'The backtest', svg: svg('Step 9: a rewind clock labelled 2 years, a chart comparing the actual stock with a model, and four bars for dollar, sugar, oil and rain, each marked with a question mark.', b) });
}

let html = '';
panels.forEach(p => {
  html += `              <div class="slide" data-url="agro-quant · how it works" data-cap="${esc(p.cap)}">\n                <div class="screen">${p.svg}</div>\n              </div>\n`;
});
fs.writeFileSync(process.argv[2], html);
console.log('panels', panels.length, html.length);
