// The app, redrawn for the film (styles: sketch.css): the app's layout, simplified.
// Everything is built once, laid out in its final form, and revealed by tweens.
V.ui = (function () {
  const { h, frag, esc, BEAT } = V;
  const SW = 1760, SH = 842, AW = 1000, AH = 478, BASE = SW / AW;

  const ico = (d) => `<svg class="wb-ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const P = {   // paths from app/wb/icons.py and app/www/*.js
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    clip: '<path d="M20 11.5 12.2 19.3a5 5 0 0 1-7.1-7.1l8.1-8.1a3.3 3.3 0 0 1 4.7 4.7l-8.1 8.1a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"/>',
    bubble: '<path d="M12 4c4.4 0 8 2.9 8 6.5S16.4 17 12 17c-.9 0-1.8-.1-2.6-.3L5 19l1.2-3.4C4.8 14.4 4 12.6 4 10.5 4 6.9 7.6 4 12 4z"/><path d="M12 13.5v.01M12 7.5c1.1 0 2 .7 2 1.6 0 1.4-2 1.4-2 2.9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.6-5.9L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M12 8v4.5l3 1.8"/>',
    back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    comment: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    quote: '<path d="M5 12h9M5 8h14M5 16h6"/><path d="m16 14 3 3-3 3"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>', check: '<path d="m5 12 5 5 9-10"/>',
    summary: '<path d="M9 7h10M9 12h10M9 17h6"/><path d="M5 7h.01M5 12h.01M5 17h.01"/>',
  };
  const ICON = {};
  for (const k in P) ICON[k] = ico(P[k]);
  const LOGO = '<svg class="wb-logo" viewBox="0 0 24 24" aria-hidden="true"><path class="b" d="M3 5h8v5h5v5h5"/><path class="a" d="M3 5h4v6h5v5h4v4h5"/></svg>';
  const fileIcon = (name) => ICON[{ md: "doc", R: "code", r: "code", png: "image", csv: "table", xpt: "table", sas7bdat: "table", xlsx: "table", docx: "doc" }[name.split(".").pop()] || "file"];

  // ---------------------------------------------------------------- captions (from the shot table)
  // ---------------------------------------------------------------- title cards and captions (from the shot table)
  // The picture (app window, or any element) leaves while a title card is up and comes back for the content.
  function stageFx(s, el) {
    const shots = Object.values(s.shots);
    s.init(el, { opacity: 0, y: 80, scale: 0.95 });
    shots.forEach((S, i) => {
      if (S.intro > 0 && !(S.small && i > 0)) s.cue("rise", Math.max(0.1, S.at - 0.6));
      if (i === 0) s.to(el, { opacity: 1, y: 0, scale: 1 }, Math.max(0.1, S.at - 0.6), 0.6, "back");
      else if (S.intro > 0 && S.small) {
        // a supporting feature: the picture stays where it is, dimmed, while its headline is read over it
        s.to(el, { opacity: 0.1, scale: 0.975 }, S.t0 - 0.22, 0.3, "io"); s.to(el, { opacity: 1, scale: 1 }, S.at - 0.55, 0.5, "out");
      } else if (S.intro > 0) { s.to(el, { opacity: 0, y: 60, scale: 0.96 }, S.t0 - 0.26, 0.26, "in"); s.to(el, { opacity: 1, y: 0, scale: 1 }, S.at - 0.6, 0.6, "back"); }
      else s.fromTo(el, { scale: 0.985 }, { scale: 1 }, S.t0, 0.4, "back");   // a small kick when the shot changes
    });
    s.to(el, { opacity: 0, y: -50 }, s.dur - 0.26, 0.26, "in");
  }
  // Headlines arrive word by word, tumbling into place; key words (*...*) are marked.
  V.captionLog = [];
  function captions(s) {
    const cap = h("div.cap");
    s.root.append(cap);
    const act = s.act, f = s.root.getBoundingClientRect();
    if (act.kicker) { const k = h("div.kicker", act.kicker); cap.append(k); s.fromTo(k, { opacity: 0, x: -16 }, { opacity: 1, x: 0 }, 0.2, 0.4); s.to(k, { opacity: 0 }, s.dur - 0.25, 0.2); }
    for (const sh of act.shots) {
      if (!sh.head) continue;
      const S = s.shots[sh.id], num = !!sh.kicker;
      const head = h("div.head" + (sh.small ? ".small" : "") + (num ? ".numbered" : ""));
      const words = [];
      sh.head.split("*").forEach((part, i) => part.split(/(?<=\s)/).forEach((w) => { if (!w) return; const el = h("span.w" + (i % 2 ? ".hi" : ""), i % 2 ? h("i", w) : w); head.append(el); words.push(el); }));
      const numEl = num ? h("div.kicker.num", sh.kicker) : null;
      const sub = sh.sub ? h("div.sub" + (num ? ".numbered" : ""), sh.sub) : null;
      cap.append(...[numEl, head, sub].filter(Boolean));
      const z = S.end - 0.25, a = S.t0 + 0.15, plan = V.cardPlan(sh), dock = S.at - V.DOCK;
      const log = { shot: sh.id, pieces: [] };
      if (S.intro > 0) {
        // the card: headline in the middle, as large as fits; under it the second line, one sentence per line
        const r = head.getBoundingClientRect(), K = Math.min(sh.small ? 1.6 : 1.85, 1560 / r.width);
        const n = plan.lines.length, cy = (sh.small ? 600 : 500) - n * 40;
        s.init(head, { x: V.W / 2 - (r.left - f.left + r.width / 2), y: cy - (r.top - f.top + r.height / 2), scale: K });
        words.forEach((w, i) => s.fromTo(w, { opacity: 0, y: 46, rot: i % 2 ? 13 : -13, scale: 0.9 }, { opacity: 1, y: 0, rot: 0, scale: 1 }, a + i * 0.09, 0.45, "back"));
        log.pieces.push({ what: "headline", words: plan.nh, hold: dock - (S.t0 + plan.headIn), need: 0.5 + 0.3 * plan.nh });
        // each sentence is typed on its own line, with a caret; the line has its final width from the start, so nothing jumps
        const lines = plan.lines.map((ln) => { const t = h("span", ln.text), c = h("span.ccaret"), el = h("div.csub", t, c); el._t = t; el._c = c; return el; });
        const box = h("div.csubs", { style: { top: cy + (r.height * K) / 2 + 38 + "px" } }, lines);
        s.root.append(box);
        lines.forEach((el) => { el.style.width = el.getBoundingClientRect().width + 2 + "px"; el._t.textContent = ""; });
        const spans = plan.lines.map((L) => [S.t0 + L.at, S.t0 + L.at + L.typed]);
        lines.forEach((el, i) => {
          s.type(el._t, plan.lines[i].text, spans[i][0], V.TYPE_CPS);
          s.cue("type", spans[i][0], plan.lines[i].typed);
          log.pieces.push({ what: "line " + (i + 1), words: plan.lines[i].words, hold: dock - spans[i][1], need: plan.lines[i].need });
        });
        s.fn((t) => lines.forEach((el, i) => {      // the caret sits on the line being typed; on the last one it stays and blinks
          const [a0, a1] = spans[i], lastLine = i === lines.length - 1, on = t >= a0 - 0.05 && (t < a1 + 0.2 || (lastLine && t < dock));
          el._c.style.opacity = on && (t < a1 || Math.floor((t - a1) * 2.4) % 2 === 0) ? 1 : 0;
        }));
        // read: everything goes to the top left as a reminder, and the picture comes in
        s.to(lines, { opacity: 0, y: -18 }, dock - 0.05, 0.3, "in");
        s.to(head, { x: 0, y: 0, scale: 1 }, dock, 0.6, "io");
        if (numEl) s.fromTo(numEl, { opacity: 0, scale: 0.2, rot: -90 }, { opacity: 1, scale: 1, rot: 0 }, S.at - 0.4, 0.4, "back");
        if (sub) s.fromTo(sub, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, S.at - 0.3, 0.4);
      } else {
        words.forEach((w, i) => s.fromTo(w, { opacity: 0, y: 22, rot: i % 2 ? 6 : -6 }, { opacity: 1, y: 0, rot: 0 }, a + i * 0.06, 0.34, "back"));
        if (sub) s.fromTo(sub, { opacity: 0, x: -24 }, { opacity: 1, x: 0 }, a + words.length * 0.06 + 0.2, 0.4);
      }
      s.to([head, sub, numEl].filter(Boolean), { opacity: 0, y: -12 }, z, 0.2, "in");
      V.captionLog.push(log);
    }
    return cap;
  }
  const fx = () => {};

  // ---------------------------------------------------------------- R syntax colours
  function hlR(line) {
    const re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(function|if|else|for|while|return|library|TRUE|FALSE|NA|NULL)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_.][A-Za-z0-9_.]*)(?=\()/g;
    let out = "", i = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(i, m.index));
      const c = m[1] ? "c" : m[2] ? "s" : m[3] ? "k" : m[4] ? "n" : "f";
      out += `<span class="tk-${c}">${esc(m[0])}</span>`;
      i = m.index + m[0].length;
    }
    return out + esc(line.slice(i));
  }

  // a line of code as bars: one per word, indented like the line
  function barsR(line) {
    if (!line.trim()) return "";
    const ind = line.length - line.trimStart().length, comment = line.trim().startsWith("#");
    const words = comment ? [line.trim()] : line.trim().split(/\s+/);
    return `<i style="width:${ind * 7.5}px;background:none"></i>` + words.map((w) => `<i style="width:${Math.max(10, w.length * 6.6)}px${comment ? ";opacity:.6" : ""}"></i>`).join("");
  }
  const bars = (...ws) => ws.map((w) => `<i class="bar" style="width:${w}%"></i>`).join("");

  // ---------------------------------------------------------------- the app window
  // o: {session, tabs: [{id, title, locked}], active}
  function app(s, o) {
    const stage = h("div.stage"), cam = h("div.cam"), el = h("div.app");
    stage.append(cam); cam.append(el); s.root.append(stage);
    s.init(cam, { x: 0, y: 0, scale: BASE });
    stageFx(s, stage);

    const tabsEl = h("div.wb-tabs", { id: "wb-tabs" });
    const newBtn = h("button.wb-new", { html: ICON.plus });
    const closedBtn = h("button.wb-closed-btn", { html: `${ICON.history}<span>Recently closed</span><span class="n">1</span>` });
    const closedMenu = h("div.wb-menu.wb-closed-menu");
    const closed = h("div.wb-closed", closedBtn, closedMenu);
    const sess = h("div", { id: "wb-sessbar" }, h("button.sess-btn", { html: `${LOGO}<span class="nm">${esc(o.session)}</span>${ICON.down}` }));
    const top = h("div.wb-topbar", sess, tabsEl, newBtn, closed);
    const panes = h("div.wb-panes");
    const toast = h("div.wb-toast");
    el.append(top, panes, toast);
    s.hide(closedBtn); s.hide(closedMenu); s.hide(toast);

    const A = { s, stage, cam, el, top, tabsEl, newBtn, closedBtn, closedMenu, toast, panesEl: panes, tabs: {}, panes: {}, order: [], chats: [] };

    A.addTab = (t) => {
      const lock = h("button.wb-lock", { html: t.locked ? ICON.lock : ICON.unlock });
      const title = h("span.wb-title", t.title);
      const x = h("button.wb-x", { html: ICON.x });
      const tab = h("div.wb-tab" + (t.locked ? ".protected" : ""), lock, title, x);
      tabsEl.append(tab);
      const pane = h("div.wb-pane", { style: { "--l": t.left || 40 } });
      panes.append(pane);
      A.tabs[t.id] = { el: tab, lock, title, x, pane };
      A.order.push(t.id);
      return A.tabs[t.id];
    };
    // switch tab: instant, like the app
    A.activate = (id, at = 0) => {
      for (const k of A.order) {
        const on = k === id;
        if (at <= 0) { A.tabs[k].el.classList.toggle("active", on); s.init(A.tabs[k].pane, { opacity: on ? 1 : 0 }); }
        else { s.cls(A.tabs[k].el, "active", at, on); s.set(A.tabs[k].pane, { opacity: on ? 1 : 0 }, at); }
      }
    };
    // a tab that is not there from the start: takes no room until `at`
    A.tabAppears = (id, at) => { const t = A.tabs[id].el; s.init(t, { show: 0 }); s.set(t, { show: 1 }, at); s.fromTo(t, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1 }, at, 0.32, "back"); };
    A.tabGone = (id, at) => { s.set(A.tabs[id].el, { show: 0 }, at); };

    // position of an element's point in app coordinates (measured now, in the build state)
    A.xy = (target, fx = 0.5, fy = 0.5, o2 = {}) => {
      const hidden = (o2.without || []).map((e) => [e, e.style.display]);
      hidden.forEach(([e]) => (e.style.display = "none"));
      const a = el.getBoundingClientRect(), r = target.getBoundingClientRect();
      hidden.forEach(([e, d]) => (e.style.display = d));
      return [r.left - a.left + r.width * fx, r.top - a.top + r.height * fy];
    };
    // camera: put a point (or an element's centre) in the middle of the stage at a zoom
    A.focus = (target, zoom, at, dur = 0.9, e = "io") => {
      let cx = AW / 2, cy = AH / 2;
      if (Array.isArray(target)) [cx, cy] = target;
      else if (target) [cx, cy] = A.xy(target);
      const k = BASE * zoom;
      const tx = Math.min(0, Math.max(SW - AW * k, SW / 2 - cx * k)), ty = Math.min(0, Math.max(SH - AH * k, SH / 2 - cy * k));
      return s.to(cam, { x: tx, y: ty, scale: k }, at, dur, e);
    };
    A.toastAt = (msg, at, hold = 2.2) => {
      s.text(toast, msg, at);
      s.fromTo(toast, { opacity: 0, y: 6 }, { opacity: 1, y: 0 }, at, 0.2);
      s.to(toast, { opacity: 0 }, at + hold, 0.2);
    };
    // must be called after everything is in the DOM: chats compute their scrolling
    A.done = () => A.chats.forEach((c) => c.done());

    (o.tabs || []).forEach(A.addTab);
    A.cur = cursor(s, A);
    return A;
  }

  // ---------------------------------------------------------------- pointer
  function cursor(s, A) {
    const ring = h("div.cur-ring");
    const el = h("div.cur", ring, frag('<svg width="20" height="24" viewBox="0 0 20 24"><path d="M2 2v17.2l4.6-4.3 3.1 7 2.9-1.3-3.1-6.9H16z" fill="#141413" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'));
    A.el.append(el);
    s.init(el, { opacity: 0, x: AW * 0.6, y: AH * 0.7, scale: 1 });
    const C = { el, pos: [AW * 0.6, AH * 0.7] };
    C.show = (at, xy) => { if (xy) { s.set(el, { x: xy[0], y: xy[1] }, at); C.pos = xy; } s.to(el, { opacity: 1 }, at, 0.2); };
    C.hide = (at) => s.to(el, { opacity: 0 }, at, 0.2);
    C.move = (xy, at, dur = 0.6) => { C.pos = xy; return s.to(el, { x: xy[0], y: xy[1] }, at, dur, "io"); };
    C.to = (target, at, dur = 0.6, fx = 0.5, fy = 0.5, o2) => C.move(A.xy(target, fx, fy, o2), at, dur);
    C.click = (at) => {
      s.cue("click", at);
      s.to(el, { scale: 0.82 }, at - 0.06, 0.06, "lin"); s.to(el, { scale: 1 }, at, 0.16, "out");
      s.fromTo(ring, { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.25 }, at, 0.42, "out");
      return at;
    };
    return C;
  }

  // ---------------------------------------------------------------- a tab's pane: chat | splitter | display
  function pane(s, A, id) {
    const T = A.tabs[id], el = T.pane;
    const chatEl = h("div.wb-chat"), disp = h("div.wb-display");
    const hideChat = h("button.wb-sp-btn", { html: ICON.left }), hideDisp = h("button.wb-sp-btn", { html: ICON.right });
    const split = h("div.wb-splitter", hideChat, hideDisp);
    const showChat = h("button.wb-restore.wb-restore-chat", "Show chat");
    el.append(chatEl, split, disp, showChat);
    const Pn = { id, el, chatEl, disp, split, hideChat, hideDisp, showChat };
    Pn.chat = chat(s, A, chatEl);
    Pn.display = display(s, A, disp);
    // a white veil over the side the shot is not about (while the camera is close)
    const veil = { chat: h("div.veil"), disp: h("div.veil") };
    chatEl.append(veil.chat); disp.append(veil.disp);
    s.init(veil.chat, { opacity: 0 }); s.init(veil.disp, { opacity: 0 });
    Pn.dim = (side, at, on = true, dur = 0.5) => s.to(veil[side], { opacity: on ? 0.66 : 0 }, at, dur, "io");
    // freeze the chat's width so hiding it clips instead of re-wrapping
    Pn.freeze = () => { const w = chatEl.getBoundingClientRect().width; [...chatEl.children].forEach((c) => (c.style.width = w - 20 + "px")); chatEl.style.overflow = "hidden"; };
    A.panes[id] = Pn;
    return Pn;
  }

  // ---------------------------------------------------------------- chat column
  function chat(s, A, host) {
    const inner = h("div.chat-inner"), scroll = h("div.chat-scroll", inner);
    const spin = h("span.spin"), ptxt = h("span.txt"), pmeta = h("span.meta");
    const prog = h("div.wb-progress", spin, ptxt, pmeta);
    const txt = h("span.t"), ph = h("span.ph", "Tell Claude what to do…"), caret = h("span.caret"), pre = h("span.pre.ref");   // pre: a quoted reference in the input
    const send = h("div.send", { html: ico(P.arrowUp).replace('class="wb-ico"', "") + '<span class="sq"></span>' });
    const input = h("div.tiptap", ph, pre, txt, caret, send);
    s.init(pre, { show: 0 });
    const clip = h("button.wb-attach", { html: ICON.clip }), btw = h("button.wb-attach", { html: ICON.bubble });
    const ctx = h("span.ctx");
    const tools = h("div.wb-tools", clip, btw, ctx);
    const composer = h("div.composer", prog, input, tools);
    host.append(scroll, composer);
    s.hide(prog);

    const C = { host, inner, scroll, composer, prog, input, txt, ph, caret, send, pre, clip, btw, ctx, tools, events: [], work: [], typing: [] };
    A.chats.push(C);
    C.user = (html) => { const m = h("div.shiny-chat-user-message", { html }); inner.append(m); s.hide(m); return m; };
    C.bot = (html) => { const m = h("div.shiny-chat-message", { html }); inner.append(m); s.hide(m); return m; };
    // already there when the scene starts
    C.past = (el) => { s.init(el, { opacity: 1 }); C.events.push({ el, at: -1 }); return el; };
    C.show = (el, at, dur = 0.25) => { s.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0 }, at, dur); C.events.push({ el, at }); return at + dur; };
    // a reply arrives block by block
    C.stream = (el, at, gap = 0.28) => {
      s.init(el, { opacity: 1 });
      [...el.children].forEach((kid, i) => { s.fromTo(kid, { opacity: 0, y: 6 }, { opacity: 1, y: 0 }, at + i * gap, 0.22); C.events.push({ el: kid, at: at + i * gap }); });
      return at + el.children.length * gap;
    };
    // type into the input; returns when typing ends
    C.type = (text, at, cps = 19, pre = "") => { const end = s.type(txt, text, at, cps, pre); C.typing.push([at, end]); s.cue("type", at, end - at); return end; };
    C.clear = (at) => s.text(txt, "", at);
    // type, then send: the input empties and the bubble appears
    C.send = (el, text, at, cps = 19, pause = 0.4) => {
      const end = C.type(text, at, cps);
      C.clear(end + pause);
      C.show(el, end + pause);
      s.cue("send", end + pause);
      return end + pause;
    };
    // Claude at work: steps = [[offset seconds, text], ...]; secs = what the elapsed counter ends at
    C.busy = (at, end, steps, secs) => {
      s.showAt(prog, at); s.set(prog, { opacity: 0 }, end);
      steps.forEach(([off, t]) => s.text(ptxt, t, at + off));
      C.work.push({ at, end, steps, secs });
    };
    C.stepsLine = (botEl, label) => { const d = frag(`<details class="wb-steps"><summary>${esc(label)}</summary></details>`); botEl.append(d); return d; };

    s.fn((t) => {
      const has = txt.textContent.length > 0 || pre.style.display !== "none";
      ph.style.display = has ? "none" : "";
      let w = null;
      for (const k of C.work) if (t >= k.at && t < k.end) w = k;
      let typing = false;
      for (const [a, b] of C.typing) if (t >= a && t < b + 0.35) typing = true;
      caret.style.opacity = typing ? 1 : has && Math.floor(t * 2) % 2 === 0 ? 1 : 0;
      send.className = "send" + (w ? " busy" : has ? " ready" : "");
      if (w) {
        spin.style.transform = `rotate(${(t * 450) % 360}deg)`;
        let n = 0;
        for (const [off] of w.steps) if (t >= w.at + off) n++;
        const sec = Math.round(((t - w.at) / (w.end - w.at)) * w.secs);
        pmeta.textContent = `step ${Math.max(1, n)}, ${sec}s`;
      }
    });

    C.done = () => {
      const vh = scroll.clientHeight, top = inner.getBoundingClientRect().top;
      const ev = C.events.slice().sort((a, b) => a.at - b.at);
      let bottom = 0, cur = 0, started = false;
      for (const e of ev) {
        bottom = Math.max(bottom, e.el.getBoundingClientRect().bottom - top);
        const target = Math.max(0, Math.round(bottom + 12 - vh));
        if (e.at < 0) { cur = target; continue; }
        if (!started) { s.init(inner, { y: -cur }); started = true; }
        if (target !== cur) { s.to(inner, { y: -target }, e.at, 0.32, "out"); cur = target; }
      }
      if (!started) s.init(inner, { y: -cur });
      C.scrollEnd = cur;
    };
    return C;
  }

  // ---------------------------------------------------------------- display area: file button + views
  function display(s, A, host) {
    const btn = h("button.fp-btn"), pop = h("div.fp-pop");
    const fpick = h("div.wb-fpick", btn, pop);
    const bWord = h("button.btn", "Word"), bHtml = h("button.btn", "HTML"), bMd = h("button.btn", "Markdown");
    const exp = h("div.wb-doc-bar", h("span.lbl", "Export"), bWord, bHtml, bMd);
    const files = h("div.wb-files", fpick, exp), views = h("div.views");
    host.append(files, views);
    s.hide(pop); s.hide(exp);
    const D = { host, files, btn, pop, views, v: {}, cur: null, exp, bWord, bHtml, bMd };
    const btnHtml = (name, n, where) => !n ? "" : fileIcon(name) + `<span class="fp-name">${esc(name)}</span>` + (where ? `<span class="fp-where">${esc(where)}</span>` : "") +
      '<svg class="fp-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>' + `<span class="fp-count">${n} file${n === 1 ? "" : "s"}</span>`;
    D.add = (key, el) => { el.classList.add("view"); views.append(el); D.v[key] = el; s.init(el, { opacity: 0 }); return el; };
    // which file is shown from time `at` (at <= 0: from the start)
    D.open = (key, name, n, at = 0, where) => {
      if (at <= 0) { btn.innerHTML = btnHtml(name, n, where); for (const k in D.v) s.init(D.v[k], { opacity: k === key ? 1 : 0 }); }
      else { s.html(btn, btnHtml(name, n, where), at); for (const k in D.v) s.set(D.v[k], { opacity: k === key ? 1 : 0 }, at); }
      D.cur = key;
    };
    // the dropdown: groups = [[group label, [file names]]], sel = selected name
    D.menu = (groups, sel, changed = []) => {
      pop.innerHTML = '<input class="fp-search" placeholder="Find a file…">' + '<div class="fp-list">' + groups.map(([g, names]) =>
        `<div class="fp-group">${esc(g)}</div>` + names.map((n) => `<div class="fp-item${n === sel ? " sel" : ""}" data-n="${esc(n)}">${fileIcon(n)}<span class="fp-name">${esc(n)}</span>${changed.includes(n) ? '<span class="fp-dot"></span>' : ""}</div>`).join("")).join("") + "</div>";
      return (n) => pop.querySelector(`.fp-item[data-n="${n}"]`);
    };
    D.empty = () => D.add("empty", h("div", h("div.wb-empty", { html: '<svg viewBox="0 0 132 96" fill="none"><rect x="1" y="1" width="130" height="94" rx="8" stroke="#e6e2d6" stroke-width="1.5"/><path d="M16 18h44M16 28h28" stroke="#d1ccbd" stroke-width="3" stroke-linecap="round"/><path d="M16 80h100M16 80V42" stroke="#d1ccbd" stroke-width="1.5" stroke-linecap="round"/><path d="M16 46h18v9h16v8h20v7h22v5h24" stroke="#d97757" stroke-width="2" stroke-linecap="square"/><path d="M16 46h28v6h24v6h22v6h26" stroke="#d97757" stroke-width="2" stroke-linecap="square" opacity=".35"/></svg><span>Report, plots and code appear here</span>' })));
    return D;
  }

  // ---------------------------------------------------------------- a markdown document with comments
  function doc(s, A, html, o = {}) {
    const inner = h("div.doc-inner", { html });
    const docEl = h("div.anno-doc.md-view", inner);
    const cards = h("div.anno-cards"), side = h("aside.anno-side", h("div.anno-side-hd", "Comments"), cards);
    const root = h("div.anno-root" + (o.comments ? "" : ".no-comments"), docEl, side);
    const toolbar = h("div.anno-toolbar", { html: `<button>${ICON.comment}<span>Comment</span></button><button>${ICON.quote}<span>Quote in chat</span></button>` });
    const el = h("div", h("div.wb-doc", h("div.doc-scroll", root)), toolbar);
    s.hide(toolbar);
    const Dc = { el, inner, docEl, root, side, cards, toolbar, tbComment: toolbar.children[0], tbQuote: toolbar.children[1] };
    Dc.q = (sel) => inner.querySelector(sel);
    Dc.scrollTo = (y, at, dur = 0.7) => (at <= 0 ? s.init(inner, { y: -y }) : s.to(inner, { y: -y }, at, dur, "io"));
    // sweep a selection over a span word by word (works across line breaks); returns the word spans
    Dc.words = (span) => {
      const parts = span.textContent.split(/(\s+)/);
      span.textContent = "";
      return parts.map((p) => { if (/^\s+$/.test(p)) { span.append(p); return null; } const w = h("span.w", p); span.append(w); return w; }).filter(Boolean);
    };
    Dc.select = (span, at, dur = 0.8) => {
      const ws = span._w || (span._w = Dc.words(span));
      // the space between words belongs to the selection too: colour the span itself once it is complete
      ws.forEach((w, i) => s.cls(w, "hl-sel", at + (dur * i) / ws.length, true));
      s.cls(span, "hl-sel", at + dur, true);
      return at + dur;
    };
    Dc.unselect = (span, at) => { (span._w || []).forEach((w) => s.cls(w, "hl-sel", at, false)); s.cls(span, "hl-sel", at, false); };
    // the Comment | Quote toolbar above an element (position measured in the element's place at build time)
    Dc.toolbarAt = (target, at, dy = 0) => {
      const e = el.getBoundingClientRect(), r = target.getBoundingClientRect();
      const x = r.left - e.left + Math.min(r.width, 240) / 2 - 100, y = r.top - e.top - 40 + dy;
      s.set(toolbar, { left: x, top: y }, at - 0.01);
      s.fromTo(toolbar, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, at, 0.28, "back");
      return [x, y];
    };
    // comment card
    Dc.card = (c) => {
      const badge = h("span.badge"), body = h("div.body", c.body || ""), reply = h("div.reply");
      const ask = h("button", "Ask Claude"), resolve = h("button", "Resolve"), del = h("button.quiet", "Delete");
      const quote = h("blockquote", c.quote);
      const card = h("div.anno-card", h("div.hd", h("span.num", "#" + c.num), badge), quote, body, reply, h("div.anno-actions", ask, resolve, del));
      cards.append(card);
      s.hide(badge); s.init(reply, { show: 0 });
      return { card, badge, body, reply, ask, resolve, del, quote };
    };
    Dc.draft = (quote) => {
      const text = h("div.draft-text"), cancel = h("button", "Cancel"), save = h("button.primary", "Save comment");
      const card = h("div.anno-card.draft", h("blockquote", quote), text, h("div.anno-actions", cancel, save));
      cards.append(card);
      return { card, text, cancel, save };
    };
    return Dc;
  }

  // ---------------------------------------------------------------- code with changes
  // rows: [[mark, line number or "", code]] with mark " " | "+" | "-"
  function code(s, A, rows, o = {}) {
    const toggle = h("label.cv-toggle", { html: `<span class="box">${ico(P.check).replace('class="wb-ico"', "")}</span> Show changes` });
    const stat = h("span.cv-stat", { html: o.stat || "" });
    const older = h("button.cv-nav", { html: ICON.left }), newer = h("button.cv-nav", { html: ICON.right });
    const pick = h("span.cv-pick", o.pick || "");
    const hist = h("span.cv-hist", h("button.cv-nav", { html: ICON.up }), h("button.cv-nav", { html: ICON.down }), h("span.cv-sep"), older, pick, newer);
    const bar = h("div.cv-bar", toggle, stat, h("span.cv-spacer"), hist);
    const body = h("div.cv-body"), inner = h("div");
    body.append(inner);
    const lines = [];
    for (const r of rows) {
      if (r[0] === "fold") { inner.append(h("div.cv-fold", `⋯ ${r[1]} unchanged lines`)); continue; }
      const [mk, ln, text, dim] = r;
      const row = h("div.cv-row" + (mk === "+" ? ".add" : mk === "-" ? ".del" : "") + (dim ? ".dim" : ""),
        h("span.cv-ln.new", mk === "-" ? "" : String(ln)), h("span.cv-mk", mk === " " ? "" : mk === "-" ? "−" : "+"), h("code.hljs", { html: (dim ? barsR(text) : hlR(text)) || " " }));
      inner.append(row);
      lines.push({ row, ln, mk });
    }
    const quote = h("div.cv-quote", { html: `<button>${ICON.comment}<span>Comment</span></button><button>${ICON.quote}<span>Quote in chat</span></button>` });
    const cards = h("div.anno-cards"), side = h("aside.anno-side.cv-side", h("div.anno-side-hd", "Comments"), cards);
    side.hidden = !o.comments;
    const main = h("div.cv-main", body, side);
    const el = h("div", h("div.cv-root", { style: "height:100%" }, bar, main, quote));
    s.hide(quote);
    if (o.plain) bar.classList.add("plain");
    return { el, bar, toggle, stat, hist, older, newer, pick, body, inner, lines, quote, qComment: quote.children[0], qQuote: quote.children[1], side, cards,
      row: (ln) => lines.find((l) => l.ln === ln && l.mk !== "-").row };
  }

  // ---------------------------------------------------------------- Kaplan-Meier figure from the data
  const COLS = { Male: "#4f7fb0", Female: "#d97757" };
  function km(K, o = {}) {
    const Wd = o.w || 640, Ht = o.h || 400, L = 58, R = 16, T = 34, Bm = 46;
    const ticks = K.risk_times, tmax = ticks[ticks.length - 1] * 1.05;
    const X = (t) => L + (Math.min(t, tmax) / tmax) * (Wd - L - R), Y = (p) => T + (1 - p) * (Ht - T - Bm);
    const step = (c, key) => { let d = `M${X(0).toFixed(1)} ${Y(c[key][0]).toFixed(1)}`; for (let i = 1; i < c.time.length; i++) d += `H${X(c.time[i]).toFixed(1)}V${Y(c[key][i]).toFixed(1)}`; return d; };
    const band = (c) => {
      let d = `M${X(0)} ${Y(c.upper[0])}`;
      for (let i = 1; i < c.time.length; i++) d += `H${X(c.time[i]).toFixed(1)}V${Y(c.upper[i]).toFixed(1)}`;
      for (let i = c.time.length - 1; i >= 1; i--) d += `V${Y(c.lower[i]).toFixed(1)}H${X(c.time[i - 1]).toFixed(1)}`;
      return d + `V${Y(c.lower[0])}Z`;
    };
    let g = "";
    for (const p of [0, 0.25, 0.5, 0.75, 1]) g += `<path class="grid" d="M${L} ${Y(p)}H${Wd - R}"/><text x="${L - 8}" y="${Y(p) + 4}" text-anchor="end" font-size="12">${p * 100}%</text>`;
    for (const t of ticks) g += `<text x="${X(t)}" y="${Ht - Bm + 18}" text-anchor="middle" font-size="12">${t}</text>`;
    g += `<path class="ax" d="M${L} ${T}V${Ht - Bm}H${Wd - R}"/>`;
    g += `<text x="${(L + Wd - R) / 2}" y="${Ht - 8}" text-anchor="middle" font-size="13">Time (days)</text>`;
    g += `<text transform="translate(14 ${(T + Ht - Bm) / 2}) rotate(-90)" text-anchor="middle" font-size="13">Survival probability</text>`;
    let cens = "";
    for (const sx of ["Male", "Female"]) {
      const c = K.curves[sx];
      g += `<path class="band b-${sx}" d="${band(c)}" fill="${COLS[sx]}" opacity="0.14"/>`;
      g += `<path class="curve c-${sx}" pathLength="1" d="${step(c, "surv")}" stroke="${COLS[sx]}"/>`;
      c.time.forEach((t, i) => { if (c.censor[i] > 0) cens += `<path d="M${X(t).toFixed(1)} ${(Y(c.surv[i]) - 4).toFixed(1)}v8M${(X(t) - 4).toFixed(1)} ${Y(c.surv[i]).toFixed(1)}h8" stroke="${COLS[sx]}" stroke-width="1.2"/>`; });
    }
    g += `<g class="cens">${cens}</g>`;
    g += `<g class="legend"><path d="M${L + 8} 16h22" stroke="${COLS.Male}" stroke-width="2.4"/><text x="${L + 36}" y="20" font-size="13">Male</text>` +
      `<path d="M${L + 90} 16h22" stroke="${COLS.Female}" stroke-width="2.4"/><text x="${L + 118}" y="20" font-size="13">Female</text>` +
      `<text x="${Wd - R}" y="20" text-anchor="end" font-size="13">Log-rank ${K.logrank.p < 0.001 ? "p < 0.001" : "p = " + K.logrank.p.toFixed(4)}</text></g>`;
    return frag(`<svg class="km" viewBox="0 0 ${Wd} ${Ht}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`);
  }
  // draw the curves on
  function kmDraw(s, svg, at, dur = 1.4) {
    const cv = svg.querySelectorAll(".curve"), rest = svg.querySelectorAll(".band, .cens");
    cv.forEach((c, i) => s.fromTo(c, { draw: 0 }, { draw: 1 }, at + i * 0.15, dur, "io"));
    s.fromTo([...rest], { opacity: 0 }, { opacity: 1 }, at + dur * 0.75, 0.5);
    rest.forEach((r) => { if (r.classList.contains("band")) s.fromTo(r, { opacity: 0 }, { opacity: 0.14 }, at + dur * 0.75, 0.5); });
    return at + dur + 0.15;
  }

  const tex = (src, display) => katex.renderToString(src, { displayMode: !!display, throwOnError: false });

  return { SW, SH, AW, AH, BASE, ICON, LOGO, ico, P, fileIcon, captions, fx, stageFx, hlR, bars, app, pane, chat, display, doc, code, km, kmDraw, tex, COLS };
})();
