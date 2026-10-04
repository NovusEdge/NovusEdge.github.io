"""Startle: a flinch (head ducked a row, tail jerking up, fur rising), a hop back three
pixels into a bristling hold with the mouth open in a hiss, then it calms (mouth shut,
spikes down, fur down), hops forward onto its own footprint and lowers the tail,
ending on sit frame 0. Beats and timing follow the cat's approved startle."""
from stoat import runs, compose
from rest import SIT_FAR, SIT_BODY, SIT_NEAR, SIT_HEAD, head, tail, sit, puff, shift

# (tail, fur, dx, dy, beat, ms). fur: 0 flat, 1 puffed, 2 puffed with spikes.
# beat: 'flinch' ducks the head a row, 'hiss' opens the mouth.
SEQ = [
    ('rest', 0, 0, 0, None, 60),
    ('half', 1, 0, 0, 'flinch', 80),
    ('raised', 2, -1, -1, None, 45),     # hop back
    ('raised', 2, -2, -2, None, 45),
    ('raised', 2, -3, -1, None, 45),
    ('raised', 2, -3, 0, None, 50),      # land
    ('raised', 2, -3, 0, 'hiss', 420),
    ('raised', 2, -3, 0, None, 220),
    ('raised', 1, -3, 0, None, 160),     # spikes down
    ('raised', 0, -2, -1, None, 50),     # fur down, hop forward home
    ('raised', 0, -1, -1, None, 50),
    ('raised', 0, 0, 0, None, 110),
    ('half', 0, 0, 0, None, 80),         # tail comes down
    ('rest', 0, 0, 0, None, 300),
]


def raw(f):
    tip, fur, dx, dy, beat, _ = SEQ[f]
    if beat is None:
        g = sit('open', tip)
    else:
        hx, hy = SIT_HEAD
        hy += beat == 'flinch'
        px = [runs(SIT_FAR), tail(tip), runs(SIT_BODY), runs(SIT_NEAR), head(hx, hy),
              runs(f'{hy + 4}: 21 LBB')]
        if beat == 'hiss':
            # Jaw dropped a pixel, pink mouth open under the muzzle, as in wake's yawn.
            px.append(runs(f'{hy + 4}: {hx + 3} OIIII\n{hy + 5}: {hx + 1} WWWWW'))
        g = compose(*px)
    if fur:
        puff(g, spikes=fur == 2)
    return shift(g, dx, dy) if dx or dy else g


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
