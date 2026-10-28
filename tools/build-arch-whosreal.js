const fs = require('fs');
const { render } = require('./arch-lib.js');
const R = [80, 180, 280, 380, 480];
const A = 40, B = 330, Cc = 620, D = 950, E = 1260;

const nodes = [
  { k:'join', x:A, y:R[0], w:250, kind:'store', title:'Player joins', sub:['DataService loads profile', 'ProfileStore session lock'], file:'DataService',
    detail:'Loads the saved profile: Anomaly Log, coins, cosmetics, stats, spins and the tutorial flag. ProfileStore session-locks it, so two servers can never overwrite the same player\'s data.' },
  { k:'lobby', x:A, y:R[1], w:250, title:'Lobby + matchmaking', sub:['min 3 players · bots fill to 6', 'friend groups detected'],
    detail:'A round needs three real players; BotService fills the server to six so the game is playable from day one with empty servers. Friend groups in the same server are noted for the Variant pick.' },
  { k:'tutorial', x:A, y:R[2], w:250, title:'First-join tutorial', sub:['report · spot a fake · ability', 'analytics funnel'],
    detail:'Skippable tutorial: report one anomaly, spot one fake copy, learn the role button. AnalyticsService tracks Joined → TutorialDone → Round1Done → Round2Started, and the biggest drop-off gets fixed first after launch.' },

  { k:'state', x:B, y:R[0], w:250, kind:'gate', title:'Round state machine', sub:['Lobby → Intermission → Shift', '↔ Meeting → Results'], file:'RoundService',
    detail:'One server-owned state machine drives the whole round. Every remote checks the current state first, so a client cannot vote during a shift or report during a meeting.' },
  { k:'roles', x:B, y:R[1], w:250, kind:'lock', title:'Role roll', sub:['C 40 · B 30 · A 20 · S 8 · SSS 2', 'you only learn your own'], file:'RoleService · Rules',
    detail:'Nine crew roles rolled by tier weight in a pure Rules function, so the odds are unit tested. Spins earned by playing reroll your next role. Roles are never sold: no pay-to-win.' },
  { k:'variant', x:B, y:R[2], w:250, kind:'lock', title:'Variant pick', sub:['1 Variant · 2 at 8+ players', 'picked inside friend groups'], file:'VariantService',
    detail:'Picked on the server and told only to the Variants\' own clients. If a friend group is in the server, the Variant and its first target come from inside it, so "ask a secret question on Discord" doesn\'t work: the liar is in the call.' },

  { k:'anomaly', x:Cc, y:R[0], w:290, title:'Anomaly loop', sub:['every 35–60 s, one per room', 'report sends room + category only'], file:'AnomalyService',
    detail:'The server changes one room at a time. Players report at that room\'s terminal by picking a category; the client sends only room and category and the server judges it. Correct: the room reverts and the reporter earns a card and coins. Wrong: −4. Missed for 45 s: −8.' },
  { k:'incursion', x:Cc, y:R[1], w:290, kind:'ext', title:'Incursion + disguise', sub:['portal every 90–120 s', 'exact copy · one random tell'], file:'VariantService',
    detail:'The Variant steps through a portal and becomes an exact copy of a target (HumanoidDescription plus a custom name tag), spawning on the same spot. Each copy gets one tell, applied on the server. For 20 s, jumps, crouches and emotes play on both copies, which defeats "jump twice if you\'re real".' },
  { k:'kill', x:Cc, y:R[2], w:290, kind:'gate', title:'Kill check', sub:['nearest crew within 6 studs', 'fails if any witness ≤ 60 studs'], file:'Rules · line of sight',
    detail:'The server picks the nearest crew member in range and fails the kill, without spending the 30 s cooldown, if any living player or bot has clear line of sight within 60 studs. A disguised kill frames the real person. Victims shatter into magenta pixels, never gore.' },
  { k:'clock', x:Cc, y:R[3], w:290, kind:'gate', title:'Doomsday Clock', sub:['one owner, starts at 100', 'every change carries a reason'], file:'ClockService',
    detail:'ClockService is the only thing allowed to change the clock, and every change carries a reason shown on the HUD ("Missed anomaly −8"). One writer makes the economy easy to tune and debug.' },
  { k:'scan', x:Cc, y:R[4], w:290, title:'Scanners + abilities', sub:['10 s scan shows the tell to you', 'role abilities on F'], file:'ScannerService',
    detail:'Scanning someone takes 10 s with both players in range; if the target is a copy, only the scanner sees its tell, and the Variant is alerted while being scanned. Role abilities (shield, rewind, forced reveal) run through RoleAbilityService.' },

  { k:'chat', x:D, y:R[0], w:270, title:'Chat lockdown', sub:['TextService filter on everything', 'shows disguised names'], file:'ChatService',
    detail:'Default chat is off during rounds; only bubble chat above custom name tags. The meeting chat is a custom, filtered panel that shows displayed names, so a disguise holds. Voice chat is off.' },
  { k:'meeting', x:D, y:R[1], w:270, kind:'gate', title:'Meeting + vote', sub:['60 s discuss + 30 s vote', 'attach one tell as evidence'], file:'MeetingService',
    detail:'Called by the emergency button (once per player) or a sighting report. Ties eject nobody. Ejecting the Variant with the right tell attached earns those voters a Mythic card, which rewards evidence over guessing. A wrong ejection costs 10 clock.' },
  { k:'ghost', x:D, y:R[2], w:270, title:'Ghosts', sub:['can fix anomalies', 'no vote · ghost-only chat'],
    detail:'Killed crew, and crew wrongly ejected, become ghosts: invisible to the living, still able to fix anomalies, unable to vote or call meetings, and ignored by the Tyrant. Dead players keep playing instead of leaving.' },
  { k:'tyrant', x:D, y:R[3], w:270, kind:'ext', title:'Doomsday + Tyrant', sub:['clock 0 → 90 s chase', 'path recomputed every 0.5 s'], file:'TyrantService',
    detail:'At zero the lights go red and the Tyrant, an original clockwork emperor, chases the nearest living player using PathfindingService. Survivors win by reaching the escape portal within 90 s.' },

  { k:'event', x:E, y:R[0], w:310, kind:'proto', title:'Doomsday Event', sub:['time-gated Dec 18 – Jan 8', 'server checks every 60 s'],
    detail:'A new wing, anomalies, a tell and cards, built early and hidden. It switches itself on by date during exam season with no work. Clients only learn whether the event is active.' },
  { k:'results', x:E, y:R[1], w:310, kind:'gate', title:'Results + win check', sub:['reveal the Variant and its tell', 'parity · chase · timer rules'], file:'Rules',
    detail:'Crew wins when every Variant is out. Variants win at parity (bots count as crew) or if the chase leaves no survivor. The shift timer ending with crew alive also ends the round. All win checks are pure, unit-tested functions.' },
  { k:'rewards', x:E, y:R[2], w:310, kind:'store', title:'Rewards + save', sub:['Anomaly Log cards · coins · spins', 'new-card popup'], file:'DataService',
    detail:'Caught anomalies and tells fill the Anomaly Log book (Common to Mythic, silhouettes for uncaught cards). Coins buy cosmetics only. Spins are earned through play only, never sold.' },

  { k:'secrets', x:40, y:628, w:420, h:84, kind:'lock', title:'Server owns every secret', sub:['clients never get Variant, tells or roles', 'every remote: state + sender + rate limit'],
    detail:'The server decides every outcome: reports, votes, scans, kills, clock and rewards. Known gap, fix assigned: exploit clients could spot the Variant because the real bodies were parked under the map. Next refactor puts every player on a server-owned stand-in body for the whole shift.' },
  { k:'config', x:500, y:628, w:250, h:84, title:'Config.luau', sub:['every tunable number', 'no magic numbers'], file:'src/shared/Config.luau',
    detail:'Timers, penalties, ranges, weights and prices all live in one file, so balancing after launch is a one-line change. ProximityPrompt ranges are read from it at server start.' },
  { k:'rules', x:790, y:628, w:300, h:84, title:'Rules + 31 unit tests', sub:['role rolls · votes · clock · win checks', 'pure functions, no Roblox APIs'], file:'src/server/Rules',
    detail:'Game logic that decides outcomes lives in pure modules so it can be tested without a running game: 31 tests, run from Studio\'s command bar. Multi-client and real-phone testing have not happened yet.' },
  { k:'bots', x:1130, y:628, w:200, h:84, title:'BotService', sub:['fill to 6 · vote · report', 'count as kill witnesses'],
    detail:'Bots wander, use terminals, report at a configured accuracy and vote. They are never the Variant or its target, show a bot icon, and count as witnesses, so empty servers still block kills.' },
  { k:'tooling', x:1370, y:628, w:200, h:84, title:'Toolchain', sub:['Rojo · StyLua · Selene', 'Claude Code ↔ Studio MCP'],
    detail:'Code lives in Git through Rojo with strict Luau, StyLua and Selene. Claude Code builds on feature branches, edits the map through the Studio MCP and models props in Blender through MCP. Saving the place, publishing and Creator Hub setup stay manual.' },
];

const edges = [
  'M165 152 V178', 'M165 252 V278',
  'M290 216 H310 V116 H328',
  'M455 152 V178', 'M455 252 V278',
  'M580 316 H600 V116 H618', 'M580 316 H600 V216 H618', 'M580 316 H618', 'M580 316 H600 V416 H618', 'M580 316 H600 V516 H618',
  'M910 216 H948', 'M910 316 H948', 'M910 416 H948',
  'M1220 216 H1258', 'M1220 416 H1240 V236 H1258',
  'M1415 252 V278',
];
const dashed = [ 'M1085 152 V178', 'M910 106 H930 V396 H912', 'M1415 352 V576 H24 V216 H38' ];
const labels = [ { x:720, y:570, t:'next round', a:'middle' }, { x:936, y:256, t:'clock', a:'start' } ];
const stages = [ ['1','JOIN',A], ['2','ROUND START',B], ['3','SHIFT',Cc], ['4','MEETING · CHASE',D], ['5','END',E] ];

const out = render({ id:'whosreal-design', title:"Who's Real? · system design", W:1600, H:740, NH:72, nodes, edges, dashed, labels, stages,
  aria:"Who's Real? system design: players join and load saved data, a server state machine rolls roles and picks the Variant, the shift runs anomalies, incursions, kills and the Doomsday Clock, meetings and the Tyrant chase lead to results and rewards, then the next round. Shared infrastructure sits below.",
  infra:{ y:604, label:'SHARED · SERVER-SIDE' },
  legend:[['lg-gate','Server rule check'],['lg-lock','Secret, server-only'],['lg-ext','Variant / threat'],['lg-store','Saved data'],['lg-proto','Hidden until event'],['lg-dash','Feedback loop']] });
fs.writeFileSync(process.argv[2], out);
console.log('nodes', nodes.length, 'bytes', out.length);
