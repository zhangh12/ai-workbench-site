// The page's segments: one region of the page each, numbered. Source of truth for their words and lengths.
// A segment's picture is the scene registered under its id (src/segments/sNN.js); a segment without a scene yet
// shows a placeholder on the page. The scripts are in planning/scripts.md, the rules in planning/rules.md.
//   id     the segment's own name: its scene file, its script (planning/scripts.md). It does not change.
//   n      the number shown large beside the headline = its place on the page (the order of this list).
//          What catches the eye of someone new to AI comes first: the idea, then pointing at text, changes and Word,
//          the report, exploring data, picking up again, then skills; the quieter things and the API key come last.
//   head   the headline (*...* marks the key words); sub: the line under it
//   secs   length of the picture
//   bg     backdrop (base.css: blue, sage, clay, kraft, oat, grey)
//   tall   on upright screens the picture is a square part of the window: "seconds share" pairs say where its left
//          edge is (share of the window's width) at each time; it glides from one to the next (page.js)
// Wording: text the page adds says "the AI"; names that exist in the app keep their own wording (/btw, Ask Claude, Word).
V.SEGMENTS = [
  { id: "s01", n: "01", bg: "blue", secs: 20, tall: "0 .12, 0.5 .12, 1.3 .2, 1.6 .2, 2.2 0, 8.2 0, 9.0 .52, 15.8 .52, 16.8 .42", head: "A tab for *every idea.*",
    sub: "Its own conversation, its own files. Close a dead end; bring it back anytime." },
  { id: "s05", n: "02", bg: "kraft", secs: 24, tall: "0 .06, 0.9 .06, 1.7 .13, 2.3 .06, 3.0 .06, 3.5 .52, 7.8 .52, 8.8 .06, 10.3 .06, 10.9 .52, 11.8 .52, 12.6 0, 15.8 0, 16.7 .3, 19.1 .3, 19.9 0", head: "*Point* at it.",
    sub: "Select the words, comment, and the AI fixes exactly that. No more “the third paragraph”." },
  { id: "s06", n: "03", bg: "blue", secs: 18, tall: "0 .52, 2.1 .52, 3.0 .34, 3.6 .34, 4.5 .26, 5.4 .26, 6.2 .3, 6.6 .3, 7.1 .5, 8.4 .5, 9.1 .26, 9.7 .26, 10.6 .52", head: "See *what changed.* Then ship it.",
    sub: "Every edit is marked on the finished page. Word is one click away." },
  { id: "s02", n: "04", bg: "sage", secs: 22, tall: "0 0, 0.4 0, 1.0 .03, 5.0 .03, 5.5 .01, 7.2 .01, 7.9 .14, 8.7 .14, 9.5 .3, 10.2 .3, 10.9 .03, 15.4 .03, 16.2 .42", head: "Separate tabs. *Shared memory.*",
    sub: "Ask one tab what another found. Then ask for the whole report." },
  { id: "s10", n: "05", bg: "kraft", secs: 24, tall: "0 0, 0.5 .04, 3.5 .04, 4.4 .44, 10.4 .44, 11.2 .50, 13.2 .50, 13.9 0, 16.9 0, 17.5 .44, 20.2 .44, 20.9 0, 24 0", head: "*Explore first.* Plot later.",
    sub: "Too many variables for a wall of charts? Ask for an interactive view instead." },
  { id: "s07", n: "06", bg: "sage", secs: 18, tall: "0 .40, 4.3 .40, 5.2 .21, 6.0 .21, 6.6 .50, 7.2 .44, 10.3 .44, 11.1 .40, 12.2 .42, 14.2 .42, 14.6 .40, 15.4 .41, 18 .41", head: "*Look* before you ask.",
    sub: "CSV, Excel, Parquet, SAS: open a data file and see every variable at a glance." },
  { id: "s08", n: "07", bg: "oat", secs: 14, tall: "0 .49, 2.7 .49, 3.0 .23, 3.4 .23, 3.9 .27, 4.6 .27, 5.3 0, 14 0", head: "Pick up *where you left off.*",
    sub: "Open a session next week: every tab, file and conversation is where you left it." },
  { id: "s11", n: "08", bg: "blue", secs: 18, tall: "0 .17, 2.7 .17, 3.4 .33, 3.9 .17, 4.9 .17, 5.4 .33, 6.0 0, 18 0", head: "Teach it *your way.*",
    sub: "A skill is a method written down once. The AI follows it, and says when it did." },
  { id: "s12", n: "09", bg: "sage", secs: 16, tall: "0 0, 1.7 0, 2.3 .17, 6.2 .17, 7.0 .06, 10.9 .06, 11.8 .34, 12.3 .34, 12.9 .17, 16 .17", head: "Did it right once? *Keep it.*",
    sub: "Turn a tab’s work into a skill, ready for the next study." },
  { id: "s13", n: "10", bg: "clay", secs: 18, tall: "0 0, 0.5 0, 1.2 .02, 4.1 .02, 4.9 0, 6.4 0, 7.3 .33, 8.7 .33, 9.5 0, 9.9 0, 10.5 .17, 13.2 .17, 13.8 .34, 14.2 .34, 14.8 .17, 15.9 .17, 16.4 .34, 16.7 .34, 17.2 .44, 18 .44", head: "*Better* each time.",
    sub: "Refine a skill together in its own tab; review every change before it goes in." },
  { id: "s03", n: "11", bg: "oat", secs: 20, tall: "0 0", head: "It stays *out of your way.*",
    sub: "Add a thought while it works. Answer when a choice matters. Skip the noise." },
  { id: "s04", n: "12", bg: "clay", secs: 16, tall: "0 0", head: "Ask *on the side.*",
    sub: "Type /btw while the AI is busy. You get your answer; the conversation never sees it." },
  { id: "s09", n: "13", bg: "clay", secs: 16, tall: "0 .31, 0.5 .31, 1.6 0, 3.6 0, 4.4 .3, 5.2 .3, 6.0 0, 6.9 0, 7.8 .18, 9.1 .18, 9.8 .5, 11.2 .5, 12.0 0, 13.5 0, 14.4 .31", head: "Code you can *check.*",
    sub: "Read the R behind every result, and see which lines each request changed." },
  { id: "s14", n: "14", bg: "oat", secs: 12, tall: "0 .26, 6.2 .26, 7.1 0, 12 0", head: "Bring *your own key.*",
    sub: "Already have an Anthropic API key from another tool? Paste it once and get to work." },
];

// A segment as an act for the engine: one shot, no title card (its words are the page's), and the app window is
// there from the first frame (ui.app leaves out the entrance for `seg` acts): the first frame is a still to look at.
V.segAct = (g) => ({ id: g.id, bg: g.bg, seg: true, shots: [{ id: g.id, bars: g.secs / V.BAR, intro: 0 }] });
V.hasScene = (id) => { try { return !!V.sceneBuilt(id); } catch (e) { return false; } };

// A short line of guiding text over the picture: V.say(s, "Didn't help? Close it.", from, until, "bc").
// It is not drawn in the scene: the page (and the preview) show it over the picture at a size that can be read on
// any screen. where: b|t (bottom, top) + l|c|r. At most two per segment, six words each (planning/rules.md).
V.say = (s, text, at, until, where = "bc") => { (s.says || (s.says = [])).push({ text, at, until, where }); };
V.sayAt = (s, t) => (s.says || []).filter((x) => t >= x.at && t < x.until).map((x) => ({ text: x.text, where: x.where, p: Math.min(1, (t - x.at) / 0.25, (x.until - t) / 0.2) }));

// A request that is already running when the segment starts (so the first frame shows the AI at work):
// it began `ago` seconds before t = 0 and ends at `end`; steps = [[seconds after it began, text], ...].
V.midWork = (s, ch, ago, end, steps, secs) => {
  const ptxt = ch.prog.children[1];
  s.showAt(ch.prog, 0); s.set(ch.prog, { opacity: 0 }, end);
  let cur = steps[0][1];
  for (const [off, t] of steps) { if (off <= ago) cur = t; else s.text(ptxt, t, off - ago); }
  ptxt.textContent = cur;
  ch.work.push({ at: -ago, end, steps, secs });
};

// Styles a segment needs beyond sketch.css: V.css("s10", `.xp-view { ... }`) (added to the page once per id).
V.css = (id, text) => { if (document.getElementById("css-" + id)) return; const e = document.createElement("style"); e.id = "css-" + id; e.textContent = text; document.head.append(e); };
