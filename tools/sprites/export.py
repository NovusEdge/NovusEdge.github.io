"""Writes the site's sprite JSON. Run each generator's build.py first."""
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', '..', 'src', 'assets', 'sprites')

def load(path):
    with open(os.path.join(ROOT, path)) as f:
        return json.load(f)


def write(name, data):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), 'w') as f:
        json.dump(data, f, separators=(',', ':'))
        f.write('\n')


def me():
    sys.path.insert(0, os.path.join(ROOT, 'me'))
    from lib import LAYERS  # noqa: E402
    import desk  # noqa: E402
    s = load('me/me.json')
    palette = {**s['palette'], **s['props']}
    layers = LAYERS['sweater']

    def flatten(fr):
        rows = [list(r) for r in fr['px']]
        for name in layers:
            for y, r in enumerate(fr.get('layers', {}).get(name, [])):
                for x, ch in enumerate(r):
                    if ch != '.':
                        rows[y][x] = ch
        return [''.join(r) for r in rows]

    anims = {}
    for name, clip in s['animations'].items():
        out = {k: v for k, v in clip.items() if k != 'frames'}
        out['frames'] = []
        for i, fr in enumerate(clip['frames']):
            f = {'ms': fr['ms'], 'px': flatten(fr)}
            if name == 'desk' and desk.DESK[i][0]['beat'] == 'type':
                f['typing'] = True
            out['frames'].append(f)
        if name == 'walk':
            out['travel'] = 1
        anims[name] = out
    return {'w': s['w'], 'h': s['h'], 'palette': palette, 'animations': anims}


def footer():
    """Pixel-me levitating under the footer's @, and the contact bubbles. The drawing
    code is the approved mockup's, used as is."""
    sys.path.insert(0, os.path.join(ROOT, 'footer'))
    import concepts  # noqa: E402
    import bubbles2  # noqa: E402
    from art import PAL  # noqa: E402

    def frames(seq):
        return [{k: f[k] for k in ('ms', 'px', 'g', 'ev') if k in f} for f in seq]

    me = {
        'w': 48, 'h': 66, 'palette': PAL,
        # where the CSS glyph's centre sits, in sprite px
        'anchor': [concepts.LEV_GLYPH[0], concepts.LEV_GLYPH[1] + concepts.LEV_OY],
        'animations': {
            'levitate': {'loop': True, 'frames': frames(concepts.lev_idle())},
            'levitate_burst': {'loop': False, 'frames': frames(concepts.lev_burst())},
        },
    }
    held = ('idle', 'focus', 'recede')
    bubble = {
        'w': bubbles2.BW, 'h': bubbles2.BH, 'palette': PAL,
        'animations': {k: {'loop': k in held, 'frames': frames(v)} for k, v in bubbles2.clips().items()},
    }
    return me, bubble


if __name__ == '__main__':
    write('me.json', me())
    write('stoat.json', load('stoat/stoat.json'))
    fm, fb = footer()
    write('footer.json', fm)
    write('bubble.json', fb)
    print('wrote', OUT)
