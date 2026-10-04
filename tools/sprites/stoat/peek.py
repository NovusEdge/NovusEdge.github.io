"""Peek: just the head comes up over the page edge, turns to look at the viewer,
blinks twice, turns back and sinks away. Faces right like the bound."""
from stoat import stamp, runs, compose
from periscope import PROFILE, FRONT, QUARTER

HEADS = {'right': PROFILE, 'q_right': QUARTER, 'front': FRONT}
# Neck under each head, rows counted from the head's top row, run on down past the
# canvas bottom. Seen from the front the cream throat runs down the middle; in
# three-quarter it slides toward the side the face is turned to.
NECK = {
    'right': [(1, 'LBBWW')] * 2 + [(0, 'LBBBWW')] * 20,
    'q_right': [(1, 'LBWWWD')] * 2 + [(0, 'LBBWWWD')] * 20,
    'front': [(1, 'LWWWD')] * 2 + [(0, 'LBWWWBD')] * 20,
}
HEAD_X = {'right': 13, 'q_right': 12, 'front': 11}
NECK_X = {'right': 13, 'q_right': 13, 'front': 12}
NECK_TOP = {'right': 5, 'q_right': 6, 'front': 6}

# (head, top row of the head, blink, ms)
SEQ = [
    ('right', 18, False, 40),   # ear tips
    ('right', 17, False, 40),
    ('right', 16, False, 40),
    ('right', 15, False, 40),
    ('right', 14, False, 40),
    ('right', 13, False, 40),   # eyes over the edge
    ('right', 12, False, 400),
    ('q_right', 12, False, 60),
    ('front', 12, False, 280),
    ('front', 12, True, 90),
    ('front', 12, False, 340),
    ('front', 12, True, 80),
    ('front', 12, False, 260),
    ('q_right', 12, False, 60),
    ('right', 12, False, 220),
    ('right', 13, False, 35),
    ('right', 14, False, 35),
    ('right', 16, False, 35),
    ('right', 17, False, 35),
    ('right', 19, False, 40),
    ('right', 20, False, 40),   # gone
]


def raw(f):
    head, top, blink, _ = SEQ[f]
    rows = HEADS[head]
    if blink:
        rows = [r.replace('K', 'D') for r in rows]
    neck = {}
    for j, (dx, line) in enumerate(NECK[head]):
        neck.update(runs(f'{top + NECK_TOP[head] + j}: {NECK_X[head] + dx} {line}'))
    return compose(neck, stamp(rows, HEAD_X[head], top, 0, 0))


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
