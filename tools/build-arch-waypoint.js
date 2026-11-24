/* Waypoint V3 system design. Usage (from tools/): node build-arch-waypoint.js out.html
   Numbers only from committed eval runs (WAYPOINT_PROJECT_CONTEXT section 4 and evals/results/). */
const fs = require('fs');
const { render } = require('./arch-lib.js');
const R = [80, 180, 280, 380, 480];
const A = 40, B = 300, Cc = 600, D = 920, E = 1260;

const nodes = [
  { k:'user', x:A, y:R[0], w:220, title:'Student', sub:['web app in the browser', 'marks courses taken'],
    detail:'Students ask in plain words and mark the courses they have taken, are taking or plan to take. Waypoint never logs into ACORN or reads transcripts: public calendar data only.' },
  { k:'signin', x:A, y:R[1], w:220, kind:'lock', title:'Google Sign-In', sub:['ID token verified on server', 'user ID = isolation key'], file:'waypoint/api/auth.py',
    detail:'Google Identity Services gives the browser an ID token; the server verifies signature, audience and expiry, and fails closed if no client ID is set. The app only needs to know who you are, so it asks for no access to your Google data.' },
  { k:'mcpc', x:A, y:R[2], w:220, title:'MCP clients', sub:['Waypoint exposed as', 'an MCP server'], file:'waypoint/mcp/waypoint/',
    detail:'Waypoint itself is exposed as an MCP server, so other AI clients can call it as a tool. One standard interface instead of a custom integration per client.' },

  { k:'api', x:B, y:R[0], w:260, title:'Cloud Run API', sub:['FastAPI · SSE streaming', 'preview deploy · rollback'], file:'infra/deploy.sh',
    detail:'FastAPI plus the web app on Cloud Run, scaling to zero. Answers stream over Server-Sent Events: status steps first, then the text word by word, because the old app showed a frozen screen for 10 to 15 seconds. New versions go out as tagged no-traffic previews, get smoke-tested, then take traffic; rollback is one command.' },
  { k:'guard', x:B, y:R[1], w:260, kind:'gate', title:'Input safety', sub:['PII redaction', 'scope + injection checks'],
    detail:'Personal information is redacted and out-of-scope requests (like "write my essay") are refused. Retrieved text is fenced and treated as data, never as instructions, and cited chunk IDs must come from this request\'s own tool results. The live safety suite passes 9/9.' },
  { k:'router', x:B, y:R[2], w:260, kind:'gate', title:'Fast-path router', sub:['small Gemini model', 'unsure → full orchestrator'], file:'waypoint/agents/router.py',
    detail:'Classifies each question before any agent runs. A wrong fast route costs answer quality but a wrong full route only costs time, so every failure (timeout, bad JSON, unknown label) falls back to the full path. Live router eval: 97.2% route accuracy on 36 labelled questions with 0 wrong fast routes; CI fails below 90%.' },
  { k:'state', x:B, y:R[3], w:260, kind:'store', title:'Firestore', sub:['profiles · plans · history', 'answer cache'],
    detail:'Profiles, saved plans, history and an answer cache for repeated questions, keyed by the verified Google account so users never see each other\'s data. An earlier running-summary memory raised cost 31% when measured, so it was reverted and no saving is claimed.' },

  { k:'fact', x:Cc, y:R[0], w:280, kind:'gate', title:'Fact route', sub:['answered by code, not the model', 'AND / OR prerequisite trees'], file:'waypoint/ingest/prereq_parser.py',
    detail:'In V2 the model answered fact questions from retrieved text and got some wrong. Now prerequisites, exclusions and what a course unlocks are parsed into boolean trees (all_of / one_of, grades, credits, high-school) and evaluated in code; the model only phrases the result. Text the parser cannot read shows "check the calendar" instead of a guess.' },
  { k:'fast', x:Cc, y:R[1], w:280, title:'Fast route', sub:['one specialist agent', 'policy RAG or course data'],
    detail:'Simple questions skip the planner and critic and go to one specialist. Every model call adds about 2 seconds, and long chains were what drove P95 latency up in V1.' },
  { k:'plan', x:Cc, y:R[2], w:280, kind:'gate', title:'Planning route', sub:['code builds + critiques the plan', 'time budget, never a dead end'], file:'waypoint/agents/critic.py',
    detail:'A V2 planning question hit a "step limit" after 31.7 s. V3 builds the term-by-term plan and runs the critic (prerequisites, exclusions, program rules) in deterministic code under a hard time budget, and the model only explains. If time runs out the student still gets what is ready, never an error.' },
  { k:'orch', x:Cc, y:R[3], w:280, title:'ADK orchestrator', sub:['root agent + specialists', 'when the router is unsure'], file:'waypoint/agents/factory.py',
    detail:'The original V1 multi-agent system on Google ADK: a root agent delegates to policy, course-data and planner specialists (hierarchical delegation, a ReAct planner, a self-critique agent). It now handles only open-ended questions the router is unsure about.' },

  { k:'bq', x:D, y:R[0], w:300, kind:'store', title:'BigQuery', sub:['courses · programs', 'parsed prerequisite trees'],
    detail:'Structured course and program data, reached only through named, parameterised queries with a billing cap, so the model never writes SQL. Live data covers the UTM Mathematical Sciences section (59 courses); 86% of their prerequisites parse fully.' },
  { k:'hybrid', x:D, y:R[1], w:300, kind:'store', title:'Hybrid retrieval', sub:['pgvector HNSW + full-text, RRF', 'Cloud SQL · policy text only'], file:'waypoint/retrieval/hybrid.py',
    detail:'Vector search catches paraphrases; Postgres full-text catches exact codes like MAT224. Reciprocal rank fusion merges the two lists by rank, so no score calibration is needed. Since V3 it serves policy prose only, because facts come from structured data.' },
  { k:'vertex', x:D, y:R[2], w:300, kind:'ext', title:'Vertex AI', sub:['Gemini phrases + explains', 'text embeddings'],
    detail:'Gemini on Vertex AI writes the final wording and explanations; a small Gemini model runs the router; Vertex embeddings power vector search. Model IDs live in one config with a startup check.' },
  { k:'tt', x:D, y:R[3], w:300, kind:'proto', title:'Timetable MCP server', sub:['legacy adapter, kept as a demo', 'labelled sample data'], file:'waypoint/mcp/timetable/',
    detail:'A custom MCP server that wraps a messy legacy format with retries, caching and schema normalisation. V3 removed the Timetable tab (sections come late and enrolment happens on ACORN), so it stays as an MCP demo on labelled sample data, off the student path.' },

  { k:'map', x:E, y:R[0], w:310, title:'Course map', sub:['prereq-depth columns', 'click to highlight a path'],
    detail:'Year groups with prerequisite-depth sub-columns. Clicking a course fades everything that is not on its prerequisite path; courses can be marked Taken, In progress or Planned. A subject filter replaced a broken "Show all" button.' },
  { k:'answer', x:E, y:R[1], w:310, title:'Answer + sources', sub:['answer first, short', 'sources collapsed below'],
    detail:'V2 answers opened with a wall of sources. Now the answer comes first and short, with sources collapsed at the bottom and a source reader that highlights the exact calendar text.' },
  { k:'board', x:E, y:R[2], w:310, title:'My plan + Programs', sub:['calm notes, real conflicts only', 'requirements checklist'],
    detail:'Plan notes are neutral with an "i" popover; only real conflicts are flagged (same-term prerequisite, exclusions, program rules). The Programs tab keeps admission requirements separate from course prerequisites.' },
  { k:'enrol', x:E, y:R[3], w:310, title:'Enrolment check', sub:['restrictions · exclusions', 'other-campus equivalents'],
    detail:'Replaced the Timetable tab: before enrolling, it checks restrictions, exclusions, equivalents at other campuses and program limits.' },
  { k:'pip', x:E, y:R[4], w:310, title:'Pip + advisor export', sub:['mascot driven by stream events', 'PDF pack with source links'],
    detail:'Pip is a CSS flip-book sprite (idle, thinking, talking, waving) driven by the same stream events as the status steps. The advisor PDF export packs a plan with real source links for a meeting.' },

  { k:'ingest', x:40, y:628, w:290, h:84, title:'Ingestion adapters', sub:['UTM · St. George · UTSC', 'parser → BigQuery + pgvector'], file:'docs/ADDING_A_UNIVERSITY.md',
    detail:'Calendar adapters for all three campuses feed one parser, and an institution field plus an adapter interface make room for other universities. All three calendar sites return 403 to automated crawling, and Waypoint respects that: live data is UTM Mathematical Sciences while campus-wide data access is requested.' },
  { k:'evals', x:350, y:628, w:290, h:84, kind:'gate', title:'ragaudit + fact eval', sub:['facts 99.4% (167 Qs)', 'policy 90% (10 locked Qs)'], file:'evals/',
    detail:'Facts are checked against the parsed tables: 99.4% on 167 questions (1 miss). It measures pipeline faithfulness, not parser errors. Policy RAG uses ragaudit on local Ollama (qwen2.5 generates, llama3.1 verifies), split by chunk with a locked test set: 90% on 10 held-out questions. Tuning found no config better than the baseline, so the baseline was kept.' },
  { k:'ci', x:660, y:628, w:290, h:84, kind:'gate', title:'CI gate', sub:['GitHub Actions, fully offline', '346 pytest + 29 JS tests'],
    detail:'Every PR runs ruff, mypy, 346 pytest and 29 JS tests, plus an offline eval with a mock model. It fails on an accuracy drop over 3 points, P95 up over 20%, router accuracy under 90% or any safety failure. The mock score catches pipeline regressions; it is not a quality number.' },
  { k:'otel', x:970, y:628, w:290, h:84, title:'OpenTelemetry tracing', sub:['span per agent + tool', 'Langfuse + Cloud Trace'], file:'waypoint/observability/',
    detail:'Every agent, tool and model call is a span with tokens, cost and latency, exported to Langfuse and Cloud Trace. Student messages are not written to traces; spans carry metrics and a salted user hash.' },
  { k:'ops', x:1280, y:628, w:290, h:84, kind:'lock', title:'IAM, secrets, upkeep', sub:['least-privilege SAs · Secret Mgr', 'uptime alert · weekly smoke test'], file:'docs/RUNBOOK.md',
    detail:'Least-privilege service accounts, three secrets in Secret Manager, a read-only IAM preflight before deploys, Dependabot, an uptime check with alerts and a weekly live smoke test. Terraform is validated and planned, but the live infrastructure was built by hand, so importing it is next.' },
];

const edges = [
  'M150 152 V178',
  'M260 216 H280 V136 H298', 'M260 316 H280 V136 H298',
  'M430 152 V178', 'M430 252 V278', 'M430 352 V378',
  'M560 316 H580 V116 H598', 'M580 216 H598', 'M560 316 H598', 'M580 316 V416 H598',
  'M880 116 H918', 'M880 216 H918', 'M880 316 H918',
  'M1220 116 H1258', 'M1220 216 H1258', 'M1220 316 H1258',
];
const dashed = [ 'M880 416 H918', 'M1070 252 V278' ];
const labels = [ { x:438, y:372, t:'cache' }, { x:1078, y:272, t:'embed' }, { x:884, y:408, t:'demo' } ];
const stages = [ ['0','ENTRY',A], ['1','GATEWAY',B], ['2','ROUTES',Cc], ['3','DATA + MODELS',D], ['4','WHAT STUDENTS SEE',E] ];

const out = render({ id:'waypoint-design', title:'Waypoint V3 · system design', W:1600, H:740, NH:72, nodes, edges, dashed, labels, stages,
  aria:'Waypoint V3 system design: students sign in to a Cloud Run API that streams answers; a fast-path router sends each question to a fact route answered by code over parsed prerequisite trees in BigQuery, a fast route using hybrid retrieval on Cloud SQL pgvector, a planning route with a deterministic planner and critic, or the full ADK orchestrator; Gemini on Vertex AI phrases answers. Ingestion adapters, ragaudit and fact evals, a CI gate, OpenTelemetry tracing and IAM sit underneath.',
  infra:{ y:604, label:'DATA · QUALITY · OBSERVABILITY · SECURITY' },
  legend:[['lg-gate','Check or quality gate'],['lg-lock','Identity / secrets'],['lg-ext','External model service'],['lg-store','Data store'],['lg-proto','Demo / off the student path'],['lg-dash','Embedding or demo call']] });
fs.writeFileSync(process.argv[2], out);
console.log('nodes', nodes.length, 'bytes', out.length);
