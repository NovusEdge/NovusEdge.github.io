"""Side-view walk cycle facing right. Legs are two-bone IK from fixed hip/shoulder roots
so the body never changes size; only foot targets move."""
import math
from lib import P, PALETTES, blank, outline, rows, OUT
from parts import ellipse, rect, rows_mask, path, shade, paint

N = 12
GROUND = 29

HEAD = [
    P(0, '.L...D...'),
    P(0, '.LI.BID..'),
    P(0, 'LBBBBBBD.'),
    P(0, 'LBBBBBBBB.'),
    P(0, 'LBBBBEKBBM'),
    P(0, 'LBBBBBBMMN'),
    P(0, '.BBBBBMMO.'),
    P(0, '..DDDMMM..'),
]
HEAD_AT = (21, 7)


def foot(t):
    """Foot offset from the root for cycle step t: 8 stance frames moving back 1px each
    (matches the ground scroll), 4 swing frames carrying it forward."""
    if t < 8:
        return 4 - t, 0
    return {8: (-2, 1), 9: (0, 3), 10: (2, 3), 11: (3, 1)}[t]


def ik(root, tgt, l1, l2, bend):
    (rx, ry), (tx, ty) = root, tgt
    dx, dy = tx - rx, ty - ry
    d = min(math.hypot(dx, dy), l1 + l2 - 1e-6)
    a = math.atan2(dy, dx)
    c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    k = a + bend * math.acos(max(-1, min(1, c)))
    return rx + l1 * math.cos(k), ry + l1 * math.sin(k)


def leg(root, t, l1, l2, bend, thigh):
    fx, lift = foot(t)
    tgt = (root[0] + fx, GROUND - lift)
    kx, ky = ik(root, tgt, l1, l2, bend)
    pts = path([root, (round(kx), round(ky)), (round(tgt[0]), round(tgt[1]))])
    px = set()
    for i, (x, y) in enumerate(pts):
        w = thigh if i < len(pts) * .35 else 2
        for dx in range(w):
            px.add((x + dx - (w - 2), y))
    ex, ey = pts[-1]
    paw = {(ex, ey), (ex + 1, ey), (ex + 2, ey)}
    return px - paw, paw


FORE = dict(l1=5, l2=5.1, bend=-1, thigh=2)   # wrist forward when the paw lifts
HIND = dict(l1=5.4, l2=5.4, bend=1, thigh=3)    # hock points back


def legs(k):
    out = {}
    # lateral-sequence walk: near hind lands, near fore 3 frames later, then far side
    for name, root, o, spec in (('nh', (10, 19), 0, HIND), ('nf', (20, 20), 9, FORE),
                                ('fh', (12, 19), 6, HIND), ('ff', (21, 20), 3, FORE)):
        out[name] = leg(root, (k + o) % N, **spec)
    return out


def torso():
    top = {7: 16, 8: 15, 9: 14, 10: 14, 11: 14, 12: 14, 13: 15, 14: 15, 15: 15, 16: 15, 17: 15,
           18: 15, 19: 14, 20: 13, 21: 12, 22: 12, 23: 13}
    bot = {7: 18, 8: 20, 9: 21, 10: 21, 11: 21, 12: 21, 13: 20, 14: 20, 15: 20, 16: 20, 17: 21,
           18: 21, 19: 21, 20: 21, 21: 21, 22: 20, 23: 18}
    return {(x, y) for x in top for y in range(top[x], bot[x] + 1)}


def tail(k):
    s = math.sin(2 * math.pi * k / N)
    pts = [(8, 16), (5, 15), (3, 13), (3 - round(s * .6), 10), (4 - round(s), 8), (6 - round(s * 1.4), 6)]
    ps = path(pts)
    px = {}
    for i, (x, y) in enumerate(ps):
        w = 2 if i < len(ps) * .7 else 1
        for dx in range(w):
            for dy in range(w):
                px[(x + dx, y + dy)] = i >= len(ps) - 3
    out = shade(set(px), dark_edges='')
    out.update({p: 'T' for p, tip in px.items() if tip})
    return out


def frame(k):
    g = blank()
    paint(g, {p: 's' for p in ellipse(15.5, 30.5, 11, 1.2)})
    L = legs(k)
    for n in ('fh', 'ff'):
        body, paw = L[n]
        paint(g, {p: 'A' for p in body})
        # a lifted far paw shows its dark top, not the pad; white would float under the belly
        paint(g, {p: 'w' if foot((k + 6 * (n == 'fh') + 3 * (n == 'ff')) % N)[1] == 0 else 'A' for p in paw})
    paint(g, tail(k), under=True)
    t = torso()
    paint(g, shade(t))
    bib = {(x, y) for (x, y) in t if x >= 19 and y >= 17 - (x - 19) // 2} | rows_mask({15: (21, 23), 16: (21, 23)})
    paint(g, {p: 'W' for p in bib & t})
    hx, hy = HEAD_AT
    bob = 1 if (k % 6) in (1, 2) else 0
    for j, r in enumerate(HEAD):
        for i, c in enumerate(r):
            if c != '.':
                g[hy + j + bob][hx + i] = c
    fx = foot(k % N)[0]
    thigh = ellipse(10.5 + (fx > 1) - (fx < -1), 19.5, 2.6, 3.2)
    paint(g, shade(thigh, light=None, dark_edges='r'))
    for n in ('nh', 'nf'):
        body, paw = L[n]
        px = shade(body, light_edges='l', dark_edges='r')
        px.update({p: 'P' for p in paw})
        # seam only against far legs so the leg top melts into the body
        for (x, y) in px:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if (nx, ny) not in px and 0 <= nx < 32 and 0 <= ny < 32 and g[ny][nx] in 'Aw':
                    g[ny][nx] = 'O'
        paint(g, px)
    # a far leg peeking out by a single column behind a near leg reads as noise
    for y in range(32):
        for x in range(32):
            l, r = g[y][x - 1], g[y][(x + 1) % 32]
            if g[y][x] in 'Aw' and l not in 'Aw' and r not in 'Aw' and 'O' in (l + r):
                g[y][x] = '.'
    outline(g)
    return rows(g)


MS = [110] * N


def frames():
    return [{'ms': MS[k], 'px': frame(k)} for k in range(N)]


if __name__ == '__main__':
    from idle import sheet
    fs = [f['px'] for f in frames()]
    print('\n'.join(f'{i:2d} {r}' for i, r in enumerate(fs[0])))
    sheet(fs, 'walk-sheet')
    sheet(fs[:3], 'walk-zoom', 8)
