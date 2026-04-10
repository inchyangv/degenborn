/** All available visual traits */
export type TraitId =
  | "crown"          // crown_count ≥ 1
  | "gold_chain"     // crown_count ≥ 3
  | "bandage"        // scar_count ≥ 1
  | "torn_clothes"   // scar_count ≥ 2
  | "tears"          // mood = despair
  | "gold_tooth"     // prestige ≥ 30
  | "scar"           // scar_count ≥ 3
  | "zombie_eyes"    // corruption ≥ 50
  | "revenge_aura"   // mood = revenge
  | "royal_cloak"    // prestige ≥ 70
  | "ghost_form"     // mood = ghost
  | "skull_ring";    // survival_streak ≥ 5

export interface TraitDefinition {
  id: TraitId;
  label: string;
  description: string;
  asset_path: string;  // relative under /public/traits/
  category: "head" | "body" | "accessory" | "aura" | "eyes";
}

/** Single source of truth for trait emoji — same render across all pages */
export const TRAIT_EMOJI: Record<TraitId, string> = {
  crown: "👑",
  gold_chain: "⛓️",
  bandage: "🩹",
  torn_clothes: "🧥",
  tears: "😢",
  gold_tooth: "🦷",
  scar: "⚔️",
  zombie_eyes: "🧟",
  revenge_aura: "🔥",
  royal_cloak: "🔱",
  ghost_form: "👻",
  skull_ring: "💀",
};

export const TRAIT_DEFINITIONS: Record<TraitId, TraitDefinition> = {
  crown: {
    id: "crown",
    label: "Crown",
    description: "Earned from 3 consecutive wins",
    asset_path: "traits/crown.png",
    category: "head",
  },
  gold_chain: {
    id: "gold_chain",
    label: "Gold Chain",
    description: "Symbol of stacked wins",
    asset_path: "traits/gold_chain.png",
    category: "accessory",
  },
  bandage: {
    id: "bandage",
    label: "Bandage",
    description: "First major loss survived",
    asset_path: "traits/bandage.png",
    category: "head",
  },
  torn_clothes: {
    id: "torn_clothes",
    label: "Torn Clothes",
    description: "Multiple losses taken",
    asset_path: "traits/torn_clothes.png",
    category: "body",
  },
  tears: {
    id: "tears",
    label: "Tears",
    description: "Currently in despair",
    asset_path: "traits/tears.png",
    category: "eyes",
  },
  gold_tooth: {
    id: "gold_tooth",
    label: "Gold Tooth",
    description: "Moderate prestige achieved",
    asset_path: "traits/gold_tooth.png",
    category: "accessory",
  },
  scar: {
    id: "scar",
    label: "Battle Scar",
    description: "Deep losses that left marks",
    asset_path: "traits/scar.png",
    category: "body",
  },
  zombie_eyes: {
    id: "zombie_eyes",
    label: "Zombie Eyes",
    description: "Heavy rug exposure",
    asset_path: "traits/zombie_eyes.png",
    category: "eyes",
  },
  revenge_aura: {
    id: "revenge_aura",
    label: "Revenge Aura",
    description: "Recovered from major loss",
    asset_path: "traits/revenge_aura.png",
    category: "aura",
  },
  royal_cloak: {
    id: "royal_cloak",
    label: "Royal Cloak",
    description: "High sustained prestige",
    asset_path: "traits/royal_cloak.png",
    category: "body",
  },
  ghost_form: {
    id: "ghost_form",
    label: "Ghost Form",
    description: "Too many rugs — partially ethereal",
    asset_path: "traits/ghost_form.png",
    category: "aura",
  },
  skull_ring: {
    id: "skull_ring",
    label: "Skull Ring",
    description: "Survived 5+ consecutive losses",
    asset_path: "traits/skull_ring.png",
    category: "accessory",
  },
};
