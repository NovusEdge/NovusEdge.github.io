"""Sit: the upright resting loop. Two breaths, a tail flick between them, a blink at
the top of the second breath. Frame 0 is the pose every resting one-shot starts and
ends on."""
from rest import sit

# (eye, tail tip, breath, ms)
SEQ = [
    ('open', 'rest', 0, 320),
    ('open', 'rest', 1, 60),
    ('open', 'rest', 2, 300),
    ('open', 'rest', 1, 60),
    ('open', 'rest', 0, 260),
    ('open', 'up1', 0, 50),     # tail flick
    ('open', 'up2', 0, 50),
    ('open', 'hook', 0, 110),
    ('open', 'up2', 0, 50),
    ('open', 'up1', 0, 50),
    ('open', 'rest', 0, 280),
    ('open', 'rest', 1, 60),
    ('open', 'rest', 2, 220),
    ('shut', 'rest', 2, 90),    # blink
    ('open', 'rest', 2, 200),
    ('open', 'rest', 1, 60),
    ('open', 'rest', 0, 400),
]


def raw(f):
    eye, tip, breath, _ = SEQ[f]
    return sit(eye, tip, breath)


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
