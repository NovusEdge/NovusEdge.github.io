"""Shared drawing kit for the cat clips.

A pose is a stack of hand-typed layers in part codes, compiled to sleek letters:
  b body   h haunch   n near leg   p near paw   f far leg   q far paw
  t tail behind the body   u tail in front of it
Any other letter (W, T, O, P, K, U, Z...) is kept as typed. Layers are painted in
order into one code grid, so a later layer covers an earlier one.

This directory has no __init__.py on purpose: export.py imports every module in
cat-anims/ and reads CLIP, and pkgutil skips a plain directory."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SLEEK = os.path.join(HERE, '..', '..', 'styles', 'sleek')


WALK = os.path.join(HERE, '..', '..', 'walk-sleek')


def _load():
    # export.py imports me/lib.py as `lib` after the cat clips, so the sleek
    # modules must not stay cached under those names.
    names = ('lib', 'parts', 'idle', 'walk', 'legs')
    saved = {k: sys.modules.pop(k) for k in names if k in sys.modules}
    path = list(sys.path)
    # walk-sleek first: styles/sleek has an older walk.py of its own
    sys.path[:0] = [WALK, SLEEK]
    try:
        import lib as _lib, parts as _parts, idle as _idle, walk as _walk
    finally:
        sys.path[:] = path
        for k in names:
            sys.modules.pop(k, None)
        sys.modules.update(saved)
    return _lib, _parts, _idle, _walk


lib, parts, idle, walk = _load()
W, H = lib.W, lib.H


def _effects():
    root = os.path.join(HERE, '..', '..')
    sys.path.insert(0, root)
    try:
        import export
    finally:
        sys.path.remove(root)
    return export.CAT_EFFECTS


# Coats plus the effect letters, as export.py merges them for the site.
PALETTES = {k: {**_effects(), **v} for k, v in lib.PALETTES.items()}
blank, outline, rows = lib.blank, lib.outline, lib.rows
ellipse, rect, rows_mask, shade, paint = parts.ellipse, parts.rect, parts.rows_mask, parts.shade, parts.paint

SIT = idle.frame()                      # idle frame 0: every resting clip starts or ends here
GROUND = 29                             # paw row shared by idle and walk


# The idle's 'out' tail reaches column 31 and loses its outline on rows 21-22
# (the approved idle frames 04-06 have this too). Clips that swing the tail out
# use this one, a column further in.
TAIL_OUT = [(21, 28), (25, 28), (27, 27), (28, 25), (29, 23), (29, 20), (30, 17)]


def sit_with_head(rows_=None, y=None, tail=None, **kw):
    """The idle sit with its head swapped for a hand-drawn one and/or its tail
    drawn along `tail` (idle tail points)."""
    saved = idle.HEAD, idle.HEAD_Y
    if rows_ is not None:
        idle.HEAD = rows_
    if y is not None:
        idle.HEAD_Y = y
    if tail is not None:
        idle.TAILS['_custom'] = tail
        kw['tail_pose'] = '_custom'
    try:
        return idle.frame(**kw)
    finally:
        idle.HEAD, idle.HEAD_Y = saved
        idle.TAILS.pop('_custom', None)


def head(eye='open', twitch=False):
    """The sit head as 16-column rows starting at idle.HEAD_Y, eyes as idle.head draws them."""
    g = [list(r[:16]) for r in idle.HEAD]
    y0 = idle.HEAD_Y
    if twitch:
        g[0][6], g[0][5] = '.', 'L'
    for x, y in idle.EYES:
        y -= y0
        if eye == 'half':
            g[y][x], g[y][x + 1] = 'D', 'D'
        elif eye == 'shut':
            g[y][x], g[y][x + 1] = 'B', 'B'
            g[y + 1][x], g[y + 1][x + 1] = 'D', 'D'
    return [''.join(r) for r in g]


def frag(s):
    """A hand-typed fragment: strip the leading/trailing newline, keep '.' as clear."""
    return s.strip('\n').split('\n')


def place(code, rows_, x0, y0):
    for j, r in enumerate(rows_):
        for i, c in enumerate(r):
            x, y = x0 + i, y0 + j
            if c != '.' and 0 <= x < W and 0 <= y < H:
                code[y][x] = c


def build(layers, heads=(), shadow=(15, 13), seam='D', after=()):
    """layers: [(rows, x, y)] in part codes. heads: [(rows, x, y)] in sleek letters,
    pasted over the body before the outline. after: like heads but pasted after the
    outline (effects that must not get an outline, such as Z's)."""
    code = [['.'] * W for _ in range(H)]
    for fr in layers:
        place(code, *fr)
    head_px = set()
    for hr, hx, hy in heads:
        for j, r in enumerate(hr):
            for i, c in enumerate(r):
                if c != '.':
                    head_px.add((hx + i, hy + j))

    def m(cs):
        return {(x, y) for y in range(H) for x in range(W) if code[y][x] in cs}

    g = blank()
    if shadow:
        paint(g, {p: 's' for p in ellipse(shadow[0], 30.5, shadow[1], 1.2)})
    paint(g, {(x, y): ('w' if code[y][x] == 'q' else 'A') for (x, y) in m('fq')})
    paint(g, {p: 'B' for p in m('t')})
    body = m('bW')
    # Shade the body as if the haunch, near legs and head were part of it, so it gets
    # no rim light where they join; the seam below separates them instead.
    lit = shade(body | m('hnp') | head_px)
    paint(g, {p: lit[p] for p in body})
    paint(g, {p: 'W' for p in m('W')})
    hm = m('h')
    if hm:
        paint(g, shade(hm), seam='D')
    nm, pm = m('n'), m('p')
    if nm or pm:
        near = shade(nm) if nm else {}
        near.update({p: 'P' for p in pm})
        paint(g, near, seam=seam)
    # u: tail lying in front of the body, cut off from it by an outline seam
    paint(g, {p: 'B' for p in m('u')}, seam='O')
    lit_codes = set('bWhnpftqu.')
    paint(g, {(x, y): code[y][x] for y in range(H) for x in range(W) if code[y][x] not in lit_codes})
    for hr, hx, hy in heads:
        paint(g, {(hx + i, hy + j): c for j, r in enumerate(hr) for i, c in enumerate(r) if c != '.'})
    outline(g)
    for hr, hx, hy in after:
        paint(g, {(hx + i, hy + j): c for j, r in enumerate(hr) for i, c in enumerate(r) if c != '.'})
    return rows(g)


def grid(s, top=0):
    """A full-width hand-typed layer whose first line is canvas row `top`."""
    rs = frag(s)
    assert all(len(r) == W for r in rs), [len(r) for r in rs]
    return (rs, 0, top)


def spans(d, c, dx=0, dy=0):
    """{row: (x0, x1) or [(x0, x1), ...]} inclusive spans of code c, as a layer."""
    g = [['.'] * W for _ in range(H)]
    for y, ss in d.items():
        for a, b in ([ss] if isinstance(ss[0], int) else ss):
            for x in range(a, b + 1):
                if 0 <= x + dx < W and 0 <= y + dy < H:
                    g[y + dy][x + dx] = c
    return ([''.join(r) for r in g], 0, 0)


def lift(layer, k, dy=-1):
    """Breathing: rows above k move up by -dy, row k repeats into the gap."""
    rs, x, top = layer
    full = ['.' * W] * top + list(rs)
    full += ['.' * W] * (H - len(full))
    out = full[-dy:k + 1] + [full[k]] * (-dy) + full[k + 1:]
    return (out, x, 0)


def _mx(mask):
    return {(W - 1 - x, y) for (x, y) in mask}


def mask_layer(mask, c):
    g = [['.'] * W for _ in range(H)]
    for (x, y) in mask:
        if 0 <= x < W and 0 <= y < H:
            g[y][x] = c
    return ([''.join(r) for r in g], 0, 0)


def tail_layer(px, mirror_x=False):
    """walk.tail_px / idle-style {pos: 'B'|'T'} as a behind-the-body tail layer."""
    g = [['.'] * W for _ in range(H)]
    for (x, y), c in px.items():
        x = W - 1 - x if mirror_x else x
        if 0 <= x < W and 0 <= y < H:
            g[y][x] = 't' if c == 'B' else c
    return ([''.join(r) for r in g], 0, 0)


def tail_path(pts, thick=.75):
    """The idle's tail stroke: two pixels wide for the first part, tip in T."""
    ps = parts.path(pts)
    n = len(ps)
    px = {}
    for i, (x, y) in enumerate(ps):
        w = 2 if i < n * thick else 1
        for dx in range(w):
            for dy in range(w):
                px[(x + dx, y + dy)] = 'T' if i >= n - 3 else 'B'
    return px


def walk_leg(lib_, name, top, pivot, near):
    """A walk-sleek leg drawing mirrored to face left, at the mirrored pivot."""
    rs = [r[::-1].replace('B', 'n' if near else 'f').replace('P', 'p' if near else 'q') for r in lib_[name]]
    return (rs, (W - 1 - pivot) - 6, top)


def stand(nh='s0', nf='s0', fh='s+2', ff='s-2', tail='a', haunch=None):
    """The walk's standing body mirrored to face left, legs chosen from legs.py.
    Returns (layers, head_at) for build()."""
    legs = walk.HIND, walk.FORE
    lay = [walk_leg(walk.HIND, fh, walk.HIND_TOP, walk.HIP + walk.FAR_DX['H'], False),
           walk_leg(walk.FORE, ff, walk.FORE_TOP, walk.SHOULDER + walk.FAR_DX['F'], False),
           tail_layer(walk.tail_px(walk.TAILS[tail], 0), mirror_x=True),
           mask_layer(_mx(walk.BODY), 'b'),
           mask_layer(_mx(walk.BIB), 'W'),
           walk_leg(legs[0], nh, walk.HIND_TOP, walk.HIP, True)]
    top = 12 - (1 if nh in walk.PLANTED_MID else 0)
    hm = rows_mask({top + j: s for j, s in walk.HAUNCH[haunch or walk.HAUNCH_FOR[nh]].items()})
    lay += [mask_layer(_mx(hm), 'h'), walk_leg(legs[1], nf, walk.FORE_TOP, walk.SHOULDER, True)]
    return lay, (-2, walk.HEAD_Y)


def mirror(px):
    return [r[::-1] for r in px]


def check(clip, name):
    for i, f in enumerate(clip['frames']):
        px = f['px']
        assert len(px) == H and all(len(r) == W for r in px), (name, i)
        # The idle's 'out' tail already reaches column 31, so this only warns.
        edge = px[0] + px[-1] + ''.join(r[0] + r[-1] for r in px)
        if not set(edge) <= set('.sOZ'):
            print(f'warning: {name}[{i}] fill touches the canvas edge', file=sys.stderr)
    return clip
