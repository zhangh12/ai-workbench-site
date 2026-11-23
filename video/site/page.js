// The page: one numbered region per segment (../src/segments.js), each drawn live by its scene
// (../src/segments/sNN.js, the film's own engine) and played when it is brought to the middle of the screen.
// The words of a region are the page's own text; the picture is only the app window.
//
// When a region plays (sizes are in page.css; the rules in ../planning/rules.md):
//   starts   its region (words + picture) has been in the middle of the screen, within TOL, for DWELL;
//            it then shows its first picture, still, for LEAD before anything moves (nobody misses the beginning)
//   pauses   less than half of its picture is on screen; it goes on from there when it is brought back
//   resets   it has left the screen altogether: the next time it plays from the start
//   one at a time; the button plays or pauses at once, wherever the region is
// A region's scene is built when it comes near (about a screen away), not when the page opens.
// Try other values in the address: ?tol=12 (percent of the screen height) &dwell=400 (ms) &lead=1500 (ms) &snap=0 &guide=1
(async function () {
  const { h } = V;
  const Q = new URLSearchParams(location.search);
  const num = (k, d) => (Q.get(k) !== null && isFinite(+Q.get(k)) ? +Q.get(k) : d);
  const TOL = num("tol", 12) / 100;     // how far the region's middle may be from the screen's middle (of the screen height)
  const DWELL = num("dwell", 400);      // ms it has to stay there
  const LEAD = num("lead", 1500) / 1000;   // s the first picture is held, still, once it has started by itself
  const LEAD_ASKED = 0.3;               // the same when the viewer pressed Play or Replay: they are looking already
  const HALF = 0.5;                     // it pauses when less than this much of its picture is on screen
  const NEAR = 1.2;                     // a scene is built when its region is within this many screens
  const STAGE = [80, 214, 1760, 842];   // where the app window sits in the film's 1920x1080 frame (base.css)
  const TALL = "(max-aspect-ratio: 1/1)";   // upright screens show a square part of the window (page.css: html.pg-tall)
  const ICON = {
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>',
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement, tallQ = matchMedia(TALL);
  root.classList.toggle("pg-tall", tallQ.matches);
  root.classList.toggle("pg-nosnap", Q.get("snap") === "0");

  // scenes measure text while they are built: every face has to be there first (as in the film's main.js)
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => null)));
  await document.fonts.ready;

  const slogan = document.getElementById("slogan");
  if (slogan) slogan.textContent = V.SLOGAN;

  // a backdrop's colours, as the scenes have them (base.css)
  const tone = (bg) => {
    const p = h("section.scene.bg-" + bg); p.style.cssText = "display:block;position:absolute;left:-9999px;width:1px;height:1px";
    document.body.append(p);
    const cs = getComputedStyle(p), out = [cs.backgroundColor, cs.getPropertyValue("--cap"), cs.getPropertyValue("--cap2")];
    p.remove();
    return out;
  };

  const host = document.getElementById("segments");
  const only = Q.get("only") ? Q.get("only").split(",") : null;      // ?only=s04,s05: just these (while working on them)
  const players = V.SEGMENTS.filter((g) => !only || only.includes(g.id)).map(mount);

  function mount(g) {
    const sec = h("section.pg-band", { id: g.id, "data-seg": g.id });
    const [band, cap, cap2] = tone(g.bg);
    sec.style.setProperty("--band", band); sec.style.setProperty("--cap", cap); sec.style.setProperty("--cap2", cap2);
    const keys = (g.tall || "0 0").split(",").map((p) => p.trim().split(/\s+/).map(Number));

    // the words: the number, the headline (*...* marks the key words), the line under it
    const head = h("h2.pg-head");
    g.head.split("*").forEach((part, i) => { if (part) head.append(i % 2 ? h("mark", part) : part); });
    const frame = h("div.pg-frame"), says = h("div.pg-says"), view = h("div.pg-view", { "aria-hidden": "true" }, frame, says);
    const btn = h("button.pg-btn", { type: "button" });
    const words = h("div.pg-words", h("div.pg-num", { "aria-hidden": "true" }, g.n), h("div.pg-txt", head, g.sub ? h("p.pg-sub", g.sub) : null));
    const region = h("div.pg-region", words, h("div.pg-ctl", btn), view);
    sec.append(region);
    host.append(sec);

    const has = !!V.sceneBuilt(g.id);
    if (!has) { view.classList.add("pg-todo"); view.append(h("div.pg-todo-note", "This picture is still being made.")); btn.hidden = true; }
    const P = { id: g.id, sec, region, view, scene: null, has, t0: 0, t1: g.secs - 0.05, t: 0, playing: false, done: false, held: false, centred: false, ms: 0, wait: 0 };
    const tallX = (u) => {
      let i = 0;
      while (i < keys.length - 1 && u >= keys[i + 1][0]) i++;
      if (i === keys.length - 1 || u <= keys[i][0]) return keys[i][1];
      const a = keys[i], b = keys[i + 1], p = (u - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * p * p * (3 - 2 * p);
    };
    const place = () => {
      const tall = root.classList.contains("pg-tall"), w = view.clientWidth;
      const side = STAGE[3], x = tall ? STAGE[0] + Math.min(STAGE[2] - side, tallX(P.t - P.t0) * STAGE[2]) : STAGE[0];
      const k = w / (tall ? side : STAGE[2]);
      frame.style.transform = `scale(${k}) translate(${-x}px,${-STAGE[1]}px)`;
      view.style.borderRadius = tall ? 16 * k + "px" : "";
    };
    // built at full size, unscaled; only then fitted to the region
    P.build = () => {
      if (P.scene || !has) return;
      const s = V.make(V.segAct(g), frame);
      s.root.style.background = "transparent";   // the band is the backdrop: one surface, no edge
      P.scene = s;
      P.draw(reduce ? P.t1 : P.t);
    };
    P.draw = (t) => {
      P.t = Math.max(P.t0, Math.min(P.t1, t));
      if (!P.scene) return;
      P.scene.apply(P.t); place();
      // the guiding lines over the picture (V.say in the scene)
      const now = V.sayAt(P.scene, P.t), key = now.map((x) => x.where + x.text).join("|");
      if (says._key !== key) { says._key = key; says.textContent = ""; for (const x of now) says.append(h("div.pg-say.w-" + x.where, x.text)); }
      now.forEach((x, i) => { says.children[i].style.opacity = x.p; });
    };
    P.sync = () => {
      const k = P.playing ? "pause" : P.done ? "replay" : "play";
      btn.innerHTML = ICON[k] + `<span>${{ pause: "Pause", play: "Play", replay: "Replay" }[k]}</span>`;
    };
    P.play = (asked) => {
      if (!has) return;
      P.build();
      for (const o of players) if (o !== P && o.playing) o.pause();   // one at a time
      if (P.done) { P.done = false; P.draw(P.t0); }
      if (P.t <= P.t0 + 1e-6) P.wait = asked ? LEAD_ASKED : LEAD;     // from its start: the first picture stays for a moment
      P.playing = true; P.sync(); run();
    };
    P.pause = () => { P.playing = false; P.sync(); };
    P.reset = () => { P.playing = false; P.done = false; P.held = false; P.wait = 0; P.draw(P.t0); P.sync(); };
    btn.addEventListener("click", () => { if (P.playing) { P.held = true; P.pause(); } else { P.held = false; P.play(true); } });

    // before it plays: the first picture, still. Without motion: the finished picture, and a button to play it
    if (reduce) { P.t = P.t1; P.held = true; P.done = true; }
    P.sync();
    new ResizeObserver(() => { if (P.scene) place(); look(); }).observe(view);
    new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) P.build(); }, { rootMargin: `${NEAR * 100}% 0px` }).observe(sec);
    return P;
  }

  // ---------------------------------------------------------------- which region is in the middle, and for how long
  let cand = null, timer = 0, looking = 0;
  const ready = (P) => P.has && !P.playing && !P.done && !P.held && !reduce;
  function check() {
    looking = 0;
    const vh = window.innerHeight;
    let best = null, bd = 9;
    for (const P of players) {
      const r = P.region.getBoundingClientRect();
      if (r.bottom < -vh * NEAR || r.top > vh * (1 + NEAR)) {         // far away (also after a jump): stopped and back at its start
        P.centred = false;
        if (P.playing) P.pause();
        if (!reduce && (P.done || P.held || P.t > P.t0)) P.reset();
        continue;
      }
      const v = P.view.getBoundingClientRect();
      const off = Math.abs((r.top + r.bottom) / 2 - vh / 2) / vh;
      const seen = Math.max(0, Math.min(v.bottom, vh) - Math.max(v.top, 0)) / (v.height || 1);
      P.centred = off <= TOL;
      if (P.playing && seen < HALF) P.pause();
      if ((r.bottom <= 0 || r.top >= vh) && !reduce && (P.done || P.held || P.t > P.t0)) P.reset();   // the whole region has left
      if (P.centred && off < bd) { best = P; bd = off; }
    }
    if (best !== cand) { cand = best; clearTimeout(timer); timer = 0; }
    if (cand && !timer && ready(cand)) timer = setTimeout(fire, DWELL);
  }
  function fire() { timer = 0; if (cand && cand.centred && ready(cand) && !document.hidden) cand.play(); }
  function look() { if (!looking) looking = requestAnimationFrame(check); }
  addEventListener("scroll", look, { passive: true });
  addEventListener("resize", look);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { for (const P of players) if (P.playing) P.pause(); } else look();
  });
  tallQ.addEventListener("change", () => { root.classList.toggle("pg-tall", tallQ.matches); for (const P of players) P.draw(P.t); look(); });

  // ---------------------------------------------------------------- one clock for the page; only a region that is playing is drawn
  let raf = 0, last = 0;
  function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.1, (now - last) / 1000);   // a stalled tab does not jump ahead
    last = now;
    let any = false;
    for (const P of players) {
      if (!P.playing) continue;
      if (P.wait > 0) { P.wait -= dt; any = true; continue; }       // still on its first picture
      const a = performance.now();
      P.draw(P.t + dt);
      P.ms += (performance.now() - a - P.ms) * 0.1;   // running mean of the cost of one frame
      if (P.t >= P.t1) { P.playing = false; P.done = true; P.sync(); } else any = true;
    }
    if (any) raf = requestAnimationFrame(tick);
  }

  // ?guide=1: the band the middle of a region has to be in, and the middle of each region
  if (Q.get("guide") === "1") {
    for (const d of [-1, 1]) document.body.append(h("div.pg-guide", { style: `top:${50 + d * TOL * 100}%` }, d < 0 ? h("span", `middle ±${Math.round(TOL * 100)}% · ${DWELL} ms`) : null));
    for (const P of players) { P.region.style.position = "relative"; P.region.append(h("div.pg-mid")); }
  }

  look();
  window.PAGE = { players, TOL, DWELL, LEAD, check, ready: true };   // for checks: PAGE.players[i].build(), .draw(t), .ms
})();
