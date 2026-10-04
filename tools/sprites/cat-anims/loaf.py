"""Loaf, facing left: forepaws tucked under the chest, tail laid along the floor on
the near side, slow breathing and one slow blink."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import build, check, ellipse, grid, head, lift, rect  # noqa: E402

# Chest to rump is the sit's width; the mass has settled to the floor, not shrunk.
BODY = grid('''
...............bbbbb............
.............bbbbbbbbb..........
............bbbbbbbbbbbb........
...........bbbbbbbbbbbbbb.......
.........bbbbbbbbbbbbbbbbb......
......WWWbbbbbbbbbbbbbbbbbb.....
.....WWWWbbbbbbbbbbbbbbbbbb.....
.....WWWWbbbbbbbbbbbbbbbbbbb....
.....WWWWbbbbbbbbbbbbbbbbbbb....
.....WWWbbbbbbbbbbbbbbbbbbbb....
.....WWWbbbbbbbbbbbbbbbbbbbb....
.....WWbbbbbbbbbbbbbbbbbbbbb....
.....bbbbbbbbbbbbbbbbbbbbbbuu...
....ppppp.Tuuuuuuuuuuuuuuuu.....
....ppppp..uuuuuuuuuuuuuuu......
''', 15)
# The thigh fills the rump; only its front arc shows against the flank.
HAUNCH = {p for p in ellipse(23.5, 22, 5.5, 5) & rect(0, 0, 31, 26)}
CHEST = 20          # rows above this rise on the inhale
HEAD = (-1, 10)


def pose(eye='open', breathe=False, twitch=False):
    rs, _, top = BODY
    code = [list('.' * 32) for _ in range(top)] + [list(r) for r in rs]
    for (x, y) in HAUNCH:
        if code[y][x] == 'b':
            code[y][x] = 'h'
    layer = ([''.join(r) for r in code], 0, 0)
    dy = 0
    if breathe:
        layer, dy = lift(layer, CHEST), -1
    hx, hy = HEAD
    return build([layer], heads=[(head(eye, twitch), hx, hy + dy)])


FRAMES = [
    (900, {}), (800, dict(breathe=True)), (900, {}), (800, dict(breathe=True)),
    (160, dict(eye='half')), (700, dict(eye='shut')), (220, dict(eye='half')),
    (900, {}), (800, dict(breathe=True)), (600, {}),
    (90, dict(twitch=True)), (120, {}), (90, dict(twitch=True)), (800, dict(breathe=True)),
]

CLIP = check({'loop': True, 'frames': [{'ms': ms, 'px': pose(**kw)} for ms, kw in FRAMES]}, 'loaf')
