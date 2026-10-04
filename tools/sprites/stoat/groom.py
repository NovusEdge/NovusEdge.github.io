"""Groom: from the sit, the near forepaw comes up to the mouth, gets licked, wipes up
over the eye and behind the ear and back down; licked again, a second wipe, then back
to the ground.
Eyes shut while washing. Frame 0 is sit frame 0."""
from stoat import runs, compose
from rest import SIT_FAR, SIT_BODY, SIT_NEAR, tail, head, sit

# The raised near foreleg, elbow at the chest, painted over the head.
ARM = {
    # Paw just off the ground, wrist folding.
    'lift': '''
15: 23 BBD
16: 24 BD
17: 25 PP
''',
    'chest': '''
14: 24 BD
13: 25 BD
12: 26 PP
''',
    'chin': '''
14: 24 BD
13: 24 BD
12: 25 BD
11: 26 PP
''',
    'mouth': '''
14: 24 BD
13: 24 BD
12: 25 BD
11: 25 BD
10: 26 BD
9: 27 PP
''',
    # Halfway up the wipe: paw over the cheek, under the eye.
    'cheek': '''
14: 24 BD
13: 24 BD
12: 25 BD
11: 25 BD
10: 25 BD
9: 26 BD
8: 26 PP
7: 26 PP
''',
    'eye': '''
14: 24 BD
13: 24 BD
12: 25 BD
11: 25 BD
10: 25 BD
9: 26 BD
8: 26 BD
7: 26 PP
6: 26 PP
''',
    # Over the brow, on its way to the ear.
    'brow': '''
14: 24 BD
13: 24 BD
12: 25 BD
11: 25 BD
10: 25 BD
9: 25 BD
8: 25 BD
7: 25 BD
6: 25 PP
5: 25 PP
''',
    'ear': '''
14: 24 BD
13: 24 BD
12: 24 BD
11: 25 BD
10: 25 BD
9: 25 BD
8: 25 BD
7: 24 BD
6: 24 PP
5: 24 PP
''',
}

# (arm, head top row, eye, ms). Every stroke goes through its in-betweens: ground,
# lift, chest, chin, mouth; mouth, cheek, eye, brow, ear and back down.
UP = [('cheek', 4), ('eye', 4), ('brow', 5)]
DOWN = [('brow', 5), ('eye', 4), ('cheek', 4)]
LICK = [('mouth', 5, 60), ('mouth', 4, 45)]


def wipe():
    return ([(a, hy, 'shut', 45) for a, hy in UP] + [('ear', 5, 'shut', 80)]
            + [(a, hy, 'shut', 45) for a, hy in DOWN])


SEQ = (
    [(None, 3, 'open', 160), ('lift', 3, 'open', 45), ('chest', 3, 'open', 45),
     ('chin', 4, 'open', 45), ('mouth', 4, 'open', 50)]
    + [(a, hy, 'shut', ms) for a, hy, ms in LICK * 2]
    + wipe()
    + [(a, hy, 'shut', ms) for a, hy, ms in LICK]
    + wipe()
    + [('mouth', 4, 'open', 45), ('chin', 4, 'open', 45), ('chest', 3, 'open', 45),
       ('lift', 3, 'open', 45)]
)


def over(arm):
    """The arm as runs plus an inner outline down its back edge and over the paw, so
    it still reads where it crosses the same-coloured head and neck."""
    px = runs(arm)
    edge = {}
    for (x, y) in px:
        for n in ((x - 1, y), (x, y - 1)):
            if n not in px:
                edge[n] = 'O'
    return {**edge, **px}


def raw(f):
    arm, hy, eye, _ = SEQ[f]
    if arm is None:
        return sit(eye)
    return compose(runs(SIT_FAR), tail(), runs(SIT_BODY), head(22, hy, eye),
                   runs(f'{hy + 4}: 21 LBB'), over(ARM[arm]))


FRAMES = SEQ
MS = [ms for *_, ms in SEQ]
