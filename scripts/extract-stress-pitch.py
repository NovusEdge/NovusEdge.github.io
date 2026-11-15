# Measures pitch and per-word timing in the clips from generate-stress-clips.mjs
# and writes public/assets/blog/didnt-say/stage.json, which the post's figures
# draw from: the list plays every reading, the looping figure only loop=true.
# Run: uv run --no-project --with praat-parselmouth python scripts/extract-stress-pitch.py
import json
import math
import subprocess
import tempfile
from pathlib import Path

import parselmouth

DIR = Path("public/assets/blog/didnt-say")
WORDS = ["I", "didn't", "say", "she", "stole", "the", "money"]
# (stressed word, file, in the looping figure). The author cut "didn't" and
# "the" from the loop; the list at the top still plays them.
STAGE = [
    ("I", "i", True), ("didn't", "didnt", False), ("say", "say", True), ("she", "she", True),
    ("stole", "stole", True), ("the", "the", False), ("money", "money", True), (None, "flat", True),
]


def word_spans(align):
    chars, starts, ends = align["characters"], align["character_start_times_seconds"], align["character_end_times_seconds"]
    text = "".join(chars).lower()
    spans, pos = [], 0
    for word in WORDS:
        i = text.index(word.lower(), pos)
        spans.append((starts[i], ends[i + len(word) - 1]))
        pos = i + len(word)
    return spans


def measure(name):
    align = json.loads((DIR / f"{name}.align.json").read_text())["alignment"]
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", DIR / f"{name}.mp3", "-ac", "1", wav.name], check=True)
        snd = parselmouth.Sound(wav.name)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=75, pitch_ceiling=500)
    loud = snd.to_intensity(time_step=0.01)
    f0 = [(round(t, 3), round(v, 1)) for t, v in zip(pitch.xs(), pitch.selected_array["frequency"]) if v > 0]
    words = []
    for word, (a, b) in zip(WORDS, word_spans(align)):
        seg = [v for t, v in f0 if a <= t <= b]
        db = [loud.get_value(a + k * 0.01) for k in range(max(1, round((b - a) / 0.01)))]
        db = [d for d in db if d is not None and not math.isnan(d)]
        words.append({
            "word": word, "start": round(a, 3), "end": round(b, 3),
            "f0max": round(max(seg), 1) if seg else None,
            "dbmax": round(max(db), 1) if db else None,
        })
    return {"duration": round(snd.duration, 3), "words": words, "f0": f0}


stage = [{"stress": word, "src": f"{name}.mp3", "loop": loop, **measure(name)} for word, name, loop in STAGE]
(DIR / "stage.json").write_text(json.dumps(stage, separators=(",", ":")))
print("\n".join(f'{c["src"]:10} {c["duration"]}s loop={c["loop"]}' for c in stage))
