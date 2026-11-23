"""Pictures of one segment over its length, on one sheet: for making and checking a segment.

  python video/site/stills.py s04                 12 moments, evenly spread   -> video/out/segments/s04.png
  python video/site/stills.py s04 --at 0,2.5,7    these moments (seconds)
  python video/site/stills.py s04 --n 20 --cols 4

Each picture is the app window as the page shows it (the film frame's stage), with the guiding lines over it.
Page errors are printed. Needs playwright and Chrome; `npm ci` in video/.
"""
import argparse, functools, http.server, io, pathlib, sys, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

REPO = pathlib.Path(__file__).resolve().parents[2]


def serve():
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(H, directory=str(REPO)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{srv.server_address[1]}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id"); ap.add_argument("--n", type=int, default=12); ap.add_argument("--at"); ap.add_argument("--cols", type=int, default=3)
    ap.add_argument("--width", type=int, default=880); ap.add_argument("--out")
    a = ap.parse_args()
    base = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True)
        pg = b.new_page(viewport={"width": 1920, "height": 1124})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console: " + m.text + " " + str(m.location.get("url", ""))) if m.type == "error" and "favicon" not in str(m.location.get("url", "")) else None)
        pg.goto(f"{base}/video/site/seg.html?id={a.id}")
        pg.wait_for_function("window.SEG && SEG.ready", timeout=30000)
        info = pg.evaluate("({missing: !!SEG.missing, error: SEG.error || null, dur: SEG.dur})")
        if info["missing"] or info["error"]:
            print("cannot draw", a.id, info, errs); sys.exit(1)
        dur = info["dur"]
        times = [float(x) for x in a.at.split(",")] if a.at else [dur * i / (a.n - 1) * 0.997 for i in range(a.n)]
        ims = []
        for t in times:
            pg.evaluate(f"SEG.seek({t})")
            im = Image.open(io.BytesIO(pg.screenshot(clip={"x": 80, "y": 214, "width": 1760, "height": 842}))).convert("RGB")
            im = im.resize((a.width, round(a.width * 842 / 1760)), Image.LANCZOS)
            d = ImageDraw.Draw(im); d.rectangle([0, 0, 64, 18], fill=(0, 0, 0)); d.text((5, 3), f"{t:.1f}s", fill=(255, 255, 255))
            ims.append(im)
        b.close()
    w, h = ims[0].size; rows = (len(ims) + a.cols - 1) // a.cols
    sheet = Image.new("RGB", (w * a.cols + 6 * (a.cols - 1), h * rows + 6 * (rows - 1)), (40, 40, 40))
    for i, im in enumerate(ims): sheet.paste(im, ((i % a.cols) * (w + 6), (i // a.cols) * (h + 6)))
    out = pathlib.Path(a.out) if a.out else REPO / "video" / "out" / "segments" / f"{a.id}.png"
    out.parent.mkdir(parents=True, exist_ok=True); sheet.save(out)
    print(out, sheet.size, f"{len(ims)} pictures, {dur:.1f}s")
    for e in errs: print("PAGE ERROR:", e[:300])
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
