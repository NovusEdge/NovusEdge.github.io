"""Confused, facing left: on the sit, the head tilts one way with the far ear
flopped, comes back, tilts the other way with the near ear flopped, under a
bobbing yellow "?". Loops alone on the 404 page."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import check, frag, head, sit_with_head  # noqa: E402

# Tilted toward the viewer's left: the left half of the face drops a row, the
# right ear folds out sideways.
TILT_L = frag('''
......L.........
.....LI.........
.....LIB.....IDD
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBBBBBBHKBDD
....LBHKBBBEKBDD
....LBEKBBBBBBDD
....LBBMNMBBBBDD
.....BMMOMMBBDD.
......MMMBBDD...
''')
# Tilted toward the viewer's right: the right half drops, the left ear folds.
TILT_R = frag('''
.............D..
............ID..
...LIL.....BIID.
...LIIBBBBBBIIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBHKBBBBBBDD
....LBEKBBBHKBDD
....LBBBBBBEKBDD
....LBBBMNMBBBDD
.....BBMMOMMBDD.
......BMMMBDD...
''')

Q = frag('''
.QQ.
Q..Q
...Q
..Q.
..Q.
....
..Q.
''')


def frame(h, y, q_dy, **kw):
    px = [list(r) for r in sit_with_head(h, y, **kw)]
    for j, r in enumerate(Q):
        for i, c in enumerate(r):
            if c != '.':
                px[1 + q_dy + j][18 + i] = c
    return [''.join(r) for r in px]


CENTER = head()
FRAMES = [
    (220, frame(CENTER, 3, 1)),
    (220, frame(CENTER, 3, 0)),
    (700, frame(TILT_L, 2, 1)),
    (300, frame(TILT_L, 2, 0)),
    (110, frame([r.replace('HK', 'DD') for r in TILT_L], 2, 0)),
    (400, frame(TILT_L, 2, 1)),
    (180, frame(CENTER, 3, 0)),
    (700, frame(TILT_R, 2, 1)),
    (300, frame(TILT_R, 2, 0)),
    (300, frame(TILT_R, 2, 1, tail_pose='mid')),
    (300, frame(TILT_R, 2, 0, tail_pose='out')),
    (180, frame(CENTER, 3, 1, tail_pose='mid')),
    (400, frame(CENTER, 3, 0)),
    (220, frame(CENTER, 3, 1, breathe=True)),
]

CLIP = check({'loop': True, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'confused')
