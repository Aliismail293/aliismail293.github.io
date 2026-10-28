/* Waypoint story panels in the pixel house style. Usage: node build-pixel-waypoint.js out.html
   Only verified numbers (see WAYPOINT_CONTEXT): 81% recall@5, 67% accuracy (21 held-out Qs), 9/9 live safety,
   $0.0112/question, P95 16.0 s, critic 2/6 -> 4/6 valid plans, fdekit-demo 6/6. */
const fs = require('fs');
const { C, SPR, R, S, T, esc, caption, bubble, card, page, dots, line, floor, svg } = require('./build-pixel.js');

SPR.fox = { pal:{ o:C.OR, w:C.WH, k:C.K, d:'#b8552f' }, rows:[
  'o..........o','oo........oo','ooo......ooo','oooooooooooo','ookooooookoo','woooooooooow',
  'wwooooooooww','.wwwwkkwwww.','..wwwwwwww..','..oooooooo..','.oooowwoooo.','.oooowwoooo.','..kk....kk..']};
SPR.critic = { pal:{ o:C.RD, w:C.WH, k:C.K, y:C.YE }, rows:[
  'o..........o','oo........oo','ooo......ooo','oooooooooooo','oyyyooooyyyo','oykyooooykyo',
  'wyyywwwwyyyw','.wwwwkkwwww.','..wwwwwwww..','..oooooooo..','.oooowwoooo.','.oooowwoooo.','..kk....kk..']};
SPR.student = SPR.person;
for (const n of ['fox','critic']) { const w = SPR[n].rows[0].length; SPR[n].rows.forEach((r,i) => { if (r.length !== w) throw new Error(n + ' row ' + i); }); }

const panel = (x, y, w, h, fill = C.K, border = C.WH) => R(x, y, w, h, border) + R(x + 4, y + 4, w - 8, h - 8, fill);
const thick = (x1, y1, x2, y2, c, s = 4) => dots(line(x1, y1, x2, y2, s), c, s);
const book = (x, y, w, h, c) => R(x, y, w, h, c) + R(x + 6, y + 6, w - 12, h - 12, C.WH) + R(x + w / 2 - 2, y + 6, 4, h - 12, c) +
  [0, 1, 2, 3].map(i => R(x + 12, y + 16 + i * 14, w / 2 - 20, 4, C.LGY) + R(x + w / 2 + 8, y + 16 + i * 14, w / 2 - 20, 4, C.LGY)).join('');
const sheet = (x, y) => panel(x, y, 120, 92, C.WH, C.GR) + [0, 1, 2].map(r => [0, 1, 2].map(c => R(x + 10 + c * 36, y + 14 + r * 24, 30, 16, r === 0 ? C.LG : C.LGY)).join('')).join('');
const oldpc = (x, y) => R(x, y, 112, 84, C.LGY) + R(x + 10, y + 10, 92, 56, C.TE) + R(x + 18, y + 20, 40, 4, C.LG) + R(x + 18, y + 32, 60, 4, C.LG) + R(x + 18, y + 44, 30, 4, C.LG) + R(x + 30, y + 84, 52, 12, C.GY) + R(x + 12, y + 96, 88, 8, C.LGY);
const db = (x, y, c = C.BL) => R(x, y + 8, 80, 64, c) + R(x + 4, y, 72, 16, c) + R(x, y + 24, 80, 4, C.K) + R(x, y + 44, 80, 4, C.K) + R(x + 8, y + 4, 64, 4, C.SK);
const cloud = (x, y) => R(x, y + 24, 200, 48, C.WH) + R(x + 32, y, 88, 32, C.WH) + R(x + 112, y + 10, 56, 24, C.WH) + R(x, y + 68, 200, 4, C.LGY);
const sky = R(0, 0, 800, 500, C.NV);
const panels = [];

/* 1 · the maze */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += book(56, 196, 168, 112, C.RD) + T(140, 330, 'CALENDAR', 10, C.YE, 'middle') + T(140, 346, '1000S OF RULES', 8, C.LGY, 'middle');
  b += sheet(316, 132) + T(376, 246, 'COURSE DATA', 10, C.YE, 'middle');
  b += oldpc(584, 196) + T(640, 330, 'OLD TIMETABLE', 10, C.YE, 'middle');
  b += S('student', 340, 320, 8);
  b += bubble(392, 268, 72, '?', 420);
  b += thick(244, 252, 320, 300, C.LGY) + thick(560, 252, 480, 300, C.LGY) + thick(376, 236, 376, 264, C.LGY);
  b += T(380, 470, 'A UTM STUDENT', 10, C.WH, 'middle');
  b += caption(1, ['1. PLANNING A UOFT DEGREE IS A MAZE:', 'RULES IN A HUGE CALENDAR, COURSE DATA', 'IN TABLES, TIMES IN ANOTHER SYSTEM.']);
  panels.push({ cap:'The maze', svg: svg('Step 1: a student stands between a huge academic calendar, a course-data spreadsheet and an old timetable computer, confused.', b) });
}

/* 2 · meet waypoint */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += S('student', 96, 320, 8);
  b += panel(268, 136, 300, 220, C.K, C.CY) + R(272, 140, 292, 28, C.CY) + T(284, 160, 'WAYPOINT', 13, C.K);
  b += R(292, 184, 252, 52, C.BL) + T(304, 206, 'CAN I FINISH MATH', 10, C.WH) + T(304, 224, '& STATS BY 2029?', 10, C.WH);
  b += R(292, 252, 252, 76, C.DGY) + T(304, 276, 'LET ME CHECK THE', 10, C.LG) + T(304, 294, 'RULES, COURSES AND', 10, C.LG) + T(304, 312, 'TIMETABLE...', 10, C.LG);
  b += S('fox', 620, 336, 8);
  b += R(708, 384, 28, 28, C.YE) + R(714, 390, 16, 16, C.K) + R(720, 394, 4, 8, C.RD);
  b += T(668, 470, 'FINN, THE GUIDE', 10, C.YE, 'middle');
  b += caption(2, ['2. MEET WAYPOINT AND FINN THE FOX. YOU', 'ASK IN PLAIN WORDS: CAN I FINISH MY', 'MAJOR BY 2029?']);
  panels.push({ cap:'Meet Waypoint', svg: svg('Step 2: the student types into the Waypoint chat: can I finish Math and Stats by 2029? Finn the fox, holding a compass, starts checking.', b) });
}

/* 3 · the team */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += S('fox', 352, 140, 8) + T(400, 258, 'FINN: TEAM LEAD', 10, C.YE, 'middle');
  const helpers = [[60, 'RULES', C.RD], [240, 'COURSES', C.GR], [420, 'TIMETABLE', C.SK], [600, 'PLANNER', C.PU]];
  helpers.forEach(([x, name, c]) => {
    b += thick(400, 272, x + 60, 316, C.LGY);
    b += panel(x, 316, 120, 108, C.DGY, c) + S('fox', x + 36, 336, 4) + T(x + 60, 410, name, 8, C.WH, 'middle');
  });
  b += T(400, 470, 'EACH HELPER OWNS ONE JOB', 10, C.LGY, 'middle');
  b += caption(3, ['3. FINN IS A TEAM LEAD. HE HANDS EACH', 'PART TO A SPECIALIST: RULES, COURSES,', 'TIMETABLE AND A PLANNER.']);
  panels.push({ cap:'A team of agents', svg: svg('Step 3: Finn the lead fox hands work to four smaller helper foxes labelled rules, courses, timetable and planner.', b) });
}

/* 4 · hybrid search */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += book(40, 176, 176, 120, C.RD) + T(128, 318, 'CALENDAR', 10, C.YE, 'middle');
  b += panel(288, 140, 216, 72, C.K, C.SK) + T(304, 168, 'BY MEANING', 10, C.SK) + T(304, 194, '"CAN I SKIP A PREREQ"', 8, C.WH);
  b += panel(288, 244, 216, 72, C.K, C.YE) + T(304, 272, 'BY EXACT CODE', 10, C.YE) + T(304, 298, '"MAT224"', 10, C.WH);
  b += thick(216, 220, 284, 176, C.LGY) + thick(216, 252, 284, 280, C.LGY);
  b += thick(508, 176, 560, 228, C.LGY) + thick(508, 280, 560, 236, C.LGY);
  b += panel(568, 176, 192, 112, C.WH, C.LG) + T(584, 206, 'BEST 5 PAGES', 10, C.K) + R(584, 222, 140, 4, C.LGY) + R(584, 236, 120, 4, C.LGY) + R(584, 250, 132, 4, C.LGY) + R(680, 262, 64, 16, C.RD) + T(712, 274, 'CITED', 8, C.WH, 'middle');
  b += S('fox', 116, 360, 5) + T(148, 436, 'RULES', 8, C.WH, 'middle');
  b += T(560, 330, 'FOUND THE RIGHT PAGE', 10, C.LG, 'middle') + T(560, 350, '81% OF THE TIME (TOP 5)', 10, C.WH, 'middle');
  b += caption(4, ['4. THE RULES EXPERT SEARCHES THE CALENDAR', 'TWO WAYS AT ONCE: BY MEANING AND BY EXACT', 'COURSE CODE, THEN CITES THE PAGE.']);
  panels.push({ cap:'Search two ways', svg: svg('Step 4: the calendar is searched by meaning and by exact course code; the results merge into the best five pages with a citation. The right page is found 81 percent of the time.', b) });
}

/* 5 · MCP plugs */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += oldpc(48, 168) + T(104, 300, 'OLD TIMETABLE', 8, C.YE, 'middle');
  b += db(64, 320, C.BL) + T(104, 414, 'COURSE DATABASE', 8, C.YE, 'middle');
  b += R(176, 212, 72, 12, C.LGY) + R(248, 204, 24, 28, C.YE) + R(272, 210, 12, 4, C.YE) + R(272, 222, 12, 4, C.YE);
  b += R(160, 352, 88, 12, C.LGY) + R(248, 344, 24, 28, C.YE) + R(272, 350, 12, 4, C.YE) + R(272, 362, 12, 4, C.YE);
  b += panel(300, 176, 136, 220, C.DGY, C.YE) + T(368, 210, 'MCP', 18, C.YE, 'middle') + T(368, 232, 'UNIVERSAL', 8, C.WH, 'middle') + T(368, 246, 'PLUG', 8, C.WH, 'middle');
  [268, 300, 332, 364].forEach(y => b += R(316, y, 104, 16, C.K) + R(332, y + 4, 8, 8, C.YE) + R(396, y + 4, 8, 8, C.YE));
  b += thick(440, 286, 520, 286, C.LGY);
  b += S('fox', 556, 236, 6) + T(592, 336, 'TIMETABLE', 8, C.WH, 'middle');
  b += S('fox', 664, 236, 6) + T(700, 336, 'COURSES', 8, C.WH, 'middle');
  b += T(400, 470, 'ONE STANDARD WAY IN, FOR ANY TOOL', 10, C.LGY, 'middle');
  b += caption(5, ['5. OLD SYSTEMS GET A UNIVERSAL PLUG', '(MCP), SO THE AGENTS CAN TALK TO THE', 'TIMETABLE AND THE COURSE DATABASE.']);
  panels.push({ cap:'Universal plugs', svg: svg('Step 5: an old timetable computer and a course database plug into a power strip labelled MCP, which connects them to the helper agents.', b) });
}

/* 6 · planner + critic */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += panel(208, 132, 384, 200, C.WH, C.PU);
  ['FALL 27', 'WINTER 28', 'FALL 28'].forEach((t, i) => { const x = 224 + i * 124;
    b += R(x, 148, 112, 24, C.PU) + T(x + 56, 165, t, 8, C.WH, 'middle');
    [0, 1, 2].forEach(j => b += R(x + 8, 184 + j * 32, 96, 24, C.LGY)); });
  b += R(356, 248, 96, 24, C.RD) + T(404, 265, 'NO PREREQ', 8, C.WH, 'middle');
  b += S('fox', 72, 300, 7) + T(114, 412, 'PLANNER', 10, C.WH, 'middle');
  b += S('critic', 644, 300, 7) + T(686, 412, 'CRITIC', 10, C.RD, 'middle');
  b += R(612, 216, 40, 40, C.RD) + R(620, 224, 8, 8, C.WH) + R(636, 240, 8, 8, C.WH) + R(636, 224, 8, 8, C.WH) + R(620, 240, 8, 8, C.WH) + R(628, 232, 8, 8, C.WH);
  b += T(632, 206, 'FIX IT', 8, C.RD, 'middle');
  b += panel(208, 352, 384, 72, C.K, C.LG) + T(400, 382, 'VALID PLANS: 2/6 -> 4/6', 10, C.LG, 'middle') + T(400, 404, 'UP TO 2 FIX-UP ROUNDS', 8, C.LGY, 'middle');
  b += caption(6, ['6. THE PLANNER DRAFTS A TERM-BY-TERM', 'PLAN. A CRITIC CHECKS EVERY PREREQ AND', "SENDS IT BACK IF SOMETHING'S WRONG."]);
  panels.push({ cap:'Planner and critic', svg: svg('Step 6: the planner fox drafts a three-term plan; a critic fox with glasses flags a missing prerequisite and sends it back. Valid plans rose from 2 of 6 to 4 of 6.', b) });
}

/* 7 · the quiz */
{
  let b = R(0, 0, 800, 500, C.K) + floor(452, C.DGY, C.NV);
  b += panel(152, 128, 496, 300, C.NV, C.WH) + R(156, 132, 488, 36, C.BL) + T(400, 156, 'BEFORE LAUNCH: THE EXAM', 10, C.WH, 'middle');
  const rows = [['FOUND THE RIGHT PAGE', '81%', C.LG], ['RIGHT ANSWER', '67%', C.YE], ['ATTACKS BLOCKED', '9/9', C.LG]];
  rows.forEach(([n, v, c], i) => { const y = 200 + i * 64;
    b += T(180, y, n, 10, C.WH) + T(620, y, v, 18, c, 'end') + R(180, y + 14, 440, 8, C.DGY) + R(180, y + 14, Math.round(440 * (i === 2 ? 1 : (i === 0 ? .81 : .67))), 8, c); });
  b += T(400, 404, '21 QUESTIONS IT NEVER SAW BEFORE', 8, C.LGY, 'middle');
  b += S('fox', 40, 360, 5) + S('critic', 700, 360, 5);
  b += caption(7, ["7. BEFORE ANYONE USES IT, IT'S QUIZZED", 'ON 21 UNSEEN QUESTIONS AND 9 ATTACKS', 'THAT TRY TO TRICK IT.']);
  panels.push({ cap:'The exam', svg: svg('Step 7: a scoreboard shows the right page found 81 percent of the time, the right answer 67 percent, and 9 of 9 attacks blocked, on 21 unseen questions.', b) });
}

/* 8 · the meter */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += panel(64, 136, 320, 168, C.K, C.YE) + T(80, 164, 'COST PER QUESTION', 10, C.YE) + T(224, 236, '$0.011', 32, C.WH, 'middle') + T(224, 276, 'ABOUT ONE CENT', 10, C.LGY, 'middle');
  b += panel(416, 136, 320, 168, C.K, C.SK) + T(432, 164, 'SLOWEST 5%', 10, C.SK) + T(576, 236, '16 S', 32, C.WH, 'middle') + T(576, 276, 'NEXT: MAKE IT FASTER', 10, C.LGY, 'middle');
  [[96, 56], [128, 72], [160, 48], [192, 88], [224, 64], [256, 80], [288, 52], [320, 76]].forEach(([x, h], i) => b += R(x + 96, 420 - h, 20, h, i % 2 ? C.SK : C.YE));
  b += T(400, 324, 'EVERY STEP TIMED AND PRICED', 10, C.WH, 'middle');
  b += S('fox', 64, 352, 6);
  b += caption(8, ['8. EVERY STEP IS METERED: HOW LONG IT', 'TOOK AND WHAT IT COST. ONE QUESTION', 'COSTS ABOUT ONE CENT.']);
  panels.push({ cap:'Metered', svg: svg('Step 8: dashboards show about one cent per question and 16 seconds for the slowest 5 percent of requests, with every step timed and priced.', b) });
}

/* 9 · live + kit */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += cloud(64, 136) + T(164, 192, 'GOOGLE CLOUD', 10, C.BL, 'middle');
  b += panel(104, 232, 120, 96, C.K, C.LG) + T(164, 262, 'WAYPOINT', 8, C.LG, 'middle') + R(124, 276, 80, 4, C.LGY) + R(124, 290, 64, 4, C.LGY) + R(150, 304, 28, 12, C.LG) + T(164, 314, 'LIVE', 8, C.K, 'middle');
  b += thick(232, 280, 312, 280, C.LGY);
  b += panel(320, 232, 160, 120, C.BR, C.YE) + R(320, 228, 160, 16, C.YE) + T(400, 288, 'FDE-KIT', 13, C.WH, 'middle') + T(400, 312, 'REUSABLE PARTS', 8, C.YE, 'middle');
  b += thick(488, 280, 560, 280, C.LGY);
  b += panel(568, 232, 160, 96, C.K, C.SK) + T(648, 262, 'APP #2', 10, C.SK, 'middle') + T(648, 286, 'NEW DOMAIN', 8, C.WH, 'middle') + T(648, 310, '6/6 ON TEST', 8, C.LG, 'middle');
  b += S('fox', 368, 368, 4) + S('student', 640, 360, 4);
  b += caption(9, ["9. IT'S LIVE ON GOOGLE CLOUD, AND ITS", 'PARTS WERE PACKED INTO A KIT THAT', 'BUILT A SECOND APP.']);
  panels.push({ cap:'Live and reusable', svg: svg('Step 9: Waypoint runs live on Google Cloud; its parts were packed into fde-kit, which built a second app in a new domain that scored 6 of 6 on its test.', b) });
}

let html = '';
panels.forEach(p => {
  html += `              <div class="slide" data-url="waypoint · how it works" data-cap="${esc(p.cap)}">\n                <div class="screen">${p.svg}</div>\n              </div>\n`;
});
fs.writeFileSync(process.argv[2], html);
console.log('panels', panels.length, html.length);
