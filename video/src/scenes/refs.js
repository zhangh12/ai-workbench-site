// Act "refs" — answers pain 3 (vague references), on all three kinds of work:
// d1 quote a sentence of the trial brief in the chat · d2 comment on the literature review, then Ask Claude
// d2b comments follow their text, "#1" · d3 the same on lines of code (the analysis)
V.scene("refs", (s) => {
  const ui = V.ui, C = V.C, { h } = V, TR = C.TR, PM = C.PM;
  ui.captions(s);
  // three sessions, each its own window: the trial brief (d1), the literature review (d2, d2b), the data session (d3)
  const RA = V.lung(s, { session: "Background research", tabs: ["lit", "trial"], litDoc: { comments: true } }), TA = RA, LA = RA, A = V.lung(s);
  const tr = RA.build.trial(true), lit = RA.build.lit(true), km = A.build.km(true);
  [tr, lit, km].forEach((P) => P.el.style.setProperty("--l", 36));
  const T = (id) => s.shot(id), d1 = T("d1").at, d2 = T("d2").at, d2b = T("d2b").at, d3 = T("d3").at;
  RA.activate("trial"); RA.activate("lit", T("d2").t0 + 0.05); A.activate("km");     // the tab changes while a title card is up
  s.set(RA.stage, { show: 0 }, T("d3").t0);
  s.init(A.stage, { show: 0 }); s.set(A.stage, { show: 1 }, T("d3").t0);
  s.init(km.fig.querySelectorAll(".curve"), { draw: 1 });
  const refHtml = (file, pos, text) => `[<b data-p="file">${file}</b>:<b data-p="pos">${pos}</b> <b data-p="text">"${text}"</b>]`;
  const plain = (r) => r.replace(/<\/?b[^>]*>/g, "");

  // ---------------------------------------------------------------- d1: select a sentence of the trial brief, quote it in the chat
  const tdoc = tr.doc, tch = tr.chat, t2 = tdoc.q('[data-k="t2"]'), tO = TA.xy(tdoc.el, 0, 0);
  const REF1 = refHtml(`tabs/Trial ${TR.nct}/trial.md`, "11:44", t2.textContent.trim());
  tch.pre.innerHTML = REF1;
  const part = (k) => tch.pre.querySelector(`[data-p="${k}"]`);
  TA.cur.show(d1 + 0.3, TA.xy(t2, 0, 0.2));
  tdoc.select(t2, d1 + 0.6, 1.0);
  TA.cur.move(TA.xy(t2, 0.9, 0.85), d1 + 0.6, 1.0);
  let tb = tdoc.toolbarAt(t2, d1 + 1.8);
  TA.cur.move([tO[0] + tb[0] + 148, tO[1] + tb[1] + 17], d1 + 2.3, 0.5);
  s.cls(tdoc.tbQuote, "hot", d1 + 2.8);
  TA.cur.click(d1 + 3.2);
  s.set(tdoc.toolbar, { opacity: 0 }, d1 + 3.3);
  TA.cur.hide(d1 + 3.3);
  const inXY = TA.xy(tch.input, 0.04, 0.2);
  TA.fly("“The primary outcome was…”", TA.xy(t2, 0.1, 0), inXY, d1 + 3.3, 0.7);
  s.set(tch.pre, { show: 1 }, d1 + 3.95);
  s.fromTo(tch.pre, { opacity: 0 }, { opacity: 1 }, d1 + 3.95, 0.2);
  TA.focus([0, ui.AH], 1.3, d1 + 4.3, 0.9);        // what the reference carries
  tr.dim("disp", d1 + 4.3);
  [["file", "the file"], ["pos", "the position"], ["text", "the exact text"]].forEach(([k, label], i) => {
    const t0 = d1 + 5.0 + i * 1.3, el = part(k), p = TA.xy(el, 0, 0);
    s.cls(el, "on", t0); s.cls(el, "on", t0 + 1.3, false);
    TA.callout(label, [p[0], p[1] - 22], t0, t0 + 1.25);
  });
  TA.focus(null, 1, d1 + 9.0, 0.8);
  tr.dim("disp", d1 + 9.0, false);
  const Q1 = "over what time frame?";
  const u2 = tch.user(`<span class="ref">${plain(REF1)}</span> ${Q1}`);
  const r2 = tch.bot(`<p>In the registry: <b>${TR.primary_time_frame}</b></p>`);
  tch.stepsLine(r2, "1 step, 5s");
  let t = tch.type(Q1, d1 + 9.6);
  tch.clear(t + 0.4); s.set(tch.pre, { show: 0 }, t + 0.4); tch.show(u2, t + 0.4);
  tch.busy(t + 0.4, t + 1.9, [[0, "Reading the trial record"]], 5);
  tch.stream(r2, t + 1.9, 0.4);

  // ---------------------------------------------------------------- d2: comment on the literature review, then Ask Claude
  const ldoc = lit.doc, lch = lit.chat, l1 = ldoc.q('[data-k="l1"]'), lp = ldoc.q('[data-k="lp"]'), lO = LA.xy(ldoc.el, 0, 0);
  const NOTE = "Say which years they cover.";
  const draft = ldoc.draft(l1.textContent.trim()), card = ldoc.card({ num: 1, quote: l1.textContent.trim(), body: NOTE });
  s.init(draft.card, { show: 0 }); s.init(card.card, { show: 0 });
  LA.focus([ui.AW, 120], 1.16, d2 + 0.3, 0.9);
  lit.dim("chat", d2 + 0.3);
  LA.cur.show(d2 + 0.4, LA.xy(l1, 0, 0.2));
  ldoc.select(l1, d2 + 0.7, 0.9);
  LA.cur.move(LA.xy(l1, 0.9, 0.85), d2 + 0.7, 0.9);
  tb = ldoc.toolbarAt(l1, d2 + 1.8);
  LA.cur.move([lO[0] + tb[0] + 44, lO[1] + tb[1] + 17], d2 + 2.2, 0.5);
  s.cls(ldoc.tbComment, "hot", d2 + 2.6);
  LA.cur.click(d2 + 3.0);
  s.set(ldoc.toolbar, { opacity: 0 }, d2 + 3.1);
  ldoc.unselect(l1, d2 + 3.0); s.cls(l1, "anno-on", d2 + 3.0);
  s.set(draft.card, { show: 1 }, d2 + 3.0);
  s.fromTo(draft.card, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, d2 + 3.0, 0.3, "back");
  LA.cur.hide(d2 + 3.3);
  t = s.type(draft.text, NOTE, d2 + 3.5, 19);
  LA.cur.show(t + 0.1); LA.cur.to(draft.save, t + 0.15, 0.45, 0.5, 0.5, { without: [card.card] });
  LA.cur.click(t + 0.75);
  s.set(draft.card, { show: 0 }, t + 0.75); s.set(card.card, { show: 1 }, t + 0.75);
  s.fromTo(card.card, { scale: 0.9 }, { scale: 1 }, t + 0.75, 0.3, "back");
  const askAt = t + 1.9;
  LA.cur.to(card.ask, askAt - 0.6, 0.5, 0.5, 0.5, { without: [draft.card, card.reply] });
  s.cls(card.ask, "hot", askAt - 0.2);
  LA.cur.click(askAt);
  LA.cur.hide(askAt + 0.3);
  card.reply.className = "reply pending"; card.reply.textContent = "Claude is working on this in the chat…";
  s.set(card.reply, { show: 1 }, askAt);
  const u3 = lch.user(`<span class="ref">#1</span> ${NOTE}`), r3 = lch.bot("<p><b>Done.</b> The sentence now gives the years.</p>");
  lch.stepsLine(r3, "2 steps, 8s");
  lch.show(u3, askAt);
  const edited = askAt + 2.6;
  lch.busy(askAt, edited, [[0, "Reading literature.md"], [1.1, "Editing literature.md"]], 8);
  lch.stream(r3, edited, 0.4);
  s.html(l1, C.html.l1New, edited);                // the sentence is rewritten, and the answer is on the card
  s.cls(l1, "flash", edited); s.cls(l1, "flash", edited + 1.2, false);
  s.html(card.reply, `<b>Claude</b>Added the years: ${PM.year_min} to ${PM.year_max}.`, edited);
  s.cls(card.reply, "pending", edited, false);
  card.badge.textContent = "Text rewritten";
  s.fromTo(card.badge, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }, edited + 0.3, 0.3, "back");
  s.cls(card.ask, "hot", edited, false);
  s.cls(card.card, "hot", edited); s.cls(card.card, "hot", edited + 1.6, false);

  // ---------------------------------------------------------------- d2b: the comment stays with its text; "#1" in a message
  LA.focus(null, 1, d2b + 0.2, 0.8);
  lit.dim("chat", d2b + 0.2, false);
  const ins = h("div", { style: "overflow:hidden", html: `<h2>How the search was done</h2>${ui.bars(88, 54)}` });
  lp.before(ins);
  const insH = ins.getBoundingClientRect().height;
  s.init(ins, { h: 0 }); s.to(ins, { h: insH }, d2b + 1.0, 0.7, "io");
  s.cls(l1, "flash", d2b + 1.7); s.cls(l1, "flash", d2b + 3.0, false);
  s.cls(card.card, "hot", d2b + 1.7); s.cls(card.card, "hot", d2b + 3.0, false);
  // "#1" in a message means comment 1: the request is sent, and the document changes
  const NOTE2 = "put the years in the title too";
  t = lch.type("#1: " + NOTE2, d2b + 3.3);
  const sent2 = t + 0.9, done2 = sent2 + 2.0, h1 = ldoc.q("h1");
  LA.link(LA.xy(lch.input, 0.08, 0), LA.xy(card.card, 0, 0.3, { without: [draft.card] }), t + 0.1, sent2 + 0.3, 0.22);
  s.cls(card.card, "hot", t + 0.4); s.cls(card.card, "hot", sent2 + 0.3, false);
  const u4 = lch.user(`<span class="ref">#1</span> ${NOTE2}`), r4 = lch.bot("<p><b>Done.</b> The title now gives the years.</p>");
  lch.stepsLine(r4, "2 steps, 7s");
  lch.clear(sent2); lch.show(u4, sent2); s.cue("send", sent2);
  lch.busy(sent2, done2, [[0, "Reading literature.md"], [1.0, "Editing literature.md"]], 7);
  lch.stream(r4, done2, 0.4);
  s.text(h1, `${h1.textContent}, ${PM.year_min}–${PM.year_max}`, done2);
  s.cls(h1, "flash", done2); s.cls(h1, "flash", done2 + 1.4, false);

  // ---------------------------------------------------------------- d3: the same on lines of code
  const kch = km.chat, REF2 = refHtml("tabs/KM by sex/km_by_sex.R", "9-11", "fit <- survfit(Surv(time, event) ~ sex…");
  kch.pre.innerHTML = REF2;
  const code = ui.code(s, A, C.code.km.map((l, i) => [" ", i + 1, l, !(i >= 8 && i <= 10)]), { plain: true, comments: true });
  km.display.add("code2", code.el);
  km.display.open("report", "report.md", 4);
  km.display.open("code2", "km_by_sex.R", 4, d3 + 0.2);
  s.fromTo(code.el, { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, d3 + 0.2, 0.4);
  const ln = (n) => code.row(n).querySelector(".cv-ln");
  const cur = A.cur;
  cur.show(d3 + 0.7, A.xy(ln(9), 0.6, 0.5));
  [9, 10, 11].forEach((n, i) => s.cls(code.row(n), "pick", d3 + 1.1 + i * 0.35));
  cur.move(A.xy(ln(11), 0.6, 0.5), d3 + 1.1, 0.7);
  code.quote.style.top = A.xy(code.row(9), 0, 0)[1] - A.xy(code.el, 0, 0)[1] - 40 + "px"; code.quote.style.left = "250px";
  s.fromTo(code.quote, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, d3 + 2.2, 0.28, "back");
  cur.to(code.qQuote, d3 + 2.7, 0.5);
  s.cls(code.qQuote, "hot", d3 + 3.1);
  cur.click(d3 + 3.5);
  s.set(code.quote, { opacity: 0 }, d3 + 3.6);
  cur.hide(d3 + 3.6);
  A.fly("km_by_sex.R : 9-11", A.xy(code.row(9), 0.2, 0), A.xy(kch.input, 0.04, 0.2), d3 + 3.6, 0.7);
  s.set(kch.pre, { show: 1 }, d3 + 4.25);
  s.fromTo(kch.pre, { opacity: 0 }, { opacity: 1 }, d3 + 4.25, 0.2);
  kch.type("stratify this by ECOG", d3 + 4.8);
  s.cls(code.qQuote, "hot", d3 + 3.6, false);
  // the same lines can carry a comment: the toolbar again, Comment, and the card is written
  const body = h("div.body"), cc = h("div.anno-card", h("div.hd", h("span.num", "#2"), h("span.cv-where", "lines 9–11")), body, h("div.anno-actions", h("button", "Ask Claude"), h("button", "Resolve")));
  code.cards.append(cc);
  s.init(cc, { opacity: 0 });
  s.fromTo(code.quote, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, d3 + 7.4, 0.28, "back");
  cur.show(d3 + 7.3, A.xy(ln(10), 0.6, 0.5));
  cur.to(code.qComment, d3 + 7.7, 0.5);
  s.cls(code.qComment, "hot", d3 + 8.1);
  cur.click(d3 + 8.5);
  s.set(code.quote, { opacity: 0 }, d3 + 8.6);
  cur.hide(d3 + 8.9);
  s.fromTo(cc, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, d3 + 8.6, 0.32, "back");
  [9, 10, 11].forEach((n) => s.cls(code.row(n), "cmt", d3 + 8.6));
  s.type(body, "Are ties handled the same way in both?", d3 + 9.1, 19);
  A.done(); RA.done();
});
