"""Makes art/creation-hands.jpg: the two hands of Michelangelo's Creation of Adam, the right one as a mechanical hand.

  python video/site/art/make_art.py <the photograph from Wikimedia Commons> [--plain] [--out file]

The photograph is not kept in this repository (SOURCE.md says where it is). The left hand is the painting as it is.
The right hand keeps its place, its outline and the painting's own light and shade: its colours are turned to
metal, and joints, seams and bolts are drawn where the fingers, the wrist and the forearm bend.
--plain writes the detail unchanged.
"""
import sys
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BOX = (1480, 1262, 2520, 1670)      # the part of the photograph that is used: 1040 x 408
SS = 4                              # joints and seams are drawn this many times larger, then reduced

# The right hand and forearm, roughly (in the picture's own pixels): colour decides the exact edge inside it.
HAND = [(506, 212), (523, 197), (547, 186), (570, 182), (600, 183), (627, 177), (643, 172), (667, 163), (693, 157), (720, 150), (747, 143),
        (767, 137), (800, 128), (840, 122), (880, 117), (920, 104), (953, 96), (1000, 89), (1040, 84), (1040, 232), (1000, 238),
        (960, 242), (920, 240), (880, 241), (840, 238), (800, 232), (776, 232), (762, 242), (742, 257), (715, 265), (692, 276), (690, 296),
        (684, 316), (666, 316), (658, 302), (656, 284), (648, 296), (645, 318), (628, 326), (610, 326), (599, 306), (601, 272),
        (590, 262), (586, 250), (600, 240), (618, 228), (606, 219), (590, 218), (560, 221), (523, 224), (510, 219)]

# Where it bends: (x, y, radius) of a pivot; and lines across (seams between the parts).
PIVOTS = [(546, 204, 3.6), (591, 200, 4.2), (633, 197, 5.4), (621, 239, 3.8), (623, 291, 3.6), (672, 287, 3.4), (765, 188, 7.5), (912, 172, 5.0)]
SEAMS = [[(543, 189), (546, 204), (544, 219)], [(589, 183), (591, 200), (589, 217)], [(628, 177), (634, 197), (628, 220)],
         [(612, 229), (621, 239), (628, 250)], [(605, 292), (623, 291), (645, 289)], [(660, 289), (672, 287), (688, 284)],
         [(752, 141), (760, 165), (766, 188), (768, 212), (764, 240)], [(770, 136), (778, 160), (784, 188), (786, 212), (780, 232)],
         [(905, 106), (910, 140), (912, 172), (911, 210), (907, 241)]]
LINES = [[(790, 178), (850, 172), (905, 168)], [(920, 166), (980, 158), (1040, 150)]]     # along the forearm
BOLTS = [(800, 150), (800, 214), (890, 132), (890, 222), (930, 122), (930, 224), (1010, 96), (1010, 222), (700, 180), (660, 196)]
RAMP = [(0.00, (22, 26, 32)), (0.30, (78, 86, 96)), (0.55, (138, 147, 156)), (0.78, (198, 205, 210)), (1.00, (248, 250, 250))]


def hand_mask(a):
    """Which pixels are the right hand: inside the rough outline, and not plaster and not the red cloth."""
    h, w = a.shape[:2]
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    lum = 0.299 * R + 0.587 * G + 0.114 * B
    poly = Image.new("L", (w, h), 0)
    ImageDraw.Draw(poly).polygon(HAND, fill=255)
    wide = np.asarray(poly.filter(ImageFilter.MaxFilter(9))) > 0
    core = np.asarray(poly.filter(ImageFilter.MinFilter(13))) > 0
    skin = ((sat > 0.105) & (R - B > 16)) | (lum < 150)
    cloth = (sat > 0.55) & (R < 150) & (R - G > 20) & (G < 60)
    m = wide & (skin | core) & ~cloth
    m = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MinFilter(3))   # small holes closed; then one pixel in: no rim of plaster
    return np.asarray(m) > 127, lum


def metal(a, m, lum):
    """The hand's own light and shade, in the colours of steel."""
    # the photograph's grain would glitter on metal: the light and shade are smoothed a little first
    smooth = np.asarray(Image.fromarray(np.clip(lum, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.3))).astype(float)
    lum = smooth * 0.8 + lum * 0.2
    lo, hi = np.percentile(lum[m], [1.5, 99.5])
    t = np.clip((lum - lo) / (hi - lo), 0, 1)
    t = t * t * (3 - 2 * t) * 0.55 + t * 0.45            # a little more contrast: metal has harder lights
    xs = [p for p, _ in RAMP]
    out = np.stack([np.interp(t, xs, [c[i] for _, c in RAMP]) for i in range(3)], -1)
    return out * 0.9 + a * 0.1                            # a trace of the fresco's own colour, so that it sits in the picture


def details(size, m):
    """Seams, pivots and bolts, as two layers: what is darkened and what is lightened (drawn large, then reduced)."""
    w, h = size
    dark = Image.new("L", (w * SS, h * SS), 0); light = Image.new("L", (w * SS, h * SS), 0)
    dd, dl = ImageDraw.Draw(dark), ImageDraw.Draw(light)
    S = lambda pts: [(x * SS, y * SS) for x, y in pts]
    for line in SEAMS:
        dd.line(S(line), fill=240, width=round(2.0 * SS), joint="curve")
        dl.line(S([(x + 1.7, y + 0.5) for x, y in line]), fill=170, width=round(1.0 * SS), joint="curve")
    for line in LINES:
        dd.line(S(line), fill=170, width=round(1.2 * SS), joint="curve")
        dl.line(S([(x, y + 1.3) for x, y in line]), fill=110, width=round(0.8 * SS), joint="curve")
    for x, y, r in PIVOTS:
        box = lambda q: [(x - q) * SS, (y - q) * SS, (x + q) * SS, (y + q) * SS]
        dd.ellipse(box(r), fill=235)                       # a pin seen from its end: a dark ring, a lit face, a slot
        dl.ellipse(box(r * 0.7), fill=120)
        dd.ellipse(box(r * 0.7), fill=40)
        dd.line([((x - r * 0.45) * SS, (y + r * 0.3) * SS), ((x + r * 0.45) * SS, (y - r * 0.3) * SS)], fill=215, width=round(max(0.8, r * 0.2) * SS))
    for x, y in BOLTS:
        box = lambda q, ox=0.0, oy=0.0: [(x - q + ox) * SS, (y - q + oy) * SS, (x + q + ox) * SS, (y + q + oy) * SS]
        dd.ellipse(box(1.5), fill=200)
        dl.ellipse(box(0.8, -0.3, -0.3), fill=170)
    f = lambda im: np.asarray(im.resize((w, h), Image.LANCZOS)).astype(float) / 255 * m
    return f(dark), f(light)


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    out = pathlib.Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else pathlib.Path(__file__).with_name("creation-hands.jpg")
    if "--out" in sys.argv: args.remove(str(out))
    c = Image.open(args[0]).convert("RGB").crop(BOX)
    if "--plain" not in sys.argv:
        a = np.asarray(c).astype(float)
        m, lum = hand_mask(a)
        soft = np.asarray(Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.9))).astype(float)[..., None] / 255
        hand = metal(a, m, lum)
        dark, light = details(c.size, m)
        hand = hand * (1 - 0.78 * dark[..., None]) + (255 - hand) * 0.55 * light[..., None]
        a = a * (1 - soft) + hand * soft
        c = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    c.save(out, quality=88, optimize=True, progressive=True)
    print(out, c.size)


if __name__ == "__main__":
    main()
