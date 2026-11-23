// Engine: the whole picture is a pure function of time.
// Scenes register tweens while they are built; seek(t) evaluates every track at t and writes styles.
// Nothing here uses timers, CSS transitions or the wall clock (the dev player in main.js does, for preview only).
window.V = (function () {
  const FPS = 30, BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4;   // 1 beat = 18 frames, 1 bar = 72 frames
  const W = 1920, H = 1080;

  const EASE = {
    lin: (p) => p,
    out: (p) => 1 - Math.pow(1 - p, 3),
    in: (p) => p * p * p,
    io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    back: (p) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2),
    soft: (p) => 1 - Math.pow(1 - p, 2),
  };

  // ---------------------------------------------------------------- DOM helpers
  // h("div.a.b", {attrs}, ...children) — attrs: html, text, style (object or string), anything else = attribute
  function h(spec, a, ...kids) {
    const parts = spec.split(".");
    const el = document.createElement(parts[0] || "div");
    if (parts.length > 1) el.className = parts.slice(1).join(" ");
    if (a && typeof a === "object" && !(a instanceof Node) && !Array.isArray(a)) {
      for (const k in a) {
        const v = a[k];
        if (v == null || v === false) continue;
        if (k === "html") el.innerHTML = v;
        else if (k === "text") el.textContent = v;
        else if (k === "style") {
          if (typeof v === "string") el.style.cssText = v;
          else for (const s in v) s.startsWith("--") ? el.style.setProperty(s, v[s]) : (el.style[s] = v[s]);
        } else el.setAttribute(k, v);
      }
    } else kids.unshift(a);
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const frag = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------------------------------------------------------------- values
  const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  function mix(a, b, p) {
    const x = rgb(a), y = rgb(b);
    return "rgb(" + x.map((v, i) => Math.round(v + (y[i] - v) * p)).join(",") + ")";
  }
  const TRANSFORM = { x: 0, y: 0, scale: 1, sx: 1, sy: 1, rot: 0 };
  const PX = { w: "width", h: "height", left: "left", top: "top", mh: "maxHeight", mw: "maxWidth" };
  const COLOR = { bg: "backgroundColor", color: "color", border: "borderColor" };
  function dflt(prop, el) {
    if (prop in TRANSFORM) return TRANSFORM[prop];
    if (prop === "opacity" || prop === "show") return 1;
    if (prop.startsWith("cls:")) return el.classList.contains(prop.slice(4));
    if (prop === "text") return el.textContent;
    if (prop === "html") return el.innerHTML;
    return 0;
  }

  // ---------------------------------------------------------------- title cards
  // All the words of a shot are read on its title card, before the picture comes in:
  // the headline arrives word by word, then each sentence of the second line on its own line.
  // Reading time: READ_BASE + READ_WORD per word for each piece, counted from when it has arrived.
  const READ_BASE = 0.5, READ_WORD = 0.3, DOCK = 0.85, TYPE_CPS = 32;
  const nWords = (t) => t.replace(/\*/g, "").trim().split(/\s+/).length;
  function cardPlan(sh) {
    if (!sh.head) return { bars: 0, lines: [] };
    const nh = nWords(sh.head), headIn = 0.15 + 0.09 * nh + 0.4;
    const parts = sh.sub ? sh.sub.match(/[^.?!]+[.?!]+[”"]?\s*/g).map((x) => x.trim()) : [];
    let at = headIn + 0.25, end = headIn + READ_BASE + READ_WORD * nh;
    const lines = parts.map((text) => {
      // typed out (one reads along), then a little time to finish reading before the next sentence starts
      const w = nWords(text), typed = text.length / TYPE_CPS, line = { text, at, words: w, typed, need: 0.4 + 0.2 * w };
      end = Math.max(end, at + typed + line.need);
      at += typed + 0.3 + 0.1 * w;
      return line;
    });
    return { nh, headIn, lines, readEnd: end, bars: Math.ceil((end + DOCK) / (BAR / 2) - 1e-6) / 2 };
  }

  // ---------------------------------------------------------------- scene
  class Scene {
    constructor(act) {
      this.id = act.id;
      this.act = act;
      this.shots = {};
      let b = 0;
      for (const sh of act.shots) {
        // every shot with a headline opens with its title card (as long as its words need, see cardPlan);
        // its content starts at `at`. Key shots and `small` (supporting) ones differ in how the card looks, not in the order.
        const intro = sh.intro !== undefined ? sh.intro : cardPlan(sh).bars;
        this.shots[sh.id] = Object.assign({}, sh, { t0: b * BAR, intro: intro * BAR, at: (b + intro) * BAR, dur: sh.bars * BAR, end: (b + intro + sh.bars) * BAR });
        b += intro + sh.bars;
      }
      this.bars = b;
      this.dur = b * BAR;
      this.root = h("section.scene." + (act.theme || "light") + (act.bg ? ".bg-" + act.bg : ""), { "data-id": act.id });
      this.root.style.display = "block";   // laid out while it is built, so elements can be measured
      this.tracks = new Map();
      this.fns = [];
      this.cues = [];   // {kind, at, dur}: what the sound track may mark (music/make_music.py)
      this.t0 = 0;
    }
    shot(id) { return this.shots[id]; }
    _seg(el, prop, seg) {
      if (!el) throw new Error(`scene ${this.id}: tween on a missing element (${prop})`);
      let m = this.tracks.get(el);
      if (!m) this.tracks.set(el, (m = new Map()));
      let a = m.get(prop);
      if (!a) m.set(prop, (a = []));
      seg.i = a.length;
      a.push(seg);
    }
    each(el, f) { (Array.isArray(el) || el instanceof NodeList ? [...el] : [el]).forEach(f); }
    to(el, props, at = 0, dur = 0.5, e = "out") {
      this.each(el, (x) => { for (const k in props) this._seg(x, k, { t0: at, t1: at + dur, to: props[k], e }); });
      return at + dur;
    }
    fromTo(el, from, to, at = 0, dur = 0.5, e = "out") {
      this.each(el, (x) => { for (const k in to) this._seg(x, k, { t0: at, t1: at + dur, from: from[k], to: to[k], e }); });
      return at + dur;
    }
    set(el, props, at = 0) { return this.to(el, props, at, 0, "lin"); }
    init(el, props) { this.each(el, (x) => { for (const k in props) this._seg(x, k, { t0: -1, t1: -1, from: props[k], to: props[k], e: "lin" }); }); }
    cls(el, name, at, on = true) { this.each(el, (x) => this._seg(x, "cls:" + name, { t0: at, t1: at, to: on, e: "lin" })); }
    // appear / disappear; arrays stagger
    in(el, at, o = {}) {
      const { dur = 0.4, y = 14, x = 0, scale, stagger = 0.06, e = "out" } = o;
      let i = 0;
      this.each(el, (n) => {
        const from = { opacity: 0 }, to = { opacity: 1 };
        if (y) { from.y = y; to.y = 0; }
        if (x) { from.x = x; to.x = 0; }
        if (scale) { from.scale = scale; to.scale = 1; }
        this.fromTo(n, from, to, at + i++ * stagger, dur, e);
      });
      return at + dur;
    }
    out(el, at, o = {}) {
      const { dur = 0.3, y = 0, e = "in" } = o;
      const to = { opacity: 0 };
      if (y) to.y = y;
      return this.to(el, to, at, dur, e);
    }
    hide(el, at = 0) { at <= 0 ? this.init(el, { opacity: 0 }) : this.set(el, { opacity: 0 }, at); }
    showAt(el, at) { this.each(el, (x) => this._seg(x, "opacity", { t0: at, t1: at, from: 0, to: 1, e: "lin" })); }
    // typing: el shows pre + the first n characters of str. Returns the end time.
    type(el, str, at, cps = 26, pre = "") {
      const dur = str.length / cps;
      this._seg(el, "text", { t0: at, t1: at + dur, kind: "type", str, pre, to: pre + str, e: "lin" });
      return at + dur;
    }
    text(el, str, at) { this._seg(el, "text", { t0: at, t1: at, to: str, e: "lin" }); }
    html(el, str, at) { this._seg(el, "html", { t0: at, t1: at, to: str, e: "lin" }); }
    // number that counts: fmt(value) -> text
    count(el, from, to, at, dur, fmt = (v) => String(Math.round(v)), e = "lin") {
      el._fmt = fmt;
      this._seg(el, "num", { t0: at, t1: at + dur, from, to, e });
      return at + dur;
    }
    fn(f) { this.fns.push(f); }
    cue(kind, at, dur = 0) { this.cues.push({ kind, at, dur }); }

    static value(seg, t) {
      const p = seg.t1 > seg.t0 ? Math.max(0, Math.min(1, (t - seg.t0) / (seg.t1 - seg.t0))) : 1;
      if (seg.kind === "type") return seg.pre + seg.str.slice(0, Math.floor(p * seg.str.length + 1e-6));
      if (typeof seg.to === "number" && typeof seg.from === "number") return seg.from + (seg.to - seg.from) * EASE[seg.e](p);
      if (isHex(seg.to) && isHex(seg.from)) return p >= 1 ? seg.to : mix(seg.from, seg.to, EASE[seg.e](p));
      return p >= 1 ? seg.to : seg.from;
    }
    finalize() {
      for (const [el, m] of this.tracks) {
        for (const [prop, segs] of m) {
          segs.sort((a, b) => a.t0 - b.t0 || a.i - b.i);
          segs.base = segs[0].from !== undefined ? segs[0].from : dflt(prop, el);
          // a tween without `from` starts at the value the track has when it begins,
          // so a tween that interrupts another continues from where that one was (no jump)
          let prev = null;
          for (const s of segs) {
            if (s.from === undefined) s.from = prev ? Scene.value(prev, s.t0) : segs.base;
            prev = s;
          }
          if (prop === "html") el._html = segs.base;   // what is in the element now: no rewrite (which would replace its children) until it changes
        }
      }
    }
    apply(t) {
      for (const [el, m] of this.tracks) {
        let tf = null;
        for (const [prop, segs] of m) {
          let seg = null;
          for (const s of segs) { if (s.t0 <= t) seg = s; else break; }
          const v = seg ? Scene.value(seg, t) : segs.base;
          if (prop in TRANSFORM) (tf || (tf = Object.assign({}, TRANSFORM)))[prop] = v;
          else if (prop === "opacity") { el.style.opacity = v; el.style.visibility = v <= 0.001 ? "hidden" : ""; }
          else if (prop === "show") el.style.display = v >= 0.5 ? "" : "none";
          else if (prop in PX) el.style[PX[prop]] = v + "px";
          else if (prop in COLOR) el.style[COLOR[prop]] = v;
          else if (prop === "text") { if (el.textContent !== v) el.textContent = v; }
          else if (prop === "html") { if (el._html !== v) { el.innerHTML = v; el._html = v; } }
          else if (prop === "num") el.textContent = el._fmt(v);
          else if (prop === "draw") el.style.strokeDashoffset = 1 - v;
          else if (prop === "clipR") el.style.clipPath = `inset(0 ${(1 - v) * 100}% 0 0)`;
          else if (prop === "clipB") el.style.clipPath = `inset(0 0 ${(1 - v) * 100}% 0)`;
          else if (prop === "blur") el.style.filter = v > 0.01 ? `blur(${v}px)` : "";
          else if (prop.startsWith("cls:")) el.classList.toggle(prop.slice(4), !!v);
          else if (prop.startsWith("--")) el.style.setProperty(prop, v);
          else el.style[prop] = v;
        }
        if (tf) {
          el.style.transform = `translate(${tf.x}px,${tf.y}px)` + (tf.rot ? ` rotate(${tf.rot}deg)` : "") +
            (tf.scale !== 1 || tf.sx !== 1 || tf.sy !== 1 ? ` scale(${tf.scale * tf.sx},${tf.scale * tf.sy})` : "");
        }
      }
      for (const f of this.fns) f(t, this);
    }
  }

  // ---------------------------------------------------------------- the film
  const builders = {};
  const film = { scenes: [], dur: 0, ready: false };
  function scene(id, build) { builders[id] = build; }
  // one act, built into `frame` (a laid-out, unscaled 1920x1080 box: scenes measure while they are built)
  function make(act, frame) {
    const s = new Scene(act);
    frame.append(s.root);
    if (!builders[act.id]) throw new Error("no scene for act " + act.id);
    builders[act.id](s);
    s.finalize();
    return s;
  }
  function build(frame) {
    let t = 0;
    for (const act of V.ACTS) {
      const s = make(act, frame);
      s.t0 = t;
      t += s.dur;
      film.scenes.push(s);
    }
    film.dur = t;
  }
  function seek(t) {
    t = Math.max(0, Math.min(film.dur - 1 / FPS / 2, t));
    for (const s of film.scenes) {
      const on = t >= s.t0 - 1e-9 && t < s.t0 + s.dur - 1e-9;
      s.root.style.display = on ? "block" : "none";
      if (on) s.apply(t - s.t0);
    }
    film.t = t;
  }

  return { FPS, BPM, BEAT, BAR, W, H, EASE, h, frag, esc, Scene, scene, make, build, seek, film, cardPlan, DOCK, TYPE_CPS };
})();
