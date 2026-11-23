// Plays single shots of the film on a web page, each when it is brought to the middle of the screen.
// A block is <section class="pg-band" data-act="explore" data-shot="c2">: the act's scene is built once for that
// block (the film's own code, ../src/scenes), and the block plays the shot's stretch of it, after its title card.
// The headline and the line under it are the page's own text, taken from the shot table (../src/shots.js).
//
// When a block plays (sizes are in page.css):
//   starts   its region (words + picture) has been in the middle of the screen, within TOL, for DWELL;
//            it then shows its first picture, still, for LEAD before anything moves (nobody misses the beginning)
//   pauses   less than half of its picture is on screen; it goes on from there when it is brought back
//   resets   it has left the screen altogether: the next time it plays from the start
//   one at a time; the button plays or pauses at once, wherever the block is
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

  const players = [...document.querySelectorAll("section[data-shot]")].map(mount);

  function mount(sec) {
    const act = V.ACTS.find((a) => a.id === sec.dataset.act), shot = act && act.shots.find((x) => x.id === sec.dataset.shot);
    if (!shot) throw new Error(`no shot ${sec.dataset.act}/${sec.dataset.shot} in the shot table`);
    // data-tall="0 .27, 3.3 .27, 4.1 .52": on upright screens, where the left edge of the square picture is
    // (as a share of the window's width) at each time (seconds into the shot); it glides between them
    const keys = (sec.dataset.tall || "0 0").split(",").map((p) => p.trim().split(/\s+/).map(Number));

    // the words: *...* in a headline marks the key words, as in the film
    const head = h("h2.pg-head");
    shot.head.split("*").forEach((part, i) => { if (part) head.append(i % 2 ? h("mark", part) : part); });
    const frame = h("div.pg-frame"), view = h("div.pg-view", { "aria-hidden": "true" }, frame);
    const btn = h("button.pg-btn", { type: "button" });
    const region = h("div.pg-region", h("div.pg-words", head, shot.sub ? h("p.pg-sub", shot.sub) : null), h("div.pg-ctl", btn), view);
    sec.append(region);

    // built at full size, unscaled; only then fitted to the region
    const s = V.make(act, frame), S = s.shots[shot.id];
    // the band takes the scene's own backdrop and caption colours
    const cs = getComputedStyle(s.root);
    sec.style.setProperty("--band", cs.backgroundColor);
    for (const k of ["--cap", "--cap2"]) sec.style.setProperty(k, cs.getPropertyValue(k));
    s.root.style.background = "transparent";   // the band is the backdrop now: one surface, no edge

    // the shot's stretch of the act: from the window in place (after the title card) to just before it leaves
    const P = { sec, region, view, scene: s, t0: S.at, t1: S.end - 0.3, playing: false, done: false, held: false, centred: false, ms: 0, wait: 0 };
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
    P.draw = (t) => { P.t = Math.max(P.t0, Math.min(P.t1, t)); s.apply(P.t); place(); };
    P.sync = () => {
      const k = P.playing ? "pause" : P.done ? "replay" : "play";
      btn.innerHTML = ICON[k] + `<span>${{ pause: "Pause", play: "Play", replay: "Replay" }[k]}</span>`;
    };
    P.play = (asked) => {
      for (const o of players) if (o !== P && o.playing) o.pause();   // one at a time
      if (P.done) { P.done = false; P.draw(P.t0); }
      if (P.t <= P.t0 + 1e-6) P.wait = asked ? LEAD_ASKED : LEAD;     // from its start: the first picture stays for a moment
      P.playing = true; P.sync(); run();
    };
    P.pause = () => { P.playing = false; P.sync(); };
    P.reset = () => { P.playing = false; P.done = false; P.held = false; P.wait = 0; P.draw(P.t0); P.sync(); };
    btn.addEventListener("click", () => { if (P.playing) { P.held = true; P.pause(); } else { P.held = false; P.play(true); } });

    // before it plays: the window in place, still. Without motion: the finished picture, and a button to play it
    if (reduce) { P.t = P.t1; P.held = true; P.done = true; P.draw(P.t1); } else { P.t = P.t0; P.draw(P.t0); }
    P.sync();
    new ResizeObserver(() => { place(); look(); }).observe(view);
    return P;
  }

  // ---------------------------------------------------------------- which block is in the middle, and for how long
  let cand = null, timer = 0, looking = 0;
  const ready = (P) => !P.playing && !P.done && !P.held && !reduce;
  function check() {
    looking = 0;
    const vh = window.innerHeight;
    let best = null, bd = 9;
    for (const P of players) {
      const r = P.region.getBoundingClientRect(), v = P.view.getBoundingClientRect();
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

  // ---------------------------------------------------------------- one clock for the page; only a block that is playing is drawn
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
  window.PAGE = { players, TOL, DWELL, LEAD, check };   // for checks: PAGE.players[0].draw(t), .ms
})();
