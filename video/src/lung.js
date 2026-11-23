// The example session "Lung cancer survival": the app window with its tabs in a given state.
// Acts build their own copy and say which tabs exist; a tab is either finished ("past") or still to be worked in.
V.lung = function (s, o = {}) {
  const ui = V.ui, C = V.C, { h } = V;
  const TITLES = { lit: "Literature", trial: "Trial " + C.TR.nct, cohort: "Cohort", baseline: "Baseline", km: "KM by sex", cox: "Cox model", data: "Data check" };
  const Q = { lit: "Find papers on sex differences in lung cancer survival", trial: `Summarize the design of ${C.TR.nct}`, km: "Kaplan-Meier curves by sex, log-rank test",
    cohort: "Pull advanced NSCLC patients, first-line treated", baseline: "Baseline table by sex" };
  const A = ui.app(s, { session: o.session || "NSCLC real-world study", tabs: (o.tabs || ["cohort", "baseline", "km"]).map((id) => (typeof id === "string" ? { id, title: TITLES[id] } : id)) });
  const greeting = () => h("div.wb-greet", { style: "position:absolute;left:4px;top:20px", html: `<h4>What should this tab do?</h4>${ui.bars(100, 72)}` });

  // a tab whose work is a document: a literature search, or a trial looked up by its ID
  const docTab = (id, reply, report, file, steps, opts) => (past = true) => {
    const P = ui.pane(s, A, id), ch = P.chat, greet = greeting();
    ch.scroll.append(greet);
    const u1 = ch.user(Q[id]), b1 = ch.bot(reply);
    ch.stepsLine(b1, steps);
    const doc = ui.doc(s, A, report, opts || {});
    P.display.empty(); P.display.add("report", doc.el);
    if (past) { s.hide(greet); ch.past(u1); ch.past(b1); P.display.open("report", file, 1); } else P.display.open("empty", "", 0);
    return Object.assign(P, { greet, u1, b1, doc, q: Q[id] });
  };
  A.build = {
    lit: docTab("lit", C.html.litReply, C.html.litReport, "literature.md", "4 steps, 26s", o.litDoc),
    trial: docTab("trial", C.html.trialReply, C.html.trialReport, "trial.md", "3 steps, 31s"),
    cohort: docTab("cohort", C.html.cohortReply, C.html.cohortReport, "cohort.md", "5 steps, 44s"),
    baseline: docTab("baseline", C.html.baselineReply, C.html.baselineReport, "baseline.md", "3 steps, 21s"),
    data(past = true) {
      const P = ui.pane(s, A, "data"), ch = P.chat;
      const u1 = ch.user("Describe the data: sample size, variables, missing values");
      const b1 = ch.bot(C.html.dataReply);
      ch.stepsLine(b1, "3 steps, 15s");
      const doc = ui.doc(s, A, C.html.dataReport);
      P.display.add("report", doc.el);
      P.display.open("report", "report.md", 2);
      if (past) { ch.past(u1); ch.past(b1); }
      return Object.assign(P, { u1, b1, doc });
    },
    km(past = true) {
      const P = ui.pane(s, A, "km"), ch = P.chat;
      const greet = greeting();
      ch.scroll.append(greet);
      const u1 = ch.user(Q.km);
      const b1 = ch.bot(C.html.kmReply);
      ch.stepsLine(b1, "6 steps, 48s");
      const doc = ui.doc(s, A, C.html.kmReport, o.kmDoc || {});
      const fig = ui.km(C.D.km);
      doc.q('[data-k="fig"]').append(fig);
      const code = ui.code(s, A, C.code.km.map((l, i) => [" ", i + 1, l, i > 0 && !/survfit|survdiff/.test(l)]), { plain: true, stat: '<span class="muted">New file, not changed since it was created</span>' });
      P.display.empty();
      P.display.add("report", doc.el);
      P.display.add("code", code.el);
      const item = P.display.menu([["This tab", ["report.md", "km_by_sex.R"]], ["figures", ["km_by_sex.png"]], ["tables", ["km_by_sex_summary.csv"]]], "report.md", ["report.md", "km_by_sex.R", "km_by_sex.png", "km_by_sex_summary.csv"]);
      if (past) { s.hide(greet); ch.past(u1); ch.past(b1); P.display.open("report", "report.md", 4); }
      else P.display.open("empty", "", 0);
      return Object.assign(P, { greet, u1, b1, doc, fig, code, item, q: Q.km });
    },
    cox(past = true, age = false) {
      const P = ui.pane(s, A, "cox"), ch = P.chat;
      const greet = greeting();
      ch.scroll.append(greet);
      const u1 = ch.user("Hazard ratio for sex, adjusted for ECOG");
      const b1 = ch.bot(C.html.coxReply);
      ch.stepsLine(b1, "5 steps, 39s");
      const doc = ui.doc(s, A, C.html.coxReport(age));
      const code = ui.code(s, A, C.code.cox.map((l, i) => [" ", i + 1, l, i > 0 && !/coxph/.test(l)]), { plain: true, stat: '<span class="muted">New file, not changed since it was created</span>' });
      P.display.empty();
      P.display.add("report", doc.el);
      P.display.add("code", code.el);
      if (past) { s.hide(greet); ch.past(u1); ch.past(b1); P.display.open("report", "report.md", 3); }
      else P.display.open("empty", "", 0);
      return Object.assign(P, { greet, u1, b1, doc, code });
    },
  };
  // the window arrives
  A.enter = () => {};   // the window comes and goes with the title cards (ui.stageFx)
  // click a tab: pointer goes there, then the tab switches
  A.clickTab = (id, at, o2) => { A.cur.to(A.tabs[id].title, at - 0.5, 0.45, 0.5, 0.5, o2); A.cur.click(at); A.activate(id, at); return at; };
  // film devices -------------------------------------------------------------
  // a ring around something (app coordinates; measured now)
  A.ring = (target, at, until, pad = 5, dy = 0) => {
    const [x, y] = A.xy(target, 0, 0), r = target.getBoundingClientRect();
    const el = h("div.ring", { style: { left: x - pad + "px", top: y - pad + dy + "px", width: r.width + 2 * pad + "px", height: r.height + 2 * pad + "px" } });
    A.el.append(el);
    s.fromTo(el, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1 }, at, 0.3, "back");
    if (until) s.to(el, { opacity: 0 }, until, 0.25);
    return el;
  };
  // a small dark label at a point
  A.callout = (text, xy, at, until, dx = 0) => {
    const el = h("div.callout", { style: { left: xy[0] + dx + "px", top: xy[1] - 15 + "px" } }, text);
    A.el.append(el);
    s.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, at, 0.3, "back");
    if (until) s.to(el, { opacity: 0 }, until, 0.2);
    return el;
  };
  // a curved line from one point to another, drawn on
  A.link = (p, q, at, until, bend = 0.35) => {
    const mx = (p[0] + q[0]) / 2 + (q[1] - p[1]) * bend, my = (p[1] + q[1]) / 2 - (q[0] - p[0]) * bend;
    const svg = V.frag(`<svg style="position:absolute;inset:0;z-index:3800;overflow:visible" width="${ui.AW}" height="${ui.AH}"><path pathLength="1" d="M${p[0]} ${p[1]}Q${mx} ${my} ${q[0]} ${q[1]}" fill="none" stroke="#d97757" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1"/><circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#d97757"/></svg>`);
    A.el.append(svg);
    const [path, dot] = svg.children;
    s.fromTo(path, { draw: 0 }, { draw: 1 }, at, 0.6, "io");
    s.fromTo(dot, { opacity: 0 }, { opacity: 1 }, at + 0.5, 0.15);
    if (until) s.to(svg, { opacity: 0 }, until, 0.25);
    return svg;
  };
  // the camera goes close while a prompt is typed, so the words can be read, then pulls back
  A.typeCam = (t0, t1, back = true, zoom = 1.6) => { A.focus([170, ui.AH - 60], zoom, t0 - 0.25, 0.7); if (back) A.focus(null, 1, t1 + 0.55, 0.75); };
  // something that flies from p to q (app coordinates) and lands
  A.fly = (html, p, q, at, dur = 0.7, o2 = {}) => {
    const el = h("div." + (o2.cls || "fly"), { html, style: o2.style || {} });
    A.el.append(el);
    s.cue("fly", at, dur);
    s.fromTo(el, { x: p[0], y: p[1], scale: o2.s0 || 1, opacity: 0 }, { x: p[0], y: p[1], scale: o2.s0 || 1, opacity: 1 }, at - 0.12, 0.12);
    s.to(el, { x: q[0], y: q[1], scale: o2.s1 || 1 }, at, dur, "io");
    s.to(el, { opacity: 0 }, at + dur - 0.12, 0.14);
    return el;
  };
  return A;
};
