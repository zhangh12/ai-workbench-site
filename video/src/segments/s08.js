// Segment 08 — Pick up where you left off. Script: planning/scripts.md.
// The home page (the app's own: "New session" on the left, "Recent sessions" on the right); one click on the session;
// the workspace is back as it was left: five tabs (one locked), the conversation, the report and its figure.
// Then "Where were we?" and the reply says where things stand.
// Numbers: window.DATA through V.C (km.table, cox.ecog). The "last opened" stamp is the time the example's analysis
// was really run (DATA.generated), written the way the app writes times older than a day.
V.css("s08", `
.s08-home { position: absolute; inset: 0; z-index: 4100; background: var(--wb-paper); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr); column-gap: 60px; align-items: center; padding: 0 60px; }
.s08-set { position: absolute; top: 14px; right: 20px; display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border: 1px solid var(--wb-line); border-radius: 6px; color: var(--wb-slate); font-size: 12px; }
.s08-set .wb-ico { width: 13px; height: 13px; }
.s08-brand { display: flex; align-items: center; gap: 9px; font-size: 14.5px; font-weight: 600; margin-bottom: 12px; }
.s08-brand .wb-logo { width: 24px; height: 24px; }
.s08-home h1 { font-size: 25px; line-height: 1.25; font-weight: 600; margin: 0 0 8px; }
.s08-lead { width: 86%; margin-bottom: 20px; }
.s08-home h2 { font-size: 13.5px; font-weight: 600; margin: 0 0 3px; }
.s08-form .bar { margin: 6px 0 12px; }
.s08-form label { display: block; font-size: 12px; font-weight: 500; margin: 0 0 3px; }
.s08-in { height: 31px; display: flex; align-items: center; padding: 0 10px; border: 1px solid var(--wb-line-strong); border-radius: 8px; color: var(--wb-faint); font-size: 12.5px; margin-bottom: 10px; white-space: nowrap; overflow: hidden; }
.s08-path { display: flex; gap: 8px; }
.s08-path .s08-in { flex: 1; font-size: 11px; }
.s08-btn { height: 31px; display: inline-flex; align-items: center; padding: 0 12px; border: 1px solid var(--wb-line-strong); border-radius: 8px; font-size: 12.5px; font-weight: 500; white-space: nowrap; }
.s08-btn.primary { background: var(--wb-accent); border-color: var(--wb-accent); color: #fff; margin-top: 2px; }
.s08-list { margin-top: 9px; border-top: 1px solid var(--wb-line); }
.s08-row { padding: 10px 10px; border-bottom: 1px solid var(--wb-line); }
.s08-row.hot { background: var(--wb-mist); }
.s08-row .top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.s08-row .nm { font-weight: 600; font-size: 14px; }
.s08-row .when { color: var(--wb-faint); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.s08-row .tabs { display: inline-block; margin-top: 2px; color: var(--wb-slate); font-size: 12.5px; }
.s08-row .pth { color: var(--wb-faint); font-size: 11px; }
.s08-row .bar { margin: 9px 0 5px; }
.s08-row .bar + .bar { height: 6px; margin: 7px 0 3px; }
.s08-row .when .bar { width: 84px; margin: 0; }
.s08-quiet { display: inline-block; margin: 10px 0 0 2px; color: var(--wb-slate); font-size: 12.5px; }
`);
V.scene("s08", (s) => {
  const ui = V.ui, C = V.C, { h } = V, D = C.D;
  const A = V.lung(s, { tabs: [{ id: "cohort", title: "Cohort", locked: true }, "baseline", "km", "cox", "lit"] });
  const km = A.build.km(true), ch = km.chat;
  A.activate("km");
  // the report is where it was left: scrolled to the results and the figure
  km.doc.scrollTo(km.fig.getBoundingClientRect().bottom - km.doc.inner.getBoundingClientRect().top + 10 - km.doc.el.querySelector(".doc-scroll").clientHeight, 0);
  const titles = A.order.map((id) => A.tabs[id].title.textContent);

  // ---- the home page, as the app draws it (secondary text as bars)
  const bar = (w) => h("i.bar", { style: `width:${w}` });
  const row = (name, when, tabs, path) => h("div.s08-row", h("div.top", h("span.nm", name), h("span.when", when || bar("100%"))),
    typeof tabs === "string" ? h("span.tabs", tabs) : bar(tabs + "%"), path ? h("div.pth", path) : bar("46%"));
  const main = row("NSCLC real-world study", D.generated, titles.join(", "), "~/ai-workbench-sessions/NSCLC real-world study");
  const home = h("div.s08-home",
    h("div.s08-set", { html: `${ui.ICON.gear}<span>Settings</span>` }),
    h("div", h("div.s08-brand", { html: `${ui.LOGO}<span>AI Workbench</span>` }), h("h1", "Data analysis with Claude"), h("div.s08-lead", bar("100%"), bar("96%"), bar("58%")),
      h("div.s08-form", h("h2", "New session"), bar("72%"),
        h("label", "Name"), h("div.s08-in", "e.g. Lung cancer survival"),
        h("label", "Folder"), h("div.s08-path", h("div.s08-in", "Leave empty to use ~/ai-workbench-sessions/<name>"), h("span.s08-btn", "Browse…")),
        h("span.s08-btn.primary", "Create and open"))),
    h("div", h("h2", "Recent sessions"), h("div.s08-list", main, row("Vaccine trials", null, 30), row("Literature review", null, 44)),
      h("span.s08-quiet", "Not listed? Open a session folder…")));
  A.el.append(home);
  const tabsLine = main.querySelector(".tabs");

  // ---- a week later: the session is in the list, with its tabs
  const OPEN = 2.7;
  V.say(s, "A week later.", 0.45, OPEN - 0.1, "br");
  A.ring(tabsLine, 0.6, 2.3, 4).style.zIndex = 4200;
  const cur = A.cur;
  cur.show(1.3, [610, 392]);
  cur.to(main, 1.5, 0.75, 0.5, 0.5);
  s.cls(main, "hot", 2.1);
  cur.click(OPEN);
  cur.hide(OPEN + 0.35);

  // ---- the workspace opens: every tab back in its place, the conversation, the report and the figure
  s.to(home, { opacity: 0 }, OPEN, 0.3, "in");
  A.order.forEach((id, i) => { const el = A.tabs[id].el; s.fromTo(el, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }, OPEN + 0.3 + i * 0.16, 0.34, "back"); });
  s.fromTo(km.chat.inner, { opacity: 0 }, { opacity: 1 }, OPEN + 0.45, 0.4);
  s.fromTo(km.display.host, { opacity: 0 }, { opacity: 1 }, OPEN + 0.7, 0.45);

  // ---- "Where were we?"
  const ASK = 5.4;
  const q = ch.user("Where were we?");
  const a = ch.bot(`<p><b>${titles.slice(0, 3).join(", ").replace(/, ([^,]*)$/, " and $1")} are done.</b></p>
    <p>Here: women lived longer, median ${C.F.median} vs ${C.M.median} days.</p>
    <p>Last, in Cox model: HR ${C.hr(C.cox.ecog.sex)} for women, adjusted for ECOG.</p>
    <p><b>Still open:</b> adding age to the model.</p>`);
  ch.stepsLine(a, "2 steps, 8s");
  const sent = ch.send(q, "Where were we?", ASK);
  const END = sent + 1.9;
  ch.busy(sent, END, [[0, "Reading worklog.md"], [1.0, "Reading tabs/Cox model/summary.md"]], 8);
  ch.stream(a, END, 0.4);
  A.done();
});
