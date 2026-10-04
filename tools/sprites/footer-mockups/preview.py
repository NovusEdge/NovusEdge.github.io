"""Contact strips of every clip at 6x, for looking at with the Read tool."""
import sys
import concepts as C
from art import strip

clips = {
    'halo_idle': C.halo_idle, 'halo_burst': C.halo_burst,
    'lev_idle': C.lev_idle, 'lev_burst': C.lev_burst,
    'wand_idle': C.wand_idle, 'wand_burst': C.wand_burst,
}
for name in sys.argv[1:] or clips:
    fs = clips[name]()
    strip([f['px'] for f in fs], scale=int(sys.argv[2]) if False else 5, cols=8).save(f'out/{name}.png')
    print(name, len(fs), 'frames', sum(f['ms'] for f in fs), 'ms')
