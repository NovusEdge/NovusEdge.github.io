from lib import Grid
from rig import capsule, shade, paint
from walk import HEAD, TORSO, hair_tail, separate

W, H = 99, 57
DX, DY = 8, 18                      # walk-space -> desk-space offset
CROP = 7                            # keeps 12 clear rows above the head for site effects
DESK_Y = 44
FLOOR = 59
DESK_END = 96
STOAT_SLOT =[64, DESK_Y - 20 - CROP, 32, 20]   # x, y, w, h in exported coords
MUG_AT = (31, DESK_Y - 7)           # handle faces the sitter

PROPS = {
    'w': '#5a3d2b', 'u': '#7b5639', 'v': '#3d291d',      # walnut desk
    'c': '#4a2f22', 'd': '#2f1d16',                     # chair
    'l': '#9c9caa', 'k': '#5a5a6e', 'g': '#9fd3f2',     # laptop, screen glow
    'm': '#e9e3d7', 'n': '#b7af9f', 'q': '#3b2519',     # mug, coffee
    'y': '#c9a24a', 'x': '#8a6a2b', 'z': '#fff0b3',     # brass lamp, bulb
    'j': '#9a6c45',                                     # desk top in the lamp's pool
    'a': '#7a6d6a',                                     # desk top in the screen's spill
    'h': '#2f3a4c', 't': '#3a4a62',                     # beard rim, dim / bright flicker
    'b': '#141a26',                                     # screen background
    'r': '#7fd6a4', 'o': '#e8b06a', 'p': '#a3a8ff',     # code: green, amber, violet
    'e': '#3a3948',                                     # steam
}

HANDS = {
    'type': ["SS.", "SSZ"],
    'type_up': ["SSZ", "..."],
    'chin': [".S", "SS", "SZ"],
    'grip': ["SS", "SZ"],
}


def arm(g, sh, el, wr, near, hand, hx=0, hy=0):
    cells = capsule(sh, el, 2.0, 1.8) | capsule(el, wr, 1.8, 1.5)
    cm = shade(cells, 'T', 'V', 'U') if near else shade(cells, 'U', None, 'W')
    hand_cells = {}
    rows = HANDS[hand]
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.':
                hand_cells[(round(wr[0]) + i + hx, round(wr[1]) + j + hy - 1)] = ch if near else 'Z'
    if near:
        separate(g, set(cm) | set(hand_cells))
    paint(g, cm)
    paint(g, hand_cells)


def desk_top(g):
    for x in range(30, DESK_END + 1):
        g.set(x, DESK_Y, 'a' if 37 <= x <= 53 else 'j' if 54 <= x <= 61 else 'u')
        g.set(x, DESK_Y + 1, 'w')
        g.set(x, DESK_Y + 2, 'v')


def desk_back(g):
    # the left leg sits behind the sitter's shins
    for y in range(DESK_Y + 3, FLOOR + 1):
        g.set(33, y, 'w'); g.set(34, y, 'v')


def desk_front(g):
    # drawer pedestal on the right
    for y in range(DESK_Y + 3, FLOOR + 1):
        for x in range(DESK_END - 12, DESK_END + 1):
            g.set(x, y, 'v' if x in (DESK_END - 12, DESK_END) else 'w')
    for y in (DESK_Y + 7, DESK_Y + 12):
        for x in range(DESK_END - 11, DESK_END):
            g.set(x, y, 'v')
        g.set(DESK_END - 6, y - 2, 'y')


def chair(g):
    for y in range(36, FLOOR + 1):
        g.set(17, y, 'c'); g.set(18, y, 'd')
    for y in range(37, 46):
        g.set(19, y, 'c')
    for x in range(17, 30):
        g.set(x, 51, 'c'); g.set(x, 52, 'd')
    for y in range(53, FLOOR + 1):
        g.set(28, y, 'c')


# (length, colour, indent) per code line; the screen shows a window of these.
# 13 lines = lines scrolled per desk loop, so the loop seam keeps scrolling forward.
CODE = [(3, 'p', 0), (2, 'r', 1), (3, 'r', 1), (1, 'o', 2), (2, 'r', 1), (3, 'p', 0),
        (2, 'o', 1), (3, 'r', 1), (1, 'p', 0), (2, 'r', 1), (3, 'o', 1), (2, 'p', 0), (1, 'r', 2)]
SCREEN_ROWS = 11


def laptop(g, scroll):
    for x in range(37, 50):
        g.set(x, DESK_Y - 2, 'l')
        g.set(x, DESK_Y - 1, 'k')
    # Screen leans back from the hinge and is turned a little toward the viewer,
    # so its face shows as a 6px-wide parallelogram.
    for i in range(SCREEN_ROWS):
        y = DESK_Y - 3 - i
        x0 = 48 + i // 4
        edge = i in (0, SCREEN_ROWS - 1)
        for dx in range(6):
            g.set(x0 + dx, y, 'k' if edge or dx in (0, 5) else 'b')
    # code lines, every other row, scrolling upward
    for r in range(1, SCREEN_ROWS - 1, 2):
        i = SCREEN_ROWS - 1 - r
        n, ch, ind = CODE[(r // 2 + scroll // 2) % len(CODE)]
        y = DESK_Y - 3 - i
        x0 = 48 + i // 4
        for dx in range(n):
            if 1 + ind + dx <= 4:
                g.set(x0 + 1 + ind + dx, y, ch)
    # cursor blink on the newest line while typing
    if scroll % 2 == 0:
        g.set(48 + 1 // 4 + 4, DESK_Y - 4, 'g')


SKIN, BEARD = 'SYZM', 'HGJ'


def screen_rim(g, bright):
    """1px cool rim on the screen-facing (right) edge of face, beard and hands."""
    sk, bd = ('i', 't') if bright else ('L', 'h')
    for y in range(2 + DY + 4, DESK_Y):
        for x in range(8 + DX + 3, 48):
            ch = g.get(x, y)
            if g.get(x + 1, y) not in '.lkem':
                continue
            if ch in SKIN:
                g.set(x, y, sk)
            elif ch in BEARD and y >= 2 + DY + 9:
                g.set(x, y, bd)


MUG = ["..mmmn", "..mqqn", "nnmmmn", "n.mmmn", "nnmmmn", "..mmmn", "...mn."]
MUG_TIPPED = ["...mm.", "..mmmn", ".mmmmn", "qmmmn.", "qqmn..", ".q...."]
PUFFS = [["..e", ".e.", "..e"], [".e.", "..e", ".e."], ["e..", ".e.", "..e"], [".e.", "e..", ".e."]]


def mug(g, steam, at):
    x, y = at
    g.stamp(MUG, x, y)
    g.stamp(PUFFS[steam % 4], x + 2, y - 4)


def lamp(g):
    # stands right of the screen; the shade leans in over the keyboard
    for x in range(57, 63):
        g.set(x, DESK_Y - 1, 'x')
    for x in range(58, 62):
        g.set(x, DESK_Y - 2, 'y')
    for y in range(DESK_Y - 15, DESK_Y - 2):
        g.set(60, y, 'y')
    g.set(59, DESK_Y - 16, 'y')
    g.stamp(["..yyyy", ".yyyyx", "yyyxx.", "zz...."], 54, DESK_Y - 19)


def legs(g):
    hip = (16.5 + DX, 30.5 + DY)
    knee = (hip[0] + 8, hip[1])
    ankle = (knee[0], FLOOR - 2)
    for off, near in ((-1, False), (0, True)):
        h = (hip[0] + off, hip[1] - (0 if near else 0.5))
        k = (knee[0] + off, knee[1] - (0 if near else 0.5))
        a = (ankle[0] + off, ankle[1])
        cells = capsule(h, k, 2.3, 2.1) | capsule(k, a, 2.0, 1.8)
        paint(g, shade(cells, 'P', 'R', 'Q', light_side=(0, -1), dark_side=(0, 1)) if near
              else shade(cells, 'Q', None, 'X'))
        fx = round(a[0])
        g.stamp(["NNNF..", "FFFFFF"] if near else ["FFFF..", "FFFFFF"], fx - 2, FLOOR - 1)


def seat_coat(g, sway):
    # coat skirt over the thighs, tail hanging past the seat edge
    hy = 30 + DY
    for y in range(hy - 2, hy + 3):
        for x in range(20, 32 - max(0, y - hy)):
            if g.get(x, y) in 'PQRX.':
                g.set(x, y, 'U' if y == hy + 2 else 'T')


def scene(pose, layers=()):
    g = Grid(W, H + CROP)
    chair(g)
    desk_back(g)
    legs(g)
    g.stamp(TORSO, 12 + DX, 16 + DY)
    if 'coat' in layers:
        seat_coat(g, pose.get('sway', 0))
    hair_tail(g, pose.get('hair', 4), 0, top=17 + DY, x0=8 + DX, back=12 + DX)
    desk_top(g)
    sh = (16.5 + DX, 20.5 + DY)
    # far arm
    if True:
        up = pose.get('far_up', 0)
        arm(g, (sh[0] + 1, sh[1] - 1), (sh[0] + 3, sh[1] + 5), (39.5, DESK_Y - 4 - up), False,
            'type_up' if up else 'type')
    laptop(g, pose.get('scroll', 0))
    head = g.copy()
    g.stamp(HEAD, 8 + DX, 2 + DY)
    if pose.get('blink'):
        g.set(8 + DX + 11, 2 + DY + 7, 'Z')
    if 'collar' in layers:
        g.stamp("CC", 19 + DX, 17 + DY)
    b = pose['beat']
    # The mug sits on the near side of the desk, in front of the typing arm;
    # only the reaching hand goes over it.
    on_desk = b not in ('lift', 'sip')
    if b == 'reach':
        mug(g, pose.get('steam', 0), MUG_AT)
    if b == 'type':
        up = pose.get('near_up', 0)
        arm(g, sh, (sh[0] + 2.5, sh[1] + 5.5), (37, DESK_Y - 4 - up), True, 'type_up' if up else 'type')
    elif b == 'chin':
        arm(g, sh, (sh[0] + 4, sh[1] + 4.5), (30, 2 + DY + 11 + pose.get('stroke', 0)), True, 'chin')
    elif b == 'mid':
        arm(g, sh, (sh[0] + 3, sh[1] + 5.5), (30.5, 2 + DY + 15), True, 'chin')
    elif b == 'reach':
        arm(g, sh, (sh[0] + 2, sh[1] + 5.5), (MUG_AT[0], MUG_AT[1] + 3), True, 'grip')
    elif b == 'lift':
        at = (MUG_AT[0] - 1, MUG_AT[1] - 6)
        mug(g, pose.get('steam', 0), at)
        arm(g, sh, (sh[0] + 3, sh[1] + 5), (at[0], at[1] + 3), True, 'grip')
    elif b == 'sip':
        # tipped toward the mouth: coffee side (q) rests on the lips
        mx, my = 8 + DX + 13, 2 + DY + 6
        g.stamp(MUG_TIPPED, mx, my)
        arm(g, sh, (sh[0] + 3.5, sh[1] + 4.5), (mx + 3, my + 4), True, 'grip')
    if on_desk and b != 'reach':
        mug(g, pose.get('steam', 0), MUG_AT)
    screen_rim(g, pose.get('flicker', 0))
    lamp(g)
    desk_front(g)
    for x in range(12, DESK_END + 1):
        if g.get(x, FLOOR + 1) == '.':
            g.set(x, FLOOR + 1, 's')
    g.outline()
    return g


T = 'type'
DESK = [
    (dict(beat=T, far_up=1), 130), (dict(beat=T, near_up=1), 120), (dict(beat=T, far_up=1), 110),
    (dict(beat=T, near_up=1), 140), (dict(beat=T), 110), (dict(beat=T, near_up=1, far_up=1), 130),
    (dict(beat=T), 520), (dict(beat=T, blink=1), 90),
    (dict(beat='mid'), 120), (dict(beat='chin', stroke=0), 280), (dict(beat='chin', stroke=1), 240),
    (dict(beat='chin', stroke=0), 240), (dict(beat='chin', stroke=1), 320), (dict(beat='mid'), 120),
    (dict(beat=T, far_up=1), 130), (dict(beat=T, near_up=1), 120), (dict(beat=T, far_up=1), 110),
    (dict(beat=T, near_up=1), 140), (dict(beat=T), 380),
    (dict(beat=T, far_up=1), 130), (dict(beat=T, near_up=1), 120), (dict(beat=T, far_up=1), 110),
    (dict(beat=T, near_up=1), 140), (dict(beat=T), 110), (dict(beat=T, near_up=1, far_up=1), 130),
    (dict(beat=T, blink=1), 90), (dict(beat=T), 420),
    (dict(beat=T, far_up=1), 140), (dict(beat=T, near_up=1), 130),
    (dict(beat=T, far_up=1), 120), (dict(beat=T), 360),
    (dict(beat='reach'), 160), (dict(beat='lift'), 150), (dict(beat='sip', blink=1), 380),
    (dict(beat='sip', blink=1), 520), (dict(beat='sip'), 260), (dict(beat='lift'), 150),
    (dict(beat='reach'), 180), (dict(beat=T, blink=1), 90), (dict(beat=T, far_up=1), 140),
    (dict(beat=T, near_up=1), 120),
]
scroll = 0
for i, (p, ms) in enumerate(DESK):
    # code scrolls one line per two typing frames and holds during beats
    if p['beat'] == T:
        scroll += 1
    p.setdefault('scroll', scroll)
    # the screen light flickers with the typing and settles during beats
    p.setdefault('flicker', i % 2 if p['beat'] == T else 0)
    p.setdefault('steam', i // 2)
    p.setdefault('hair', 4)


def desk(layers=()):
    return [(scene(p, layers).rows()[CROP:CROP + H], ms) for p, ms in DESK]


if __name__ == '__main__':
    from lib import render, palette
    pal = palette('coat', 'light', PROPS)
    poses = [dict(beat='type'), dict(beat='type', near_up=1), dict(beat='chin'), dict(beat='sip')]
    from PIL import Image
    ims = [render(scene(p, ['coat']).rows(), pal, 5) for p in poses]
    out = Image.new('RGB', (ims[0].width * 2 + 10, ims[0].height * 2 + 10), (15, 15, 19))
    for i, im in enumerate(ims):
        out.paste(im, ((i % 2) * (im.width + 10), (i // 2) * (im.height + 10)))
    out.save('d.png')
