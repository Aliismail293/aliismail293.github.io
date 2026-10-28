const fs = require('fs');

/* ragaudit v2 system design. Each node: k, x, y, w, h, title, sub[], rej?, file?, kind?, detail.
   Edges: d (path), dashed?. Stages: label, x. viewBox 1600 x 740. */
const W = 1600, H = 740;
const ROW = [80, 180, 280, 380, 480];
const NH = 72;

const nodes = [
  { k:'cli', x:40, y:ROW[0], w:250, title:'CLI entry', sub:['generate · evaluate · tune'], file:'cli.py · cli_v2.py',
    detail:'Three v2 subcommands live in cli_v2.py next to the v1 CLI. v1 code paths and flags are untouched, so v1 sample reports and re-rendered v1 demo databases stay byte-identical.' },
  { k:'ingest', x:40, y:ROW[1], w:250, title:'Ingest + chunk', sub:['corpus → chunks with stable ids'], file:'ingest/',
    detail:'Loads the corpus and splits it into chunks with stable chunk_ids. Every generated question carries the chunk_id(s) it came from, which is what later makes failure classification exact instead of guessed.' },
  { k:'hash', x:40, y:ROW[2], w:250, title:'Content hashing', sub:['index_version = hash(chunk hashes)'],
    detail:'Each chunk is content-hashed, and index_version is the hash of the sorted set of chunk hashes. Chunks that already have active questions are skipped, so re-running generate on a growing corpus never duplicates work.' },
  { k:'diff', x:40, y:ROW[3], w:250, title:'Index diff', sub:['new · changed · deleted', 'changed/deleted → stale'],
    detail:'Every run diffs the current index against the last one. New chunk: generate questions. Changed chunk: its old questions become stale and new ones are generated. Deleted chunk: its questions become stale. Stale questions are never scored.' },

  { k:'gen', x:330, y:ROW[0], w:200, title:'Generate Q + answer', sub:['generator LLM, per chunk'], file:'generate/pipeline.py',
    detail:'The generator model extracts a fact from the chunk and writes a question plus a gold answer, all linked to source chunk_id(s). Multi-hop questions can span several chunks.' },
  { k:'deword', x:330, y:ROW[1], w:200, title:'De-wording pass', sub:['rewrite away chunk wording'],
    detail:'A second LLM call rewrites each question so it stops reusing the chunk\'s distinctive words. A question written while reading the chunk copies its phrasing, which makes retrieval trivially easy and inflates every score. Real users ask vaguely.' },
  { k:'lex', x:330, y:ROW[2], w:200, kind:'gate', title:'Lexical overlap gate', sub:['overlap < 0.5, one retry'], rej:'reject: too_lexical',
    detail:'Overlap is the fraction of the question\'s content tokens that appear in the chunk. It must stay below 0.5 (configurable). One retry through de-wording, then the question is rejected as too_lexical.' },
  { k:'time', x:330, y:ROW[3], w:200, kind:'gate', title:'Relative-time check', sub:['regex bans "yesterday"…'], rej:'reject: relative_time',
    detail:'A regex validator rejects relative time such as "yesterday", "recently" or "last week". Those questions are true today and false tomorrow, so every question must use absolute dates. This matters most for time-anchored corpora like screen history.' },
  { k:'verify', x:560, y:ROW[0], w:200, kind:'gate', title:'Verifier (other model)', sub:['supported? unambiguous?'], rej:'reject: unsupported',
    detail:'A different model from the generator checks that the fact and gold answer are actually supported by the chunk and that the question has one clear answer. A wrong answer key silently corrupts every downstream score, and a model grading its own output is biased.' },
  { k:'split', x:560, y:ROW[1], w:200, kind:'gate', title:'Split by hash(chunk_id)', sub:['70 dev / 30 test, per chunk'], rej:'reject: cross_split',
    detail:'A deterministic 70/30 split keyed on hash(chunk_id), not per question. A per-question split lets one chunk\'s questions land in both sets, so tuning retrieval for that chunk leaks into the test score. Keying on chunk_id rather than content means editing a chunk never moves it between splits. Multi-hop questions that span both sets are rejected as cross_split.' },
  { k:'dev', x:560, y:ROW[2], w:95, title:'DEV', sub:['tuned on'],
    detail:'The development set. The tuning loop sees these answers and uses them for every trial.' },
  { k:'test', x:665, y:ROW[2], w:95, kind:'lock', title:'TEST', sub:['locked'], file:'storage/lock.py',
    detail:'The locked test set, enforced in code by storage/lock.py and runner/locked.py, plus a unit test that fails if tune can read test answers. It blocks accidents, not deliberate tampering, and the pipeline itself must still see test questions during final scoring.' },

  { k:'detect', x:820, y:ROW[0], w:270, title:'Change detector', sub:['compares config_hash · index_version'],
    detail:'Compares the pipeline config_hash and the index_version with the last run. If the config changed, everything re-runs. If only the index changed, evaluation goes incremental.' },
  { k:'sample', x:820, y:ROW[1], w:270, title:'Regression sampler', sub:['all new + 50 seeded old questions'],
    detail:'In incremental mode it runs every new question plus a seeded random sample of N old ones (default 50). New data mostly breaks old questions by adding distractors, like ten similar pages competing. A sample catches that without re-running thousands of questions.' },
  { k:'cache', x:820, y:ROW[2], w:270, title:'Result cache', sub:['key: (question_id, config_hash,', '        index_version)'],
    detail:'Results are cached under (question_id, config_hash, index_version). If nothing relevant changed for a question, it is not re-run.' },
  { k:'pipe', x:820, y:ROW[3], w:270, kind:'ext', title:'Your RAG pipeline', sub:['adapter(config) · system under test'], file:'adapters/',
    detail:'The system under test, wrapped in an adapter. Adapters were extended to accept a config dict (chunk_size, top_k, reranker and so on) and stay backward compatible with v1 adapters.' },
  { k:'classify', x:820, y:ROW[4], w:270, title:'Failure classifier', sub:['pass · retrieval_miss', '· generation_miss'], file:'runner/evaluate.py',
    detail:'retrieval_miss: the gold chunk was not in the top-k. generation_miss: it was retrieved but the answer was still wrong. Because every question has gold chunk_ids, this is exact, and each class points to different knobs.' },

  { k:'space', x:1150, y:ROW[0], w:230, title:'Search space (YAML)', sub:['chunk_size · top_k · reranker…'],
    detail:'Declared knobs only: chunk_size, chunk_overlap, top_k, hybrid_weight, reranker, prompt_variant. Letting an LLM rewrite code freely is chaos; a bounded search is reproducible and defensible.' },
  { k:'strategy', x:1150, y:ROW[1], w:230, title:'Strategy', sub:['grid · random · llm-proposed'], file:'tune/strategies.py',
    detail:'Grid, seeded random, or llm: an LLM reads a summary of dev failures and proposes the next config, but it must stay inside the declared search space.' },
  { k:'loop', x:1150, y:ROW[2], w:230, title:'Trial loop (DEV only)', sub:['each trial → evaluate on dev'], file:'tune/loop.py',
    detail:'Each trial sends a config through evaluate on the dev set and records the score. It stops cleanly and saves progress when --max-trials or --max-llm-calls is reached.' },
  { k:'final', x:1150, y:ROW[3], w:230, kind:'lock', title:'Final score on TEST', sub:['best config, scored once'], file:'runner/locked.py',
    detail:'The best dev config is run once on the locked test set. That single number is the reported result, because the loop never optimised against it.' },
  { k:'overfit', x:1150, y:ROW[4], w:230, kind:'gate', title:'Overfit alarm', sub:['flag if dev − test > 10 pts'],
    detail:'If best-dev minus best-test is more than 10 points, the report flags overfitting. Rising dev scores with a flat test score is the signature.' },

  { k:'rgen', x:1420, y:ROW[1], w:150, title:'Generate report', sub:['rejections · overlap'],
    detail:'HTML report with counts, rejection reasons, the dev/test split, the lexical-overlap distribution and example questions.' },
  { k:'rtune', x:1420, y:ROW[3], w:150, title:'Tune report', sub:['trials · dev vs test'], file:'report/',
    detail:'Dev score per trial, dev vs test for baseline and best, failure breakdown before and after tuning, the overfit indicator and the best config. Sample reports on the docs site are labelled as mock-LLM runs, not real performance claims.' },
  { k:'docs', x:1420, y:ROW[4], w:150, title:'Docs site', sub:['GitHub Pages'],
    detail:'The landing page and sample reports are served from docs/ on GitHub Pages and share the report stylesheet.' },

  { k:'llm', x:40, y:628, w:250, h:84, title:'LLM client', sub:['OpenAI-compatible · local Ollama', 'qwen2.5 gen · llama3.1 verify'], file:'llm/client.py',
    detail:'Configured by RAGAUDIT_API_BASE, RAGAUDIT_API_KEY and RAGAUDIT_MODEL, pointed at local Ollama: free, with no key to leak. The real-model path was smoke-tested on generate and its bugs fixed; a full real-model evaluate/tune run is still pending.' },
  { k:'store', x:330, y:628, w:430, h:84, kind:'store', title:'SQLite store', sub:['.ragaudit/store.db · schema-versioned', 'chunks · questions · splits · results · trials'], file:'storage/store.py',
    detail:'Standard-library sqlite3 with a schema-version table. It holds the incremental state that lets every command skip work it has already done. No heavy dependencies, and the folder is git-ignored.' },
  { k:'mock', x:820, y:628, w:270, h:84, title:'Mock LLM + tests', sub:['deterministic · 272 tests pass', 'offline demo end-to-end in ~4 s'],
    detail:'Tests never call a real model: a deterministic mock keeps them free, fast and reproducible. The offline demo runs generate → evaluate → corpus update → incremental re-evaluate → tune → reports in about 4 seconds.' },
  { k:'caps', x:1150, y:628, w:420, h:84, title:'Budget caps', sub:['--max-chunks · --max-llm-calls · --max-trials', 'stop cleanly, save progress'],
    detail:'Every command takes hard caps on chunks, LLM calls and trials. Hitting one stops the run cleanly and saves progress, so there is no runaway cost or runtime.' },
];

const edges = [
  'M165 152 V178', 'M165 252 V278', 'M165 352 V378',
  'M290 416 H310 V116 H328',
  'M430 152 V178', 'M430 252 V278', 'M430 352 V378',
  'M530 416 H545 V116 H558',
  'M660 152 V178', 'M607 252 V278', 'M712 252 V278',
  'M760 316 H790 V116 H818',
  'M955 152 V178', 'M955 252 V278', 'M955 352 V378', 'M955 452 V478',
  'M1265 152 V178', 'M1265 252 V278', 'M1265 352 V378', 'M1265 452 V478',
  'M1150 300 H1120 V416 H1092',
  'M1090 516 H1135 V340 H1148',
  'M1380 516 H1400 V416 H1418',
  'M1495 452 V478',
];
const dashed = [ 'M607 352 V626', 'M712 352 V626', 'M1380 296 C1414 296 1414 336 1382 336' ];
const labels = [
  { x:1132, y:294, t:'config', a:'middle' }, { x:1094, y:536, t:'scores', a:'start' },
  { x:1418, y:322, t:'until caps', a:'start' }, { x:618, y:600, t:'persisted', a:'start' },
  { x:296, y:470, t:'new + changed', a:'start' },
];
const stages = [ ['1','INGEST',40], ['2','GENERATE',330], ['3','EVALUATE',820], ['4','TUNE',1150], ['5','REPORT',1420] ];

const { render } = require('./arch-lib.js');
const out = render({ id:'ragaudit-design', title:'ragaudit v2 · system design', W, H, NH, nodes, edges, dashed, labels, stages,
  aria:'ragaudit v2 system design: ingest, generate, evaluate, tune and report stages over a shared SQLite store, LLM client, mock LLM and budget caps.',
  infra:{ y:604, label:'SHARED INFRASTRUCTURE' },
  legend:[['lg-gate','Quality gate'],['lg-lock','Locked test path'],['lg-ext','Your system under test'],['lg-dash','Data persisted / loop']] });
fs.writeFileSync(process.argv[2], out);
console.log('nodes', nodes.length, 'bytes', out.length);
