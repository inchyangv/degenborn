#!/usr/bin/env python3
"""Generate all 27 Twitter images for DegenBorn using Gemini Imagen API."""

import time
import sys
import os
from google import genai
from google.genai import types

API_KEY = "AIzaSyCLjS_gpyJ028wSsAp6PwYBkgzpVcgtkx8"
MODEL = "imagen-4.0-generate-001"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")

# Style prefix for consistency
STYLE = (
    "Digital art, dark cyberpunk aesthetic, dark background #0a0a0f, "
    "neon green (#39FF14) and gold (#FFD700) accents, "
    "high contrast, polished, suitable for Twitter social media card 1200x675px. "
)

PROMPTS = {
    # DAY 1 — Apr 13
    "0413-1": (
        STYLE +
        "A futuristic radar/pentagon chart with 5 labeled axes: Aggression, Conviction, Chaos, Luck, Survival. "
        "Neon green glowing fill area showing a personality profile. Dark grid background. "
        "Title at top: PERSONA DNA. Subtitle: Your Wallet Decoded. "
        "Tech HUD overlay elements, scan lines, data readout aesthetic."
    ),
    "0413-2": (
        STYLE +
        "A 2x3 grid of six character archetype cards. Each card is a dark rectangle with a unique color glow: "
        "1) Mad Gambler (red glow, dice silhouette), 2) Ice Whale (ice blue glow, whale silhouette), "
        "3) Rug Necromancer (sickly green glow, undead silhouette), 4) Diamond Cultist (white diamond glow, crystal silhouette), "
        "5) Sniper Jester (purple glow, crosshair silhouette), 6) Ghost Bagholder (grey translucent glow, ghost silhouette). "
        "Clean layout, trading card game aesthetic, neon borders."
    ),
    "0413-3": (
        STYLE +
        "A hacker terminal screen showing a build progress checklist in monospace green text on pure black. "
        "Lines showing completed tasks with checkmarks: Scoring Engine, 6 Archetypes, Genesis Character, "
        "Soulbound NFT, 12 Trait Overlays, Mutation Diary. One item shows in-progress: Share Cards. "
        "Terminal prompt style with blinking cursor. Matrix-inspired aesthetic."
    ),

    # DAY 2 — Apr 14
    "0414-1": (
        STYLE +
        "Character card: RUG NECROMANCER archetype. A menacing undead monster creature rising from broken crypto charts. "
        "Skeletal features, glowing sickly green eyes, tattered dark robes, visible scars and battle damage. "
        "Surrounded by broken candlestick chart fragments and rug pull debris. "
        "Zombie-like but powerful and defiant. Dark fantasy horror aesthetic with green and purple neon accents. "
        "Card frame with stats overlay."
    ),
    "0414-2": (
        STYLE +
        "Clean infographic showing 5 personality axes as horizontal bars or circular icons: "
        "Aggression (red-orange, sword icon), Conviction (blue, anchor icon), "
        "Chaos (purple, lightning bolt icon), Luck (gold, dice icon), "
        "Survival (green, shield icon). Each with a short description line. "
        "Minimalist tech design, dark background, neon colored icons."
    ),

    # DAY 3 — Apr 15
    "0415-1": (
        STYLE +
        "Character card: MAD GAMBLER archetype. A wild chaotic monster creature in a neon casino setting. "
        "Multiple wild eyes, slot machine elements embedded in its body, dice patterns on skin, "
        "surrounded by flying poker chips and neon casino lights. Unhinged expression, manic energy. "
        "Hot pink and electric blue neon casino glow. Card frame with stats. "
        "Glitch effects and visual distortion."
    ),
    "0415-2": (
        STYLE +
        "Split-screen evolution comparison. Left side labeled GENESIS: a simple, clean base monster character, "
        "plain dark creature with minimal features. Right side labeled EVOLVED: the same creature now covered "
        "with a golden crown, battle scars, zombie eyes glowing green, revenge fire aura, diamond armor plates. "
        "Dramatic transformation arrow or lightning effect between them. Before and after comparison."
    ),

    # DAY 4 — Apr 16
    "0416-1": (
        STYLE +
        "Character card: DIAMOND CULTIST archetype. A stubborn crystalline monster creature encrusted in diamonds "
        "and crystals. Arms crossed defiantly, diamond armor cracking but held together by sheer will. "
        "Surrounded by falling price charts but standing firm. Beautiful but battered. "
        "Ice white, diamond blue, and prismatic light refractions on dark background. Card frame."
    ),
    "0416-2": (
        STYLE +
        "Technical architecture flow diagram. Connected nodes from left to right: "
        "Wallet Data (wallet icon) -> Scoring Engine (calculator) -> Persona DNA (radar chart) -> "
        "Rule Tree (binary tree) -> Archetype (mask) -> AI Generator (brain) -> Character (monster) -> "
        "State Machine (gears) -> Soul Core NFT (gem). "
        "Each node is a rounded rectangle with glow. Arrows connecting them. "
        "Clean technical diagram, blueprint aesthetic, dark background."
    ),

    # DAY 5 — Apr 17
    "0417-1": (
        STYLE +
        "Character card: SNIPER JESTER archetype. A dual-natured monster creature, split design: "
        "one half is precise and calculated (crosshair eye, clean geometric lines, scope lens), "
        "other half is chaotic and playful (jester bells, wild patterns, mischievous grin). "
        "Purple and gold color scheme. Holding both a sniper rifle and juggling balls. "
        "Card frame with stats. Duality aesthetic."
    ),

    # DAY 6 — Apr 18
    "0418-1": (
        STYLE +
        "Character card: ICE WHALE archetype. A massive, serene ice creature with whale-like features. "
        "Crystalline blue skin, frost emanating from body, calm wise eyes, floating above frozen ocean waves. "
        "Surrounded by ice crystals and northern lights aurora. Majestic and powerful but completely calm. "
        "Ice blue, deep navy, white frost color palette. Card frame with stats."
    ),
    "0418-2": (
        STYLE +
        "Launch teaser image. A monster character silhouette obscured by heavy glitch effects, "
        "scanlines, and pixel distortion. The creature is barely visible through the interference. "
        "Neon green glow bleeding through the distortion. Mysterious and exciting. "
        "Large countdown timer or clock showing tomorrow. Anticipation aesthetic."
    ),

    # DAY 7 — Apr 19 (LAUNCH)
    "0419-1": (
        STYLE +
        "Celebration launch graphic. Explosion of neon green and gold particles emanating from center. "
        "A large glowing emblem or logo mark in the center (abstract monster face). "
        "Confetti and energy particles in neon green, gold, and purple. "
        "Dramatic lighting, spotlight effect, epic reveal moment. "
        "Clean space at bottom for text. Party/celebration energy."
    ),
    "0419-2": (
        STYLE +
        "5-step horizontal walkthrough strip. Five connected cards with arrows between them: "
        "Step 1: wallet icon with connect symbol, Step 2: radar chart (DNA analysis), "
        "Step 3: classification badge with question mark becoming archetype, "
        "Step 4: monster character emerging from data, Step 5: evolution with transformation sparks. "
        "Numbered 1-5, clean flow diagram, dark bg, neon accents."
    ),

    # DAY 8 — Apr 20
    "0420-1": (
        STYLE +
        "Character card: GHOST BAGHOLDER archetype. A translucent spectral monster creature, "
        "ghost-like and fading, ethereal wisps trailing from body. Sad haunting eyes with dark circles. "
        "Clutching at floating candlestick charts that pass through its transparent hands. "
        "Trapped between world of the living and dead charts. "
        "Ghostly white, grey, pale blue, transparent effects. Melancholy beautiful. Card frame."
    ),
    "0420-2": (
        STYLE +
        "A dark UI screenshot of a mutation diary / event log interface. Timeline on the left side. "
        "4 log entries visible: each has a timestamp, an event badge (WIN STREAK in gold, RUG in red, "
        "COMEBACK in green, LONG HOLD in blue), small character state icon, and a narrative text line. "
        "Code-like monospace font. Green timestamps. Clean dark UI design."
    ),

    # DAY 9 — Apr 21
    "0421-1": (
        STYLE +
        "Bold statistics infographic with large glowing numbers: "
        "5 (DNA axes), 6 (archetypes), 12 (trait overlays), 9 (state events), "
        "30+ (pages), 1 (developer), 12 (days). "
        "Each number is oversized and neon-colored (alternating green, gold, purple), "
        "with small label text beneath. Grid or scattered layout. "
        "Title: BY THE NUMBERS. Impressive scale visualization."
    ),
    "0421-2": (
        STYLE +
        "Split comparison image. Left side: a rough hand-drawn pencil sketch on paper/napkin "
        "showing a crude flowchart (wallet -> axes -> monster), messy authentic sketch style. "
        "Right side: a polished high-tech product screenshot showing a sleek dark UI with "
        "a monster character, radar chart, and archetype classification. "
        "Center divider with transformation effect. Dramatic contrast between sketch and final."
    ),

    # DAY 10 — Apr 22
    "0422-1": (
        STYLE +
        "Official submission graphic. A large rubber stamp effect showing SUBMITTED in bold, "
        "slightly tilted at an angle, with a satisfying stamp impression aesthetic. "
        "Below the stamp: three small logos in a row representing the hackathon sponsors. "
        "Subtle green glow around the stamp. Achievement unlocked / mission complete feeling."
    ),

    # DAY 11 — Apr 23
    "0423-1": (
        STYLE +
        "Vote call-to-action graphic. A powerful monster character pointing directly at the viewer "
        "(Uncle Sam style but cyberpunk monster). Green neon border frame. "
        "Large bold text space at top. Arrow pointing down to a highlighted button area. "
        "Urgent but clean design. Neon green and gold accents. "
        "Political poster meets cyberpunk aesthetic."
    ),
    "0423-2": (
        STYLE +
        "A futuristic radar pentagon chart with 5 axes filled with specific scores: "
        "Aggression: 78 (high), Conviction: 42 (medium), Chaos: 91 (very high), "
        "Luck: 23 (low), Survival: 67 (medium-high). "
        "Neon green fill area showing the profile shape. Score numbers visible at each axis. "
        "Result classification badge showing the archetype. HUD overlay aesthetic."
    ),

    # DAY 12 — Apr 24
    "0424-1": (
        STYLE +
        "Detailed mutation diary page. A dark UI showing a vertical timeline with 4 event entries: "
        "Each entry has a colored event type badge, a small before/after character state change icon, "
        "a timestamp, and two lines of AI-generated narrative text in italics. "
        "Events: gold WIN STREAK, red RUG PULL, green COMEBACK, blue DIAMOND HANDS. "
        "Timeline connecting dots between entries. Clean dark interface design."
    ),

    # DAY 13 — Apr 25
    "0425-1": (
        STYLE +
        "A social share card template. Center: a fierce monster character portrait. "
        "Top banner area for archetype name. Right side: mini radar chart with DNA scores. "
        "Bottom: branding strip. Designed to look perfect when shared on social media. "
        "Dark card with neon green border, portrait orientation in a landscape frame. "
        "Trading card meets social media post aesthetic."
    ),

    # DAY 14 — Apr 26
    "0426-1": (
        STYLE +
        "Replay mode interface. A dark cinematic UI showing a monster character in the center "
        "evolving in real-time. Timeline scrubber bar at the bottom with event markers "
        "(red dots for rugs, gold dots for wins, green dots for comebacks). "
        "A playhead indicator on the timeline. Film reel / video player aesthetic. "
        "No wallet needed badge in corner."
    ),

    # DAY 15 — Apr 27
    "0427-1": (
        STYLE +
        "Soul Core NFT display. A monster character portrait in an ornate digital frame. "
        "SOULBOUND badge with chain-link pattern indicating non-transferable. "
        "On-chain metadata display showing: Archetype, DNA scores (5 values), mint date. "
        "Blockchain network logo badge. NFT certificate / passport aesthetic. "
        "Gold ornate frame elements on dark background."
    ),

    # DAY 16 — Apr 28
    "0428-1": (
        "URGENT graphic design, high contrast. Red and orange gradient background (different from usual dark). "
        "Massive bold white text space. Clock or timer icon with urgency indicators. "
        "Exclamation marks, countdown energy. Arrow pointing to action area. "
        "Emergency broadcast / breaking news aesthetic. High saturation, impossible to ignore."
    ),

    # DAY 17 — Apr 29
    "0429-1": (
        STYLE +
        "A vertical roadmap timeline extending into the future. Dark background with glowing nodes: "
        "Near-term nodes are bright and detailed (Season System, Creator Traits), "
        "mid-term nodes are slightly dimmer (Multi-chain Support, Community Archetypes), "
        "far future node fades into mystery with a question mark. "
        "Each node has a small icon. Timeline extends upward into stars/space. "
        "Evolution and growth aesthetic. Exciting future roadmap."
    ),
}

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = genai.Client(api_key=API_KEY)

    total = len(PROMPTS)
    success = 0
    failed = []

    for i, (name, prompt) in enumerate(PROMPTS.items(), 1):
        out_path = os.path.join(OUTPUT_DIR, f"{name}.png")

        # Skip if already exists
        if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
            print(f"[{i}/{total}] SKIP {name}.png (already exists)")
            success += 1
            continue

        print(f"[{i}/{total}] Generating {name}.png ...", end=" ", flush=True)

        try:
            response = client.models.generate_images(
                model=MODEL,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="16:9",
                ),
            )

            if response.generated_images:
                img_bytes = response.generated_images[0].image.image_bytes
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                print(f"OK ({len(img_bytes)//1024}KB)")
                success += 1
            else:
                print("FAIL (no images returned)")
                failed.append(name)

        except Exception as e:
            err_msg = str(e)[:200]
            print(f"ERROR: {err_msg}")
            failed.append(name)

        # Rate limit: wait between requests
        if i < total:
            time.sleep(3)

    print(f"\n{'='*50}")
    print(f"Done: {success}/{total} images generated")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print(f"Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
