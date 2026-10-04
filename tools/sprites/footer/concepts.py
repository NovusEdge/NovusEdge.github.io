"""Three footer concepts. Joint coordinates are in sprite pixels at oy = 0 for the
viewer-left arm; mirror() gives the viewer-right one (the figure is symmetric about
x = 24). Timing is the drawn timing: loops are divided by TEMPO at export."""
import math
from art import figure, neon, rows_of, FW
from glyphs import AT16, AT11

TEMPO = 1.75
AT = rows_of(AT16)
WAND_AT = rows_of(AT11)


def mirror(p):
    return (FW - p[0], p[1])


def pair(sh, el, wr, hl, hr, hd=(0, 0)):
    return [(sh, el, wr, hl, hd), (mirror(sh), mirror(el), mirror(wr), hr, (-hd[0], hd[1]))]


def ring(g, cx, cy, r, ch, dither=False):
    for a in range(0, 360, 4):
        x = round(cx + r * math.cos(math.radians(a)))
        y = round(cy + r * math.sin(math.radians(a)))
        if dither and (x + y) % 2:
            continue
        if g.get(x, y) == '.':
            g.set(x, y, ch)


# ---- 1. Halo: the @ held like a hoop in front of him ---------------------------

SH = (17.5, 21)
GRIP = pair(SH, (12.5, 24), (15.5, 27.5), 'grip_l', 'grip_r')
SQUEEZE = pair(SH, (13.5, 25), (16.5, 28), 'grip_l', 'grip_r')
FLING = [pair(SH, (11, 17), (7, 11), 'open_l', 'open_r'),
         pair(SH, (10.5, 16), (5.5, 9.5), 'open_l', 'open_r')]
BACK_IN = [pair(SH, (11, 20), (8, 17), 'open_l', 'open_r'),
           pair(SH, (12, 22), (12, 24), 'grip_l', 'grip_r')]
AT_X, AT_Y = 16, 19          # top-left of the held @ at oy = 0
HALO_OY = 4


def halo_frame(oy, arms, glow=1, burst=0, **kw):
    def between(g, o):
        neon(g, AT, AT_X, AT_Y + oy, glow)
        if burst:
            # the release: a ring of rose light leaves the @
            ring(g, AT_X + 7.5, AT_Y + oy + 7.5, 9 + burst * 3, '4' if burst == 1 else '5', burst > 1)
    return figure(dict(kw, oy=oy, arms=arms), between).rows()


def halo_idle():
    seq = [  # oy, sway, lift, glow, blink, ms
        (4, 0, 0, 1, 0, 420), (3, 0, 0, 1, 0, 140), (2, 0, 0, 1, 0, 520), (2, 0, 0, 0, 0, 60),
        (2, 0, 0, 1, 0, 300), (3, 1, 1, 1, 0, 140), (4, 1, 1, 1, 0, 140), (5, 1, 1, 1, 0, 420),
        (5, 0, 0, 1, 1, 90), (5, 0, 0, 1, 0, 300), (4, 0, 0, 2, 0, 140), (4, 0, 0, 1, 0, 200),
    ]
    return [dict(px=halo_frame(oy, GRIP, g, sway=s, lift=l, blink=b), ms=round(ms / TEMPO))
            for oy, s, l, g, b, ms in seq]


def halo_burst():
    o = HALO_OY
    return [
        dict(px=halo_frame(o + 1, SQUEEZE, 2, duck=1), ms=90),
        dict(px=halo_frame(o + 2, SQUEEZE, 2, duck=1, blink=1), ms=60),
        dict(px=halo_frame(o, FLING[0], 2, burst=1, sway=2, lift=1), ms=50, ev='emit'),
        dict(px=halo_frame(o - 1, FLING[1], 2, burst=2, sway=2, lift=2), ms=50),
        dict(px=halo_frame(o - 1, FLING[1], 1, sway=1, lift=1, glance='up'), ms=420),
        dict(px=halo_frame(o, BACK_IN[0], 1, sway=1, lift=1, glance='up'), ms=50),
        dict(px=halo_frame(o, BACK_IN[1], 1), ms=50),
        dict(px=halo_frame(o, GRIP, 1), ms=80),
    ]


# ---- 2. Levitate: the site's own neon @, hovering over upturned palms ----------

LEV_OY = 14
RAISE = pair(SH, (11, 16), (13, 9), 'palm_l', 'palm_r', (-1, -1))
RAISE2 = pair(SH, (11, 16), (13, 9), 'palm_l2', 'palm_r2', (-1, -1))
DIP = pair(SH, (11, 18), (13.5, 12), 'palm_l', 'palm_r', (-1, -1))
THRUST = pair(SH, (13, 13), (15, 5), 'palm_l2', 'palm_r2', (-1, -1))
# where the CSS glyph's centre sits, sprite px at oy = 0 (above the palms)
LEV_GLYPH = (24, -7)


def lev_frame(oy, arms, **kw):
    kw.setdefault('lift', 2)
    kw['legs'] = 'lotus'
    return figure(dict(kw, oy=oy, arms=arms)).rows()


def lev_idle():
    seq = [  # dy, arms, sway, blink, ms
        (0, RAISE, 1, 0, 420), (-1, RAISE, 1, 0, 140), (-1, RAISE2, 2, 0, 160), (-1, RAISE, 2, 0, 160),
        (-2, RAISE2, 2, 0, 160), (-2, RAISE, 1, 0, 420), (-2, RAISE, 1, 1, 90), (-2, RAISE, 1, 0, 200),
        (-1, RAISE, 0, 0, 140), (0, RAISE2, 0, 0, 160), (1, RAISE, 0, 0, 160), (1, RAISE2, 0, 0, 380),
        (1, RAISE, 1, 0, 140),
    ]
    return [dict(px=lev_frame(LEV_OY + d, a, sway=s, blink=b), ms=round(ms / TEMPO), g=d)
            for d, a, s, b, ms in seq]


def lev_burst():
    o = LEV_OY
    return [
        dict(px=lev_frame(o + 1, DIP, sway=0, lift=1, duck=1), ms=90, g=2),
        dict(px=lev_frame(o + 2, DIP, sway=0, lift=0, duck=1, blink=1), ms=70, g=3),
        dict(px=lev_frame(o, THRUST, sway=2, lift=2), ms=50, g=-2, ev='flare'),
        dict(px=lev_frame(o - 1, THRUST, sway=2, lift=2, glance='up'), ms=50, g=-4, ev='emit'),
        dict(px=lev_frame(o - 1, THRUST, sway=1, lift=2, glance='up'), ms=480, g=-4),
        dict(px=lev_frame(o, RAISE2, sway=1, lift=2, glance='up'), ms=60, g=-2),
        dict(px=lev_frame(o, RAISE, sway=1, lift=2), ms=80, g=0),
    ]


# ---- 3. Wand: a small @ on a stick, used as a bubble wand ----------------------

WAND_OY = 6
# viewer-left arm spread out for balance, viewer-right hand holds the wand
FREE = (SH, (11, 26), (7.5, 29), 'open_l', (0, 0))
FREE2 = (SH, (11, 25.5), (7, 27.5), 'open_l', (0, 0))
WSH = mirror(SH)
HOLD = [((WSH, (35, 27), (33.5, 21), 'fist', (0, 0)), (37, 2)),
        ((WSH, (36, 26.5), (33.5, 21), 'fist', (0, 0)), (35, 5)),
        ((WSH, (36, 26), (33, 21.5), 'fist', (0, 0)), (32, 8))]


def wand_frame(oy, free, hold, wob=0, breath=0, **kw):
    arm_r, (ax, ay) = hold

    def over(g, o):
        # a breath line from the mouth to the ring
        for i in range(breath):
            x, y = 26 + i * 2, 13 + o - (i % 2)
            if g.get(x, y) in '.O':
                g.set(x, y, 'm')
        wx, wy = arm_r[2]
        ax_, ay_ = round(ax + wob), round(ay + o)
        # stick from the fist up to the ring's bottom-left
        tx, ty = ax_ + 3, ay_ + 10
        n = 8
        for i in range(n + 1):
            x = round(wx + (tx - wx) * i / n)
            y = round(wy + o - 1 + (ty - wy - o + 1) * i / n)
            if g.get(x, y) in '.O':
                g.set(x, y, '7')
        neon(g, WAND_AT, ax_, ay_, kw.pop('glow', 1), hot=False)
        # the fist closes over the stick
        g.stamp(["SS", "SZ"], round(wx - 1), round(wy + o - 1))
    return figure(dict(kw, oy=oy, arms=[free, arm_r], kick=1), over=over).rows()


def wand_idle():
    seq = [  # oy, hold, free, sway, lift, blink, glance, wob, ms
        (6, 0, FREE, 0, 0, 0, None, 0, 480), (5, 0, FREE, 0, 0, 0, None, 0, 140),
        (4, 0, FREE2, 0, 0, 0, None, 0, 140), (4, 0, FREE2, 0, 0, 0, 'up', 0, 600),
        (4, 0, FREE2, 0, 0, 0, 'up', 1, 120), (4, 0, FREE2, 0, 0, 0, 'up', 0, 300),
        (5, 0, FREE2, 1, 1, 0, None, 0, 140), (6, 0, FREE, 1, 1, 0, None, 0, 140),
        (7, 0, FREE, 1, 1, 0, None, 0, 420), (7, 0, FREE, 0, 0, 1, None, 0, 90),
        (7, 0, FREE, 0, 0, 0, None, 0, 260), (6, 0, FREE, 0, 0, 0, None, 0, 200),
    ]
    return [dict(px=wand_frame(oy, fr, HOLD[h], wob, sway=s, lift=l, blink=b, glance=gl),
                 ms=round(ms / TEMPO)) for oy, h, fr, s, l, b, gl, wob, ms in seq]


def wand_burst():
    o = WAND_OY
    out = [
        dict(px=wand_frame(o, FREE, HOLD[1]), ms=50),
        dict(px=wand_frame(o, FREE2, HOLD[2]), ms=50),
        dict(px=wand_frame(o - 1, FREE2, HOLD[2], mouth='puff'), ms=260),
    ]
    # six puffs, the ring jiggles with each bubble
    for i in range(6):
        out.append(dict(px=wand_frame(o - 1, FREE2, HOLD[2], wob=1, mouth='o', glow=2, breath=3), ms=60, ev='emit1'))
        out.append(dict(px=wand_frame(o - 1, FREE2, HOLD[2], wob=0, mouth='o', breath=1), ms=110))
    out += [
        dict(px=wand_frame(o, FREE2, HOLD[1], glance='up'), ms=60),
        dict(px=wand_frame(o, FREE, HOLD[0], glance='up'), ms=500),
        dict(px=wand_frame(o, FREE, HOLD[0]), ms=120),
    ]
    return out
