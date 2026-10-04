from lib import Grid

W, H = 32, 52

HEAD = """
......HHHH......
....HJJHGJJH....
..HJJHHHGHHHJH..
.HJHHHHHGHHHHJH.
.HHHHHGYSSGHHHH.
.HHHHGYSSSSGHHH.
.HHHGYJSSJSZGHH.
.HHHGYESSESZGHH.
.HHHGSYSSYZZGHH.
.HHHGHSZZSHHGHH.
.HJHGMHHHHMHGHH.
.HJHGHMMMMHHGJH.
.HJHZGHHJHHGZJH.
.HJHZZGHHHGZZHG.
"""

# 18 wide at x=7, y=16.
BODY = """
.......ZZZZ.......
...VTTCZZZZCTTUU..
..VVTTTCCCCTTTTUU.
.VVTTTTTCCTTTTTTUU
.VVTTTTTTTTTTTTTUU
.VTTKTTTTTTTTTTKTU
.VTTKTTTTTTTTTTKTU
.VTTKTTTTTTTTTTKUU
.VTTKTTTTTTTTTTKUU
.VTTKTTTTTTTTTTKUU
.VTTKTTTTTTTTTUKUU
.VTTKTTTTTTTTTUKUU
.VTUKUUUUUUUUUUKUU
.YSSKPPPPPPPPPPKSZ
.YSZ.PPPPPPPPPP.ZZ
..Z..RPPPPKPPPQ.Z.
.....RPPPPKPPPQ...
.....RPPPQKRPPQ...
.....RPPPQKRPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPPQ.RPPQ...
.....RPPQQ.RPPQQ..
....NNFFF..NNFFF..
....FFFFF..FFFFFF.
"""

# Hair that falls behind the shoulders, x=6, y=13. Only the part beside the neck
# and the ends past the shoulder line show; the body covers the rest.
BACK_HAIR = [
    "...HHHHHHHHHHHHHH...",
    "..HHHHHHHHHHHHHHHH..",
    "..HGGGGGGGGGGGGGGH..",
    "..HGGGGGGGGGGGGGGH..",
    ".HJGGGGGGGGGGGGGGGH.",
    "HJHGGGGGGGGGGGGGGHGH",
    "HJHGGGGGGGGGGGGGGHGH",
    "HJ................GH",
    ".H................G.",
]
BACK_SHIFT = [0, 0, 0, 0, 0, 0, 0.5, 1, 1]

# Cable knit: two twisted cables either side of the placket. 'A' is the knit
# shadow in the cream palette and plain T elsewhere.
CABLES = [(13, 18), (14, 17)]

COAT_LAPEL = {(13, 18): 'V', (18, 18): 'U', (14, 19): 'V', (17, 19): 'U', (15, 20): 'V'}
COLLAR = {(13, 18): 'C', (18, 18): 'C', (14, 19): 'D', (17, 19): 'D'}


def body_grid(layers):
    g = Grid(W, H)
    g.stamp(BODY, 7, 16)
    for y in range(20, 28):
        for x in CABLES[y % 2]:
            if g.get(x, y) == 'T':
                g.set(x, y, 'A')
    if 'collar' in layers:
        for (x, y), ch in COLLAR.items():
            g.set(x, y, ch)
    if 'coat' in layers:
        for (x, y), ch in COAT_LAPEL.items():
            g.set(x, y, ch)
        for y in range(21, 41):
            g.set(16, y, 'U')
        for y in (22, 25, 28):
            g.set(15, y, 'B')
        for y in range(29, 41):
            t = (y - 29) / 11
            x0, x1 = round(11 - t * 1.6), round(20 + t * 1.6)
            for x in range(x0, x1 + 1):
                if g.get(x, y) not in 'PQRK.':
                    continue
                if y >= 39 and abs(x - 16) <= 40 - y:
                    continue
                ch = 'V' if x == x0 else 'U' if x in (x1, 16) or y == 40 else 'T'
                g.set(x, y, ch)
    return g


def figure(layers=(), breath=0, sway=0, blink=False, tuck=None):
    g = Grid(W, H)
    for j, r in enumerate(BACK_HAIR):
        g.stamp([r], 6 + round(sway * BACK_SHIFT[j]), 13 + j)
    g.stamp(body_grid(layers).rows(), 0, 0)
    g.stamp(HEAD, 8, 2)
    if blink:
        for x in (14, 17):
            g.set(x, 9, 'Z')
    if breath:
        # Inhale: everything above the waist rises 1px; row 25 is doubled so
        # arms and torso stretch instead of tearing.
        for y in range(1, 26):
            g.c[y - 1] = g.c[y][:]
    for x in range(10, 25):
        g.set(x, 48, 's')
    g.outline()
    return g


# breath, sway, blink, ms
IDLE = [
    (0, 0, 0, 520), (0, 0, 0, 160), (1, 0, 0, 160), (1, 1, 0, 220),
    (1, 1, 0, 420), (1, 0, 0, 160), (0, 0, 0, 160), (0, -1, 0, 220),
    (0, -1, 0, 420), (0, 0, 0, 200), (0, 0, 1, 90), (0, 0, 0, 320),
    (1, 0, 0, 180), (1, 1, 0, 420), (0, 0, 0, 180), (0, -1, 0, 320),
]


def idle(layers=()):
    return [(figure(layers, b, s, bl).rows(), ms) for b, s, bl, ms in IDLE]
