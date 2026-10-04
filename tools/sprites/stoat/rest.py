"""The upright sit every resting clip starts from and returns to, and the bits the
resting clips share. Faces right like the bound, fore paws on the same pixels as the
bound's landing frame so a bound can stop into a sit without the paws sliding."""
from stoat import W, d, stamp, runs, compose
from bound import HEAD

# The sit's head box, top-left of bound.HEAD (eye at +5,+2, nose at +8,+3).
SIT_HEAD = (22, 3)

SIT_FAR = '''
15: 22 A
16: 22 A
17: 22 A
18: 22 A
19: 21 pp
'''
SIT_BODY = '''
8: 20 LBB 23 WWWW
9: 20 LBB 23 WWWW
10: 19 LBBB 23 WWWW
11: 19 LBBB 23 WWWW
12: 18 LBBBB 23 WWW
13: 15 LLLBBBBB 23 WWW
14: 12 LLLBBBBBBBB 23 WW
15: 11 LBBBBBBD 19 WWW
16: 10 LBBBBBBBBD 20 WW
17: 10 BBBBBBBBBD 20 WW
18: 10 DBBBBBBBD
19: 11 DDD 14 PPPPPP
'''
SIT_NEAR = '''
15: 23 BBD
16: 23 BD
17: 23 BD
18: 23 BD
19: 23 PPP
'''
# The back of the jaw is coat, not cream, where the head meets the neck.
SIT_NAPE = '''
7: 21 LBB
'''
# Tail lying along the ground behind the rump, black tip curled up off it. The
# shaft from x 8 runs under the rump; the tip drawings cover x 1-7, so in the flick
# the last third of the tail leaves the ground, not just the tip.
TAIL_SHAFT = '''
18: 8 LL
19: 8 BBB
'''
TAIL_TIP = {
    'rest': d('''
.SS....
TTS....
TTTLLLL
.TTBBBB
'''),
    # Peeling up off the ground.
    'up1': d('''
.SS....
TTS....
TTSL...
.TTLLLL
...BBBB
'''),
    # Lifted clear, angled up and back.
    'up2': d('''
SS.....
TTS....
TTS....
.TTL...
..TLL..
...BLLL
....BBB
'''),
    # Whipped over past upright, the tip hooks forward.
    'hook': d('''
...SS..
..TTS..
..TTS..
..TS...
..TL...
..BLL..
...BLLL
....BBB
'''),
}


def tail(tip='rest'):
    rows = TAIL_TIP[tip]
    return {**runs(TAIL_SHAFT), **stamp(rows, 1, 19 - len(rows) + 1, 0, 0)}


def head(x, y, eye='open'):
    """bound.HEAD at (x, y). eye: 'open', 'half' (lid shadow over the open eye),
    'shut' (lid, like the peek blink) or 'sleep' (a two-pixel dark lid line, read as
    screwed shut)."""
    rows = list(HEAD)
    if eye == 'half':
        rows[1] = rows[1][:5] + 'D' + rows[1][6:]
    elif eye != 'open':
        rows[2] = rows[2].replace('K', 'D')
    px = stamp(rows, x, y, 0, 0)
    if eye == 'sleep':
        px[(x + 4, y + 2)] = 'A'
        px[(x + 5, y + 2)] = 'A'
    return px


def lift(g, top, bottom, left, right=W):
    """Breath in: rows top..bottom-1 in columns left..right-1 take the row below them,
    so everything there moves up a pixel and row bottom-1 is filled from row bottom
    (the neck grows rather than the head floating off it)."""
    for y in range(top, bottom):
        for x in range(left, right):
            g[y][x] = g[y + 1][x]
    return g


def sit(eye='open', tip='rest', breath=0):
    """breath 0 rest, 1 chest swells a pixel, 2 swelled and head and neck up a pixel."""
    hx, hy = SIT_HEAD
    chest = {}
    if breath:
        chest = runs('''
10: 27 W
11: 27 W
12: 26 W
''')
    g = compose(runs(SIT_FAR), tail(tip), runs(SIT_BODY), chest, runs(SIT_NEAR),
                head(hx, hy, eye), runs(SIT_NAPE))
    if breath == 2:
        lift(g, 1, 12, 18)
    return g
