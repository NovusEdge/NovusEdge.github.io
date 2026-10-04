"""Happy, facing left: on the sit with the tail held straight up and hooked at
the tip, a slow blink with a blush, and a small heart rising off the head twice
a loop. Loops alone at the end of blog posts."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import check, frag, head, sit_with_head  # noqa: E402

# Straight up from behind the haunch with the tip hooked forward; the second
# pose flicks the hook a pixel.
TAIL_UP = [(21, 28), (25, 28), (27, 27), (28, 25), (28, 21), (28, 17), (28, 13), (27, 10), (25, 9)]
TAIL_FLICK = [(21, 28), (25, 28), (27, 27), (28, 25), (28, 21), (28, 17), (28, 13), (28, 10), (26, 8)]

HEART = frag('''
.R.R.
RRRRR
RRRRR
.RRR.
..R..
''')
HEART_SMALL = frag('''
R.R
RRR
.R.
''')
# Rising path, a frame per step: small off the head, full size as it clears it.
RISE = [(HEART_SMALL, 17, 9), (HEART_SMALL, 17, 7), (HEART, 17, 4), (HEART, 18, 1)]


def blush(h):
    """A pink pixel under each eye; the eyes sit at rows 6-7 of the head."""
    h = [list(r) for r in h]
    h[8][5], h[8][12] = 'R', 'R'
    return [''.join(r) for r in h]


def frame(eye='open', heart=None, tail=TAIL_UP, rosy=False, breathe=False):
    hd = head(eye)
    if rosy:
        hd = blush(hd)
    px = [list(r) for r in sit_with_head(hd, tail=tail, breathe=breathe)]
    if heart is not None:
        g, x0, y0 = RISE[heart]
        for j, r in enumerate(g):
            for i, c in enumerate(r):
                if c != '.':
                    px[y0 + j][x0 + i] = c
    return [''.join(r) for r in px]


FRAMES = [
    (400, frame()),
    (180, frame(heart=0)),
    (180, frame(heart=1, tail=TAIL_FLICK)),
    (180, frame(heart=2)),
    (200, frame(heart=3, breathe=True)),
    (300, frame(breathe=True)),
    (160, frame('half')),
    (750, frame('shut', rosy=True)),
    (160, frame('half', rosy=True)),
    (300, frame(tail=TAIL_FLICK)),
    (180, frame(heart=0)),
    (180, frame(heart=1)),
    (180, frame(heart=2, tail=TAIL_FLICK)),
    (200, frame(heart=3, breathe=True)),
]

CLIP = check({'loop': True, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'happy')
