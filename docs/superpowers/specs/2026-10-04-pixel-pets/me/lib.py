from PIL import Image

BG = (15, 15, 19)

BASE = {
    'O': '#4a4560',   # outer silhouette, same family as the cat outlines
    'K': '#16141b',   # interior crease / far-side separation
    'E': '#16131a',   # eyes
    'H': '#25222c', 'G': '#17151c', 'J': '#3a3647', 'I': '#565269',  # hair/beard
    's': '#0a0a0d',   # ground shadow
}

SKINS = {
    'porcelain': {'S': '#f3cfae', 'Z': '#d9a481', 'Y': '#fde6cf', 'M': '#d98a7c'},
    'light':     {'S': '#e2ad83', 'Z': '#c08561', 'Y': '#f2c9a2', 'M': '#c87660'},
    'medium':    {'S': '#c48858', 'Z': '#9e6740', 'Y': '#d9a275', 'M': '#b0644c'},
    'brown':     {'S': '#93603d', 'Z': '#71462b', 'Y': '#ad7a53', 'M': '#8a4a38'},
    'deep':      {'S': '#644030', 'Z': '#4a2d21', 'Y': '#7f5440', 'M': '#7a4232'},
}

# T/U/V/W = top garment base/shade/light/deep, C/D = layer showing at the neck,
# P/Q/R/X = trousers, F/N = shoes, A = knit texture, B = buttons.
OUTFITS = {
    'sweater': {'T': '#6e2a35', 'U': '#521e28', 'V': '#8c3c45', 'W': '#3d151d',
                'C': '#ebe6da', 'D': '#c3bdb0', 'P': '#2f3754', 'Q': '#232a41', 'R': '#3f4868', 'X': '#1b2033',
                'F': '#4a2e20', 'N': '#6e4630', 'A': '#6e2a35', 'B': '#6e2a35'},
    'coat': {'T': '#a8835a', 'U': '#856641', 'V': '#c4a074', 'W': '#634b31',
             'C': '#2b3350', 'D': '#1e2439', 'P': '#3b3b46', 'Q': '#2b2b34', 'R': '#4d4d5a', 'X': '#212129',
             'F': '#4a2e20', 'N': '#6e4630', 'A': '#a8835a', 'B': '#3e2c1d'},
    'oldmoney': {'T': '#e4d9c0', 'U': '#c4b697', 'V': '#f4eedf', 'W': '#a39373',
                 'C': '#b5c8de', 'D': '#8ea3bd', 'P': '#2a3148', 'Q': '#1f2538', 'R': '#3a4361', 'X': '#171c2b',
                 'F': '#5a1f28', 'N': '#7c3240', 'A': '#c4b697', 'B': '#e4d9c0'},
}

LAYERS = {'coat': ['coat'], 'sweater': ['collar'], 'oldmoney': ['collar']}


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def _mix(a, b, t):
    a, b = hexrgb(a), hexrgb(b)
    return '#' + ''.join('%02x' % round(x + (y - x) * t) for x, y in zip(a, b))


# L / i = skin rim lit by the laptop screen, dim and bright flicker (desk scene only)
for _s in SKINS.values():
    _s['L'] = _mix(_s['S'], '#9fd3f2', 0.22)
    _s['i'] = _mix(_s['S'], '#9fd3f2', 0.34)



def palette(outfit='coat', skin='light', extra=None):
    p = dict(BASE)
    p.update(SKINS[skin])
    p.update(OUTFITS[outfit])
    if extra:
        p.update(extra)
    return p


class Grid:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.c = [['.'] * w for _ in range(h)]

    def stamp(self, rows, x, y, only=None, skip='.'):
        if isinstance(rows, str):
            rows = rows.strip('\n').split('\n')
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch in skip or ch == ' ':
                    continue
                if only and ch not in only:
                    continue
                X, Y = x + i, y + j
                if 0 <= X < self.w and 0 <= Y < self.h:
                    self.c[Y][X] = ch
        return self

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.c[y][x]
        return '.'

    def set(self, x, y, ch):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.c[y][x] = ch

    def outline(self, ch='O', ignore='s'):
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.c[y][x] != '.':
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = self.get(x + dx, y + dy)
                    if n != '.' and n not in ignore and n != ch:
                        add.append((x, y))
                        break
        for x, y in add:
            self.c[y][x] = ch
        return self

    def rows(self):
        return [''.join(r) for r in self.c]

    def copy(self):
        g = Grid(self.w, self.h)
        g.c = [r[:] for r in self.c]
        return g


def render(rows, pal, scale=1, bg=BG):
    h, w = len(rows), len(rows[0])
    im = Image.new('RGB', (w, h), bg)
    px = im.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.':
                px[x, y] = hexrgb(pal[ch])
    return im.resize((w * scale, h * scale), Image.NEAREST) if scale != 1 else im


def sheet(frames, pal, scale=8, cols=None, gap=2, bg=BG, layers=None):
    """frames: list of row-lists. Returns image with frames side by side."""
    cols = cols or len(frames)
    w, h = len(frames[0][0]), len(frames[0])
    rows_n = (len(frames) + cols - 1) // cols
    im = Image.new('RGB', ((w * scale + gap * scale) * cols, (h * scale + gap * scale) * rows_n), bg)
    for i, f in enumerate(frames):
        im.paste(render(f, pal, scale), ((i % cols) * (w + gap) * scale, (i // cols) * (h + gap) * scale))
    return im
