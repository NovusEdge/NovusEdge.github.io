"""Happy: from the sit the tail comes up off the ground and is carried up, its tip
flicking, a slow blink with a blush, and a small heart rising off the back of the
head twice a loop. Beats and timing follow the cat's approved happy; it starts and
ends on sit frame 0."""
from stoat import d, stamp, runs, compose
from rest import SIT_FAR, SIT_BODY, SIT_NEAR, SIT_NAPE, SIT_HEAD, head, tail

HEART = d('''
R.R
RRR
.R.
''')


def heart(k):
    """A heart k frames after it appears: a single pixel off the head, then full size,
    rising and drifting back as it slows; gone after five."""
    if k is None or k >= 5:
        return {}
    if k == 0:
        return {(19, 7): 'R'}
    return stamp(HEART, *RISE[k - 1], 0, 0)


RISE = [(16, 6), (16, 4), (15, 3), (15, 1)]


# (tail, eye, blush, heart frame, ms). The tail eases up off the ground from the
# sit (up2, half) and back down at the end, so the loop starts and ends on sit
# frame 0. Each flick goes out through sway_r to sway_r2, holds, and comes back.
FLICK = [('sway_r', 50), ('sway_r2', 140), ('sway_r', 50)]
SEQ = (
    [('rest', 'open', False, None, 200),
     ('up2', 'open', False, None, 50),
     ('half', 'open', False, None, 50),
     ('raised', 'open', False, None, 250),
     ('raised', 'open', False, 0, 150)]
    + [(t, 'open', False, k, ms) for (t, ms), k in zip(FLICK, (1, 2, 3))]
    + [('raised', 'open', False, 4, 200),
       ('raised', 'half', True, None, 160),   # slow blink
       ('raised', 'shut', True, None, 750),
       ('raised', 'half', True, None, 160),
       ('raised', 'open', False, 0, 300)]
    + [(t, 'open', False, k, ms) for (t, ms), k in zip(FLICK, (1, 2, 3))]
    + [('raised', 'open', False, 4, 300),
       ('half', 'open', False, None, 50),
       ('up2', 'open', False, None, 50),
       ('rest', 'open', False, None, 200)]
)


def raw(f):
    tip, eye, blush, k, _ = SEQ[f]
    hx, hy = SIT_HEAD
    # A pink pixel on the cheek under the eye.
    cheek = {(hx + 5, hy + 3): 'R'} if blush else {}
    return compose(runs(SIT_FAR), tail(tip), runs(SIT_BODY), runs(SIT_NEAR),
                   head(hx, hy, eye), runs(SIT_NAPE), cheek, heart(k))


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
