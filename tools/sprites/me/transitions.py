"""Pixel-me getting up from the desk and sitting back down.

Every pose below is placed by hand in desk pixels (uncropped, FLOOR = 59).
stand_up ends on desk_empty frame 0 with walk frame 0 stamped at STAND_AT, the
exact picture the site shows when it swaps to the separate walking sprite.
sit_down starts on the mirrored walk frame 0 (the walker flips with scaleX(-1)
when it comes home) and ends on desk frame 0."""
from lib import Grid
from rig import capsule, shade, paint
import desk as D
import front
import walk
from walk import HEAD, TORSO, FOOT, hair_tail, separate

STAND_AT = [3, 5]                     # walk sprite top-left in exported desk pixels
SX, SY = STAND_AT[0], STAND_AT[1] + D.CROP
G = D.FLOOR - 2                        # ankle row of a planted foot


def empty_scene(steam=0, cursor=True):
    g = Grid(D.W, D.H + D.CROP)
    D.chair(g)
    D.desk_back(g)
    D.desk_top(g)
    D.laptop(g, 0 if cursor else 1)
    D.mug(g, steam, D.MUG_AT)
    D.lamp(g)
    D.desk_front(g)
    for x in range(12, D.DESK_END + 1):
        if g.get(x, D.FLOOR + 1) == '.':
            g.set(x, D.FLOOR + 1, 's')
    g.outline()
    return g


def crop(g):
    return g.rows()[D.CROP:D.CROP + D.H]


def lean_rows(rows, lean, rigid):
    """Shear a stamp: row 0 moves `lean` px, row `rigid` and below stay put."""
    rows = rows.strip('\n').split('\n')
    out = []
    for j, r in enumerate(rows):
        t = max(0, rigid - j) / rigid
        s = int(abs(lean) * t + 0.5) * (1 if lean >= 0 else -1)
        out.append((s, r))
    return out


def leg(g_cells, hip, knee, ankle, kind, near, seated):
    if seated:
        cells = capsule(hip, knee, 2.3, 2.1) | capsule(knee, ankle, 2.0, 1.8)
        cm = (shade(cells, 'P', 'R', 'Q', light_side=(0, -1), dark_side=(0, 1)) if near
              else shade(cells, 'Q', None, 'X'))
    else:
        cells = capsule(hip, knee, 2.3, 2.0) | capsule(knee, ankle, 2.0, 1.8)
        cm = shade(cells, 'P', 'R', 'Q') if near else shade(cells, 'Q', None, 'X')
    foot = {}
    if kind:
        rows, (ax, ay) = FOOT[kind]
        for j, r in enumerate(rows.split('\n')):
            for i, ch in enumerate(r):
                if ch != '.':
                    foot[(round(ankle[0]) - ax + i - 1, round(ankle[1]) + 1 - ay + j)] = ch if near else 'F'
    return cm, foot


HANG = 'hang'


def arm(g, sh, el, wr, hand, near):
    cells = capsule(sh, el, 2.0, 1.8) | capsule(el, wr, 1.8, 1.6 if hand == HANG else 1.5)
    cm = shade(cells, 'T', 'V', 'U') if near else shade(cells, 'U', None, 'W')
    hc = {}
    if hand == HANG:
        # same 2x2-ish fist the walk cycle draws past the cuff
        for c in capsule(wr, (wr[0] + 0.3, wr[1] + 1.8), 1.2):
            if c not in cells:
                hc[c] = 'S' if near else 'Z'
    else:
        for j, r in enumerate(D.HANDS[hand]):
            for i, ch in enumerate(r):
                if ch != '.':
                    hc[(round(wr[0]) + i, round(wr[1]) + j - 1)] = ch if near else 'Z'
    if near:
        separate(g, set(cm) | set(hc))
    paint(g, cm)
    paint(g, hc)


def person(g, P, layers, before_desk=None):
    """Draws pixel-me into a desk-sized grid. P holds hand-placed joints."""
    hx, hy = P['hip']
    lean = P.get('lean', 0)
    seated = P.get('seated', False)
    sh = (hx + lean, hy - 10)
    far_sh = (sh[0] + 1, sh[1] - 1) if seated else sh
    if not P.get('far_arm_front'):
        arm(g, far_sh, *P['far_arm'], False)
    fk, fa, fkind = P['far_leg']
    nk, na, nkind = P['near_leg']
    fhip = (hx, hy)
    if seated:
        # desk.legs() sets the far leg 1px back and half a pixel up
        fhip, fk, fa = (hx - 1, hy - 0.5), (fk[0] - 1, fk[1] - 0.5), (fa[0] - 1, fa[1])
    far, ffoot = leg(None, fhip, fk, fa, fkind, False, seated)
    near, nfoot = leg(None, (hx, hy), nk, na, nkind, True, seated)
    paint(g, far)
    paint(g, ffoot)
    paint(g, near)
    for (x, y) in near:
        for d in (-1, 1):
            if (x + d, y) in far and (x + d, y) not in near:
                g.set(x + d, y, 'X')
    paint(g, nfoot)
    tx, ty = round(hx - 4.5), round(hy - 14.5)
    for j, (s, r) in enumerate(lean_rows(TORSO, lean, 12)):
        g.stamp([r], tx + s, ty + j)
    head_x, head_y = round(hx - 8.5) + lean, round(hy - 28.5) + P.get('duck', 0)
    hair_tail(g, P.get('hair', 4), 0, top=head_y + 15, x0=head_x + P.get('tail_dx', 0), back=head_x + 4)
    if before_desk:
        before_desk(g)
    if P.get('far_arm_front'):
        arm(g, far_sh, *P['far_arm'], False)
    g.stamp(HEAD, head_x, head_y)
    if P.get('blink'):
        g.set(head_x + 11, head_y + 7, 'Z')
    if 'collar' in layers:
        g.stamp("CC", head_x + 11, head_y + 15)
    return g, P['near_arm'], sh


def seated_frame(P, layers, steam, cursor, rim=True):
    """Whole-scene frame like desk.scene(): person tangled with chair and desk."""
    g = Grid(D.W, D.H + D.CROP)
    D.chair(g)
    D.desk_back(g)
    _, near_arm, sh = person(g, P, layers, before_desk=lambda g: D.desk_top(g))
    D.laptop(g, 0 if cursor else 1)
    arm(g, sh, *near_arm, True)
    D.mug(g, steam, D.MUG_AT)
    if rim:
        D.screen_rim(g, 0)
    D.lamp(g)
    D.desk_front(g)
    for x in range(12, D.DESK_END + 1):
        if g.get(x, D.FLOOR + 1) == '.':
            g.set(x, D.FLOOR + 1, 's')
    g.outline()
    return crop(g)


def stand_sprite(P, layers):
    """Standing pixel-me alone in walk space (32x52), outlined on its own like the walker."""
    g = Grid(D.W, D.H + D.CROP)
    _, near_arm, sh = person(g, P, layers)
    arm(g, sh, *near_arm, True)
    s = Grid(walk.W, walk.H)
    for y in range(walk.H):
        for x in range(walk.W):
            s.set(x, y, g.get(SX + x, SY + y))
    hx = P['hip'][0] - SX
    for x in range(round(hx - 6.5), round(hx + 8.5) + 1):
        s.set(x, walk.GROUND + 1, 's')
    s.outline()
    return s.rows()


def mirror(rows):
    return [r[::-1] for r in rows]


def over_empty(sprite_rows, steam, cursor):
    e = empty_scene(steam, cursor)
    rows = crop(e)
    g = Grid(D.W, D.H)
    g.c = [list(r) for r in rows]
    g.stamp(sprite_rows, STAND_AT[0], STAND_AT[1])
    return g.rows()


def walk0(layers):
    return walk.frame(0, layers).rows()


def front_sprite(layers):
    return front.figure(layers).rows()


# Hand-placed poses. hip/knee/ankle/elbow/wrist in uncropped desk pixels.
# Seated hip is (24.5, 48.5); standing hip is walk's (16.5, 30.5) + STAND_AT.
SEAT_HIP = (24.5, 48.5)
STAND_HIP = (16.5 + SX, 30.5 + SY)     # (19.5, 42.5)

POSES = {
    # hands slide off the keys to grip the desk edge
    'grip': dict(seated=True, hip=SEAT_HIP, lean=0, far_arm_front=True,
                 far_arm=((28.5, 43), (31.5, 43), 'type'),
                 near_arm=((27, 44), (30, 43.5), 'type'),
                 far_leg=((32.5, 48.5), (32.5, G), 'flat'),
                 near_leg=((32.5, 48.5), (32.5, G), 'flat')),
    # push off: torso rocks back, feet draw in under the seat edge
    'push': dict(seated=True, hip=SEAT_HIP, lean=-1, far_arm_front=True,
                 far_arm=((28, 42), (31.5, 43), 'type'),
                 near_arm=((27, 42.5), (30.5, 43.5), 'type'),
                 far_leg=((32, 48.5), (29.5, G), 'flat'),
                 near_leg=((32, 48.5), (29.5, G), 'flat')),
    # weight forward over the feet
    'tip': dict(seated=True, hip=(23.5, 48.5), lean=2, duck=1, far_arm_front=True, hair=6,
                far_arm=((29, 41.5), (31.5, 43), 'type'),
                near_arm=((28.5, 42), (30.5, 43.5), 'type'),
                far_leg=((31.5, 48.5), (28.5, G), 'flat'),
                near_leg=((31.5, 48.5), (28.5, G), 'flat')),
    # seat leaves the chair, arms still pressing on the desk
    'lift': dict(seated=True, hip=(22.5, 47.5), lean=3, duck=1, far_arm_front=True, hair=6,
                 far_arm=((28.5, 40.5), (31, 43), 'type'),
                 near_arm=((28, 41), (30, 43.5), 'type'),
                 far_leg=((30, 50), (28, G), 'flat'),
                 near_leg=((30, 50), (28, G), 'flat')),
    # legs straightening, hands come off the desk; he is clear of the seat now
    'rise': dict(hip=(21.5, 45.5), lean=2, hair=6,
                 far_arm=((25, 41), (27.5, 45.5), HANG),
                 near_arm=((24.5, 41.5), (26.5, 46), HANG),
                 far_leg=((27.5, 50.5), (26.5, G), 'flat'),
                 near_leg=((28, 50.5), (27.5, G), 'flat')),
    # up on the near leg, far foot lifts to step back
    'up': dict(hip=(20.5, 44.5), lean=1, hair=6,
               far_arm=((22, 40.5), (23.5, 46), HANG),
               near_arm=((21.5, 40.5), (23, 46), HANG),
               far_leg=((24, 51), (22.5, 55.5), 'flat'),
               near_leg=((23.5, 51.5), (25, G), 'flat')),
    'back1': dict(hip=(20.5, 43.5), lean=0, hair=7,
                  far_arm=((20.5, 38.5), (22, 44), HANG),
                  near_arm=((20, 38.5), (20, 44.5), HANG),
                  far_leg=((21.5, 51), (19, 55.5), 'flat'),
                  near_leg=((23, 51), (24.5, G), 'flat')),
    # far foot down behind him, near foot rolls onto its toe to follow
    'back2': dict(hip=(19.5, 42.5), lean=0, hair=2,
                  far_arm=((19.5, 38), (20.5, 43.5), HANG),
                  near_arm=((19.5, 38.5), (18.5, 44), HANG),
                  far_leg=((18, 50.5), (16.5, G), 'flat'),
                  near_leg=((22.5, 50), (23.5, G - 1), 'heel')),
    'follow': dict(hip=(19, 41.5), lean=0, hair=3,
                   far_arm=((19, 38), (19.5, 43.5), HANG),
                   near_arm=((19, 38), (19, 43.5), HANG),
                   far_leg=((17.5, 50), (16.5, G), 'flat'),
                   near_leg=((21.5, 49.5), (20.5, 55.5), 'flat')),
    # standing, feet together, arms at his sides
    'stand': dict(hip=(18.5, 42.5), lean=0, hair=4,
                  far_arm=((19, 38.5), (19.5, 44), HANG),
                  near_arm=((18.5, 38.5), (19, 44.5), HANG),
                  far_leg=((17.5, 50.5), (16.5, G), 'flat'),
                  near_leg=((19, 50.5), (19.5, G), 'flat')),
    # first step: near knee comes forward, body rises over the far leg
    'step': dict(hip=(19, 41.5), lean=0, hair=6,
                 far_arm=((20.5, 37.5), (23, 42.5), HANG),
                 near_arm=((17.5, 37.5), (16, 43), HANG),
                 far_leg=((17.5, 49.5), (16.5, G), 'flat'),
                 near_leg=((23, 48), (22.5, 55), 'flat')),
}


# The client approved these clips played at 1.5x, so the ms written below are
# the drawn timing and TEMPO scales them; the shortest motion frame lands at 33 ms.
TEMPO = 1.5


def tempo(frames):
    return [(rows, int(ms / TEMPO + 0.5)) for rows, ms in frames]


def stand_up(layers=()):
    L = tuple(l for l in layers if l != 'coat')
    S = lambda n: stand_sprite(POSES[n], L)
    return tempo([
        (seated_frame(POSES['grip'], L, 0, False), 110),
        (seated_frame(POSES['push'], L, 0, False), 70),
        (seated_frame(POSES['tip'], L, 1, False), 60),
        (seated_frame(POSES['lift'], L, 1, False, rim=False), 50),
        (over_empty(S('rise'), 1, False), 50),
        (over_empty(S('up'), 1, False), 50),
        (over_empty(S('back1'), 2, False), 50),
        (over_empty(S('back2'), 2, False), 50),
        (over_empty(S('follow'), 2, True), 50),
        (over_empty(S('stand'), 3, True), 240),
        (over_empty(S('step'), 0, True), 60),
        (over_empty(walk0(L), 0, True), 60),
    ])


def sit_down(layers=()):
    L = tuple(l for l in layers if l != 'coat')
    S = lambda n: stand_sprite(POSES[n], L)
    return tempo([
        (over_empty(mirror(walk0(L)), 0, True), 60),
        (over_empty(mirror(S('stand')), 0, True), 120),
        (over_empty(front_sprite(L), 1, True), 110),
        (over_empty(S('stand'), 1, True), 140),
        (over_empty(S('follow'), 1, True), 50),
        (over_empty(S('back2'), 2, False), 50),
        (over_empty(S('back1'), 2, False), 50),
        (over_empty(S('up'), 2, False), 60),
        (over_empty(S('rise'), 3, False), 60),
        (seated_frame(POSES['lift'], L, 3, False, rim=False), 60),
        (seated_frame(POSES['tip'], L, 0, False), 80),
        (seated_frame(POSES['push'], L, 0, False), 90),
        (seated_frame(POSES['grip'], L, 0, False), 120),
        (D.desk(L)[0][0], D.DESK[0][1]),
    ])


def desk_empty(layers=()):
    return tempo([(crop(empty_scene(i, i % 2 == 0)), 280) for i in range(4)])
