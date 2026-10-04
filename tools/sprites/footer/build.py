"""Writes data.json and index.html (template with the data inlined)."""
import base64
import io
import json
import os
import subprocess
from PIL import Image
import concepts as C
from art import PAL
from bubbles import clips, BW, BH
import bubbles2
from glyphs import ICONS

LINKS = [
    ('email', 'email', 'mailto:khimanialiasgar@gmail.com'),
    ('twitter', 'twitter', 'https://twitter.com/0kaliasgar'),
    ('github', 'github', 'https://github.com/NovusEdge'),
    ('linkedin', 'linkedin', 'https://www.linkedin.com/in/aliasgarkhimani/'),
    ('hf', 'hugging face', 'https://huggingface.co/NovusEdge'),
    ('kofi', 'ko-fi', 'https://ko-fi.com/aliasgarkhimani'),
]


def bayer_png():
    """8x8 Bayer threshold map, 2 px per cell, for the SVG dither filter on the hands."""
    def b(n):
        if n == 1:
            return [[0]]
        m = b(n // 2)
        k = len(m)
        out = [[0] * n for _ in range(n)]
        for y in range(k):
            for x in range(k):
                v = 4 * m[y][x]
                out[y][x], out[y][x + k], out[y + k][x], out[y + k][x + k] = v, v + 2, v + 3, v + 1
        return out
    m = b(8)
    im = Image.new('L', (16, 16))
    for y in range(16):
        for x in range(16):
            im.putpixel((x, y), round((m[y // 2][x // 2] + 0.5) / 64 * 255))
    buf = io.BytesIO()
    im.save(buf, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def build():
    data = {
        'palette': PAL,
        'concepts': {
            'halo': dict(w=48, h=66, idle=C.halo_idle(), burst=C.halo_burst(),
                         anchor=[C.AT_X + 8, C.AT_Y + C.HALO_OY + 8]),
            'lev': dict(w=48, h=66, idle=C.lev_idle(), burst=C.lev_burst(),
                        anchor=[C.LEV_GLYPH[0], C.LEV_GLYPH[1] + C.LEV_OY]),
            'wand': dict(w=48, h=66, idle=C.wand_idle(), burst=C.wand_burst(),
                         anchor=[24, 24 + C.WAND_OY],
                         emit=[C.HOLD[2][1][0] + 5.5, C.HOLD[2][1][1] + C.WAND_OY - 1 + 5]),
        },
        'bubble': {'w': BW, 'h': BH, 'clips': {k: clips(k) for k in ICONS}},
        'bubble2': {'w': bubbles2.BW, 'h': bubbles2.BH, 'clips': bubbles2.clips()},
        'links': [dict(id=i, label=l, href=h) for i, l, h in LINKS],
        'bayer': bayer_png(),
    }
    return data


if __name__ == '__main__':
    d = build()
    js = json.dumps(d, separators=(',', ':'))
    open('data.json', 'w').write(js)
    tpl = open('index.tpl.html').read()
    # the same simple-icons paths contact-card.tsx imports
    si = json.loads(subprocess.check_output(
        ['node', '-e', "const s=require('simple-icons');console.log(JSON.stringify([s.siHuggingface.path,s.siKofi.path]))"],
        cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')))
    tpl = tpl.replace('/*HF*/', si[0]).replace('/*KOFI*/', si[1])
    open('index.html', 'w').write(tpl.replace('/*DATA*/null', js.replace('</', '<\\/')))
    for k, c in d['concepts'].items():
        print(k, 'idle', len(c['idle']), sum(f['ms'] for f in c['idle']), 'ms;',
              'burst', len(c['burst']), sum(f['ms'] for f in c['burst']), 'ms')
    print('index.html', len(open('index.html').read()) // 1024, 'KB')
