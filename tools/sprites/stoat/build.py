"""Writes stoat.json and the review sheets in sheets/."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, OUT)
import bound, periscope, peek, sit, sit_down, groom, curl, sleep, wake  # noqa: E402
from stoat import PALETTES, W, H, GROUND, BG, render, finish  # noqa: E402

CLIPS = {'bound': bound, 'periscope': periscope, 'peek': peek, 'sit': sit, 'sit_down': sit_down,
         'groom': groom, 'curl': curl, 'sleep': sleep, 'wake': wake}
LOOP = {'bound': True, 'sit': True, 'groom': True, 'curl': True, 'sleep': True}
# Playback speed per clip, as the client asked for it: every frame's ms is divided by
# the clip's tempo (half rounds up). The slow loops play faster than they were keyed
# and groom a little slower; sit_down and wake got more drawings
# instead. Clips not listed play as keyed.
TEMPO = {'sit': 1.75, 'curl': 1.75, 'sleep': 1.75, 'groom': 0.8}

# The client wants the stoat to cover ground faster without the bound cycling faster:
# the site moves it travel px per frame, so it goes 1.75 px a frame while the drawing
# keys its planted paws 1 px apart (bound.TRAVEL, which check_bound holds to). The
# paws skid forward 0.75 px a frame as a result.
BOUND_GROUND_SPEED = 1.75


def timings(name, mod):
    t = TEMPO.get(name, 1)
    return [int(ms / t + 0.5) for ms in mod.MS]
CAT = os.path.join(OUT, '..', 'walk-sleek', 'cat.json')


def frames(mod):
    return [finish(mod.raw(i)) for i in range(len(mod.FRAMES))]


def check_frame(px, where):
    assert len(px) == H and all(len(r) == W for r in px), where
    # Fill may touch the bottom row (feet, and bodies rising from below) but no other edge.
    edge = px[0] + ''.join(r[0] + r[-1] for r in px[:-1])
    assert set(edge) <= set('.O'), (where, 'fill touches canvas edge')


def check_bound(fs):
    """Planted paws (P runs on the ground row) move back TRAVEL px a frame."""
    def starts(row):
        return [x for x, c in enumerate(row) if c == 'P' and (x == 0 or row[x - 1] != 'P')]
    ground = [starts(px[GROUND]) for px in fs]
    fore = [g[-1] for g in ground[0:10]]
    hind = [g[0] for g in ground[6:15]]
    assert all(len(g) == 1 for g in ground[0:6] + ground[10:15]), ground
    assert all(a - b == bound.TRAVEL for a, b in zip(fore, fore[1:])), ground
    assert all(a - b == bound.TRAVEL for a, b in zip(hind, hind[1:])), ground
    assert all(not g for g in ground[15:]), ground


def check_rise(name, fs):
    for i in (0, -1):
        filled = sum(c not in '.O' for r in fs[i] for c in r)
        assert filled <= 12, (name, i, filled)


def check_ends(r):
    """Resting clips hand over to each other on sit frame 0."""
    s0 = r['sit'][0]
    assert r['sit_down'][0] == r['bound'][0], 'sit_down starts on the bound landing'
    assert r['wake'][0] == r['sleep'][0], 'wake starts on sleep frame 0'
    for name in ('sit_down', 'wake'):
        assert r[name][-1] == s0, (name, 'ends on sit frame 0')
    assert r['groom'][0] == s0, 'groom starts on sit frame 0'


def font(sz):
    for p in ('/usr/share/fonts/TTF/DejaVuSansMono.ttf', '/usr/share/fonts/dejavu/DejaVuSansMono.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def sheet(fs, ms, path, s=6, gap=10, lab=34):
    n = len(fs)
    ft = font(14)
    im = Image.new('RGB', (gap + n * (W * s + gap), lab + len(PALETTES) * (H * s + gap) + gap), BG)
    dr = ImageDraw.Draw(im)
    for i in range(n):
        x = gap + i * (W * s + gap)
        dr.text((x, 4), f'{i + 1:02d}', fill=(220, 220, 228), font=ft)
        dr.text((x, 19), f'{ms[i]} ms', fill=(130, 130, 145), font=ft)
        for r, pal in enumerate(PALETTES.values()):
            y = lab + r * (H * s + gap)
            im.paste(render(fs[i], pal, s), (x, y))
            # Ground line: the page edge the sprite stands on.
            dr.line([x, y + H * s, x + W * s - 1, y + H * s], fill=(60, 60, 72))
    im.save(path)


def versus(stoats, path, s=6, gap=16):
    """The cat's sitting idle next to stoat frames, all bottom-anchored to one line
    the way the site anchors them to the viewport edge."""
    with open(CAT) as f:
        cat = json.load(f)
    sit = cat['animations']['idle']['frames'][0]['px']
    pal = cat['palettes']['tuxedo']
    cw, ch = len(sit[0]), len(sit)
    width = gap + cw * s + len(stoats) * (gap + W * s) + gap
    im = Image.new('RGB', (width, ch * s + 2 * gap + 24), BG)
    cimg = Image.new('RGB', (cw * s, ch * s), BG)
    d = ImageDraw.Draw(cimg)
    for y, r in enumerate(sit):
        for x, c in enumerate(r):
            if c != '.':
                v = pal[c]
                d.rectangle([x * s, y * s, x * s + s - 1, y * s + s - 1],
                            fill=tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)))
    base = gap + ch * s
    im.paste(cimg, (gap, gap))
    dr = ImageDraw.Draw(im)
    labels = ['cat, sitting idle']
    for i, (px, coat, label) in enumerate(stoats):
        im.paste(render(px, PALETTES[coat], s), (gap + cw * s + gap + i * (gap + W * s), base - H * s))
        labels.append(label)
    dr.line([gap, base, width - gap, base], fill=(60, 60, 72))
    dr.text((gap, base + 6), '  |  '.join(labels), fill=(130, 130, 145), font=font(13))
    im.save(path)


def main():
    anims, rendered = {}, {}
    for name, mod in CLIPS.items():
        fs = frames(mod)
        for i, px in enumerate(fs):
            check_frame(px, (name, i))
        rendered[name] = fs
        clip = {'loop': LOOP.get(name, False),
                'frames': [{'ms': ms, 'px': px} for ms, px in zip(timings(name, mod), fs)]}
        if name == 'bound':
            clip['travel'] = bound.TRAVEL * BOUND_GROUND_SPEED
        anims[name] = clip
    check_bound(rendered['bound'])
    check_rise('periscope', rendered['periscope'])
    check_rise('peek', rendered['peek'])
    check_ends(rendered)
    letters = set()
    for a in anims.values():
        for fr in a['frames']:
            letters |= set(''.join(fr['px']))
    letters.discard('.')
    for coat, pal in PALETTES.items():
        assert letters <= set(pal), (coat, letters - set(pal))
        assert set(pal) == set(PALETTES['summer']), coat
    data = {'w': W, 'h': H, 'palette': PALETTES['summer'], 'palettes': PALETTES, 'animations': anims}
    with open(os.path.join(OUT, 'stoat.json'), 'w') as f:
        f.write(json.dumps(data, separators=(',', ':')))

    os.makedirs(os.path.join(OUT, 'sheets'), exist_ok=True)
    for name, mod in CLIPS.items():
        sheet(rendered[name], timings(name, mod), os.path.join(OUT, 'sheets', f'{name}.png'))
    b = rendered['bound']
    versus([(b[6], 'summer', 'bound 07 arch, summer'), (b[16], 'summer', 'bound 17 stretch, summer'),
            (b[6], 'winter', 'bound 07, winter')],
           os.path.join(OUT, 'sheets', 'stoat-vs-cat.png'))
    with open(os.path.join(OUT, 'preview.tpl.html')) as f:
        page = f.read().replace('/*SPRITE*/', json.dumps(data, separators=(',', ':')))
    with open(os.path.join(OUT, 'preview.html'), 'w') as f:
        f.write(page)
    for name, a in anims.items():
        print(name, len(a['frames']), 'frames', sum(f['ms'] for f in a['frames']), 'ms')


if __name__ == '__main__':
    main()
