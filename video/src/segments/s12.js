// Segment 12 — Did it right once? Keep it. (Skills: "From a tab's work": the AI drafts a skill from what a tab did.)
// Script: planning/scripts.md. The app: docs/design.md 6t, app/wb/skillsui.py (pages "tab" and "preview"), app/wb/skills.py.
// Same world as s11 and s13: the session already has km-logrank and report-style; the new skill is nsclc-cohort.
V.css("s12", `
.s12-dlg { position: absolute; left: 180px; top: 9px; width: 640px; height: 460px; z-index: 4150; display: flex; flex-direction: column; border-radius: 14px; background: #fff; box-shadow: var(--wb-shadow-pop); font-size: 13px; line-height: 1.45; transform-origin: 50% 50%; }
.s12-hd { flex: 0 0 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 16px; border-bottom: 1.5px solid var(--wb-line); }
.s12-hd b { font-size: 15.5px; }
.s12-hd span { display: inline-flex; color: var(--wb-faint); font-size: 15px; }
.s12-pages { position: relative; flex: 1 1 auto; min-height: 0; }
.s12-page { position: absolute; inset: 0; padding: 9px 16px 0; overflow: hidden; }
.s12-foot { position: relative; flex: 0 0 44px; border-top: 1.5px solid var(--wb-line); }
.s12-fpage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 0 16px; }
.s12-note { margin: 0 0 7px; color: var(--wb-slate); font-size: 12px; line-height: 1.45; }
.s12-note .bar { display: inline-block; height: 7px; margin: 0 0 0 6px; vertical-align: 1px; }
.s12-list { display: flex; flex-direction: column; gap: 6px; }
.s12-row { padding: 5px 12px 7px; border: 1.5px solid var(--wb-line); border-radius: 10px; background: #fff; }
.s12-row b { font: 600 12.5px/1.4 var(--wb-mono); margin-right: 8px; }
.s12-tag { display: inline-block; padding: 0 8px; border-radius: 999px; background: var(--wb-mist); color: var(--wb-slate); font-size: 10.5px; line-height: 17px; white-space: nowrap; }
.s12-tag.ok { background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-weight: 600; line-height: 22px; }
.s12-desc { margin: 1px 0 6px; color: var(--wb-slate); font-size: 11.5px; line-height: 1.45; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s12-acts { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; min-height: 22px; }
.s12-btn { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 7px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; background: var(--wb-paper); color: var(--wb-ink); font-size: 11.5px; font-weight: 500; white-space: nowrap; }
.s12-btn .wb-ico { color: var(--wb-slate); font-size: 12px; }
.s12-btn.primary { border-color: var(--wb-accent); background: var(--wb-accent); color: #fff; font-weight: 600; }
.s12-btn.quiet { border-color: transparent; background: transparent; color: var(--wb-slate); }
.s12-btn.big { height: 28px; padding: 0 13px; font-size: 12.5px; border-radius: 8px; }
.s12-seg { display: inline-flex; height: 22px; border: 1.5px solid var(--wb-line-strong); border-radius: 7px; overflow: hidden; margin-right: 3px; }
.s12-seg i { display: inline-flex; align-items: center; padding: 0 8px; font-style: normal; font-size: 11.5px; color: var(--wb-slate); background: var(--wb-paper); white-space: nowrap; }
.s12-seg i + i { border-left: 1.5px solid var(--wb-line-strong); }
.s12-seg i.on { background: var(--wb-accent); color: #fff; font-weight: 600; }
.s12-add { margin-top: 10px; padding-top: 9px; border-top: 1.5px solid var(--wb-line); }
.s12-add > b { display: block; font-size: 12.5px; margin-bottom: 6px; }
.s12-add { margin-top: 8px; padding-top: 7px; }
.s12-msg { margin-top: 7px; padding: 3px 10px; border-radius: 7px; background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-size: 12px; font-weight: 500; }
.s12-menu { position: absolute; left: 8px; top: 40px; z-index: 4000; width: 208px; padding: 7px; background: var(--wb-paper); border: 1.5px solid var(--wb-line); border-radius: 12px; box-shadow: var(--wb-shadow-pop); transform-origin: 20% 0; }
.s12-menu hr { margin: 5px 4px; border: 0; border-top: 1.5px solid var(--wb-line); }
.s12-lbl { display: block; margin: 0 0 3px; font-size: 12px; font-weight: 600; color: var(--wb-slate); }
.s12-select { position: relative; display: flex; align-items: center; justify-content: space-between; height: 32px; margin-bottom: 12px; padding: 0 10px 0 12px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); font-size: 13px; font-weight: 500; }
.s12-select.focus { border-color: var(--wb-accent); box-shadow: 0 0 0 3px var(--wb-accent-ring); }
.s12-select .wb-ico { color: var(--wb-slate); font-size: 14px; }
.s12-opts { position: absolute; left: 16px; right: 16px; z-index: 5; padding: 5px; border: 1.5px solid var(--wb-line); border-radius: 10px; background: var(--wb-paper); box-shadow: var(--wb-shadow-pop); transform-origin: 50% 0; }
.s12-opts div { padding: 5px 9px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.s12-opts div.on { background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-weight: 600; }
.s12-btn.wait { opacity: 0.6; }
.s12-files { margin: 0 0 8px; padding: 4px 10px; border: 1.5px solid var(--wb-line); border-radius: 7px; font-size: 12px; }
.s12-files code { font-family: var(--wb-mono); font-size: 11.5px; }
.s12-input { margin-bottom: 8px; padding: 5px 10px; border: 1.5px solid var(--wb-line-strong); border-radius: 8px; background: var(--wb-paper); font-size: 12.5px; line-height: 1.5; }
.s12-input.focus { border-color: var(--wb-accent); box-shadow: 0 0 0 3px var(--wb-accent-ring); }
.s12-input.mono { font-family: var(--wb-mono); font-weight: 600; white-space: pre; }
.s12-input.instr { margin-bottom: 0; padding: 6px 10px 7px; font-family: var(--wb-mono); font-size: 11.5px; color: var(--wb-slate); }
.s12-input.instr .st { display: flex; align-items: center; gap: 8px; height: 13.5px; }
.s12-input.instr .st span { flex: 0 0 14px; font-size: 10.5px; color: var(--wb-faint); }
.s12-input.instr .bar { height: 6px; margin: 0; }
.s12-keep { display: inline-flex; align-items: center; gap: 7px; margin-right: auto; font-size: 12px; color: var(--wb-ink); }
.s12-keep i { width: 14px; height: 14px; border: 1.5px solid var(--wb-line-strong); border-radius: 4px; background: #fff; }`);

V.scene("s12", (s) => {
  const ui = V.ui, { h } = V, px = "s12";
  // the two skills added in segment 11 (the first sentence of each description, from app/skills/<name>/SKILL.md)
  const HAVE = [
    ["km-logrank", "Built in", "Kaplan-Meier survival curves by group with a number-at-risk table, median survival with 95% CI, and a log-rank test."],
    ["report-style", "Built in", "House style for written analysis reports: structure, numbering of tables and figures, number and p-value formatting, wording."],
  ];
  // what the AI drafts from the Cohort tab (a method: no results or numbers of the data in it, as the app asks)
  const NAME0 = "advanced-nsclc-first-line-cohort", NAME = "nsclc-cohort";
  const DESC = "Build an advanced NSCLC first-line cohort from a real-world database, one inclusion step at a time, with an attrition table. Use when asked to pull or define an NSCLC cohort, or for an attrition table.";
  const STEPS = [74, 38, 44, 58, 56, 60, 82];   // the instructions, drawn as bars: one per step
  const ICO = {   // app/wb/icons.py
    book: ui.ico('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7h6"/>'),
    pencil: ui.ico('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>'),
    home: ui.ico('<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),
  };

  const A = V.lung(s, { tabs: ["cohort", "baseline", "km"] });
  A.build.cohort(true);                                                    // its work is done: the attrition table is on the right
  A.activate("cohort");
  const cur = A.cur;

  // ---------------------------------------------------------------- session menu -> Skills…
  const item = (icon, label) => h("div.wb-menu-item", { html: icon + `<span>${label}</span>` });
  const mSkills = item(ICO.book, "Skills…");
  const menu = h(`div.${px}-menu`, item(ICO.pencil, "Rename session"), mSkills, item(ui.ICON.gear, "Settings"), h("hr"), item(ICO.home, "Home"));
  A.el.append(menu);
  s.hide(menu);

  // ---------------------------------------------------------------- the Skills dialog: pages as layers of one box
  const btn = (label, cls = "", icon = "") => h(`span.${px}-btn` + (cls ? "." + cls.split(" ").join(".") : ""), { html: icon + `<span>${label}</span>` });
  const veil = h("div.modal-veil"), pagesEl = h(`div.${px}-pages`), foot = h(`div.${px}-foot`);
  const dlg = h(`div.${px}-dlg`, h(`div.${px}-hd`, h("b", "Skills"), h("span", { html: ui.ICON.x })), pagesEl, foot);
  A.el.append(veil, dlg);
  s.init([veil, dlg], { opacity: 0 });
  const pages = [];
  const page = (body, footKids) => { const P = { b: h(`div.${px}-page`, body), f: h(`div.${px}-fpage`, footKids) }; pagesEl.append(P.b); foot.append(P.f); pages.push(P); return P; };
  const showPage = (P, at) => pages.forEach((q) => (at <= 0 ? s.init([q.b, q.f], { opacity: q === P ? 1 : 0 }) : s.set([q.b, q.f], { opacity: q === P ? 1 : 0 }, at)));
  const turn = (P, at) => { showPage(P, at); s.fromTo(P.b, { x: 14 }, { x: 0 }, at, 0.3); };

  const row = ([name, from, desc]) => h(`div.${px}-row`, h("div", h("b", name), h(`span.${px}-tag`, from)), h(`div.${px}-desc`, desc),
    h(`div.${px}-acts`, h(`span.${px}-seg`, h("i.on", "Automatic"), h("i", "Only when named")), btn("Edit", "", ICO.pencil), btn("Improve with Claude", "", ui.ICON.bubble),
      btn("Save to my library"), btn("Remove", "quiet")));
  const note = () => h(`p.${px}-note`, "A skill is a written method Claude follows for a kind of task, for example how you make a Table 1.");
  const adds = () => { const tab = btn("From a tab's work", "", ICO.pencil);
    return { tab, el: h(`div.${px}-add`, h("b", "Add a skill"), h(`div.${px}-acts`, btn("From the library", "", ICO.book), btn("From a file", "", ui.ICON.clip), tab, btn("With Claude", "", ui.ICON.bubble))) }; };

  // page: the session's skills
  const add1 = adds();
  const list = page([note(), h(`div.${px}-list`, HAVE.map(row)), add1.el], btn("Close", "big"));

  // page "From a tab's work": which tab, then "Draft the skill"
  const selTxt = h("span", "Cohort"), sel = h(`div.${px}-select`, selTxt, h("span", { html: ui.ICON.down }));
  const optEls = ["Cohort", "Baseline", "KM by sex"].map((t, i) => h("div" + (i === 0 ? ".on" : ""), t));
  const opts = h(`div.${px}-opts`, optEls);
  const draft = btn("Draft the skill", "primary big");
  const tabPage = page([
    h(`p.${px}-note`, { html: "Claude reads what was done in a tab (its requests, steps and code) and writes it up as a method to follow next time." + ui.bars(46) }),
    h(`span.${px}-lbl`, "From the tab"), sel, h("div", draft), opts,
  ], btn("Back to Skills", "big"));
  s.hide(opts);

  // page: the draft, to check and change before it is added
  const nameTxt = h("span", NAME0), nameCaret = h("span.caret"), nameIn = h(`div.${px}-input.mono`, nameTxt, nameCaret);
  const descIn = h(`div.${px}-input`, DESC);
  const instr = h(`div.${px}-input.instr`, { html: "<div># Advanced NSCLC cohort, first-line treated</div>" + STEPS.map((w, i) => `<div class="st"><span>${i + 1}.</span><i class="bar" style="width:${w}%"></i></div>`).join("") });
  const addBtn = btn("Add to this session", "primary big");
  const preview = page([
    h(`p.${px}-note`, "A new skill with 1 file. Check them before adding it."),
    h(`div.${px}-files`, h("code", "SKILL.md")),
    h(`span.${px}-lbl`, "Name"), nameIn, h(`span.${px}-lbl`, "When Claude uses it"), descIn, h(`span.${px}-lbl`, "Instructions"), instr,
  ], [h(`span.${px}-keep`, h("i"), "Also save to my library (to use it in other sessions)"), btn("Cancel", "big"), addBtn]);
  s.init(nameCaret, { opacity: 0 });

  // page: the list again, with the new skill and where it came from
  const mine = row([NAME, "From the tab “Cohort”", DESC]);
  const list2 = page([note(), h(`div.${px}-list`, row(HAVE[0]), mine, row(HAVE[1])), h(`div.${px}-msg`, `Added ${NAME}.`), adds().el], btn("Close", "big"));

  // ---------------------------------------------------------------- what happens
  const sessBtn = A.top.querySelector(".sess-btn");
  cur.show(0.45, [300, 250]);
  cur.to(sessBtn, 0.5, 0.5, 0.6, 0.6); cur.click(1.1);
  s.fromTo(menu, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1 }, 1.1, 0.22, "back");
  cur.to(mSkills, 1.3, 0.35, 0.4, 0.5); s.cls(mSkills, "hover", 1.55); cur.click(1.8);
  s.set(menu, { opacity: 0 }, 1.8);
  showPage(list, 0);
  s.fromTo(veil, { opacity: 0 }, { opacity: 1 }, 1.8, 0.22);
  s.fromTo(dlg, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }, 1.8, 0.3, "back");
  // From a tab's work -> Cohort -> Draft the skill
  cur.to(add1.tab, 2.2, 0.5); cur.click(2.9);
  turn(tabPage, 2.9);
  cur.to(sel, 3.1, 0.4, 0.3, 0.5); cur.click(3.6);
  s.cls(sel, "focus", 3.6);
  opts.style.top = sel.offsetTop + sel.offsetHeight + 4 + "px";
  s.fromTo(opts, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, 3.6, 0.2, "back");
  cur.to(optEls[0], 3.8, 0.3, 0.25, 0.5); cur.click(4.25);
  s.set(opts, { opacity: 0 }, 4.25); s.cls(sel, "focus", 4.25, false);
  cur.to(draft, 4.4, 0.4, 0.5, 0.5, { without: [opts] }); cur.click(4.95);
  const dTxt = draft.querySelector("span");
  s.text(dTxt, "Working on the draft…", 4.95); s.cls(draft, "wait", 4.95);
  cur.hide(5.2);
  // the draft
  const T = 6.1;
  turn(preview, T);
  const dy = A.xy(descIn)[1];
  A.focus([500, dy + 6], 1.35, T + 0.25, 0.8);
  V.say(s, "Written from what this tab did.", T + 0.5, T + 3.3, "bc");
  // the name, changed by hand
  const N = T + 2.8;
  cur.show(N - 0.6, A.xy(nameIn, 0.75, 1.6)); cur.to(nameTxt, N - 0.5, 0.4, 0.6, 0.5); cur.click(N); cur.click(N + 0.14);
  s.cls(nameIn, "focus", N); s.cls(nameTxt, "hl-sel", N + 0.14);
  s.cls(nameTxt, "hl-sel", N + 0.7, false);
  const typed = s.type(nameTxt, NAME, N + 0.7, 14);
  s.set(nameCaret, { opacity: 1 }, N + 0.7); s.set(nameCaret, { opacity: 0 }, typed + 0.5); s.cls(nameIn, "focus", typed + 0.5, false);
  A.focus(null, 1, typed + 0.5, 0.8);
  // add it
  const ADD = typed + 1.7;
  cur.to(addBtn, typed + 1.0, 0.55); cur.click(ADD);
  turn(list2, ADD);
  s.fromTo(mine, { scale: 0.97 }, { scale: 1 }, ADD, 0.35, "back");
  cur.hide(ADD + 0.4);
  A.ring(mine, ADD + 0.5, ADD + 2.5, 3).style.zIndex = 4300;
  A.done();
});
