"""Pixel-me persona clips: thinking on the floor, knees up, chin in hand.

think is a loop: rest, blink, a thought bubble builds (trail circles, cloud, dots) while
a finger taps the chin and he glances up at it, the bubble dithers away, quiet pause.
think_q is a one-shot over the same figure with a '?' in the same cloud. Both start and
end on think frame 0, which has no bubble."""
from lib import Grid
from rig import paint
import transitions as T
from walk import HEAD, TORSO, hair_tail

THINK_W, THINK_H = 34, 47
SOLE = THINK_H - 2                 # sole row; the shadow takes the last row
HIP = (13.5, SOLE - 2)

# f = bubble fill, 1 = bubble ink
PROPS = {'f': '#f4efe4', '1': '#2b2840'}

KNEE, ANKLE = (HIP[0] + 7.5, HIP[1] - 8), (HIP[0] + 11.5, HIP[1])
FAR_KNEE, FAR_ANKLE = (HIP[0] + 6, HIP[1] - 8.5), (HIP[0] + 9.5, HIP[1])


def figure(P, layers):
    g = Grid(THINK_W, THINK_H)
    hx, hy = HIP
    lean = P.get('lean', 1)
    far, ffoot = T.leg(None, (hx - 1, hy - 0.5), FAR_KNEE, FAR_ANKLE, 'flat', False, True)
    near, nfoot = T.leg(None, (hx, hy), KNEE, ANKLE, 'flat', True, True)
    paint(g, far)
    paint(g, ffoot)
    sh = (hx + lean, hy - 10)
    tx, ty = round(hx - 4.5), round(hy - 14.5)
    for j, (s, r) in enumerate(T.lean_rows(TORSO, lean, 12)):
        g.stamp([r], tx + s, ty + j)
    hdx, hdy = round(hx - 8.5) + lean, round(hy - 28.5) + P.get('duck', 0)
    hair_tail(g, P.get('hair', 4), 0, top=hdy + 15, x0=hdx, back=hdx + 4)
    # the near thigh crosses in front of the torso
    for (x, y) in near:
        for d in (-1, 1):
            if (x + d, y) in far and (x + d, y) not in near:
                g.set(x + d, y, 'X')
    paint(g, near)
    paint(g, nfoot)
    T.arm(g, sh, (hx + 7.5, hy - 11), (hdx + 14, hdy + 11 + P.get('stroke', 0)), 'chin', True)
    g.stamp(HEAD, hdx, hdy)
    if P.get('blink'):
        g.set(hdx + 11, hdy + 7, 'Z')
    if P.get('glance'):
        # the eye moves up and forward, under the brow pixel
        g.set(hdx + 11, hdy + 7, 'S')
        g.set(hdx + 12, hdy + 6, 'E')
    if 'collar' in layers:
        g.stamp("CC", hdx + 11, hdy + 15)
    for x in range(round(hx - 8), round(hx + 19) + 1):
        g.set(x, THINK_H - 1, 's')
    g.outline()
    return g


# Thought bubble: two trail circles rising right from the crown, then a cloud.
CLOUD_X, CLOUD_Y = 21, 0
TRAIL_A = (12, 9, [".O.", "OfO", ".O."])
TRAIL_B = (15, 5, [".OOO.", "OfffO", "OfffO", "OfffO", ".OOO."])
CLOUD_SMALL = [".OOO.", "OfffO", "OfffO", ".OOO."]
CLOUD = [
    "...OOOOOOO...",
    ".OOfffffffOO.",
    "OfffffffffffO",
    "OfffffffffffO",
    "OfffffffffffO",
    "OfffffffffffO",
    ".OOfffffffOO.",
    "...OOOOOOO...",
]
DOTS = [3, 6, 9]                   # left column of each 2x2 dot, on cloud rows 3..4
MARK = ["111", "..1", ".1.", "...", ".1."]   # '?' on cloud rows 1..5, columns 5..7


def stamp(g, rows, x, y, keep):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.' and keep(x + i, y + j):
                g.set(x + i, y + j, ch)


def bubble(rows_in, stage, content=None, dots=0, fade=None):
    """Stamp the bubble at `stage` (1 trail dot, 2 both trail circles, 3 small cloud,
    4 full cloud) onto a copy of the figure rows; fade dithers the pixels out."""
    g = Grid(THINK_W, THINK_H)
    g.c = [list(r) for r in rows_in]
    keep = {None: lambda x, y: True,
            'half': lambda x, y: (x + y) % 2 == 0,
            'quarter': lambda x, y: x % 2 == 0 and y % 2 == 0}[fade]
    stamp(g, TRAIL_A[2], TRAIL_A[0], TRAIL_A[1], keep)
    if stage >= 2:
        stamp(g, TRAIL_B[2], TRAIL_B[0], TRAIL_B[1], keep)
    if stage == 3:
        stamp(g, CLOUD_SMALL, CLOUD_X + 4, CLOUD_Y + 2, keep)
    if stage >= 4:
        cloud = [list(r) for r in CLOUD]
        for n in range(dots):
            for dy in (3, 4):
                for dx in (0, 1):
                    cloud[dy][DOTS[n] + dx] = '1'
        if content == '?':
            for j, r in enumerate(MARK):
                for i, ch in enumerate(r):
                    if ch == '1':
                        cloud[1 + j][5 + i] = '1'
        stamp(g, [''.join(r) for r in cloud], CLOUD_X, CLOUD_Y, keep)
    return g.rows()


# (pose, bubble args, ms) at drawn pace; build.py plays think at 1.75x
THINK = [
    (dict(), None, 1000),
    (dict(blink=1), None, 90),
    (dict(), None, 500),
    (dict(), (1,), 50), (dict(), (2,), 50), (dict(), (3,), 50), (dict(), (4,), 80),
    (dict(glance=1), (4, None, 1), 260),
    (dict(glance=1, stroke=-1), (4, None, 2), 110), (dict(glance=1), (4, None, 2), 110),
    (dict(glance=1, stroke=-1), (4, None, 3), 110), (dict(glance=1), (4, None, 3), 110),
    (dict(glance=1, stroke=-1), (4, None, 3), 110), (dict(glance=1), (4, None, 3), 500),
    (dict(), (4, None, 3, 'half'), 60), (dict(), (4, None, 3, 'quarter'), 60),
    (dict(), None, 700),
    (dict(stroke=1), None, 60), (dict(stroke=1, duck=1), None, 520), (dict(stroke=1), None, 60),
    (dict(), None, 500), (dict(blink=1), None, 90), (dict(), None, 600),
]


def think(layers=()):
    out = []
    for p, b, ms in THINK:
        rows = figure(p, layers).rows()
        if b:
            rows = bubble(rows, *b)
        out.append((rows, ms))
    return out


THINK_Q = [
    (None, 300), ((1,), 50), ((2,), 50), ((3,), 50), ((4, '?'), 900),
    ((4, '?', 0, 'half'), 60), ((4, '?', 0, 'quarter'), 60), (None, 120),
]


def think_q(layers=()):
    base = figure({}, layers).rows()
    return [(bubble(base, *b) if b else base, ms) for b, ms in THINK_Q]
