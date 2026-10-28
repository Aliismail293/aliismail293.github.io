const fs = require('fs');
const { render } = require('./arch-lib.js');
const R = [80, 180, 280, 380, 480];
const A = 40, B = 300, Cc = 600, D = 920, E = 1260;

const nodes = [
  { k:'user', x:A, y:R[0], w:220, title:'Student', sub:['web chat in the browser', 'types courses taken'],
    detail:'Students ask in plain words and type the courses they have taken. Waypoint never logs into ACORN or reads transcripts: public data only.' },
  { k:'signin', x:A, y:R[1], w:220, kind:'lock', title:'Google Sign-In', sub:['ID token verified on server', 'user ID = isolation key'],
    detail:'Google Identity Services gives the browser an ID token; the server verifies signature, audience and expiry. No redirect flow and no access to the user\'s Google data, because the app only needs to know who you are.' },
  { k:'mcpc', x:A, y:R[2], w:220, title:'MCP clients', sub:['Waypoint exposed as', 'an MCP server'],
    detail:'Waypoint itself is exposed as an MCP server, so other AI clients can call it as a tool. One standard interface instead of a custom integration per client.' },

  { k:'api', x:B, y:R[0], w:260, title:'Cloud Run API', sub:['FastAPI + chat UI', 'scale to zero · SA waypoint-run'], file:'infra/deploy.sh',
    detail:'A FastAPI service with the chat UI, deployed from source through Cloud Build. It scales to zero when idle and runs as a dedicated least-privilege service account.' },
  { k:'guard', x:B, y:R[1], w:260, kind:'gate', title:'Input safety', sub:['PII redaction', 'scope + injection checks'],
    detail:'Personal information is redacted and out-of-scope requests (like "write my essay") are refused. Retrieved text is wrapped and treated as data, never as instructions. The live safety suite passes 9/9.' },
  { k:'session', x:B, y:R[2], w:260, kind:'store', title:'Sessions + plans', sub:['Firestore, keyed per user', 'ADK session state'],
    detail:'ADK sessions and saved plans live in Firestore, keyed by the verified Google account, so users never see each other\'s data. A running-summary memory and caching were tested here and measured +31% cost, so they were reverted.' },

  { k:'orch', x:Cc, y:R[0], w:280, title:'Orchestrator', sub:['Gemini Flash · ADK root agent', 'hierarchical delegation'], file:'agents/',
    detail:'The root agent classifies the request and delegates to specialists, so each agent has one job and can be tested on its own. The cost is more model hops, which is the main reason P95 latency is 16 s.' },
  { k:'policy', x:Cc, y:R[1], w:280, title:'Policy agent', sub:['grounded answers only', 'always cites chunk IDs'],
    detail:'Answers degree-rule questions only from retrieved calendar text and cites the chunk IDs, so every claim can be checked. Rules are never guessed.' },
  { k:'course', x:Cc, y:R[2], w:280, title:'Course-data agent', sub:['prereqs · exclusions · breadth', 'structured lookups only'],
    detail:'Exact facts like prerequisites and exclusions belong in tables, not prose, so this agent queries BigQuery instead of searching text.' },
  { k:'tt', x:Cc, y:R[3], w:280, title:'Timetable agent', sub:['sections by course + term', 'via the legacy MCP adapter'],
    detail:'Looks up sections through the custom MCP adapter, which isolates the flaky legacy source from the rest of the system.' },
  { k:'plan', x:Cc, y:R[4], w:280, kind:'gate', title:'Planner + Critic', sub:['ReAct plan → critic, ≤ 2 rounds', 'valid plans 2/6 → 4/6'],
    detail:'The planner builds a term-by-term plan in a reason-act-observe loop. A critic agent checks it against program rules and prerequisites and sends it back with cited failures, up to 2 rounds. On 6 test plans, valid plans rose from 2 to 4, at +47% latency and +44% cost, so it belongs on plan requests only.' },

  { k:'vertex', x:D, y:R[0], w:300, kind:'ext', title:'Vertex AI', sub:['Gemini Flash generation', 'text embeddings'],
    detail:'Gemini Flash powers every agent and Vertex text embeddings power vector search. Average cost on the held-out set: $0.0112 per question.' },
  { k:'hybrid', x:D, y:R[1], w:300, kind:'store', title:'Hybrid retrieval', sub:['pgvector HNSW + full-text, RRF', 'Cloud SQL Postgres 16 · top 5'], file:'ingest/',
    detail:'Vector search catches paraphrases; Postgres full-text catches exact codes like MAT224. Reciprocal rank fusion merges the two lists by rank, so no score calibration is needed. Both live in one database. Recall@5 is 81%; coverage is limited to the Mathematical Sciences section because the calendar site returned 403 to the bot, which was respected rather than bypassed.' },
  { k:'bq', x:D, y:R[2], w:300, title:'BigQuery via MCP Toolbox', sub:['allow-listed, parameterised SQL', 'Toolbox tested offline'],
    detail:'Course tables live in BigQuery and are reached only through allow-listed, parameterised queries in Google\'s MCP Toolbox, so the model never writes SQL. The Toolbox path is tested offline; a live Toolbox run is still to do.' },
  { k:'ttmcp', x:D, y:R[3], w:300, kind:'ext', title:'Timetable MCP server', sub:['retry · cache · normalise', 'labelled sample data for now'], file:'mcp/',
    detail:'A custom MCP server wraps the legacy timetable with retries, caching and schema normalisation behind two tools: search_sections and get_section. It runs on labelled sample data until a live source is confirmed usable under its terms.' },

  { k:'answer', x:E, y:R[0], w:310, title:'Answer + citations', sub:['chunk-ID citations', 'plans with critic notes'],
    detail:'The reply carries citations to the exact calendar chunks, so a student or advisor can verify it.' },
  { k:'feedback', x:E, y:R[1], w:310, title:'Feedback + escalation', sub:['thumbs up / down', 'ask-an-advisor link'],
    detail:'Ratings, escalation clicks and usage events are recorded. Built and ready; a real launch to students is next, so user numbers are not claimed yet.' },
  { k:'kit', x:E, y:R[2], w:310, kind:'proto', title:'fde-kit', sub:['ADK cost callback · eval adapter', 'MCP legacy-adapter template'],
    detail:'The reusable pieces were extracted into a Python package: a callback that records tokens/sec and cost per request, a ragaudit adapter for ADK agents and an MCP adapter template. 29 tests pass; it is publish-ready but not on PyPI yet.' },
  { k:'demo', x:E, y:R[3], w:310, title:'fdekit-demo', sub:['second live deployment', '6/6 on its live eval'],
    detail:'A second Cloud Run app in a different domain built with fde-kit, to prove the pattern repeats. It scored 6/6 on its live eval.' },
  { k:'cost', x:E, y:R[4], w:310, title:'Cost', sub:['~$0.011 per question', 'Cloud SQL ~$9–10 / mo · Run idles $0'],
    detail:'Cloud Run scales to zero; the always-on Cloud SQL micro instance is the main fixed cost. Total Vertex AI spend during the build was about $6.' },

  { k:'otel', x:40, y:628, w:290, h:84, title:'OpenTelemetry tracing', sub:['span per agent + tool', 'Langfuse + Cloud Trace · tokens · $'],
    detail:'Every agent and tool call is a span with tokens, cost and latency, exported to Langfuse and Cloud Trace. LLM systems fail in slow, expensive ways; per-span numbers show which agent is the problem.' },
  { k:'evals', x:350, y:628, w:290, h:84, kind:'gate', title:'Held-out evaluation', sub:['ragaudit set: 21 Q, split by chunk', '81% recall@5 · 67% acc · 9/9'], file:'evals/',
    detail:'Questions generated with ragaudit from the calendar, split by chunk so test questions come from chunks never used for tuning. Live results: 81.0% recall@5, 66.7% answer accuracy, P95 16.0 s, $0.0112 per question. The gap between recall and accuracy says the next gains are in generation and grounding.' },
  { k:'ci', x:660, y:628, w:290, h:84, kind:'gate', title:'CI gate', sub:['GitHub Actions, fully offline', 'fail: acc −3 · P95 +20% · safety'],
    detail:'Every PR runs lint, types, 110 tests and an offline eval with a mock model and cached fixtures, no secrets needed. It fails on an accuracy drop over 3 points, P95 up over 20% or any safety failure. The mock accuracy catches pipeline regressions; it is not a quality number.' },
  { k:'iam', x:970, y:628, w:290, h:84, kind:'lock', title:'IAM + secrets', sub:['least-privilege service accounts', '3 secrets in Secret Manager'],
    detail:'Separate runtime and build service accounts with only the roles they need, and secret access granted on three named secrets only. No secrets in the repo, logs or chat.' },
  { k:'deploy', x:1280, y:628, w:290, h:84, title:'Deploy pipeline', sub:['IAM preflight → Cloud Build → Run', 'Terraform: validated, not applied'], file:'infra/check_deploy_iam.sh',
    detail:'deploy.sh first runs a read-only IAM preflight that stops with the exact fix, added after real failures from slow IAM propagation and a script that failed silently. Terraform is validated and planned; the live infra was built by hand, so importing it is next.' },
];

const edges = [
  'M150 152 V178',
  'M260 216 H280 V136 H298', 'M260 316 H280 V136 H298',
  'M430 152 V178', 'M430 252 V278',
  'M560 116 H598',
  'M600 140 H586 V216 H598', 'M600 140 H586 V316 H598', 'M600 140 H586 V416 H598', 'M600 140 H586 V516 H598',
  'M880 116 H918',
  'M880 216 H918', 'M880 316 H918', 'M880 416 H918',
  'M1220 116 H1258',
  'M1415 152 V178', 'M1415 352 V378',
];
const dashed = [ 'M1070 178 V154' ];
const labels = [ { x:1078, y:172, t:'embed' } ];
const stages = [ ['0','ENTRY',A], ['1','GATEWAY',B], ['2','AGENTS',Cc], ['3','TOOLS + DATA',D], ['4','OUTPUTS',E] ];

const out = render({ id:'waypoint-design', title:'Waypoint · system design', W:1600, H:740, NH:72, nodes, edges, dashed, labels, stages,
  aria:'Waypoint system design: students sign in to a Cloud Run API, an ADK orchestrator delegates to policy, course-data, timetable and planner-plus-critic agents, which use Vertex AI, hybrid retrieval on Cloud SQL pgvector, BigQuery through MCP Toolbox and a timetable MCP server; tracing, held-out evaluation, a CI gate, IAM and a deploy pipeline sit underneath.',
  infra:{ y:604, label:'QUALITY · OBSERVABILITY · SECURITY' },
  legend:[['lg-gate','Check or quality gate'],['lg-lock','Identity / secrets'],['lg-ext','External or legacy system'],['lg-store','Data store'],['lg-proto','Reusable package'],['lg-dash','Embedding call']] });
fs.writeFileSync(process.argv[2], out);
console.log('nodes', nodes.length, 'bytes', out.length);
