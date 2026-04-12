import type { ActivityEvent, EventType, RawWalletActivity } from "@degenborn/shared";
import { createHash } from "crypto";
import { FOUR_MEME_ROUTER } from "./adapter";

/**
 * Normalize raw adapter responses into ActivityEvent[].
 * Each adapter returns different shapes — this file handles the mapping.
 *
 * P1-03: All normalizers filter for FOUR_MEME_ROUTER interactions.
 *        Transactions not involving the Four.meme router are tagged as
 *        "other BSC" but still included with a lower weighting flag so scoring
 *        can differentiate them (future work). For now, non-Four.meme txs
 *        that are clearly buy/sell are included with `four_meme: false`.
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
    case "rpc" as any:
      return normalizeRpc(raw);
    default:
      return [];
  }
}

function normalizeMoralis(raw: RawWalletActivity): ActivityEvent[] {
  const txs = raw.transactions as any[];
  const events: ActivityEvent[] = [];

  for (const tx of txs) {
    const eventType = inferEventTypeMoralis(tx, raw.wallet_address);
    if (!eventType) continue;

    const isFourMeme = isFourMemeTransaction(tx);
    const id = deterministicId(
      raw.wallet_address,
      tx.hash ?? tx.transaction_hash ?? String(tx.block_number),
    );
    events.push({
      id,
      wallet_address: raw.wallet_address,
      event_type: eventType,
      token_address: tx.token_address ?? tx.address ?? "0x",
      token_symbol: tx.token_symbol ?? undefined,
      value_usd: parseFloat(tx.usd_value ?? tx.value_usd ?? tx.price_usd ?? "0") || 0,
      pnl_delta: parseFloat(tx.realized_profit_usd ?? "0") || 0,
      hold_duration_seconds: tx.hold_duration_seconds ?? undefined,
      timestamp: Math.floor(new Date(tx.block_timestamp ?? tx.timestamp ?? 0).getTime() / 1000),
      raw_payload: { ...tx, four_meme: isFourMeme },
      chain_id: 56,
    });
  }

  return deduplicateEvents(events);
}

function normalizeCovalent(raw: RawWalletActivity): ActivityEvent[] {
  const txs = raw.transactions as any[];
  const events: ActivityEvent[] = [];

  for (const tx of txs) {
    const eventType = inferEventTypeCovalent(tx, raw.wallet_address);
    if (!eventType) continue;

    const isFourMeme = isFourMemeTransaction(tx);
    const id = deterministicId(raw.wallet_address, tx.tx_hash ?? tx.transaction_hash ?? "");
    const timestamp = Math.floor(new Date(tx.block_signed_at ?? 0).getTime() / 1000);

    events.push({
      id,
      wallet_address: raw.wallet_address,
      event_type: eventType,
      token_address: extractTokenAddressCovalent(tx),
      token_symbol: extractTokenSymbolCovalent(tx),
      value_usd: tx.value_quote ?? 0,
      pnl_delta: 0, // Covalent doesn't provide PnL directly
      timestamp,
      raw_payload: { ...tx, four_meme: isFourMeme },
      chain_id: 56,
    });
  }

  // P1-04: Synthesize recovery events from the raw event sequence
  const withRecovery = synthesizeRecoveryEvents(events, raw.wallet_address);

  return deduplicateEvents(withRecovery);
}

// ─── FOUR_MEME_ROUTER filter ─────────────────────────────────────────────────

/** P1-03: Returns true if the transaction involves the Four.meme router. */
function isFourMemeTransaction(tx: any): boolean {
  const router = FOUR_MEME_ROUTER.toLowerCase();
  const toAddr = (tx.to_address ?? tx.to ?? "").toLowerCase();
  const fromAddr = (tx.from_address ?? tx.from ?? "").toLowerCase();
  return toAddr === router || fromAddr === router;
}

// ─── Moralis event inference ─────────────────────────────────────────────────

function inferEventTypeMoralis(tx: any, walletAddress: string): EventType | null {
  const wallet = walletAddress.toLowerCase();

  // Swap events from the /swaps endpoint have richer method labels
  if (tx._moralis_type === "swap") {
    const pnl = parseFloat(tx.realized_profit_usd ?? "0") || 0;
    if (pnl < -500) return "rug";
    // Determine buy vs sell by which token entered the wallet
    const toAddr = (tx.to_address ?? "").toLowerCase();
    if (toAddr === wallet) return "buy";
    return "sell";
  }

  // ERC-20 transfers
  const method = (tx.method_label ?? tx.decoded_call?.name ?? "").toLowerCase();
  if (method.includes("buy") || method.includes("exacteth") || method.includes("input")) return "buy";
  if (method.includes("sell") || method.includes("exacttoken") || method.includes("output")) return "sell";
  if (tx.realized_profit_usd && parseFloat(tx.realized_profit_usd) < -500) return "rug";

  // Use transfer direction to classify buy/sell
  const toAddr = (tx.to_address ?? "").toLowerCase();
  const fromAddr = (tx.from_address ?? "").toLowerCase();
  if (toAddr === wallet) return "buy";      // token received = buy
  if (fromAddr === wallet) return "sell";   // token sent = sell

  if (tx.type === "receive") return "transfer_in";
  return null;
}

// ─── Covalent event inference ────────────────────────────────────────────────

/**
 * P1-02: Infer buy vs sell from Covalent log events.
 *
 * For a swap log, we examine which token flowed INTO the wallet address.
 * - If the Transfer log's `to` matches wallet → wallet received tokens = buy
 * - If the Transfer log's `from` matches wallet → wallet sent tokens = sell
 */
function inferEventTypeCovalent(tx: any, walletAddress: string): EventType | null {
  if (!tx.successful) return null;
  const wallet = walletAddress.toLowerCase();

  const logs: any[] = tx.log_events ?? [];
  let hasBuy = false;
  let hasSell = false;

  for (const log of logs) {
    const name = (log.decoded?.name ?? "").toLowerCase();

    if (name === "swap") {
      // Parse Swap event params to determine direction
      const params: any[] = log.decoded?.params ?? [];
      const amount0In = BigInt(params.find((p: any) => p.name === "amount0In")?.value ?? "0");
      const amount0Out = BigInt(params.find((p: any) => p.name === "amount0Out")?.value ?? "0");
      const amount1In = BigInt(params.find((p: any) => p.name === "amount1In")?.value ?? "0");
      const amount1Out = BigInt(params.find((p: any) => p.name === "amount1Out")?.value ?? "0");
      // If wallet sent token0 (amount0In > 0) and received token1 (amount1Out > 0) → sell token0 / buy token1
      // Heuristic: if BNB/WBNB was token0, amount0In > 0 means bought with BNB = buy
      if (amount0In > 0n && amount1Out > 0n) hasBuy = true;
      if (amount1In > 0n && amount0Out > 0n) hasSell = true;
    }

    if (name === "transfer") {
      const params: any[] = log.decoded?.params ?? [];
      const toParam = (params.find((p: any) => p.name === "to")?.value ?? "").toLowerCase();
      const fromParam = (params.find((p: any) => p.name === "from")?.value ?? "").toLowerCase();
      if (toParam === wallet) hasBuy = true;
      if (fromParam === wallet) hasSell = true;
    }
  }

  // Prioritise sell over buy if both (complex multi-hop swap — classify as sell)
  if (hasSell) return "sell";
  if (hasBuy) return "buy";
  return null;
}

function extractTokenAddressCovalent(tx: any): string {
  const logs: any[] = tx.log_events ?? [];
  for (const log of logs) {
    if (log.decoded?.name?.toLowerCase() === "transfer" && log.sender_address) {
      return log.sender_address;
    }
  }
  return "0x";
}

function extractTokenSymbolCovalent(tx: any): string | undefined {
  const logs: any[] = tx.log_events ?? [];
  for (const log of logs) {
    const sym = log.decoded?.params?.find((p: any) => p.name === "symbol")?.value;
    if (sym) return sym;
    if (log.sender_contract_ticker_symbol) return log.sender_contract_ticker_symbol;
  }
  return undefined;
}

// ─── P1-04: Recovery event synthesis ────────────────────────────────────────

/**
 * Synthesizes `recovery` events when a wallet re-enters the same token
 * after a loss event, or when a profitable sell follows a big loss within 7 days.
 *
 * This ensures scoreSurvival() sees recovery events from real on-chain data.
 */
function synthesizeRecoveryEvents(
  events: ActivityEvent[],
  walletAddress: string,
): ActivityEvent[] {
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const synthetic: ActivityEvent[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;
    // Trigger: a big-loss event (rug or sell with pnl < -200)
    if (current.event_type !== "rug" && !(current.event_type === "sell" && current.pnl_delta < -200)) {
      continue;
    }

    // Look ahead up to 7 days for a profitable sell on the same token (or any token)
    const horizon = current.timestamp + 7 * 86400;
    const comeback = sorted.slice(i + 1).find(
      (e) =>
        e.timestamp <= horizon &&
        e.event_type === "sell" &&
        e.pnl_delta > 0,
    );

    if (comeback) {
      const recovId = deterministicId(walletAddress, `recovery:${current.id}:${comeback.id}`);
      synthetic.push({
        id: recovId,
        wallet_address: walletAddress,
        event_type: "recovery",
        token_address: current.token_address,
        token_symbol: current.token_symbol,
        value_usd: comeback.value_usd,
        pnl_delta: comeback.pnl_delta,
        timestamp: comeback.timestamp,
        chain_id: 56,
      });
    }
  }

  return [...events, ...synthetic];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── RPC log normalizer ──────────────────────────────────────────────────────

/**
 * Normalizes raw eth_getLogs Transfer events into ActivityEvent[].
 *
 * Each log has:
 *  - topics[1]: from address (padded)
 *  - topics[2]: to address (padded)
 *  - _rpc_direction: "in" | "out" (tagged by adapter)
 *
 * No USD value available without price oracle → value_usd = 0.
 * Scoring engine uses counts/ratios so zero-value events still contribute.
 */
function normalizeRpc(raw: RawWalletActivity): ActivityEvent[] {
  const logs = raw.transactions as any[];
  const events: ActivityEvent[] = [];

  for (const log of logs) {
    const direction: "in" | "out" = log._rpc_direction ?? "in";
    const eventType: EventType = direction === "in" ? "buy" : "sell";
    const tokenAddress: string = (log.address ?? "0x").toLowerCase();
    const txHash: string = log.transactionHash ?? log.blockNumber ?? "";
    const blockNum: number = parseInt(log.blockNumber ?? "0", 16);

    // Rough timestamp from block number (BSC genesis ~1595241600, ~3s blocks)
    const BSC_GENESIS = 1595241600;
    const BSC_BLOCK_TIME = 3;
    const timestamp = BSC_GENESIS + blockNum * BSC_BLOCK_TIME;

    const isFourMeme = (log.address ?? "").toLowerCase() === FOUR_MEME_ROUTER.toLowerCase();

    const id = deterministicId(raw.wallet_address, `${txHash}:${log.logIndex ?? "0"}:${direction}`);
    events.push({
      id,
      wallet_address: raw.wallet_address,
      event_type: eventType,
      token_address: tokenAddress,
      value_usd: 0,
      pnl_delta: 0,
      timestamp,
      raw_payload: { ...log, four_meme: isFourMeme },
      chain_id: 56,
    });
  }

  return deduplicateEvents(events);
}

function deduplicateEvents(events: ActivityEvent[]): ActivityEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}
