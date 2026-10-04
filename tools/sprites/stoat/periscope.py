"""Periscope: the stoat pops up from below the page edge, stands tall on its hind
legs, looks right, at the viewer, left, back right, and drops out of sight.

The standing figure is one hand-placed drawing; the rise and drop slide it down
past the canvas bottom (build.py crops at row 20). Only the head changes while it
looks around: the body stays square to the right, as in the bound."""
from stoat import d, stamp, runs, compose

# Body facing right, sitting up on the hind feet, forepaws held to the chest.
BODY = '''
6: 13 LBB 16 WW
7: 13 LBB 16 WW
8: 12 LBBB 16 WW
9: 12 LBBB 16 WW
10: 12 LBBB 16 WWW
11: 11 LBBBB 16 WWW
12: 11 LBBBB 16 WWW
13: 11 LBBBB 16 WW
14: 10 LBBBBB 16 WW
15: 10 LBBBBD 16 WW
16: 10 LBBBBBD 17 W
17: 10 DBBBBBBD
18: 10 DBBBBBBD
'''
TAIL = '''
16: 2 SS
17: 1 TTSLLLLLL
18: 2 TTBBBBBBB
'''
# Far foreleg and far hind foot first, then the near ones over the body.
FAR = '''
11: 17 AA
12: 18 pp
19: 10 pp
'''
NEAR = '''
9: 17 BD
10: 18 BD
11: 19 PP
18: 14 BBBD
19: 12 PPPPPP
'''

PROFILE = d('''
.LL.....
LIBLLL..
BBBBKBL.
BBBBBBBN
WWWWWW..
''')
FRONT = d('''
.LL...LL.
.IBLLLBI.
BBBBBBBBB
BBKBBBKBB
.BBWNWBB.
..WWWWW..
''')
# Three-quarter view, the in-between for every turn: eyes and nose slide toward
# the side it is turning to, far ear half hidden.
QUARTER = d('''
.LL...L..
.IBLLLBL.
BBBBBBBBB
BBBKBBKBL
.BBBWWNW.
..WWWWW..
''')
HEADS = {
    'right': (PROFILE, 14, 1),
    'q_right': (QUARTER, 12, 1),
    'front': (FRONT, 11, 1),
    'q_left': ([r[::-1] for r in QUARTER], 10, 1),
    'left': ([r[::-1] for r in PROFILE], 9, 1),
}

# (head, how far the whole figure is pushed down below its standing place, ms)
SEQ = [
    ('right', 18, 40),   # ear tips break the surface
    ('right', 15, 40),
    ('right', 12, 30),
    ('right', 9, 30),
    ('right', 5, 35),
    ('right', 3, 35),
    ('right', 2, 35),    # eases into the last two pixels
    ('right', 1, 35),
    ('right', 0, 400),
    ('q_right', 0, 60),
    ('front', 0, 320),
    ('q_left', 0, 60),
    ('left', 0, 480),
    ('q_left', 0, 50),
    ('front', 0, 200),
    ('q_right', 0, 50),
    ('right', 0, 420),
    ('right', 1, 45),    # crouch before the drop
    ('right', 2, 45),
    ('right', 4, 30),
    ('right', 6, 30),
    ('right', 9, 30),
    ('right', 13, 30),
    ('right', 16, 40),
    ('right', 19, 40),
]


def raw(f):
    head, dy, _ = SEQ[f]
    rows, hx, hy = HEADS[head]
    fig = compose(runs(FAR), runs(TAIL), runs(BODY), runs(NEAR), stamp(rows, hx, hy, 0, 0))
    return [['.'] * len(fig[0]) for _ in range(dy)] + fig[:len(fig) - dy]


FRAMES = SEQ
MS = [ms for _, _, ms in SEQ]
