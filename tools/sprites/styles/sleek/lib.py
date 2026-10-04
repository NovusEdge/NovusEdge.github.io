import os
from PIL import Image, ImageDraw

W = H = 32
OUT = os.path.dirname(os.path.abspath(__file__))
BG = (15, 15, 19)

# O is drawn darker than the page background on purpose: the silhouette comes from
# coat-vs-background contrast and rim light (L), while O only separates overlapping
# limbs. A light outline made the earlier black coat look like a sticker.
PALETTES = {
    'tuxedo': {'L': '#575470', 'B': '#373545', 'D': '#292834', 'A': '#23222c', 'O': '#0a0a0d',
               'W': '#f1ede4', 'w': '#c9c3d0', 'P': '#f1ede4', 'M': '#f1ede4', 'S': '#373545',
               'T': '#373545', 'E': '#a6d86e', 'K': '#0c0c10', 'H': '#ffffff', 'N': '#e8a0ac',
               'I': '#d98a98', 's': '#08080a'},
    'orange': {'L': '#ffbf6e', 'B': '#ec9440', 'D': '#c46a2c', 'A': '#94481e', 'O': '#2e1408',
               'W': '#fde9cc', 'w': '#e8c49a', 'P': '#fde9cc', 'M': '#fde9cc', 'S': '#c46a2c',
               'T': '#fde9cc', 'E': '#bcd85a', 'K': '#1a1006', 'H': '#ffffff', 'N': '#e8848a',
               'I': '#f0a0a0', 's': '#08080a'},
    'black':  {'L': '#635e80', 'B': '#423f55', 'D': '#312f40', 'A': '#2a2837', 'O': '#08080b',
               'W': '#423f55', 'w': '#2a2837', 'P': '#423f55', 'M': '#423f55', 'S': '#423f55',
               'T': '#423f55', 'E': '#f4cb48', 'K': '#0c0c10', 'H': '#ffffff', 'N': '#6a5a78',
               'I': '#6e5c7c', 's': '#08080a'},
    'shiny':  {'L': '#cfd4ff', 'B': '#9aa4ff', 'D': '#737bdc', 'A': '#5257b0', 'O': '#1c1638',
               'W': '#fff4fb', 'w': '#e3cdf0', 'P': '#fff4fb', 'M': '#fff4fb', 'S': '#b38bff',
               'T': '#ffd166', 'E': '#ff7ab8', 'K': '#2b2350', 'H': '#ffffff', 'N': '#ff7ab8',
               'I': '#ffb3d1', 's': '#08080a'},
}


def P(x, s):
    row = '.' * x + s
    assert len(row) <= W, (x, s, len(row))
    return row + '.' * (W - len(row))


def blank():
    return [['.'] * W for _ in range(H)]


def grid(rows):
    return [list(r) for r in rows]


def rows(g):
    return [''.join(r) for r in g]


def outline(g, keep='s'):
    """1px outline on transparent pixels that touch a filled pixel (4-neighbour)."""
    add = []
    for y in range(H):
        for x in range(W):
            if g[y][x] not in '.' + keep:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and g[ny][nx] not in '.Os':
                    add.append((x, y))
                    break
    for x, y in add:
        g[y][x] = 'O'
    return g


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def render(px, pal, s):
    im = Image.new('RGB', (W * s, H * s), BG)
    d = ImageDraw.Draw(im)
    for y, r in enumerate(px):
        for x, c in enumerate(r):
            if c != '.':
                d.rectangle([x * s, y * s, x * s + s - 1, y * s + s - 1], fill=hexrgb(pal[c]))
    return im


def strip(frames, pal, s, gap=4):
    im = Image.new('RGB', (len(frames) * (W * s + gap) + gap, H * s + 2 * gap), BG)
    for i, px in enumerate(frames):
        im.paste(render(px, pal, s), (gap + i * (W * s + gap), gap))
    return im
