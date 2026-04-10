/**
 * Unibase Memory Integration (P1)
 *
 * Stores mutation diary summaries and milestone history to Unibase's
 * decentralized memory layer.
 *
 * Design constraints:
 *  - Stores ONLY: mutation summaries, milestone records (no raw conversation)
 *  - Off switch: UNIBASE_ENABLED=false (service continues without it)
 *  - Retry: 2 attempts with 1s delay, then give up silently
 *  - Timeout: 5s per request
 *
 * Fields stored per mutation:
 *  - wallet_address (hashed for privacy)
 *  - archetype
 *  - reason (event label)
 *  - traits_added
 *  - mood_after
 *  - timestamp
 *
 * Fields explicitly NOT stored:
 *  - raw conversation text
 *  - transaction hashes
 *  - full state JSON (only summary fields)
 */

import type { MutationEvent, CharacterState } from "@degenborn/shared";
import { createHash } from "crypto";

interface UnibaseMutationRecord {
  wallet_hash: string;       // keccak of wallet address (not raw address)
  archetype: string;
  reason: string;
  traits_added: string[];
  mood_after: string;
  level_after: number;
  timestamp: number;
  record_type: "mutation";
}

interface UnibасeMilestoneRecord {
  wallet_hash: string;
  archetype: string;
  milestone: string;
  trigger: string;
  timestamp: number;
  record_type: "milestone";
}

type UnibаseRecord = UnibaseMutationRecord | UnibасeMilestoneRecord;

const UNIBASE_ENABLED = process.env.UNIBASE_ENABLED === "true";
const UNIBASE_API_KEY = process.env.UNIBASE_API_KEY ?? "";
const UNIBASE_ENDPOINT = "https://api.unibase.io/v1/memory"; // placeholder URL

/**
 * Write a mutation summary to Unibase memory.
 * Returns silently on any failure — core flow is never blocked.
 */
export async function writeMutationToMemory(
  mutation: MutationEvent,
  state: CharacterState,
): Promise<boolean> {
  if (!UNIBASE_ENABLED || !UNIBASE_API_KEY) return false;

  const record: UnibaseMutationRecord = {
    wallet_hash: hashWallet(mutation.wallet_address),
    archetype: state.archetype,
    reason: mutation.reason,
    traits_added: mutation.trait_delta.added,
    mood_after: state.mood,
    level_after: state.level,
    timestamp: mutation.timestamp,
    record_type: "mutation",
  };

  return writeWithRetry(record);
}

/**
 * Write a milestone record (major evolution, relic earned) to Unibase.
 */
export async function writeMilestoneToMemory(
  walletAddress: string,
  archetype: string,
  milestone: string,
  trigger: string,
  timestamp: number,
): Promise<boolean> {
  if (!UNIBASE_ENABLED || !UNIBASE_API_KEY) return false;

  const record: UnibасeMilestoneRecord = {
    wallet_hash: hashWallet(walletAddress),
    archetype,
    milestone,
    trigger,
    timestamp,
    record_type: "milestone",
  };

  return writeWithRetry(record);
}

async function writeWithRetry(record: UnibаseRecord, maxAttempts = 2): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const success = await writeToUnibase(record);
      if (success) return true;
    } catch (err) {
      console.warn(`[unibase] Attempt ${attempt} failed:`, err);
    }

    if (attempt < maxAttempts) {
      await sleep(1000);
    }
  }

  console.warn("[unibase] All attempts failed — continuing without memory write");
  return false;
}

async function writeToUnibase(record: UnibаseRecord): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(UNIBASE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": UNIBASE_API_KEY,
      },
      body: JSON.stringify(record),
      signal: controller.signal,
    });

    return resp.ok;
  } finally {
    clearTimeout(timer);
  }
}

/** Hash wallet address — stored wallet_hash, not raw address */
function hashWallet(address: string): string {
  return createHash("sha256").update(address.toLowerCase()).digest("hex").slice(0, 16);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Health check — can the Unibase integration reach the service? */
export async function checkUnibаseHealth(): Promise<{ enabled: boolean; reachable: boolean }> {
  if (!UNIBASE_ENABLED) return { enabled: false, reachable: false };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${UNIBASE_ENDPOINT}/health`, {
      headers: { "X-API-Key": UNIBASE_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { enabled: true, reachable: resp.ok };
  } catch {
    return { enabled: true, reachable: false };
  }
}
