/** Six archetype IDs */
export type ArchetypeId =
  | "mad_gambler"
  | "ice_whale"
  | "rug_necromancer"
  | "diamond_cultist"
  | "sniper_jester"
  | "ghost_bagholder";

export interface ArchetypeProfile {
  id: ArchetypeId;
  name: string;
  tagline: string;        // ~20 chars, shown in large text
  description: string;   // 1–2 sentences for the UI
  tone_seed: string;     // hint for narrative LLM tone
}

export interface ArchetypeResult {
  wallet_address: string;
  archetype: ArchetypeId;
  profile: ArchetypeProfile;
  confidence: number;    // 0–1, how clearly rules matched
  runner_up?: ArchetypeId;
}

export const ARCHETYPE_PROFILES: Record<ArchetypeId, ArchetypeProfile> = {
  mad_gambler: {
    id: "mad_gambler",
    name: "Mad Gambler",
    tagline: "All-in, always.",
    description:
      "Fires first, asks questions never. High aggression, high chaos — luck is irrelevant when you're already going again.",
    tone_seed: "frenetic, impulsive, darkly funny",
  },
  ice_whale: {
    id: "ice_whale",
    name: "Ice Whale",
    tagline: "Patience is the trade.",
    description:
      "Conviction so deep it's cold. Holds through storms, exits at peaks. Luck doesn't hurt, but it isn't needed.",
    tone_seed: "stoic, commanding, glacial",
  },
  rug_necromancer: {
    id: "rug_necromancer",
    name: "Rug Necromancer",
    tagline: "Death is just a dip.",
    description:
      "Walked into rugs that would kill lesser degens — and came back. Chaos and survival in equal measure.",
    tone_seed: "undead, darkly triumphant, battle-scarred",
  },
  diamond_cultist: {
    id: "diamond_cultist",
    name: "Diamond Cultist",
    tagline: "Still holding.",
    description:
      "High conviction, bad luck, stubbornly alive. The bags are heavy but the belief never wavers.",
    tone_seed: "obsessive, reverent, quietly suffering",
  },
  sniper_jester: {
    id: "sniper_jester",
    name: "Sniper Jester",
    tagline: "In and out. Count it.",
    description:
      "Quick entries, quicker exits, somehow profitable. Aggression + luck = a dangerous kind of funny.",
    tone_seed: "cocky, fast-talking, irreverent",
  },
  ghost_bagholder: {
    id: "ghost_bagholder",
    name: "Ghost Bagholder",
    tagline: "Still waiting.",
    description:
      "Convinced, chaotic, and utterly exhausted. The bags haven't moved. Neither has the belief.",
    tone_seed: "haunted, resigned, quietly delusional",
  },
};
