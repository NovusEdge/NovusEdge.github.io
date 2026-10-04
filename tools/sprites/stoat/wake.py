"""Wake: from sleep frame 0 the head comes up out of the tail into the curl and the
eyes open, a blink, then the rump goes up into a long front stretch with a yawn, the
front pushes up, both fore paws hop back under the chest, and it sits down the way
sit_down does, ending on sit frame 0."""
from stoat import stamp, runs, compose
import bound
import sit_down
from rest import head, sit, tail
from curl import curl
from sleep import sleep, SLEEP_BODY, SLEEP_TAIL

# Poses between the curl and the sit_down frames: head anchor, bound tail (name,
# x, y; None for the sit's tail on the ground), far legs, body, near legs.
POSE = {
    # The loaf a pixel off the ground on its legs, tail unwrapped and lying out behind.
    'unfurl': dict(head=(20, 11), tail=None, far='''
17: 8 AA 23 AA
18: 8 AA 23 AA
19: 8 pp 22 pp
''', body='''
10: 10 LLLLLL
11: 8 LLBBBBBBLL
12: 7 LBBBBBBBBBBLL
13: 6 LBBBBBBBBBBBBBB
14: 6 BBBBBBBBBBBBBBB
15: 6 BBBBBBBBBBBBBBB
16: 6 DBBBBBBBBBBBBBD 21 WWW
14: 10 D
15: 11 D
16: 12 D
''', near='''
17: 10 BD 25 BD
18: 10 BD 25 BD
19: 10 PPP 25 PPP
'''),
    # Rump half up on bending hind legs, front still down, fore paws sliding out.
    'rise': dict(head=(20, 12), tail=('arch', 1, 10), far='''
16: 8 AA
17: 8 AA
18: 9 AA
19: 9 pp
''', body='''
10: 9 LLLLL
11: 8 LBBBBBLL
12: 7 LBBBBBBBBLL
13: 7 BBBBBBBBBBBLL
14: 7 DBBBBBBBBBBBBB
15: 8 DDBBBBBBBBBB
16: 12 WWWWWWWW
17: 19 WWW
''', near='''
16: 10 BD
17: 10 BBD
18: 11 BD
19: 11 PPP
18: 21 LLLL
19: 21 BBB 24 PPP
'''),
    # Between rise and stretch: rump coming up, hind legs straightening, tail lifting.
    'reach': dict(head=(21, 11), tail=('level', 2, 8), far='''
15: 10 AA
16: 10 AA
17: 11 AA
18: 11 AA
19: 11 pp
''', body='''
9: 10 LLLL
10: 9 LBBBBLL
11: 9 BBBBBBBLL
12: 8 DBBBBBBBBBLL
13: 8 DBBBBBBBBBBBB
14: 10 DDBBBBBBBBB
15: 14 WWWWWWW
16: 18 WWWW
17: 20 BWW
''', near='''
15: 12 BD
16: 12 BD
17: 12 BD
18: 13 BD
19: 13 PPP
18: 21 LLLLL
19: 21 BBBB 25 PPP
'''),
    # The front stretch: rump high, chest to the ground, forearms flat out in front.
    'stretch': dict(head=(22, 11), tail=('level', 3, 5), far='''
14: 11 AA
15: 11 AA
16: 12 AA
17: 12 AA
18: 12 AA
19: 12 pp
''', body='''
8: 11 LLLL
9: 10 LBBBBLL
10: 10 BBBBBBBLL
11: 10 BBBBBBBBBLL
12: 10 DBBBBBBBBBBL
13: 11 DBBBBBBBBBB
14: 13 DDBBBBBBB
15: 16 WWWWWW
16: 19 WWWWW
17: 20 BWWW
''', near='''
14: 13 BD
15: 13 BD
16: 14 BD
17: 14 BD
18: 14 BD
19: 14 PPP
18: 21 LLLLLL
19: 21 BBBBB 26 PPP
'''),
    # Front pushed up on straight forelegs still reaching to the stretched-out paws.
    'push': dict(head=(22, 8), tail=('level', 3, 7), far='''
14: 11 AA
15: 11 AA 21 A
16: 12 AA 22 A
17: 12 AA 23 A
18: 12 AA 24 A
19: 12 pp 24 pp
''', body='''
9: 11 LLLL
10: 10 LBBBBLLLLL
11: 10 BBBBBBBBBBLL
12: 10 BBBBBBBBBBBB
13: 10 DBBBBBBBBBBB
14: 11 DDBBBB 17 WWWWW
''', near='''
14: 13 BD 21 BBD
15: 13 BD 22 BBD
16: 14 BD 23 BBD
17: 14 BD 24 BD
18: 14 BD 25 BD
19: 14 PPP 26 PPP
'''),
    # Both fore paws off the ground together, hopping back under the chest.
    'hop': dict(head=(21, 7), tail=('level', 3, 6), far='''
14: 11 AA 19 AA
15: 11 AA 20 AA
16: 12 AA 21 A
17: 12 AA 21 A
18: 12 AA 21 pp
19: 12 pp
''', body='''
9: 11 LLLL
10: 10 LBBBBLLLL
11: 10 BBBBBBBBBLL
12: 10 BBBBBBBBBBB
13: 10 DBBBBBB 17 WWWW
14: 11 DDBB 17 WWW
''', near='''
14: 13 BD 20 BBD
15: 13 BD 21 BD
16: 14 BD 22 BD
17: 14 BD 23 BD
18: 14 BD 23 PPP
19: 14 PPP
'''),
}


def pose(name, eye='open', yawn=False):
    fr = POSE[name]
    hx, hy = fr['head']
    if fr['tail']:
        tn, tx, ty = fr['tail']
        tl = stamp(bound.TAIL[tn], tx, ty, 0, 0)
    else:
        tl = tail()
    px = [runs(fr['far']), tl, runs(fr['body']),
          runs(fr['near']), head(hx, hy, eye)]
    if yawn:
        # Lower jaw dropped a pixel, pink mouth open under the muzzle.
        px.append(runs(f'{hy + 4}: {hx + 3} OIIII\n{hy + 5}: {hx + 1} WWWWW'))
    return compose(*px)


# (frame maker, ms)
SEQ = [
    (lambda: sleep(0, 0), 300),
    (lambda: compose(runs(SLEEP_BODY), runs(SLEEP_TAIL), head(19, 13, 'sleep')), 60),
    (lambda: curl('shut'), 60),
    (lambda: curl('half'), 60),
    (lambda: curl('open'), 380),
    (lambda: curl('shut'), 80),
    (lambda: curl('open'), 160),
    (lambda: pose('unfurl'), 60),
    (lambda: pose('rise'), 60),
    (lambda: pose('reach'), 50),
    (lambda: pose('stretch'), 120),
    (lambda: pose('stretch', 'shut', True), 520),   # yawn
    (lambda: pose('stretch', 'shut'), 80),
    (lambda: pose('stretch'), 180),
    (lambda: pose('push'), 60),
    (lambda: pose('hop'), 50),
] + [(lambda n=n: sit_down.mid(n), ms) for n, ms in sit_down.SETTLE] + [
    (lambda b=b: sit(breath=b), ms) for (_, b), ms in sit_down.END
]


def raw(f):
    return SEQ[f][0]()


FRAMES = SEQ
MS = [ms for _, ms in SEQ]
