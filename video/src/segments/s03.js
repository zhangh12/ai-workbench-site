// Segment 03 — It stays out of your way. Script: planning/scripts.md.
// Four small things in one take, in the Cox model tab's chat; none is emphasized more than the others:
//   1  while the AI works there is one quiet line above the message box (the only highlight)
//   2  the user adds a thought while it works
//   3  the AI asks when a choice matters: one click answers
//   4  when it is done, the steps are one folded line under the reply
// Numbers: window.DATA.cox.ecog_age through V.C (nothing typed by hand).
V.css("s03", `
.s03-ask { bottom: 128px; transform-origin: 50% 100%; }
.s03-ask .ask-opt { padding: 6px 11px; }
.wb-progress.s03-wait .txt { color: var(--wb-warn); }
.wb-progress.s03-wait .spin { border-color: var(--wb-warn-tint); border-top-color: var(--wb-warn); }
.s03-math { margin: 2px 0 8px; }
.s03-math .katex-display { margin: 0; text-align: left; }
.s03-math .katex-display > .katex { text-align: left; }
`);
V.scene("s03", (s) => {
  const ui = V.ui, C = V.C, { h } = V;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"] });
  const cox = A.build.cox(true), ch = cox.chat, m = C.cox.ecog_age;
  A.activate("cox");

  // the report as it is after the request (a second view of the same file)
  const doc2 = ui.doc(s, A, C.html.coxReport(true));
  doc2.q('[data-k="age-row"]').lastElementChild.textContent = C.pv(m.age.p);   // content.js prints this cell with two decimals ("0.00")
  cox.display.add("report2", doc2.el);

  // times
  const SEND = 0.6, ADD = 3.9, ASK = 7.5, PICK = 10.3, END = 13.7, BACK = 17.0;

  // first frame: close on the chat; the request is written, not sent yet
  A.focus([0, ui.AH], 1.2, 0, 0);                             // the chat column is then 48% of the picture: the phone's square
  cox.dim("disp", 0, true, 0);
  const Q = "Add age to the model and update the report";
  s.init(ch.txt, { text: Q });
  const u2 = ch.user(Q);
  ch.clear(SEND); ch.show(u2, SEND);

  // 1  one quiet line while it works: the step, its number, the seconds
  ch.busy(SEND, END, [[0, "Editing cox.R"], [2.1, "Running R code"], [ASK - SEND, "Waiting for your answer"],
    [PICK + 0.45 - SEND, "Running R code"], [PICK + 2.0 - SEND, "Editing report.md"]], 41);
  A.ring(ch.prog, SEND + 0.7, SEND + 2.7, 3);

  // 2  a thought added while it works: it goes into the same turn
  const added = "also report the p-value for age";
  const r2 = ch.bot(`<blockquote><b>You added:</b> ${added}</blockquote>
    <p><b>Age added, per year.</b> The report is updated.</p>
    <div class="s03-math">${ui.tex("h(t \\mid x) = h_0(t)\\,\\exp(\\beta_1\\,\\text{female} + \\beta_2\\,\\text{ECOG} + \\beta_3\\,\\text{age})", true)}</div>
    <p>Age, per year: HR ${C.hr(m.age)}, ${C.pe(m.age.p)}.<br>Female vs male: HR ${C.hr(m.sex)}.</p>`);
  ch.stepsLine(r2, "5 steps, 41s");
  const typed = ch.type(added, ADD);
  const sent = typed + 0.4;
  ch.clear(sent);
  s.init(r2, { opacity: 1 });
  [...r2.children].forEach((k, i) => {
    const at = i === 0 ? sent : END + (i - 1) * 0.35;
    s.fromTo(k, { opacity: 0, y: 8 }, { opacity: 1, y: 0 }, at, 0.25);
    ch.events.push({ el: k, at });
  });

  // 3  a choice that matters: the AI asks, one click answers
  const opt = (l, d) => h("div.ask-opt", h("span.l", l), h("span.s", d));
  const opts = [opt("Continuous, per year (recommended)", "One hazard ratio for each year of age"),
    opt("Per decade", "The same model, on a larger step"), opt("Age groups", "Categories instead of a straight line")];
  const ask = h("div.wb-ask-card.s03-ask", h("div.ask-title", "How should age enter the model?"), h("div.ask-opts", opts));
  cox.chatEl.append(ask);
  s.hide(ask);
  s.fromTo(ask, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, ASK, 0.32, "back");
  s.cls(ch.prog, "s03-wait", ASK, true); s.cls(ch.prog, "s03-wait", PICK + 0.45, false);
  const cur = A.cur;
  cur.show(PICK - 1.5, [300, 458]);
  cur.to(opts[0], PICK - 1.4, 0.7, 0.7, 0.55);
  s.cls(opts[0], "on", PICK);
  cur.click(PICK);
  s.to(ask, { opacity: 0, scale: 0.8 }, PICK + 0.45, 0.25, "in");
  cur.hide(PICK + 0.6);

  // 4  done: the reply, and the steps folded into one line; the report on the right is the new one
  cox.display.open("report2", "report.md", 3, END);
  A.focus(null, 1, BACK, 0.9);
  cox.dim("disp", BACK, false);
  A.done();
});
