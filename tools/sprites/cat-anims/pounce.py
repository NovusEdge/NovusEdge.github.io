"""Pounce, facing left: drop into a stalking crouch, wiggle the rump four times,
spring up and forward, land with the forepaws pinning a spot just ahead of the
sit's paws, look down at it, and sit back. The leap stays inside the canvas and
the sit at the end is the idle's first frame, so the cat ends where it began."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, 'kit'), HERE]
from catkit import build, check, ellipse, frag, head, mask_layer, rect, spans, tail_layer, tail_path, SIT  # noqa: E402
import sit_down  # noqa: E402
import wake  # noqa: E402

# Pupils blown wide, ears up: locked on.
HEAD_LOCK = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBHKBBBHKBDD
....LBKKBBBKKBDD
....LBBMNMBBBBDD
.....BMMOMMBBDD.
......MMMBBDD...
''')
# Looking down at the pinned paws: pupils at the bottom of the eyes.
HEAD_DOWN = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBEEBBBEEBDD
....LBHKBBBHKBDD
....LBBMNMBBBBDD
.....BMMOMMBBDD.
......MMMBBDD...
''')


def body_layers(k, dx_rump=0):
    """k: spans for body/haunch/legs, as in the other hand-drawn poses. dx_rump
    shifts everything behind column 17 sideways for the wiggle."""
    def rump(d):
        out = {}
        for y, s in d.items():
            ss = [s] if isinstance(s[0], int) else s
            out[y] = [(a + dx_rump if a >= 17 else a, b + dx_rump if b >= 17 else b) for a, b in ss]
        return out
    cx, cy, rx, ry, bottom = k['haunch']
    body = rump(k['body'])
    bm = {(x, y) for y, ss in body.items() for a, b in ss for x in range(a, b + 1)}
    hm = (ellipse(cx + dx_rump, cy, rx, ry) & rect(0, 0, 31, bottom)) & bm
    hind = {y: (a + dx_rump, b + dx_rump) for y, (a, b) in k['hind'].items()}
    hpaw = {y: (a + dx_rump, b + dx_rump) for y, (a, b) in k['hpaw'].items()}
    tail = [(x + dx_rump, y) for x, y in k['tail']]
    return [spans(hind, 'f', -2), spans(hpaw, 'q', -2), spans(k['fore'], 'f', 1), spans(k['fpaw'], 'q', 1),
            tail_layer(tail_path(tail, .6)),
            spans(body, 'b'), spans(k.get('bib', {}), 'W'), mask_layer(hm, 'h'),
            spans(hind, 'n'), spans(hpaw, 'p'), spans(k['fore'], 'n'), spans(k['fpaw'], 'p')]


# Stalking crouch: chest on the floor, forearms flat, rump up over gathered hind
# feet, tail low out behind.
CROUCH = dict(
    body={17: (20, 24), 18: (17, 25), 19: (12, 26), 20: (9, 26), 21: (8, 26), 22: (7, 26), 23: (7, 26),
          24: (7, 25), 25: (8, 25), 26: (9, 24)},
    bib={22: (7, 9), 23: (7, 9), 24: (7, 9), 25: (8, 9)},
    haunch=(22, 21.5, 4.5, 4.5, 26),
    hind={25: (21, 24), 26: (22, 24), 27: (22, 24)},
    hpaw={28: (18, 23), 29: (17, 23)},
    fore={26: (9, 12), 27: (7, 12)},
    fpaw={28: (4, 9), 29: (3, 9)},
    tail=[(25, 24), (28, 25), (29, 23), (29, 21)],
)
TAIL_FLICK = [(24, 24), (26, 25), (28, 24), (28, 21)]

# Spring: hind legs straightening behind, chest and head thrown up and forward.
LAUNCH = dict(
    body={11: (9, 13), 12: (8, 15), 13: (8, 17), 14: (8, 19), 15: (9, 21), 16: (10, 23), 17: (11, 24),
          18: (13, 25), 19: (15, 25), 20: (17, 25), 21: (19, 24)},
    bib={13: (8, 10), 14: (8, 10), 15: (9, 10)},
    haunch=(22, 19, 4.5, 4.5, 23),
    hind={22: (21, 24), 23: (22, 25), 24: (23, 25), 25: (23, 26), 26: (24, 26), 27: (24, 26)},
    hpaw={28: (23, 26), 29: (23, 27)},
    fore={17: (7, 10), 18: (5, 9), 19: (4, 7)},
    fpaw={20: (2, 5)},
    tail=[(25, 18), (28, 17), (29, 14)],
)
# Top of the leap: stretched flat, forepaws reaching down for the target, hind
# legs trailing.
AIR = dict(
    body={10: (10, 14), 11: (8, 22), 12: (7, 24), 13: (7, 25), 14: (7, 25), 15: (7, 25), 16: (8, 24),
          17: (10, 22)},
    bib={13: (7, 9), 14: (7, 9), 15: (7, 9), 16: (8, 9)},
    haunch=(21, 14, 4.5, 4, 18),
    hind={17: (22, 25), 18: (24, 27), 19: (26, 28)},
    hpaw={20: (27, 29)},
    fore={16: (6, 9), 17: (4, 8), 18: (3, 6), 19: (2, 5)},
    fpaw={20: (1, 4)},
    tail=[(25, 12), (28, 11), (29, 8)],
)


def crouch(dx=0, tail=None, hd=HEAD_LOCK, head_y=14):
    k = dict(CROUCH, tail=tail or CROUCH['tail'])
    return build(body_layers(k, dx), heads=[(hd, -2, head_y)])


FRAMES = [
    (250, SIT),
    (110, sit_down.drawn(sit_down.DROP)),
    (200, crouch()),
    (90, crouch(1, TAIL_FLICK)),
    (90, crouch(0)),
    (90, crouch(1, TAIL_FLICK)),
    (110, crouch(0)),
    (70, build(body_layers(LAUNCH), heads=[(HEAD_LOCK, -2, 3)])),
    (90, build(body_layers(AIR), heads=[(HEAD_LOCK, -3, 4)])),
    (90, wake.stretched(dict(wake.STRETCH, head=(HEAD_DOWN, -2, 13)))),
    (380, crouch(0, hd=HEAD_DOWN, head_y=15)),
    (120, sit_down.drawn(sit_down.DROP)),
    (300, SIT),
]

CLIP = check({'loop': False, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'pounce')
