"""Makes art/creation-hands.jpg: the two hands of Michelangelo's Creation of Adam, the right one as a robot's hand.

  python video/site/art/make_art.py <the photograph from Wikimedia Commons> [--plain] [--out file]

The photograph is not kept in this repository (SOURCE.md says where it is). The left hand and the wall are the
painting as it is. The right hand keeps its place, its outline and its pose, and is rebuilt inside that outline:
  - a dark mechanism fills the outline;
  - light shells lie on it, one for each part of a finger, for the back of the hand and for the forearm, with gaps
    where the hand bends; they are shaded by the painting's own broad light and shade, with hard edges;
  - in the gaps: pins at the joints, rods across the wrist, cables in an opening of the forearm.
The picture is written at twice the size of the photograph's detail so that these drawn parts are sharp.
--plain writes the detail unchanged (at the photograph's own size).
"""
import sys
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BOX = (1480, 1262, 2520, 1670)      # the part of the photograph that is used: 1040 x 408
UP = 2                              # the picture is written this many times larger
SS = 3                              # and the parts are drawn this many times larger again, then reduced

# All positions below are in the pixels of the detail (1040 x 408).
# The right hand and forearm, roughly: colour decides the exact edge inside it.
HAND = [(506, 212), (523, 197), (547, 186), (570, 182), (600, 183), (627, 177), (643, 172), (667, 163), (693, 157), (720, 150), (747, 143),
        (767, 137), (800, 128), (840, 122), (880, 117), (920, 104), (953, 96), (1000, 89), (1040, 84), (1040, 232), (1000, 238),
        (960, 242), (920, 240), (880, 241), (840, 238), (800, 232), (776, 232), (762, 242), (742, 257), (715, 265), (692, 276), (690, 296),
        (684, 316), (666, 316), (658, 302), (656, 284), (648, 296), (645, 318), (628, 326), (610, 326), (599, 306), (601, 272),
        (590, 262), (586, 250), (600, 240), (618, 228), (606, 219), (590, 218), (560, 221), (523, 224), (510, 219)]

# The first finger is pale, close to the wall's colour: its outline is given exactly.
FINGER = [(509, 211), (514, 204), (523, 199), (547, 189), (570, 185), (600, 186), (627, 180), (630, 222), (606, 219), (590, 217), (560, 220), (523, 222), (513, 217)]

# Where the shells are parted: (line, width). Wide ones are joints, narrow ones are seams between plates.
GAPS = [([(543, 184), (546, 204), (545, 224)], 4.2),                    # first finger: three joints, and the tip's pad
        ([(588, 178), (591, 200), (590, 222)], 4.6),
        ([(626, 172), (634, 197), (629, 224)], 5.2),
        ([(524, 192), (526, 208), (525, 226)], 1.6),
        ([(609, 225), (621, 239), (631, 253)], 4.0),                    # the finger under it
        ([(598, 293), (623, 291), (648, 288)], 3.8),                    # the three that hang
        ([(656, 290), (672, 287), (692, 283)], 3.8),
        ([(646, 170), (662, 196), (668, 226), (690, 252)], 1.8),        # back of the hand: the knuckle plate, a seam along it
        ([(668, 200), (705, 196), (748, 190)], 1.5),
        ([(759, 137), (768, 163), (774, 188), (776, 212), (771, 242)], 12.5),   # the wrist
        ([(803, 126), (808, 160), (810, 190), (808, 236)], 1.8),        # forearm: a cuff, a ring near the elbow, a seam along
        ([(905, 104), (910, 140), (912, 172), (911, 210), (907, 243)], 3.2),
        ([(920, 148), (980, 139), (1040, 130)], 1.5)]
WINDOW = [(822, 186), (890, 177), (893, 196), (825, 206)]              # an opening in the forearm
CABLES = [[(822, 191), (892, 182)], [(823, 196), (892, 187)], [(824, 201), (893, 192)]]
RODS = [[(752, 158), (786, 155)], [(756, 204), (788, 204)], [(755, 226), (784, 226)]]     # across the wrist
PINS = [(546, 204, 4.0), (591, 200, 4.6), (633, 197, 5.6), (621, 239, 4.0), (612, 291, 3.3), (634, 290, 3.3), (672, 287, 3.5), (773, 187, 8.5), (912, 172, 5.2)]
BOLTS = [(815, 140), (815, 222), (895, 126), (895, 226), (925, 118), (925, 228), (1012, 100), (1012, 224), (700, 172), (735, 164), (722, 238), (566, 196), (610, 192)]
SHELL = [(0.00, (70, 78, 88)), (0.30, (140, 149, 158)), (0.58, (196, 203, 209)), (0.82, (232, 236, 239)), (1.00, (252, 253, 253))]
DARK = (27, 31, 37)


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
    finger = Image.new("L", (w, h), 0)
    ImageDraw.Draw(finger).polygon(FINGER, fill=255)
    m = (wide & (skin | core) & ~cloth) | (np.asarray(finger) > 0)
    m = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    # the painting's own dark lines inside the hand (between the fingers, under the knuckles): darker than what is around them
    L = Image.fromarray(np.clip(lum, 0, 255).astype("uint8"))
    d = np.asarray(L.filter(ImageFilter.GaussianBlur(1.0))).astype(float) - np.asarray(L.filter(ImageFilter.GaussianBlur(7))).astype(float)
    where = np.zeros((h, w), bool); where[208:, 584:760] = True          # only where the fingers lie over each other: not the arm's cracks
    crease = Image.fromarray(((d < -20) & where).astype("uint8") * 255).filter(ImageFilter.MedianFilter(5))
    return m, lum, crease


def layer(size, draw):
    """A layer drawn SS times larger and reduced: 0..1."""
    im = Image.new("L", (size[0] * SS, size[1] * SS), 0)
    draw(ImageDraw.Draw(im), UP * SS)
    return np.asarray(im.resize(size, Image.LANCZOS)).astype(float) / 255


def line(d, k, pts, width, fill=255):
    q = [(x * k, y * k) for x, y in pts]
    d.line(q, fill=fill, width=max(1, round(width * k)), joint="curve")
    r = width * k / 2
    for x, y in (q[0], q[-1]): d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def disc(d, k, x, y, r, fill=255):
    d.ellipse([(x - r) * k, (y - r) * k, (x + r) * k, (y + r) * k], fill=fill)


def robot(c):
    """The detail at UP times its size, with the right hand rebuilt."""
    a1 = np.asarray(c).astype(float)
    m1, lum1, crease1 = hand_mask(a1)
    W, H = c.width * UP, c.height * UP
    big = c.resize((W, H), Image.LANCZOS)
    a = np.asarray(big).astype(float)
    up = lambda im, blur: np.asarray(im.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))).astype(float) / 255
    hand = up(m1, 2.4) > 0.5                                             # the outline, smooth at the larger size
    soft = np.asarray(Image.fromarray((hand * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.0))).astype(float)[..., None] / 255
    # the painting's light and shade, only its broad forms (no veins, no grain): what the shells are lit by
    lum = up(Image.fromarray(np.clip(lum1, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(3.2)), 2.0) * 255
    lo, hi = np.percentile(lum[hand], [3, 99.3])
    t = np.clip((lum - lo) / (hi - lo), 0, 1)
    t = 0.7 * t + 0.3 * np.round(t * 4) / 4                              # partly in steps: harder reflections, as on a polished surface
    t = np.asarray(Image.fromarray((t * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2.0))).astype(float) / 255
    xs = [p for p, _ in SHELL]
    shell_rgb = np.stack([np.interp(t, xs, [col[i] for _, col in SHELL]) for i in range(3)], -1)

    # shells: the outline drawn in by a rim, and parted at the gaps and the opening
    inner = np.asarray(Image.fromarray((hand * 255).astype("uint8")).filter(ImageFilter.MinFilter(2 * round(1.6 * UP) + 1))) > 127
    def cut(d, k):
        for pts, w in GAPS: line(d, k, pts, w)
        d.polygon([(x * k, y * k) for x, y in WINDOW], fill=255)
    gaps = np.clip(layer((W, H), cut) + (up(crease1, 2.6) > 0.5), 0, 1)     # and the painting's own lines between the fingers
    shell = np.clip(inner.astype(float) - gaps, 0, 1) * inner
    # every shell has a lit edge (above, left) and a shaded one (below, right)
    sh = Image.fromarray((shell * 255).astype("uint8"))
    off = lambda dx, dy: np.asarray(sh.transform(sh.size, Image.AFFINE, (1, 0, dx, 0, 1, dy), resample=Image.BILINEAR)).astype(float) / 255
    e = round(1.2 * UP)
    lit = np.clip(shell - off(e, e), 0, 1); shade = np.clip(shell - off(-e, -e), 0, 1)
    shell_rgb = shell_rgb + (255 - shell_rgb) * 0.75 * lit[..., None]
    shell_rgb = shell_rgb * (1 - 0.5 * shade[..., None])

    out = np.empty_like(a); out[:] = DARK
    out = out * (0.82 + 0.5 * (t[..., None] - 0.5) * 0.3)                # the mechanism: dark, faintly lit
    # in the gaps: rods across the wrist, cables in the opening, pins at the joints
    rods = layer((W, H), lambda d, k: [line(d, k, p, 2.4) for p in RODS])
    rods_hi = layer((W, H), lambda d, k: [line(d, k, [(x, y - 0.5) for x, y in p], 0.9) for p in RODS])
    cab = layer((W, H), lambda d, k: [line(d, k, p, 1.5) for p in CABLES])
    out = out + (np.array([120, 128, 138]) - out) * rods[..., None]
    out = out + (np.array([235, 238, 240]) - out) * rods_hi[..., None]
    out = out + (np.array([196, 110, 80]) - out) * (cab * 0.9)[..., None]          # the cables: the one warm colour
    out = out * (1 - shell[..., None]) + shell_rgb * shell[..., None]
    ring = layer((W, H), lambda d, k: [disc(d, k, x, y, r) for x, y, r in PINS])
    face = layer((W, H), lambda d, k: [disc(d, k, x, y, r * 0.68) for x, y, r in PINS])
    glint = layer((W, H), lambda d, k: [disc(d, k, x - r * 0.2, y - r * 0.22, r * 0.3) for x, y, r in PINS])
    hole = layer((W, H), lambda d, k: [disc(d, k, x, y, r * 0.2) for x, y, r in PINS])
    out = out + (np.array([34, 38, 44]) - out) * ring[..., None]
    out = out + (np.array([176, 184, 192]) - out) * face[..., None]
    out = out + (np.array([250, 251, 252]) - out) * (glint * 0.8)[..., None]
    out = out + (np.array([30, 34, 40]) - out) * hole[..., None]
    bolt = layer((W, H), lambda d, k: [disc(d, k, x, y, 1.5) for x, y in BOLTS]) * shell
    bolt_hi = layer((W, H), lambda d, k: [disc(d, k, x - 0.35, y - 0.35, 0.7) for x, y in BOLTS]) * shell
    out = out + (np.array([70, 78, 88]) - out) * (bolt * 0.9)[..., None]
    out = out + (np.array([245, 247, 248]) - out) * (bolt_hi * 0.8)[..., None]
    # a little of the wall's grain, so that it is part of the same picture
    g = big.convert("L")
    grain = np.asarray(g).astype(float) - np.asarray(g.filter(ImageFilter.GaussianBlur(2))).astype(float)
    out = out + grain[..., None] * 0.35
    a = a * (1 - soft) + out * soft
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8"))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    out = pathlib.Path(__file__).with_name("creation-hands.jpg")
    if "--out" in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index("--out") + 1]); args.remove(str(out))
    c = Image.open(args[0]).convert("RGB").crop(BOX)
    if "--plain" not in sys.argv: c = robot(c)
    c.save(out, quality=86, optimize=True, progressive=True)
    print(out, c.size)


if __name__ == "__main__":
    main()
