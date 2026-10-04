"""Floating pixel-me for the footer mockups, built on the approved front-facing figure
(tools/sprites/me/front.py): same HEAD, torso stamp, back hair and palette, with the
hanging arms cut off the torso so each concept can place its own."""
import math
import sys

ME = '/home/novusedge/Projects/Personal/NovusEdge.github.io/tools/sprites/me'
sys.path.insert(0, ME)

from PIL import Image
from lib import Grid, palette
from rig import capsule, shade, paint
import front

FW, FH = 48, 66
OX = 8                       # front.py's 32-wide figure, centred in 48

# rose neon (rose-400 core, rose-100 hot centre, rose-600 rim); glow letters are
# translucent and never outlined
NEON = {'1': '#fb7185', '2': '#ffe4e6', '3': '#e11d48', '4': '#fb718566', '5': '#fb718530'}
# bubbles: rim, shine, iridescent rose edge, dark glass fill, icon ink, icon accent
BUB = {'b': '#e8e4da', 'w': '#ffffff', 'r': '#fb7185', 'g': '#1a1a1ad9', 'k': '#e8e4da',
       'a': '#fb7185', 'm': '#e8e4da80'}
# wand handle
WAND = {'7': '#8a6a4a', '8': '#5e4631'}

PAL = palette('sweater', 'light', {**NEON, **BUB, **WAND})


def rows_of(s):
    return s.strip('\n').split('\n')


BODY = rows_of(front.BODY)


def armless_body():
    """front.BODY with the hanging arms removed. Columns 4 and 15 were the crease
    between arm and torso; they become the torso's lit and shaded edges."""
    out = []
    for j, r in enumerate(BODY):
        r = list(r)
        if 3 <= j <= 4:
            r[1] = '.'
            r[17] = '.'
        if 5 <= j <= 15:
            for i in range(len(r)):
                if i < 4 or i > 15:
                    r[i] = '.'
            if j == 15:
                pass
            elif j <= 12:
                r[4], r[15] = 'V', 'U'
            else:
                r[4], r[15] = 'R', 'Q'
        out.append(''.join(r))
    return out


TORSO = armless_body()

# toes point down when nothing is under him
FLOAT_FEET = ["....NNFF...NNFF...",
              ".....FF.....FF...."]


def legs_rows(kick=0):
    """kick: 0 both legs straight, 1 near (viewer-right) knee lifts one pixel."""
    rows = TORSO[:-2] + FLOAT_FEET
    if kick:
        # shorten the right leg by one row: drop a shin row, feet move up
        rows = rows[:]
        right = [r[10:] for r in rows]
        del right[27]
        right.append('.' * len(right[0]))
        rows = [l[:10] + rr for l, rr in zip(rows, right)]
    return rows


def lotus(g, oy):
    """Cross-legged in the air: thighs out to the knees, shins cross in front with the
    viewer-right shin on top, soles tucked under the opposite knees."""
    y = 30.5 + oy
    lk, rk = (14, y + 3), (34, y + 3)
    la, ra = (30, y + 6), (18, y + 6)
    thighs = capsule((20, y), lk, 2.6, 2.3) | capsule((28, y), rk, 2.6, 2.3)
    paint(g, shade(thighs, 'P', 'R', 'Q', light_side=(0, -1), dark_side=(0, 1)))
    back = capsule(lk, la, 2.0, 1.8)
    paint(g, shade(back, 'Q', None, 'X'))
    for c in [(31, y + 5), (32, y + 5), (31, y + 6), (32, y + 6), (33, y + 6)]:
        g.set(c[0], round(c[1]), 'F')
    top = capsule(rk, ra, 2.0, 1.8)
    for (x, yy) in top:
        for d in (-1, 1):
            if (x + d, yy) in back and (x + d, yy) not in top:
                g.set(x + d, yy, 'X')
    paint(g, shade(top, 'P', 'R', 'Q', light_side=(0, -1), dark_side=(0, 1)))
    for c in [(15, y + 6), (16, y + 6), (15, y + 7), (16, y + 7), (17, y + 7)]:
        g.set(c[0], round(c[1]), 'N' if c[1] == y + 6 else 'F')


HANDS = {
    # 2x2 fist, the walk cycle's
    'fist': ["SS", "SZ"],
    # open palm facing up, fingers toward the outside
    'palm_l': ["Y...", "SSSZ", ".SZ."],
    'palm_r': ["...Y", "ZSSS", ".ZS."],
    'palm_l2': ["Y.Y.", "SSSZ", ".SZ."],   # fingers spread, wiggle frame
    'palm_r2': [".Y.Y", "ZSSS", ".ZS."],
    'grip_l': ["SS", "SS", "SZ"],          # fingers wrapped over a rim
    'grip_r': ["SS", "SZ", "ZZ"],
    # flung open, fingers splayed away from the body
    'open_l': ["Y.Y", ".SS", "SSZ"],
    'open_r': ["Y.Y", "SS.", "ZSS"],
}


def arm(g, sh, el, wr, hand, side, torso_cells):
    cells = capsule(sh, el, 2.0, 1.8) | capsule(el, wr, 1.8, 1.5)
    cm = shade(cells, 'T', 'V', 'U')
    # sleeve against torso gets the K crease front.py draws between arm and body
    for c in cells:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (c[0] + dx, c[1] + dy)
            if n not in cells and n in torso_cells and n[1] > sh[1] + 1:
                g.set(*n, 'K')
    paint(g, cm)
    return cells


def stamp_hand(g, wr, hand, dx=0, dy=0):
    rows = HANDS[hand]
    h, w = len(rows), len(rows[0])
    x0, y0 = round(wr[0] - w / 2 + dx), round(wr[1] - h / 2 + dy)
    g.stamp(rows, x0, y0)


def figure(P, between=None, over=None):
    """P: oy (float height), sway (hair), blink, glance, mouth, kick, arms.
    arms: [(shoulder, elbow, wrist, hand, (hand dx, dy))] for viewer-left, viewer-right.
    between(g, oy) draws props between body and arms; over(g, oy) after the head."""
    g = Grid(FW, FH)
    oy = P.get('oy', 0)
    sway, lift = P.get('sway', 0), P.get('lift', 0)
    back = [list(r) for r in front.BACK_HAIR]
    for j, r in enumerate(front.BACK_HAIR):
        # hair ends drift with the float: lift trims the ends, sway pushes them out
        if j >= len(front.BACK_HAIR) - lift:
            continue
        s = round(sway * front.BACK_SHIFT[j])
        left = r[:10]
        right = r[10:]
        g.stamp([left], 6 + OX - s, 13 + oy + j)
        g.stamp([right], 16 + OX + s, 13 + oy + j)
    if P.get('legs') == 'lotus':
        lotus(g, oy)
        g.stamp(TORSO[:15], 7 + OX, 16 + oy)
    else:
        g.stamp(legs_rows(P.get('kick', 0)), 7 + OX, 16 + oy)
    for y in range(20, 28):
        for x in front.CABLES[y % 2]:
            if g.get(x + OX, y + oy) == 'T':
                g.set(x + OX, y + oy, 'A')
    torso = {(x, y) for y in range(FH) for x in range(FW) if g.get(x, y) in 'TUVAKRPQC'}
    if between and P.get('prop_behind'):
        between(g, oy)
    hands = []
    for a in P.get('arms', []):
        sh, el, wr, hand, hd = a
        sh, el, wr = [(p[0], p[1] + oy) for p in (sh, el, wr)]
        arm(g, sh, el, wr, hand, 0, torso)
        hands.append((wr, hand, hd))
    if between and not P.get('prop_behind'):
        between(g, oy)
    head_y = 2 + oy + P.get('duck', 0)
    g.stamp(front.HEAD, 8 + OX, head_y)
    hx, hy = 8 + OX, head_y
    if P.get('blink'):
        for x in (6, 9):
            g.set(hx + x, hy + 7, 'Z')
    elif P.get('glance') == 'up':
        for x in (6, 9):
            g.set(hx + x, hy + 7, 'S')
            g.set(hx + x, hy + 6, 'E')
    if P.get('mouth') == 'o':
        # blowing: the smile closes to a small round mouth
        for x in (5, 10):
            g.set(hx + x, hy + 10, 'H')
        for x in (6, 9):
            g.set(hx + x, hy + 11, 'H')
        g.set(hx + 7, hy + 11, 'M')
        g.set(hx + 8, hy + 11, 'M')
        g.set(hx + 7, hy + 10, 'M')
        g.set(hx + 8, hy + 10, 'M')
    if P.get('mouth') == 'puff':
        for x in (5, 10):
            g.set(hx + x, hy + 10, 'H')
        for x in (6, 9):
            g.set(hx + x, hy + 11, 'H')
        g.set(hx + 7, hy + 11, 'M')
        g.set(hx + 8, hy + 11, 'M')
    for wr, hand, hd in hands:
        stamp_hand(g, wr, hand, *hd)
    g.outline(ignore='s45')
    if over:
        over(g, oy)
    return g


# ---- the @ glyph ---------------------------------------------------------------

def at_glyph(n=17, stroke=2.0):
    """Rasterise an @ on an n x n grid: an outer ring open at four o'clock, an inner
    bowl, and the bowl's stem that runs down and curls out into the ring."""
    c = (n - 1) / 2
    R = c
    cells = set()
    inner_c = (c - 0.6, c)
    ri = n * 0.2
    for y in range(n):
        for x in range(n):
            dx, dy = x - c, y - c
            d = math.hypot(dx, dy)
            ang = math.degrees(math.atan2(dy, dx))      # 0 = right, 90 = down
            if R - stroke < d <= R + 0.4 and not (8 < ang < 62):
                cells.add((x, y))
            di = math.hypot(x - inner_c[0], y - inner_c[1])
            if ri - stroke + 0.2 < di <= ri + 0.5:
                cells.add((x, y))
    # stem down the bowl's right side and the curl out to the ring
    sx = round(inner_c[0] + ri)
    for y in range(round(c - ri) , round(c + ri) + 2):
        for k in range(int(stroke)):
            cells.add((sx - k + 1, y))
    ty = round(c + ri) + 1
    for x in range(sx - 0, round(c + R * 0.85) + 1):
        for k in range(int(stroke)):
            cells.add((x, ty + k - 1))
    return cells


AT_ROWS = None


def glyph_rows(n=17, stroke=2.0):
    cells = at_glyph(n, stroke)
    return [''.join('1' if (x, y) in cells else '.' for x in range(n)) for y in range(n)]


def neon(g, rows, x0, y0, level=1, hot=True):
    """Stamp an @ at (x0, y0) with a glow halo. level 0 dim, 1 normal, 2 flare."""
    cells = {(x0 + i, y0 + j) for j, r in enumerate(rows) for i, ch in enumerate(r) if ch == '1'}
    # over the sweater the rose needs a dark keyline to separate from the maroon
    for (x, y) in cells:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n not in cells and g.get(*n) not in '.45':
                g.set(*n, 'K')
    # glow only outside the ring, so the counters stay dark and the glyph stays legible
    n_ = len(rows)
    cx, cy, R = x0 + (n_ - 1) / 2, y0 + (n_ - 1) / 2, (n_ - 1) / 2
    outside = lambda p: math.hypot(p[0] - cx, p[1] - cy) > R - 0.5
    if level >= 1:
        for (x, y) in cells:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    n = (x + dx, y + dy)
                    if n not in cells and g.get(*n) == '.' and outside(n):
                        g.set(*n, '4' if level >= 2 else '5')
    if level >= 2:
        for (x, y) in cells:
            for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
                n = (x + dx, y + dy)
                if g.get(*n) == '.' and outside(n):
                    g.set(*n, '5')
    for c in cells:
        g.set(*c, '3' if level == 0 else '2' if (level == 2 and not hot) else '1')
    if hot and level >= 1:
        # the hot centre line runs along the middle of the 2px stroke
        for (x, y) in cells:
            if (x + 1, y) in cells and (x - 1, y) not in cells and (x, y + 1) in cells and level == 2:
                g.set(x, y, '2')
    return cells


# ---- rendering -----------------------------------------------------------------

def rgba(h):
    h = h.lstrip('#')
    v = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    v.append(int(h[6:8], 16) if len(h) == 8 else 255)
    return tuple(v)


def render(rows, pal=PAL, scale=1, bg=(26, 26, 26, 255)):
    h, w = len(rows), len(rows[0])
    im = Image.new('RGBA', (w, h), bg)
    lay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    px = lay.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.':
                px[x, y] = rgba(pal[ch])
    im = Image.alpha_composite(im, lay)
    return im.resize((w * scale, h * scale), Image.NEAREST) if scale != 1 else im


def strip(frames, scale=6, gap=2, bg=(26, 26, 26, 255), cols=None):
    cols = cols or len(frames)
    w, h = len(frames[0][0]), len(frames[0])
    n_rows = (len(frames) + cols - 1) // cols
    im = Image.new('RGBA', ((w + gap) * scale * cols, (h + gap) * scale * n_rows), (12, 12, 14, 255))
    for i, f in enumerate(frames):
        im.paste(render(f, scale=scale, bg=bg), ((i % cols) * (w + gap) * scale, (i // cols) * (h + gap) * scale))
    return im
