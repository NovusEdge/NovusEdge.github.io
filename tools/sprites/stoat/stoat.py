"""Stoat drawing kit: palettes, hand-placed pixel runs, stamping, outline, render.

Frames are drawn on a 32x32 work canvas with the ground on row GROUND and cropped to
the top 20 rows, so anything pushed below row 19 (the periscope and peek rising from
below the page edge) is simply cut off."""

W, WORK_H, H = 32, 32, 20
GROUND = 19
BG = (15, 15, 19)

# Letter roles follow the sleek cat: L rim light, B coat, D shade, A far limbs,
# O outline, W cream, P/p near/far paws, K eye, N nose, I inner ear. T/S are the
# black tail tip and its lit edge, lifted off pure black so the tip still reads on
# the dark page. Winter is the Finnish kärppä: white, faint yellow belly, same tip.
PALETTES = {
    'summer': {'L': '#b98352', 'B': '#8c5a33', 'D': '#6b4225', 'A': '#4e2f1b', 'O': '#0c0806',
               'W': '#f2e4c0', 'P': '#7a4c2b', 'p': '#4a2c18', 'T': '#2f2725', 'S': '#54463f',
               'K': '#0b0807', 'N': '#3a2420', 'I': '#c99b78'},
    'winter': {'L': '#ffffff', 'B': '#e9e6e6', 'D': '#c3bfcd', 'A': '#a29eb3', 'O': '#100e16',
               'W': '#f3ead0', 'P': '#ddd8d6', 'p': '#a29eb3', 'T': '#2f2725', 'S': '#54463f',
               'K': '#0b0807', 'N': '#3a2a2a', 'I': '#e8c8c2'},
}
# Effect letters, the same in both coats: Z sleep z's, Q "?", R heart. They float
# free of the outline (see finish), so Z is dark enough to read on the light page.
EFFECTS = 'ZQR'
for _pal in PALETTES.values():
    _pal.update({'Z': '#7f88aa', 'Q': '#f2c94c', 'R': '#ff6b80'})


def d(s):
    """A drawing typed as rows of letters, '.' transparent."""
    rows = s.strip('\n').split('\n')
    assert len({len(r) for r in rows}) == 1, rows
    return rows


def stamp(rows, px, py, pcol=0, prow=0):
    """Place a drawing so its cell (pcol, prow) lands on sprite (px, py)."""
    return {(px - pcol + i, py - prow + j): c
            for j, r in enumerate(rows) for i, c in enumerate(r) if c != '.'}


def runs(text):
    """Hand-placed pixel runs, one sprite row per line: 'row: col letters col letters'.
    Later runs paint over earlier ones."""
    out = {}
    for line in text.strip().split('\n'):
        row, rest = line.split(':')
        toks = rest.split()
        for col, s in zip(toks[::2], toks[1::2]):
            for i, c in enumerate(s):
                out[(int(col) + i, int(row))] = c
    return out


def compose(*layers):
    """Paint layers in order onto a blank work canvas."""
    g = [['.'] * W for _ in range(WORK_H)]
    for px in layers:
        for (x, y), c in px.items():
            if 0 <= x < W and 0 <= y < WORK_H:
                g[y][x] = c
    return g


def finish(g):
    """1px O outline on empty pixels touching fill (4-neighbour), then crop to H rows.
    Outlining before the crop means a body cut by the page edge stays open there.
    Effect letters get no outline: a 3px z filled in with black stops reading as a z."""
    add = [(x, y) for y in range(WORK_H) for x in range(W) if g[y][x] == '.' and any(
        0 <= x + dx < W and 0 <= y + dy < WORK_H and g[y + dy][x + dx] not in '.O' + EFFECTS
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in add:
        g[y][x] = 'O'
    return [''.join(r) for r in g[:H]]


def render(px, pal, s, bg=BG):
    from PIL import Image, ImageDraw
    im = Image.new('RGB', (W * s, len(px) * s), bg)
    dr = ImageDraw.Draw(im)
    for y, r in enumerate(px):
        for x, c in enumerate(r):
            if c != '.':
                v = pal[c]
                dr.rectangle([x * s, y * s, x * s + s - 1, y * s + s - 1],
                             fill=tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)))
    return im
