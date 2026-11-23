// Segment 04 — Ask on the side (/btw). Script: planning/scripts.md.
// The reference for how a segment is written:
//   - the first frame (t = 0) is a still that can be understood: the page holds it for a moment before it plays
//   - one thing is told; the camera is close where words are read, wide at the end
//   - at most two highlights (A.ring) and two guiding lines (V.say: shown by the page over the picture)
//   - what is in the picture comes from window.DATA (real runs), through V.C
V.scene("s04", (s) => {
  const ui = V.ui, C = V.C, { h } = V;
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", "cox"] });
  const cox = A.build.cox(true), ch = cox.chat;
  A.activate("cox");

  // the AI is in the middle of a request (sent before the segment starts)
  const u2 = ch.user("Add age to the model and update the report");
  ch.past(u2);
  const r2 = ch.bot(`<p><b>Age added.</b> Sex: HR ${C.hr(C.cox.ecog_age.sex)}.</p><p>Age, per year: HR ${C.hr(C.cox.ecog_age.age)}, ${C.pe(C.cox.ecog_age.age.p)}.</p>`);
  ch.stepsLine(r2, "5 steps, 41s");
  const END = 13.4;                                                       // the request is done
  V.midWork(s, ch, 9, END, [[0, "Editing cox.R"], [5, "Running R code"], [19, "Editing report.md"]], 41);

  // first frame: close on the chat, the progress line running
  A.focus([0, ui.AH], 1.25, 0, 0);
  cox.dim("disp", 0, true, 0);

  // the side question
  const Qb = "which variables have missing values?";
  const ans = h("div.btw-ans", "Thinking…");
  const panel = h("div.wb-btw", h("div.btw-hd", h("b", "Side question"), h("span.sub", "can only read · not saved")), h("div.btw-question", Qb), ans);
  cox.chatEl.append(panel);
  s.hide(panel);
  const typed = ch.type("/btw " + Qb, 0.5);                                // until about 2.7
  ch.clear(typed + 0.4);
  s.fromTo(panel, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, typed + 0.4, 0.32, "back");
  const m = C.missRows, word = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][m.length];
  s.html(ans, `<p><b>${word}.</b> ${m.slice(0, 3).map(([k, n]) => `<code>${k}</code> ${n}`).join(" · ")}</p>`, typed + 2.3);

  // meanwhile the request is still running
  A.ring(ch.prog, 6.4, 8.8, 3);
  V.say(s, "The main job keeps running.", 6.5, 9.2, "br");
  s.to(panel, { opacity: 0, scale: 0.7 }, 9.6, 0.3, "in");
  // and the conversation is as it was
  A.focus(null, 1, 10.6, 0.9);
  cox.dim("disp", 10.6, false);
  V.say(s, "The conversation never saw it.", 10.4, 13.2, "br");
  ch.stream(r2, END, 0.4);
  A.done();                                                               // last: the chat works out its scrolling
});
