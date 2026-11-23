"""Makes art/creation-hands.jpg: the two hands of Michelangelo's Creation of Adam, the right one replaced by a robot's.

  python video/site/art/make_art.py <the photograph from Wikimedia Commons> [--plain] [--wall] [--out file]

The photograph is not kept in this repository (SOURCE.md says where it is). The left hand and the wall are the
painting as it is. On the right:
  1. the painted hand and forearm are taken off the wall (the wall's own tone is carried across, with its grain);
  2. a robot's arm is put in their place, reaching in from the right, its first finger pointing at the other hand's.
     The arm is not drawn with lines: it is modelled from round parts (tubes for the fingers and the forearm, balls
     for the joints, a domed shell for the back of the hand), which give every point a height and so a direction it
     faces; from that, each point is lit as polished metal (it mirrors a bright sky above and the warm wall below,
     with a highlight towards the light, and shade in the gaps between parts).
The picture is written at twice the size of the photograph's detail so that the arm is sharp.
--plain writes the detail unchanged (at the photograph's own size); --wall writes step 1 only.
"""
import sys
import math
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BOX = (1480, 1262, 2520, 1670)      # the part of the photograph that is used: 1040 x 408
UP = 2                              # the picture is written this many times larger
SS = 2                              # and the arm is worked out this many times larger again, then reduced

# All positions below are in the pixels of the detail (1040 x 408).
# The painted right hand and forearm, roughly: colour decides the exact edge inside it.
HAND = [(506, 212), (523, 197), (547, 186), (570, 182), (600, 183), (627, 177), (643, 172), (667, 163), (693, 157), (720, 150), (747, 143),
        (767, 137), (800, 128), (840, 122), (880, 117), (920, 104), (953, 96), (1000, 89), (1040, 84), (1040, 232), (1000, 238),
        (960, 242), (920, 240), (880, 241), (840, 238), (800, 232), (776, 232), (762, 242), (742, 257), (715, 265), (692, 276), (690, 296),
        (684, 316), (666, 316), (658, 302), (656, 284), (648, 296), (645, 318), (628, 326), (610, 326), (599, 306), (601, 272),
        (590, 262), (586, 250), (600, 240), (618, 228), (606, 219), (590, 218), (560, 221), (523, 224), (510, 219)]
FINGER = [(509, 211), (514, 204), (523, 199), (547, 189), (570, 185), (600, 186), (627, 180), (630, 222), (606, 219), (590, 217), (560, 220), (523, 222), (513, 217)]
WALL = (430, 6, 760, 120)           # a piece of bare wall: where the grain for the mended part comes from

# ---------------------------------------------------------------- the arm: what it is made of
# material: (colour it gives to what it mirrors, how much it is a mirror 0..1, how sharp the mirror is 0..1)
STEEL = ((0.93, 0.95, 0.97), 1.0, 0.85)
SATIN = ((0.80, 0.83, 0.86), 1.0, 0.35)
DARK = ((0.30, 0.32, 0.35), 0.9, 0.55)
COPPER = ((0.95, 0.58, 0.42), 1.0, 0.7)
RUBBER = ((0.10, 0.11, 0.12), 0.15, 0.1)
LIGHT = np.array([-0.46, -0.62, 0.64])          # towards the light: above, left, in front (as in the fresco)

# a finger: its joints from the knuckle to the tip, the radius at each, how far it stands off the wall
INDEX = ([(650, 197), (598, 201), (554, 206), (516, 211)], [12.5, 10.8, 9.2, 7.2], 20)
OTHERS = [([(704, 248), (686, 276), (678, 300), (684, 320)], [10, 8.6, 7.4, 6.0], 4),         # furthest back first
          ([(680, 242), (656, 270), (643, 296), (648, 318)], [10.6, 9.2, 7.8, 6.3], 8),
          ([(657, 229), (628, 252), (611, 276), (614, 298)], [11.2, 9.6, 8.2, 6.6], 12)]
BACK = [(646, 178), (700, 161), (752, 151), (774, 168), (778, 214), (760, 240), (718, 256), (678, 248), (650, 228), (638, 204)]   # back of the hand
WRIST = (794, 190, 21)
FOREARM = ((828, 187), (1070, 158), 43, 66)     # a tube: from, to, radius at each end
OPENING = [(858, 176), (968, 160), (972, 186), (862, 200)]      # where the forearm's shell is open


def blur(a, sigma):
    """A soft blur of an array of numbers (three passes of an even average: close to a Gaussian)."""
    r = max(1, int(round(sigma * 0.92)))
    for axis in (0, 1):
        for _ in range(3):
            pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
            c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float64)
            hi = [slice(None)] * a.ndim; lo = [slice(None)] * a.ndim
            hi[axis] = slice(2 * r + 1, None); lo[axis] = slice(0, -(2 * r + 1))
            a = ((c[tuple(hi)] - c[tuple(lo)]) / (2 * r + 1)).astype(np.float32)
    return a


class Model:
    """Round parts laid on the wall: for every point the highest part there, its height and what it is made of."""
    def __init__(self, size):
        self.k = UP * SS
        self.w, self.h = size[0] * self.k, size[1] * self.k
        self.z = np.zeros((self.h, self.w), np.float32)                  # height above the wall (0: the wall)
        self.tint = np.zeros((self.h, self.w, 3), np.float32)
        self.mirror = np.zeros((self.h, self.w), np.float32)
        self.sharp = np.zeros((self.h, self.w), np.float32)

    def _box(self, x0, y0, x1, y1):
        k = self.k
        a, b = max(0, int(x0 * k) - 2), max(0, int(y0 * k) - 2)
        c, d = min(self.w, int(x1 * k) + 3), min(self.h, int(y1 * k) + 3)
        if c <= a or d <= b: return None
        yy, xx = np.mgrid[b:d, a:c].astype(np.float32)
        return (slice(b, d), slice(a, c)), (xx + 0.5) / k, (yy + 0.5) / k

    def _put(self, sl, height, inside, mat, keep=None):
        z = self.z[sl]
        on = inside & (height * self.k > z)
        if keep is not None: on &= keep[sl]
        z[on] = (height * self.k)[on]
        self.tint[sl][on] = mat[0]; self.mirror[sl][on] = mat[1]; self.sharp[sl][on] = mat[2]

    def tube(self, p0, p1, r0, r1, base, mat, keep=None):
        """A round part with round ends, r0 thick at one end and r1 at the other, its lowest line `base` off the wall."""
        r = max(r0, r1)
        got = self._box(min(p0[0], p1[0]) - r, min(p0[1], p1[1]) - r, max(p0[0], p1[0]) + r, max(p0[1], p1[1]) + r)
        if not got: return
        sl, x, y = got
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n2 = dx * dx + dy * dy
        t = np.clip(((x - p0[0]) * dx + (y - p0[1]) * dy) / n2, 0, 1) if n2 else np.zeros_like(x)
        rr = r0 + (r1 - r0) * t
        d2 = (x - (p0[0] + dx * t)) ** 2 + (y - (p0[1] + dy * t)) ** 2
        inside = d2 < rr * rr
        self._put(sl, base + rr + np.sqrt(np.maximum(rr * rr - d2, 0)), inside, mat, keep)

    def ball(self, c, r, base, mat):
        self.tube(c, c, r, r, base, mat)

    def disc(self, c, r, top, mat, round_=0.3):
        """A flat round face (a pin seen from its end), its edge rounded."""
        got = self._box(c[0] - r, c[1] - r, c[0] + r, c[1] + r)
        if not got: return
        sl, x, y = got
        d = np.sqrt((x - c[0]) ** 2 + (y - c[1]) ** 2)
        e = np.clip((r - d) / (r * round_), 0, 1)
        self._put(sl, top - r * round_ * (1 - np.sqrt(1 - (1 - e) ** 2 + 1e-6)), d < r, mat)

    def dome(self, pts, base, rise, mat, soft=7.0):
        """A shell over a shape: flat at `base`, swelling by `rise` towards its middle, its edge rounded."""
        k = self.k
        m = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(m).polygon([(x * k, y * k) for x, y in pts], fill=255)
        inside = np.asarray(m) > 127
        f = inside.astype(np.float32)
        b1 = blur(f, soft * k)                                           # how deep inside the shape a point is
        b2 = blur(f, soft * k * 3.2)
        edge = np.sqrt(np.clip((b1 - 0.5) * 2, 0, 1))
        height = base + rise * (0.45 * edge + 0.55 * np.clip((b2 - 0.35) / 0.6, 0, 1) ** 0.8)
        self._put((slice(0, self.h), slice(0, self.w)), height, inside, mat)

    def mask(self, pts, grow=0.0):
        k = self.k
        m = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(m).polygon([(x * k, y * k) for x, y in pts], fill=255)
        if grow: m = m.filter(ImageFilter.MaxFilter(2 * int(grow * k) + 1))
        return np.asarray(m) > 127

    def groove(self, p0, p1, width, depth):
        """A line cut into whatever is there (a seam between two plates)."""
        got = self._box(min(p0[0], p1[0]) - width, min(p0[1], p1[1]) - width, max(p0[0], p1[0]) + width, max(p0[1], p1[1]) + width)
        if not got: return
        sl, x, y = got
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n2 = dx * dx + dy * dy
        t = np.clip(((x - p0[0]) * dx + (y - p0[1]) * dy) / n2, 0, 1)
        d = np.sqrt((x - (p0[0] + dx * t)) ** 2 + (y - (p0[1] + dy * t)) ** 2)
        cut = np.clip(1 - d / (width / 2), 0, 1)
        z = self.z[sl]; on = (z > 0) & (cut > 0)
        z[on] -= (depth * self.k * cut ** 0.6)[on]
        self.mirror[sl][on] *= (1 - 0.5 * cut[on])

    def finger(self, pts, rs, base):
        for i in range(len(pts) - 1):
            p0, p1, r0, r1 = pts[i], pts[i + 1], rs[i], rs[i + 1]
            dx, dy = p1[0] - p0[0], p1[1] - p0[1]; n = math.hypot(dx, dy); ux, uy = dx / n, dy / n
            last = i == len(pts) - 2
            a = (p0[0] + ux * r0 * 0.95, p0[1] + uy * r0 * 0.95)                 # each part stops short of its joints
            b = (p1[0] - ux * r1 * (0.2 if last else 0.95), p1[1] - uy * r1 * (0.2 if last else 0.95))
            self.tube(p0, p1, r0 * 0.5, r1 * 0.5, base + r0 * 0.45, DARK)        # the link through the joints
            self.tube(a, b, r0 * 0.98, r1 * (0.86 if last else 0.98), base, STEEL)
            if last:
                self.tube((p1[0] - ux * r1 * 1.5, p1[1] - uy * r1 * 1.5 + r1 * 0.5), (p1[0] - ux * r1 * 0.1, p1[1] - uy * r1 * 0.1 + r1 * 0.32), r1 * 0.62, r1 * 0.6, base + r1 * 0.2, RUBBER)   # the pad under the tip
            else:
                mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
                nx, ny = -uy, ux                                                  # a band round the middle of the part
                self.groove((mid[0] - nx * r0, mid[1] - ny * r0), (mid[0] + nx * r0, mid[1] + ny * r0), 1.6, 0.8)
        for (x, y), r in zip(pts[:-1], rs[:-1]):                                 # a joint: a dark ball, a pin through it
            self.ball((x, y), r * 0.92, base + r * 0.1, DARK)
            self.disc((x, y), r * 0.5, base + r * 2.06, SATIN)
            self.disc((x, y), r * 0.2, base + r * 2.16, DARK)


def build(size):
    m = Model(size)
    (f0, f1, r0, r1) = FOREARM
    # inside the forearm, seen through its opening: a dark core, a piston (cylinder and rod), two cables
    m.tube(f0, f1, r0 * 0.36, r1 * 0.36, 4, DARK)
    m.tube((904, 177), (980, 167), 9.0, 9.0, 46, SATIN); m.tube((852, 184), (908, 177), 3.6, 3.6, 51, STEEL)
    m.tube((902, 168.5), (905, 186.5), 2.8, 2.8, 59, COPPER)
    m.tube((856, 194), (975, 181), 2.3, 2.3, 44, COPPER); m.tube((856, 199), (975, 187), 2.3, 2.3, 42, RUBBER)
    # the forearm's shell, open there; rings where it is in parts; a collar at the wrist
    hole = ~m.mask(OPENING)
    m.tube(f0, f1, r0, r1, 0, STEEL, keep=hole)
    for t in (0.2, 0.62):
        cx, cy = f0[0] + (f1[0] - f0[0]) * t, f0[1] + (f1[1] - f0[1]) * t; rr = r0 + (r1 - r0) * t
        m.groove((cx + 6, cy - rr), (cx - 6 + 12, cy + rr), 3.2, 2.2)
    m.groove(OPENING[0], OPENING[1], 2.4, 1.2); m.groove(OPENING[3], OPENING[2], 2.4, 1.2)
    m.tube((822, 147), (830, 229), 7.5, 7.5, 36, SATIN)
    # wrist: a ball in a socket
    x, y, r = WRIST
    m.ball((x, y), r, 6, DARK)
    m.tube((x - 3, y - r * 0.9), (x - 1, y + r * 0.9), 4.2, 4.2, r * 1.75, COPPER)
    # the fingers that hang (furthest first), then the back of the hand over their knuckles, then the first finger
    for pts, rs, base in OTHERS: m.finger(pts, rs, base)
    m.dome(BACK, 16, 30, STEEL)
    m.groove((668, 186), (756, 171), 2.0, 1.4); m.groove((652, 214), (700, 240), 2.0, 1.4); m.groove((700, 240), (764, 226), 2.0, 1.4)
    m.tube((768, 160), (772, 226), 8.5, 8.5, 34, SATIN)                                # the socket's rim
    m.tube((694, 207), (752, 200), 5.5, 5.5, 34, DARK); m.tube((700, 206), (746, 201), 2.4, 2.4, 43, COPPER)     # a slot on the back of the hand
    m.finger(*INDEX)
    m.ball(INDEX[0][0], 13.2, 21, DARK); m.disc(INDEX[0][0], 8.2, 49, COPPER); m.disc(INDEX[0][0], 3.0, 50.5, DARK)  # the first knuckle
    return m


def shade(m):
    """Every point lit as metal, from the direction it faces. Gives the colours and how much of the arm is there."""
    k = m.k
    zs = blur(m.z, 1.1)                                                              # no steps between pixels
    gy, gx = np.gradient(zs)
    n = np.stack([-gx, -gy, np.ones_like(zs)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    # what a mirror there shows: the ray from the eye, turned back by the surface
    rx, ry, rz = 2 * n[..., 2] * n[..., 0], 2 * n[..., 2] * n[..., 1], 2 * n[..., 2] ** 2 - 1
    up = -ry
    sharp = m.sharp
    s = lambda a, b, v: np.clip((v - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((v - a) / (b - a), 0, 1))
    wd = 0.05 + 0.45 * (1 - sharp)                                                    # a dull mirror blurs what it shows
    sky = 0.50 + 0.50 * s(0.10 - wd, 0.10 + wd, up) * (1 - 0.45 * s(0.72 - wd, 0.95, up))     # a bright band of sky, dimmer overhead
    ground = 0.16 + 0.42 * s(0.0, 0.9, -up)                                           # dark just under the horizon, then the wall's light from below
    lum = np.where(up > 0, sky, ground)
    lum = lum * (1 - 0.35 * s(0.0, wd * 1.5, 0.12 - np.abs(up + 0.02)) * sharp)        # the dark line of the horizon
    env = np.stack([lum * np.where(up > 0, 1.00, 1.06), lum * np.where(up > 0, 1.00, 0.98), lum * np.where(up > 0, 1.02, 0.86)], -1)   # sky cool, wall warm
    side = s(0.2, 0.9, rx)[..., None] * np.array([0.10, -0.03, -0.04])                # from the right: a little of the red cloth
    env = np.clip(env + side, 0, 1.2)
    ndl = np.clip((n * LIGHT).sum(-1), 0, 1)
    half = LIGHT + np.array([0, 0, 1.0]); half /= np.linalg.norm(half)
    spec = np.clip((n * half).sum(-1), 0, 1) ** (30 + 170 * sharp)
    matte = (0.30 + 0.75 * ndl)[..., None] * m.tint
    col = matte * (1 - m.mirror[..., None]) + env * m.tint * m.mirror[..., None] * (0.72 + 0.28 * ndl[..., None])
    col = col + spec[..., None] * (0.25 + 0.75 * m.mirror[..., None]) * 0.9
    # shade where a part is lower than what is around it (gaps, joints, the opening)
    around = blur(m.z, 5 * k)
    occ = np.clip((around - m.z) / (20 * k), 0, 1)
    col = col * (1 - 0.6 * occ[..., None])
    alpha = (m.z > 0).astype(np.float32)
    return np.clip(col, 0, 1), alpha


def mend(c):
    """The detail without the painted right hand: the wall's tone carried across the place, with the wall's grain."""
    a = np.asarray(c).astype(float)
    hole = hand_mask(a).filter(ImageFilter.MaxFilter(15))                # the hand, its dark outline and the light rim around it
    # what flows into the place is wall only: not the red cloth at the right edge
    R, G = a[..., 0], a[..., 1]
    cloth = Image.fromarray((((R - G > 28) & (a.max(-1) - a.min(-1) > 45)) * 255).astype("uint8")).filter(ImageFilter.MaxFilter(11))
    keep = (255 - np.asarray(hole).astype(float)) * (np.asarray(cloth) < 128)
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


def robot(c):
    """The detail at UP times its size, the right hand replaced."""
    W, H = c.width * UP, c.height * UP
    col, alpha = shade(build(c.size))
    wall = mend(c).resize((W, H), Image.LANCZOS)
    a = np.asarray(wall).astype(float)
    rgb = np.asarray(Image.fromarray((col * 255).astype("uint8")).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5))).astype(float)
    al = np.asarray(Image.fromarray((alpha * 255).astype("uint8")).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))).astype(float)[..., None] / 255
    # in the same picture as the wall: the wall's light (a little warm, not pure white), and its grain
    rgb = rgb * np.array([0.985, 0.97, 0.94]) * 0.97 + 4
    g = wall.convert("L")
    grain = np.asarray(g).astype(float) - np.asarray(g.filter(ImageFilter.GaussianBlur(2))).astype(float)
    rgb = rgb + grain[..., None] * 0.5
    # the arm is close to the wall: it dims the wall a little, below and to the right of itself
    sh = Image.fromarray((alpha * 255).astype("uint8")).resize((W, H), Image.LANCZOS)
    sh = np.asarray(sh.transform(sh.size, Image.AFFINE, (1, 0, -7 * UP, 0, 1, -9 * UP)).filter(ImageFilter.GaussianBlur(7 * UP))).astype(float)[..., None] / 255
    a = a * (1 - 0.30 * sh)
    return Image.fromarray(np.clip(a * (1 - al) + rgb * al, 0, 255).astype("uint8"))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    out = pathlib.Path(__file__).with_name("creation-hands.jpg")
    if "--out" in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index("--out") + 1]); args.remove(str(out))
    c = Image.open(args[0]).convert("RGB").crop(BOX)
    if "--wall" in sys.argv: c = mend(c)
    elif "--plain" not in sys.argv: c = robot(c)
    c.save(out, quality=88, optimize=True, progressive=True)
    print(out, c.size)


if __name__ == "__main__":
    main()
