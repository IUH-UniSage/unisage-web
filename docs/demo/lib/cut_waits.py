"""Cuts the long waits (LLM answers, embedding) out of a recorded demo video.

    python3 cut_waits.py <in.webm> <out.webm> <cuts.json>

cuts.json is a list of [start, end] seconds to drop, written by demo-kit.mjs while
recording. Only the ffmpeg build bundled with Playwright is assumed, and it has no concat,
setpts or fps filter (Playwright records at a constant 25 fps, so none is needed): kept
ranges are decoded block by block to PNG, re-saved as JPEG (Pillow) and piped into one VP8
encoder, so at most one block of frames is on disk at a time.
"""

from __future__ import annotations

import glob
import io
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

FFMPEG = glob.glob(os.path.expanduser("~/.cache/ms-playwright/ffmpeg-*/ffmpeg-linux"))[0]
FPS = 25
BLOCK = 8.0  # seconds decoded per step


def duration(path: str) -> float:
    out = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True)
    for line in out.stderr.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    # Playwright's webm has no duration header: decode once to find it.
    out = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", path, "-f", "null", "-"], capture_output=True, text=True
    )
    times = [ln.split("time=")[1].split()[0] for ln in out.stderr.splitlines() if "time=" in ln]
    h, m, s = times[-1].split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def kept_ranges(total: float, cuts: list[list[float]]) -> list[tuple[float, float]]:
    ranges, at = [], 0.0
    for start, end in sorted(cuts):
        start, end = max(start, at), min(end, total)
        if end - start < 0.5:
            continue
        ranges.append((at, start))
        at = end
    ranges.append((at, total))
    return [(a, b) for a, b in ranges if b - a > 0.04]


def main() -> None:
    src, dst, cuts_file = sys.argv[1:4]
    cuts = json.load(open(cuts_file))
    total = duration(src)
    ranges = kept_ranges(total, cuts)
    encoder = subprocess.Popen(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
         "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(FPS), "-i", "pipe:0",
         "-c:v", "libvpx", "-b:v", "2M", "-crf", "10", "-qmin", "0", "-qmax", "40",
         "-deadline", "realtime", "-cpu-used", "8", "-threads", "2", dst],
        stdin=subprocess.PIPE,
    )
    frames = 0
    with tempfile.TemporaryDirectory() as tmp:
        for start, end in ranges:
            at = start
            while at < end - 0.02:
                length = min(BLOCK, end - at)
                for old in glob.glob(f"{tmp}/*.png"):
                    os.remove(old)
                subprocess.run(
                    [FFMPEG, "-hide_banner", "-loglevel", "error", "-ss", f"{at:.3f}",
                     "-i", src, "-t", f"{length:.3f}", f"{tmp}/%05d.png"],
                    check=True,
                )
                for png in sorted(glob.glob(f"{tmp}/*.png")):
                    buffer = io.BytesIO()
                    Image.open(png).convert("RGB").save(buffer, "JPEG", quality=92)
                    encoder.stdin.write(buffer.getvalue())
                    frames += 1
                at += length
    encoder.stdin.close()
    encoder.wait()
    kept = sum(b - a for a, b in ranges)
    print(f"cut {total - kept:.1f}s of {total:.1f}s -> {kept:.1f}s ({frames} frames)")


if __name__ == "__main__":
    main()
