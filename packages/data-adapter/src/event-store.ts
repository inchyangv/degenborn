/**
 * Normalized event store — in-memory with idempotent upsert.
 *
 * In production: backed by Postgres (activity_event table).
 * For hackathon: in-memory Map, keyed by deterministic event.id.
 *
 * Raw payload is always preserved alongside the normalized event.
 * Raw conversation is NEVER stored — only trading events.
 */

import type { ActivityEvent } from "@degenborn/shared";

const store = new Map<string, ActivityEvent>();

/**
 * Upsert a single event by id.
 * Idempotent: re-ingesting the same raw tx does not create duplicates.
 * @returns true if inserted, false if already existed
 */
export function upsertEvent(event: ActivityEvent): boolean {
  if (store.has(event.id)) return false;
  store.set(event.id, event);
  return true;
}

/**
 * Bulk upsert a batch of events.
 * @returns number of newly inserted events (duplicates skipped)
 */
export function upsertEvents(events: ActivityEvent[]): number {
  let inserted = 0;
  for (const event of events) {
    if (upsertEvent(event)) inserted++;
  }
  return inserted;
}

/**
 * Get all events for a wallet, sorted by timestamp ascending.
 */
export function getEventsForWallet(walletAddress: string): ActivityEvent[] {
  const wallet = walletAddress.toLowerCase();
  return Array.from(store.values())
    .filter((e) => e.wallet_address.toLowerCase() === wallet)
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Clear all events for a wallet.
 */
export function clearWallet(walletAddress: string): number {
  const wallet = walletAddress.toLowerCase();
  let removed = 0;
  for (const [id, event] of store) {
    if (event.wallet_address.toLowerCase() === wallet) {
      store.delete(id);
      removed++;
    }
  }
  return removed;
}

export function totalEvents(): number {
  return store.size;
}
