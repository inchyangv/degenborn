/**
 * T-MEME-01 — Meme Template Studio.
 *
 * 10 SVG-based meme templates, mapped to archetype + dialogue banks.
 * Character is overlaid at a defined slot position.
 * Text can be auto-picked (from dialogue bank) or manually overridden.
 */
import type { ArchetypeId } from "@degenborn/shared";
import type { DialogueEventType } from "@degenborn/shared";

export interface TextSlot {
  id: string;
  label: string;
  /** Which dialogue event type to auto-pick from */
  autoEvent?: DialogueEventType;
  /** Max characters before wrapping */
  maxChars: number;
}

export interface CharacterSlot {
  /** x/y in 0-1 (relative to template 600x600 canvas) */
  x: number;
  y: number;
  size: number; // px
  flip?: boolean; // mirror horizontally
}

export interface MemeTemplate {
  id: string;
  name: string;
  /** Which archetypes this template maps best to (shown first in picker) */
  preferredArchetypes: ArchetypeId[];
  /** Text slots to fill */
  textSlots: TextSlot[];
  /** Where to place the character in the SVG */
  characterSlot: CharacterSlot;
  /** Background color */
  bg: string;
  /** Build the SVG string given text values and character element */
  buildSvg: (texts: Record<string, string>, characterDataUrl?: string) => string;
}

// ── Helper builders ────────────────────────────────────────────────────────────

/** Wrap text into lines of maxWidth chars */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxWidth) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

/** Multi-line SVG <text> block */
function svgText(
  text: string,
  x: number,
  y: number,
  opts: {
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fontWeight?: string;
    fontFamily?: string;
    textAnchor?: string;
    maxChars?: number;
    lineHeight?: number;
  } = {},
): string {
  const {
    fontSize = 28,
    fill = "#000",
    stroke,
    strokeWidth = 3,
    fontWeight = "900",
    fontFamily = "Impact, 'Arial Black', sans-serif",
    textAnchor = "middle",
    maxChars = 24,
    lineHeight = fontSize * 1.2,
  } = opts;

  const lines = wrapText(text, maxChars);
  const strokeAttr = stroke
    ? `stroke="${stroke}" stroke-width="${strokeWidth}" paint-order="stroke"`
    : "";

  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * lineHeight}" font-size="${fontSize}" fill="${fill}" ${strokeAttr} font-weight="${fontWeight}" font-family="${fontFamily}" text-anchor="${textAnchor}" dominant-baseline="middle">${line}</text>`,
    )
    .join("\n");
}

function characterImage(dataUrl: string | undefined, slot: CharacterSlot): string {
  if (!dataUrl) {
    // Placeholder circle
    return `<circle cx="${slot.x + slot.size / 2}" cy="${slot.y + slot.size / 2}" r="${slot.size / 2}" fill="#333" opacity="0.5"/>`;
  }
  const flipTransform = slot.flip
    ? `transform="scale(-1,1) translate(-${slot.x * 2 + slot.size},0)"`
    : "";
  return `<image href="${dataUrl}" x="${slot.x}" y="${slot.y}" width="${slot.size}" height="${slot.size}" ${flipTransform} clip-path="circle()" style="border-radius:50%"/>`;
}

// ── Template definitions ──────────────────────────────────────────────────────

export const MEME_TEMPLATES: MemeTemplate[] = [
  // 1 — This is fine (burning room)
  {
    id: "this_is_fine",
    name: "This is Fine",
    preferredArchetypes: ["diamond_cultist", "ghost_bagholder", "mad_gambler"],
    characterSlot: { x: 60, y: 340, size: 120 },
    bg: "#d4611a",
    textSlots: [
      {
        id: "top",
        label: "Top text",
        autoEvent: "big_loss",
        maxChars: 28,
      },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <!-- Burning room background -->
  <rect width="600" height="500" fill="#b84a0e"/>
  <rect x="0" y="0" width="600" height="220" fill="#c45514"/>
  <!-- Flames -->
  <ellipse cx="100" cy="440" rx="60" ry="80" fill="#ff6b00" opacity="0.8"/>
  <ellipse cx="160" cy="420" rx="40" ry="60" fill="#ffb347" opacity="0.7"/>
  <ellipse cx="480" cy="450" rx="70" ry="90" fill="#ff6b00" opacity="0.8"/>
  <ellipse cx="540" cy="430" rx="45" ry="65" fill="#ffb347" opacity="0.7"/>
  <ellipse cx="300" cy="460" rx="80" ry="60" fill="#ff6b00" opacity="0.6"/>
  <!-- Table -->
  <rect x="40" y="370" width="220" height="20" rx="4" fill="#7a3f1a"/>
  <rect x="50" y="390" width="10" height="80" fill="#7a3f1a"/>
  <rect x="240" y="390" width="10" height="80" fill="#7a3f1a"/>
  <!-- Floor -->
  <rect x="0" y="450" width="600" height="50" fill="#8b2c00" opacity="0.6"/>
  <!-- Character -->
  ${characterImage(charUrl, { x: 60, y: 330, size: 130 })}
  <!-- Speech bubble -->
  <rect x="200" y="310" width="220" height="50" rx="10" fill="white"/>
  <polygon points="200,340 175,360 210,360" fill="white"/>
  ${svgText(texts["top"] ?? "This is fine.", 310, 340, { fontSize: 20, fill: "#000", maxChars: 22, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 2 — Stonks / Not Stonks
  {
    id: "stonks",
    name: "Stonks / Not Stonks",
    preferredArchetypes: ["sniper_jester", "mad_gambler", "ghost_bagholder"],
    characterSlot: { x: 380, y: 250, size: 150 },
    bg: "#1a1a2e",
    textSlots: [
      { id: "top", label: "Top text", autoEvent: "first_win", maxChars: 26 },
      { id: "bottom", label: "Bottom line", autoEvent: "big_loss", maxChars: 26 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#0d0d1a"/>
  <!-- Chart line -->
  <polyline points="50,400 150,350 200,300 250,320 300,260 350,200 400,120 450,80" stroke="#00ff88" stroke-width="4" fill="none"/>
  <!-- Chart line going down -->
  <polyline points="50,100 150,120 200,180 250,160 300,250 350,350 400,380 450,420" stroke="#ff3d3d" stroke-width="4" fill="none" stroke-dasharray="10,5"/>
  <!-- Labels -->
  ${svgText("STONKS", 200, 60, { fontSize: 48, fill: "#00ff88", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  ${svgText("NOT STONKS", 200, 460, { fontSize: 40, fill: "#ff3d3d", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  ${characterImage(charUrl, { x: 380, y: 250, size: 180 })}
  ${svgText(texts["top"] ?? "When it goes up", 200, 130, { fontSize: 20, fill: "#fff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["bottom"] ?? "When it crashes", 200, 400, { fontSize: 20, fill: "#fff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 3 — Galaxy Brain (4-panel)
  {
    id: "galaxy_brain",
    name: "Galaxy Brain",
    preferredArchetypes: ["rug_necromancer", "diamond_cultist", "sniper_jester"],
    characterSlot: { x: 420, y: 200, size: 160 },
    bg: "#0a0a1a",
    textSlots: [
      { id: "p1", label: "Step 1 (small brain)", autoEvent: "idle", maxChars: 22 },
      { id: "p2", label: "Step 2", autoEvent: "big_loss", maxChars: 22 },
      { id: "p3", label: "Step 3", autoEvent: "recovery", maxChars: 22 },
      { id: "p4", label: "Step 4 (galaxy brain)", autoEvent: "level_up", maxChars: 22 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#08081a"/>
  <!-- Brain glow levels -->
  <ellipse cx="80" cy="70" rx="55" ry="30" fill="#333" opacity="0.8"/>
  <ellipse cx="80" cy="180" rx="65" ry="35" fill="#553399" opacity="0.6"/>
  <ellipse cx="80" cy="300" rx="80" ry="45" fill="#8833ff" opacity="0.7"/>
  <ellipse cx="80" cy="430" rx="100" ry="55" fill="#aa55ff" opacity="0.9"/>
  <!-- Stars around big brain -->
  <text x="40" y="410" font-size="14" fill="#fff">✦</text>
  <text x="150" y="420" font-size="14" fill="#fff">✦</text>
  <text x="100" y="460" font-size="18" fill="#ccaaff">✦</text>
  <!-- Panel dividers -->
  <line x1="160" y1="0" x2="160" y2="500" stroke="#1a1a3a" stroke-width="2"/>
  <line x1="0" y1="125" x2="600" y2="125" stroke="#1a1a3a" stroke-width="1"/>
  <line x1="0" y1="250" x2="600" y2="250" stroke="#1a1a3a" stroke-width="1"/>
  <line x1="0" y1="375" x2="600" y2="375" stroke="#1a1a3a" stroke-width="1"/>
  <!-- Text panels -->
  ${svgText(texts["p1"] ?? "Buy the dip", 380, 62, { fontSize: 18, fill: "#ccc", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["p2"] ?? "It can't go lower", 380, 187, { fontSize: 18, fill: "#aaf", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["p3"] ?? "Average down again", 380, 312, { fontSize: 18, fill: "#cc99ff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["p4"] ?? "This is the way", 380, 437, { fontSize: 18, fill: "#ffaaff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${characterImage(charUrl, { x: 420, y: 350, size: 140 })}
</svg>`,
  },

  // 4 — Gigachad
  {
    id: "gigachad",
    name: "Gigachad",
    preferredArchetypes: ["mad_gambler", "sniper_jester", "ice_whale"],
    characterSlot: { x: 200, y: 120, size: 200 },
    bg: "#111",
    textSlots: [
      { id: "top", label: "Achievement", autoEvent: "first_win", maxChars: 28 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#0a0a0a"/>
  <!-- Dark gradient bg -->
  <radialGradient id="glow"><stop offset="0%" stop-color="#333" stop-opacity="0.5"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>
  <ellipse cx="300" cy="250" rx="280" ry="200" fill="url(#glow)"/>
  <!-- Title -->
  ${svgText("CHAD", 300, 60, { fontSize: 64, fill: "#fff", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  <!-- Character (large, center) -->
  ${characterImage(charUrl, { x: 200, y: 100, size: 200 })}
  <!-- Bottom text -->
  ${svgText(texts["top"] ?? "Entry: perfect. Exit: perfect.", 300, 420, { fontSize: 22, fill: "#ffd700", stroke: "#000", maxChars: 28, fontFamily: "Impact, sans-serif" })}
  ${svgText("based", 300, 460, { fontSize: 18, fill: "#888", fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 5 — Wojak Crying
  {
    id: "wojak_crying",
    name: "Wojak Crying",
    preferredArchetypes: ["ghost_bagholder", "diamond_cultist", "mad_gambler"],
    characterSlot: { x: 200, y: 150, size: 180 },
    bg: "#1a1a1a",
    textSlots: [
      { id: "top", label: "The pain", autoEvent: "big_loss", maxChars: 28 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#111"/>
  <!-- Tears -->
  <ellipse cx="255" cy="310" rx="6" ry="20" fill="#4488cc" opacity="0.8"/>
  <ellipse cx="265" cy="325" rx="5" ry="15" fill="#4488cc" opacity="0.6"/>
  <ellipse cx="345" cy="310" rx="6" ry="20" fill="#4488cc" opacity="0.8"/>
  ${characterImage(charUrl, { x: 200, y: 150, size: 200 })}
  ${svgText(texts["top"] ?? "When the chart doesn't recover", 300, 60, { fontSize: 24, fill: "#fff", stroke: "#000", maxChars: 26, fontFamily: "Impact, sans-serif" })}
  ${svgText("ngmi", 300, 450, { fontSize: 36, fill: "#4488cc", stroke: "#000", fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 6 — Distracted Boyfriend
  {
    id: "distracted_bf",
    name: "Distracted Boyfriend",
    preferredArchetypes: ["sniper_jester", "mad_gambler"],
    characterSlot: { x: 50, y: 180, size: 160 },
    bg: "#222",
    textSlots: [
      { id: "left", label: "What you have", autoEvent: "idle", maxChars: 18 },
      { id: "right", label: "What you want", autoEvent: "first_win", maxChars: 18 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#1a1a1a"/>
  <!-- Labels -->
  <rect x="20" y="380" width="200" height="60" rx="4" fill="#ff3d3d" opacity="0.85"/>
  <rect x="380" y="380" width="200" height="60" rx="4" fill="#00ff88" opacity="0.85"/>
  ${svgText(texts["left"] ?? "your current bag", 120, 415, { fontSize: 16, fill: "#fff", maxChars: 18, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["right"] ?? "new shiny token", 480, 415, { fontSize: 16, fill: "#000", maxChars: 18, fontFamily: "Impact, sans-serif" })}
  <!-- Character (the "distracted" one) -->
  ${characterImage(charUrl, { x: 50, y: 180, size: 160 })}
  <!-- Arrow pointing right -->
  <path d="M 210 250 Q 300 200 380 280" stroke="#ffd700" stroke-width="4" fill="none" marker-end="url(#arr)"/>
  <!-- "Girlfriend" placeholder -->
  <rect x="400" y="170" width="140" height="170" rx="12" fill="#333" opacity="0.7"/>
  <text x="470" y="260" font-size="36" text-anchor="middle">✨</text>
  ${svgText("NGMI", 300, 60, { fontSize: 52, fill: "#ff3d3d", stroke: "#000", fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 7 — They don't know
  {
    id: "they_dont_know",
    name: "They Don't Know...",
    preferredArchetypes: ["ice_whale", "rug_necromancer"],
    characterSlot: { x: 360, y: 120, size: 180 },
    bg: "#0a0a0a",
    textSlots: [
      { id: "top", label: "What they don't know", autoEvent: "idle", maxChars: 32 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#0d0d0d"/>
  <!-- Party background left side -->
  <rect x="0" y="0" width="340" height="500" fill="#1a1210"/>
  <text x="40" y="100" font-size="30" opacity="0.3">🎉</text>
  <text x="100" y="200" font-size="25" opacity="0.25">🎊</text>
  <text x="60" y="300" font-size="28" opacity="0.3">🎈</text>
  <text x="150" y="400" font-size="22" opacity="0.2">✨</text>
  <!-- "They" crowd (simple circles) -->
  <circle cx="60" cy="380" r="35" fill="#444"/>
  <circle cx="140" cy="390" r="30" fill="#555"/>
  <circle cx="220" cy="375" r="35" fill="#444"/>
  <circle cx="300" cy="385" r="28" fill="#555"/>
  <!-- Speech bubble from crowd -->
  <rect x="40" y="270" width="260" height="80" rx="12" fill="#222"/>
  <polygon points="100,350 80,380 130,350" fill="#222"/>
  ${svgText("They don't know I'm", 170, 300, { fontSize: 16, fill: "#aaa", maxChars: 26, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["top"] ?? "still holding", 170, 325, { fontSize: 16, fill: "#ffd700", maxChars: 26, fontFamily: "Impact, sans-serif" })}
  <!-- The character standing alone -->
  ${characterImage(charUrl, { x: 360, y: 120, size: 200 })}
  ${svgText("alone at the party", 480, 370, { fontSize: 16, fill: "#888", maxChars: 18, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 8 — Expanding Brain (same as Galaxy Brain variant, simpler)
  {
    id: "expanding_brain",
    name: "Expanding Brain",
    preferredArchetypes: ["rug_necromancer", "ice_whale", "diamond_cultist"],
    characterSlot: { x: 30, y: 350, size: 110 },
    bg: "#0a0010",
    textSlots: [
      { id: "l1", label: "Normal thought", autoEvent: "idle", maxChars: 24 },
      { id: "l2", label: "Big thought", autoEvent: "recovery", maxChars: 24 },
      { id: "l3", label: "Galaxy thought", autoEvent: "level_up", maxChars: 24 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#08000f"/>
  <!-- Brain glow layers -->
  <ellipse cx="80" cy="90" rx="60" ry="40" fill="#222" opacity="0.9"/>
  <ellipse cx="80" cy="240" rx="80" ry="55" fill="#441166" opacity="0.8"/>
  <ellipse cx="80" cy="400" rx="110" ry="80" fill="#8822cc" opacity="0.9"/>
  <!-- Stars around biggest brain -->
  <text x="10" y="380" font-size="14" fill="#cc99ff">✦</text>
  <text x="170" y="420" font-size="16" fill="#cc99ff">✦</text>
  <text x="80" y="470" font-size="20" fill="#ffaaff">✦</text>
  <!-- Panel lines -->
  <line x1="175" y1="0" x2="175" y2="500" stroke="#1a0020" stroke-width="2"/>
  <line x1="0" y1="167" x2="600" y2="167" stroke="#1a0020" stroke-width="1"/>
  <line x1="0" y1="334" x2="600" y2="334" stroke="#1a0020" stroke-width="1"/>
  <!-- Text -->
  ${svgText(texts["l1"] ?? "Stay in the trade", 390, 83, { fontSize: 18, fill: "#ccc", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["l2"] ?? "The thesis is intact", 390, 250, { fontSize: 18, fill: "#cc99ff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${svgText(texts["l3"] ?? "I am the bag", 390, 416, { fontSize: 18, fill: "#ffaaff", stroke: "#330066", maxChars: 24, fontFamily: "Impact, sans-serif" })}
  ${characterImage(charUrl, { x: 30, y: 360, size: 110 })}
</svg>`,
  },

  // 9 — Spiderman Pointing (rival pair)
  {
    id: "spiderman_pointing",
    name: "Spiderman Pointing",
    preferredArchetypes: ["mad_gambler", "sniper_jester", "rug_necromancer"],
    characterSlot: { x: 60, y: 160, size: 160 },
    bg: "#1a0a0a",
    textSlots: [
      { id: "label", label: "What they're pointing at", autoEvent: "idle", maxChars: 30 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#111"/>
  <!-- Two characters facing each other -->
  ${characterImage(charUrl, { x: 60, y: 160, size: 180 })}
  ${characterImage(charUrl, { x: 360, y: 160, size: 180, flip: true })}
  <!-- Pointing arrows -->
  <path d="M 240 250 L 360 250" stroke="#ffd700" stroke-width="6" marker-end="url(#arrowhead)" fill="none"/>
  <path d="M 360 270 L 240 270" stroke="#ffd700" stroke-width="6" marker-end="url(#arrowhead2)" fill="none"/>
  <!-- Label box -->
  <rect x="150" y="380" width="300" height="70" rx="8" fill="#222"/>
  ${svgText(texts["label"] ?? "same energy", 300, 420, { fontSize: 20, fill: "#ffd700", maxChars: 28, fontFamily: "Impact, sans-serif" })}
  ${svgText("TWO SIDES", 300, 70, { fontSize: 44, fill: "#fff", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  ${svgText("SAME COPE", 300, 120, { fontSize: 44, fill: "#ff3d3d", stroke: "#000", fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 10 — Is this a pigeon?
  {
    id: "is_this_a_pigeon",
    name: "Is This a Pigeon?",
    preferredArchetypes: ["sniper_jester", "ghost_bagholder", "mad_gambler"],
    characterSlot: { x: 30, y: 80, size: 180 },
    bg: "#fff",
    textSlots: [
      { id: "butterfly", label: "What they're calling 'alpha'", autoEvent: "big_loss", maxChars: 22 },
      { id: "question", label: "Question", autoEvent: "idle", maxChars: 26 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#f8f8f0"/>
  ${characterImage(charUrl, { x: 30, y: 80, size: 180 })}
  <!-- Butterfly placeholder -->
  <ellipse cx="430" cy="160" rx="80" ry="50" fill="#ff9966" opacity="0.8"/>
  <ellipse cx="430" cy="160" rx="50" ry="80" fill="#ff6633" opacity="0.7"/>
  <text x="390" y="165" font-size="36">🦋</text>
  <!-- Label for butterfly -->
  <rect x="340" y="60" width="220" height="50" rx="6" fill="#333"/>
  ${svgText(texts["butterfly"] ?? "obvious rug pull", 450, 88, { fontSize: 17, fill: "#fff", maxChars: 20, fontFamily: "Impact, sans-serif" })}
  <!-- Question label -->
  <rect x="80" y="340" width="300" height="90" rx="6" fill="#333"/>
  ${svgText(`Is this ${texts["question"] ?? "alpha?"}`, 230, 380, { fontSize: 22, fill: "#fff", maxChars: 24, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 11 — Bought the Dip / It Dipped More (2-panel)
  {
    id: "bought_the_dip",
    name: "Bought the Dip",
    preferredArchetypes: ["diamond_cultist", "ghost_bagholder", "mad_gambler"],
    characterSlot: { x: 30, y: 80, size: 140 },
    bg: "#0d0d0d",
    textSlots: [
      { id: "hopium", label: "The hopium", autoEvent: "recovery", maxChars: 26 },
      { id: "despair", label: "What happened", autoEvent: "big_loss", maxChars: 26 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#0a0a0a"/>
  <!-- Divider -->
  <line x1="0" y1="250" x2="600" y2="250" stroke="#333" stroke-width="2"/>
  <!-- Top half — hopium green -->
  <rect width="600" height="250" fill="#0a1a0a"/>
  <text x="300" y="30" font-size="16" font-family="Impact, sans-serif" fill="#00ff88" text-anchor="middle" font-weight="900">BOUGHT THE DIP</text>
  ${characterImage(charUrl, { x: 30, y: 40, size: 140 })}
  <!-- Arrow up -->
  <path d="M 200 200 L 500 100" stroke="#00ff88" stroke-width="5" fill="none"/>
  <polygon points="505,95 490,115 515,115" fill="#00ff88"/>
  ${svgText(texts["hopium"] ?? "This is the bottom 🚀", 360, 150, { fontSize: 19, fill: "#00ff88", stroke: "#000", maxChars: 22, fontFamily: "Impact, sans-serif" })}
  <!-- Bottom half — despair red -->
  <rect y="250" width="600" height="250" fill="#1a0a0a"/>
  <text x="300" y="275" font-size="16" font-family="Impact, sans-serif" fill="#ff3d3d" text-anchor="middle" font-weight="900">IT DIPPED MORE</text>
  ${characterImage(charUrl, { x: 30, y: 295, size: 140 })}
  <!-- Arrow down -->
  <path d="M 200 310 L 500 420" stroke="#ff3d3d" stroke-width="5" fill="none"/>
  <polygon points="505,425 490,405 510,405" fill="#ff3d3d"/>
  ${svgText(texts["despair"] ?? "I averaged down again", 360, 380, { fontSize: 19, fill: "#ff3d3d", stroke: "#000", maxChars: 22, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 12 — Nobody: / My Portfolio:
  {
    id: "nobody_portfolio",
    name: "Nobody: My Portfolio:",
    preferredArchetypes: ["mad_gambler", "ghost_bagholder", "diamond_cultist"],
    characterSlot: { x: 340, y: 150, size: 200 },
    bg: "#111",
    textSlots: [
      { id: "portfolio_behavior", label: "My portfolio does...", autoEvent: "rug_event", maxChars: 28 },
    ],
    buildSvg: (texts, charUrl) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#0d0d0d"/>
  <!-- Nobody: line -->
  ${svgText("Nobody:", 300, 55, { fontSize: 38, fill: "#888", fontFamily: "Impact, sans-serif" })}
  <!-- My portfolio line -->
  ${svgText("My portfolio:", 300, 105, { fontSize: 38, fill: "#ffd700", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  <!-- Chart going insane -->
  <polyline points="30,350 80,200 130,400 180,150 230,420 280,100 330,380 380,50 430,300 480,180 530,400" stroke="#ff3d3d" stroke-width="4" fill="none"/>
  <!-- Character looking at chart -->
  ${characterImage(charUrl, { x: 340, y: 150, size: 180 })}
  ${svgText(texts["portfolio_behavior"] ?? "random walk to zero", 200, 460, { fontSize: 20, fill: "#fff", stroke: "#000", maxChars: 26, fontFamily: "Impact, sans-serif" })}
</svg>`,
  },

  // 13 — Rug Pull Stages of Grief (5 stages)
  {
    id: "rug_grief",
    name: "Rug Pull Stages of Grief",
    preferredArchetypes: ["rug_necromancer", "ghost_bagholder", "diamond_cultist"],
    characterSlot: { x: 10, y: 130, size: 80 },
    bg: "#0a0005",
    textSlots: [
      { id: "s1", label: "Denial", autoEvent: "idle", maxChars: 16 },
      { id: "s2", label: "Anger", autoEvent: "rug_event", maxChars: 16 },
      { id: "s3", label: "Bargaining", autoEvent: "big_loss", maxChars: 16 },
      { id: "s4", label: "Depression", autoEvent: "idle", maxChars: 16 },
      { id: "s5", label: "Acceptance", autoEvent: "recovery", maxChars: 16 },
    ],
    buildSvg: (texts, charUrl) => {
      const stages = [
        { label: "DENIAL", text: texts["s1"] ?? "Dev is sleeping", color: "#00d4ff", y: 55 },
        { label: "ANGER", text: texts["s2"] ?? "I'll find the dev", color: "#ff6600", y: 155 },
        { label: "BARGAINING", text: texts["s3"] ?? "Just 2x pls", color: "#ffd700", y: 255 },
        { label: "DEPRESSION", text: texts["s4"] ?? "I'm a ghost now", color: "#9945ff", y: 355 },
        { label: "ACCEPTANCE", text: texts["s5"] ?? "gm degens", color: "#00ff88", y: 455 },
      ];
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
  <rect width="600" height="500" fill="#080005"/>
  ${stages.map(({ label, text, color, y }) => `
    <rect x="0" y="${y - 45}" width="600" height="90" fill="${color}0a"/>
    <line x1="0" y1="${y - 45}" x2="600" y2="${y - 45}" stroke="${color}22" stroke-width="1"/>
    ${svgText(label, 160, y, { fontSize: 15, fill: color, maxChars: 14, fontFamily: "Impact, sans-serif", textAnchor: "middle" })}
    ${svgText(text, 430, y, { fontSize: 16, fill: "#ccc", maxChars: 18, fontFamily: "Impact, sans-serif", textAnchor: "middle" })}
  `).join("")}
  <!-- Character column -->
  ${characterImage(charUrl, { x: 10, y: 130, size: 80 })}
  ${characterImage(charUrl, { x: 10, y: 230, size: 80 })}
  ${characterImage(charUrl, { x: 10, y: 330, size: 80 })}
  ${characterImage(charUrl, { x: 10, y: 395, size: 80 })}
  ${characterImage(charUrl, { x: 10, y: 425, size: 60 })}
  <!-- Title -->
  ${svgText("RUG PULL", 300, 25, { fontSize: 22, fill: "#ff3d3d", stroke: "#000", fontFamily: "Impact, sans-serif" })}
  ${svgText("Stages of Grief", 300, 42, { fontSize: 14, fill: "#888", fontFamily: "Impact, sans-serif" })}
  <!-- Stage column header -->
  ${svgText("Stage", 160, 12, { fontSize: 12, fill: "#555", fontFamily: "Impact, sans-serif", textAnchor: "middle" })}
  ${svgText("Thought", 430, 12, { fontSize: 12, fill: "#555", fontFamily: "Impact, sans-serif", textAnchor: "middle" })}
</svg>`;
    },
  },
];

/** Get the best default text for a slot based on archetype/state */
export function getDefaultText(
  slot: TextSlot,
  archetype: ArchetypeId,
  dialogueLines: Record<DialogueEventType, string>,
): string {
  if (slot.autoEvent && dialogueLines[slot.autoEvent]) {
    return dialogueLines[slot.autoEvent]!;
  }
  return "";
}
