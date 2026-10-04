"""Writes the site's sprite JSON. Run each generator's build.py first."""
import importlib
import json
import os
import pkgutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', '..', 'src', 'assets', 'sprites')

# Effect letters shared by every coat (z's, "?", heart, motion marks, mouth).
CAT_EFFECTS = {'U': '#e0707a', 'Z': '#aab0c8', 'Q': '#f2c94c', 'R': '#ff6b80', 'X': '#d8d8e0'}


def load(path):
    with open(os.path.join(ROOT, path)) as f:
        return json.load(f)


def write(name, data):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), 'w') as f:
        json.dump(data, f, separators=(',', ':'))
        f.write('\n')


def cat():
    s = load('walk-sleek/cat.json')
    s['palette'] = {**s['palette'], **CAT_EFFECTS}
    for coat in s['palettes'].values():
        for k, v in CAT_EFFECTS.items():
            coat.setdefault(k, v)
    anims = os.path.join(ROOT, 'cat-anims')
    sys.path.insert(0, anims)
    for mod in sorted(m.name for m in pkgutil.iter_modules([anims])):
        s['animations'][mod] = importlib.import_module(mod).CLIP
    return s


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


if __name__ == '__main__':
    write('cat.json', cat())
    write('me.json', me())
    print('wrote', OUT)
