"""Chase tail: the cat spins on the spot after its tail. Each lap is four views,
side (body facing left, head turned back at the tail), front, side facing right,
back, all at the sit head's size on the same paw row so nothing grows or shrinks
mid-spin. The third lap's bite comes closest. Starts and ends facing left."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, 'kit'), HERE]
from catkit import W, build, check, ellipse, frag, mask_layer, rect, spans, stand, tail_layer, tail_path, walk  # noqa: E402
import look  # noqa: E402

# The look clip's near-profile head turned to face right (toward the tail), with
# the light kept on the left.
HEAD_BACKWARD = [r[::-1].translate(str.maketrans('LD', 'DL')) for r in look.LEFT]

HEAD_FRONT = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBHKBBBHKBDD
....LBEKBBBEKBDD
....LBBBMNNMBBDD
.....BBMMOOMMBD.
......BMMMMBDD..
''')
# Back of the head: ear backs in coat, no face.
HEAD_BACK = frag('''
......L......D..
.....LB.....BD..
.....LBB...BBDD.
.....LBBBBBBBBDD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBBBBBBBBBDD
....LBBBBBBBBBDD
.....BBBBBBBBDD.
......BBBBBDD...
''')


def side(tail, head_x):
    lay, _ = stand(nh='s0', nf='s0', fh='s+2', ff='s-2')
    lay = [l for l in lay if 't' not in ''.join(l[0])]
    lay.insert(2, tail_layer(tail_path(tail, .7)))
    return build(lay, heads=[(HEAD_BACKWARD, head_x, 4)])


def mirror_layers(lay):
    out = []
    for rs, x0, y0 in lay:
        full = ['.' * W] * y0 + [('.' * x0 + r + '.' * W)[:W] for r in rs]
        out.append(([r[::-1] for r in full], 0, 0))
    return out


def side_right(tail, head_x):
    """The side view turned the other way: layers mirrored before shading, so the
    light stays top-left, and the sit head (which faces left) looks back."""
    lay, _ = stand(nh='s0', nf='s0', fh='s+2', ff='s-2')
    lay = [l for l in lay if 't' not in ''.join(l[0])]
    lay.insert(2, tail_layer(tail_path(tail, .7)))
    return build(mirror_layers(lay), heads=[(HEAD_SIT, head_x, 4)])


HEAD_SIT = [r[:16] for r in walk.SIT_HEAD]

FRONT = dict(
    body={15: (12, 19), 16: (11, 20), 17: (10, 21), 18: (10, 21), 19: (10, 21), 20: (10, 21),
          21: (10, 21), 22: (11, 20), 23: (11, 20)},
    bib={16: (13, 18), 17: (12, 19), 18: (12, 19), 19: (13, 18), 20: (13, 18), 21: (14, 17)},
    fore=[{y: (11, 13) for y in range(21, 28)}, {y: (18, 20) for y in range(21, 28)}],
    fpaw=[{28: (11, 13), 29: (10, 13)}, {28: (18, 20), 29: (18, 21)}],
    hind=[{24: (8, 10), 25: (8, 10), 26: (8, 10), 27: (8, 10)}, {24: (21, 23), 25: (21, 23), 26: (21, 23), 27: (21, 23)}],
    hpaw=[{28: (8, 10), 29: (7, 10)}, {28: (21, 23), 29: (21, 24)}],
)
BACK = dict(
    body={15: (12, 19), 16: (11, 20), 17: (10, 21), 18: (10, 21), 19: (9, 22), 20: (8, 23), 21: (8, 23),
          22: (8, 23), 23: (8, 23), 24: (8, 23), 25: (9, 22), 26: (10, 21)},
    haunches=[(11.5, 22.5, 3.5, 4), (19.5, 22.5, 3.5, 4)],
    hind=[{27: (9, 12)}, {27: (19, 22)}],
    hpaw=[{28: (9, 12), 29: (9, 12)}, {28: (19, 22), 29: (19, 22)}],
    fpaw={28: (14, 17), 29: (14, 17)},
)


def front(tail):
    lay = [tail_layer(tail_path(tail, .7))]
    for d in FRONT['hind']:
        lay.append(spans(d, 'f'))
    for d in FRONT['hpaw']:
        lay.append(spans(d, 'q'))
    lay += [spans(FRONT['body'], 'b'), spans(FRONT['bib'], 'W')]
    for d in FRONT['fore']:
        lay.append(spans(d, 'n'))
    for d in FRONT['fpaw']:
        lay.append(spans(d, 'p'))
    return build(lay, heads=[(HEAD_FRONT, 6, 5)])


def back(tail):
    lay = [spans(BACK['fpaw'], 'q'), spans(BACK['body'], 'b')]
    for c in BACK['haunches']:
        lay.append(mask_layer(ellipse(*c) & rect(0, 0, 31, 26), 'h'))
    for d in BACK['hind']:
        lay.append(spans(d, 'n'))
    for d in BACK['hpaw']:
        lay.append(spans(d, 'p'))
    # From behind the tail is in front of the body: lit and outlined over it.
    tl = tail_layer(tail_path(tail, .7))
    lay.append(([r.replace('t', 'u') for r in tl[0]], 0, 0))
    return build(lay, heads=[(HEAD_BACK, 6, 5)])


# Tails per view. Side: up over the rump and forward to just behind the mouth.
SIDE_TAIL = [[(25, 13), (27, 9), (25, 5), (22, 5)], [(25, 13), (27, 9), (25, 5), (21, 6)]]
FRONT_TAIL = [(21, 23), (24, 21), (26, 17), (25, 13)]
# The spin carries the rump from right (side) round to the viewer, so from
# behind the tail swings out on the left.
BACK_TAIL = [(15, 22), (11, 20), (8, 16), (7, 12)]


def lap(close):
    st = SIDE_TAIL[1 if close else 0]
    return [side(st, 3 if close else 2), front(FRONT_TAIL),
            side_right(st, 13 if close else 14), back(BACK_TAIL)]


FRAMES = lap(False) + lap(False) + lap(True)
MS = [110, 90, 100, 90] * 2 + [120, 90, 100, 100]

CLIP = check({'loop': True, 'frames': [{'ms': ms, 'px': px} for ms, px in zip(MS, FRAMES)]}, 'chase_tail')
