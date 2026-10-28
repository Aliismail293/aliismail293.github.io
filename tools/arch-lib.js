/* Shared renderer for the interactive system-design diagrams.
   render(cfg) -> HTML block. cfg: { id, title, aria, W, H, NH, nodes, edges, dashed, labels, stages, infra:{y,label}, legend:[[cls,text]] }
   Node: { k, x, y, w, h?, title, sub:[], rej?, kind?: gate|lock|ext|store, file?, detail } */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function render(cfg) {
  const { id, title, aria, W = 1600, H, NH = 72, nodes, edges = [], dashed = [], labels = [], stages = [], infra, legend = [] } = cfg;
  const mk = `arr-${id}`;
  let svg = `<svg class="arch-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">`;
  svg += `<defs><marker id="${mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arch-ah" d="M0 0L10 5L0 10z"/></marker></defs>`;
  stages.forEach(([n, l, x]) => { svg += `<text class="arch-stage" x="${x}" y="40"><tspan class="arch-num">${esc(n)}</tspan>  ${esc(l)}</text>`; });
  svg += `<path class="arch-rule" d="M40 56 H${W - 30}"/>`;
  if (infra) {
    svg += `<text class="arch-stage" x="40" y="${infra.y}"><tspan class="arch-num">·</tspan>  ${esc(infra.label)}</text>`;
    svg += `<path class="arch-rule" d="M40 ${infra.y + 10} H${W - 30}"/>`;
  }
  edges.forEach(d => svg += `<path class="arch-edge" d="${d}" marker-end="url(#${mk})"/>`);
  dashed.forEach(d => svg += `<path class="arch-edge dash" d="${d}" marker-end="url(#${mk})"/>`);
  labels.forEach(l => svg += `<text class="arch-lbl" x="${l.x}" y="${l.y}" text-anchor="${l.a || 'start'}">${esc(l.t)}</text>`);
  nodes.forEach(n => {
    const h = n.h || NH;
    svg += `<g class="arch-node ${n.kind ? 'k-' + n.kind : ''}" data-k="${n.k}" tabindex="0" role="button" aria-label="${esc(n.title)}: details">`;
    svg += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${h}" rx="10"/>`;
    const ty = n.y + 25;
    svg += `<text class="arch-t" x="${n.x + 14}" y="${ty}">${esc(n.title)}</text>`;
    if (n.kind === 'lock') {
      const lx = n.x + n.w - 26, ly = n.y + 12;
      svg += `<g class="arch-lock"><rect x="${lx}" y="${ly + 7}" width="13" height="10" rx="2"/><path d="M${lx + 3} ${ly + 7} v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none"/></g>`;
    }
    (n.sub || []).forEach((s, i) => { svg += `<text class="arch-s" x="${n.x + 14}" y="${ty + 20 + i * 17}">${esc(s)}</text>`; });
    if (n.rej) svg += `<text class="arch-rej" x="${n.x + 14}" y="${n.y + h - 10}">✗ ${esc(n.rej)}</text>`;
    svg += `<circle class="arch-dot" cx="${n.x + n.w - 12}" cy="${n.y + h - 12}" r="3.5"/></g>`;
  });
  svg += `</svg>`;
  const data = {};
  nodes.forEach(n => data[n.k] = { t: n.title, d: n.detail, f: n.file || '' });
  return `<div class="wrap wide arch" id="${id}">
        <div class="arch-head">
          <div><p class="eyebrow">Under the hood</p><h3>${esc(title)}</h3></div>
          <p class="arch-hint">Hover any box for what it does, why it's built that way, and where it lives. Tap on a phone.</p>
        </div>
        <div class="arch-scroll"><div class="arch-box">
          ${svg}
          <div class="arch-tip" hidden role="tooltip"><h4></h4><p></p><code></code></div>
        </div></div>
        <div class="arch-legend">${legend.map(([c, t]) => `<span class="${c}">${esc(t)}</span>`).join('')}</div>
        <script type="application/json" class="arch-data">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
      </div>`;
}
module.exports = { render, esc };
