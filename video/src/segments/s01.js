// Segment 01 — A tab for every idea. Script: planning/scripts.md.
// One idea, one tab: a quick try in a tab of its own; close it when it does not help; "Recently closed" brings it
// back with its conversation and files. In the background, unexplained: the result is beside the conversation,
// and the menu item has a bin at its right (delete for good).
// Numbers: window.DATA.try_ecog01 and .cox (through V.C). Adapted from the old film's shot c1 (scenes/explore.js).
V.css("s01", `
.s01-item span { flex: 1 1 auto; min-width: 0; }
.s01-del { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 24px; border: 1px solid transparent; border-radius: 6px; color: var(--wb-faint); }
.wb-menu-item .s01-del .wb-ico { color: inherit; }
`);
V.scene("s01", (s) => {
  const ui = V.ui, C = V.C, { h } = V, T = C.T;
  const TRASH = ui.ico('<path d="M4 7h16M10 11v6M14 11v6"/><path d="m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>');   // app/wb/icons.py
  const TITLE = "Try: ECOG 0–1", Q = "Same model, ECOG 0–1 only";
  const A = V.lung(s, { tabs: ["cohort", "km", "cox", { id: "try", title: TITLE }] });
  A.build.cox(true);
  const cur = A.cur, tab = A.tabs.try;
  A.activate("cox");
  const pop = (el, at, o = "50% 50%") => { el.style.transformOrigin = o; return s.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, at, 0.32, "back"); };
  // where something is while a given tab is the active one (the active tab's title is bolder, so wider)
  const whenActive = (id, f) => {
    const was = A.order.map((k) => A.tabs[k].el.classList.contains("active"));
    A.order.forEach((k) => A.tabs[k].el.classList.toggle("active", k === id));
    const r = f();
    A.order.forEach((k, i) => A.tabs[k].el.classList.toggle("active", was[i]));
    return r;
  };

  // the tab for the quick try: an empty conversation, then one request and one small result
  const tr = ui.pane(s, A, "try"), ch = tr.chat;
  const greet = h("div.wb-greet", { style: "position:absolute;left:4px;top:20px", html: `<h4>What should this tab do?</h4>${ui.bars(100, 72)}` });
  ch.scroll.append(greet);
  const u1 = ch.user(Q);
  const r1 = ch.bot(`<p><b>HR ${C.hr(T)}</b>, n = ${C.num(T.n)}.</p><p>All patients: HR ${C.hr(C.cox.ecog.sex)}.</p>`);
  ch.stepsLine(r1, "3 steps, 14s");
  const doc = ui.doc(s, A, `<h1>Try: ECOG 0–1 only</h1>${ui.bars(90, 60)}<table><thead><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr></thead><tbody>
    <tr><td>Female vs male, ECOG 0–1</td><td>${C.hr(T)}</td><td>${C.pv(T.p)}</td></tr>
    <tr><td>Female vs male, all patients</td><td>${C.hr(C.cox.ecog.sex)}</td><td>${C.pv(C.cox.ecog.sex.p)}</td></tr></tbody></table>${ui.bars(84, 46)}`);
  tr.display.empty(); tr.display.add("report", doc.el); tr.display.open("empty", "", 0);

  // ---------------------------------------------------------------- 1 · an idea: a new tab for it
  const NEW = 1.3;
  A.tabAppears("try", NEW);
  cur.show(0.5, [430, 250]);
  cur.to(A.newBtn, 0.65, 0.55, 0.5, 0.5, { without: [tab.el] });
  cur.click(NEW);
  A.activate("try", NEW);
  cur.hide(NEW + 0.35);
  const sent = ch.send(u1, Q, NEW + 0.6);                                  // typed, then sent at about 3.6
  A.focus([170, ui.AH - 60], 1.7, NEW + 0.35, 0.7);                        // close while the words are typed (zoom-in 1 of 1)
  A.focus(null, 1, sent + 0.55, 0.75);
  s.out(greet, sent - 0.1, { dur: 0.15 });
  const DONE = sent + 2.3;
  ch.busy(sent, DONE, [[0, "Writing try.R"], [0.8, "Running R code"], [1.7, "Writing report.md"]], 14);
  ch.stream(r1, DONE, 0.45);
  tr.display.open("report", "report.md", 2, DONE);
  s.fromTo(tr.display.v.report, { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, DONE, 0.4);

  // ---------------------------------------------------------------- 2 · it did not help: close it
  const CLOSE = DONE + 3.2;
  const btnXY = A.xy(A.closedBtn, 0.5, 0.5);
  const ghost = (at, back) => {        // the tab's pane shrinks into "Recently closed" (and comes back out of it)
    const g = h("div.ghost", { style: { width: ui.AW - 24 + "px", height: ui.AH - 68 + "px" } });
    A.el.append(g);
    const big = { x: 12, y: 56, scale: 1, opacity: 0.85 }, small = { x: btnXY[0] - 20, y: btnXY[1] - 8, scale: 0.05, opacity: 0.2 };
    s.fromTo(g, back ? small : big, back ? big : small, at, 0.6, "io");
    s.to(g, { opacity: 0 }, at + 0.6, 0.15);
    s.init(g, { opacity: 0 });
  };
  cur.show(CLOSE - 0.9, [640, 210]);
  cur.move(whenActive("try", () => A.xy(tab.x)), CLOSE - 0.8, 0.6);
  cur.click(CLOSE);
  ghost(CLOSE, false);
  A.tabGone("try", CLOSE);
  A.activate("cox", CLOSE);
  pop(A.closedBtn, CLOSE + 0.55);
  cur.hide(CLOSE + 0.5);
  V.say(s, "Didn’t help? Close it.", CLOSE - 0.7, CLOSE + 2.7, "br");
  A.ring(A.closedBtn, CLOSE + 0.9, CLOSE + 2.7, 4);

  // ---------------------------------------------------------------- 3 · changed your mind: it comes back as it was
  const MENU = CLOSE + 4.0, BACK = MENU + 2.1;
  A.closedMenu.innerHTML = '<div class="wb-menu-note">Click a tab to restore it. Its files and conversation are kept. The bin deletes a tab for good.</div>' +
    `<div class="wb-menu-item s01-item">${ui.ICON.back}<span>${TITLE}</span><span class="s01-del">${TRASH}</span></div>`;
  A.closedMenu.style.transformOrigin = "100% 0";
  const item = A.closedMenu.querySelector(".wb-menu-item");
  cur.show(MENU - 0.75, [720, 230]);
  cur.to(A.closedBtn, MENU - 0.65, 0.55);
  cur.click(MENU);
  s.fromTo(A.closedMenu, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, MENU, 0.25, "back");
  cur.to(item, MENU + 0.55, 0.45, 0.35, 0.5);
  s.cls(item, "hover", MENU + 0.9);
  cur.click(BACK);
  s.set(A.closedMenu, { opacity: 0 }, BACK);
  s.to(A.closedBtn, { opacity: 0 }, BACK, 0.2);
  ghost(BACK, true);
  s.set(tab.el, { show: 1 }, BACK + 0.2); pop(tab.el, BACK + 0.2, "50% 100%");
  A.activate("try", BACK + 0.5);
  cur.hide(BACK + 0.4);
  V.say(s, "Changed your mind? It’s still there.", BACK + 0.4, Math.min(BACK + 4.2, s.dur - 1.2), "br");
  A.done();                                                               // last: the chats work out their scrolling
});
