/**
 * In-memory mutation diary store.
 * In production this would be backed by Postgres (mutation_event table).
 * Raw conversation is NEVER stored — only character change records.
 */

import type { MutationEvent, DiaryPage } from "@degenborn/shared";
import { randomUUID } from "crypto";

// Server-side in-memory store (lost on restart — use DB in production)
const store = new Map<string, MutationEvent[]>();

export function addMutationEntry(wallet: string, entry: Partial<MutationEvent>): MutationEvent {
  const events = store.get(wallet) ?? [];
  const mutation: MutationEvent = {
    id: entry.id ?? randomUUID(),
    wallet_address: wallet,
    reason: entry.reason ?? "unknown",
    trait_delta: entry.trait_delta ?? { added: [], removed: [] },
    state_before: entry.state_before!,
    state_after: entry.state_after!,
    generated_caption: entry.generated_caption ?? "",
    asset_url: entry.asset_url,
    timestamp: entry.timestamp ?? Math.floor(Date.now() / 1000),
  };
  events.unshift(mutation); // newest first
  store.set(wallet, events.slice(0, 100)); // keep last 100
  return mutation;
}

export function getMutationDiary(wallet: string, limit = 10): DiaryPage {
  const events = store.get(wallet) ?? [];
  return {
    wallet_address: wallet,
    entries: events.slice(0, limit),
    total: events.length,
    has_more: events.length > limit,
  };
}

export function seedDiaryFromReplay(wallet: string, entries: MutationEvent[]): void {
  store.set(wallet, entries);
}
