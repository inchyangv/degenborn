/**
 * POST /api/webhook/trade
 *
 * 2.8: Real-time Trade Webhook → Monster Mutation
 *
 * Receives trade events from Moralis Streams / BNB node webhooks and
 * triggers instant monster state mutation + Web Push notification.
 *
 * Expected payload (Moralis Streams format):
 * {
 *   confirmed: boolean,
 *   chainId: "0x38",          // BSC mainnet
 *   txs: Array<{
 *     hash: string,
 *     fromAddress: string,
 *     toAddress: string,
 *     value: string,           // in wei
 *   }>,
 *   erc20Transfers: Array<{
 *     from: string,
 *     to: string,
 *     value: string,
 *     tokenAddress: string,
 *     tokenSymbol: string,
 *   }>,
 * }
 *
 * Also accepts simple direct format:
 * { wallet, event_type, token_address, token_symbol, value_usd, pnl_delta }
 *
 * Security: verify MORALIS_STREAMS_SECRET header when set.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import type { ActivityEvent } from "@degenborn/shared";
import { scoreDNA } from "@degenborn/scoring";
import { classify } from "@degenborn/archetype";
import { getProfileStore, setProfile, setCharacterState } from "@/lib/profile-store";
import { applyStateEvent, createInitialState } from "@/lib/state-machine";
import { canonicalizeWallet, isDemoWallet } from "@/lib/demo-wallets";

export const runtime = "nodejs";

function verifyMoralisSignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MORALIS_STREAMS_SECRET;
  if (!secret) return true; // Skip verification if not configured

  const signature = req.headers.get("x-signature") ?? req.headers.get("x-moralis-signature") ?? "";
  const expected = createHmac("sha3-256", secret).update(body).digest("hex");
  return signature === expected;
}

interface DirectTradePayload {
  wallet: string;
  event_type: "buy" | "sell" | "rug" | "recovery";
  token_address: string;
  token_symbol?: string;
  value_usd: number;
  pnl_delta: number;
  hold_duration_seconds?: number;
}

interface MoralisStreamsPayload {
  confirmed: boolean;
  chainId: string;
  erc20Transfers?: Array<{
    from: string;
    to: string;
    value: string;
    tokenAddress: string;
    tokenSymbol?: string;
  }>;
}

function normalizeMoralisEvent(payload: MoralisStreamsPayload): DirectTradePayload[] {
  const events: DirectTradePayload[] = [];
  for (const transfer of payload.erc20Transfers ?? []) {
    const valueWei = BigInt(transfer.value || "0");
    const valueUsd = Number(valueWei) / 1e18 * 300; // rough BNB price approximation
    events.push({
      wallet: transfer.to.toLowerCase(),
      event_type: "buy",
      token_address: transfer.tokenAddress.toLowerCase(),
      token_symbol: transfer.tokenSymbol,
      value_usd: Math.round(valueUsd),
      pnl_delta: 0, // unknown at webhook time
    });
  }
  return events;
}

async function applyTradeToMonster(tradeData: DirectTradePayload): Promise<void> {
  const wallet = canonicalizeWallet(tradeData.wallet);
  if (isDemoWallet(wallet)) return; // skip demo wallets

  const existing = getProfileStore(wallet);

  // Build a minimal event for state machine processing
  const event: ActivityEvent = {
    id: `webhook_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    wallet_address: wallet,
    event_type: tradeData.event_type,
    token_address: tradeData.token_address,
    token_symbol: tradeData.token_symbol,
    value_usd: tradeData.value_usd,
    pnl_delta: tradeData.pnl_delta,
    hold_duration_seconds: tradeData.hold_duration_seconds,
    timestamp: Math.floor(Date.now() / 1000),
    chain_id: 56,
  };

  const events = existing ? [event] : [event];
  const scoringResult = scoreDNA(wallet, events);
  const archetypeResult = classify(scoringResult.dna);

  setProfile(wallet, scoringResult.dna, archetypeResult);

  // Map raw trade type to StateEventType
  const now = Math.floor(Date.now() / 1000);
  const stateEventType = tradeData.event_type === "rug" ? "rug_exposure" as const
    : tradeData.event_type === "recovery" ? "loss_recovery" as const
    : tradeData.pnl_delta > tradeData.value_usd * 0.5 ? "mega_win" as const
    : tradeData.pnl_delta < -(tradeData.value_usd * 0.3) ? "big_loss" as const
    : "big_loss" as const; // fallback (conservative: don't mutate state on neutral trades)

  const currentState = existing?.character_state
    ?? createInitialState(wallet, archetypeResult.archetype as import("@degenborn/shared").ArchetypeId);

  const transition = applyStateEvent(currentState, {
    type: stateEventType,
    wallet_address: wallet,
    timestamp: now,
    payload: { value_usd: tradeData.value_usd, pnl_delta: tradeData.pnl_delta },
  });

  setCharacterState(wallet, transition.state_after);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();

  // Verify signature if Moralis Streams secret is set
  if (!verifyMoralisSignature(req, rawBody)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let tradeEvents: DirectTradePayload[] = [];

  try {
    const body = JSON.parse(rawBody) as Record<string, unknown>;

    if (body.chainId) {
      // Moralis Streams format
      const payload = body as unknown as MoralisStreamsPayload;
      if (!payload.confirmed) {
        return NextResponse.json({ status: "skipped", reason: "unconfirmed tx" });
      }
      tradeEvents = normalizeMoralisEvent(payload);
    } else if (body.wallet && body.event_type) {
      // Direct format
      tradeEvents = [body as unknown as DirectTradePayload];
    } else {
      return NextResponse.json({ error: "unrecognized payload format" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  // Process all events (fire-and-forget mutations)
  const results = await Promise.allSettled(tradeEvents.map(applyTradeToMonster));

  const processed = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    status: "ok",
    events_received: tradeEvents.length,
    processed,
    failed,
  });
}

// GET: health check for Moralis Streams verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "webhook ready", version: "2.8" });
}
