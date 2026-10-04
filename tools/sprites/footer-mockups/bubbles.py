"""Contact bubbles, 25x25. Clips: grow (spawn), idle (wobble loop), pop.
Rim 'b' bone, 'r' rose sheen on the lower right, 'w' shine, 'g' dark glass fill so the
icon reads over the dithered hands."""
import math
from art import rows_of
from lib import Grid
from glyphs import ICONS

BW = BH = 25
C = 12


def ellipse(g, rx, ry, fill=True, sheen=True, gaps=None):
    inside = lambda x, y: ((x - C) / rx) ** 2 + ((y - C) / ry) ** 2 <= 1.0
    for y in range(BH):
        for x in range(BW):
            if not inside(x, y):
                continue
            edge = any(not inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            ang = math.degrees(math.atan2(y - C, x - C)) % 360
            if edge:
                if gaps and any(abs((ang - a + 180) % 360 - 180) < gaps[1] for a in gaps[0]):
                    continue
                g.set(x, y, 'r' if sheen and 15 < ang < 85 else 'b')
            elif fill:
                g.set(x, y, 'g')
    if sheen and fill:
        # shine: a short arc just inside the upper-left rim
        for a in (200, 215, 230):
            x = round(C + (rx - 2) * math.cos(math.radians(a)))
            y = round(C + (ry - 2) * math.sin(math.radians(a)))
            g.set(x, y, 'w')


def icon(g, name, dx=0, dy=0):
    for j, r in enumerate(rows_of(ICONS[name])):
        for i, ch in enumerate(r):
            if ch != '.':
                g.set(C - 5 + i + dx, C - 5 + j + dy, 'k' if ch == '1' else 'a')


def frame(name, rx, ry, with_icon=True, **kw):
    g = Grid(BW, BH)
    ellipse(g, rx, ry, **kw)
    if with_icon:
        icon(g, name)
    return g.rows()


def sparks(r, n=8, offset=0, ch='b', size=1):
    g = Grid(BW, BH)
    for k in range(n):
        a = math.radians(offset + k * 360 / n)
        x, y = round(C + r * math.cos(a)), round(C + r * math.sin(a))
        g.set(x, y, ch)
        if size > 1:
            g.set(x + (1 if math.cos(a) > 0.3 else -1 if math.cos(a) < -0.3 else 0),
                  y + (1 if math.sin(a) > 0.3 else -1 if math.sin(a) < -0.3 else 0), ch)
    return g.rows()


def clips(name):
    grow = [
        dict(px=sparks(0, 1, ch='b'), ms=40),
        dict(px=frame(name, 3.5, 3.5, False, sheen=False), ms=40),
        dict(px=frame(name, 7.5, 7.5, False), ms=40),
        dict(px=frame(name, 11.5, 10.5), ms=50),     # overshoot, wide
        dict(px=frame(name, 10.5, 11.5), ms=50),
        dict(px=frame(name, 11, 11), ms=60),
    ]
    idle = [
        dict(px=frame(name, 11, 11), ms=520),
        dict(px=frame(name, 11.5, 10.5), ms=160),
        dict(px=frame(name, 11, 11), ms=520),
        dict(px=frame(name, 10.5, 11.5), ms=160),
    ]
    pop = [
        dict(px=frame(name, 11.5, 11.5, False, fill=False, gaps=((45, 135, 225, 315), 14)), ms=50),
        dict(px=sparks(12, 8, 22.5, 'b', 2), ms=50),
        dict(px=sparks(12, 4, 45, 'm'), ms=60),
    ]
    return dict(grow=grow, idle=idle, pop=pop)
