/**
 * T-ID-01 — Deterministic character name generator.
 *
 * Produces a unique "Name the Title" pair for every wallet × archetype combination.
 * Same wallet + same archetype + same state always returns the same name.
 * Title reflects current CharacterState, name itself is fixed.
 *
 * Structure: `<고유 이름> the <칭호>`
 * Example:   `Zagrok the Twice-Rugged`, `Mira the Unflinching`, `Ozu the Thrice-Crowned`
 */
import type { ArchetypeId } from "@degenborn/shared";

/** Minimal state subset needed for title derivation */
export interface NameState {
  archetype?: ArchetypeId;
  crown_count?: number;
  scar_count?: number;
  survival_streak?: number;
  corruption?: number;
  prestige?: number;
  mood?: string;
}

export interface CharacterName {
  /** Fixed proper name — never changes for a wallet */
  name: string;
  /** Dynamic epithet — updates as state changes */
  title: string;
  /** Canonical display form: "{name} the {title}" */
  full: string;
}

// ---------------------------------------------------------------------------
// Name pools — archetype-specific, 40-50 names each
// Mix of: dark fantasy / mythology / degen slang phonetics
// ---------------------------------------------------------------------------

const NAME_POOLS: Record<ArchetypeId, string[]> = {
  mad_gambler: [
    "Vex", "Krag", "Zorb", "Drex", "Mox", "Rax", "Skrell", "Gorz", "Threx", "Blax",
    "Vorn", "Krix", "Drugg", "Zeph", "Grak", "Nox", "Thrax", "Plex", "Kuzz", "Vrox",
    "Mord", "Draz", "Skrog", "Grax", "Jund", "Skell", "Muzz", "Blorg", "Grex", "Vrex",
    "Fuzz", "Skrag", "Grix", "Morx", "Krell", "Zorg", "Thrag", "Dex", "Blex", "Plax",
    "Krax", "Grag", "Drix", "Skaz", "Morz", "Gruzz", "Vreg", "Nax", "Brok", "Zrex",
  ],
  ice_whale: [
    "Azul", "Calmor", "Diran", "Elrin", "Foran", "Gyran", "Horveth", "Irin", "Juraal", "Kyrel",
    "Loran", "Miveth", "Nuvrel", "Ovarn", "Piran", "Quelan", "Ryvel", "Selvin", "Thuvan", "Uveth",
    "Vorlan", "Wuryn", "Xyren", "Yvanel", "Zethan", "Airan", "Belvin", "Coran", "Delvin", "Elvan",
    "Fyreth", "Goran", "Hiran", "Iveran", "Jarvan", "Kelvin", "Luvan", "Myran", "Noran", "Pelvan",
    "Ravan", "Soran", "Tuvan", "Ulvan", "Voreth", "Welvan", "Xyvan", "Zoleth", "Aelvan", "Byran",
  ],
  rug_necromancer: [
    "Zagrok", "Morthex", "Drevok", "Xanthis", "Korreth", "Vulgrim", "Thresh", "Cadavex", "Mortex", "Pyreth",
    "Skullok", "Graven", "Hexum", "Liche", "Corveth", "Dravel", "Morox", "Vortex", "Skrath", "Hexmor",
    "Grimvex", "Dravok", "Kelvex", "Morthul", "Skeleth", "Corvix", "Hexul", "Grimdrak", "Mortis", "Vexmor",
    "Skelbane", "Drakoth", "Hexveil", "Mordrex", "Grimlock", "Keldrak", "Morthin", "Vesper", "Skeldrak", "Vexbone",
    "Grimdex", "Morfix", "Hexrath", "Draxmor", "Skelvex", "Korrax", "Dreadmor", "Hexbane", "Mortavex", "Zarveth",
  ],
  diamond_cultist: [
    "Solus", "Faithon", "Ardent", "Devric", "Constiv", "Holdren", "Stoicus", "Crestus", "Veritas", "Gravus",
    "Primus", "Steadon", "Cruxan", "Fidelon", "Helian", "Imara", "Juron", "Kellus", "Lumen", "Mindus",
    "Novem", "Oldren", "Primox", "Querus", "Radiant", "Steadven", "Tivon", "Ultus", "Virthen", "Xaron",
    "Zoveth", "Ancren", "Belton", "Credus", "Doval", "Elius", "Firmun", "Gradus", "Holden", "Ivoret",
    "Justren", "Kellren", "Lethon", "Mortus", "Novren", "Pallus", "Quelon", "Rectus", "Sanctum", "Thyren",
  ],
  sniper_jester: [
    "Flicko", "Nimble", "Quixo", "Swifto", "Dasher", "Vexo", "Jingo", "Zapper", "Gleam", "Flasho",
    "Pucko", "Riffer", "Zingo", "Tricksy", "Blippo", "Snick", "Dazzle", "Whizo", "Flitox", "Gleeko",
    "Joltix", "Kwikko", "Larkso", "Mick", "Nippo", "Orpin", "Pippo", "Quillo", "Reelo", "Skipper",
    "Snapper", "Tilto", "Urger", "Volter", "Winker", "Xippo", "Yippo", "Zigger", "Arco", "Blinko",
    "Crispy", "Darter", "Edger", "Fango", "Gusto", "Hazex", "Irisk", "Jesto", "Klixx", "Ludox",
  ],
  ghost_bagholder: [
    "Limbo", "Drifter", "Shade", "Hollow", "Pallor", "Wisp", "Wraith", "Misto", "Voidal", "Fader",
    "Echon", "Murk", "Duskren", "Veilor", "Shroud", "Haunter", "Waner", "Dimmer", "Gaunt", "Husker",
    "Idleth", "Jadeon", "Kindless", "Lornal", "Mournen", "Numben", "Omenix", "Piner", "Quietor", "Relick",
    "Stiller", "Toner", "Undren", "Vestige", "Wither", "Xeneth", "Yarner", "Zerotix", "Ashen", "Bleaker",
    "Crestfal", "Dimwit", "Elegy", "Forlorn", "Grimal", "Huskren", "Inertex", "Joyless", "Kadon", "Lostren",
  ],
};

// ---------------------------------------------------------------------------
// djb2 hash — deterministic 32-bit unsigned integer from any string
// ---------------------------------------------------------------------------
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep as 32-bit unsigned
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Title derivation — priority-ordered, reflects current state
// ---------------------------------------------------------------------------
const ARCHETYPE_DEFAULT_TITLES: Record<ArchetypeId, string> = {
  mad_gambler: "All-In",
  ice_whale: "Patient",
  rug_necromancer: "Risen",
  diamond_cultist: "Faithful",
  sniper_jester: "Quick",
  ghost_bagholder: "Waiting",
};

function deriveTitle(state: NameState): string {
  const crowns = state.crown_count ?? 0;
  const scars = state.scar_count ?? 0;
  const streak = state.survival_streak ?? 0;
  const corruption = state.corruption ?? 0;
  const prestige = state.prestige ?? 0;
  const mood = state.mood ?? "neutral";
  const archetype = state.archetype;

  // Extreme milestones (highest priority)
  if (crowns >= 5) return "Eternally-Crowned";
  if (scars >= 5 && streak >= 3) return "Thrice-Resurrected";
  if (corruption >= 80 && streak >= 3) return "Undying";
  if (crowns >= 3 && scars >= 3) return "Crowned-in-Scars";
  if (crowns >= 3) return "Thrice-Crowned";
  if (scars >= 5) return "Five-Scarred";
  if (streak >= 5) return "Unflinching";
  if (prestige >= 70) return "Ascendant";
  if (scars >= 3) return "Twice-Rugged";
  if (corruption >= 60) return "Corrupted";
  if (streak >= 3) return "Unbreakable";
  if (mood === "revenge") return "Vengeful";
  if (crowns >= 1 && scars >= 1) return "Scarred-but-Crowned";
  if (crowns >= 2) return "Twice-Crowned";
  if (crowns >= 1) return "Crowned";
  if (scars >= 2) return "Twice-Scarred";
  if (scars >= 1) return "Scarred";
  if (streak >= 1) return "Unbroken";
  if (corruption >= 20) return "Touched";
  if (prestige >= 30) return "Rising";

  // Archetype default
  if (archetype && ARCHETYPE_DEFAULT_TITLES[archetype]) {
    return ARCHETYPE_DEFAULT_TITLES[archetype]!;
  }
  return "Unknown";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic character name for a wallet + archetype pair.
 *
 * @param wallet - Wallet address (case-insensitive)
 * @param archetype - One of the 6 archetype IDs
 * @param state - Optional current character state for title derivation
 * @returns { name, title, full } — name is fixed, title + full reflect state
 */
export function generateCharacterName(
  wallet: string,
  archetype: ArchetypeId,
  state?: NameState,
): CharacterName {
  const seed = djb2(wallet.toLowerCase());
  const pool = NAME_POOLS[archetype];
  const name = pool[seed % pool.length]!;

  const effectiveState: NameState = { archetype, ...(state ?? {}) };
  const title = deriveTitle(effectiveState);

  return {
    name,
    title,
    full: `${name} the ${title}`,
  };
}
