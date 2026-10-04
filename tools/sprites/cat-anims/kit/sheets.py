"""python3 sheets.py [clip ...]  -> cat-anims/sheets/<clip>.png and <clip>-vs-sit.png.
python3 sheets.py --zoom clip coat scale out.png  -> one coat, every frame, for drawing."""
import importlib
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catkit import lib, PALETTES, SIT, W, H, check  # noqa: E402

ANIMS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ANIMS, 'sheets')
CLIPS = ['run', 'sit_down', 'loaf', 'sleep', 'wake', 'groom', 'look']
LOOK = ['left', 'center', 'right', 'up']
BG = lib.BG
DIM, HI = (130, 130, 145), (220, 220, 228)


def font(sz):
    p = '/usr/share/fonts/TTF/DejaVuSansMono.ttf'
    return ImageFont.truetype(p, sz) if os.path.exists(p) else ImageFont.load_default()


def load(name):
    sys.path.insert(0, ANIMS)
    return check(importlib.import_module(name).CLIP, name)


def contact(name, clip, s=6, coats=None, path=None):
    fs = clip['frames']
    coats = coats or list(PALETTES)
    gap, lab = 10, 36
    im = Image.new('RGB', (gap + len(fs) * (W * s + gap), lab + len(coats) * (H * s + gap) + gap), BG)
    d = ImageDraw.Draw(im)
    ft = font(14)
    for i, f in enumerate(fs):
        x = gap + i * (W * s + gap)
        tag = LOOK[i] if name == 'look' else ''
        d.text((x, 4), f'{i + 1:02d} {tag}', fill=HI, font=ft)
        d.text((x, 20), f"{f['ms']} ms", fill=DIM, font=ft)
        for r, coat in enumerate(coats):
            im.paste(lib.render(f['px'], PALETTES[coat], s), (x, lab + r * (H * s + gap)))
    im.save(path or os.path.join(OUT, f'{name}.png'))


def vs_sit(name, clip, s=6):
    fs = clip['frames']
    mid = fs[len(fs) // 2]['px']
    gap, lab = 10, 24
    coats = list(PALETTES)
    im = Image.new('RGB', (gap + 2 * (W * s + gap), lab + len(coats) * (H * s + gap) + gap), BG)
    d = ImageDraw.Draw(im)
    ft = font(14)
    d.text((gap, 4), 'idle 01 (approved sit)', fill=HI, font=ft)
    d.text((gap + W * s + gap, 4), f'{name} {len(fs) // 2 + 1:02d}', fill=HI, font=ft)
    for r, coat in enumerate(coats):
        y = lab + r * (H * s + gap)
        im.paste(lib.render(SIT, PALETTES[coat], s), (gap, y))
        im.paste(lib.render(mid, PALETTES[coat], s), (gap + W * s + gap, y))
        # baseline guide on the paw row
        for x0 in (gap, gap + W * s + gap):
            d.line([(x0, y + 30 * s), (x0 + W * s - 1, y + 30 * s)], fill=(60, 60, 80))
    im.save(os.path.join(OUT, f'{name}-vs-sit.png'))


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--zoom':
        name, coat, s, path = a[1], a[2], int(a[3]), a[4]
        contact(name, load(name), s, [coat], path)
    else:
        os.makedirs(OUT, exist_ok=True)
        for name in a or CLIPS:
            clip = load(name)
            contact(name, clip)
            vs_sit(name, clip)
            print(name, len(clip['frames']), 'frames', sum(f['ms'] for f in clip['frames']), 'ms',
                  'loop' if clip['loop'] else 'once')
