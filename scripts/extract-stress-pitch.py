# Measures pitch and per-word timing in the clips from generate-stress-clips.mjs
# and writes src/data/text-tone-stage.json, which the text-is-not-tone page imports.
# Run: uv run --no-project --with praat-parselmouth python scripts/extract-stress-pitch.py
import json
import subprocess
import tempfile
from pathlib import Path

import parselmouth

CLIPS = Path("public/assets/blog/didnt-say")
ALIGN = Path("scripts/stress-align")
OUT = Path("src/data/text-tone-stage.json")
WORDS = ["I", "didn't", "say", "she", "stole", "the", "money"]
# (stressed word, clip name); None is the flat reading.
STAGE = [("I", "i"), ("didn't", "didnt"), ("say", "say"), ("she", "she"),
         ("stole", "stole"), ("the", "the"), ("money", "money"), (None, "flat")]


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
    align = json.loads((ALIGN / f"{name}.align.json").read_text())["alignment"]
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", CLIPS / f"{name}.mp3", "-ac", "1", wav.name], check=True)
        snd = parselmouth.Sound(wav.name)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=75, pitch_ceiling=500)
    f0 = [(round(t, 3), round(v, 1)) for t, v in zip(pitch.xs(), pitch.selected_array["frequency"]) if v > 0]
    words = [{"word": word, "start": round(a, 3), "end": round(b, 3)} for word, (a, b) in zip(WORDS, word_spans(align))]
    return {"duration": round(snd.duration, 3), "words": words, "f0": f0}


stage = [{"stress": word, "src": f"{name}.mp3", **measure(name)} for word, name in STAGE]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(stage, separators=(",", ":")))
print("\n".join(f'{c["src"]:10} {c["duration"]}s' for c in stage))
