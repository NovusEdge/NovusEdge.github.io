"""Writes cat.json, preview.html, contact-sheet.png and keys.png."""
import json, os
from PIL import Image, ImageDraw, ImageFont
import walk
from walk import N, KEYS, SEQ, OFFSET, HIP, SHOULDER, FAR_DX, TRAVEL, GROUND
from legs import HIND, FORE, HIND_TOP, FORE_TOP
from lib import render, PALETTES, W, H, BG

OUT = os.path.dirname(os.path.abspath(__file__))
SLEEK = os.path.join(OUT, '..', 'styles', 'sleek', 'cat.json')
TOP = {id(HIND): HIND_TOP, id(FORE): FORE_TOP}
# Contacts hold a touch longer than the frames between them.
MS = [120 if f % 3 == 0 else 105 for f in range(N)]


def check_planting():
    """Each planted paw must move back exactly TRAVEL px per frame in sprite space."""
    def ground_x(lib, name):
        rows = lib[name]
        if TOP[id(lib)] + len(rows) - 1 != GROUND:
            return None
        return rows[-1].index('P')
    for lib in (HIND, FORE):
        xs = [ground_x(lib, s) for s in SEQ]
        stance = [x for x in xs if x is not None]
        assert len(stance) == 7, xs
        assert all(a - b == TRAVEL for a, b in zip(stance, stance[1:])), xs
    # Swing drawings ride the body dip and must still clear the ground.
    for f in range(N):
        for leg, off in OFFSET.items():
            s = SEQ[(f - off) % N]
            if s.startswith('w'):
                lib = HIND if leg[1] == 'H' else FORE
                assert TOP[id(lib)] + len(lib[s]) - 1 + walk.DIP.get(f, 0) < GROUND, (f, leg, s)


def check_frame(px, i):
    assert len(px) == H and all(len(r) == W for r in px), i
    edge = px[0] + px[-1] + ''.join(r[0] + r[-1] for r in px)
    assert set(edge) <= set('.sO'), (i, 'fill touches canvas edge')


def font(sz):
    for p in ('/usr/share/fonts/TTF/DejaVuSansMono.ttf', '/usr/share/fonts/dejavu/DejaVuSansMono.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def main():
    check_planting()
    fs = walk.frames()
    for i, (px, _) in enumerate(fs):
        check_frame(px, i)
    with open(SLEEK) as f:
        sleek = json.load(f)
    frames = [{'ms': MS[i], 'px': px} for i, (px, _) in enumerate(fs)]
    anims = {'idle': sleek['animations']['idle'],
             'walk': {'loop': True, 'travel': TRAVEL, 'frames': frames}}
    letters = set()
    for a in anims.values():
        letters |= set(''.join(''.join(fr['px']) for fr in a['frames'])) - {'.'}
    for coat, pal in PALETTES.items():
        assert letters <= set(pal), (coat, letters - set(pal))
    data = {'w': W, 'h': H, 'palette': PALETTES['tuxedo'], 'palettes': PALETTES, 'animations': anims}
    js = json.dumps(data, separators=(',', ':'))
    with open(os.path.join(OUT, 'cat.json'), 'w') as f:
        f.write(js)
    with open(os.path.join(OUT, 'preview.tpl.html')) as f:
        html = f.read().replace('__JSON__', js)
    with open(os.path.join(OUT, 'preview.html'), 'w') as f:
        f.write(html)

    # Contact sheet: one row per coat, every walk frame at 6x, numbered, keys labelled.
    s, gap, lab = 6, 10, 34
    ft = font(14)
    sheet = Image.new('RGB', (gap + N * (W * s + gap), lab + len(PALETTES) * (H * s + gap) + gap), BG)
    d = ImageDraw.Draw(sheet)
    for i in range(N):
        x = gap + i * (W * s + gap)
        d.text((x, 4), f'{i + 1:02d} {KEYS.get(i, "in-between")}', fill=(220, 220, 228) if i in KEYS else (130, 130, 145), font=ft)
        d.text((x, 19), f'{MS[i]} ms', fill=(130, 130, 145), font=ft)
        for r, (coat, pal) in enumerate(PALETTES.items()):
            sheet.paste(render(fs[i][0], pal, s), (x, lab + r * (H * s + gap)))
    sheet.save(os.path.join(OUT, 'contact-sheet.png'))

    # Keys at 10x for orange, with which drawing each leg shows.
    s = 10
    ft2 = font(16)
    ks = sorted(KEYS)
    im = Image.new('RGB', (gap + 4 * (W * s + gap), 2 * (H * s + 60) + gap), BG)
    d = ImageDraw.Draw(im)
    for k, i in enumerate(ks):
        x, y = gap + (k % 4) * (W * s + gap), gap + (k // 4) * (H * s + 60)
        side = 'near' if i < 6 else 'far'
        d.text((x, y), f'frame {i + 1:02d}: {KEYS[i]} ({side} hind)', fill=(220, 220, 228), font=ft2)
        nm = fs[i][1]
        d.text((x, y + 20), f"NH {nm['NH']}  NF {nm['NF']}  FH {nm['FH']}  FF {nm['FF']}", fill=(130, 130, 145), font=ft)
        im.paste(render(fs[i][0], PALETTES['orange'], s), (x, y + 44))
    im.save(os.path.join(OUT, 'keys.png'))
    print('walk', N, 'frames', sum(MS), 'ms loop, travel', TRAVEL, 'px/frame')


if __name__ == '__main__':
    main()
