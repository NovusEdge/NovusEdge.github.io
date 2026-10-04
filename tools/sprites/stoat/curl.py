"""Curl: lying in a loaf, chin on the fore paws, tail wrapped round the front. Awake:
slow breaths through the back, one slow blink."""
from stoat import runs, compose
from rest import head, lift

CURL_HEAD = (20, 12)
CURL_BODY = '''
11: 10 LLLLLL
12: 8 LLBBBBBBLL
13: 7 LBBBBBBBBBBLL
14: 6 LBBBBBBBBBBBBBB
15: 6 BBBBBBBBBBBBBBB
16: 6 BBBBBBBBBBBBBBB
17: 6 DBBBBBBBBBBBBBD 21 WWW
15: 10 D
16: 11 D
17: 12 D
'''
# Tail round the bottom of the loaf, tip tucked under the chin, paws resting on it.
CURL_TAIL = '''
17: 5 L
18: 5 LLLLLLLLLLLLLL 19 SSTTTTT
19: 5 BBBBBBBBBBBBBB 19 TTTTTTT
'''
CURL_PAWS = '''
17: 25 PPPP
'''
# Swelled back for the in-between of a breath.
SWELL = '''
11: 9 L 16 L
'''


def curl(eye='open', breath=0):
    """breath 0 rest, 1 back swells wider, 2 back up a pixel."""
    g = compose(runs(CURL_BODY), runs(SWELL) if breath == 1 else {}, runs(CURL_TAIL),
                head(*CURL_HEAD, eye), runs(CURL_PAWS))
    if breath == 2:
        lift(g, 9, 14, 6, 20)
    return g


# (eye, breath, ms)
SEQ = [
    ('open', 0, 420),
    ('open', 1, 60),
    ('open', 2, 480),
    ('open', 1, 60),
    ('open', 0, 320),
    ('half', 0, 60),     # slow blink
    ('shut', 0, 640),
    ('half', 0, 60),
    ('open', 0, 300),
    ('open', 1, 60),
    ('open', 2, 480),
    ('open', 1, 60),
]


def raw(f):
    eye, breath, _ = SEQ[f]
    return curl(eye, breath)


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
