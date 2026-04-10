import type { CharacterState } from "../types/state";

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

/**
 * Pick a caption deterministically based on archetype + state.
 * Same state = same caption across renders.
 */
export function pickCaption(archetype: string, state: CharacterState): string {
  const bank = CAPTION_BANK[archetype] ?? [`I am the ${archetype.replace(/_/g, " ")}.`];
  const idx = ((state.crown_count ?? 0) + (state.scar_count ?? 0)) % bank.length;
  return bank[idx]!;
}
