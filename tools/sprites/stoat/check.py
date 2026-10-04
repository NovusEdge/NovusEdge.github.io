"""Checks stoat.json the way the site reads it: every frame 20 rows of 32 characters,
every letter in the base palette and in both coats."""
import json, os

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stoat.json')) as f:
    s = json.load(f)
bad = []
for name, clip in s['animations'].items():
    for i, fr in enumerate(clip['frames']):
        px = fr['px']
        if len(px) != 20 or any(len(r) != 32 for r in px):
            bad.append(f'{name} {i}: {len(px)} rows, widths {sorted({len(r) for r in px})}')
        letters = set(''.join(px)) - {'.'}
        for where, pal in [('base', s['palette'])] + [(c, p) for c, p in s['palettes'].items()]:
            if letters - set(pal):
                bad.append(f'{name} {i}: {sorted(letters - set(pal))} missing from {where}')
assert set(s['palettes']) == {'summer', 'winter'}, sorted(s['palettes'])
print('\n'.join(bad) or f"ok: {len(s['animations'])} clips, "
      f"{sum(len(c['frames']) for c in s['animations'].values())} frames")
raise SystemExit(1 if bad else 0)
