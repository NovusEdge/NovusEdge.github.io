"""The bound: the stoat's arched-back lope, facing right, 24 frames, 1 px per frame.

Twelve keys with a hand-placed in-between after each. Fore paws are planted on
frames 0-9 and hind paws on 6-14, stepping back one pixel a frame. While the fore paws hold,
the shoulders stay put against the ground and the hips catch up, which throws the
back into the arch; while the hind paws hold, the front shoots forward and the back
straightens into the stretch. Each pair of legs moves together with the far one two
pixels behind: the stoat's paired 2x2 bound.

Every frame is hand placed as pixel runs (stoat.runs); head and tail are shared
drawings stamped at an anchor. build.py outlines and crops."""
from stoat import d, stamp, runs, compose

N = 24
TRAVEL = 1
# Per key, split between the key and the in-between after it. The arch and the
# stretch hold a touch longer than the frames between them.
KEY_MS = [80, 75, 75, 90, 90, 75, 75, 80, 85, 80, 75, 75]
MS = [h for m in KEY_MS for h in ((m + 1) // 2, m // 2)]

HEAD = d('''
..LL.....
BLIBLLL..
BBBBBKBL.
BBBBBBBBN
WWWWWWW..
''')
# Frames give the top-left of a 9x7 box; the head sits on its lower rows.
HEAD_IN = (0, 1)

TAIL = {
    # Carried back and a little up; the root (bottom right) tucks into the rump.
    'level': d('''
SS......
TTS.....
TTTLL...
.TBBBLL.
....BBBB
'''),
    # Trailing level off the lowered rump during the arch, tip flicked up.
    'arch': d('''
SS......
TTS.....
TTTLLLL.
.TBBBBBB
'''),
}

# Per frame: head anchor (top-left of the 9x7 head box), tail (name, anchor), then
# far legs (A/p), body, near legs (B/D/P) as runs, painted in that order.
KEYS = [
    # 0 fore contact: front settles onto both reaching forelegs, rear still high,
    # hind legs swinging forward under the belly.
    dict(head=(21, 6), tail=('level', 1, 6), far='''
14: 7 AA 17 AA
15: 9 AA 18 AA
16: 9 AA 19 AA
17: 10 pp 20 AA
18: 20 AA
19: 21 pp
''', body='''
8: 18 LLL
9: 7 LLLLLLLLLLL 18 BBB
10: 6 BBBBBBBBBBBBBBB
11: 6 BBBBBBBBBBBBBB 20 W
12: 7 DBBBBBBBBB 17 WWWWW
13: 8 DBBB 12 WWWWWWWWWW
''', near='''
14: 9 BBBD 19 BBD
15: 11 BBD 20 BBD
16: 11 BD 21 BBD
17: 12 PPP 22 BD
18: 22 BD
19: 23 PPP
'''),
    # 1 fore planted, hips coming up and forward, the arch starting.
    dict(head=(20, 6), tail=('level', 2, 6), far='''
14: 8 AA 16 AA
15: 10 AA 17 AA
16: 11 AA 17 AA
17: 11 pp 18 AA
18: 18 AA
19: 19 pp
''', body='''
8: 10 LLLLL 17 LLL
9: 8 LL 10 BBBBB 15 LL 17 BBB
10: 7 BBBBBBBBBBBBBB
11: 7 BBBBBBBBBBBB 19 W
12: 8 DBBBBBB 15 WWWWW
13: 9 DDD 14 WWWWWWW
''', near='''
14: 10 BBBD 18 BBD
15: 12 BBD 19 BBD
16: 13 BD 19 BBD
17: 13 PPP 20 BD
18: 20 BD
19: 21 PPP
'''),
    # 2 fore planted, back arching, hind paws dropping to land.
    dict(head=(19, 6), tail=('arch', 1, 7), far='''
14: 7 AA 14 AA
15: 9 AA 15 AA
16: 9 AA 15 AA
17: 9 AA 16 AA
18: 10 pp 16 AA
19: 17 pp
''', body='''
6: 11 LLLL
7: 9 LL 11 BBBB 15 LL
8: 8 L 9 BBBBBBBB 17 LL
9: 7 L 8 BBBBBBBBBBB
10: 7 BBBB 11 WWWW 15 BBBB
11: 7 BBBB 15 BWWW
12: 8 DBD 15 WWWW
13: 9 DD 15 WWWW
''', near='''
14: 9 BBBD 16 BBD
15: 11 BBD 17 BBD
16: 11 BD 17 BD
17: 11 BD 18 BD
18: 12 PPP 18 BD
19: 19 PPP
'''),
    # 3 hind contact just behind the fore paws: the full arch.
    dict(head=(19, 6), tail=('arch', 1, 8), far='''
14: 7 AA 13 AA
15: 8 AA 13 AA
16: 8 AA 13 AA
17: 9 AA 14 AA
18: 9 AA 14 AA
19: 9 pp 15 pp
''', body='''
5: 11 LLLL
6: 10 L 11 BBBB 15 L
7: 9 L 10 BBBBBB 16 LL
8: 8 L 9 BBBBBBBBBB
9: 7 L 8 BBB 11 WWWW 15 BBBB
10: 6 BBBBB 15 BBBW
11: 6 BBBBB 15 WWWW
12: 7 BBBD 15 WWWW
13: 8 DD 15 WWW
''', near='''
14: 9 BBBD 15 BBD
15: 10 BBD 15 BD
16: 10 BD 15 BD
17: 10 BD 16 BD
18: 10 BD 16 BD
19: 11 PPP 17 PPP
'''),
    # 4 all four down, most gathered; forelegs angled back, about to peel off.
    dict(head=(18, 5), tail=('arch', 1, 7), far='''
13: 13 AA
14: 6 AAA 13 AA
15: 7 AA 13 AA
16: 7 AA 12 AA
17: 6 AA 12 AA
18: 6 AA 12 AA
19: 7 pp 13 pp
''', body='''
5: 10 LLLL
6: 9 L 10 BBBB 14 LL
7: 8 L 9 BBBBBBB 16 B
8: 7 L 8 BBBBBBBBBB
9: 7 BBBB 11 WWW 14 BBBB
10: 7 BBBB 14 BBWW
11: 7 BBBB 14 WWWW
12: 7 BBBD 14 WWWW
13: 8 DD
''', near='''
13: 15 BBD
14: 8 BBBD 15 BD
15: 9 BBD 15 BD
16: 9 BD 14 BD
17: 8 BD 14 BD
18: 8 BD 14 BD
19: 9 PPP 15 PPP
'''),
    # 5 forelegs peel off and fold back; hind legs push, the front starts to rise.
    dict(head=(19, 5), tail=('arch', 2, 8), far='''
13: 14 AA
14: 6 AA 13 AA
15: 6 AA 12 AA
16: 5 AA 11 pp
17: 4 AA
18: 4 AA
19: 5 pp
''', body='''
6: 11 LLLL
7: 9 LL 11 BBBB 15 LL 17 LL
8: 8 L 9 BBBBBBBBBB
9: 8 BBB 11 BBBBBBBB
10: 8 BBB 11 WWWW 15 BBBW
11: 8 BBBB 15 WWWW
12: 8 BBBD 15 WWWW
13: 8 DD
''', near='''
13: 16 BBD
14: 8 BBBD 15 BD
15: 8 BD 14 BD
16: 7 BD 13 PP
17: 6 BD
18: 6 BD
19: 7 PPP
'''),
    # 6 hind legs drive back with the heels lifting; forelegs tucked; back
    # straightening.
    dict(head=(20, 4), tail=('level', 2, 7), far='''
13: 15 AA
14: 5 AA 15 AA
15: 4 AA 16 pp
16: 3 AA
17: 2 AA
18: 2 AA
19: 3 pp
''', body='''
7: 18 LL
8: 13 LLLLL 18 BB
9: 11 LL 13 BBBBBBB
10: 9 LL 11 BBBBBBBBB
11: 8 L 9 BBBBBBBB 17 WWW
12: 8 BBBBB 13 WWWWWW
13: 8 DBBD
''', near='''
13: 17 BBD
14: 7 BBD 17 BD
15: 6 BD 18 PP
16: 5 BD
17: 4 BD
18: 4 BD
19: 5 PP
'''),
    # 7 toe-off: the hind toes leave last, body at full stretch, forelegs reach.
    dict(head=(21, 4), tail=('level', 1, 6), far='''
13: 17 AA
14: 4 AA 19 AA
15: 3 AA 21 pp
16: 2 pp
''', body='''
7: 19 LL
8: 12 LLLLLLL 19 BB
9: 8 LLLL 12 BBBBBBBBB
10: 7 L 8 BBBBBBBBBBB 19 W
11: 6 BBBBBBBBBBB 17 WWW
12: 6 BBBBBD 12 WWWWWWWWW
13: 7 DBBD
''', near='''
13: 19 BBD
14: 6 BBD 21 BBD
15: 5 BBD 23 PPP
16: 5 BD
17: 4 BD
18: 3 BD
19: 3 PP
'''),
    # 8 flight, stretched out: forelegs reaching, hind legs trailing.
    dict(head=(21, 4), tail=('level', 1, 6), far='''
13: 4 AAA 17 AA
14: 2 pp 19 AA
15: 21 pp
''', body='''
7: 19 LL
8: 10 LLLLLLLLL 19 BB
9: 7 LL 9 BBBBBBBBBBBB
10: 7 BBBBBBBBBBBB 19 WW
11: 6 BBBBBBBBBBB 17 WWWW
12: 7 DBBBD 12 WWWWWWWWW
''', near='''
13: 7 BBD 19 BBD
14: 5 BBD 21 BBD
15: 3 PP 23 PPP
'''),
    # 9 flight: hind legs fold forward under the rump.
    dict(head=(21, 4), tail=('level', 1, 6), far='''
13: 5 AA 17 AA
14: 4 AA 19 AA
15: 4 pp 22 pp
''', body='''
7: 19 LL
8: 10 LLLLLLLLL 19 BB
9: 7 LL 9 BBBBBBBBBBBB
10: 7 BBBBBBBBBBBB 19 WW
11: 6 BBBBBBBBBBB 17 WWWW
12: 7 DBBBD 12 WWWWWWWWW
''', near='''
13: 7 BBD 19 BBD
14: 7 BD 21 BBD
15: 6 PPP 24 PPP
'''),
    # 10 coming down: forelegs reach for the ground, hind legs swing forward.
    dict(head=(21, 5), tail=('level', 1, 7), far='''
14: 6 AA 18 AA
15: 7 AA 19 AA
16: 6 pp 20 AA
17: 21 pp
''', body='''
8: 19 LL
9: 10 LLLLLLLLL 19 BB
10: 7 LL 9 BBBBBBBBBBBB
11: 7 BBBBBBBBBBBB 19 WW
12: 6 BBBBBBBBBBB 17 WWWW
13: 7 DBBBD 12 WWWWWWWWW
''', near='''
14: 8 BBD 20 BBD
15: 9 BD 21 BD
16: 8 PPP 22 BD
17: 23 PPP
'''),
    # 11 forelegs about to touch down; hind legs swing on under the belly.
    dict(head=(21, 5), tail=('level', 1, 7), far='''
14: 7 AA 18 AA
15: 8 AA 19 AA
16: 8 AA 20 AA
17: 8 pp 20 AA
18: 21 pp
''', body='''
8: 19 LL
9: 10 LLLLLLLLL 19 BB
10: 7 LL 9 BBBBBBBBBBBB
11: 7 BBBBBBBBBBBB 19 WW
12: 6 BBBBBBBBBBB 17 WWWW
13: 7 DBBBD 12 WWWWWWWWW
''', near='''
14: 9 BBBD 20 BBD
15: 10 BD 21 BD
16: 10 BD 22 BD
17: 10 PPP 22 BD
18: 23 PPP
'''),
]


# In-between i sits after key i. Planted paws sit one pixel behind where they were
# on the key before (the sprite has moved one pixel); everything else is drawn
# halfway between the two keys.
INBETWEENS = [
    # 0-1: front settling, the back starting to rise.
    dict(head=(20, 6), tail=('level', 2, 6), far='''
14: 8 AA 16 AA
15: 9 AA 17 AA
16: 10 AA 18 AA
17: 10 pp 19 AA
18: 19 AA
19: 20 pp
''', body='''
8: 11 LLL 17 LLL
9: 7 LLLL 11 BBB 14 LLL 17 BBB
10: 7 BBBBBBBBBBBBBB
11: 7 BBBBBBBBBBBB 19 W
12: 7 DBBBBBBBB 16 WWWW
13: 8 DDDD 13 WWWWWWWW
''', near='''
14: 10 BBBD 18 BBD
15: 11 BBD 19 BBD
16: 12 BD 20 BBD
17: 12 PPP 21 BD
18: 21 BD
19: 22 PPP
'''),
    # 1-2: arch half up, hind legs reaching down.
    dict(head=(19, 6), tail=('arch', 1, 7), far='''
14: 7 AA 15 AA
15: 9 AA 16 AA
16: 10 AA 16 AA
17: 10 pp 17 AA
18: 17 AA
19: 18 pp
''', body='''
7: 10 LLLLL
8: 9 L 10 BBBBB 15 LL 17 LL
9: 8 L 9 BBBBBBBBBB
10: 7 BBBBBBBBBBBB
11: 7 BBBB 11 WWWW 15 BBBW
12: 8 DBBD 15 WWWW
13: 9 DD 14 WWWWW
''', near='''
14: 9 BBBD 17 BBD
15: 11 BBD 18 BBD
16: 12 BD 18 BD
17: 12 PPP 19 BD
18: 19 BD
19: 20 PPP
'''),
    # 2-3: rump dropping, hind paws a pixel off the ground.
    dict(head=(19, 6), tail=('arch', 1, 8), far='''
14: 7 AA 13 AA
15: 8 AA 14 AA
16: 9 AA 14 AA
17: 9 AA 15 AA
18: 9 pp 15 AA
19: 16 pp
''', body='''
6: 11 LLLL
7: 9 LL 11 BBBB 15 LL
8: 8 L 9 BBBBBBBB 17 LL
9: 7 L 8 BBBBBBBBBBB
10: 7 BBBB 11 WWWW 15 BBBB
11: 6 BBBBB 15 BWWW
12: 7 BBBD 15 WWWW
13: 8 DD 15 WWWW
''', near='''
14: 9 BBBD 15 BBD
15: 10 BBD 16 BBD
16: 11 BD 16 BD
17: 11 BD 17 BD
18: 11 PPP 17 BD
19: 18 PPP
'''),
    # 3-4: full arch rolling over the planted feet.
    dict(head=(18, 6), tail=('arch', 1, 8), far='''
14: 7 AA 13 AA
15: 7 AA 13 AA
16: 7 AA 13 AA
17: 7 AA 13 AA
18: 7 AA 13 AA
19: 8 pp 14 pp
''', body='''
5: 11 LLLL
6: 10 L 11 BBBB 15 L
7: 9 L 10 BBBBBB 16 L
8: 8 L 9 BBBBBBBBB
9: 7 L 8 BBB 11 WWWW 15 BBB
10: 7 BBBB 14 BBBW
11: 6 BBBBB 14 WWWW
12: 7 BBBD 14 WWWW
13: 8 DD 15 WW
''', near='''
14: 9 BBBD 15 BBD
15: 9 BBD 15 BD
16: 9 BD 15 BD
17: 9 BD 15 BD
18: 9 BD 15 BD
19: 10 PPP 16 PPP
'''),
    # 4-5: forelegs rolling onto the toes, heels up; front beginning to lift.
    dict(head=(18, 5), tail=('arch', 2, 7), far='''
13: 14 AA
14: 6 AA 13 AA
15: 6 AA 13 AA
16: 6 AA 12 AA
17: 5 AA 11 AA
18: 5 AA 11 Ap
19: 6 pp 12 pp
''', body='''
5: 10 LLLL
6: 9 L 10 BBBB 14 LL
7: 8 L 9 BBBBBB 15 LLL
8: 8 BBBBBBBBBB
9: 7 BBBB 11 WWW 14 BBBB
10: 7 BBBB 14 BBWW
11: 7 BBBB 14 WWWW
12: 7 BBBD 14 WWWW
13: 8 DD
''', near='''
13: 16 BBD
14: 8 BBBD 15 BD
15: 8 BBD 15 BD
16: 8 BD 14 BD
17: 7 BD 13 BD
18: 7 BD 13 BP
19: 8 PPP 14 PP
'''),
    # 5-6: forelegs folding under, hind heels starting to lift.
    dict(head=(19, 4), tail=('level', 2, 7), far='''
13: 14 AA
14: 5 AA 14 AA
15: 5 AA 13 AA
16: 4 AA 13 pp
17: 3 AA
18: 3 AA
19: 4 pp
''', body='''
7: 12 LLLLL 17 LL
8: 9 LLL 12 BBBBBBBB
9: 8 L 9 BBBBBBBBBBB
10: 8 BBBBBBBBB 17 WWW
11: 8 BBBBBB 14 WWWWW
12: 8 BBBD 13 WWWWW
13: 8 DD
''', near='''
13: 16 BBD
14: 7 BBBD 16 BD
15: 7 BD 15 BD
16: 6 BD 15 PP
17: 5 BD
18: 5 BD
19: 6 PP
'''),
    # 6-7: driving off the toes, forelegs swinging forward.
    dict(head=(20, 4), tail=('level', 1, 7), far='''
13: 16 AA
14: 4 AA 17 AA
15: 3 AA 19 pp
16: 2 AA
17: 1 AA
18: 1 AA
19: 2 pp
''', body='''
7: 18 LL
8: 12 LLLLLL 18 BB
9: 9 LLL 12 BBBBBBBB
10: 8 L 9 BBBBBBBBBB 19 W
11: 7 L 8 BBBBBBBBB 17 WWW
12: 7 BBBBB 12 WWWWWWWW
13: 7 DBBD
''', near='''
13: 18 BBD
14: 6 BBD 19 BBD
15: 5 BD 21 PP
16: 5 BD
17: 4 BD
18: 4 BD
19: 4 PP
'''),
    # 7-8: hind feet just off the ground, trailing.
    dict(head=(21, 4), tail=('level', 1, 6), far='''
13: 5 AA 17 AA
14: 3 AA 19 AA
15: 2 pp 21 pp
''', body='''
7: 19 LL
8: 11 LLLLLLLL 19 BB
9: 7 LLL 10 BBBBBBBBBBB
10: 7 BBBBBBBBBBBB 19 WW
11: 6 BBBBBBBBBBB 17 WWWW
12: 7 DBBBD 12 WWWWWWWWW
13: 7 DD
''', near='''
13: 19 BBD
14: 6 BBD 21 BBD
15: 4 BBD 23 PPP
16: 3 BD
17: 2 PP
'''),
    # 8-9: top of the flight, a pixel higher than the keys either side.
    dict(head=(21, 3), tail=('level', 1, 5), far='''
12: 5 AA 17 AA
13: 3 AA 19 AA
14: 3 pp 22 pp
''', body='''
6: 19 LL
7: 10 LLLLLLLLL 19 BB
8: 7 LL 9 BBBBBBBBBBBB
9: 7 BBBBBBBBBBBB 19 WW
10: 6 BBBBBBBBBBB 17 WWWW
11: 7 DBBBD 12 WWWWWWWWW
''', near='''
12: 7 BBD 19 BBD
13: 6 BBD 21 BBD
14: 4 PPP 23 PPP
'''),
    # 9-10: front tipping down toward the ground.
    dict(head=(21, 5), tail=('level', 1, 6), far='''
13: 6 AA 17 AA
14: 6 AA 19 AA
15: 5 pp 20 AA
16: 21 pp
''', body='''
8: 10 LLLLLLLLL 19 LL
9: 7 LL 9 BBBBBBBBBB 19 BB
10: 7 BBBBBBBBBBBB 19 WW
11: 6 BBBBBBBBBBB 17 WWWW
12: 7 DBBBD 12 WWWWWWWWW
13: 15 WWWWW
''', near='''
13: 8 BBD 19 BBD
14: 8 BD 21 BBD
15: 7 PPP 22 BD
16: 23 PPP
'''),
    # 10-11: forelegs straightening for the landing, hind legs coming through.
    dict(head=(21, 5), tail=('level', 1, 7), far='''
14: 7 AA 18 AA
15: 7 AA 19 AA
16: 7 pp 20 AA
17: 20 AA
18: 21 pp
''', body='''
8: 19 LL
9: 10 LLLLLLLLL 19 BB
10: 7 LL 9 BBBBBBBBBBBB
11: 7 BBBBBBBBBBBB 19 WW
12: 6 BBBBBBBBBBB 17 WWWW
13: 7 DBBBD 12 WWWWWWWWW
''', near='''
14: 8 BBBD 20 BBD
15: 9 BD 21 BBD
16: 9 PPP 22 BD
17: 22 BD
18: 23 PPP
'''),
    # 11-0: fore paws a pixel above the spot they land on; front dropping.
    dict(head=(21, 6), tail=('level', 1, 6), far='''
14: 7 AA 18 AA
15: 8 AA 19 AA
16: 9 AA 20 AA
17: 9 pp 21 AA
18: 22 pp
''', body='''
8: 18 LLL
9: 7 LLLLLLLLLLL 18 BBB
10: 6 BBBBBBBBBBBBBBB
11: 6 BBBBBBBBBBBBBB 20 W
12: 7 DBBBBBBBBB 17 WWWWW
13: 8 DBBB 12 WWWWWWWWWW
''', near='''
14: 9 BBBD 20 BBD
15: 10 BBD 21 BBD
16: 11 BD 22 BD
17: 11 PPP 23 BD
18: 24 PPP
'''),
]

FRAMES = [fr for pair in zip(KEYS, INBETWEENS) for fr in pair]


def raw(f):
    fr = FRAMES[f]
    name, tx, ty = fr['tail']
    return compose(runs(fr['far']), stamp(TAIL[name], tx, ty, 0, 0), runs(fr['body']),
                   runs(fr['near']), stamp(HEAD, fr['head'][0] + HEAD_IN[0],
                                           fr['head'][1] + HEAD_IN[1], 0, 0))
