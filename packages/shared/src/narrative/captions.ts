import type { CharacterState } from "../types/state";

export type ShareCardMode = "flex" | "roast";

/**
 * Caption bank: archetype × mood/state combinations.
 * 4+ variants per archetype — picked deterministically from state so same state = same caption.
 */
export const CAPTION_BANK: Record<string, string[]> = {
  mad_gambler: [
    "Ape in. Ape out. Ape in again. The ritual never ends.",
    "I don't have a plan. I have aggression.",
    "100x or the morgue. There is no in between.",
    "Chart? That's my enemy. Vibes? That's my edge.",
    "Clicked buy before the price even loaded. No regrets.",
  ],
  ice_whale: [
    "I don't trade. I wait. Then I destroy.",
    "The market moves around me. I am the floor.",
    "Patience is the most violent thing in crypto.",
    "You sold at the bottom. I bought. That's the whole story.",
    "Three months in the position. Three hours to read the exit.",
  ],
  rug_necromancer: [
    "Rugged three times this week. Still here. Still cursed.",
    "I died. The bag survived. Close enough.",
    "Down 1400. Back 1200. The necromancer returns.",
    "Every rug is just a scar I haven't named yet.",
    "Death is just a dip when you've seen this many charts.",
  ],
  diamond_cultist: [
    "The bags don't move. Neither do I.",
    "Red candles are just character development.",
    "I've been averaging down since 2021. This is fine.",
    "The price means nothing. The conviction means everything.",
    "Still holding. Still believing. Still broke. Still here.",
  ],
  sniper_jester: [
    "In. Out. +400%. In again. Out again. Repeat.",
    "I don't time the market. I am the market.",
    "Fast hands. No heart. Perfect accuracy.",
    "They called it luck. I call it reflexes.",
    "Never held anything longer than it took to triple.",
  ],
  ghost_bagholder: [
    "I don't check the price anymore. It's better this way.",
    "The bag is heavy. The ghost is light.",
    "I remember the floor price. I will always remember.",
    "Somewhere between bagholding and enlightenment.",
    "The devs left. The telegram is empty. I'm still here.",
  ],
};

/** Crown captions — shown when crown_count >= 1 */
export const CAPTION_CROWN: string[] = [
  "The crown stayed on through all of it.",
  "Three in a row. The market owes me nothing.",
  "Won it. Lost it. Won it again. The crown remembers.",
  "They said the streak would break. They were wrong.",
];

/** Scar captions — shown when scar_count >= 1 and no crown */
export const CAPTION_SCAR: string[] = [
  "The rug left a mark. I kept the scar.",
  "Lost it all. Built something with the wreckage.",
  "The scars are the resume now.",
  "Burned twice. Wiser once. Still here.",
];

// ---------------------------------------------------------------------------
// Flex captions — triumphant, crown/prestige forward, gold frame energy
// ---------------------------------------------------------------------------
export const CAPTION_FLEX_BANK: Record<string, string[]> = {
  mad_gambler: [
    "All-in and won. Again. They said I was ngmi.",
    "Chaos theory: if you ape fast enough, luck appears.",
    "Three in a row. I don't even check charts anymore.",
    "Risk is just opportunity wearing a scary mask.",
    "The market is my casino and I am the house.",
  ],
  ice_whale: [
    "The position held. The market blinked first.",
    "Patience was the trade. Every time.",
    "They called it luck. I call it six months of waiting.",
    "The floor I set is the floor that held.",
    "I didn't beat the market. I outlasted it.",
  ],
  rug_necromancer: [
    "Rugged three times and I'm the one still here.",
    "They wrote my obituary. I ignored it.",
    "The scars are the proof. I survived every single one.",
    "Death was just a level. I leveled up.",
    "More corruption, more power. This is fine.",
  ],
  diamond_cultist: [
    "The bags didn't move. The conviction never broke.",
    "Red became green. As the prophecy foretold.",
    "Diamond hands don't talk. They hold and win.",
    "I averaged down 12 times. All 12 paid off.",
    "The cult was right. It's always the cult.",
  ],
  sniper_jester: [
    "In and out before you read the chart.",
    "100% win rate on patience trades. Which is: none.",
    "They FOMO'd in. I was already out.",
    "Fast hands. No remorse. Full green.",
    "Called it, timed it, cashed it. Bow down.",
  ],
  ghost_bagholder: [
    "The bag mooned. I was too haunted to sell.",
    "Long enough to win. That's the whole strategy.",
    "They said ghost bags don't pump. Mine did.",
    "Patience of the damned. Profits of the blessed.",
    "I forget the price. The price remembered me.",
  ],
};

// ---------------------------------------------------------------------------
// Roast captions — self-deprecating, scar/corruption forward, red frame energy
// ---------------------------------------------------------------------------
export const CAPTION_ROAST_BANK: Record<string, string[]> = {
  mad_gambler: [
    "Rugged twice today. It's 9am.",
    "My portfolio is a speedrun of failure. PB: 4 mins.",
    "Risk/reward: ∞ risk, -100% reward.",
    "Ape in, ape out, ape into another rug.",
    "I have a system. It doesn't work. I use it anyway.",
  ],
  ice_whale: [
    "I've been patient for 300 days. Still red.",
    "The conviction didn't pay. I'm still here though.",
    "Floor price: I am the floor. I am stuck.",
    "Patience is a virtue. Losses are a reality.",
    "Slow and steady wins the race. I am in last place.",
  ],
  rug_necromancer: [
    "Six rugs this month. I'm not okay.",
    "The necromancer keeps dying on purpose at this point.",
    "Corruption 90. Survival streak: somehow 4.",
    "I can't be rugged, I'm already rugged.",
    "Death is my home now. I've decorated it.",
  ],
  diamond_cultist: [
    "Still holding from 2022. This is not a joke.",
    "I averaged down so much I own the whole project.",
    "Diamond hands. Empty wallet. Full faith.",
    "The dip I bought is now 90% down. I'm buying more.",
    "Not selling. Ever. (Please someone buy this bag.)",
  ],
  sniper_jester: [
    "Missed the entry. Caught the rug. Classic.",
    "Fast in, faster out, instantly rekt.",
    "Sniper accuracy: 0%. Jester energy: 100%.",
    "I hit every top and bought every bottom wrong.",
    "The jester is the joke today.",
  ],
  ghost_bagholder: [
    "I don't check the price. The price is bad.",
    "Bagheld so long I became the bag.",
    "The ghost is haunted by its own portfolio.",
    "I'm still here. That's literally all I have.",
    "Scar count: too many to count. Hope: still somehow 1.",
  ],
};

/**
 * Pick a Flex mode caption (triumphant tone).
 * Deterministic: same state → same caption.
 */
export function pickFlexCaption(archetype: string, state: CharacterState): string {
  const bank = CAPTION_FLEX_BANK[archetype] ?? CAPTION_BANK[archetype] ?? CAPTION_CROWN;
  const idx = (state.crown_count + state.prestige) % bank.length;
  return bank[idx]!;
}

/**
 * Pick a Roast mode caption (self-deprecating tone).
 * Deterministic: same state → same caption.
 */
export function pickRoastCaption(archetype: string, state: CharacterState): string {
  const bank = CAPTION_ROAST_BANK[archetype] ?? CAPTION_BANK[archetype] ?? CAPTION_SCAR;
  const idx = (state.scar_count + state.corruption) % bank.length;
  return bank[idx]!;
}

/**
 * Pick a caption deterministically based on archetype + state.
 * Priority: crown > scar > archetype defaults.
 * Same state = same caption across renders.
 */
export function pickCaption(archetype: string, state: CharacterState): string {
  const hasCrown = (state.crown_count ?? 0) >= 1;
  const hasScar = (state.scar_count ?? 0) >= 1;

  if (hasCrown && hasScar) {
    // Archetype specific — has both
    const bank = CAPTION_BANK[archetype] ?? CAPTION_CROWN;
    return bank[state.crown_count % bank.length]!;
  }
  if (hasCrown) {
    return CAPTION_CROWN[state.crown_count % CAPTION_CROWN.length]!;
  }
  if (hasScar) {
    return CAPTION_SCAR[state.scar_count % CAPTION_SCAR.length]!;
  }
  const bank = CAPTION_BANK[archetype] ?? [`I am the ${archetype.replace(/_/g, " ")}.`];
  const idx = (state.level ?? 0) % bank.length;
  return bank[idx]!;
}
