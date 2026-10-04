"""Sit down: out of the bound's landing frame into the sit. The fore paws stay on the
pixels they landed on; the hind legs come through under the belly and plant, the rump
sinks onto them while the front rises, and the head lifts a pixel past the sit and
settles (the sit's own breath frames are the settle). The tail comes down two rows a
frame, from carried level to lying on the ground."""
from stoat import stamp, runs, compose
import bound
from rest import tail, head, sit, SIT_FAR, SIT_NEAR, SIT_BODY

# In-betweens: head anchor, tail (bound tail name and anchor, or None for the sit's
# tail on the ground), then far legs, body, near legs as runs, and the nape (coat
# over the back of the cream jaw) where the neck is upright.
MID = {
    # Follow-through of the landing: the chest dips a pixel over the planted fore
    # paws, hind legs swinging down, tail lagging where the bound carried it.
    'absorb': dict(head=(21, 8), tail=('level', 1, 6), far='''
14: 8 AA 17 AA
15: 9 AA 18 AA
16: 10 AA 19 AA
17: 10 AA 20 AA
18: 11 pp 20 AA
19: 21 pp
''', body='''
9: 7 LLLLLLLL 19 LL
10: 6 BBBBBBBBB 15 LLLL 19 BB
11: 6 BBBBBBBBBBBBBBB
12: 7 DBBBBBBBBBBB 19 WW
13: 8 DBBB 12 WWWWWWWWWWW
''', near='''
14: 10 BBD 19 BBD
15: 11 BD 20 BBD
16: 12 BD 21 BBD
17: 12 BD 22 BD
18: 13 PPP 22 BD
19: 23 PPP
'''),
    # Hind paws a pixel off the ground, front coming back up.
    'catch': dict(head=(21, 7), tail=('level', 1, 7), far='''
14: 9 AA 19 AA
15: 10 AA 20 AA
16: 11 AA 21 A
17: 11 AA 21 A
18: 12 pp 22 A
19: 21 pp
''', body='''
9: 8 LLLLLLLLLL 18 LLL
10: 7 BBBBBBBBBBBBBB
11: 7 BBBBBBBBBBBBBB
12: 7 DBBBBBBBBBBB 19 WW
13: 8 DBBBBBBB 16 WWWWWW
''', near='''
14: 11 BBD 20 BBD
15: 12 BD 21 BBD
16: 13 BD 22 BD
17: 13 BD 22 BD
18: 14 PPP 23 BD
19: 23 PPP
'''),
    # Hind paws plant under the hips; rump a pixel lower, chest lifting.
    'plant': dict(head=(21, 6), tail=('level', 1, 8), far='''
14: 10 AA 20 AA
15: 11 AA 20 AA
16: 11 AA 21 AA
17: 12 AA 22 A
18: 12 AA 22 A
19: 12 pp 21 pp
''', body='''
8: 19 LL
9: 15 LLLL 19 BB
10: 11 LLLL 15 BBBBBB
11: 9 LL 11 BBBBBBBBBB 21 WWWWW
12: 8 LBBBBBBBBBBB 20 WWWWW
13: 8 BBBBBBBBBB 18 WWWWW
''', near='''
14: 12 BBD 21 BBD
15: 13 BD 22 BBD
16: 13 BD 22 BD
17: 14 BD 23 BD
18: 14 BD 23 BD
19: 14 PPP 23 PPP
'''),
    # Front coming up off the forelegs, hind hock starting to fold.
    'tilt': dict(head=(21, 5), tail=('level', 1, 10), far='''
15: 11 AA 22 A
16: 11 AA 22 A
17: 12 AA 22 A
18: 12 AA 22 A
19: 12 pp 21 pp
''', body='''
7: 20 L
8: 18 LLB
9: 14 LLLLBBBB
10: 11 LLLBBBBBBBB 22 WWWW
11: 9 LLBBBBBBBBBBB 22 WWWW
12: 8 LBBBBBBBBBBBBB 22 WWW
13: 8 DBBBBBBBBB 18 WWWWW
''', near='''
14: 10 BBBBD 22 BBD
15: 12 BBD 23 BBD
16: 13 BD 23 BD
17: 13 BD 23 BD
18: 14 BD 23 BD
19: 14 PPPP 23 PPP
'''),
    # Chest up over the fore paws, thigh starting to fold over the hock.
    'rise': dict(head=(22, 5), tail=('arch', 2, 11), far=SIT_FAR, body='''
7: 21 L
8: 19 LLB
9: 15 LLLLBBBB
10: 12 LLLBBBBBBBB 23 WWWW
11: 10 LLBBBBBBBBBBB 23 WWWW
12: 9 LBBBBBBBBBBBBB 23 WWW
13: 8 DBBBBBBBBB 18 WWWWWW
14: 9 DBBBBBBD 17 WWWWWW
''', near=SIT_NEAR + '''15: 11 DBBBBD
16: 12 BBBD
17: 13 BBD
18: 14 BD
19: 14 PPPPP
''', nape='9: 21 LBB'),
    # Haunches folding, heels coming down; the back tips up toward the sit.
    'fold': dict(head=(22, 5), tail=('arch', 2, 12), far=SIT_FAR, body='''
7: 21 L
8: 19 LLB
9: 16 LLLBBBBB
10: 13 LLLBBBBBBB 23 WWWW
11: 11 LLBBBBBBBBBB 23 WWWW
12: 10 LBBBBBBBBBBBB 23 WWW
13: 9 LBBBBBBBBBBBBB 23 WWW
14: 9 DBBBBBBBD 18 WWWWW
15: 10 DBBBBBBD 19 WWW
16: 11 DBBBBBD 20 WW
17: 12 BBBBBD 20 WW
18: 13 BBBD
19: 14 PPPPP
''', near=SIT_NEAR, nape='9: 21 LBB'),
    # Between fold and sink: the rump's slow-in starts here.
    'ease': dict(head=(22, 5), tail=('arch', 2, 13), far=SIT_FAR, body='''
8: 19 LLB
9: 17 LLBBBB
10: 14 LLLBBBBBB 23 WWWW
11: 12 LLBBBBBBBBB 23 WWWW
12: 10 LLBBBBBBBBBBB 23 WWW
13: 9 LBBBBBBBBBBBBB 23 WWW
14: 9 DBBBBBBBD 18 WWWWW
15: 9 DBBBBBBBD 19 WWW
16: 10 DBBBBBBD 20 WW
17: 11 DBBBBBD 20 WW
18: 12 BBBBD
19: 14 PPPPPP
''', near=SIT_NEAR, nape='9: 21 LBB'),
    # Rump sinking, neck straightening; tail root low at the back of the rump.
    'sink': dict(head=(22, 5), tail=('arch', 2, 14), far=SIT_FAR, body='''
8: 20 LLB
9: 18 LLBBB
10: 15 LLLBBBBB 23 WWWW
11: 13 LLBBBBBBBB 23 WWWW
12: 11 LLBBBBBBBBBB 23 WWW
13: 10 LBBBBBBBBBBBB 23 WWW
14: 9 LBBBBBBBD 18 WWWWW
15: 9 DBBBBBBBD 19 WWW
16: 9 LDBBBBBBD 20 WW
17: 10 BDBBBBBD 20 WW
18: 12 DBBBD
19: 14 PPPPPP
''', near=SIT_NEAR, nape='9: 21 LBB'),
    # Rump a pixel off the ground, neck nearly upright.
    'perch': dict(head=(22, 4), tail=None, far=SIT_FAR, body='''
8: 21 LBB
9: 20 LBB 23 WWWW
10: 19 LBBB 23 WWWW
11: 18 LBBBB 23 WWWW
12: 16 LLBBBBBB 23 WWW
13: 13 LLLBBBBBBBB 23 WWW
14: 11 LLBBBBBBBBBB 23 WW
15: 10 LBBBBBBBD 19 WWW
16: 10 BBBBBBBBBD 20 WW
17: 10 DBBBBBBBBD 20 WW
18: 11 DDBBBBD
19: 14 PPPPPP
''', near=SIT_NEAR, nape='8: 21 LBB'),
}

# The in-betweens from the hind paws planting to the rump touching down, with their
# ms; wake sits down through the same drawings. Spacing closes up as the rump nears
# the ground, and the frames slow from 55 to 75 ms with it.
SETTLE = [('plant', 55), ('tilt', 55), ('rise', 55), ('fold', 55), ('ease', 60),
          ('sink', 60), ('perch', 65), ('touch', 75)]
# Head a pixel up with the chest swelled, a pixel past the sit, then held on the way
# back before the sit itself.
END = [(('sit', 1), 60), (('sit', 2), 110), (('sit', 1), 170), (('sit', 0), 200)]

SEQ = [('bound', 50), ('absorb', 55), ('catch', 55)] + SETTLE + END


def mid(name):
    if name == 'touch':
        # The sit with the head still a pixel low: rump down before the neck is up.
        return compose(runs(SIT_FAR), tail(), runs(SIT_BODY), runs(SIT_NEAR),
                       head(22, 4), runs('8: 21 LBB'))
    fr = MID[name]
    if fr['tail']:
        tn, tx, ty = fr['tail']
        tl = stamp(bound.TAIL[tn], tx, ty, 0, 0)
    else:
        tl = tail('rest')
    return compose(runs(fr['far']), tl, runs(fr['body']), runs(fr['near']),
                   head(*fr['head']), runs(fr.get('nape', '0: 0 .')))


def raw(f):
    what, _ = SEQ[f]
    if what == 'bound':
        return bound.raw(0)
    if isinstance(what, tuple):
        return sit(breath=what[1])
    return mid(what)


FRAMES = SEQ
MS = [ms for _, ms in SEQ]
