"""Scratch viewer: python3 look.py coat scale frames [sit] -> look.png.
frames is 'all', 'keys' or a comma list; 'sit' prepends the sleek sitting frame."""
import json, os, sys
from PIL import Image, ImageDraw
from lib import render, PALETTES, BG
import walk

coat, s, sel = sys.argv[1], int(sys.argv[2]), sys.argv[3]
idx = (list(range(walk.N)) if sel == 'all' else sorted(walk.KEYS) if sel == 'keys'
       else [int(x) for x in sel.split(',')])
fs = walk.frames()
tiles = [(f'{i} {walk.KEYS.get(i, "ib")} {" ".join(fs[i][1].values())}', fs[i][0]) for i in idx]
if 'sit' in sys.argv[4:]:
    d = json.load(open(os.path.join(os.path.dirname(walk.__file__), '..', 'styles', 'sleek', 'cat.json')))
    tiles.insert(0, ('sit', d['animations']['idle']['frames'][0]['px']))
gap = 8
im = Image.new('RGB', (gap + len(tiles) * (32 * s + gap), 32 * s + 24), BG)
dr = ImageDraw.Draw(im)
for k, (label, px) in enumerate(tiles):
    x = gap + k * (32 * s + gap)
    im.paste(render(px, PALETTES[coat], s), (x, 2))
    dr.text((x, 32 * s + 8), label, fill=(200, 200, 200))
im.save('look.png')
