import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { scoreDNA, computeLoyaltyScore } from "@degenborn/scoring";
import { classify } from "@degenborn/archetype";
import { fetchWalletActivity } from "@degenborn/data-adapter";
import type { ActivityEvent, TimeWindow, StateEvent, CharacterState, ArchetypeId } from "@degenborn/shared";
import { setProfile, getProfileStore, setCharacterState } from "@/lib/profile-store";
import { getDataSource } from "@/lib/runtime-env";
import { createInitialState, applyStateEvent } from "@/lib/state-machine";
import { canonicalizeWallet, isDemoWallet, isWalletInputSupported } from "@/lib/demo-wallets";
import { deriveTokenOverlay } from "@/lib/token-trait";
import { deriveBondingCurveTraits } from "@/lib/bonding-curve-trait";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, window: timeWindow = "30d", useFixture = false } = body as {
      wallet: string;
      window?: TimeWindow;
      useFixture?: boolean;
    };

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json({ error: "wallet address required" }, { status: 400 });
    }

    const walletLower = canonicalizeWallet(wallet);

    if (!isWalletInputSupported(walletLower) || !isAddress(walletLower)) {
      return NextResponse.json({ error: "invalid Ethereum address" }, { status: 400 });
    }
    let events: ActivityEvent[];
    let dataSource: "live" | "demo" | "fixture" = "live";

    if (useFixture || isDemoWallet(wallet)) {
      // Demo/replay mode: load from fixture file, fall back to deterministic demo events
      try {
        const fixtureDir = path.join(process.cwd(), "../../fixtures/wallets");
        events = await fetchWalletActivity(walletLower, timeWindow, {
          source: "fixture",
          fixtureDir,
        });
        dataSource = "fixture";
      } catch {
        // No fixture for this wallet — generate deterministic demo events
        events = generateDemoEvents(walletLower);
        dataSource = "demo";
      }
    } else {
      // Real wallet: fetch live data from Moralis/Covalent, fall back to demo on error
      const source = getDataSource("moralis");
      try {
        events = await fetchWalletActivity(walletLower, timeWindow, {
          source,
          moralisApiKey: process.env.MORALIS_API_KEY,
          covalentApiKey: process.env.COVALENT_API_KEY,
        });
        dataSource = "live";
      } catch {
        // Live data unavailable — keep flow alive with demo data
        console.warn("[analyze] live data fetch failed, falling back to demo events");
        events = generateDemoEvents(walletLower);
        dataSource = "demo";
      }
    }

    events = events.map((event) => ({
      ...event,
      wallet_address: walletLower,
    }));

    const { dna } = scoreDNA(walletLower, events);
    const archetypeResult = classify(dna);
    const loyalty = computeLoyaltyScore(events);

    // Real event type counts for Activity Breakdown
    const activity_counts = {
      buys: events.filter((e) => e.event_type === "buy").length,
      sells: events.filter((e) => e.event_type === "sell").length,
      dead_tokens: events.filter((e) => e.event_type === "rug").length,
      revivals: events.filter((e) => e.event_type === "recovery").length,
    };

    // TF-05: Creator stats
    const creatorEvents = events.filter((e) => e.event_type === "token_created");
    const creator_stats = {
      tokens_created: creatorEvents.length,
      created_tokens: creatorEvents.map((e) => ({
        address: e.token_address,
        symbol: e.token_symbol,
        timestamp: e.timestamp,
      })),
    };

    // Persist to profile store for metadata endpoint cache hits
    setProfile(walletLower, dna, archetypeResult);

    // T2-01: Retrieve previously persisted state to use as accumulation base
    const storedProfile = getProfileStore(walletLower);
    const previousState = storedProfile?.character_state ?? null;

    // Derive character state from real event data — T3-04
    const freshState = deriveCharacterState(walletLower, archetypeResult.archetype as ArchetypeId, events);

    // Merge: take the higher level/prestige/counts to prevent regression on revisit
    const derivedState: CharacterState = previousState
      ? {
          ...freshState,
          level: Math.max(freshState.level, previousState.level),
          prestige: Math.max(freshState.prestige, previousState.prestige),
          crown_count: Math.max(freshState.crown_count, previousState.crown_count),
          scar_count: Math.max(freshState.scar_count, previousState.scar_count),
          survival_streak: Math.max(freshState.survival_streak, previousState.survival_streak),
          // Keep highest corruption
          corruption: Math.max(freshState.corruption, previousState.corruption),
          // Merge active traits: union of old + new (no regression)
          active_traits: Array.from(
            new Set([...previousState.active_traits, ...freshState.active_traits])
          ) as CharacterState["active_traits"],
        }
      : freshState;

    // Persist the accumulated state for next visit
    setCharacterState(walletLower, derivedState);

    // 2.1: Token-to-Trait overlay — top held token drives monster appearance badge
    const token_overlay = deriveTokenOverlay(walletLower, events);

    // 2.2: Bonding Curve Stage Traits — early believer / graduate medal
    const bonding_curve_traits = deriveBondingCurveTraits(walletLower, events);

    // Apply bonding curve traits to derived state active_traits
    const bcTraitIds: Array<"early_believer_halo" | "graduate_medal"> = [];
    if (bonding_curve_traits.early_believer_halo) bcTraitIds.push("early_believer_halo");
    if (bonding_curve_traits.graduate_medal) bcTraitIds.push("graduate_medal");
    const finalState = bcTraitIds.length > 0
      ? {
          ...derivedState,
          active_traits: Array.from(new Set([...derivedState.active_traits, ...bcTraitIds])) as typeof derivedState.active_traits,
        }
      : derivedState;

    return NextResponse.json({
      dna,
      archetype: archetypeResult,
      event_count: events.length,
      activity_counts,
      loyalty,
      derived_state: finalState,
      data_source: dataSource,
      creator_stats,
      token_overlay,
      bonding_curve_traits,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Derive a CharacterState by replaying activity events through the state machine.
 * Converts ActivityEvents → StateEvents with real PnL/duration payloads,
 * then applies each event to build an accurate character state.
 */
function deriveCharacterState(
  wallet: string,
  archetype: ArchetypeId,
  events: ActivityEvent[],
): CharacterState {
  let state = createInitialState(wallet, archetype);
  if (events.length === 0) return state;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

  // Track consecutive wins/losses for streaks
  let consecutiveWins = 0;
  let bigLossSeen = false;

  for (const event of sorted) {
    let stateEvent: StateEvent | null = null;

    if (event.event_type === "rug") {
      stateEvent = {
        type: "rug_exposure",
        wallet_address: wallet,
        timestamp: event.timestamp,
        payload: { amount: Math.abs(event.pnl_delta), token: event.token_address },
      };
      consecutiveWins = 0;
      bigLossSeen = true;
    } else if (event.event_type === "sell" && event.pnl_delta < -200) {
      stateEvent = {
        type: "big_loss",
        wallet_address: wallet,
        timestamp: event.timestamp,
        payload: { amount: Math.abs(event.pnl_delta), token: event.token_address },
      };
      consecutiveWins = 0;
      bigLossSeen = true;
    } else if (event.event_type === "sell" && event.pnl_delta > 500) {
      consecutiveWins++;
      if (consecutiveWins >= 3) {
        stateEvent = {
          type: "win_streak_3",
          wallet_address: wallet,
          timestamp: event.timestamp,
          payload: { amount: event.pnl_delta },
        };
        consecutiveWins = 0;
      } else if (event.pnl_delta > 2000) {
        stateEvent = {
          type: "mega_win",
          wallet_address: wallet,
          timestamp: event.timestamp,
          payload: { amount: event.pnl_delta },
        };
      } else if (bigLossSeen) {
        stateEvent = {
          type: "loss_recovery",
          wallet_address: wallet,
          timestamp: event.timestamp,
          payload: { amount: event.pnl_delta },
        };
        bigLossSeen = false;
      }
    } else if (event.event_type === "recovery") {
      stateEvent = {
        type: "comeback",
        wallet_address: wallet,
        timestamp: event.timestamp,
        payload: { amount: event.pnl_delta },
      };
      bigLossSeen = false;
    } else if (event.event_type === "buy" && (event.hold_duration_seconds ?? 0) > 86400 * 7) {
      stateEvent = {
        type: "long_hold",
        wallet_address: wallet,
        timestamp: event.timestamp,
        payload: { duration: event.hold_duration_seconds ?? 0, token: event.token_address },
      };
    } else if (event.event_type === "token_created") {
      // TF-05: token creation via Four.meme Factory
      stateEvent = {
        type: "token_created",
        wallet_address: wallet,
        timestamp: event.timestamp,
        payload: { token: event.token_address, symbol: event.token_symbol },
      };
    }

    if (stateEvent) {
      const transition = applyStateEvent(state, stateEvent);
      state = transition.state_after;
    }
  }

  return state;
}

/** Generate deterministic demo events when no real data / fixture is available */
function generateDemoEvents(wallet: string): ActivityEvent[] {
  const seed = wallet.slice(2, 10);
  const hash = parseInt(seed, 16) || 1234;
  const base = 1712000000;

  const events: ActivityEvent[] = [];
  for (let i = 0; i < 20; i++) {
    const isRug = (hash * (i + 1)) % 7 === 0;
    const isSell = i % 2 !== 0;
    const pnl = isRug ? -800 : isSell ? ((hash * i) % 1000) - 200 : 0;
    events.push({
      id: `demo_${i}`,
      wallet_address: wallet,
      event_type: isRug ? "rug" : isSell ? "sell" : "buy",
      token_address: `0xtoken${(hash * i) % 5}`,
      value_usd: 100 + ((hash * i) % 500),
      pnl_delta: pnl,
      hold_duration_seconds: isRug ? 0 : 1800 + (i * 3600),
      timestamp: base + i * 3600,
      chain_id: 56,
    });
  }
  return events;
}
