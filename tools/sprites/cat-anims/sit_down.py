"""Sit down, facing left: from the walk's standing body to the sleek sit.
The rump drops and comes forward over the hind feet while the near forepaw steps
up under the chest; the last frames are the idle's own tail settling."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import (build, check, ellipse, frag, head, idle, mask_layer, rect, spans,  # noqa: E402
                    stand, tail_layer, tail_path, walk, walk_leg, SIT)


def haunch(cx, cy, rx, ry, bottom):
    return mask_layer(ellipse(cx, cy, rx, ry) & rect(0, 0, 31, bottom), 'h')


# Hind legs folding: stifle forward under the haunch, hock pushed back and down,
# the paw still where the stand planted it (columns 19-21).
HIND_DIP = frag('''
nnnn....
.nnnnn..
...nnnn.
...nnnn.
.ppnn...
.ppp....
''')
# Hock nearly on the floor, the hind foot lying flat forward as it does in the sit.
HIND_DROP = frag('''
......nnn
.....nnn.
.pppppnn.
pppppppp.
''')

# Rump half down, near forepaw swinging forward, far forepaw still planted.
DIP = dict(
    body={11: (11, 15), 12: (9, 19), 13: (7, 22), 14: (6, 24), 15: (6, 25), 16: (6, 25), 17: (6, 25),
          18: (7, 25), 19: (7, 25), 20: (8, 25), 21: (9, 24), 22: (11, 23)},
    bib={13: (8, 9), 14: (7, 10), 15: (6, 10), 16: (6, 10), 17: (6, 9), 18: (7, 9), 19: (7, 8), 20: (8, 8)},
    haunch=(20.5, 18.5, 5.5, 5, 23),
    hind=(HIND_DIP, 17, 24),
    fore=walk_leg(walk.FORE, 'w+3h', walk.FORE_TOP - 1, walk.SHOULDER + 2, True),
    ffore=walk_leg(walk.FORE, 's-1', walk.FORE_TOP, walk.SHOULDER + 1, False),
    tail=[(24, 15), (27, 14), (28, 11), (29, 8), (28, 6)],
    head=(-2, 3),
)

HIND_MID = frag('''
.nnnn...
...nnnn.
....nnnn
..ppnnn.
.pppp...
''')

# Torso at about 45 degrees, near forepaw landing under the chest.
MID = dict(
    body={12: (9, 15), 13: (7, 18), 14: (6, 20), 15: (5, 21), 16: (5, 22), 17: (5, 23), 18: (5, 24),
          19: (5, 24), 20: (6, 25), 21: (6, 25), 22: (7, 25), 23: (8, 24), 24: (10, 23), 25: (11, 22)},
    bib={13: (7, 10), 14: (6, 10), 15: (5, 10), 16: (5, 10), 17: (5, 10), 18: (6, 9), 19: (6, 9), 20: (7, 8)},
    haunch=(20.5, 20.5, 5.5, 5, 25),
    hind=(HIND_MID, 16, 25),
    fore=(['..nnn', '..nnn', '.nnn', '.nnn', '.nnn', '.nnn', '.nnn', '.nnn', '.ppp', 'ppppp'], 4, 20),
    ffore=(['fff'] * 8 + ['qqq', 'qqq'], 11, 20),
    tail=[(24, 20), (27, 19), (29, 16), (29, 13)],
    head=(-1, 3),
)

# Haunch two rows off the floor, torso already near upright, near forepaw planted
# where the sit has it.
DROP = dict(
    body={12: (8, 14), 13: (7, 16), 14: (6, 17), 15: (5, 18), 16: (5, 19), 17: (4, 20), 18: (4, 21),
          19: (4, 22), 20: (5, 23), 21: (5, 24), 22: (5, 24), 23: (5, 24), 24: (6, 24), 25: (7, 24),
          26: (8, 23), 27: (9, 22)},
    bib={13: (7, 10), 14: (6, 10), 15: (5, 10), 16: (5, 10), 17: (5, 10), 18: (5, 9), 19: (5, 9), 20: (6, 8)},
    haunch=(19.5, 22.5, 5.5, 5.2, 27),
    hind=(HIND_DROP, 15, 26),
    fore=(['.nnn'] * 8 + ['.ppp', 'ppppp'], 4, 20),
    ffore=(['.ff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'qqq', 'qqq'], 9, 20),
    tail=[(23, 26), (26, 26), (28, 24), (29, 21)],
    head=(-1, 4),
)


def drawn(k):
    hr, hx, hy = k['hind']
    far_hind = ([r.replace('n', 'f').replace('p', 'q') for r in hr], hx - 2, hy)
    lay = [k['ffore'], far_hind, tail_layer(tail_path(k['tail'])),
           spans(k['body'], 'b'), spans(k['bib'], 'W'), haunch(*k['haunch']),
           k['hind'], k['fore']]
    return build(lay, heads=[(head(), *k['head'])])


def settle(px, k=19):
    """The sit with everything above the chest a row lower: the landing squash."""
    return [px[0]] + px[:k] + px[k + 1:]


def start():
    lay, at = stand()
    return build(lay, heads=[(head(), *at)])


FRAMES = [
    (160, start()),
    (110, drawn(DIP)),
    (100, drawn(MID)),
    (110, drawn(DROP)),
    (130, settle(idle.frame(tail_pose='out'))),
    (140, idle.frame(tail_pose='out')),
    (130, idle.frame(tail_pose='mid')),
    (300, SIT),
]

CLIP = check({'loop': False, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'sit_down')
