# -*- coding: utf-8 -*-
"""
RentalHub Demo Video Generator
================================
Captures screenshots from live site, generates voice narration via edge-tts,
and assembles a full demo video using FFmpeg.
"""
import io
import subprocess
import asyncio
import os
import sys
import json
import time
import shutil
from pathlib import Path

# Fix Windows console encoding so Unicode prints safely
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Config ──────────────────────────────────────────────────────────────────
EDGE_EXE  = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
FFMPEG    = "ffmpeg"
BASE_URL  = "http://localhost:3000"
OUT_DIR   = Path("video_build")
FINAL_OUT = "RentalHub_Demo.mp4"
VOICE     = "en-US-AndrewNeural"
W, H      = 1920, 1080

OUT_DIR.mkdir(exist_ok=True)

# ── Narration Script + Screenshots ──────────────────────────────────────────
SCENES = [
    {
        "id": "01_intro",
        "url": BASE_URL,
        "wait": 5,
        "text": (
            "Welcome to RentalHub, the modern full-stack equipment rental marketplace "
            "built with the complete MERN stack: MongoDB, Express, React, and Node.js. "
            "In this demo we will walk through every key feature of the platform, "
            "from browsing heavy machinery to managing bookings as an owner and administrator."
        ),
        "hold": 2,
    },
    {
        "id": "02_homepage_hero",
        "url": BASE_URL,
        "wait": 5,
        "text": (
            "This is the RentalHub landing page. "
            "The hero section greets visitors with a powerful search bar "
            "where you can search by keyword, filter by equipment category, and select your city. "
            "Notice the trust counters: over 2400 machinery units, 99.8 percent on-time dispatch rate, "
            "and a zero-deposit option for verified users."
        ),
        "hold": 2,
    },
    {
        "id": "03_categories",
        "url": BASE_URL,
        "wait": 5,
        "text": (
            "Below the hero, you find six curated equipment categories: "
            "Earthmoving and Heavy Machinery, Aerial Work Platforms and Lifts, "
            "Power Tools and Concrete, Commercial Audio and Lighting, "
            "Lawn Garden and Forestry, and Generators and Power Distribution. "
            "Each category card links directly to filtered search results."
        ),
        "hold": 2,
    },
    {
        "id": "04_catalog",
        "url": BASE_URL + "/catalog",
        "wait": 6,
        "text": (
            "This is the Equipment Catalog page, the main marketplace hub. "
            "On the left is a powerful filter sidebar with keyword search, "
            "category dropdown, metro location selector, daily rate price range, and condition ratings. "
            "On the right, equipment cards appear in a responsive grid. "
            "Sort options include newest, price low to high, top rated, and most rented."
        ),
        "hold": 2,
    },
    {
        "id": "05_catalog_filter",
        "url": BASE_URL + "/catalog?search=Excavator&sort=rating",
        "wait": 7,
        "text": (
            "Watch how the catalog filters live results in real time. "
            "Searching for Excavator brings up the Caterpillar 305.5 Mini Hydraulic Excavator, "
            "priced at 350 dollars per day with a 4.9 star rating and Like New condition badge. "
            "The owner business name, city, state, and pagination are all visible."
        ),
        "hold": 2,
    },
    {
        "id": "06_equipment_detail",
        "url": None,
        "wait": 7,
        "text": (
            "Clicking an equipment card opens the full Detail Page. "
            "A high-resolution image gallery appears with thumbnail navigation. "
            "You see the category badge, combined star rating, total successful rentals count, "
            "and the full yard address including city and state."
        ),
        "hold": 2,
    },
    {
        "id": "07_specs_sidebar",
        "url": None,
        "wait": 7,
        "text": (
            "Below the gallery is a full technical description followed by a Specifications table "
            "showing operating weight, dig depth, horsepower, and fuel capacity. "
            "The sticky right-side booking card shows the daily rate, "
            "refundable security deposit, and the 15-dollar platform protection fee. "
            "The verified owner business card with contact phone number appears at the bottom."
        ),
        "hold": 2,
    },
    {
        "id": "08_availability",
        "url": None,
        "wait": 7,
        "text": (
            "The Fleet Availability section shows all currently reserved date windows "
            "fetched live from the conflict engine. "
            "If no bookings conflict, a green banner confirms the equipment is open for immediate reservation. "
            "Reserved windows are shown as locked badges preventing double-booking at the UI level."
        ),
        "hold": 2,
    },
    {
        "id": "09_booking",
        "url": None,
        "wait": 6,
        "text": (
            "Clicking Select Dates and Book Machine opens the reservation modal. "
            "The customer selects a start date and end date. "
            "The system immediately calls the conflict detection API and confirms availability in real time. "
            "If available, a full pricing breakdown appears: "
            "the daily rate multiplied by the number of days, plus security deposit and service fee, "
            "totalling the complete amount due."
        ),
        "hold": 2,
    },
    {
        "id": "10_demo_bar",
        "url": BASE_URL,
        "wait": 5,
        "text": (
            "A Quick Persona Switcher bar is pinned at the very top of every page. "
            "You can switch instantly between the Customer, Fleet Owner, and Administrator accounts "
            "with a single click, no password typing required. "
            "The active persona name and role are always shown in the top right navigation."
        ),
        "hold": 2,
    },
    {
        "id": "11_customer_dashboard",
        "url": BASE_URL + "/dashboard/customer",
        "wait": 7,
        "text": (
            "After switching to the Customer persona, the Customer Dashboard loads. "
            "Four key performance indicators appear at the top: "
            "Total Bookings, Active Rentals, Pending or Confirmed rentals, and Total Rental Spend in dollars. "
            "Below is the full Booking Ledger with filterable tabs for All, Active, Pending Upcoming, and Completed."
        ),
        "hold": 2,
    },
    {
        "id": "12_booking_cards",
        "url": BASE_URL + "/dashboard/customer",
        "wait": 7,
        "text": (
            "Each booking card shows the equipment thumbnail photo, booking reference number, "
            "a color-coded status badge, the rental date range, owner business name and phone, "
            "delivery method chosen, and total price including the deposit. "
            "Customers can cancel pending or confirmed bookings directly from here, "
            "and submit a star rating review once a rental is marked returned."
        ),
        "hold": 2,
    },
    {
        "id": "13_owner_dashboard",
        "url": BASE_URL + "/dashboard/owner",
        "wait": 7,
        "text": (
            "Switching to the Fleet Owner persona opens the Owner Portal. "
            "Four KPIs appear: Total Listings, Active Rentals in the field, "
            "Pending Approval requests, and Total Fleet Revenue earned. "
            "Two management tabs are available: Customer Booking Requests and My Fleet Inventory."
        ),
        "hold": 2,
    },
    {
        "id": "14_booking_approvals",
        "url": BASE_URL + "/dashboard/owner",
        "wait": 7,
        "text": (
            "In the Booking Requests tab, incoming reservations appear in a management table. "
            "Each row shows the reference number, equipment title, customer contact details, "
            "rental window, expected payout, and current status. "
            "The owner clicks Approve to confirm, Dispatch to mark the machine as active, "
            "or Check-In to complete the return and trigger a security deposit refund."
        ),
        "hold": 2,
    },
    {
        "id": "15_inventory",
        "url": BASE_URL + "/dashboard/owner",
        "wait": 7,
        "text": (
            "The Fleet Inventory tab shows all owner-listed machines in a table "
            "with thumbnail images, category labels, daily rates, deposit amounts, "
            "condition ratings, and live availability toggle status. "
            "The pencil icon opens the full Edit Equipment modal. "
            "The trash icon removes the listing if no active bookings exist."
        ),
        "hold": 2,
    },
    {
        "id": "16_add_equipment",
        "url": BASE_URL + "/dashboard/owner",
        "wait": 6,
        "text": (
            "Clicking Add Equipment Listing opens the comprehensive listing form. "
            "The owner sets the title, category, technical description, "
            "daily rate and security deposit, condition, yard pickup location, "
            "high-resolution photo URLs, and custom specification key-value pairs. "
            "A toggle switch controls whether the listing is live and accepting reservations."
        ),
        "hold": 2,
    },
    {
        "id": "17_admin_dashboard",
        "url": BASE_URL + "/dashboard/admin",
        "wait": 7,
        "text": (
            "Switching to the Administrator persona opens the Admin Console. "
            "Four platform-wide KPIs are displayed: "
            "Gross Merchandise Volume representing the total transaction value, "
            "Total Platform Bookings across all owners, "
            "Equipment Listings count, "
            "and Registered Users broken down by owner and customer roles."
        ),
        "hold": 2,
    },
    {
        "id": "18_admin_ledger",
        "url": BASE_URL + "/dashboard/admin",
        "wait": 7,
        "text": (
            "The Global Bookings Ledger gives administrators full oversight of every transaction. "
            "Each row shows the booking reference, equipment title, customer details, "
            "owner details, rental date window, total amount, and status. "
            "This complete audit trail ensures platform transparency and accountability."
        ),
        "hold": 2,
    },
    {
        "id": "19_admin_users",
        "url": BASE_URL + "/dashboard/admin",
        "wait": 6,
        "text": (
            "The User Accounts tab lists every registered user with their profile photo, "
            "full name, email address, current role badge, company, and join date. "
            "Administrators can change any account role instantly using a dropdown, "
            "promoting a customer to Equipment Owner or granting admin privileges."
        ),
        "hold": 2,
    },
    {
        "id": "20_admin_categories",
        "url": BASE_URL + "/dashboard/admin",
        "wait": 6,
        "text": (
            "The Categories tab lets administrators create and manage all equipment categories. "
            "Each row shows the Bootstrap icon, category name, URL slug, description, "
            "and the number of equipment units listed within it. "
            "The New Category button opens a form modal for adding additional rental categories."
        ),
        "hold": 2,
    },
    {
        "id": "21_reviews_login",
        "url": BASE_URL + "/login",
        "wait": 5,
        "text": (
            "The Login page supports standard email and password sign-in "
            "along with the one-click demo persona buttons for Customer, Fleet Owner, and Administrator. "
            "JWT tokens are stored securely in the browser and automatically attached "
            "to every authenticated API request via an Axios request interceptor."
        ),
        "hold": 2,
    },
    {
        "id": "22_register",
        "url": BASE_URL + "/register",
        "wait": 5,
        "text": (
            "The Registration page lets new users choose their account type upfront: "
            "either Rent Equipment as a Customer, or List Fleet as an Equipment Owner. "
            "The form collects full name, company name, phone, work email, password, and location. "
            "Passwords are encrypted using bcrypt with a salt factor of 10 before database storage."
        ),
        "hold": 2,
    },
    {
        "id": "23_outro",
        "url": BASE_URL,
        "wait": 5,
        "text": (
            "RentalHub is a complete, production-ready full-stack MERN application featuring: "
            "React 18 with Bootstrap 5 responsive frontend, "
            "Node.js and Express REST API backend with 18 protected endpoints, "
            "MongoDB with Mongoose for all data persistence, "
            "JWT-based role authorization for customers, owners, and admins, "
            "real-time double-booking conflict prevention with HTTP 409 responses, "
            "complete six-stage booking lifecycle management, "
            "automated review rating aggregation via MongoDB pipeline, "
            "and a 14-step automated end-to-end integration test suite. "
            "Thank you for watching this RentalHub platform demonstration."
        ),
        "hold": 3,
    },
]


# ── Helper: Headless Edge Screenshot using --dump-dom fallback ───────────────
def take_screenshot(url: str, out_path: str, wait_sec: int = 5) -> bool:
    """Take screenshot using Edge headless with proper wait time."""
    cmd = [
        EDGE_EXE,
        "--headless=new",
        f"--screenshot={os.path.abspath(out_path)}",
        f"--window-size={W},{H}",
        f"--virtual-time-budget={wait_sec * 1000}",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        url,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, timeout=40)
        return os.path.exists(out_path)
    except Exception as e:
        print(f"  [WARN] Screenshot error: {e}")
        return False


# ── Helper: Generate voice narration via edge-tts ───────────────────────────
async def generate_voice(text: str, out_path: str) -> bool:
    cmd = [
        sys.executable, "-m", "edge_tts",
        "--voice", VOICE,
        "--text", text,
        "--write-media", out_path,
        "--rate", "+8%",
        "--pitch", "-2Hz",
    ]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
        return os.path.exists(out_path)
    except Exception as e:
        print(f"  [WARN] Voice gen error: {e}")
        return False


# ── Helper: Get audio duration ───────────────────────────────────────────────
def get_audio_duration(audio_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_streams", audio_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        data = json.loads(result.stdout)
        return float(data["streams"][0]["duration"])
    except Exception:
        return 8.0


# ── Helper: Create title card using FFmpeg drawtext ─────────────────────────
def build_title_card(title: str, subtitle: str, out_path: str) -> bool:
    title_esc    = title.replace("'", "").replace(":", " -").replace(",", "")
    subtitle_esc = subtitle.replace("'", "").replace(":", " -").replace(",", "")
    cmd = [
        FFMPEG, "-y",
        "-f", "lavfi",
        "-i", f"color=c=#0f172a:size={W}x{H}",
        "-frames:v", "1",
        "-vf",
        (
            f"drawtext=fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-50"
            f":text='{title_esc}':fontfile='C\\:/Windows/Fonts/arialbd.ttf',"
            f"drawtext=fontsize=36:fontcolor=#f59e0b:x=(w-text_w)/2:y=(h-text_h)/2+50"
            f":text='{subtitle_esc}':fontfile='C\\:/Windows/Fonts/arial.ttf'"
        ),
        out_path,
    ]
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode == 0


# ── Helper: Build one video segment ─────────────────────────────────────────
def build_segment(img_path: str, audio_path: str, out_path: str, hold: float) -> bool:
    duration = get_audio_duration(audio_path) + hold
    cmd = [
        FFMPEG, "-y",
        "-loop", "1", "-i", os.path.abspath(img_path),
        "-i", os.path.abspath(audio_path),
        "-c:v", "libx264",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2",
        "-t", str(duration),
        "-shortest",
        os.path.abspath(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode == 0


# ── Build branded title screen segment ──────────────────────────────────────
async def build_title_screen():
    print("  Building branded title screen...")
    img = str(OUT_DIR / "title_card.png")
    build_title_card("RentalHub", "Equipment Rental Marketplace - Full Platform Demo", img)

    # If ffmpeg title card fails, just use blank screenshot
    if not os.path.exists(img):
        take_screenshot(BASE_URL, img, wait_sec=5)

    voice_path = str(OUT_DIR / "title_voice.mp3")
    await generate_voice(
        "RentalHub. A production-grade MERN stack equipment rental marketplace. "
        "Complete platform demonstration walkthrough.",
        voice_path
    )
    seg_path = str(OUT_DIR / "seg_00_title.mp4")
    ok = build_segment(img, voice_path, seg_path, hold=2)
    return seg_path if ok else None


# ── Main pipeline ─────────────────────────────────────────────────────────────
async def main():
    print("=" * 60)
    print("  RentalHub Demo Video Generator")
    print("=" * 60)

    # Resolve equipment detail URL from live API
    try:
        import urllib.request
        resp = urllib.request.urlopen(
            "http://localhost:5000/api/equipment?limit=1&featured=true", timeout=5
        )
        data = json.loads(resp.read())
        detail_id  = data["equipment"][0]["_id"]
        detail_url = f"{BASE_URL}/equipment/{detail_id}"
        print(f"  Equipment detail URL: {detail_url}")
    except Exception as e:
        detail_url = f"{BASE_URL}/catalog"
        print(f"  [WARN] Could not fetch equipment ID, using catalog: {e}")

    # Patch None URLs with detail URL
    for scene in SCENES:
        if scene["url"] is None:
            scene["url"] = detail_url

    segments = []

    # Title screen
    title_seg = await build_title_screen()
    if title_seg:
        segments.append(title_seg)

    # Process each scene
    for i, scene in enumerate(SCENES):
        print(f"\n[{i+1}/{len(SCENES)}] Scene: {scene['id']}")

        img_path   = str(OUT_DIR / f"{scene['id']}.png")
        audio_path = str(OUT_DIR / f"{scene['id']}.mp3")
        seg_path   = str(OUT_DIR / f"seg_{scene['id']}.mp4")

        # Skip if segment already done (for resuming)
        if os.path.exists(seg_path):
            print(f"  [SKIP] Already built: {seg_path}")
            segments.append(seg_path)
            continue

        # Screenshot
        print(f"  Screenshot: {scene['url']}")
        ok = take_screenshot(scene["url"], img_path, wait_sec=scene.get("wait", 5))
        if not ok:
            print(f"  [WARN] Using title card fallback for {scene['id']}")
            build_title_card(
                scene["id"].replace("_", " ").title(),
                scene["url"],
                img_path
            )

        # Voice narration
        word_count = len(scene["text"].split())
        print(f"  Generating narration ({word_count} words)...")
        voice_ok = await generate_voice(scene["text"], audio_path)
        if not voice_ok:
            print(f"  [WARN] Voice failed for {scene['id']}")
            continue

        # Assemble segment
        print(f"  Assembling segment...")
        seg_ok = build_segment(img_path, audio_path, seg_path, hold=scene.get("hold", 2))
        if seg_ok:
            segments.append(seg_path)
            size_kb = os.path.getsize(seg_path) // 1024
            print(f"  [OK] Segment ready ({size_kb} KB): {seg_path}")
        else:
            print(f"  [FAIL] Segment assembly failed for {scene['id']}")

    # Concatenate all segments
    print(f"\n[FINAL] Concatenating {len(segments)} segments...")
    concat_list = str(OUT_DIR / "concat_list.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for seg in segments:
            f.write(f"file '{os.path.abspath(seg).replace(chr(92), '/')}'\n")

    cmd = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list,
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        FINAL_OUT,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode == 0:
        size_mb = os.path.getsize(FINAL_OUT) / (1024 * 1024)
        print(f"\n{'='*60}")
        print(f"  SUCCESS! Video saved: {FINAL_OUT}")
        print(f"  File size: {size_mb:.1f} MB")
        print(f"  Segments: {len(segments)}")
        print(f"{'='*60}")
    else:
        print(f"\n  FAILED. FFmpeg error:")
        print(result.stderr[-3000:])


if __name__ == "__main__":
    asyncio.run(main())
