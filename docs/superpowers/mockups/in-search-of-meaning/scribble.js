// Shared by sketch.html and head.html.

const VOICES = [
  { side: 'L', text: "You're thinking. That much is certain.", agit: 0.2 },
  { side: 'R', text: 'Thinking about what, though?', agit: 0.35 },
  { side: 'L', text: 'Doesn\'t matter. Something is doing the thinking.', agit: 0.45 },
  { side: 'R', text: 'Something. Not necessarily you.', agit: 0.65 },
  { side: 'L', text: "Then who's asking?", agit: 0.75 },
  { side: 'R', text: "Maybe nobody. Maybe it's just noise.", agit: 1.0 },
  { side: 'L', text: "Noise doesn't doubt itself.", agit: 0.55 },
  { side: 'R', text: '...fine.', agit: 0.12 },
];

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

// Random walks inside the unit circle that steer back toward the centre
// when they reach the rim, so the tangle fills an ellipse once scaled.
function makeStrokes(n = 70, pts = 90, seed = 7) {
  const r = rng(seed), strokes = [];
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.85;
    let x = Math.cos(a) * rad, y = Math.sin(a) * rad, ang = r() * Math.PI * 2;
    const turn = 0.6 + r() * 1.4, p = [];
    for (let i = 0; i < pts; i++) {
      ang += (r() - 0.5) * turn;
      if (Math.hypot(x, y) > 0.86) {
        const toC = Math.atan2(-y, -x);
        const diff = ((toC - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        ang += diff * 0.5;
      }
      x += Math.cos(ang) * 0.03; y += Math.sin(ang) * 0.03;
      p.push([x, y]);
    }
    strokes.push(p);
  }
  return strokes;
}

// frame changes a few times a second; each value gives a new jitter, which is
// what makes the lines "boil" like hand-drawn animation.
function drawScribbles(ctx, strokes, e, agit, frame, color, alpha, lw) {
  const count = Math.round(strokes.length * (0.25 + 0.75 * agit));
  const ampPx = 0.5 + agit * 2.2;
  const r = rng(frame * 977 + 13);
  ctx.save();
  ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = 0; k < count; k++) {
    const s = strokes[k], len = Math.floor(s.length * (0.4 + 0.6 * agit));
    ctx.beginPath();
    let px, py;
    for (let i = 0; i < len; i++) {
      const X = e.x + s[i][0] * e.rx + (r() - 0.5) * ampPx;
      const Y = e.y + s[i][1] * e.ry + (r() - 0.5) * ampPx;
      if (i === 0) ctx.moveTo(X, Y); else ctx.quadraticCurveTo(px, py, (px + X) / 2, (py + Y) / 2);
      px = X; py = Y;
    }
    ctx.stroke();
  }
  ctx.restore();
}

function setupVoices(stage) {
  const L = stage.querySelector('.v-left'), R = stage.querySelector('.v-right');
  const els = VOICES.map(v => {
    const p = document.createElement('p');
    p.className = 'v-line'; p.textContent = v.text;
    (v.side === 'L' ? L : R).appendChild(p);
    return p;
  });
  return q => {
    const shown = Math.max(0, Math.min(VOICES.length, Math.floor(q * (VOICES.length + 0.999))));
    els.forEach((el, i) => {
      const age = shown - 1 - i;
      el.classList.toggle('on', i < shown);
      el.style.opacity = i < shown ? (age < 2 ? 1 : Math.max(0.18, 1 - age * 0.22)) : 0;
    });
    return shown ? VOICES[shown - 1].agit : 0.15;
  };
}

// Progress 0..1 of a tall section scrolling past a sticky stage.
function sectionProgress(el) {
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
}

function inkColor() { return getComputedStyle(document.body).getPropertyValue('--ink').trim(); }

// A hand-drawn figure, head and shoulders, in a 280x380 box. Head centre (140,140).
const FIGURE_PATH = 'M140 42 C 92 40, 62 82, 64 138 C 66 196, 100 236, 142 238 C 186 238, 218 196, 216 136 C 214 80, 186 44, 140 42 Z' +
  ' M118 236 C 120 256, 118 268, 112 280 M164 236 C 162 256, 164 268, 170 280' +
  ' M112 280 C 70 288, 34 310, 22 372 M170 280 C 212 288, 248 310, 258 372';
