/* Waypoint story panels in the pixel house style. Usage: node build-pixel-waypoint.js out.html
   Story: V1 -> testing it as a student -> V3 fixes -> re-measured. Only verified numbers (WAYPOINT_PROJECT_CONTEXT):
   V1: 81% recall@5, 67% accuracy (21 held-out Qs), P95 16.0 s, 9/9 safety. User testing: a plan timed out at 31.7 s.
   V3: 99.4% fact eval (167 Qs), 90% policy RAG (10 locked Qs). MAT236 prerequisite tree is real parsed calendar data.
   Planning (10 live Qs, Nov 24): P95 46.9 s -> 3.2 s, $0.68 -> $0.005 for all 10, valid plans 10/10 by Waypoint's own
   validator. Release gate: the candidate failed the live smoke test 4 times (2 bugs: empty model replies, cached failures).
   Real screenshots and the Pip GIF come from the waypoint repo (docs/img, PR #8) and live in ../images/. */
const fs = require('fs');
const { C, SPR, R, S, T, esc, caption, bubble, card, page, dots, line, floor, svg } = require('./build-pixel.js');

SPR.fox = { pal:{ o:C.OR, w:C.WH, k:C.K, d:'#b8552f' }, rows:[
  'o..........o','oo........oo','ooo......ooo','oooooooooooo','ookooooookoo','woooooooooow',
  'wwooooooooww','.wwwwkkwwww.','..wwwwwwww..','..oooooooo..','.oooowwoooo.','.oooowwoooo.','..kk....kk..']};
SPR.critic = { pal:{ o:C.RD, w:C.WH, k:C.K, y:C.YE }, rows:[
  'o..........o','oo........oo','ooo......ooo','oooooooooooo','oyyyooooyyyo','oykyooooykyo',
  'wyyywwwwyyyw','.wwwwkkwwww.','..wwwwwwww..','..oooooooo..','.oooowwoooo.','.oooowwoooo.','..kk....kk..']};
SPR.student = SPR.person;
/* Pip matches the real app's mascot (docs/img/pip.gif): indigo body, amber antenna and chest light. */
const PIP = { I:'#6366f1', D:'#3730a3', A:'#f59e0b', F:'#141a2d' };
SPR.pip = { pal:{ i:PIP.I, d:PIP.D, a:PIP.A, w:C.WH, k:PIP.F }, rows:[
  '.....aa.....','.....dd.....','..iiiiiiii..','..iwwwwwwi..','..iwkwwkwi..','..iwwwwwwi..',
  '..iwwkkwwi..','..iwwwwwwi..','..iiiiiiii..','.diiiaaiiid.','.diiiiiiiid.','..iiiiiiii..','...dd..dd...']};
for (const n of ['fox','critic','pip']) { const w = SPR[n].rows[0].length; SPR[n].rows.forEach((r,i) => { if (r.length !== w) throw new Error(n + ' row ' + i); }); }

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
  b += R(292, 252, 252, 76, C.DGY) + T(304, 276, 'LET ME CHECK THE', 10, C.LG) + T(304, 294, 'RULES, COURSES AND', 10, C.LG) + T(304, 312, 'PREREQS...', 10, C.LG);
  b += S('fox', 620, 336, 8);
  b += R(708, 384, 28, 28, C.YE) + R(714, 390, 16, 16, C.K) + R(720, 394, 4, 8, C.RD);
  b += T(668, 470, 'FINN, THE GUIDE', 10, C.YE, 'middle');
  b += caption(2, ['2. MEET WAYPOINT AND FINN THE FOX. YOU', 'ASK IN PLAIN WORDS: CAN I FINISH MY', 'MAJOR BY 2029?']);
  panels.push({ cap:'Meet Waypoint', svg: svg('Step 2: the student types into the Waypoint chat: can I finish Math and Stats by 2029? Finn the fox, holding a compass, starts checking.', b) });
}

/* 3 · V1: the team */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += S('fox', 352, 140, 8) + T(400, 258, 'FINN: TEAM LEAD', 10, C.YE, 'middle');
  const helpers = [[60, 'RULES', C.RD], [240, 'COURSES', C.GR], [420, 'TIMETABLE', C.SK], [600, 'PLANNER', C.PU]];
  helpers.forEach(([x, name, c]) => {
    b += thick(400, 272, x + 60, 316, C.LGY);
    b += panel(x, 316, 120, 108, C.DGY, c) + S('fox', x + 36, 336, 4) + T(x + 60, 410, name, 8, C.WH, 'middle');
  });
  b += R(600, 140, 152, 28, C.YE) + T(676, 159, 'VERSION 1', 10, C.K, 'middle');
  b += T(400, 470, 'GOOGLE ADK AGENTS ON GOOGLE CLOUD', 10, C.LGY, 'middle');
  b += caption(3, ['3. VERSION 1: FINN LEADS A TEAM OF AI', 'HELPERS FOR RULES, COURSES, TIMETABLE', 'AND PLANNING, LIVE ON GOOGLE CLOUD.']);
  panels.push({ cap:'Version 1: a team of agents', svg: svg('Step 3: version 1. Finn the lead fox hands work to four smaller helper foxes labelled rules, courses, timetable and planner.', b) });
}

/* 4 · V1: the honest score */
{
  let b = R(0, 0, 800, 500, C.K) + floor(452, C.DGY, C.NV);
  b += panel(152, 128, 496, 300, C.NV, C.WH) + R(156, 132, 488, 36, C.BL) + T(400, 156, 'VERSION 1: THE HONEST SCORE', 10, C.WH, 'middle');
  const rows = [['FOUND THE RIGHT PAGE', '81%', C.LG, .81], ['RIGHT ANSWER', '67%', C.YE, .67], ['SLOWEST 5% OF ANSWERS', '16 S', C.RD, .9]];
  rows.forEach(([n, v, c, f], i) => { const y = 200 + i * 64;
    b += T(180, y, n, 10, C.WH) + T(620, y, v, 18, c, 'end') + R(180, y + 14, 440, 8, C.DGY) + R(180, y + 14, Math.round(440 * f), 8, c); });
  b += T(400, 404, '21 QUESTIONS IT NEVER SAW BEFORE', 8, C.LGY, 'middle');
  b += S('fox', 40, 360, 5) + S('critic', 700, 360, 5);
  b += caption(4, ['4. ITS FIRST EXAM, ON 21 UNSEEN QUESTIONS:', 'THE RIGHT ANSWER 67% OF THE TIME, AND THE', 'SLOWEST ANSWERS TOOK 16 SECONDS.']);
  panels.push({ cap:'The honest first score', svg: svg('Step 4: a scoreboard for version 1 on 21 unseen questions: right page found 81 percent of the time, right answer 67 percent, and the slowest 5 percent of answers took 16 seconds.', b) });
}

/* 5 · testing it as a student */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += R(144, 368, 272, 12, C.BR) + R(160, 380, 12, 60, C.DBR) + R(388, 380, 12, 60, C.DBR);
  b += panel(176, 228, 208, 132, C.K, C.LGY) + R(188, 244, 184, 20, C.BL) + T(196, 258, 'PLAN MY DEGREE', 8, C.WH);
  b += R(188, 276, 120, 8, C.LGY) + R(188, 292, 96, 8, C.LGY) + T(280, 336, 'STEP LIMIT', 8, C.RD, 'middle');
  b += R(160, 360, 240, 8, C.LGY);
  b += S('student', 56, 316, 8);
  b += bubble(32, 256, 112, 'HMM...', 84);
  const notes = [['TOO SLOW', 'A PLAN TIMED OUT AT 31.7 S', 136], ['WRONG FACTS', 'PREREQ AND / OR MIXED UP', 220], ['CONFUSING SCREENS', 'MAP COLUMNS MADE NO SENSE', 304]];
  notes.forEach(([t, d, y]) => { b += panel(448, y, 320, 68, C.WH, C.RD) + T(468, y + 28, t, 10, C.RD) + T(468, y + 50, d, 8, C.K); });
  b += T(608, 470, 'REAL PROBLEMS, FOUND BY USING IT', 8, C.LGY, 'middle');
  b += caption(5, ['5. TESTING IT AS A REAL STUDENT SHOWED', 'PROBLEMS: SLOW PLANS, PREREQ AND / OR', 'MIXED UP, AND CONFUSING SCREENS.']);
  panels.push({ cap:'Testing it as a student', svg: svg('Step 5: the student tries Waypoint on a laptop. Three red notes: a plan timed out at 31.7 seconds, prerequisite and/or rules got mixed up, and the course map columns were confusing.', b) });
}

/* 6 · facts as data */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += panel(296, 128, 208, 48, C.K, C.YE) + T(400, 158, 'MAT236 NEEDS', 10, C.YE, 'middle');
  b += thick(400, 176, 400, 196, C.LGY);
  b += panel(340, 196, 120, 40, C.K, C.LG) + T(400, 222, 'ALL OF', 10, C.LG, 'middle');
  b += thick(368, 236, 240, 260, C.LGY) + thick(432, 236, 560, 260, C.LGY);
  const branch = (x, a, bb) => panel(x, 260, 200, 40, C.K, C.SK) + T(x + 100, 286, 'ONE OF', 10, C.SK, 'middle') +
    R(x + 4, 312, 92, 28, C.WH) + T(x + 44, 331, a, 8, C.K, 'middle') + S('check', x + 78, 320, 2) +
    R(x + 104, 312, 92, 28, C.LGY) + T(x + 150, 331, bb, 8, C.DGY, 'middle');
  b += branch(140, 'MAT223', 'MAT240') + branch(460, 'MAT232', 'MAT233');
  b += panel(296, 364, 208, 44, C.K, C.LG) + T(388, 392, 'ELIGIBLE', 10, C.LG, 'middle') + S('check', 456, 380, 2);
  b += S('fox', 48, 372, 5) + T(78, 470, 'CODE DECIDES', 8, C.YE, 'middle');
  b += S('pip', 696, 372, 5) + T(726, 470, 'AI EXPLAINS', 8, '#a5b4fc', 'middle');
  b += caption(6, ['6. FIX 1: FACTS BECAME DATA. PREREQS ARE', 'PARSED INTO AND / OR TREES AND CHECKED BY', 'CODE. THE AI ONLY EXPLAINS THE RESULT.']);
  panels.push({ cap:'Facts as data, not text', svg: svg('Step 6: the real prerequisite rule for MAT236 drawn as a tree: all of, one of MAT223 or MAT240, and one of MAT232 or MAT233. Code checks the courses taken and says eligible; the AI only explains.', b) });
}

/* 7 · speed */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += panel(176, 128, 264, 140, C.K, C.CY) + T(192, 154, 'LIVE STEPS', 10, C.CY);
  [['PLAN BUILT IN CODE', true], ['PLAN CHECKED IN CODE', true], ['EXPLAINING...', false]].forEach(([t, done], i) => {
    const y = 186 + i * 28;
    b += done ? S('check', 192, y - 10, 2) : T(196, y, '>', 8, C.YE);
    b += T(216, y, t, 8, done ? C.WH : C.YE);
  });
  b += panel(176, 284, 264, 116, C.WH, C.LGY) + T(192, 308, 'YOUR PLAN, AT ONCE', 8, C.K);
  b += R(192, 322, 112, 28, '#e0e7ff') + T(248, 340, 'FALL', 8, PIP.D, 'middle') + R(312, 322, 112, 28, '#e0e7ff') + T(368, 340, 'WINTER', 8, PIP.D, 'middle');
  b += R(192, 362, 200, 8, C.LGY) + R(192, 378, 140, 8, C.LGY) + R(336, 376, 8, 12, C.K);
  b += S('pip', 48, 300, 8) + T(96, 470, 'PIP, THE GUIDE', 10, C.YE, 'middle');
  b += panel(472, 128, 296, 272, C.K, C.YE) + T(620, 156, 'SLOWEST PLANS (P95)', 10, C.YE, 'middle');
  b += T(492, 192, 'BEFORE', 8, C.LGY) + R(492, 200, 256, 20, C.RD) + T(744, 215, '46.9 S', 10, C.WH, 'end');
  b += T(492, 248, 'NOW', 8, C.LGY) + R(492, 256, 20, 20, C.LG) + T(524, 271, '3.2 S', 10, C.LG);
  b += R(492, 296, 256, 4, C.DGY);
  b += T(492, 326, 'COST FOR ALL 10 PLANS', 8, C.LGY) + T(492, 352, '$0.68 -> $0.005', 13, C.WH);
  b += T(620, 384, '10 LIVE PLANNING QUESTIONS', 8, C.LGY, 'middle');
  b += caption(7, ['7. FIX 2: SPEED. PLANS ARE BUILT IN CODE', 'AND SHOWN AT ONCE, THEN PIP STREAMS A', 'SHORT EXPLANATION. 46.9 S -> 3.2 S.']);
  panels.push({ cap:'Fix 2: speed', svg: svg('Step 7: Pip shows live steps: the plan is built and checked in code and shown at once, then a short explanation streams. The slowest 5 percent of plans went from 46.9 seconds to 3.2 seconds, and the cost of all 10 test plans from 68 cents to half a cent.', b) });
}

/* 8 · a clearer app */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += T(104, 140, 'YEAR 1', 8, C.LGY, 'middle') + T(344, 140, 'YEAR 2', 8, C.LGY, 'middle');
  b += R(200, 128, 4, 280, C.GY);
  const node = (x, y, t, mode, dot) => {
    const f = mode === 'sel' ? C.YE : mode === 'hi' ? C.K : C.DGY, br = mode === 'dim' ? C.GY : C.YE, tc = mode === 'sel' ? C.K : mode === 'hi' ? C.WH : C.GY;
    return panel(x, y, 112, 36, f, br) + T(x + 56, y + 23, t, 8, tc, 'middle') + (dot ? R(x + 96, y + 8, 8, 8, dot) : '');
  };
  const dim = (x1, y1, x2, y2) => thick(x1, y1, x2, y2, C.GY);
  const hi = (x1, y1, x2, y2) => thick(x1, y1, x2, y2, C.YE);
  b += dim(160, 174, 224, 300) + dim(336, 174, 352, 174);
  b += hi(160, 238, 224, 238) + hi(336, 174, 352, 236) + hi(336, 238, 352, 242);
  b += node(48, 156, 'MAT102', 'dim') + node(48, 220, 'MAT134', 'hi', C.GR);
  b += node(224, 156, 'MAT223', 'hi', C.GR) + node(224, 220, 'MAT232', 'hi', C.SK) + node(224, 284, 'MAT202', 'dim');
  b += node(352, 156, 'MAT224', 'dim') + node(352, 220, 'MAT236', 'sel', C.PU);
  b += R(48, 352, 8, 8, C.GR) + T(64, 360, 'TAKEN', 8, C.WH) + R(136, 352, 8, 8, C.SK) + T(152, 360, 'IN PROGRESS', 8, C.WH) + R(264, 352, 8, 8, C.PU) + T(280, 360, 'PLANNED', 8, C.WH);
  b += T(48, 392, 'CLICK A COURSE: ITS PATH LIGHTS UP', 8, C.YE);
  b += panel(512, 128, 256, 208, C.WH, C.PU) + R(516, 132, 248, 24, C.PU) + T(640, 149, 'MY PLAN', 8, C.WH, 'middle');
  b += T(532, 178, 'FALL', 8, C.PU) + R(612, 166, 136, 20, C.LGY) + T(680, 180, 'MAT232', 8, C.K, 'middle');
  b += T(532, 210, 'WINTER', 8, C.PU) + R(612, 198, 136, 20, C.LGY) + T(680, 212, 'MAT236', 8, C.K, 'middle');
  b += R(528, 236, 224, 84, C.LGY) + R(540, 248, 20, 20, C.SK) + T(550, 262, 'I', 8, C.WH, 'middle');
  b += T(572, 262, 'NOTE: TAKE', 8, C.K) + T(540, 286, 'MAT232 BEFORE', 8, C.K) + T(540, 306, 'MAT236', 8, C.K);
  b += S('fox', 600, 360, 5) + S('student', 680, 356, 5);
  b += caption(8, ['8. FIX 3: A CLEARER APP. CLICK A COURSE', 'TO LIGHT UP ITS PREREQ PATH, MARK WHAT', "YOU'VE TAKEN, AND GET CALM PLAN NOTES."]);
  panels.push({ cap:'A clearer app', svg: svg('Step 8: a course map where clicking MAT236 lights up its prerequisite path and dims everything else, with courses marked taken, in progress or planned, next to a plan with a calm note: take MAT232 before MAT236.', b) });
}

/* 9 · the release gate */
{
  let b = sky + floor(440, C.DGY, C.GY);
  b += panel(40, 152, 176, 120, C.K, C.SK) + T(128, 184, 'NEW VERSION', 10, C.SK, 'middle') + T(128, 208, 'NO TRAFFIC YET', 8, C.LGY, 'middle');
  b += S('pip', 104, 220, 4);
  b += R(296, 136, 16, 300, C.LGY) + R(488, 136, 16, 300, C.LGY) + R(296, 136, 208, 24, C.YE) + T(400, 153, 'SMOKE TEST', 8, C.K, 'middle');
  [1, 2, 3, 4].forEach(n => { const y = 172 + (n - 1) * 40;
    b += T(328, y + 20, 'TRY ' + n, 8, C.WH) + S('cross', 444, y + 8, 3); });
  b += T(328, 352, 'TRY 5', 8, C.WH) + S('check', 440, 338, 3);
  b += thick(220, 212, 288, 212, C.LGY) + thick(512, 344, 568, 344, C.LG);
  b += panel(576, 296, 192, 96, C.K, C.LG) + T(672, 328, 'GOES LIVE', 10, C.LG, 'middle') + T(672, 352, 'ONLY AFTER', 8, C.WH, 'middle') + T(672, 370, 'A PASS', 8, C.WH, 'middle');
  b += panel(576, 136, 192, 144, C.WH, C.RD) + T(592, 160, 'BUGS IT CAUGHT', 8, C.RD);
  b += T(592, 188, '1. EMPTY AI REPLY:', 8, C.K) + T(592, 204, 'PLANNER GAVE UP', 8, C.DGY);
  b += T(592, 236, '2. THAT FAILURE', 8, C.K) + T(592, 252, 'GOT CACHED', 8, C.DGY);
  b += S('critic', 336, 380, 4) + T(400, 470, 'BOTH FIXED, WITH TESTS', 8, C.LGY, 'middle');
  b += caption(9, ['9. SHIPPING SAFELY: EACH NEW VERSION MUST', 'PASS A LIVE SMOKE TEST FIRST. IT FAILED 4', 'TIMES, CATCHING 2 BUGS, BEFORE GOING LIVE.']);
  panels.push({ cap:'The release gate', svg: svg('Step 9: a new version waits behind a gate labelled smoke test. It fails four tries and passes on the fifth, and only then goes live. The gate caught two bugs: the planner gave up on an empty AI reply, and that failure got cached.', b) });
}

/* 10 · re-measured, and what's next */
{
  let b = R(0, 0, 800, 500, C.K) + floor(452, C.DGY, C.NV);
  b += panel(152, 124, 496, 244, C.NV, C.WH) + R(156, 128, 488, 36, C.BL) + T(400, 152, 'RE-TESTED WITH RAGAUDIT + CODE', 10, C.WH, 'middle');
  const rows = [['FACT CHECKS, 167 QUESTIONS', '99.4%', C.LG, .994], ['POLICY, 10 LOCKED QUESTIONS', '90%', C.YE, .9], ['VALID PLANS, 10 QUESTIONS', '10/10', C.LG, 1], ['ATTACKS BLOCKED', '9/9', C.LG, 1]];
  rows.forEach(([n, v, c, f], i) => { const y = 190 + i * 44;
    b += T(180, y, n, 10, C.WH) + T(620, y, v, 14, c, 'end') + R(180, y + 10, 440, 6, C.DGY) + R(180, y + 10, Math.round(440 * f), 6, c); });
  b += panel(152, 380, 496, 56, C.K, C.LG) + T(400, 403, 'NEXT: ALL 3 CAMPUSES + REAL STUDENTS', 10, C.LG, 'middle') + T(400, 423, 'U OF T DATA ACCESS REQUESTED', 8, C.LGY, 'middle');
  b += S('owl', 40, 360, 5) + S('pip', 692, 372, 5);
  b += caption(10, ['10. RE-TESTED WITH RAGAUDIT AND CODE.', 'NEXT: DATA FOR ALL THREE U OF T CAMPUSES,', 'THEN REAL STUDENTS USING IT.']);
  panels.push({ cap:'Re-measured, and what’s next', svg: svg('Step 10: the new scores: 99.4 percent on 167 fact checks, 90 percent on 10 locked policy questions, 10 of 10 valid plans by Waypoint’s own validator, and 9 of 9 attacks blocked. Next: data for all three U of T campuses, then real students.', b) });
}

/* real screenshots from the live app, placed right after the panel they prove */
const shots = [
  [6, 'images/waypoint-chat.png', 'Real app: a fact answer with its source', 'Waypoint chat answering what is needed before MAT224H5 with one calendar source and zero model calls'],
  [7, 'images/waypoint-pip.gif', 'Real app: Pip’s four states', 'Pip, the pixel robot, in its four states: idle, thinking, talking and waving'],
  [8, 'images/waypoint-course-map.png', 'Real app: the course map', 'Course map of 100- and 200-level MAT courses, with taken courses outlined in green'],
  [8, 'images/waypoint-my-plan.png', 'Real app: My plan with critic notes', 'My plan with two terms and a critic report that lists two calm notes'],
  [8, 'images/waypoint-programs.png', 'Real app: Programs', 'Programs list with the Mathematics major, Applied Mathematics major, minor and specialist'],
];
for (const [after, src, cap, alt] of shots.slice().reverse()) panels.splice(after, 0, { cap, img: src, alt, url: 'waypoint-courses.web.app' });

let html = '';
panels.forEach(p => {
  const inner = p.img ? `<img src="${p.img}" alt="${esc(p.alt)}" loading="lazy">` : p.svg;
  html += `              <div class="slide" data-url="${p.url || 'waypoint · how it works'}" data-cap="${esc(p.cap)}">\n                <div class="screen">${inner}</div>\n              </div>\n`;
});
fs.writeFileSync(process.argv[2], html);
console.log('panels', panels.length, html.length);
