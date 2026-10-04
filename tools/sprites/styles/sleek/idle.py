"""Sitting 3/4 cat, facing left."""
from lib import P, PALETTES, blank, outline, rows, render, strip, OUT
from parts import ellipse, rect, rows_mask, path, shade, paint

HEAD = [
    P(6, 'L......D'),
    P(5, 'LI.....ID'),
    P(5, 'LIB...BIID'),
    P(5, 'LIBBBBBBIDD'),
    P(4, 'LBBBBBBBBBBD'),
    P(4, 'LBBBBBBBBBBD'),
    P(4, 'LBHKBBBHKBDD'),
    P(4, 'LBEKBBBEKBDD'),
    P(4, 'LBBMNMBBBBDD'),
    P(5, 'BMMOMMBBDD'),
    P(6, 'MMMBBDD'),
]
HEAD_Y = 3
EYES = ((6, 9), (11, 9))


def head(g, eye='open', twitch=False):
    for j, r in enumerate(HEAD):
        for x, c in enumerate(r):
            if c != '.':
                g[HEAD_Y + j][x] = c
    if twitch:
        g[3][6], g[3][5] = '.', 'L'
    for x, y in EYES:
        if eye == 'half':
            g[y][x], g[y][x + 1] = 'D', 'D'
        elif eye == 'shut':
            g[y][x], g[y][x + 1] = 'B', 'B'
            g[y + 1][x], g[y + 1][x + 1] = 'D', 'D'


def body(g):
    torso = rows_mask({12: (8, 14), 13: (8, 15), 14: (7, 16), 15: (5, 16), 16: (5, 17), 17: (4, 17),
                       18: (4, 18), 19: (4, 19), 20: (5, 20), 21: (5, 21), 22: (5, 22), 23: (5, 22),
                       24: (5, 23), 25: (5, 23), 26: (5, 23), 27: (5, 23), 28: (5, 23), 29: (5, 22)})
    paint(g, shade(torso))
    bib = rows_mask({13: (8, 10), 14: (7, 10), 15: (6, 10), 16: (6, 10), 17: (5, 10), 18: (5, 9),
                     19: (5, 9), 20: (6, 8)})
    paint(g, {p: 'W' for p in bib})
    haunch = ellipse(18, 24.5, 5.5, 5.5) & rect(0, 0, 31, 29)
    paint(g, shade(haunch), seam='D')
    paint(g, {p: 'A' for p in rect(9, 21, 10, 29)})
    paint(g, {(9, 29): 'P', (10, 29): 'P', (11, 29): 'P'})
    paint(g, shade(rect(5, 20, 7, 29), light_edges='l', dark_edges='r'))
    paint(g, {(8, y): 'O' for y in range(21, 29)})
    paint(g, {(x, y): 'P' for x in range(4, 9) for y in (28, 29) if (x, y) not in {(4, 28), (8, 28)}})
    paint(g, {p: 'P' for p in rect(13, 28, 16, 29)}, seam='O')


TAILS = {
    'curl': [(21, 28), (25, 28), (27, 27), (28, 25), (28, 22), (27, 19), (25, 18)],
    'rest': [(21, 28), (25, 28), (27, 27), (28, 25), (29, 22), (28, 19), (27, 17)],
    'mid':  [(21, 28), (25, 28), (27, 27), (28, 25), (29, 22), (29, 19), (29, 17)],
    'out':  [(21, 28), (25, 28), (27, 27), (28, 25), (29, 23), (29, 20), (30, 17)],
}


def tail(g, pts):
    ps = path(pts)
    n = len(ps)
    px = {}
    for i, (x, y) in enumerate(ps):
        w = 2 if i < n * .75 else 1
        ch = 'T' if i >= n - 3 else 'B'
        for dx in range(w):
            for dy in range(w):
                px[(x + dx, y + dy)] = ch
    paint(g, px, under=True)


def inhale(g):
    # Lift everything above the chest by one row; the chest row repeats to fill.
    k = 19
    return g[1:k + 1] + [g[k][:]] + g[k + 1:]


def frame(tail_pose='rest', breathe=False, eye='open', twitch=False):
    g = blank()
    paint(g, {p: 's' for p in ellipse(15, 30.5, 13, 1.2)})
    body(g)
    head(g, eye, twitch)
    if breathe:
        g = inhale(g)
    tail(g, TAILS[tail_pose])
    outline(g)
    return rows(g)


FRAMES = [
    (700, dict()),
    (500, dict(breathe=True)),
    (130, dict(tail_pose='mid')),
    (130, dict(tail_pose='out')),
    (450, dict(tail_pose='out', breathe=True)),
    (130, dict(tail_pose='mid')),
    (130, dict(tail_pose='rest')),
    (400, dict(tail_pose='curl')),
    (90, dict(tail_pose='curl', eye='half')),
    (380, dict(tail_pose='curl', eye='shut')),
    (90, dict(tail_pose='curl', eye='half')),
    (500, dict(tail_pose='curl', breathe=True)),
    (130, dict(tail_pose='rest')),
    (80, dict(twitch=True)),
    (120, dict()),
    (80, dict(twitch=True)),
]


def frames():
    return [{'ms': ms, 'px': frame(**kw)} for ms, kw in FRAMES]


def sheet(fs, name, s=4):
    from PIL import Image
    ims = [strip(fs, p, s) for p in PALETTES.values()]
    im = Image.new('RGB', (ims[0].width, sum(i.height for i in ims)), (15, 15, 19))
    for i, x in enumerate(ims):
        im.paste(x, (0, i * x.height))
    im.save(OUT + f'/png/{name}.png')


if __name__ == '__main__':
    fs = [f['px'] for f in frames()]
    print('\n'.join(f'{i:2d} {r}' for i, r in enumerate(fs[0])))
    sheet(fs, 'idle-sheet')
    sheet([fs[0]], 'base', 8)
