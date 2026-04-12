import type { CharacterState } from "@degenborn/shared";

export const MILESTONE_NAMES: Record<number, string> = {
  0: "First Crowned Win",
  1: "Rug Survivor",
  2: "Seven-Day Resurrection",
  3: "Chaos Ascension",
  4: "Diamond Hands",
  5: "Ghost Awakening",
};

/** Derive eligible milestones from CharacterState */
export function getEligibleMilestones(state: CharacterState): number[] {
  const eligible: number[] = [];
  if (state.crown_count >= 1) eligible.push(0);              // FIRST_CROWNED_WIN
  if (state.scar_count >= 3) eligible.push(1);               // RUG_SURVIVOR
  if (state.survival_streak >= 1) eligible.push(2);          // SEVEN_DAY_RESURRECTION
  if (state.corruption >= 80) eligible.push(3);              // CHAOS_ASCENSION
  if (state.prestige >= 50) eligible.push(4);                // DIAMOND_HANDS
  if (state.mood === "ghost" || state.survival_streak >= 2) eligible.push(5); // GHOST_AWAKENING
  return eligible;
}
