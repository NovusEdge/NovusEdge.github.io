"""view.py out.png scale  -- reads frames via module:function, renders 3 outfits + 1x/2x."""
from PIL import Image
from lib import render, palette, BG


def show(frames, out, scale=8, outfits=('coat', 'sweater', 'oldmoney'), skin='light', layers=None, gap=2):
    """frames: list of row-lists, or callables(outfit)->rows."""
    fw, fh = None, None
    tiles = []
    for o in outfits:
        row = []
        for f in frames:
            rows = f(o) if callable(f) else f
            row.append(rows)
        tiles.append((o, row))
    fh, fw = len(tiles[0][1][0]), len(tiles[0][1][0][0])
    n = len(frames)
    W = n * (fw + gap) * scale + (fw * 3 + 20) + 10
    H = len(outfits) * (fh + gap) * scale
    im = Image.new('RGB', (W, H), BG)
    for j, (o, row) in enumerate(tiles):
        pal = palette(o, skin)
        for i, rows in enumerate(row):
            im.paste(render(rows, pal, scale), (i * (fw + gap) * scale, j * (fh + gap) * scale))
        x0 = n * (fw + gap) * scale + 5
        im.paste(render(row[0], pal, 1), (x0, j * (fh + gap) * scale))
        im.paste(render(row[0], pal, 2), (x0 + fw + 8, j * (fh + gap) * scale))
    im.save(out)
