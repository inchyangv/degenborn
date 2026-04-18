#!/usr/bin/env python3
"""
DegenBorn — Pitch Video Generator

Pipeline:
  1. Render 12 slide images with Pillow (cyberpunk neon aesthetic)
  2. Generate TTS narration with Gemini Fenrir
  3. Assemble final MP4 with ffmpeg

Usage:
  python3 scripts/generate_pitch_video.py
"""

import os, sys, io, wave, struct, subprocess, textwrap, time
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ─── Paths ────────────────────────────────────────────────────────────
REPO      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(REPO, "LOGO.png")
ICON_PATH = os.path.join(REPO, "LOGO_ICON.png")
OUT_DIR   = os.path.join(REPO, "docs", "pitch_video")
SLIDES_DIR = os.path.join(OUT_DIR, "slides")
AUDIO_DIR  = os.path.join(OUT_DIR, "audio")
VIDEO_OUT  = os.path.join(REPO, "docs", "DegenBorn_Pitch.mp4")

GEMINI_API_KEY = "AIzaSyCLjS_gpyJ028wSsAp6PwYBkgzpVcgtkx8"

# ─── Canvas ───────────────────────────────────────────────────────────
W, H = 1920, 1080
PPI  = W / 13.333  # ~144 px/inch

# ─── Palette ──────────────────────────────────────────────────────────
BG        = (10, 10, 15)
CARD      = (17, 17, 24)
GREEN     = (0, 255, 136)
PURPLE    = (153, 69, 255)
CYAN      = (0, 212, 255)
GOLD      = (255, 215, 0)
RED       = (255, 61, 61)
WHITE     = (255, 255, 255)
TEXT      = (208, 208, 232)
MUTED     = (107, 107, 141)
DIM       = (42, 42, 58)
BORDER    = (30, 30, 46)

ARCH_COLORS = {
    "Mad Gambler":     RED,
    "Ice Whale":       CYAN,
    "Rug Necromancer": PURPLE,
    "Diamond Cultist": (136, 204, 255),
    "Sniper Jester":   GOLD,
    "Ghost Bagholder": (170, 170, 170),
}

# ─── Fonts ────────────────────────────────────────────────────────────
FONT_DIR = "/System/Library/Fonts/Supplemental"

def load_font(name, size):
    paths = [
        os.path.join(FONT_DIR, name),
        os.path.join("/System/Library/Fonts", name),
        os.path.join("/Library/Fonts", name),
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def font_title(size=68):  return load_font("Arial Black.ttf", size)
def font_bold(size=32):   return load_font("Arial Bold.ttf", size)
def font_body(size=28):   return load_font("Arial.ttf", size)
def font_mono(size=24):   return load_font("Courier New.ttf", size)
def font_mono_b(size=24): return load_font("Courier New Bold.ttf", size)


# ═══════════════════════════════════════════════════════════════════════
# DRAWING HELPERS
# ═══════════════════════════════════════════════════════════════════════

def new_slide():
    return Image.new("RGB", (W, H), BG)

def draw_accent_bar(img, top=True, color=GREEN, thickness=6):
    d = ImageDraw.Draw(img)
    y = 0 if top else H - thickness
    d.rectangle([0, y, W, y + thickness], fill=color)

def draw_glow(img, cx, cy, radius, color, alpha=0.15):
    """Gaussian-blurred circle for ambient glow."""
    glow = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(glow)
    # Blend the color with BG at alpha
    r = int(color[0] * alpha + BG[0] * (1 - alpha))
    g = int(color[1] * alpha + BG[1] * (1 - alpha))
    b = int(color[2] * alpha + BG[2] * (1 - alpha))
    blended = (min(r, 255), min(g, 255), min(b, 255))
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=blended)
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    # Composite: take max of each channel
    from PIL import ImageChops
    img.paste(ImageChops.lighter(img, glow))

def draw_card(d, x, y, w, h, fill=CARD, border=BORDER, radius=16):
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=fill, outline=border, width=1)

def draw_corner_marks(d, color=GREEN, length=60, margin=40, width=2):
    corners = [
        # top-left
        [(margin, margin), (margin + length, margin)],
        [(margin, margin), (margin, margin + length)],
        # top-right
        [(W - margin - length, margin), (W - margin, margin)],
        [(W - margin, margin), (W - margin, margin + length)],
        # bottom-left
        [(margin, H - margin), (margin + length, H - margin)],
        [(margin, H - margin - length), (margin, H - margin)],
        # bottom-right
        [(W - margin - length, H - margin), (W - margin, H - margin)],
        [(W - margin, H - margin - length), (W - margin, H - margin)],
    ]
    for pts in corners:
        d.line(pts, fill=color, width=width)

def draw_text(d, xy, text, font, fill=TEXT, anchor=None):
    d.text(xy, text, font=font, fill=fill, anchor=anchor)

def draw_text_wrapped(d, xy, text, font, fill=TEXT, max_width=1600, line_spacing=1.3):
    """Draw wrapped text. Returns the total height used."""
    x, y = xy
    lines = text.split("\n")
    total_h = 0
    for line in lines:
        # Wrap each line if needed
        if line == "":
            bbox = d.textbbox((0, 0), "A", font=font)
            lh = int((bbox[3] - bbox[1]) * line_spacing)
            y += lh
            total_h += lh
            continue
        # Simple word wrapping
        words = line.split(" ")
        current = ""
        for word in words:
            test = f"{current} {word}".strip()
            bbox = d.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_width and current:
                d.text((x, y), current, font=font, fill=fill)
                bbox2 = d.textbbox((0, 0), current, font=font)
                lh = int((bbox2[3] - bbox2[1]) * line_spacing)
                y += lh
                total_h += lh
                current = word
            else:
                current = test
        if current:
            d.text((x, y), current, font=font, fill=fill)
            bbox = d.textbbox((0, 0), current, font=font)
            lh = int((bbox[3] - bbox[1]) * line_spacing)
            y += lh
            total_h += lh
    return total_h

def paste_image(img, path, x, y, w=None, h=None):
    """Paste an image onto the slide, resized."""
    if not os.path.exists(path):
        return
    overlay = Image.open(path).convert("RGBA")
    if w and h:
        overlay = overlay.resize((w, h), Image.LANCZOS)
    elif w:
        ratio = w / overlay.width
        overlay = overlay.resize((w, int(overlay.height * ratio)), Image.LANCZOS)
    elif h:
        ratio = h / overlay.height
        overlay = overlay.resize((int(overlay.width * ratio), h), Image.LANCZOS)
    # Composite with alpha
    temp = Image.new("RGBA", img.size, (0, 0, 0, 0))
    temp.paste(overlay, (x, y))
    result = Image.alpha_composite(img.convert("RGBA"), temp)
    img.paste(result.convert("RGB"))


# ═══════════════════════════════════════════════════════════════════════
# SLIDE RENDERERS
# ═══════════════════════════════════════════════════════════════════════

def render_slide_01():
    """Cover — logo + tagline."""
    img = new_slide()
    draw_glow(img, 300, 200, 500, GREEN)
    draw_glow(img, 1500, 700, 450, PURPLE)
    draw_accent_bar(img, top=True, color=GREEN)
    draw_accent_bar(img, top=False, color=PURPLE)
    d = ImageDraw.Draw(img)
    draw_corner_marks(d, GREEN)

    # Logo
    paste_image(img, LOGO_PATH, 510, 160, w=900)

    # Tagline
    draw_text(d, (W // 2, 580), "Your wallet has a personality.",
              font_title(44), fill=TEXT, anchor="mt")
    draw_text(d, (W // 2, 640), "You just haven't seen it yet.",
              font_title(44), fill=TEXT, anchor="mt")

    # Sub-info
    draw_text(d, (W // 2, 780), "AI Identity Engine for Four.meme Traders  //  BNB Chain",
              font_mono(22), fill=MUTED, anchor="mt")

    # Hackathon badge
    draw_text(d, (W // 2, 870), "Four.meme AI Sprint  |  April 2026  |  Solo Build",
              font_mono(18), fill=DIM, anchor="mt")
    return img


def render_slide_02():
    """The Problem — 3 pain points."""
    img = new_slide()
    draw_glow(img, 1500, 100, 500, RED, alpha=0.1)
    draw_accent_bar(img, color=RED)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "THE PROBLEM", font_mono_b(22), fill=RED)
    draw_text_wrapped(d, (120, 120), "On-chain data is rich with story.\nBut it collapses into a log nobody shares.",
                      font_title(52), fill=WHITE, max_width=1700)

    problems = [
        ("01", "Wallets have no identity",
         "Your wallet shows what happened, not who you are.\nNo personality. No style. No scars."),
        ("02", "On-chain data is boring",
         "Transaction hashes and P&L tables.\nNobody screenshots a block explorer."),
        ("03", "NFTs are static",
         "Minted once, forgotten forever.\nNo growth. No connection to your behavior."),
    ]

    for i, (num, title, desc) in enumerate(problems):
        cx = 120 + 580 * i
        cy = 380
        cw, ch = 530, 490

        draw_card(d, cx, cy, cw, ch)
        draw_text(d, (cx + 30, cy + 30), num, font_title(60), fill=RED)
        draw_text(d, (cx + 30, cy + 130), title, font_bold(28), fill=WHITE)
        draw_text_wrapped(d, (cx + 30, cy + 200), desc, font_body(22), fill=MUTED, max_width=470, line_spacing=1.5)

    return img


def render_slide_03():
    """The Insight — big quote."""
    img = new_slide()
    draw_glow(img, W // 2, H // 2, 500, GREEN, alpha=0.12)
    d = ImageDraw.Draw(img)
    draw_corner_marks(d, GREEN)

    draw_text(d, (W // 2, 260), "We don't need another dashboard.",
              font_title(60), fill=GREEN, anchor="mt")
    draw_text(d, (W // 2, 340), "We need a mirror.",
              font_title(60), fill=GREEN, anchor="mt")

    lines = [
        "Panic sells at 3am. Diamond hands through -90%.",
        "Aping back in after getting rugged.",
        "That's not just data. That's personality.",
        "DegenBorn makes it visible.",
    ]
    for i, line in enumerate(lines):
        draw_text(d, (W // 2, 520 + i * 50), line,
                  font_body(30), fill=TEXT, anchor="mt")

    return img


def render_slide_04():
    """How It Works — 5-step pipeline."""
    img = new_slide()
    draw_accent_bar(img, color=CYAN)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "HOW IT WORKS", font_mono_b(22), fill=CYAN)
    draw_text(d, (120, 110), "From wallet activity to living character",
              font_title(48), fill=WHITE)

    steps = [
        ("1", "CONNECT",  "Read Four.meme\nwallet activity", GREEN),
        ("2", "ANALYZE",  "Compute 5-axis\nPersona DNA",     CYAN),
        ("3", "CLASSIFY", "Rule-tree assigns\narchetype",    PURPLE),
        ("4", "GENERATE", "AI creates genesis\ncharacter",   GOLD),
        ("5", "EVOLVE",   "Every trade mutates\nyour monster", GREEN),
    ]

    for i, (num, label, desc, color) in enumerate(steps):
        cx = 80 + 365 * i
        cy = 300

        draw_card(d, cx, cy, 320, 420)

        # Number circle
        circle_cx = cx + 160
        circle_cy = cy + 70
        d.ellipse([circle_cx - 35, circle_cy - 35, circle_cx + 35, circle_cy + 35], fill=color)
        draw_text(d, (circle_cx, circle_cy), num, font_title(36), fill=BG, anchor="mm")

        # Label
        draw_text(d, (cx + 160, cy + 150), label, font_mono_b(22), fill=color, anchor="mt")

        # Description
        draw_text_wrapped(d, (cx + 30, cy + 210), desc, font_body(20), fill=MUTED,
                          max_width=260, line_spacing=1.5)

        # Arrow
        if i < 4:
            draw_text(d, (cx + 340, cy + 150), ">", font_mono_b(30), fill=DIM)

    # Bottom note
    draw_text(d, (W // 2, 800), "Same wallet + same events = same result. Always. Zero LLM hallucination in scoring.",
              font_mono(20), fill=GREEN, anchor="mt")

    return img


def render_slide_05():
    """Persona DNA — 5 axes with bars."""
    img = new_slide()
    draw_accent_bar(img, color=GREEN)
    draw_glow(img, 1600, 200, 400, GREEN, alpha=0.1)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "PERSONA DNA", font_mono_b(22), fill=GREEN)
    draw_text(d, (120, 110), "Five axes. Pure math. Zero LLM calls.",
              font_title(48), fill=WHITE)

    axes = [
        ("AGGRESSION", 82, "How fast and often you trade",    RED),
        ("CONVICTION", 34, "How long and focused you hold",   CYAN),
        ("CHAOS",      76, "How volatile your history is",    PURPLE),
        ("LUCK",       41, "How well-timed your exits are",   GOLD),
        ("SURVIVAL",   91, "How many times you came back",    GREEN),
    ]

    for i, (name, score, desc, color) in enumerate(axes):
        y = 270 + 130 * i

        # Label
        draw_text(d, (120, y), name, font_mono_b(26), fill=color)

        # Bar background
        bar_x, bar_y = 420, y + 5
        bar_w, bar_h = 800, 30
        d.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h],
                            radius=15, fill=DIM)

        # Bar fill
        fill_w = int(bar_w * score / 100)
        if fill_w > 0:
            d.rounded_rectangle([bar_x, bar_y, bar_x + fill_w, bar_y + bar_h],
                                radius=15, fill=color)

        # Score number
        draw_text(d, (1280, y), str(score), font_title(34), fill=color)

        # Description
        draw_text(d, (1380, y + 5), desc, font_body(20), fill=MUTED)

    # Example label
    draw_text(d, (120, 950), 'Example: "Rug Necromancer" profile',
              font_mono(18), fill=MUTED)

    return img


def render_slide_06():
    """6 Archetypes grid."""
    img = new_slide()
    draw_accent_bar(img, color=PURPLE)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "ARCHETYPES", font_mono_b(22), fill=PURPLE)
    draw_text(d, (120, 110), "A rule tree decides. Not a prompt.",
              font_title(48), fill=WHITE)

    archetypes = [
        ("Mad Gambler",     "AGG >= 65, CHAOS >= 65",  "All-in, always. The casino\nnever closes if you never leave."),
        ("Ice Whale",       "CONV >= 65, LUCK >= 65",  "Patient, loaded, lucky. You're\nnot gambling. You're investing."),
        ("Rug Necromancer", "CHAOS >= 65, SURV >= 65",  "Your portfolio died.\nYou didn't. Death is just a dip."),
        ("Diamond Cultist", "CONV >= 65, LUCK < 35",   "Bought the top. Still holding.\nBecause leaving = admitting defeat."),
        ("Sniper Jester",   "AGG >= 65, LUCK >= 65",   "In and out. Perfectly timed.\nGenius or just lucky? Yes."),
        ("Ghost Bagholder", "CONV >= 65, SURV < 35",   "You believed. Hard.\nThe token didn't. Still haunting."),
    ]

    for i, (name, rule, desc) in enumerate(archetypes):
        col = i % 3
        row = i // 3
        cx = 80 + 600 * col
        cy = 260 + 340 * row
        cw, ch = 555, 300

        color = ARCH_COLORS[name]
        draw_card(d, cx, cy, cw, ch)

        # Color dot
        d.ellipse([cx + 20, cy + 25, cx + 40, cy + 45], fill=color)

        # Name
        draw_text(d, (cx + 55, cy + 22), name, font_bold(26), fill=color)

        # Rule
        draw_text(d, (cx + 20, cy + 70), rule, font_mono(16), fill=MUTED)

        # Description
        draw_text_wrapped(d, (cx + 20, cy + 110), desc, font_body(20), fill=TEXT,
                          max_width=510, line_spacing=1.4)

    return img


def render_slide_07():
    """Evolution — event to mutation mapping."""
    img = new_slide()
    draw_accent_bar(img, color=GOLD)
    draw_glow(img, 100, 700, 400, GOLD, alpha=0.08)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "EVOLUTION", font_mono_b(22), fill=GOLD)
    draw_text(d, (120, 110), "Every trade leaves a mark.",
              font_title(48), fill=WHITE)

    # Column headers
    draw_text(d, (140, 260), "EVENT", font_mono_b(20), fill=MUTED)
    draw_text(d, (740, 260), "MUTATION", font_mono_b(20), fill=MUTED)
    draw_text(d, (1340, 260), "STATE DELTA", font_mono_b(20), fill=MUTED)

    events = [
        ("Win streak x3",        "Crown appears",           GREEN,  "+1 crownCount, mood: euphoria"),
        ("Major loss",           "Scar added",              RED,    "+1 scarCount, mood: despair"),
        ("Rug pull detected",    "Zombie eyes activate",    PURPLE, "+20 corruption, zombieTrait"),
        ("Comeback after -90%",  "Revenge aura ignites",    GOLD,   "+1 survivalStreak, mood: revenge"),
        ("Long diamond hold",    "Royal cloak forms",       CYAN,   "+15 prestige, royalTrait"),
        ("Multiple rug survival","Necromancer ascension",   PURPLE, "Full re-render triggered"),
    ]

    for i, (event, mutation, color, delta) in enumerate(events):
        y = 320 + 85 * i

        # Separator line
        d.line([(120, y - 5), (1800, y - 5)], fill=DIM, width=1)

        draw_text(d, (140, y + 8), event, font_bold(24), fill=WHITE)
        draw_text(d, (680, y + 12), ">", font_mono_b(22), fill=color)
        draw_text(d, (740, y + 8), mutation, font_bold(24), fill=color)
        draw_text(d, (1340, y + 12), delta, font_mono(18), fill=MUTED)

    # Bottom note
    draw_text(d, (W // 2, 920),
              "Genesis once. Overlays always. Full re-render only at milestones.",
              font_mono(20), fill=GREEN, anchor="mt")

    return img


def render_slide_08():
    """Soul Core — soulbound vs tradeable."""
    img = new_slide()
    draw_accent_bar(img, color=CYAN)
    draw_glow(img, 1200, 400, 500, CYAN, alpha=0.1)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "SOUL CORE", font_mono_b(22), fill=CYAN)
    draw_text(d, (120, 110), "Your on-chain identity. Not a collectible.",
              font_title(48), fill=WHITE)

    # Left card: Soul Core
    draw_card(d, 80, 260, 850, 650)
    draw_text(d, (130, 290), "SOUL CORE", font_mono_b(30), fill=CYAN)

    sc_lines = [
        ("Soulbound ERC-721 on BNB Chain", TEXT),
        ("One per wallet. Non-transferable.", TEXT),
        ("Always reflects your current state.", TEXT),
        ("", TEXT),
        ("On-chain data:", CYAN),
        ("  dnaHash      // persona fingerprint", MUTED),
        ("  archetype    // rule-tree result", MUTED),
        ("  level        // growth stage", MUTED),
        ("  stateHash    // latest mutation", MUTED),
    ]
    for i, (line, color) in enumerate(sc_lines):
        if line:
            fn = font_mono(20) if line.startswith("  ") or line.startswith("On-chain") else font_body(24)
            draw_text(d, (130, 350 + i * 40), line, fn, fill=color)

    # Right card: Snapshot Relic
    draw_card(d, 990, 260, 850, 650)
    draw_text(d, (1040, 290), "SNAPSHOT RELIC", font_mono_b(30), fill=GOLD)

    relics = [
        ("First Crowned Win", "Win streak milestone"),
        ("Rug Survivor", "Survived 3+ rug events"),
        ("Seven-Day Resurrection", "Major comeback"),
        ("Chaos Ascension", "Corruption threshold reached"),
    ]
    for i, (title, desc) in enumerate(relics):
        y = 370 + i * 100
        d.ellipse([1040, y + 5, 1055, y + 20], fill=GOLD)
        draw_text(d, (1075, y), title, font_bold(24), fill=WHITE)
        draw_text(d, (1075, y + 35), desc, font_body(20), fill=MUTED)

    draw_text(d, (1040, 810), "Tradeable. Commemorates evolution moments.",
              font_body(20), fill=MUTED)

    return img


def render_slide_09():
    """Rules Decide. AI Expresses. — differentiators."""
    img = new_slide()
    draw_glow(img, 200, 200, 450, GREEN, alpha=0.1)
    draw_glow(img, 1500, 600, 400, PURPLE, alpha=0.1)
    d = ImageDraw.Draw(img)
    draw_corner_marks(d, GREEN)

    draw_text(d, (120, 90), "Rules decide.", font_title(72), fill=GREEN)
    draw_text(d, (120, 180), "AI expresses.", font_title(72), fill=GREEN)

    diffs = [
        ("Deterministic Identity", GREEN,
         "Scoring engine and archetype classifier\nare pure functions. AI only handles\nnarrative, visuals, and captions.\nReproducible. Auditable. Stable."),
        ("Trading = Retention", CYAN,
         "Every trade changes your character.\nThat's a feedback loop. Four.meme\ngets stickier when your portfolio\nhas a face, scars, and a mood."),
        ("Sharing Without Spam", GOLD,
         "Meme-ready share cards and captions.\nUsers decide when to post.\nNo auto-tweeting. No bot behavior.\nThe content markets itself."),
    ]

    for i, (title, color, desc) in enumerate(diffs):
        cx = 80 + 610 * i
        cy = 370
        cw, ch = 565, 470

        draw_card(d, cx, cy, cw, ch)
        # Accent bar
        d.rectangle([cx, cy, cx + 6, cy + ch], fill=color)

        draw_text(d, (cx + 30, cy + 30), title, font_bold(28), fill=color)
        draw_text_wrapped(d, (cx + 30, cy + 90), desc, font_body(22), fill=TEXT,
                          max_width=500, line_spacing=1.6)

    return img


def render_slide_10():
    """Architecture — tech stack."""
    img = new_slide()
    draw_accent_bar(img, color=CYAN)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "ARCHITECTURE", font_mono_b(22), fill=CYAN)
    draw_text(d, (120, 110), "Built to ship, not to impress a whitepaper.",
              font_title(46), fill=WHITE)

    stack = [
        ("Frontend",       "Next.js 14, TypeScript, Tailwind, wagmi v2",     GREEN),
        ("Scoring",        "Deterministic engine — pure functions, 0 LLM",   GREEN),
        ("Classification", "Rule-tree archetype mapper",                     CYAN),
        ("Narrative",      "Claude / GPT-4o-mini + structured output",       PURPLE),
        ("Image",          "DALL-E 3 genesis + Canvas overlay compositor",   PURPLE),
        ("Contract",       "Solidity 0.8.24, Soulbound ERC-721, BNB Chain", GOLD),
        ("Data",           "Moralis / Covalent + offline fixture mode",      CYAN),
        ("Persistence",    "Postgres + Vercel Blob",                         CYAN),
    ]

    for i, (layer, tech, color) in enumerate(stack):
        y = 270 + 80 * i
        if i > 0:
            d.line([(120, y - 10), (1800, y - 10)], fill=DIM, width=1)
        d.ellipse([130, y + 8, 150, y + 28], fill=color)
        draw_text(d, (170, y + 2), layer, font_mono_b(24), fill=color)
        draw_text(d, (550, y + 4), tech, font_body(24), fill=TEXT)

    draw_text(d, (W // 2, 950),
              "pnpm monorepo  //  apps/web + apps/worker + packages/shared + packages/contracts",
              font_mono(18), fill=MUTED, anchor="mt")

    return img


def render_slide_11():
    """What's Live — feature checklist."""
    img = new_slide()
    draw_accent_bar(img, color=GREEN)
    draw_glow(img, 1600, 200, 400, GREEN, alpha=0.1)
    d = ImageDraw.Draw(img)

    draw_text(d, (120, 55), "WHAT'S LIVE", font_mono_b(22), fill=GREEN)
    draw_text(d, (120, 110), "This isn't a concept. It's deployed.",
              font_title(48), fill=WHITE)

    left = [
        "Wallet connect > DNA analysis in <30s",
        "AI genesis character generation",
        "12 overlay traits (crown, scar, zombie...)",
        "9-event state machine",
        "Mutation Diary tracking every change",
        "Meme-ready share cards with captions",
    ]
    right = [
        "Soulbound Soul Core on BNB Chain",
        "Replay Mode — full offline demo",
        "30+ pages: Gallery, Zodiac, Graveyard...",
        "Report Card with detailed stats",
        "Hall of Fame + Battle comparisons",
        "Token launch via Four.meme integration",
    ]

    for i, feat in enumerate(left):
        y = 260 + 70 * i
        draw_text(d, (120, y), "+", font_mono_b(26), fill=GREEN)
        draw_text(d, (170, y + 2), feat, font_body(24), fill=TEXT)

    for i, feat in enumerate(right):
        y = 260 + 70 * i
        draw_text(d, (1000, y), "+", font_mono_b(26), fill=GREEN)
        draw_text(d, (1050, y + 2), feat, font_body(24), fill=TEXT)

    # Bottom emphasis
    draw_card(d, 400, 840, 1120, 70)
    draw_text(d, (W // 2, 855), "Solo build.  12 days.  Fully working product.",
              font_title(34), fill=GREEN, anchor="mt")

    return img


def render_slide_12():
    """Closing — CTA."""
    img = new_slide()
    draw_glow(img, W // 2, H // 2, 600, GREEN, alpha=0.1)
    draw_glow(img, 1200, 500, 450, PURPLE, alpha=0.08)
    draw_accent_bar(img, top=True, color=GREEN)
    draw_accent_bar(img, top=False, color=PURPLE)
    d = ImageDraw.Draw(img)
    draw_corner_marks(d, GREEN)

    # Logo icon
    paste_image(img, ICON_PATH, W // 2 - 75, 80, w=150, h=150)

    # Redraw the draw context after paste
    d = ImageDraw.Draw(img)

    draw_text(d, (W // 2, 300), "DegenBorn is not another NFT project.",
              font_title(50), fill=WHITE, anchor="mt")

    draw_text(d, (W // 2, 420), "It's the first time your wallet behavior",
              font_body(32), fill=TEXT, anchor="mt")
    draw_text(d, (W // 2, 465), "becomes a character with scars, crowns, and a mood.",
              font_body(32), fill=TEXT, anchor="mt")

    draw_text(d, (W // 2, 580), "Four.meme gets retention.  The user gets a self.",
              font_bold(30), fill=GREEN, anchor="mt")

    draw_text(d, (W // 2, 720), "degenborn.xyz",
              font_mono_b(36), fill=CYAN, anchor="mt")

    draw_text(d, (W // 2, 820), "Your wallet, reborn as a monster.",
              font_body(26), fill=MUTED, anchor="mt")

    return img


# ═══════════════════════════════════════════════════════════════════════
# NARRATION TEXT (for TTS)
# ═══════════════════════════════════════════════════════════════════════

NARRATIONS = [
    # Slide 1 — Cover
    "Every wallet on Four.meme has a story. "
    "But right now, that story is just numbers. "
    "This is DegenBorn.",

    # Slide 2 — Problem
    "Three things are broken in on-chain identity. "
    "One — your wallet tells you what happened, not who you are. "
    "There's no personality, no style, no scars. "
    "Two — on-chain data is boring. Nobody screenshots a block explorer. Zero shareability. "
    "Three — most NFTs are minted once and forgotten. They don't grow with you. They don't change.",

    # Slide 3 — Insight
    "We don't need more charts and dashboards. "
    "Think about it — panic sells at 3am, diamond hands through a minus 90 percent drawdown, "
    "aping back in right after getting rugged. "
    "That's not just data. That's a personality. "
    "DegenBorn makes it visible.",

    # Slide 4 — How It Works
    "Here's the pipeline. "
    "Connect a wallet. We pull Four dot meme trading activity — buys, sells, holds, rugs. "
    "Analyze — we compute five scores, zero to a hundred. Aggression, Conviction, Chaos, Luck, Survival. "
    "Classify — a deterministic rule tree maps those scores to an archetype. Not an LLM. Pure logic. "
    "Generate — AI creates a genesis character from that archetype. "
    "Evolve — every future trade mutates your monster. Win streaks add crowns. Rug pulls add zombie eyes.",

    # Slide 5 — Persona DNA
    "Let me show you a real profile. "
    "This wallet scores Aggression 82, Chaos 76, Survival 91. "
    "It trades fast, gets wrecked often, but always comes back. "
    "Each axis is computed from raw on-chain data. Same wallet, same events, same scores. "
    "Every single time. There is zero randomness in the scoring layer.",

    # Slide 6 — Archetypes
    "The rule tree maps D.N.A. to one of six archetypes. "
    "Mad Gambler — apes first, thinks never. The casino never closes. "
    "Rug Necromancer — your portfolio died, you didn't. "
    "Diamond Cultist — bought the top, still holding. Respect. "
    "Sniper Jester, Ice Whale, Ghost Bagholder — "
    "each one tells a different trading story. Computed from behavior, not from a prompt.",

    # Slide 7 — Evolution
    "The character isn't static. Every trade leaves a mark. "
    "Win streak — crown appears. Major loss — scar added, mood shifts to despair. "
    "Rug pull — corruption goes up, zombie eyes activate. "
    "Comeback after being down 90 percent — revenge aura ignites. "
    "Genesis happens once. Daily changes use overlay compositing. "
    "Full A.I. re-render only triggers at major milestones.",

    # Slide 8 — Soul Core
    "We split identity and collectibility into two NFTs. "
    "Soul Core is soulbound — one per wallet, non-transferable. "
    "Your living identity on B.N.B. Chain. "
    "D.N.A. hash, archetype, level, current state — all on-chain. "
    "Snapshot Relic is the tradeable moment. "
    "Big evolution milestones get minted as collectibles. "
    "Identity stays. Moments travel.",

    # Slide 9 — Edge
    "Rules decide. A.I. expresses. That's what makes us different. "
    "Deterministic identity — scoring and classification are pure functions. "
    "A.I. only handles narrative and visuals. "
    "Trading becomes retention — every trade changes your character. "
    "Four dot meme gets stickier when your portfolio has a face. "
    "Sharing without spam — we generate share cards. Users decide when to post.",

    # Slide 10 — Architecture
    "Under the hood. "
    "Next.js and wagmi for the frontend. "
    "Deterministic scoring engine with zero LLM calls. "
    "Canvas overlay compositor for real-time trait rendering. "
    "Soulbound E.R.C. 721 on B.N.B. Chain. "
    "Moralis for data, with a full offline fixture mode. "
    "All in a pnpm monorepo. Shipped solo in 12 days.",

    # Slide 11 — What's Live
    "This isn't a concept deck. Everything you see is deployed. "
    "Wallet connect to D.N.A. analysis in under 30 seconds. "
    "A.I. genesis characters with 12 overlay traits. "
    "A 9-event state machine driving real-time mutations. "
    "Mutation diary, share cards, soulbound minting on B.N.B. Chain. "
    "Plus 30 pages of content — and Replay Mode runs fully offline.",

    # Slide 12 — Close
    "DegenBorn is not another N.F.T. project. "
    "It's the first time your actual wallet behavior — "
    "your panic sells, your diamond hands, your comebacks — "
    "becomes a character with scars, crowns, and a mood. "
    "Four dot meme gets retention. The user gets a self. "
    "DegenBorn. Your wallet, reborn as a monster.",
]

RENDERERS = [
    render_slide_01, render_slide_02, render_slide_03, render_slide_04,
    render_slide_05, render_slide_06, render_slide_07, render_slide_08,
    render_slide_09, render_slide_10, render_slide_11, render_slide_12,
]


# ═══════════════════════════════════════════════════════════════════════
# STEP 1: RENDER SLIDES
# ═══════════════════════════════════════════════════════════════════════

def render_all_slides():
    os.makedirs(SLIDES_DIR, exist_ok=True)
    paths = []
    for i, renderer in enumerate(RENDERERS):
        path = os.path.join(SLIDES_DIR, f"slide_{i + 1:02d}.png")
        print(f"  Rendering slide {i + 1:02d}...", end=" ", flush=True)
        img = renderer()
        img.save(path, "PNG")
        print("OK")
        paths.append(path)
    return paths


# ═══════════════════════════════════════════════════════════════════════
# STEP 2: GENERATE TTS AUDIO
# ═══════════════════════════════════════════════════════════════════════

def generate_tts(text, output_path, voice="Fenrir"):
    """Generate TTS audio using Gemini API."""
    from google import genai

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = (
        f"Read the following in a confident, slightly energetic pitch presentation tone. "
        f"Speak clearly with good pacing — not too fast, not too slow. "
        f"This is a hackathon pitch for a tech product called DegenBorn:\n\n{text}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=[prompt],
        config=genai.types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=genai.types.SpeechConfig(
                voice_config=genai.types.VoiceConfig(
                    prebuilt_voice_config=genai.types.PrebuiltVoiceConfig(
                        voice_name=voice
                    )
                )
            ),
        ),
    )

    audio_data = response.candidates[0].content.parts[0].inline_data.data

    # Write as WAV (raw PCM 16-bit mono 24kHz)
    with wave.open(output_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(audio_data)

    return output_path


def generate_all_audio():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    paths = []
    for i, narration in enumerate(NARRATIONS):
        path = os.path.join(AUDIO_DIR, f"slide_{i + 1:02d}.wav")
        print(f"  Generating TTS for slide {i + 1:02d}...", end=" ", flush=True)
        try:
            generate_tts(narration, path)
            print("OK")
        except Exception as e:
            print(f"FAIL: {e}")
            # Create 5 seconds of silence as fallback
            create_silence(path, duration=5.0)
            print("  (using silence fallback)")
        paths.append(path)
        time.sleep(0.5)  # Rate limit courtesy
    return paths


def create_silence(path, duration=5.0, sample_rate=24000):
    """Create a silent WAV file."""
    n_frames = int(duration * sample_rate)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_frames)


# ═══════════════════════════════════════════════════════════════════════
# STEP 3: ASSEMBLE VIDEO
# ═══════════════════════════════════════════════════════════════════════

def get_audio_duration(path):
    with wave.open(path, "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return frames / rate


def assemble_video(slide_paths, audio_paths):
    """Combine slide images + audio into final video with crossfades."""
    segments_dir = os.path.join(OUT_DIR, "segments")
    os.makedirs(segments_dir, exist_ok=True)

    segment_files = []

    for i, (slide, audio) in enumerate(zip(slide_paths, audio_paths)):
        segment = os.path.join(segments_dir, f"seg_{i + 1:02d}.mp4")
        duration = get_audio_duration(audio)
        # Add 0.8s padding at end of each segment for breathing room
        total_dur = duration + 0.8

        print(f"  Encoding segment {i + 1:02d} ({total_dur:.1f}s)...", end=" ", flush=True)

        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", slide,
            "-i", audio,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-t", str(total_dur),
            "-vf", f"scale=1920:1080,fps=30",
            segment,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FAIL\n{result.stderr[-300:]}")
            return None
        print("OK")
        segment_files.append(segment)

    # Create concat list
    concat_list = os.path.join(OUT_DIR, "concat.txt")
    with open(concat_list, "w") as f:
        for seg in segment_files:
            f.write(f"file '{seg}'\n")

    # Concatenate all segments
    print("  Concatenating segments...", end=" ", flush=True)
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        VIDEO_OUT,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"FAIL\n{result.stderr[-300:]}")
        return None
    print("OK")

    return VIDEO_OUT


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  DegenBorn — Pitch Video Generator")
    print("=" * 60)

    print("\n[1/3] Rendering slides...")
    slide_paths = render_all_slides()

    print("\n[2/3] Generating TTS narration (Gemini Fenrir)...")
    audio_paths = generate_all_audio()

    print("\n[3/3] Assembling video...")
    result = assemble_video(slide_paths, audio_paths)

    if result:
        # Get final video info
        size = os.path.getsize(result) / (1024 * 1024)
        total_dur = sum(get_audio_duration(a) + 0.8 for a in audio_paths)
        print("\n" + "=" * 60)
        print(f"  Video saved: {result}")
        print(f"  Duration:    {total_dur:.0f}s ({total_dur/60:.1f} min)")
        print(f"  Size:        {size:.1f} MB")
        print("=" * 60)
    else:
        print("\n  ERROR: Video assembly failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
