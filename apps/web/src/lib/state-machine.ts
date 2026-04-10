import type {
  CharacterState,
  StateEvent,
  StateEventType,
  StateTransition,
  TraitId,
  ArchetypeId,
  Mood,
} from "@degenborn/shared";
import { TRAIT_DEFINITIONS } from "@degenborn/shared";

/** Compute which traits should be active given the current state */
export function computeActiveTraits(state: CharacterState): TraitId[] {
  const traits: TraitId[] = [];

  if (state.crown_count >= 1) traits.push("crown");
  if (state.crown_count >= 3) traits.push("gold_chain");
  if (state.scar_count >= 1) traits.push("bandage");
  if (state.scar_count >= 2) traits.push("torn_clothes");
  if (state.scar_count >= 3) traits.push("scar");
  if (state.mood === "despair") traits.push("tears");
  if (state.prestige >= 30) traits.push("gold_tooth");
  if (state.corruption >= 50) traits.push("zombie_eyes");
  if (state.mood === "revenge") traits.push("revenge_aura");
  if (state.prestige >= 70) traits.push("royal_cloak");
  if (state.mood === "ghost") traits.push("ghost_form");
  if (state.survival_streak >= 5) traits.push("skull_ring");

  return traits;
}

/** Create an initial character state for a wallet */
export function createInitialState(
  wallet_address: string,
  archetype: ArchetypeId,
): CharacterState {
  const state: CharacterState = {
    wallet_address,
    archetype,
    level: 1,
    mood: "neutral",
    corruption: 0,
    prestige: 0,
    scar_count: 0,
    crown_count: 0,
    survival_streak: 0,
    active_traits: [],
    updated_at: Math.floor(Date.now() / 1000),
  };
  state.active_traits = computeActiveTraits(state);
  return state;
}

/**
 * Apply a state event to a character, returning a full transition record.
 * This is deterministic — same event on same state → same result.
 */
export function applyStateEvent(
  state: CharacterState,
  event: StateEvent,
): StateTransition {
  const before = deepClone(state);
  const next = deepClone(state);

  switch (event.type as StateEventType) {
    case "win_streak_3":
      next.crown_count += 1;
      next.mood = "euphoria";
      next.prestige = Math.min(100, next.prestige + 10);
      break;

    case "big_loss":
      next.scar_count += 1;
      next.mood = "despair";
      next.prestige = Math.max(0, next.prestige - 5);
      break;

    case "loss_recovery":
      next.survival_streak += 1;
      next.mood = "revenge";
      next.prestige = Math.min(100, next.prestige + 5);
      break;

    case "rug_exposure":
      next.corruption = Math.min(100, next.corruption + 20);
      next.scar_count += 1;
      if (next.corruption >= 60) {
        next.mood = "ghost";
      } else {
        next.mood = "despair";
      }
      break;

    case "sustained_profit":
      next.prestige = Math.min(100, next.prestige + 15);
      if (next.mood !== "euphoria") next.mood = "greed";
      break;

    case "mega_win":
      next.prestige = Math.min(100, next.prestige + 20);
      next.crown_count += 1;
      next.mood = "euphoria";
      break;

    case "long_hold":
      next.prestige = Math.min(100, next.prestige + 8);
      break;

    case "multi_rug":
      next.corruption = Math.min(100, next.corruption + 30);
      next.mood = "ghost";
      break;

    case "comeback":
      next.survival_streak += 1;
      next.mood = "revenge";
      next.corruption = Math.max(0, next.corruption - 10);
      break;
  }

  // Level up when prestige or survival milestone reached
  const expectedLevel = 1 + Math.floor(next.prestige / 20) + Math.floor(next.survival_streak / 3);
  next.level = Math.min(10, Math.max(1, expectedLevel));
  next.updated_at = event.timestamp;

  // Recompute active traits
  const newTraits = computeActiveTraits(next);
  const addedTraits = newTraits.filter((t) => !before.active_traits.includes(t));
  const removedTraits = before.active_traits.filter((t) => !newTraits.includes(t));
  next.active_traits = newTraits;

  return {
    event,
    state_before: before,
    state_after: next,
    traits_added: addedTraits,
    traits_removed: removedTraits,
  };
}

/** Generate a short diary caption for a state transition */
export function generateTransitionCaption(transition: StateTransition): string {
  const { event, traits_added } = transition;
  const { state_after } = transition;

  const captions: Record<StateEventType, string> = {
    win_streak_3: `Three in a row. Crown ${state_after.crown_count}. The market bows.`,
    big_loss: `Down ${Math.abs(0)} USD. Scar ${state_after.scar_count} added. Still breathing.`,
    loss_recovery: `Came back from the edge. Survival streak: ${state_after.survival_streak}.`,
    rug_exposure: `Rugged. Corruption now ${state_after.corruption}. The eyes never lie.`,
    sustained_profit: `Prestige ${state_after.prestige}. The throne is getting closer.`,
    mega_win: `That trade. The chart still doesn't believe it.`,
    long_hold: `${Math.floor(0 / 86400)} days held. Conviction is a lifestyle.`,
    multi_rug: `Three rugs. One ghost. Corruption ${state_after.corruption}.`,
    comeback: `Wrote them off. Wrote you off. Survival ${state_after.survival_streak}.`,
  };

  let caption = captions[event.type as StateEventType] ?? `State changed: ${event.type}`;

  if (traits_added.length > 0) {
    const labels = traits_added
      .map((t) => TRAIT_DEFINITIONS[t]?.label ?? t)
      .join(", ");
    caption += ` [${labels} unlocked]`;
  }

  return caption;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
