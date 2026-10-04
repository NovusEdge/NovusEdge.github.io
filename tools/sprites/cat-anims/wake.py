"""Wake up, facing left: from the sleep curl the head comes up, the cat rises into
a long stretch (forelegs out, rump up), rocks back into the sit, yawns, and ends
on the idle's first frame."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, 'kit'), HERE]
from catkit import (build, check, ellipse, frag, head, mask_layer, rect, sit_with_head,  # noqa: E402
                    spans, tail_layer, tail_path, SIT)
import loaf  # noqa: E402
import sit_down  # noqa: E402
import sleep  # noqa: E402

FORE = {21: (12, 14), 22: (11, 14), 23: (10, 12), 24: (9, 11), 25: (8, 10), 26: (7, 9), 27: (5, 8)}
FPAW = {28: (3, 6), 29: (2, 6)}

# Rump high on straight hind legs: stifle forward, shin back to a high hock, the
# long rear foot down to the floor.
STRETCH = dict(
    body={11: (22, 26), 12: (19, 27), 13: (16, 27), 14: (13, 27), 15: (12, 27), 16: (11, 27),
          17: (11, 27), 18: (11, 27), 19: (10, 26), 20: (10, 19), 21: (10, 17), 22: (10, 16),
          23: (10, 15), 24: (10, 14)},
    haunch=(22.5, 15.5, 4.5, 4.5, 19),
    hind={19: (20, 25), 20: (20, 24), 21: (20, 23), 22: (21, 24), 23: (22, 25), 24: (23, 26),
          25: (24, 26), 26: (23, 25), 27: (23, 25)},
    hpaw={28: (22, 24), 29: (21, 24)},
    tail=[(26, 12), (27, 10), (28, 7), (28, 5), (27, 3)],
    head=(head('half'), -2, 12),
)
# Same stretch held a beat deeper: head a row lower, eyes squeezed shut, tail
# tip hooked over.
DEEP = dict(STRETCH, tail=[(26, 12), (27, 10), (28, 7), (27, 4), (25, 3)], head=(head('shut'), -2, 13))
# On the way up: rump half raised over bent hind legs, forelegs already reaching.
RISE = dict(
    body={15: (21, 26), 16: (17, 27), 17: (13, 27), 18: (11, 27), 19: (10, 27), 20: (10, 27),
          21: (10, 26), 22: (10, 25), 23: (10, 24), 24: (10, 22)},
    haunch=(22.5, 19.5, 4.5, 4.5, 24),
    hind={23: (20, 24), 24: (21, 25), 25: (22, 26), 26: (23, 26), 27: (22, 25)},
    hpaw={28: (21, 23), 29: (20, 23)},
    tail=[(26, 17), (28, 15), (29, 12), (28, 10)],
    head=(head('open'), -2, 13),
)
BIB = {20: (10, 12), 21: (10, 12), 22: (10, 11), 23: (10, 11), 24: (10, 11)}


def stretched(k):
    hm = ellipse(*k['haunch'][:4]) & rect(0, 0, 31, k['haunch'][4])
    body = {(x, y) for y, (a, b) in k['body'].items() for x in range(a, b + 1)}
    lay = [tail_layer(tail_path(k['tail'])),
           spans(k['hind'], 'f', -2), spans(k['hpaw'], 'q', -2), spans(FORE, 'f', -1), spans(FPAW, 'q', -1),
           spans(k['body'], 'b'), spans(BIB, 'W'), mask_layer(hm & body, 'h'),
           spans(k['hind'], 'n'), spans(k['hpaw'], 'p'), spans(FORE, 'n'), spans(FPAW, 'p')]
    return build(lay, heads=[k['head']])


# Yawn: eyes squeezed shut, jaw dropping open over a pink tongue.
YAWN_OPEN = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBOOBBBOOBDD
....LBBBBBBBBBDD
....LBBMNMBBBBDD
.....BMOKOMBBDD.
......MOUOBDD...
''')
# Head tipped back a row with the jaw wide.
YAWN_WIDE = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBOOBBBOOBDD
....LBBBBBBBBBDD
....LBBMNMBBBBDD
....LBMOOOMBBBDD
....LBOKKKOBBDDD
.....BOKUKOBBDD.
......MOUOMBDD..
.......MMMBD....
''')

FRAMES = [
    (500, sleep.pose(0, zs=False)),
    (260, sleep.pose(0, zs=False, head_at=(-2, 15))),
    (260, sleep.pose(0, zs=False, head=head('half'), head_at=(-2, 14))),
    (360, loaf.pose()),
    (150, stretched(RISE)),
    (150, stretched(STRETCH)),
    (700, stretched(DEEP)),
    (160, stretched(STRETCH)),
    (130, sit_down.drawn(sit_down.DROP)),
    (120, sit_down.settle(SIT)),
    (150, sit_with_head(YAWN_OPEN)),
    (650, sit_with_head(YAWN_WIDE, 2)),
    (150, sit_with_head(YAWN_OPEN)),
    (110, sit_with_head(head('half'))),
    (300, SIT),
]

CLIP = check({'loop': False, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'wake')
