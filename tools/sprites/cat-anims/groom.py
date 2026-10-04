"""Groom, facing left: from the sit the near foreleg folds up, the cat licks the
raised paw three times, wipes it over the face to the ear, licks once more and
sets it down. Every raised-leg drawing is typed by hand: elbow forward and low,
forearm up to a wrist that bends the paw back toward the mouth."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import (blank, check, ellipse, frag, idle, outline, paint, rect, rows, rows_mask,  # noqa: E402
                    shade, SIT)


def body(g):
    """idle.body without the near foreleg: the far foreleg now carries the chest."""
    torso = rows_mask({12: (8, 14), 13: (8, 15), 14: (7, 16), 15: (5, 16), 16: (5, 17), 17: (4, 17),
                       18: (4, 18), 19: (4, 19), 20: (5, 20), 21: (5, 21), 22: (5, 22), 23: (5, 22),
                       24: (5, 23), 25: (5, 23), 26: (5, 23), 27: (5, 23), 28: (5, 23), 29: (5, 22)})
    paint(g, shade(torso))
    bib = rows_mask({13: (8, 10), 14: (7, 10), 15: (6, 10), 16: (6, 10), 17: (5, 10), 18: (5, 9),
                     19: (5, 9), 20: (6, 8)})
    paint(g, {p: 'W' for p in bib})
    haunch = ellipse(18, 24.5, 5.5, 5.5) & rect(0, 0, 31, 29)
    paint(g, shade(haunch), seam='D')
    # far foreleg, a pixel nearer the chest's front now that it stands alone
    paint(g, shade(rect(7, 21, 9, 29), light_edges='l', dark_edges='r', base='A', light='A', dark='O'))
    paint(g, {(x, y): 'P' for x in range(6, 11) for y in (28, 29) if (x, y) not in {(6, 28), (10, 28)}})
    paint(g, {p: 'P' for p in rect(13, 28, 16, 29)}, seam='O')


# Raised near forelegs, in canvas columns 0-11 from row 9. n coat, p paw, D crease,
# U tongue. The paw's pads face the mouth (right).
LEGS = {
    # the sit's foreleg swung forward from the shoulder, paw off the floor
    'lift': (frag('''
.....nnn....
.....nnn....
.....nnn....
....nnn.....
....nnn.....
...nnn......
...nnn......
..ppp.......
..pp........
'''), 0, 19),
    # forearm up, paw at chest height, wrist flexed down
    'chest': (frag('''
...pp.......
..pppn......
...nnnn.....
...nnnnnnn..
...nnnnnnnn.
....nnnnnn..
.....nnnn...
'''), 0, 16),
    # forearm vertical, paw cupped at the mouth
    'mouth': (frag('''
..pp........
..ppp.......
..ppnn......
...nnn......
...nnn......
...nnnn.....
...nnnnnn...
...nnnnnnn..
....nnnnnn..
.....nnnn...
'''), 0, 12),
    # paw drawn up over the eye, forearm across the cheek
    'wipe': (frag('''
....ppp.....
...pppp.....
...nnnn.....
...nnnD.....
...nnn......
...nnn......
...nnn......
...nnnn.....
...nnnnnn...
....nnnnnn..
.....nnnnn..
.......nn...
'''), 0, 9),
}

# Head tilted down a row toward the paw, with tongue variants.
HEAD_DOWN = [r[:16] for r in idle.HEAD]


def lick_head(tongue):
    h = [list(r) for r in HEAD_DOWN]
    if tongue:
        h[9][5] = 'U'        # tongue out past the lip, onto the paw
        h[9][6] = 'U'
    return [''.join(r) for r in h]


def shut(h):
    h = [list(r) for r in h]
    for x, y in idle.EYES:
        y -= idle.HEAD_Y
        h[y][x], h[y][x + 1] = 'B', 'B'
        h[y + 1][x], h[y + 1][x + 1] = 'D', 'D'
    return [''.join(r) for r in h]


def frame(leg, head_dy=1, tongue=False, eyes='open', tail='rest'):
    g = blank()
    paint(g, {p: 's' for p in ellipse(15, 30.5, 13, 1.2)})
    body(g)
    hd = lick_head(tongue)
    if eyes == 'shut':
        hd = shut(hd)
    for j, r in enumerate(hd):
        for x, c in enumerate(r):
            if c != '.':
                g[idle.HEAD_Y + head_dy + j][x] = c
    lr, lx, ly = LEGS[leg] if isinstance(leg, str) else leg
    px = {(lx + i, ly + j): c for j, r in enumerate(lr) for i, c in enumerate(r) if c != '.'}
    near = shade({p for p, c in px.items() if c == 'n'})
    near.update({p: ('P' if c == 'p' else c) for p, c in px.items() if c != 'n'})
    paint(g, near, seam='D')
    idle.tail(g, idle.TAILS[tail])
    outline(g)
    return rows(g)


FRAMES = [
    (300, SIT),
    (110, frame('lift', 0)),
    (110, frame('chest')),
    (160, frame('mouth')),
    (130, frame('mouth', tongue=True, eyes='shut')),
    (130, frame('mouth', eyes='shut')),
    (130, frame('mouth', tongue=True, eyes='shut', tail='curl')),
    (130, frame('mouth', eyes='shut', tail='curl')),
    (130, frame('mouth', tongue=True, eyes='shut', tail='curl')),
    (160, frame('wipe', 2, eyes='shut', tail='curl')),
    (220, frame('wipe', 2, eyes='shut')),
    (160, frame('mouth', eyes='shut')),
    (130, frame('mouth', tongue=True, eyes='shut')),
    (120, frame('chest')),
    (110, frame('lift', 0)),
]

CLIP = check({'loop': True, 'frames': [{'ms': ms, 'px': px} for ms, px in FRAMES]}, 'groom')
