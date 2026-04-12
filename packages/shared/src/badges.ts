/**
 * T-ID-02 — Badge / achievement system.
 *
 * Badges are derived declaratively from CharacterState.
 * Same state → same badges (deterministic).
 * The state machine calls evaluateBadges() before and after each event
 * to compute newly earned badges.
 */
import type { CharacterState } from "./types/state";

export type BadgeId =
  | "first_blood"
  | "triple_crowned"
  | "rug_survivor"
  | "rug_necromancer_badge"
  | "diamond_fossil"
  | "comeback_kid"
  | "phoenix_protocol"
  | "cope_master"
  | "sniper_supreme"
  | "revenge_arc"
  | "hall_of_scars"
  | "the_flatline"
  | "resurrection"
  | "zero_hour"
  | "four_meme_native";

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "mythic";

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  /** Declarative predicate — returns true when the badge should be earned */
  check: (state: CharacterState) => boolean;
}

/**
 * Canonical badge catalog — 15 badges, ordered by rarity (common → mythic).
 * All conditions are derived from CharacterState fields only.
 */
export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: "four_meme_native",
    name: "Four.meme Native",
    description: "Soul Core minted via Four.meme. Welcome, degen.",
    emoji: "🟡",
    rarity: "common",
    check: () => true, // awarded to every minted Soul Core
  },
  {
    id: "first_blood",
    name: "First Blood",
    description: "First win recorded. The journey begins.",
    emoji: "🩸",
    rarity: "common",
    check: (s) => s.crown_count >= 1,
  },
  {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Recovered from a major loss. Revenge mode unlocked.",
    emoji: "🔄",
    rarity: "common",
    check: (s) => s.mood === "revenge" || s.survival_streak >= 1,
  },
  {
    id: "rug_survivor",
    name: "Rug Survivor",
    description: "Survived a rug pull and lived to cope about it.",
    emoji: "🧟",
    rarity: "uncommon",
    check: (s) => s.corruption >= 20 && s.survival_streak >= 1,
  },
  {
    id: "revenge_arc",
    name: "Revenge Arc",
    description: "Went from scarred to crowned. The arc is real.",
    emoji: "🔥",
    rarity: "uncommon",
    check: (s) => s.scar_count >= 1 && s.crown_count >= 1,
  },
  {
    id: "triple_crowned",
    name: "Triple-Crowned",
    description: "Three consecutive win streaks. The market bows.",
    emoji: "👑",
    rarity: "rare",
    check: (s) => s.crown_count >= 3,
  },
  {
    id: "diamond_fossil",
    name: "Diamond Fossil",
    description: "Sustained conviction through multiple scars. Still holding.",
    emoji: "💎",
    rarity: "rare",
    check: (s) => s.scar_count >= 2 && s.prestige >= 20,
  },
  {
    id: "sniper_supreme",
    name: "Sniper Supreme",
    description: "High prestige, active crown. Precision incarnate.",
    emoji: "🎯",
    rarity: "rare",
    check: (s) => s.prestige >= 50 && s.crown_count >= 1,
  },
  {
    id: "hall_of_scars",
    name: "Hall of Scars",
    description: "Five scars and still breathing. The scars are the resume.",
    emoji: "⚔️",
    rarity: "rare",
    check: (s) => s.scar_count >= 5,
  },
  {
    id: "cope_master",
    name: "Cope Master",
    description: "Survived five scars and leveled up anyway. Coping is a skill.",
    emoji: "😤",
    rarity: "epic",
    check: (s) => s.scar_count >= 5 && s.level >= 3,
  },
  {
    id: "phoenix_protocol",
    name: "Phoenix Protocol",
    description: "Survival streak of 3+. Rose from the ashes. Again.",
    emoji: "🦅",
    rarity: "epic",
    check: (s) => s.survival_streak >= 3,
  },
  {
    id: "the_flatline",
    name: "The Flatline",
    description: "Ghost mode entered. The soul went dark.",
    emoji: "💀",
    rarity: "epic",
    check: (s) => s.mood === "ghost",
  },
  {
    id: "zero_hour",
    name: "Zero Hour",
    description: "Maximum corruption achieved. All-in on the void.",
    emoji: "☠️",
    rarity: "epic",
    check: (s) => s.corruption >= 80,
  },
  {
    id: "rug_necromancer_badge",
    name: "Rug Necromancer",
    description: "Three rugs survived. Chaos and survival at full throttle.",
    emoji: "🧿",
    rarity: "mythic",
    check: (s) => s.corruption >= 60 && s.survival_streak >= 2,
  },
  {
    id: "resurrection",
    name: "Resurrection",
    description: "Came back from ghost mode with a survival streak. Legendary.",
    emoji: "⚡",
    rarity: "mythic",
    check: (s) => s.corruption >= 20 && s.survival_streak >= 3 && s.crown_count >= 1,
  },
];

/** Fast lookup by id */
export const BADGE_MAP: Record<BadgeId, BadgeDefinition> = Object.fromEntries(
  BADGE_CATALOG.map((b) => [b.id, b]),
) as Record<BadgeId, BadgeDefinition>;

/**
 * Evaluate all earned badges for a given state.
 * Returns badges in catalog order (common → mythic).
 */
export function evaluateBadges(state: CharacterState): BadgeDefinition[] {
  return BADGE_CATALOG.filter((badge) => badge.check(state));
}

/**
 * Compute newly earned badges from a state transition.
 * Returns only badges that weren't earned before.
 */
export function diffBadges(
  stateBefore: CharacterState,
  stateAfter: CharacterState,
): BadgeId[] {
  const before = new Set(evaluateBadges(stateBefore).map((b) => b.id));
  const after = evaluateBadges(stateAfter);
  return after.filter((b) => !before.has(b.id)).map((b) => b.id);
}

/** Rarity display colors (CSS hex) */
export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#aaaaaa",
  uncommon: "#00ff88",
  rare: "#00d4ff",
  epic: "#9945ff",
  mythic: "#ffd700",
};

/**
 * Pick the top N "showcase" badges from an earned set.
 * Priority: rarity desc, then catalog order.
 * Used by Share Card for the representative badge row.
 */
export function pickShowcaseBadges(earned: BadgeDefinition[], n = 3): BadgeDefinition[] {
  const RARITY_WEIGHT: Record<BadgeRarity, number> = {
    mythic: 5, epic: 4, rare: 3, uncommon: 2, common: 1,
  };
  return [...earned]
    .sort((a, b) => RARITY_WEIGHT[b.rarity] - RARITY_WEIGHT[a.rarity])
    .slice(0, n);
}
