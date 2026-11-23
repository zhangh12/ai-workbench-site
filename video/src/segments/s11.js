// Segment 11 — Teach it your way (Skills: add from the library; the reply says which skill it followed).
// Script: planning/scripts.md. The app: docs/design.md 6t, app/wb/skillsui.py, app/wb/claude.py (skills_note).
// The Skills dialog is redrawn from the app's own labels. Its two real pages are shown as they are: the four
// built-in skills are on "From the library" (Add to this session); "Automatic | Only when named" is on the list
// of the session's skills (after "Back to Skills").
V.css("s11", `
.s11-dlg { position: absolute; left: 180px; top: 19px; width: 640px; height: 440px; z-index: 4150; display: flex; flex-direction: column; border-radius: 14px; background: #fff; box-shadow: var(--wb-shadow-pop); font-size: 13px; line-height: 1.45; transform-origin: 50% 50%; }
.s11-hd { flex: 0 0 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 16px; border-bottom: 1.5px solid var(--wb-line); }
.s11-hd b { font-size: 15.5px; }
.s11-hd span { display: inline-flex; color: var(--wb-faint); font-size: 15px; }
.s11-pages { position: relative; flex: 1 1 auto; min-height: 0; }
.s11-page { position: absolute; inset: 0; padding: 9px 16px 0; overflow: hidden; }
.s11-foot { position: relative; flex: 0 0 44px; border-top: 1.5px solid var(--wb-line); }
.s11-fpage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 0 16px; }
.s11-note { margin: 0 0 8px; color: var(--wb-slate); font-size: 12px; line-height: 1.45; }
.s11-note .bar { display: inline-block; height: 7px; margin: 0 0 0 6px; vertical-align: 1px; }
.s11-list { display: flex; flex-direction: column; gap: 6px; }
.s11-row { padding: 6px 12px 8px; border: 1.5px solid var(--wb-line); border-radius: 10px; background: #fff; }
.s11-row b { font: 600 12.5px/1.4 var(--wb-mono); margin-right: 8px; }
.s11-tag { display: inline-block; padding: 0 8px; border-radius: 999px; background: var(--wb-mist); color: var(--wb-slate); font-size: 10.5px; line-height: 17px; white-space: nowrap; }
.s11-tag.ok { background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-weight: 600; line-height: 22px; }
.s11-desc { margin: 1px 0 6px; color: var(--wb-slate); font-size: 11.5px; line-height: 1.45; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s11-acts { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; min-height: 22px; }
.s11-btn { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 7px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; background: var(--wb-paper); color: var(--wb-ink); font-size: 11.5px; font-weight: 500; white-space: nowrap; }
.s11-btn .wb-ico { color: var(--wb-slate); font-size: 12px; }
.s11-btn.primary { border-color: var(--wb-accent); background: var(--wb-accent); color: #fff; font-weight: 600; }
.s11-btn.quiet { border-color: transparent; background: transparent; color: var(--wb-slate); }
.s11-btn.big { height: 28px; padding: 0 13px; font-size: 12.5px; border-radius: 8px; }
.s11-seg { display: inline-flex; height: 22px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; overflow: hidden; margin-right: 3px; }
.s11-seg i { display: inline-flex; align-items: center; padding: 0 8px; font-style: normal; font-size: 11.5px; color: var(--wb-slate); background: var(--wb-paper); white-space: nowrap; }
.s11-seg i + i { border-left: 1.5px solid var(--wb-line-strong); }
.s11-seg i.on { background: var(--wb-accent); color: #fff; font-weight: 600; }
.s11-add { margin-top: 10px; padding-top: 9px; border-top: 1.5px solid var(--wb-line); }
.s11-add > b { display: block; font-size: 12.5px; margin-bottom: 6px; }
.s11-used { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 999px; background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-size: 11.5px; line-height: 1.5; white-space: nowrap; }
.s11-used code { background: transparent !important; padding: 0 !important; color: inherit; font-weight: 600; font-size: 1em !important; }
.s11-risk { position: relative; height: 52px; margin: -4px 0 6px; font-size: 11.5px; line-height: 16px; color: var(--wb-slate); font-variant-numeric: tabular-nums; }
.s11-risk span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
.s11-risk b { position: absolute; left: 0; font-weight: 500; }
.s11-risk i { position: absolute; left: 0; width: 14px; height: 2.4px; border-radius: 2px; }
.s11-doc h1 { margin-bottom: 4px; }
.s11-doc .km { margin: 0 auto; }
.s11-cap { margin: 0 0 12px !important; font-size: 12.5px; }
`);

V.scene("s11", (s) => {
  const ui = V.ui, C = V.C, { h } = V;
  // the built-in skills (app/skills/<name>/SKILL.md): the first sentence of each description, as it is written there
  const SKILLS = [
    ["cox-report", "Cox proportional hazards regression reported as hazard ratios with 95% confidence intervals, including a check of the proportional hazards assumption, in a three-line table."],
    ["km-logrank", "Kaplan-Meier survival curves by group with a number-at-risk table, median survival with 95% CI, and a log-rank test."],
    ["report-style", "House style for written analysis reports: structure, numbering of tables and figures, number and p-value formatting, wording."],
    ["table-one", "Build a baseline characteristics table (Table 1) by treatment arm or another grouping, with summary statistics for continuous and categorical variables, saved as a Word table."],
  ];
  const ICO = {   // app/wb/icons.py
    book: ui.ico('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7h6"/>'),
    pencil: ui.ico('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>'),
  };

  const A = V.lung(s, { tabs: ["cohort", "baseline", "km"] });
  const km = A.build.km(false), ch = km.chat, cur = A.cur;
  A.activate("km");

  // ---------------------------------------------------------------- the Skills dialog (session menu -> Skills…)
  const px = "s11";
  const btn = (label, cls = "", icon = "") => h(`span.${px}-btn` + (cls ? "." + cls : ""), { html: icon + `<span>${label}</span>` });
  const veil = h("div.modal-veil"), pagesEl = h(`div.${px}-pages`), foot = h(`div.${px}-foot`);
  const dlg = h(`div.${px}-dlg`, h(`div.${px}-hd`, h("b", "Skills"), h("span", { html: ui.ICON.x })), pagesEl, foot);
  A.el.append(veil, dlg);
  const pages = [];
  const page = (body, footKids) => { const P = { b: h(`div.${px}-page`, body), f: h(`div.${px}-fpage`, footKids) }; pagesEl.append(P.b); foot.append(P.f); pages.push(P); return P; };
  const showPage = (P, at) => pages.forEach((q) => (at <= 0 ? s.init([q.b, q.f], { opacity: q === P ? 1 : 0 }) : s.set([q.b, q.f], { opacity: q === P ? 1 : 0 }, at)));

  // page "From the library": every skill of the library, each with "Add to this session"
  const libRows = {};
  const libList = h(`div.${px}-list`, SKILLS.map(([name, desc]) => {
    const add = btn("Add to this session", "primary"), added = h(`span.${px}-tag.ok`, "Added");
    s.init(added, { show: 0 });
    libRows[name] = { add, added };
    return h(`div.${px}-row`, h("div", h("b", name), h(`span.${px}-tag`, "Built in")), h(`div.${px}-desc`, desc), h(`div.${px}-acts`, add, added));
  }));
  const back = btn("Back to Skills", "big");
  const lib = page(libList, back);

  // page: the session's skills, each with Automatic | Only when named
  const row = (name, from, desc) => h(`div.${px}-row`, h("div", h("b", name), h(`span.${px}-tag`, from)), h(`div.${px}-desc`, desc),
    h(`div.${px}-acts`, h(`span.${px}-seg`, h("i.on", "Automatic"), h("i", "Only when named")), btn("Edit", "", ICO.pencil), btn("Improve with Claude", "", ui.ICON.bubble),
      btn("Save to my library"), btn("Remove", "quiet")));
  const mine = ["km-logrank", "report-style"];
  const close = btn("Close", "big");
  const list = page([
    h(`p.${px}-note`, { html: "A skill is a written method Claude follows for a kind of task, for example how you make a Table 1." + ui.bars(34) }),
    h(`div.${px}-list`, SKILLS.filter(([n]) => mine.includes(n)).map(([n, d]) => row(n, "Built in", d))),
    h(`div.${px}-add`, h("b", "Add a skill"), h(`div.${px}-acts`, btn("From the library", "", ICO.book), btn("From a file", "", ui.ICON.clip), btn("From a tab's work", "", ICO.pencil), btn("With Claude", "", ui.ICON.bubble))),
  ], close);

  // first frame: the library page is open
  showPage(lib, 0);
  cur.show(0.45, [600, 330]);
  const addSkill = (name, at) => {
    const r = libRows[name];
    cur.to(r.add, at - 0.6, 0.5); cur.click(at);
    s.set(r.add, { show: 0 }, at); s.set(r.added, { show: 1 }, at);
    s.fromTo(r.added, { scale: 1.3 }, { scale: 1 }, at, 0.3, "back");
  };
  addSkill("km-logrank", 1.3);
  addSkill("report-style", 2.4);
  cur.to(back, 2.8, 0.55); cur.click(3.5);
  showPage(list, 3.5);
  s.fromTo(list.b, { x: 14 }, { x: 0 }, 3.5, 0.3);
  cur.to(close, 4.9, 0.4); cur.click(5.5);
  s.to(dlg, { opacity: 0, scale: 0.94 }, 5.5, 0.22, "in"); s.to(veil, { opacity: 0 }, 5.5, 0.25);
  cur.hide(5.7);

  // ---------------------------------------------------------------- the request, in the tab "KM by sex"
  const ASK = "Compare survival by sex";
  km.u1.textContent = ASK;
  const used = h(`div.${px}-used`, { html: "Followed the skill <code>km-logrank</code> (this session’s Skills)" });   // claude.py skills_note
  km.b1.querySelector("details").before(used);
  // the report, laid out as the skill asks: the curves with the number at risk under them (DATA.km.at_risk), then the table
  const R = C.D.km, fig = ui.km(R, { w: 640, h: 308 });
  const tx = (t) => ((58 + (t / (R.risk_times[R.risk_times.length - 1] * 1.05)) * (640 - 58 - 16)) / 640) * 100;   // where ui.km puts a time
  const risk = h(`div.${px}-risk`, h("b", "Number at risk"), ["Male", "Female"].map((g, k) => [h("i", { style: { top: 23 + k * 16 + "px", background: ui.COLS[g] } }),
    R.at_risk[g].map((n, i) => h("span", { style: { left: tx(R.risk_times[i]) + "%", top: 16 + k * 16 + "px" } }, String(n)))]));
  km.doc.inner.classList.add(`${px}-doc`);
  km.doc.inner.replaceChildren(h("h1", "Survival by sex: advanced NSCLC, first line"), fig, risk,
    h(`p.${px}-cap`, { html: "<b>Figure 1.</b> Kaplan-Meier curves by sex, with the number at risk." }), h("div", { html: `<p class="${px}-cap" style="margin-bottom:0 !important"><b>Table 1.</b> Median survival by sex.</p>` + C.kmTable + ui.bars(90, 62) }));

  const T0 = 6.1;
  A.typeCam(T0, T0 + ASK.length / 19);
  const sent = ch.send(km.u1, ASK, T0);
  s.set(km.greet, { opacity: 0 }, sent);
  const END = sent + 2.7;
  ch.busy(sent, END, [[0, "Using the skill km-logrank"], [0.9, "Running R code"], [1.9, "Writing report.md"]], 48);
  km.display.open("report", "report.md", 4, END - 0.5);
  s.fromTo(km.doc.el, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, END - 0.5, 0.35);
  ui.kmDraw(s, fig, END - 0.3, 1.2);
  const said = ch.stream(km.b1, END, 0.3);
  A.done();

  // the line under the reply: which skill it followed
  const [ux, uy] = A.xy(used), dy = -(ch.scrollEnd || 0);
  A.focus([ux + 60, uy + dy - 20], 1.4, said + 0.3, 0.9);
  A.ring(used, said + 1.3, said + 3.3, 4, dy);
  V.say(s, "It says which skill it followed.", said + 1.4, said + 4.2, "br");
  A.focus(null, 1, said + 3.9, 0.9);
});
