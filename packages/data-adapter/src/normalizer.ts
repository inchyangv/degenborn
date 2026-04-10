import type { ActivityEvent, EventType, RawWalletActivity } from "@degenborn/shared";
import { createHash } from "crypto";

/**
 * Normalize raw adapter responses into ActivityEvent[].
 * Each adapter returns different shapes — this file handles the mapping.
 */
export function normalizeEvents(raw: RawWalletActivity): ActivityEvent[] {
  switch (raw.source) {
    case "moralis":
      return normalizeMoralis(raw);
    case "covalent":
      return normalizeCovalent(raw);
    case "fixture":
      // Fixtures already contain normalized ActivityEvent[]
      if (Array.isArray((raw as any).events)) {
        return (raw as any).events as ActivityEvent[];
      }
      return normalizeCovalent(raw); // fallback
    default:
      return [];
  }
}

function normalizeMoralis(raw: RawWalletActivity): ActivityEvent[] {
  const txs = raw.transactions as any[];
  const events: ActivityEvent[] = [];

  for (const tx of txs) {
    const eventType = inferEventType(tx);
    if (!eventType) continue;

    const id = deterministicId(raw.wallet_address, tx.hash ?? tx.transaction_hash ?? String(tx.block_number));
    events.push({
      id,
      wallet_address: raw.wallet_address,
      event_type: eventType,
      token_address: tx.token_address ?? tx.address ?? "0x",
      token_symbol: tx.token_symbol ?? undefined,
      value_usd: parseFloat(tx.usd_value ?? tx.value_usd ?? "0") || 0,
      pnl_delta: parseFloat(tx.realized_profit_usd ?? "0") || 0,
      hold_duration_seconds: tx.hold_duration_seconds ?? undefined,
      timestamp: Math.floor(new Date(tx.block_timestamp ?? tx.timestamp ?? 0).getTime() / 1000),
      raw_payload: tx,
      chain_id: 56,
    });
  }

  return deduplicateEvents(events);
}

function normalizeCovalent(raw: RawWalletActivity): ActivityEvent[] {
  const txs = raw.transactions as any[];
  const events: ActivityEvent[] = [];

  for (const tx of txs) {
    const eventType = inferEventTypeCovalent(tx);
    if (!eventType) continue;

    const id = deterministicId(raw.wallet_address, tx.tx_hash ?? tx.transaction_hash ?? "");
    const timestamp = Math.floor(new Date(tx.block_signed_at ?? 0).getTime() / 1000);

    events.push({
      id,
      wallet_address: raw.wallet_address,
      event_type: eventType,
      token_address: extractTokenAddressCovalent(tx),
      token_symbol: tx.log_events?.[0]?.decoded?.params?.find((p: any) => p.name === "symbol")?.value,
      value_usd: tx.value_quote ?? 0,
      pnl_delta: 0, // Covalent doesn't provide PnL directly
      timestamp,
      raw_payload: tx,
      chain_id: 56,
    });
  }

  return deduplicateEvents(events);
}

function inferEventType(tx: any): EventType | null {
  const method = (tx.method_label ?? tx.decoded_call?.name ?? "").toLowerCase();
  if (method.includes("buy") || method.includes("exacteth") || method.includes("input")) return "buy";
  if (method.includes("sell") || method.includes("exacttoken") || method.includes("output")) return "sell";
  if (tx.realized_profit_usd && parseFloat(tx.realized_profit_usd) < -500) return "rug";
  if (tx.type === "receive" || method.includes("transfer")) return "transfer_in";
  return null;
}

function inferEventTypeCovalent(tx: any): EventType | null {
  const gasPrice = tx.gas_price;
  const success = tx.successful;
  if (!success) return null;

  const logs = tx.log_events ?? [];
  for (const log of logs) {
    const name = log.decoded?.name?.toLowerCase() ?? "";
    if (name === "swap") {
      // Heuristic: if wallet address is token0/token1 recipient
      return "buy"; // simplified
    }
    if (name === "transfer") return "transfer_in";
  }

  return null;
}

function extractTokenAddressCovalent(tx: any): string {
  const logs = tx.log_events ?? [];
  for (const log of logs) {
    if (log.sender_address) return log.sender_address;
  }
  return "0x";
}

/**
 * Deterministic ID — same tx from same wallet = same ID.
 * Prevents duplicate inserts (idempotent upsert).
 */
function deterministicId(wallet: string, txHash: string): string {
  return createHash("sha256")
    .update(`${wallet.toLowerCase()}:${txHash.toLowerCase()}`)
    .digest("hex")
    .slice(0, 16);
}

function deduplicateEvents(events: ActivityEvent[]): ActivityEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}
