"""Confused: from the sit the head turns to the viewer and tilts one way with an ear
flopped, comes back level, tilts the other way, and turns back to profile. A "?"
bobs over the back of the head the whole time."""
from stoat import d, stamp, runs, compose
from periscope import FRONT, QUARTER
from rest import SIT_FAR, SIT_BODY, SIT_NEAR, sit, tail

# Head rolled toward the viewer's right: right eye a pixel low, nose and mouth
# following, the low ear flopped out flat. The roll the other way is the mirror image.
TILT_R = d('''
.LL.......
.IBLLL....
BBBBBBBBLL
BBKBBBBBB.
.BBBBBKBB.
..BWNWBB..
...WWWW...
''')
TILT_L = [r[::-1] for r in TILT_R]
# The in-between on the way into and out of each roll: the low ear has started to
# drop, the face is still level.
HALF_R = d('''
.LL......
.IBLLLLL.
BBBBBBBIB
BBKBBBKBB
.BBWNWBB.
..WWWWW..
''')
HALF_L = [r[::-1] for r in HALF_R]
# Head anchors over the sit's neck; the turned heads sit a pixel or two left of the
# profile one, as in periscope.
HEADS = {'quarter': (QUARTER, 21, 3), 'front': (FRONT, 20, 3), 'tilt_r': (TILT_R, 20, 3),
         'tilt_l': (TILT_L, 19, 3), 'half_r': (HALF_R, 20, 3), 'half_l': (HALF_L, 20, 3)}
Q = d('''
.QQ.
Q..Q
..Q.
....
..Q.
''')

# (head, "?" top row, ms); head None is the sit itself. Beats and timing follow the
# cat's approved confused: long holds on each tilt, the "?" bobbing a pixel each frame.
# Each roll eases in and out through the half-tilt.
SEQ = [
    (None, 2, 220),
    ('quarter', 1, 110),
    ('front', 2, 220),
    ('half_r', 1, 60),
    ('tilt_r', 2, 640),
    ('tilt_r', 1, 300),
    ('half_r', 2, 60),
    ('front', 1, 400),
    ('half_l', 2, 60),
    ('tilt_l', 1, 640),
    ('tilt_l', 2, 300),
    ('half_l', 1, 60),
    ('front', 2, 300),
    ('quarter', 1, 110),
    (None, 2, 400),
    (None, 1, 220),
]


def raw(f):
    name, qy, _ = SEQ[f]
    q = stamp(Q, 15, qy, 0, 0)
    if name is None:
        g = sit()
        for (x, y), c in q.items():
            g[y][x] = c
        return g
    rows, hx, hy = HEADS[name]
    return compose(runs(SIT_FAR), tail(), runs(SIT_BODY), runs(SIT_NEAR),
                   stamp(rows, hx, hy, 0, 0), q)


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
