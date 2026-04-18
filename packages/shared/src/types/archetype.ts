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
    tagline: "ngmi energy. all-in anyway.",
    description:
      "Apes in before the chart loads, exits before the rug. High aggression, max chaos — fumbled the bag and immediately rebought.",
    tone_seed: "frenetic, impulsive, darkly funny, degen slang",
  },
  ice_whale: {
    id: "ice_whale",
    name: "Ice Whale",
    tagline: "I hold while you panic-sell.",
    description:
      "Conviction so deep it's cold. Held through 3 rugs, 2 bear markets, and your exit liq. Still green. Cope.",
    tone_seed: "stoic, commanding, glacial, unbothered",
  },
  rug_necromancer: {
    id: "rug_necromancer",
    name: "Rug Necromancer",
    tagline: "still here. somehow.",
    description:
      "Your portfolio died. You didn't. Every jeet that sold the bottom funded your next entry. Chaos + survival = this creature.",
    tone_seed: "undead, darkly triumphant, battle-scarred, savage",
  },
  diamond_cultist: {
    id: "diamond_cultist",
    name: "Diamond Cultist",
    tagline: "it'll come back. it always comes back.",
    description:
      "High conviction, catastrophic luck, stubbornly alive. The bag is heavy. The belief is heavier. ngmi or wagmi — no in between.",
    tone_seed: "obsessive, reverent, quietly suffering, cope arc",
  },
  sniper_jester: {
    id: "sniper_jester",
    name: "Sniper Jester",
    tagline: "in, out, +400%. cope.",
    description:
      "Fast entries, faster exits, somehow still profitable. Apes in, exit liq's the top, never holds a bag. You hate this wallet.",
    tone_seed: "cocky, fast-talking, irreverent, effortlessly based",
  },
  ghost_bagholder: {
    id: "ghost_bagholder",
    name: "Ghost Bagholder",
    tagline: "the bag got heavy. i got lighter.",
    description:
      "Convinced, chaotic, and utterly cooked. The devs left. The TG is dead. The bag is at -94%. Still here. Still a jeet in denial.",
    tone_seed: "haunted, resigned, quietly delusional, ngmi confirmed",
  },
};

/** Single source of truth for archetype UI colors */
export const ARCHETYPE_COLORS: Record<ArchetypeId, string> = {
  mad_gambler: "#ff3d3d",
  ice_whale: "#00d4ff",
  rug_necromancer: "#9945ff",
  diamond_cultist: "#88ccff",
  sniper_jester: "#ffd700",
  ghost_bagholder: "#aaaaaa",
};
