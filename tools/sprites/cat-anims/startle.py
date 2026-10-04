"""Startle, facing left: a flinch, a stiff-legged hop into the arched-back pose
with fur and tail puffed and ears pinned flat, a held hiss, then back to the sit."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, 'kit'), HERE]
from catkit import build, check, ellipse, frag, mask_layer, rect, sit_with_head, spans, SIT  # noqa: E402
import sit_down  # noqa: E402

# Ears pinned out sideways and down ("airplane ears"), so the head gets wider
# instead of taller and never sprouts points at 1x. Pupils blown wide.
HEAD_PINNED = frag('''
................
................
...LI.......IDD.
...LIIBBBBBBIID.
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBHKBBBHKBDD
....LBKKBBBKKBDD
....LBBMNMBBBBDD
.....BMOUOMBBDD.
......MMMBBDD...
''')
HEAD_WIDE = frag('''
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

# Arched on stiff legs: the back rises to row 10, the belly tucks up to row 17
# between the legs, chest and rump stay as deep as the sit's.
BODY = {10: (13, 19), 11: (11, 21), 12: (10, 23), 13: (9, 24), 14: (8, 25), 15: (8, 25), 16: (8, 25),
        17: (8, 25), 18: [(8, 14), (18, 25)], 19: [(8, 13), (19, 25)], 20: [(9, 12), (20, 24)]}
# Raised fur along the arch: single tufts the outline turns into a bristle.
PUFF = {9: [(13, 13), (16, 16), (19, 19)], 10: [(21, 21)], 11: [(23, 23)]}
BIB = {18: (8, 10), 19: (8, 10), 20: (9, 10)}
FORE = {y: (9, 11) for y in range(20, 28)}
FPAW = {28: (9, 11), 29: (8, 11)}
HIND = {20: (21, 23), 21: (21, 23), 22: (22, 24), 23: (22, 24), 24: (22, 24), 25: (22, 24),
        26: (21, 23), 27: (21, 23)}
HPAW = {28: (20, 22), 29: (19, 22)}
# Bottle-brush tail straight up off the rump, ragged on both edges.
TAIL = {3: (25, 26), 4: (24, 27), 5: (25, 28), 6: (24, 27), 7: (23, 27), 8: (24, 28), 9: (23, 27),
        10: (23, 26), 11: (22, 27), 12: (22, 26), 13: (22, 25)}
TIP = {3: (25, 26), 4: (24, 27)}


def arched(dy=0, puff=True, head=HEAD_PINNED):
    def s(d, c, dx=0):
        return spans(d, c, dx, dy)
    lay = [s(FORE, 'f', 2), s(FPAW, 'q', 2), s(HIND, 'f', 2), s(HPAW, 'q', 2),
           s(TAIL, 't'), s(BODY, 'b')]
    if puff:
        lay.append(s(PUFF, 'b'))
    hm = {(x, y + dy) for (x, y) in ellipse(22.5, 14, 3.5, 4) & rect(0, 0, 31, 17)}
    lay += [s(BIB, 'W'), mask_layer(hm, 'h'), s(HIND, 'n'), s(HPAW, 'p'), s(FORE, 'n'), s(FPAW, 'p'),
            s(TIP, 'T')]
    return build(lay, heads=[(head, -2, 9 + dy)])


def flinch():
    """The sit with the head ducked a row, ears pinned and pupils wide."""
    return sit_with_head(HEAD_PINNED, 4)


FRAMES = [
    (80, SIT),
    (90, flinch()),
    (90, arched(-2)),
    (420, arched(0)),
    (220, arched(0, head=HEAD_WIDE)),
    (160, arched(0, puff=False, head=HEAD_WIDE)),
    (110, sit_down.drawn(sit_down.DROP)),
    (160, sit_with_head(HEAD_WIDE)),
    (300, SIT),
]

CLIP = check({'loop': False, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'startle')
