"""Levitate v2 bubbles: an empty pixel bubble (the vector logo and HTML label sit on top
in the page), 31x31 so the focused size fits. Clips: grow, idle (wobble), pop, and the
focus states: focus_in (r11 -> r13), focus (held, no wobble: its float pauses),
focus_out, recede_in (r11 -> r10), recede (dim, small wobble), recede_out."""
import math
from art import rows_of  # noqa: F401  (sets the sprites path)
from lib import Grid

BW = BH = 31
C = 15


def bubble(rx, ry, fill=True, sheen=True, gaps=None, rim='b'):
    g = Grid(BW, BH)
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
                g.set(x, y, 'r' if sheen and 15 < ang < 85 else rim)
            elif fill:
                g.set(x, y, 'g')
    if sheen and fill:
        for a in (200, 215, 230):
            g.set(round(C + (rx - 2) * math.cos(math.radians(a))),
                  round(C + (ry - 2) * math.sin(math.radians(a))), 'w')
    return g.rows()


def sparks(r, n, offset, ch, size=1):
    g = Grid(BW, BH)
    for k in range(n):
        a = math.radians(offset + k * 360 / n)
        x, y = round(C + r * math.cos(a)), round(C + r * math.sin(a))
        g.set(x, y, ch)
        if size > 1:
            g.set(x + (1 if math.cos(a) > 0.3 else -1 if math.cos(a) < -0.3 else 0),
                  y + (1 if math.sin(a) > 0.3 else -1 if math.sin(a) < -0.3 else 0), ch)
    return g.rows()


def f(px, ms):
    return dict(px=px, ms=ms)


def clips():
    return dict(
        grow=[f(sparks(0, 1, 0, 'b'), 40), f(bubble(3.5, 3.5, False, False), 40), f(bubble(7.5, 7.5, False), 40),
              f(bubble(11.5, 10.5), 50), f(bubble(10.5, 11.5), 50), f(bubble(11, 11), 60)],
        idle=[f(bubble(11, 11), 520), f(bubble(11.5, 10.5), 160), f(bubble(11, 11), 520), f(bubble(10.5, 11.5), 160)],
        pop=[f(bubble(11.5, 11.5, False, gaps=((45, 135, 225, 315), 14)), 50),
             f(sparks(12, 8, 22.5, 'b', 2), 50), f(sparks(12, 4, 45, 'm'), 60)],
        # focus: one in-between, a 1px overshoot, then the held size
        focus_in=[f(bubble(12, 12), 40), f(bubble(13.5, 13.5), 40)],
        focus=[f(bubble(13, 13, rim='w'), 1000)],
        focus_out=[f(bubble(12, 12), 40)],
        recede_in=[f(bubble(10.5, 10.5), 50)],
        recede=[f(bubble(10, 10, sheen=False, rim='m'), 700), f(bubble(10.5, 9.5, sheen=False, rim='m'), 200)],
        recede_out=[f(bubble(10.5, 10.5), 50)],
    )
