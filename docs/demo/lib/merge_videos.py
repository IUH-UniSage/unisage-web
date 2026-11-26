"""Joins the demo videos into one, with the UniSage logo on the title cards.

    python merge_videos.py <out.webm> <old_logo.png> <new_logo.png> <video>[:keep] ...

Each video starts at its opening title card and loses its closing card (the outro: the last full-screen card, and everything
recorded after it), except the ones suffixed ":keep". On every title card the logo the
videos were recorded with (old_logo, drawn 560x336 with 14px corners) is replaced by
new_logo, found by template matching, so nothing has to be recorded again.

Needs numpy and Pillow; only the ffmpeg build bundled with Playwright is assumed (PNG in,
VP8 out, scale filter), as in cut_waits.py.
"""

from __future__ import annotations

import glob
import io
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw

FFMPEG = glob.glob(os.path.expanduser("~/.cache/ms-playwright/ffmpeg-*/ffmpeg-linux"))[0]
FPS = 25
BLOCK = 8.0
W, H = 1440, 900
LOGO_W, LOGO_H, RADIUS = 560, 336, 14
CARD_BG = np.array([31, 63, 148])
# Corners and edge midpoints of the screen: all card background on a title card.
PROBES = [(6, 6), (6, 450), (6, 893), (720, 6), (720, 893), (1400, 6), (1400, 893)]
SMALL = 4  # downscale factor for the logo search


def decode(src: str, out_dir: str, *, start: float = 0, length: float | None = None,
           scale: str | None = None) -> list[str]:
    for old in glob.glob(f"{out_dir}/*.png"):
        os.remove(old)
    cmd = [FFMPEG, "-hide_banner", "-loglevel", "error", "-ss", f"{start:.3f}", "-i", src]
    if length is not None:
        cmd += ["-t", f"{length:.3f}"]
    if scale:
        cmd += ["-vf", f"scale={scale}"]
    subprocess.run([*cmd, f"{out_dir}/%06d.png"], check=True)
    return sorted(glob.glob(f"{out_dir}/*.png"))


def is_card(frame: np.ndarray, sx: float = 1.0, sy: float = 1.0) -> bool:
    for x, y in PROBES:
        px = frame[min(int(y * sy), frame.shape[0] - 1), min(int(x * sx), frame.shape[1] - 1)]
        if np.abs(px.astype(int) - CARD_BG).sum() > 40:
            return False
    return True


def card_bounds(src: str, tmp: str) -> tuple[float, float]:
    """Seconds where the first and the last title card start: the blank page before the
    opening card is dropped, and so is the closing card (with the rest) of a video that
    loses its outro."""
    frames = decode(src, tmp, scale="360:225")
    cards = []
    prev = None
    start = None
    for i, path in enumerate(frames):
        frame = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
        card = is_card(frame, 360 / W, 225 / H)
        if card:
            # A new card starts after a non-card frame, or when the card's content changes.
            if prev is None or np.abs(frame - prev).mean() > 6:
                start = i
                cards.append(start)
            prev = frame
        else:
            prev = None
    if not cards:
        raise SystemExit(f"{src}: no title card found")
    return cards[0] / FPS, cards[-1] / FPS


class LogoSwap:
    def __init__(self, old_logo: str, new_logo: str) -> None:
        old = Image.open(old_logo).convert("RGB").resize((LOGO_W, LOGO_H), Image.LANCZOS)
        self.template = np.asarray(old).astype(np.int16)[12:-12, 12:-12]
        small = old.resize((LOGO_W // SMALL, LOGO_H // SMALL), Image.BILINEAR)
        # The inner part only: corners and edges blend with the shadow.
        self.small = np.asarray(small).astype(np.int16)[3:-3, 3:-3]
        # Compared on the pixels that stand out from the card background only (the IUH
        # logo is mostly the card's own blue, so a plain card matched it too).
        self.salient = np.abs(self.template - CARD_BG).sum(2) > 150
        self.small_salient = np.abs(self.small - CARD_BG).sum(2) > 150
        self.new = Image.open(new_logo).convert("RGB").resize((LOGO_W, LOGO_H), Image.LANCZOS)
        mask = Image.new("L", (LOGO_W, LOGO_H), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, LOGO_W - 1, LOGO_H - 1), radius=RADIUS, fill=255)
        self.mask = mask
        self.last: tuple[int, int] | None = None
        self.miss: np.ndarray | None = None

    def error(self, frame: np.ndarray, x: int, y: int) -> float:
        region = frame[y + 12:y + LOGO_H - 12, x + 12:x + LOGO_W - 12]
        if region.shape[:2] != (LOGO_H - 24, LOGO_W - 24):
            return 1e9
        return float(np.abs(region - self.template)[self.salient].mean())

    def find(self, frame: np.ndarray) -> tuple[int, int] | None:
        if self.last and self.error(frame, *self.last) < 30:
            return self.last
        small = np.asarray(
            Image.fromarray(frame.astype(np.uint8)).resize((W // SMALL, H // SMALL),
                                                           Image.BILINEAR)
        ).astype(np.int16)
        # A card without a logo (a diagram) is searched once, not on every frame.
        if self.miss is not None and np.abs(small - self.miss).mean() < 4:
            return None
        th, tw = self.small.shape[:2]
        best = (1e9, 0, 0)
        # The card is centred: x only moves with the page's scrollbar.
        for sx in range((400 // SMALL), (460 // SMALL) + 1):
            for sy in range(0, small.shape[0] - th - 3):
                window = small[sy + 3:sy + 3 + th, sx + 3:sx + 3 + tw]
                err = np.abs(window - self.small)[self.small_salient].mean()
                if err < best[0]:
                    best = (err, sx, sy)
        if best[0] > 35:
            self.miss = small
            return None
        bx, by = best[1] * SMALL, best[2] * SMALL
        refined = min(
            ((self.error(frame, x, y), x, y)
             for x in range(bx - 4, bx + 5) for y in range(by - 4, by + 5)),
        )
        if refined[0] > 30:
            self.miss = small
            return None
        self.last = (refined[1], refined[2])
        return self.last

    def apply(self, image: Image.Image) -> Image.Image:
        frame = np.asarray(image).astype(np.int16)
        if not is_card(frame):
            self.last = None
            return image
        at = self.find(frame)
        if at:
            image = image.copy()
            image.paste(self.new, at, self.mask)
        return image


def main() -> None:
    out, old_logo, new_logo, *videos = sys.argv[1:]
    swap = LogoSwap(old_logo, new_logo)
    encoder = subprocess.Popen(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
         "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(FPS), "-i", "pipe:0",
         "-c:v", "libvpx", "-b:v", "2M", "-crf", "10", "-qmin", "0", "-qmax", "40",
         "-deadline", "realtime", "-cpu-used", "8", "-threads", "2", out],
        stdin=subprocess.PIPE,
    )
    total = 0
    with tempfile.TemporaryDirectory() as tmp:
        for spec in videos:
            src, _, keep = spec.partition(":")
            first, last = card_bounds(src, tmp)
            end = None if keep == "keep" else last
            at, frames, swapped = first, 0, 0
            while True:
                length = BLOCK if end is None else min(BLOCK, end - at)
                if length <= 0.02:
                    break
                paths = decode(src, tmp, start=at, length=length)
                if not paths:
                    break
                for path in paths:
                    image = Image.open(path).convert("RGB")
                    fixed = swap.apply(image)
                    swapped += fixed is not image
                    buffer = io.BytesIO()
                    fixed.save(buffer, "JPEG", quality=92)
                    encoder.stdin.write(buffer.getvalue())
                    frames += 1
                at += length
            total += frames
            print(f"{os.path.basename(src)}: {frames / FPS:.1f}s from {first:.1f}s"
                  f"{'' if end is None else f' (outro from {end:.1f}s dropped)'},"
                  f" logo replaced in {swapped} frames", flush=True)
    encoder.stdin.close()
    encoder.wait()
    print(f"{out}: {total / FPS:.1f}s ({total} frames)")


if __name__ == "__main__":
    main()
