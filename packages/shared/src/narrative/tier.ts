/**
 * T-COL-02 — Rarity / Tier system
 *
 * Deterministic tier based on DNA extremity.
 * Same DNA → same tier, always.
 */
import type { PersonaDNA } from "../types/dna";
import type { BadgeRarity } from "../badges";

export type Tier = BadgeRarity; // "common" | "uncommon" | "rare" | "epic" | "mythic"

/** Display metadata per tier */
export interface TierDefinition {
  tier: Tier;
  label: string;
  color: string;       // CSS hex
  glowColor: string;   // CSS hex, for card glow
  gemIcon: string;     // emoji / unicode
  borderStyle: string; // CSS box-shadow shorthand
}

export const TIER_DEFINITIONS: Record<Tier, TierDefinition> = {
  common: {
    tier: "common",
    label: "Common",
    color: "#aaaaaa",
    glowColor: "#aaaaaa44",
    gemIcon: "⬜",
    borderStyle: "0 0 0 1px #aaaaaa44",
  },
  uncommon: {
    tier: "uncommon",
    label: "Uncommon",
    color: "#00ff88",
    glowColor: "#00ff8844",
    gemIcon: "🟩",
    borderStyle: "0 0 8px #00ff8866",
  },
  rare: {
    tier: "rare",
    label: "Rare",
    color: "#00d4ff",
    glowColor: "#00d4ff44",
    gemIcon: "🔷",
    borderStyle: "0 0 12px #00d4ff66",
  },
  epic: {
    tier: "epic",
    label: "Epic",
    color: "#9945ff",
    glowColor: "#9945ff44",
    gemIcon: "💜",
    borderStyle: "0 0 16px #9945ff88",
  },
  mythic: {
    tier: "mythic",
    label: "Mythic",
    color: "#ffd700",
    glowColor: "#ffd70044",
    gemIcon: "⭐",
    borderStyle: "0 0 20px #ffd70099, 0 0 40px #ffd70033",
  },
};

/**
 * Compute the rarity tier of a wallet's DNA.
 *
 * Rules (from TODO T-COL-02):
 *   extremeCount = count(axis ≥ 80 || axis ≤ 20)
 *   stdDev       = std([aggression, conviction, chaos, luck, survival])
 *
 *   mythic  : extremeCount ≥ 4 && stdDev ≥ 30
 *   epic    : extremeCount ≥ 3
 *   rare    : extremeCount ≥ 2 || stdDev ≥ 25
 *   uncommon: extremeCount ≥ 1
 *   common  : default
 */
export function computeTier(dna: Pick<PersonaDNA, "aggression" | "conviction" | "chaos" | "luck" | "survival">): Tier {
  const axes = [dna.aggression, dna.conviction, dna.chaos, dna.luck, dna.survival];

  const extremeCount = axes.filter((v) => v >= 80 || v <= 20).length;

  const mean = axes.reduce((s, v) => s + v, 0) / axes.length;
  const variance = axes.reduce((s, v) => s + (v - mean) ** 2, 0) / axes.length;
  const stdDev = Math.sqrt(variance);

  if (extremeCount >= 4 && stdDev >= 30) return "mythic";
  if (extremeCount >= 3) return "epic";
  if (extremeCount >= 2 || stdDev >= 25) return "rare";
  if (extremeCount >= 1) return "uncommon";
  return "common";
}
