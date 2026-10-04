"""Pixel-me persona clips: thinking on the floor, knees up, chin in hand.

think is a loop: rest, blink, a thought bubble builds (trail circles, cloud, dots) while
a finger taps the chin and he glances up at it, the bubble dithers away, quiet pause.
think_q is a one-shot over the same figure with a '?' in the same cloud. Both start and
end on think frame 0, which has no bubble."""
from lib import Grid
from rig import capsule, paint, shade
import transitions as T
from walk import HEAD, TORSO, hair_tail, separate

THINK_W, THINK_H = 34, 47
SOLE = THINK_H - 2                 # sole row; the shadow takes the last row
HIP = (13.5, SOLE - 2)

# f = bubble fill, 1 = bubble ink; 2/3/4 = lab coat light/shade/fold, 5 = goggle lens,
# 6 = goggle frame and strap. The clipboard reuses the desk's j (board) and y (clip).
PROPS = {'f': '#f4efe4', '1': '#2b2840', '2': '#ecebf3', '3': '#c5c3d3', '4': '#9795ad',
         '5': '#8fd3e8', '6': '#7a7896'}

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


LAB_W, LAB_H = 34, 49
LAB_HIP = (16.5, 29.5)
LAB_GROUND = LAB_H - 4             # ankle row; foot takes the next two, shadow the last
BOARD_REST = (22, 22)
BOARD_W, BOARD_H = 7, 9


def lab_arm(g, sh, el, wr, near, hand='S'):
    cells = capsule(sh, el, 2.0, 1.8) | capsule(el, wr, 1.8, 1.5)
    cm = shade(cells, '2', None, '3') if near else shade(cells, '3', None, '4')
    if near:
        separate(g, set(cm), over='23', ch='4')
    paint(g, cm)
    # fist: 2x2 skin past the cuff
    for dx, dy in ((0, -1), (1, -1), (0, 0), (1, 0)):
        c = (round(wr[0]) + dx, round(wr[1]) + dy)
        g.set(*c, 'S' if near else 'Z')
    return cm


def clipboard(g, bx, by):
    for j in range(BOARD_H):
        for i in range(BOARD_W):
            edge = i in (0, BOARD_W - 1) or j in (0, BOARD_H - 1)
            g.set(bx + i, by + j, 'j' if edge else 'f')
    g.stamp("yyy", bx + 2, by)
    # three lines of handwriting
    for j, n in ((3, 4), (5, 3), (7, 4)):
        for i in range(n):
            g.set(bx + 1 + i, by + j, '1')


def goggles(g, hdx, hdy, pos):
    """pos: 'up' resting on the forehead, 'mid' halfway, 'down' over the eyes."""
    top = {'up': 3, 'mid': 4, 'down': 5}[pos]
    for j, r in enumerate(["66666", "65556", "65556", "66666"][:3 if pos == 'up' else 4]):
        for i, ch in enumerate(r):
            g.set(hdx + 10 + i, hdy + top + j, ch)
    for x in range(hdx + 4, hdx + 10):
        g.set(x, hdy + top + 1, '6')
    if pos == 'down':
        g.set(hdx + 11, hdy + 7, 'E')


def lab_figure(P, layers):
    g = Grid(LAB_W, LAB_H)
    hx, hy = LAB_HIP
    gy = LAB_GROUND
    iy = int(hy)
    far, ffoot = T.leg(None, (hx - 1, hy), (hx - 0.5, hy + 8), (hx - 2.5, gy), 'flat', False, False)
    near, nfoot = T.leg(None, (hx, hy), (hx + 0.8, hy + 8), (hx + 1, gy), 'flat', True, False)
    paint(g, far)
    paint(g, ffoot)
    paint(g, near)
    paint(g, nfoot)
    g.stamp(TORSO, round(hx - 4.5), round(hy - 14.5))
    # white coat buttoned over the sweater
    for y in range(iy - 11, iy + 10):
        t = (y - (iy - 11)) / 20
        x0, x1 = round(12 - t), round(21 + t)
        for x in range(x0, x1 + 1):
            g.set(x, y, '4' if y == iy + 9 else '3' if x >= x1 - 1 else '2')
    for y in (iy - 8, iy - 4, iy):
        g.set(19, y, '4')
    for x in (14, 15):
        g.set(x, iy + 4, '3')
    hdx, hdy = round(hx - 8.5), round(hy - 28.5) + P.get('duck', 0)
    hair_tail(g, 4, 0, top=hdy + 15, x0=hdx, back=hdx + 4)
    bx, by = P.get('board', BOARD_REST)
    clipboard(g, bx, by)
    sh = (hx, hy - 9)
    # near arm holds the board's lower left corner
    wr = (bx + 1, by + BOARD_H - 2)
    el = ((sh[0] + wr[0]) / 2 - 1, (sh[1] + wr[1]) / 2 + 3)
    lab_arm(g, sh, el, wr, True)
    g.stamp(HEAD, hdx, hdy)
    if P.get('blink'):
        g.set(hdx + 11, hdy + 7, 'Z')
    if P.get('squint'):
        g.set(hdx + 12, hdy + 6, 'J')
        g.set(hdx + 11, hdy + 7, 'Z')
    goggles(g, hdx, hdy, P.get('gog', 'up'))
    if 'collar' in layers:
        g.stamp("CC", hdx + 11, hdy + 15)
    # far arm: writing on the board or reaching to the goggles
    fsh = (hx + 2.5, hy - 10)
    if P.get('reach') is not None:
        lab_arm(g, fsh, (hx + 7, hy - 10), (hdx + 13, hdy + P['reach']), False)
    else:
        px, py = P.get('pen', (0, 0))
        wr = (bx + 4 + px, by + 3 + py)
        lab_arm(g, fsh, (hx + 4, hy - 1), wr, False)
        g.set(round(wr[0]) + 2, round(wr[1]) - 2, '1')
        g.set(round(wr[0]) + 1, round(wr[1]) - 1, '1')
    for x in range(round(hx - 7), round(hx + 9)):
        g.set(x, LAB_H - 1, 's')
    g.outline()
    return g


LAB = [
    (dict(), 900),
    (dict(pen=(0, 0), blink=1), 90), (dict(pen=(0, 0)), 300),
    (dict(duck=1, pen=(0, 0)), 70), (dict(duck=1, pen=(1, 0)), 70), (dict(duck=1, pen=(2, 0)), 70),
    (dict(duck=1, pen=(3, 0)), 70), (dict(duck=1, pen=(2, 1)), 70), (dict(duck=1, pen=(1, 1)), 70),
    (dict(duck=1, pen=(2, 1)), 70), (dict(duck=1, pen=(3, 1)), 70), (dict(duck=1, pen=(1, 1)), 70),
    (dict(pen=(1, 0)), 300),
    (dict(pen=(1, -2)), 60), (dict(pen=(1, 0)), 60), (dict(pen=(1, -2)), 60), (dict(pen=(1, 0)), 60),
    (dict(pen=(1, -2)), 60), (dict(pen=(1, 0)), 400),
    (dict(pen=(0, 0), blink=1), 90), (dict(pen=(0, 0)), 600),
]


def lab(layers=()):
    return [(lab_figure(p, layers).rows(), ms) for p, ms in LAB]


BOARD_UP = (25, 8)
BOARD_MID = [(23, 17), (24, 12)]
# hand reaches the goggles at wrist row hdy+reach; reach=None writes with the pen
SQUINT = [
    (dict(), 200),
    (dict(board=BOARD_MID[0]), 50), (dict(board=BOARD_MID[1]), 50), (dict(board=BOARD_UP), 120),
    (dict(board=BOARD_UP, squint=1, duck=1), 350),
    (dict(board=BOARD_UP, squint=1, duck=1, reach=9), 50),
    (dict(board=BOARD_UP, duck=1, reach=4), 60),
    (dict(board=BOARD_UP, duck=1, reach=5, gog='mid'), 60),
    (dict(board=BOARD_UP, duck=1, reach=6, gog='down'), 60),
    (dict(board=BOARD_UP, duck=1, reach=10, gog='down'), 50),
    (dict(board=BOARD_UP, duck=1, gog='down', reach=11), 600),
    (dict(board=BOARD_UP, duck=1, reach=9, gog='down'), 50),
    (dict(board=BOARD_UP, duck=1, reach=6, gog='down'), 60),
    (dict(board=BOARD_UP, duck=1, reach=5, gog='mid'), 60),
    (dict(board=BOARD_UP, duck=1, reach=4), 60),
    (dict(board=BOARD_UP, reach=9), 50),
    (dict(board=BOARD_MID[1], reach=14), 50), (dict(board=BOARD_MID[0]), 50),
    (dict(), 200),
]


def lab_squint(layers=()):
    return [(lab_figure(p, layers).rows(), ms) for p, ms in SQUINT]
