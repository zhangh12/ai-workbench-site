"""Makes art/creation-hands.jpg: the two hands of Michelangelo's Creation of Adam, the right one replaced by a robot's.

  python video/site/art/make_art.py <the photograph from Wikimedia Commons> [--plain] [--wall] [--out file]

The photograph is not kept in this repository (SOURCE.md says where it is). The left hand and the wall are the
painting as it is. On the right:
  1. the painted hand and forearm are taken off the wall (the wall's own tone is carried across, with its grain);
  2. a robot's arm is drawn in its place, reaching in from the right, its first finger pointing at the other hand's:
     a forearm of two shells with a piston between them, a ball at the wrist, a palm plate, fingers of three parts
     each with a pin at every joint.
The picture is written at twice the size of the photograph's detail so that the drawn arm is sharp.
--plain writes the detail unchanged (at the photograph's own size); --wall writes step 1 only.
"""
import sys
import math
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BOX = (1480, 1262, 2520, 1670)      # the part of the photograph that is used: 1040 x 408
UP = 2                              # the picture is written this many times larger
SS = 3                              # and the arm is drawn this many times larger again, then reduced

# All positions below are in the pixels of the detail (1040 x 408).
# The painted right hand and forearm, roughly: colour decides the exact edge inside it.
HAND = [(506, 212), (523, 197), (547, 186), (570, 182), (600, 183), (627, 177), (643, 172), (667, 163), (693, 157), (720, 150), (747, 143),
        (767, 137), (800, 128), (840, 122), (880, 117), (920, 104), (953, 96), (1000, 89), (1040, 84), (1040, 232), (1000, 238),
        (960, 242), (920, 240), (880, 241), (840, 238), (800, 232), (776, 232), (762, 242), (742, 257), (715, 265), (692, 276), (690, 296),
        (684, 316), (666, 316), (658, 302), (656, 284), (648, 296), (645, 318), (628, 326), (610, 326), (599, 306), (601, 272),
        (590, 262), (586, 250), (600, 240), (618, 228), (606, 219), (590, 218), (560, 221), (523, 224), (510, 219)]
FINGER = [(509, 211), (514, 204), (523, 199), (547, 189), (570, 185), (600, 186), (627, 180), (630, 222), (606, 219), (590, 217), (560, 220), (523, 222), (513, 217)]
WALL = (430, 6, 760, 120)           # a piece of bare wall: where the grain for the mended part comes from

# The robot's arm. A finger is a chain of points (knuckle first) and the width at each.
INDEX = ([(652, 197), (598, 201), (553, 206), (515, 211)], [25, 21, 17.5, 13])
OTHERS = [([(700, 246), (683, 276), (676, 302), (684, 322)], [18, 15.5, 13, 10]),        # drawn first: furthest back
          ([(676, 238), (652, 270), (640, 298), (648, 320)], [19, 16.5, 14, 10.5]),
          ([(654, 226), (624, 252), (608, 278), (614, 300)], [20, 17, 14.5, 11])]
THUMB = ([(716, 232), (690, 214), (664, 216)], [19, 16, 11])                              # tucked under the first finger
PALM = [(640, 181), (700, 164), (760, 152), (778, 170), (780, 214), (764, 240), (722, 256), (680, 250), (648, 228), (636, 206)]
WRIST = (792, 190, 17)
UPPER = [(806, 148), (1046, 104), (1046, 158), (812, 179)]                                 # the forearm's two shells
LOWER = [(812, 203), (1046, 190), (1046, 236), (808, 233)]
PISTON = [(812, 191), (892, 184)], [(888, 185), (1046, 172)]                              # its rod, its cylinder

INK, DARK, DEEP, STEEL, LIGHT, WHITE, CLAY = (20, 23, 27), (44, 49, 56), (86, 94, 104), (150, 159, 168), (214, 220, 225), (252, 253, 253), (217, 119, 87)
LIT = (-0.62, -0.78)                # where the light comes from: above, left (as in the fresco)


def hand_mask(a):
    """Which pixels are the painted right hand: inside the rough outline, and not plaster and not the red cloth."""
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
    return Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))


def mend(c):
    """The detail without the painted right hand: the wall's tone carried across the place, with the wall's grain."""
    a = np.asarray(c).astype(float)
    hole = hand_mask(a).filter(ImageFilter.MaxFilter(15))                # the hand, its dark outline and the light rim around it
    keep = 255 - np.asarray(hole).astype(float)
    def spread(sigma):                                                   # what is around the place, flowing into it
        num = np.stack([np.asarray(Image.fromarray((a[..., i] * keep / 255).astype("uint8")).filter(ImageFilter.GaussianBlur(sigma))).astype(float) for i in range(3)], -1)
        den = np.asarray(Image.fromarray(keep.astype("uint8")).filter(ImageFilter.GaussianBlur(sigma))).astype(float)[..., None] / 255
        return num / np.maximum(den, 1e-3), den
    near, dn = spread(14); far, _ = spread(46)
    wgt = np.clip(dn * 4, 0, 1)
    tone = near * wgt + far * (1 - wgt)
    # the wall's grain: what a piece of bare wall has beyond its own smooth tone, laid out again and again (mirrored)
    p = np.asarray(c.crop(WALL)).astype(float)
    g = p - np.asarray(Image.fromarray(p.astype("uint8")).filter(ImageFilter.GaussianBlur(5))).astype(float)
    g = np.concatenate([g, g[:, ::-1]], 1); g = np.concatenate([g, g[::-1]], 0)
    reps = (a.shape[0] // g.shape[0] + 1, a.shape[1] // g.shape[1] + 1, 1)
    grain = np.clip(np.tile(g, reps)[:a.shape[0], :a.shape[1]], -9, 9)   # its grain, not its cracks
    soft = np.asarray(hole.filter(ImageFilter.GaussianBlur(2.5))).astype(float)[..., None] / 255
    return Image.fromarray(np.clip(a * (1 - soft) + (tone + grain) * soft, 0, 255).astype("uint8"))


class Pen:
    """Draws the arm, large; shapes are given in the detail's pixels."""
    def __init__(self, size):
        self.k = UP * SS
        self.im = Image.new("RGBA", (size[0] * self.k, size[1] * self.k), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def disc(self, x, y, r, col):
        k = self.k
        self.d.ellipse([(x - r) * k, (y - r) * k, (x + r) * k, (y + r) * k], fill=col + (255,))

    def poly(self, pts, col):
        self.d.polygon([(x * self.k, y * self.k) for x, y in pts], fill=col + (255,))

    def bar(self, p0, p1, w0, w1, col):
        """A straight part, w0 wide at one end and w1 at the other, with round ends."""
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n = math.hypot(dx, dy) or 1; nx, ny = -dy / n, dx / n
        self.poly([(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2), (p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2),
                   (p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2), (p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2)], col)
        self.disc(p0[0], p0[1], w0 / 2, col); self.disc(p1[0], p1[1], w1 / 2, col)

    def tube(self, p0, p1, w0, w1, base=STEEL, edge=1.7):
        """A round part of metal: outline, body, its shaded side, its lit side, a line of light."""
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n = math.hypot(dx, dy) or 1; nx, ny = -dy / n, dx / n
        if nx * LIT[0] + ny * LIT[1] < 0: nx, ny = -nx, -ny                 # the side that faces the light
        sh = lambda q, f, w: (q[0] + nx * f * w, q[1] + ny * f * w)
        self.bar(p0, p1, w0 + 2 * edge, w1 + 2 * edge, INK)
        self.bar(p0, p1, w0, w1, base)
        self.bar(sh(p0, -0.24, w0), sh(p1, -0.24, w1), w0 * 0.42, w1 * 0.42, DEEP)
        self.bar(sh(p0, 0.15, w0), sh(p1, 0.15, w1), w0 * 0.5, w1 * 0.5, LIGHT)
        self.bar(sh(p0, 0.27, w0), sh(p1, 0.27, w1), w0 * 0.12, w1 * 0.12, WHITE)

    def pin(self, x, y, r, accent=False):
        """A joint seen from its end."""
        self.disc(x, y, r + 1.6, INK); self.disc(x, y, r, DARK)
        self.disc(x, y, r * 0.66, CLAY if accent else STEEL)
        self.disc(x + LIT[0] * r * 0.22, y + LIT[1] * r * 0.22, r * 0.3, WHITE if not accent else (245, 190, 165))
        self.disc(x, y, r * 0.16, INK)

    def finger(self, pts, ws):
        segs = list(zip(pts[:-1], pts[1:], ws[:-1], ws[1:]))
        for i, (p0, p1, w0, w1) in enumerate(segs):
            # each part is a little shorter than the distance between its joints, so that the joints show
            dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n = math.hypot(dx, dy); ux, uy = dx / n, dy / n
            a = (p0[0] + ux * w0 * 0.34, p0[1] + uy * w0 * 0.34)
            last = i == len(segs) - 1
            b = p1 if last else (p1[0] - ux * w1 * 0.34, p1[1] - uy * w1 * 0.34)
            self.bar(p0, p1, w0 * 0.42, w1 * 0.42, INK)                      # the link inside, seen at the joints
            self.tube(a, b, w0 * 0.96, (w1 * 0.8 if last else w1 * 0.96))
            if last:                                                          # the pad at the tip
                t = (p1[0] - ux * w1 * 0.1, p1[1] - uy * w1 * 0.1)
                self.bar((p1[0] - ux * w1 * 0.55, p1[1] - uy * w1 * 0.55), t, w1 * 0.86, w1 * 0.8, DARK)
                self.bar((p1[0] - ux * w1 * 0.5 + LIT[0] * w1 * 0.14, p1[1] - uy * w1 * 0.5 + LIT[1] * w1 * 0.14), (t[0] + LIT[0] * w1 * 0.14, t[1] + LIT[1] * w1 * 0.14), w1 * 0.2, w1 * 0.18, DEEP)
        for (x, y), w in zip(pts[:-1], ws[:-1]): self.pin(x, y, w * 0.36)

    def shell(self, pts, bolts=()):
        """A flat plate: outline, face, a lit band along its upper edge, a shaded one along its lower."""
        cx = sum(x for x, _ in pts) / len(pts); cy = sum(y for _, y in pts) / len(pts)
        grow = lambda f: [(cx + (x - cx) * f, cy + (y - cy) * f) for x, y in pts]
        out = [(x + (1.8 if x >= cx else -1.8), y + (1.8 if y >= cy else -1.8)) for x, y in pts]
        self.poly(out, INK); self.poly(pts, STEEL)
        self.poly([(x - LIT[0] * 3.2, y - LIT[1] * 3.2) for x, y in grow(0.9)], DEEP)
        self.poly([(x + LIT[0] * 1.6, y + LIT[1] * 1.6) for x, y in grow(0.86)], LIGHT)
        for x, y in bolts:
            self.disc(x, y, 2.3, DARK); self.disc(x + LIT[0] * 0.5, y + LIT[1] * 0.5, 1.1, WHITE)

    def image(self, size):
        return self.im.resize(size, Image.LANCZOS)


def arm(base, size):
    """The robot's arm, on nothing: drawn for a detail of `base` pixels, given back at `size`."""
    p = Pen(base)
    # forearm: the piston first (it is inside), then the two shells with the gap between them
    p.bar((800, 190), (1046, 174), 30, 44, INK)
    p.bar((800, 190), (1046, 174), 26, 40, DARK)
    p.tube(PISTON[1][0], PISTON[1][1], 17, 19, base=STEEL)
    p.tube(PISTON[0][0], PISTON[0][1], 6.5, 6.5, base=LIGHT, edge=1.2)
    p.bar((884, 176), (886, 195), 5, 5, INK); p.bar((884.5, 177), (886.5, 194), 2.6, 2.6, CLAY)        # the cylinder's collar
    for y0, y1 in ((203, 194), (207, 198)):                                                              # two cables under it
        p.bar((812, y0), (1046, y1), 2.6, 2.6, INK); p.bar((812, y0), (1046, y1), 1.3, 1.3, CLAY if y0 == 203 else DEEP)
    p.shell(UPPER, bolts=[(822, 153), (826, 171), (930, 133), (934, 158), (1020, 116), (1024, 150)])
    p.shell(LOWER, bolts=[(822, 212), (822, 226), (930, 208), (930, 230), (1020, 205), (1020, 230)])
    for x in (868, 978):                                                                                 # seams across the shells
        p.bar((x, 143 - (x - 868) * 0.18), (x + 4, 168 - (x - 868) * 0.09), 1.6, 1.6, INK)
        p.bar((x + 2, 206), (x + 2, 234), 1.6, 1.6, INK)
    # wrist: a collar on the forearm, a ball, a socket on the hand
    p.tube((806, 150), (808, 232), 11, 11, base=DEEP)
    x, y, r = WRIST
    p.disc(x, y, r + 2, INK); p.disc(x, y, r, STEEL); p.disc(x - LIT[0] * 3, y - LIT[1] * 3, r * 0.74, DEEP)
    p.disc(x + LIT[0] * 3.4, y + LIT[1] * 3.4, r * 0.62, LIGHT); p.disc(x + LIT[0] * 6.5, y + LIT[1] * 6.5, r * 0.2, WHITE)
    # the fingers that hang (furthest first), the thumb, the palm over their knuckles, then the first finger over the palm
    for pts, ws in OTHERS: p.finger(pts, ws)
    p.finger(*THUMB)
    p.shell(PALM, bolts=[(742, 168), (762, 224), (690, 236)])
    p.bar((668, 186), (752, 172), 2, 2, INK); p.bar((668, 188), (752, 174), 1, 1, LIGHT)                 # a seam along the back of the hand
    p.bar((690, 208), (760, 200), 9, 9, INK); p.bar((690, 208), (760, 200), 6, 6, DARK)                  # a slot, a rod in it
    p.bar((694, 208), (748, 202), 2.2, 2.2, CLAY)
    p.tube((764, 160), (768, 228), 10, 10, base=DEEP)                                                    # the socket
    p.finger(*INDEX)
    p.pin(INDEX[0][0][0], INDEX[0][0][1], 9.5, accent=True)                                              # the first knuckle: the one coloured part
    return p.image(size)


def robot(c):
    """The detail at UP times its size, the right hand replaced."""
    W, H = c.width * UP, c.height * UP
    wall = mend(c).resize((W, H), Image.LANCZOS)
    a = np.asarray(wall).astype(float)
    layer = arm(c.size, (W, H)).filter(ImageFilter.GaussianBlur(0.6))            # not sharper than the photograph around it
    r = np.asarray(layer).astype(float)
    alpha = r[..., 3:] / 255
    g = wall.convert("L")                                                 # a little of the wall's grain on the metal too
    grain = np.asarray(g).astype(float) - np.asarray(g.filter(ImageFilter.GaussianBlur(2))).astype(float)
    rgb = r[..., :3] * 0.96 + np.array([196, 190, 180]) * 0.04 + grain[..., None] * 0.45
    return Image.fromarray(np.clip(a * (1 - alpha) + rgb * alpha, 0, 255).astype("uint8"))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    out = pathlib.Path(__file__).with_name("creation-hands.jpg")
    if "--out" in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index("--out") + 1]); args.remove(str(out))
    c = Image.open(args[0]).convert("RGB").crop(BOX)
    if "--wall" in sys.argv: c = mend(c)
    elif "--plain" not in sys.argv: c = robot(c)
    c.save(out, quality=86, optimize=True, progressive=True)
    print(out, c.size)


if __name__ == "__main__":
    main()
