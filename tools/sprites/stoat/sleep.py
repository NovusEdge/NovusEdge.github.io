"""Sleep: curled tighter than the curl, head tucked down with the nose in the tail,
eyes screwed shut. Slow breaths; z's rise off the head and drift right, a new one
every half loop."""
from stoat import d, stamp, runs, compose
from rest import head, lift

SLEEP_HEAD = (19, 14)
SLEEP_BODY = '''
12: 10 LLLLL
13: 8 LLBBBBBLL
14: 7 LBBBBBBBBBLL
15: 7 BBBBBBBBBBBBB
16: 7 BBBBBBBBBBBBB
17: 7 DBBBBBBBBBBBBB
16: 11 D
17: 12 D
'''
# Tail round the front and over the nose.
SLEEP_TAIL = '''
17: 6 L
18: 6 LLLLLLLLLLLLLLL 21 SSTTTT
19: 6 BBBBBBBBBBBBBBB 21 TTTTTT
17: 25 SS
'''
SWELL = '''
12: 9 L 15 L
'''
Z_SMALL = d('''
ZZZ
..Z
.Z.
ZZZ
''')
Z_BIG = d('''
ZZZZ
..Z.
.Z..
ZZZZ
''')
STEPS = 20
LIFE = 14


def zee(k):
    """A z k frames after it appears: rises a pixel every two frames, drifts right
    every five, grows at the halfway point, gone after LIFE frames."""
    if k >= LIFE:
        return {}
    x, y = 25 + k // 5, 11 - k // 2
    if k < LIFE // 2:
        return stamp(Z_SMALL, x, y, 0, 0)
    return stamp(Z_BIG, min(x, 27), y, 0, 0)


def sleep(breath=0, k=None):
    """breath as in the curl; k is the frame in the z cycle, None for no z's."""
    g = compose(runs(SLEEP_BODY), runs(SWELL) if breath == 1 else {},
                head(*SLEEP_HEAD, 'sleep'), runs(SLEEP_TAIL))
    if breath == 2:
        lift(g, 10, 15, 7, 19)
    if k is not None:
        for (x, y), c in {**zee(k), **zee((k - STEPS // 2) % STEPS)}.items():
            g[y][x] = c
    return g


# Breath per frame: rest, swell, held up, swell, rest.
BREATH = [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]
FRAMES = list(range(STEPS))
MS = [110] * STEPS


def raw(f):
    return sleep(BREATH[f], f)
