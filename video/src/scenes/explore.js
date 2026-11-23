// Act "explore" — answers pain 2 (exploring is expensive).
// c1 try it in a tab, then close it (and restore it) · c2 /btw · c3 show changes
V.scene("explore", (s) => {
  const ui = V.ui, C = V.C, { h } = V;
  ui.captions(s);
  const A = V.lung(s, { tabs: ["cohort", "km", "cox", { id: "try", title: "Try: ECOG 0–1" }] });
  const cox = A.build.cox(true), cur = A.cur, T = C.T, tab = A.tabs.try;
  const c1 = s.shot("c1").at, c2 = s.shot("c2").at, c3 = s.shot("c3").at;
  const pop = (el, at, o = "50% 50%") => { el.style.transformOrigin = o; return s.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, at, 0.32, "back"); };

  // the scratch tab
  const tr = ui.pane(s, A, "try");
  const u1 = tr.chat.user("Same model, ECOG 0–1 only");
  const r1 = tr.chat.bot(`<p><b>HR ${C.hr(T)}</b>, n = ${T.n}.</p><p>All patients: HR ${C.hr(C.cox.ecog.sex)}.</p>`);
  tr.chat.stepsLine(r1, "3 steps, 14s");
  const trDoc = ui.doc(s, A, `<h1>Try: ECOG 0–1 only</h1>${ui.bars(90, 60)}<table><thead><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr></thead><tbody>
    <tr><td>Female vs male</td><td>${C.hr(T)}</td><td>${C.pv(T.p)}</td></tr></tbody></table>${ui.bars(84, 46)}`);
  tr.display.empty(); tr.display.add("report", trDoc.el); tr.display.open("empty", "", 0);

  A.activate("cox");
  A.enter(0);

  // ---------------------------------------------------------------- c1: a tab for a quick try
  s.init(tab.el, { show: 0 });
  cur.show(c1 + 0.5, [430, 260]);
  cur.to(A.newBtn, c1 + 0.6, 0.55, 0.5, 0.5, { without: [tab.el] });
  cur.click(c1 + 1.2);
  s.set(tab.el, { show: 1 }, c1 + 1.2); pop(tab.el, c1 + 1.2, "50% 100%");
  A.activate("try", c1 + 1.2);
  cur.hide(c1 + 1.5);
  let t = tr.chat.send(u1, "Same model, ECOG 0–1 only", c1 + 1.7);
  A.typeCam(c1 + 1.7, t);
  tr.chat.busy(t, c1 + 5.6, [[0, "Writing try.R"], [0.9, "Running R code"]], 14);
  tr.chat.stream(r1, c1 + 5.6, 0.45);
  tr.display.open("report", "report.md", 2, c1 + 5.6);
  s.fromTo(tr.display.v.report, { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, c1 + 5.6, 0.4);
  // seen it; close it. The tab goes to "Recently closed"
  const btnXY = A.xy(A.closedBtn, 0.5, 0.5);
  cur.show(c1 + 7.6, [620, 200]);
  cur.to(tab.x, c1 + 7.7, 0.6);
  cur.click(c1 + 8.4);
  const ghost = (at, back) => {
    const g = h("div.ghost", { style: { width: ui.AW - 24 + "px", height: ui.AH - 68 + "px" } });
    A.el.append(g);
    const big = { x: 12, y: 56, scale: 1, opacity: 0.85 }, small = { x: btnXY[0] - 20, y: btnXY[1] - 8, scale: 0.05, opacity: 0.2 };
    s.fromTo(g, back ? small : big, back ? big : small, at, 0.6, "io");
    s.to(g, { opacity: 0 }, at + 0.6, 0.15);
    s.init(g, { opacity: 0 });
  };
  ghost(c1 + 8.4, false);
  s.set(tab.el, { show: 0 }, c1 + 8.4);
  A.activate("cox", c1 + 8.4);
  pop(A.closedBtn, c1 + 8.95);
  cur.hide(c1 + 8.9);
  A.callout("kept: conversation + files", [btnXY[0] - 196, btnXY[1] + 38], c1 + 9.6, c1 + 11.6);
  // changed your mind: restore it
  A.closedMenu.innerHTML = `<div class="wb-menu-note">Click a tab to restore it. Its files and conversation are kept.</div><div class="wb-menu-item">${ui.ICON.back}<span>Try: ECOG 0–1</span></div>`;
  A.closedMenu.style.transformOrigin = "100% 0";
  const item = A.closedMenu.querySelector(".wb-menu-item");
  cur.show(c1 + 11.5, [700, 240]);
  cur.to(A.closedBtn, c1 + 11.6, 0.55);
  cur.click(c1 + 12.2);
  s.fromTo(A.closedMenu, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, c1 + 12.2, 0.25, "back");
  cur.to(item, c1 + 12.8, 0.45, 0.4, 0.5);
  s.cls(item, "hover", c1 + 13.1);
  cur.click(c1 + 13.7);
  s.set(A.closedMenu, { opacity: 0 }, c1 + 13.7);
  s.to(A.closedBtn, { opacity: 0 }, c1 + 13.7, 0.2);
  ghost(c1 + 13.7, true);
  s.set(tab.el, { show: 1 }, c1 + 13.9); pop(tab.el, c1 + 13.9, "50% 100%");
  A.activate("try", c1 + 14.2);
  cur.hide(c1 + 14.1);

  // ---------------------------------------------------------------- c2: a side question while Claude works
  A.activate("cox", c2 + 0.1);
  const u2 = cox.chat.user("Add age to the model and update the report");
  const r2 = cox.chat.bot(`<p><b>Age added.</b> Sex: HR ${C.hr(C.cox.ecog_age.sex)}.</p><p>Age, per year: HR ${C.hr(C.cox.ecog_age.age)}, p = ${C.cox.ecog_age.age.p.toFixed(2)}.</p>`);
  cox.chat.stepsLine(r2, "4 steps, 41s");
  t = cox.chat.send(u2, "Add age to the model and update the report", c2 + 0.5);    // sent at about 3.1
  A.typeCam(c2 + 0.5, t, false, 1.45);
  const busyEnd = c3 + 0.4;
  cox.chat.busy(t, busyEnd, [[0, "Editing cox.R"], [4.5, "Running R code"], [9.5, "Editing report.md"]], 41);
  A.focus([0, ui.AH], 1.2, c2 + 3.4, 1.0);
  cox.dim("disp", c2 + 3.4);
  const Qb = "which variables have missing values?";
  const ans = h("div.btw-ans", "Thinking…");
  const panel = h("div.wb-btw", h("div.btw-hd", h("b", "Side question"), h("span.sub", "can only read · not saved")), h("div.btw-question", Qb), ans);
  cox.chatEl.append(panel);
  const typed = cox.chat.type("/btw " + Qb, c2 + 4.6);                                  // until about 6.8
  cox.chat.clear(typed + 0.4);
  s.fromTo(panel, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, typed + 0.4, 0.32, "back");
  const m = C.missRows;
  s.html(ans, `<p><b>${["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][m.length]}.</b> ${m.slice(0, 3).map(([k, n]) => `<code>${k}</code> ${n}`).join(" · ")}</p><p>${m.slice(3).map(([k, n]) => `<code>${k}</code> ${n}`).join(" · ")}</p>`, typed + 1.5);
  // meanwhile the request is still running, and the conversation is as it was
  A.done();
  A.ring(cox.chat.prog, c2 + 9.4, c2 + 11.6, 3);
  A.callout("still working", [A.xy(cox.chat.prog, 0.42, 0.5)[0], A.xy(cox.chat.prog, 0, 0.5)[1]], c2 + 9.6, c2 + 11.6);
  s.to(panel, { opacity: 0, scale: 0.7 }, c2 + 11.9, 0.3, "in");
  const msgXY = A.xy(cox.chat.scroll, 0.5, 0.42);
  A.callout("nothing added to the conversation", [msgXY[0] - 150, msgXY[1]], c2 + 12.4, c2 + 14.1);
  A.focus(null, 1, c2 + 13.5, 0.85);
  cox.dim("disp", c2 + 13.5, false);

  // ---------------------------------------------------------------- c3: what the turn changed
  cox.chat.stream(r2, busyEnd, 0.4);
  const diff = ui.code(s, A, [["fold", 9], [" ", 10, "d <- d[!is.na(d$ph.ecog), ]", true], [" ", 11, ""],
    ["-", 12, "fit <- coxph(Surv(time, event) ~ sex + ph.ecog, data = d)"], ["+", 12, "fit <- coxph(Surv(time, event) ~ sex + ph.ecog + age, data = d)"],
    [" ", 13, "summary(fit)", true], [" ", 14, ""], [" ", 15, "# Proportional-hazards check", true], [" ", 16, "cox.zph(fit)", true]],
    { stat: 'Latest change <span class="plus">+1</span> <span class="minus">−1</span>', pick: "Add age to the model and update the report" });
  const e = C.cox.ecog, ea = C.cox.ecog_age;
  const rdiff = ui.doc(s, A, `<h1>Cox model: sex, adjusted for ECOG and age</h1><h2>Results</h2>
    <table><thead><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr></thead><tbody>
    <tr><td>Female vs male</td><td>${C.hr(ea.sex)}</td><td>${C.pv(ea.sex.p)}</td></tr>
    <tr class="d-del"><td>ECOG, per point</td><td>${C.hr(e.ecog)}</td><td>${C.pv(e.ecog.p)}</td></tr>
    <tr class="d-add"><td>ECOG, per point</td><td>${C.hr(ea.ecog)}</td><td>${C.pv(ea.ecog.p)}</td></tr>
    <tr class="d-add"><td>Age, per year</td><td>${C.hr(ea.age)}</td><td>${ea.age.p.toFixed(2)}</td></tr></tbody></table>${ui.bars(92, 70)}`);
  cox.display.add("diff", diff.el); cox.display.add("rdiff", rdiff.el);
  // the report has the same switch: "Show changes" marks what the turn changed, or hides the marks
  const rRows = [...rdiff.inner.querySelectorAll("tr.d-del, tr.d-add")];
  const rToggle = h("label.cv-toggle", { html: `<span class="box">${ui.ico(ui.P.check).replace('class="wb-ico"', "")}</span> Show changes` });
  const rStat = h("span.cv-stat", { html: `Latest change <span class="plus">+${rRows.filter((r) => r.classList.contains("d-add")).length}</span> <span class="minus">−${rRows.filter((r) => r.classList.contains("d-del")).length}</span>` });
  rdiff.el.querySelector(".wb-doc").prepend(h("div.cv-bar", rToggle, rStat));
  cox.display.open("report", "report.md", 3);
  cox.display.open("diff", "cox.R", 3, busyEnd);
  s.fromTo(diff.el, { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, busyEnd, 0.4);
  A.focus([ui.AW, 0], 1.16, c3 + 0.5, 0.9);
  cox.dim("chat", c3 + 0.5);
  const dl = diff.lines.filter((l) => l.mk !== " ");
  dl.forEach((l, i) => s.fromTo(l.row, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, c3 + 1.2 + i * 0.5, 0.35));
  A.ring(diff.toggle, c3 + 0.9, c3 + 2.8, 4);
  // one step back: the version before this turn (there the whole file was new)
  cur.show(c3 + 2.6, [760, 300]);
  cur.to(diff.older, c3 + 2.7, 0.5);
  s.cls(diff.older, "hot", c3 + 3.1);
  cur.click(c3 + 3.3);
  cur.hide(c3 + 3.7);
  s.html(diff.stat, `New file <span class="plus">+${C.code.cox.length}</span> <span class="minus">−0</span>`, c3 + 3.3);
  s.text(diff.pick, "Hazard ratio for sex, adjusted for ECOG", c3 + 3.3);
  diff.lines.forEach((l) => {   // the earlier file: the old model line is there, the new one is not
    if (l.mk === "+") s.set(l.row, { show: 0 }, c3 + 3.3);
    else { s.cls(l.row, "del", c3 + 3.3, false); s.cls(l.row, "add", c3 + 3.3); }
    if (l.mk === "-") { s.text(l.row.querySelector(".cv-mk"), "+", c3 + 3.3); s.text(l.row.querySelector(".cv-ln"), String(l.ln), c3 + 3.3); }
  });
  s.set(diff.inner.querySelector(".cv-fold"), { opacity: 0 }, c3 + 3.3);
  cox.display.open("rdiff", "report.md", 3, c3 + 5.2);
  s.fromTo(rdiff.el, { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, c3 + 5.2, 0.4);
  rRows.forEach((r, i) => s.fromTo(r, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, c3 + 5.6 + i * 0.3, 0.35));
  // untick: the marks go and the clean report is left; tick again: they are back
  s.init(rToggle, { scale: 1 });
  cur.show(c3 + 6.7, [780, 300]);
  cur.to(rToggle, c3 + 6.8, 0.5, 0.07, 0.5);
  for (const [at, off] of [[c3 + 7.5, true], [c3 + 9.1, false]]) {
    cur.click(at);
    s.cls(rToggle, "off", at, off); s.cls(rdiff.inner, "clean", at, off); s.set(rStat, { opacity: off ? 0 : 1 }, at);
    s.fromTo(rToggle, { scale: 1.25 }, { scale: 1 }, at, 0.3, "back");
  }
  cur.hide(c3 + 9.7);
});
