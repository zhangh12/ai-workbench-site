"""Checks the page prototype (site/index.html) in several browsers and writes a report with pictures.

  python video/site/check.py --browsers chrome                      here (the Chrome that is installed)
  python video/site/check.py --browsers chrome,msedge,firefox,webkit    in CI (Windows: .github/workflows/site-check.yml)

For each browser:
  sizes     at common screens a region is at most 86% of the screen height, nothing sticks out sideways,
            every headline of the shot table fits the words slot, and the first screen (the name) is one screen
  playing   starts when held in the middle, not when passed; pauses, goes on, starts again; one at a time
  pictures  each shot at a few moments, on a laptop screen and on a phone (out/<browser>/*.png)
  text      where every piece of text of each shot is and how tall it is. Scenes measure text while they are built,
            so a browser that sets a word a little wider can wrap a line differently: the browsers are compared
            with the first one, and every piece that differs is listed.
Needs: playwright (and its browsers), `npm ci` in video/. Exit code 1 when a check fails; differences in text are
warnings (they need a look, in the pictures).
"""
import argparse
import functools
import http.server
import json
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright

REPO = pathlib.Path(__file__).resolve().parents[2]
PAGE = "/video/site/index.html"
SIZES = [("laptop 1080p at 150%", 1280, 600), ("laptop 1366x768", 1366, 650), ("laptop 1080p at 125%", 1536, 730),
         ("MacBook Air 13", 1440, 800), ("desktop 1080p", 1920, 950), ("desktop 1440p", 2560, 1300), ("squarish window", 1000, 900),
         ("tablet, upright", 820, 1050), ("phone", 390, 700), ("small phone", 360, 620), ("large phone", 430, 780), ("phone on its side", 844, 390)]
READY = "window.PAGE && PAGE.players.length == 2"
STATE = "PAGE.players.map(P => ({playing: P.playing, done: P.done, t: +(P.t - P.t0).toFixed(2), centred: P.centred}))"
OFF = "(i) => { const r = PAGE.players[i].region.getBoundingClientRect(); return +(((r.top + r.bottom) / 2 - innerHeight / 2) / innerHeight).toFixed(3); }"
SIZE_JS = """() => { const vh = innerHeight, tall = document.documentElement.classList.contains('pg-tall');
  const out = PAGE.players.map(P => { const r = P.region.getBoundingClientRect(), v = P.view.getBoundingClientRect();
    return { shot: P.sec.dataset.shot, reg: r.height / vh, band: P.sec.getBoundingClientRect().height / vh, pic: [Math.round(v.width), Math.round(v.height)], k: v.width / (tall ? 842 : 1760) }; });
  // every shot's own headline and line, put into the first block: do they fit its slot?
  const sec = PAGE.players[0].sec, hd = sec.querySelector('.pg-head'), sb = sec.querySelector('.pg-sub'), slot = sec.querySelector('.pg-words').clientHeight, keep = [hd.innerHTML, sb.textContent];
  let worst = 0, which = '';
  for (const a of V.ACTS) for (const s of a.shots) { if (!s.head) continue; hd.textContent = s.head.replace(/\\*/g, ''); sb.textContent = s.sub || '';
    const need = hd.getBoundingClientRect().height + (s.sub ? sb.getBoundingClientRect().height + parseFloat(getComputedStyle(sb).marginTop) : 0); if (need > worst) { worst = need; which = s.id; } }
  hd.innerHTML = keep[0]; sb.textContent = keep[1];
  const more = document.querySelector('.pg-more').getBoundingClientRect(), slo = document.querySelector('.pg-slogan').getBoundingClientRect();
  return { tall, blocks: out, slot, worst: Math.round(worst), which, over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    hero: document.querySelector('.pg-hero').getBoundingClientRect().height / vh, room: Math.round(more.top - slo.bottom) }; }"""
# every piece of text of a shot at a time: what it says, where it is and how big, in the film's own pixels
TEXT_JS = """([i, u]) => { const P = PAGE.players[i]; P.draw(P.t0 + u); const v = P.view.getBoundingClientRect(), k = v.width / 1760, out = [];
  for (const e of P.scene.root.querySelectorAll('*')) { if (e.childElementCount || !e.textContent.trim() || e.closest('.cap, .csubs, .katex')) continue;
    const r = e.getBoundingClientRect(); if (!r.width || r.bottom < v.top || r.top > v.bottom || r.right < v.left || r.left > v.right) continue;
    out.push([e.textContent.trim().slice(0, 28), Math.round((r.left - v.left) / k), Math.round((r.top - v.top) / k), Math.round(r.width / k), Math.round(r.height / k)]); }
  return out; }"""
FONT_JS = """() => ({ faces: [...document.fonts].filter(f => f.status == 'loaded').length, all: document.fonts.size,
  serif: document.fonts.check('500 20px "IBM Plex Serif"'), sans: document.fonts.check('400 14px "IBM Plex Sans"'), mono: document.fonts.check('400 12px "IBM Plex Mono"'),
  headFont: getComputedStyle(document.querySelector('.pg-head')).fontFamily.split(',')[0], ua: navigator.userAgent })"""


class Handler(http.server.SimpleHTTPRequestHandler):
    # Windows takes file types from its registry, where .js can be anything
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".css": "text/css", ".html": "text/html",
                      ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf"}

    def log_message(self, *a):
        pass


def serve():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(REPO)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{srv.server_address[1]}{PAGE}"


def launch(p, name):
    return p.chromium.launch(channel=name) if name in ("chrome", "msedge") else getattr(p, name).launch()


class Log:
    def __init__(self, browser):
        self.browser, self.rows = browser, []

    def add(self, level, name, detail=""):
        self.rows.append((level, name, str(detail)))
        print(f"[{self.browser}] {level:5} {name}  {detail}", flush=True)

    def check(self, name, cond, detail=""):
        self.add("pass" if cond else "FAIL", name, detail)


def open_page(b, url, w, h, log, scale=1, query="?snap=0"):
    pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
    pg.on("pageerror", lambda e: log.add("FAIL", "page error", e))
    pg.goto(url + query)
    pg.wait_for_function(READY, timeout=60000)
    return pg


def to(pg, i, off=0.0):   # region i with its middle `off` screens below the middle of the screen
    pg.evaluate(f"(() => {{ const r = PAGE.players[{i}].region.getBoundingClientRect(); scrollTo(0, scrollY + (r.top + r.bottom) / 2 - innerHeight / 2 - {off} * innerHeight); }})()")


def sizes(b, url, log):
    table = []
    for name, w, h in SIZES:
        pg = open_page(b, url, w, h, log)
        r = pg.evaluate(SIZE_JS)
        pg.close()
        reg = max(x["reg"] for x in r["blocks"])
        band = min(x["band"] for x in r["blocks"])
        bad = []
        if reg > 0.865: bad.append(f"region is {reg:.2f} of the screen height")
        if band < 0.999: bad.append(f"band is {band:.2f} of the screen height")
        if r["over"] > 0: bad.append(f"{r['over']}px stick out sideways")
        if r["worst"] > r["slot"] + 1: bad.append(f"headline of {r['which']} needs {r['worst']}px, the slot is {r['slot']}px")
        if abs(r["hero"] - 1) > 0.005: bad.append(f"the first screen is {r['hero']:.2f} of the screen height")
        if r["room"] < 8: bad.append(f"the first screen is too full: {r['room']}px between the line under the name and the scroll hint")
        x = r["blocks"][0]
        table.append((name, f"{w}x{h}", "upright" if r["tall"] else "wide", f"{reg:.2f}", f"{x['pic'][0]}x{x['pic'][1]}", f"{22 * x['k']:.1f}px", "ok" if not bad else "; ".join(bad)))
        if bad: log.add("FAIL", f"size at {w}x{h}", "; ".join(bad))
    if all(t[-1] == "ok" for t in table): log.add("pass", f"sizes at {len(SIZES)} screens")
    return table


def playing(b, url, log):
    for label, w, h in (("laptop", 1440, 800), ("phone", 390, 700)):
        pg = open_page(b, url, w, h, log)
        pg.wait_for_timeout(700)
        st = lambda: pg.evaluate(STATE)
        c = lambda name, cond, detail="": log.check(f"{label}: {name}", cond, detail)
        c("nothing plays at the top of the page", not any(x["playing"] for x in st()))
        to(pg, 0); pg.wait_for_timeout(200); to(pg, 0, 0.6); pg.wait_for_timeout(700)
        s = st(); c("passing through does not start it", not s[0]["playing"] and s[0]["t"] == 0, s[0])
        to(pg, 0, 0.2); pg.wait_for_timeout(900)
        c("20% off the middle does not start it", not st()[0]["playing"])
        to(pg, 0, 0.1); pg.wait_for_timeout(250); s1 = st(); pg.wait_for_timeout(900); s2 = st()
        c("10% off the middle: starts after the wait, not before", not s1[0]["playing"] and s2[0]["playing"], (s1[0]["t"], s2[0]["t"]))
        c("button says Pause while it plays", pg.locator(".pg-btn").nth(0).inner_text().strip() == "Pause")
        pg.wait_for_timeout(1500); a = st()[0]["t"]; pg.wait_for_timeout(3000); z = st()[0]["t"]
        speed = (z - a) / 3
        ms = pg.evaluate("PAGE.players[0].ms")
        log.add("pass" if speed > 0.9 else "warn" if speed > 0.5 else "FAIL", f"{label}: speed", f"{speed:.2f} of film speed, {ms:.1f} ms to draw a frame")
        to(pg, 0, 0.25); pg.wait_for_timeout(400)
        c("a nudge keeps it playing", st()[0]["playing"])
        to(pg, 0, 0.75); pg.wait_for_timeout(400)
        s = st(); at = s[0]["t"]; c("mostly off screen: pauses", not s[0]["playing"] and at > 0, s[0])
        to(pg, 0); pg.wait_for_timeout(1100)
        s = st(); c("brought back: goes on from where it was", s[0]["playing"] and at <= s[0]["t"] < at + 1.5, (at, s[0]["t"]))
        to(pg, 1); pg.wait_for_timeout(1200)
        s = st(); c("next region starts, the first is back at its start", s[1]["playing"] and not s[0]["playing"] and s[0]["t"] == 0, s)
        pg.evaluate("(() => { const P = PAGE.players[1]; P.draw(P.t1 - 0.5); })()"); pg.wait_for_timeout(1500)
        s = st(); c("at its end: stops, button says Replay", s[1]["done"] and not s[1]["playing"] and pg.locator(".pg-btn").nth(1).inner_text().strip() == "Replay", s[1])
        pg.locator(".pg-btn").nth(1).click(); pg.wait_for_timeout(300)
        s = st(); c("Replay plays from the start", s[1]["playing"] and s[1]["t"] < 0.8, s[1])
        pg.locator(".pg-btn").nth(1).click(); pg.wait_for_timeout(900)
        c("Pause holds", not st()[1]["playing"])
        pg.evaluate("scrollTo(0, 1e6)"); pg.wait_for_timeout(150)
        c("the last region can reach the middle", pg.evaluate(OFF, 1) <= 0.001, pg.evaluate(OFF, 1))
        pg.close()
    # snapping, with the mouse wheel (how far off it may stop and still be pulled in is the browser's own choice)
    pg = open_page(b, url, 1440, 800, log, query="")
    pg.wait_for_timeout(500); pg.mouse.move(700, 400)
    got = []
    for target in (0.2, -0.3):
        try:
            cur = pg.evaluate(OFF, 0); pg.mouse.wheel(0, (cur - target) * 800); pg.wait_for_timeout(1800); got.append(f"stopped {target:+.2f} off -> rests at {pg.evaluate(OFF, 0):+.3f}")
        except Exception as e:   # no mouse wheel in this browser's automation
            got.append(f"not tried ({str(e)[:60]})")
    log.add("info", "snap to the middle (mouse wheel)", "; ".join(got))
    pg.close()


def pictures(b, url, log, out):
    for label, w, h, scale in (("laptop", 1366, 650, 1), ("laptop150", 1280, 600, 1.5), ("phone", 390, 700, 2)):
        pg = open_page(b, url, w, h, log, scale=scale)
        n = 0
        for i in (0, 1):
            dur = pg.evaluate(f"PAGE.players[{i}].t1 - PAGE.players[{i}].t0")
            for j, f in enumerate((0, 0.2, 0.45, 0.7, 1) if label != "laptop150" else (0.45,)):
                to(pg, i); pg.evaluate(f"(() => {{ const P = PAGE.players[{i}]; P.draw(P.t0 + {f * dur}); }})()"); pg.wait_for_timeout(120)
                pg.screenshot(path=str(out / f"{label}-{pg.evaluate(f'PAGE.players[{i}].sec.dataset.shot')}-{j}.png")); n += 1
        pg.close()
        log.add("info", f"pictures: {label} {w}x{h} at {scale}x", f"{n} files")


def text(b, url, log):
    pg = open_page(b, url, 1440, 800, log)
    log.add("info", "fonts", pg.evaluate(FONT_JS))
    f = pg.evaluate(FONT_JS)
    log.check("the page's own fonts are loaded", f["serif"] and f["sans"] and f["mono"] and f["faces"] >= 6, f"{f['faces']} of {f['all']} faces")
    sig = {}
    for i in (0, 1):
        dur = pg.evaluate(f"PAGE.players[{i}].t1 - PAGE.players[{i}].t0")
        for j in range(9):
            sig[f"{i}:{j}"] = pg.evaluate(TEXT_JS, [i, dur * j / 8])
    pg.close()
    return sig


def compare(ref_name, ref, name, sig):
    """Pieces of text that are not where, or as big as, they are in the first browser."""
    diffs, total = [], 0
    for key in ref:
        a, b = ref[key], sig.get(key, [])
        if len(a) != len(b):
            diffs.append(f"moment {key}: {len(a)} pieces of text in {ref_name}, {len(b)} in {name}"); continue
        for x, y in zip(a, b):
            total += 1
            if x[0] != y[0]: diffs.append(f"moment {key}: “{x[0]}” / “{y[0]}”")
            elif abs(x[4] - y[4]) > 5: diffs.append(f"moment {key}: “{x[0]}” is {y[4]}px tall, {x[4]}px in {ref_name} (wraps differently?)")
            elif abs(x[1] - y[1]) > 6 or abs(x[2] - y[2]) > 6: diffs.append(f"moment {key}: “{x[0]}” is at {y[1]},{y[2]}, at {x[1]},{x[2]} in {ref_name}")
            elif abs(x[3] - y[3]) > max(4, 0.04 * x[3]): diffs.append(f"moment {key}: “{x[0]}” is {y[3]}px wide, {x[3]}px in {ref_name}")
    return total, diffs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--browsers", default="chrome")
    ap.add_argument("--out", default="video/out/site-check")
    a = ap.parse_args()
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    url = serve()
    logs, tables, sigs = [], {}, {}
    with sync_playwright() as p:
        for name in a.browsers.split(","):
            log = Log(name); logs.append(log)
            try:
                b = launch(p, name)
            except Exception as e:
                log.add("FAIL", "could not start the browser", str(e)[:200]); continue
            try:
                log.add("info", "version", b.version)
                (out / name).mkdir(exist_ok=True)
                tables[name] = sizes(b, url, log)
                playing(b, url, log)
                pictures(b, url, log, out / name)
                sigs[name] = text(b, url, log)
            except Exception as e:
                log.add("FAIL", "the check itself stopped", str(e)[:400])
            finally:
                b.close()
    names = list(sigs)
    for name in names[1:]:
        total, diffs = compare(names[0], sigs[names[0]], name, sigs[name])
        log = next(l for l in logs if l.browser == name)
        log.add("pass" if not diffs else "warn", f"text against {names[0]}", f"{total} pieces compared, {len(diffs)} differ")
        for d in diffs[:25]: log.add("warn", "  differs", d)
    (out / "text.json").write_text(json.dumps(sigs))

    # the report
    md = ["# Page prototype: browser check", ""]
    md += ["| browser | version | pass | warn | FAIL |", "|---|---|---|---|---|"]
    for l in logs:
        ver = next((r[2] for r in l.rows if r[1] == "version"), "")
        md.append(f"| {l.browser} | {ver} | " + " | ".join(str(sum(r[0] == k for r in l.rows)) for k in ("pass", "warn", "FAIL")) + " |")
    for l in logs:
        md += ["", f"## {l.browser}", ""]
        md += [f"- **{lv}** {nm}: {dt}" if lv in ("FAIL", "warn") else f"- {lv} {nm}: {dt}" for lv, nm, dt in l.rows]
        if l.browser in tables:
            md += ["", "| screen | viewport | layout | region / screen height | picture | body text, wide view | |", "|---|---|---|---|---|---|---|"]
            md += ["| " + " | ".join(t) + " |" for t in tables[l.browser]]
    (out / "report.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    failed = sum(r[0] == "FAIL" for l in logs for r in l.rows)
    print(f"\n{failed} failed; report: {out / 'report.md'}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
