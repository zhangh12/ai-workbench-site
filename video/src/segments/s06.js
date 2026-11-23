// Segment 06 — See what changed. Then ship it. Script: planning/scripts.md.
// The Cox model tab's report. "Changes" (yellow: the last request changed this document) marks, on the finished page,
// what that request changed: words added (green, underlined), words removed (red, struck through), a bar beside every
// changed block, a new table row tinted, a changed formula labelled. One step back shows the request before it.
// Then Export > Word (.docx).
// How the app draws it: app/www/mddiff.js, annotator.js / annotator.css (the "Changes" part), docs/design.md 6c, 6d.
// The tab's three requests are the ones of segment 09 (video/data/make_s09.R runs the three versions of cox.R);
// every number is read from window.DATA through V.C.
V.css("s06", `
.s06-tools { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.s06-btn { display: inline-flex; align-items: center; gap: 5px; height: 27px; padding: 0 10px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); color: var(--wb-slate); font-size: 12.5px; font-weight: 500; white-space: nowrap; transform-origin: 50% 50%; }
.s06-btn.recent { background: var(--wb-warn-tint); border-color: #dfc27c; color: var(--wb-warn); font-weight: 600; }
.s06-btn.on { background: #e3f5ea; border-color: #1a7f37; color: #1a7f37; font-weight: 600; }
.s06-btn.open { border-color: var(--wb-slate); color: var(--wb-ink); }
.s06-exp { position: relative; }
.s06-menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 1500; min-width: 178px; padding: 6px; background: var(--wb-paper); border: 1.5px solid var(--wb-line); border-radius: 12px; box-shadow: var(--wb-shadow-pop); transform-origin: 100% 0; }
.s06-item { padding: 7px 11px; border-radius: 7px; color: var(--wb-ink); font-size: 13px; font-weight: 500; white-space: nowrap; }
.s06-item.hover { background: var(--wb-accent-tint); color: var(--wb-accent-strong); }
.s06-bar { background: var(--wb-mist); }
.s06-bar .cv-stat b { color: var(--wb-ink); font-weight: 600; }
.s06-bar .cv-pick { width: 284px; max-width: none; background: var(--wb-paper); }
.s06-doc ins { text-decoration: underline; text-decoration-color: #1a7f37; text-decoration-thickness: 1.5px; text-underline-offset: 3px; color: #1a7f37; background: #e3f5ea; border-radius: 2px; }
.s06-doc del { text-decoration: line-through; text-decoration-color: var(--wb-danger); color: var(--wb-danger); background: var(--wb-danger-tint); border-radius: 2px; }
.s06-blk { position: relative; }
.s06-blk::before { content: ""; position: absolute; left: -14px; top: 2px; bottom: 2px; width: 3px; border-radius: 2px; background: #c89a2b; }
.s06-blk.add::before { background: #1a7f37; }
.s06-blk.add p { color: #1a7f37; text-decoration: underline; text-decoration-color: #1a7f37; text-underline-offset: 3px; }
.s06-blk > :last-child { margin-bottom: 0; }
.s06-blk { margin-bottom: 9px; }
.s06-blk.h { margin-bottom: 12px; }
.s06-blk table { margin: 8px 0 0; }
.s06-doc tr.s06-row td { background: #e3f5ea; }
.s06-doc tr.s06-row ins { background: none; }
.s06-badge { position: absolute; right: 0; top: 0; z-index: 1; padding: 0 8px; border-radius: 9px; background: var(--wb-warn-tint); color: var(--wb-warn); font-size: 10.5px; font-weight: 600; line-height: 18px; }
.sheet .s06-sf .katex-display { margin: 9px 0 3px; }
.sheet .s06-sf .katex { font-size: 0.98em; }
.sheet .s06-sp { margin: 8px 0 6px; font-size: 8.5px; line-height: 1.45; }
.s06-got { position: absolute; right: 16px; bottom: 14px; z-index: 30; box-shadow: var(--wb-shadow-pop); transform-origin: 100% 100%; }
`);

V.scene("s06", (s) => {
  const ui = V.ui, C = V.C, { h, frag } = V, cx = C.cox, e = cx.ecog, ea = cx.ecog_age;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"] });
  const cox = A.build.cox(true, true), ch = cox.chat, cur = A.cur, D = cox.display;
  cox.el.style.setProperty("--l", 34);
  A.activate("cox");

  // the tab's three requests (the first is the builder's); the last one changed the report
  const REQ = [cox.u1.textContent, "Check proportional hazards", "Add age to the model and update the report"];
  ch.past(ch.user(REQ[1]));
  const r2 = ch.past(ch.bot(`<p><b>No sign of a violation.</b> Global test: p = ${C.f2(e.ph_global_p)}.</p>`));
  ch.stepsLine(r2, "3 steps, 18s");
  ch.past(ch.user(REQ[2]));
  const r3 = ch.past(ch.bot(`<p><b>Age added.</b> Sex: HR ${C.hr(ea.sex)}.</p><p>Age, per year: HR ${C.hr(ea.age)}, ${C.pe(ea.age.p)}.</p>`));
  ch.stepsLine(r3, "4 steps, 41s");

  // ---------------------------------------------------------------- the report, and its two latest changes
  const B = ui.bars;
  const formula = (age) => ui.tex(`h(t \\mid x) = h_0(t)\\,\\exp(\\beta_1\\,\\text{female} + \\beta_2\\,\\text{ECOG}${age ? " + \\beta_3\\,\\text{age}" : ""})`, true);
  const ph = (m) => C.f2(m.ph_global_p);
  const para = (p) => `Proportional hazards: no sign of a violation (global test p = ${p}).`;
  const cells = (c, ins) => c.map((x) => `<td>${ins ? `<ins>${x}</ins>` : x}</td>`).join("");
  const table = (m, age) => `<table><thead><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr></thead><tbody>
    <tr>${cells(["Female vs male", C.hr(m.sex), C.pv(m.sex.p)])}</tr><tr>${cells(["ECOG, per point", C.hr(m.ecog), C.pv(m.ecog.p)])}</tr>
    ${age ? `<tr class="s06-row">${cells(["Age, per year", C.hr(m.age), C.pv(m.age.p)], true)}</tr>` : ""}</tbody></table>`;
  const blk = (html, cls = "") => `<div class="s06-blk${cls}">${html}</div>`;
  // the report itself (wide view): the builder's, with the sentence request 2 added
  const doc = cox.doc;
  doc.inner.querySelectorAll(":scope > .bar").forEach((b) => b.remove());
  doc.inner.append(h("p", para(ph(ea))), frag(B(92)), frag(B(64)));
  // request 3 (the latest): the title, the formula, a table row, a number
  const places = [];
  const mark = (html, cls) => { places.push(1); return blk(html, cls); };
  const docA = `${mark("<h1>Cox model: sex, adjusted for ECOG<ins> and age</ins></h1>", " h")}<h2>Model</h2>
    ${mark(`<span class="s06-badge">Changed</span>${formula(true)}`)}
    <h2>Results</h2>${mark(table(ea, true))}${mark(`<p>${para(`<del>${ph(e)}</del><ins>${ph(ea)}</ins>`)}</p>`)}${B(92)}`;
  const nA = places.length;
  // request 2: one sentence added (the report as it was then)
  const docB = `<h1>Cox model: sex, adjusted for ECOG</h1><h2>Model</h2>${formula(false)}
    <h2>Results</h2>${table(e, false)}${blk(`<p>${para(ph(e))}</p>`, " add")}${B(92)}`;
  const nB = 1;
  const plural = (n) => `${n} place${n === 1 ? "" : "s"} changed`;
  const stat = h("span.cv-stat", { html: `<b>Latest change</b> · ${plural(nA)}` }), pick = h("span.cv-pick", REQ[2]);
  const nav = (k) => h("button.cv-nav", { html: ui.ICON[k] }), older = nav("left"), newer = nav("right");
  const bar = h("div.cv-bar.s06-bar", stat, h("span.cv-spacer"), h("span.cv-hist", nav("up"), nav("down"), h("span.cv-sep"), older, pick, newer));
  const innerA = h("div.doc-inner", { html: docA }), innerB = h("div.doc-inner", { html: docB });
  const chg = h("div", h("div.wb-doc", bar, h("div.doc-scroll", h("div.anno-root.no-comments", h("div.anno-doc.md-view.s06-doc", innerA, innerB)))));
  D.add("chg", chg);
  D.open("report", "report.md", 3);

  // the document's tools, in the file picker's row: Changes, Export
  const bChg = h("button.s06-btn.recent", { html: `${ui.ico('<path d="M12 4v8M8 8h8M8 18h8"/>')}<span>Changes</span>` });
  const bExp = h("button.s06-btn", { html: `<span>Export</span>${ui.ICON.down}` });
  const items = ["Word (.docx)", "Web page (.html)", "Markdown (.md)"].map((t) => h("div.s06-item", t));
  const menu = h("div.s06-menu", items);
  D.exp.style.display = "none";
  D.files.append(h("div.s06-tools", bChg, h("div.s06-exp", bExp, menu)));
  s.hide(menu);

  // ---------------------------------------------------------------- 1: Changes
  const T1 = 1.9, T2 = 7.4, T3 = 11.0;
  A.ring(bChg, 0.6, 2.4, 4);
  cur.show(0.7, [700, 270]);
  cur.to(bChg, 0.9, 0.6);
  cur.click(T1);
  s.cls(bChg, "recent", T1, false); s.cls(bChg, "on", T1);
  s.init(bChg, { scale: 1 }); s.fromTo(bChg, { scale: 1.18 }, { scale: 1 }, T1, 0.3, "back");
  D.open("chg", "report.md", 3, T1);
  s.init(innerB, { show: 0 });
  cur.hide(T1 + 0.5);
  V.say(s, "What this turn changed.", T1 + 0.4, T1 + 2.3, "bl");
  // close on the page: the bar and the marks
  const top = A.xy(bar, 0, 0)[1], bottom = A.xy(innerA, 0, 1, { without: [innerB] })[1] - 44;       // the page's last line (not its bottom padding)
  const Z = Math.max(1.1, Math.min(1.3, ui.AH / (bottom - top + 14)));
  A.focus([ui.AW, top - 6 + ui.AH / Z / 2], Z, T1 + 1.7, 0.9);
  cox.dim("chat", T1 + 1.7);
  // one step back: the request before it
  cur.show(T2 - 1.3, A.xy(innerA, 0.62, 0.5, { without: [innerB] }));
  cur.to(older, T2 - 1.2, 0.6);
  s.cls(older, "hot", T2 - 0.5); s.cls(older, "hot", T2 + 0.5, false);
  cur.click(T2);
  s.html(stat, `<b>Change 2 of 3</b> · ${plural(nB)}`, T2); s.text(pick, REQ[1], T2);
  s.set(innerA, { show: 0 }, T2); s.set(innerB, { show: 1 }, T2);
  A.ring(pick, T2 + 0.35, T2 + 2.3, 4);
  cur.hide(T2 + 0.6);
  // back to the page as it is
  A.focus(null, 1, T3 - 1.3, 0.9);
  cox.dim("chat", T3 - 1.3, false);
  cur.show(T3 - 0.9, A.xy(older, 0.5, 0.5));
  cur.to(bChg, T3 - 0.8, 0.5);
  cur.click(T3);
  s.cls(bChg, "on", T3, false); s.cls(bChg, "recent", T3);
  D.open("report", "report.md", 3, T3);

  // ---------------------------------------------------------------- 2: Export > Word
  const T4 = T3 + 1.1, T5 = T4 + 1.3;
  cur.to(bExp, T4 - 0.6, 0.45);
  cur.click(T4);
  s.cls(bExp, "open", T4); s.cls(bExp, "open", T5, false);
  s.fromTo(menu, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, T4, 0.25, "back");
  cur.to(items[0], T4 + 0.45, 0.4, 0.45, 0.55);
  s.cls(items[0], "hover", T4 + 0.75);
  cur.click(T5);
  s.set(menu, { opacity: 0 }, T5 + 0.08);
  cur.hide(T5 + 0.3);
  // the Word file, as a sheet of paper; then it is among the downloads
  const sheet = h("div.sheet", { html: `<h5>Cox model: sex, adjusted for ECOG and age</h5>${B(92, 70)}<div class="s06-sf">${formula(true)}</div>
    <table><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr><tr>${cells(["Female vs male", C.hr(ea.sex), C.pv(ea.sex.p)])}</tr>
    <tr>${cells(["ECOG, per point", C.hr(ea.ecog), C.pv(ea.ecog.p)])}</tr><tr>${cells(["Age, per year", C.hr(ea.age), C.pv(ea.age.p)])}</tr></table><p class="s06-sp">${para(ph(ea))}</p>${B(94, 88, 96, 60)}` });
  sheet.append(frag(`<span class="fchip big name">${ui.fileIcon("x.docx")}report.docx</span>`));
  A.el.append(sheet);
  const got = frag(`<span class="fchip big s06-got">${ui.fileIcon("x.docx")}report.docx</span>`);
  cox.disp.append(got);
  const b = A.xy(bExp, 0.5, 1), g = A.xy(got, 0.5, 0.5), T6 = T5 + 2.6;
  s.fromTo(sheet, { x: b[0], y: b[1], scale: 0.05, opacity: 0, rot: -12 }, { x: 610, y: 58, scale: 1, opacity: 1, rot: 0 }, T5, 0.6, "back");
  cox.dim("disp", T5); cox.dim("chat", T5);
  s.to(sheet, { x: g[0], y: g[1], scale: 0.05, opacity: 0 }, T6, 0.5, "in");
  cox.dim("disp", T6, false); cox.dim("chat", T6, false);
  s.fromTo(got, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1 }, T6 + 0.4, 0.32, "back");
  A.done();
});
