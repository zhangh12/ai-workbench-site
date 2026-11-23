// Segment 10 — Explore first. Plot later (the explorer: design.md 6u). Script: planning/scripts.md.
//   0–5    "Design options": a results file with many variables. The user asks to explore it; the AI opens the explorer:
//          a row of views, one at a time, shared filters, and the line that says where the numbers come from
//   7–12   the user's own hands: a filter (dropout 0.1), then the heat map
//   13–18  or by saying it: "show it as a table, mark power below 80%"
//   20–22  Ask Claude: the view's settings go into the message box, for the finished figure
// The charts are drawn here as plain SVG in the film's style (the app draws them with Vega-Lite): same numbers.
(function () {
// Every number below was computed by the app's own code (app/wb/explore.py: check_view, check_filters, try_view,
// describe; app/wb/datapreview.py) from a synthetic table of operating characteristics made by the app's test helper
// (tests/e2e/simdata.py). Output of video/data/make_s10.py, pasted as it is (see that file for how to run it).
const S10 = {
  "made_by": "video/data/make_s10.py (app/wb/explore.py, app/wb/datapreview.py; data: tests/e2e/simdata.py)",
  "file": "tabs/Design options/oc_grid.csv",
  "inside": true,
  "total": 60,
  "preview": {"name":"oc_grid.csv","summary":"60 rows, 7 columns, 2.4 KB, CSV","nrows":60,"ncols":7,"shown":60,"names":["design","sample_size","effect_size","dropout","power","type1_error","expected_n"],"numeric":[false,true,true,true,true,true,true],"head":[["fixed","100","0.2","0.1","0.1559","0.025","100"],["fixed","100","0.2","0.2","0.1433","0.025","100"],["fixed","100","0.3","0.1","0.2956","0.025","100"],["fixed","100","0.3","0.2","0.2682","0.025","100"],["fixed","100","0.4","0.1","0.475","0.025","100"],["fixed","100","0.4","0.2","0.4321","0.025","100"],["fixed","150","0.2","0.1","0.2124","0.025","150"],["fixed","150","0.2","0.2","0.1936","0.025","150"],["fixed","150","0.3","0.1","0.414","0.025","150"],["fixed","150","0.3","0.2","0.3757","0.025","150"],["fixed","150","0.4","0.1","0.642","0.025","150"],["fixed","150","0.4","0.2","0.5913","0.025","150"],["fixed","200","0.2","0.1","0.2682","0.025","200"],["fixed","200","0.2","0.2","0.2435","0.025","200"]]},
  "columns": [{"name":"design","kind":"categorical","distinct":2,"values":["fixed","group_sequential"]},{"name":"sample_size","kind":"numeric","distinct":5,"values":[100,150,200,250,300]},{"name":"effect_size","kind":"numeric","distinct":3,"values":[0.2,0.3,0.4]},{"name":"dropout","kind":"numeric","distinct":2,"values":[0.1,0.2]},{"name":"power","kind":"numeric","distinct":52},{"name":"type1_error","kind":"numeric","distinct":2,"values":[0.024,0.025]},{"name":"expected_n","kind":"numeric","distinct":33}],
  "views": [{"id":"v1","type":"trend","label":"Trend","title":"Trend","params":{"y":"power","x":"sample_size","color":"effect_size","ref":0.8}},{"id":"v2","type":"heatmap","label":"Heat map","title":"Heat map","params":{"value":"power","x":"sample_size","y":"effect_size"}},{"id":"v3","type":"scatter","label":"Scatter","title":"Scatter","params":{"x":"expected_n","y":"power","color":"design"}},{"id":"v4","type":"distribution","label":"Distribution","title":"Distribution","params":{"variable":"power","by":"design"}},{"id":"v5","type":"table","label":"Table","title":"Table","params":{"rows":"sample_size","columns":"effect_size","value":"power","op":"<","threshold":0.8}}],
  "open": {"rows":60,"filters":[],"v1":{"rows":60,"values":[{"sample_size":100,"effect_size":0.2,"power":0.1421},{"sample_size":100,"effect_size":0.3,"power":0.2744},{"sample_size":100,"effect_size":0.4,"power":0.44605},{"sample_size":150,"effect_size":0.2,"power":0.1955},{"sample_size":150,"effect_size":0.3,"power":0.38735},{"sample_size":150,"effect_size":0.4,"power":0.60915},{"sample_size":200,"effect_size":0.2,"power":0.24835},{"sample_size":200,"effect_size":0.3,"power":0.49045},{"sample_size":200,"effect_size":0.4,"power":0.7329},{"sample_size":250,"effect_size":0.2,"power":0.3002},{"sample_size":250,"effect_size":0.3,"power":0.5816},{"sample_size":250,"effect_size":0.4,"power":0.8216},{"sample_size":300,"effect_size":0.2,"power":0.35065},{"sample_size":300,"effect_size":0.3,"power":0.66005},{"sample_size":300,"effect_size":0.4,"power":0.88255}]}},
  "filtered": {"rows":30,"filters":["dropout: 0.1"],"v1":{"rows":30,"values":[{"sample_size":100,"effect_size":0.2,"power":0.1484},{"sample_size":100,"effect_size":0.3,"power":0.2881},{"sample_size":100,"effect_size":0.4,"power":0.4675},{"sample_size":150,"effect_size":0.2,"power":0.2049},{"sample_size":150,"effect_size":0.3,"power":0.4065},{"sample_size":150,"effect_size":0.4,"power":0.6345},{"sample_size":200,"effect_size":0.2,"power":0.2607},{"sample_size":200,"effect_size":0.3,"power":0.5134},{"sample_size":200,"effect_size":0.4,"power":0.7577},{"sample_size":250,"effect_size":0.2,"power":0.3153},{"sample_size":250,"effect_size":0.3,"power":0.6066},{"sample_size":250,"effect_size":0.4,"power":0.8433},{"sample_size":300,"effect_size":0.2,"power":0.3682},{"sample_size":300,"effect_size":0.3,"power":0.6856},{"sample_size":300,"effect_size":0.4,"power":0.9001}]},"v2":{"rows":30,"values":[{"sample_size":100,"effect_size":0.2,"power":0.1484},{"sample_size":100,"effect_size":0.3,"power":0.2881},{"sample_size":100,"effect_size":0.4,"power":0.4675},{"sample_size":150,"effect_size":0.2,"power":0.2049},{"sample_size":150,"effect_size":0.3,"power":0.4065},{"sample_size":150,"effect_size":0.4,"power":0.6345},{"sample_size":200,"effect_size":0.2,"power":0.2607},{"sample_size":200,"effect_size":0.3,"power":0.5134},{"sample_size":200,"effect_size":0.4,"power":0.7577},{"sample_size":250,"effect_size":0.2,"power":0.3153},{"sample_size":250,"effect_size":0.3,"power":0.6066},{"sample_size":250,"effect_size":0.4,"power":0.8433},{"sample_size":300,"effect_size":0.2,"power":0.3682},{"sample_size":300,"effect_size":0.3,"power":0.6856},{"sample_size":300,"effect_size":0.4,"power":0.9001}]},"v5":{"rows":30,"table":{"header":["sample_size \\ effect_size","0.2","0.3","0.4"],"rows":[["100","0.1484","0.2881","0.4675"],["150","0.2049","0.4065","0.6345"],["200","0.2607","0.5134","0.7577"],["250","0.3153","0.6066","0.8433"],["300","0.3682","0.6856","0.9001"]],"flag":[[false,true,true,true],[false,true,true,true],[false,true,true,true],[false,true,true,false],[false,true,true,false]],"note":"Highlighted: power < 0.8"}}},
  "table_cells": {"marked":13,"of":15},
  "ask": "[Explorer view “Table”: table of `tabs/Design options/oc_grid.csv` (rows = sample_size, columns = effect_size, value = power, op = <, threshold = 0.8); filters: dropout in ['0.1']]"
};

V.css("s10", `
.s10-dp.dp table { width: auto; min-width: 100%; font-size: 12.5px; }
.s10-dp.dp th { padding: 4px 10px; line-height: 18px; font-size: 12.5px; }
.s10-dp.dp td { padding: 3px 10px; line-height: 18px; }
.s10-dp.dp .dp-grid td.rn, .s10-dp.dp .dp-grid th.rn { padding: 3px 7px; }
.s10-head { flex: 0 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 10px; padding: 8px 14px 7px; }
.s10-head b { font-size: 15px; font-weight: 600; line-height: 22px; white-space: nowrap; }
.s10-head .s10-sum { grid-column: 1 / -1; color: var(--wb-slate); font-size: 12.5px; line-height: 18px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.s10-head .dp-switch { margin-left: 0; }
.s10-head .dp-switch .seg { padding: 3px 11px; font-size: 12px; white-space: nowrap; }

.s10-ex { position: absolute; inset: 0; padding: 8px 14px; display: flex; flex-direction: column; font-size: 12.5px; background: var(--wb-paper); }
.s10-prov { flex: 0 0 auto; padding: 4px 10px; margin-bottom: 6px; border-radius: 7px; background: var(--wb-mist); color: var(--wb-slate); font-size: 12px; line-height: 17px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.s10-prov b { color: var(--wb-ink); font-weight: 600; }
.s10-filters { flex: 0 0 auto; display: flex; align-items: center; gap: 7px; height: 30px; padding: 0 8px; margin-bottom: 6px; border: 1.5px solid var(--wb-line); border-radius: 8px; font-size: 12px; white-space: nowrap; }
.s10-filters .fl { font-weight: 600; margin-right: 2px; }
.s10-chip { display: inline-flex; align-items: center; gap: 6px; height: 21px; padding: 0 8px 0 10px; border-radius: 11px; background: var(--wb-mist-2); font-weight: 500; transform-origin: 0 50%; }
.s10-chip i { font-style: normal; color: var(--wb-faint); }
.s10-sel { display: inline-flex; align-items: center; justify-content: space-between; gap: 4px; height: 21px; padding: 0 4px 0 7px; border: 1.5px solid var(--wb-line-strong); border-radius: 6px; background: var(--wb-paper); color: var(--wb-ink); font-size: 11.5px; font-weight: 500; }
.s10-sel svg { width: 11px; height: 11px; flex: 0 0 auto; fill: none; stroke: var(--wb-slate); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.s10-sel.f { min-width: 122px; }
.s10-sel.add { color: var(--wb-slate); }
.s10-sel.num { padding: 0 7px; }
.s10-what { display: inline-flex; align-items: center; gap: 10px; }
.s10-fv { display: inline-flex; align-items: center; gap: 5px; font-variant-numeric: tabular-nums; }
.s10-box { width: 14px; height: 14px; border: 1.5px solid var(--wb-line-strong); border-radius: 4px; background: var(--wb-paper); display: inline-flex; align-items: center; justify-content: center; }
.s10-box svg { width: 10px; height: 10px; fill: none; stroke: #fff; stroke-width: 3.6; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
.s10-box.on { background: var(--wb-accent); border-color: var(--wb-accent); }
.s10-box.on svg { opacity: 1; }
.s10-go { height: 21px; padding: 0 9px; border-radius: 6px; background: var(--wb-accent); color: #fff; font-size: 11.5px; font-weight: 600; line-height: 21px; }
.s10-tabs { flex: 0 0 auto; display: flex; gap: 2px; height: 27px; margin-bottom: 8px; border-bottom: 1.5px solid var(--wb-line); }
.s10-tabs .t { padding: 0 10px; font-size: 12.5px; line-height: 24px; font-weight: 500; color: var(--wb-slate); border-bottom: 2.5px solid transparent; height: 27px; white-space: nowrap; transform-origin: 50% 100%; }
.s10-tabs .t.on { color: var(--wb-ink); font-weight: 600; border-bottom-color: var(--wb-accent); }
.s10-stack { position: relative; flex: 0 0 226px; }
.s10-view { position: absolute; inset: 0; background: var(--wb-paper); }
.s10-ctls { display: flex; align-items: center; gap: 7px; height: 24px; margin-bottom: 6px; white-space: nowrap; }
.s10-ctl { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--wb-faint); }
.s10-ctl .s10-sel { font-size: 11px; padding: 0 3px 0 6px; gap: 3px; }
.s10-ctl .s10-sel.num { padding: 0 6px; }
.s10-out { height: 196px; }
.s10-out svg { display: block; width: 100%; height: 100%; overflow: visible; }
.s10-out text { font-family: var(--wb-font); font-size: 11px; fill: var(--wb-slate); font-variant-numeric: tabular-nums; }
.s10-out text.ttl { font-size: 11.5px; font-weight: 500; }
.s10-out text.lab { fill: var(--wb-ink); font-weight: 600; font-size: 11.5px; }
.s10-out text.cellv { font-size: 13px; font-weight: 600; fill: var(--wb-ink); }
.s10-out text.cellv.inv { fill: #fff; }
.s10-out .grid { stroke: var(--wb-line); stroke-width: 1; }
.s10-out .base { stroke: var(--wb-line-strong); stroke-width: 1.5; }
.s10-out .refline { stroke: var(--wb-danger); stroke-width: 1.3; stroke-dasharray: 5 4; }
.s10-line { fill: none; stroke-width: 2.3; stroke-linecap: butt; stroke-linejoin: round; stroke-dasharray: 1; }
.s10-dot { stroke: var(--wb-paper); stroke-width: 1.6; }
.s10-table { border-collapse: collapse; margin-top: 2px; min-width: 66%; font-size: 13px; font-variant-numeric: tabular-nums; }
.s10-table th, .s10-table td { padding: 4px 18px; line-height: 19px; border-bottom: 1.5px solid var(--wb-line); text-align: right; font-weight: 400; white-space: nowrap; }
.s10-table th { font-weight: 600; border-bottom-color: var(--wb-line-strong); }
.s10-table th:first-child, .s10-table td:first-child { text-align: left; color: var(--wb-slate); padding-left: 4px; }
.s10-table td.hl { background: var(--wb-danger-tint); color: var(--wb-danger); }
.s10-note { margin-top: 6px; font-size: 11.5px; color: var(--wb-slate); }
.s10-acts { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.s10-acts span { height: 25px; padding: 0 11px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; background: var(--wb-paper); font-size: 12px; font-weight: 500; line-height: 22px; white-space: nowrap; }
.s10-acts .primary { background: var(--wb-accent); border-color: var(--wb-accent); color: #fff; font-weight: 600; }
.s10-acts .quiet { margin-left: auto; border-color: transparent; color: var(--wb-slate); }
`);

V.scene("s10", (s) => {
  const ui = V.ui, { h, esc, frag } = V;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox", { id: "design", title: "Design options" }] });
  const P = ui.pane(s, A, "design"), ch = P.chat, D = P.display, cur = A.cur;
  P.el.style.setProperty("--l", 42);
  A.activate("design");
  const Pv = S10.preview, col = (n) => S10.columns.find((c) => c.name === n), levels = (n) => col(n).distinct;
  const CHEV = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>', CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>';
  const WORD = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

  // the moments
  const tType1 = 0.85, tOpen = 4.5, tReply1 = 5.3;                          // ask; the explorer opens
  const tCol = 8.1, tTick = 8.8, tKeep = 9.5, tHeat = 11.1;                 // a filter, then the heat map
  const tType2 = 13.5, tTable = 17.4;                                        // "show it as a table ..."
  const tAsk = 20.0;                                                         // Ask Claude

  // ---------------------------------------------------------------- the chat so far (first frame)
  const u0 = ch.past(ch.user("Simulate power for both designs: sample size, effect size, dropout"));
  const b0 = ch.bot(`<p><b>${S10.total} scenarios simulated.</b></p><p>${levels("design")} designs × ${levels("sample_size")} sample sizes × ${levels("effect_size")} effect sizes × ${levels("dropout")} dropout rates.</p><p>The results are in <code>${esc(Pv.name)}</code>.</p>`);
  ch.stepsLine(b0, "6 steps, 58s");
  ch.past(b0);

  // ---------------------------------------------------------------- the results file, as the data preview shows it
  const grid = `<table class="dp-grid"><thead><tr><th class="rn"></th>${Pv.names.map((n) => `<th>${esc(n)}</th>`).join("")}</tr></thead><tbody>` +
    Pv.head.map((r, k) => `<tr><td class="rn">${k + 1}</td>${r.map((v, i) => `<td${Pv.numeric[i] ? ' class="num"' : ""}>${esc(v)}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
  D.add("csv", h("div", h("div.dp.s10-dp", h("div.s10-head", h("b", Pv.name), h("div.dp-switch", h("span.seg.on", `First ${Pv.shown} rows`), h("span.seg", "Variables")), h("span.s10-sum", Pv.summary)),
    h("div.dp-body", h("div.dp-pane", { html: grid })))));

  // ---------------------------------------------------------------- the explorer
  const sizes = col("sample_size").values, effects = col("effect_size").values;
  const at = (vals, n, e) => vals.find((r) => r.sample_size === n && r.effect_size === e).power;
  const VW = 539, VH = 196;
  // effect size is ordered: one hue, light to dark (and each line is named at its end)
  const RAMP = ["#dc9272", "#c9623f", "#853b22"];

  // trend: power by sample size, one line per effect size, a reference line at 0.8
  const G = { L: 46, R: 40, T: 26, B: 36 }, pw = VW - G.L - G.R, ph = VH - G.T - G.B;
  const X = (n) => G.L + 18 + ((n - sizes[0]) / (sizes[sizes.length - 1] - sizes[0])) * (pw - 36), Y = (p) => G.T + (1 - p) * ph;
  const tv = S10.views[0].params;
  let tr = "";
  for (const p of [0, 0.2, 0.4, 0.6, 0.8, 1]) tr += `<path class="${p ? "grid" : "base"}" d="M${G.L} ${Y(p)}H${VW - G.R}"/><text x="${G.L - 8}" y="${Y(p) + 4}" text-anchor="end">${p.toFixed(1)}</text>`;
  for (const n of sizes) tr += `<text x="${X(n)}" y="${VH - G.B + 16}" text-anchor="middle">${n}</text>`;
  tr += `<text class="ttl" x="${G.L + pw / 2}" y="${VH - 3}" text-anchor="middle">${esc(tv.x)}</text><text class="ttl" transform="translate(11 ${G.T + ph / 2}) rotate(-90)" text-anchor="middle">${esc(tv.y)}</text>`;
  tr += `<path class="refline" d="M${G.L} ${Y(tv.ref)}H${VW - G.R}"/>`;
  tr += `<text class="ttl" x="${G.L}" y="12">${esc(tv.color)}</text>` + effects.map((e, i) => `<path d="M${G.L + 78 + i * 58} 8h16" stroke="${RAMP[i]}" stroke-width="2.6" stroke-linecap="round"/><text class="lab" x="${G.L + 99 + i * 58}" y="12">${e}</text>`).join("");
  tr += effects.map((e, i) => `<g data-e="${i}"><path class="s10-line" pathLength="1" stroke="${RAMP[i]}"/>${sizes.map(() => `<circle class="s10-dot" r="3.6" fill="${RAMP[i]}"/>`).join("")}<text class="lab" x="${X(sizes[sizes.length - 1]) + 11}">${e}</text></g>`).join("");
  const trend = frag(`<svg viewBox="0 0 ${VW} ${VH}">${tr}</svg>`);
  const series = [...trend.querySelectorAll("g[data-e]")].map((g) => ({ line: g.querySelector("path"), dots: [...g.querySelectorAll("circle")], lab: g.querySelector("text") }));
  // the lines as computed without a filter (p = 0) and with the filter (p = 1); between, they glide
  const drawTrend = (p) => effects.forEach((e, i) => {
    const pts = sizes.map((n) => { const a = at(S10.open.v1.values, n, e), b = at(S10.filtered.v1.values, n, e); return [X(n), Y(a + (b - a) * p)]; });
    series[i].line.setAttribute("d", "M" + pts.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L"));
    series[i].dots.forEach((c, k) => { c.setAttribute("cx", pts[k][0].toFixed(1)); c.setAttribute("cy", pts[k][1].toFixed(1)); });
    series[i].lab.setAttribute("y", (pts[pts.length - 1][1] + 4).toFixed(1));
  });
  drawTrend(0);
  let drawn = 0;
  s.fn((t) => { const p = V.EASE.io(Math.max(0, Math.min(1, (t - tKeep) / 0.7))); if (p !== drawn) { drawn = p; drawTrend(p); } });

  // heat map: power over sample size (columns) and effect size (rows, largest on top), the value in each cell
  const hv = S10.views[1].params, hvals = S10.filtered.v2.values.map((r) => r.power), lo = Math.min(...hvals), hi = Math.max(...hvals);
  const STOPS = [[248, 235, 226], [231, 166, 136], [180, 83, 47]];
  const shade = (f) => { const k = Math.min(1, f * 2 > 1 ? f * 2 - 1 : f * 2), a = STOPS[f * 2 > 1 ? 1 : 0], b = STOPS[f * 2 > 1 ? 2 : 1]; return "rgb(" + a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",") + ")"; };
  const H = { L: 62, R: 4, T: 4, B: 38 }, cw = (VW - H.L - H.R) / sizes.length, rows = effects.slice().reverse(), chh = (VH - H.T - H.B) / rows.length;
  let hm = "";
  sizes.forEach((n, i) => rows.forEach((e, j) => {
    const v = at(S10.filtered.v2.values, n, e), f = (v - lo) / (hi - lo);
    hm += `<g><rect x="${(H.L + i * cw + 1).toFixed(1)}" y="${(H.T + j * chh + 1).toFixed(1)}" width="${(cw - 2).toFixed(1)}" height="${(chh - 2).toFixed(1)}" rx="5" fill="${shade(f)}"/>` +
      `<text class="cellv${f > 0.85 ? " inv" : ""}" x="${(H.L + (i + 0.5) * cw).toFixed(1)}" y="${(H.T + (j + 0.5) * chh + 4.5).toFixed(1)}" text-anchor="middle">${+v.toPrecision(3)}</text></g>`;
  }));
  rows.forEach((e, j) => (hm += `<text x="${H.L - 9}" y="${H.T + (j + 0.5) * chh + 4}" text-anchor="end">${e}</text>`));
  sizes.forEach((n, i) => (hm += `<text x="${H.L + (i + 0.5) * cw}" y="${VH - H.B + 15}" text-anchor="middle">${n}</text>`));
  hm += `<text class="ttl" x="${H.L + (VW - H.L - H.R) / 2}" y="${VH - 4}" text-anchor="middle">${esc(hv.x)}</text><text class="ttl" transform="translate(11 ${H.T + (VH - H.T - H.B) / 2}) rotate(-90)" text-anchor="middle">${esc(hv.y)}</text>`;
  const heat = frag(`<svg viewBox="0 0 ${VW} ${VH}">${hm}</svg>`);

  // table: the same measure by sample size and effect size; cells below the threshold are marked
  const T5 = S10.filtered.v5.table;
  const tableEl = h("div", { html: `<table class="s10-table"><tr>${T5.header.map((x) => `<th>${esc(x)}</th>`).join("")}</tr>` +
    T5.rows.map((r, i) => `<tr>${r.map((c, j) => `<td${T5.flag[i][j] ? ' data-hl="1"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("") + `</table><div class="s10-note">${esc(T5.note)}</div>` });

  // a view = its controls (the component and the columns it uses) and what the app computed
  const ctl = (label, value, isNum) => h("span.s10-ctl", label, h("span.s10-sel" + (isNum ? ".num" : ""), { html: esc(String(value)) + (isNum ? "" : CHEV) }));
  const body = (view, out) => h("div.s10-view", h("div.s10-ctls", ctl("view", view.label), Object.entries(view.params).filter(([k]) => k !== "op").map(([k, v]) => ctl(k, v, typeof v === "number"))), h("div.s10-out", out));
  const vTrend = body(S10.views[0], trend), vHeat = body(S10.views[1], heat), vTable = body(S10.views[4], tableEl);
  const provN = h("span", `${S10.open.rows} of ${S10.total} rows`);
  const prov = h("div.s10-prov", "Computed by the app from ", h("b", S10.file), " · ", provN);
  const chip = h("span.s10-chip", S10.filtered.filters[0], h("i", "×"));
  const fcol = S10.filtered.filters[0].split(":")[0], addTxt = h("span", "+ Add a filter…");
  const add = h("span.s10-sel.f.add", addTxt, frag(CHEV));
  const boxes = col(fcol).values.map((v) => { const b = h("span.s10-box", { html: CHECK }); return { v, b, el: h("span.s10-fv", b, String(v)) }; });
  const go = h("span.s10-go", "Keep these"), what = h("span.s10-what", boxes.map((x) => x.el), go);
  const tabs = S10.views.map((v, i) => h("span.t" + (i === 0 ? ".on" : ""), v.title));
  const save = h("span", "Save…"), ask = h("span.primary", "Ask Claude");
  const ex = h("div.s10-ex", prov, h("div.s10-filters", h("span.fl", "Filters"), chip, add, what), h("div.s10-tabs", tabs),
    h("div.s10-stack", vTrend, vHeat, vTable), h("div.s10-acts", save, ask, h("span.quiet", "Remove view")));
  D.add("ex", h("div", ex));
  D.open("csv", Pv.name, 2);
  s.init([vHeat, vTable], { opacity: 0 });
  s.init([chip, what, tabs[4]], { show: 0 });

  // ---------------------------------------------------------------- 1. one sentence opens it
  const Q1 = "Let me explore power across these designs";
  const u1 = ch.user(Q1), b1 = ch.bot(`<p><b>The explorer is open</b> on <code>${esc(Pv.name)}</code>.</p><p>${WORD[S10.views.length - 1]} views: ${S10.views.slice(0, 4).map((v) => v.label.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. Change anything there, or tell me what to look at.</p>`);
  ch.stepsLine(b1, "2 steps, 9s");
  A.focus([170, ui.AH - 60], 1.6, tType1 - 0.35, 0.7);
  const sent1 = ch.send(u1, Q1, tType1);
  A.focus(null, 1, sent1 + 0.15, 0.75);
  ch.busy(sent1, tReply1, [[0, "Looking at the data's columns"], [0.7, "Opening the explorer"]], 9);
  D.open("ex", "Explorer: " + Pv.name, 2, tOpen);
  s.fromTo(ex, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, tOpen, 0.35);
  series.forEach((g, i) => {
    s.fromTo(g.line, { draw: 0 }, { draw: 1 }, tOpen + 0.2 + i * 0.12, 0.7, "io");
    s.fromTo([...g.dots, g.lab], { opacity: 0 }, { opacity: 1 }, tOpen + 0.75 + i * 0.12, 0.25);
  });
  ch.stream(b1, tReply1, 0.3);
  // where the numbers come from
  A.ring(prov, 5.8, 7.6, 3);
  V.say(s, "Numbers come from the file.", 5.8, 8.2, "bl");

  // ---------------------------------------------------------------- 2. by hand: a filter shared by all views, then another view
  const free = { without: [chip] };                                          // (the chip is not there yet: it would push the rest aside)
  s.init(cur.el.querySelector(".cur-ring"), { opacity: 0 });                // (the click ring only shows with a click)
  cur.show(7.4, A.xy(vTrend, 0.4, 0.45));
  cur.to(add, tCol - 0.55, 0.45, 0.5, 0.55, free);
  cur.click(tCol);
  s.text(addTxt, fcol, tCol); s.cls(add, "add", tCol, false); s.set(what, { show: 1 }, tCol);
  s.fromTo(what, { opacity: 0, x: -8 }, { opacity: 1, x: 0 }, tCol, 0.22);
  cur.to(boxes[0].b, tTick - 0.45, 0.38, 0.5, 0.5, free);
  cur.click(tTick);
  s.cls(boxes[0].b, "on", tTick);
  cur.to(go, tKeep - 0.48, 0.4, 0.5, 0.5, free);
  cur.click(tKeep);
  s.set(what, { show: 0 }, tKeep); s.text(addTxt, "+ Add a filter…", tKeep); s.cls(add, "add", tKeep, true);
  s.set(chip, { show: 1 }, tKeep); s.fromTo(chip, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, tKeep, 0.3, "back");
  s.text(provN, `${S10.filtered.rows} of ${S10.total} rows after filters`, tKeep);
  const pick = (i, t) => tabs.forEach((el, k) => s.cls(el, "on", t, k === i));
  cur.to(tabs[1], tHeat - 0.6, 0.5, 0.5, 0.55);
  cur.click(tHeat);
  pick(1, tHeat);
  s.set(vHeat, { opacity: 1 }, tHeat);
  [...heat.querySelectorAll("g")].forEach((g, k) => s.fromTo(g, { opacity: 0 }, { opacity: 1 }, tHeat + 0.04 + (Math.floor(k / rows.length) + (k % rows.length)) * 0.06, 0.25));
  cur.hide(tHeat + 0.9);

  // ---------------------------------------------------------------- 3. or by saying it
  const Q2 = "show it as a table, mark power below 80%";
  const u2 = ch.user(Q2), b2 = ch.bot(`<p><b>Table added.</b> ${S10.table_cells.marked} of ${S10.table_cells.of} cells have power below ${T5.note.split("< ")[1]}.</p>`);
  ch.stepsLine(b2, "1 step, 4s");
  const sent2 = ch.send(u2, Q2, tType2);
  ch.busy(sent2, tTable, [[0, "Adding a view"]], 4);
  s.set(tabs[4], { show: 1 }, tTable); s.fromTo(tabs[4], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, tTable, 0.3, "back");
  pick(4, tTable);
  s.set(vTable, { opacity: 1 }, tTable);
  [...tableEl.querySelectorAll("tr")].forEach((r, i) => s.fromTo(r, { opacity: 0 }, { opacity: 1 }, tTable + 0.05 + i * 0.05, 0.22));
  [...tableEl.querySelectorAll("[data-hl]")].forEach((c, i) => s.cls(c, "hl", tTable + 0.55 + i * 0.035));
  ch.stream(b2, tTable + 0.1, 0.3);

  // ---------------------------------------------------------------- 4. seen enough: the view goes to the message box
  const REQ = "Draw this as a figure in R.";
  const h0 = ch.composer.getBoundingClientRect().height, tall = (text) => { ch.ph.style.display = "none"; ch.txt.textContent = text; const d = ch.composer.getBoundingClientRect().height - h0; ch.txt.textContent = ""; ch.ph.style.display = ""; return d; };
  const grow1 = tall(S10.ask), grow2 = tall(S10.ask + "\n" + REQ);
  cur.show(tAsk - 0.95, A.xy(vTable, 0.55, 0.6));
  cur.to(ask, tAsk - 0.75, 0.6, 0.5, 0.55);
  cur.click(tAsk);
  const from = A.xy(ask, 0, 0), to = A.xy(ch.input, 0.04, 0.2), tLand = tAsk + 0.62;
  A.fly(esc(S10.ask.split(":")[0].slice(1)), [from[0] - 30, from[1]], to, tAsk, 0.65);
  s.text(ch.txt, S10.ask, tLand);
  cur.hide(tAsk + 0.5);
  const typed = ch.type(REQ, tLand + 0.6, 22, S10.ask + "\n");
  s.fn((t) => { if (t > typed + 0.3) ch.caret.style.opacity = 0; });       // (nothing blinks on the last frame)
  A.done();
  s.to(ch.inner, { y: -(ch.scrollEnd + grow1) }, tLand, 0.3);
  s.to(ch.inner, { y: -(ch.scrollEnd + grow2) }, tLand + 0.6, 0.2);
});
})();
