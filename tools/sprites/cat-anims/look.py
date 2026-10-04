"""Four held head poses on the sleek sit, facing left: left, center, right, up.
The site indexes them in that order and never mirrors them."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit'))
from catkit import idle, check, frag, sit_with_head  # noqa: E402

CENTER = [r[:16] for r in idle.HEAD]

# Muzzle swings past the cheek, the far eye closes to a sliver, ears trail back.
LEFT = frag('''
.......L.....D..
......LI....ID..
......LIB..BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
...LBBBBBBBBBBBD
...LKBBBHKBBBDDD
...LKBBBEKBBBDDD
..NMMBBBBBBBBDD.
...MOMMBBBBBDD..
....MMMBBBDD....
''')

# Turned past front toward the tail: both eyes slide right, the muzzle sits under
# the right eye and the near cheek widens.
RIGHT = frag('''
.....L......D...
.....LI....ID...
.....LIB..BIID..
.....LIBBBBBBID.
....LBBBBBBBBBBD
....LBBBBBBBBBBD
....LBBBHKBBBHKD
....LBBBEKBBBEKD
....LBBBBBMNMBDD
.....BBBBMMOMMD.
......BBBDMMM...
''')

# Chin lifted: the head rides a row higher on a longer throat, pupils at the top
# of the eyes, and the white chin shows underneath.
UP = frag('''
......L......D..
.....LI.....ID..
.....LIB...BIID.
.....LIBBBBBBIDD
....LBBBBBBBBBBD
....LBKKBBBKKBDD
....LBEKBBBEKBDD
....LBBBBBBBBBDD
....LBBMNMBBBBDD
....LBMMOMMBBDD.
.....MMMMMMBBDD.
......MMMMBBD...
''')

POSES = [(LEFT, 3), (CENTER, 3), (RIGHT, 3), (UP, 2)]
CLIP = check({'loop': False, 'frames': [{'ms': 1000, 'px': sit_with_head(h, y)} for h, y in POSES]}, 'look')
