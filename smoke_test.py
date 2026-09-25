"""Quick smoke test: TTS + Edge screenshot + FFmpeg segment"""
import subprocess, time
from pathlib import Path
import pyttsx3
from PIL import Image, ImageDraw

OUT = Path(r"C:\Users\DELL USER\.gemini\antigravity\scratch\rentalhub\smoke_test")
OUT.mkdir(exist_ok=True)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# --- 1. TTS ---
print("[1] TTS...")
engine = pyttsx3.init()
for v in engine.getProperty('voices'):
    if 'David' in v.name:
        engine.setProperty('voice', v.id)
        break
engine.setProperty('rate', 165)
wav_path = OUT / "test.wav"
engine.save_to_file("Welcome to RentalHub. This is a smoke test of the voice narration system.", str(wav_path))
engine.runAndWait()
engine.stop()
print(f"   WAV exists: {wav_path.exists()}, size: {wav_path.stat().st_size if wav_path.exists() else 0} bytes")

# --- 2. Edge screenshot ---
print("[2] Edge headless screenshot...")
img_path = OUT / "test_shot.png"
cmd = [EDGE, "--headless=new", "--disable-gpu", "--window-size=1920,1080",
       f"--screenshot={img_path}", "--hide-scrollbars",
       "--virtual-time-budget=3000", "http://localhost:3000/"]
subprocess.run(cmd, capture_output=True, timeout=30)

# Edge sometimes puts it in cwd - check both
import os
cwd_shot = Path(os.getcwd()) / "screenshot.png"
if not img_path.exists() and cwd_shot.exists():
    cwd_shot.rename(img_path)

if not img_path.exists():
    # Try profile-based approach
    print("   Edge shot failed, trying alternate flags...")
    cmd2 = [EDGE, "--headless", "--disable-gpu", "--window-size=1920,1080",
            f"--screenshot={img_path}", "http://localhost:3000/"]
    subprocess.run(cmd2, capture_output=True, timeout=30)

print(f"   PNG exists: {img_path.exists()}, size: {img_path.stat().st_size if img_path.exists() else 0} bytes")

if not img_path.exists():
    print("   Fallback: creating placeholder image with Pillow")
    img = Image.new("RGB", (1920, 1080), color=(15, 23, 42))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 1920, 120], fill=(37, 99, 235))
    draw.text((960, 60), "RentalHub — Equipment Rental Marketplace", fill="white", anchor="mm")
    draw.text((960, 300), "DEMO PAGE: Home Page", fill=(148, 163, 184), anchor="mm")
    draw.text((960, 400), "localhost:3000", fill=(100, 149, 237), anchor="mm")
    img.save(img_path)
    print(f"   Placeholder saved: {img_path}")

# --- 3. FFmpeg combine ---
print("[3] FFmpeg segment...")
seg_path = OUT / "test_segment.mp4"
cmd3 = ["ffmpeg", "-y", "-loop", "1", "-framerate", "24",
        "-i", str(img_path), "-i", str(wav_path),
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        "-t", "8", str(seg_path)]
result = subprocess.run(cmd3, capture_output=True, timeout=60)
print(f"   MP4 exists: {seg_path.exists()}, size: {seg_path.stat().st_size if seg_path.exists() else 0} bytes")
if not seg_path.exists():
    print(f"   FFmpeg stderr: {result.stderr[-500:].decode(errors='replace')}")

print("\n[SMOKE TEST DONE]")
print(f"  WAV: {wav_path}")
print(f"  PNG: {img_path}")
print(f"  MP4: {seg_path}")
