from desk import desk, PROPS, STOAT_SLOT
from lib import render, palette
from PIL import Image, ImageDraw

pal = palette('sweater', 'light', PROPS)
fs = desk(['collar'])
after = render(fs[0][0], pal, 4)
d = ImageDraw.Draw(after)
x, y, w, h = STOAT_SLOT
d.rectangle([x * 4, y * 4, (x + w) * 4 - 1, (y + h) * 4 - 1], outline=(155, 212, 106))
after.save('desk-layout-4x.png')
sip = render(fs[34][0], pal, 4)
before = Image.open('_desk_before.png')
ba = Image.open('before_after.png')
W = max(before.width, ba.width, after.width + sip.width + 20) + 40
H = ba.height + before.height + after.height + 120
o = Image.new('RGB', (W, H), (15, 15, 19))
dr = ImageDraw.Draw(o)
o.paste(ba, (20, 0))
y = ba.height + 20
dr.text((20, y), 'before: desk (96x64)', fill=(200, 198, 210))
o.paste(before, (20, y + 16))
y += before.height + 30
dr.text((20, y), 'after: desk (95x52), stoatSlot outlined  |  sip beat', fill=(200, 198, 210))
o.paste(after, (20, y + 16))
o.paste(sip, (40 + after.width, y + 16))
o.save('before_after.png')
print(o.size)
