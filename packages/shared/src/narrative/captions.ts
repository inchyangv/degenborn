import type { CharacterState } from "../types/state";

export type ShareCardMode = "flex" | "roast";

/**
 * Caption bank: archetype × mood/state combinations.
 * 4+ variants per archetype — picked deterministically from state so same state = same caption.
 */
export const CAPTION_BANK: Record<string, string[]> = {
  mad_gambler: [
    "Ape in. Rug. Ape in again. The cycle is eternal.",
    "No plan. No chart. Just aggression and vibes.",
    "100x or the morgue. Fumbled the bag. Going again.",
    "Jeet speed. No exit liq. Just chaos.",
    "Clicked buy before the price loaded. This is fine.",
  ],
  ice_whale: [
    "I don't trade. I wait. Then I take your exit liq.",
    "The market jeeted. I didn't. That's the whole trade.",
    "Patience is the most violent thing in degen land.",
    "You panic-sold the bottom. I bought. Cope.",
    "Six months in the position. You were ngmi from the start.",
  ],
  rug_necromancer: [
    "Rugged three times this week. Still here. Still cursed.",
    "Died. Came back. Jeeted the jeets. Necromancer hours.",
    "Down bad. Back worse. The rug just made me stronger.",
    "Every rug is a scar I wear like a crown. ngmi? I already did.",
    "Death is just a dip when you've survived this many rugs.",
  ],
  diamond_cultist: [
    "The bags don't move. Neither do I. This is the way.",
    "Red candles are character development. Still holding.",
    "Averaging down since the last bull. This is fine.",
    "Price means nothing. Conviction means everything. ngmi anyway.",
    "Still holding. Still believing. Still broke. Still here.",
  ],
  sniper_jester: [
    "In. Out. +400%. In again. Out again. Never ngmi.",
    "I don't time the market. I am the exit liq.",
    "Fast hands. No bag. You hate to see it.",
    "They called it luck. I call it knowing when to jeet.",
    "Never held a bag longer than it took to 3x.",
  ],
  ghost_bagholder: [
    "I don't check the price. The price is bad. Always.",
    "The bag got heavier. I got lighter. ngmi arc complete.",
    "I remember the floor price. I ape'd in at the top.",
    "Somewhere between bagholding and enlightenment. Closer to the bag.",
    "The devs left. The TG is dead. I'm still here. Cope.",
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
    "All-in and won. Again. They said I was ngmi. They were wrong.",
    "Chaos theory: ape fast enough and luck appears. Proven.",
    "Three wins in a row. No chart. Pure aggression. Based.",
    "Fumbled every bag on the way up. Still ended green. Jester behavior.",
    "The market is my casino. I am the house. ngmi to the jeets.",
  ],
  ice_whale: [
    "The position held. The jeets sold. I waited. I won.",
    "Patience was the trade. Every single time. Exit liq'd the top.",
    "They called it luck. I call it six months of not being a jeet.",
    "I set the floor. The floor held. You panic-sold into my bid.",
    "Didn't beat the market. Outlasted every paper hand in it.",
  ],
  rug_necromancer: [
    "Rugged three times. Still here. Jeets couldn't kill me.",
    "They wrote the obituary. I came back and ape'd the recovery.",
    "Scars are the proof. Survived every rug. ngmi was never me.",
    "Death was just a level. Leveled up. The necromancer returns.",
    "More corruption, more survival. The rug made me stronger.",
  ],
  diamond_cultist: [
    "The bags didn't move. The conviction never broke. Red → green.",
    "Red became green. As the prophecy foretold. The cult was right.",
    "Diamond hands don't talk. They hold through the jeet panic and win.",
    "Averaged down 12 times. All 12 paid off. Cope harder, anon.",
    "The cult was right. It's always the cult. Stay poor, paper hands.",
  ],
  sniper_jester: [
    "In and out before you even read the chart. +400%. Cope.",
    "Zero patience trades. 100% green rate. You hate to see it.",
    "They FOMO'd in. I was already exit liq-ing their bags.",
    "Fast hands. No remorse. Full green. ngmi if you're still bagholding.",
    "Called it, timed it, jeeted the top. Bow down, anon.",
  ],
  ghost_bagholder: [
    "The bag mooned. I was too haunted to jeet. Somehow still won.",
    "Held long enough to win. That's the whole strategy. Ghost W.",
    "They said ghost bags don't pump. Mine pumped. Cope.",
    "Patience of the damned. Profits of the blessed. Still cursed.",
    "Forgot the price. The price remembered me. Accidental alpha.",
  ],
};

// ---------------------------------------------------------------------------
// Roast captions — self-deprecating, scar/corruption forward, red frame energy
// ---------------------------------------------------------------------------
export const CAPTION_ROAST_BANK: Record<string, string[]> = {
  mad_gambler: [
    "Rugged twice today. It's 9am. Ape'd in again. ngmi confirmed.",
    "Portfolio is a speedrun of fumbling the bag. Personal best: 4 mins.",
    "Risk/reward ratio: infinite risk, -100% reward. Every time.",
    "Ape in, rug, ape into another rug. The jeet cycle is unbroken.",
    "I have a system. It's called aggression. It doesn't work. Still using it.",
  ],
  ice_whale: [
    "Patient for 300 days. Still red. Exit liq'd by the market. ngmi.",
    "The conviction didn't pay. The jeets won. I'm still here though.",
    "Floor price: I am the floor. I am stuck. The bag weighs a ton.",
    "Patience is a virtue. Being down 80% is a reality. Cope.",
    "Slow and steady loses the race. The jeets are all green. I am not.",
  ],
  rug_necromancer: [
    "Six rugs this month. Fumbled the bag on each. I'm not okay.",
    "The necromancer keeps dying on purpose at this point. Skill issue.",
    "Corruption 90. Jeet exposure: maximum. Survival streak: somehow still here.",
    "Can't be rugged again. Already rugged. This is fine. ngmi arc.",
    "Death is my home now. I've decorated it. The rug is the welcome mat.",
  ],
  diamond_cultist: [
    "Still holding from 2022. -94%. This is not a cope. This is grief.",
    "Averaged down so much I own the whole project. It's still going down.",
    "Diamond hands. Empty wallet. Full delusion. ngmi. I know.",
    "The dip I ape'd is now 90% down. Averaging down again. Jeet behavior.",
    "Not selling. Ever. (please someone exit liq this bag from my hands.)",
  ],
  sniper_jester: [
    "Missed the entry. Caught the rug. Fumbled the bag. Classic jeet.",
    "Fast in, faster rekt. The sniper shot himself. ngmi.",
    "Sniper accuracy: 0%. Jeet energy: 100%. Bag count: infinite.",
    "Bought every top. Sold every bottom. I am the exit liq.",
    "The jester is the joke today. The bag is the punchline.",
  ],
  ghost_bagholder: [
    "Don't check the price. The price is bad. The jeets already left.",
    "Bagheld so long I became the bag. ngmi is too optimistic.",
    "Haunted by my own portfolio. The ghost can't exit liq.",
    "Still here. That's literally all I have. The devs left. I stayed.",
    "Scar count: uncountable. Hope: somehow still 1. Cope harder, anon.",
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
