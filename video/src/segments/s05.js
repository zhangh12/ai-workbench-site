// Segment 05 — Point at it. Script: planning/scripts.md.
// In the report of "KM by sex": select a sentence, Comment, save; "Ask Claude" on the card: the AI rewrites exactly
// that sentence and answers on the card ("Text rewritten"). In the chat, "#1" means that comment. "Quote in chat"
// puts a reference to the selected words into the message box.
// In the background, without emphasis: after the AI's edit the figure in the report is a new one (the same curves,
// with both medians marked); the AI's reply names the R file it ran.
// Every number is read from window.DATA through V.C (medians, their difference in days and months).
V.css("s05", `
.s05-fig { max-width: 300px; margin: 0 auto 10px; }
.s05-fig .km { margin: 4px auto; }
.s05-med { fill: none; stroke-width: 1.6; stroke-dasharray: 5 4; }
.shiny-chat-message.s05-reply table { font-size: 12.5px; }
.shiny-chat-message.s05-reply th:last-child { white-space: normal; }
`);

V.scene("s05", (s) => {
  const ui = V.ui, C = V.C, { h, frag, esc } = V;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"], kmDoc: { comments: true } });
  const km = A.build.km(true), ch = km.chat, doc = km.doc, cur = A.cur;
  km.el.style.setProperty("--l", 30);
  A.activate("km");
  km.b1.classList.add("s05-reply");                                         // the chat is narrow here: the table's last heading wraps

  // ---------------------------------------------------------------- the report: the conclusion, and under it the figure
  const p1 = doc.q('[data-k="p1"]'), s1 = doc.q('[data-k="s1"]'), s2 = doc.q('[data-k="s2"]'), figBox = doc.q('[data-k="fig"]');
  doc.q("h2").before(frag(`<h2>Abstract</h2>`), frag(`<div>${ui.bars(94, 88, 52)}</div>`));
  figBox.before(p1);
  figBox.classList.add("s05-fig");
  // the sentence after the AI's edit (shown from `edited` on); the comment stays on it
  const s1b = h("span.anno-on", C.html.s1New);
  s1.after(s1b);
  // the words quoted later: the first clause of the second sentence
  const t2 = s2.textContent.trim(), QUOTE = t2.split(",")[0];
  s2.innerHTML = `<span>${esc(QUOTE)}</span>${esc(t2.slice(QUOTE.length))}`;
  const q = s2.firstElementChild;
  // the figure's new version: the same curves (data.js), with both medians marked
  const fig = km.fig, fig2 = ui.km(C.D.km);
  {
    const K = C.D.km, Wd = 640, Ht = 400, L = 58, R = 16, T = 34, Bm = 46, tmax = K.risk_times[K.risk_times.length - 1] * 1.05;   // ui.km's frame
    const X = (t) => L + (t / tmax) * (Wd - L - R), Y = (p) => T + (1 - p) * (Ht - T - Bm);
    const g = frag(`<svg><g><path class="s05-med" stroke="#8a96a0" d="M${L} ${Y(0.5)}H${X(C.F.median)}"/>` +
      [C.M, C.F].map((m) => `<path class="s05-med" stroke="${ui.COLS[m.sex]}" d="M${X(m.median)} ${Y(0.5)}V${Ht - Bm}"/>`).join("") + "</g></svg>").firstChild;
    fig2.querySelector(".legend").before(g);
  }
  figBox.append(fig2);
  [fig, fig2].forEach((f) => s.init(f.querySelectorAll(".curve"), { draw: 1 }));

  // what is on the page before the edit (for measuring); the engine switches with `show`
  const state = (after) => { s1.style.display = fig.style.display = after ? "none" : ""; s1b.style.display = fig2.style.display = after ? "" : "none"; };
  state(false);
  // scrolled so that the conclusion is near the top of the page
  const SY = Math.round(p1.getBoundingClientRect().top - doc.inner.getBoundingClientRect().top - 50);
  doc.inner.style.transform = `translate(0px,${-SY}px)`;
  s.init(doc.inner, { y: -SY });

  // the comment
  const NOTE = "Give the difference in months.", quote1 = s1.textContent.trim();
  const draft = doc.draft(quote1), card = doc.card({ num: 1, quote: quote1, body: NOTE });
  s.init(draft.card, { show: 0 }); s.init(card.card, { show: 0 });
  card.badge.textContent = "Text rewritten";
  card.reply.className = "reply pending"; card.reply.textContent = "Claude is working on this in the chat…";

  // ---------------------------------------------------------------- first frame: close on the report
  const Z = 1.4, vTop = A.xy(km.display.views, 0, 0)[1], dO = A.xy(doc.el, 0, 0);
  A.focus([ui.AW, vTop + ui.AH / Z / 2], Z, 0, 0);

  // ---------------------------------------------------------------- 1: comment, then Ask Claude
  cur.show(0.5, A.xy(s1, 0, 0.12, { without: [draft.card, card.card] }));
  doc.select(s1, 0.8, 0.9);
  cur.move(A.xy(s1, 0.62, 0.9), 0.8, 0.9);
  let tb = doc.toolbarAt(s1, 1.9);
  cur.move([dO[0] + tb[0] + 44, dO[1] + tb[1] + 17], 2.2, 0.5);
  s.cls(doc.tbComment, "hot", 2.7);
  cur.click(3.0);
  s.set(doc.toolbar, { opacity: 0 }, 3.1); s.cls(doc.tbComment, "hot", 3.1, false);
  doc.unselect(s1, 3.0); s.cls(s1, "anno-on", 3.0);
  s.set(draft.card, { show: 1 }, 3.0);
  s.fromTo(draft.card, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, 3.0, 0.3, "back");
  cur.hide(3.3);
  let t = s.type(draft.text, NOTE, 3.5, 19);                                // until about 5.1
  cur.show(t + 0.1); cur.to(draft.save, t + 0.15, 0.45, 0.5, 0.5, { without: [card.card] });
  const saved = t + 0.8;
  cur.click(saved);
  s.set(draft.card, { show: 0 }, saved); s.set(card.card, { show: 1 }, saved);
  s.fromTo(card.card, { scale: 0.9 }, { scale: 1 }, saved, 0.3, "back");
  const askAt = saved + 1.3;
  cur.to(card.ask, askAt - 0.7, 0.5, 0.5, 0.5, { without: [draft.card, card.reply] });
  s.cls(card.ask, "hot", askAt - 0.25);
  cur.click(askAt);
  cur.hide(askAt + 0.4);
  s.set(card.reply, { show: 1 }, askAt);
  // it goes through the chat; the AI edits the sentence, redraws the figure, answers on the card
  const u3 = ch.user(`Comment #1 on report.md: ${NOTE}`);
  const r3 = ch.bot(`<p><b>Done.</b> The sentence now gives the difference in days and in months.</p><p>I ran <code>km_by_sex.R</code> again: the figure marks both medians.</p>`);
  ch.stepsLine(r3, "4 steps, 24s");
  ch.show(u3, askAt);
  const edited = askAt + 2.0, drawn = edited + 0.9, done = drawn + 0.5;
  ch.busy(askAt, done, [[0, "Reading report.md"], [1.0, "Editing report.md"], [2.2, "Running km_by_sex.R"]], 24);
  s.init(s1b, { show: 0 }); s.set(s1, { show: 0 }, edited); s.set(s1b, { show: 1 }, edited);
  s.cls(s1b, "flash", edited); s.cls(s1b, "flash", edited + 1.8, false);
  s.fromTo(card.badge, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }, edited + 0.3, 0.3, "back");
  s.cls(card.ask, "hot", edited, false);
  s.init(fig2, { show: 0 }); s.set(fig, { show: 0 }, drawn); s.set(fig2, { show: 1 }, drawn);      // the figure in the report follows
  s.html(card.reply, `<b>Claude</b>Added the difference: ${C.diffDays} days, about ${C.diffMonths} months. The figure marks both medians.`, done);
  s.cls(card.reply, "pending", done, false);
  ch.stream(r3, done, 0.35);
  state(true);                                                              // from here on, places are measured on the page after the edit

  // ---------------------------------------------------------------- 2: "#1" is that comment
  const T2 = done + 1.2;
  A.focus([0, ui.AH], Z, T2, 1.0);
  const MSG = "#1 also say it in the abstract";
  const u4 = ch.user(MSG), r4 = ch.bot("<p><b>Done.</b> The abstract gives the difference too.</p>");
  ch.stepsLine(r4, "2 steps, 9s");
  t = ch.type(MSG, T2 + 1.0);
  V.say(s, "#1 is that comment.", T2 + 1.1, t + 1.3, "br");
  const sent = t + 0.6, done2 = sent + 1.7;
  ch.clear(sent); ch.show(u4, sent); s.cue("send", sent);
  ch.busy(sent, done2, [[0, "Reading report.md"], [0.9, "Editing report.md"]], 9);
  ch.stream(r4, done2, 0.35);

  // ---------------------------------------------------------------- 3: Quote in chat
  const T3 = sent + 0.8;
  A.focus(null, 1, T3, 0.9);
  const line = (() => {                                                     // the paragraph's line in report.md, counted from what the page shows
    let n = 1, bar = false;
    for (const el of doc.inner.children) {
      if (el === p1) break;
      const isBar = el.classList.contains("bar") || !!el.querySelector(":scope > .bar");
      if (isBar && bar) continue;
      n += (el.tagName === "TABLE" ? el.querySelectorAll("tr").length + 1 : 1) + 1; bar = isBar;
    }
    return n;
  })(), col = C.html.s1New.length + 2;
  ch.pre.textContent = `[tabs/KM by sex/report.md:${line}:${col}-${line}:${col + QUOTE.length - 1} "${QUOTE}"]`;
  const Q3 = "is this still true after adjusting for ECOG?";
  const S = T3 + 1.1;
  cur.show(S - 0.3, A.xy(q, 0, 0.3));
  doc.select(q, S, 0.8);
  cur.move(A.xy(q, 1, 0.8), S, 0.8);
  tb = doc.toolbarAt(q, S + 1.0);
  cur.move([dO[0] + tb[0] + 148, dO[1] + tb[1] + 17], S + 1.3, 0.5);
  s.cls(doc.tbQuote, "hot", S + 1.8);
  const quoted = S + 2.2;
  cur.click(quoted);
  s.set(doc.toolbar, { opacity: 0 }, quoted + 0.1); s.cls(doc.tbQuote, "hot", quoted + 0.1, false);
  cur.hide(quoted + 0.3);
  A.fly(`“${QUOTE.split(" ").slice(0, 4).join(" ")}…”`, A.xy(q, 0.1, 0), A.xy(ch.input, 0.04, 0.2), quoted + 0.1, 0.7);
  const landed = quoted + 0.75;
  doc.unselect(q, landed);
  s.set(ch.pre, { show: 1 }, landed);
  s.fromTo(ch.pre, { opacity: 0 }, { opacity: 1 }, landed, 0.2);
  const typed = ch.type(Q3, landed + 0.5);
  s.fn((t) => { if (t >= typed) ch.caret.style.opacity = 1; });               // the caret rests: the last frame is a still

  // the chat's scrolling; then the message box grows with the reference and the question, and the chat moves up with it
  const cH = () => ch.composer.getBoundingClientRect().height;
  ch.pre.style.display = "none";
  const H0 = cH();
  A.done();
  ch.pre.style.display = ""; ch.ph.style.display = "none";
  const H1 = cH();
  ch.txt.textContent = Q3;
  const H2 = cH();
  ch.txt.textContent = ""; ch.ph.style.display = "";
  s.to(ch.inner, { y: -(ch.scrollEnd + H1 - H0) }, landed, 0.3);
  if (H2 > H1) s.to(ch.inner, { y: -(ch.scrollEnd + H2 - H0) }, landed + 0.5 + (typed - landed - 0.5) * 0.4, 0.3);
});
