// The storyboard. Source of truth for timing and for every caption.
// Wording: text the film adds says "the AI", not the model's name. Labels that exist in the app keep their own
// wording (the "Ask Claude" button, so also the headline that names it; "Anthropic API key").
// Every shot with a headline opens with a title card: the headline, then its second line sentence by sentence.
// The card lasts as long as the words need (V.cardPlan in engine.js), rounded up to half a bar; `bars` is the
// length of the content after it.
// Tempo: 100 BPM, 4/4. One bar = 2.4 s = 72 frames at 30 fps. Every shot is a whole number of half-bars,
// so every cut falls on a beat. To retime a shot, change its `bars`.
//   kicker  small line above the headline (which pain the act answers)
//   *...*   in a headline: the words that are highlighted
//   head    the headline; `small: true` marks a supporting feature (smaller type)
//   sub     one line under the headline
//   bg      the act's backdrop colour (base.css); the window is a sheet of warm paper on it
//   covers  what in video-prompt.md the shot shows (for the coverage check)
// the one line under the name: on the opening card, the end card and the cover image
V.SLOGAN = "A new way to work with AI.";

V.ACTS = [
  { id: "open", theme: "paper", shots: [
    { id: "o1", bars: 1.5, covers: "a still, silent start (a player's controls cover the picture for a few seconds)" },
    { id: "o2", bars: 2.5, covers: "the title of the film" },   // text is in the scene
  ] },
  { id: "pain", theme: "dark", bg: "grey", shots: [
    { id: "a1", bars: 3, head: "A general-purpose AI chat is *one long conversation.*",
      sub: "Questions, tool calls, logs: all in one thread.", covers: "why the app exists" },
    { id: "a2", bars: 3, kicker: "1", head: "An endless thread means *cognitive overload.*",
      sub: "Conclusions sink. Digging them out is cognitive fatigue.", covers: "pain 1" },
    { id: "a3", bars: 2.5, kicker: "2", head: "Exploring is *expensive.*",
      sub: "Every detour stays in the main line.", covers: "pain 2" },
    { id: "a4", bars: 2.5, kicker: "3", head: "References are *vague.*",
      sub: "“That” and “above” point at nothing.", covers: "pain 3" },
  ] },
  { id: "title", theme: "paper", shots: [
    { id: "t1", bars: 3, covers: "the product" },   // text is in the scene: logo, name, one line
  ] },
  { id: "tabs", bg: "blue", kicker: "1 · Cognitive overload", shots: [
    { id: "b2", bars: 6, head: "Results *beside* the conversation.",
      sub: "You talk on the left. The work appears on the right.",
      covers: "key: results beside the conversation; supporting: tables, formulas, figures; no code in replies" },
    { id: "b2b", bars: 2.5, small: true, head: "One click *hides either side.*",
      covers: "supporting: hide the chat or the display area" },
    { id: "b1", bars: 11, head: "One topic, *one tab.* You decide.",
      sub: "Its own conversation. Its own files. All running at once.",
      covers: "key: one topic (question), one tab; supporting: progress line, folds into one line" },
    { id: "b3", bars: 6, head: "Ask one tab *about another.*",
      sub: "It answers, and cites its source.",
      covers: "key: ask one tab about another" },
  ] },
  { id: "explore", bg: "sage", kicker: "2 · Exploring is expensive", shots: [
    { id: "c1", bars: 6.5, head: "Try any idea. *Drop it if it doesn’t work.*",
      sub: "A new tab costs nothing. A closed one can be restored.",
      covers: "key: try it in a tab, then close it; Recently closed" },
    { id: "c2", bars: 6, head: "*/btw*",
      sub: "Ask on the side while the AI works. The conversation never sees it.",
      covers: "key: /btw" },
    { id: "c3", bars: 4.5, small: true, head: "*Show changes:* what each turn added and removed.",
      covers: "supporting: show changes, earlier versions (code, and a report)" },
  ] },
  { id: "refs", bg: "clay", kicker: "3 · Vague references", shots: [
    { id: "d1", bars: 6, head: "*Quote* in chat.",
      sub: "File, position, exact text. No guessing.",
      covers: "key: quote in chat" },
    { id: "d2", bars: 6, head: "Comment. Then *Ask Claude.*",
      sub: "The AI edits the text and answers on the card.",
      covers: "key: comment, then Ask Claude" },
    { id: "d2b", bars: 4.5, small: true, head: "Comments *follow their text.* “#1” means comment 1.",
      covers: "supporting: comments follow their text; #n" },
    { id: "d3", bars: 5.5, head: "*Code too.*",
      sub: "Point at lines of R the same way.",
      covers: "key: code too" },
  ] },
  { id: "payoff", bg: "kraft", kicker: "Putting it together", shots: [
    { id: "e1", bars: 6.5, head: "The *overall report.*",
      sub: "Built from the open tabs. Every result names its tab.",
      covers: "payoff: the overall report" },
    { id: "e2", bars: 2.5, head: "*Word* in one click.",
      covers: "payoff: Word in one click" },
    { id: "e3", bars: 2.5, head: "*Any Markdown file,* the same way.",
      sub: "Word, HTML or Markdown.", covers: "payoff: any Markdown file exports" },
  ] },
  { id: "everyday", bg: "oat", kicker: "And the everyday things", shots: [
    { id: "f1", bars: 5, small: true, head: "*Instant data preview:* CSV, Excel, Parquet, SAS.",
      covers: "convenience: data preview" },
    { id: "f2", bars: 3, small: true, head: "*Reopen tomorrow.* Everything is in place, and the AI remembers.",
      covers: "convenience: reopen a session" },
    { id: "f3", bars: 2.5, small: true, head: "The AI *asks* when a choice matters.",
      covers: "convenience: option cards" },
    { id: "f4", bars: 3, small: true, head: "*Keep typing* while the AI works.",
      covers: "convenience: keep typing" },
    { id: "f5", bars: 2, small: true, head: "*Lock a tab* against closing.",
      covers: "convenience: lock a tab" },
    { id: "f6", bars: 2, small: true, head: "Bring *your own* Anthropic API key.",
      covers: "convenience: API key" },
  ] },
  { id: "end", theme: "paper", shots: [
    { id: "g1", bars: 3, covers: "close" },   // text is in the scene
  ] },
];
