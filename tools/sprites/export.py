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


if __name__ == '__main__':
    write('me.json', me())
    write('stoat.json', load('stoat/stoat.json'))
    print('wrote', OUT)
