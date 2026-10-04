"""Asleep, facing left: curled low with the chin tucked and the tail wrapped round
the front, slow breathing, Z's rising off the head."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import build, check, ellipse, frag, grid, lift, rect  # noqa: E402

BODY = grid('''
..............bbbbbbb...........
............bbbbbbbbbbbb........
..........bbbbbbbbbbbbbbbb......
.........bbbbbbbbbbbbbbbbbb.....
........bbbbbbbbbbbbbbbbbbb.....
.......bbbbbbbbbbbbbbbbbbbbb....
......bbbbbbbbbbbbbbbbbbbbbb....
......bbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbb.....
...Tubbbbbbbbbbbbbbbbbbbbbbu....
...Tuuuuuuuuuuuuuuuuuuuuuuu.....
''', 15)
HAUNCH = {p for p in ellipse(22.5, 21.5, 6, 5.5) & rect(0, 0, 31, 27)}
CHEST = 22

# Head dropped onto the paws: eyes shut as dark lid lines, chin tucked so the
# white muzzle shows only as a sliver.
HEAD = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBOOBBBOOBDD
....LBBBBBBBBBDD
....LBBMNMBBBBDD
.....BBMMMBBBDD.
''')
HEAD_AT = (-2, 17)

Z_BIG = frag('''
ZZZZ
...Z
..Z.
.Z..
ZZZZ
''')
Z_SMALL = frag('''
ZZZ
..Z
.Z.
ZZZ
''')
Z_DOT = ['Z']
# One Z every six frames: a dot leaves the head, grows as it drifts up and right.
Z_PATH = [(Z_DOT, 9, 15), (Z_DOT, 10, 13), (Z_SMALL, 10, 10), (Z_SMALL, 11, 8),
          (Z_BIG, 12, 5), (Z_BIG, 13, 2)]
BREATH = [0, 0, 1, 1, 1, 0]


def pose(f, zs=True, head=HEAD, head_at=HEAD_AT):
    rs, _, top = BODY
    code = [list('.' * 32) for _ in range(top)] + [list(r) for r in rs]
    for (x, y) in HAUNCH:
        if code[y][x] == 'b':
            code[y][x] = 'h'
    layer = ([''.join(r) for r in code], 0, 0)
    if BREATH[f % 6]:
        layer = lift(layer, CHEST)
    z = []
    if zs:
        z = [Z_PATH[f % 6]] + ([Z_PATH[f % 6 - 3]] if f % 6 >= 3 else [])
    return build([layer], heads=[(head, *head_at)], after=z)


CLIP = check({'loop': True, 'frames': [{'ms': 380, 'px': pose(f)} for f in range(12)]}, 'sleep')
