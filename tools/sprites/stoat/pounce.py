"""Pounce: from the sit the front sinks into a stalking crouch over the fore paws, the
rump wiggles four times, it springs up and comes down on the same spot through the
bound's landing frames, pins the spot in the crouch, looks down at it, and sits back
up through the crouch's own in-betweens. The site does not move the stoat for it, so
the fore paws land on the pixels they left (the sit's) and it ends on sit frame 0 at
the same footprint."""
from stoat import stamp, runs, compose
import bound
import sit_down
from rest import SIT_FAR, SIT_NEAR, tail, head, sit, lift

# Head anchor, tail tip (rest.tail), far legs, body, near legs, and the nape row.
POSE = {
    # Neck tipping forward off the sit, rump a pixel up.
    'lean1': dict(head=(22, 5), tip='rest', far=SIT_FAR, body='''
8: 20 LL
9: 18 LLBB
10: 17 LBBBBB 23 WWWW
11: 16 LBBBBBB 23 WWWW
12: 14 LLBBBBBBB 23 WWW
13: 12 LLBBBBBBBBB 23 WWW
14: 11 LBBBBBBBBBBB 23 WW
15: 10 LBBBBBBD 18 WWWW
16: 10 BBBBBBBBD 19 WWW
17: 10 DBBBBBBBD 20 WW
18: 11 DBBBBD
19: 14 PPPPP
''', near=SIT_NEAR, nape='9: 21 LBB'),
    # Head going down toward the paws, elbows starting to bend.
    'lean2': dict(head=(22, 8), tip='rest', far='''
16: 21 A
17: 22 A
18: 22 A
19: 21 pp
''', body='''
10: 15 LLBBBBB
11: 13 LLBBBBBBB
12: 11 LLBBBBBBBBB
13: 10 LBBBBBBBBBBBB 23 WWW
14: 9 LBBBBBBBBBBBB 23 WW
15: 9 DBBBBBBBBB 19 WWWW
16: 10 DBBBBBD 17 WWWW
17: 11 DBBBBD
18: 13 BD
19: 14 PPPP
''', near='''
16: 22 BBD
17: 23 BD
18: 23 BD
19: 23 PPP
''', nape='12: 21 LBB'),
    # The stalking crouch: chin low over the fore paws, elbows up, rump raised over
    # the folded hind legs.
    'crouch': dict(head=(22, 10), tip='rest', far='''
17: 20 A
18: 21 A
19: 21 pp
17: 10 AA
18: 11 AA
19: 11 pp
''', body='''
10: 12 LLLL
11: 11 LBBBBLL
12: 10 LBBBBBBBLL
13: 9 LBBBBBBBBBBLL 21 L
14: 9 BBBBBBBBBBBBB
15: 9 DBBBBBBBBBBB 21 WWW
16: 10 DDBBBB 16 WWWWWWW
17: 9 B
''', near='''
17: 21 BBD
18: 22 BBD
19: 23 PPP
17: 12 BBBD
18: 14 BD
19: 14 PPPP
''', nape='14: 21 LBB'),
    # Coiled to go: front lifting off the paws, rump down onto the hind legs.
    'coil': dict(head=(21, 8), tip=None, far='''
15: 21 AA
16: 22 AA
17: 23 pp
16: 10 AA
17: 10 AA
18: 11 AA
19: 11 pp
''', body='''
10: 13 LLLL
11: 11 LLBBBBLL
12: 9 LLBBBBBBBBBB
13: 9 BBBBBBBBBBBB 21 WWWW
14: 9 DBBBBBBBBB 19 WWWWW
15: 10 DDBBB 15 WWWW
''', near='''
15: 22 BBD
16: 23 BBD
17: 24 PPP
15: 11 BBD
16: 12 BD
17: 12 BD
18: 13 BD
19: 13 PPP
''', nape='12: 21 B'),
    # Hind legs driving the body up and forward; fore paws just leaving, reaching.
    'spring': dict(head=(21, 6), tip=None, far='''
13: 21 AA
14: 22 AA
15: 23 pp
15: 10 AA
16: 10 AA
17: 11 AA
18: 11 AA
19: 12 pp
''', body='''
8: 17 LLL
9: 14 LLLBBB
10: 11 LLLBBBBBB
11: 9 LLBBBBBBBBBB 21 WWWW
12: 8 LBBBBBBBBBB 19 WWWWW
13: 8 DBBBBB 14 WWWWWW
14: 9 DD
''', near='''
13: 22 BBD
14: 24 BD
15: 25 PPP
14: 11 BD
15: 12 BD
16: 12 BD
17: 13 BD
18: 13 BD
19: 14 PPP
''', nape='10: 21 B'),
    # Off the ground, stretched: fore paws reaching for the landing, hind legs
    # trailing.
    'fly': dict(head=(21, 5), tip=None, far='''
12: 20 AA
13: 22 AA
14: 24 pp
13: 8 AA
14: 7 AA
15: 6 pp
''', body='''
8: 11 LLLLLLLL 19 LL
9: 9 LLBBBBBBBBBB
10: 8 LBBBBBBBBBBBB 21 WWW
11: 8 BBBBBBBBBBB 19 WWWW
12: 9 DBBBD 14 WWWWWW
''', near='''
12: 21 BBD
13: 23 BBD
14: 25 PPP
13: 10 BBD
14: 9 BD
15: 8 BD
16: 7 PP
''', nape='9: 21 B'),
}
# Landing back into the crouch: rump still a pixel high (pose() lifts it), tail on
# its way down.
POSE['drop'] = dict(POSE['crouch'], tip=None)
# Tails off the ground, as the bound carries them.
AIR_TAIL = {'drop': ('arch', 1, 13), 'coil': ('level', 2, 9), 'spring': ('level', 2, 7), 'fly': ('level', 1, 6)}


def pose(name, wiggle=0, look=False):
    """wiggle 1 lifts the crouched rump a pixel (and flicks a ground tail's tip); look drops
    the head a row with the lid half down, eyes on the pinned paws."""
    fr = POSE[name]
    if fr['tip'] is None:
        tn, tx, ty = AIR_TAIL[name]
        tl = stamp(bound.TAIL[tn], tx, ty, 0, 0)
    else:
        tl = tail('up1' if wiggle else fr['tip'])
    hx, hy = fr['head']
    g = compose(runs(fr['far']), tl, runs(fr['body']), runs(fr['near']),
                head(hx, hy + look, 'half' if look else 'open'), runs(fr['nape']))
    if wiggle:
        lift(g, 9, 13, 9, 18)
    return g


# Beats and timing follow the cat's approved pounce: crouch, four wiggles, spring,
# land pinning the spot, a look down at it, sit back.
SEQ = (
    [(lambda: sit(), 160),
     (lambda: pose('lean1'), 50),
     (lambda: pose('lean2'), 50),
     (lambda: pose('crouch'), 250)]
    + [(lambda w=w: pose('crouch', w), ms) for w, ms in
       [(1, 70), (0, 70), (1, 70), (0, 70), (1, 70), (0, 70), (1, 70), (0, 140)]]
    + [(lambda: pose('coil'), 45),
       (lambda: pose('spring'), 45),
       (lambda: pose('fly'), 50)]
    + [(lambda k=k: bound.raw(k), 45) for k in (20, 22, 23)]
    + [(lambda: bound.raw(0), 60),
       (lambda: sit_down.mid('absorb'), 60),
       (lambda: pose('drop', 1), 55),
       (lambda: pose('crouch'), 70),
       (lambda: pose('crouch', look=True), 380),
       (lambda: pose('crouch'), 90),
       (lambda: pose('lean2'), 55),
       (lambda: pose('lean1'), 55),
       (lambda: sit(breath=1), 60),
       (lambda: sit(), 300)]
)
FRAMES = SEQ
MS = [ms for _, ms in SEQ]


def raw(f):
    return SEQ[f][0]()
