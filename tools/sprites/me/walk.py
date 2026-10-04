import math
from lib import Grid
from rig import capsule, ik, polar, shade, paint

W, H = 32, 52
GROUND = 47          # sole row
N = 16

HEAD = """
....HHHHHH.....
..HHJJJJJJHH...
.HJJHHHHHHHHH..
.JHHHHHHHHHHHH.
HJHHHHHHHHHHHY.
HJHHHHHHHGYYSS.
HJHHHHHHGYSJSS.
HJHHHHHHGSSESS.
HJHHHHHHGSSSSSZ
HJHHHHHHHSSYSS.
HJHHHHHGHHHMHH.
HJHHHZGHHHHMMM.
HJHHHZZGHHHHHH.
HJHHGZZZGHHHH..
HJHHGZZZ.GHH...
"""

TORSO = """
...ZZZ....
...CZZC...
.VTTCCTTT.
VVTTTTTTTU
VTTTTTTTTU
VTTTTTTTTU
VTTTTTTTTU
VTTTTTTTTU
.VTTTTTTTU
.VTTTTTTTU
.VTTTTTTTU
.VTTTTTTTU
.UUUUUUUUU
.RPPPPPPPQ
.RPPPPPPPQ
"""

TAIL = """
HJHHGHH
HJHHGHH
HJHHGHH
.JHHGHH
.HJHGHH
.HJHGH.
.HJGH..
..HG...
..H....
"""

FOOT = {
    'flat': ("NNNF..\nFFFFFF", (1, 0)),
    'heel': ("NF....\nFFFF..\n.FFFF.", (0, 0)),      # heel raised, toe on ground
    'toe':  ("....F.\nNNFFFF\nFFF...", (1, 1)),      # toe raised, heel striking
}

# Planted-foot x relative to the hip, per frame for leg A (B is A shifted 8).
# Stance f0..f7 slides 1px/frame back, which is also the sprite's dx.
FOOT_X = [5, 4, 3, 2, 1, 0, -1, -2, -3, -3, -2, 0, 2, 3, 4, 5]
FOOT_LIFT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 2, 1, 0]
FOOT_KIND = ['toe', 'flat', 'flat', 'flat', 'flat', 'flat', 'flat', 'heel',
             'heel', 'heel', 'flat', 'flat', 'flat', 'flat', 'flat', 'toe']
BOB = [0, 1, 1, 0, 0, -1, -1, 0] * 2


def leg(phase, hip, near):
    fx = hip[0] + FOOT_X[phase]
    fy = GROUND - 1 - FOOT_LIFT[phase]
    kind = FOOT_KIND[phase]
    if kind == 'heel':
        fy -= 1
    ankle = (fx, fy)
    knee = ik(hip, ankle, 8, 8.2, bend=1)
    cells = capsule(hip, knee, 2.3, 2.0) | capsule(knee, ankle, 2.0, 1.8)
    if near:
        cm = shade(cells, 'P', 'R', 'Q')
    else:
        cm = shade(cells, 'Q', None, 'X')
    rows, (ax, ay) = FOOT[kind]
    rows = rows.split('\n')
    foot = {}
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.':
                c = (round(fx) - ax + i - 1, round(fy) + 1 - ay + j)
                foot[c] = ch if near else ('F' if ch == 'N' else 'F')
    return cm, foot


def arm(ang, shoulder, near):
    bend = 12 + max(0, ang) * 0.6
    elbow = polar(shoulder, ang, 6)
    wrist = polar(elbow, ang + bend, 5.5)
    cells = capsule(shoulder, elbow, 2.0, 1.8) | capsule(elbow, wrist, 1.8, 1.6)
    cm = shade(cells, 'T', 'V', 'U') if near else shade(cells, 'U', None, 'W')
    hx, hy = polar(wrist, ang + bend, 1.6)
    hand = {}
    for c in capsule(wrist, (hx, hy + 0.8), 1.2):
        if c not in cells:
            hand[c] = 'S' if near else 'Z'
    return cm, hand


def frame(f, layers=()):
    g = Grid(W, H)
    dy = BOB[f]
    lag = BOB[(f - 2) % N]
    hip = (16.5, 30.5 + dy)
    sh = (16.5, 20.5 + dy)
    ang = 26 * math.cos(2 * math.pi * f / N)       # near arm back at near-leg contact
    # far arm
    cm, hand = arm(ang, sh, False)
    paint(g, cm); paint(g, hand)
    # far leg then near leg
    far, ffoot = leg((f + 8) % N, hip, False)
    near, nfoot = leg(f, hip, True)
    paint(g, far); paint(g, ffoot)
    for c, ch in near.items():
        g.set(*c, ch)
    for (x, y) in near:
        for dx_ in (-1, 1):
            if (x + dx_, y) in far and (x + dx_, y) not in near:
                g.set(x + dx_, y, 'X')
    paint(g, nfoot)
    g.stamp(TORSO, 12, 16 + dy)
    if 'coat' in layers:
        coat(g, f, dy, lag, near)
    hair_tail(g, f, dy)
    cm, hand = arm(-ang, sh, True)
    separate(g, set(cm) | set(hand))
    paint(g, cm); paint(g, hand)
    g.stamp(HEAD, 8, 2 + dy)
    if 'collar' in layers:
        g.stamp("CC", 19, 17 + dy)
    for x in range(10, 26):
        g.set(x, GROUND + 1, 's')
    g.outline()
    return g


# Hair lags the bob by ~1 frame: after the body drops (f1-3) the ends float out and up,
# after it rises (f5-7) they hang long.
TAIL_AMP = [1, 2, 2, 2, 1, 1, 1, 1]
TAIL_LIFT = [0, 0, 1, 1, 0, 0, -1, 0]


def separate(g, cells, over='TUV', ch='W'):
    for (x, y) in cells:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n not in cells and g.get(*n) in over:
                g.set(*n, ch)


def hair_tail(g, f, dy, top=17, x0=8, back=12, length=6):
    amp, lift = TAIL_AMP[f % 8], TAIL_LIFT[f % 8]
    L = length - lift
    for j in range(L):
        t = j / (L - 1)
        sh = -round(amp * t ** 1.6 * 1.5)
        left = x0 + sh + max(0, j - (L - 3)) * 2
        right = back + (2 if j < 2 else 0)
        for x in range(left, right + 1):
            ch = 'H'
            if x == left + 1 and x < right:
                ch = 'J'
            elif x == left and j >= L - 4:
                ch = 'G'
            g.set(x, top + dy + j, ch)


def coat(g, f, dy, lag, nearcells):
    top, hem = 28 + dy, 39 + dy + (1 if lag < 0 else 0)
    flare = 1 + (1 if lag > 0 else 0) + (1 if f % 8 in (1, 2, 3) else 0)
    nx = max((x for (x, y) in nearcells if y == hem), default=21)
    for y in range(top, hem + 1):
        t = (y - top) / (hem - top)
        x0 = round(13 - t * flare)
        x1 = round(21 + t * max(0, nx - 20))
        for x in range(x0, x1 + 1):
            ch = 'T'
            if x == x0:
                ch = 'V'
            elif x == x1:
                ch = 'U'
            g.set(x, y, ch)
    for x in (15, 16, 17):
        g.set(x, top + 4, 'U')
    for y in range(18 + dy, 25 + dy):
        g.set(19 + (y - 18 - dy) // 3, y, 'V')
    g.set(20, 25 + dy, 'B')
    g.set(20, 28 + dy, 'B')


if __name__ == '__main__':
    from view import show
    fr = [(lambda o, i=i: frame(i, ['coat'] if o == 'coat' else []).rows()) for i in range(N)]
    show(fr, 'w.png', scale=4)
