"""Chase tail: spins on the spot after its own tail tip, three turns per loop, the
third one nearly catching it. Eight views
around the turn: profile right with the head craned back at the tail, three-quarter
front, front, three-quarter front facing left, profile left, three-quarter back, back,
three-quarter back. Every view stands on the same three-row legs with the same
four-to-five-row body, so the stoat keeps its size as it turns; only the width foreshortens."""
from stoat import d, stamp, runs, compose
from bound import HEAD
from periscope import QUARTER
from rest import shift

HEAD_BACK = d('''
.LL...LL.
.LBLLLBL.
BBBBBBBBB
BBBBBBBBB
.BBBBBBB.
''')
HEAD_L = [r[::-1] for r in HEAD]
QUARTER_L = [r[::-1] for r in QUARTER]

# Each view: head stamp (drawing, x, y), then the body, legs and tail as runs, drawn
# on five-row legs; view() takes two rows out of the legs. A stoat spinning stays low:
# at full leg length the end-on views read as a cat.
VIEWS = {
    # Profile right, curled into a U: the head comes back over the shoulder facing
    # the tail, which arches forward off the rump to hang in front of the nose.
    'side': ((HEAD_L, 15, 6), '''
15: 13 AA 19 AA
16: 13 AA 19 AA
17: 14 AA 19 AA
18: 14 AA 19 AA
19: 14 pp 18 pp
10: 10 LLLLLLLLLLLL
11: 9 LBBBBBBBBBBBBBBL
12: 9 BBBBBBBBBBBBBBBB
13: 9 DBBBBBBBBBBBBBBD
14: 10 DDBBB 15 WWWWW 20 BBBD
8: 22 LB
9: 22 LBB
10: 22 BBB 25 W
11: 25 W
15: 10 BBD 21 BBD
16: 11 BD 22 BD
17: 11 BD 22 BD
18: 11 BD 22 BD
19: 11 PPP 22 PPP
11: 7 LL
10: 6 LB
9: 6 LB
8: 7 LLT
7: 8 TTTS
6: 9 SS
'''),
    # Three-quarter front: chest coming round to the viewer, head turned toward the
    # tail, which swings round the far side on the right.
    'q_front': ((QUARTER, 15, 5), '''
10: 11 LLLL
11: 10 LBBBBBBBBBBBL
12: 10 BBBBB 15 WWWWW 20 BBB
13: 10 BBBBB 15 WWWWW 20 BBB
14: 10 DBBBB 15 BWWWB 20 BBD
15: 11 BD 16 BD 20 BD
16: 11 BD 16 BD 20 BD
17: 11 BD 16 BD 20 BD
18: 11 BD 16 BD 20 BD
19: 11 PP 16 PP 20 PP
14: 23 LB
13: 24 LB
12: 24 LB
11: 24 TT
10: 24 TTS
9: 24 TTS
8: 25 SS
'''),
    # Front: square to the viewer, head turned to the tail on the viewer's right.
    'front': ((QUARTER, 12, 5), '''
11: 11 LBBBBBBBBL
12: 11 BBBWWWWBBB
13: 11 BBBWWWWBBB
14: 11 DBBBWWBBBD
15: 12 BD 18 BD
16: 12 BD 18 BD
17: 12 BD 18 BD
18: 12 BD 18 BD
19: 10 pp 12 PP 18 PP 20 pp
15: 21 LB
14: 22 LB
13: 22 LB
12: 22 TT
11: 22 TTS
10: 22 TTS
9: 23 SS
'''),
    # Back: rump to the viewer, the back of the head between the ears, tail round
    # the viewer's left.
    'back': ((HEAD_BACK, 12, 6), '''
11: 11 LBBBBBBBBL
12: 10 LBBBBBBBBBBL
13: 10 BBBBBBBBBBBB
14: 10 DBBBBBBBBBBD
15: 11 BBD 18 DBB
16: 12 BD 18 DB
17: 12 BD 18 DB
18: 12 BD 18 DB
19: 11 PPP 18 PPP
15: 8 BL
14: 7 BL
13: 7 BL
12: 7 TT
11: 6 STT
10: 6 STT
9: 6 SS
'''),
    # Three-quarter back: rump toward the viewer on the left, head going away on the
    # right, tail round the near side.
    'q_back': ((HEAD_BACK, 16, 6), '''
15: 17 A
16: 17 A
17: 17 A
18: 17 A
19: 17 pp
11: 9 LLLLLLBBBBBBBL
12: 9 BBBBBBBBBBBBBB
13: 9 BBBBBBBBBBBBBB
14: 9 DBBBBBBBBBBBBD
15: 10 BBD 20 BD
16: 11 BD 20 BD
17: 11 BD 20 BD
18: 11 BD 20 BD
19: 10 PPP 20 PP
14: 8 BL
13: 7 BL
12: 7 BL
11: 7 TT
10: 6 STT
9: 6 STT
8: 6 SS
'''),
}


def view(name, mirror=False):
    (rows, x, y), body = VIEWS[name]
    # The craned-back head in profile sits behind the neck; elsewhere the head is
    # in front of the body.
    g = compose(stamp(rows, x, y, 0, 0), runs(body)) if name in ('side', 'bite') else \
        compose(runs(body), stamp(rows, x, y, 0, 0))
    # Short stoat legs: drop the two upper leg rows and let everything above sink.
    g = [['.'] * len(g[0]) for _ in range(2)] + g[:15] + g[17:]
    if mirror:
        # Mirrored about the canvas middle, then two pixels right so the turn stays
        # centred on the same spot.
        g = shift([r[::-1] for r in g], 2, 0)
    return g


# The side view with the tail tip swung on into the nose: the third lap's near bite.
VIEWS['bite'] = (VIEWS['side'][0], VIEWS['side'][1] + '''8: 9 TTTT
9: 12 TT
''')

# Three laps of the eight views at 50 ms, a lap every 400 ms like the cat's approved
# spin; the third lap's side view is the bite.
LAP = [('side', False), ('q_front', False), ('front', False), ('q_front', True),
       ('side', True), ('q_back', True), ('back', False), ('q_back', False)]
SEQ = LAP * 2 + [('bite', False)] + LAP[1:]
MS = [50] * len(SEQ)
FRAMES = SEQ


def raw(f):
    return view(*SEQ[f])
