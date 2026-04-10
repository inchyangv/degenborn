/**
 * Mutation processor — bridges state machine transitions to diary entries.
 *
 * Converts a StateTransition into a MutationEvent (diary entry).
 * Raw conversation is NEVER stored — only structured state changes.
 */

import type { StateTransition, MutationEvent } from "@degenborn/shared";
import { randomUUID } from "crypto";
import { addMutationEntry } from "./diary-store";
import { generateTransitionCaption } from "./state-machine";
import { generateNarrative } from "./narrative";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";

/**
 * Process a state transition into a diary entry and persist it.
 * The resulting MutationEvent contains:
 * - reason: human-readable cause
 * - trait_delta: which traits were added/removed
 * - state_before / state_after: full state snapshots
 * - generated_caption: short meme-tone caption
 */
export async function processTransition(
  transition: StateTransition,
): Promise<MutationEvent> {
  const { event, state_before, state_after, traits_added, traits_removed } = transition;

  // Generate deterministic caption (no LLM needed for diary entries)
  const caption = generateTransitionCaption(transition);

  const entry: MutationEvent = {
    id: randomUUID(),
    wallet_address: event.wallet_address,
    reason: formatReason(event.type),
    trait_delta: {
      added: traits_added,
      removed: traits_removed,
    },
    state_before,
    state_after,
    generated_caption: caption,
    timestamp: event.timestamp,
  };

  addMutationEntry(event.wallet_address, entry);
  return entry;
}

function formatReason(eventType: string): string {
  const reasons: Record<string, string> = {
    win_streak_3: "3-win streak",
    big_loss: "Big loss taken",
    loss_recovery: "Recovery after loss",
    rug_exposure: "Rug event",
    sustained_profit: "Sustained profit",
    mega_win: "Mega win",
    long_hold: "Long hold",
    multi_rug: "Multiple rugs",
    comeback: "Comeback",
  };
  return reasons[eventType] ?? eventType;
}
