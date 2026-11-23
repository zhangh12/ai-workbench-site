// Segment 13 — Better each time. (A Skill tab: improve a skill with the AI, review every file's changes, save.)
// Script: planning/scripts.md. The app: docs/design.md 6t, app/wb/workbench.py (skill_bar), app/wb/skillsui.py (page "preview").
// Same world as s11 and s12: the skill nsclc-cohort (made from the Cohort tab), next to km-logrank and report-style.
V.css("s13", `
.s13-dlg { position: absolute; left: 180px; top: 9px; width: 640px; height: 460px; z-index: 4150; display: flex; flex-direction: column; border-radius: 14px; background: #fff; box-shadow: var(--wb-shadow-pop); font-size: 13px; line-height: 1.45; transform-origin: 50% 50%; }
.s13-hd { flex: 0 0 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 16px; border-bottom: 1.5px solid var(--wb-line); }
.s13-hd b { font-size: 15.5px; }
.s13-hd span { display: inline-flex; color: var(--wb-faint); font-size: 15px; }
.s13-pages { position: relative; flex: 1 1 auto; min-height: 0; }
.s13-page { position: absolute; inset: 0; padding: 9px 16px 0; overflow: hidden; }
.s13-foot { position: relative; flex: 0 0 44px; border-top: 1.5px solid var(--wb-line); }
.s13-fpage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 0 16px; }
.s13-note { margin: 0 0 7px; color: var(--wb-slate); font-size: 12px; line-height: 1.45; }
.s13-note .bar { display: inline-block; height: 7px; margin: 0 0 0 6px; vertical-align: 1px; }
.s13-list { display: flex; flex-direction: column; gap: 6px; }
.s13-row { padding: 5px 12px 7px; border: 1.5px solid var(--wb-line); border-radius: 10px; background: #fff; }
.s13-row b { font: 600 12.5px/1.4 var(--wb-mono); margin-right: 8px; }
.s13-tag { display: inline-block; padding: 0 8px; border-radius: 999px; background: var(--wb-mist); color: var(--wb-slate); font-size: 10.5px; line-height: 17px; white-space: nowrap; }
.s13-tag.ok { background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-weight: 600; line-height: 22px; }
.s13-desc { margin: 1px 0 6px; color: var(--wb-slate); font-size: 11.5px; line-height: 1.45; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s13-acts { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; min-height: 22px; }
.s13-btn { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 7px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; background: var(--wb-paper); color: var(--wb-ink); font-size: 11.5px; font-weight: 500; white-space: nowrap; }
.s13-btn .wb-ico { color: var(--wb-slate); font-size: 12px; }
.s13-btn.primary { border-color: var(--wb-accent); background: var(--wb-accent); color: #fff; font-weight: 600; }
.s13-btn.quiet { border-color: transparent; background: transparent; color: var(--wb-slate); }
.s13-btn.big { height: 28px; padding: 0 13px; font-size: 12.5px; border-radius: 8px; }
.s13-seg { display: inline-flex; height: 22px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; overflow: hidden; margin-right: 3px; }
.s13-seg i { display: inline-flex; align-items: center; padding: 0 8px; font-style: normal; font-size: 11.5px; color: var(--wb-slate); background: var(--wb-paper); white-space: nowrap; }
.s13-seg i + i { border-left: 1.5px solid var(--wb-line-strong); }
.s13-seg i.on { background: var(--wb-accent); color: #fff; font-weight: 600; }
.s13-add { margin-top: 10px; padding-top: 9px; border-top: 1.5px solid var(--wb-line); }
.s13-add > b { display: block; font-size: 12.5px; margin-bottom: 6px; }
.s13-add { margin-top: 8px; padding-top: 7px; }
.s13-msg { margin-top: 7px; padding: 3px 10px; border-radius: 7px; background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-size: 12px; font-weight: 500; }
.s13-bar { flex: 0 0 auto; display: flex; align-items: center; gap: 7px; margin: 8px 10px 0 0; padding: 5px 6px 5px 10px; border-radius: 9px; background: var(--wb-accent-tint); font-size: 11.5px; white-space: nowrap; }
.s13-bar > .wb-ico { font-size: 14px; color: var(--wb-accent-strong); }
.s13-bar code { font-family: var(--wb-mono); font-size: 0.95em; }
.s13-bar .s13-btn { margin-left: auto; height: 24px; }
.s13-fm { margin: 0 0 11px; padding: 7px 12px; border-radius: 9px; background: var(--wb-mist); font: 11.5px/1.55 var(--wb-mono); color: var(--wb-slate); }
.s13-fm b { color: var(--wb-ink); font-weight: 600; }
.s13-md ol { margin: 0; padding-left: 22px; }
.s13-md li { margin: 0 0 1px; padding: 0 6px; border-radius: 5px; }
.s13-md h1 { margin-bottom: 8px; }
.s13-md.doc-inner { padding-top: 12px; }
.s13-files { margin: 0 0 8px; padding: 5px 10px 6px; border: 1.5px solid var(--wb-line); border-radius: 8px; font-size: 12px; }
.s13-files code { font-family: var(--wb-mono); font-size: 11.5px; font-weight: 600; margin-right: 8px; }
.s13-fhd { display: flex; align-items: center; gap: 5px; height: 22px; }
.s13-fhd .wb-ico { font-size: 12px; color: var(--wb-slate); }
.s13-fline { display: flex; align-items: center; height: 22px; padding-left: 17px; }
.s13-fst { padding: 0 7px; border-radius: 999px; font-size: 10.5px; line-height: 17px; color: var(--wb-slate); }
.s13-fst.changed { color: var(--wb-warn); background: var(--wb-warn-tint); font-weight: 600; }
.s13-diff { margin: 3px 0 5px; padding: 6px 0; border-radius: 7px; background: var(--wb-mist); font: 11.5px/1.6 var(--wb-mono); white-space: pre; overflow: hidden; }
.s13-diff span { display: block; padding: 0 10px; color: var(--wb-slate); }
.s13-diff .add { background: #e3f5ea; color: #1a7f37; }
.s13-diff .del { background: var(--wb-danger-tint); color: var(--wb-danger); text-decoration: line-through; }
.s13-lbl { display: block; margin: 0 0 3px; font-size: 12px; font-weight: 600; color: var(--wb-slate); }
.s13-input { margin-bottom: 8px; padding: 5px 10px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); font-size: 12.5px; line-height: 1.5; }
.s13-input.mono { font-family: var(--wb-mono); font-weight: 600; }
.s13-input .bar { height: 7px; margin: 6px 0; }`);

V.scene("s13", (s) => {
  const ui = V.ui, { h, esc } = V, px = "s13";
  // What the review shows: the output of video/data/make_s13.py (the app's own skills.compare on the two versions).
  const REVIEW = {
    note: "Updating nsclc-cohort: 1 of 2 files changed.",
    steps: ["Start from every patient in the source table; say which table it is.", "Keep non-small cell lung cancer.", "Keep stage IIIB or IV at diagnosis.",
      "Keep diagnoses in the study period the user gives.", "Keep patients with a first-line treatment recorded.", "Keep patients with follow-up after treatment start.",
      "Run `scripts/attrition.R` to write the attrition table."],
    new_step: "Exclude patients with fewer than 30 days of follow-up.", new_at: 7,
    files: [
      { path: "SKILL.md", status: "changed", lines: [[" ", "6. Keep patients with follow-up after treatment start."], ["-", "7. Run `scripts/attrition.R` to write the attrition table."],
        ["+", "7. Exclude patients with fewer than 30 days of follow-up."], ["+", "8. Run `scripts/attrition.R` to write the attrition table."]] },
      { path: "scripts/attrition.R", status: "unchanged", lines: [] },
    ],
  };
  const NAME = "nsclc-cohort";
  const DESC = "Build an advanced NSCLC first-line cohort from a real-world database, one inclusion step at a time, with an attrition table. Use when asked to pull or define an NSCLC cohort, or for an attrition table.";
  const HAVE = [   // the first sentence of each description, from app/skills/<name>/SKILL.md
    ["km-logrank", "Built in", "Kaplan-Meier survival curves by group with a number-at-risk table, median survival with 95% CI, and a log-rank test."],
    ["report-style", "Built in", "House style for written analysis reports: structure, numbering of tables and figures, number and p-value formatting, wording."],
  ];
  const ICO = {   // app/wb/icons.py
    book: ui.ico('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7h6"/>'),
    pencil: ui.ico('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>'),
  };
  const btn = (label, cls = "", icon = "") => h(`span.${px}-btn` + (cls ? "." + cls.split(" ").join(".") : ""), { html: icon + `<span>${label}</span>` });
  const md = (t) => esc(t).replace(/`([^`]+)`/g, "<code>$1</code>");

  // ---------------------------------------------------------------- the Skill tab ("Improve with Claude" opened it on a copy of the skill)
  const A = V.lung(s, { tabs: ["cohort", "baseline", "km", { id: "skill", title: "Skill " + NAME, left: 42 }] });
  const P = ui.pane(s, A, "skill"), ch = P.chat, cur = A.cur;
  A.activate("skill");
  const review = btn("Review and install…", "primary");
  P.chatEl.prepend(h(`div.${px}-bar`, { html: ICO.book + "<span><b>Skill tab</b> · the skill's files are in <code>skill/</code></span>" }, review));
  // the skill's SKILL.md, rendered: its heading block (name, description), then the method
  const doc = ui.doc(s, A, `<div class="${px}-fm"><div><b>name:</b> ${NAME}</div><div><b>description:</b> ${esc(DESC)}</div></div>
    <h1>Advanced NSCLC cohort, first-line treated</h1><ol>${REVIEW.steps.map((t) => `<li>${md(t)}</li>`).join("")}</ol>`);
  doc.inner.classList.add(`${px}-md`);
  const fresh = h("li", { html: md(REVIEW.new_step) });
  doc.q("ol").children[REVIEW.new_at - 2].after(fresh);                    // laid out now, shown when the AI has written it
  s.init(fresh, { show: 0 });
  P.display.add("md", doc.el);
  P.display.open("md", "SKILL.md", REVIEW.files.length);
  // an earlier exchange in this tab (when the script was added), then the new request
  ch.past(ch.user("Add a script that writes the attrition table"));
  const b0 = ch.bot("<p><b>Added <code>scripts/attrition.R</code>.</b> Step 7 of SKILL.md runs it.</p>");
  ch.stepsLine(b0, "3 steps, 27s"); ch.past(b0);
  const ASK = "Also exclude patients with fewer than 30 days of follow-up";
  const u1 = ch.user(ASK), b1 = ch.bot("<p><b>Added as step 7.</b> Running the attrition script is now step 8.</p>");
  ch.stepsLine(b1, "2 steps, 14s");

  // ---------------------------------------------------------------- the Skills dialog, opened by "Review and install…"
  const veil = h("div.modal-veil"), pagesEl = h(`div.${px}-pages`), foot = h(`div.${px}-foot`);
  const dlg = h(`div.${px}-dlg`, h(`div.${px}-hd`, h("b", "Skills"), h("span", { html: ui.ICON.x })), pagesEl, foot);
  A.el.append(veil, dlg);
  s.init([veil, dlg], { opacity: 0 });
  const pages = [];
  const page = (body, footKids) => { const Q = { b: h(`div.${px}-page`, body), f: h(`div.${px}-fpage`, footKids) }; pagesEl.append(Q.b); foot.append(Q.f); pages.push(Q); return Q; };
  const showPage = (Q, at) => pages.forEach((q) => (at <= 0 ? s.init([q.b, q.f], { opacity: q === Q ? 1 : 0 }) : s.set([q.b, q.f], { opacity: q === Q ? 1 : 0 }, at)));

  // page: every file of the skill and what changed in it; then its name, when it is used, its instructions
  const fileEls = REVIEW.files.map((f) => {
    const tag = h(`span.${px}-fst` + (f.status === "unchanged" ? "" : "." + f.status), f.status);
    if (!f.lines.length) return { tag, el: h(`div.${px}-fline`, h("code", f.path), tag) };
    const rows = f.lines.map(([k, line]) => h("span" + (k === "+" ? ".add" : k === "-" ? ".del" : ""), (k === "+" ? "+ " : k === "-" ? "- " : "  ") + line));
    return { tag, rows, el: h("div", h(`div.${px}-fhd`, { html: ui.ICON.down }, h("code", f.path), tag), h(`pre.${px}-diff`, rows)) };
  });
  const save = btn("Save changes", "primary big");
  const preview = page([
    h(`p.${px}-note`, REVIEW.note + " The version before is kept (“Restore previous” brings it back)."),
    h(`div.${px}-files`, fileEls.map((f) => f.el)),
    h(`span.${px}-lbl`, "Name"), h(`div.${px}-input.mono`, NAME),
    h(`span.${px}-lbl`, "When Claude uses it"), h(`div.${px}-input`, { html: ui.bars(97, 58) }),
    h(`span.${px}-lbl`, "Instructions"), h(`div.${px}-input`, { html: ui.bars(44, 0, 62, 30, 36, 48, 46, 50) }),
  ], [btn("Cancel", "big"), save]);

  // page: the session's skills after the update
  const row = ([name, from, desc], restore) => h(`div.${px}-row`, h("div", h("b", name), h(`span.${px}-tag`, from)), h(`div.${px}-desc`, desc),
    h(`div.${px}-acts`, h(`span.${px}-seg`, h("i.on", "Automatic"), h("i", "Only when named")), btn("Edit", "", ICO.pencil), btn("Improve with Claude", "", ui.ICON.bubble),
      restore ? btn("Restore previous") : null, btn("Save to my library"), btn("Remove", "quiet")));
  const close = btn("Close", "big");
  const list = page([
    h(`div.${px}-list`, row(HAVE[0]), row([NAME, "From the tab “Cohort”", DESC], true), row(HAVE[1])),
    h(`div.${px}-msg`, `Saved the changes to ${NAME}.`),
    h(`div.${px}-add`, h("b", "Add a skill"), h(`div.${px}-acts`, btn("From the library", "", ICO.book), btn("From a file", "", ui.ICON.clip), btn("From a tab's work", "", ICO.pencil), btn("With Claude", "", ui.ICON.bubble))),
  ], close);
  showPage(preview, 0);

  // ---------------------------------------------------------------- what happens
  // one more rule, asked for in the chat
  const T0 = 0.8, typed = T0 + ASK.length / 21;
  A.typeCam(T0, typed, true, 1.45);
  const sent = ch.send(u1, ASK, T0, 21);
  const END = sent + 2.1;
  ch.busy(sent, END, [[0, "Reading skill/SKILL.md"], [0.8, "Editing skill/SKILL.md"]], 14);
  // SKILL.md gains a step
  s.set(fresh, { show: 1 }, END);
  s.fromTo(fresh, { bg: "#bfe8cd", opacity: 0 }, { bg: "#e3f5ea", opacity: 1 }, END, 0.5);
  ch.stream(b1, END + 0.1, 0.3);
  A.done();
  const [fx, fy] = A.xy(fresh);
  A.focus([fx + 30, fy - 10], 1.25, END + 0.5, 0.8);
  A.focus(null, 1, END + 2.6, 0.8);
  // review every file's changes, then save
  const R = END + 4.0;
  cur.show(R - 0.9, [330, 150]); cur.to(review, R - 0.8, 0.55); cur.click(R);
  s.fromTo(veil, { opacity: 0 }, { opacity: 1 }, R, 0.22);
  s.fromTo(dlg, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }, R, 0.3, "back");
  s.to(fresh, { bg: "#fdfcf9" }, R, 0.3);
  fileEls[0].rows.forEach((r, i) => s.fromTo(r, { opacity: 0, x: -8 }, { opacity: 1, x: 0 }, R + 0.15 + i * 0.12, 0.25));
  A.ring(fileEls[0].el, R + 1.0, R + 3.0, 3).style.zIndex = 4300;
  V.say(s, "Every change, before it goes in.", R + 0.8, R + 3.4, "bl");
  const S = R + 4.0;
  cur.to(save, S - 0.7, 0.55); cur.click(S);
  showPage(list, S);
  s.fromTo(list.b, { x: 14 }, { x: 0 }, S, 0.3);
  V.say(s, "The earlier version is kept.", S + 0.4, S + 2.3, "tc");
  cur.to(close, S + 1.9, 0.3); cur.click(S + 2.5);
  s.to(dlg, { opacity: 0, scale: 0.94 }, S + 2.5, 0.22, "in"); s.to(veil, { opacity: 0 }, S + 2.5, 0.25);
  cur.hide(S + 2.7);
});
