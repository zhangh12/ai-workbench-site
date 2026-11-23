// Segment 07 — Look before you ask (the data preview: design.md 6e). Script: planning/scripts.md.
//   0–4    the file list is open; cohort.parquet is chosen: rows, columns, size, format; the first rows (NA marked)
//   4–10   Variables: name, type, missing among the first 200 rows; "Summarize all 1,543 rows" reads the whole file:
//          missing, distinct values and a summary of every variable (close on the table)
//   11–17  other formats, quickly: an Excel workbook (a sheet is picked), a SAS transport file (its variables carry labels)
(function () {
// Every number and every value below was computed by the app's own data preview (app/wb/datapreview.py: read_preview,
// full_stats) from the synthetic files. Output of video/data/make_s07.py, pasted as it is (see that file for how to
// run it; the .xpt and .xlsx are made from the same synthetic data by video/data/make_s07_files.R).
const S07 = {
  "made_by": "video/data/make_s07.py (app/wb/datapreview.py: read_preview, full_stats)",
  "parquet": {"name":"cohort.parquet","summary":"1,543 rows, 9 columns, 17.6 KB, Parquet","nrows":1543,"ncols":9,"shown":200,"note":"","sheets":[],"sheet":null,"numeric":[false,true,true,true,false,true,false,false,false],"cols":[{"name":"patient_id","label":"","type":"string","missing_shown":0,"missing":0,"distinct":1543,"summary":"P00001 (1) · P00005 (1) · P00006 (1)"},{"name":"time","label":"","type":"double","missing_shown":0,"missing":0,"distinct":800,"summary":"min 1 · median 296 · max 2,442 · mean 415"},{"name":"event","label":"","type":"int32","missing_shown":0,"missing":0,"distinct":2,"summary":"min 0 · median 1 · max 1 · mean 0.932"},{"name":"age","label":"","type":"double","missing_shown":0,"missing":0,"distinct":51,"summary":"min 38 · median 67 · max 90 · mean 66.97"},{"name":"sex","label":"","type":"dictionary<values=string, indices=int8, ordered=0>","missing_shown":0,"missing":0,"distinct":2,"summary":"Male (879) · Female (664)"},{"name":"ph.ecog","label":"","type":"double","missing_shown":11,"missing":103,"distinct":4,"summary":"min 0 · median 1 · max 3 · mean 1.005"},{"name":"stage","label":"","type":"string","missing_shown":0,"missing":0,"distinct":2,"summary":"IV (1,238) · IIIB (305)"},{"name":"region","label":"","type":"string","missing_shown":10,"missing":64,"distinct":4,"summary":"North (403) · South (383) · East (348)"},{"name":"regimen","label":"","type":"string","missing_shown":0,"missing":0,"distinct":4,"summary":"Chemo-immunotherapy (574) · Chemotherapy (403) · Immunotherapy (340)"}],"head":[["P00001","810.0","1","80.0","Female","2.0","IV","West","Chemo-immunotherapy"],["P00005","393.0","1","65.0","Male","0.0","IV","North","Targeted therapy"],["P00006","1762.0","0","59.0","Male","0.0","IV","West","Chemotherapy"],["P00007","602.0","1","61.0","Male","1.0","IIIB","North","Chemo-immunotherapy"],["P00009","57.0","1","79.0","Male","3.0","IV","North","Targeted therapy"],["P00014","407.0","1","57.0","Female","2.0","IV","South","Chemotherapy"],["P00018","1336.0","1","60.0","Male","1.0","IV","North","Immunotherapy"],["P00020","8.0","1","66.0","Male","1.0","IV","East","Chemo-immunotherapy"],["P00022","243.0","1","72.0","Male","0.0","IIIB","East","Immunotherapy"],["P00024","148.0","1","54.0","Male","1.0","IV","West","Chemotherapy"],["P00027","421.0","1","69.0","Male","1.0","IV","West","Chemo-immunotherapy"],["P00029","304.0","1","65.0","Male","1.0","IIIB","North","Chemotherapy"],["P00031","409.0","1","60.0","Female","1.0","IV","East","Chemotherapy"],["P00036","67.0","1","51.0","Male","3.0","IV","East","Chemo-immunotherapy"],["P00037","913.0","1","59.0","Male","0.0","IV","East","Chemotherapy"],["P00041","316.0","1","64.0","Male","2.0","IV","North","Targeted therapy"],["P00042","238.0","1","69.0","Female","2.0","IV","North","Chemo-immunotherapy"],["P00043","54.0","1","72.0","Male","1.0","IV","West","Chemotherapy"],["P00048","532.0","1","77.0","Male","0.0","IV","West","Chemo-immunotherapy"],["P00054","113.0","1","84.0","Female",null,"IV","North","Targeted therapy"],["P00056","613.0","1","63.0","Female","1.0","IV","West","Chemotherapy"],["P00061","150.0","0","72.0","Male","2.0","IV","East","Chemo-immunotherapy"],["P00063","236.0","1","77.0","Female","1.0","IV","North","Immunotherapy"],["P00068","187.0","1","58.0","Male","2.0","IV","North","Immunotherapy"],["P00070","69.0","1","69.0","Female","0.0","IV","East","Chemotherapy"],["P00073","73.0","0","56.0","Female","3.0","IV","West","Immunotherapy"]]},
  "xpt": {"name":"cohort.xpt","summary":"1,543 rows, 9 columns, 110.5 KB, SAS transport file (XPT)","nrows":1543,"ncols":9,"shown":200,"note":"","sheets":[],"sheet":null,"numeric":[false,true,true,true,false,true,false,false,false],"cols":[{"name":"PATID","label":"Patient identifier","type":"text","missing_shown":0,"missing":0,"distinct":1543,"summary":"P00001 (1) · P00005 (1) · P00006 (1)"},{"name":"TIME","label":"Days to death or last contact","type":"numeric","missing_shown":0,"missing":0,"distinct":800,"summary":"min 1 · median 296 · max 2,442 · mean 415"},{"name":"EVENT","label":"Death (1) or censored (0)","type":"numeric","missing_shown":0,"missing":0,"distinct":2,"summary":"min 0 · median 1 · max 1 · mean 0.932"},{"name":"AGE","label":"Age at diagnosis (years)","type":"numeric","missing_shown":0,"missing":0,"distinct":51,"summary":"min 38 · median 67 · max 90 · mean 66.97"},{"name":"SEX","label":"Sex","type":"text","missing_shown":0,"missing":0,"distinct":2,"summary":"Male (879) · Female (664)"},{"name":"ECOG","label":"ECOG performance status","type":"numeric","missing_shown":11,"missing":103,"distinct":4,"summary":"min 0 · median 1 · max 3 · mean 1.005"},{"name":"STAGE","label":"Stage at diagnosis","type":"text","missing_shown":0,"missing":0,"distinct":2,"summary":"IV (1,238) · IIIB (305)"},{"name":"REGION","label":"Region","type":"text","missing_shown":0,"missing":0,"distinct":5,"summary":"North (403) · South (383) · East (348)"},{"name":"REGIMEN","label":"First-line regimen","type":"text","missing_shown":0,"missing":0,"distinct":4,"summary":"Chemo-immunotherapy (574) · Chemotherapy (403) · Immunotherapy (340)"}],"head":[["P00001","810.0","1.0","80.0","Female","2.0","IV","West","Chemo-immunotherapy"],["P00005","393.0","1.0","65.0","Male","0.0","IV","North","Targeted therapy"],["P00006","1762.0","0.0","59.0","Male","0.0","IV","West","Chemotherapy"],["P00007","602.0","1.0","61.0","Male","1.0","IIIB","North","Chemo-immunotherapy"],["P00009","57.0","1.0","79.0","Male","3.0","IV","North","Targeted therapy"],["P00014","407.0","1.0","57.0","Female","2.0","IV","South","Chemotherapy"],["P00018","1336.0","1.0","60.0","Male","1.0","IV","North","Immunotherapy"],["P00020","8.0","1.0","66.0","Male","1.0","IV","East","Chemo-immunotherapy"],["P00022","243.0","1.0","72.0","Male","0.0","IIIB","East","Immunotherapy"],["P00024","148.0","1.0","54.0","Male","1.0","IV","West","Chemotherapy"],["P00027","421.0","1.0","69.0","Male","1.0","IV","West","Chemo-immunotherapy"],["P00029","304.0","1.0","65.0","Male","1.0","IIIB","North","Chemotherapy"],["P00031","409.0","1.0","60.0","Female","1.0","IV","East","Chemotherapy"],["P00036","67.0","1.0","51.0","Male","3.0","IV","East","Chemo-immunotherapy"]]},
  "xlsx": {"name":"rwd_tables.xlsx","summary":"6,000 rows, 4 columns, 444.7 KB, Excel","nrows":6000,"ncols":4,"shown":200,"note":"Column types are guessed from the first 200 rows.","sheets":["patients","diagnoses","treatments","deaths","followup"],"sheet":"patients","numeric":[false,false,true,false],"cols":[{"name":"patient_id","label":"","type":"str","missing_shown":0,"missing":0,"distinct":6000,"summary":"P00001 (1) · P00002 (1) · P00003 (1)"},{"name":"sex","label":"","type":"str","missing_shown":0,"missing":0,"distinct":2,"summary":"Male (3,387) · Female (2,613)"},{"name":"birth_year","label":"","type":"int64","missing_shown":0,"missing":0,"distinct":59,"summary":"min 1,926 · median 1,953 · max 1,986 · mean 1,952.5"},{"name":"region","label":"","type":"str","missing_shown":12,"missing":244,"distinct":4,"summary":"North (1,631) · South (1,526) · East (1,344)"}],"head":[["P00001","Female","1941","West"],["P00002","Male","1959","South"],["P00003","Male","1953","West"],["P00004","Male","1948","West"],["P00005","Male","1957","North"],["P00006","Male","1960","West"],["P00007","Male","1959","North"],["P00008","Female","1967","South"],["P00009","Male","1941","North"],["P00010","Female","1946","South"],["P00011","Male","1950","East"],["P00012","Female","1945","North"],["P00013","Male","1955",null],["P00014","Female","1964","South"]]},
  "xlsx_diagnoses": {"name":"rwd_tables.xlsx","summary":"6,000 rows, 5 columns, 444.7 KB, Excel","nrows":6000,"ncols":5,"shown":200,"note":"Column types are guessed from the first 200 rows.","sheets":["patients","diagnoses","treatments","deaths","followup"],"sheet":"diagnoses","numeric":[false,false,false,false,true],"cols":[{"name":"patient_id","label":"","type":"str","missing_shown":0,"missing":0,"distinct":6000,"summary":"P00001 (1) · P00002 (1) · P00003 (1)"},{"name":"dx_date","label":"","type":"datetime64[us]","missing_shown":0,"missing":0,"distinct":2540,"summary":"2016-01-01 to 2023-12-30"},{"name":"histology","label":"","type":"str","missing_shown":0,"missing":0,"distinct":2,"summary":"NSCLC (5,091) · SCLC (909)"},{"name":"stage","label":"","type":"str","missing_shown":0,"missing":0,"distinct":5,"summary":"IV (2,970) · I (957) · IIIB (758)"},{"name":"ecog","label":"","type":"float64","missing_shown":15,"missing":423,"distinct":4,"summary":"min 0 · median 1 · max 3 · mean 1.014"}],"head":[["P00001","2021-09-15","NSCLC","IV","2.0"],["P00002","2017-03-22","SCLC","IV","1.0"],["P00003","2020-04-13","NSCLC","IIIA","1.0"],["P00004","2020-07-03","NSCLC","I","1.0"],["P00005","2022-01-12","NSCLC","IV","0.0"],["P00006","2019-12-07","NSCLC","IV","0.0"],["P00007","2020-05-06","NSCLC","IIIB","1.0"],["P00008","2018-07-26","NSCLC","I","1.0"],["P00009","2020-10-11","NSCLC","IV","3.0"],["P00010","2021-04-08","NSCLC","IIIB","0.0"],["P00011","2017-02-26","NSCLC","II","1.0"],["P00012","2017-03-09","NSCLC","IIIA","1.0"],["P00013","2022-12-27","NSCLC","IV","1.0"],["P00014","2021-08-25","NSCLC","IV","2.0"]]}
};

V.css("s07", `
.s07-dp.dp table { width: auto; min-width: 100%; font-size: 12.5px; }
.s07-dp.dp th { padding: 4px 10px; line-height: 18px; font-size: 12.5px; }
.s07-dp.dp td { padding: 3px 10px; line-height: 18px; }
.s07-dp.dp td.na { color: var(--wb-faint); font-style: italic; }
.s07-dp.dp .dp-grid td.rn, .s07-dp.dp .dp-grid th.rn { padding: 3px 7px; }
.s07-head { flex: 0 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; column-gap: 10px; padding: 8px 14px 7px; position: relative; z-index: 3; }
.s07-head b { font-size: 15px; font-weight: 600; line-height: 22px; white-space: nowrap; }
.s07-head .s07-sum { grid-column: 1 / -1; color: var(--wb-slate); font-size: 12.5px; line-height: 18px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.s07-head .dp-switch { margin-left: 0; }
.s07-head .dp-switch .seg { padding: 3px 11px; font-size: 12px; white-space: nowrap; }
.s07-sheet { position: relative; display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 7px 0 10px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); font-size: 12.5px; font-weight: 500; white-space: nowrap; }
.s07-sheet svg { width: 13px; height: 13px; fill: none; stroke: var(--wb-slate); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.s07-sheets { position: absolute; top: calc(100% + 4px); right: -1.5px; min-width: 124px; padding: 5px; border: 1.5px solid var(--wb-line); border-radius: 10px; background: var(--wb-paper); box-shadow: var(--wb-shadow-pop); transform-origin: 100% 0; }
.s07-sheets div { padding: 4px 9px; border-radius: 6px; font-size: 12.5px; font-weight: 500; }
.s07-sheets div.sel { color: var(--wb-accent-strong); font-weight: 600; }
.s07-sheets div.active { background: var(--wb-accent-tint); }
.s07-roll { position: absolute; left: 0; top: 0; min-width: 100%; }
.s07-stick { position: absolute; left: 0; top: 0; min-width: 100%; overflow: hidden; }
.s07-vars { table-layout: fixed; width: 100% !important; }
.s07-vars td, .s07-vars th { overflow: hidden; text-overflow: ellipsis; }
.s07-dp.dp .s07-vars td.sum { font-size: 11.5px; }
.s07-dp.dp .s07-vars td.lbl { color: var(--wb-ink); }
.s07-foot { display: flex; align-items: center; gap: 10px; min-height: 26px; padding: 7px 14px 0; color: var(--wb-faint); font-size: 11.5px; white-space: nowrap; }
.s07-btn { margin-left: auto; padding: 3px 11px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); color: var(--wb-ink); font-size: 12px; font-weight: 500; line-height: 17px; }
.s07-btn.busy { color: var(--wb-faint); background: var(--wb-mist); }
.s07-box { position: absolute; pointer-events: none; }
`);

V.scene("s07", (s) => {
  const ui = V.ui, { h, esc, frag } = V;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"] });
  const P = A.build.cohort(true), D = P.display, cur = A.cur;
  A.activate("cohort");
  const num = (n) => n.toLocaleString("en-US");
  // a summary cut to what fits its column, at a " · " (never in the middle of a number)
  const fit = (t, n = 43) => { if (t.length <= n) return t; const parts = t.split(" · "); let out = parts[0]; for (const p of parts.slice(1)) { if ((out + " · " + p).length > n - 4) break; out += " · " + p; } return out + " · …"; };

  // ---------------------------------------------------------------- one file's preview: the first rows, and the variables
  const preview = (Pv, o = {}) => {
    const table = `<table class="dp-grid"><thead><tr><th class="rn"></th>${Pv.cols.map((c) => `<th>${esc(c.name)}</th>`).join("")}</tr></thead><tbody>` +
      Pv.head.map((r, k) => `<tr><td class="rn">${k + 1}</td>${r.map((v, i) => (v === null ? '<td class="na">NA</td>' : `<td${Pv.numeric[i] ? ' class="num"' : ""}>${esc(v)}</td>`)).join("")}</tr>`).join("") + "</tbody></table>";
    // the rows can be scrolled under the column names (a second copy of the table, cut to its header, stays on top)
    const roll = h("div.s07-roll", { html: table }), stick = h("div.s07-stick", { html: table });
    const gridEl = h("div.dp-pane", roll, stick);
    const labels = Pv.cols.some((c) => c.label);
    const w = o.full ? [98, 0, 72, 74, 68] : labels ? [82, 0, 76, 76] : [120, 0, 120, 80];
    const vars = `<table class="dp-vars s07-vars"><colgroup><col style="width:${w[0]}px">${labels ? "<col>" : ""}<col style="width:${w[2]}px"><col style="width:${w[3]}px">${o.full ? `<col style="width:${w[4]}px"><col>` : labels ? "" : "<col>"}</colgroup>` +
      `<thead><tr><th>Variable</th>${labels ? "<th>Label</th>" : ""}<th>Type</th><th class="num" data-k="mh">Missing*</th>${o.full ? '<th class="num" data-k="x">Distinct</th><th data-k="x">Summary</th>' : labels ? "" : "<th></th>"}</tr></thead><tbody>` +
      Pv.cols.map((c) => `<tr><td class="v">${esc(c.name)}</td>${labels ? `<td class="lbl">${esc(c.label)}</td>` : ""}<td class="typ">${esc(c.type)}</td><td class="num" data-k="m">${num(c.missing_shown)}</td>` +
        (o.full ? `<td class="num" data-k="x">${num(c.distinct)}</td><td class="sum" data-k="x">${fit(c.summary)}</td>` : labels ? "" : "<td></td>") + "</tr>").join("") + "</tbody></table>";
    const note = h("span", `* Among the first ${Pv.shown} rows.`), btn = h("span.s07-btn", `Summarize all ${num(Pv.nrows)} rows`);
    const varsEl = h("div.dp-pane", { html: vars }, h("div.s07-foot", note, btn));
    const segData = h("span.seg.on", `First ${Pv.shown} rows`), segVars = h("span.seg", "Variables");
    const sheetList = Pv.sheets.length > 1 ? h("div.s07-sheets", Pv.sheets.map((n) => h("div" + (n === Pv.sheet ? ".sel" : ""), n))) : null;
    const sheet = sheetList ? h("div.s07-sheet", h("span", Pv.sheet), frag('<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'), sheetList) : null;
    const el = h("div", h("div.dp.s07-dp", h("div.s07-head", h("b", Pv.name), sheet, h("div.dp-switch", segData, segVars), h("span.s07-sum", Pv.summary)), h("div.dp-body", gridEl, varsEl)));
    s.init(varsEl, { opacity: 0 });
    if (sheetList) s.hide(sheetList);
    return { Pv, el, roll, stick, gridEl, varsEl, segData, segVars, note, btn, sheet, sheetList, rows: [...roll.querySelectorAll("tbody tr")], vrows: [...varsEl.querySelectorAll("tbody tr")], q: (k) => [...varsEl.querySelectorAll(`[data-k="${k}"]`)] };
  };
  const pq = preview(S07.parquet, { full: true }), xl = preview(S07.xlsx), xl2 = preview(S07.xlsx_diagnoses), xpt = preview(S07.xpt);
  D.add("pq", pq.el); D.add("xl", xl.el); D.add("xl2", xl2.el); D.add("xpt", xpt.el);
  for (const v of [pq, xl, xl2, xpt]) v.stick.style.height = v.stick.querySelector("thead").getBoundingClientRect().height + "px";   // (measured now that it is in the page)

  // ---------------------------------------------------------------- first frame: the Cohort tab, its file list open
  const FILES = [["This tab", ["cohort.md", "cohort.parquet"]], ["Session data", ["rwd_tables.xlsx", "cohort.xpt"]]], N = 4;
  const item = D.menu(FILES, "cohort.md");
  D.open("report", "cohort.md", N);
  D.pop.style.transformOrigin = "0 0";
  s.init(D.pop, { opacity: 1 });
  const start = A.xy(item("rwd_tables.xlsx"), 0.78, 1.5);
  s.init(cur.el, { opacity: 1, x: start[0], y: start[1] });           // the pointer is there from the first frame
  s.init(cur.el.querySelector(".cur-ring"), { opacity: 0 });           // (its click ring only shows with a click)

  const openList = (at) => { cur.to(D.btn, at - 0.5, 0.42, 0.4, 0.55); cur.click(at); s.fromTo(D.pop, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, at, 0.2, "back"); };
  // choose a file: the pointer goes to its line, the list closes, its preview opens on the first rows
  const choose = (name, key, v, at, travel = 0.5) => {
    const it = item(name);
    cur.to(it, at - travel - 0.12, travel, 0.4, 0.5);
    s.cls(it, "active", at - 0.14); s.cls(it, "active", at + 0.02, false);
    cur.click(at);
    s.set(D.pop, { opacity: 0 }, at);
    D.open(key, name, N, at);
    FILES.forEach(([, names]) => names.forEach((n) => s.cls(item(n), "sel", at, n === name)));
    v.rows.forEach((r, i) => s.fromTo(r, { opacity: 0 }, { opacity: 1 }, at + 0.06 + i * 0.035, 0.2));
  };
  const variables = (v, at) => {
    cur.to(v.segVars, at - 0.55, 0.45);
    cur.click(at);
    s.cls(v.segVars, "on", at); s.cls(v.segData, "on", at, false);
    s.set(v.varsEl, { opacity: 1 }, at);
    v.vrows.forEach((r, i) => s.fromTo(r, { opacity: 0, y: 5 }, { opacity: 1, y: 0 }, at + 0.05 + i * 0.04, 0.22));
  };

  // ---------------------------------------------------------------- 1. cohort.parquet: what is in it, and its first rows
  choose("cohort.parquet", "pq", pq, 1.25, 0.55);
  // down the first rows, to one with a missing value
  const rowH = pq.rows[1].getBoundingClientRect().top - pq.rows[0].getBoundingClientRect().top;
  const firstNA = S07.parquet.head.findIndex((r) => r.includes(null));
  const visible = Math.floor((pq.gridEl.getBoundingClientRect().height - parseFloat(pq.stick.style.height)) / rowH);
  const down = Math.max(0, Math.min(S07.parquet.head.length - visible, firstNA - visible + 4));
  s.to(pq.roll, { y: -down * rowH }, 2.1, 1.1, "io");

  // ---------------------------------------------------------------- 2. its variables; then statistics over every row
  variables(pq, 4.2);
  const tb = pq.varsEl.querySelector("table").getBoundingClientRect(), Z = 1.33;
  const camX = A.xy(pq.varsEl, 0.5, 0)[0], camY = (A.xy(pq.el, 0, 0)[1] + A.xy(pq.varsEl.querySelector(".s07-foot"), 0, 1)[1]) / 2;
  A.focus([camX, camY], Z, 4.35, 0.85);
  P.dim("chat", 4.35, true, 0.6);
  const T = 6.7, R = T + 0.5;
  cur.to(pq.btn, T - 0.75, 0.6);
  cur.click(T);
  s.text(pq.btn, "Summarizing all rows…", T); s.cls(pq.btn, "busy", T);
  s.set(pq.btn, { opacity: 0 }, R);
  s.text(pq.note, `Statistics over all ${num(S07.parquet.nrows)} rows.`, R);
  s.text(pq.q("mh")[0], "Missing", R);
  pq.q("m").forEach((c, i) => { const col = S07.parquet.cols[i]; if (col.missing !== col.missing_shown) s.count(c, col.missing_shown, col.missing, R, 0.5, (x) => num(Math.round(x)), "out"); });
  pq.q("x").forEach((c, i) => { s.init(c, { opacity: 0 }); const row = Math.max(0, Math.floor((i - 2) / 2)); s.fromTo(c, { opacity: 0 }, { opacity: 1 }, R + (i < 2 ? 0 : 0.06 + row * 0.05), 0.25); });
  cur.hide(R + 0.3);
  // the new columns, framed once
  const mh = pq.q("mh")[0].getBoundingClientRect(), vb = pq.varsEl.getBoundingClientRect();
  const frame = h("div.s07-box", { style: { left: mh.left - vb.left + "px", top: tb.top - vb.top + "px", width: tb.right - mh.left - 6 + "px", height: tb.height + "px" } });
  pq.varsEl.append(frame);
  A.ring(frame, R + 0.75, R + 2.75, 1);
  A.focus(null, 1, 10.3, 0.8);
  P.dim("chat", 10.3, false, 0.6);

  // ---------------------------------------------------------------- 3. other formats: a workbook and its sheets; a SAS file and its labels
  V.say(s, "Excel and SAS files, too.", 11.9, 16.9, "bl");
  cur.show(10.75);
  openList(11.3);
  choose("rwd_tables.xlsx", "xl", xl, 12.0, 0.42);
  cur.to(xl.sheet, 12.35, 0.42);
  cur.click(12.85);
  s.fromTo(xl.sheetList, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, 12.85, 0.2, "back");
  const dx = xl.sheetList.children[S07.xlsx.sheets.indexOf(S07.xlsx_diagnoses.sheet)];
  cur.to(dx, 12.98, 0.34, 0.45, 0.5);
  s.cls(dx, "active", 13.3);
  cur.click(13.5);
  D.open("xl2", "rwd_tables.xlsx", N, 13.5);
  xl2.rows.forEach((r, i) => s.fromTo(r, { opacity: 0 }, { opacity: 1 }, 13.56 + i * 0.03, 0.2));
  openList(14.5);
  choose("cohort.xpt", "xpt", xpt, 15.2, 0.42);
  variables(xpt, 16.1);
  cur.hide(16.65);
  A.done();
});
})();
