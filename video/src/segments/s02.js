// Segment 02 — Separate tabs. Shared memory. Script: planning/scripts.md.
// 1 · in the Cox model tab, ask what another tab (KM by sex) found: the answer says where it comes from.
// 2 · a new tab "Report": one request, and the overall report is written from the open tabs, section by section,
//     each section naming its tab.
// Numbers: window.DATA.km, .cox, .attrition, .baseline (through V.C). Adapted from the old film's shots b3
// (scenes/tabs.js) and e1 (scenes/payoff.js).
V.css("s02", `
.s02-rep .doc-inner { max-width: 458px; margin: 0; padding-top: 11px; }   /* narrow enough for the square cut on phones */
.s02-rep h1 { font-size: 18.5px; margin-bottom: 2px; }
.s02-rep h2 { margin-top: 10px; }
.s02-rep h2 .src { float: none; margin-left: 8px; transform-origin: 0 50%; }
.s02-rep p { margin-bottom: 0; }
.s02-surv { display: flex; gap: 16px; align-items: flex-start; }
.s02-surv p { flex: 1 1 0; min-width: 0; }
.s02-surv [data-k="fig"] { flex: 0 0 232px; }
.s02-surv .km { margin: 2px 0 0; }
`);
V.scene("s02", (s) => {
  const ui = V.ui, C = V.C, { h } = V, D = C.D;
  const SRC = ["cohort", "baseline", "km", "cox"];                         // the tabs the report is written from
  const A = V.lung(s, { tabs: [...SRC, { id: "rep", title: "Report" }] });
  const cox = A.build.cox(true), ch = cox.chat, cur = A.cur;
  const name = (id) => A.tabs[id].title.textContent;
  A.activate("cox");

  // ---------------------------------------------------------------- 1 · ask this tab what another tab found
  const Q1 = `What was the median survival in ${name("km")}?`;
  const u2 = ch.user(Q1);
  const r2 = ch.bot(`<p>Median survival was <b>${C.M.median} days</b> for men and <b>${C.F.median} days</b> for women (log-rank ${C.pe(C.lr.p)}).</p>
    <p data-k="from" class="from">From <span class="ref">${name("km")} / summary.md</span></p>`);
  ch.stepsLine(r2, "2 steps, 7s");
  const sent1 = ch.send(u2, Q1, 0.7);                                      // typed, then sent at about 3.3
  const ANS = sent1 + 2.2, WIDE1 = ANS + 3.2;
  // zoom-in 1 of 2: close on the input while the words are typed; it eases out to the chat column and the tabs
  // for the answer (the same close-up, re-aimed), then all the way out
  A.typeCam(0.7, sent1, false);
  A.focus([0, 0], 1.25, ANS - 0.5, 0.9);
  cox.dim("disp", ANS - 0.5);
  A.focus(null, 1, WIDE1, 0.75);
  cox.dim("disp", WIDE1, false);
  ch.busy(sent1, ANS, [[0, "Looking at the open tabs"], [0.8, `Reading ${name("km")} / summary.md`]], 7);
  ch.stream(r2, ANS, 0.45);

  // ---------------------------------------------------------------- 2 · a tab for the report, written from the open tabs
  const P = ui.pane(s, A, "rep"), rc = P.chat;
  const greet = h("div.wb-greet", { style: "position:absolute;left:4px;top:20px", html: `<h4>What should this tab do?</h4>${ui.bars(100, 72)}` });
  rc.scroll.append(greet);
  const At = D.attrition, Ba = D.baseline, m = C.cox.ecog;
  const both = (a, b) => (a === b ? `${a} in both groups` : `${a} and ${b}`);   // men, women
  const sec = (id, title, body) => `<div class="sec"><h2>${title} <span class="src">from ${name(id)}</span></h2>${body}</div>`;
  const doc = ui.doc(s, A, `<h1>Overall report: survival by sex in advanced NSCLC</h1>` +
    sec("cohort", "Cohort", `<p>${C.num(D.n)} patients from ${C.num(At[0].n)} in the database, after ${At.length - 1} criteria.</p>`) +
    sec("baseline", "Baseline", `<p>${Ba[0].n} men, ${Ba[1].n} women. Median age: ${both(Ba[0].age_median, Ba[1].age_median)}.</p>`) +
    sec("km", "Survival by sex", `<div class="s02-surv"><p>Median survival ${C.M.median} days for men, ${C.F.median} for women; log-rank ${C.pe(C.lr.p).replace(/ /g, " ")}.</p><div data-k="fig"></div></div>`) +
    sec("cox", "Cox model", `<p>Adjusted for ECOG, women vs men: HR ${C.hr(m.sex)}, ${C.pe(m.sex.p)}.</p>`));
  doc.el.classList.add("s02-rep");
  doc.q('[data-k="fig"]').append(ui.km(D.km, { w: 520, h: 250 }));
  P.display.empty(); P.display.add("report", doc.el); P.display.open("empty", "", 0);
  const secs = [...doc.inner.querySelectorAll(".sec")], h1 = doc.q("h1");

  const NEW = ANS + 4.4;
  A.tabAppears("rep", NEW);
  cur.show(NEW - 0.85, [470, 240]);
  cur.to(A.newBtn, NEW - 0.7, 0.55, 0.5, 0.5, { without: [A.tabs.rep.el] });
  cur.click(NEW);
  A.activate("rep", NEW);
  cur.hide(NEW + 0.35);
  const Q2 = "Write the overall report from the open tabs";
  const u1 = rc.user(Q2);
  const r1 = rc.bot(`<p><b>Report written</b> from the ${SRC.length} open tabs.</p><p>Each section names the tab it comes from.</p>`);
  const STEP = 0.6;                                                        // one tab read after the other, then the report written
  const steps = [...SRC.map((id, i) => [i * STEP, `Reading ${name(id)} / summary.md`]), [SRC.length * STEP, "Writing report.md"]];
  rc.stepsLine(r1, `${steps.length} steps, 38s`);
  const sent2 = rc.send(u1, Q2, NEW + 0.6);
  const DONE = sent2 + SRC.length * STEP + 0.8;
  // zoom-in 2 of 2: close while the words are typed, and it stays for the line that names each tab as it is read
  A.focus([170, ui.AH - 60], 1.68, NEW + 0.35, 0.7);
  A.focus(null, 1, DONE - 0.9, 0.75);
  s.out(greet, sent2 - 0.1, { dur: 0.15 });
  rc.busy(sent2, DONE, steps, 38);
  P.display.open("report", "report.md", 1, DONE);
  s.fromTo(h1, { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, DONE, 0.35);
  const GAP = 0.85;
  secs.forEach((el, i) => {                                                // section by section; its tab's name pops beside the title
    const at = DONE + 0.4 + i * GAP;
    s.fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0 }, at, 0.4, "back");
    s.fromTo(el.querySelector(".src"), { scale: 0.3 }, { scale: 1 }, at + 0.2, 0.34, "back");
  });
  const LAST = DONE + 0.4 + (secs.length - 1) * GAP;
  rc.stream(r1, LAST + 0.7, 0.4);
  V.say(s, "Every result names its tab.", DONE + 1.3, Math.min(LAST + 3.4, s.dur - 1.2), "bl");

  A.done();                                                               // the chats work out their scrolling
  // where the answer comes from: the line is framed, and a curve runs from it to the tab it read
  const from = r2.querySelector('[data-k="from"]'), up = -ch.scrollEnd;
  const p = A.xy(from, 1, 0.5); p[0] += 4; p[1] += up;                    // from the frame's right edge, up along the splitter
  const q = A.xy(A.tabs.km.title, 0.5, 1.25);
  A.ring(from, ANS + 1.1, ANS + 3.0, 2, up);                              // highlight 1 of 1
  A.link(p, q, ANS + 1.4, WIDE1, 0.1);
});
