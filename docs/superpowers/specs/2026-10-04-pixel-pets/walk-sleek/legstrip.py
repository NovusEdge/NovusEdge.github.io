"""Self-check: each near leg's 12 drawings in order, one row per frame, shifted by the
travel so a planted paw should sit in the same world column all through stance."""
from PIL import Image, ImageDraw
from legs import HIND, FORE, HIND_TOP, FORE_TOP
from walk import SEQ, DIP, OFFSET, N, TRAVEL

S = 8
RH = 11   # rows shown per frame: 19..29
im = Image.new('RGB', ((13 + N + 4) * S * 2 + 40, N * (RH + 1) * S + 20), (15, 15, 19))
d = ImageDraw.Draw(im)
for col, (lib, top, leg) in enumerate(((HIND, HIND_TOP, 'NH'), (FORE, FORE_TOP, 'NF'))):
    ox = 10 + col * (13 + N + 4) * S
    for f in range(N):
        s = SEQ[(f - OFFSET[leg]) % N]
        dy = DIP.get(f, 0) if s.startswith('w') else 0
        oy = 10 + f * (RH + 1) * S
        d.rectangle([ox, oy + RH * S - 1, ox + (13 + N) * S, oy + RH * S], fill=(60, 60, 75))
        for j, r in enumerate(lib[s]):
            for i, ch in enumerate(r):
                if ch == '.':
                    continue
                x = ox + (i + f * TRAVEL) * S
                y = oy + (top - 19 + j + dy) * S
                d.rectangle([x, y, x + S - 2, y + S - 2], fill=(236, 148, 64) if ch == 'B' else (253, 233, 204))
        d.text((ox - 8 + f * TRAVEL * S, oy), f'{f + 1} {s}', fill=(150, 150, 160))
im.save('legstrip.png')
