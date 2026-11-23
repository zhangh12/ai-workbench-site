// Segment 14 — Bring your own key. Script: planning/scripts.md.
// The Settings dialog as the installed app draws it (app/app.py settings_body): "Anthropic API key", "Model (all tabs)"
// and "Effort" side by side, "Close" and "Save and test". The key is pasted (masked; an obviously made-up ending),
// saved and tested: "Connected using the API key." The dialog closes on a new session and the first request starts.
// Only the key is brought: the session behind the dialog is new and empty. The notes under the fields are bars.
// No numbers from the data are shown in this segment.
V.css("s14", `
.s14-veil { position: absolute; inset: 0; z-index: 4100; background: rgba(20, 20, 19, 0.34); }
.s14-wrap { position: absolute; inset: 0; z-index: 4150; display: flex; align-items: center; justify-content: center; }
.s14-dlg { width: 350px; border-radius: 12px; background: var(--wb-paper); box-shadow: var(--wb-shadow-pop); }
.s14-hd { padding: 12px 18px 9px; font-size: 16px; font-weight: 600; border-bottom: 1px solid var(--wb-line); }
.s14-body { padding: 11px 18px 0; }
.s14-body label { display: block; font-size: 12px; font-weight: 500; margin-bottom: 3px; }
.s14-field, .s14-sel { height: 34px; display: flex; align-items: center; padding: 0 10px; border: 1px solid var(--wb-line-strong); border-radius: 8px; font-size: 13px; white-space: nowrap; }
.s14-field.focus { border-color: var(--wb-accent); box-shadow: 0 0 0 3px var(--wb-accent-ring); }
.s14-field .ph { color: var(--wb-faint); }
.s14-field .key { font: 500 13px var(--wb-mono); letter-spacing: 0.06em; }
.s14-field .key b { font-weight: 600; letter-spacing: 0.02em; margin-left: 1px; }
.s14-note .bar { height: 6px; margin: 8px 0 0; }
.s14-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.s14-sel { justify-content: space-between; padding-right: 8px; }
.s14-sel .wb-ico { width: 14px; height: 14px; color: var(--wb-slate); }
.s14-status { margin-top: 11px; padding: 7px 10px; border-radius: 6px; background: var(--wb-mist); color: var(--wb-slate); font-size: 12.5px; }
.s14-status.ok { background: var(--wb-accent-tint); color: var(--wb-accent-strong); font-weight: 500; }
.s14-ft { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding: 10px 18px 13px; border-top: 1px solid var(--wb-line); }
.s14-btn { height: 32px; display: inline-flex; align-items: center; padding: 0 13px; border: 1px solid var(--wb-line-strong); border-radius: 8px; font-size: 13px; font-weight: 500; }
.s14-btn.primary { background: var(--wb-accent); border-color: var(--wb-accent); color: #fff; }
`);
V.scene("s14", (s) => {
  const ui = V.ui, { h } = V;
  // a new session: one tab, nothing in it yet
  const A = V.lung(s, { tabs: ["cohort"] });
  const P = A.build.cohort(false), ch = P.chat;
  A.activate("cohort");

  // ---- the Settings dialog
  const bar = (w) => h("i.bar", { style: `width:${w}%` });
  const ph = h("span.ph", "sk-ant-…"), key = h("span.key", "•".repeat(22), h("b", "a1b2"));   // not a key: dots and a made-up ending
  const field = h("div.s14-field", ph, key);
  const mk = (label, value) => { const d = h("div.s14-sel", h("span", value)); d.insertAdjacentHTML("beforeend", ui.ICON.down); return h("div", h("label", label), d); };
  const status = h("div.s14-status", "Saved. Testing the connection…");
  const close = h("span.s14-btn", "Close"), save = h("span.s14-btn.primary", "Save and test");
  const dlg = h("div.s14-dlg", h("div.s14-hd", "Settings"),
    h("div.s14-body", h("label", "Anthropic API key"), field, h("div.s14-note", bar(78)),
      h("div.s14-row", mk("Model (all tabs)", "Sonnet"), mk("Effort", "Medium (default)")), h("div.s14-note", bar(92)), status),
    h("div.s14-ft", close, save));
  const veil = h("div.s14-veil"), wrap = h("div.s14-wrap", dlg);
  A.el.append(veil, wrap);
  s.init(key, { show: 0 }); s.hide(status);

  // times
  const FOCUS = 1.1, PASTE = 1.8, SAVE = 3.1, OK = 4.2, CLOSE = 6.2, TYPE = 7.2, FREEZE = s.dur - 1.05;

  // first frame: close on the dialog, the key field empty
  A.focus(null, 1.35, 0, 0);
  const cur = A.cur;
  cur.show(0.45, [640, 330]);
  cur.to(field, 0.55, 0.5, 0.3, 0.6);
  cur.click(FOCUS);
  s.cls(field, "focus", FOCUS);
  // paste: the whole key at once, masked, its last four characters readable
  s.set(ph, { show: 0 }, PASTE); s.set(key, { show: 1 }, PASTE);
  s.fromTo(key, { opacity: 0 }, { opacity: 1 }, PASTE, 0.14);
  // Save and test
  cur.to(save, SAVE - 0.75, 0.6, 0.5, 0.6);
  cur.click(SAVE);
  s.cls(field, "focus", SAVE, false);
  s.fromTo(save, { scale: 0.95 }, { scale: 1 }, SAVE, 0.22, "back"); s.init(save, { scale: 1 });
  s.showAt(status, SAVE + 0.1);
  s.text(status, "Connected using the API key.", OK); s.cls(status, "ok", OK);
  A.ring(status, OK + 0.15, OK + 1.75, 3).style.zIndex = 4200;
  // Close: back to the session
  cur.to(close, CLOSE - 0.6, 0.45, 0.5, 0.6);
  cur.click(CLOSE);
  s.to(dlg, { opacity: 0, scale: 0.96 }, CLOSE + 0.05, 0.22, "in");
  s.to(veil, { opacity: 0 }, CLOSE + 0.05, 0.3);
  cur.hide(CLOSE + 0.3);
  A.focus(null, 1, CLOSE + 0.1, 0.85);

  // ---- and to work: the first request
  const sent = ch.send(P.u1, P.q, TYPE, 28, 0.35);
  s.hide(P.greet, sent);
  const END = s.dur + 6;                                   // still working when the segment ends
  ch.busy(sent, END, [[0, "Looking for files"], [0.9, "Running R code"]], 18);
  // the last second holds still: the progress line stops where it is
  const [spin, , pmeta] = ch.prog.children;
  s.fn((t) => {
    if (t < FREEZE) return;
    spin.style.transform = `rotate(${(FREEZE * 450) % 360}deg)`;
    pmeta.textContent = `step 2, ${Math.round(((FREEZE - sent) / (END - sent)) * 18)}s`;
  });
  A.done();
});
