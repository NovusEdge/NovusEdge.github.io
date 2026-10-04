"""Mask-based parts: shapes are pixel sets, shaded by edge, layered back to front."""
from lib import W, H


def ellipse(cx, cy, rx, ry):
    return {(x, y) for y in range(H) for x in range(W)
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1}


def rect(x0, y0, x1, y1):
    return {(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1)}


def rows_mask(spans):
    """spans: {y: (x0, x1)} inclusive."""
    return {(x, y) for y, (a, b) in spans.items() for x in range(a, b + 1)}


def line(a, b):
    (x0, y0), (x1, y1) = a, b
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    return [(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)) for i in range(n + 1)]


def path(pts):
    out = []
    for a, b in zip(pts, pts[1:]):
        for p in line(a, b):
            if not out or out[-1] != p:
                out.append(p)
    return out


def shade(mask, base='B', light='L', dark='D', light_edges='tl', dark_edges='br'):
    """Letter per pixel: lit on top/left boundary, dark on bottom/right boundary."""
    dirs = {'t': (0, -1), 'l': (-1, 0), 'b': (0, 1), 'r': (1, 0)}
    out = {}
    for (x, y) in mask:
        c = base
        if dark and any((x + dirs[e][0], y + dirs[e][1]) not in mask for e in dark_edges):
            c = dark
        if light and any((x + dirs[e][0], y + dirs[e][1]) not in mask for e in light_edges):
            c = light
        out[(x, y)] = c
    return out


def paint(g, px, seam=None, under=None):
    """Paint {(x,y): letter} onto g. With seam, already-filled pixels that touch the new
    part (4-neighbour) and are not covered by it become the seam letter, so the part
    reads as in front. `under` restricts painting to empty pixels (part sits behind)."""
    if seam:
        for (x, y) in px:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (x + dx, y + dy)
                if n in px or not (0 <= n[0] < W and 0 <= n[1] < H):
                    continue
                if g[n[1]][n[0]] not in '.s':
                    g[n[1]][n[0]] = seam
    for (x, y), c in px.items():
        if 0 <= x < W and 0 <= y < H:
            if under and g[y][x] not in '.s':
                continue
            g[y][x] = c
    return g
