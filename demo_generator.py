"""
RentalHub Demo Video Generator — Pillow-based slide renderer
============================================================
Strategy:
 - Fetch live data from the running API (port 5050) using requests
 - Render beautiful, data-rich 1920×1080 slides with Pillow
 - Generate per-scene TTS WAV files using pyttsx3 (Microsoft David)
 - Assemble each slide + audio into an MP4 with FFmpeg
 - Concatenate all segments into rentalhub_demo.mp4
"""

import os, sys, time, json, math, textwrap, subprocess, traceback
from pathlib import Path
from io import BytesIO

import requests
import pyttsx3
from PIL import Image, ImageDraw, ImageFont

# ── Directories ─────────────────────────────────────────────────────────────
ROOT   = Path(__file__).parent
FRAMES = ROOT / "demo_frames";  FRAMES.mkdir(exist_ok=True)
AUDIO  = ROOT / "demo_audio";   AUDIO.mkdir(exist_ok=True)
SEGS   = ROOT / "demo_segments"; SEGS.mkdir(exist_ok=True)
OUTPUT = ROOT / "rentalhub_demo.mp4"

W, H = 1920, 1080

# ── Colour palette (matches RentalHub Bootstrap theme) ──────────────────────
BG        = (15,  23,  42)   # slate-900
BG2       = (30,  41,  59)   # slate-800
BG3       = (51,  65,  85)   # slate-700
ACCENT    = (59, 130, 246)   # blue-500
ACCENT2   = (16, 185, 129)   # emerald-500
DANGER    = (239, 68,  68)   # red-500
WARN      = (245,158, 11)    # amber-500
MUTED     = (148,163,184)    # slate-400
WHITE     = (255,255,255)
TEXT      = (226,232,240)    # slate-200
CARD      = (30, 41,  59)    # card background

# ── Font helpers ─────────────────────────────────────────────────────────────
def font(size, bold=False):
    """Load Arial (always available on Windows)."""
    face = "arialbd.ttf" if bold else "arial.ttf"
    try:
        return ImageFont.truetype(face, size)
    except:
        return ImageFont.load_default()

F_TINY   = font(18)
F_SM     = font(22)
F_BODY   = font(26)
F_MD     = font(30)
F_LG     = font(36)
F_XL     = font(48, bold=True)
F_2XL    = font(60, bold=True)
F_3XL    = font(80, bold=True)
F_HERO   = font(96, bold=True)

# ── Drawing helpers ───────────────────────────────────────────────────────────
def new_canvas():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)

def draw_rect(d, x, y, w, h, fill, radius=12):
    d.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill)

def draw_pill(d, x, y, text, fill=ACCENT, tf=WHITE, f=None):
    f = f or F_SM
    bbox = f.getbbox(text)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    pw, ph = tw+24, th+12
    d.rounded_rectangle([x, y, x+pw, y+ph], radius=ph//2, fill=fill)
    d.text((x+12, y+6), text, fill=tf, font=f)
    return pw

def draw_stars(d, x, y, rating, size=20):
    for i in range(5):
        col = WARN if i < round(rating) else BG3
        d.regular_polygon((x + i*(size+4) + size//2, y + size//2, size//2), 5, rotation=54, fill=col)

def draw_card(d, x, y, w, h, fill=CARD, radius=14):
    # Shadow
    d.rounded_rectangle([x+4, y+4, x+w+4, y+h+4], radius=radius, fill=(0,0,0,80) if hasattr(d,'im') else (8,12,20))
    d.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill)

def navbar(img, d, title="RentalHub"):
    d.rectangle([0, 0, W, 72], fill=(10,15,30))
    # Logo
    draw_rect(d, 24, 14, 44, 44, ACCENT, radius=8)
    d.text((38, 22), "R", fill=WHITE, font=F_XL)
    d.text((76, 23), title, fill=WHITE, font=font(28, bold=True))
    # Nav links
    links = ["Home", "Equipment", "Compare", "Login"]
    lx = W - 60
    for lnk in reversed(links):
        bbox = F_BODY.getbbox(lnk)
        lw = bbox[2]-bbox[0]
        d.text((lx-lw, 25), lnk, fill=MUTED, font=F_BODY)
        lx -= lw + 40

def footer(d):
    d.rectangle([0, H-52, W, H], fill=(10,15,30))
    d.text((W//2, H-26), "© 2025 RentalHub · Equipment Rental Marketplace · MERN Stack",
           fill=MUTED, font=F_SM, anchor="mm")

def section_header(d, x, y, title, subtitle=""):
    d.text((x, y), title, fill=WHITE, font=F_2XL)
    if subtitle:
        d.text((x, y+68), subtitle, fill=MUTED, font=F_LG)

# ── API helpers ───────────────────────────────────────────────────────────────
API = "http://localhost:5050/api"
_tok = {}

def api_get(path, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = requests.get(API + path, headers=headers, timeout=5)
        return r.json()
    except Exception as e:
        print(f"  [API] WARN: {path} → {e}")
        return {}

def login(email, password):
    try:
        r = requests.post(API + "/auth/login", json={"email": email, "password": password}, timeout=5)
        d = r.json()
        return d.get("token", "")
    except:
        return ""

# ═══════════════════════════════════════════════════════════════════════════
#  SLIDE RENDERERS
# ═══════════════════════════════════════════════════════════════════════════

def slide_title_card():
    img, d = new_canvas()
    # gradient-ish background bars
    for i in range(8):
        alpha = 30 + i*8
        d.rectangle([0, H//2 - 200 + i*50, W, H//2 - 160 + i*50], fill=(20+i*3, 30+i*4, 55+i*5))
    # Accent bar top
    d.rectangle([0, 0, W, 8], fill=ACCENT)
    d.rectangle([0, H-8, W, H], fill=ACCENT)

    # Logo block
    draw_rect(d, W//2-56, 260, 112, 112, ACCENT, radius=20)
    d.text((W//2, 316), "R", fill=WHITE, font=font(86, bold=True), anchor="mm")

    d.text((W//2, 420), "RentalHub", fill=WHITE, font=F_HERO, anchor="mm")
    d.text((W//2, 520), "Equipment Rental Marketplace", fill=ACCENT, font=F_2XL, anchor="mm")

    # Tech badges
    techs = ["React.js", "Node.js", "Express", "MongoDB", "Bootstrap 5", "JWT Auth"]
    total_w = sum(font(22, bold=True).getbbox(t)[2] + 56 for t in techs)
    tx = (W - total_w) // 2
    for t in techs:
        pw = draw_pill(d, tx, 620, t, fill=BG2, tf=ACCENT, f=font(22, bold=True))
        tx += pw + 16

    d.text((W//2, 730), "Full-Stack MERN Application · Role-Based Access · Double-Booking Prevention",
           fill=MUTED, font=F_MD, anchor="mm")
    footer(d)
    return img


def slide_landing(data):
    img, d = new_canvas()
    navbar(img, d)

    # Hero section
    d.rectangle([0, 72, W, 400], fill=(20, 30, 50))
    # Decorative circles
    d.ellipse([W-350, -80, W+80, 350], fill=(30, 50, 90))
    d.ellipse([W-200, 180, W+100, 450], fill=(20, 40, 80))

    d.text((80, 110), "Rent Any Equipment,", fill=WHITE, font=F_3XL)
    d.text((80, 195), "Anywhere, Anytime.", fill=ACCENT, font=F_3XL)
    d.text((80, 288), "Browse 12+ premium equipment listings from verified owners.", fill=MUTED, font=F_LG)

    # Search bar
    draw_rect(d, 80, 330, 900, 56, WHITE, radius=8)
    d.text((100, 344), "🔍  Search equipment — e.g. excavator, camera, drone...", fill=(100,116,139), font=F_MD)
    draw_rect(d, 990, 330, 180, 56, ACCENT, radius=8)
    d.text((1080, 358), "Search", fill=WHITE, font=font(24, bold=True), anchor="mm")

    # Category pills
    cats = data.get("categories", [])
    cat_y = 420
    d.text((80, cat_y), "Browse by Category", fill=WHITE, font=F_XL)

    cat_icons = {"Construction": "🏗️", "Photography": "📷", "Audio/Visual": "🎬",
                 "Outdoor": "⛺", "Automotive": "🚗", "Technology": "💻"}
    cx = 80
    for i, cat in enumerate(cats[:6]):
        cname = cat.get("name","") if isinstance(cat, dict) else str(cat)
        icon = cat_icons.get(cname, "📦")
        draw_card(d, cx, cat_y+60, 270, 110)
        d.text((cx+135, cat_y+100), icon, font=font(34), anchor="mm")
        d.text((cx+135, cat_y+136), cname, fill=TEXT, font=F_SM, anchor="mm")
        cx += 290

    # Featured cards
    eq = data.get("equipment", [])
    d.text((80, 620), "Featured Equipment", fill=WHITE, font=F_XL)
    card_w = 370
    for i, item in enumerate(eq[:4]):
        ix = 80 + i*(card_w+20)
        draw_card(d, ix, 670, card_w, 340)
        # Image placeholder
        draw_rect(d, ix+10, 680, card_w-20, 160, BG3, radius=8)
        d.text((ix+card_w//2, 760), "📷", font=font(50), anchor="mm")
        # Info
        nm = item.get("name","Equipment")[:28]
        d.text((ix+12, 850), nm, fill=WHITE, font=font(22, bold=True))
        rate = item.get("dailyRate", 0)
        d.text((ix+12, 880), f"${rate}/day", fill=ACCENT, font=F_MD)
        rating = item.get("rating", 0)
        draw_stars(d, ix+12, 915, rating, size=18)
        city = item.get("location",{}).get("city","") if isinstance(item.get("location"),dict) else ""
        d.text((ix+12, 945), f"📍 {city}", fill=MUTED, font=F_SM)
        draw_pill(d, ix+12, 975, "View Details", fill=ACCENT, f=font(20, bold=True))

    footer(d)
    return img


def slide_catalog(data):
    img, d = new_canvas()
    navbar(img, d)
    section_header(d, 80, 90, "Equipment Catalog", "Browse & filter 12+ listings")

    # Sidebar
    draw_card(d, 30, 160, 280, 860)
    d.text((46, 180), "FILTERS", fill=ACCENT, font=font(18, bold=True))

    # Filter sections
    fy = 220
    for section, items in [
        ("Category", ["All", "Construction", "Photography", "Audio/Visual"]),
        ("Condition", ["Excellent", "Good", "Fair"]),
        ("Price Range", ["Under $50", "$50–$150", "$150+"]),
        ("Min Rating", ["★★★★★ 5", "★★★★ 4+", "★★★ 3+"]),
    ]:
        d.text((46, fy), section, fill=TEXT, font=font(20, bold=True))
        fy += 30
        for item in items:
            col = ACCENT if item in ("All","Excellent") else MUTED
            check = "◉" if item in ("All","Excellent") else "○"
            d.text((46, fy), f"  {check} {item}", fill=col, font=F_SM)
            fy += 28
        fy += 18

    # Sort bar
    draw_rect(d, 330, 160, W-360, 48, BG2, radius=8)
    d.text((345, 177), "Sort by:", fill=MUTED, font=F_SM)
    for i, s in enumerate(["Newest", "Price ↑", "Price ↓", "Rating"]):
        col = ACCENT if i == 0 else MUTED
        fw = font(22, bold=(i==0))
        d.text((440 + i*130, 177), s, fill=col, font=fw)

    # Equipment grid
    eq = data.get("equipment", [])
    card_w, card_h = 380, 300
    cols = 4
    for idx, item in enumerate(eq[:8]):
        row, col = idx // cols, idx % cols
        cx = 330 + col*(card_w+14)
        cy = 225 + row*(card_h+14)
        draw_card(d, cx, cy, card_w, card_h)
        # Image area
        draw_rect(d, cx+8, cy+8, card_w-16, 130, BG3, radius=8)
        d.text((cx+card_w//2, cy+73), "📸", font=font(40), anchor="mm")
        # Condition badge
        cond = item.get("condition","Good")
        pill_col = ACCENT2 if cond == "Excellent" else (ACCENT if cond == "Good" else WARN)
        draw_pill(d, cx+card_w-90, cy+12, cond, fill=pill_col, f=font(14))
        # Info
        nm = item.get("name","Equipment")[:22]
        d.text((cx+10, cy+148), nm, fill=WHITE, font=font(20, bold=True))
        rate = item.get("dailyRate",0)
        d.text((cx+10, cy+175), f"${rate}/day", fill=ACCENT, font=font(22, bold=True))
        rating = item.get("rating",0)
        draw_stars(d, cx+10, cy+205, rating, size=14)
        nr = item.get("numReviews",0)
        d.text((cx+90, cy+208), f"({nr})", fill=MUTED, font=font(16))
        city = ""
        if isinstance(item.get("location"), dict):
            city = item["location"].get("city","")
        d.text((cx+10, cy+228), f"📍 {city}", fill=MUTED, font=font(16))
        draw_pill(d, cx+10, cy+258, "+ Compare", fill=BG3, tf=ACCENT, f=font(16))
        draw_pill(d, cx+100, cy+258, "Rent Now", fill=ACCENT, f=font(16))

    footer(d)
    return img


def slide_detail(data):
    img, d = new_canvas()
    navbar(img, d)

    eq = data.get("equipment", [{}])
    item = eq[0] if eq else {}
    nm = item.get("name","Compact Excavator")
    daily = item.get("dailyRate", 125)
    weekly = item.get("weeklyRate", 700)
    deposit = item.get("securityDeposit", 500)
    rating = item.get("rating", 4.8)
    nr = item.get("numReviews", 12)
    desc = item.get("description","Premium construction equipment available for rent.")
    cond = item.get("condition","Excellent")

    d.text((60, 88), nm, fill=WHITE, font=F_2XL)
    draw_stars(d, 62, 153), None
    draw_stars(d, 62, 153, rating, size=22)
    d.text((190, 156), f"{rating:.1f} ({nr} reviews)", fill=MUTED, font=F_MD)
    draw_pill(d, 420, 150, cond, fill=ACCENT2)

    # Image gallery (left)
    draw_rect(d, 60, 200, 800, 480, BG3, radius=12)
    d.text((460, 440), "📷", font=font(90), anchor="mm")
    d.text((460, 540), "Equipment Photo Gallery", fill=MUTED, font=F_MD, anchor="mm")
    # Thumbnails
    for ti in range(4):
        draw_rect(d, 60 + ti*205, 692, 190, 100, BG2, radius=8)
        d.text((155 + ti*205, 742), f"📸", font=font(30), anchor="mm")

    # Specs table (center-right)
    sx, sy = 890, 200
    d.text((sx, sy), "Specifications", fill=WHITE, font=F_XL)
    specs = item.get("specs", [])
    if not specs:
        specs = [{"label":"Weight","value":"6,800 kg"},{"label":"Engine","value":"55 HP Diesel"},
                 {"label":"Dig Depth","value":"3.9 m"},{"label":"Bucket Cap","value":"0.22 m³"},
                 {"label":"Category","value":"Construction"}]
    for i, sp in enumerate(specs[:6]):
        row_col = BG2 if i%2==0 else BG
        draw_rect(d, sx, sy+60+i*52, 680, 46, row_col, radius=6)
        label = sp.get("label","") if isinstance(sp,dict) else str(sp)
        val   = sp.get("value","") if isinstance(sp,dict) else ""
        d.text((sx+16, sy+70+i*52), label, fill=MUTED, font=F_SM)
        d.text((sx+400, sy+70+i*52), val, fill=TEXT, font=F_SM)

    # Booking widget (far right)
    bx, by = 1590, 200
    draw_card(d, bx, by, 300, 600, fill=BG2, radius=14)
    d.text((bx+150, by+30), "Book This Equipment", fill=WHITE, font=font(20, bold=True), anchor="mm")
    # Price summary
    draw_rect(d, bx+10, by+60, 280, 60, BG3, radius=8)
    d.text((bx+20, by+70), "Daily Rate", fill=MUTED, font=F_SM)
    d.text((bx+20, by+92), f"${daily}", fill=ACCENT, font=font(26, bold=True))
    d.text((bx+160, by+70), "Weekly Rate", fill=MUTED, font=F_SM)
    d.text((bx+160, by+92), f"${weekly}", fill=ACCENT, font=font(26, bold=True))

    d.text((bx+20, by+140), "Start Date", fill=MUTED, font=F_SM)
    draw_rect(d, bx+10, by+160, 280, 44, BG, radius=6)
    d.text((bx+20, by+172), "📅  2025-11-01", fill=TEXT, font=F_MD)
    d.text((bx+20, by+220), "End Date", fill=MUTED, font=F_SM)
    draw_rect(d, bx+10, by+240, 280, 44, BG, radius=6)
    d.text((bx+20, by+252), "📅  2025-11-07", fill=TEXT, font=F_MD)

    # Price calc
    draw_rect(d, bx+10, by+310, 280, 100, BG3, radius=8)
    d.text((bx+20, by+320), "7 days × $125", fill=MUTED, font=F_SM)
    d.text((bx+20, by+344), "Subtotal:  $875", fill=TEXT, font=F_MD)
    d.text((bx+20, by+370), f"Deposit:  ${deposit}", fill=TEXT, font=F_MD)
    d.rectangle([bx+10, by+398, bx+290, by+400], fill=BG)
    d.text((bx+20, by+404), f"TOTAL:  ${875+deposit}", fill=WHITE, font=font(22, bold=True))

    draw_rect(d, bx+10, by+440, 280, 52, ACCENT, radius=8)
    d.text((bx+150, by+466), "Reserve Now", fill=WHITE, font=font(22, bold=True), anchor="mm")
    draw_rect(d, bx+10, by+504, 280, 40, BG3, radius=8)
    d.text((bx+150, by+524), "+ Add to Compare", fill=MUTED, font=F_SM, anchor="mm")

    # Availability calendar
    d.text((sx, sy+400), "Availability Calendar", fill=WHITE, font=F_XL)
    days = ["Mo","Tu","We","Th","Fr","Sa","Su"]
    for di, day in enumerate(days):
        d.text((sx + di*90 + 35, sy+460), day, fill=MUTED, font=F_SM, anchor="mm")
    for week in range(3):
        for di in range(7):
            day_n = week*7 + di + 1
            cx2 = sx + di*90
            cy2 = sy + 480 + week*68
            booked = day_n in [3,4,5,10,11]
            col = (DANGER[0]//2, DANGER[1]//3, DANGER[2]//3) if booked else BG2
            draw_rect(d, cx2, cy2, 80, 54, col, radius=6)
            tcol = (DANGER[0]//2+60, 60, 60) if booked else TEXT
            d.text((cx2+40, cy2+27), str(day_n), fill=tcol, font=F_MD, anchor="mm")
            if booked:
                d.text((cx2+40, cy2+42), "Booked", fill=(180,60,60), font=font(11), anchor="mm")

    footer(d)
    return img


def slide_login():
    img, d = new_canvas()
    navbar(img, d)

    # Center card
    cw, ch = 560, 620
    cx, cy = (W-cw)//2, 130
    draw_card(d, cx, cy, cw, ch, fill=BG2, radius=16)

    d.text((W//2, cy+50), "Welcome Back", fill=WHITE, font=F_2XL, anchor="mm")
    d.text((W//2, cy+100), "Sign in to your RentalHub account", fill=MUTED, font=F_MD, anchor="mm")

    # Fields
    for i, (label, val, typ) in enumerate([
        ("Email Address", "john@example.com", "text"),
        ("Password", "••••••••••••", "password"),
    ]):
        fy = cy + 150 + i * 110
        d.text((cx+30, fy), label, fill=MUTED, font=F_SM)
        draw_rect(d, cx+20, fy+30, cw-40, 52, BG, radius=8)
        d.text((cx+40, fy+46), val, fill=TEXT if typ=="text" else MUTED, font=F_MD)

    # Submit
    draw_rect(d, cx+20, cy+395, cw-40, 56, ACCENT, radius=8)
    d.text((W//2, cy+423), "Sign In", fill=WHITE, font=font(26, bold=True), anchor="mm")

    d.text((W//2, cy+470), "Don't have an account?  Register →", fill=ACCENT, font=F_MD, anchor="mm")

    # Quick logins
    d.text((W//2, cy+520), "Quick Demo Login:", fill=MUTED, font=F_SM, anchor="mm")
    roles = [("Admin", DANGER), ("Owner", WARN), ("Customer", ACCENT2)]
    qx = cx + 20
    for rname, rcol in roles:
        pw = draw_pill(d, qx, cy+548, f"Login as {rname}", fill=rcol, f=font(20))
        qx += pw + 16

    # Right: Feature highlights
    fx = cx + cw + 80
    fy2 = 200
    d.text((fx, fy2), "Secure Authentication", fill=WHITE, font=F_XL)
    features = [
        ("🔐", "JWT tokens with bcrypt password hashing"),
        ("👥", "3 roles: Customer · Owner · Admin"),
        ("🛡️", "Route-level RBAC middleware protection"),
        ("📧", "Real-time notification system"),
        ("📊", "Role-specific dashboards"),
    ]
    for icon, text2 in features:
        fy2 += 70
        draw_rect(d, fx, fy2, 580, 54, BG2, radius=8)
        d.text((fx+16, fy2+14), icon, font=font(28))
        d.text((fx+58, fy2+16), text2, fill=TEXT, font=F_MD)

    footer(d)
    return img


def slide_register():
    img, d = new_canvas()
    navbar(img, d)

    cw, ch = 620, 680
    cx, cy = (W-cw)//2 - 200, 100
    draw_card(d, cx, cy, cw, ch, fill=BG2, radius=16)

    d.text((cx+cw//2, cy+45), "Create Your Account", fill=WHITE, font=F_2XL, anchor="mm")

    # Role toggle
    draw_rect(d, cx+20, cy+80, cw-40, 50, BG, radius=25)
    draw_rect(d, cx+20, cy+80, (cw-40)//2, 50, ACCENT, radius=25)
    d.text((cx+20+(cw-40)//4, cy+105), "Customer", fill=WHITE, font=font(22, bold=True), anchor="mm")
    d.text((cx+20+3*(cw-40)//4, cy+105), "Equipment Owner", fill=MUTED, font=F_SM, anchor="mm")

    fields = [
        ("Full Name", "John Smith"),
        ("Email Address", "john@example.com"),
        ("Phone Number", "+1 555-0100"),
        ("Password", "••••••••"),
        ("Confirm Password", "••••••••"),
    ]
    for i, (label, val) in enumerate(fields):
        fy = cy + 150 + i*96
        d.text((cx+30, fy), label, fill=MUTED, font=F_SM)
        draw_rect(d, cx+20, fy+28, cw-40, 52, BG, radius=8)
        d.text((cx+40, fy+42), val, fill=TEXT, font=F_MD)

    draw_rect(d, cx+20, cy+640, cw-40, 56, ACCENT2, radius=8)
    d.text((cx+cw//2, cy+668), "Create Account", fill=WHITE, font=font(26, bold=True), anchor="mm")

    # Callout right
    fx = cx + cw + 80
    fy2 = 150
    d.text((fx, fy2), "What's included?", fill=WHITE, font=F_XL)
    perks = [
        ("✅", "Browse unlimited equipment listings"),
        ("✅", "Book equipment with date conflict prevention"),
        ("✅", "Track all rentals from your dashboard"),
        ("✅", "Leave reviews after completed rentals"),
        ("✅", "Real-time notifications on booking updates"),
        ("✅", "Compare up to 4 equipment items side-by-side"),
    ]
    for icon, text2 in perks:
        fy2 += 68
        draw_rect(d, fx, fy2, 560, 54, BG2, radius=8)
        d.text((fx+16, fy2+14), icon, font=font(26))
        d.text((fx+58, fy2+16), text2, fill=TEXT, font=F_MD)

    footer(d)
    return img


def slide_customer_dashboard(data, tok):
    img, d = new_canvas()
    navbar(img, d)

    d.text((60, 88), "Customer Dashboard", fill=WHITE, font=F_2XL)
    d.text((60, 148), "Welcome back, John Smith", fill=MUTED, font=F_LG)

    bdata = data.get("bookings", {})
    bookings = bdata.get("bookings", []) if isinstance(bdata, dict) else []

    # Stats row
    stats = [
        ("Total Rentals", len(bookings) or 4, ACCENT),
        ("Active Now", 1, ACCENT2),
        ("Completed", 2, (99,102,241)),
        ("Pending", 1, WARN),
    ]
    for i, (label, val, col) in enumerate(stats):
        sx = 60 + i*340
        draw_card(d, sx, 200, 310, 120)
        draw_rect(d, sx+12, 212, 6, 96, col, radius=3)
        d.text((sx+36, 230), str(val), fill=WHITE, font=F_3XL)
        d.text((sx+36, 310), label, fill=MUTED, font=F_MD)

    # Tabs
    draw_rect(d, 60, 345, 200, 44, ACCENT, radius=8)
    d.text((160, 367), "My Bookings", fill=WHITE, font=font(22,bold=True), anchor="mm")
    d.text((290, 367), "Reviews", fill=MUTED, font=F_MD)
    d.text((400, 367), "Notifications", fill=MUTED, font=F_MD)

    # Booking rows
    sample_bookings = [
        {"equipment":{"name":"Compact Excavator"}, "startDate":"2025-10-15", "endDate":"2025-10-20", "status":"active", "totalCost":625},
        {"equipment":{"name":"Canon C70 Camera Kit"}, "startDate":"2025-09-01", "endDate":"2025-09-05", "status":"completed", "totalCost":1596},
        {"equipment":{"name":"JBL PRX Sound System"}, "startDate":"2025-08-10", "endDate":"2025-08-11", "status":"completed", "totalCost":350},
        {"equipment":{"name":"DJI Matrice 300 RTK"}, "startDate":"2025-11-01", "endDate":"2025-11-03", "status":"pending", "totalCost":598},
    ]
    real = bookings[:4] if bookings else sample_bookings

    d.rectangle([60, 400, W-60, 402], fill=BG3)
    # Header
    hx = 60
    for hdr, hw in [("Equipment",380),("Dates",300),("Duration",160),("Cost",160),("Status",160),("Actions",200)]:
        d.text((hx+10, 414), hdr, fill=MUTED, font=font(18,bold=True))
        hx += hw

    status_colors = {"active":ACCENT2,"completed":(99,102,241),"pending":WARN,"confirmed":ACCENT,"cancelled":DANGER}
    for i, bk in enumerate(real[:5]):
        ry = 450 + i*90
        row_col = BG2 if i%2==0 else BG
        draw_rect(d, 60, ry, W-120, 80, row_col, radius=6)
        nm = bk.get("equipment",{}).get("name","Equipment") if isinstance(bk.get("equipment"),dict) else "Equipment"
        sd = str(bk.get("startDate",""))[:10]
        ed = str(bk.get("endDate",""))[:10]
        cost = bk.get("totalCost",0)
        status = bk.get("status","pending")

        row_vals = [nm[:26], f"{sd}  →  {ed}", "5 days", f"${cost}", status.capitalize()]
        hx = 60
        widths = [380,300,160,160,160]
        for j, (val, hw) in enumerate(zip(row_vals, widths)):
            if j == 4:
                sc = status_colors.get(status, MUTED)
                draw_pill(d, hx+8, ry+24, val, fill=sc, f=font(18))
            else:
                d.text((hx+10, ry+27), val, fill=TEXT if j==0 else MUTED, font=F_SM if j>0 else font(22))
            hx += hw
        # Actions
        if status == "pending":
            draw_pill(d, hx+10, ry+24, "Cancel", fill=DANGER, f=font(18))
        elif status == "completed":
            draw_pill(d, hx+10, ry+24, "Review", fill=BG3, tf=ACCENT, f=font(18))

    footer(d)
    return img


def slide_compare(data):
    img, d = new_canvas()
    navbar(img, d)
    section_header(d, 60, 88, "Equipment Comparison", "Side-by-side specification matrix")

    eq = data.get("equipment", [])
    items = eq[:3] if len(eq) >= 3 else eq

    col_w = (W - 120 - 260) // max(len(items), 1)
    header_y = 180

    # Feature labels
    features = [
        ("Daily Rate","dailyRate","${v}"),("Weekly Rate","weeklyRate","${v}"),
        ("Security Deposit","securityDeposit","${v}"),("Condition","condition","{v}"),
        ("Rating","rating","{v} ★"),("Reviews","numReviews","{v} reviews"),
        ("Location","location","📍 {v}"),("Category","category","{v}"),
    ]

    # Column headers
    for i, item in enumerate(items):
        cx = 280 + i*col_w
        draw_card(d, cx+4, header_y, col_w-8, 180, fill=BG2, radius=12)
        draw_rect(d, cx+4, header_y, col_w-8, 80, BG3, radius=12)
        d.text((cx+col_w//2, header_y+40), "📷", font=font(40), anchor="mm")
        nm = item.get("name","")[:22]
        d.text((cx+col_w//2, header_y+100), nm, fill=WHITE, font=font(20,bold=True), anchor="mm")
        rate = item.get("dailyRate",0)
        d.text((cx+col_w//2, header_y+128), f"${rate}/day", fill=ACCENT, font=font(22,bold=True), anchor="mm")
        draw_stars(d, cx+col_w//2-52, header_y+155, item.get("rating",0), size=16)

    # Feature rows
    for fi, (label, key, fmt) in enumerate(features):
        ry = header_y + 200 + fi * 68
        row_bg = BG2 if fi%2==0 else BG
        # Label col
        draw_rect(d, 60, ry, 220, 60, row_bg, radius=6)
        d.text((70, ry+18), label, fill=MUTED, font=font(20,bold=True))
        # Value cols
        for i, item in enumerate(items):
            cx = 280 + i*col_w
            draw_rect(d, cx+4, ry, col_w-8, 60, row_bg, radius=6)
            raw = item.get(key,"—")
            if key=="location" and isinstance(raw,dict):
                raw = raw.get("city","—")
            if key=="category" and isinstance(raw,dict):
                raw = raw.get("name","—")
            val = fmt.replace("{v}", str(raw)).replace("$","$")
            d.text((cx+col_w//2, ry+18), val, fill=TEXT, font=F_MD, anchor="mm")

    # Rent buttons
    for i, item in enumerate(items):
        cx = 280 + i*col_w
        ry2 = header_y + 200 + len(features)*68 + 16
        draw_rect(d, cx+4, ry2, col_w-8, 52, ACCENT, radius=8)
        d.text((cx+col_w//2, ry2+26), "Rent Now", fill=WHITE, font=font(22,bold=True), anchor="mm")

    footer(d)
    return img


def slide_owner_dashboard(data, tok):
    img, d = new_canvas()
    navbar(img, d)

    d.text((60, 88), "Owner Dashboard", fill=WHITE, font=F_2XL)
    d.text((60, 148), "Apex Construction Gear · Business Portal", fill=MUTED, font=F_LG)

    # KPI row
    kpis = [
        ("Total Listings", "6", ACCENT, "📦"),
        ("Monthly Revenue", "$4,280", ACCENT2, "💰"),
        ("Active Rentals", "2", WARN, "🔄"),
        ("Pending Requests", "1", DANGER, "⏳"),
    ]
    for i, (label, val, col, icon) in enumerate(kpis):
        sx = 60 + i*430
        draw_card(d, sx, 200, 400, 130)
        draw_rect(d, sx+12, 212, 6, 106, col, radius=3)
        d.text((sx+36, 218), icon, font=font(36))
        d.text((sx+36, 264), val, fill=col, font=F_2XL)
        d.text((sx+36, 318), label, fill=MUTED, font=F_MD)

    # Tabs
    tabs = ["Booking Requests", "My Listings", "Availability"]
    for i, tab in enumerate(tabs):
        col = ACCENT if i==0 else MUTED
        fw = font(22,bold=(i==0))
        draw_rect(d, 60+i*260, 355, 240, 44, BG2 if i>0 else ACCENT, radius=8)
        d.text((180+i*260, 377), tab, fill=WHITE if i==0 else MUTED, font=fw, anchor="mm")

    # Booking request table
    bookings = [
        {"customer":"John Smith","equipment":"Compact Excavator","dates":"Nov 1–5","days":5,"cost":"$625","status":"pending"},
        {"customer":"Sarah Lee","equipment":"Bobcat S550","dates":"Oct 20–25","days":5,"cost":"$625","status":"confirmed"},
        {"customer":"Mike Davis","equipment":"Backhoe Loader","dates":"Oct 10–14","days":4,"cost":"$900","status":"active"},
    ]
    draw_rect(d, 60, 415, W-120, 46, BG3, radius=6)
    for j, hdr in enumerate(["Customer","Equipment","Dates","Days","Total","Status","Actions"]):
        d.text((80+j*255, 428), hdr, fill=MUTED, font=font(18,bold=True))

    for i, bk in enumerate(bookings):
        ry = 470 + i*88
        draw_rect(d, 60, ry, W-120, 78, BG2 if i%2==0 else BG, radius=6)
        cols2 = [bk["customer"],bk["equipment"],bk["dates"],str(bk["days"]),bk["cost"],bk["status"]]
        for j, val in enumerate(cols2):
            if j==5:
                sc = {"pending":WARN,"confirmed":ACCENT,"active":ACCENT2}.get(val,MUTED)
                draw_pill(d, 80+j*255, ry+20, val.capitalize(), fill=sc, f=font(18))
            else:
                d.text((80+j*255, ry+24), val, fill=TEXT if j<2 else MUTED, font=F_SM)
        # Actions
        if bk["status"]=="pending":
            draw_pill(d, 80+6*255, ry+18, "✓ Accept", fill=ACCENT2, f=font(18))
            draw_pill(d, 80+6*255+110, ry+18, "✗ Decline", fill=DANGER, f=font(18))
        elif bk["status"]=="confirmed":
            draw_pill(d, 80+6*255, ry+18, "▶ Mark Active", fill=ACCENT, f=font(18))
        else:
            draw_pill(d, 80+6*255, ry+18, "⏹ Mark Returned", fill=BG3, tf=TEXT, f=font(18))

    footer(d)
    return img


def slide_new_listing():
    img, d = new_canvas()
    navbar(img, d)

    cw = 880
    cx = (W-cw)//2 - 160
    d.text((cx, 88), "Add New Equipment Listing", fill=WHITE, font=F_2XL)
    d.text((cx, 148), "Fill in the details to publish your equipment on the marketplace", fill=MUTED, font=F_LG)

    # Left column fields
    fields_left = [
        ("Equipment Title *", "Compact Excavator — Cat 301.7"),
        ("Category *", "Construction"),
        ("Condition *", "Excellent"),
        ("Daily Rate ($/day) *", "$125"),
        ("Weekly Rate ($/week)", "$700"),
        ("Security Deposit ($)", "$500"),
        ("City / Location *", "Chicago, IL"),
    ]
    for i, (label, val) in enumerate(fields_left):
        fy = 195 + i*100
        d.text((cx, fy), label, fill=MUTED, font=F_SM)
        draw_rect(d, cx, fy+28, 560, 52, BG2, radius=8)
        d.text((cx+16, fy+42), val, fill=TEXT, font=F_MD)

    # Right column: description + specs
    rx = cx + 600
    d.text((rx, 195), "Description *", fill=MUTED, font=F_SM)
    draw_rect(d, rx, 223, 720, 140, BG2, radius=8)
    desc_text = "A powerful compact excavator ideal for tight urban\nconstruction sites. Features advanced hydraulics,\nautomatic engine shutdown, and operator comfort cabin."
    for li, line in enumerate(desc_text.split('\n')):
        d.text((rx+16, 237+li*38), line, fill=TEXT, font=F_MD)

    d.text((rx, 380), "Technical Specifications", fill=WHITE, font=F_XL)
    spec_rows = [("Weight","6,800 kg"),("Engine Power","55 HP Diesel"),("Max Dig Depth","3.9 m"),("Bucket Capacity","0.22 m³")]
    for i,(sk,sv) in enumerate(spec_rows):
        sy = 432 + i*62
        draw_rect(d, rx, sy, 340, 52, BG2, radius=6)
        d.text((rx+12, sy+14), sk, fill=MUTED, font=F_SM)
        draw_rect(d, rx+350, sy, 360, 52, BG2, radius=6)
        d.text((rx+362, sy+14), sv, fill=TEXT, font=F_MD)
    draw_pill(d, rx, 685, "+ Add Specification Row", fill=BG3, tf=ACCENT, f=font(20))

    # Image URLs
    d.text((rx, 740), "Equipment Image URLs", fill=WHITE, font=F_LG)
    draw_rect(d, rx, 780, 720, 52, BG2, radius=8)
    d.text((rx+12, 796), "https://example.com/equipment-photo-1.jpg", fill=MUTED, font=F_MD)

    # Submit
    draw_rect(d, cx, 910, 560, 58, ACCENT, radius=8)
    d.text((cx+280, 939), "Publish Listing", fill=WHITE, font=font(26,bold=True), anchor="mm")
    draw_rect(d, cx+580, 910, 180, 58, BG2, radius=8)
    d.text((cx+670, 939), "Save Draft", fill=MUTED, font=font(24), anchor="mm")

    footer(d)
    return img


def slide_admin_dashboard(data, tok):
    img, d = new_canvas()
    navbar(img, d)

    d.text((60, 88), "Admin Console", fill=WHITE, font=F_2XL)
    d.text((60, 148), "Full platform oversight and management", fill=MUTED, font=F_LG)

    # KPI mega-row
    kpis = [
        ("Total Users", "6", ACCENT, "👥"),
        ("Equipment Listings", "12", ACCENT2, "📦"),
        ("Total Bookings", "4", (99,102,241), "📋"),
        ("GMV This Month", "$7,216", WARN, "💰"),
        ("Platform Revenue (10%)", "$721", DANGER, "📈"),
        ("Active Rentals", "1", ACCENT, "🔄"),
    ]
    kw = (W-120) // len(kpis)
    for i, (label, val, col, icon) in enumerate(kpis):
        sx = 60 + i*kw
        draw_card(d, sx, 195, kw-12, 115, fill=BG2, radius=10)
        draw_rect(d, sx+8, 206, 4, 93, col, radius=2)
        d.text((sx+24, 208), icon, font=font(26))
        d.text((sx+24, 245), val, fill=col, font=F_XL)
        d.text((sx+24, 290), label, fill=MUTED, font=font(17))

    # Tabs
    tabs = ["Overview", "Users", "Equipment", "Bookings", "Reviews"]
    for i, tab in enumerate(tabs):
        draw_rect(d, 60+i*230, 330, 210, 44, ACCENT if i==1 else BG2, radius=8)
        d.text((165+i*230, 352), tab, fill=WHITE if i==1 else MUTED, font=font(22, bold=(i==1)), anchor="mm")

    # User management table
    d.text((60, 395), "User Management", fill=WHITE, font=F_XL)
    draw_rect(d, 60, 440, W-120, 44, BG3, radius=6)
    for j, hdr in enumerate(["Name","Email","Role","Status","Joined","Actions"]):
        d.text((80+j*290, 452), hdr, fill=MUTED, font=font(18,bold=True))

    users = [
        {"name":"Admin User","email":"admin@rentalhub.com","role":"admin","status":"active","joined":"Jan 2025"},
        {"name":"Apex Gear","email":"apexgear@rentalhub.com","role":"owner","status":"active","joined":"Jan 2025"},
        {"name":"John Smith","email":"john@example.com","role":"customer","status":"active","joined":"Jan 2025"},
        {"name":"Sarah Lee","email":"sarah@example.com","role":"customer","status":"active","joined":"Jan 2025"},
        {"name":"CinePro AV","email":"cinepro@rentalhub.com","role":"owner","status":"active","joined":"Jan 2025"},
    ]
    role_cols = {"admin":DANGER,"owner":WARN,"customer":ACCENT}
    for i, u in enumerate(users):
        ry = 492 + i*82
        draw_rect(d, 60, ry, W-120, 74, BG2 if i%2==0 else BG, radius=6)
        vals = [u["name"], u["email"], u["role"].capitalize(), u["status"].capitalize(), u["joined"]]
        for j, val in enumerate(vals):
            if j==2:
                draw_pill(d, 80+j*290, ry+20, val, fill=role_cols.get(u["role"],MUTED), f=font(18))
            elif j==3:
                draw_pill(d, 80+j*290, ry+20, val, fill=ACCENT2, f=font(18))
            else:
                d.text((80+j*290, ry+22), val, fill=TEXT if j<2 else MUTED, font=F_SM)
        # Actions
        draw_pill(d, 80+5*290, ry+18, "Edit Role", fill=BG3, tf=ACCENT, f=font(17))
        draw_pill(d, 80+5*290+100, ry+18, "Suspend", fill=DANGER, f=font(17))

    footer(d)
    return img


def slide_outro():
    img, d = new_canvas()
    d.rectangle([0, 0, W, H], fill=BG)
    d.rectangle([0, 0, W, 8], fill=ACCENT)
    d.rectangle([0, H-8, W, H], fill=ACCENT)

    # Center content
    draw_rect(d, W//2-56, 200, 112, 112, ACCENT, radius=20)
    d.text((W//2, 256), "R", fill=WHITE, font=font(86,bold=True), anchor="mm")

    d.text((W//2, 360), "RentalHub", fill=WHITE, font=F_HERO, anchor="mm")
    d.text((W//2, 456), "Production-Grade Equipment Rental Marketplace", fill=ACCENT, font=F_2XL, anchor="mm")

    features2 = [
        "✅  Secure JWT Auth with RBAC (Customer · Owner · Admin)",
        "✅  Double-booking collision prevention engine",
        "✅  Real-time notifications with 30-second polling",
        "✅  Equipment comparison matrix (up to 4 items)",
        "✅  Responsive Bootstrap 5 — mobile-first design",
        "✅  RESTful Express API · MongoDB · React.js",
    ]
    for i, feat in enumerate(features2):
        d.text((W//2, 570 + i*62), feat, fill=TEXT, font=F_LG, anchor="mm")

    d.text((W//2, 960), "Built with ❤️  using MERN Stack", fill=MUTED, font=F_MD, anchor="mm")
    footer(d)
    return img


# ═══════════════════════════════════════════════════════════════════════════
#  TTS
# ═══════════════════════════════════════════════════════════════════════════

NARRATIONS = {
    "00_title": (
        "Welcome to RentalHub — a complete, production-grade equipment rental marketplace "
        "built on the MERN stack with React, Node.js, Express, and MongoDB."
    ),
    "01_landing": (
        "The landing page greets visitors with a dynamic hero section featuring a powerful search widget "
        "where customers can filter by keyword, category, and city. "
        "Below the hero, a category grid showcases all equipment types, "
        "and featured listings display real-time data including pricing, ratings, and availability. "
        "The entire layout is fully responsive using Bootstrap 5."
    ),
    "02_catalog": (
        "The Equipment Catalog is the marketplace's core browsing experience. "
        "A persistent left sidebar offers filters by category, condition, price range, and minimum star rating. "
        "Customers can sort results by newest, lowest price, highest price, or rating. "
        "Each equipment card shows a photo, condition badge, star rating, daily rate, and location. "
        "The compare toggle lets customers build a side-by-side comparison list."
    ),
    "03_detail": (
        "Clicking any listing opens the full Equipment Detail page. "
        "A photo gallery fills the left panel, technical specifications populate a structured table, "
        "and the availability calendar highlights booked dates in red. "
        "The sticky booking widget on the right calculates the total cost in real-time: "
        "daily rate multiplied by rental days, plus the security deposit. "
        "If the selected dates overlap with an existing reservation, the system blocks the booking instantly — "
        "preventing double-bookings through server-side conflict detection."
    ),
    "04_login": (
        "The login page supports all three platform roles. "
        "For quick demos, one-click login buttons for Admin, Owner, and Customer are provided. "
        "Credentials are validated against bcrypt-hashed passwords in MongoDB. "
        "On success, a signed JSON Web Token is issued and stored locally, "
        "granting access to role-specific features and protected routes."
    ),
    "05_register": (
        "New users register as either a Customer or an Equipment Owner. "
        "Toggling the role switch reveals the Business Name field for owners. "
        "All passwords are hashed with bcrypt before storage. "
        "The registration system intentionally excludes the admin role from public signup, "
        "preventing unauthorized privilege escalation."
    ),
    "06_customer": (
        "The Customer Dashboard tracks every rental in one place. "
        "Four key metrics — total rentals, active, completed, and pending — appear as stat cards. "
        "The bookings table shows equipment name, dates, duration, cost, and a live status badge. "
        "Customers can cancel pending bookings via an inline confirmation modal, "
        "and submit five-star verified reviews only after a rental is marked as returned."
    ),
    "07_compare": (
        "The Equipment Comparison Engine is one of RentalHub's standout features. "
        "Customers can add up to four items from any page using the floating compare drawer. "
        "The comparison matrix displays pricing, rates, security deposit, condition, star rating, "
        "review count, location, and full technical specifications side by side. "
        "A direct Rent Now button under each column immediately opens the booking workflow."
    ),
    "08_owner": (
        "Equipment owners access a dedicated business portal with four key performance indicators. "
        "The Booking Requests tab lists all incoming reservations with Accept and Decline buttons for pending ones, "
        "a Mark Active button once equipment is collected, and a Mark Returned button to close the rental. "
        "Each status change automatically triggers a notification to the customer. "
        "The My Listings tab lets owners manage inventory, toggle availability, and edit equipment details."
    ),
    "09_new_listing": (
        "Creating a new listing is straightforward. "
        "Owners fill in a rich form with title, category, condition, daily rate, weekly rate, "
        "security deposit, city, description, image URLs, and dynamic technical specification rows. "
        "All required fields are validated before submission, "
        "and the listing appears instantly on the public marketplace upon publishing."
    ),
    "10_admin": (
        "The Administrator Console is the platform's nerve center. "
        "Six key performance indicators show total users, listings, bookings, "
        "gross merchandise volume, estimated platform revenue, and active rentals. "
        "The Users tab allows filtering by role, searching by name or email, "
        "toggling account suspension, and changing user roles. "
        "Admins can also curate featured equipment, manage categories, "
        "audit all global bookings, and moderate or remove customer reviews. "
        "Every administrative action triggers appropriate notifications to affected users."
    ),
    "11_outro": (
        "RentalHub demonstrates a complete, production-ready MERN stack application "
        "with secure authentication, role-based access control, real-time features, "
        "and a professional marketplace experience. "
        "Thank you for watching this full walkthrough of RentalHub."
    ),
}

def tts(slug, out_path):
    if out_path.exists() and out_path.stat().st_size > 1000:
        print(f"  [TTS] Reusing: {out_path.name}")
        return
    text = NARRATIONS.get(slug, "RentalHub demo.")
    engine = pyttsx3.init()
    for v in engine.getProperty('voices'):
        if 'David' in v.name:
            engine.setProperty('voice', v.id)
            break
    engine.setProperty('rate', 162)
    engine.setProperty('volume', 1.0)
    engine.save_to_file(text, str(out_path))
    engine.runAndWait()
    engine.stop()
    time.sleep(0.4)
    print(f"  [TTS] {out_path.name} — {out_path.stat().st_size if out_path.exists() else 0} bytes")

# ═══════════════════════════════════════════════════════════════════════════
#  FFMPEG HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def audio_duration(wav):
    r = subprocess.run(["ffmpeg","-i",str(wav),"-f","null","-"],
                       capture_output=True, text=True)
    for line in r.stderr.split('\n'):
        if 'Duration:' in line:
            p = line.split('Duration:')[1].split(',')[0].strip()
            h,m,s = p.split(':')
            return float(h)*3600+float(m)*60+float(s)
    return 6.0

def make_segment(slug, img, wav, out, pad=2.0):
    if out.exists():
        print(f"  [SEG] Reusing: {out.name}")
        return True
    dur = audio_duration(wav) + pad
    cmd = ["ffmpeg","-y",
           "-loop","1","-framerate","24","-i",str(img),
           "-i",str(wav),
           "-c:v","libx264","-tune","stillimage",
           "-c:a","aac","-b:a","192k",
           "-pix_fmt","yuv420p",
           "-t",str(dur),
           "-vf","scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
           "-shortest",str(out)]
    r = subprocess.run(cmd, capture_output=True, timeout=120)
    if out.exists():
        print(f"  [SEG] ✓ {out.name}  ({dur:.1f}s)")
        return True
    print(f"  [SEG] ✗ {slug}: {r.stderr[-400:].decode(errors='replace')}")
    return False

def make_title_segment(out_mp4, dur=5):
    title_raw = SEGS / "title_raw.mp4"
    cmd = ["ffmpeg","-y","-f","lavfi",
           "-i",f"color=c=0x0f172a:s=1920x1080:d={dur}",
           "-c:v","libx264","-pix_fmt","yuv420p","-an",str(title_raw)]
    subprocess.run(cmd, capture_output=True, timeout=60)
    # overlay the title image instead
    return title_raw

def concat(segs, out):
    lst = SEGS / "concat.txt"
    with open(lst,"w") as f:
        for s in segs:
            f.write(f"file '{s.resolve()}'\n")
    cmd = ["ffmpeg","-y","-f","concat","-safe","0","-i",str(lst),
           "-c:v","libx264","-c:a","aac","-b:a","192k","-movflags","+faststart",str(out)]
    r = subprocess.run(cmd, capture_output=True, timeout=600)
    if out.exists():
        mb = out.stat().st_size/1024/1024
        print(f"\n✅ Video ready: {out}  ({mb:.1f} MB)")
        return True
    print(f"❌ Concat failed: {r.stderr[-600:].decode(errors='replace')}")
    return False

# ═══════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("="*65)
    print("  RentalHub Demo Video Generator")
    print("="*65)

    # Fetch live data
    print("\n[DATA] Fetching live data from API...")
    cats_resp  = api_get("/categories")
    eq_resp    = api_get("/equipment?limit=12&sort=-createdAt")
    cats  = cats_resp.get("categories", cats_resp.get("data",[]))
    eq    = eq_resp.get("equipment", eq_resp.get("data",[]))

    tok_admin    = login("admin@rentalhub.com","admin123")
    tok_owner    = login("apexgear@rentalhub.com","owner123")
    tok_customer = login("john@example.com","customer123")

    bk_resp = api_get("/bookings?role=customer", token=tok_customer)

    live_data = {"categories":cats,"equipment":eq,"bookings":bk_resp}
    print(f"  categories={len(cats)}, equipment={len(eq)}, token_ok={bool(tok_admin)}")

    # ── Render slides ──────────────────────────────────────────────────────
    slides = [
        ("00_title",  slide_title_card()),
        ("01_landing",slide_landing(live_data)),
        ("02_catalog",slide_catalog(live_data)),
        ("03_detail", slide_detail(live_data)),
        ("04_login",  slide_login()),
        ("05_register",slide_register()),
        ("06_customer",slide_customer_dashboard(live_data, tok_customer)),
        ("07_compare", slide_compare(live_data)),
        ("08_owner",  slide_owner_dashboard(live_data, tok_owner)),
        ("09_new_listing", slide_new_listing()),
        ("10_admin",  slide_admin_dashboard(live_data, tok_admin)),
        ("11_outro",  slide_outro()),
    ]

    print(f"\n[SLIDES] Saving {len(slides)} frames...")
    for slug, img in slides:
        p = FRAMES / f"{slug}.png"
        img.save(p, "PNG")
        print(f"  Saved: {p.name}  ({p.stat().st_size//1024} KB)")

    # ── Generate TTS ───────────────────────────────────────────────────────
    print(f"\n[TTS] Generating narration audio...")
    for slug, _ in slides:
        tts(slug, AUDIO / f"{slug}.wav")

    # ── Build segments ─────────────────────────────────────────────────────
    print(f"\n[SEGMENTS] Building video segments...")
    seg_paths = []
    for slug, _ in slides:
        img_p = FRAMES / f"{slug}.png"
        wav_p = AUDIO  / f"{slug}.wav"
        seg_p = SEGS   / f"{slug}.mp4"
        ok = make_segment(slug, img_p, wav_p, seg_p, pad=2.5)
        if ok:
            seg_paths.append(seg_p)

    # ── Concatenate ────────────────────────────────────────────────────────
    print(f"\n[CONCAT] Assembling final video from {len(seg_paths)} segments...")
    concat(seg_paths, OUTPUT)
    print("="*65)

if __name__ == "__main__":
    main()
