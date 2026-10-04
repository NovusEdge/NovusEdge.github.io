import json
from PIL import Image
from lib import BASE, SKINS, OUTFITS, LAYERS, render, palette, BG
import front, walk, desk, transitions, personas

TEMPO = 1.75  # slow loops play faster, the same rule as the stoat's resting clips

ALL_LAYERS = ['coat', 'collar']
DEFAULT_SKIN = 'light'

# Walk: contact poses held a touch longer than the in-betweens.
# The client approved the walk at 2x, so the drawn timing is halved (rounded half up).
WALK_MS = [int(ms / 2 + 0.5) for ms in [115, 95, 95, 100, 105, 95, 95, 100] * 2]


def diff(base, full):
    return [''.join(c if c != b else '.' for b, c in zip(br, fr)) for br, fr in zip(base, full)]


def frames(make):
    """make(layers) -> [(rows, ms, extra)]. Base = no layers; each layer stored as a diff."""
    base = make(())
    per = {L: make((L,)) for L in ALL_LAYERS}
    out = []
    for i, (rows, ms, extra) in enumerate(base):
        fr = {'ms': ms, **extra, 'px': rows}
        lay = {}
        for L in ALL_LAYERS:
            d = diff(rows, per[L][i][0])
            if any(ch != '.' for r in d for ch in r):
                lay[L] = d
        if lay:
            fr['layers'] = lay
        out.append(fr)
    return out


def build():
    idle = frames(lambda L: [(r, ms, {}) for r, ms in front.idle(L)])
    wk = frames(lambda L: [(walk.frame(i, L).rows(), WALK_MS[i], {'dx': 1}) for i in range(walk.N)])
    dk = frames(lambda L: [(r, ms, {}) for r, ms in desk.desk(L)])
    tr = {n: frames(lambda L, n=n: [(r, ms, {}) for r, ms in getattr(transitions, n)(L)])
          for n in ('desk_empty', 'stand_up', 'sit_down')}
    box = {'w': desk.W, 'h': desk.H}
    ps = {n: frames(lambda L, n=n: [(r, ms, {}) for r, ms in getattr(personas, n)(L)])
          for n in ('think', 'think_q', 'lab', 'lab_squint')}
    for n in ('think', 'lab'):
        for f in ps[n]:
            f['ms'] = int(f['ms'] / TEMPO + 0.5)
    assert ps['think_q'][0]['px'] == ps['think'][0]['px'], 'think_q must start on think frame 0'
    assert ps['think_q'][-1]['px'] == ps['think'][0]['px'], 'think_q must end on think frame 0'
    assert ps['lab_squint'][0]['px'] == ps['lab'][0]['px'], 'lab_squint must start on lab frame 0'
    assert ps['lab_squint'][-1]['px'] == ps['lab'][0]['px'], 'lab_squint must end on lab frame 0'
    think_box = {'w': personas.THINK_W, 'h': personas.THINK_H}
    lab_box = {'w': personas.LAB_W, 'h': personas.LAB_H}
    base_pal = dict(BASE)
    base_pal.update(SKINS[DEFAULT_SKIN])
    base_pal.update(OUTFITS['sweater'])
    return {
        'w': front.W, 'h': front.H,
        'palette': base_pal,
        'palettes': SKINS,
        'outfits': {o: {'palette': OUTFITS[o], 'layers': LAYERS[o]} for o in OUTFITS},
        'props': {**desk.PROPS, **personas.PROPS},
        'animations': {
            'idle': {'loop': True, 'frames': idle},
            'walk': {'loop': True, 'frames': wk},
            'desk': {'loop': True, 'w': desk.W, 'h': desk.H, 'stoatSlot': desk.STOAT_SLOT, 'frames': dk},
            'desk_empty': {'loop': True, **box, 'frames': tr['desk_empty']},
            'stand_up': {'loop': False, **box, 'standAt': transitions.STAND_AT, 'frames': tr['stand_up']},
            'sit_down': {'loop': False, **box, 'frames': tr['sit_down']},
            'think': {'loop': True, **think_box, 'frames': ps['think']},
            'think_q': {'loop': False, **think_box, 'frames': ps['think_q']},
            'lab': {'loop': True, **lab_box, 'frames': ps['lab']},
            'lab_squint': {'loop': False, **lab_box, 'frames': ps['lab_squint']},
        },
    }


def compose(fr, outfit):
    rows = [list(r) for r in fr['px']]
    for L in LAYERS[outfit]:
        for y, r in enumerate(fr.get('layers', {}).get(L, [])):
            for x, ch in enumerate(r):
                if ch != '.':
                    rows[y][x] = ch
    return [''.join(r) for r in rows]


def contact_sheet(S, path, scale=4, skin=DEFAULT_SKIN):
    gap = 2 * scale
    per_row = {'idle': 16, 'walk': 16, 'desk': 6, 'desk_empty': 6, 'stand_up': 6, 'sit_down': 6,
               'think': 8, 'think_q': 8, 'lab': 8, 'lab_squint': 8}
    groups = []
    for o in OUTFITS:
        pal = palette(o, skin, {**desk.PROPS, **personas.PROPS})
        rows = []
        for name, anim in S['animations'].items():
            fs = anim['frames']
            n = per_row[name]
            for k in range(0, len(fs), n):
                rows.append([render(compose(f, o), pal, scale) for f in fs[k:k + n]])
        groups.append(rows)
    W = max(sum(im.width + gap for im in r) for g in groups for r in g) + gap
    H = sum(sum(r[0].height + gap for r in g) + 6 * scale for g in groups) + gap
    sheet = Image.new('RGB', (W, H), BG)
    y = gap
    for g in groups:
        for r in g:
            x = gap
            for im in r:
                sheet.paste(im, (x, y))
                x += im.width + gap
            y += r[0].height + gap
        y += 6 * scale
    sheet.save(path)


if __name__ == '__main__':
    S = build()
    js = json.dumps(S, separators=(',', ':'))
    open('me.json', 'w').write(js)
    tpl = open('preview.tpl.html').read()
    open('preview.html', 'w').write(tpl.replace('/*SPRITES*/', js.replace('</', '<\\/')))
    contact_sheet(S, 'contact-sheet.png')
    for k, a in S['animations'].items():
        print(k, len(a['frames']), 'frames', sum(f['ms'] for f in a['frames']), 'ms')
