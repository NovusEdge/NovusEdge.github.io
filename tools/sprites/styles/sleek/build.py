"""cat.json, preview.html, contact-sheet.png and 8x PNG frames from idle.py + walk.py."""
import json, os
from PIL import Image
from lib import W, H, PALETTES, BG, OUT, render
import idle, walk


def main():
    anims = {'idle': {'loop': True, 'frames': idle.frames()},
             'walk': {'loop': True, 'frames': walk.frames()}}
    letters = {c for a in anims.values() for f in a['frames'] for r in f['px'] for c in r} - {'.'}
    for name, pal in PALETTES.items():
        assert letters <= set(pal), (name, letters - set(pal))
    data = {'w': W, 'h': H, 'palette': PALETTES['tuxedo'], 'palettes': PALETTES, 'animations': anims}
    js = json.dumps(data, separators=(',', ':'))
    with open(os.path.join(OUT, 'cat.json'), 'w') as f:
        f.write(js)
    with open(os.path.join(OUT, 'preview.tpl.html')) as f:
        tpl = f.read()
    with open(os.path.join(OUT, 'preview.html'), 'w') as f:
        f.write(tpl.replace('__JSON__', js))

    for name, pal in PALETTES.items():
        for an, a in anims.items():
            for i, fr in enumerate(a['frames']):
                render(fr['px'], pal, 8).save(os.path.join(OUT, 'png', f'{an}-{name}-{i + 1:02d}.png'))

    # one row per (animation, coat), every frame at 4x
    s, gap = 4, 8
    cols = max(len(a['frames']) for a in anims.values())
    nrows = len(anims) * len(PALETTES)
    sheet = Image.new('RGB', (gap + cols * (W * s + gap), gap + nrows * (H * s + gap)), BG)
    r = 0
    for an, a in anims.items():
        for name, pal in PALETTES.items():
            for i, fr in enumerate(a['frames']):
                sheet.paste(render(fr['px'], pal, s), (gap + i * (W * s + gap), gap + r * (H * s + gap)))
            r += 1
    sheet.save(os.path.join(OUT, 'contact-sheet.png'))
    for an, a in anims.items():
        print(an, len(a['frames']), 'frames', sum(f['ms'] for f in a['frames']), 'ms')


if __name__ == '__main__':
    main()
