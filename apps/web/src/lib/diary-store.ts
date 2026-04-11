/**
 * Mutation diary store.
 *
 * Storage strategy (two-tier):
 *  1. In-memory Map (fast, always available)
 *  2. JSON file at DIARY_PERSIST_PATH (optional, survives process restart on single-instance servers)
 *
 * On serverless/Vercel each request may land on a separate Lambda, so the in-memory tier
 * alone cannot guarantee persistence. Set DIARY_PERSIST_PATH to a /tmp path for local demo,
 * or use a real DB (Postgres/Redis) for production.
 *
 * For the hackathon demo the Replay Mode fixture path works around this limitation —
 * it seeds the diary from a deterministic fixture file on every page load.
 *
 * Raw conversation is NEVER stored — only character change records.
 */

import type { MutationEvent, DiaryPage } from "@degenborn/shared";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// ── In-memory tier ────────────────────────────────────────────────────────────
const store = new Map<string, MutationEvent[]>();

// ── File-based persistence tier ───────────────────────────────────────────────
const PERSIST_PATH = process.env.DIARY_PERSIST_PATH
  ? path.resolve(process.env.DIARY_PERSIST_PATH)
  : null;

/** Load persisted diary from disk into memory (called once at module init). */
function loadFromDisk(): void {
  if (!PERSIST_PATH) return;
  try {
    if (!fs.existsSync(PERSIST_PATH)) return;
    const raw = fs.readFileSync(PERSIST_PATH, "utf-8");
    const data = JSON.parse(raw) as Record<string, MutationEvent[]>;
    for (const [wallet, events] of Object.entries(data)) {
      store.set(wallet, events);
    }
  } catch {
    // Non-fatal — start with empty store
    console.warn("[diary-store] Failed to load persisted diary:", PERSIST_PATH);
  }
}

/** Flush in-memory diary to disk. */
function flushToDisk(): void {
  if (!PERSIST_PATH) return;
  try {
    const data: Record<string, MutationEvent[]> = {};
    store.forEach((events, wallet) => { data[wallet] = events; });
    const dir = path.dirname(PERSIST_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PERSIST_PATH, JSON.stringify(data), "utf-8");
  } catch {
    console.warn("[diary-store] Failed to persist diary to disk:", PERSIST_PATH);
  }
}

// Load from disk on startup (best-effort)
loadFromDisk();

// ── Public API ────────────────────────────────────────────────────────────────

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
  flushToDisk();
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
  flushToDisk();
}

/** True when persistence is backed by disk (not just memory). */
export const isPersisted = PERSIST_PATH !== null;
