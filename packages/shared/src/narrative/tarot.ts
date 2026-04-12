/**
 * T-RET-02 — Weekly Tarot Draw.
 *
 * 22 Major Arcana reinterpreted for degen culture.
 * Weekly deterministic: Seed = djb2(wallet + YYYY-WW)
 * Upright + Reversed meanings for each card.
 */
import type { ArchetypeId } from "../types/archetype";

// ── djb2 hash ────────────────────────────────────────────────────────────────
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

/** ISO week number for a given date */
function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export interface TarotCard {
  number: number;
  name: string;
  upright: string;
  reversed: string;
  archetype_affinity?: ArchetypeId; // card has special resonance with this archetype
  symbol: string; // emoji/glyph
}

export const MAJOR_ARCANA: TarotCard[] = [
  {
    number: 0,
    name: "The Degen Fool",
    symbol: "🃏",
    upright: "New chain, new chance. Leap before looking — today it pays off.",
    reversed: "Overextended. You ape'd too soon. Count the cost.",
    archetype_affinity: "mad_gambler",
  },
  {
    number: 1,
    name: "The Conjurer",
    symbol: "⚗️",
    upright: "Your edge is real. The setup is in your hands. Execute.",
    reversed: "Tricks without substance. The market sees through it.",
    archetype_affinity: "sniper_jester",
  },
  {
    number: 2,
    name: "The Hidden Pool",
    symbol: "🌊",
    upright: "Accumulate quietly. The surface is calm; depth is everything.",
    reversed: "Secrets become traps. Disclose before forced.",
    archetype_affinity: "ice_whale",
  },
  {
    number: 3,
    name: "The Empress Chain",
    symbol: "👑",
    upright: "Abundance flows. Stack crowns — the kingdom expands.",
    reversed: "Overabundance leads to slippage. Secure gains.",
  },
  {
    number: 4,
    name: "The Whale Emperor",
    symbol: "🏛️",
    upright: "Structure and patience build the throne. One move, decisive.",
    reversed: "Rigidity is your enemy today. Adapt or exit.",
    archetype_affinity: "ice_whale",
  },
  {
    number: 5,
    name: "The Diamond Pope",
    symbol: "💎",
    upright: "The thesis holds. Stay the course. Conviction is the sermon.",
    reversed: "Dogma blinds. Question the bag you hold.",
    archetype_affinity: "diamond_cultist",
  },
  {
    number: 6,
    name: "The Lovers' Trade",
    symbol: "⚖️",
    upright: "Two positions. One choice. Choose the one you'd tell your future self about.",
    reversed: "The wrong entry made for emotional reasons.",
  },
  {
    number: 7,
    name: "The Chariot Ape",
    symbol: "🏎️",
    upright: "Speed and direction align. Send it — the momentum is yours.",
    reversed: "Moving fast in the wrong direction. Brake first.",
    archetype_affinity: "mad_gambler",
  },
  {
    number: 8,
    name: "Strength of Hands",
    symbol: "✊",
    upright: "Diamond hands under pressure. The paper hands have already sold.",
    reversed: "False strength. You're holding from fear, not conviction.",
    archetype_affinity: "diamond_cultist",
  },
  {
    number: 9,
    name: "The Ghost Hermit",
    symbol: "👻",
    upright: "Withdraw. Observe. The quiet bag-holder sees what the crowd misses.",
    reversed: "Isolation becomes delusion. Reconnect with reality.",
    archetype_affinity: "ghost_bagholder",
  },
  {
    number: 10,
    name: "Wheel of Cope",
    symbol: "🎡",
    upright: "The cycle turns. Yesterday's rug is tomorrow's entry. Spin with it.",
    reversed: "Stuck at the bottom of the wheel. Don't force rotation.",
  },
  {
    number: 11,
    name: "Justice of the Ledger",
    symbol: "⚔️",
    upright: "The PnL is honest. What you put in is what you get. Face it.",
    reversed: "Rationalization. The ledger doesn't lie even if you do.",
  },
  {
    number: 12,
    name: "The Hanged Bag",
    symbol: "🎒",
    upright: "Suspend judgment. The bag that looks dead may yet turn.",
    reversed: "Paralysis. Cut or commit — limbo drains both time and capital.",
    archetype_affinity: "ghost_bagholder",
  },
  {
    number: 13,
    name: "The Flatline",
    symbol: "💀",
    upright: "An ending clears the field. What flatlines creates space for rebirth.",
    reversed: "Refusing to acknowledge the death. The zombie trade continues.",
    archetype_affinity: "rug_necromancer",
  },
  {
    number: 14,
    name: "The Alchemist's Balance",
    symbol: "⚗️",
    upright: "Blend aggression with patience. The ratio is your edge today.",
    reversed: "Extremes without purpose. Too hot or too cold.",
  },
  {
    number: 15,
    name: "The Devil's Rug",
    symbol: "😈",
    upright: "Temptation is a rug in disguise. You already know this. Do you act?",
    reversed: "You broke the chain. The rug doesn't get this one.",
    archetype_affinity: "rug_necromancer",
  },
  {
    number: 16,
    name: "The Tower Dump",
    symbol: "🏚️",
    upright: "A sudden fall rebuilds the foundation. Embrace the reset.",
    reversed: "Refusing the tower moment. The longer you wait, the worse the fall.",
  },
  {
    number: 17,
    name: "The Star Chart",
    symbol: "⭐",
    upright: "Hope backed by data. The chart pattern is real this time.",
    reversed: "False signal. Stars don't care about your projection.",
  },
  {
    number: 18,
    name: "The Moon Pool",
    symbol: "🌕",
    upright: "Illusion is the market today. Trust your gut over the timeline.",
    reversed: "Fear of the unknown stalls a real opportunity.",
  },
  {
    number: 19,
    name: "The Sun Pump",
    symbol: "☀️",
    upright: "Green day ahead. The pump is justified. Ride it with discipline.",
    reversed: "Hype without substance. Exit before the crowd notices.",
  },
  {
    number: 20,
    name: "The Resurrection Call",
    symbol: "📯",
    upright: "Time to come back. The soul that went quiet has found its edge again.",
    reversed: "Too soon. The market isn't ready and neither are you.",
    archetype_affinity: "rug_necromancer",
  },
  {
    number: 21,
    name: "The World Chain",
    symbol: "🌐",
    upright: "Cycle complete. The whole thesis has proven out. One more revolution.",
    reversed: "Spinning in circles. The same trade for the third time isn't mastery.",
    archetype_affinity: "ice_whale",
  },
];

export interface WeeklyTarotDraw {
  card: TarotCard;
  is_reversed: boolean;
  week: string; // YYYY-WW
  meaning: string; // selected upright or reversed text
}

/**
 * Draw a weekly tarot card deterministically.
 * Same wallet + same ISO week → same card.
 */
export function drawWeeklyTarot(wallet: string, date?: Date): WeeklyTarotDraw {
  const d = date ?? new Date();
  const week = isoWeek(d);
  const seed = djb2(`${wallet.toLowerCase()}::tarot::${week}`);

  const cardIndex = seed % MAJOR_ARCANA.length;
  const card = MAJOR_ARCANA[cardIndex]!;
  const is_reversed = (seed >> 8) % 3 === 0; // ~33% chance of reversed

  return {
    card,
    is_reversed,
    week,
    meaning: is_reversed ? card.reversed : card.upright,
  };
}
