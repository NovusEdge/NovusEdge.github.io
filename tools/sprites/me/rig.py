"""Limb rasteriser and shading helpers. Limbs are thick capsules, not lines:
trouser legs ~5px at the thigh, sleeves ~4px, so they keep volume when they swing."""
import math


def capsule(p0, p1, r0, r1=None):
    r1 = r0 if r1 is None else r1
    (x0, y0), (x1, y1) = p0, p1
    out = set()
    minx, maxx = int(min(x0, x1) - max(r0, r1) - 1), int(max(x0, x1) + max(r0, r1) + 2)
    miny, maxy = int(min(y0, y1) - max(r0, r1) - 1), int(max(y0, y1) + max(r0, r1) + 2)
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy or 1e-9
    for y in range(miny, maxy):
        for x in range(minx, maxx):
            cx, cy = x + 0.5, y + 0.5
            t = max(0.0, min(1.0, ((cx - x0) * dx + (cy - y0) * dy) / L2))
            px, py = x0 + t * dx, y0 + t * dy
            r = r0 + (r1 - r0) * t
            if (cx - px) ** 2 + (cy - py) ** 2 <= r * r:
                out.add((x, y))
    return out


def ik(hip, ankle, l1, l2, bend=1):
    """Knee position; bend=+1 puts the knee toward +x (forward when facing right)."""
    hx, hy = hip
    ax, ay = ankle
    dx, dy = ax - hx, ay - hy
    d = math.hypot(dx, dy)
    d = min(d, l1 + l2 - 1e-3)
    a = math.atan2(dy, dx)
    c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    c = max(-1, min(1, c))
    k = a - bend * math.acos(c)
    return hx + l1 * math.cos(k), hy + l1 * math.sin(k)


def polar(origin, ang_deg, length):
    """Angle 0 = straight down, positive = forward (+x)."""
    a = math.radians(ang_deg)
    return origin[0] + length * math.sin(a), origin[1] + length * math.cos(a)


def shade(cells, base, light=None, dark=None, light_side=(-1, 0), dark_side=(1, 0)):
    """Directional ramp: edge facing the light gets `light`, edge facing away gets `dark`.
    Returns {cell: char}."""
    out = {}
    for c in cells:
        x, y = c
        ch = base
        if dark and (x + dark_side[0], y + dark_side[1]) not in cells:
            ch = dark
        elif light and (x + light_side[0], y + light_side[1]) not in cells:
            ch = light
        out[c] = ch
    return out


def paint(g, cmap):
    for (x, y), ch in cmap.items():
        g.set(x, y, ch)
