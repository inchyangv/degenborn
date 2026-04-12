/**
 * T-RET-01 — Visit snapshot store.
 *
 * Stores a lightweight snapshot of CharacterState in localStorage so we can
 * detect what changed since the user's last visit.
 * Raw conversation is never stored — only character state fields.
 */
import type { CharacterState } from "@degenborn/shared";

export interface VisitSnapshot {
  level: number;
  scar_count: number;
  crown_count: number;
  survival_streak: number;
  corruption: number;
  prestige: number;
  mood: string;
  archetype: string;
  active_traits_count: number;
  visited_at: number; // unix ms
}

export interface StateDelta {
  levelChanged: boolean;
  levelBefore: number;
  levelAfter: number;
  newScars: number;
  newCrowns: number;
  moodChanged: boolean;
  moodBefore: string;
  moodAfter: string;
  traitsDelta: number;
  hasAnyChange: boolean;
}

function storageKey(wallet: string): string {
  return `degenborn_snapshot_${wallet.toLowerCase()}`;
}

export function loadSnapshot(wallet: string): VisitSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(wallet));
    if (!raw) return null;
    return JSON.parse(raw) as VisitSnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(wallet: string, state: CharacterState): void {
  if (typeof window === "undefined") return;
  const snap: VisitSnapshot = {
    level: state.level,
    scar_count: state.scar_count,
    crown_count: state.crown_count,
    survival_streak: state.survival_streak,
    corruption: state.corruption,
    prestige: state.prestige,
    mood: state.mood,
    archetype: state.archetype,
    active_traits_count: state.active_traits.length,
    visited_at: Date.now(),
  };
  try {
    localStorage.setItem(storageKey(wallet), JSON.stringify(snap));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function computeDelta(prev: VisitSnapshot, curr: CharacterState): StateDelta {
  const levelChanged = curr.level !== prev.level;
  const newScars = Math.max(0, curr.scar_count - prev.scar_count);
  const newCrowns = Math.max(0, curr.crown_count - prev.crown_count);
  const moodChanged = curr.mood !== prev.mood;
  const traitsDelta = curr.active_traits.length - prev.active_traits_count;

  const hasAnyChange = levelChanged || newScars > 0 || newCrowns > 0 || moodChanged || traitsDelta !== 0;

  return {
    levelChanged,
    levelBefore: prev.level,
    levelAfter: curr.level,
    newScars,
    newCrowns,
    moodChanged,
    moodBefore: prev.mood,
    moodAfter: curr.mood,
    traitsDelta,
    hasAnyChange,
  };
}
