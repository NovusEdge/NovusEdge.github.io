"""Hand-keyed walk for the sleek cat, walking right. The leg drawings live in
legs.py; this file is the exposure sheet (which drawing each leg shows on each
frame) plus the body, haunch, head and tail they attach to."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'styles', 'sleek'))
from lib import P, W, H, blank, outline, rows  # noqa: E402
from parts import ellipse, rows_mask, path, shade, paint  # noqa: E402
from idle import HEAD as SIT_HEAD, EYES as SIT_EYES  # noqa: E402
from legs import HIND, FORE, HIND_TOP, FORE_TOP  # noqa: E402

GROUND = 29
HIP, SHOULDER = 11, 20    # sprite columns of the near hind and fore pivots
# The far fore sits a pixel ahead so it peeks out past the near one. The far hind
# stays on the near hip: offset forward, it touches the near hind on the up frames.
FAR_DX = {'H': 0, 'F': 1}
TRAVEL = 1                # px the sprite moves per frame; planted paws move back by this
N = 12

SEQ = ['s+3', 's+2', 's+1', 's0', 's-1', 's-2', 's-3', 'w-3', 'w-1', 'w+1', 'w+3h', 'w+3']
# Lateral sequence: near hind, near fore, far hind, far fore, a quarter cycle apart.
OFFSET = {'NH': 0, 'NF': 3, 'FH': 6, 'FF': 9}
KEYS = {0: 'contact', 1: 'down', 3: 'passing', 4: 'up',
        6: 'contact', 7: 'down', 9: 'passing', 10: 'up'}
# Body settles a pixel after each hind contact. Hind drawings s+2, s+1, w-3, w-1 and
# fore drawings s-1, s-2, w+3h, w+3 only ever appear on these frames.
DIP = {1: 1, 2: 1, 7: 1, 8: 1}

# The chest swells forward under the chin to a point at row 16, then runs back to the elbow.
BODY = rows_mask({11: (17, 21), 12: (9, 22), 13: (7, 23), 14: (6, 24), 15: (6, 25), 16: (6, 25),
                  17: (6, 25), 18: (6, 24), 19: (6, 24), 20: (7, 23), 21: (9, 22)})
BIB = rows_mask({13: (22, 23), 14: (21, 24), 15: (21, 25), 16: (21, 25), 17: (22, 25),
                 18: (22, 24), 19: (23, 24), 20: (23, 23)})

# Near haunch, top row 12 (11 when the leg under it is planted). The lower rows lean
# with the thigh: forward at contact, back at push-off.
_H_TOP = {0: (8, 12), 1: (7, 13), 2: (6, 14), 3: (6, 14), 4: (5, 14), 5: (5, 14), 6: (5, 14)}
HAUNCH = {
    'fwd': {**_H_TOP, 7: (6, 15), 8: (7, 15), 9: (8, 14), 10: (10, 14)},
    'mid': {**_H_TOP, 7: (5, 14), 8: (6, 14), 9: (7, 13), 10: (9, 13)},
    'back': {**_H_TOP, 7: (5, 13), 8: (5, 13), 9: (6, 12), 10: (7, 12)},
}
HAUNCH_FOR = {'s+3': 'fwd', 's+2': 'fwd', 'w+1': 'fwd', 'w+3h': 'fwd', 'w+3': 'fwd',
              's+1': 'mid', 's0': 'mid', 'w-1': 'mid',
              's-1': 'back', 's-2': 'back', 's-3': 'back', 'w-3': 'back'}
PLANTED_MID = ('s+1', 's0', 's-1')


def _head():
    """The sitting head, mirrored to face right with the light kept on the left."""
    swap = {'L': 'D', 'D': 'L'}
    out = {}
    for j, r in enumerate(SIT_HEAD):
        seg = r[4:16]
        for i, c in enumerate(reversed(seg)):
            if c != '.':
                out[(i, j)] = swap.get(c, c)
    for ex, ey in SIT_EYES:
        mx = 15 - (ex + 1)   # mirrored left cell of the eye pair
        y = ey - 3
        out[(mx, y)], out[(mx + 1, y)] = 'H', 'K'
        out[(mx, y + 1)], out[(mx + 1, y + 1)] = 'E', 'K'
    return out


HEAD = _head()
HEAD_X, HEAD_Y = 18, 3

# Tail carried up and back in a long gentle curve; the tip drifts a pixel or two.
TAILS = {
    'a': [(8, 13), (5, 12), (3, 10), (2, 7), (3, 4), (5, 2), (7, 1)],
    'b': [(8, 13), (5, 12), (3, 10), (2, 7), (3, 4), (5, 3), (7, 2)],
    'c': [(8, 13), (5, 12), (3, 10), (2, 7), (2, 4), (4, 2), (6, 1)],
}
TAIL_SEQ = 'aaabbbaaaccc'


def tail_px(pts, dy):
    ps = path(pts)
    n = len(ps)
    px = {}
    for i, (x, y) in enumerate(ps):
        w = 2 if i < n * .7 else 1
        ch = 'T' if i >= n - 3 else 'B'
        for ddx in range(w):
            for ddy in range(w):
                px[(x + ddx, y + ddy + dy)] = ch
    return px


def leg_px(rows_, top, pivot):
    return {(pivot - 6 + i, top + j): ch
            for j, r in enumerate(rows_) for i, ch in enumerate(r) if ch != '.'}


def lift(name, dy):
    return dy if name.startswith('w') else 0


def far(px):
    return {p: ('w' if c == 'P' else 'A') for p, c in px.items()}


def near(px):
    coat = shade({p for p, c in px.items() if c == 'B'})
    return {**coat, **{p: 'P' for p, c in px.items() if c == 'P'}}


def shift(mask, dy):
    return {(x, y + dy) for (x, y) in mask}


def pose(f):
    dy = DIP.get(f, 0)
    name = {k: SEQ[(f - o) % N] for k, o in OFFSET.items()}
    g = blank()
    paint(g, {p: 's' for p in ellipse(15, 30.5, 13, 1.2)})
    paint(g, far(leg_px(HIND[name['FH']], HIND_TOP + lift(name['FH'], dy), HIP + FAR_DX['H'])))
    paint(g, far(leg_px(FORE[name['FF']], FORE_TOP + lift(name['FF'], dy), SHOULDER + FAR_DX['F'])))
    paint(g, tail_px(TAILS[TAIL_SEQ[f]], dy))
    body = shift(BODY, dy)
    paint(g, shade(body))
    paint(g, {p: 'W' for p in shift(BIB, dy)})
    nh = name['NH']
    paint(g, near(leg_px(HIND[nh], HIND_TOP + lift(nh, dy), HIP)))
    top = 12 + dy - (1 if nh in PLANTED_MID else 0)
    haunch = rows_mask({top + j: span for j, span in HAUNCH[HAUNCH_FOR[nh]].items()})
    paint(g, shade(haunch), seam='D')
    nf = name['NF']
    paint(g, near(leg_px(FORE[nf], FORE_TOP + lift(nf, dy), SHOULDER)), seam='D')
    paint(g, {(HEAD_X + x, HEAD_Y + y): c for (x, y), c in HEAD.items()})
    outline(g)
    return rows(g), name


def frames():
    return [pose(f) for f in range(N)]
