// Segment 09 — Code you can check. Script: planning/scripts.md.
// The Cox model tab shows cox.R (syntax colours, line numbers); the camera goes down to the model line; "Show changes"
// marks what the last request changed (+ / −, unchanged stretches folded); one step back shows the request before it.
// The app only shows what each request changed: nothing here says that an old version can be brought back.
//
// cox.R after three requests. Made and run by video/data/make_s09.R (on the synthetic cohort; it gives the numbers of
// data.js): request 1 wrote lines 1–15, request 2 added the last three lines, request 3 changed the model line.
const S09_COX = ["# Cox model: hazard ratio for sex (cohort from the Cohort tab)","library(survival)","","d <- nanoparquet::read_parquet(\"../Cohort/cohort.parquet\")","d$sex <- factor(d$sex, levels = c(\"Male\", \"Female\"))","# time = days from first-line start; event: 1 = death, 0 = censored","","# Complete cases: patients without an ECOG score are left out","n_all <- nrow(d)","d <- d[!is.na(d$ph.ecog), ]","cat(n_all - nrow(d), \"patients without ECOG left out; n =\", nrow(d), \"\\n\")","","# Hazard ratios with 95% confidence intervals","fit <- coxph(Surv(time, event) ~ sex + ph.ecog + age, data = d)","summary(fit)","","# Proportional-hazards check (Schoenfeld residuals)","cox.zph(fit)"];

V.css("s09", `
.s09-code .cv-body { font-size: 12px; line-height: 1.55; padding-top: 8px; }
.s09-code .cv-pick { width: 284px; max-width: none; }
.s09-code .cv-fold { margin: 3px 0; }
`);

V.scene("s09", (s) => {
  const ui = V.ui, C = V.C, { h } = V, cx = C.cox;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"] });
  const cox = A.build.cox(true, true), ch = cox.chat, cur = A.cur, D = cox.display;
  cox.el.style.setProperty("--l", 30);
  A.activate("cox");

  // the tab's three requests (the first is the builder's)
  const REQ = [cox.u1.textContent, "Check proportional hazards", "Add age to the model and update the report"];
  ch.past(ch.user(REQ[1]));
  const r2 = ch.past(ch.bot(`<p><b>No sign of a violation.</b> Global test: p = ${C.f2(cx.ecog.ph_global_p)}.</p>`));
  ch.stepsLine(r2, "3 steps, 18s");
  ch.past(ch.user(REQ[2]));
  const r3 = ch.past(ch.bot(`<p><b>Age added.</b> Sex: HR ${C.hr(cx.ecog_age.sex)}.</p><p>Age, per year: HR ${C.hr(cx.ecog_age.age)}, ${C.pe(cx.ecog_age.age.p)}.</p>`));
  ch.stepsLine(r3, "4 steps, 41s");

  // ---------------------------------------------------------------- the file and its two latest changes
  const v3 = S09_COX, v2 = v3.map((l) => l.replace(" + age, data", ", data")), v1 = v2.slice(0, 15);
  // the app's rule (codeview.js): a stretch of 10 or more unchanged lines folds; 3 lines stay around every change
  const fold = (rows) => {
    const near = rows.map(() => false), out = [];
    rows.forEach((r, i) => { if (r[0] !== " ") for (let k = Math.max(0, i - 3); k <= Math.min(rows.length - 1, i + 3); k++) near[k] = true; });
    for (let i = 0; i < rows.length;) {
      let j = i;
      while (j < rows.length && !near[j]) j++;
      if (j - i >= 10) { out.push(["fold", j - i, rows[i][1], rows[j - 1][1]]); i = j; continue; }
      for (const end = j > i ? j : i + 1; i < end; i++) out.push(rows[i]);
    }
    return out;
  };
  const stat = (what, rows) => `${what} <span class="plus">+${rows.filter((r) => r[0] === "+").length}</span> <span class="minus">−${rows.filter((r) => r[0] === "-").length}</span>`;
  const view = (key, rows, o) => {
    const cv = ui.code(s, A, rows, o);
    cv.el.classList.add("s09-code");
    const folds = rows.filter((r) => r[0] === "fold");
    cv.inner.querySelectorAll(".cv-fold").forEach((f, i) => (f.textContent += ` (${folds[i][2]}–${folds[i][3]})`));
    D.add(key, cv.el);
    return cv;
  };
  const rows3 = fold(v3.flatMap((l, i) => (l !== v2[i] ? [["-", i + 1, v2[i]], ["+", i + 1, l]] : [[" ", i + 1, l]])));
  const rows2 = fold(v2.map((l, i) => [i < v1.length ? " " : "+", i + 1, l]));
  const full = view("full", v3.map((l, i) => [" ", i + 1, l]), { pick: REQ[2] });       // the file as it is: "Show changes" not ticked
  const d3 = view("d3", rows3, { stat: stat("Latest change", rows3), pick: REQ[2] });
  const d2 = view("d2", rows2, { stat: stat("Change 2 of 3", rows2), pick: REQ[1] });
  full.toggle.classList.add("off");
  D.open("full", "cox.R", 3);

  // ---------------------------------------------------------------- 1: read the code, down to the model
  const dx = A.xy(cox.disp, 0, 0)[0], Z1 = 1.6, Z2 = 1.42;
  const model = full.row(14), mY = A.xy(model, 0, 0.5)[1];
  A.focus([dx + ui.AW / Z1 / 2, 44 + ui.AH / Z1 / 2], Z1, 0.5, 1.1);
  cox.dim("chat", 0.5);
  A.focus([dx + ui.AW / Z1 / 2, mY - 30], Z1, 2.0, 2.4);                   // down the file; the model line ends up in the lower half

  // ---------------------------------------------------------------- 2: what the last request changed
  const T1 = 6.5, T2 = 10.0, T3 = 12.9;
  A.focus([ui.AW, 78 + ui.AH / Z2 / 2], Z2, 5.2, 0.9);                    // back up: the bar and the file
  cur.show(5.6, A.xy(full.row(6), 0.45, 0.5));
  cur.to(full.toggle, 5.7, 0.55, 0.07, 0.5);
  cur.click(T1);
  D.open("d3", "cox.R", 3, T1);
  s.fromTo(d3.toggle, { scale: 1.25 }, { scale: 1 }, T1, 0.3, "back");
  const ch3 = d3.lines.filter((l) => l.mk !== " "), ch2 = d2.lines.filter((l) => l.mk !== " ");
  ch3.forEach((l, i) => s.fromTo(l.row, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, T1 + 0.25 + i * 0.4, 0.35));
  const box = (a, b, at, until) => {                                       // A.ring around several rows
    const p = A.xy(a, 0, 0), q = A.xy(b, 1, 1);
    const el = h("div.ring", { style: { left: p[0] + 6 + "px", top: p[1] - 3 + "px", width: q[0] - p[0] - 12 + "px", height: q[1] - p[1] + 6 + "px" } });
    A.el.append(el);
    s.fromTo(el, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1 }, at, 0.3, "back"); s.to(el, { opacity: 0 }, until, 0.25);
  };
  box(ch3[0].row, ch3[ch3.length - 1].row, T1 + 1.0, T1 + 2.9);
  V.say(s, "What the last request changed.", T1 + 0.5, T1 + 3.0, "bc");

  // one step back: the request before it, and its lines
  cur.to(d3.older, T2 - 0.9, 0.6);
  s.cls(d3.older, "hot", T2 - 0.3); s.cls(d3.older, "hot", T2, false); s.cls(d2.older, "hot", T2); s.cls(d2.older, "hot", T2 + 0.5, false);
  cur.click(T2);
  D.open("d2", "cox.R", 3, T2);
  ch2.forEach((l, i) => s.fromTo(l.row, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, T2 + 0.2 + i * 0.2, 0.35));
  A.ring(d2.pick, T2 + 0.4, T2 + 2.3, 4);
  V.say(s, "And the request before it.", T2 + 0.4, T2 + 2.6, "bc");
  // and forward again, to the latest
  cur.to(d2.newer, T3 - 0.7, 0.5);
  s.cls(d2.newer, "hot", T3 - 0.2);
  cur.click(T3);
  D.open("d3", "cox.R", 3, T3);
  cur.hide(T3 + 0.4);
  A.focus(null, 1, T3 + 0.6, 0.9);
  cox.dim("chat", T3 + 0.6, false);
  A.done();
});
