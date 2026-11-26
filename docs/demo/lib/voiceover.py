"""Builds the voice-over of the merged demo video from its narration table.

    python voiceover.py <narration.md> <video.mp4> <out.mp3> [out.mp4]

Secrets are read from the environment, else from unisage-web's .env.local / .env (never
committed): VIETTEL_TTS_TOKEN (https://viettelai.vn/dashboard/token), OPENAI_API_KEY,
GEMINI_API_KEYS (comma-separated). TTS_ENV=<file> adds one more file to look in.

Viettel AI (default, TTS_BACKEND=viettel): voice VIETTEL_VOICE (hcm-minhquan, male,
southern), https://viettelai.vn/tai-lieu.
OpenAI (TTS_BACKEND=openai): gpt-4o-mini-tts, voice OPENAI_VOICE (onyx), steered by the same style
instructions on every line. Gemini: the voice GEMINI_VOICE, steered by the style prompt.

Each table row "| m:ss – m:ss | screen | narration |" is read by one voice and placed
at the row's start time. To keep the voice the same across ~100 separate requests, every
line uses the same voice, the same style prompt, a low temperature and a fixed seed; the
clips are trimmed and levelled to one loudness, and a clip whose pitch is far from the
others (a different-sounding voice) is generated again. A clip longer than its slot is sped
up locally (atempo, up to x1.3); one still too long pushes the next line back (reported).

A key that is rate-limited or out of quota is skipped for the next one. Clips are cached
(VOICE_CACHE), so a rerun only asks for changed lines. Needs numpy and imageio-ffmpeg.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import imageio_ffmpeg
import numpy as np

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BACKEND = os.environ.get("TTS_BACKEND", "viettel")
if BACKEND == "viettel":
    MODEL = "viettel-tts"
    VOICE = os.environ.get("VIETTEL_VOICE", "hcm-minhquan")
elif BACKEND == "openai":
    MODEL = os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    VOICE = os.environ.get("OPENAI_VOICE", "onyx")
else:
    MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
    VOICE = os.environ.get("GEMINI_VOICE", "Charon")
INSTRUCTIONS = (
    "Giọng nam, giọng miền Nam (Sài Gòn), phát âm tiếng Việt chuẩn như người bản xứ. "
    "Tự nhiên, ấm, rõ ràng, tốc độ vừa phải, như người thuyết minh video giới thiệu phần "
    "mềm cho giảng viên. Giữ cùng một giọng, cùng âm lượng và cùng nhịp đọc cho mọi câu."
)
STYLE = (
    "Đọc đoạn sau bằng giọng nam miền Nam, Sài Gòn, tự nhiên, ấm và rõ ràng, tốc độ vừa "
    "phải, như người thuyết minh video giới thiệu phần mềm. Giữ nguyên một giọng đọc. "
    "Chỉ đọc phần lời:\n\n"
)
SEED = 7
RATE = 24_000
MAX_TEMPO = 1.3
GAP = 0.15
TARGET_RMS = 0.08  # about -22 dBFS
# Cells may be padded (prettier aligns the table columns).
ROW = re.compile(r"^\|\s*(\d+):(\d\d) – (\d+):(\d\d)\s*\|([^|]*)\|(.*)\|\s*$")
PAUSE_MARK = "⏸"  # in a line: 0.5 s of silence between the two halves
PAUSE = 0.5
PART_GAP = 0.6  # at least this much silence before a part's opening slide
CACHE = Path(os.environ.get("VOICE_CACHE", Path(__file__).parent / ".voice-cache"))
# English words written the way the Vietnamese voice should say them.
SAY = {"chatbot": "chát bót", "token": "tô-kần", "embedding": "em-bét-đinh"}


def spoken(text: str) -> str:
    for word, say in SAY.items():
        text = re.sub(rf"\b{word}\b", lambda m: say.capitalize() if m[0][0].isupper() else say,
                      text, flags=re.I)
    return text


WEB_ROOT = Path(__file__).resolve().parents[3]


def keys(name: str = "GEMINI_API_KEYS") -> list[str]:
    """A secret from the environment, else from TTS_ENV or the web app's .env.local / .env."""
    value = os.environ.get(name)
    if not value:
        files = [os.environ.get("TTS_ENV"), WEB_ROOT / ".env.local", WEB_ROOT / ".env"]
        for path in filter(None, files):
            path = Path(path)
            m = re.search(rf"^{name}=(.*)$", path.read_text(), re.M) if path.is_file() else None
            if m and m[1].strip():
                value = m[1].strip().strip('"').strip("'")
                break
    if not value:
        raise SystemExit(f"{name} is not set (environment, .env.local or .env of unisage-web)")
    return [k.strip() for k in value.split(",") if k.strip()]


class Viettel:
    """Viettel AI TTS: POST text + token, a WAV file back (tts_return_option 2)."""

    def __init__(self) -> None:
        self.token = keys("VIETTEL_TTS_TOKEN")[0]

    def request(self, text: str, seed: int) -> np.ndarray:
        body = {"text": text, "voice": VOICE, "speed": 1.0, "tts_return_option": 2,
                "token": self.token, "without_filter": False}
        for attempt in range(6):
            req = urllib.request.Request(
                "https://viettelai.vn/tts/speech_synthesis", data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json", "accept": "*/*"})
            try:
                with urllib.request.urlopen(req, timeout=180) as response:
                    data = response.read()
                if not data.startswith(b"RIFF"):
                    raise RuntimeError(f"not audio: {data[:300]!r}")
                # Any WAV layout -> 24 kHz mono 16-bit, like the other backends.
                raw = subprocess.run(
                    [FFMPEG, "-hide_banner", "-loglevel", "error", "-i", "-", "-f", "s16le",
                     "-ac", "1", "-ar", str(RATE), "-"],
                    input=data, capture_output=True, check=True).stdout
                return np.frombuffer(raw, dtype=np.int16)
            except urllib.error.HTTPError as error:
                detail = error.read()[:300]
                if error.code not in (429, 500, 502, 503):
                    raise RuntimeError(f"{error.code}: {detail!r}") from error
            except (urllib.error.URLError, TimeoutError):
                pass
            time.sleep(5 * (attempt + 1))
        raise RuntimeError("Viettel TTS kept failing")


class OpenAI:
    """gpt-4o-mini-tts; raw 24 kHz 16-bit mono PCM back. No seed: the instructions keep
    the voice steady."""

    def __init__(self) -> None:
        self.key = keys("OPENAI_API_KEY")[0]

    def request(self, text: str, seed: int) -> np.ndarray:
        body = {"model": MODEL, "voice": VOICE, "input": text, "instructions": INSTRUCTIONS,
                "response_format": "pcm"}
        for attempt in range(6):
            req = urllib.request.Request(
                "https://api.openai.com/v1/audio/speech", data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json",
                         "Authorization": f"Bearer {self.key}"})
            try:
                return np.frombuffer(urllib.request.urlopen(req, timeout=180).read(),
                                     dtype=np.int16)
            except urllib.error.HTTPError as error:
                if error.code not in (429, 500, 502, 503):
                    raise RuntimeError(f"{error.code}: {error.read()[:300]!r}") from error
            except (urllib.error.URLError, TimeoutError):
                pass
            time.sleep(5 * (attempt + 1))
        raise RuntimeError("OpenAI TTS kept failing")


class Gemini:
    def __init__(self) -> None:
        self.keys = keys()
        self.at = 0

    def request(self, text: str, seed: int) -> np.ndarray:
        body = {
            "contents": [{"parts": [{"text": STYLE + text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "temperature": 0.3,
                "seed": seed,
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}},
            },
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
        for round_ in range(6):
            for _ in range(len(self.keys)):
                key = self.keys[self.at]
                req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={
                    "Content-Type": "application/json", "x-goog-api-key": key})
                try:
                    data = json.load(urllib.request.urlopen(req, timeout=180))
                    part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
                    return np.frombuffer(base64.b64decode(part["data"]), dtype=np.int16)
                except urllib.error.HTTPError as error:
                    if error.code not in (403, 429, 500, 503):
                        raise RuntimeError(f"{error.code}: {error.read()[:300]!r}") from error
                    print(f"  key {self.at + 1}/{len(self.keys)}: {error.code}, next key",
                          flush=True)
                except (KeyError, IndexError, urllib.error.URLError, TimeoutError):
                    print(f"  key {self.at + 1}: no audio, next key", flush=True)
                self.at = (self.at + 1) % len(self.keys)
            time.sleep(30 * (round_ + 1))  # every key limited: wait for the window to reset
        raise RuntimeError("every key is rate-limited")


def rows(doc: str) -> list[tuple[float, float, str, bool]]:
    out = []
    for line in doc.splitlines():
        m = ROW.match(line)
        if m:
            text = spoken(re.sub(r"[*`\[\]]", "", m[6]).strip())
            if text:
                slide = 'Slide "Phần' in m[5]
                out.append((int(m[1]) * 60 + int(m[2]), int(m[3]) * 60 + int(m[4]), text, slide))
    return out


def tidy(audio: np.ndarray) -> np.ndarray:
    """Trims the silence around the speech and levels it to TARGET_RMS."""
    x = audio.astype(np.float32) / 32768
    frame = RATE // 50
    energy = np.array([np.sqrt(np.mean(x[i:i + frame] ** 2) + 1e-12)
                       for i in range(0, len(x) - frame, frame)])
    voiced = np.where(energy > 0.01)[0]
    if len(voiced):
        x = x[max(voiced[0] - 2, 0) * frame:(voiced[-1] + 3) * frame]
    loud = x[np.abs(x) > 0.01]
    rms = np.sqrt(np.mean(loud ** 2)) if len(loud) else 0
    if rms > 0:
        x = x * min(TARGET_RMS / rms, 8)
    return (np.clip(x, -1, 1) * 32767).astype(np.int16)


def pitch(audio: np.ndarray) -> float:
    """Median F0 (Hz) over voiced 40 ms frames, by autocorrelation (60-300 Hz)."""
    x = audio.astype(np.float32) / 32768
    n = int(RATE * 0.04)
    values = []
    for i in range(0, len(x) - n, n):
        f = x[i:i + n] - x[i:i + n].mean()
        if np.sqrt(np.mean(f ** 2)) < 0.02:
            continue
        ac = np.correlate(f, f, "full")[n - 1:]
        lo, hi = RATE // 300, RATE // 60
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.3 * ac[0]:
            values.append(RATE / lag)
    return float(np.median(values)) if values else 0.0


def tempo(audio: np.ndarray, factor: float) -> np.ndarray:
    raw = subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-f", "s16le", "-ar", str(RATE),
         "-ac", "1", "-i", "-", "-af", f"atempo={factor:.3f}", "-f", "s16le", "-"],
        input=audio.tobytes(), capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16)


def backend() -> Viettel | OpenAI | Gemini:
    return {"viettel": Viettel, "openai": OpenAI}.get(BACKEND, Gemini)()


def clip(tts: Viettel | OpenAI | Gemini, text: str, seed: int) -> np.ndarray:
    CACHE.mkdir(exist_ok=True)
    style = {"openai": INSTRUCTIONS, "viettel": ""}.get(BACKEND, STYLE)
    key = hashlib.sha1(f"{MODEL}|{VOICE}|{style}|{seed}|{text}".encode()).hexdigest()
    cached = CACHE / f"{key}.pcm"
    if cached.exists():
        return np.fromfile(cached, dtype=np.int16)
    audio = tidy(tts.request(text, seed))
    audio.tofile(cached)
    time.sleep(1.0)
    return audio


def line_clip(tts: Viettel | OpenAI | Gemini, text: str, seed: int) -> np.ndarray:
    """A line, its PAUSE_MARK halves spoken separately and joined by PAUSE of silence."""
    halves = [h.strip() for h in text.split(PAUSE_MARK) if h.strip()]
    silence = np.zeros(int(PAUSE * RATE), dtype=np.int16)
    out = []
    for i, half in enumerate(halves):
        if i:
            out.append(silence)
        out.append(clip(tts, half, seed))
    return np.concatenate(out)


def duration(video: str) -> float:
    out = subprocess.run([FFMPEG, "-hide_banner", "-i", video], capture_output=True, text=True)
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out.stderr).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def main() -> None:
    doc, video, out_mp3, *rest = sys.argv[1:]
    tts = backend()
    lines = rows(Path(doc).read_text())
    clips = []
    for start, _, text, _ in lines:
        clips.append(line_clip(tts, text, SEED))
        print(f"{int(start // 60)}:{int(start % 60):02d} ok", flush=True)
    # Same voice check: a clip whose pitch is >15 % off the median is asked again.
    pitches = [pitch(c) for c in clips]
    median = float(np.median([p for p in pitches if p]))
    for i, (p, (start, _, text, _)) in enumerate(zip(pitches, lines)):
        for retry in range(1, 4):
            if p and abs(p - median) / median <= 0.15:
                break
            print(f"{int(start // 60)}:{int(start % 60):02d} pitch {p:.0f} Hz vs {median:.0f}"
                  f" - asking again", flush=True)
            clips[i] = line_clip(tts, text, SEED + retry)
            p = pitch(clips[i])
        pitches[i] = p
    total = duration(video)
    track = np.zeros(int((total + 1) * RATE), dtype=np.int32)
    free_at = 0.0
    for (start, end, _, slide), audio, p in zip(lines, clips, pitches):
        slot = max(end - start - GAP, 1.0)
        note = ""
        if len(audio) / RATE > slot:
            factor = min(len(audio) / RATE / slot, MAX_TEMPO)
            audio = tempo(audio, factor)
            note = f" x{factor:.2f}"
        at = max(start, free_at + (PART_GAP - GAP if slide else 0))
        track[int(at * RATE):int(at * RATE) + len(audio)] += audio
        free_at = at + len(audio) / RATE + GAP
        flag = f" trễ {at - start:.1f}s" if at - start > 0.3 else ""
        over = free_at - GAP - end
        flag += f" tràn {over:.1f}s" if over > 0.3 else ""
        print(f"{int(start // 60)}:{int(start % 60):02d} {len(audio) / RATE:5.1f}s/"
              f"{end - start:3.0f}s {p:4.0f}Hz{note}{flag}", flush=True)
    print(f"pitch: median {median:.0f} Hz, range {min(p for p in pitches if p):.0f}-"
          f"{max(pitches):.0f} Hz")
    pcm16 = np.clip(track[: int(total * RATE)], -32768, 32767).astype(np.int16).tobytes()
    subprocess.run(
        [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ac", "1",
         "-ar", str(RATE), "-i", "-", "-c:a", "libmp3lame", "-b:a", "128k", out_mp3],
        input=pcm16, check=True,
    )
    print(f"{out_mp3}: {total:.1f}s")
    if rest:
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", video, "-i", out_mp3,
             "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "veryfast",
             "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
             "-movflags", "+faststart", rest[0]],
            check=True,
        )
        print(f"{rest[0]}: video + voice-over")


if __name__ == "__main__":
    main()
