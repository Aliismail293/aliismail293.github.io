const fs = require('fs');
const { render } = require('./arch-lib.js');
const R = [90, 190, 290, 390];

const nodes = [
  { k:'run', x:40, y:90, w:180, h:372, title:'Run trigger', sub:['agro_quant_engine.py', 'run_analysis()', '', 'one call runs', 'the whole pipeline', '', 'started by hand today'], file:'agro_quant_engine.py',
    detail:'A single call runs signal, forecast, risk, decision and log in order. It is started by hand today; a scheduler that runs it before market open is the obvious next step.' },
  { k:'mkt30', x:260, y:R[0], w:260, title:'Market data · 30d', sub:['yfinance: AGRO · BRL=X · SB=F', 'daily closes'], file:'get_financial_signal()',
    detail:'One yfinance call pulls 30 days of daily closes for the AGRO stock, the USD/BRL rate and sugar futures. The last two USD/BRL closes drive the momentum signal; the full 30-day series goes to the Rust core.' },
  { k:'mkt60', x:260, y:R[2], w:260, title:'Market data · 60d', sub:['yfinance: BRL=X', 'daily closes for the forecast'], file:'predict_currency_trend()',
    detail:'A separate 60-day pull of USD/BRL, long enough for the ARIMA model to fit five lags.' },
  { k:'gdelt', x:260, y:R[3], w:260, title:'News · GDELT 2.0', sub:['Brazil/Argentina · sugar/harvest', '+ strike/flood'], file:'get_supply_chain_risk()',
    detail:'Queries the GDELT Doc API for (Brazil OR Argentina) AND (Sugar OR Harvest) AND (Strike OR Flood). The engine counts the matches. A stricter filter that drops headlines about deals, elections and forecasts lives in the main_agent prototype and is a planned merge.' },
  { k:'mom', x:570, y:R[0], w:270, title:'Momentum signal', sub:['USD/BRL day-over-day change', '> +0.5% LONG · < −0.5% SHORT'],
    detail:'AGRO earns in dollars but spends in reais, so a stronger dollar widens its margins. A move above +0.5% is LONG, below −0.5% is SHORT, anything in between is HOLD. The ±0.5% band keeps normal daily noise from triggering trades.' },
  { k:'rust', x:570, y:R[1], w:270, kind:'ext', title:'Rust stats core', sub:['PyO3 extension module', 'mean · std dev · z-score'], file:'agro_rust_core/src/lib.rs',
    detail:'calculate_financial_stats takes the 30-day series and returns mean, standard deviation and the latest z-score in one pass, compiled into a Python module with PyO3. Volatility is std / mean. It guards against empty input and zero variance. On 30 points speed is not the point yet; it is the scaffold for heavier maths later.' },
  { k:'arima', x:570, y:R[2], w:270, title:'ARIMA forecast', sub:['statsmodels ARIMA(5,1,0)', 'next-day USD/BRL → UP / DOWN'],
    detail:'Fits ARIMA(5,1,0) on 60 days of USD/BRL and forecasts one step ahead. Right now the forecast is logged next to each decision but does not change it, so it can be scored against what really happened before it is trusted.' },
  { k:'risk', x:570, y:R[3], w:270, title:'Risk score', sub:['matching article count', 'threshold: 3'],
    detail:'The number of matching articles becomes the risk score. Three or more freezes trading no matter what prices say.' },
  { k:'decide', x:890, y:140, w:260, h:222, kind:'gate', title:'Decision rule', sub:['1. risk ≥ 3 → RISK_FREEZE', '2. LONG → BUY', '3. SHORT → SELL', '4. else → HOLD', '', 'metrics ride along', 'to the log'],
    detail:'Risk is checked first and acts as a veto, because a port strike or flood can hit the stock whatever the currency does. Otherwise the momentum signal maps straight to BUY or SELL, and everything else is HOLD. The rule is deliberately simple so every logged decision can be explained in one line.' },
  { k:'fail', x:890, y:R[3], w:260, title:'Failure handling', sub:['fetch error → action ERROR', 'forecast error → UNKNOWN'],
    detail:'Each stage catches its own exceptions and degrades instead of crashing: a failed price fetch returns ERROR, a failed forecast logs 0.0 and UNKNOWN, a failed news query scores 0. Known gap: scoring a news outage as 0 means it can never freeze trading, so this should become fail-closed.' },
  { k:'logger', x:1200, y:R[1], w:370, kind:'store', title:'TextLogManager', sub:['append-only, pipe-delimited', 'agro_trade_log.txt'], file:'agro_quant_engine.py',
    detail:'Writes a header on first run, then appends one row per run. Plain text keeps it dependency-free and easy to diff. view_database.py, which reads a SQLite trade_log table, is left over from an earlier version.' },
  { k:'row', x:1200, y:R[2], w:370, title:'Log row schema', sub:['time · BRL · sugar · z · volatility', 'forecast · risk · action · reason'],
    detail:'Every decision is stored with the numbers behind it and a one-line reason. A real row: 2026-03-04 12:47:44 | 5.2222 | 13.76 | 0.17 | 0.92% | 5.2332 | 0 | BUY | USD Appreciation: 1.00%.' },

  { k:'btdata', x:40, y:530, w:300, h:84, title:'Backtest data · 2 years', sub:['AGRO · SB=F · BZ=F · BRL=X', '+ Open-Meteo rain archive'], file:'agro_backtester.py',
    detail:'Downloads two years of daily prices plus daily rainfall at the Angélica farm region, forward-fills market holidays and inner-joins everything on date.' },
  { k:'corr', x:380, y:530, w:260, h:84, title:'Correlation check', sub:['daily % change vs AGRO', 'which clues move the stock?'],
    detail:'Correlates daily percentage changes rather than raw prices, because two prices that both trend upward look correlated even when they are unrelated.' },
  { k:'reg', x:680, y:530, w:300, h:84, title:'Linear regression', sub:['sugar · oil · BRL · rain → price', 'weights = factor importance'],
    detail:'A scikit-learn LinearRegression on the four factors gives interpretable weights. It is currently scored on the same data it was fit on, so its error is optimistic; a walk-forward split comes before any accuracy claim.' },
  { k:'plot', x:1020, y:530, w:250, h:84, title:'Actual vs predicted', sub:['matplotlib overlay'],
    detail:'Plots the real AGRO price against the model fit as a visual sanity check.' },
  { k:'proto', x:1310, y:530, w:260, h:84, kind:'proto', title:'Earlier prototypes', sub:['agro_agent: price + rain dashboard', 'news_agent · main_agent'],
    detail:'agro_agent.py prints a live dashboard of sugar, oil, USD/BRL and rain at the farm, alerting above 5 mm today or 10 mm tomorrow. news_agent.py and main_agent.py were the first versions of the news veto and the hybrid decision, later folded into the engine.' },
];

const edges = [
  'M220 126 H258', 'M220 326 H258', 'M220 426 H258',
  'M520 126 H568', 'M520 146 H544 V226 H568', 'M520 326 H568', 'M520 426 H568',
  'M840 126 H864 V196 H888', 'M840 426 H864 V320 H888',
  'M1150 226 H1198', 'M1385 262 V288',
  'M340 572 H378', 'M640 572 H678', 'M980 572 H1018',
];
const dashed = [ 'M840 226 H888', 'M840 300 H888', 'M1020 362 V388' ];
const labels = [ { x:848, y:218, t:'z, vol' }, { x:848, y:292, t:'fcst' } ];
const stages = [ ['0','TRIGGER',40], ['1','SOURCES',260], ['2','SIGNALS',570], ['3','DECIDE',890], ['4','RECORD',1200] ];

const out = render({ id:'agroquant-design', title:'Agro-Quant · system design', W:1600, H:640, NH:72, nodes, edges, dashed, labels, stages,
  aria:'Agro-Quant system design: a run trigger pulls market data and GDELT news, computes a momentum signal, Rust statistics, an ARIMA forecast and a risk score, applies a decision rule and appends a row to a text log. An offline backtesting lane sits below.',
  infra:{ y:504, label:'OFFLINE RESEARCH · BACKTESTING' },
  legend:[['lg-gate','Decision rule'],['lg-ext','Native Rust extension'],['lg-store','Persistence'],['lg-proto','Prototype script'],['lg-dash','Metrics carried to the log']] });
fs.writeFileSync(process.argv[2], out);
console.log('nodes', nodes.length, 'bytes', out.length);
